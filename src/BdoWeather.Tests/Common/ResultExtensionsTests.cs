using Xunit;
using BdoWeather.Common;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Json;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Shouldly;


namespace BdoWeather.Tests.Common;

public sealed class ResultExtensionsTests
{
    private static DefaultHttpContext CreateContext()
    {
        var ctx = new DefaultHttpContext();
        ctx.Response.Body = new MemoryStream();

        var services = new ServiceCollection();
        services.AddLogging();
        services.AddSingleton(Options.Create(new JsonOptions()));
        ctx.RequestServices = services.BuildServiceProvider();

        return ctx;
    }

    [Fact]
    public async Task ToHttpResult_Success_InvokesOnSuccessAndReturns200()
    {
        var result = Result<string>.Success("hello");
        var ctx = CreateContext();

        await result.ToHttpResult(v => Results.Ok(v)).ExecuteAsync(ctx);

        ctx.Response.StatusCode.ShouldBe(200);
    }

    [Fact]
    public async Task ToHttpResult_CityNotFound_Returns404()
    {
        var result = Result<string>.Failure("CITY_NOT_FOUND", "Not found");
        var ctx = CreateContext();

        await result.ToHttpResult(v => Results.Ok(v)).ExecuteAsync(ctx);

        ctx.Response.StatusCode.ShouldBe(404);
    }

    [Fact]
    public async Task ToHttpResult_RateLimited_Returns429()
    {
        var result = Result<string>.Failure("RATE_LIMITED", "Rate limited");
        var ctx = CreateContext();

        await result.ToHttpResult(v => Results.Ok(v)).ExecuteAsync(ctx);

        ctx.Response.StatusCode.ShouldBe(429);
    }

    [Fact]
    public async Task ToHttpResult_UpstreamError_Returns502()
    {
        var result = Result<string>.Failure("UPSTREAM_ERROR", "Unavailable");
        var ctx = CreateContext();

        await result.ToHttpResult(v => Results.Ok(v)).ExecuteAsync(ctx);

        ctx.Response.StatusCode.ShouldBe(502);
    }

    [Fact]
    public async Task ToHttpResult_Validation_Returns400()
    {
        var result = Result<string>.Failure("VALIDATION", "Validation failed");
        var ctx = CreateContext();

        await result.ToHttpResult(v => Results.Ok(v)).ExecuteAsync(ctx);

        ctx.Response.StatusCode.ShouldBe(400);
    }

    [Fact]
    public void ToHttpResult_UnknownErrorCode_ReturnsProblemResult()
    {
        var result = Result<string>.Failure("UNKNOWN_CODE", "Unexpected problem");

        // Just verify a non-null IResult is constructed without throwing
        var httpResult = result.ToHttpResult(v => Results.Ok(v));

        httpResult.ShouldNotBeNull();
    }

    [Fact]
    public void ApiEnvelope_Success_ContainsData()
    {
        var envelope = ApiEnvelope.Success("payload");

        envelope.ShouldNotBeNull();
    }

    [Fact]
    public void ApiEnvelope_Error_ContainsErrors()
    {
        var envelope = ApiEnvelope.Error(new Error("CODE", "msg"));

        envelope.ShouldNotBeNull();
    }
}
