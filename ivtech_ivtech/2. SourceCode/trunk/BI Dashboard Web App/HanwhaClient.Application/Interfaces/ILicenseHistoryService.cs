using HanwhaClient.Model.DbEntities;

namespace HanwhaClient.Application.Interfaces
{
    public interface ILicenseHistoryService
    {
        Task<string> SaveLicenseHistoryAsync(string userId);
        Task<(IEnumerable<LicenseHistory> data, Dictionary<string, object> referenceData)> GetLicenseHistoryAsync();
    }
}
