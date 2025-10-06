using HanwhaClient.Application.Interfaces;
using HanwhaClient.Model.Auth;
using HanwhaClient.Model.Common;
using Microsoft.AspNetCore.Mvc;

namespace HanwhaClient.Server.Controllers
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
                    var response = StandardAPIResponse<TokenResponseModel>.SuccessResponse(result, AppMessageConstants.UserLoggedIn);
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
                var response = StandardAPIResponse<TokenResponseModel>.SuccessResponse(result, AppMessageConstants.NewTokenGenerated);
                return response;
            }
            else
            {
                var response = StandardAPIResponse<TokenResponseModel>.ErrorResponse(null, result.ErrorMessage, 401);
                return Unauthorized(response);
            }
        }

    }
}
