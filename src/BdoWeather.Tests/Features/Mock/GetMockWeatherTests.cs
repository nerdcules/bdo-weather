using Xunit;
using BdoWeather.Features.Mock;
using Shouldly;


namespace BdoWeather.Tests.Features.Mock;

public sealed class GetMockWeatherTests
{
    [Fact]
    public async Task HandleAsync_WithCity_ReturnsSuccessWithProvidedCity()
    {
        var handler = new GetMockWeather();
        var result = await handler.HandleAsync("TestCity");

        result.IsSuccess.ShouldBeTrue();
        result.Value!.City.ShouldBe("TestCity");
        result.Value.Country.ShouldBe("MC");
    }

    [Fact]
    public async Task HandleAsync_EmptyCity_ReturnsMockCity()
    {
        var handler = new GetMockWeather();
        var result = await handler.HandleAsync("");

        result.IsSuccess.ShouldBeTrue();
        result.Value!.City.ShouldBe("MockCity");
    }

    [Fact]
    public async Task HandleAsync_WhitespaceCity_ReturnsMockCity()
    {
        var handler = new GetMockWeather();
        var result = await handler.HandleAsync("   ");

        result.IsSuccess.ShouldBeTrue();
        result.Value!.City.ShouldBe("MockCity");
    }

    [Fact]
    public async Task HandleAsync_ReturnsExpectedWeatherFields()
    {
        var handler = new GetMockWeather();
        var result = await handler.HandleAsync("Dublin");

        result.Value!.Temperature.Current.ShouldBe(15.0);
        result.Value.Humidity.ShouldBe(65);
        result.Value.Description.ShouldBe("clear sky");
        result.Value.Icon.ShouldBe("01d");
    }
}
