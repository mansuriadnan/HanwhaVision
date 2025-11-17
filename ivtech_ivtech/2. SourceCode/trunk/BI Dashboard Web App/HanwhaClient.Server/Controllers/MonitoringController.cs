using HanwhaClient.Application.Interfaces;
using HanwhaClient.Application.Services;
using HanwhaClient.Helper;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.Dto;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace HanwhaClient.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [CustomAuthorize([ScreenNames.MonitoringMaster])]
    public class MonitoringController : ControllerBase
    {
        private readonly IMonitoringService _monitoringService;
        private readonly ICurrentUserService _currentUserService;

        public MonitoringController(IMonitoringService monitoringService, ICurrentUserService currentUserService)
        {
            _monitoringService = monitoringService;
            _currentUserService = currentUserService;
        }

        [HttpGet]
        [Route("GetMonitoring")]
        [CustomAuthorize([ScreenNames.ViewListofMonitorings])]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<MonitoringResponseModel>>>> GetMonitoring()
        {
            var result = await _monitoringService.GetMonitoringAsync();
            return StandardAPIResponse<IEnumerable<MonitoringResponseModel>>.SuccessResponse(result, "", StatusCodes.Status200OK);
        }

        [HttpGet]
        [Route("GetMonitoringGroupAndItem")]
        [CustomAuthorize([ScreenNames.ViewListofMonitoringGroups])]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<MonitoringGroupWithItemsResponse>>>> GetMonitoringGroupAndItem(string monitoringId)
        {
            var result = await _monitoringService.GetAllMonitoringGroupsAsync(monitoringId);
            return StandardAPIResponse<IEnumerable<MonitoringGroupWithItemsResponse>>.SuccessResponse(result, "", StatusCodes.Status200OK);
        }

        [HttpPost]
        [Route("AddUpdateMonitoring")]
        [CustomAuthorize([ScreenNames.AddOrUpdateMonitoring])]
        public async Task<ActionResult<StandardAPIResponse<string>>> AddUpdateMonitoring(MonitoringRequestModel model)
        {
            var userId = _currentUserService.UserId;
            var data = await _monitoringService.AddUpdateMonitoringAsync(model, userId);

            if (data.Contains("already") || data.Contains("not found"))
            {
                return StandardAPIResponse<string>.ErrorResponse(null, data, StatusCodes.Status400BadRequest);
            }
            return StandardAPIResponse<string>.SuccessResponse(data, string.IsNullOrEmpty(model.MonitoringId) ? AppMessageConstants.RecordAdded : AppMessageConstants.RecordUpdated);
        }

        [HttpDelete]
        [Route("Monitoring/{monitoringId}")]
        [CustomAuthorize([ScreenNames.DeleteMonitoring])]
        public async Task<ActionResult<StandardAPIResponse<bool>>> DeleteMonitoring(string monitoringId)
        {
            var userId = _currentUserService.UserId;
            var data = await _monitoringService.DeleteMonitoringAsync(monitoringId, userId);
            if (!data)
            {
                return StandardAPIResponse<bool>.ErrorResponse(false, AppMessageConstants.RecordNotFound, StatusCodes.Status404NotFound);
            }
            return StandardAPIResponse<bool>.SuccessResponse(true, AppMessageConstants.RecordDeleted, StatusCodes.Status200OK);
        }

        [HttpPost]
        [Route("AddUpdateGroup")]
        [CustomAuthorize([ScreenNames.AddOrUpdateGroup])]
        public async Task<ActionResult<StandardAPIResponse<string>>> AddUpdateGroup(MonitoringGroupRequest model)
        {
            var userId = _currentUserService.UserId;
            var data = await _monitoringService.AddUpdateMonitoringGroupAsync(model, userId);
            if (data.Contains("not found") || data.Contains("required"))
            {
                return StandardAPIResponse<string>.ErrorResponse(null, data, StatusCodes.Status400BadRequest);
            }
            return StandardAPIResponse<string>.SuccessResponse(data, string.IsNullOrEmpty(model.GroupId) ? AppMessageConstants.RecordAdded : AppMessageConstants.RecordUpdated);
        }

        [HttpPost]
        [Route("AddUpdateGroupItem")]
        [CustomAuthorize([ScreenNames.AddOrUpdateURLPreview])]
        public async Task<ActionResult<StandardAPIResponse<string>>> AddUpdateGroupItem(MonitoringGroupItemRequest model)
        {
            var userId = _currentUserService.UserId;
            var data = await _monitoringService.AddUpdateMonitoringGroupItemAsync(model, userId);
            if (data.Contains("not found") || data.Contains("required"))
            {
                return StandardAPIResponse<string>.ErrorResponse(null, "", StatusCodes.Status400BadRequest);
            }
            return StandardAPIResponse<string>.SuccessResponse(data,  string.IsNullOrEmpty(model.GroupId) ? AppMessageConstants.RecordAdded : AppMessageConstants.RecordUpdated);
        }

        [HttpDelete("{monitoringId}/groupId/{monitoringGroupId}")]
        [CustomAuthorize([ScreenNames.DeleteMonitoringGroup])]
        public async Task<ActionResult<StandardAPIResponse<bool>>> DeleteMonitoringGroup(string monitoringId, string monitoringGroupId)
        {
            try
            {
                var userId = _currentUserService.UserId;
                var data = await _monitoringService.DeleteMonitoringGroupAsync(monitoringId, monitoringGroupId);
                if (data.Contains("not found") || data.Contains("required"))
                {
                    return StandardAPIResponse<bool>.ErrorResponse(false, AppMessageConstants.RecordNotFound, StatusCodes.Status404NotFound);
                }
                return StandardAPIResponse<bool>.SuccessResponse(true, AppMessageConstants.RecordDeleted, StatusCodes.Status200OK);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpDelete("{monitoringId}/groupId/{monitoringGroupId}/groupItemId/{monitoringGroupItemId}")]
        [CustomAuthorize([ScreenNames.DeleteURLPreviewMonitoring])]
        public async Task<ActionResult<StandardAPIResponse<bool>>> DeleteMonitoringGroupItemSite(string monitoringId, string monitoringGroupId, string monitoringGroupItemId)
        {
            try
            {
                var userId = _currentUserService.UserId;
                var data = await _monitoringService.DeleteMonitoringGroupItemAsync(monitoringId, monitoringGroupId, monitoringGroupItemId);
                if (data.Contains("not found") || data.Contains("required"))
                {
                    return StandardAPIResponse<bool>.ErrorResponse(false, AppMessageConstants.RecordNotFound, StatusCodes.Status404NotFound);
                }
                return StandardAPIResponse<bool>.SuccessResponse(true, AppMessageConstants.RecordDeleted, StatusCodes.Status200OK);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

    }
}