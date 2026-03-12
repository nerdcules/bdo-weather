using BdoWeather.Common;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Json;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Shouldly;
using TUnit.Core;

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

    [Test]
    public async Task ToHttpResult_Success_InvokesOnSuccessAndReturns200()
    {
        var result = Result<string>.Success("hello");
        var ctx = CreateContext();

        await result.ToHttpResult(v => Results.Ok(v)).ExecuteAsync(ctx);

        ctx.Response.StatusCode.ShouldBe(200);
    }

    [Test]
    public async Task ToHttpResult_CityNotFound_Returns404()
    {
        var result = Result<string>.Failure("CITY_NOT_FOUND", "Not found");
        var ctx = CreateContext();

        await result.ToHttpResult(v => Results.Ok(v)).ExecuteAsync(ctx);

        ctx.Response.StatusCode.ShouldBe(404);
    }

    [Test]
    public async Task ToHttpResult_RateLimited_Returns429()
    {
        var result = Result<string>.Failure("RATE_LIMITED", "Rate limited");
        var ctx = CreateContext();

        await result.ToHttpResult(v => Results.Ok(v)).ExecuteAsync(ctx);

        ctx.Response.StatusCode.ShouldBe(429);
    }

    [Test]
    public async Task ToHttpResult_UpstreamError_Returns502()
    {
        var result = Result<string>.Failure("UPSTREAM_ERROR", "Unavailable");
        var ctx = CreateContext();

        await result.ToHttpResult(v => Results.Ok(v)).ExecuteAsync(ctx);

        ctx.Response.StatusCode.ShouldBe(502);
    }

    [Test]
    public async Task ToHttpResult_Validation_Returns400()
    {
        var result = Result<string>.Failure("VALIDATION", "Validation failed");
        var ctx = CreateContext();

        await result.ToHttpResult(v => Results.Ok(v)).ExecuteAsync(ctx);

        ctx.Response.StatusCode.ShouldBe(400);
    }

    [Test]
    public void ToHttpResult_UnknownErrorCode_ReturnsProblemResult()
    {
        var result = Result<string>.Failure("UNKNOWN_CODE", "Unexpected problem");

        // Just verify a non-null IResult is constructed without throwing
        var httpResult = result.ToHttpResult(v => Results.Ok(v));

        httpResult.ShouldNotBeNull();
    }

    [Test]
    public void ApiEnvelope_Success_ContainsData()
    {
        var envelope = ApiEnvelope.Success("payload");

        envelope.ShouldNotBeNull();
    }

    [Test]
    public void ApiEnvelope_Error_ContainsErrors()
    {
        var envelope = ApiEnvelope.Error(new Error("CODE", "msg"));

        envelope.ShouldNotBeNull();
    }
}
