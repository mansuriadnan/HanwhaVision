using HanwhaClient.Model.DbEntities;

namespace HanwhaClient.Infrastructure.Interfaces
{
    public interface IDashboardPreferenceRepository : IRepositoryBase<DashboardPreference>
    {
        Task<bool> IsDashboardNameExistsAsync(string userId, string dashBoardName);
        Task<IEnumerable<DashboardPreference>> GetDashboardPreferenceByUserIdAsync(string userId);
        Task<string> GetDashboardForAlexaByName(string dashboardName);

    }
}
