using BdoWeather.Common;
using BdoWeather.Infrastructure;
using BdoWeather.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace BdoWeather.Features.DefaultLocation;

public sealed class GetDefaultLocation(AppDbContext db, IMemoryCache cache)
{
    public async Task<Result<DefaultLocationResponse?>> HandleAsync(CancellationToken ct = default)
    {
        if (cache.TryGetValue(CacheKeys.DefaultLocation, out DefaultLocationResponse? cached))
            return Result<DefaultLocationResponse?>.Success(cached);

        var entity = await db.DefaultLocations
            .AsNoTracking()
            .OrderByDescending(x => x.SetAt)
            .FirstOrDefaultAsync(ct);

        var response = entity is null
            ? null
            : new DefaultLocationResponse(entity.City, entity.Country, entity.SetAt);

        if (response is not null)
            cache.Set(CacheKeys.DefaultLocation, response, TimeSpan.FromHours(24));

        return Result<DefaultLocationResponse?>.Success(response);
    }
}
