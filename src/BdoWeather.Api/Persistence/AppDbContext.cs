using Microsoft.EntityFrameworkCore;

namespace BdoWeather.Persistence;

/// <summary>EF Core database context. Entity configurations are auto-discovered via <see cref="ModelBuilder.ApplyConfigurationsFromAssembly"/>.</summary>
public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<DefaultLocationEntity> DefaultLocations => Set<DefaultLocationEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
