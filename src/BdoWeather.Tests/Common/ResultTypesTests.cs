using BdoWeather.Common;
using Shouldly;
using TUnit.Core;

namespace BdoWeather.Tests.Common;

public sealed class ResultTypesTests
{
    [Test]
    public void Success_SetsValueAndIsSuccess()
    {
        var result = Result<string>.Success("hello");

        result.IsSuccess.ShouldBeTrue();
        result.IsFailure.ShouldBeFalse();
        result.Value.ShouldBe("hello");
        result.Error.ShouldBeNull();
    }

    [Test]
    public void Failure_StringOverload_SetsErrorAndIsFailure()
    {
        var result = Result<int>.Failure("ERR", "Something went wrong");

        result.IsFailure.ShouldBeTrue();
        result.IsSuccess.ShouldBeFalse();
        result.Value.ShouldBe(0);
        result.Error!.Code.ShouldBe("ERR");
        result.Error.Message.ShouldBe("Something went wrong");
    }

    [Test]
    public void Failure_ErrorOverload_SetsError()
    {
        var error = new Error("MY_CODE", "my message");
        var result = Result<string>.Failure(error);

        result.IsFailure.ShouldBeTrue();
        result.Error!.Code.ShouldBe("MY_CODE");
        result.Error.Message.ShouldBe("my message");
    }

    [Test]
    public void Match_OnSuccess_InvokesOnSuccessDelegate()
    {
        var result = Result<int>.Success(42);

        var output = result.Match(
            onSuccess: v => $"got {v}",
            onFailure: e => $"err {e.Code}");

        output.ShouldBe("got 42");
    }

    [Test]
    public void Match_OnFailure_InvokesOnFailureDelegate()
    {
        var result = Result<int>.Failure("FAIL", "bad");

        var output = result.Match(
            onSuccess: v => $"got {v}",
            onFailure: e => $"err {e.Code}");

        output.ShouldBe("err FAIL");
    }

    [Test]
    public void Error_Record_EqualityByValue()
    {
        var e1 = new Error("A", "msg");
        var e2 = new Error("A", "msg");

        e1.ShouldBe(e2);
    }
}
