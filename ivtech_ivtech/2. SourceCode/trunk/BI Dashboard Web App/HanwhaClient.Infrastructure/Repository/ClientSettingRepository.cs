using HanwhaClient.Infrastructure.Connection;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.DbEntities;
using MongoDB.Driver;

namespace HanwhaClient.Infrastructure.Repository
{
    public class ClientSettingRepository : RepositoryBase<ClientSettings>, IClientSettingRepository
    {
        public ClientSettingRepository(MongoDbConnectionService mongoDbConnectionService) : base(mongoDbConnectionService, AppDBConstants.ClientSettings)
        {
        }

        public async Task<ClientSettings> GetClientSettingsAsync()
        {
            var filter = Builders<ClientSettings>.Filter.Eq(x => x.IsDeleted, false);
            var data = await dbEntity.Find(filter).FirstOrDefaultAsync();
            return data;
        }
    }
}
