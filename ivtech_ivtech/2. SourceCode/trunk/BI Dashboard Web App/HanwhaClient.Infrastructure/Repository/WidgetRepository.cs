using HanwhaClient.Infrastructure.Connection;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.DbEntities;

namespace HanwhaClient.Infrastructure.Repository
{
    public class WidgetRepository : RepositoryBase<WidgetMaster>, IWidgetRepository
    {
        public WidgetRepository(MongoDbConnectionService mongoDbConnectionService) : base(mongoDbConnectionService, AppDBConstants.WidgetMaster)
        {
        }
    }
}
