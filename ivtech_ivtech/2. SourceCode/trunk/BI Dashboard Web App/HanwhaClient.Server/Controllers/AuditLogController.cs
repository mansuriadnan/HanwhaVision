using HanwhaClient.Application.Interfaces;
using HanwhaClient.Helper;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.DbEntities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HanwhaClient.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [CustomAuthorize([ScreenNames.AuditMaster])]
    public class AuditLogController : ControllerBase
    {
        private readonly IAuditLogService _auditLogService;
        public AuditLogController(IAuditLogService auditLogService)
        {
            this._auditLogService = auditLogService;
        }

        [HttpGet]
        [Route("GetAuditLog")]
        public async Task<ActionResult<StandardAPIResponse<AuditLogResponse>>> GetAuditLog(string CollectionName, int? PageSize, int? PageNo, string? OperationType, string? documentId)
        {
            AuditLogRequest auditLogRequest = new AuditLogRequest();
            auditLogRequest.CollectioName = CollectionName; 
            auditLogRequest.PageSize = PageSize;
            auditLogRequest.PageNo = PageNo;
            auditLogRequest.OperationType = OperationType;
            auditLogRequest.Id = documentId;

            var result = await _auditLogService.GetAuditLogDetail(auditLogRequest);
            var response = StandardAPIResponse<AuditLogResponse>.SuccessResponse(result.auditLogDetail, AppMessageConstants.RecordRetrieved, StatusCodes.Status200OK, ReferenceData: result.referenceData);
            return response;
        }


        [HttpGet]
        [Route("AuditLogCollectionName")]
        public async Task<ActionResult<StandardAPIResponse<List<string>>>> AuditLogCollectionName()
        {

            List<string> result = await _auditLogService.GetAuditLogCollectionName();
            var response = StandardAPIResponse<List<string>>.SuccessResponse(result, AppMessageConstants.RecordRetrieved, StatusCodes.Status200OK);
            return response;

        }

    }
}
