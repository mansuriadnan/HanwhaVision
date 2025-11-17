using HanwhaClient.Application.Interfaces;
using HanwhaClient.Core.Interfaces;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Model.DbEntities;

namespace HanwhaClient.Application.Services
{
    public class VehicleService : IVehicleService
    {
        private readonly IVehicleRepository _vehicleRepository;
        private readonly IClientSettingService _clientSettingService;
        private readonly IDeviceDataStoreService _deviceDataStoreService;
        private readonly IFileLogger _fileLogger;
        private readonly IBackgroundJobCountService _backgroundJobCountService;

        public VehicleService(IVehicleRepository vehicleRepository,
            IClientSettingService clientSettingService,
            IDeviceDataStoreService deviceDataStoreService,
            IFileLogger fileLogger,
            IBackgroundJobCountService backgroundJobCountService)
        {
            _vehicleRepository = vehicleRepository;
            _clientSettingService = clientSettingService;
            _deviceDataStoreService = deviceDataStoreService;
            _fileLogger = fileLogger;
            _backgroundJobCountService = backgroundJobCountService;
        }

        public async Task<string> InsertVehicle(VehicleCount vehicleCountDetail)
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
                TimeSpan currentTime = TimeZoneInfo.ConvertTimeFromUtc(vehicleCountDetail.CreatedOn.Value, TimeZoneInfo.Local).TimeOfDay;
                //TimeSpan currentTime = DateTime.Now.TimeOfDay;
                //TimeSpan currentTime = new TimeSpan(23, 46, 20);

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

                if (operationalStartTime > operationalEndTime && currentTime >= new TimeSpan(23, 45, 00) && currentTime <= new TimeSpan(23, 59, 59))
                {
                    _deviceDataStoreService.CacheVehicleCount(vehicleCountDetail);
                    _fileLogger.Log("Vehicle Caching started for device :--:  " + vehicleCountDetail.DeviceId);
                }

                if (isCarryForwardRequired)
                {
                    VehicleCount cacheVehicleCount = await _deviceDataStoreService.GetCacheVehicleCount(vehicleCountDetail.DeviceId, vehicleCountDetail.ChannelNo);
                    _fileLogger.Log("Vehicle Carry forward for device :--:  " + vehicleCountDetail.DeviceId);
                    if (cacheVehicleCount != null && cacheVehicleCount.VehicleCounts?.Any() == true)
                    {
                        var cachedVehicle = cacheVehicleCount.VehicleCounts.FirstOrDefault();
                        var newVehicle = vehicleCountDetail.VehicleCounts.FirstOrDefault();

                        if (cachedVehicle != null && newVehicle != null)
                        {
                            // Ensure lines are mutable
                            if (cachedVehicle.Lines == null)
                                cachedVehicle.Lines = new List<VehicleLine>();

                            var tempVehicleLinesDetail = newVehicle.Lines.ToList();

                            foreach (var newLine in tempVehicleLinesDetail)
                            {
                                var cachedLine = cachedVehicle.Lines.FirstOrDefault(l => l.LineIndex == newLine.LineIndex);
                                if (cachedLine == null)
                                {
                                    continue;
                                }

                                // Accumulate in/out counts
                                newLine.InCount = cachedLine.InCount + newLine.InCount;
                                newLine.OutCount = cachedLine.OutCount + newLine.OutCount;

                                // Merge 'In' vehicle counts
                                newLine.In.Car = cachedLine.In.Car + newLine.In.Car;
                                newLine.In.Bus = cachedLine.In.Bus + newLine.In.Bus;
                                newLine.In.Truck = cachedLine.In.Truck + newLine.In.Truck;
                                newLine.In.Motorcycle = cachedLine.In.Motorcycle + newLine.In.Motorcycle;
                                newLine.In.Bicycle = cachedLine.In.Bicycle + newLine.In.Bicycle;

                                // Merge 'Out' vehicle counts
                                newLine.Out.Car = cachedLine.Out.Car + newLine.Out.Car;
                                newLine.Out.Bus = cachedLine.Out.Bus + newLine.Out.Bus;
                                newLine.Out.Truck = cachedLine.Out.Truck + newLine.Out.Truck;
                                newLine.Out.Motorcycle = cachedLine.Out.Motorcycle + newLine.Out.Motorcycle;
                                newLine.Out.Bicycle = cachedLine.Out.Bicycle + newLine.Out.Bicycle;
                            }
                            
                            newVehicle.Lines = tempVehicleLinesDetail;
                            vehicleCountDetail.VehicleCounts = [new VehicleCountData { Channel = newVehicle.Channel, Lines = tempVehicleLinesDetail }];
                        }


                        _backgroundJobCountService.VehicleCount.Add(vehicleCountDetail);
                        return "";
                        //return await _vehicleRepository.InsertAsync(vehicleCountDetail);
                    }
                }
            }
            _backgroundJobCountService.VehicleCount.Add(vehicleCountDetail);
            return "";
            //return await _vehicleRepository.InsertAsync(vehicleCountDetail);
        }
    }
}
