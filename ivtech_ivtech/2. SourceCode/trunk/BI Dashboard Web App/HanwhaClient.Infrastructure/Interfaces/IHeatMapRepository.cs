using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.Dto;

namespace HanwhaClient.Infrastructure.Interfaces
{
    public interface IHeatMapRepository : IRepositoryBase<HeatMap>
    {
        Task<IEnumerable<HeatMap>> HeatMapWidgetDataAsync(WidgetHeatmapRequest widgetRequest);
        Task<IEnumerable<string>> GetCameraListByHeatmapTypeAsync(string heatmapType);
    }
}
