using HanwhaClient.Application.Interfaces;
using HanwhaClient.Core.Interfaces;
using HanwhaClient.Helper;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Infrastructure.Repository;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.DeviceApiResponse;
using Quartz;

namespace HanwhaClient.Server.BackgroundTask
{
    public class MultiLaneVehicleCountJob : IJob
    {
        private readonly IDeviceApiService _deviceApiService;
        private readonly IDeviceMasterService _deviceMasterService;
        private readonly IMultiLaneVehicleCountService _multiLaneVehicleCountService;
        private readonly IFileLogger _fileLogger;
        private readonly ILogger<GlobalExceptionHandlerMiddleware> _logger;
        private readonly IServiceProvider _serviceProvider;
        private readonly IBackgroundJobCountService _backgroundJobCountService;
        private readonly IMultiLaneVehicleCountRepository _multiLaneVehicleCountRepository;

        public MultiLaneVehicleCountJob(IDeviceApiService deviceApiService,
                               IDeviceMasterService deviceMasterService,
                               IMultiLaneVehicleCountService multiLaneVehicleCountService,
                               IFileLogger fileLogger,
                               ILogger<GlobalExceptionHandlerMiddleware> logger,
                               IServiceProvider serviceProvider,
                               IBackgroundJobCountService backgroundJobCountService,
                               IMultiLaneVehicleCountRepository multiLaneVehicleCountRepository)
        {
            _deviceApiService = deviceApiService;
            _deviceMasterService = deviceMasterService;
            _multiLaneVehicleCountService = multiLaneVehicleCountService;
            _fileLogger = fileLogger;
            _logger = logger;
            _serviceProvider = serviceProvider;
            _backgroundJobCountService = backgroundJobCountService;
            _multiLaneVehicleCountRepository = multiLaneVehicleCountRepository;
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
                _fileLogger.Log("Multilane job execution starts");
                var jobName = context.JobDetail.Key.Name;
                var jobGroup = context.JobDetail.Key.Group;

                List<Task> multilaneTasks = new List<Task>();
                var deviceDetail = _deviceMasterService.GetVehicleDeviceListAsync().Result.Where(x => x.ApiModel == "WiseAI");
                if(deviceDetail != null && deviceDetail.Count() > 0)
                {
                    var delayTime = 60000 / deviceDetail.Count();
                    foreach (var device in deviceDetail)
                    {
                        multilaneTasks.Add(AddMultiLaneVehicleCountFromWiseAi((device.IsHttps ? "https://" : "http://") + device.IpAddress, device.Username, device.Password, device.Id, device.ChannelIndexList, currentUtcTime));
                        await Task.Delay(delayTime);
                    }
                }

                await Task.WhenAll(multilaneTasks);
                if(_backgroundJobCountService.MultiLaneVehicleCounts != null && _backgroundJobCountService.MultiLaneVehicleCounts.Count > 0)
                {
                    const int batchSize = 100;
                    var totalRecords = _backgroundJobCountService.MultiLaneVehicleCounts.Count;

                    for (int i = 0; i < totalRecords; i += batchSize)
                    {
                        var batch = _backgroundJobCountService.MultiLaneVehicleCounts
                            .Skip(i)
                            .Take(batchSize)
                            .ToList();

                        await _multiLaneVehicleCountRepository.InsertManyAsync(batch);
                    }
                    _backgroundJobCountService.MultiLaneVehicleCounts.Clear();
                }
                Console.WriteLine($"Job {jobName} from group {jobGroup} executed at: {DateTime.Now}");
                _fileLogger.Log("Multilane job execution ends");
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
                    exceptionLog2.RequestPath = "Multilane job";
                    exceptionLog2.ResponseTime = DateTime.Now;
                    exceptionLog2.IsSuccess = false;
                    await exceptionLog.SaveExceptionLogAsync(exceptionLog2);
                }
                return;
            }

        }


        public async Task<bool> AddMultiLaneVehicleCountFromWiseAi(string ip, string userName, string password, string deviceId, IEnumerable<PeopleWiseApiChannel> channelIndexList, DateTime currentTime)
        {
            try
            {
                foreach (var channel in channelIndexList.Select(x => x.Channel).Distinct())
                {
                    var configurationResponse = await _deviceApiService.CallDeviceApi<MultiLaneConfiguration>(ip + WiseAPIConstant.MultiLaneVehicleConfiguration + channel, userName, password);
                    if (configurationResponse != null && configurationResponse.Configurations.FirstOrDefault(x => x.Channel == channel).Enable)
                    {
                        var apiResponse = await _deviceApiService.CallDeviceApi<MultiLaneCountingLiveResponse>(ip + WiseAPIConstant.MultiLaneVehicleCount + channel + "&includeAIData=true", userName, password);
                        if (apiResponse != null)
                        {
                            var MultiLaneVehicleCount = new MultiLaneVehicleCount
                            {
                                DeviceId = deviceId,
                                CameraIP = ip,
                                ChannelNo = channel,
                                DirectionCount = apiResponse.countingLive.SelectMany(x => x.CountingRules).SelectMany(l => l.DirectionBasedResult.Select(y => new MultiLaneVehicleDirection
                                {
                                    Direction = configurationResponse.Configurations.FirstOrDefault(x => x.Channel == channel).countingRules.FirstOrDefault(c => c.Index == l.Index).Name,
                                    Count = y.Count,
                                })).AsEnumerable(),
                                CreatedOn = currentTime,
                                UpdatedOn = currentTime,
                            };

                            await _multiLaneVehicleCountService.InsertMultiLaneVehicleCount(MultiLaneVehicleCount);
                        }
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
                    exceptionLog2.RequestPath = "Multilane job";
                    exceptionLog2.ResponseTime = DateTime.Now;
                    exceptionLog2.IsSuccess = false;
                    await exceptionLog.SaveExceptionLogAsync(exceptionLog2);
                }
                return false;
            }

        }
    }
}
