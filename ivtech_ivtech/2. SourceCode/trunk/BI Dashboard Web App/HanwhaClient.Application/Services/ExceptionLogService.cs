using HanwhaClient.Application.Interfaces;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.Dto;

namespace HanwhaClient.Application.Services
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
            var result = await _exceptionLogRepository.InsertAsync(exceptionLog);
            return await Task.FromResult(result);
        }

        public async Task<ExceptionLogsResponse> GetExceptionLogsAsync(ExceptionLogsRequest request)
        {
            var data = await _exceptionLogRepository.GetExceptionLogs(request);
            ExceptionLogsResponse exceptionLogsResponse = new ExceptionLogsResponse
            {
                ExceptionLogsDetails = data.ExceptionLogsDetails.Select(x => new ExceptionLogsDetails
                {
                    ExceptionMessage = x.ExceptionMessage,
                    ExceptionType = x.ExceptionType,
                    HttpMethod = x.HttpMethod,
                    IsSuccess = x.IsSuccess,
                    LoggedAt = x.LoggedAt,
                    QueryString = x.QueryString,
                    RequestBody = x.RequestBody,
                    RequestPath = x.RequestPath,
                    RequestTime = x.RequestTime,
                    ResponseBody = x.ResponseBody,
                    ResponseTime = x.ResponseTime,
                    StackTrace = x.StackTrace,
                    StatusCode = x.StatusCode,
                    id = x.Id
                }).AsEnumerable(),
                TotalCount = data.TotalCount,
            };

            return exceptionLogsResponse;
            
        }
    }
}
