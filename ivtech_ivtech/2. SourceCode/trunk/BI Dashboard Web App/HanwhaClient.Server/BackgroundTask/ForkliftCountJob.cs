using HanwhaClient.Application.Interfaces;
using HanwhaClient.Core.Interfaces;
using HanwhaClient.Helper;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.DeviceApiResponse;
using Quartz;

namespace HanwhaClient.Server.BackgroundTask
{
    public class ForkliftCountJob : IJob
    {
        private readonly IDeviceApiService _deviceApiService;
        private readonly IDeviceMasterService _deviceMasterService;
        private readonly IForkliftCountService _forkliftCountService;
        private readonly IFileLogger _fileLogger;
        private readonly ILogger<GlobalExceptionHandlerMiddleware> _logger;
        private readonly IServiceProvider _serviceProvider;
        private readonly IForkliftCountRepository _forkliftCountRepository;
        private readonly IBackgroundJobCountService _backgroundJobCountService;
        public ForkliftCountJob(IDeviceApiService deviceApiService,
                               IDeviceMasterService deviceMasterService,
                               IForkliftCountService forkliftCountService,
                               IFileLogger fileLogger,
                               ILogger<GlobalExceptionHandlerMiddleware> logger,
                               IServiceProvider serviceProvider,
                               IForkliftCountRepository forkliftCountRepository,
                               IBackgroundJobCountService backgroundJobCountService)
        {
            _deviceApiService = deviceApiService;
            _deviceMasterService = deviceMasterService;
            _forkliftCountService = forkliftCountService;
            _fileLogger = fileLogger;
            _logger = logger;
            _serviceProvider = serviceProvider;
            _forkliftCountRepository = forkliftCountRepository;
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
                _fileLogger.Log("Forklift job execution starts");
                Console.WriteLine($"Example job executed at: {DateTime.Now}");
                var jobName = context.JobDetail.Key.Name;
                var jobGroup = context.JobDetail.Key.Group;

                List<Task> forkliftTasks = new List<Task>();
                var deviceDetail = _deviceMasterService.GetForkliftDeviceListAsync().Result;
                if (deviceDetail != null && deviceDetail.Count() > 0)
                {
                    var delayTime = 60000 / deviceDetail.Count();
                    foreach (var device in deviceDetail)
                    {
                        forkliftTasks.Add(AddForkliftCountFromWiseAi((device.IsHttps ? "https://" : "http://") + device.IpAddress, device.Username, device.Password, device.Id, device.ChannelIndexList, currentUtcTime));
                        await Task.Delay(delayTime);
                    }
                }
                await Task.WhenAll(forkliftTasks);
                if (_backgroundJobCountService.ForkliftCounts != null && _backgroundJobCountService.ForkliftCounts.Count > 0)
                {
                    const int batchSize = 100;
                    var totalRecords = _backgroundJobCountService.ForkliftCounts.Count;

                    for (int i = 0; i < totalRecords; i += batchSize)
                    {
                        var batch = _backgroundJobCountService.ForkliftCounts
                            .Skip(i)
                            .Take(batchSize)
                            .ToList();

                        await _forkliftCountRepository.InsertManyAsync(batch);
                    }
                    _backgroundJobCountService.ForkliftCounts.Clear();
                }
                Console.WriteLine($"Job {jobName} from group {jobGroup} executed at: {DateTime.Now}");
                _fileLogger.Log("Forklift job execution ends");
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
                    exceptionLog2.RequestPath = "Forklift job";
                    exceptionLog2.ResponseTime = DateTime.Now;
                    exceptionLog2.IsSuccess = false;
                    await exceptionLog.SaveExceptionLogAsync(exceptionLog2);
                }
                return;
            }

        }

        public async Task<bool> AddForkliftCountFromWiseAi(string ip, string userName, string password, string deviceId, IEnumerable<PeopleWiseApiChannel> channelIndexList, DateTime currentTime)
        {
            try
            {
                foreach (var channel in channelIndexList.Select(x => x.Channel).Distinct())
                {
                    var apiResponse = await _deviceApiService.CallDeviceApi<ObjectCountingLiveResponse>(ip + WiseAPIConstant.PeopleCountCheck + channel + "&index=" + channelIndexList.Where(x => x.Channel == channel).First().ChannelDataIndex + "&includeAIData=true", userName, password);
                    if (apiResponse != null)
                    {
                        var forkliftCount = new ForkliftCount
                        {
                            DeviceId = deviceId,
                            CameraIP = ip,
                            ChannelNo = channel,
                            Lines = apiResponse.ObjectCountingLive.SelectMany(x => x.CountingRules.Where(cr => cr.Index == channelIndexList.Where(x => x.Channel == channel).FirstOrDefault()?.ChannelDataIndex).SelectMany(l => l.Lines.Select(y => new ForkliftLine
                            {
                                LineIndex = y.Index,
                                Name = channelIndexList.Where(x => x.Channel == channel && x.LineIndex == y.Index).FirstOrDefault()?.IndexName ?? "",
                                InCount = y.DirectionBasedResult.FirstOrDefault(d => d.Direction == "IN")?.Count ?? 0,
                                OutCount = y.DirectionBasedResult.FirstOrDefault(d => d.Direction == "OUT")?.Count ?? 0,
                            })).AsEnumerable()),
                            CreatedOn = currentTime,
                            UpdatedOn = currentTime,
                        };
                        var result = _forkliftCountService.InsertForkliftCount(forkliftCount);
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
                    exceptionLog2.RequestPath = "Forklift job";
                    exceptionLog2.ResponseTime = DateTime.Now;
                    exceptionLog2.IsSuccess = false;
                    await exceptionLog.SaveExceptionLogAsync(exceptionLog2);
                }
                return false;
            }

        }
    }
}
