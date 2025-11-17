using HanwhaClient.Infrastructure.Connection;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Model.DbEntities;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Text.RegularExpressions;

namespace HanwhaClient.Infrastructure.Repository
{
    public class ZoneRepository : RepositoryBase<ZoneMaster>, IZoneRepository
    {
        public ZoneRepository(MongoDbConnectionService mongoDbConnectionService) : base(mongoDbConnectionService, "zoneMaster")
        {
        }

        

        public async Task<string> GetDefalutZonesAsync()
        {
            var filter = Builders<ZoneMaster>.Filter.Eq(x => x.ZoneName, "System Zone");
            var data = dbEntity.Find(filter).FirstOrDefault();

            if (data != null)
            {
                return data.Id.ToString();
            }
            else
            {
                return ""; // or handle the null case as needed
            }
        }
        public async Task<IEnumerable<ZoneMaster>> GetZonesByFloorIdAsync(string floorId)
        {
            var filter = Builders<ZoneMaster>.Filter.Eq(x => x.FloorId, floorId);
            var isDeletedFilter = Builders<ZoneMaster>.Filter.Eq(x => x.IsDeleted, false);
            var isDeletedNotExistsFilter = Builders<ZoneMaster>.Filter.Exists(x => x.IsDeleted, false);

            // Combine filters using $or
            var combinedFilter = Builders<ZoneMaster>.Filter.Or(isDeletedFilter, isDeletedNotExistsFilter);
            filter = Builders<ZoneMaster>.Filter.And(filter, combinedFilter);

            var data = await dbEntity.Find(filter).ToListAsync();
            return data;

        }

        public async Task<IEnumerable<ZoneMaster>> GetZonesByMultipleFloorIdZoneIdAsync(IEnumerable<string> floorIds, IEnumerable<string>? zoneIds = null)
        {
            var filters = new List<FilterDefinition<ZoneMaster>>();
            filters.Add(Builders<ZoneMaster>.Filter.In(x => x.FloorId, floorIds));
            filters.Add(Builders<ZoneMaster>.Filter.Eq(x => x.IsDeleted, false));
            
            if (zoneIds != null && zoneIds.Any())
            {
                filters.Add(Builders<ZoneMaster>.Filter.In(x => x.Id, zoneIds));
            }
            try
            {
                var filter = filters.Any() ? Builders<ZoneMaster>.Filter.And(filters) : Builders<ZoneMaster>.Filter.Empty;
                var data = await dbEntity.Find(filter).ToListAsync();
                return data;
            }
            catch (Exception ex)
            {
                var msg = ex.Message;
                throw;
            }
        }

        public async Task<bool> CheckZoneExistbyName(string zoneName, string floorId, string? zoneId)
        {
            var filters = new List<FilterDefinition<ZoneMaster>>();
            filters.Add(Builders<ZoneMaster>.Filter.Regex("zoneName", new BsonRegularExpression($"^{Regex.Escape(zoneName)}$", "i")));
            filters.Add(Builders<ZoneMaster>.Filter.Eq(x => x.FloorId, floorId));
            filters.Add(Builders<ZoneMaster>.Filter.Eq(x => x.IsDeleted, false));

            if (!string.IsNullOrEmpty(zoneId))
            {
                filters.Add(Builders<ZoneMaster>.Filter.Ne(x => x.Id, zoneId));
            }
            var filter = Builders<ZoneMaster>.Filter.And(filters);
            var data = await dbEntity.Find(filter).AnyAsync();
            return data;
        }

        public async Task<IEnumerable<ZoneMaster>> GetZonesByIdsAsync(IEnumerable<string> zoneIds)
        {
            if (zoneIds == null || !zoneIds.Any())
                return Enumerable.Empty<ZoneMaster>();

            try
            {
                var filters = new List<FilterDefinition<ZoneMaster>>
        {
            Builders<ZoneMaster>.Filter.In(x => x.Id, zoneIds),
            Builders<ZoneMaster>.Filter.Eq(x => x.IsDeleted, false)
        };

                var filter = Builders<ZoneMaster>.Filter.And(filters);
                var data = await dbEntity.Find(filter).ToListAsync();
                return data;
            }
            catch (Exception ex)
            {
                var msg = ex.Message;
                throw;
            }
        }
        public async Task<IEnumerable<ZoneMaster>> GetZoneIdByNameAsync(string zoneName)
        {
            if (string.IsNullOrWhiteSpace(zoneName))
                return Enumerable.Empty<ZoneMaster>();

            try
            {
                var filters = new List<FilterDefinition<ZoneMaster>>
                {
                    // Case-insensitive regex match
                    Builders<ZoneMaster>.Filter.Regex(x => x.ZoneName, new BsonRegularExpression(zoneName, "i")),
                    Builders<ZoneMaster>.Filter.Eq(x => x.IsDeleted, false)
                };

                var filter = Builders<ZoneMaster>.Filter.And(filters);
                var data = await dbEntity.Find(filter).ToListAsync();
                return data;
            }
            catch (Exception ex)
            {
                var msg = ex.Message;
                throw;
            }
        }

    }
}
