using HanwhaAdminApi.Model.DbEntities;
using HanwhaAdminApi.Model.License;
using Microsoft.AspNetCore.Http;


namespace HanwhaAdminApi.Application.Interfaces
{
    public interface ILicenseService
    {
        Task<(bool isSuccess, string ErrorMessage)> GenerateLicense(LicenseRequestModel licenseRequest, string userId);
        Task Uploadfile(IFormFile file, string directoryName, string? fileName = null);
        Task<(IEnumerable<LicenseRequest> data, Dictionary<string, object> referenceData)> GetLicenseByClientId(string customerId);
        Task<bool> ResendLicense(string licenseId);
        Task<(byte[] licenseFileData, string errorMessage)> DownloadLicense(string licenseRequestId);
        Task<(byte[] publicFileData, string errorMessage)> DownloadPublicKeyData(string licenseRequestId);

    }
}
