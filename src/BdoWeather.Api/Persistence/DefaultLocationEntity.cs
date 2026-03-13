using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BdoWeather.Persistence;

/// <summary>Database entity for the user's chosen default location. The table always contains at most one row.</summary>
public sealed class DefaultLocationEntity
{
    public int Id { get; init; }
    public string City { get; init; } = string.Empty;
    public string Country { get; init; } = string.Empty;
    public DateTime SetAt { get; init; }
}

public sealed class DefaultLocationConfiguration : IEntityTypeConfiguration<DefaultLocationEntity>
{
    public void Configure(EntityTypeBuilder<DefaultLocationEntity> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.City).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Country).HasMaxLength(10).IsRequired();
        builder.Property(x => x.SetAt).IsRequired();
    }
}
