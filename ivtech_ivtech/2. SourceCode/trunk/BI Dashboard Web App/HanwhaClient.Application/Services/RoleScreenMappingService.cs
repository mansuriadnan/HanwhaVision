using HanwhaClient.Application.Interfaces;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.Common.ReferenceData;
using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.Dto;
using HanwhaClient.Model.Role;
using MongoDB.Driver;

namespace HanwhaClient.Application.Services
{
    public class RoleScreenMappingService : IRoleScreenMappingService
    {
        private readonly IRoleScreenMappingRepository _roleScreenMappingRepository;
        private readonly IScreenMasterRepository _screenMasterRepository;
        private readonly ICacheService _cacheService;
        private readonly string _cacheKey = "ScreenMasterKey";
        private static readonly TimeSpan _cacheExpiration = TimeSpan.FromMinutes(10);
        private readonly IFloorRepository _floorRepository;
        private readonly IZoneRepository _zoneRepository;
        private readonly IWidgetRepository _widgetRepository;


        public RoleScreenMappingService(IRoleScreenMappingRepository _roleScreenMappingrepository,
            IScreenMasterRepository screenMasterRepository,
            ICacheService cacheService,
            IFloorRepository floorRepository,
            IZoneRepository zoneRepository,
            IWidgetRepository widgetRepository)
        {
            this._roleScreenMappingRepository = _roleScreenMappingrepository;
            this._screenMasterRepository = screenMasterRepository;
            this._cacheService = cacheService;
            this._floorRepository = floorRepository;
            this._zoneRepository = zoneRepository;
            this._widgetRepository = widgetRepository;
        }

        public async Task<IEnumerable<RoleScreenMapping>> GetRoleScreenMappings()
        {
            var data = await _roleScreenMappingRepository.GetAllAsync();
            return data;
        }

        public async Task<(IEnumerable<ScreenMaster> data, Dictionary<string, object> referenceData)> GetRoleScreenMappingsByRoleIdAsync(string roleId)
        {
            // Validate roleId if necessary (e.g., ensure it's not null or empty)
            if (string.IsNullOrEmpty(roleId))
                throw new ArgumentException("Role_Id cannot be null or empty.");

            var screens = new List<ScreenMaster>();

            var cachedRoles = await _cacheService.GetAsync<IEnumerable<ScreenMaster>>(_cacheKey);
            if (cachedRoles != null)
            {
                screens = cachedRoles.ToList();
            }
            else
            {

                var newScreens = await _screenMasterRepository.GetAllAsync();
                screens = newScreens.ToList();
            }

            screens = screens.OrderBy(screen => screen.SequenceNo).ToList();

            Dictionary<string, object> referenceData = new();
            var options = new List<OptionModel<string, bool>>();

            var cachedRoleScreenMapping = await _cacheService.GetAsync<RoleScreenMapping>(_cacheKey + "_" + roleId);
            var mappings = new RoleScreenMapping();
            if (cachedRoleScreenMapping != null)
            {
                mappings = cachedRoleScreenMapping;
            }
            else
            {
                mappings = await _roleScreenMappingRepository.GetRoleScreenMappingAsync(roleId);
                if (mappings != null)
                {
                    await _cacheService.SetAsync(_cacheKey + "_" + roleId, mappings, _cacheExpiration);
                }
            }

            if (mappings != null)
            {
                options = mappings.ScreenMappings.Select(x => new OptionModel<string, bool>(x.ScreenId, x.AccessAllowed)).ToList();
            }
            referenceData.Add("screensMapping", options);
            return (screens, referenceData);
        }

        public async Task<string> AddUpdateRoleScreenMapping(List<RoleScreenMappingRequestDto> objRoleScreenMapping, string userId)
        {
            var roleId = objRoleScreenMapping.Select(x => x.roleId).FirstOrDefault();
            var mapingData = objRoleScreenMapping.Select(x => new ScreenMapping { ScreenId = x.Id, AccessAllowed = x.AccessAllowed });
            var updateCount = await _roleScreenMappingRepository.SaveRoleScreenMappingAsync(roleId, mapingData, userId);
            if (updateCount > 0)
            {
                await _cacheService.RemoveAsync(_cacheKey + "_" + roleId);
                return await Task.FromResult(roleId);
            }
            else
            {
                var newRecord = new RoleScreenMapping
                {
                    RoleId = roleId,
                    ScreenMappings = mapingData,
                    CreatedOn = DateTime.UtcNow,
                    CreatedBy = userId,
                    UpdatedOn = DateTime.UtcNow,
                    UpdatedBy = userId,
                };
                await _roleScreenMappingRepository.InsertAsync(newRecord);
            }
            return await Task.FromResult(objRoleScreenMapping.FirstOrDefault()?.Id);
        }

        public async Task<IEnumerable<DataAccessPermissionResponseModel>> GetFloorRoleScreenMappingsByRoleIdAsync(string roleId)
        {
            var result = new List<DataAccessPermissionResponseModel>();
            ProjectionDefinition<FloorPlanMaster> floorProjection = Builders<FloorPlanMaster>.Projection
            .Include("floorPlanName")
            .Include("_id");
            var allFloors = await _floorRepository.GetAllAsync(floorProjection);
            var roleScreenMappings = await _roleScreenMappingRepository.GetRoleScreenMappingAsync(roleId);
            var floorIds = allFloors.Select(x => x.Id).ToList();
            var allZones = await _zoneRepository.GetZonesByMultipleFloorIdZoneIdAsync(floorIds);

            foreach (var floor in allFloors)
            {
                var zones = allZones.Where(x => x.FloorId == floor.Id).ToList();

                var floorModel = new DataAccessPermissionResponseModel
                {
                    FloorId = floor.Id,
                    FloorPlanName = floor.FloorPlanName,
                    AccessAllowed = roleScreenMappings == null ? false : roleScreenMappings.DataAccessPermissions.Any(p => p.FloorId == floor.Id),
                    Zones = zones.Select(zone => new DataAccessPermissionResponseModel.ZoneResponseModel
                    {
                        ZoneId = zone.Id,
                        ZoneName = zone.ZoneName,
                        AccessAllowed = roleScreenMappings == null ? false : roleScreenMappings.DataAccessPermissions.Any(p => p.ZoneIds.Contains(zone.Id))
                    }).ToList()
                };

                result.Add(floorModel);
            }
            return result;
        }

        public async Task<string> UpdateFloorRoleScreenMappingAsync(SaveFloorRoleMappingRequest floorRoleScreenMapping, string userId)
        {
            var roleDetail = await _roleScreenMappingRepository.GetRoleScreenMappingAsync(floorRoleScreenMapping.RoleId);
            if (roleDetail != null)
            {
                var result = _roleScreenMappingRepository.UpdateFloorRoleScreenMappingAsync(floorRoleScreenMapping, userId);
                return "";
            }
            else
            {
                return AppMessageConstants.RecordNotFound;
            }
        }

        public async Task<IEnumerable<WidgetAccessPermissionResponse>> GetWidgetsByRoleIdAsync(string roleId)
        {
            var roleScreenMappings = await _roleScreenMappingRepository.GetRoleScreenMappingAsync(roleId);
            var result = new List<WidgetAccessPermissionResponse>();
            var widgetCategories = await _widgetRepository.GetAllAsync();
            foreach (var widgetCategory in widgetCategories)
            {
                var widgets = widgetCategory.Widgets.Select(widget => new WidgetAccessPermissionResponse.WidgetItem
                {
                    WidgetId = widget.WidgetId,
                    WidgetName = widget.WidgetName,
                    AccessAllowed = roleScreenMappings == null ? false : roleScreenMappings.WidgetAccessPermissions.Any(p => p.WidgetCategoryId == widgetCategory.Id && p.WidgetIds.Contains(widget.WidgetId))
                }).ToList();

                result.Add(new WidgetAccessPermissionResponse
                {
                    Id = widgetCategory.Id,
                    CategoryName = widgetCategory.CategoryName,
                    AccessAllowed = roleScreenMappings == null ? false : roleScreenMappings.WidgetAccessPermissions.Any(p => p.WidgetCategoryId == widgetCategory.Id),
                    Widgets = widgets
                });
            }
            return result;
        }

        public async Task<string> UpdateWidgetRoleScreenMappingAsync(SaveWidgetAccessPermissionRequest widgetRoleScreenMapping, string userId)
        {
            var roleDetail = await _roleScreenMappingRepository.GetRoleScreenMappingAsync(widgetRoleScreenMapping.RoleId);
            if (roleDetail != null)
            {
                var result = _roleScreenMappingRepository.UpdateWidgetRoleScreenMappingAsync(widgetRoleScreenMapping, userId);
                return "";
            }
            else
            {
                return AppMessageConstants.RecordNotFound;
            }
        }
    }
}