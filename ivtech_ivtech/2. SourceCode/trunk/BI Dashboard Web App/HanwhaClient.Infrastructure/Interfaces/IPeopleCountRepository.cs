using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.Dto;
using HanwhaClient.Model.PeopleWidget;
using MongoDB.Driver;
using static HanwhaClient.Infrastructure.Repository.PeopleCountRepository;

namespace HanwhaClient.Infrastructure.Interfaces
{
    public interface IPeopleCountRepository : IRepositoryBase<PeopleCount>
    {
        Task<List<PeopleCount>> GetCamerasByCameraIds(List<string> cameraIds);
        Task<List<PeopleCount>> GetCamerasBySelectedDate(string currentDate);
        Task<IEnumerable<CameraCapacityUtilizationByDevice>> GetPeopleCameraCapacityUtilizationByDeviceAsync(string deviceId, DateTime startdate, DateTime enddate, TimeSpan timeOffSet, int channel, int[]? peopleLineIndex = null);
        Task<IEnumerable<CountAnalysisData>> PeopleCameraCapacityUtilizationAnalysisByZones(string deviceId, DateTime startdate, DateTime enddate, int channel, int[]? peopleLineIndex = null, int intervalMinute = 10);
        Task<List<PeopleVehicleCountSummary>> GetPeopleCountMinMaxAverageAsync(string deviceIds, DateTime startdate, DateTime enddate, TimeSpan offset, int[]? peopleLineIndex = null, int channelNo = 0);
        //Task<List<PeopleCountRawDto>> GetHourlyLatestPeopleCountAsync(string deviceIds, DateTime startdate, DateTime enddate, int[]? peopleLineIndex = null, int channelNo = 0);
        Task<List<PeopleVehicleCountSummary>> GetHourlyLatestPeopleCountAsync(string deviceIds, DateTime startdate, DateTime enddate, int[]? peopleLineIndex = null, int channelNo = 0, int intervalMinutes = 60);
        Task<PeopleCountByDevice> GetPeopleCountByDeviceAsync(string deviceId, DateTime startdate, DateTime enddate, int channel,TimeSpan offset, int[]? peopleLineIndex = null);
        Task<List<NewVsTotalVisitorCountWidgetData>> GetLatestPeopleCountDetails(FilterDefinition<PeopleCount> filter, TimeSpan offset);
        Task<IEnumerable<(DateTime date, PeopleCount peopleInCount)>> GenderWisePeopleCountingAsync(WidgetRequest widgetRequest, IEnumerable<ZoneCamera> zoneCameras, TimeSpan timeOffset);
        Task<List<PeopleCountAggregatedDto>> GetPeopleCountHalfHourlyAverageAsync(string deviceIds, DateTime startdate, DateTime enddate, int[]? peopleLineIndex = null, int channelNo = 0);
        Task<IEnumerable<GenderWisePeopleAnalysisCount>> GenderWisePeopleCountAnalysisData(string deviceId, DateTime startdate, DateTime enddate, int channel, int[]? peopleLineIndex = null, int intervalMinutes = 10);
        Task<PeopleVehicleInOutTotal> GetPeopleCountForReportAsync(DateTime startdate, DateTime enddate);
        Task<List<PeopleVehicleCountSummary>> GetPeopleBasedAsync(string deviceIds, DateTime startdate, DateTime enddate, int[]? peopleLineIndex = null, int channelNo = 0, int intervalMinutes = 30);
        Task<IEnumerable<PeopleVehicleInOutAvgChart>> PeopleInOutCountAnalysisAsync(string deviceId, DateTime startdate, DateTime enddate, int channel, int[]? peopleLineIndex = null, int intervalMinutes = 10);
    }
}
