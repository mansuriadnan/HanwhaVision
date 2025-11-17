using HanwhaAdminApi.Application.Interfaces;
using HanwhaAdminApi.Infrastructure.Interfaces;
using HanwhaAdminApi.Model.DbEntities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaAdminApi.Application.Services
{
    public class ExceptionLogService : IExceptionLogService
    {
        private readonly IExceptionLogRepository _exceptionLogRepository;

        public ExceptionLogService(IExceptionLogRepository exceptionLogRepository)
        {
            this._exceptionLogRepository = exceptionLogRepository;
        }

        public async Task<string> SaveExceptionLogAsync(ExceptionLog exceptionLog)
        {
            var result =  await _exceptionLogRepository.InsertAsync(exceptionLog);
            return await Task.FromResult(result);
        }
      
    }
}
