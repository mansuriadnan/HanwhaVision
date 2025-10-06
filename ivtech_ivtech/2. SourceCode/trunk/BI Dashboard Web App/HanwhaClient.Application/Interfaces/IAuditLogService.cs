using HanwhaClient.Model.DbEntities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Application.Interfaces
{
    public interface IAuditLogService
    {
        Task<(AuditLogResponse auditLogDetail, Dictionary<string, object> referenceData)> GetAuditLogDetail(AuditLogRequest auditLogRequest);
        Task<List<string>> GetAuditLogCollectionName();


    }
}
