using HanwhaClient.Application.Interfaces;
using HanwhaClient.Core.Interfaces;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Model.DbEntities;

namespace HanwhaClient.Application.Services
{
    public class ShoppingCartCountService : IShoppingCartCountService
    {
        private readonly IClientSettingService _clientSettingService;
        private readonly IDeviceDataStoreService _deviceDataStoreService;
        private readonly IShoppingCartCountRepository _shoppingCartCountRepository;
        private readonly IFileLogger _fileLogger;
        private readonly IBackgroundJobCountService _backgroundJobCountService;
        public ShoppingCartCountService(
            IClientSettingService clientSettingService,
            IDeviceDataStoreService deviceDataStoreService,
            IShoppingCartCountRepository shoppingCartCountRepository,
            IBackgroundJobCountService backgroundJobCountService,
            IFileLogger fileLogger)
        {
            _clientSettingService = clientSettingService;
            _deviceDataStoreService = deviceDataStoreService;
            _shoppingCartCountRepository = shoppingCartCountRepository;
            _backgroundJobCountService = backgroundJobCountService;
            _fileLogger = fileLogger;
        }

        public async Task<string> InsertShoppingCartCount(ShoppingCartCount shoppingCartCount)
        {
            var data = await _clientSettingService.GetClientSetting();
            if(data != null && data.OperationalTiming != null)
            {
                DateTime operationalStartTimeUTC = data.OperationalTiming.StartTime;
                DateTime operationalEndTimeUTC = data.OperationalTiming.EndTime;

                DateTime localStartTime = TimeZoneInfo.ConvertTimeFromUtc(operationalStartTimeUTC, TimeZoneInfo.Local);
                DateTime localEndTime = TimeZoneInfo.ConvertTimeFromUtc(operationalEndTimeUTC, TimeZoneInfo.Local);

                TimeSpan operationalStartTime = localStartTime.TimeOfDay;
                TimeSpan operationalEndTime = localEndTime.TimeOfDay;
                TimeSpan currentTime = TimeZoneInfo.ConvertTimeFromUtc(shoppingCartCount.CreatedOn.Value, TimeZoneInfo.Local).TimeOfDay;
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
                    _deviceDataStoreService.CacheShoppingCartCount(shoppingCartCount);
                    _fileLogger.Log("Shopping Caching started for device :--:  " + shoppingCartCount.DeviceId);
                }

                if (isCarryForwardRequired)
                {
                    ShoppingCartCount CacheshoppingCartCount = await _deviceDataStoreService.GetCacheShoppingCartCount(shoppingCartCount.DeviceId, shoppingCartCount.ChannelNo);
                    _fileLogger.Log("Shopping Carry forward for device :--:  " + shoppingCartCount.DeviceId);
                    if (CacheshoppingCartCount != null)
                    {
                        var tempShoppingCartCount = shoppingCartCount.Lines.ToList();
                        foreach (var newLine in tempShoppingCartCount)
                        {
                            var cachedLine = CacheshoppingCartCount.Lines
                                .FirstOrDefault(cl => cl.LineIndex == newLine.LineIndex);

                            if (cachedLine != null)
                            {
                                // Merge counts
                                newLine.InCount = cachedLine.InCount + newLine.InCount;
                                newLine.OutCount = cachedLine.OutCount + newLine.OutCount;
                            }
                        }
                        shoppingCartCount.Lines = tempShoppingCartCount;

                        _backgroundJobCountService.ShoppingCartCount.Add(shoppingCartCount);
                        return "";
                        //return await _shoppingCartCountRepository.InsertAsync(shoppingCartCount);
                    }
                }
            }
            _backgroundJobCountService.ShoppingCartCount.Add(shoppingCartCount);
            return "";
            //return await _shoppingCartCountRepository.InsertAsync(shoppingCartCount);
        }
    }
}
