using HanwhaAdminApi.Application.Interfaces;
using HanwhaAdminApi.Helper;
using HanwhaAdminApi.Model.Common;
using HanwhaAdminApi.Model.DbEntities;
using HanwhaAdminApi.Model.Dto;
using HanwhaAdminApi.Model.Dto.Role;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HanwhaAdminApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RoleController : ControllerBase
    {
        private readonly IRoleService _roleService;
        private readonly IRoleScreenMappingService _roleScreenMappingService;
        private readonly IHttpContextAccessor _context;
        private readonly ICurrentUserService _currentUserService;

        public RoleController(IRoleService roleService,
            IHttpContextAccessor context,
            ICurrentUserService currentUserService)
        {
            this._roleService = roleService;
            this._context = context;
            _currentUserService = currentUserService;
        }

        [HttpGet]
        [Route("GetAllRole")]
        [CustomAuthorize([ScreenNames.CanViewRole, ScreenNames.CanAddOrUpdateUser, ScreenNames.CanViewPermission])]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<RoleMaster>>>> GetAllRole()
        {
            var userId = _currentUserService.UserId;
            var result = await _roleService.GetRolesAsync();
            if (result.data != null)
                return StandardAPIResponse<IEnumerable<RoleMaster>>.SuccessResponse(result.data, "", StatusCodes.Status200OK, ReferenceData: result.referenceData);
            else
                return BadRequest(StandardAPIResponse<IEnumerable<RoleMaster>>.ErrorResponse(null, AppMessageConstants.NotFound, StatusCodes.Status400BadRequest));
        }

        [HttpPost]
        [Route("CreateRole")]
        [CustomAuthorize([ScreenNames.CanAddOrUpdateRole])]
        public async Task<ActionResult<StandardAPIResponse<string>>> CreateRoleAsync(RoleRequestModel roleRequest)
        {
            var userId = _currentUserService.UserId;
            var data = await _roleService.SaveRoleAsync(roleRequest, userId);
            if (string.IsNullOrEmpty(data.ErrorMessage) && string.IsNullOrEmpty(roleRequest.Id))
                return StandardAPIResponse<string>.SuccessResponse(data.RoleId, AppMessageConstants.InsertSuccess);
            else if (!string.IsNullOrEmpty(roleRequest.Id) && data.RoleId != "")
            {
                return StandardAPIResponse<string>.SuccessResponse(data.RoleId, AppMessageConstants.UpdateSuccess);
            }
            else
                return BadRequest(StandardAPIResponse<string>.ErrorResponse(null, data.ErrorMessage, StatusCodes.Status400BadRequest));
        }

        [HttpDelete]
        [Route("{Id}")]
        [CustomAuthorize([ScreenNames.CanDeleteRole])]
        public async Task<ActionResult<StandardAPIResponse<bool>>> DeleteRoleAsync(string Id)
        {
            var userId = _currentUserService.UserId;
            var data = await _roleService.DeleteRoleAsync(Id, userId);
            if (data)
                return StandardAPIResponse<bool>.SuccessResponse(data, AppMessageConstants.DeleteSuccess);
            else
                return BadRequest(StandardAPIResponse<bool>.ErrorResponse(data, AppMessageConstants.RoleExistsFailure, StatusCodes.Status400BadRequest));
        }

        [HttpPost]
        [Route("Permission")]
        [CustomAuthorize([ScreenNames.CanViewPermission])]
        public async Task<ActionResult<StandardAPIResponse<string>>> SaveRolePermissionAsync(SaveRolePermissionRequestModel saveRolePermission)
        {
            var userId = _currentUserService.UserId;
            var data = await _roleService.SaveRolePermissionAsync(saveRolePermission, userId);
            var response = StandardAPIResponse<string>.SuccessResponse(data, AppMessageConstants.UpdateSuccess);
            return response;
        }

        [HttpGet]
        [Route("Permission")]
        [CustomAuthorize([ScreenNames.CanViewPermission])]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<RolePermissionResponseModel>>>> GetRolePermissionAsync()
        {
            var userId = _currentUserService.UserId;
            var data = await _roleService.GetRolePermissionAsync();
            var response = StandardAPIResponse<IEnumerable<RolePermissionResponseModel>>.SuccessResponse(data, AppMessageConstants.DataRetrieved);
            return response;
        }

        [HttpGet("UserRolePermission")]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<UserRolePermissionResponseDto>>>> UserRolePermission()
        {
           // string roleName = _context.HttpContext.User.Claims.FirstOrDefault(x => x.Type == "role")?.Value;
            var roleNames = _context.HttpContext.User.Claims
                            .Where(x => x.Type == "role")
                            .Select(x => x.Value)
                            .ToList();
            var result = await _roleService.GetUserRolePermission(roleNames);
         
            return StandardAPIResponse<IEnumerable<UserRolePermissionResponseDto>>.SuccessResponse(result, "", StatusCodes.Status200OK);
        }
    }
}
