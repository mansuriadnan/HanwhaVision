using HanwhaClient.Infrastructure.Connection;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.DbEntities;
using MongoDB.Driver;

namespace HanwhaClient.Infrastructure.Repository
{
    public class MonitoringRepository : RepositoryBase<Monitoring>, IMonitoringRepository
    {
        public MonitoringRepository(MongoDbConnectionService mongoDbConnectionService) : base(mongoDbConnectionService, AppDBConstants.Monitoring, true)
        {
        }

        public async Task<bool> IsMonitoringNameExistAsync(string monitoringName, string? monitoringId = null)
        {
            var filters = new List<FilterDefinition<Monitoring>>
    {
        Builders<Monitoring>.Filter.Eq(x => x.MonitoringName, monitoringName.ToLower()),
        Builders<Monitoring>.Filter.Eq(x => x.IsDeleted, false)
    };

            if (!string.IsNullOrEmpty(monitoringId))
            {
                filters.Add(Builders<Monitoring>.Filter.Ne(x => x.Id, monitoringId));
            }

            var combinedFilter = Builders<Monitoring>.Filter.And(filters);

            var options = new FindOptions
            {
                Collation = new Collation("en", strength: CollationStrength.Secondary) // Case-insensitive matching
            };

            return await dbEntity.Find(combinedFilter, options).AnyAsync();
        }


    }
}
