using Xunit;
using BdoWeather.Common;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging.Abstractions;
using Shouldly;


namespace BdoWeather.Tests.Common;

public sealed class GlobalExceptionHandlerTests
{
    [Fact]
    public async Task TryHandleAsync_SetsStatus500AndReturnsTrue()
    {
        var handler = new GlobalExceptionHandler(NullLogger<GlobalExceptionHandler>.Instance);
        var ctx = new DefaultHttpContext();
        ctx.Response.Body = new MemoryStream();

        var handled = await handler.TryHandleAsync(
            ctx,
            new InvalidOperationException("boom"),
            CancellationToken.None);

        handled.ShouldBeTrue();
        ctx.Response.StatusCode.ShouldBe(500);
    }

    [Fact]
    public async Task TryHandleAsync_WritesJsonBody()
    {
        var handler = new GlobalExceptionHandler(NullLogger<GlobalExceptionHandler>.Instance);
        var ctx = new DefaultHttpContext();
        var body = new MemoryStream();
        ctx.Response.Body = body;

        await handler.TryHandleAsync(
            ctx,
            new Exception("test error"),
            CancellationToken.None);

        body.Position = 0;
        var json = await new StreamReader(body).ReadToEndAsync();
        json.ShouldContain("INTERNAL_ERROR");
    }
}
