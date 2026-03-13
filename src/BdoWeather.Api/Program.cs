using BdoWeather.Common;
using BdoWeather.Features.DefaultLocation;
using BdoWeather.Features.Mock;
using BdoWeather.Features.Weather;
using BdoWeather.Infrastructure;
using BdoWeather.Persistence;
using FluentValidation;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Http.Resilience;
using Microsoft.Extensions.Options;
using Polly;

var builder = WebApplication.CreateBuilder(args);

// ── Config ────────────────────────────────────────────────────────────────────
builder.Services
    .AddOptions<WeatherApiOptions>()
    .BindConfiguration(WeatherApiOptions.SectionName)
    .ValidateDataAnnotations()
    .ValidateOnStart();

// ── Persistence ───────────────────────────────────────────────────────────────
var connectionString = builder.Configuration.GetConnectionString("Default") ?? "Data Source=bdo-weather.db";
builder.Services.AddDbContext<AppDbContext>(opt => opt.UseSqlite(connectionString));

// ── Caching ───────────────────────────────────────────────────────────────────
builder.Services.AddMemoryCache();

// ── Resilience & HttpClient ───────────────────────────────────────────────────
builder.Services.AddHttpClient<WeatherApiClient>((sp, client) =>
{
    var opts = sp.GetRequiredService<IOptions<WeatherApiOptions>>().Value;
    client.BaseAddress = new Uri(opts.BaseUrl.TrimEnd('/') + "/");
    client.Timeout = TimeSpan.FromSeconds(opts.TimeoutSeconds + 5);
})
.AddStandardResilienceHandler(opt =>
{
    opt.Retry.MaxRetryAttempts = 3;
    opt.Retry.Delay = TimeSpan.FromSeconds(1);
    opt.Retry.BackoffType = DelayBackoffType.Exponential;
    opt.Retry.UseJitter = true;
    opt.TotalRequestTimeout.Timeout = TimeSpan.FromSeconds(15);
    opt.CircuitBreaker.BreakDuration = TimeSpan.FromSeconds(30);
    opt.CircuitBreaker.MinimumThroughput = 5;
});

// ── Validation ────────────────────────────────────────────────────────────────
builder.Services.AddValidatorsFromAssemblyContaining<Program>();

// ── Feature handlers ──────────────────────────────────────────────────────────
builder.Services.AddScoped<GetWeatherByCity>();
builder.Services.AddScoped<GetDefaultLocation>();
builder.Services.AddScoped<SetDefaultLocation>();
builder.Services.AddScoped<GetMockWeather>();
builder.Services.AddScoped<IWeatherApiClient>(sp => sp.GetRequiredService<WeatherApiClient>());

// ── Exception handling ────────────────────────────────────────────────────────
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

// ── CORS ──────────────────────────────────────────────────────────────────────
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
    ?? ["http://localhost:5173"];
builder.Services.AddCors(opt => opt.AddDefaultPolicy(policy =>
    policy.WithOrigins(allowedOrigins)
          .AllowAnyHeader()
          .AllowAnyMethod()));

// ── Rate limiting ─────────────────────────────────────────────────────────────
builder.Services.AddRateLimiter(opt =>
{
    opt.AddFixedWindowLimiter("weather", limiterOpt =>
    {
        limiterOpt.PermitLimit = 60;
        limiterOpt.Window = TimeSpan.FromMinutes(1);
    });
    opt.RejectionStatusCode = 429;
});

var app = builder.Build();

// ── Migrate DB on startup ─────────────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    if (db.Database.IsRelational())
        await db.Database.MigrateAsync();
    else
        await db.Database.EnsureCreatedAsync();
}

// ── Middleware ────────────────────────────────────────────────────────────────
app.UseExceptionHandler();
app.UseCors();
app.UseRateLimiter();
app.UseHttpsRedirection();

// ── Routes ────────────────────────────────────────────────────────────────────
app.MapGet("/api/weather", async (
    string? city,
    GetWeatherByCity handler,
    IOptions<WeatherApiOptions> options,
    GetMockWeather mockHandler,
    CancellationToken ct) =>
{
    if (string.IsNullOrWhiteSpace(city))
        return Results.BadRequest(ApiEnvelope.Error(new Error("VALIDATION", "city is required.")));

    var result = options.Value.UseMock
        ? await mockHandler.HandleAsync(city, ct)
        : await handler.HandleAsync(city, ct);

    return result.ToHttpResult(data => Results.Ok(ApiEnvelope.Success(data)));
})
.RequireRateLimiting("weather");

app.MapGet("/api/weather/mock", async (
    string? city,
    GetMockWeather handler,
    CancellationToken ct) =>
{
    var result = await handler.HandleAsync(city ?? "London", ct);
    return result.ToHttpResult(data => Results.Ok(ApiEnvelope.Success(data)));
});

app.MapGet("/api/default-location", async (
    GetDefaultLocation handler,
    CancellationToken ct) =>
{
    var result = await handler.HandleAsync(ct);
    return result.ToHttpResult(data => Results.Ok(ApiEnvelope.Success(data)));
});

app.MapPut("/api/default-location", async (
    SetDefaultLocationRequest request,
    SetDefaultLocation handler,
    CancellationToken ct) =>
{
    var result = await handler.HandleAsync(request, ct);
    return result.ToHttpResult(data => Results.Ok(ApiEnvelope.Success(data)));
});

app.Run();

// Make Program accessible from integration tests
public partial class Program { }
