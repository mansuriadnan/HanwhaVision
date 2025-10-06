using HanwhaClient.Application.Interfaces;
using HanwhaClient.Helper;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.Dto;
using HanwhaClient.Model.Role;
using Microsoft.AspNetCore.Mvc;

namespace HanwhaClient.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [CustomAuthorize([ScreenNames.PermissionMaster])]
    public class RoleScreenMappingController : ControllerBase
    {
        private readonly IRoleScreenMappingService _roleScreenMappingService;
        private readonly IUsersService _usersService;
        private readonly ICurrentUserService _currentUserService;
        private readonly IPermissionService _permissionService;

        public RoleScreenMappingController(IRoleScreenMappingService roleScreenMappingService, IUsersService usersService, ICurrentUserService currentUserService, IPermissionService permissionService)
        {
            _roleScreenMappingService = roleScreenMappingService;
            _usersService = usersService;
            _currentUserService = currentUserService;
            _permissionService = permissionService;
        }

        [HttpGet("RoleScreenMappings/{roleId}")]
        [CustomAuthorize([ScreenNames.ScreenPermission])]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<ScreenMaster>>>> GetRoleScreenMappings(string roleId)
        {
            var result = await _roleScreenMappingService.GetRoleScreenMappingsByRoleIdAsync(roleId);
            if (result.data == null || result.data.Count() == 0)
            {
                return StandardAPIResponse<IEnumerable<ScreenMaster>>.ErrorResponse(null, AppMessageConstants.RecordNotFound, StatusCodes.Status404NotFound);
            }
            return StandardAPIResponse<IEnumerable<ScreenMaster>>.SuccessResponse(result.data, "", StatusCodes.Status200OK, ReferenceData: result.referenceData);
        }

        [HttpPost]
        [Route("AddRolePermission")]
        [CustomAuthorize([ScreenNames.ScreenPermission])]
        public async Task<ActionResult<StandardAPIResponse<string>>> AddRolePermission([FromBody] List<RoleScreenMappingRequestDto> roleScreenMappingRequestDto)
        {
            var userId = _currentUserService.UserId;
            var result = await _roleScreenMappingService.AddUpdateRoleScreenMapping(roleScreenMappingRequestDto, userId);
            if (result == null || result.Count() == 0)
            {
                return StandardAPIResponse<string>.ErrorResponse(null, AppMessageConstants.RecordNotFound, StatusCodes.Status404NotFound);
            }
            _permissionService.RefreshPermissionData();

            return StandardAPIResponse<string>.SuccessResponse(result, AppMessageConstants.RecordUpdated, StatusCodes.Status200OK);

        }


        [HttpGet("FloorRoleScreenMappings/{roleId}")]
        [CustomAuthorize([ScreenNames.FloorZonePermission])]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<DataAccessPermissionResponseModel>>>> GetFloorRoleScreenMappingsAsync(string roleId)
        {
            var result = await _roleScreenMappingService.GetFloorRoleScreenMappingsByRoleIdAsync(roleId);
            if (result == null || result.Count() == 0)
            {
                return StandardAPIResponse<IEnumerable<DataAccessPermissionResponseModel>>.ErrorResponse(null, AppMessageConstants.RecordNotFound, StatusCodes.Status404NotFound);
            }
            return StandardAPIResponse<IEnumerable<DataAccessPermissionResponseModel>>.SuccessResponse(result, "", StatusCodes.Status200OK);
        }


        [HttpPost]
        [Route("FloorRolePermission")]
        [CustomAuthorize([ScreenNames.FloorZonePermission])]
        public async Task<ActionResult<StandardAPIResponse<string>>> FloorRolePermission([FromBody] SaveFloorRoleMappingRequest floorRoleScreenMappingRequest)
        {
            var userId = _currentUserService.UserId;
            var result = await _roleScreenMappingService.UpdateFloorRoleScreenMappingAsync(floorRoleScreenMappingRequest, userId);
            if (!string.IsNullOrEmpty(result))
            {
                return StandardAPIResponse<string>.ErrorResponse(null, AppMessageConstants.RecordNotFound, StatusCodes.Status404NotFound);
            }
            _permissionService.RefreshPermissionData();
            return StandardAPIResponse<string>.SuccessResponse(result, AppMessageConstants.RecordUpdated, StatusCodes.Status200OK);

        }

        [HttpPost]
        [Route("Widget")]
        [CustomAuthorize([ScreenNames.WidgetPermission])]
        public async Task<ActionResult<StandardAPIResponse<string>>> WidgetRolePermission([FromBody] SaveWidgetAccessPermissionRequest widgetRoleScreenMappingRequest)
        {
            var userId = _currentUserService.UserId;
            var result = await _roleScreenMappingService.UpdateWidgetRoleScreenMappingAsync(widgetRoleScreenMappingRequest, userId);
            if (!string.IsNullOrEmpty(result))
            {
                return StandardAPIResponse<string>.ErrorResponse(null, AppMessageConstants.RecordNotFound, StatusCodes.Status404NotFound);
            }
            _permissionService.RefreshPermissionData();
            _permissionService.RefreshWidgetPermissionData();
            return StandardAPIResponse<string>.SuccessResponse(result, AppMessageConstants.RecordUpdated, StatusCodes.Status200OK);
        }

        [HttpGet("Widget/{roleId}")]
        [CustomAuthorize([ScreenNames.WidgetPermission])]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<WidgetAccessPermissionResponse>>>> GetWidgetRoleScreenMappingsAsync(string roleId)
        {
            var result = await _roleScreenMappingService.GetWidgetsByRoleIdAsync(roleId);
            if (result == null || result.Count() == 0)
            {
                return StandardAPIResponse<IEnumerable<WidgetAccessPermissionResponse>>.ErrorResponse(null, AppMessageConstants.RecordNotFound, StatusCodes.Status404NotFound);
            }
            return StandardAPIResponse<IEnumerable<WidgetAccessPermissionResponse>>.SuccessResponse(result, "", StatusCodes.Status200OK);
        }


    }

}
