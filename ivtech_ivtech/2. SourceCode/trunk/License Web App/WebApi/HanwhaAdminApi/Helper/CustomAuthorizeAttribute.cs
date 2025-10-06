using HanwhaAdminApi.Application.Interfaces;
using HanwhaAdminApi.Model.Common;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HanwhaAdminApi.Helper
{
    public class CustomAuthorizeAttribute : Attribute, IAsyncAuthorizationFilter
    {
        //private readonly string[] _roles;
        private readonly string[] _screenName;

        public CustomAuthorizeAttribute(string[] screenName
            //,params string[] roles
            )
        {
            _screenName = screenName;
            //_roles = roles;
        }

        public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        {
            var logger = context.HttpContext.RequestServices.GetService(typeof(ILogger<CustomAuthorizeAttribute>)) as ILogger<CustomAuthorizeAttribute>;
            try
            {

                if (!context.HttpContext.User.Identity.IsAuthenticated)
                {
                    LogAndSetUnauthorizedResult(context, logger, AppMessageConstants.UnauthorizedAccess);
                    return;
                }

                var userRoles = context.HttpContext.User.Claims
                    .Where(c => c.Type == ClaimTypes.Role || c.Type == "role")
                    .Select(c => c.Value.ToLower())
                    .ToList();

                if (!userRoles.Any())
                {
                    LogAndSetUnauthorizedResult(context, logger, AppMessageConstants.InsufficientPermission);
                    return;
                }

                var permissionService = context.HttpContext.RequestServices.GetService(typeof(IPermissionService)) as IPermissionService;

                foreach (var userRole in userRoles)
                {
                    foreach (var screenName in _screenName)
                    {
                        //if (_roles.Contains(userRole) && permissionService != null && permissionService.checkPermission(userRole, _screenName))
                        if (permissionService != null && permissionService.checkPermission(userRole, screenName))
                        {
                            logger?.LogInformation("User with role {UserRole} authorized successfully.", userRole);
                            await Task.CompletedTask; // Exit early for the first valid role
                            return;
                        }
                    }
                }

            }
            catch (Exception ex)
            {
                var msg = ex.Message;
                throw;
            }
            LogAndSetUnauthorizedResult(context, logger, AppMessageConstants.InsufficientPermission);
        }


        private static void LogAndSetUnauthorizedResult(AuthorizationFilterContext context, ILogger? logger, string message, string? userRole = null)
        {
            var responseData = StandardAPIResponse<bool>.ErrorResponse(false, "Access Denied", StatusCodes.Status401Unauthorized, new List<string> { message });
            context.Result = new UnauthorizedObjectResult(responseData);

            if (!string.IsNullOrEmpty(userRole))
            {
                logger?.LogError(AppMessageConstants.ForbiddenAccess + "{ UserRole}", userRole);
            }
            else
            {
                logger?.LogError(AppMessageConstants.UnauthorizedAccess);
            }
        }
    }
}
