using HanwhaClient.Application.Interfaces;
using HanwhaClient.Application.Services;
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
    public class PeopleCountJob : IJob
    {
        private readonly IDeviceApiService _deviceApiService;
        private readonly IPeopleCountService _peopleCountService;
        private readonly IDeviceMasterService _deviceMasterService;
        private readonly IFileLogger _fileLogger;
        private readonly ILogger<GlobalExceptionHandlerMiddleware> _logger;
        private readonly IServiceProvider _serviceProvider;
        private readonly IBackgroundJobCountService _backgroundJobCountService;
        private readonly IPeopleCountRepository _peopleCountRepository;

        public PeopleCountJob(IDeviceApiService deviceApiService,
                IPeopleCountService peopleCountService,
                IDeviceMasterService deviceMasterService,
                IFileLogger fileLogger,
                ILogger<GlobalExceptionHandlerMiddleware> logger,
                IServiceProvider serviceProvider,
                IDeviceDataStoreService deviceDataStoreService,
                IBackgroundJobCountService backgroundJobCountService,
                IPeopleCountRepository peopleCountRepository)
        {
            _deviceApiService = deviceApiService;
            _peopleCountService = peopleCountService;
            _deviceMasterService = deviceMasterService;
            _fileLogger = fileLogger;
            _logger = logger;
            _serviceProvider = serviceProvider;
            _peopleCountRepository = peopleCountRepository;
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
                _fileLogger.Log("People job execution starts");
                Console.WriteLine($"Example job executed at: {DateTime.Now}");
                var jobName = context.JobDetail.Key.Name;
                var jobGroup = context.JobDetail.Key.Group;

                List<Task> peopleTasks = new List<Task>();
                var deviceDetail = _deviceMasterService.GetPeopleDeviceListAsync().Result;
                if (deviceDetail != null && deviceDetail.Count() > 0)
                {
                    var delayTime = 60000 / deviceDetail.Count();
                    foreach (var device in deviceDetail)
                    {
                        
                        if (device.ApiModel == "SUNAPI")
                        {
                            peopleTasks.Add(AddPeopleCountFromSunapi((device.IsHttps ? "https://" : "http://") + device.IpAddress, device.Username, device.Password, device.Id, currentUtcTime));
                        }
                        else if (device.ApiModel == "WiseAI")
                        {
                            peopleTasks.Add(AddPeopleCountFromWiseAi((device.IsHttps ? "https://" : "http://") + device.IpAddress, device.Username, device.Password, device.Id, device.ChannelIndexList, currentUtcTime));             
                        }
                            await Task.Delay(delayTime);
                    }
                }
                await Task.WhenAll(peopleTasks);
                if(_backgroundJobCountService.PeopleCountList != null && _backgroundJobCountService.PeopleCountList.Count > 0)
                {
                    const int batchSize = 100;
                    var totalRecords = _backgroundJobCountService.PeopleCountList.Count;

                    for (int i = 0; i < totalRecords; i += batchSize)
                    {
                        var batch = _backgroundJobCountService.PeopleCountList
                            .Skip(i)
                            .Take(batchSize)
                            .ToList();

                        await _peopleCountRepository.InsertManyAsync(batch);
                    }
                    _backgroundJobCountService.PeopleCountList.Clear();
                }
                
                
                Console.WriteLine($"Job {jobName} from group {jobGroup} executed at: {DateTime.Now}");
                _fileLogger.Log("People job execution ends");
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
                    exceptionLog2.RequestPath = "People count job";
                    exceptionLog2.ResponseTime = DateTime.Now;
                    exceptionLog2.IsSuccess = false;
                    await exceptionLog.SaveExceptionLogAsync(exceptionLog2);
                }
                return ;
            }
            
        }

        public async Task<bool> AddPeopleCountFromSunapi(string ip, string userName, string password, string deviceId, DateTime currentTime)
        {
            try
            {
                var apiResponse = await _deviceApiService.CallDeviceApi<PeopleCountResponse>(ip + SunapiAPIConstant.PeopleCountCheck, userName, password);
                if (apiResponse != null)
                {
                    var peopleCount = new PeopleCount
                    {
                        DeviceId = deviceId,
                        CameraIP = ip,
                        ChannelNo = apiResponse.PeopleCount.FirstOrDefault().Channel,
                        Lines = apiResponse.PeopleCount.SelectMany(x => x.Lines.Select(l => new Line
                        {
                            LineIndex = l.LineIndex,
                            Name = l.Name,
                            InCount = l.InCount,
                            OutCount = l.OutCount
                        }).AsEnumerable()),
                        CreatedOn = currentTime,
                        UpdatedOn = currentTime
                    };
                    var result = _peopleCountService.InsertPeople(peopleCount);
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
                    exceptionLog2.RequestPath = "People count job";
                    exceptionLog2.ResponseTime = DateTime.Now;
                    exceptionLog2.IsSuccess = false;
                    await exceptionLog.SaveExceptionLogAsync(exceptionLog2);
                }
                return false;
            }

        }


        public async Task<bool> AddPeopleCountFromWiseAi(string ip, string userName, string password, string deviceId, IEnumerable<PeopleWiseApiChannel> channelIndexList, DateTime currentTime)
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
                        var peopleCount = new PeopleCount
                        {
                            DeviceId = deviceId,
                            CameraIP = ip,
                            ChannelNo = channel,
                            Lines = apiResponse.ObjectCountingLive.SelectMany(x => x.CountingRules.Where(cr => cr.Index == channelIndexList.Where(x => x.Channel == channel).FirstOrDefault()?.ChannelDataIndex).SelectMany(l => l.Lines.Select(y => new Line
                            {
                                LineIndex = y.Index,
                                Name = channelIndexList.Where(x => x.Channel == channel && x.LineIndex == y.Index).FirstOrDefault()?.IndexName ?? "",
                                InCount = y.DirectionBasedResult.FirstOrDefault(d => d.Direction == "IN")?.Count ?? 0,
                                OutCount = y.DirectionBasedResult.FirstOrDefault(d => d.Direction == "OUT")?.Count ?? 0,
                                AgeInfo = y.DirectionBasedResult.FirstOrDefault(d => d.Direction == "IN")?.genderAgeInfo?.FirstOrDefault().Age.Select(a => new PeopleAge
                                {
                                    AgeType = a.AgeType,
                                    Count = a.Count
                                }).ToList(),
                                GenderInfo = y.DirectionBasedResult.FirstOrDefault(d => d.Direction == "IN")?.genderAgeInfo?.FirstOrDefault().Gender.Select(a => new PeopleGender
                                {
                                    GenderType = a.GenderType,
                                    Count = a.Count
                                }).ToList()
                            })).AsEnumerable()),
                            CreatedOn = currentTime,
                            UpdatedOn = currentTime,

                        };
                        var result = _peopleCountService.InsertPeople(peopleCount);
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
                    exceptionLog2.RequestPath = "People count job";
                    exceptionLog2.ResponseTime = DateTime.Now;
                    exceptionLog2.IsSuccess = false;
                    await exceptionLog.SaveExceptionLogAsync(exceptionLog2);
                }
                return false;
            }

        }

    }
}
