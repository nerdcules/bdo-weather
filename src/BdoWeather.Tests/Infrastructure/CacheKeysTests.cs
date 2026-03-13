using Xunit;
using BdoWeather.Infrastructure;
using Shouldly;


namespace BdoWeather.Tests.Infrastructure;

public sealed class CacheKeysTests
{
    [Fact]
    public void Weather_ReturnsLowercasedCityKey()
    {
        CacheKeys.Weather("London").ShouldBe("weather::london");
    }

    [Fact]
    public void Weather_TrimsWhitespace()
    {
        CacheKeys.Weather("  paris  ").ShouldBe("weather::paris");
    }

    [Fact]
    public void Weather_NormalizesCase()
    {
        CacheKeys.Weather("BERLIN").ShouldBe("weather::berlin");
    }

    [Fact]
    public void DefaultLocation_IsExpectedConstant()
    {
        CacheKeys.DefaultLocation.ShouldBe("default-location");
    }
}
