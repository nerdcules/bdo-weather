# copilot-instructions.md

## Purpose
These instructions guide GitHub Copilot to generate code and suggestions aligned with this project's conventions.

## AI Model
- Use Claude Sonnet 4.6 for all Copilot interactions in this repository.

## Stack
- Backend: C# 14, .NET 10, ASP.NET Core Minimal APIs, EF Core
- Frontend: React (JavaScript), Vite, React Query, Tailwind CSS
- Architecture: Clean Architecture + vertical slice features
- Testing: TUnit, Shouldly, Playwright (UI), Vitest (frontend unit tests)

Copilot should prioritize clarity, maintainability, and production-ready patterns.

## General Coding Principles
- Prefer explicitness over magic.
- Generate code that is self-documenting with meaningful names.
- Avoid unnecessary abstractions unless they reduce duplication or isolate complexity.
- Follow SOLID, CQRS, and Clean Architecture principles where appropriate.
- Use async/await everywhere IO is involved.

## Backend (C# 14 / .NET 10) Guidelines

### Minimal APIs
- Use RouteGroupBuilder for feature grouping.
- Each feature lives in its own folder:
	Features/<FeatureName>/<Action>.cs
- Prefer request/response DTOs over binding domain models directly.

### Dependency Injection
- Use extension methods:
	services.Add<FeatureName>()
- Avoid service locator patterns.

### Entity Framework Core
- Use DbContext per feature boundary when possible.
- Always configure entities using IEntityTypeConfiguration<T>.
- Use AsNoTracking() for read-only queries.
- Prefer Value Objects for domain primitives.

### Error Handling
- Use Results.Problem() for API errors.
- Use IExceptionHandler middleware for global exception handling.

### Logging
- Use structured logging with ILogger<T>.
- Never swallow exceptions.

### Testing
- Use TUnit as the test framework.
- Use Shouldly for assertions (prefer .ShouldBe(), .ShouldNotBeNull(), .ShouldThrow() etc.).
- Mock external dependencies with NSubstitute.
- Prefer integration tests for API endpoints.

## Frontend (React + JavaScript) Guidelines

### Project Structure
src/
	features/
		<featureName>/
			components/
			hooks/
			api/
			types.js
	shared/
		components/
		hooks/
		utils/

### React
- Use function components only.
- Use React Query for all server state.
- Use Zustand or React Context for client state.
- Prefer custom hooks for logic extraction.

### JavaScript
- Always validate API response shapes with Zod at runtime.
- Use JSDoc for exported functions and complex objects.
- Avoid implicit any-like patterns and overly dynamic objects.
- Keep modules focused and avoid large utility dumping grounds.

### Styling
- Use Tailwind CSS utility classes.
- Extract repeated patterns into reusable components.
- All UI must be fully responsive across mobile, tablet, and desktop breakpoints.
- All UI must meet WCAG 2.1 AA compliance:
  - Semantic HTML elements (button, nav, main, section, etc.).
  - Sufficient colour contrast ratios (4.5:1 for text, 3:1 for UI components).
  - All interactive elements must be keyboard-navigable and focusable.
  - Use aria-label, aria-describedby, and role attributes wherever native semantics are insufficient.
  - Images must have descriptive alt text; decorative images use alt="".
  - Forms must have associated labels for every input.

### API Calls
- Use a typed-by-validation API client per feature:
	src/features/<feature>/api/<action>.js
- Always return promises with validated payloads.

## API Contract Between Frontend and Backend
- JSON only.
- camelCase for JSON properties.
- Use a consistent response envelope:

{
	"data": {},
	"errors": []
}

## Testing (Frontend)
- Use Playwright for E2E tests.
- Use Vitest for unit tests.
- Prefer testing behavior, not implementation details.

## Code Walkthroughs (VS Code CodeTour)
- Use the VS Code CodeTour extension (vsls-contrib.codetour) for walkthrough annotations.
- When adding or significantly changing a feature, create or update a tour file in .tours/.
- Name tours by feature and intent, for example:
	.tours/todos-feature-overview.tour
- Keep each step short: what this file does, why it exists, and what to look at next.
- Order steps to follow real execution flow (entrypoint -> endpoint -> domain -> data -> UI).
- Reference stable anchors (public methods, handlers, route registrations) to reduce line-drift breakage.
- Update affected tours in the same change when architecture or file locations change.

## Automatic Prompt/Response Logging (Required)
- Log every user prompt and every Copilot response by default, without requiring an explicit request.
- Store logs only in .copilot-logs/.
- Use scripts/append-copilot-log.sh for all log appends.
- Use one markdown file per day: .copilot-logs/YYYY-MM-DD.md.
- Append entries in chronological order using local timestamps in this format:
  YYYY-MM-DD HH:mm:ss
- Required entry format:

## [YYYY-MM-DD HH:mm:ss] Prompt
<prompt text>

## [YYYY-MM-DD HH:mm:ss] Response
<response text>

---

- If the daily file does not exist, create it.
- Never include secrets, tokens, passwords, or private keys in logs.
- If a prompt contains sensitive values, redact them before writing to disk.

## Log Maintenance Policy
- Retention: keep daily logs for 90 days by default, then archive or delete older files.
- Rotation: keep one file per date only; do not create multiple files for the same day.
- Redaction: mask secrets with [REDACTED] before writing entries.
- Integrity: append-only updates; do not rewrite historical entries except to redact sensitive data.
- Size control: when a daily file exceeds 1 MB, continue in .copilot-logs/YYYY-MM-DD-part2.md.
- Commit hygiene: include log updates in the same commit as related instruction or code changes.

## How Copilot Should Behave
- Generate code that fits the patterns above.
- When multiple approaches exist, choose the one that:
	1. Is simplest
	2. Is easiest to maintain
	3. Matches the existing project structure
- When generating examples, include:
	- Folder structure
	- DTOs
	- API endpoints
	- React hooks
	- React Query usage
- Avoid:
	- Over-engineering
	- Unnecessary inheritance
	- Static classes for business logic
	- Large God objects

## Example Feature Pattern

### Backend
Features/Todos/GetTodos.cs
Features/Todos/CreateTodo.cs

### Frontend
src/features/todos/api/getTodos.js
src/features/todos/hooks/useTodos.js
src/features/todos/components/TodoList.jsx

## Preferred Libraries
### Backend
- EF Core
- MediatR (optional)
- FluentValidation
- Polly (required — use for all HTTP client retry, circuit-breaker, and timeout policies)

### Frontend
- React Query
- Axios
- Zustand
- Tailwind CSS
- Zod (runtime validation)

## Documentation Style
- Use XML comments for public API surface.
- Use JSDoc for JavaScript functions.
- Keep comments short and purposeful.

## Non-Goals
- Large refactors without explicit request.
- Cosmetic rewrites that do not improve behavior or maintainability.
- Introducing new architecture patterns without team alignment.
