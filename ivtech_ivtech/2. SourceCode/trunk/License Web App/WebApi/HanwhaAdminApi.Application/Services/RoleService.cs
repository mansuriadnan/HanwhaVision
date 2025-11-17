using HanwhaAdminApi.Application.Interfaces;
using HanwhaAdminApi.Infrastructure.Interfaces;
using HanwhaAdminApi.Model.Common.ReferenceData;
using HanwhaAdminApi.Model.DbEntities;
using HanwhaAdminApi.Model.Dto;
using HanwhaAdminApi.Model.Dto.Role;
using Microsoft.Extensions.Caching.Memory;
using MongoDB.Bson;
using MongoDB.Driver;

namespace HanwhaAdminApi.Application.Services
{
    public class RoleService : IRoleService
    {
        private readonly IRoleRepository _roleRepository;
        private readonly IUsersRepository _usersRepository;
        private readonly IPermissionRepository _permissionRepository;
        private readonly IRoleScreenMappingRepository _roleScreenMappingRepository;
        private readonly IScreenMasterRepository _screenMasterRepository;
        private readonly IUsersService _usersService;

        public RoleService(IRoleRepository roleRepository,
            IPermissionRepository permissionRepository,
            IRoleScreenMappingRepository roleScreenMappingRepository,
            IUsersRepository usersRepository,
            IScreenMasterRepository screenMasterRepository,
            IUsersService usersService)
        {
            this._roleRepository = roleRepository;
            this._permissionRepository = permissionRepository;
            this._roleScreenMappingRepository = roleScreenMappingRepository;
            this._usersRepository = usersRepository;
            this._screenMasterRepository = screenMasterRepository;
            this._usersService = usersService;
        }

        public async Task<(string RoleId, string ErrorMessage)> SaveRoleAsync(RoleRequestModel role, string userId)
        {


            var isExist = await _roleRepository.IsRoleNameExistAsync(role.RoleName, role.Id);
            if (isExist)
                return (string.Empty, $"Role name {role.RoleName} already exist.");

            if (role.Id == null)
            {
                var result = await _roleRepository.InsertAsync(new RoleMaster
                {
                    Id = null,
                    RoleName = role.RoleName,
                    Description = role.Description,
                    CreatedOn = DateTime.Now,
                    CreatedBy = userId,
                    UpdatedOn = DateTime.Now,
                    UpdatedBy = userId,

                });
                return await Task.FromResult((result, string.Empty));
            }
            else
            {
                var update = Builders<RoleMaster>.Update
                    .Set(c => c.RoleName, role.RoleName)
                    .Set(c => c.Description, role.Description)
                    .Set(c => c.UpdatedOn, DateTime.Now)
                    .Set(c => c.UpdatedBy, userId);
                await _roleRepository.UpdateFieldsAsync(role.Id, update);
                return await Task.FromResult((role.Id, string.Empty));
            }
        }
        public async Task<bool> DeleteRoleAsync(string id, string userId)
        {
            // Check if the role exists
            var isExits = await _usersRepository.IsRoleExistAsync(id);

            if (!isExits)
            {
                // Delete role screen mappings associated with the role
                var deleteRoleScreen = await _roleScreenMappingRepository.DeleteRoleScreenMappingByRoleIdAsync(id, userId);

                // Soft delete the role
                var deleteRole = await _roleRepository.SoftDeleteAsync(id, userId);
                return await Task.FromResult(deleteRole);
            }

            return false;
        }

        public async Task<string> SaveRolePermissionAsync(SaveRolePermissionRequestModel saveRolePermission, string userId)
        {
            var PermissionIds = saveRolePermission.PermissionIds
            .Where(id => ObjectId.TryParse(id, out _))
            .Select(ObjectId.Parse)
            .ToList();

            var update = Builders<RoleMaster>.Update
                    //.Set(c => c.PermissionIds, PermissionIds)
                    .Set(c => c.UpdatedOn, DateTime.Now)
                    .Set(c => c.UpdatedBy, userId);
            var data = await _roleRepository.UpdateFieldsAsync(saveRolePermission.Id, update);
            return await Task.FromResult(saveRolePermission.Id);
        }

        public async Task<IEnumerable<RolePermissionResponseModel>> GetRolePermissionAsync()
        {
            var roles = await _roleRepository.GetAllAsync();
            var data = roles.Select(r => new RolePermissionResponseModel
            {
                Id = r.Id,
                Name = r.RoleName,
                Description = r.Description
                // Permissions = permissionData.Where(p => r.PermissionIds != null && r.PermissionIds.Contains(ObjectId.Parse(p.Id))).Select(z => new PermissionResponseModel { Id = z.Id, Name = z.Name }).ToList()
            });

            return await Task.FromResult(data);
        }

        public async Task<IEnumerable<RolePermissionResponseModel>> GetRoleByIdAsync(List<string> roleIds)
        {
            var roles = await _roleRepository.GetManyAsync(roleIds);
            var data = roles.Select(r => new RolePermissionResponseModel
            {
                Name = r.RoleName,
            });

            return await Task.FromResult(data);
        }

        public async Task<(IEnumerable<RoleMaster> data, Dictionary<string, object> referenceData)> GetRolesAsync()
        {
            var result = await _roleRepository.GetAllRolesAsync();
            Dictionary<string, object> referenceData = new();

            var updatedByIds = result.Where(x => x.UpdatedBy != null).Select(x => x.UpdatedBy).Distinct().ToList();
            var createdByIds = result.Where(x => x.CreatedBy != null).Select(x => x.CreatedBy).Distinct().ToList();
                        
            referenceData.Add("updatedBy", await _usersService.GetUserMasterReferenceDataAsync(updatedByIds));
            referenceData.Add("createdBy", await _usersService.GetUserMasterReferenceDataAsync(createdByIds));

            return (result, referenceData);
        }

        public async Task<IEnumerable<UserRolePermissionResponseDto>> GetUserRolePermission(List<string> roleNames)
        {
            var allScreens = new List<UserRolePermissionResponseDto>();

            foreach (var roleName in roleNames)
            {
                string roleId = await _roleRepository.GetRoleIdByRoleName(roleName);
                var screens = await _screenMasterRepository.GetAllAsync();
                var mappings = await _roleScreenMappingRepository.GetRoleScreenMappingAsync(roleId);

                if (mappings != null)
                {
                    var data = screens
                        .Where(x => mappings.ScreenMappings.Any(y => y.ScreenId == x.Id && y.AccessAllowed == true))
                        .Select(x => new UserRolePermissionResponseDto
                        {
                            ScreenName = x.ScreenName,
                            ParentsScreenId = x.ParentsScreenId,
                            IsActive = x.IsActive,
                            Id = x.Id,
                        });

                    allScreens.AddRange(data);
                }
            }

            return allScreens.Distinct();
        }

        public async Task<List<OptionModel<string, string>>> GetRoleMasterReferenceDataAsync(IEnumerable<string> ids)
        {
            var options = new List<OptionModel<string, string>>();
            ProjectionDefinition<RoleMaster> projection = Builders<RoleMaster>.Projection
            .Include("roleName")
            .Include("_id");
            var users = await _roleRepository.GetManyAsync(ids, projection);
            options = users.Select(x => new OptionModel<string, string>(x.Id, x.RoleName)).ToList();
            return options;
        }

        public async Task<IEnumerable<RoleMaster>> GetRolesForPermissionAsync()
        {
            var result = await _roleRepository.GetAllAsync();
            return await Task.FromResult(result);
        }
    }
}
