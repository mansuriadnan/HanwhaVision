using HanwhaClient.Infrastructure.Connection;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.DbEntities;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Text.RegularExpressions;


namespace HanwhaClient.Infrastructure.Repository
{
    public class FloorRepository : RepositoryBase<FloorPlanMaster>, IFloorRepository
    {
        public FloorRepository(MongoDbConnectionService mongoDbConnectionService) : base(mongoDbConnectionService, AppDBConstants.FloorPlanMaster)
        {
        }

        public async Task<string> GetDefalutFloorAsync()
        {
            var filter = Builders<FloorPlanMaster>.Filter.Eq(x => x.FloorPlanName, "System Floor");
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

        public async Task<FloorPlanMaster> GetFloorByIdAsync(string floorId)
        {
            var filter = Builders<FloorPlanMaster>.Filter.Eq(x => x.Id, floorId);
            var data = dbEntity.Find(filter).FirstOrDefault();
            return data;
        }

        public async Task<bool> CheckFloorExistbyName(string floorName, string? floorId)
        {
            var filters = new List<FilterDefinition<FloorPlanMaster>>();
            filters.Add(Builders<FloorPlanMaster>.Filter.Regex("floorPlanName", new BsonRegularExpression($"^{Regex.Escape(floorName)}$", "i")));
            filters.Add(Builders<FloorPlanMaster>.Filter.Eq(x => x.IsDeleted, false));

            if (!string.IsNullOrEmpty(floorId))
            {
                filters.Add(Builders<FloorPlanMaster>.Filter.Ne(x => x.Id, floorId));
            }
            var filter = Builders<FloorPlanMaster>.Filter.And(filters);
            var data = await dbEntity.Find(filter).AnyAsync();
            return data;
        }
    }
}
