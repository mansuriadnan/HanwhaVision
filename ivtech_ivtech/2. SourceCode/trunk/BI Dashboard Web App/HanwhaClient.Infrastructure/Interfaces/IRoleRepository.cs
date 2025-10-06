using HanwhaClient.Model.DbEntities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Infrastructure.Interfaces
{
    public interface IRoleRepository : IRepositoryBase<RoleMaster>
    {
        Task<bool> IsRoleNameExistAsync(string rolename, string roleId = null);
        Task<string> GetRoleIdByRoleName(string roleName);
        Task<IEnumerable<RoleMaster>> GetAllRoles();
    }
}
