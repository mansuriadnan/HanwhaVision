using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.Dto;

namespace HanwhaClient.Infrastructure.Interfaces
{
    public interface IDeviceEventsRepository : IRepositoryBase<DeviceEvents>
    {
        Task<(IEnumerable<DeviceEventsLogsResponse> deviceDetails, int eventCount)> GetDeviceEventsLogsAsync(DeviceEventsLogsRequest request);
        Task<(IEnumerable<DeviceEvents> deviceDetails, int eventCount)> GetDeviceEventsLogsAsync1(DeviceEventsLogsRequest request);
        Task<bool> UpdateDeviceEventsStatusAsync(string id, string userId);
        Task<IEnumerable<EventQueueAnalysis>> PedestrianQueueAnalysisDataAsync(string deviceId, DateTime startdate, DateTime enddate, int channel, int intervalMinute);
        Task<IEnumerable<EventQueueAnalysis>> ProxomityDetectionAnalysisDataAsync(string deviceId, DateTime startdate, DateTime enddate, int channel, int intervalMinute);
        Task<IEnumerable<StoppedVehicleByTypeData>> StoppedVehicleByTypeAnalysisDataAsync(string deviceId, DateTime startdate, DateTime enddate, int channel, int intervalMinute);
        Task<IEnumerable<EventQueueAnalysis>> VehicleSpeedViolationAnalysisDataAsync(string deviceId, DateTime startdate, DateTime enddate, int channel, int intervalMinute);
        Task<IEnumerable<EventQueueAnalysis>> TrafficJamAnalysisDataAsync(string deviceId, DateTime startdate, DateTime enddate, int channel,int intervalMinute);
        Task<IEnumerable<EventQueueAnalysis>> SlipFallQueueAnalysisDataAsync(string deviceId, DateTime startdate, DateTime enddate, int channel, int intervalMinute);
        Task<IEnumerable<EventQueueAnalysis>> WrongWayQueueAnalysisDataAsync(string deviceId, DateTime startdate, DateTime enddate, int channel, int intervalMinute);
        Task<IEnumerable<EventQueueAnalysis>> BlockedExitAnalysisDataAsync(string deviceId, DateTime startdate, DateTime enddate, int channel, int intervalMinute);
        Task<IEnumerable<EventQueueAnalysis>> VehicleUTurnAnalysisDataAsync(string deviceId, DateTime startdate, DateTime enddate, int channel, int intervalMinute);
        Task<IEnumerable<EventQueueAnalysis>> SpeedDetectionByVehicleAsync(string deviceId, DateTime startdate, DateTime enddate, int channel, int IntervalMinute);
        Task<IEnumerable<EventQueueAnalysis>> ForkliftSpeedDetectionAnalysisAsync(string deviceId, DateTime startdate, DateTime enddate, int channel, int IntervalMinute);
    }
}
