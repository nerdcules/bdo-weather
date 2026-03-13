using Microsoft.AspNetCore.Http;

namespace BdoWeather.Common;

/// <summary>Extension methods that map <see cref="Result{T}"/> values to ASP.NET Core <see cref="IResult"/> HTTP responses.</summary>
public static class ResultExtensions
{
    /// <summary>Converts a <see cref="Result{T}"/> to the correct HTTP status code: 200, 400, 404, 429, 502, or 500.</summary>
    public static IResult ToHttpResult<T>(this Result<T> result, Func<T, IResult> onSuccess) =>
        result.IsSuccess
            ? onSuccess(result.Value!)
            : result.Error!.Code switch
            {
                "CITY_NOT_FOUND" => Results.NotFound(ApiEnvelope.Error(result.Error)),
                "RATE_LIMITED"   => Results.Json(ApiEnvelope.Error(result.Error), statusCode: 429),
                "UPSTREAM_ERROR" => Results.Json(ApiEnvelope.Error(result.Error), statusCode: 502),
                "VALIDATION"     => Results.BadRequest(ApiEnvelope.Error(result.Error)),
                _                => Results.Problem(result.Error.Message)
            };
}

/// <summary>Wraps all API responses in a consistent <c>{ data, errors }</c> envelope understood by the frontend axios interceptor.</summary>
public static class ApiEnvelope
{
    public static object Success<T>(T data) => new { data, errors = Array.Empty<object>() };
    public static object Error(Error error) => new { data = (object?)null, errors = new[] { error } };
}
