using HanwhaAdminApi.Application.Interfaces;
using HanwhaAdminApi.Helper;
using HanwhaAdminApi.Model.Common;
using HanwhaAdminApi.Model.DbEntities;
using HanwhaAdminApi.Model.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HanwhaAdminApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IUsersService _usersService;
        private readonly IHttpContextAccessor _context;
        private readonly IOtpService _otpService;
        private readonly ICurrentUserService _currentUserService;


        public UsersController(IUsersService usersService,
            IHttpContextAccessor context,
            IOtpService otpService,
            ICurrentUserService currentUserService)
        {
            this._usersService = usersService;
            this._context = context;
            _otpService = otpService;
            _currentUserService = currentUserService;
        }

        [HttpGet]
        [Route("GetAllUser")]
        [CustomAuthorize([ScreenNames.UserMaster])]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<UserMaster>>>> GetAllUsersAsync()
        {
            var result = await _usersService.GetAllUsersAsync();
            var response = StandardAPIResponse<IEnumerable<UserMaster>>.SuccessResponse(result.data, AppMessageConstants.DataRetrieved, StatusCodes.Status200OK, ReferenceData: result.referenceData);
            return response;
        }

        [HttpPost]
        [Route("")]
        [CustomAuthorize([ScreenNames.CanAddOrUpdateUser])]
        public async Task<ActionResult<StandardAPIResponse<string>>> CreateUserAsync(UsersRequestModel user)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = _currentUserService.UserId;
            var data = await _usersService.SaveUserAsync(user, userId);
            if (string.IsNullOrEmpty(data.Id))
            {
                return StandardAPIResponse<string>.ErrorResponse(string.Empty, data.ErrorMessage, StatusCodes.Status400BadRequest);
            }
            else if (!string.IsNullOrEmpty(user.Id))
            {
                return StandardAPIResponse<string>.SuccessResponse(data.Id, AppMessageConstants.UpdateSuccess);
            }
            return StandardAPIResponse<string>.SuccessResponse(data.Id, AppMessageConstants.InsertSuccess);
        }

        [HttpGet]
        [Route("{Id}")]
        [CustomAuthorize([ScreenNames.UserMaster])]
        public async Task<ActionResult<StandardAPIResponse<UserMaster>>> GetUser(string Id)
        {
            var data = await _usersService.GetUserAsync(Id);
            if (data == null)
            {
                return StandardAPIResponse<UserMaster>.ErrorResponse(null, AppMessageConstants.NotFound, StatusCodes.Status404NotFound);
            }
            return StandardAPIResponse<UserMaster>.SuccessResponse(data, AppMessageConstants.DataRetrieved);
        }

        [HttpDelete]
        [Route("{id}")]
        [CustomAuthorize([ScreenNames.CanDeleteUser])]
        public async Task<ActionResult<StandardAPIResponse<bool>>> DeleteUser(string id)
        {
            var userId = _currentUserService.UserId;
            var data = await _usersService.DeleteUserAsync(id, userId);
            if (!data)
            {
                return StandardAPIResponse<bool>.ErrorResponse(false, AppMessageConstants.NotFound, StatusCodes.Status404NotFound);
            }
            return StandardAPIResponse<bool>.SuccessResponse(data, AppMessageConstants.DeleteSuccess);
        }


        [AllowAnonymous]
        [HttpPost("ValidateOtp")]
        public async Task<ActionResult<StandardAPIResponse<string>>> ValidateOtp([FromBody] OtpValidationDto validationRequest)
        {
            var isValidOtp = await _otpService.ValidateOtpAsync(
                new OtpRequestDto { Email = validationRequest.Email },
                validationRequest.Otp
            );

            if (!isValidOtp)
            {
                return StandardAPIResponse<string>.ErrorResponse("", AppMessageConstants.OtpExpiredInvalid, StatusCodes.Status404NotFound);
            }
            else if (validationRequest.IsFromUser)
            {
                return StandardAPIResponse<string>.SuccessResponse("", AppMessageConstants.OtpValidatedUser, StatusCodes.Status200OK);
            }
            return StandardAPIResponse<string>.SuccessResponse("", AppMessageConstants.OtpValidated);
        }

        [AllowAnonymous]
        [HttpPost]
        [Route("ForgotPassword")]
        public async Task<ActionResult<StandardAPIResponse<string>>> ForgotPassword([FromBody] ForgotPasswordDto forgotPasswordDto)
        {
            bool isPasswordForgot = await _usersService.ForgotPasswordAsync(forgotPasswordDto);

            if (isPasswordForgot && !forgotPasswordDto.IsResent)
            {
                return StandardAPIResponse<string>.SuccessResponse("", AppMessageConstants.OtpSentToEmail, StatusCodes.Status200OK);
            }
            else if (forgotPasswordDto.IsResent)
            {
                return StandardAPIResponse<string>.SuccessResponse("", AppMessageConstants.OtpReSentToEmail, StatusCodes.Status200OK);
            }
            return StandardAPIResponse<string>.ErrorResponse("", AppMessageConstants.EmailNotRegistered, StatusCodes.Status404NotFound);
        }
        [Route("ResetPassword")]
        [HttpPost]
        public async Task<ActionResult<StandardAPIResponse<string>>> ResetPassword([FromBody] ResetPasswordDto resetPasswordDto)
        {
            var userId = _currentUserService.UserId;
            bool isPasswordReset = await _usersService.ResetPasswordAsync(resetPasswordDto, userId);

            if (isPasswordReset)
            {
                return StandardAPIResponse<string>.SuccessResponse("", AppMessageConstants.ResetPasswordSuccess, StatusCodes.Status200OK);
            }

            return StandardAPIResponse<string>.ErrorResponse("", AppMessageConstants.OldPasswordMismatch, StatusCodes.Status404NotFound);
        }

        [AllowAnonymous]
        [Route("ForgotResetPassword")]
        [HttpPost]
        public async Task<ActionResult<StandardAPIResponse<string>>> ForgotResetPassword([FromBody] ForgotPasswordResetDto resetPasswordDto)
        {
            bool isPasswordReset = await _usersService.ForgotPasswordResetAsync(resetPasswordDto);

            if (isPasswordReset)
            {
                return StandardAPIResponse<string>.SuccessResponse("", AppMessageConstants.ResetPasswordSuccess, StatusCodes.Status200OK);
            }

            return StandardAPIResponse<string>.ErrorResponse("", AppMessageConstants.OldPasswordMismatch, StatusCodes.Status404NotFound);
        }

        [HttpGet]
        [Route("UserProfile")]
        public async Task<ActionResult<StandardAPIResponse<UserMaster>>> GetUserProfile()
        {
            var userId = _currentUserService.UserId;
            var result = await _usersService.GetUsersProfile(userId);
            if (result.data != null)
            {
                return StandardAPIResponse<UserMaster>.SuccessResponse(result.data, AppMessageConstants.DataRetrieved, StatusCodes.Status200OK, ReferenceData: result.referenceData);
            }
            return StandardAPIResponse<UserMaster>.ErrorResponse(null, AppMessageConstants.NotFound, StatusCodes.Status404NotFound);
        }


        [HttpPost("UploadProfileImage")]
        public async Task<ActionResult<StandardAPIResponse<string>>> UploadProfileImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(AppMessageConstants.FileUploadFailure);
            }
            var userId = _currentUserService.UserId;
            var result = await _usersService.SaveUserProfileImage(file, userId);
            if (result)
            {
                return StandardAPIResponse<string>.SuccessResponse(file.FileName, AppMessageConstants.FileUploadSuccess);
            }
            return StandardAPIResponse<string>.ErrorResponse(file.FileName, AppMessageConstants.SomethingWentWrong);
        }

        [HttpPost]
        [Route("SendOtp")]
        [CustomAuthorize([ScreenNames.UserMaster])]
        public async Task<ActionResult<StandardAPIResponse<bool>>> SendOtp(SendOtpRequestModel sendOtpRequestModel)
        {
            var userId = _currentUserService.UserId;
            if (sendOtpRequestModel != null)
            {
                var data = await _usersService.SendOtpByUserIdAsync(sendOtpRequestModel?.Id, sendOtpRequestModel?.NewEmailId);
                if (!data)
                {
                    return StandardAPIResponse<bool>.ErrorResponse(false, AppMessageConstants.NotFound, StatusCodes.Status404NotFound);
                }
                if (sendOtpRequestModel.IsResent)
                {
                    return StandardAPIResponse<bool>.SuccessResponse(true, AppMessageConstants.OtpReSentToEmail);
                }
                return StandardAPIResponse<bool>.SuccessResponse(true, AppMessageConstants.OtpSentToEmail);
            }
            return StandardAPIResponse<bool>.ErrorResponse(false, AppMessageConstants.NotFound, StatusCodes.Status404NotFound);
        }

    }
}
