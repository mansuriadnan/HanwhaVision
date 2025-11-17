using HanwhaClient.Application.Interfaces;
using HanwhaClient.Core.Interfaces;
using HanwhaClient.Helper;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Infrastructure.Repository;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.DeviceApiResponse;
using Quartz;

namespace HanwhaClient.BackgroundTask
{
    public class VehicleCountJob : IJob
    {
        private readonly IDeviceApiService _deviceApiService;
        private readonly IPeopleCountService _peopleCountService;
        private readonly IDeviceMasterService _deviceMasterService;
        private readonly IVehicleService _VehicleService;
        private readonly IFileLogger _fileLogger;
        private readonly ILogger<GlobalExceptionHandlerMiddleware> _logger;
        private readonly IServiceProvider _serviceProvider;
        private readonly IVehicleRepository _vehicleRepository;
        private readonly IBackgroundJobCountService _backgroundJobCountService;

        public VehicleCountJob(IDeviceApiService deviceApiService,
                               IPeopleCountService peopleCountService,
                               IDeviceMasterService deviceMasterService,
                               IVehicleService vehicleService,
                               IFileLogger fileLogger,
                               ILogger<GlobalExceptionHandlerMiddleware> logger,
                               IServiceProvider serviceProvider,
                               IVehicleRepository vehicleRepository,
                               IBackgroundJobCountService backgroundJobCountService)
        {
            _deviceApiService = deviceApiService;
            _peopleCountService = peopleCountService;
            _deviceMasterService = deviceMasterService;
            _VehicleService = vehicleService;
            _fileLogger = fileLogger;
            _logger = logger;
            _serviceProvider = serviceProvider;
            _vehicleRepository = vehicleRepository;
            _backgroundJobCountService = backgroundJobCountService;
        }
        public async Task Execute(IJobExecutionContext context)
        {
            try
            {
                //for hold excuation at midnight for wrong data
                TimeSpan current = DateTime.Now.TimeOfDay;
                TimeSpan timediff = new TimeSpan(24, 0, 0) - current;
                if (timediff < new TimeSpan(0, 2, 0))
                {
                    return;
                }
                else if (current < new TimeSpan(0, 2, 0))
                {
                    return;
                }

                DateTime currentUtcTime = DateTime.UtcNow;
                Console.WriteLine($"Example job executed at: {DateTime.Now}");
                _fileLogger.Log("Vehicle job execution starts");
                var jobName = context.JobDetail.Key.Name;
                var jobGroup = context.JobDetail.Key.Group;

                List<Task> vehicleTasks = new List<Task>();
                var deviceDetail = await _deviceMasterService.GetVehicleDeviceListAsync();
                if (deviceDetail != null && deviceDetail.Count() > 0)
                {
                    var delayTime = 60000 / deviceDetail.Count();
                    foreach (var device in deviceDetail)
                    {
                        if (device.ApiModel == "SUNAPI")
                        {
                            vehicleTasks.Add(AddVehicleCountFromSunapi((device.IsHttps ? "https://" : "http://") + device.IpAddress, device.Username, device.Password, device.Id, currentUtcTime));
                        }
                        else if (device.ApiModel == "WiseAI")
                        {
                            vehicleTasks.Add(AddVehicleCountFromWiseAi((device.IsHttps ? "https://" : "http://") + device.IpAddress, device.Username, device.Password, device.Id, device.ChannelIndexList, currentUtcTime));
                        }
                        await Task.Delay(delayTime);
                    }
                    await Task.WhenAll(vehicleTasks);
                    if(_backgroundJobCountService.VehicleCount != null && _backgroundJobCountService.VehicleCount.Count > 0)
                    {
                        const int batchSize = 100;
                        var totalRecords = _backgroundJobCountService.VehicleCount.Count;

                        for (int i = 0; i < totalRecords; i += batchSize)
                        {
                            var batch = _backgroundJobCountService.VehicleCount
                                .Skip(i)
                                .Take(batchSize)
                                .ToList();

                            await _vehicleRepository.InsertManyAsync(batch);
                        }

                        _backgroundJobCountService.VehicleCount.Clear();
                    }
                }

                
                

                Console.WriteLine($"Job {jobName} from group {jobGroup} executed at: {DateTime.Now}");
                _fileLogger.Log("Vehicle job execution ends");
                return ;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);
                var exceptionLog2 = new ExceptionLog();
                using (var scope = _serviceProvider.CreateScope())
                {
                    var exceptionLog = scope.ServiceProvider.GetRequiredService<IExceptionLogService>();
                    exceptionLog2.ExceptionMessage = ex.Message;
                    exceptionLog2.StackTrace = ex.StackTrace;
                    exceptionLog2.ExceptionType = ex.GetType().Name;
                    exceptionLog2.LoggedAt = DateTime.Now;
                    exceptionLog2.RequestPath = "Vehicle job";
                    exceptionLog2.ResponseTime = DateTime.Now;
                    exceptionLog2.IsSuccess = false;
                    await exceptionLog.SaveExceptionLogAsync(exceptionLog2);
                }
                return ;
            }
        }

        public async Task<bool> AddVehicleCountFromSunapi(string ip, string userName, string password, string deviceId, DateTime currentTime)
        {
            try
            {
                var apiResponse = await _deviceApiService.CallDeviceApi<VehicleRootObject>(ip + SunapiAPIConstant.VehicleCountCheckSunapi, userName, password);
                if (apiResponse != null)
                {
                    var vehicleCount = new VehicleCount
                    {
                        DeviceId = deviceId,
                        CameraIP = ip,
                        VehicleCounts = apiResponse.VehicleCount,
                        CreatedOn = currentTime,
                        UpdatedOn = currentTime,
                    };
                    var result = _VehicleService.InsertVehicle(vehicleCount);

                }
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);
                var exceptionLog2 = new ExceptionLog();
                using (var scope = _serviceProvider.CreateScope())
                {
                    var exceptionLog = scope.ServiceProvider.GetRequiredService<IExceptionLogService>();
                    exceptionLog2.ExceptionMessage = ex.Message + ip;
                    exceptionLog2.StackTrace = ex.StackTrace;
                    exceptionLog2.ExceptionType = ex.GetType().Name;
                    exceptionLog2.LoggedAt = DateTime.Now;
                    exceptionLog2.RequestPath = "Vehicle job";
                    exceptionLog2.ResponseTime = DateTime.Now;
                    exceptionLog2.IsSuccess = false;
                    await exceptionLog.SaveExceptionLogAsync(exceptionLog2);
                }
                return false;
            }

        }

        public async Task<bool> AddVehicleCountFromWiseAi(string ip, string userName, string password, string deviceId, IEnumerable<PeopleWiseApiChannel> channelIndexList, DateTime currentTime)
        {
            try
            {
                var channelData = channelIndexList.FirstOrDefault();
                if (channelData == null)
                {
                    return false;
                }

                int channelDataIndex = channelData.ChannelDataIndex;
                foreach (var channel in channelIndexList.Select(x => x.Channel).Distinct())
                {
                    var apiResponse = await _deviceApiService.CallDeviceApi<ObjectCountingLiveResponse>(ip + WiseAPIConstant.PeopleCountCheck + channel + "&index=" + channelDataIndex + "&includeAIData=true", userName, password);
                    if (apiResponse != null)
                    {
                        var vehicleCount = new VehicleCount
                        {
                            DeviceId = deviceId,
                            CameraIP = ip,
                            ChannelNo = channel,
                            VehicleCounts = apiResponse.ObjectCountingLive.Select(x => new VehicleCountData
                            {
                                Channel = x.Channel,
                                Lines = x.CountingRules
                            .Where(cr => cr.Index == channelIndexList.FirstOrDefault(ci => ci.Channel == channel)?.ChannelDataIndex)
                            .SelectMany(cr => cr.Lines.Select(line => new VehicleLine
                            {
                                LineIndex = line.Index,
                                Name = channelIndexList.FirstOrDefault(ci => ci.Channel == channel && ci.LineIndex == line.Index)?.IndexName ?? "",
                                InCount = line.DirectionBasedResult.FirstOrDefault(d => d.Direction == "IN")?.Count ?? 0,
                                OutCount = line.DirectionBasedResult.FirstOrDefault(d => d.Direction == "OUT")?.Count ?? 0,
                                In = ExtractVehicleData(line.DirectionBasedResult.FirstOrDefault(d => d.Direction == "IN")),
                                Out = ExtractVehicleData(line.DirectionBasedResult.FirstOrDefault(d => d.Direction == "OUT")),
                            })).AsEnumerable()
                            }).AsEnumerable(),
                            CreatedOn = currentTime,
                            UpdatedOn = currentTime,
                        };
                        var result = _VehicleService.InsertVehicle(vehicleCount);
                    }
                }
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);
                var exceptionLog2 = new ExceptionLog();
                using (var scope = _serviceProvider.CreateScope())
                {
                    var exceptionLog = scope.ServiceProvider.GetRequiredService<IExceptionLogService>();
                    exceptionLog2.ExceptionMessage = ex.Message + ip;
                    exceptionLog2.StackTrace = ex.StackTrace;
                    exceptionLog2.ExceptionType = ex.GetType().Name;
                    exceptionLog2.LoggedAt = DateTime.Now;
                    exceptionLog2.RequestPath = "Vehicle job";
                    exceptionLog2.ResponseTime = DateTime.Now;
                    exceptionLog2.IsSuccess = false;
                    await exceptionLog.SaveExceptionLogAsync(exceptionLog2);
                }
                return false;
            }

        }

        private VehicleData ExtractVehicleData(DirectionBasedResult? directionResult)
        {
            if (directionResult == null || directionResult.VehicleInfo == null)
                return new VehicleData();

            return new VehicleData
            {
                Car = directionResult.VehicleInfo.FirstOrDefault(v => v.VehicleType == "Car")?.Count ?? 0,
                Bus = directionResult.VehicleInfo.FirstOrDefault(v => v.VehicleType == "Bus")?.Count ?? 0,
                Truck = directionResult.VehicleInfo.FirstOrDefault(v => v.VehicleType == "Truck")?.Count ?? 0,
                Motorcycle = directionResult.VehicleInfo.FirstOrDefault(v => v.VehicleType == "Motorcycle")?.Count ?? 0,
                Bicycle = directionResult.VehicleInfo.FirstOrDefault(v => v.VehicleType == "Bicycle")?.Count ?? 0
            };
        }

    }
}
