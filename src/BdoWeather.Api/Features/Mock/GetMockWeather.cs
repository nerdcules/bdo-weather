using BdoWeather.Common;

namespace BdoWeather.Features.Mock;

/// <summary>Returns a static mock weather response. Used in development (UseMock: true) and integration tests to avoid real API calls.</summary>
public sealed class GetMockWeather
{
    public Task<Result<Features.Weather.WeatherResponse>> HandleAsync(string city, CancellationToken ct = default)
    {
        var response = new Features.Weather.WeatherResponse(
            City: string.IsNullOrWhiteSpace(city) ? "MockCity" : city,
            Country: "MC",
            Temperature: new Features.Weather.TemperatureInfo(
                Current: 15.0,
                FeelsLike: 14.0,
                Min: 10.0,
                Max: 20.0,
                Unit: "celsius"),
            Humidity: 65,
            WindSpeed: 3.5,
            WindDirection: 180,
            Description: "clear sky",
            Icon: "01d",
            IconUrl: "https://openweathermap.org/img/wn/01d@2x.png",
            Sunrise: DateTime.UtcNow.Date.AddHours(6),
            Sunset: DateTime.UtcNow.Date.AddHours(19),
            FetchedAt: DateTime.UtcNow);

        return Task.FromResult(Result<Features.Weather.WeatherResponse>.Success(response));
    }
}
