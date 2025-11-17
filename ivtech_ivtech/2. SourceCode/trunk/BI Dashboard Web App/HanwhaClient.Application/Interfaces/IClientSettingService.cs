using HanwhaClient.Model.DbEntities;
using Microsoft.AspNetCore.Http;

namespace HanwhaClient.Application.Interfaces
{
    public interface IClientSettingService
    {
        Task<bool> SaveClientLogo(IFormFile file, string userId);
        Task<string?> GetClientLogo(string userId);
        Task<bool> SaveClientSMTPSettings(SmtpSettings smtpSettings, string userId);
        Task<bool> SaveClientOperationalTiming(ClientOperationalTimingRequest clientOperationalTiming, string userId);
        Task<bool> SaveClientOperationalTimeZone(ClientOperationalTimeZoneRequest clientOperationalTiming, string userId);
        Task<bool> SaveGoogleApiKeyAsync(GoogleApiKeyRequest googleApiKeyRequest, string userId);
        Task<bool> SaveFTPConfigurationAsync(FtpConfigurationRequest ftpConfigurationRequest, string userId);
        Task<bool> UploadSSLCertificate(string fileName, string userId);
        Task<bool> TurnReportScheduleAsync(TurnReportSchedule turnReportSchedule, string userId);
        Task<bool> AddUpdateReportScheduleAsync(ReportScheduleRequest reportScheduleRequest, string userId);
        Task<ClientSettings> GetClientSetting();
        Task<byte[]> GenerateChartReportPdf();
    }
}
