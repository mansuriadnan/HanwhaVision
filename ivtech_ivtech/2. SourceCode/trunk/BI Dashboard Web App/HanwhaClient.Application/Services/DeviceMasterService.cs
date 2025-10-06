using AutoMapper;
using HanwhaClient.Application.Interfaces;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Model.Auth;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.DeviceApiResponse;
using HanwhaClient.Model.Dto;
using HanwhaClient.Model.License;
using MongoDB.Driver;
using System.Net.NetworkInformation;

namespace HanwhaClient.Application.Services
{
    public class DeviceMasterService : IDeviceMasterService
    {
        private readonly IDeviceMasterRepository _deviceMasterRepository;
        private readonly IZoneCameraRepository _zoneCameraRepository;
        private readonly IDeviceApiService _deviceApiService;
        private readonly IMapper _mapper;
        private readonly IFloorRepository _floorRepository;
        private readonly IZoneRepository _zoneRepository;
        private readonly IPermissionService _permissionService;
        private readonly IDeviceEventsRepository _deviceEventRepository;
        private readonly IUserNotificationRepository _userNotificationRepository;
        private readonly IDeviceEventsMonitorJobService _deviceEventsMonitorJobService;
        private readonly IHeatMapRepository _heatMapRepository;
        private readonly ICacheService _cacheService;
        private readonly IFloorService _floorService;

        public DeviceMasterService(IDeviceMasterRepository cameraMasterRepository,
            IZoneCameraRepository zoneCameraRepository,
            IMapper mapper,
            IDeviceApiService deviceApiService,
            IZoneRepository zoneRepository,
            IFloorRepository floorRepository,
            IPermissionService permissionService,
            IDeviceEventsRepository deviceEventRepository,
            IUserNotificationRepository userNotificationRepository,
            IDeviceEventsMonitorJobService deviceEventsMonitorJobService,
            IHeatMapRepository heatMapRepository,
            ICacheService cacheService,
            IFloorService floorService)
        {
            this._deviceMasterRepository = cameraMasterRepository;
            this._zoneCameraRepository = zoneCameraRepository;
            this._mapper = mapper;
            this._deviceApiService = deviceApiService;
            this._zoneRepository = zoneRepository;
            this._floorRepository = floorRepository;
            this._permissionService = permissionService;
            this._deviceEventRepository = deviceEventRepository;
            this._userNotificationRepository = userNotificationRepository;
            this._deviceEventsMonitorJobService = deviceEventsMonitorJobService;
            this._heatMapRepository = heatMapRepository;
            _cacheService = cacheService;
            this._floorService = floorService;
        }

        public async Task<(bool isSuccess, string ErrorMessage)>  AddUpdateDevices(DeviceRequestDto deviceRequestDto, string userId)
        {
            if (deviceRequestDto == null)
                throw new ArgumentNullException(nameof(deviceRequestDto));
            if (string.IsNullOrWhiteSpace(userId))
                throw new ArgumentException("User ID cannot be null or empty", nameof(userId));

            LicenseDataModel licenseData = _permissionService._licenseData;

            if (licenseData != null && !licenseData.IsValid)
            {
                return (false, licenseData.ErrorMessage);
            }

            

            string httpURL = deviceRequestDto.IsHttps ? "https://" : "http://";
            string ipAddress = httpURL + deviceRequestDto.IpAddress + ":" + deviceRequestDto.DevicePort;

            var apiResDeviceInfo = await GetDeviceInfo(deviceRequestDto, ipAddress);
            if (apiResDeviceInfo.deviceInfo == null) return (false, apiResDeviceInfo.ErrorMessage);
            if (!string.IsNullOrEmpty(apiResDeviceInfo.ErrorMessage)) return (false, apiResDeviceInfo.ErrorMessage);

            var deviceMaster = new DeviceMaster
            {
                Id = deviceRequestDto.Id,
                DeviceType = deviceRequestDto.DeviceType,
                DeviceName = deviceRequestDto.DeviceName,
                IpAddress = deviceRequestDto.IpAddress + ":" + deviceRequestDto.DevicePort,
                UserName = deviceRequestDto.UserName,
                Password = deviceRequestDto.Password,
                IsHttps = deviceRequestDto.IsHttps,
                Location = deviceRequestDto.Location,
                Model = apiResDeviceInfo.deviceInfo.Model,
                SerialNumber = apiResDeviceInfo.deviceInfo.SerialNumber,
                MacAddress = apiResDeviceInfo.deviceInfo.ConnectedMACAddress,
                APIModel = DetermineAPIModel(apiResDeviceInfo.deviceInfo.Model)
            };

            bool isDeviceExist = await _deviceMasterRepository.IsDeviceExistsAsync(deviceMaster.IpAddress, deviceRequestDto.Id);
            if (isDeviceExist)
            {
                return (false, AppMessageConstants.DeviceAlreadyExists);
            }

            if (deviceMaster.APIModel != "SUNAPI")
            {
                var channelEvents = await GetChannelEvents(deviceMaster, apiResDeviceInfo.deviceInfo.Model, ipAddress);
                if(!string.IsNullOrEmpty(channelEvents.ErrorMessage)) return (false, channelEvents.ErrorMessage);
                deviceMaster.ChannelEvent = channelEvents.Channels?.ChannelEvent;
                deviceMaster.ObjectCountingConfiguration = channelEvents.ObjectCountingConfigurations;

                var capabilities = await _deviceApiService.CallDeviceApi<CapabilitiesModel>(
                    ipAddress + WiseAPIConstant.ConfigurationCapability,
                    deviceMaster.UserName, deviceMaster.Password);
                if (deviceMaster.DeviceType == "Camera")
                {
                    deviceMaster.ChannelEvent.FirstOrDefault().Connected = true;
                }
                deviceMaster.Features.WiseAI = capabilities.Capabilities;
            }
            else
            {
                var peopleCount = await _deviceApiService.CallDeviceApi<PeopleCountViewModel>(
                    ipAddress + SunapiAPIConstant.PeopleCountView,
                    deviceMaster.UserName, deviceMaster.Password);
                deviceMaster.PeopleCount = peopleCount?.PeopleCount;

                var vehicleCount = await _deviceApiService.CallDeviceApi<VehicleCountViewModel>(
                    ipAddress + SunapiAPIConstant.VehicleCount,
                    deviceMaster.UserName, deviceMaster.Password);
                deviceMaster.VehicleCount = vehicleCount?.VehicleCount;

                var eventSourcesMotion = await _deviceApiService.CallDeviceApi<EventSourcesMotionViewModel>(
                    ipAddress + SunapiAPIConstant.EventSources,
                    deviceMaster.UserName, deviceMaster.Password);
                deviceMaster.Features.Sunapi = eventSourcesMotion?.EventSources;
            }
             
            if (string.IsNullOrEmpty(deviceMaster.Id))
            {
                int CurrentCameraCount = await _deviceMasterRepository.GetCameraCountAsync();
                if (licenseData != null && CurrentCameraCount >= licenseData.NumberOfCameras)
                {
                    return (false, AppMessageConstants.DeviceLimitExceededLicense);
                }

                deviceMaster.IsOnline = true;
                deviceMaster.Id = await InsertNewDevice(deviceMaster, userId);
                //DeviceEventsMonitorJob 
                var zoneId = await _zoneRepository.GetDefalutZonesAsync();
                var floorId = await _floorRepository.GetDefalutFloorAsync();


                if (!string.IsNullOrEmpty(zoneId) && !string.IsNullOrEmpty(floorId))
                {
                    var zoneCameraMaster = new ZoneCamera
                    {
                        ZoneId = zoneId,
                        FloorId = floorId,
                        DeviceId = deviceMaster.Id,
                        CreatedOn = DateTime.UtcNow,
                        UpdatedOn = DateTime.UtcNow,
                        CreatedBy = userId,
                        UpdatedBy = userId
                    };
                    await _zoneCameraRepository.InsertAsync(zoneCameraMaster);
                    _deviceEventsMonitorJobService.StartTaskForDevice(deviceMaster);
                }
            }
            else
            {
                await UpdateExistingDevice(deviceMaster, userId, apiResDeviceInfo.deviceInfo);
                _deviceEventsMonitorJobService.StartTaskForDevice(deviceMaster);
            }
            await _cacheService.RemoveAsync(CacheConstants.DeviceWithoutZone);
            await _cacheService.RemoveAsync(CacheConstants.PeopleDevices);
            await _cacheService.RemoveAsync(CacheConstants.VehicleDevices);
            await _cacheService.RemoveAsync(CacheConstants.ShoppingDevices);
            await _cacheService.RemoveAsync(CacheConstants.ForkLiftDevices);
            await _cacheService.RemoveAsync(CacheConstants.GetAllDevices);
            return (true, "");
        }

        // Get Device Info
        private async Task<(Model.DbEntities.DeviceInfo deviceInfo, string ErrorMessage)> GetDeviceInfo(DeviceRequestDto deviceRequestDto, string ipAddress)
        {
            try
            {
                var data = await _deviceApiService.CallDeviceApi<Model.DbEntities.DeviceInfo>(
                ipAddress + SunapiAPIConstant.DeviceInfo,
                deviceRequestDto.UserName,
                deviceRequestDto.Password);

                return (data, string.Empty);
            }
            catch (Exception ex)
            {
                if (ex.Message.Contains("API call failed: Authentication failed for the requested resource"))
                {
                    return (null, AppMessageConstants.CredetialWrongAddDevice);
                }
                else if(ex.Message.Contains("API call failed: A connection attempt failed because the connected party did not properly respond after a period of time, or established connection failed because connected host has failed to respond."))
                {
                    return (null, AppMessageConstants.DeviceUnavailable);
                }
                return (null, ex.Message);
            }
        }
        //Check API Mode
        public static string DetermineAPIModel(string model)
        {
            if (string.IsNullOrEmpty(model)) return "Other API";

            if (APIPrefixesConstant.WiseAIPrefixes.Any(prefix => model.StartsWith(prefix)))
                return "WiseAI";

            if (APIPrefixesConstant.SunAPIPrefixes.Contains(model[0]))
                return "SUNAPI";

            return "Other API";
        }

        //Get apiChannels and  objectCountingConfigurations API Data
        private async Task<(ChannelEventViewModel Channels, List<ChannelConfiguration> ObjectCountingConfigurations, string ErrorMessage)>
            GetChannelEvents(DeviceMaster deviceRequest, string model, string ipAddress)
        {
            ChannelEventViewModel apiChannels = null;
            try
            {
                apiChannels = await _deviceApiService.CallDeviceApi<ChannelEventViewModel>(
                    ipAddress + SunapiAPIConstant.EventStatus,
                    deviceRequest.UserName,
                    deviceRequest.Password);
            }
            catch (Exception ex)
            {
                return (null, null, "Error message from device : " + ex.Message);
            }

            var objectCountingConfigurations = new List<ChannelConfiguration>();

            if (apiChannels?.ChannelEvent?.Any() == true && (model.StartsWith("AIB") || model.StartsWith("P")))
            {
                foreach (var i in Enumerable.Range(0, apiChannels.ChannelEvent.Count()))
                {
                    ObjectCountingConfigurationEntity config = null;
                    try
                    {
                        config = await _deviceApiService.CallDeviceApi<ObjectCountingConfigurationEntity>(
                            ipAddress + WiseAPIConstant.ChannelWiseAPI.Replace("#channelnumber#", i.ToString()),
                            deviceRequest.UserName,
                            deviceRequest.Password
                        );
                    }
                    catch (Exception ex)
                    {
                        return (null, null, "Error message from device : " + ex.Message);
                    }

                    if (config?.ObjectCountingConfiguration != null)
                    {
                        objectCountingConfigurations.AddRange(config.ObjectCountingConfiguration);
                    }
                }
            }

            return (apiChannels, objectCountingConfigurations, "");

        }

        //Insert New Device Data
        private async Task<string> InsertNewDevice(DeviceMaster deviceRequest, string userId)
        {
            deviceRequest.CreatedBy = userId;
            deviceRequest.CreatedOn = DateTime.UtcNow;
            deviceRequest.UpdatedOn = DateTime.UtcNow;
            deviceRequest.UpdatedBy = userId;
            deviceRequest.isDefaultZone = true;

            return await _deviceMasterRepository.InsertAsync(deviceRequest);
        }

        // Update Existing Device Data
        private async Task UpdateExistingDevice(DeviceMaster deviceRequest, string userId, Model.DbEntities.DeviceInfo apiResDeviceInfo)
        {
            // Ensure lists are properly initialized
            List<ChannelConfiguration> objectCountingConfigurations = deviceRequest?.ObjectCountingConfiguration?.ToList() ?? new List<ChannelConfiguration>();
            ChannelEventViewModel apiChannels = new ChannelEventViewModel { ChannelEvent = deviceRequest?.ChannelEvent?.ToList() ?? new List<ChannelEvent>() };
            PeopleCountViewModel peopleCount = new PeopleCountViewModel { PeopleCount = deviceRequest?.PeopleCount ?? null };
            VehicleCountViewModel vehicleCount = new VehicleCountViewModel { VehicleCount = deviceRequest?.VehicleCount?.ToList() ?? new List<VehicleCountConfiguration>() };

            var currentDevice = await _deviceMasterRepository.GetAsync(deviceRequest.Id);
            if (!currentDevice.isDefaultZone)
            {
                if (currentDevice.APIModel == "SUNAPI")
                {
                    bool isDefualtZone = false;
                    if (deviceRequest.PeopleCount != null && deviceRequest.PeopleCount.Any())
                    {
                        isDefualtZone = deviceRequest.PeopleCount.FirstOrDefault().Lines.Count > currentDevice.PeopleCount.FirstOrDefault().Lines.Count;
                    }
                    if (deviceRequest.VehicleCount != null && deviceRequest.VehicleCount.Any())
                    {
                        isDefualtZone = deviceRequest.VehicleCount.FirstOrDefault().Lines.Count > currentDevice.VehicleCount.FirstOrDefault().Lines.Count;
                    }
                    await _deviceMasterRepository.UpdateIsFullyMappedDevice(deviceRequest.Id, isDefualtZone);
                }
                else if (currentDevice.APIModel == "WiseAI")
                {
                    if (currentDevice.ObjectCountingConfiguration != null && deviceRequest.ObjectCountingConfiguration != null)
                    {
                        bool isDefualtZone = false;
                        var updatedCount = deviceRequest.ObjectCountingConfiguration.SelectMany(channel => channel.CountingRules).Sum(rule => rule.Lines.Count);
                        var currentCount = currentDevice.ObjectCountingConfiguration.SelectMany(channel => channel.CountingRules).Sum(rule => rule.Lines.Count);
                        if (updatedCount > currentCount)
                        {
                            isDefualtZone = true;
                        }
                        await _deviceMasterRepository.UpdateIsFullyMappedDevice(deviceRequest.Id, isDefualtZone);
                    }
                }
            }

            // Create an update definition
            var update = Builders<DeviceMaster>.Update
            .Set(c => c.DeviceType, deviceRequest?.DeviceType)
            .Set(c => c.DeviceName, deviceRequest.DeviceName)
            .Set(c => c.IpAddress, deviceRequest.IpAddress)
            .Set(c => c.UserName, deviceRequest.UserName) 
            .Set(c => c.Password, deviceRequest.Password)
            .Set(c => c.IsHttps, deviceRequest.IsHttps)
            .Set(c => c.Location, deviceRequest.Location)
            .Set(c => c.Model, apiResDeviceInfo?.Model)
            .Set(c => c.SerialNumber, apiResDeviceInfo?.SerialNumber)
            .Set(c => c.MacAddress, apiResDeviceInfo?.ConnectedMACAddress)
            .Set(c => c.APIModel, deviceRequest.APIModel)
            .Set(c => c.UpdatedBy, userId)
            .Set(c => c.UpdatedOn, DateTime.UtcNow);

            // Conditionally add optional fields
            if (deviceRequest?.ChannelEvent != null)
                update = update.Set(c => c.ChannelEvent, apiChannels.ChannelEvent);

            if (deviceRequest?.PeopleCount != null)
                update = update.Set(c => c.PeopleCount, peopleCount.PeopleCount);

            if (deviceRequest?.VehicleCount != null)
                update = update.Set(c => c.VehicleCount, vehicleCount.VehicleCount);

            if (deviceRequest?.ObjectCountingConfiguration != null)
                update = update.Set(c => c.ObjectCountingConfiguration, objectCountingConfigurations);

            if (deviceRequest?.Features != null && deviceRequest?.Features.Sunapi != null)
                update = update.Set(c => c.Features.Sunapi, deviceRequest?.Features.Sunapi);

            if (deviceRequest?.Features != null && deviceRequest?.Features.WiseAI != null)
                update = update.Set(c => c.Features.WiseAI, deviceRequest?.Features.WiseAI);

            // Execute update in repository
            await _deviceMasterRepository.UpdateFieldsAsync(deviceRequest.Id, update);
        }

        public async Task<DeviceResponse> GetAllDevicesByFilterAsync(DeviceRequest deviceRequest)
        {
            var zoneDetails = await _zoneRepository.GetZoneIdByNameAsync(deviceRequest.SearchText);
            if (zoneDetails.Any())
            {
                var matchingZoneIds = zoneDetails
                    .Select(z => z.Id)
                    .ToList();

                var matchedZoneCameras = await _zoneCameraRepository.GetCamerasByZoneIds(matchingZoneIds);

                var matchingDeviceIds = matchedZoneCameras
                    .Where(zc => matchingZoneIds.Contains(zc.ZoneId))
                    .Select(zc => zc.DeviceId)
                    .Distinct()
                    .ToList();

                deviceRequest.ZonesDeviceIds = matchingDeviceIds;
            }

            // Pass this to repository to filter at DB level
            

            var deviceDetail = await _deviceMasterRepository.GetAllDevicesByFilterAsync(deviceRequest);

            if (deviceRequest.DeviceIds != null && deviceRequest.DeviceIds.Count > 0)
            {
                foreach (var deviceId in deviceRequest.DeviceIds)
                {
                    var device = deviceDetail.deviceDetails.FirstOrDefault(d => d.Id == deviceId);
                    if (device != null)
                    {
                        var hostUrl = device.IpAddress.Contains(':') ? device.IpAddress.Split(":")[0] : device.IpAddress;
                        Ping ping = new Ping();
                        PingReply result = ping.Send(hostUrl);
                        device.IsOnline = result.Status == IPStatus.Success;
                        await ChangeDeviceStatusAsync(device.Id, device.IsOnline);
                    }
                }
            }
            var zoneCameras = await _zoneCameraRepository.GetZoneCameraDetails(deviceDetail.deviceDetails.Select(x=>x.Id).ToList());

            var zoneIds = zoneCameras.Select(zc => zc.ZoneId).Distinct().ToList();

            var zones = await _zoneRepository.GetZonesByIdsAsync(zoneIds);

            var zoneMap = zones.ToDictionary(z => z.Id, z => z.ZoneName);

            DeviceResponse deviceResponse = new DeviceResponse
            {
                DeviceDetails = deviceDetail.deviceDetails.Select(x => 
                {
                    // Get all zones for this device
                    var deviceZones = zoneCameras
                        .Where(zc => zc.DeviceId == x.Id)
                        .ToList();

                    // Get zone names
                    var zoneNames = string.Join(" | ", deviceZones
                        .Where(zc => !string.IsNullOrEmpty(zc.ZoneId) && zoneMap.ContainsKey(zc.ZoneId))
                        .Select(zc => zoneMap[zc.ZoneId])
                        .Distinct());
                    return new DeviceResponseDetail
                    {
                        Id = x.Id,
                        DeviceName = x.DeviceName,
                        Model = x.Model,
                        Location = x.Location,
                        SerialNumber = x.SerialNumber,
                        MacAddress = x.MacAddress,
                        DeviceType = x.DeviceType,
                        IpAddress = x.IpAddress,
                        UserName = x.UserName,
                        Password = x.Password,
                        DevicePort = x.IpAddress?.Split(":")[1],
                        IsHttps = x.IsHttps,
                        IsOnline = x.IsOnline,
                        ZoneNames = zoneNames
                    };                    
                }).ToList(),
                TotalCount = deviceDetail.deviceCount
            };
            return deviceResponse;
        }

        public async Task<long> DeleteDevicesAsync(IEnumerable<string> id, string userId)
        {
            var data = await _deviceMasterRepository.SoftDeleteManyAsync(id, userId);
            await _cacheService.RemoveAsync(CacheConstants.DeviceWithoutZone);
            await _cacheService.RemoveAsync(CacheConstants.PeopleDevices);
            await _cacheService.RemoveAsync(CacheConstants.VehicleDevices);
            await _cacheService.RemoveAsync(CacheConstants.ShoppingDevices);
            await _cacheService.RemoveAsync(CacheConstants.ForkLiftDevices);
            await _cacheService.RemoveAsync(CacheConstants.GetAllDevices);
            return data;
        }

        public async Task<IEnumerable<DevicesWithoutZonesResponseDto>> GetDevicesWithoutZones()
        {
            var deviceWithoutZone = await _cacheService.GetAsync<IEnumerable<DevicesWithoutZonesResponseDto>>(CacheConstants.DeviceWithoutZone);
            if (deviceWithoutZone != null)
            {
                return deviceWithoutZone;
            }

            var result = await _deviceMasterRepository.GetDevicesWithoutZones();
            var devicesIds = result.Select(x => x.Id).AsEnumerable();
            var zoneCameraDetail = await _zoneCameraRepository.GetZoneCameraDetails(devicesIds);
            var zoneDetail = await _zoneRepository.GetManyAsync(zoneCameraDetail.Select(x => x.ZoneId).AsEnumerable());

            var selectedColumns = result.Select(x => new DevicesWithoutZonesResponseDto
            {
                Id = x.Id,
                DeviceName = x.DeviceName,
                DeviceType = x.DeviceType,
                Model = x.Model,
                IpAddress = x.IpAddress?.Split(":")[0],
                PeopleLines = x.PeopleCount != null ? x.PeopleCount?.SelectMany(y => y.Lines.Select(pl => new ChannelLineDto
                {
                    line = pl.line,
                    Enable = pl.Enable,
                    Index = pl.Index,
                    Mode = pl.Mode,
                    Name = pl.Name,
                    Coordinates = pl.Coordinates,
                    IsMapped = zoneCameraDetail.Any(zc => zc.DeviceId == x.Id && zc.PeopleLineIndex.Contains(pl.line)),
                    ZoneName = zoneDetail.FirstOrDefault(z => z.Id == zoneCameraDetail.FirstOrDefault(zc => zc.DeviceId == x.Id && zc.PeopleLineIndex.Contains(pl.line))?.ZoneId)?.ZoneName

                })).ToList() : null,
                VehicleLines = x.VehicleCount != null ? x.VehicleCount.SelectMany(vc => vc.Lines.Select(vl => new ChannelLineDto
                {
                    line = vl.line,
                    Enable = vl.Enable,
                    Index = vl.Index,
                    Mode = vl.Mode,
                    Name = vl.Name,
                    Coordinates = vl.Coordinates,
                    IsMapped = zoneCameraDetail.Any(zc => zc.DeviceId == x.Id && zc.VehicleLineIndex.Contains(vl.line)),
                    ZoneName = zoneDetail.FirstOrDefault(z => z.Id == zoneCameraDetail.FirstOrDefault(zc => zc.DeviceId == x.Id && zc.VehicleLineIndex.Contains(vl.line))?.ZoneId)?.ZoneName
                })).ToList() : null,
                ChannelEvent = x.ObjectCountingConfiguration?.Select(od => new ChannelEventDto
                {
                    Channel = od.Channel,
                    Connected = x.ChannelEvent.Where(cec => cec.Channel == od.Channel).Select(cec => cec.Connected).FirstOrDefault(),
                    PeopleLines = od.CountingRules?.Where(cl => cl.ObjectType == "Person").SelectMany(cl => cl.Lines?.Select(aaa => new ChannelLineDto
                    {
                        line = aaa.Index,
                        Index = aaa.Index,
                        Name = aaa.Name,
                        Enable = true,
                        IsMapped = zoneCameraDetail.Any(zc => zc.DeviceId == x.Id && zc.Channel == od.Channel && zc.PeopleLineIndex.Contains(aaa.Index)),
                        ZoneName = zoneDetail.FirstOrDefault(z => z.Id == zoneCameraDetail.FirstOrDefault(zc => zc.DeviceId == x.Id && zc.Channel == od.Channel && zc.PeopleLineIndex.Contains(aaa.Index))?.ZoneId)?.ZoneName
                    })).ToList(),

                    VehicleLines = od.CountingRules?.Where(cl => cl.ObjectType == "Vehicle").SelectMany(cl => cl.Lines?.Select(aaa => new ChannelLineDto
                    {
                        line = aaa.Index,
                        Index = aaa.Index,
                        Name = aaa.Name,
                        Enable = true,
                        IsMapped = zoneCameraDetail.Any(zc => zc.DeviceId == x.Id && zc.Channel == od.Channel && zc.VehicleLineIndex.Contains(aaa.Index)),
                        ZoneName = zoneDetail.FirstOrDefault(z => z.Id == zoneCameraDetail.FirstOrDefault(zc => zc.DeviceId == x.Id && zc.Channel == od.Channel && zc.VehicleLineIndex.Contains(aaa.Index))?.ZoneId)?.ZoneName
                    })).ToList(),

                })
                //ChannelEvent = x.ChannelEvent?.Select(ce => new ChannelEventDto
                //{
                //    Channel = ce.Channel,
                //    Connected = ce.Connected,
                //    MotionDetection = ce.MotionDetection,

                //    //VehicleLines = (x.ObjectCountingConfiguration ?? new List<ChannelConfiguration>())
                //    //               .Where(occ => (x.ChannelEvent ?? new List<ChannelEvent>())
                //    //               .Any(ce => ce.Channel == occ.Channel))
                //    //               .Select(occ => (occ.CountingRules ?? new List<CountingRule>())
                //    //               .Where(cr => cr.ObjectType == "Vehicle")
                //    //               .Select(cr => cr.Lines.Select(line => new Lines
                //    //               {
                //    //                   line = line.Index,
                //    //                   Name = line.Name,
                //    //                   Mode = line.Mode,
                //    //                   Index = line.Index,
                //    //                   Coordinates = line.LineCoordinates.Select(c => new Coordinate
                //    //                   {
                //    //                       X = c.X,
                //    //                       Y = c.Y
                //    //                   }).ToList()
                //    //               }))).ToList(),



                //    PeopleLines = (x.ObjectCountingConfiguration ?? new List<ChannelConfiguration>())
                //                   .Where(occ => (x.ChannelEvent ?? new List<ChannelEvent>())
                //                   .Any(ce => ce.Channel == occ.Channel))
                //                   .SelectMany(occ => (occ.CountingRules ?? new List<CountingRule>())
                //                   .Where(cr => cr.ObjectType == "Vehicle")
                //                   .SelectMany(cr => cr.Lines.Select(line => new Lines
                //                   {
                //                       line = line.Index,
                //                       Name = line.Name,
                //                       Mode = line.Mode,
                //                       Index = line.Index,
                //                       Coordinates = line.LineCoordinates.Select(c => new Coordinate
                //                       {
                //                           X = c.X,
                //                           Y = c.Y
                //                       }).ToList()
                //                   }))).ToList()
                //}

            }).ToList();
            await _cacheService.SetAsync(CacheConstants.DeviceWithoutZone, selectedColumns);
            return selectedColumns;
        }

        public async Task<IEnumerable<AllChannelsResDto>> GetAllChannels(AllChannelsReqDto dto)
        {
            string url = (dto.IsHttps ? "https://" : "http://") + dto.IpAddress + ":" + dto.DevicePort + SunapiAPIConstant.EventStatus;
            var apiChannels = await _deviceApiService.CallDeviceApi<ChannelEventViewModel>(
                url,
                dto.UserName,
                dto.Password
            );

            var channels = new List<AllChannelsResDto>();

            foreach (var channelEvent in apiChannels.ChannelEvent)
            {
                channels.Add(new AllChannelsResDto
                {
                    ChannelNumber = channelEvent.Channel,
                    IsEnable = channelEvent.Connected
                });
            }

            return channels;
        }

        public async Task<IEnumerable<DeviceDetailResponse>> GetPeopleDeviceListAsync()
        {
            var peopleDevices = await _cacheService.GetAsync<IEnumerable<DeviceDetailResponse>>(CacheConstants.PeopleDevices);
            if (peopleDevices != null)
            {
                return peopleDevices;
            }
            var result = await _deviceMasterRepository.GetPeopleDeviceListAsync();
            await _cacheService.SetAsync(CacheConstants.PeopleDevices, result);
            return result;
        }

        public async Task<IEnumerable<DeviceDetailResponse>> GetVehicleDeviceListAsync()
        {
            var vehicleDevices = await _cacheService.GetAsync<IEnumerable<DeviceDetailResponse>>(CacheConstants.VehicleDevices);
            if (vehicleDevices != null)
            {
                return vehicleDevices;
            }
            var result = await _deviceMasterRepository.GetVehicleDeviceListAsync();
            await _cacheService.SetAsync(CacheConstants.VehicleDevices, result);
            return result;
        }

        public async Task<IEnumerable<DeviceDetailResponse>> GetShoppingCartDeviceListAsync()
        {
            var shoppingDevices = await _cacheService.GetAsync<IEnumerable<DeviceDetailResponse>>(CacheConstants.ShoppingDevices);
            if (shoppingDevices != null)
            {
                return shoppingDevices;
            }
            var result = await _deviceMasterRepository.GetShoppingCartDeviceListAsync();
            await _cacheService.SetAsync(CacheConstants.ShoppingDevices, result);
            return result;
        }
        public async Task<IEnumerable<DeviceDetailResponse>> GetForkliftDeviceListAsync()
        {
            var forkLiftDevices = await _cacheService.GetAsync<IEnumerable<DeviceDetailResponse>>(CacheConstants.ForkLiftDevices);
            if (forkLiftDevices != null)
            {
                return forkLiftDevices;
            }
            var result = await _deviceMasterRepository.GetForkliftDeviceListAsync();
            await _cacheService.SetAsync(CacheConstants.ForkLiftDevices, result);
            return result;
        }

        // To get devices for loop thoigh it to track events
        public async Task<IEnumerable<DeviceMaster>> GetAllDevicesAsync()
        {
            var allDevices = await _cacheService.GetAsync<IEnumerable<DeviceMaster>>(CacheConstants.GetAllDevices);
            if (allDevices != null)
            {
                return allDevices;
            }
            var data = await _deviceMasterRepository.GetAllAsync();
            await _cacheService.SetAsync(CacheConstants.GetAllDevices, data);
            return data;
        }

        public async Task<bool> ChangeDeviceStatusAsync(string deviceId, bool status)
        {
            var update = Builders<DeviceMaster>.Update
                .Set(c => c.IsOnline, status);
            var result = await _deviceMasterRepository.UpdateFieldsAsync(deviceId, update);
            return result;
        }
        public async Task<DeviceEventsLogsRes> GetDeviceEventsLogsAsync(DeviceEventsLogsRequest request, IEnumerable<string> roles)
        {
            IEnumerable<string> deviceIds = Enumerable.Empty<string>();
            if ((request.ZoneIds != null && request.ZoneIds.Any()) || (request.FloorIds != null && request.FloorIds.Any())) { 
                deviceIds = await _zoneCameraRepository.GetDevicebyFloorAndZoneAsync(request.FloorIds, request.ZoneIds);
            }
            else
            {
                IEnumerable<FloorDataAccessPermission> floorZonePermissions = _permissionService.GetFloorZonePermissionByRoles(roles);
                request.FloorIds = floorZonePermissions.Select(x => x.FloorId).ToList();
                request.ZoneIds = floorZonePermissions.SelectMany(permission => permission.ZoneIds).Distinct().ToList();
            }

            var deviceRequest = new DeviceEventsLogsRequest
            {
                FromDate = request.FromDate,
                ToDate = request.ToDate,
                FloorIds = request.FloorIds,
                ZoneIds = request.ZoneIds,
                DeviceIds = deviceIds,
                EventNames = request.EventNames,
                Status = request.Status,
                SortBy = request.SortBy,
                SortOrder = request.SortOrder,
                PageSize = request.PageSize,
                PageNumber = request.PageNumber
            };

            var deviceEventsLogs = await _deviceEventRepository.GetDeviceEventsLogsAsync(deviceRequest);


            DeviceEventsLogsRes deviceEventsLogsRes = new DeviceEventsLogsRes
            {
                EventsLogsDetails = deviceEventsLogs.deviceDetails.Select(x => new DeviceEventsLogsResponse
                {
                    Id = x.Id,
                    CreatedOn = x.CreatedOn,
                    EventName = x.EventName,
                    EventDescription = x.EventDescription,
                    FloorName = x.FloorName,
                    ZoneName = x.ZoneName,
                    VideoLink = x.VideoLink,
                    IsAcknowledged = x.IsAcknowledged
                }).ToList(),
                TotalCount = deviceEventsLogs.eventCount
            };
            return deviceEventsLogsRes;
        }
        public async Task<DeviceEventsLogsRes> GetDeviceEventsLogsAsync1(DeviceEventsLogsRequest request, IEnumerable<string> roles)
        {
            IEnumerable<string> deviceIds = Enumerable.Empty<string>();
            if ((request.ZoneIds != null && request.ZoneIds.Any()) || (request.FloorIds != null && request.FloorIds.Any()))
            {
                request.DeviceIds = await _zoneCameraRepository.GetDevicebyFloorAndZoneAsync(request.FloorIds, request.ZoneIds);
                if (request.ZoneIds == null || request.ZoneIds.Count() == 0)
                {
                    IEnumerable<FloorDataAccessPermission> floorZonePermissions = _permissionService.GetFloorZonePermissionByRoles(roles);
                    var zones = floorZonePermissions.Where(x => request.FloorIds.Contains(x.FloorId));
                    request.ZoneIds = zones.SelectMany(x => x.ZoneIds).Distinct().ToList();
                }

            }
            else
            {
                IEnumerable<FloorDataAccessPermission> floorZonePermissions = _permissionService.GetFloorZonePermissionByRoles(roles);
                request.FloorIds = floorZonePermissions.Select(x => x.FloorId).ToList();
                request.ZoneIds = floorZonePermissions.SelectMany(permission => permission.ZoneIds).Distinct().ToList();
                request.DeviceIds = await _zoneCameraRepository.GetDevicebyFloorAndZoneAsync(request.FloorIds, request.ZoneIds);
            }

            var floorZonedata = await _zoneCameraRepository.GetZoneCameraDetails(request.DeviceIds);

            ProjectionDefinition<FloorPlanMaster> projection = Builders<FloorPlanMaster>.Projection
            .Include("floorPlanName")
            .Include("_id");
            var floorData = await _floorRepository.GetManyAsync(request.FloorIds, projection);

            ProjectionDefinition<ZoneMaster> zoneProjection = Builders<ZoneMaster>.Projection
            .Include("zoneName")
            .Include("_id");
            var zoneData = await _zoneRepository.GetManyAsync(request.ZoneIds, zoneProjection);


            var deviceEventsLogs = await _deviceEventRepository.GetDeviceEventsLogsAsync1(request);

            DeviceEventsLogsRes deviceEventsLogsRes = new DeviceEventsLogsRes
            {
                EventsLogsDetails = deviceEventsLogs.deviceDetails.Select(x => new DeviceEventsLogsResponse
                {
                    Id = x.Id,
                    CreatedOn = x.CreatedOn,
                    EventName = x.EventName,
                    EventDescription = x.RuleIndex + "-" + x.RuleName,
                    FloorName = floorData.Where(y => y.Id == floorZonedata.FirstOrDefault(z => z.DeviceId == x.DeviceId).FloorId).FirstOrDefault().FloorPlanName ,
                    ZoneName = zoneData.Where(y => y.Id == floorZonedata.FirstOrDefault(z => z.DeviceId == x.DeviceId).ZoneId).FirstOrDefault().ZoneName,
                    VideoLink = x.VideoSourceToken,
                    IsAcknowledged = x.IsAcknowledged
                }).ToList(),
                TotalCount = deviceEventsLogs.eventCount
            };
            return deviceEventsLogsRes;
        }

        public async Task<bool> UpdateDeviceEventsStatusAsync(DeviceChangeStatusRequest deviceChangeStatusRequest, string userId)
        {
            var isModified = await _deviceEventRepository.UpdateDeviceEventsStatusAsync(deviceChangeStatusRequest.DeviceEventId, userId);
            if (isModified)
            {
                // Update user notification status
                await _userNotificationRepository.UpdateNotificationDeviceEventsStatusAsync(deviceChangeStatusRequest.DeviceEventId, userId);
            }
            return isModified;
        }

        public async Task<IEnumerable<MapCameraListByFeatures>> MapCameraListByFeaturesAsync(string feature, string? floorId)
        {
            IEnumerable<string>? mappedCameraLst = null;
            if (floorId != null)
            {
                mappedCameraLst = await _zoneCameraRepository.GetDevicebyFloorAndZoneAsync([floorId], null);
            }

            List<MapCameraListByFeatures> mapCameraListByFeatures = new List<MapCameraListByFeatures>();

            if(!string.IsNullOrEmpty(floorId) && mappedCameraLst != null && mappedCameraLst.Count() <= 0)
            {
                return mapCameraListByFeatures;
            }

            var result = await _deviceMasterRepository.MapCameraListByFeaturesAsync(feature, mappedCameraLst);
            var zoneCameraDetail = await _zoneCameraRepository.GetZoneCameraDetails(result.Select(x => x.Id).AsEnumerable());

            foreach (var camera in result)
            {
                if (camera.APIModel == "SUNAPI")
                {
                    mapCameraListByFeatures.Add(new MapCameraListByFeatures
                    {
                        CameraName = camera.DeviceName,
                        ChannelNo = 0,
                        DeviceId = camera.Id,
                        ZoneId = zoneCameraDetail.FirstOrDefault(z => z.DeviceId == camera.Id)?.ZoneId,
                        FloorId = zoneCameraDetail.FirstOrDefault(z => z.DeviceId == camera.Id)?.FloorId,
                        DeviceType = camera.DeviceType
                    });
                }
                else if (camera.APIModel == "WiseAI")
                {
                    foreach (var channel in camera.Features.WiseAI)
                    {
                        mapCameraListByFeatures.Add(new MapCameraListByFeatures
                        {
                            CameraName = camera.DeviceName,
                            ChannelNo = channel.Channel,
                            DeviceId = camera.Id,
                            ZoneId = zoneCameraDetail.FirstOrDefault(z => z.DeviceId == camera.Id)?.ZoneId,
                            FloorId = zoneCameraDetail.FirstOrDefault(z => z.DeviceId == camera.Id)?.FloorId,
                            DeviceType = camera.DeviceType
                        });
                    }
                }
            }
            return mapCameraListByFeatures;
        }

        public async Task<IEnumerable<MapCameraListByFeatures>> GetDevicesByFloorAndZonesAsync(IEnumerable<string> floorIds, IEnumerable<string>? zoneIds)
        {
            List<MapCameraListByFeatures> mapCameraListByFeatures = new List<MapCameraListByFeatures>();
            IEnumerable<string> cameraIds = await _zoneCameraRepository.GetDevicebyFloorAndZoneAsync(floorIds, zoneIds);
            var result = await _deviceMasterRepository.GetAllDeviceByDeviceIds(cameraIds);
            foreach (var camera in result)
            {
                if (camera.APIModel == "SUNAPI")
                {
                    mapCameraListByFeatures.Add(new MapCameraListByFeatures
                    {
                        CameraName = camera.DeviceName,
                        ChannelNo = 0,
                        DeviceId = camera.Id,
                        DeviceType = camera.DeviceType
                    });
                }
                else if (camera.APIModel == "WiseAI")
                {
                    foreach (var channel in camera.Features.WiseAI)
                    {
                        mapCameraListByFeatures.Add(new MapCameraListByFeatures
                        {
                            CameraName = camera.DeviceName,
                            ChannelNo = channel.Channel,
                            DeviceId = camera.Id,
                            DeviceType = camera.DeviceType
                        });
                    }
                }
            }
            return mapCameraListByFeatures;
        }

        public async Task<IEnumerable<MapCameraListByFeatures>> GetCameraListByHeatmapTypeAsync(string heatmapType)
        {
            List<MapCameraListByFeatures> cameraListByHeatmap = new List<MapCameraListByFeatures>();
            var heatmapDevices = await _heatMapRepository.GetCameraListByHeatmapTypeAsync(heatmapType);
            var deviceDetails = await _deviceMasterRepository.GetAllDeviceByDeviceIds(heatmapDevices);
            var zoneCamera = await _zoneCameraRepository.GetZoneCameraDetails(heatmapDevices);

            foreach(var device in deviceDetails)
            {
                if (device.APIModel == "SUNAPI")
                {
                    cameraListByHeatmap.Add(new MapCameraListByFeatures
                    {
                        CameraName = device.DeviceName,
                        ChannelNo = 0,
                        DeviceId = device.Id,
                        DeviceType = device.DeviceType,
                        FloorId = zoneCamera.FirstOrDefault(y => y.DeviceId == device.Id).FloorId,
                        ZoneId = zoneCamera.FirstOrDefault(y => y.DeviceId == device.Id).ZoneId
                    });
                }

                if (device.APIModel == "WiseAI")
                {
                    foreach (var channelEvent in device.ChannelEvent)
                    {
                        cameraListByHeatmap.Add(new MapCameraListByFeatures
                        {
                            CameraName = device.DeviceName,
                            ChannelNo = channelEvent.Channel,
                            DeviceId = device.Id,
                            DeviceType = device.DeviceType,
                            FloorId = zoneCamera.FirstOrDefault(y => y.DeviceId == device.Id).FloorId,
                            ZoneId = zoneCamera.FirstOrDefault(y => y.DeviceId == device.Id).ZoneId
                        });
                    }
                }
            }

            return cameraListByHeatmap;
        }

        public async Task<IEnumerable<DeviceResponseDetail>> GetDevicesByDeviceIdAsync(IEnumerable<string> deviceIds)
        {
            var deviceDetails = await _deviceMasterRepository.GetAllDeviceByDeviceIds(deviceIds);

            var responseDetails = deviceDetails.Select(device => new DeviceResponseDetail
            {
                Id = device.Id,
                DeviceName = device.DeviceName,
                Model = device.Model,
                Location = device.Location,
                SerialNumber = device.SerialNumber,
                MacAddress = device.MacAddress,
                DeviceType = device.DeviceType,
                IpAddress = device.IpAddress,
                UserName = device.UserName,
                Password = device.Password,
                DevicePort = device.IpAddress?.Contains(":") == true ? device.IpAddress.Split(":")[1] : null,
                IsHttps = device.IsHttps,
                IsOnline = device.IsOnline
            });

            return responseDetails;
        }
    }
}
