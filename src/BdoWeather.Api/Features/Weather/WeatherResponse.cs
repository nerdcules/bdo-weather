namespace BdoWeather.Features.Weather;

public sealed record WeatherResponse(
    string City,
    string Country,
    TemperatureInfo Temperature,
    int Humidity,
    double WindSpeed,
    int WindDirection,
    string Description,
    string Icon,
    string IconUrl,
    DateTime Sunrise,
    DateTime Sunset,
    DateTime FetchedAt);

public sealed record TemperatureInfo(
    double Current,
    double FeelsLike,
    double Min,
    double Max,
    string Unit);
