using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.DeviceApiResponse;
using HanwhaClient.Model.Dto;
using MongoDB.Driver;

namespace HanwhaClient.Infrastructure.Interfaces
{
    public interface IVehicleRepository :IRepositoryBase<VehicleCount>
    {
        Task<IEnumerable<CameraCapacityUtilizationByDevice>> GetVehicleCameraCapacityUtilizationByDeviceAsync(string deviceId, DateTime startdate, DateTime enddate, TimeSpan timeOffSet, int channel, int[]? vehicleLineIndex = null);
        
        Task<List<PeopleVehicleCountSummary>> GetVehicleCountMinMaxAverageAsync(string deviceIds, DateTime startdate, DateTime enddate, TimeSpan timeOffSet, int[]? peopleLineIndex = null, int channelNo = 0);
        Task<List<VehicleByTypeCountWidgetData>> GetLatestVehicleCountDetails(FilterDefinition<VehicleCount> filter);
        Task<List<PeopleVehicleCountSummary>> GetAllVehicleChartDataAsync(string deviceIds, DateTime startdate, DateTime enddate, int[]? peopleLineIndex = null, int channelNo = 0, int intervalMinute = 10);
        Task<IEnumerable<CountAnalysisData>> VehicleCameraCapacityUtilizationAnalysisByZones(string deviceId, DateTime startdate, DateTime enddate, int channel, int[]? vehicleLineIndex = null, int intervalMinute = 10);
        Task<PeopleVehicleInOutTotal> GetVehicleCountForReportAsync(DateTime startDate, DateTime endDate);
        Task<List<VehicleByTypeChartSummary>> VehicleByTypeLineChartAsync(string deviceIds, DateTime startdate, DateTime enddate, int[]? peopleLineIndex = null, int channelNo = 0, int intervalMinute = 10);
    }
}
