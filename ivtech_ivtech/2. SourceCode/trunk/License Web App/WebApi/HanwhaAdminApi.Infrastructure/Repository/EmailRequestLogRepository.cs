using HanwhaAdminApi.Infrastructure.Connection;
using HanwhaAdminApi.Infrastructure.Interfaces;
using HanwhaAdminApi.Model.Common;
using HanwhaAdminApi.Model.DbEntities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaAdminApi.Infrastructure.Repository
{
    public class EmailRequestLogRepository : RepositoryBase<EmailLogs>, IEmailRequestLogRepository
    {
        public EmailRequestLogRepository(MongoDbConnectionService mongoDbConnectionService) : base(mongoDbConnectionService, AppDBConstants.EmailRequestLog)
        {
        }
    }
}
