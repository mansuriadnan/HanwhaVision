using HanwhaAdminApi.Model.DbEntities;

namespace HanwhaAdminApi.Infrastructure.Interfaces
{
    public interface ILicenseRequestRepository : IRepositoryBase<LicenseRequest>
    {
        // Task<string> asdsd(C camera);
        Task<List<LicenseRequest>> GetTopLicense();
        Task<Dictionary<string, long>> GetLicenseCountForDashboard(DateTime? startDate, DateTime? endDate);
        Task<List<LicenseRequest>> GetTopDueLicense();
        Task<List<LicenseRequest>> GetLicenseByCustomerId(string clientId);
        Task<long> DeleteLicenseByCustomerId(string clientId,string userId);
    }
}
