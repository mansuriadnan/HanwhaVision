using HanwhaAdminApi.Model.DbEntities;
using HanwhaAdminApi.Model.Dto;

namespace HanwhaAdminApi.Application.Interfaces
{
    public interface ICustomerMasterService
    {
        Task<(string Id, string ErrorMessage)> SaveCustomerAsync(CustomerMaster userRequest, string userId);
        Task<CustomerMaster> GetCustomerAsync(string id);
        Task<(IEnumerable<CustomerResponseDto> data, Dictionary<string, object> referenceData)> GetAllCustomerAsync();
        Task<bool> DeleteCustomerByIdAsync(string id, string userId);
        Task<List<CustomerMaster>> GetTopCustomerDetail();
        Task<DashboardOverview> GetDashboardOverviewDetails(DateTime? startDate, DateTime? endDate);
        Task<List<LicenseDueDetail>> GetTopLicenseDueDetails();



    }
}
