using HanwhaClient.Application.Interfaces;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.DbEntities;
using Microsoft.Extensions.Options;
using System.Text;

namespace HanwhaClient.Helper
{
    public class GlobalExceptionHandlerMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionHandlerMiddleware> _logger;
        private readonly IServiceProvider _serviceProvider;
        private readonly IHttpContextAccessor _context;
        private readonly Logs _logs;

        public GlobalExceptionHandlerMiddleware(RequestDelegate next,
            ILogger<GlobalExceptionHandlerMiddleware> logger,
            IServiceProvider serviceProvider,
            IHttpContextAccessor context,
            IOptions<Logs> logs)
        {
            _next = next;
            this._logger = logger;
            this._serviceProvider = serviceProvider;
            this._context = context;
            this._logs = logs.Value;
        }
        public async Task Invoke(HttpContext context, IServiceProvider serviceProvider)
        {
            var exceptionLog2 = new ExceptionLog();
            var requestBody = await ReadRequestBody(context.Request);
            // Save original response stream
            var originalResponseBody = context.Response.Body;
            var responseBody = new MemoryStream();
            var logRequestResponse = _logs.LogRequestResponse;
            var logException = _logs.LogException;
            try
            {
                // Use a memory stream to capture the response

                context.Response.Body = responseBody;

                if (logRequestResponse)
                {
                    exceptionLog2.HttpMethod = context.Request.Method;
                    exceptionLog2.RequestPath = context.Request?.Path;
                    exceptionLog2.QueryString = context.Request.QueryString.ToString();
                    exceptionLog2.RequestBody = requestBody;
                    exceptionLog2.RequestTime = DateTime.Now;
                }

                await _next(context);
                var responseBodyContent = await ReadResponseBody(context.Response);

                if (logRequestResponse)
                {
                    exceptionLog2.ResponseBody = responseBodyContent;
                    exceptionLog2.StatusCode = context.Response.StatusCode;
                    exceptionLog2.ResponseTime = DateTime.Now;

                    using (var scope = serviceProvider.CreateScope())
                    {
                        var exceptionLog = scope.ServiceProvider.GetRequiredService<IExceptionLogService>();
                        await exceptionLog.SaveExceptionLogAsync(exceptionLog2);
                    }
                }

                // Copy the response back to the original stream
                await responseBody.CopyToAsync(originalResponseBody);
            }

            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);
                if (logException)
                {
                    var userId = context.User.Claims.FirstOrDefault(x => x.Type == "nameid")?.Value;
                    using (var scope = serviceProvider.CreateScope())
                    {
                        var exceptionLog = scope.ServiceProvider.GetRequiredService<IExceptionLogService>();


                        exceptionLog2.ExceptionMessage = ex.Message;
                        exceptionLog2.StackTrace = ex.StackTrace;
                        exceptionLog2.ExceptionType = ex.GetType().Name;
                        exceptionLog2.LoggedAt = DateTime.UtcNow;
                        exceptionLog2.UserId = userId;
                        exceptionLog2.ResponseTime = DateTime.Now;
                        exceptionLog2.RequestPath = context.Request?.Path;
                        exceptionLog2.IsSuccess = false;

                        await exceptionLog.SaveExceptionLogAsync(exceptionLog2);
                    }

                }
                var errorResponse = StandardAPIResponse<bool>.ErrorResponse(false, ex.Message, 500, ["UnhandledException", ex.Message]);

                // not getting proper responce of api when unhandle exception is fire
                context.Response.ContentType = "application/json";
                context.Response.StatusCode = 500;
                await context.Response.WriteAsJsonAsync(errorResponse);



            }
            finally
            {
                context.Response.Body = originalResponseBody;
            }
        }

        private async Task<string> ReadRequestBody(HttpRequest request)
        {
            request.EnableBuffering();
            using var streamReader = new StreamReader(request.Body, Encoding.UTF8, leaveOpen: true);
            var body = await streamReader.ReadToEndAsync();
            request.Body.Position = 0;
            return body;
        }
        private async Task<string> ReadResponseBody(HttpResponse response)
        {
            response.Body.Seek(0, SeekOrigin.Begin);
            var text = await new StreamReader(response.Body).ReadToEndAsync();
            response.Body.Seek(0, SeekOrigin.Begin);
            return text;
        }

    }
}
