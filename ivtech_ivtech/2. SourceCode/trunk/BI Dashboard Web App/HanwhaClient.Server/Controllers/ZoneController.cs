using HanwhaClient.Application.Interfaces;
using HanwhaClient.Application.Services;
using HanwhaClient.Helper;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HanwhaClient.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [CustomAuthorize([ScreenNames.FloorPlanAndZoneMaster])]
    public class ZoneController : ControllerBase
    {
        private readonly IZoneService _zoneService;
        private readonly ICurrentUserService _currentUserService;
        private readonly IPermissionService _permissionService;

        public ZoneController(IZoneService zoneService,
            ICurrentUserService currentUserService,
            IPermissionService permissionService)
        {
            this._zoneService = zoneService;
            _currentUserService = currentUserService;
            _permissionService = permissionService;
        }

        [HttpPost]
        [Route("AddUpdateZone")]
        [CustomAuthorize([ScreenNames.AddUpdateZone])]
        public async Task<ActionResult<StandardAPIResponse<string>>> AddUpdateZone([FromBody] ZoneRequestDto zoneRequestDto)
        {
            var userId = _currentUserService.UserId;
            var data = await _zoneService.AddUpdateZone(zoneRequestDto, userId);

            if (!string.IsNullOrEmpty(data.errorMessage))
            {
                return StandardAPIResponse<string>.ErrorResponse(null, data.errorMessage, StatusCodes.Status404NotFound);
            }
            _permissionService.RefreshPermissionData();
            return StandardAPIResponse<string>.SuccessResponse("", string.IsNullOrEmpty(zoneRequestDto.Id) ? AppMessageConstants.RecordAdded : AppMessageConstants.RecordUpdated, StatusCodes.Status200OK);
        }

        [HttpGet]
        [Route("GetAllZoneByFloorId/{floorId}")]
        [CustomAuthorize([ScreenNames.ViewListofZones])]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<ZoneResponseDto>>>> GetZoneByFloorId(string floorId)
        {
            var data = await _zoneService.GetZoneByFloorIdAsync(floorId);
            if (data.Count() == 0)
            {
                return StandardAPIResponse<IEnumerable<ZoneResponseDto>>.SuccessResponse(data, AppMessageConstants.RecordNotFound, StatusCodes.Status200OK);
            }
            else if (data.Count() > 0)
            {
                return StandardAPIResponse<IEnumerable<ZoneResponseDto>>.SuccessResponse(data, "", StatusCodes.Status200OK);
            }
            return StandardAPIResponse<IEnumerable<ZoneResponseDto>>.ErrorResponse(null, AppMessageConstants.RecordNotFound, StatusCodes.Status200OK);
        }

        [AllowAnonymous]
        [HttpDelete("DeleteZoneById/{id}")]
        [CustomAuthorize([ScreenNames.DeleteZone])]
        public async Task<ActionResult<StandardAPIResponse<bool>>> DeleteZoneById(string id)
        {
            try
            {
                var userId = _currentUserService.UserId;
                var isDeleted = await _zoneService.DeleteZoneAsync(id, userId);
                if (!isDeleted)
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

        [HttpPost]
        [Route("ZonePlanDetail")]
        [CustomAuthorize([ScreenNames.AddUpdateZone])]
        public async Task<ActionResult<StandardAPIResponse<string>>> AddZonePlanDetailAsync([FromBody] AddZonePlanRequest addZonePlanRequest)
        {
            var userId = _currentUserService.UserId;
            var data = await _zoneService.AddZonePlanDetailAsync(addZonePlanRequest, userId);
            if (!data.isSuccess)   
            {
                return StandardAPIResponse<string>.ErrorResponse(string.Empty, data.ErrorMessage, StatusCodes.Status400BadRequest);
            }
            return StandardAPIResponse<string>.SuccessResponse("", string.IsNullOrEmpty(addZonePlanRequest.ZoneId) ? AppMessageConstants.RecordAdded : AppMessageConstants.RecordUpdated, StatusCodes.Status200OK);
        }

        [HttpDelete("ZoneMappedDevice/{id}")]
        [CustomAuthorize([ScreenNames.ConfigureFloorPlanZoneMapCamera])]
        public async Task<ActionResult<StandardAPIResponse<bool>>> DeleteZoneMappedDevice(string id)
        {
            var userId = _currentUserService.UserId;
            var isDeleted = await _zoneService.DeleteZoneMappedDeviceAsync(id, userId);
            if (isDeleted)
            {
                return StandardAPIResponse<bool>.SuccessResponse(true, AppMessageConstants.RecordDeleted, StatusCodes.Status200OK);
                
            }
            return StandardAPIResponse<bool>.ErrorResponse(false, AppMessageConstants.RecordNotFound, StatusCodes.Status404NotFound);
        }

        [HttpGet]
        [Route("GetZoneByZoneId/{zoneId}")]
        [CustomAuthorize([ScreenNames.FloorPlanAndZoneMaster])]
        public async Task<ActionResult<StandardAPIResponse<ZoneResDto>>> GetZoneByZoneId(string zoneId)
        {
            var data = await _zoneService.GetZoneByZoneIdAsync(zoneId);
            if (data != null)
            {
                return StandardAPIResponse<ZoneResDto>.SuccessResponse(data, "", StatusCodes.Status200OK);
            }
            return StandardAPIResponse<ZoneResDto>.ErrorResponse(null, AppMessageConstants.RecordNotFound, StatusCodes.Status200OK);
        }

    }
}
