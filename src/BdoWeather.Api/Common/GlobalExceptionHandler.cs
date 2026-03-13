using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace BdoWeather.Common;

/// <summary>
/// Last-resort exception handler registered via <c>app.UseExceptionHandler()</c>.
/// Logs the full stack trace and returns a 500 JSON envelope — never exposes internal details to the client.
/// </summary>
public sealed class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken ct)
    {
        logger.LogError(exception, "Unhandled exception for {Method} {Path}",
            httpContext.Request.Method, httpContext.Request.Path);

        httpContext.Response.StatusCode = StatusCodes.Status500InternalServerError;
        await httpContext.Response.WriteAsJsonAsync(
            ApiEnvelope.Error(new Error("INTERNAL_ERROR", "An unexpected error occurred.")),
            ct);

        return true;
    }
}
