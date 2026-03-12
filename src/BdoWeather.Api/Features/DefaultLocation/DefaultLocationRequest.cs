using FluentValidation;

namespace BdoWeather.Features.DefaultLocation;

public sealed record SetDefaultLocationRequest(string City);

public sealed class SetDefaultLocationValidator : AbstractValidator<SetDefaultLocationRequest>
{
    public SetDefaultLocationValidator()
    {
        RuleFor(x => x.City)
            .NotEmpty().WithMessage("City is required.")
            .MaximumLength(100).WithMessage("City must not exceed 100 characters.")
            .Matches(@"^[a-zA-Z\s\-]+$").WithMessage("City may only contain letters, spaces, and hyphens.");
    }
}
