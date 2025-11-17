using HanwhaClient.Application.Interfaces;
using HanwhaClient.Core.Interfaces;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Infrastructure.Repository;
using HanwhaClient.Model.Dto;
using HanwhaClient.Model.PeopleWidget;

namespace HanwhaClient.Application.Services
{
    public class PeopleWidgetService : IPeopleWidgetService
    {
        private readonly IZoneRepository _zoneRepository;
        private readonly IZoneCameraRepository _zoneCameraRepository;
        private readonly IDateConvert _dateConvert;
        private readonly IPeopleCountRepository _peopleCountRepository;
        private readonly IUsersService _usersService;

        public PeopleWidgetService(IZoneRepository zoneRepository,
            IZoneCameraRepository zoneCameraRepository,
            IDateConvert dateConvert,
            IUsersService usersService,
            IPeopleCountRepository peopleCountRepository)
        {
            _zoneRepository = zoneRepository;
            _zoneCameraRepository = zoneCameraRepository;
            _peopleCountRepository = peopleCountRepository;
            _dateConvert = dateConvert;
            _usersService = usersService;
        }

        public async Task<IEnumerable<GenderWisePeopleCounting>> GenderWisePeopleCounting(WidgetRequest widgetRequest)
        {
            var zones = await _zoneRepository.GetZonesByMultipleFloorIdZoneIdAsync(widgetRequest.FloorIds, widgetRequest.ZoneIds);

            GenderWisePeopleCounting malePeopleCounting = new GenderWisePeopleCounting() { Gender = "Male" };
            GenderWisePeopleCounting femalePeopleCounting = new GenderWisePeopleCounting() { Gender = "Female" };
            GenderWisePeopleCounting unknownPeopleCounting = new GenderWisePeopleCounting() { Gender = "Unknown" };

            if (zones != null && zones.Count() > 0)
            {
                var zoneCameraList = await _zoneCameraRepository.GetCamerasByZoneIds(zones.Select(x => x.Id));
                var timeZone = await _usersService.GetTimeZone(widgetRequest.UserId);
                var offsetTimeStamp = _dateConvert.GetTimeSpanByOffset(timeZone.UtcOffset);

                var peopleCountResult = await _peopleCountRepository.GenderWisePeopleCountingAsync(widgetRequest, zoneCameraList, offsetTimeStamp);
                
                foreach (var item in peopleCountResult)
                {
                    foreach (var genderItem in item.peopleInCount.Lines)
                    {
                        if (genderItem.GenderInfo != null)
                        {
                            if (zoneCameraList.Where(x => x.PeopleLineIndex.Contains(genderItem.LineIndex)).Any())
                            {
                                var maleCount = genderItem.GenderInfo.Where(x => x.GenderType == "Male").Select(x => x.Count).FirstOrDefault();
                                var femaleCount = genderItem.GenderInfo.Where(x => x.GenderType == "Female").Select(x => x.Count).FirstOrDefault();
                                var UnknownCount = genderItem.GenderInfo.Where(x => x.GenderType == "Unknown").Select(x => x.Count).FirstOrDefault();

                                malePeopleCounting.Count += maleCount;
                                femalePeopleCounting.Count += femaleCount;
                                unknownPeopleCounting.Count += UnknownCount;

                                if (maleCount == 0) malePeopleCounting.MinDate = item.date;
                                if (femaleCount == 0) femalePeopleCounting.MinDate = item.date;
                                if (UnknownCount == 0) unknownPeopleCounting.MinDate = item.date;

                                if (maleCount > 0 && malePeopleCounting.MinCount >= maleCount )
                                {
                                    malePeopleCounting.MinCount = maleCount;
                                    malePeopleCounting.MinDate = item.date;
                                }
                                if (malePeopleCounting.MaxCount <= maleCount)
                                {
                                    malePeopleCounting.MaxCount = maleCount;
                                    malePeopleCounting.MaxDate = item.date;
                                }

                                if (femaleCount > 0 && femalePeopleCounting.MinCount >= femaleCount)
                                {
                                    femalePeopleCounting.MinCount = femaleCount;
                                    femalePeopleCounting.MinDate = item.date;
                                }
                                if (femalePeopleCounting.MaxCount <= femaleCount)
                                {
                                    femalePeopleCounting.MaxCount = femaleCount;
                                    femalePeopleCounting.MaxDate = item.date;
                                }

                                if (UnknownCount > 0 && unknownPeopleCounting.MinCount >= UnknownCount)
                                {
                                    unknownPeopleCounting.MinCount = UnknownCount;
                                    unknownPeopleCounting.MinDate = item.date;
                                }
                                if (unknownPeopleCounting.MaxCount <= UnknownCount)
                                {
                                    unknownPeopleCounting.MaxCount = UnknownCount;
                                    unknownPeopleCounting.MaxDate = item.date;
                                }
                            }
                        }
                    }
                }
            }
            malePeopleCounting.MinCount = malePeopleCounting.MinCount == int.MaxValue ? malePeopleCounting.MinCount = 0 : malePeopleCounting.MinCount;
            femalePeopleCounting.MinCount = femalePeopleCounting.MinCount == int.MaxValue ? femalePeopleCounting.MinCount = 0 : femalePeopleCounting.MinCount;
            unknownPeopleCounting.MinCount = unknownPeopleCounting.MinCount == int.MaxValue ? unknownPeopleCounting.MinCount = 0 : unknownPeopleCounting.MinCount;
            return [malePeopleCounting, femalePeopleCounting, unknownPeopleCounting];
        }
    }
}
