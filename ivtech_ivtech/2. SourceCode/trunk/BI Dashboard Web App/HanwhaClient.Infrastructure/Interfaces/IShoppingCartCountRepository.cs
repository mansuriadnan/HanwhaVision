using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.Dto;

namespace HanwhaClient.Infrastructure.Interfaces
{
    public interface IShoppingCartCountRepository : IRepositoryBase<ShoppingCartCount>
    {
        Task<IEnumerable<EventQueueAnalysis>> ShoppingCartCountAnalysisData(string deviceId, DateTime startdate, DateTime enddate, int channel,int intervalMinute);
    }
}
