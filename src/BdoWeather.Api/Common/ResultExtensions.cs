using Microsoft.AspNetCore.Http;

namespace BdoWeather.Common;

public static class ResultExtensions
{
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

public static class ApiEnvelope
{
    public static object Success<T>(T data) => new { data, errors = Array.Empty<object>() };
    public static object Error(Error error) => new { data = (object?)null, errors = new[] { error } };
}
