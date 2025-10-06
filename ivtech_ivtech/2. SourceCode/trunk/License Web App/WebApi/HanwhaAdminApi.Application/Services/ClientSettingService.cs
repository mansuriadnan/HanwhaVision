using HanwhaAdminApi.Application.Interfaces;
using HanwhaAdminApi.Infrastructure.Interfaces;
using HanwhaAdminApi.Model.DbEntities;
using Microsoft.AspNetCore.Http;
using MongoDB.Driver;

namespace HanwhaAdminApi.Application.Services
{
    public class ClientSettingService : IClientSettingService
    {
        private readonly IClientSettingRepository clientSettingRepository;
        private AdminSettings adminSetting;

        public ClientSettingService(IClientSettingRepository clientSettingRepository)
        {
            this.clientSettingRepository = clientSettingRepository;
        }
        public async Task AddDefaultSettingEntry(string userId)
        {
            adminSetting = await clientSettingRepository.GetClientSettingsAsync();
            if (adminSetting == null)
            {
                adminSetting = new AdminSettings()
                {
                    CreatedBy = userId,
                    CreatedOn = DateTime.Now,
                    UpdatedBy = userId,
                    UpdatedOn = DateTime.Now
                };
                adminSetting.Id = await clientSettingRepository.InsertAsync(adminSetting);
            }
        }

        public async Task<bool> SaveClientLogo(IFormFile file, string userId)
        {
            await AddDefaultSettingEntry(userId);

            using var memoryStream = new MemoryStream();
            await file.CopyToAsync(memoryStream);
            var fileBytes = memoryStream.ToArray();
            var base64Image = Convert.ToBase64String(fileBytes);
            var mimeType = file.ContentType;
            var base64ImageWithMime = $"data:{mimeType};base64,{base64Image}";
            var update = Builders<AdminSettings>.Update
                .Set(c => c.Logo, base64ImageWithMime)
                .Set(c => c.UpdatedBy, userId)
                .Set(c => c.UpdatedOn, DateTime.Now);
            var data = await clientSettingRepository.UpdateFieldsAsync(adminSetting.Id, update);
            return await Task.FromResult(data);
        }
        public async Task<string?> GetClientLogo(string userId)
        {
            await AddDefaultSettingEntry(userId);
            return await Task.FromResult(adminSetting.Logo);
        }

        public async Task<bool> SaveClientSMTPSettings(SmtpSettings smtpSettings, string userId)
        {
            await AddDefaultSettingEntry(userId);

            var update = Builders<AdminSettings>.Update
                .Set(c => c.SmtpSettings, smtpSettings)
                .Set(c => c.UpdatedBy, userId)
                .Set(c => c.UpdatedOn, DateTime.Now);
            var data = await clientSettingRepository.UpdateFieldsAsync(adminSetting.Id, update);
            return await Task.FromResult(data);
        }
    }
}
