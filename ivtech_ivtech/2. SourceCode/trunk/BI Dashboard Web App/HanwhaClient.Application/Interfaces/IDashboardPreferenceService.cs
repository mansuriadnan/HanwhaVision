using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.Dto;

namespace HanwhaClient.Application.Interfaces
{
    public interface IDashboardPreferenceService
    {
        Task<(string Id, string ErrorMessage)> SaveDashboardDesignAsync(SaveDashboardDesign DashboardDesign, string UserId);
        Task<IEnumerable<GetDashboardPreferenceResponse>> GetDashboardPreferenceByUserIdAsync(string userId);
        Task<bool> DeleteDashboardAsync(string id, string userId);
        Task<IEnumerable<UserNotificationResponse>> GetUserNotificationAsync(int pageNo, int pageSize);
    }
}
