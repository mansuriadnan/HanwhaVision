using HanwhaAdminApi.Model.DbEntities;

namespace HanwhaAdminApi.Infrastructure.Interfaces
{
    public interface ICustomerMasterRepository : IRepositoryBase<CustomerMaster>
    {
        Task<Dictionary<string, long>> GetCustomerCountForDashboard(DateTime? startDate, DateTime? endDate);
        Task<string> GetLatestCustomerIdAsync();
        Task<bool> IsEmailnameExistAsync(string emailId,string customerRequestId = "");
        Task<bool> IsCustomerNameExistAsync(string username, string customerRequestId = "");
        Task<bool> IsDistributorExistAsync(string distributorId);

    }
}
