using HanwhaClient.Application.Interfaces;
using HanwhaClient.Model.Common;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;

namespace HanwhaClient.Helper
{
    public class CustomAuthorizeAttribute : Attribute, IAsyncAuthorizationFilter
    {
        private readonly string _fromPermission;
        private readonly string[] _screenName;

        public CustomAuthorizeAttribute(string[] screenName
            , string fromPermission = ""
            )
        {
            _screenName = screenName;
            _fromPermission = fromPermission;
        }

        public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        {
            var logger = context.HttpContext.RequestServices.GetService(typeof(ILogger<CustomAuthorizeAttribute>)) as ILogger<CustomAuthorizeAttribute>;

            if (!context.HttpContext.User.Identity.IsAuthenticated)
            {
                LogAndSetUnauthorizedResult(context, logger, AppMessageConstants.UnauthorizedAccessResource);
                return;
            }

            var userRoles = context.HttpContext.User.Claims
                .Where(c => c.Type == ClaimTypes.Role || c.Type == "role")
                .Select(c => c.Value.ToLower())
                .ToList();

            if (!userRoles.Any())
            {
                LogAndSetUnauthorizedResult(context, logger, AppMessageConstants.InsufficientPermissions);
                return;
            }

            var permissionService = context.HttpContext.RequestServices.GetService(typeof(IPermissionService)) as IPermissionService;

            if (string.IsNullOrEmpty(_fromPermission))
            {
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
            else
            {
                foreach (var userRole in userRoles)
                {
                    foreach (var screenName in _screenName)
                    {
                        if (permissionService != null && permissionService.CheckWidgetPermission(userRole, _fromPermission, screenName))
                        {
                            logger?.LogInformation("User with role {UserRole} authorized successfully.", userRole);
                            await Task.CompletedTask; // Exit early for the first valid role
                            return;
                        }
                    }
                }

            }

            LogAndSetUnauthorizedResult(context, logger, AppMessageConstants.InsufficientPermissions);
        }


        private static void LogAndSetUnauthorizedResult(AuthorizationFilterContext context, ILogger? logger, string message, string? userRole = null)
        {
            var responseData = StandardAPIResponse<bool>.ErrorResponse(false, "Denied", StatusCodes.Status401Unauthorized, new List<string> { message });
            context.Result = new UnauthorizedObjectResult(responseData);

            if (!string.IsNullOrEmpty(userRole))
            {
                logger?.LogError("Forbidden access attempt by user with role: {UserRole}", userRole);
            }
            else
            {
                logger?.LogError(AppMessageConstants.UnauthorizedAccessAttempt);
            }
        }
    }
}