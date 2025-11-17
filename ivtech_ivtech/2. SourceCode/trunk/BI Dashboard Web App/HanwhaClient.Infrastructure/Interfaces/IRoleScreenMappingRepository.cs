using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.Dto;
using HanwhaClient.Model.Role;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Infrastructure.Interfaces
{
    public interface IRoleScreenMappingRepository : IRepositoryBase<RoleScreenMapping>
    {
        Task<RoleScreenMapping> GetRoleScreenMappingAsync(string roleId);
        Task<IEnumerable<RoleScreenMapping>> GetMultipleRoleScreenMappingAsync(IEnumerable<string> roleId);
        Task<long> SaveRoleScreenMappingAsync(string roleId, IEnumerable<ScreenMapping> obj, string userId);
        Task<long> DeleteRoleScreenMappingByRoleIdAsync(string roleId, string userId);
        Task<long> UpdateFloorRoleScreenMappingAsync(SaveFloorRoleMappingRequest floorRoleScreenMappingRequest, string userId);
        Task<long> UpdateWidgetRoleScreenMappingAsync(SaveWidgetAccessPermissionRequest widgetRoleScreenMappingRequest, string userId);
    }
}
