using BdoWeather.Common;
using BdoWeather.Features.Weather;

namespace BdoWeather.Infrastructure;

public interface IWeatherApiClient
{
    Task<Result<WeatherResponse>> GetWeatherAsync(string city, CancellationToken ct = default);
}
