using HanwhaClient.Model.DbEntities;

namespace HanwhaClient.Infrastructure.Interfaces
{
    public interface IAuditLogRepository : IRepositoryBase<AuditLog>
    {
        Task<(List<AuditLog> auditLog, long totalCount)> GetAuditLogDetailByFilter(AuditLogRequest auditLogRequest);
        Task<List<string>> GetAuditLogCollectionName();
    }
}
