using HanwhaClient.Application.Interfaces;
using HanwhaClient.Helper;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.Dto;
using Microsoft.AspNetCore.Mvc;

namespace HanwhaClient.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SiteController : ControllerBase
    {
        private readonly ISiteService _siteService;
        private readonly ICurrentUserService _currentUserService;

        public SiteController(ISiteService siteService, ICurrentUserService currentUserService)
        {
            _siteService = siteService;
            _currentUserService = currentUserService;
        }

        [HttpGet]
        [CustomAuthorize([ScreenNames.ViewChildSubChildSite])]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<SiteDto>>>> GetAll()
        {

            var result = await _siteService.GetAllSitesAsync();
            if (result.data.Count() == 0)
            {
                return StandardAPIResponse<IEnumerable<SiteDto>>.SuccessResponse(result.data, AppMessageConstants.RecordNotFound, StatusCodes.Status200OK, ReferenceData: result.referenceData);
            }
            else if (result.data.Count() > 0)
            {
                return StandardAPIResponse<IEnumerable<SiteDto>>.SuccessResponse(result.data, "", StatusCodes.Status200OK, ReferenceData: result.referenceData);
            }
            return StandardAPIResponse<IEnumerable<SiteDto>>.ErrorResponse(null, AppMessageConstants.RecordNotFound, StatusCodes.Status200OK);

        }

        [HttpPost("AddOrUpdateChildSite")]
        [CustomAuthorize([ScreenNames.AddOrUpdateChildSubChildSite])]
        public async Task<ActionResult<StandardAPIResponse<string>>> AddOrUpdateChildSite([FromBody] SiteChileRequestDto siteDto)
        {
            var userId = _currentUserService.UserId;
            var data = await _siteService.AddOrUpdateSiteAsync(siteDto, userId);

            if (data.data == "")
            {
                return StandardAPIResponse<string>.ErrorResponse(null, data.errorMessage, StatusCodes.Status404NotFound);
            }
            return StandardAPIResponse<string>.SuccessResponse("", data.errorMessage, StatusCodes.Status200OK);
        }

        [HttpPost("AddOrUpdateSubChildSite")]
        [CustomAuthorize([ScreenNames.AddOrUpdateChildSubChildSite])]
        public async Task<ActionResult<StandardAPIResponse<string>>> AddOrUpdateSubChildSite([FromBody] ChildSiteDto childSiteDto)
        {
            if (childSiteDto != null)
            {
                var userId = _currentUserService.UserId;
                var data = await _siteService.AddOrUpdateChildSiteAsync(childSiteDto, userId);
                if (!string.IsNullOrEmpty(data.errorMessage))
                {
                    return StandardAPIResponse<string>.ErrorResponse(null, data.errorMessage, StatusCodes.Status500InternalServerError);
                }
                return StandardAPIResponse<string>.SuccessResponse("", string.IsNullOrEmpty(childSiteDto.Id) ? AppMessageConstants.RecordAdded : AppMessageConstants.RecordUpdated, StatusCodes.Status200OK);
            }
            return StandardAPIResponse<string>.ErrorResponse(null, AppMessageConstants.InvalidDataModel, StatusCodes.Status404NotFound);

        }

        [HttpDelete("DeleteChildSite/{id}")]
        [CustomAuthorize([ScreenNames.DeleteChildSubChildSite])]
        public async Task<ActionResult<StandardAPIResponse<bool>>> DeleteChildSite(string id)
        {
            try
            {
                var userId = _currentUserService.UserId;
                var isDeleted = await _siteService.DeleteChildSiteAsync(id, userId);
                if (!isDeleted)
                {
                    return StandardAPIResponse<bool>.ErrorResponse(false, AppMessageConstants.RecordNotFound, StatusCodes.Status404NotFound);
                }
                return StandardAPIResponse<bool>.SuccessResponse(true, AppMessageConstants.RecordDeleted, StatusCodes.Status200OK);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpDelete("{parentSiteId}/child/{childSiteId}")]
        [CustomAuthorize([ScreenNames.DeleteChildSubChildSite])]
        public async Task<ActionResult<StandardAPIResponse<bool>>> DeleteSubChildSite(string parentSiteId, string childSiteId)
        {
            try
            {
                var userId = _currentUserService.UserId;
                var isDeleted = await _siteService.DeleteSubChildSiteAsync(parentSiteId, childSiteId, userId);
                if (!isDeleted)
                {
                    return StandardAPIResponse<bool>.ErrorResponse(false, AppMessageConstants.RecordNotFound, StatusCodes.Status404NotFound);
                }
                return StandardAPIResponse<bool>.SuccessResponse(true, AppMessageConstants.RecordDeleted, StatusCodes.Status200OK);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }
    }
}
