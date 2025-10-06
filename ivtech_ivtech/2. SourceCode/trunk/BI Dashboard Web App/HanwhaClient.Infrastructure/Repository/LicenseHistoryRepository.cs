using HanwhaClient.Infrastructure.Connection;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.DbEntities;

namespace HanwhaClient.Infrastructure.Repository
{
    public class LicenseHistoryRepository : RepositoryBase<LicenseHistory>, ILicenseHistoryRepository
    {
        public LicenseHistoryRepository(MongoDbConnectionService mongoDbConnectionService) : base(mongoDbConnectionService, AppDBConstants.LicenseHistory)
        {
        }
    }
}
