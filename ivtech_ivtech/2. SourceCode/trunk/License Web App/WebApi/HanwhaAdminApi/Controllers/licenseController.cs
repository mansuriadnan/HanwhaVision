using HanwhaAdminApi.Application.Interfaces;
using HanwhaAdminApi.Helper;
using HanwhaAdminApi.Model.Common;
using HanwhaAdminApi.Model.DbEntities;
using HanwhaAdminApi.Model.Dto;
using HanwhaAdminApi.Model.License;
using Microsoft.AspNetCore.Mvc;

namespace HanwhaAdminApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [CustomAuthorize([ScreenNames.CustomerLicenseMaster])]
    public class licenseController : ControllerBase
    {
        private readonly ILicenseService _licenseService;
        private readonly IPermissionService _permissionService;
        private readonly ICurrentUserService _currentUserService;


        public licenseController(ILicenseService licenseService,
            IPermissionService permissionService,
            ICurrentUserService currentUserService)
        {
            this._licenseService = licenseService;
            this._permissionService = permissionService;
            this._currentUserService = currentUserService;
        }

        [HttpGet("ValidateLicense")]
        public async Task<ActionResult<StandardAPIResponse<bool>>> ValidateLicense()
        {
            _permissionService.RefreshLicenseData();
            var result = _permissionService._licenseData;
            if (result.IsValid)
            {
                return StandardAPIResponse<bool>.SuccessResponse(result.IsValid, AppMessageConstants.LicenseAuthenticated);
            }
            return StandardAPIResponse<bool>.ErrorResponse(result.IsValid, result.ErrorMessage, StatusCodes.Status400BadRequest);
        }

        [HttpPost("GenerateLicense")]
        [CustomAuthorize([ScreenNames.CanGenerateLicense])]
        public async Task<ActionResult<StandardAPIResponse<string>>> GenerateLicense(LicenseRequestModel licenseRequest)
        {
            var userId = _currentUserService.UserId;
            var data = await _licenseService.GenerateLicense(licenseRequest, userId);
            if (!data.isSuccess)
            {
                return StandardAPIResponse<string>.ErrorResponse(string.Empty, data.ErrorMessage, StatusCodes.Status400BadRequest);
            }

            return StandardAPIResponse<string>.SuccessResponse("", AppMessageConstants.InsertSuccess, StatusCodes.Status200OK);
        }

        [HttpPost("ResendLicense")]
        [CustomAuthorize([ScreenNames.ResendLicenseEmailDistributor])]
        public async Task<ActionResult<StandardAPIResponse<string>>> ResendLicense(ResendLicenseDto resendLicenseDto)
        {
            var data = await _licenseService.ResendLicense(resendLicenseDto.LicenseId);
            if (!data)
            {
                return StandardAPIResponse<string>.ErrorResponse(string.Empty, AppMessageConstants.FileSendFailure, StatusCodes.Status400BadRequest);
            }
            return StandardAPIResponse<string>.SuccessResponse(null, AppMessageConstants.FileSendSuccess);
        }

        [HttpPost("uploadLicense")]
        [CustomAuthorize([ScreenNames.CustomerLicenseMaster])]
        public async Task<IActionResult> UploadLicense(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(AppMessageConstants.FileUploadFailure);
            }

            await _licenseService.Uploadfile(file, "License", "license.lic");

            return Ok(new { Message = AppMessageConstants.FileUploadSuccess, FileName = file.FileName });
        }

        [HttpPost("uploadLicenseKey")]
        [CustomAuthorize([ScreenNames.CustomerLicenseMaster])]
        public async Task<IActionResult> UploadLicenseKey(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(AppMessageConstants.FileUploadFailure);
            }

            await _licenseService.Uploadfile(file, "License", "public-key.pem");

            return Ok(new { Message = AppMessageConstants.FileUploadSuccess, FileName = file.FileName });
        }


        [HttpGet]
        [Route("client/{customerId}")]
        [CustomAuthorize([ScreenNames.CanViewLicense])]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<LicenseRequest>>>> GetLicenseByClientId(string customerId)
        {
            var result = await _licenseService.GetLicenseByClientId(customerId);
            if (result.data == null || result.data.Count() == 0)
            {
                return StandardAPIResponse<IEnumerable<LicenseRequest>>.ErrorResponse(null, AppMessageConstants.NotFound, StatusCodes.Status404NotFound);
            }
            return StandardAPIResponse<IEnumerable<LicenseRequest>>.SuccessResponse(result.data, "", StatusCodes.Status200OK, ReferenceData: result.referenceData);
        }


        [HttpGet("DownloadLicense/{licenseRequestId}")]
        [CustomAuthorize([ScreenNames.DownloadTheLicenseFile])]
        public async Task<ActionResult<StandardAPIResponse<string>>> DownloadLicense(string licenseRequestId)
        {
            var result = await _licenseService.DownloadLicense(licenseRequestId);
            if (string.IsNullOrEmpty(result.errorMessage))
            {
                string fileName = "license.lic";
                string fileType = "text/plain";
                return File(result.licenseFileData, fileType, fileName);
            }
            else
            {
                return StandardAPIResponse<string>.ErrorResponse(string.Empty, result.errorMessage, StatusCodes.Status400BadRequest);
            }
        }
        
        [HttpGet("DownloadPublicKey/{publicRequestId}")]
        [CustomAuthorize([ScreenNames.DownloadTheLicenseFile])]
        public async Task<ActionResult<StandardAPIResponse<string>>> DownloadPublicKey(string publicRequestId)
        {
            var result = await _licenseService.DownloadPublicKeyData(publicRequestId);
            if (string.IsNullOrEmpty(result.errorMessage))
            {
                string fileName = "publickey.pem";
                string fileType = "text/plain";
                return File(result.publicFileData, fileType, fileName);
            }
            else
            {
                return StandardAPIResponse<string>.ErrorResponse(string.Empty, result.errorMessage, StatusCodes.Status400BadRequest);
            }
        }
    }
}