using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.Dto;
using HanwhaClient.Model.Role;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Application.Interfaces
{
    public interface IExceptionLogService
    {
        Task<string> SaveExceptionLogAsync(ExceptionLog exceptionLog);
        Task<ExceptionLogsResponse> GetExceptionLogsAsync(ExceptionLogsRequest request);
        
    }
}
