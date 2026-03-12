# Weather Dashboard — Back-End Requirements

## Overview
A RESTful ASP.NET Core Minimal API service (.NET 10, C# 14) acting as a proxy and enrichment
layer between the React front-end and the OpenWeatherMap API. Handles weather lookups,
default-location persistence, caching, resilience, and structured error responses.

**Design philosophy:** Simple, extensible vertical-slice architecture. Each feature is a
self-contained folder — adding a new endpoint means adding a new folder, not touching existing
code. Polly + caching sit in infrastructure and are injected, so they can be swapped without
changing feature logic.

---

## System Architecture

```mermaid
graph TD
    FE["React Front-End\n(Vite + React Query)"]
    API["BdoWeather.Api\n(ASP.NET Core Minimal API)"]
    CACHE["IMemoryCache\n(In-Process Cache)"]
    OWM["OpenWeatherMap API\n(External)"]
    MOCK["Mock Weather Endpoint\n(Fallback)"]
    DB["SQLite / SQL Server\n(EF Core)"]
    POLLY["Polly Resilience Pipeline\n(Retry + CB + Timeout)"]

    FE -->|HTTP JSON| API
    API -->|Cache hit?| CACHE
    CACHE -->|Miss| POLLY
    POLLY -->|HTTP| OWM
    POLLY -->|Fallback| MOCK
    API -->|Read/Write default location| DB
```

---

## Architecture

- Pattern: Clean Architecture with vertical slice features.
- Each feature lives in `Features/<FeatureName>/<Action>.cs`.
- DTOs defined per feature; domain models never exposed directly.
- All public contracts use C# `record` types with `init`-only properties.
- Results returned as `Result<T, TError>` — exceptions reserved for unrecoverable conditions.
- Namespace style: file-scoped (`namespace BdoWeather.Features.Weather;`).

**Why this structure?** Each vertical slice is independently readable and deletable. New
features have zero friction — create a folder, define a handler, register a route. No base
classes to extend, no registries to update.

---

## Project Structure

```
BdoWeather.Api/
  Features/
    Weather/
      GetWeatherByCity.cs
      GetWeatherByCity.Request.cs
      GetWeatherByCity.Response.cs
    DefaultLocation/
      GetDefaultLocation.cs
      SetDefaultLocation.cs
      DefaultLocation.Request.cs
      DefaultLocation.Response.cs
    Mock/
      GetMockWeather.cs          # Fallback when OWM unavailable
  Infrastructure/
    WeatherApiClient.cs          # Polly-wrapped HttpClient
    WeatherApiOptions.cs
    CacheKeys.cs
  Persistence/
    AppDbContext.cs
    DefaultLocationEntity.cs
    DefaultLocationConfiguration.cs
  Common/
    ResultTypes.cs               # Result<T, TError>, Error record
    ProblemDetailsExtensions.cs
  Program.cs
  appsettings.json
  appsettings.Development.json

BdoWeather.Tests/
  Features/
    Weather/GetWeatherByCityTests.cs
    DefaultLocation/SetDefaultLocationTests.cs
    DefaultLocation/GetDefaultLocationTests.cs
  Infrastructure/
    WeatherApiClientTests.cs
```

---

## Request Flow

```mermaid
sequenceDiagram
    participant FE as React Front-End
    participant API as Minimal API
    participant Cache as IMemoryCache
    participant Polly as Polly Pipeline
    participant OWM as OpenWeatherMap

    FE->>API: GET /api/weather?city=London
    API->>Cache: Check cache key "weather::london"
    alt Cache hit
        Cache-->>API: Cached WeatherResponse
        API-->>FE: 200 OK (cached)
    else Cache miss
        Cache-->>API: Miss
        API->>Polly: Request weather data
        Polly->>OWM: GET /data/2.5/weather?q=London
        alt Success
            OWM-->>Polly: 200 weather JSON
            Polly-->>API: Mapped WeatherResponse
            API->>Cache: Store with 10-min TTL
            API-->>FE: 200 OK
        else OWM error / timeout
            Polly->>Polly: Retry up to 3x with exponential back-off
            Polly-->>API: Result.Failure(error)
            API-->>FE: 502 / 404 with error envelope
        end
    end
```

---

## Error Handling Flow

```mermaid
flowchart TD
    REQ[Incoming Request] --> VALIDATE{Valid input?}
    VALIDATE -->|No| R400[400 Bad Request]
    VALIDATE -->|Yes| CACHE{Cache hit?}
    CACHE -->|Yes| R200C[200 OK - cached]
    CACHE -->|No| OWM[Call OpenWeatherMap]
    OWM --> STATUS{HTTP Status}
    STATUS -->|200| MAP[Map response to DTO]
    MAP --> STORE[Store in cache]
    STORE --> R200[200 OK]
    STATUS -->|404| R404[404 City Not Found]
    STATUS -->|429| R429[429 Rate Limited]
    STATUS -->|5xx / Timeout| RETRY{Retry budget?}
    RETRY -->|Remaining| OWM
    RETRY -->|Exhausted| CB{Circuit open?}
    CB -->|Open| R503[503 Service Unavailable]
    CB -->|Closed| R502[502 Bad Gateway]
```

---

## Default Location Flow

```mermaid
sequenceDiagram
    participant FE as React Front-End
    participant API as Minimal API
    participant Val as FluentValidation
    participant OWM as OpenWeatherMap
    participant DB as EF Core / SQLite

    FE->>API: PUT /api/default-location { city: "Dublin" }
    API->>Val: Validate request
    alt Validation fails
        Val-->>API: Field errors
        API-->>FE: 400 Bad Request
    else Valid
        API->>OWM: Verify city exists
        alt City not found
            OWM-->>API: 404
            API-->>FE: 404 City Not Found
        else City valid
            API->>DB: Upsert DefaultLocation row
            DB-->>API: Saved entity
            API-->>FE: 200 OK { city, country, setAt }
        end
    end
```

---

## Domain Model

```mermaid
erDiagram
    DefaultLocation {
        int Id PK
        string City
        string Country
        datetime SetAt
    }
```

---

## Resilience Pipeline

```mermaid
flowchart LR
    REQ[HTTP Request] --> T["Timeout\n5 seconds"]
    T --> R["Retry ×3\nExp. back-off\n1s / 2s / 4s"]
    R --> CB["Circuit Breaker\nOpens after 5 failures\nHalf-open after 30s"]
    CB --> OWM[OpenWeatherMap]
```

Register via `services.AddHttpClient<WeatherApiClient>().AddResiliencePipeline(...)`.

---

## API Endpoints

### GET `/api/weather?city={cityName}`

**Request**
| Parameter | Type | Required | Description |
|---|---|---|---|
| city | string | Yes | City name to look up |

**Success Response — 200 OK**
```json
{
  "data": {
    "city": "London",
    "country": "GB",
    "temperature": { "current": 14.2, "feelsLike": 12.8, "min": 11.0, "max": 16.5, "unit": "celsius" },
    "humidity": 78,
    "windSpeed": 5.3,
    "windDirection": 220,
    "description": "overcast clouds",
    "icon": "04d",
    "iconUrl": "https://openweathermap.org/img/wn/04d@2x.png",
    "sunrise": "2026-03-12T06:14:00Z",
    "sunset": "2026-03-12T18:22:00Z",
    "fetchedAt": "2026-03-12T18:45:00Z"
  },
  "errors": []
}
```

**Error Responses**
| Status | Scenario |
|---|---|
| 400 | `city` missing or empty |
| 404 | City not found by OWM |
| 502 | OWM unreachable |
| 429 | OWM rate limit hit |
| 500 | Unhandled server error |

All errors use the standard envelope:
```json
{ "data": null, "errors": [{ "code": "CITY_NOT_FOUND", "message": "No city found matching 'Lodnon'." }] }
```

### GET `/api/default-location`
Returns saved default or `"data": null` if none set.

### PUT `/api/default-location`
Body: `{ "city": "Dublin" }`. Validates city exists before persisting.

**Validation Rules**
- `city` non-empty, max 100 chars, no special characters beyond hyphens/spaces.
- City verified against OWM before saving.

### GET `/api/weather/mock?city={cityName}`
Returns deterministic synthetic weather data. Active when `WeatherApi:UseMock = true`.

---

## Caching (Bonus — Implemented)
- `IMemoryCache` keyed `weather::{city_lowercase}`.
- TTL: 10 min (weather), 24 h (default location).
- Bypassed on error responses.
- Cache hit/miss logged at `Information` level.

---

## Persistence
- EF Core with SQLite (dev) / SQL Server (prod) via connection string.
- Entities configured via `IEntityTypeConfiguration<T>`.
- All reads use `AsNoTracking()`.

---

## Validation
- FluentValidation on all request models.
- Registered via `services.AddValidatorsFromAssemblyContaining<Program>()`.
- Returns 400 with field-level error details.

---

## Error Handling
- Global `IExceptionHandler` middleware catches unhandled exceptions.
- Stack traces never exposed in production.
- All expected failures return `Result<T, Error>` — no `throw` for business-rule paths.

---

## Logging
- Structured logging via `ILogger<T>`.
- Log: city searched, cache hit/miss, upstream API latency, Polly retry/circuit events.
- Levels: `Information` (normal), `Warning` (retries), `Error` (upstream failures).
- API keys never logged.

---

## Security
- API key via `WEATHER_API_KEY` env var or `appsettings.Development.json` (gitignored).
- CORS restricted to `ALLOWED_ORIGINS`.
- Rate limiting: 60 req/min per IP on `/api/weather`.

---

## Configuration
```json
{
  "WeatherApi": {
    "BaseUrl": "https://api.openweathermap.org/data/2.5",
    "ApiKey": "",
    "TimeoutSeconds": 5,
    "CacheTtlMinutes": 10,
    "UseMock": false
  },
  "AllowedOrigins": ["http://localhost:5173"],
  "ConnectionStrings": { "Default": "Data Source=bdo-weather.db" }
}
```

---

## Tests — TUnit + Shouldly + NSubstitute

| Area | Type | Scenarios |
|---|---|---|
| `GetWeatherByCity` | Unit | Valid city, not found, upstream error, cache hit |
| `SetDefaultLocation` | Unit | Valid, invalid input, city validation failure |
| `GetDefaultLocation` | Unit | Returns saved, null when none set |
| `WeatherApiClient` | Unit | Maps OWM response, 404, timeout |
| Weather endpoint | Integration | Full round-trip via `WebApplicationFactory` |
| Default location | Integration | PUT then GET round-trip |
| Polly pipeline | Unit | Retry fires N times, circuit opens at threshold |

---

## Non-Functional
- Cold start < 2s in development.
- P95 < 300ms (cache hit) / < 2s (cache miss).
- All responses `Content-Type: application/json`.
- Path `/api/v1/` reserved for future versioning.
