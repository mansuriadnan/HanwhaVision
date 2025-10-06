using HanwhaClient.Application.Interfaces;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Infrastructure.Repository;
using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.Dto;
using HanwhaClient.Model.Role;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Data;

namespace HanwhaClient.Application.Services
{
    public class RoleService : IRoleService
    {
        private readonly IRoleRepository _roleRepository;
        private readonly IUsersRepository _usersRepository;
        private readonly IPermissionRepository _permissionRepository;
        private readonly IRoleScreenMappingRepository _roleScreenMappingRepository;
        private readonly IScreenMasterRepository _screenMasterRepository;
        private readonly IWidgetRepository _widgetRepository;
        private readonly ICacheService _cacheService;
        private readonly string _cacheKey = "RoleKey";
        private static readonly TimeSpan _CacheExpiration = TimeSpan.FromMinutes(10);

        public RoleService(IRoleRepository roleRepository,
            IPermissionRepository permissionRepository,
            IRoleScreenMappingRepository roleScreenMappingRepository,
            IScreenMasterRepository screenMasterRepository,
            ICacheService redisCacheService,
            IUsersRepository usersRepository
,
            IWidgetRepository widgetRepository)
        {
            this._roleRepository = roleRepository;
            this._permissionRepository = permissionRepository;
            this._roleScreenMappingRepository = roleScreenMappingRepository;
            this._screenMasterRepository = screenMasterRepository;
            this._cacheService = redisCacheService;
            this._usersRepository = usersRepository;
            _widgetRepository = widgetRepository;
        }

        public async Task<(string RoleId, string ErrorMessage)> SaveRoleAsync(RoleRequestModel role, string userId)
        {
            //permissionRepository.Insert(new Permission { Name = "User management" });
            //permissionRepository.Insert(new Permission { Name = "change password" });
            //permissionRepository.Insert(new Permission { Name = "role mamagement" });

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
                    CreatedOn = DateTime.UtcNow,
                    CreatedBy = userId,
                    UpdatedOn = DateTime.UtcNow,
                    UpdatedBy = userId,

                });

                if (result != null)
                {
                    await _cacheService.RemoveAsync(_cacheKey);
                }

                return await Task.FromResult((result, string.Empty));
            }
            else
            {
                var update = Builders<RoleMaster>.Update
                    .Set(c => c.RoleName, role.RoleName)
                    .Set(c => c.Description, role.Description)
                    .Set(c => c.UpdatedOn, DateTime.UtcNow)
                    .Set(c => c.UpdatedBy, userId);
                await _roleRepository.UpdateFieldsAsync(role.Id, update);

                if (update != null)
                {
                    await _cacheService.RemoveAsync(_cacheKey);
                }

                return await Task.FromResult((role.Id, string.Empty));
            }
        }
        public async Task<int> DeleteRoleAsync(string id, string userId)
        {

            var isExits = await _usersRepository.IsRoleExistAsync(id);
            if (!isExits)
            {
                await _roleScreenMappingRepository.DeleteRoleScreenMappingByRoleIdAsync(id, userId);
                var data = await _roleRepository.SoftDeleteAsync(id, userId);
                if (data)
                {
                    await _cacheService.RemoveAsync(_cacheKey);
                    return await Task.FromResult(1);
                }
                return await Task.FromResult(2);
            }
            return 3;
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

        public async Task<IEnumerable<RoleMaster>> GetRolesAsync()
        {
            var result = await _roleRepository.GetAllRoles();
            return await Task.FromResult(result);
        }

        public async Task<IEnumerable<RoleMaster>> GetRolesForPermissionAsync()
        {
            var result = await _roleRepository.GetAllAsync();
            return await Task.FromResult(result);
        }

        public async Task<UserRolePermissionResponseDto> GetUserRolePermission(List<string> roleNames)
        {
            var allScreens = new List<ScreenPermissionDto>();
            var allWidgets = new List<WidgetPermissionDto>();

            foreach (var roleName in roleNames)
            {
                string roleId = await _roleRepository.GetRoleIdByRoleName(roleName);
                var screens = await _screenMasterRepository.GetAllAsync();
                var mappings = await _roleScreenMappingRepository.GetRoleScreenMappingAsync(roleId);
                var widgetCategories = await _widgetRepository.GetAllAsync();

                if (mappings != null)
                {
                    // Screens
                    var screenItems = screens
                        .Where(x => mappings.ScreenMappings.Any(y => y.ScreenId == x.Id && y.AccessAllowed))
                        .Select(x => new ScreenPermissionDto
                        {
                            ScreenName = x.ScreenName,
                            ParentsScreenId = x.ParentsScreenId,
                            IsActive = x.IsActive,
                            Id = x.Id,
                        });

                    allScreens.AddRange(screenItems);

                    // Widgets
                    foreach (var widgetAccess in mappings.WidgetAccessPermissions)
                    {
                        var category = widgetCategories.FirstOrDefault(c => c.Id == widgetAccess.WidgetCategoryId);
                        if (category != null)
                        {
                            var widgets = category.Widgets
                                .Where(w => widgetAccess.WidgetIds.Contains(w.WidgetId))
                                .Select(w => new WidgetPermissionDto
                                {
                                    WidgetId = w.WidgetId,
                                    WidgetName = w.WidgetName
                                });

                            allWidgets.AddRange(widgets);
                        }
                    }
                }
            }

            // Remove duplicates using DistinctBy (if you're using System.Linq with MoreLinq or .NET 6+)
            var distinctScreens = allScreens
                .GroupBy(x => x.Id)
                .Select(g => g.First())
                .ToList();

            var distinctWidgets = allWidgets
                .GroupBy(w => w.WidgetId)
                .Select(g => g.First())
                .ToList();

            return new UserRolePermissionResponseDto
            {
                ScreensPermission = distinctScreens,
                WidgetsPermission = distinctWidgets
            };
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
    }
}
