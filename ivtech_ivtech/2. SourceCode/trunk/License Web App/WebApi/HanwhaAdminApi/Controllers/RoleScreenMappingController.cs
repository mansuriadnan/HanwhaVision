using HanwhaAdminApi.Application.Interfaces;
using HanwhaAdminApi.Helper;
using HanwhaAdminApi.Model.Common;
using HanwhaAdminApi.Model.DbEntities;
using HanwhaAdminApi.Model.Dto.Role;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HanwhaAdminApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [CustomAuthorize([ScreenNames.PermissionsMaster])]
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
        [CustomAuthorize([ScreenNames.PermissionsMaster])]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<ScreenMaster>>>> GetRoleScreenMappings(string roleId)
        {
            var result = await _roleScreenMappingService.GetRoleScreenMappingsByRoleIdAsync(roleId);
            if (result.data == null || result.data.Count() == 0)
            {
                return StandardAPIResponse<IEnumerable<ScreenMaster>>.ErrorResponse(null, AppMessageConstants.NotFound, StatusCodes.Status404NotFound);
            }
            return StandardAPIResponse<IEnumerable<ScreenMaster>>.SuccessResponse(result.data, "", StatusCodes.Status200OK, ReferenceData: result.referenceData);
        }

        [HttpPost]
        [Route("AddRolePermission")]
        [CustomAuthorize([ScreenNames.PermissionsMaster])]
        public async Task<ActionResult<StandardAPIResponse<string>>> AddRolePermission([FromBody] List<RoleScreenMappingRequestDto> roleScreenMappingRequestDto)
        {
            var userId = _currentUserService.UserId;
            var result = await _roleScreenMappingService.AddUpdateRoleScreenMapping(roleScreenMappingRequestDto, userId);
            if (result == null || result.Count() == 0)
            {
                return StandardAPIResponse<string>.ErrorResponse(null, AppMessageConstants.NotFound, StatusCodes.Status404NotFound);
            }
            _permissionService.RefreshPermissionData();
            return StandardAPIResponse<string>.SuccessResponse(result, AppMessageConstants.UpdateSuccess, StatusCodes.Status200OK);

        }
    }
}
