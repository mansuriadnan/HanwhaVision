using HanwhaAdminApi.Model.DbEntities;

namespace HanwhaAdminApi.Infrastructure.Interfaces
{
    public interface IRegionCityRepository : IRepositoryBase<CityMaster>
    {
        Task<IEnumerable<CityMaster>> GetCitiesAsync(string? countryId, string? stateId);
    }
}
