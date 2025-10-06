using HanwhaClient.Application.Interfaces;
using HanwhaClient.Core.SignalR;
using HanwhaClient.Helper;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.Dto;
using HanwhaClient.Model.User;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace HanwhaClient.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IUsersService _usersService;
        private readonly ICurrentUserService _currentUserService;
        private readonly IOtpService _otpService;
        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly INotificationService _notificationService;
        private readonly IHttpContextAccessor _context;
        private readonly IZoneCameraRepository _zoneCameraRepository;

        public UsersController(IUsersService usersService,
            ICurrentUserService currentUserService,
            IOtpService otpService,
            IHubContext<NotificationHub> hubContext,
            INotificationService notificationService,
            IHttpContextAccessor context,
            IZoneCameraRepository zoneCameraRepository)
        {
            _usersService = usersService;
            _currentUserService = currentUserService;
            _otpService = otpService;
            _hubContext = hubContext;
            _notificationService = notificationService;
            _context = context;
            _zoneCameraRepository = zoneCameraRepository;
        }

        [HttpGet]
        [Route("GetAllUser")]
        [CustomAuthorize([ScreenNames.UserMaster])]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<UserMaster>>>> GetAllUsersAsync()
        {
            var result = await _usersService.GetAllUsersAsync();
            var response = StandardAPIResponse<IEnumerable<UserMaster>>.SuccessResponse(result.data, AppMessageConstants.RecordRetrieved, StatusCodes.Status200OK, ReferenceData: result.referenceData);
            return response;
        }

        [HttpPost]
        [Route("")]
        [CustomAuthorize([ScreenNames.AddOrUpdateUser])]
        public async Task<ActionResult<StandardAPIResponse<string>>> CreateUserAsync(UsersRequestModel userRequestModel)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = _currentUserService.UserId;
            var data = await _usersService.SaveUserAsync(userRequestModel, userId);
            if (string.IsNullOrEmpty(data.Id))
            {
                return StandardAPIResponse<string>.ErrorResponse(string.Empty, data.ErrorMessage, StatusCodes.Status400BadRequest);
            }
            return StandardAPIResponse<string>.SuccessResponse(data.Id, string.IsNullOrEmpty(userRequestModel.Id) ? AppMessageConstants.RecordAdded : AppMessageConstants.RecordUpdated);
        }

        [HttpGet]
        [Route("{id}")]
        [CustomAuthorize([ScreenNames.UserMaster])]
        public async Task<ActionResult<StandardAPIResponse<UserMaster>>> GetUser(string id)
        {
            var data = await _usersService.GetUserAsync(id);
            if (data == null)
            {
                return StandardAPIResponse<UserMaster>.ErrorResponse(null, AppMessageConstants.RecordNotFound, StatusCodes.Status404NotFound );
            }
            return StandardAPIResponse<UserMaster>.SuccessResponse(data, AppMessageConstants.RecordRetrieved);
        }

        [HttpDelete]
        [Route("{id}")]
        [CustomAuthorize([ScreenNames.DeleteUser])]
        public async Task<ActionResult<StandardAPIResponse<bool>>> DeleteUser(string id)
        {
            var userId = _currentUserService.UserId;
            var data = await _usersService.DeleteUserAsync(id, userId);
            if (!data)
            {
                return StandardAPIResponse<bool>.ErrorResponse(false, AppMessageConstants.RecordNotFound, StatusCodes.Status404NotFound);
            }
            return StandardAPIResponse<bool>.SuccessResponse(data, AppMessageConstants.RecordDeleted);
        }

        [HttpPost("ValidateOtp")]
        public async Task<ActionResult<StandardAPIResponse<string>>> ValidateOtp([FromBody] OtpValidationDto validationRequest)
        {
            var isValidOtp = await _otpService.ValidateOtpAsync(
                new OtpRequestDto { Email = validationRequest.Email },
                validationRequest.Otp
            );

            if (!isValidOtp)
            {
                return StandardAPIResponse<string>.ErrorResponse("", AppMessageConstants.OtpExpiredOrInvalid, StatusCodes.Status404NotFound);
            }
            return StandardAPIResponse<string>.SuccessResponse("", AppMessageConstants.OtpSuccessfullyValidated);
        }

        [AllowAnonymous]
        [Route("ForgotPassword")]
        [HttpPost]
        public async Task<ActionResult<StandardAPIResponse<string>>> ForgotPassword([FromBody] ForgotPasswordDto forgotPasswordDto)
        {
            bool isPasswordForgot = await _usersService.ForgotPasswordAsync(forgotPasswordDto);

            if (isPasswordForgot)
            {
                return StandardAPIResponse<string>.SuccessResponse("", AppMessageConstants.OtpSuccessfullySentToEmail, StatusCodes.Status200OK);
            }

            return StandardAPIResponse<string>.ErrorResponse("", AppMessageConstants.EmailNotRegistered, StatusCodes.Status404NotFound);
        }

        [AllowAnonymous]
        [Route("ResetPassword")]
        [HttpPost]
        public async Task<ActionResult<StandardAPIResponse<string>>> ResetPassword([FromBody] ResetPasswordDto resetPasswordDto)
        {
            var userId = _currentUserService.UserId;
            bool isPasswordReset = await _usersService.ResetPasswordAsync(resetPasswordDto);

            if (isPasswordReset)
            {
                return StandardAPIResponse<string>.SuccessResponse("", AppMessageConstants.PasswordSuccessfullyReset, StatusCodes.Status200OK);
            }

            return StandardAPIResponse<string>.ErrorResponse("", AppMessageConstants.OldPasswordDoesNotMatch, StatusCodes.Status404NotFound);
        }

        [AllowAnonymous]
        [Route("ForgotResetPassword")]
        [HttpPost]
        public async Task<ActionResult<StandardAPIResponse<string>>> ForgotResetPassword([FromBody] ForgotPasswordResetDto resetPasswordDto)
        {
            bool isPasswordReset = await _usersService.ForgotPasswordResetAsync(resetPasswordDto);

            if (isPasswordReset)
            {
                return StandardAPIResponse<string>.SuccessResponse("", AppMessageConstants.PasswordSuccessfullyReset, StatusCodes.Status200OK);
            }

            return StandardAPIResponse<string>.ErrorResponse("", AppMessageConstants.OldPasswordDoesNotMatch, StatusCodes.Status404NotFound);
        }

        [AllowAnonymous]
        [Route("UserResetPassword")]
        [HttpPost]
        public async Task<ActionResult<StandardAPIResponse<string>>> UserResetPassword([FromBody] UserResetPassword resetPassword)
        {
            var userId = _currentUserService.UserId;
            bool isPasswordReset = await _usersService.UserResetPassword(resetPassword);

            if (isPasswordReset)
            {
                return StandardAPIResponse<string>.SuccessResponse("", AppMessageConstants.PasswordSuccessfullyReset, StatusCodes.Status200OK);
            }

            return StandardAPIResponse<string>.ErrorResponse("", AppMessageConstants.OldPasswordDoesNotMatch, StatusCodes.Status404NotFound);
        }

        [Route("UserPreferences")]
        [HttpPost]
        public async Task<ActionResult<StandardAPIResponse<string>>> AddUpdateUserPreferences([FromBody] UserPreferencesRequest userPreferencesRequest)
        {
            var userId = _currentUserService.UserId;
            userPreferencesRequest.UserId = userId;
            bool result = await _usersService.AddUpdateUserPreferences(userPreferencesRequest);

            if (result)
            {
                return StandardAPIResponse<string>.SuccessResponse("",  AppMessageConstants.RecordUpdated, StatusCodes.Status200OK);
            }
            return StandardAPIResponse<string>.ErrorResponse("", AppMessageConstants.SomethingWentWrong, StatusCodes.Status500InternalServerError);
        }


        [HttpGet]
        [Route("SendMessage")]
        public async Task SendMessage(string Message)
        {
            await _hubContext.Clients.Group("NotificationGroup").SendAsync("ReceiveMessage", Message);
        }

        [Route("UserGroup")]
        [HttpPost]
        public async Task<ActionResult<StandardAPIResponse<bool>>> UserGroup([FromBody] UserGroup userGroup)
        {
            var deviceIds = await _zoneCameraRepository.GetDevicebyFloorAndZoneAsync(userGroup.FloorId, userGroup.ZoneId);

            await _notificationService.RemoveUserFromGroupAsync(userGroup.ConnectionId, userGroup.WidgetName);
            foreach (string deviceId in deviceIds.Distinct())
            {
                
                await _notificationService.AddUserToGroupAsync(userGroup.ConnectionId, deviceId, userGroup.WidgetName);
            }
            return StandardAPIResponse<bool>.SuccessResponse(true, "", StatusCodes.Status200OK);
        }

        [HttpDelete]
        [Route("RemoveUserGroup/{id}")]
        public async Task<ActionResult<StandardAPIResponse<bool>>> RemoveUserGroup(string id)
        {
            await _notificationService.RemoveAllGroupsAsync(id);
            return StandardAPIResponse<bool>.SuccessResponse(true, "", StatusCodes.Status200OK);
        }

        [HttpPost("UploadProfileImage")]
        //[CustomAuthorize([ScreenNames.CanAddOrUpdateUser])]
        public async Task<ActionResult<StandardAPIResponse<string>>> UploadProfileImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(AppMessageConstants.FileUploadFailure);
            }
            var userId = _currentUserService.UserId;
            var result =  await _usersService.SaveUserProfileImage(file, userId);
            if (result)
            {
                return StandardAPIResponse<string>.SuccessResponse(file.FileName, AppMessageConstants.FileUploaded);
            }
            return StandardAPIResponse<string>.ErrorResponse(file.FileName, AppMessageConstants.SomethingWentWrong);
        }

        [HttpGet]
        [Route("UserProfile")]
        public async Task<ActionResult<StandardAPIResponse<UserMaster>>> GetUserProfile()
        {
            var userId = _currentUserService.UserId;
            var result = await _usersService.GetUsersProfile(userId);
            if (result.data != null)
            {
                return StandardAPIResponse<UserMaster>.SuccessResponse(result.data, AppMessageConstants.RecordRetrieved, StatusCodes.Status200OK, ReferenceData: result.referenceData);
            }
            return StandardAPIResponse<UserMaster>.ErrorResponse(null, AppMessageConstants.RecordNotFound, StatusCodes.Status404NotFound);
        }

    }
}
   