using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.License;
using Microsoft.AspNetCore.Http;

namespace HanwhaClient.Application.Interfaces
{
    public interface ILicenseService
    {
        Task Uploadfile(IFormFile file, string directoryName, string? fileName = null);
        Task UploadTempfile(IFormFile file, string directoryName, string? fileName = null);
        Task<LicenseResponse> GetLicenseDetailAsync(string clientId);
    }
}
