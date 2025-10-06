using HanwhaClient.Application.Interfaces;
using HanwhaClient.Core.Interfaces;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.DeviceApiResponse;
using HanwhaClient.Model.Dto;
using MongoDB.Driver;

namespace HanwhaClient.Application.Services
{
    public class PeopleCountService : IPeopleCountService
    {
        private readonly IPeopleCountRepository _peopleCountRepository;
        private readonly IZoneCameraRepository _zoneCameraRepository;
        private readonly IClientSettingService _clientSettingService;
        private readonly IDeviceDataStoreService _deviceDataStoreService;
        private readonly IBackgroundJobCountService _backgroundJobCountService;
        private readonly IFileLogger _fileLogger;
        public PeopleCountService(IPeopleCountRepository peopleCountRepository,
            IZoneCameraRepository zoneCameraRepository,
            IClientSettingService clientSettingService,
            IDeviceDataStoreService deviceDataStoreService,
            IFileLogger fileLogger,
            IBackgroundJobCountService backgroundJobCountService)
        {
            _peopleCountRepository = peopleCountRepository;
            _zoneCameraRepository = zoneCameraRepository;
            _clientSettingService = clientSettingService;
            _deviceDataStoreService = deviceDataStoreService;
            _fileLogger = fileLogger;
            _backgroundJobCountService = backgroundJobCountService;
        }
        public async Task<IEnumerable<PeopleCountDto>> GetCamerasBySelectedDateAsync(string? selectedDate)
        {
           // var peopleCounts = await _peopleCountRepository.GetAllAsync();
            var peopleCounts = await _peopleCountRepository.GetCamerasBySelectedDate(selectedDate);

            var peopleCountDtos = new List<PeopleCountDto>();
            foreach (var item in peopleCounts)
            {
                peopleCountDtos.Add(new PeopleCountDto
                {
                    CameraId = item.DeviceId,
                    CameraIp = item.CameraIP,
                    Lines = item.Lines.Select(line => new LineDto
                    {
                        LineIndex = line.LineIndex,
                        Name = line.Name,
                        InCount = line.InCount,
                        OutCount = line.OutCount
                    })
                });
            }

            return peopleCountDtos;
        }

        public async Task<List<PeopleCountDto>> GetPeopleCountByZoneIdOrCameraId(string? zoneId, string? cameraId)
        {
            List<string> cameraIds = new List<string>();

            if (!string.IsNullOrEmpty(zoneId))
            {
                var zoneCameras = await _zoneCameraRepository.GetCamerasByZoneId(zoneId);
                cameraIds = zoneCameras.Select(zc => zc.DeviceId).ToList();
            }
            else if (!string.IsNullOrEmpty(cameraId))
            {
                cameraIds.Add(cameraId);
            }

            if (cameraIds.Count == 0)
            {
                return new List<PeopleCountDto>(); // Return empty list if no valid input
            }

            var peopleCounts = await _peopleCountRepository.GetCamerasByCameraIds(cameraIds);

            return peopleCounts.Select(item => new PeopleCountDto
            {
                CameraId = item.DeviceId,
                CameraIp = item.CameraIP,
                Lines = item.Lines.Select(line => new LineDto
                {
                    LineIndex = line.LineIndex,
                    Name = line.Name,
                    InCount = line.InCount,
                    OutCount = line.OutCount
                }).ToList()
            }).ToList();
        }


        public async Task<string> InsertPeople(PeopleCount peopleCountDetail, string userId = "")
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
                TimeSpan currentTime = TimeZoneInfo.ConvertTimeFromUtc(peopleCountDetail.CreatedOn.Value, TimeZoneInfo.Local).TimeOfDay;
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
                    _deviceDataStoreService.CachePeopleCount(peopleCountDetail);
                    _fileLogger.Log("People Caching started for device :--:  " + peopleCountDetail.DeviceId);
                }

                if (isCarryForwardRequired)
                {
                    PeopleCount cachePeopleCount = await _deviceDataStoreService.GetCachePeopleCount(peopleCountDetail.DeviceId, peopleCountDetail.ChannelNo);
                    _fileLogger.Log("People Carry forward for device :--:  " + peopleCountDetail.DeviceId);
                    if (cachePeopleCount != null)
                    {
                        if (cachePeopleCount.Lines == null)
                            cachePeopleCount.Lines = new List<Line>();

                        var cachedLines = cachePeopleCount.Lines.ToList();

                        var tempPeopleCountDetail = peopleCountDetail.Lines.ToList();

                        foreach (var newLine in tempPeopleCountDetail)
                        {
                            var cachedLine = cachedLines.FirstOrDefault(x => x.LineIndex == newLine.LineIndex);

                            if (cachedLine != null)
                            {
                                // Merge counts
                                newLine.InCount = newLine.InCount + cachedLine.InCount;
                                newLine.OutCount = newLine.OutCount + cachedLine.OutCount;

                                // Merge AgeInfo
                                if (newLine.AgeInfo != null)
                                {
                                    if (cachedLine.AgeInfo == null)
                                        cachedLine.AgeInfo = new List<PeopleAge>();

                                    foreach (var newAge in newLine.AgeInfo)
                                    {
                                        var cachedAge = cachedLine.AgeInfo.FirstOrDefault(a => a.AgeType == newAge.AgeType);
                                        if (cachedAge != null)
                                            newAge.Count = newAge.Count + cachedAge.Count;
                                        //else
                                            //cachedLine.AgeInfo.Add(new PeopleAge { AgeType = newAge.AgeType, Count = newAge.Count });
                                    }
                                }

                                // Merge GenderInfo
                                if (newLine.GenderInfo != null)
                                {
                                    if (cachedLine.GenderInfo == null)
                                        cachedLine.GenderInfo = new List<PeopleGender>();

                                    foreach (var newGender in newLine.GenderInfo)
                                    {
                                        var cachedGender = cachedLine.GenderInfo.FirstOrDefault(g => g.GenderType == newGender.GenderType);
                                        if (cachedGender != null)
                                            newGender.Count = newGender.Count + cachedGender.Count;
                                        //else
                                        //    cachedLine.GenderInfo.Add(new PeopleGender { GenderType = newGender.GenderType, Count = newGender.Count });
                                    }
                                }
                            }
                        }

                        peopleCountDetail.Lines = tempPeopleCountDetail;

                        _backgroundJobCountService.PeopleCountList.Add(peopleCountDetail);
                        return "";
                        //return await _peopleCountRepository.InsertAsync(peopleCountDetail);
                    }
                }
            }

            _backgroundJobCountService.PeopleCountList.Add(peopleCountDetail);
            return "";
            //return await _peopleCountRepository.InsertAsync(peopleCountDetail);
        }
    }
}
