using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.Dto;
using HanwhaClient.Model.Role;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Application.Interfaces
{
    public interface IRoleScreenMappingService
    {
        Task<IEnumerable<RoleScreenMapping>> GetRoleScreenMappings();
        Task<(IEnumerable<ScreenMaster> data, Dictionary<string, object> referenceData)> GetRoleScreenMappingsByRoleIdAsync(string roleId);
        Task<string> AddUpdateRoleScreenMapping(List<RoleScreenMappingRequestDto> obj, string userId);
        Task<IEnumerable<DataAccessPermissionResponseModel>> GetFloorRoleScreenMappingsByRoleIdAsync(string roleId);
        Task<string> UpdateFloorRoleScreenMappingAsync(SaveFloorRoleMappingRequest floorRoleScreenMapping, string userId);
        Task<IEnumerable<WidgetAccessPermissionResponse>> GetWidgetsByRoleIdAsync(string roleId);
        Task<string> UpdateWidgetRoleScreenMappingAsync(SaveWidgetAccessPermissionRequest widgetRoleScreenMapping, string userId);
    }
}
