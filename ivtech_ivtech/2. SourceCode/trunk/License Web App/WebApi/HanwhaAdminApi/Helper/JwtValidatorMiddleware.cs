using HanwhaAdminApi.Model.Common;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace HanwhaAdminApi.Helper
{
    public class JwtValidatorMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IConfiguration _configuration;
        private readonly JwtSettings _jwtSettings;
        private readonly ILogger<JwtValidatorMiddleware> _logger;

        public JwtValidatorMiddleware(RequestDelegate next, IConfiguration configuration, IOptions<JwtSettings> jwtSettings, ILogger<JwtValidatorMiddleware> logger)
        {
            _next = next;
            _configuration = configuration;
            _jwtSettings = jwtSettings.Value;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var token = context.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();

            if (token == null)
            {
                await _next(context);
                return;
            }

            try
            {
                // Load the public key for RSA verification
                var rsaPublicKey = RSA.Create();
                rsaPublicKey.ImportRSAPublicKey(Convert.FromBase64String(_jwtSettings.RSAPublicKey), out _);

                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new RsaSecurityKey(rsaPublicKey),
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidIssuer = _jwtSettings.Issuer,
                    ValidAudience = _jwtSettings.Audience,
                    //ClockSkew = TimeSpan.FromMinutes(_jwtSettings.TokenExpirationInMinutes), // Adjust the clock skew as needed
                    ClockSkew = TimeSpan.Zero,
                    TokenDecryptionKey = GetDecryptionKey() // Use the same decryption key as during token creation

                };

                var tokenHandler = new JwtSecurityTokenHandler();
                tokenHandler.ValidateToken(token, validationParameters, out SecurityToken validatedToken);

                // Extract ClaimsPrincipal and assign it to the context
                var claimsPrincipal = new ClaimsPrincipal(new ClaimsIdentity(((JwtSecurityToken)validatedToken).Claims, "jwt"));
                context.User = claimsPrincipal;
              
            }
            catch (Exception ex)
            {
                // context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                var responseData = StandardAPIResponse<bool>.ErrorResponse(false, "Access Denied", StatusCodes.Status401Unauthorized, ["Denied: Your Authorization Token Has Expired. Reauthenticate and Try Again"]);
                var response = new UnauthorizedObjectResult(responseData);
                //var response = ResponseHelper.GenerateErrorResponse(StatusCodes.Status401Unauthorized, "Denied: Your Authorization Token Has Expired. Reauthenticate and Try Again", true);
                await response.ExecuteResultAsync(new ActionContext
                {
                    HttpContext = context,
                    RouteData = context.GetRouteData(),
                    ActionDescriptor = new ActionDescriptor()
                });

                _logger.LogError("Invalid token: " + ex.Message);
                // await context.Response.WriteAsync("Invalid token: " + ex.Message);
                return;
            }

            await _next(context);
        }

        private SecurityKey GetDecryptionKey()
        {
            // Load your encryption key here (used in EncryptingCredentials)
            return new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SymmetricSecurityKey));
            //return new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JwtSettings:EncryptionKey"]));
        }
    }
}
