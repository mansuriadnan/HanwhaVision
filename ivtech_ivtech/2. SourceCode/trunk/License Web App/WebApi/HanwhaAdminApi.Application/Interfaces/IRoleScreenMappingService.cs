using HanwhaAdminApi.Model.DbEntities;
using HanwhaAdminApi.Model.Dto.Role;

namespace HanwhaAdminApi.Application.Interfaces
{
    public interface IRoleScreenMappingService
    {
        Task<IEnumerable<RoleScreenMapping>> GetRoleScreenMappings();
        Task<(IEnumerable<ScreenMaster> data, Dictionary<string, object> referenceData)> GetRoleScreenMappingsByRoleIdAsync(string roleId);
        Task<string> AddUpdateRoleScreenMapping(List<RoleScreenMappingRequestDto> obj, string userId);
    }
}
