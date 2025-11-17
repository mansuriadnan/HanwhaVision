using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.Dto;

namespace HanwhaClient.Infrastructure.Interfaces
{
    public interface IQueueManagementRepository : IRepositoryBase<QueueManagement>
    {
        Task<IEnumerable<EventQueueAnalysis>> VehicleQueueAnalysisDataAsync(string deviceId, DateTime startdate, DateTime enddate, int channel,int intervalMinute);
        Task<IEnumerable<EventQueueAnalysis>> ForkliftQueueAnalysisDataAsync(string deviceId, DateTime startdate, DateTime enddate, int channel, int intervalMinute);
        Task<IEnumerable<EventQueueAnalysis>> ShoppingQueueAnalysisDataAsync(string deviceId, DateTime startdate, DateTime enddate, int channel,int intervalMinute);
        Task<IEnumerable<EventQueueAnalysis>> PeopleQueueAnalysisDataAsync(string deviceId, DateTime startdate, DateTime enddate, int channel, int intervalMinute);
        
    }
}
