using HanwhaClient.Application.Interfaces;
using HanwhaClient.Application.Services;
using HanwhaClient.Helper;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.Dto;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HanwhaClient.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [CustomAuthorize([ScreenNames.FloorPlanAndZoneMaster])]
    public class FloorController : ControllerBase
    {
        private readonly ICurrentUserService _currentUserService;
        private readonly IFloorService _floorService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IPermissionService _permissionService;

        public FloorController(ICurrentUserService currentUserService, IFloorService floorService, IHttpContextAccessor httpContextAccessor, IPermissionService permissionService)
        {
            _currentUserService = currentUserService;
            _floorService = floorService;
            _httpContextAccessor = httpContextAccessor;
            _permissionService = permissionService;
        }

        [HttpPost]
        [Route("")]
        [CustomAuthorize([ScreenNames.AddOrUpdateFloor])]
        public async Task<ActionResult<StandardAPIResponse<string>>> AddUpdateFloorAsync([FromBody] AddFloorRequest addFloorRequest)
        {
            var UserId = _currentUserService.UserId;
            var data = await _floorService.AddUpdateFloorAsync(addFloorRequest, UserId);

            if (!string.IsNullOrEmpty(data.errorMessage))
            {
                return StandardAPIResponse<string>.ErrorResponse(null, data.errorMessage, StatusCodes.Status500InternalServerError);
            }
            _permissionService.RefreshPermissionData();
            return StandardAPIResponse<string>.SuccessResponse("", string.IsNullOrEmpty(addFloorRequest.Id) ? AppMessageConstants.RecordAdded : AppMessageConstants.RecordUpdated, StatusCodes.Status200OK);
        }

        [HttpGet]
        [Route("")]
        [CustomAuthorize([ScreenNames.ViewListofFloors])]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<GetFloorDto>>>> GetAllFloorsAsync()
        {
            var data = await _floorService.GetAllFloorsAsync();
            if (data.Count() > 0)
            {
                return StandardAPIResponse<IEnumerable<GetFloorDto>>.SuccessResponse(data, "", StatusCodes.Status200OK);
            }
            return StandardAPIResponse<IEnumerable<GetFloorDto>>.SuccessResponse(null, AppMessageConstants.RecordNotFound, StatusCodes.Status404NotFound);
        }

        [HttpDelete]
        [Route("{id}")]
        [CustomAuthorize([ScreenNames.DeleteFloor])]
        public async Task<ActionResult<StandardAPIResponse<bool>>> DeleteFloorAsync(string id)
        {
            var userId = _currentUserService.UserId;
            var data = await _floorService.DeleteFloorAsync(id, userId);
            if (data)
            {
                return StandardAPIResponse<bool>.SuccessResponse(data, AppMessageConstants.RecordNotFound);
            }
            return StandardAPIResponse<bool>.ErrorResponse(data, AppMessageConstants.RecordDeleted, StatusCodes.Status404NotFound);

        }

        [HttpPost("FloorPlanImage/{floorId}")]
        [CustomAuthorize([ScreenNames.ConfigureFloorPlanZoneMapCamera])]
        public async Task<ActionResult<StandardAPIResponse<string>>> UploadFloorPlanImage(string floorId, IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(AppMessageConstants.FileUploadFailure);
            }
            var userId = _currentUserService.UserId;
            var result = await _floorService.UploadFloorPlanImageAsync(floorId, file, userId);
            if (result)
            {
                return StandardAPIResponse<string>.SuccessResponse(file.FileName, AppMessageConstants.FileUploaded);
            }
            return StandardAPIResponse<string>.ErrorResponse(file.FileName, AppMessageConstants.SomethingWentWrong,StatusCodes.Status500InternalServerError);
        }

        [HttpGet("FloorPlanImage/{floorId}")]
        [CustomAuthorize([ScreenNames.ConfigureFloorPlanZoneMapCamera])]
        public async Task<ActionResult<StandardAPIResponse<string>>> FloorPlanImage(string floorId)
        {
            var result = await _floorService.GetFloorPlanImageAsync(floorId);
            if (result != null)
            {
                return StandardAPIResponse<string>.SuccessResponse(result);
            }
            else if (result == "")
            {
                return StandardAPIResponse<string>.SuccessResponse(result, AppMessageConstants.RecordNotFound, StatusCodes.Status200OK);
            }
            return StandardAPIResponse<string>.SuccessResponse(string.Empty, AppMessageConstants.SomethingWentWrong);
        }


        [HttpPost]
        [Route("FloorZoneByPermission")]
        [CustomAuthorize([ScreenNames.FloorPlanAndZoneMaster])]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<FloorZoneByPermissionDto>>>> GetFloorZoneByPermissionAsync(IEnumerable<string> floorIds)
        {   
            var user = _httpContextAccessor.HttpContext?.User;
            IEnumerable<string>? userRoles = user?.Claims.Where(x => x.Type == "role").Select(y => y.Value);
            var data = await _floorService.GetFloorZoneByPermissionAsync(userRoles ,floorIds);
            if (data.Count() > 0)
            {
                return StandardAPIResponse<IEnumerable<FloorZoneByPermissionDto>>.SuccessResponse(data, "", StatusCodes.Status200OK);
            }
            return StandardAPIResponse<IEnumerable<FloorZoneByPermissionDto>>.SuccessResponse(null, AppMessageConstants.RecordNotFound, StatusCodes.Status404NotFound);
        }

        [HttpPost]
        [Route("FloorZones")]
        [CustomAuthorize([ScreenNames.FloorPlanAndZoneMaster])]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<FloorZoneByPermissionDto>>>> GetFloorZonesAsync()
        {
            
            var data = await _floorService.GetFloorZonesAsync();
            if (data.Count() > 0)
            {
                return StandardAPIResponse<IEnumerable<FloorZoneByPermissionDto>>.SuccessResponse(data, "", StatusCodes.Status200OK);
            }
            return StandardAPIResponse<IEnumerable<FloorZoneByPermissionDto>>.SuccessResponse(null, AppMessageConstants.RecordNotFound, StatusCodes.Status404NotFound);
        }

        [HttpGet]
        [Route("FloorsByPermission")]
        [CustomAuthorize([ScreenNames.FloorPlanAndZoneMaster])]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<GetFloorDto>>>> GetFloorsByPermissionAsync()
        {
            var user = _httpContextAccessor.HttpContext?.User;
            IEnumerable<string>? userRoles = user?.Claims.Where(x => x.Type == "role").Select(y => y.Value);
            var data = await _floorService.GetFloorsByPermissionAsync(userRoles);
            if (data.Count() > 0)
            {
                return StandardAPIResponse<IEnumerable<GetFloorDto>>.SuccessResponse(data, "", StatusCodes.Status200OK);
            }
            return StandardAPIResponse<IEnumerable<GetFloorDto>>.SuccessResponse(null, AppMessageConstants.RecordNotFound, StatusCodes.Status404NotFound);
        }

        [HttpGet]
        [Route("GetFloorByFloorId/{floorId}")]
        [CustomAuthorize([ScreenNames.FloorPlanAndZoneMaster])]
        public async Task<ActionResult<StandardAPIResponse<GetFloorDto>>> GetFloorByFloorId(string floorId)
        {
            var data = await _floorService.GetFloorByFloorIdAsync(floorId);
            if (data != null)
            {
                return StandardAPIResponse<GetFloorDto>.SuccessResponse(data, "", StatusCodes.Status200OK);
            }
            return StandardAPIResponse<GetFloorDto>.ErrorResponse(null, AppMessageConstants.RecordNotFound, StatusCodes.Status200OK);
        }

        [HttpPost]
        [Route("FloorZonesNameByIds")]
        //[CustomAuthorize([ScreenNames.FloorPlanAndZoneMaster])]
        public async Task<ActionResult<StandardAPIResponse<FloorZonesNameByIdResponse>>> FloorZonesNameByIds(FloorZonesNameByIdRequest request)
        {

            var data = await _floorService.GetFloorZonesByIdsAsync(request);
            if (data.FloorNames.Count() > 0)
            {
                return StandardAPIResponse<FloorZonesNameByIdResponse>.SuccessResponse(data, "", StatusCodes.Status200OK);
            }
            return StandardAPIResponse<FloorZonesNameByIdResponse>.SuccessResponse(null, AppMessageConstants.RecordNotFound, StatusCodes.Status404NotFound);
        }
    }
}
