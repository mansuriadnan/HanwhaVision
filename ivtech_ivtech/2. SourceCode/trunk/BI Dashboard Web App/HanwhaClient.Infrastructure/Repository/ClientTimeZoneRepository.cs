using HanwhaClient.Infrastructure.Connection;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.DbEntities;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Infrastructure.Repository
{
    public class ClientTimeZoneRepository : RepositoryBase<ClientTimezones>, IClientTimeZoneRepository
    {
        public ClientTimeZoneRepository(MongoDbConnectionService mongoDbConnectionService) : base(mongoDbConnectionService, AppDBConstants.ClientTimeZone)
        {
        }

        public Task<ClientTimezones> GetTimeZone(string id)
        {
            var filter = Builders<ClientTimezones>.Filter.Eq(e => e.Id, id);
            var data = dbEntity.Find(filter).FirstOrDefaultAsync();
            return data;
        }

    }
}
