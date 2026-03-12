using BdoWeather.Infrastructure;
using Shouldly;
using TUnit.Core;

namespace BdoWeather.Tests.Infrastructure;

public sealed class CacheKeysTests
{
    [Test]
    public void Weather_ReturnsLowercasedCityKey()
    {
        CacheKeys.Weather("London").ShouldBe("weather::london");
    }

    [Test]
    public void Weather_TrimsWhitespace()
    {
        CacheKeys.Weather("  paris  ").ShouldBe("weather::paris");
    }

    [Test]
    public void Weather_NormalizesCase()
    {
        CacheKeys.Weather("BERLIN").ShouldBe("weather::berlin");
    }

    [Test]
    public void DefaultLocation_IsExpectedConstant()
    {
        CacheKeys.DefaultLocation.ShouldBe("default-location");
    }
}
