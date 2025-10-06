using HanwhaClient.Model.Common;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Runtime.InteropServices;
using System.Security.Cryptography;

namespace HanwhaClient.Helper
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true, Inherited = true)]
    public class ApiKeyAttribute : Attribute, IAuthorizationFilter
    {
        private const string API_KEY_HEADER_NAME = "X-API-Key";

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            var submittedApiKey = GetSubmittedApiKey(context.HttpContext);
            var apiKey = GetApiKey(context.HttpContext);

            if (!IsApiKeyValid(apiKey, submittedApiKey))
            {
                //context.Result = ResponseHelper.GenerateErrorResponse(StatusCodes.Status401Unauthorized, "You haven't valid API key.", true);
                var responseData = StandardAPIResponse<bool>.ErrorResponse(false, "Denied", StatusCodes.Status401Unauthorized, ["Denied: Your Authorization Token Has Expired. Reauthenticate and Try Again"]);
                context.Result = new UnauthorizedObjectResult(responseData);
            }
        }

        private static string? GetApiKey(HttpContext context)
        {
            var configuration = context.RequestServices.GetRequiredService<IConfiguration>();

            return configuration.GetValue<string>($"ApiKey");
        }

        private static string? GetSubmittedApiKey(HttpContext context)
        {
            if (!context.Request.Headers.TryGetValue(API_KEY_HEADER_NAME, out var encodedApiKey) || string.IsNullOrEmpty(encodedApiKey))
            {
                return null; // or handle the error as needed
            }

            return Uri.UnescapeDataString(encodedApiKey);
        }

        private static bool IsApiKeyValid(string? apiKey, string? submittedApiKey)
        {
            if (string.IsNullOrEmpty(submittedApiKey)) return false;

            var apiKeySpan = MemoryMarshal.Cast<char, byte>(apiKey.AsSpan());
            var submittedApiKeySpan = MemoryMarshal.Cast<char, byte>(submittedApiKey.AsSpan());

            return CryptographicOperations.FixedTimeEquals(apiKeySpan, submittedApiKeySpan);
        }
    }
}
