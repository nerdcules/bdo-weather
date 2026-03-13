using Xunit;
using System.Net;
using System.Net.Http.Json;
using BdoWeather.Features.Weather;
using BdoWeather.Infrastructure;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Shouldly;


namespace BdoWeather.Tests.Infrastructure;

/// <summary>
/// A minimal fake HttpMessageHandler that returns a pre-configured response.
/// </summary>
internal sealed class FakeHttpMessageHandler(HttpResponseMessage response) : HttpMessageHandler
{
    private readonly HttpResponseMessage _response = response;

    protected override Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request,
        CancellationToken cancellationToken) =>
        Task.FromResult(_response);
}

/// <summary>
/// A fake handler that throws on send (simulates network failure).
/// </summary>
internal sealed class ThrowingHttpMessageHandler(Exception ex) : HttpMessageHandler
{
    private readonly Exception _ex = ex;

    protected override Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request,
        CancellationToken cancellationToken) =>
        throw _ex;
}

public sealed class WeatherApiClientTests
{
    private static WeatherApiClient CreateClient(HttpMessageHandler handler, string? apiKey = "test-key")
    {
        var httpClient = new HttpClient(handler)
        {
            BaseAddress = new Uri("https://api.openweathermap.org/data/2.5/")
        };
        var options = Options.Create(new WeatherApiOptions
        {
            ApiKey = apiKey ?? "test-key",
            BaseUrl = "https://api.openweathermap.org/data/2.5",
            CacheTtlMinutes = 10,
            TimeoutSeconds = 30
        });
        return new WeatherApiClient(httpClient, options, NullLogger<WeatherApiClient>.Instance);
    }

    private static HttpContent BuildOwmJson(string city = "London", string country = "GB") =>
        JsonContent.Create(new
        {
            name = city,
            main = new { temp = 15.0, feels_like = 13.0, temp_min = 10.0, temp_max = 18.0, humidity = 70 },
            wind = new { speed = 4.5, deg = 180 },
            sys = new { country, sunrise = 1704067200L, sunset = 1704103200L },
            weather = new[] { new { description = "clear sky", icon = "01d" } }
        });

    [Fact]
    public async Task GetWeatherAsync_200Response_ReturnsSuccess()
    {
        var response = new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = BuildOwmJson("London")
        };
        var client = CreateClient(new FakeHttpMessageHandler(response));

        var result = await client.GetWeatherAsync("London");

        result.IsSuccess.ShouldBeTrue();
        result.Value!.City.ShouldBe("London");
        result.Value.Country.ShouldBe("GB");
        result.Value.Temperature.Current.ShouldBe(15.0);
        result.Value.Humidity.ShouldBe(70);
    }

    [Fact]
    public async Task GetWeatherAsync_404Response_ReturnsCityNotFound()
    {
        var response = new HttpResponseMessage(HttpStatusCode.NotFound);
        var client = CreateClient(new FakeHttpMessageHandler(response));

        var result = await client.GetWeatherAsync("UnknownCity");

        result.IsFailure.ShouldBeTrue();
        result.Error!.Code.ShouldBe("CITY_NOT_FOUND");
    }

    [Fact]
    public async Task GetWeatherAsync_429Response_ReturnsRateLimited()
    {
        var response = new HttpResponseMessage(HttpStatusCode.TooManyRequests);
        var client = CreateClient(new FakeHttpMessageHandler(response));

        var result = await client.GetWeatherAsync("London");

        result.IsFailure.ShouldBeTrue();
        result.Error!.Code.ShouldBe("RATE_LIMITED");
    }

    [Fact]
    public async Task GetWeatherAsync_500Response_ReturnsUpstreamError()
    {
        var response = new HttpResponseMessage(HttpStatusCode.InternalServerError);
        var client = CreateClient(new FakeHttpMessageHandler(response));

        var result = await client.GetWeatherAsync("London");

        result.IsFailure.ShouldBeTrue();
        result.Error!.Code.ShouldBe("UPSTREAM_ERROR");
    }

    [Fact]
    public async Task GetWeatherAsync_NullBody_ReturnsUpstreamError()
    {
        var response = new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent("null", System.Text.Encoding.UTF8, "application/json")
        };
        var client = CreateClient(new FakeHttpMessageHandler(response));

        var result = await client.GetWeatherAsync("London");

        result.IsFailure.ShouldBeTrue();
        result.Error!.Code.ShouldBe("UPSTREAM_ERROR");
    }

    [Fact]
    public async Task GetWeatherAsync_HttpRequestException_ReturnsUpstreamError()
    {
        var client = CreateClient(new ThrowingHttpMessageHandler(new HttpRequestException("Network down")));

        var result = await client.GetWeatherAsync("London");

        result.IsFailure.ShouldBeTrue();
        result.Error!.Code.ShouldBe("UPSTREAM_ERROR");
    }

    [Fact]
    public async Task GetWeatherAsync_TaskCanceledException_ReturnsUpstreamError()
    {
        var client = CreateClient(new ThrowingHttpMessageHandler(new TaskCanceledException("Timeout")));

        var result = await client.GetWeatherAsync("London");

        result.IsFailure.ShouldBeTrue();
        result.Error!.Code.ShouldBe("UPSTREAM_ERROR");
    }

    [Fact]
    public async Task GetWeatherAsync_MapsIconUrl()
    {
        var response = new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = BuildOwmJson("Paris")
        };
        var client = CreateClient(new FakeHttpMessageHandler(response));

        var result = await client.GetWeatherAsync("Paris");

        result.Value!.IconUrl.ShouldContain("01d@2x.png");
    }

    [Fact]
    public async Task GetWeatherAsync_MapsSunriseAndSunset()
    {
        var response = new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = BuildOwmJson()
        };
        var client = CreateClient(new FakeHttpMessageHandler(response));

        var result = await client.GetWeatherAsync("London");

        result.Value!.Sunrise.ShouldNotBe(default);
        result.Value.Sunset.ShouldNotBe(default);
        result.Value.Sunrise.ShouldBeLessThan(result.Value.Sunset);
    }
}
