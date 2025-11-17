using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.Dto;
using HanwhaClient.Model.Role;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Application.Interfaces
{
    public interface IRoleService
    {
        Task<IEnumerable<RoleMaster>> GetRolesAsync();
        Task<(string RoleId, string ErrorMessage)> SaveRoleAsync(RoleRequestModel role, string userId);
        Task<int> DeleteRoleAsync(string id, string userId);
        Task<IEnumerable<RolePermissionResponseModel>> GetRolePermissionAsync();
        //Task<IEnumerable<UserRolePermissionResponseDto>> GetUserRolePermission(List<string> RoleName);
        Task<IEnumerable<RolePermissionResponseModel>> GetRoleByIdAsync(List<string> roleIds);
        Task<UserRolePermissionResponseDto> GetUserRolePermission(List<string> RoleName);
        Task<IEnumerable<RoleMaster>> GetRolesForPermissionAsync();

    }
}
