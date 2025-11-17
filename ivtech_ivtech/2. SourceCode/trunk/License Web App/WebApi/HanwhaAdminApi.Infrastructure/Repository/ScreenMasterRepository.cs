using HanwhaAdminApi.Infrastructure.Connection;
using HanwhaAdminApi.Infrastructure.Interfaces;
using HanwhaAdminApi.Model.Common;
using HanwhaAdminApi.Model.DbEntities;

namespace HanwhaAdminApi.Infrastructure.Repository
{
    public class ScreenMasterRepository : RepositoryBase<ScreenMaster>, IScreenMasterRepository
    {
        public ScreenMasterRepository(MongoDbConnectionService mongoDbConnectionService) : base(mongoDbConnectionService, AppDBConstants.ScreenMaster)
        {

        }
    }
}
