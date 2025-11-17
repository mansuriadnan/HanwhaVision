using HanwhaAdminApi.Application.Interfaces;
using HanwhaAdminApi.Helper;
using HanwhaAdminApi.Model.Common;
using HanwhaAdminApi.Model.DbEntities;
using HanwhaAdminApi.Model.Dto.Role;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HanwhaAdminApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    //[CustomAuthorize(["Role Master"])]
    public class RegionController : ControllerBase
    {
        private readonly IRegionService _regionService;
        private readonly IHttpContextAccessor _context;
        private readonly ICurrentUserService _currentUserService;

        public RegionController(IRegionService regionService,
            IHttpContextAccessor context,
            ICurrentUserService currentUserService)
        {
            this._regionService = regionService;
            this._context = context;
            _currentUserService = currentUserService;
        }

        [HttpGet]
        [Route("GetAllCountries")]
        //[CustomAuthorize([ScreenNames.CanViewRole])]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<CountryMaster>>>> GetAllCountries()
        {
            var userId = _currentUserService.UserId;
            var data = await _regionService.GetCountriesAsync();
            if (data != null)
                return StandardAPIResponse<IEnumerable<CountryMaster>>.SuccessResponse(data, "");
            else
                return BadRequest(StandardAPIResponse<IEnumerable<CountryMaster>>.ErrorResponse(null, AppMessageConstants.NotFound, StatusCodes.Status400BadRequest));
        }

        [HttpGet]
        [Route("GetStatesByCountry/{Id}")]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<StateMaster>>>> GetStatesByCountry(string Id)
        {
            if (string.IsNullOrEmpty(Id))
            {
                return BadRequest(StandardAPIResponse<IEnumerable<StateMaster>>.ErrorResponse(null, AppMessageConstants.CountryIdRequired, StatusCodes.Status400BadRequest));
            }

            var data = await _regionService.GetStatesByCountryIdAsync(Id);
            if (data != null && data.Any())
                return StandardAPIResponse<IEnumerable<StateMaster>>.SuccessResponse(data, "");
            else
                return NotFound(StandardAPIResponse<IEnumerable<StateMaster>>.ErrorResponse(null, AppMessageConstants.NoStatesAvailable, StatusCodes.Status404NotFound));
        }

        [HttpGet]
        [Route("GetCities")]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<CityMaster>>>> GetCities([FromQuery] string? countryId, [FromQuery] string? stateId)
        {
            // Check if both parameters are null
            if (string.IsNullOrEmpty(countryId) && string.IsNullOrEmpty(stateId))
            {
                return BadRequest(StandardAPIResponse<IEnumerable<CityMaster>>.ErrorResponse(null, AppMessageConstants.CountryOrStateIdRequired, StatusCodes.Status400BadRequest));
            }

            // Fetch cities using the service
            var data = await _regionService.GetCitiesAsync(countryId, stateId);
            if (data != null && data.Any())
            {
                return StandardAPIResponse<IEnumerable<CityMaster>>.SuccessResponse(data, "");
            }
            else
            {
                return NotFound(StandardAPIResponse<IEnumerable<CityMaster>>.ErrorResponse(null, AppMessageConstants.NoCitiesFound, StatusCodes.Status404NotFound));
            }


        }

    }
}
