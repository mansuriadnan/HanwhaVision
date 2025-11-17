using HanwhaAdminApi.Model.DbEntities;

namespace HanwhaAdminApi.Infrastructure.Interfaces
{
    public interface IRoleScreenMappingRepository : IRepositoryBase<RoleScreenMapping>
    {
        Task<RoleScreenMapping> GetRoleScreenMappingAsync(string roleId);
        Task<long> SaveRoleScreenMappingAsync(string roleId, IEnumerable<ScreenMapping> obj, string userId);
        Task<long> DeleteRoleScreenMappingByRoleIdAsync(string roleId, string userId);
    }
}
