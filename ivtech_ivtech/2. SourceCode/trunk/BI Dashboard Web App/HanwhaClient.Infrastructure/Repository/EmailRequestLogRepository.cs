using HanwhaClient.Infrastructure.Connection;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.DbEntities;
using MongoDB.Driver;

namespace HanwhaClient.Infrastructure.Repository
{
    public class EmailRequestLogRepository : RepositoryBase<EmailLogs>, IEmailRequestLogRepository
    {
        public EmailRequestLogRepository(MongoDbConnectionService mongoDbConnectionService) : base(mongoDbConnectionService, AppDBConstants.EmailLogs)
        {
        }
    }
}
