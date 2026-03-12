using BdoWeather.Common;
using BdoWeather.Features.DefaultLocation;
using BdoWeather.Infrastructure;
using BdoWeather.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Shouldly;
using TUnit.Core;

namespace BdoWeather.Tests.Features.DefaultLocation;

public sealed class GetDefaultLocationTests
{
    private AppDbContext CreateInMemoryDb()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    [Test]
    public async Task HandleAsync_NothingInDb_ReturnsSuccessWithNull()
    {
        await using var db = CreateInMemoryDb();
        using var cache = new MemoryCache(new MemoryCacheOptions());

        var handler = new GetDefaultLocation(db, cache);
        var result = await handler.HandleAsync();

        result.IsSuccess.ShouldBeTrue();
        result.Value.ShouldBeNull();
    }

    [Test]
    public async Task HandleAsync_EntityInDb_ReturnsSuccessWithResponse()
    {
        await using var db = CreateInMemoryDb();
        using var cache = new MemoryCache(new MemoryCacheOptions());

        db.DefaultLocations.Add(new DefaultLocationEntity
        {
            City = "Dublin",
            Country = "IE",
            SetAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync();

        var handler = new GetDefaultLocation(db, cache);
        var result = await handler.HandleAsync();

        result.IsSuccess.ShouldBeTrue();
        result.Value!.City.ShouldBe("Dublin");
        result.Value.Country.ShouldBe("IE");
    }

    [Test]
    public async Task HandleAsync_SecondCall_ReturnsCachedValue()
    {
        await using var db = CreateInMemoryDb();
        using var cache = new MemoryCache(new MemoryCacheOptions());

        db.DefaultLocations.Add(new DefaultLocationEntity
        {
            City = "London",
            Country = "GB",
            SetAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync();

        var handler = new GetDefaultLocation(db, cache);
        var first = await handler.HandleAsync();

        // Pre-populate cache manually to simulate cache hit path
        cache.Set(CacheKeys.DefaultLocation, first.Value, TimeSpan.FromHours(24));

        // Remove from DB so we can confirm the second call hits cache
        db.DefaultLocations.RemoveRange(db.DefaultLocations);
        await db.SaveChangesAsync();

        var second = await handler.HandleAsync();

        second.IsSuccess.ShouldBeTrue();
        second.Value!.City.ShouldBe("London");
    }
}
