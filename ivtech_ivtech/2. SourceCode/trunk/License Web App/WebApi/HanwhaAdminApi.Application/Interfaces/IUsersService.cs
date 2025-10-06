using HanwhaAdminApi.Model.Common.ReferenceData;
using HanwhaAdminApi.Model.DbEntities;
using HanwhaAdminApi.Model.Dto;
using Microsoft.AspNetCore.Http;

namespace HanwhaAdminApi.Application.Interfaces
{
    public interface IUsersService
    {
        Task<(string Id, string ErrorMessage)> SaveUserAsync(UsersRequestModel userRequest, string userId);
        Task<(IEnumerable<UserMaster> data, Dictionary<string, object> referenceData)> GetAllUsersAsync();
        Task<List<OptionModel<string, string>>> GetUserMasterReferenceDataAsync(IEnumerable<string> ids);
        Task<UserMaster> GetUserAsync(string id);
        Task<bool> DeleteUserAsync(string id, string userId);
        Task<bool> ForgotPasswordAsync(ForgotPasswordDto forgotPasswordDto);
        Task<bool> ResetPasswordAsync(ResetPasswordDto resetPasswordDto, string userId);
        Task<bool> ForgotPasswordResetAsync(ForgotPasswordResetDto resetPasswordDto);
        Task<(UserMaster data, Dictionary<string, object> referenceData)> GetUsersProfile(string userId);
        Task<bool> SaveUserProfileImage(IFormFile file, string userId);
        Task<bool> SendOtpByUserIdAsync(string id,string emailId);

    }
}
