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
    public class ClientSettingRepository : RepositoryBase<AdminSettings>, IClientSettingRepository
    {
        public ClientSettingRepository(MongoDbConnectionService mongoDbConnectionService) : base(mongoDbConnectionService, AppDBConstants.AdminSettings)
        {
        }

        public async Task<AdminSettings> GetClientSettingsAsync()
        {
            var filter = Builders<AdminSettings>.Filter.Empty;
            var data = await dbEntity.Find(filter).FirstOrDefaultAsync();
            return data;
        }
    }
}
