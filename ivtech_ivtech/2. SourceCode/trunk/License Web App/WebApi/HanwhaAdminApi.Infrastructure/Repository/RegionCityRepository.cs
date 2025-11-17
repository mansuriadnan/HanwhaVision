using HanwhaAdminApi.Infrastructure.Connection;
using HanwhaAdminApi.Infrastructure.Interfaces;
using HanwhaAdminApi.Model.Common;
using HanwhaAdminApi.Model.DbEntities;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaAdminApi.Infrastructure.Repository
{
    public class RegionCityRepository : RepositoryBase<CityMaster>, IRegionCityRepository
    {
        public RegionCityRepository(MongoDbConnectionService mongoDbConnectionService) : base(mongoDbConnectionService, AppDBConstants.CityMaster)
        {
        }

        public async Task<IEnumerable<CityMaster>> GetCitiesAsync(string? countryId, string? stateId)
        {
            var filter = Builders<CityMaster>.Filter.Empty;

            if (!string.IsNullOrEmpty(countryId))
            {
                filter = Builders<CityMaster>.Filter.Eq(c => c.CountryId, countryId);
            }

            if (!string.IsNullOrEmpty(stateId))
            {
                filter = Builders<CityMaster>.Filter.And(filter, Builders<CityMaster>.Filter.Eq(c => c.StateId, stateId));
            }

            return await dbEntity.Find(filter).ToListAsync();
        }
    }
}
