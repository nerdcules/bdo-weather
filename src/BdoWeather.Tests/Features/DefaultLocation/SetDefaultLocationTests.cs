using BdoWeather.Common;
using BdoWeather.Features.DefaultLocation;
using BdoWeather.Features.Weather;
using BdoWeather.Infrastructure;
using BdoWeather.Persistence;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using NSubstitute;
using Shouldly;
using TUnit.Core;

namespace BdoWeather.Tests.Features.DefaultLocation;

public sealed class SetDefaultLocationTests
{
    private AppDbContext CreateInMemoryDb()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    private readonly IWeatherApiClient _apiClient = Substitute.For<IWeatherApiClient>();
    private readonly IMemoryCache _cache = new MemoryCache(new MemoryCacheOptions());
    private readonly IValidator<SetDefaultLocationRequest> _validator = new SetDefaultLocationValidator();

    [Test]
    public async Task HandleAsync_ValidCity_PersistsAndReturnsResponse()
    {
        await using var db = CreateInMemoryDb();
        _apiClient.GetWeatherAsync("Dublin", Arg.Any<CancellationToken>())
            .Returns(Result<WeatherResponse>.Success(BuildWeatherResponse("Dublin", "IE")));

        var handler = new SetDefaultLocation(db, _cache, _validator, _apiClient);
        var result = await handler.HandleAsync(new SetDefaultLocationRequest("Dublin"));

        result.IsSuccess.ShouldBeTrue();
        result.Value!.City.ShouldBe("Dublin");
        result.Value.Country.ShouldBe("IE");
        db.DefaultLocations.Count().ShouldBe(1);
    }

    [Test]
    public async Task HandleAsync_EmptyCity_ReturnsValidationFailure()
    {
        await using var db = CreateInMemoryDb();
        var handler = new SetDefaultLocation(db, _cache, _validator, _apiClient);
        var result = await handler.HandleAsync(new SetDefaultLocationRequest(""));

        result.IsFailure.ShouldBeTrue();
        result.Error!.Code.ShouldBe("VALIDATION");
    }

    [Test]
    public async Task HandleAsync_CityNotFoundByApi_ReturnsFailure()
    {
        await using var db = CreateInMemoryDb();
        _apiClient.GetWeatherAsync("FakePlace", Arg.Any<CancellationToken>())
            .Returns(Result<WeatherResponse>.Failure("CITY_NOT_FOUND", "City not found."));

        var handler = new SetDefaultLocation(db, _cache, _validator, _apiClient);
        var result = await handler.HandleAsync(new SetDefaultLocationRequest("FakePlace"));

        result.IsFailure.ShouldBeTrue();
        result.Error!.Code.ShouldBe("CITY_NOT_FOUND");
        db.DefaultLocations.Count().ShouldBe(0);
    }

    [Test]
    public async Task HandleAsync_SecondSet_ReplacesExistingDefault()
    {
        await using var db = CreateInMemoryDb();
        _apiClient.GetWeatherAsync(Arg.Any<string>(), Arg.Any<CancellationToken>())
            .Returns(args => Result<WeatherResponse>.Success(BuildWeatherResponse((string)args[0], "XX")));

        var handler = new SetDefaultLocation(db, _cache, _validator, _apiClient);
        await handler.HandleAsync(new SetDefaultLocationRequest("Dublin"));
        await handler.HandleAsync(new SetDefaultLocationRequest("London"));

        db.DefaultLocations.Count().ShouldBe(1);
        db.DefaultLocations.Single().City.ShouldBe("London");
    }

    private static WeatherResponse BuildWeatherResponse(string city, string country) => new(
        City: city,
        Country: country,
        Temperature: new TemperatureInfo(15.0, 13.0, 10.0, 18.0, "celsius"),
        Humidity: 70,
        WindSpeed: 4.0,
        WindDirection: 180,
        Description: "clear sky",
        Icon: "01d",
        IconUrl: "https://openweathermap.org/img/wn/01d@2x.png",
        Sunrise: DateTime.UtcNow,
        Sunset: DateTime.UtcNow,
        FetchedAt: DateTime.UtcNow);
}
