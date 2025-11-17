using HanwhaClient.Model.DbEntities;

namespace HanwhaClient.Infrastructure.Interfaces
{
    public interface IZoneRepository : IRepositoryBase<ZoneMaster>
    {
        Task<IEnumerable<ZoneMaster>> GetZonesByFloorIdAsync(string siteId);
        Task<IEnumerable<ZoneMaster>> GetZonesByMultipleFloorIdZoneIdAsync(IEnumerable<string> floorIds, IEnumerable<string>? zoneIds = null);
        Task<string> GetDefalutZonesAsync();
        Task<bool> CheckZoneExistbyName(string zoneName, string floorId, string? zoneId);
        Task<IEnumerable<ZoneMaster>> GetZonesByIdsAsync(IEnumerable<string> zoneIds);
        Task<IEnumerable<ZoneMaster>> GetZoneIdByNameAsync(string zoneName);
        
    }
}
