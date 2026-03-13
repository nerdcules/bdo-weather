namespace BdoWeather.Common;

/// <summary>An error code and human-readable message returned when an operation fails.</summary>
public record Error(string Code, string Message);

/// <summary>
/// Discriminated union of success (with <typeparamref name="T"/>) or failure (with an <see cref="Error"/>).
/// Feature handlers return this instead of throwing so callers can handle errors without try/catch.
/// </summary>
public sealed class Result<T>
{
    private Result(T value)
    {
        Value = value;
        IsSuccess = true;
        Error = default;
    }

    private Result(Error error)
    {
        Value = default;
        IsSuccess = false;
        Error = error;
    }

    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;
    public T? Value { get; }
    public Error? Error { get; }

    public static Result<T> Success(T value) => new(value);
    public static Result<T> Failure(Error error) => new(error);
    public static Result<T> Failure(string code, string message) => new(new Error(code, message));

    public TResult Match<TResult>(Func<T, TResult> onSuccess, Func<Error, TResult> onFailure) =>
        IsSuccess ? onSuccess(Value!) : onFailure(Error!);
}
