using System.Net;
using System.Net.Http.Json;
using BdoWeather.Common;
using BdoWeather.Features.Weather;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace BdoWeather.Infrastructure;

public sealed class WeatherApiClient(
    HttpClient httpClient,
    IOptions<WeatherApiOptions> options,
    ILogger<WeatherApiClient> logger) : IWeatherApiClient
{
    private readonly WeatherApiOptions _options = options.Value;

    public async Task<Result<WeatherResponse>> GetWeatherAsync(string city, CancellationToken ct = default)
    {
        var url = $"weather?q={Uri.EscapeDataString(city)}&appid={_options.ApiKey}&units=metric";
        logger.LogInformation("Fetching weather for city: {City}", city);

        HttpResponseMessage response;
        try
        {
            response = await httpClient.GetAsync(url, ct);
        }
        catch (Exception ex) when (ex is TaskCanceledException or HttpRequestException)
        {
            logger.LogWarning(ex, "Weather API request failed for city: {City}", city);
            return Result<WeatherResponse>.Failure("UPSTREAM_ERROR", "Weather service is temporarily unavailable.");
        }

        if (response.StatusCode == HttpStatusCode.NotFound)
            return Result<WeatherResponse>.Failure("CITY_NOT_FOUND", $"No city found matching '{city}'.");

        if (response.StatusCode == HttpStatusCode.TooManyRequests)
            return Result<WeatherResponse>.Failure("RATE_LIMITED", "Weather API rate limit reached. Please try again later.");

        if (!response.IsSuccessStatusCode)
        {
            logger.LogError("Weather API returned {StatusCode} for city: {City}", response.StatusCode, city);
            return Result<WeatherResponse>.Failure("UPSTREAM_ERROR", "Weather service returned an unexpected error.");
        }

        var owm = await response.Content.ReadFromJsonAsync<OwmResponse>(ct);
        if (owm is null)
            return Result<WeatherResponse>.Failure("UPSTREAM_ERROR", "Weather service returned an unparseable response.");

        return Result<WeatherResponse>.Success(MapOwmResponse(owm));
    }

    private static WeatherResponse MapOwmResponse(OwmResponse owm) => new(
        City: owm.Name,
        Country: owm.Sys.Country,
        Temperature: new TemperatureInfo(
            Current: owm.Main.Temp,
            FeelsLike: owm.Main.FeelsLike,
            Min: owm.Main.TempMin,
            Max: owm.Main.TempMax,
            Unit: "celsius"),
        Humidity: owm.Main.Humidity,
        WindSpeed: owm.Wind.Speed,
        WindDirection: owm.Wind.Deg,
        Description: owm.Weather[0].Description,
        Icon: owm.Weather[0].Icon,
        IconUrl: $"https://openweathermap.org/img/wn/{owm.Weather[0].Icon}@2x.png",
        Sunrise: DateTimeOffset.FromUnixTimeSeconds(owm.Sys.Sunrise).UtcDateTime,
        Sunset: DateTimeOffset.FromUnixTimeSeconds(owm.Sys.Sunset).UtcDateTime,
        FetchedAt: DateTime.UtcNow
    );

    // OpenWeatherMap response models (private, not exposed)
    private sealed record OwmResponse(
        string Name,
        OwmMain Main,
        OwmWind Wind,
        OwmSys Sys,
        OwmWeather[] Weather);

    private sealed record OwmMain(
        double Temp,
        double FeelsLike,
        double TempMin,
        double TempMax,
        int Humidity);

    private sealed record OwmWind(double Speed, int Deg);

    private sealed record OwmSys(string Country, long Sunrise, long Sunset);

    private sealed record OwmWeather(string Description, string Icon);
}
