using HanwhaAdminApi.Model.Common.ReferenceData;
using HanwhaAdminApi.Model.DbEntities;
using HanwhaAdminApi.Model.Dto;
using HanwhaAdminApi.Model.Dto.Role;

namespace HanwhaAdminApi.Application.Interfaces
{
    public interface IRoleService
    {
        Task<(IEnumerable<RoleMaster> data, Dictionary<string, object> referenceData)> GetRolesAsync();
        Task<(string RoleId, string ErrorMessage)> SaveRoleAsync(RoleRequestModel role, string userId);
        Task<bool> DeleteRoleAsync(string id, string userId);
        Task<string> SaveRolePermissionAsync(SaveRolePermissionRequestModel saveRolePermission, string userId);
        Task<IEnumerable<RolePermissionResponseModel>> GetRolePermissionAsync();
        Task<IEnumerable<UserRolePermissionResponseDto>> GetUserRolePermission(List<string> RoleName);
        Task<IEnumerable<RolePermissionResponseModel>> GetRoleByIdAsync(List<string> roleIds);
        Task<List<OptionModel<string, string>>> GetRoleMasterReferenceDataAsync(IEnumerable<string> ids);
        Task<IEnumerable<RoleMaster>> GetRolesForPermissionAsync();
    }
}
