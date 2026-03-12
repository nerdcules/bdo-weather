namespace BdoWeather.Infrastructure;

public static class CacheKeys
{
    public static string Weather(string city) => $"weather::{city.ToLowerInvariant().Trim()}";
    public const string DefaultLocation = "default-location";
}
