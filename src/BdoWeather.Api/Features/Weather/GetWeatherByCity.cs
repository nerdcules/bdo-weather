using BdoWeather.Common;
using BdoWeather.Infrastructure;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace BdoWeather.Features.Weather;

public sealed class GetWeatherByCity(
    IWeatherApiClient apiClient,
    IMemoryCache cache,
    IOptions<WeatherApiOptions> options,
    ILogger<GetWeatherByCity> logger)
{
    private readonly WeatherApiOptions _options = options.Value;

    public async Task<Result<WeatherResponse>> HandleAsync(string city, CancellationToken ct = default)
    {
        var key = CacheKeys.Weather(city);

        if (cache.TryGetValue(key, out WeatherResponse? cached))
        {
            logger.LogInformation("Cache hit for city: {City}", city);
            return Result<WeatherResponse>.Success(cached!);
        }

        logger.LogInformation("Cache miss for city: {City}", city);
        var result = await apiClient.GetWeatherAsync(city, ct);

        if (result.IsSuccess)
            cache.Set(key, result.Value, TimeSpan.FromMinutes(_options.CacheTtlMinutes));

        return result;
    }
}
