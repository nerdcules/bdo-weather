using BdoWeather.Common;
using BdoWeather.Features.Weather;
using BdoWeather.Infrastructure;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using NSubstitute;
using Shouldly;
using TUnit.Core;

namespace BdoWeather.Tests.Features.Weather;

public sealed class GetWeatherByCityTests
{
    private readonly IWeatherApiClient _apiClient = Substitute.For<IWeatherApiClient>();
    private readonly IMemoryCache _cache = new MemoryCache(new MemoryCacheOptions());
    private readonly IOptions<WeatherApiOptions> _options =
        Options.Create(new WeatherApiOptions { CacheTtlMinutes = 10 });

    private GetWeatherByCity CreateHandler() =>
        new(_apiClient, _cache, _options, NullLogger<GetWeatherByCity>.Instance);

    [Test]
    public async Task HandleAsync_ValidCity_ReturnsWeatherResponse()
    {
        var expected = BuildWeatherResponse("London");
        _apiClient.GetWeatherAsync("London", Arg.Any<CancellationToken>())
            .Returns(Result<WeatherResponse>.Success(expected));

        var result = await CreateHandler().HandleAsync("London");

        result.IsSuccess.ShouldBeTrue();
        result.Value!.City.ShouldBe("London");
    }

    [Test]
    public async Task HandleAsync_CityNotFound_ReturnsFailure()
    {
        _apiClient.GetWeatherAsync("Nowhere", Arg.Any<CancellationToken>())
            .Returns(Result<WeatherResponse>.Failure("CITY_NOT_FOUND", "City not found."));

        var result = await CreateHandler().HandleAsync("Nowhere");

        result.IsFailure.ShouldBeTrue();
        result.Error!.Code.ShouldBe("CITY_NOT_FOUND");
    }

    [Test]
    public async Task HandleAsync_SecondCall_ReturnsCachedResult()
    {
        var expected = BuildWeatherResponse("Paris");
        _apiClient.GetWeatherAsync("Paris", Arg.Any<CancellationToken>())
            .Returns(Result<WeatherResponse>.Success(expected));

        var handler = CreateHandler();
        await handler.HandleAsync("Paris");
        await handler.HandleAsync("Paris");

        await _apiClient.Received(1).GetWeatherAsync("Paris", Arg.Any<CancellationToken>());
    }

    [Test]
    public async Task HandleAsync_UpstreamError_DoesNotCache()
    {
        _apiClient.GetWeatherAsync("Tokyo", Arg.Any<CancellationToken>())
            .Returns(Result<WeatherResponse>.Failure("UPSTREAM_ERROR", "Service unavailable."));

        var handler = CreateHandler();
        await handler.HandleAsync("Tokyo");
        await handler.HandleAsync("Tokyo");

        await _apiClient.Received(2).GetWeatherAsync("Tokyo", Arg.Any<CancellationToken>());
    }

    private static WeatherResponse BuildWeatherResponse(string city) => new(
        City: city,
        Country: "GB",
        Temperature: new TemperatureInfo(15.0, 13.0, 10.0, 18.0, "celsius"),
        Humidity: 70,
        WindSpeed: 4.0,
        WindDirection: 180,
        Description: "clear sky",
        Icon: "01d",
        IconUrl: "https://openweathermap.org/img/wn/01d@2x.png",
        Sunrise: DateTime.UtcNow.Date.AddHours(6),
        Sunset: DateTime.UtcNow.Date.AddHours(19),
        FetchedAt: DateTime.UtcNow);
}
