using FluentValidation;
using HanwhaAdminApi.Model.Dto;
using System.Text.RegularExpressions;

namespace HanwhaAdminApi.Helper.Validators
{
    public class UsersRequestModelValidator : AbstractValidator<UsersRequestModel>
    {
        public UsersRequestModelValidator()
        {
            RuleFor(x => x.Username)
                .NotEmpty().WithMessage("Username is required.")
                .Length(3, 20).WithMessage("Username must be between 3 and 20 characters.");

            RuleFor(x => x.Firstname)
                .NotEmpty().WithMessage("Firstname is required.")
                .Length(2, 20).WithMessage("Firstname must be between 2 and 20 characters.");

            RuleFor(x => x.Lastname)
                .NotEmpty().WithMessage("Lastname is required.")
                .Length(2, 20).WithMessage("Lastname must be between 2 and 20 characters.");

            RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("Invalid email format.");

            RuleFor(x => x.RoleIds)
            .NotEmpty().WithMessage("RoleId is required.");
            //.Must(BeAValidObjectId).WithMessage("Id must be a valid 24-character hexadecimal string.");

        }

        /// <summary>
        /// Check is valid 24 digit id
        /// </summary>
        /// <param name="id"></param>
        /// <returns>bool</returns>
        private bool BeAValidObjectId(string id)
        {
            return !string.IsNullOrEmpty(id) && Regex.IsMatch(id, "^[a-fA-F0-9]{24}$");
        }
    }
}
