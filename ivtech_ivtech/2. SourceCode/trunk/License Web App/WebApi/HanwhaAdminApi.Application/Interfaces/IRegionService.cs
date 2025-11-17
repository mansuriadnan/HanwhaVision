using HanwhaAdminApi.Model.DbEntities;
using HanwhaAdminApi.Model.Dto.Role;

namespace HanwhaAdminApi.Application.Interfaces
{
    public interface IRegionService
    {
        Task<IEnumerable<CountryMaster>> GetCountriesAsync();
        Task<IEnumerable<StateMaster>> GetStatesByCountryIdAsync(string Id);
        Task<IEnumerable<CityMaster>> GetCitiesAsync(string? countryId, string? stateId);
    }
}
