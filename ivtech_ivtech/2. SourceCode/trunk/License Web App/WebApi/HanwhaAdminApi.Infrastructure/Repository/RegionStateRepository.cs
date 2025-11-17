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
    public class RegionStateRepository : RepositoryBase<StateMaster>, IRegionStateRepository
    {
        public RegionStateRepository(MongoDbConnectionService mongoDbConnectionService) : base(mongoDbConnectionService, AppDBConstants.StateMaster)
        {
        }

        public async Task<IEnumerable<StateMaster>> GetStatesByCountryIdAsync(string Id)
        {
            var filter = Builders<StateMaster>.Filter.Eq(s => s.CountryId, Id);
            return await dbEntity.Find(filter).ToListAsync();
        }
    }
}
