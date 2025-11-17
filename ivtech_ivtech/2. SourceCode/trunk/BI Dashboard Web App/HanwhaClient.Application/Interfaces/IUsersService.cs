using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.Dto;
using HanwhaClient.Model.User;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Application.Interfaces
{
    public interface IUsersService
    {
        Task<(string Id, string ErrorMessage)> SaveUserAsync(UsersRequestModel userRequest, string userId);
        Task<(IEnumerable<UserMaster> data, Dictionary<string, object> referenceData)> GetAllUsersAsync();
        Task<UserMaster> GetUserAsync(string id);
        Task<bool> DeleteUserAsync(string id, string userId);
        Task<bool> ForgotPasswordAsync(ForgotPasswordDto forgotPasswordDto);
        Task<bool> ResetPasswordAsync(ResetPasswordDto resetPasswordDto);
        Task<bool> ForgotPasswordResetAsync(ForgotPasswordResetDto resetPasswordDto);
        Task<bool> UserResetPassword(UserResetPassword userResetPassword);
        Task<bool> AddUpdateUserPreferences(UserPreferencesRequest userPreferencesRequest);
        Task<bool> SaveUserProfileImage(IFormFile file, string userId);
        Task<(UserMaster data, Dictionary<string, object> referenceData)> GetUsersProfile(string userId);
        Task<ClientTimezones> GetTimeZone(string userId);
    }
}
