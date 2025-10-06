using HanwhaAdminApi.Application.Interfaces;
using HanwhaAdminApi.Application.Services;
using HanwhaAdminApi.Helper;
using HanwhaAdminApi.Model.Common;
using HanwhaAdminApi.Model.DbEntities;
using HanwhaAdminApi.Model.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HanwhaAdminApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DistributorController : ControllerBase
    {
        private readonly IDistributorService _distributorService;
        private readonly ICurrentUserService _currentUserService;

        public DistributorController(IDistributorService distributorService, ICurrentUserService currentUserService)
        {
            this._distributorService = distributorService;
            this._currentUserService = currentUserService;
        }

        [HttpPost]
        [CustomAuthorize([ScreenNames.CanAddOrUpdateDistributor])]
        public async Task<ActionResult<StandardAPIResponse<string>>> CreateDistributorAsync(DistributorRequestDto distributor)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = _currentUserService.UserId;
            var data = await _distributorService.CreateDistributorAsync(distributor, userId);
            if (string.IsNullOrEmpty(data.Id))
            {
                return StandardAPIResponse<string>.ErrorResponse(string.Empty, data.ErrorMessage, StatusCodes.Status400BadRequest);
            }
            else if (!string.IsNullOrEmpty(distributor.Id))
            {
                return StandardAPIResponse<string>.SuccessResponse(data.Id, AppMessageConstants.UpdateSuccess);
            }
            return StandardAPIResponse<string>.SuccessResponse(data.Id, AppMessageConstants.InsertSuccess);
        }


        [HttpGet]
        [CustomAuthorize([ScreenNames.CanViewDistributor])]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<DistributorMaster>>>> GetAllDistributorAsync()
        {
            var result = await _distributorService.GetAllDistributorAsync();
            var response = StandardAPIResponse<IEnumerable<DistributorMaster>>.SuccessResponse(result.data, AppMessageConstants.DataRetrieved, StatusCodes.Status200OK, ReferenceData: result.referenceData);
            return response;
        }

        [HttpDelete]
        [Route("{id}")]
        [CustomAuthorize([ScreenNames.CanDeleteDistributor])]
        public async Task<ActionResult<StandardAPIResponse<bool>>> DeleteDistributor(string id)
        {
            var userId = _currentUserService.UserId;
            var data = await _distributorService.DeleteDistributorAsync(id, userId);
            if (!data)
            {
                return StandardAPIResponse<bool>.ErrorResponse(false, AppMessageConstants.DistributorExists, StatusCodes.Status404NotFound);
            }
            return StandardAPIResponse<bool>.SuccessResponse(data, AppMessageConstants.DeleteSuccess);
        }
    }
}
