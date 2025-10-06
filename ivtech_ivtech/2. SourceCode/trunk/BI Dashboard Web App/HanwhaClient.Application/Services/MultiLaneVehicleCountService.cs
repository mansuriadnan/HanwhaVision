using HanwhaClient.Application.Interfaces;
using HanwhaClient.Core.Interfaces;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Infrastructure.Repository;
using HanwhaClient.Model.DbEntities;

namespace HanwhaClient.Application.Services
{
    public class MultiLaneVehicleCountService : IMultiLaneVehicleCountService
    {
        private readonly IMultiLaneVehicleCountRepository _multiLaneVehicleCountRepository;
        private readonly IClientSettingService _clientSettingService;
        private readonly IDeviceDataStoreService _deviceDataStoreService;
        private readonly IFileLogger _fileLogger;
        private readonly IBackgroundJobCountService _backgroundJobCountService;
        public MultiLaneVehicleCountService(IMultiLaneVehicleCountRepository multiLaneVehicleCountRepository,
            IClientSettingService clientSettingService,
            IDeviceDataStoreService deviceDataStoreService,
            IFileLogger fileLogger,
            IBackgroundJobCountService backgroundJobCountService)
        {
            _multiLaneVehicleCountRepository = multiLaneVehicleCountRepository;
            _clientSettingService = clientSettingService;
            _deviceDataStoreService = deviceDataStoreService;
            _fileLogger = fileLogger;
            _backgroundJobCountService = backgroundJobCountService;
        }

        public async Task<string> InsertMultiLaneVehicleCount(MultiLaneVehicleCount multiLaneVehicleCount)
        {
            var data = await _clientSettingService.GetClientSetting();
            if (data != null && data.OperationalTiming != null)
            {
                DateTime operationalStartTimeUTC = data.OperationalTiming.StartTime;
                DateTime operationalEndTimeUTC = data.OperationalTiming.EndTime;

                DateTime localStartTime = TimeZoneInfo.ConvertTimeFromUtc(operationalStartTimeUTC, TimeZoneInfo.Local);
                DateTime localEndTime = TimeZoneInfo.ConvertTimeFromUtc(operationalEndTimeUTC, TimeZoneInfo.Local);

                TimeSpan operationalStartTime = localStartTime.TimeOfDay;
                TimeSpan operationalEndTime = localEndTime.TimeOfDay;
                //TimeSpan currentTime = DateTime.Now.TimeOfDay;
                TimeSpan currentTime = TimeZoneInfo.ConvertTimeFromUtc(multiLaneVehicleCount.CreatedOn.Value, TimeZoneInfo.Local).TimeOfDay;

                bool isWithinOperationalHours;
                if (operationalStartTime <= operationalEndTime)
                {
                    isWithinOperationalHours = currentTime >= operationalStartTime && currentTime <= operationalEndTime;
                }
                else
                {
                    isWithinOperationalHours = currentTime >= operationalStartTime || currentTime <= operationalEndTime;
                }

                if (!isWithinOperationalHours)
                {
                    return "";
                }

                bool isCarryForwardRequired =
                    operationalStartTime > operationalEndTime &&
                    currentTime > TimeSpan.Zero &&
                    currentTime < operationalEndTime;

                if (operationalStartTime > operationalEndTime && currentTime >= new TimeSpan(23, 45, 00) && currentTime <= new TimeSpan(23, 59, 00))
                {
                    _deviceDataStoreService.CacheMultiLaneVehicleCount(multiLaneVehicleCount);
                    _fileLogger.Log("Multilane Caching started for device :--:  " + multiLaneVehicleCount.DeviceId);
                }

                if (isCarryForwardRequired)
                {
                    MultiLaneVehicleCount cacheMultilaneCount = await _deviceDataStoreService.GetCacheMultiLaneVehicleCount(multiLaneVehicleCount.DeviceId, multiLaneVehicleCount.ChannelNo);
                    _fileLogger.Log("Multilane Carry forward for device :--:  " + multiLaneVehicleCount.DeviceId);
                    if (cacheMultilaneCount != null)
                    {
                        var cachedDirectionCount = cacheMultilaneCount.DirectionCount ?? new List<MultiLaneVehicleDirection>();
                        var tempDirectionCount = multiLaneVehicleCount.DirectionCount.ToList();

                        foreach (var newDirection in tempDirectionCount)
                        {
                            var cachedDirection = cachedDirectionCount.FirstOrDefault(d => d.Direction.Equals(newDirection.Direction, StringComparison.OrdinalIgnoreCase));

                            if (cachedDirection != null)
                            {
                                newDirection.Count = cachedDirection.Count + newDirection.Count;
                            }
                        }

                        // Update the cache with merged direction counts
                        //cacheMultilaneCount.DirectionCount = cachedDirectionCount;
                        multiLaneVehicleCount.DirectionCount = tempDirectionCount;

                        // Insert merged object into DB

                        _backgroundJobCountService.MultiLaneVehicleCounts.Add(multiLaneVehicleCount);
                        return "";
                        //return await _multiLaneVehicleCountRepository.InsertAsync(multiLaneVehicleCount);
                    }
                }
            }
            _backgroundJobCountService.MultiLaneVehicleCounts.Add(multiLaneVehicleCount);
            return "";
            //return await _multiLaneVehicleCountRepository.InsertAsync(multiLaneVehicleCount);
        }
    }
}
