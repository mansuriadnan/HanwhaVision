using HanwhaClient.Application.Interfaces;
using HanwhaClient.Helper;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HanwhaClient.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ExceptionController : ControllerBase
    {
        private readonly IExceptionLogService _exceptionLogService;
        public ExceptionController(IExceptionLogService exceptionLogService)
        {
            _exceptionLogService = exceptionLogService;
        }

        [HttpPost]
        [Route("GetExceptionLogs")]
        [Authorize]
        public async Task<ActionResult<StandardAPIResponse<ExceptionLogsResponse>>> GetExceptionLogs([FromBody] ExceptionLogsRequest request)
        {
            var data = await _exceptionLogService.GetExceptionLogsAsync(request);
            if (data.ExceptionLogsDetails.Count() > 0)
            {
                return StandardAPIResponse<ExceptionLogsResponse>.SuccessResponse(data, "", StatusCodes.Status200OK);
            }
            return StandardAPIResponse<ExceptionLogsResponse>.SuccessResponse(null, AppMessageConstants.RecordNotFound, StatusCodes.Status404NotFound);

        }
    }
}
