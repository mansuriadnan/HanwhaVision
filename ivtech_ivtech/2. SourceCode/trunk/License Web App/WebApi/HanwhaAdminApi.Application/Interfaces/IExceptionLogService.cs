using HanwhaAdminApi.Model.DbEntities;

namespace HanwhaAdminApi.Application.Interfaces
{
    public interface IExceptionLogService
    {
        Task<string> SaveExceptionLogAsync(ExceptionLog exceptionLog);
    }
}
