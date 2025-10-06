using HanwhaClient.Application.Interfaces;
using HanwhaClient.Core.Interfaces;
using HanwhaClient.Helper;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.Dto;
using Quartz;

namespace HanwhaClient.Server.BackgroundTask
{
    public class HeatMapJob : IJob
    {

        private readonly IDeviceApiService _deviceApiService;
        private readonly IDeviceMasterService _deviceMasterService;
        private readonly IHeatMapRepository _heatMapRepository;
        private readonly IFileLogger _fileLogger;
        private readonly ILogger<GlobalExceptionHandlerMiddleware> _logger;
        private readonly IServiceProvider _serviceProvider;

        public HeatMapJob(IDeviceApiService deviceApiService,
                               IDeviceMasterService deviceMasterService,
                               IHeatMapRepository heatMapRepository,
                               IFileLogger fileLogger,
                               ILogger<GlobalExceptionHandlerMiddleware> logger,
                               IServiceProvider serviceProvider)
        {
            _deviceApiService = deviceApiService;
            _deviceMasterService = deviceMasterService;
            _heatMapRepository = heatMapRepository;
            _fileLogger = fileLogger;
            _logger = logger;
            _serviceProvider = serviceProvider;
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
                _fileLogger.Log("Heatmap job execution starts");
                Console.WriteLine($"Example job executed at: {DateTime.Now}");
                var jobName = context.JobDetail.Key.Name;
                var jobGroup = context.JobDetail.Key.Group;

                var deviceDetail = _deviceMasterService.GetAllDevicesAsync().Result;
                var deviceChunk = deviceDetail.Chunk(20);

                foreach(var item in deviceChunk)
                {
                    foreach (var device in item)
                    {
                        if (device.APIModel == "WiseAI")
                        {
                            foreach (var configuration in device.ObjectCountingConfiguration)
                            {
                                CheckWiseAiHeatMapConfiguration(device, configuration.Channel, currentUtcTime);
                            }

                        }
                        else if (device.APIModel == "SUNAPI")
                        {
                            CheckSunapiHeatMapConfiguration(device, currentUtcTime);
                        }
                    }
                    await Task.Delay(500);
                }

                
                Console.WriteLine($"Job {jobName} from group {jobGroup} executed at: {DateTime.Now}");
                _fileLogger.Log("Heatmap job execution ends");
                return;
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
                    exceptionLog2.RequestPath = "Heatmap job";
                    exceptionLog2.ResponseTime = DateTime.Now;
                    exceptionLog2.IsSuccess = false;
                    exceptionLog.SaveExceptionLogAsync(exceptionLog2);
                }
                return;
            }
            
        }

        public async Task<bool> CheckWiseAiHeatMapConfiguration(DeviceMaster device, int channel, DateTime currentTime)
        {
            try
            {
                var vehicleHeatMapConfiguration = await _deviceApiService.CallDeviceApi<WiseAiHeatmapConfigRoot>((device.IsHttps ? "https://" : "http://") + device.IpAddress + WiseAPIConstant.VehicleHeatMapConfiguration + channel, device.UserName, device.Password);

                if (vehicleHeatMapConfiguration != null && vehicleHeatMapConfiguration.HeatmapConfigurations != null && vehicleHeatMapConfiguration.HeatmapConfigurations.Any(x => x.Enable == true))
                {
                    await AddWiseAiHeatMapdata((device.IsHttps ? "https://" : "http://") + device.IpAddress + WiseAPIConstant.VehicleHeatMap + channel, device.UserName, device.Password, device.Id, "VehicleHeatMap", currentTime);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Vehicle HeatMap error for device {device.IpAddress}: {ex.Message}");
            }

            try
            {
                var peopleHeatMapConfiguration = await _deviceApiService.CallDeviceApi<WiseAiHeatmapConfigRoot>((device.IsHttps ? "https://" : "http://") + device.IpAddress + WiseAPIConstant.PeopleHeatMapConfiguration + channel, device.UserName, device.Password);

                if (peopleHeatMapConfiguration != null && peopleHeatMapConfiguration.HeatmapConfigurations != null && peopleHeatMapConfiguration.HeatmapConfigurations.Any(x => x.Enable == true))
                {
                    await AddWiseAiHeatMapdata((device.IsHttps ? "https://" : "http://") + device.IpAddress + WiseAPIConstant.PeopleHeatMap + channel, device.UserName, device.Password, device.Id, "PeopleHeatMap", currentTime);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"People HeatMap error for device {device.IpAddress}: {ex.Message}");
            }

            try
            {
                var shoppingCartHeatMapConfiguration = await _deviceApiService.CallDeviceApi<WiseAiHeatmapConfigRoot>((device.IsHttps ? "https://" : "http://") + device.IpAddress + WiseAPIConstant.ShoppingCartHeatMapConfiguration + channel, device.UserName, device.Password);

                if (shoppingCartHeatMapConfiguration != null && shoppingCartHeatMapConfiguration.HeatmapConfigurations != null && shoppingCartHeatMapConfiguration.HeatmapConfigurations.Any(x => x.Enable == true))
                {
                    await AddWiseAiHeatMapdata((device.IsHttps ? "https://" : "http://") + device.IpAddress + WiseAPIConstant.ShoppingCartHeatMap + channel, device.UserName, device.Password, device.Id, "ShoppingCartHeatMap", currentTime);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Shopping HeatMap error for device {device.IpAddress}: {ex.Message}");
            }

            try
            {
                var ForkliftHeatMapConfiguration = await _deviceApiService.CallDeviceApi<WiseAiHeatmapConfigRoot>((device.IsHttps ? "https://" : "http://") + device.IpAddress + WiseAPIConstant.ForkliftHeatMapConfiguration + channel, device.UserName, device.Password);

                if (ForkliftHeatMapConfiguration != null && ForkliftHeatMapConfiguration.HeatmapConfigurations != null && ForkliftHeatMapConfiguration.HeatmapConfigurations.Any(x => x.Enable == true))
                {
                    await AddWiseAiHeatMapdata((device.IsHttps ? "https://" : "http://") + device.IpAddress + WiseAPIConstant.ForkliftHeatMap + channel, device.UserName, device.Password, device.Id, "ForkliftHeatMap", currentTime);
                }
            }
            catch (Exception ex)
            {

                Console.WriteLine($"Forklift HeatMap error for device {device.IpAddress}: {ex.Message}");
            }

            return true;
        }

        public async Task<bool> CheckSunapiHeatMapConfiguration(DeviceMaster device, DateTime currentTime)
        {
            try
            {
                var PeopleHeatMapConfiguration = await _deviceApiService.CallDeviceApi<SunapiHeatMapConfigRoot>((device.IsHttps ? "https://" : "http://") + device.IpAddress + SunapiAPIConstant.PeopleHeatmapConfiguration, device.UserName, device.Password);

                if (PeopleHeatMapConfiguration != null && PeopleHeatMapConfiguration.HeatMap != null && PeopleHeatMapConfiguration.HeatMap.Any(x => x.Enable == true))
                {
                    await AddSunapiHeatMapdata((device.IsHttps ? "https://" : "http://") + device.IpAddress + SunapiAPIConstant.PeopleHeatmap, device.UserName, device.Password, device.Id, "PeopleHeatMap", currentTime);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"People HeatMap error for device {device.IpAddress}: {ex.Message}");
            }
            return true;
        }

        public async Task<bool> AddWiseAiHeatMapdata(string url, string userName, string password, string deviceId, string heatMapType, DateTime currentTime)
        {
            var apiResponse = await _deviceApiService.CallDeviceApi<HeatmapRoot>(url, userName, password);
            if (apiResponse != null)
            {
                var heatMapData = new HeatMap
                {
                    DeviceId = deviceId,
                    CameraIP = url,
                    ChannelNo = 0,
                    HeatMapType = heatMapType,
                    ResolutionHeight = apiResponse.Heatmap.FirstOrDefault().Resolution.Height,
                    ResolutionWidth = apiResponse.Heatmap.FirstOrDefault().Resolution.Width,
                    HeatMapData = apiResponse.Heatmap.FirstOrDefault().Level,
                    CreatedOn = currentTime,
                    UpdatedOn = currentTime
                };

                var result = _heatMapRepository.InsertAsync(heatMapData);
            }
            return true;
        }

        public async Task<bool> AddSunapiHeatMapdata(string url, string userName, string password, string deviceId, string heatMapType, DateTime currentTime)
        {
            var apiResponse = await _deviceApiService.CallDeviceApi<SunapiHeatMapLevelRoot>(url, userName, password);
            if (apiResponse != null)
            {
                var heatMapData = new HeatMap
                {
                    DeviceId = deviceId,
                    CameraIP = url,
                    ChannelNo = 0,
                    HeatMapType = heatMapType,
                    ResolutionHeight = int.Parse(apiResponse.HeatMap.FirstOrDefault()?.Resolution.Split('x')[0]),
                    ResolutionWidth = int.Parse(apiResponse.HeatMap.FirstOrDefault()?.Resolution.Split('x')[1]),
                    HeatMapData = apiResponse.HeatMap.FirstOrDefault().Level,
                    CreatedOn = currentTime,
                    UpdatedOn = currentTime
                };

                var result = _heatMapRepository.InsertAsync(heatMapData);
            }
            return true;
        }
    }
}
