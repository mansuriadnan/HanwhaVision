using HanwhaClient.Application.Interfaces;
using HanwhaClient.Helper;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.Dto;
using HanwhaClient.Model.Role;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HanwhaClient.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RoleController : ControllerBase
    {
        private readonly IRoleService _roleService;
        private readonly ICurrentUserService _currentUserService;
        private readonly IHttpContextAccessor _context;

        public RoleController(IRoleService roleService, ICurrentUserService currentUserService, IHttpContextAccessor context)
        {
            _roleService = roleService;
            _currentUserService = currentUserService;
            _context = context;
        }

        [HttpGet("GetAllRoles")]
        [CustomAuthorize([ScreenNames.RoleMaster, ScreenNames.UserMaster])]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<RoleMaster>>>> GetAllRoles()
        {
            var data = await _roleService.GetRolesAsync();
            if (data != null && data.Any())
            {
                return StandardAPIResponse<IEnumerable<RoleMaster>>.SuccessResponse(data, "");
            }
            return StandardAPIResponse<IEnumerable<RoleMaster>>.ErrorResponse(null, AppMessageConstants.RecordNotFound, StatusCodes.Status400BadRequest);
        }

        [HttpPost("AddUpdateRole")]
        [CustomAuthorize([ScreenNames.AddorUpdateRole])]
        public async Task<ActionResult<StandardAPIResponse<string>>> AddUpdateRole(RoleRequestModel roleRequest)
        {
            var userId = _currentUserService.UserId;
            var data = await _roleService.SaveRoleAsync(roleRequest, userId);

            if (string.IsNullOrEmpty(data.ErrorMessage))
            {
                return StandardAPIResponse<string>.SuccessResponse(data.RoleId, string.IsNullOrEmpty(roleRequest.Id) ? AppMessageConstants.RecordUpdated : AppMessageConstants.RecordAdded);
            }
            return StandardAPIResponse<string>.ErrorResponse(null, data.ErrorMessage, StatusCodes.Status400BadRequest);
        }

        [HttpDelete("{id}")]
        [CustomAuthorize([ScreenNames.DeleteRole])]
        public async Task<ActionResult<StandardAPIResponse<int>>> DeleteRole(string id)
        {
            var userId = _currentUserService.UserId;
            var result = await _roleService.DeleteRoleAsync(id, userId);

            return result switch
            {
                1 => StandardAPIResponse<int>.SuccessResponse(result, AppMessageConstants.RecordDeleted),
                2 => StandardAPIResponse<int>.ErrorResponse(result, AppMessageConstants.RecordNotFound, StatusCodes.Status400BadRequest),
                _ => StandardAPIResponse<int>.ErrorResponse(result, AppMessageConstants.RoleExists, StatusCodes.Status400BadRequest),
            };
        }


        [HttpGet("GetPermissions")]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<RolePermissionResponseModel>>>> GetRolePermissions()
        {
            var data = await _roleService.GetRolePermissionAsync();
            return StandardAPIResponse<IEnumerable<RolePermissionResponseModel>>.SuccessResponse(data, AppMessageConstants.RecordRetrieved);
        }

        [HttpPost("UploadFile")]
        public IActionResult UploadFile([FromForm] IFormFileCollection files, RolePermissionResponseModel model)
        {
            if (files == null || files.Count == 0)
            {
                return BadRequest(StandardAPIResponse<string>.ErrorResponse(null, AppMessageConstants.FileUploaded, StatusCodes.Status400BadRequest));
            }
            return Ok(new { Message = AppMessageConstants.FileUploaded, FileName = files[0].FileName });
        }

        [HttpGet("UserRolePermissions")]
        public async Task<ActionResult<StandardAPIResponse<UserRolePermissionResponseDto>>> GetUserRolePermissions()
        {
           // string roleName = _context.HttpContext.User.Claims.FirstOrDefault(x => x.Type == "role")?.Value;
            var roleNames = _context.HttpContext.User.Claims
                            .Where(x => x.Type == "role")
                            .Select(x => x.Value)
                            .ToList();
            var result = await _roleService.GetUserRolePermission(roleNames);

            if (result == null)
            {
                return StandardAPIResponse<UserRolePermissionResponseDto>.ErrorResponse(null, AppMessageConstants.RecordNotFound, StatusCodes.Status404NotFound);
            }
            return StandardAPIResponse<UserRolePermissionResponseDto>.SuccessResponse(result, "", StatusCodes.Status200OK);
        }
    }
}
