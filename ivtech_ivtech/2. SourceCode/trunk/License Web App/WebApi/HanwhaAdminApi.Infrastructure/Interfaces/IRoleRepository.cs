using HanwhaAdminApi.Model.DbEntities;

namespace HanwhaAdminApi.Infrastructure.Interfaces
{
    public interface IRoleRepository : IRepositoryBase<RoleMaster>
    {
        Task<bool> IsRoleNameExistAsync(string rolename, string roleId = null);
        Task<string> GetRoleIdByRoleName(string roleName);
        Task<IEnumerable<RoleMaster>> GetAllRolesAsync();
    }
}
