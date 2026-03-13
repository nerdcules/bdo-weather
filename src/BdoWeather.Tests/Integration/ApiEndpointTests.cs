using Xunit;
using System.Net;
using System.Net.Http.Json;
using BdoWeather.Features.DefaultLocation;
using BdoWeather.Features.Mock;
using BdoWeather.Features.Weather;
using BdoWeather.Infrastructure;
using BdoWeather.Persistence;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using NSubstitute;
using Shouldly;


namespace BdoWeather.Tests.Integration;

/// <summary>
/// Integration tests for the API endpoints defined in Program.cs.
/// Uses WebApplicationFactory with an in-memory database and mocked IWeatherApiClient.
/// </summary>
public sealed class ApiEndpointTests
{
    private static void ReplaceWithInMemoryDb(IServiceCollection services, string? dbName = null)
    {
        // Remove the scoped DbContextOptions AND the options configuration actions
        // that EF Core registers for each AddDbContext call (which configure the provider).
        services.RemoveAll<DbContextOptions<AppDbContext>>();
        services.RemoveAll<AppDbContext>();
        services.RemoveAll(typeof(IDbContextOptionsConfiguration<AppDbContext>));

        services.AddDbContext<AppDbContext>(opt =>
            opt.UseInMemoryDatabase(dbName ?? Guid.NewGuid().ToString()));
    }

    private static WebApplicationFactory<Program> CreateFactory(
        Action<IServiceCollection>? configure = null)
    {
        return new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
        {
            // Provide a dummy API key so ValidateOnStart() passes in CI (no user secrets)
            builder.UseSetting("WeatherApi:ApiKey", "ci-test-dummy-key");
            builder.ConfigureTestServices(services =>
            {
                ReplaceWithInMemoryDb(services);
                configure?.Invoke(services);
            });
        });
    }

    private static WeatherResponse BuildWeatherResponse(string city = "London") => new(
        City: city,
        Country: "GB",
        Temperature: new TemperatureInfo(15.0, 13.0, 10.0, 18.0, "celsius"),
        Humidity: 70,
        WindSpeed: 4.5,
        WindDirection: 180,
        Description: "clear sky",
        Icon: "01d",
        IconUrl: "https://openweathermap.org/img/wn/01d@2x.png",
        Sunrise: DateTime.UtcNow.Date.AddHours(6),
        Sunset: DateTime.UtcNow.Date.AddHours(19),
        FetchedAt: DateTime.UtcNow);

    // ── /api/weather ──────────────────────────────────────────────────────────

    [Fact]
    public async Task GetWeather_MissingCity_Returns400()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/weather");

        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GetWeather_ValidCity_MockEnabled_Returns200WithData()
    {
        await using var factory = new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
        {
            builder.UseSetting("WeatherApi:UseMock", "true");
            builder.UseSetting("WeatherApi:ApiKey", "dummy");
            builder.ConfigureTestServices(services => ReplaceWithInMemoryDb(services));
        });

        var client = factory.CreateClient();
        var response = await client.GetAsync("/api/weather?city=Dublin");

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadAsStringAsync();
        body.ShouldContain("Dublin");
    }

    [Fact]
    public async Task GetWeather_ValidCity_RealApiClient_CityNotFound_Returns404()
    {
        var apiClient = Substitute.For<IWeatherApiClient>();
        apiClient.GetWeatherAsync("Unknown", Arg.Any<CancellationToken>())
            .Returns(BdoWeather.Common.Result<WeatherResponse>.Failure("CITY_NOT_FOUND", "Not found"));

        await using var factory = new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
        {
            builder.UseSetting("WeatherApi:UseMock", "false");
            builder.UseSetting("WeatherApi:ApiKey", "dummy");
            builder.ConfigureTestServices(services =>
            {
                ReplaceWithInMemoryDb(services);
                services.RemoveAll<IWeatherApiClient>();
                services.AddScoped<IWeatherApiClient>(_ => apiClient);
            });
        });

        var client = factory.CreateClient();
        var response = await client.GetAsync("/api/weather?city=Unknown");

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }

    // ── /api/weather/mock ─────────────────────────────────────────────────────

    [Fact]
    public async Task GetWeatherMock_Returns200WithMockData()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/weather/mock?city=TestCity");

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadAsStringAsync();
        body.ShouldContain("TestCity");
    }

    [Fact]
    public async Task GetWeatherMock_NoCity_Uses_London_Default()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/weather/mock");

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
    }

    // ── /api/default-location ─────────────────────────────────────────────────

    [Fact]
    public async Task GetDefaultLocation_NothingSet_Returns200WithNullData()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/default-location");

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadAsStringAsync();
        body.ShouldContain("null");
    }

    [Fact]
    public async Task SetDefaultLocation_InvalidCity_Returns400()
    {
        await using var factory = CreateFactory();
        var client = factory.CreateClient();

        var response = await client.PutAsJsonAsync("/api/default-location", new { city = "" });

        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task SetDefaultLocation_ValidCity_MockEnabled_Returns200()
    {
        var apiClient = Substitute.For<IWeatherApiClient>();
        apiClient.GetWeatherAsync("London", Arg.Any<CancellationToken>())
            .Returns(BdoWeather.Common.Result<WeatherResponse>.Success(BuildWeatherResponse("London")));

        await using var factory = CreateFactory(services =>
        {
            services.RemoveAll<IWeatherApiClient>();
            services.AddScoped<IWeatherApiClient>(_ => apiClient);
        });

        var client = factory.CreateClient();
        var response = await client.PutAsJsonAsync(
            "/api/default-location", new { city = "London" });

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await response.Content.ReadAsStringAsync();
        body.ShouldContain("London");
    }

    [Fact]
    public async Task GetDefaultLocation_AfterSet_ReturnsLocation()
    {
        var apiClient = Substitute.For<IWeatherApiClient>();
        apiClient.GetWeatherAsync("Paris", Arg.Any<CancellationToken>())
            .Returns(BdoWeather.Common.Result<WeatherResponse>.Success(BuildWeatherResponse("Paris")));

        // Share a single InMemory DB instance so PUT and GET see the same data
        var dbName = Guid.NewGuid().ToString();

        await using var factory = new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
        {
            builder.UseSetting("WeatherApi:UseMock", "false");
            builder.UseSetting("WeatherApi:ApiKey", "dummy");
            builder.ConfigureTestServices(services =>
            {
                ReplaceWithInMemoryDb(services, dbName);
                services.RemoveAll<IWeatherApiClient>();
                services.AddScoped<IWeatherApiClient>(_ => apiClient);
            });
        });

        var client = factory.CreateClient();
        await client.PutAsJsonAsync("/api/default-location", new { city = "Paris" });

        var getResponse = await client.GetAsync("/api/default-location");
        getResponse.StatusCode.ShouldBe(HttpStatusCode.OK);
        var body = await getResponse.Content.ReadAsStringAsync();
        body.ShouldContain("Paris");
    }
}
