using HanwhaClient.Application.Interfaces;
using HanwhaClient.Core.Interfaces;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Model.DbEntities;

namespace HanwhaClient.Application.Services
{
    public class ForkliftCountService : IForkliftCountService
    {
        private readonly IClientSettingService _clientSettingService;
        private readonly IDeviceDataStoreService _deviceDataStoreService;
        private readonly IForkliftCountRepository _forkliftCountRepository;
        private readonly IFileLogger _fileLogger;
        private readonly IBackgroundJobCountService _backgroundJobCountService;
        public ForkliftCountService(IClientSettingService clientSettingService,
            IDeviceDataStoreService deviceDataStoreService,
            IForkliftCountRepository forkliftCountRepository,
            IBackgroundJobCountService backgroundJobCountService)
        {
            _clientSettingService = clientSettingService;
            _deviceDataStoreService = deviceDataStoreService;
            _forkliftCountRepository = forkliftCountRepository;
            _backgroundJobCountService = backgroundJobCountService;
        }

        public async Task<string> InsertForkliftCount(ForkliftCount forkliftCount)
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
                TimeSpan currentTime = TimeZoneInfo.ConvertTimeFromUtc(forkliftCount.CreatedOn.Value, TimeZoneInfo.Local).TimeOfDay;
                //TimeSpan currentTime = DateTime.Now.TimeOfDay;

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
                    _deviceDataStoreService.CacheForkliftCount(forkliftCount);
                    _fileLogger.Log("Forklift Caching started for device :--:  " + forkliftCount.DeviceId);
                }

                if (isCarryForwardRequired)
                {
                    ForkliftCount CacheForkliftCount = await _deviceDataStoreService.GetCacheForkliftCount(forkliftCount.DeviceId, forkliftCount.ChannelNo);
                    _fileLogger.Log("Forklift Carry forward for device :--:  " + forkliftCount.DeviceId);

                    if (CacheForkliftCount != null)
                    {
                        var tempForkliftCount = forkliftCount.Lines.ToList();
                        foreach (var newLine in tempForkliftCount)
                        {
                            var cachedLine = CacheForkliftCount.Lines
                                .FirstOrDefault(cl => cl.LineIndex == newLine.LineIndex);

                            if (cachedLine != null)
                            {
                                // Merge counts
                                newLine.InCount = cachedLine.InCount + newLine.InCount;
                                newLine.OutCount = cachedLine.OutCount + newLine.OutCount;
                            }
                        }
                        forkliftCount.Lines = tempForkliftCount;
                        _backgroundJobCountService.ForkliftCounts.Add(forkliftCount);
                        return "";
                        //return await _forkliftCountRepository.InsertAsync(forkliftCount);
                    }
                }
            }
            _backgroundJobCountService.ForkliftCounts.Add(forkliftCount);
            return "";
            //return await _forkliftCountRepository.InsertAsync(forkliftCount);
        }
    }
}
