using HanwhaClient.Infrastructure.Connection;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.DbEntities;

namespace HanwhaClient.Infrastructure.Repository
{
    public class ScreenMasterRepository : RepositoryBase<ScreenMaster>, IScreenMasterRepository
    {
        public ScreenMasterRepository(MongoDbConnectionService mongoDbConnectionService) : base(mongoDbConnectionService, AppDBConstants.ScreenMaster)
        {

        }
    }
}
