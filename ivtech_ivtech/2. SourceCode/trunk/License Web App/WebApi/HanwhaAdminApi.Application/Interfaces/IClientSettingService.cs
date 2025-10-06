using HanwhaAdminApi.Model.DbEntities;
using Microsoft.AspNetCore.Http;

namespace HanwhaAdminApi.Application.Interfaces
{
    public interface IClientSettingService
    {
        Task<bool> SaveClientLogo(IFormFile file, string userId);
        Task<string?> GetClientLogo(string userId);
        Task<bool> SaveClientSMTPSettings(SmtpSettings smtpSettings, string userId);
    }
}
