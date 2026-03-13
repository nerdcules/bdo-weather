# Lessons Learned

Issues and insights encountered during AI-assisted development of this project.

---

## 1. API Response Shape Assumptions

**What happened:** `WeatherDisplay.jsx` was written assuming a nested response shape (`weather.icon`, `wind.speed`, `wind.deg`) that matched the raw OpenWeatherMap structure. The actual backend mapped OWM's response to a flat DTO (`description`, `icon`, `iconUrl`, `windSpeed`, `windDirection`).

**Symptoms:** Runtime error — `Cannot read properties of undefined (reading 'icon')`.

**Fix:** Destructure directly from the top-level response object and align test mock data to match.

**Lesson:** When generating frontend consumers of a backend API, read the actual response DTO (or a running response) before writing destructuring logic — don't infer it from the upstream third-party shape.

---

## 2. Development Config Silently Overriding Production Config

**What happened:** `appsettings.Development.json` had `UseMock: true`, which silently overrode `appsettings.json`'s `UseMock: false`. The app appeared to work but returned mock data in development, causing confusion about whether the real API was being called.

**Symptoms:** UI returned weather data, but it was always the same static mock response regardless of city.

**Fix:** Set `UseMock: false` in `appsettings.Development.json`, then move secrets into user secrets storage so the real key is available without being committed.

**Lesson:** Configuration layering in ASP.NET Core is powerful but easy to overlook. Always audit `appsettings.Development.json` overrides when investigating unexpected runtime behaviour.

---

## 3. Secrets in Source-Controlled Config Files

**What happened:** The real OpenWeatherMap API key was committed directly in `appsettings.json`. This is a security risk regardless of whether the repository is private.

**Fix:** 
- Removed `WeatherApi` section from both appsettings files.
- Ran `dotnet user-secrets init` and populated secrets locally.
- Added `[Required]` to `ApiKey` with `ValidateOnStart()` so a missing key fails fast at startup rather than silently at request time.

**Lesson:** Treat API keys as secrets from day one. Use `dotnet user-secrets` for local development and environment variables / Key Vault for deployed environments. The `[Required]` + `ValidateOnStart()` pattern makes misconfiguration immediately visible instead of causing cryptic runtime failures.

---

## 4. Vite Proxy Pointed at Wrong Port

**What happened:** `vite.config.js` had the proxy target hardcoded to `http://localhost:5000`, but the backend's launch profile (`launchSettings.json`) binds to port `5154`.

**Symptoms:** All API requests from the UI returned `ECONNREFUSED` / network errors when the backend was running.

**Fix:** Changed proxy target to `http://localhost:5154`.

**Lesson:** When scaffolding a frontend alongside a backend, always cross-reference the backend's actual port from `launchSettings.json` rather than assuming a default. Consider making the port a documented constant or environment variable shared between both configs.

---

## 5. UI Test Failures After Visual Redesign

**What happened:** Redesigning components with a new CSS framework (Tailwind v4 dark-theme) and updated copy broke 5 tests:
- `WeatherSkeleton` tests queried `.bg-gray-200` which no longer existed.
- `WeatherDisplay` tests queried `getByText('London,')` — the comma was dropped in the new layout.
- `WeatherError` tests expected the button text `"Retry"` but the component had been changed to `"Try again"`.

**Fix:**
- Updated skeleton test selector to target structural elements (`div` children of `[aria-busy="true"]`) rather than implementation-specific CSS class names.
- Updated display test assertion to match new text content.
- Reverted button text to `"Retry"` to keep tests green (user-visible string; tests encode the contract).

**Lesson:** Tests that assert on CSS class names are brittle — they encode implementation details rather than behaviour. Prefer ARIA roles, `data-testid` attributes, or semantic queries (`getByRole`, `getByLabelText`) that survive styling changes. Copy/text content that appears in tests is a user-visible contract; change it deliberately and update tests together.

---

## 6. Windows Line Endings Causing `replace_string_in_file` Failures

**What happened:** Several `replace_string_in_file` calls failed because files on Windows used CRLF (`\r\n`) line endings, but the search string used LF (`\n`). This was particularly noticeable after the Git-managed files had their line endings transformed.

**Symptoms:** "Could not find matching text to replace" errors on files that definitely contained the target string.

**Fix:** Re-read the file with `cat -A` to inspect actual byte content, then adapted the replacement to match exactly.

**Lesson:** On Windows, always be aware of CRLF vs LF. The `.editorconfig` and `.gitattributes` settings govern what Git stores vs what is checked out. When a replacement fails unexpectedly, verify line endings before assuming the string is absent.

---

## 7. Build Artifact Files Tracked by Git

**What happened:** `git status` showed `bin/` and `obj/` directories as modified. These should be ignored but were apparently tracked in earlier commits before `.gitignore` was fully configured.

**Impact:** No code breakage, but commit noise — staging them accidentally would bloat the repository with binaries.

**Lesson:** Ensure `.gitignore` covers `bin/`, `obj/`, `TestResults/`, and frontend `coverage/` before the first commit. If binaries are already tracked, remove them with `git rm --cached` rather than just adding them to `.gitignore`.

---

## 8. ValidateOnStart Is Not Enabled by Default

**What happened:** The initial config binding used `builder.Services.Configure<WeatherApiOptions>(...)`. This binds values at startup but performs no validation — a missing `ApiKey` would only surface at the first HTTP request, producing a confusing error deep in the HTTP client.

**Fix:** Switched to `.AddOptions<T>().BindConfiguration().ValidateDataAnnotations().ValidateOnStart()`.

**Lesson:** Prefer the options builder pattern with `ValidateOnStart()` for any config that is required at runtime. This converts a hidden runtime failure into a clear startup crash with a descriptive message, which is far easier to diagnose — especially in CI or container deployments.
