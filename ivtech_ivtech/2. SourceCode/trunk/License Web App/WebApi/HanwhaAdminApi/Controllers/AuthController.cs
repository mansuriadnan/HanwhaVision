using HanwhaAdminApi.Application.Interfaces;
using HanwhaAdminApi.Model.Auth;
using HanwhaAdminApi.Model.Common;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HanwhaAdminApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            this._authService = authService;
        }

        [HttpPost("login")]
        public async Task<ActionResult<StandardAPIResponse<TokenResponseModel>>> LoginAsync([FromBody] LoginRequestModel loginModel)
        {
            try
            {
                var result = await _authService.LoginAsync(loginModel.Username, loginModel.Password);
                if (string.IsNullOrEmpty(result.ErrorMessage))
                {
                    var response = StandardAPIResponse<TokenResponseModel>.SuccessResponse(result, "");
                    return response;
                }
                else
                {
                    var response = StandardAPIResponse<TokenResponseModel>.ErrorResponse(null, result.ErrorMessage);
                    return response;
                }
            }
            catch (Exception ex)
            {
                var msg = ex.Message;
                throw;
            }
        }

        [HttpPost("refreshToken")]
        public async Task<ActionResult<StandardAPIResponse<TokenResponseModel>>> RefreshToken([FromBody] RefreshTokenRequest request)
        {
            var result = await _authService.RefreshTokenAsync(request.RefreshToken);
            if (string.IsNullOrEmpty(result.ErrorMessage))
            {
                var response = StandardAPIResponse<TokenResponseModel>.SuccessResponse(result, "");
                return response;
            }
            else
            {
                var response = StandardAPIResponse<TokenResponseModel>.ErrorResponse(null, result.ErrorMessage, StatusCodes.Status401Unauthorized);
                return Unauthorized(response);
            }
        }

        [HttpGet]
        public async Task<string> GetTest()
        {
            return "Test";
        }
    }
}
