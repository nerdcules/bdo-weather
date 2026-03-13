using BdoWeather.Common;
using BdoWeather.Infrastructure;
using BdoWeather.Persistence;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace BdoWeather.Features.DefaultLocation;

/// <summary>
/// Validates the city name, verifies it exists via the weather API, replaces any existing
/// default location (always at most one row), and invalidates the cache on success.
/// </summary>
public sealed class SetDefaultLocation(
    AppDbContext db,
    IMemoryCache cache,
    IValidator<SetDefaultLocationRequest> validator,
    IWeatherApiClient apiClient)
{
    public async Task<Result<DefaultLocationResponse>> HandleAsync(
        SetDefaultLocationRequest request,
        CancellationToken ct = default)
    {
        var validation = await validator.ValidateAsync(request, ct);
        if (!validation.IsValid)
        {
            var msg = string.Join("; ", validation.Errors.Select(e => e.ErrorMessage));
            return Result<DefaultLocationResponse>.Failure("VALIDATION", msg);
        }

        // Verify city exists by attempting a weather lookup
        var verify = await apiClient.GetWeatherAsync(request.City, ct);
        if (verify.IsFailure)
            return Result<DefaultLocationResponse>.Failure(verify.Error!);

        // Remove existing default location before inserting new one
        var existing = await db.DefaultLocations.ToListAsync(ct);
        db.DefaultLocations.RemoveRange(existing);

        var entity = new DefaultLocationEntity
        {
            City = verify.Value!.City,
            Country = verify.Value.Country,
            SetAt = DateTime.UtcNow
        };

        db.DefaultLocations.Add(entity);
        await db.SaveChangesAsync(ct);

        cache.Remove(CacheKeys.DefaultLocation);

        var response = new DefaultLocationResponse(entity.City, entity.Country, entity.SetAt);
        return Result<DefaultLocationResponse>.Success(response);
    }
}
