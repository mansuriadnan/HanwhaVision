using HanwhaAdminApi.Model.DbEntities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaAdminApi.Infrastructure.Interfaces
{
    public interface IUsersRepository : IRepositoryBase<UserMaster>
    {
        Task<UserMaster> GetUserByUsernameAsync(string username);
        Task<bool> IsUsernameExistAsync(string username, string userId = null);
        Task<bool> IsRoleExistAsync(string roleId);
        Task<bool> IsEmailnameExistAsync(string username, string userId = null);
        Task<UserMaster> GetUserByEmailAsync(string email);
        Task UpdatePasswordAsync(string userId, string newPasswordHash);
        Task<UserMaster> GetUserByUserIdAsync(string userId);
        Task<IEnumerable<UserMaster>> GetAllUserAsync();
        Task<Dictionary<string, long>> GetUserCountForDashboard(DateTime? startDate, DateTime? endDate);

    }
}
