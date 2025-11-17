using HanwhaClient.Infrastructure.Connection;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.DbEntities;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Text.RegularExpressions;


namespace HanwhaClient.Infrastructure.Repository
{
    public class DashboardPreferenceRepository : RepositoryBase<DashboardPreference>, IDashboardPreferenceRepository
    {
        public DashboardPreferenceRepository(MongoDbConnectionService mongoDbConnectionService) : base(mongoDbConnectionService, AppDBConstants.DashboardPreference)
        {

        }

        public async Task<IEnumerable<DashboardPreference>> GetDashboardPreferenceByUserIdAsync(string userId)
        {
            ProjectionDefinition<DashboardPreference> projection = Builders<DashboardPreference>.Projection
            .Include("dashboardName")
            .Include("dashboardPreferenceDesign")
            .Include("_id");

            var filter = Builders<DashboardPreference>.Filter.And(
                Builders<DashboardPreference>.Filter.Eq(x => x.UserId, userId),
                Builders<DashboardPreference>.Filter.Eq(x => x.IsDeleted, false)
            );
            var data = await dbEntity.Find(filter).Project<DashboardPreference>(projection).ToListAsync();
            return data;
        }

        public async Task<bool> IsDashboardNameExistsAsync(string userId, string dashBoardName)
        {
            var filter = Builders<DashboardPreference>.Filter.And(
                Builders<DashboardPreference>.Filter.Eq(x => x.UserId, userId),
                Builders<DashboardPreference>.Filter.Regex("dashboardName", new BsonRegularExpression($"^{Regex.Escape(dashBoardName)}$", "i")),
                Builders<DashboardPreference>.Filter.Eq(x => x.IsDeleted, false)
            );

            var data = await dbEntity.Find(filter).AnyAsync();
            return data;
        }

        public async Task<string> GetDashboardForAlexaByName(string dashboardName)
        {
            var filter = Builders<DashboardPreference>.Filter.And(
                Builders<DashboardPreference>.Filter.Eq(x => x.IsDeleted, false),
                Builders<DashboardPreference>.Filter.Regex("dashboardName", new BsonRegularExpression($"^{Regex.Escape(dashboardName)}$", "i"))
            );

            var data = await dbEntity.Find(filter).FirstOrDefaultAsync();
            return data != null ? data.Id : "";
        }
    }
}
