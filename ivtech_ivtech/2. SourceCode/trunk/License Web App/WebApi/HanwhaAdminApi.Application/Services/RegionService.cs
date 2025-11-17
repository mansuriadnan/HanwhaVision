using HanwhaAdminApi.Application.Interfaces;
using HanwhaAdminApi.Infrastructure.Interfaces;
using HanwhaAdminApi.Model.DbEntities;
using HanwhaAdminApi.Model.Dto.Role;
using Microsoft.Extensions.Caching.Memory;
using MongoDB.Bson;
using MongoDB.Driver;

namespace HanwhaAdminApi.Application.Services
{
    public class RegionService : IRegionService
    {
        private readonly IRegionCountryRepository _regionCountryRepository;
        private readonly IRegionStateRepository _regionStateRepository;
        private readonly IRegionCityRepository _regionCityRepository;
        private readonly IMemoryCache _memoryCache;

        public RegionService(IRegionCountryRepository regionCountryRepository,
            IMemoryCache memoryCache,
            IRegionStateRepository regionStateRepository,
            IRegionCityRepository regionCityRepository)
        {
            this._regionCountryRepository = regionCountryRepository;
            _memoryCache = memoryCache;
            _regionStateRepository = regionStateRepository;
            _regionCityRepository = regionCityRepository;
        }

        public async Task<IEnumerable<CountryMaster>> GetCountriesAsync()
        {
            ProjectionDefinition<CountryMaster> projection = Builders<CountryMaster>.Projection
        .Include("_id")
        .Include("name")
        .Include("hasStates")
        .Include("code");
            var result = await _regionCountryRepository.GetAllAsync(projection);
            return await Task.FromResult(result.OrderBy(x => x.Name));
            //var cacheData = _memoryCache.Get<IEnumerable<CountryMaster>>("CountryMaster");
            //if (cacheData == null)
            //{

            //    cacheData = result;
            //    _memoryCache.Set("CountryMaster", cacheData, new MemoryCacheEntryOptions
            //    {
            //        AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5)
            //    });
            //}
        }

        public async Task<IEnumerable<StateMaster>> GetStatesByCountryIdAsync(string Id)
        {
            var result = await _regionStateRepository.GetStatesByCountryIdAsync(Id);
            return await Task.FromResult(result.OrderBy(x => x.Name));
            //var cacheData = _memoryCache.Get<IEnumerable<CountryMaster>>("CountryMaster");
            //if (cacheData == null)
            //{

            //    cacheData = result;
            //    _memoryCache.Set("CountryMaster", cacheData, new MemoryCacheEntryOptions
            //    {
            //        AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5)
            //    });
            //}
        }

        public async Task<IEnumerable<CityMaster>> GetCitiesAsync(string? countryId, string? stateId)
        {
            if (string.IsNullOrEmpty(countryId) && string.IsNullOrEmpty(stateId))
            {
                throw new ArgumentException("Either countryId or stateId must be provided.");
            }

            var result = await _regionCityRepository.GetCitiesAsync(countryId, stateId);
            return await Task.FromResult(result.OrderBy(x => x.Name));
        }
    }
}
