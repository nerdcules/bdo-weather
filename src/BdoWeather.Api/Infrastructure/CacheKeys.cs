namespace BdoWeather.Infrastructure;

/// <summary>Centralises in-memory cache key generation to prevent typos and collisions across features.</summary>
public static class CacheKeys
{
    public static string Weather(string city) => $"weather::{city.ToLowerInvariant().Trim()}";
    public const string DefaultLocation = "default-location";
}
