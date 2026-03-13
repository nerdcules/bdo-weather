using System.ComponentModel.DataAnnotations;

namespace BdoWeather.Infrastructure;

public sealed class WeatherApiOptions
{
    public const string SectionName = "WeatherApi";

    public string BaseUrl { get; init; } = "https://api.openweathermap.org/data/2.5";

    [Required(AllowEmptyStrings = false, ErrorMessage = "WeatherApi:ApiKey is required. Set it via user secrets or an environment variable.")]
    public string ApiKey { get; init; } = string.Empty;

    public int TimeoutSeconds { get; init; } = 5;
    public int CacheTtlMinutes { get; init; } = 10;
    public bool UseMock { get; init; } = false;
}
