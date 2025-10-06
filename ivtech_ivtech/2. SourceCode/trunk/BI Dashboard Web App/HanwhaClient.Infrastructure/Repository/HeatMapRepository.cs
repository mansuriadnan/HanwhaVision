using HanwhaClient.Infrastructure.Connection;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.Dto;
using MongoDB.Driver;
using System.Threading.Channels;

namespace HanwhaClient.Infrastructure.Repository
{
    public class HeatMapRepository : RepositoryBase<HeatMap>, IHeatMapRepository
    {
        public HeatMapRepository(MongoDbConnectionService mongoDbConnectionService) : base(mongoDbConnectionService, AppDBConstants.HeatMap)
        {
        }

        public async Task<IEnumerable<HeatMap>> HeatMapWidgetDataAsync(WidgetHeatmapRequest widgetRequest)
        {
            var filters = new List<FilterDefinition<HeatMap>>();
            filters.Add(Builders<HeatMap>.Filter.Eq(x => x.DeviceId, widgetRequest.DeviceId));
            filters.Add(Builders<HeatMap>.Filter.Gte(x => x.CreatedOn, widgetRequest.StartDate));
            filters.Add(Builders<HeatMap>.Filter.Lte(x => x.CreatedOn, widgetRequest.EndDate));
            filters.Add(Builders<HeatMap>.Filter.Eq(x => x.ChannelNo, widgetRequest.ChannelNo));
            filters.Add(Builders<HeatMap>.Filter.Eq(x => x.HeatMapType, widgetRequest.HeatmapType));


            var filter = filters.Any() ? Builders<HeatMap>.Filter.And(filters) : Builders<HeatMap>.Filter.Empty;

            var data = await dbEntity.Find(filter).ToListAsync();
            return data;
        }

        public async Task<IEnumerable<string>> GetCameraListByHeatmapTypeAsync(string heatmapType)
        {
            ProjectionDefinition<HeatMap> projection = Builders<HeatMap>.Projection
            .Include("deviceId");
            
            var filter = Builders<HeatMap>.Filter.Eq(x => x.HeatMapType, heatmapType);
            var data = await dbEntity.Find(filter).Project<HeatMap>(projection).ToListAsync();

            IEnumerable<string> deviceIds = data.Select(x => x.DeviceId).Distinct().AsEnumerable();
            return deviceIds;
        }
    }
}
