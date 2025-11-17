using HanwhaClient.Application.Interfaces;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.DbEntities;
using Microsoft.AspNetCore.Diagnostics;
using System.Diagnostics;

namespace HanwhaClient.Helper
{
    public class AddExceptionHandler: IExceptionHandler
    {
        private readonly ILogger<AddExceptionHandler> _logger;
        private readonly IServiceProvider _serviceProvider;
        private readonly ICurrentUserService _currentUserService;

        public AddExceptionHandler(ILogger<AddExceptionHandler> logger,
            IServiceProvider serviceProvider,
            ICurrentUserService currentUserService)
        {
            this._logger = logger;
            this._serviceProvider = serviceProvider;
            this._currentUserService = currentUserService;
        }
        public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.UserId;
            _logger.LogError(exception, exception.Message);

            using (var scope = _serviceProvider.CreateScope())
            {
                var exceptionLog = scope.ServiceProvider.GetRequiredService<IExceptionLogService>();
                await exceptionLog.SaveExceptionLogAsync(new ExceptionLog
                {
                    ExceptionMessage = exception.Message,
                    StackTrace = exception.StackTrace,
                    ExceptionType = exception.GetType().Name,
                    LoggedAt = DateTime.UtcNow,
                    UserId = userId,
                    RequestPath = httpContext.Request?.Path
                });
            }

            var errorResponse = StandardAPIResponse<bool>.ErrorResponse(false, exception.Message, 500, ["UnhandledException", exception.Message]);
            await httpContext.Response.WriteAsJsonAsync(errorResponse, cancellationToken);
            return true;
        }
    }
}
