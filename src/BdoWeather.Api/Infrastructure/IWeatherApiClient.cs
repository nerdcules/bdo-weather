using BdoWeather.Common;
using BdoWeather.Features.Weather;

namespace BdoWeather.Infrastructure;

/// <summary>
/// Abstraction over the external weather service. Feature handlers depend on this interface
/// rather than the concrete <see cref="WeatherApiClient"/> so tests can substitute it without network calls.
/// </summary>
public interface IWeatherApiClient
{
    /// <summary>Fetches current weather for <paramref name="city"/>. Returns a failure result instead of throwing on known error conditions (not found, rate limited, upstream error).</summary>
    Task<Result<WeatherResponse>> GetWeatherAsync(string city, CancellationToken ct = default);
}
