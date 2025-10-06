using DocumentFormat.OpenXml.InkML;
using DocumentFormat.OpenXml.Office2010.Excel;
using DocumentFormat.OpenXml.Spreadsheet;
using HanwhaClient.Application.Interfaces;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Infrastructure.Repository;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.Dto;
using MongoDB.Bson;
using MongoDB.Driver;

namespace HanwhaClient.Application.Services
{
    public class ZoneService : IZoneService
    {
        private readonly IZoneRepository _zoneRepository;
        private readonly IFloorRepository _floorRepository;
        private readonly IZoneCameraRepository _zoneCameraRepository;
        private readonly IDeviceMasterRepository _deviceMasterRepository;
        private readonly IRoleScreenMappingRepository _roleScreenMappingRepository;
        private readonly IRoleService _roleService;
        private readonly ICacheService _cacheService;

        public ZoneService(IZoneRepository zoneRepository, IFloorRepository floorRepository, IZoneCameraRepository cameraRepository,
            IDeviceMasterRepository deviceMasterRepository, IRoleScreenMappingRepository roleScreenMappingRepository, IRoleService roleService, ICacheService cacheService)
        {
            this._zoneRepository = zoneRepository;
            this._floorRepository = floorRepository;
            this._zoneCameraRepository = cameraRepository;
            this._deviceMasterRepository = deviceMasterRepository;
            _roleScreenMappingRepository = roleScreenMappingRepository;
            _roleService = roleService;
            _cacheService = cacheService;
        }

        public async Task<(string id, string errorMessage)> AddUpdateZone(ZoneRequestDto zoneRequestDto, string userId)
        {
            TimeSpan.TryParse(zoneRequestDto.ResetAt, out var resetTime);

            var roleResult = await _roleService.GetRolePermissionAsync();
            string roleId = "";
            if (roleResult != null)
            {
                var roleExits = roleResult.Where(x => x.Name.ToLower() == "super admin").FirstOrDefault();
                if (roleExits != null)
                {
                    roleId = roleExits.Id;
                }
            }

            var resetAtDateTime = DateTime.UtcNow.Date.Add(resetTime);
            var isDuplicateName = await _zoneRepository.CheckZoneExistbyName(zoneRequestDto.Name, zoneRequestDto.FloorId, zoneRequestDto.Id);
            if (isDuplicateName)
            {
                return ("", AppMessageConstants.DuplicateZoneName);
            }

            if (string.IsNullOrEmpty(zoneRequestDto.Id))
            {

                var peopleCount = new ZoneMaster
                {
                    CreatedBy = userId,
                    UpdatedBy = userId,
                    CreatedOn = DateTime.UtcNow,
                    UpdatedOn = DateTime.UtcNow,
                    FloorId = zoneRequestDto.FloorId,
                    ZoneName = zoneRequestDto.Name,
                    PeopleOccupancy = zoneRequestDto.PeopleOccupancy,
                    PeopleDefaultOccupancy = zoneRequestDto.PeopleDefaultOccupancy,
                    VehicleOccupancy = zoneRequestDto.VehicleOccupancy,
                    VehicleDefaultOccupancy = zoneRequestDto.VehicleDefaultOccupancy,
                    ResetAt = resetAtDateTime,
                };
                var zoneId = await _zoneRepository.InsertAsync(peopleCount);

                if (!string.IsNullOrEmpty(roleId) && !string.IsNullOrEmpty(zoneId))
                {
                    var resultRoleScreen = await _roleScreenMappingRepository.GetRoleScreenMappingAsync(roleId);

                    if (resultRoleScreen != null)
                    {
                        var childUpdate = Builders<RoleScreenMapping>.Update
                            .AddToSet("dataAccessPermissions.$[elem].zoneIds", zoneId);

                        var updateResult = await _roleScreenMappingRepository.UpdateFieldsAsync(
                            resultRoleScreen.Id ?? "",
                            childUpdate,
                            new UpdateOptions
                            {
                                ArrayFilters = new[]
                                {
                    new BsonDocumentArrayFilterDefinition<BsonDocument>(
                        new BsonDocument("elem.floorId", new ObjectId(zoneRequestDto.FloorId)))                                }
                            });
                    }
                }



                return (zoneId, "");
            }
            else
            {
                var update = Builders<ZoneMaster>.Update
                    .Set(c => c.FloorId, zoneRequestDto.FloorId)
                    .Set(c => c.ZoneName, zoneRequestDto.Name)
                    .Set(c => c.PeopleOccupancy, zoneRequestDto.PeopleOccupancy)
                    .Set(c => c.PeopleDefaultOccupancy, zoneRequestDto.PeopleDefaultOccupancy)
                    .Set(c => c.VehicleOccupancy, zoneRequestDto.VehicleOccupancy)
                    .Set(c => c.VehicleDefaultOccupancy, zoneRequestDto.VehicleDefaultOccupancy)
                    .Set(c => c.ResetAt, resetAtDateTime)
                    .Set(c => c.UpdatedBy, userId)
                    .Set(c => c.UpdatedOn, DateTime.UtcNow);

                await _zoneRepository.UpdateFieldsAsync(zoneRequestDto.Id, update);
                return await Task.FromResult((zoneRequestDto.Id, ""));
            }
        }

        public async Task<bool> DeleteZoneAsync(string id, string userId)
        {
            if (string.IsNullOrEmpty(id))
            {
                throw new KeyNotFoundException($"Zone ID should not be null or empty");
            }
            var zoneCamera = await _zoneCameraRepository.GetCamerasByZoneId(id);
            if (zoneCamera != null && zoneCamera.Count() > 0)
            {
                foreach (var camera in zoneCamera)
                {
                    await _deviceMasterRepository.UpdateIsFullyMappedDevice(camera.DeviceId, true);
                }

                await _zoneCameraRepository.SoftDeleteManyAsync(zoneCamera.Select(x => x.Id).ToList(), userId);
            }

            var result = await _zoneRepository.SoftDeleteAsync(id, userId);
            await _cacheService.RemoveAsync(CacheConstants.DeviceWithoutZone);
            return result;
        }

        public async Task<IEnumerable<ZoneResponseDto>> GetZoneByFloorIdAsync(string floorId)
        {
            // Fetch zone data from the database
            var zoneEntities = await _zoneRepository.GetZonesByFloorIdAsync(floorId);
            var zoneIds = zoneEntities.Select(x => x.Id).ToList();
            var zoneMappedDevice = await _zoneCameraRepository.GetZoneMappedDevices(zoneIds);
            var deviceIds = zoneMappedDevice.Select(x => x.DeviceId).ToList();
            var DeviceDetails = await _deviceMasterRepository.GetManyAsync(deviceIds);

            // Prepare the response DTO
            var zoneDtos = zoneEntities.Select(zone => new ZoneResponseDto
            {
                Id = zone.Id,
                Name = zone.ZoneName,
                FloorId = floorId,
                ZoneArea = zone.ZoneArea?.Select(area => new XyPosition
                {
                    X = area.X,
                    Y = area.Y
                }).ToList(),
                PeopleOccupancy = zone.PeopleOccupancy,
                VehicleOccupancy = zone.VehicleOccupancy,
                PeopleDefaultOccupancy = zone.PeopleDefaultOccupancy,
                VehicleDefaultOccupancy = zone.VehicleDefaultOccupancy,
                ResetAt = zone.ResetAt.ToString(), // Assuming it's already in the correct format
                MappedDevices = zoneMappedDevice.Where(x => x.ZoneId == zone.Id).Select(x => new MappedDevices
                {
                    DeviceId = x.DeviceId,
                    DeviceName = DeviceDetails.FirstOrDefault(dd => dd.Id == x.DeviceId)?.DeviceName ?? null,
                    IpAddress = DeviceDetails.FirstOrDefault(dd => dd.Id == x.DeviceId)?.IpAddress ?? null,
                    Channel = x.Channel,
                    DeviceType = DeviceDetails.FirstOrDefault(dd => dd.Id == x.DeviceId)?.DeviceType ?? null,
                    fovcolor = x.FOVColor,
                    fovlength = (int)x.FOVLength,
                    isSphere = x.IsSphere,
                    peopleLineIndex = x.PeopleLineIndex,
                    vehicleLineIndex = x.VehicleLineIndex,
                    ZoneCameraId = x.Id,
                    position = x.Position != null ? new DPosition
                    {
                        x = x.Position.X,
                        y = x.Position.Y,
                        angle = x.Position.Angle ?? 0
                    } : null,
                    PeopleLines = DeviceDetails.Where(d => d.Id == x.DeviceId).SelectMany(d => d.PeopleCount ?? Enumerable.Empty<PeopleCountView>())
                                  .SelectMany(p => p.Lines ?? Enumerable.Empty<Lines>()).ToList(),
                    VehicleLines = DeviceDetails.Where(d => d.Id == x.DeviceId).SelectMany(d => d.VehicleCount ?? Enumerable.Empty<VehicleCountConfiguration>())
                                  .SelectMany(p => p.Lines ?? Enumerable.Empty<Lines>()).ToList(),
                }).ToList()

            }).ToList();

            return zoneDtos;
        }

        public async Task<(bool isSuccess, string ErrorMessage)> AddZonePlanDetailAsync(AddZonePlanRequest zonePlanDetails, string userId)
        {

            var th = await _zoneRepository.GetAsync(zonePlanDetails.ZoneId);
            if (!string.IsNullOrEmpty(zonePlanDetails.ZoneId))
            {
                var update = Builders<ZoneMaster>.Update
                    .Set(c => c.ZoneArea, zonePlanDetails.ZoneArea)
                    .Set(c => c.UpdatedBy, userId)
                    .Set(c => c.UpdatedOn, DateTime.UtcNow);
                var result = await _zoneRepository.UpdateFieldsAsync(zonePlanDetails.ZoneId, update);
                if (!result)
                {
                    return (false, "issue in update zone area.");
                }
            }

            var res = await AddUpdateZoneDeviceData(zonePlanDetails, userId);
            if (!res.isSuccess)
                return res;

            await _cacheService.RemoveAsync(CacheConstants.DeviceWithoutZone);
            return (true, string.Empty);
        }

        private async Task<(bool isSuccess, string ErrorMessage)> AddUpdateZoneDeviceData(AddZonePlanRequest zonePlanDetails, string userId)
        {
            if (zonePlanDetails.Devices?.Count() > 0)
            {
                List<string> errorInDeviceId = new List<string>();
                foreach (var item in zonePlanDetails.Devices)
                {
                    if (!string.IsNullOrEmpty(item.ZoneCameraId))
                    {
                        var data = await _zoneCameraRepository.UpdateZoneDeviceByZoneCameraIdAsync(item, userId);
                        if (!data)
                        {
                            errorInDeviceId.Add(item.DeviceId);
                        }
                    }
                    else
                    {
                        ZoneCamera zoneCamera = new ZoneCamera
                        {
                            DeviceId = item.DeviceId,
                            ZoneId = zonePlanDetails.ZoneId,
                            FloorId = zonePlanDetails.floorId,
                            Position = new DevicePosition
                            {
                                X = item.position.x,
                                Y = item.position.y,
                                Angle = item.position.angle
                            },
                            FOVLength = item.fovlength,
                            FOVColor = item.fovcolor,
                            PeopleLineIndex = item.peopleLineIndex,
                            VehicleLineIndex = item.vehicleLineIndex,
                            Channel = item.Channel,
                            IsSphere = item.isSphere,
                            CreatedBy = userId,
                            UpdatedBy = userId,
                            CreatedOn = DateTime.UtcNow,
                            UpdatedOn = DateTime.UtcNow,
                        };

                        var result = await _zoneCameraRepository.InsertAsync(zoneCamera);

                        if (string.IsNullOrEmpty(result))
                        {
                            errorInDeviceId.Add(item.DeviceId);
                        }
                    }
                    if (errorInDeviceId.Count > 0)
                    {
                        return (false, $"Device `{errorInDeviceId}` not updated");
                    }
                    var deviceDetail = await _deviceMasterRepository.GetAsync(item.DeviceId);
                    bool isFullyMappedDevice = false;
                    if (deviceDetail != null && deviceDetail.APIModel == "SUNAPI")
                    {
                        IEnumerable<int> PeopleLines = deviceDetail.PeopleCount?.SelectMany(x => x.Lines ?? Enumerable.Empty<Lines>()).Where(y => y.Enable).Select(l => l.line).ToList();
                        IEnumerable<int> vehicleLines = deviceDetail.VehicleCount?.SelectMany(x => x.Lines ?? Enumerable.Empty<Lines>()).Where(y => y.Enable).Select(l => l.line).ToList();

                        var zoneCameraDetail = await _zoneCameraRepository.GetZoneCameraDetails([item.DeviceId]);
                        var zonePeopleLineIndex = zoneCameraDetail.Where(z => z.PeopleLineIndex != null).SelectMany(z => z.PeopleLineIndex).ToList();
                        var zoneVehicleLineIndex = zoneCameraDetail.Where(z => z.VehicleLineIndex != null).SelectMany(z => z.VehicleLineIndex).ToList();

                        if (PeopleLines.All(x => zonePeopleLineIndex.Contains(x)) && vehicleLines.All(x => zoneVehicleLineIndex.Contains(x)))
                        {
                            isFullyMappedDevice = true;
                        }
                    }
                    else if (deviceDetail != null && deviceDetail.APIModel == "WiseAI")
                    {
                        var zoneCameraDetail = await _zoneCameraRepository.GetZoneCameraDetails([item.DeviceId]);
                        if (zoneCameraDetail != null && zoneCameraDetail.Count() > 0)
                        {
                            isFullyMappedDevice = true;
                            foreach (var channelDetail in deviceDetail.ObjectCountingConfiguration)
                            {
                                IEnumerable<int> PeopleLines = channelDetail.CountingRules?
                                .Where(cr => cr.ObjectType == "Person").SelectMany(cl => cl.Lines.Select(l => l.Index)).ToList();

                                IEnumerable<int> vehicleLines = channelDetail.CountingRules?
                                .Where(cr => cr.ObjectType == "Vehicle").SelectMany(cl => cl.Lines.Select(l => l.Index)).ToList();

                                var zonePeopleLineIndex = zoneCameraDetail.Where(z => z.PeopleLineIndex != null && z.Channel == channelDetail.Channel)
                                                            .SelectMany(z => z.PeopleLineIndex).ToList();
                                var zoneVehicleLineIndex = zoneCameraDetail.Where(z => z.VehicleLineIndex != null && z.Channel == channelDetail.Channel)
                                                            .SelectMany(z => z.VehicleLineIndex).ToList();

                                if (!PeopleLines.All(x => zonePeopleLineIndex.Contains(x)) || !vehicleLines.All(x => zoneVehicleLineIndex.Contains(x)))
                                {
                                    isFullyMappedDevice = false;
                                }
                            }
                        }
                    }

                    await _deviceMasterRepository.UpdateIsFullyMappedDevice(item.DeviceId, !isFullyMappedDevice);



                    //IEnumerable<int> PeopleLines = item.DeviceType == "AIB" ? deviceDetail.ObjectCountingConfiguration?.Where(od => od.Channel == item.Channel).FirstOrDefault().CountingRules?.
                    //                               Where(cr => cr.ObjectType == "Person").SelectMany(cl => cl.Lines.Select(l => l.Index)).ToList() :
                    //                               deviceDetail.PeopleCount?.SelectMany(x => x.Lines ?? Enumerable.Empty<Lines>()).Select(l => l.line).ToList();

                    //IEnumerable<int> vehicleLines = item.DeviceType == "AIB" ? deviceDetail.ObjectCountingConfiguration?.Where(od => od.Channel == item.Channel).FirstOrDefault().CountingRules?.
                    //                                Where(cr => cr.ObjectType == "Vehicle").SelectMany(cl => cl.Lines.Select(l => l.Index)).ToList() :
                    //                                deviceDetail.VehicleCount?.SelectMany(x => x.Lines ?? Enumerable.Empty<Lines>()).Select(l => l.line).ToList();





                }
            }
            return (true, string.Empty);
        }

        public async Task<bool> DeleteZoneMappedDeviceAsync(string zoneCameraId, string userId)
        {
            var zoneCameraDetail = await _zoneCameraRepository.GetAsync(zoneCameraId);
            if (!string.IsNullOrEmpty(zoneCameraId) && zoneCameraDetail != null)
            {
                var result = await _zoneCameraRepository.SoftDeleteAsync(zoneCameraId, userId);
                if (result)
                {
                    await _deviceMasterRepository.UpdateIsFullyMappedDevice(zoneCameraDetail.DeviceId, true);
                }
                await _cacheService.RemoveAsync(CacheConstants.DeviceWithoutZone);
                return result;
            }
            return false;
        }

        public async Task<ZoneResDto> GetZoneByZoneIdAsync(string zoneId)
        {
            var zoneEntity = await _zoneRepository.GetAsync(zoneId);

            if (zoneEntity == null)
            {
                return null; // Or throw an exception depending on your error handling strategy
            }

            var responseDto = new ZoneResDto
            {
                ZoneId = zoneEntity.Id,
                ZoneName = zoneEntity.ZoneName
            };

            return responseDto;
        }

    }
}