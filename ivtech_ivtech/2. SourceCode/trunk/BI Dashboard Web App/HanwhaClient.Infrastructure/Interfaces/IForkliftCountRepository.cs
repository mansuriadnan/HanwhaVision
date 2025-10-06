using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.Dto;

namespace HanwhaClient.Infrastructure.Interfaces
{
    public interface IForkliftCountRepository : IRepositoryBase<ForkliftCount>
    {
        Task<IEnumerable<EventQueueAnalysis>> ForkliftCountAnalysisDataAsync(string deviceId, DateTime startdate, DateTime enddate, int channel, int intervalMinute);
    }
}
