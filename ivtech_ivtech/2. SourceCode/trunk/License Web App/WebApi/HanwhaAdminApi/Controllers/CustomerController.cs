using HanwhaAdminApi.Application.Interfaces;
using HanwhaAdminApi.Helper;
using HanwhaAdminApi.Model.Common;
using HanwhaAdminApi.Model.DbEntities;
using HanwhaAdminApi.Model.Dto;
using Microsoft.AspNetCore.Mvc;

namespace HanwhaAdminApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [CustomAuthorize([ScreenNames.CustomerLicenseMaster])]
    public class CustomerController : ControllerBase
    {
        private readonly ICustomerMasterService _customerService;
        private readonly ICurrentUserService _currentUserService;

        public CustomerController(ICustomerMasterService customerService,
            IHttpContextAccessor context,
            ICurrentUserService currentUserService)
        {
            _customerService = customerService;
            _currentUserService = currentUserService;
        }

        [HttpPost]
        [Route("")]
        [CustomAuthorize([ScreenNames.CanAddOrUpdateCustomer])]
        public async Task<ActionResult<StandardAPIResponse<string>>> CreateCustomerAsync(CustomerMaster customer)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = _currentUserService.UserId;
            var data = await _customerService.SaveCustomerAsync(customer, userId);
            if (string.IsNullOrEmpty(data.Id))
            {
                return StandardAPIResponse<string>.ErrorResponse("", data.ErrorMessage, StatusCodes.Status400BadRequest);
            }
            return StandardAPIResponse<string>.SuccessResponse(data.Id, data.ErrorMessage);
        }

        [HttpGet]
        [Route("{Id}")]
        [CustomAuthorize([ScreenNames.CustomerLicenseMaster])]
        public async Task<ActionResult<StandardAPIResponse<CustomerMaster>>> GetCustomer(string Id)
        {
            var data = await _customerService.GetCustomerAsync(Id);
            if (data == null)
            {
                return StandardAPIResponse<CustomerMaster>.ErrorResponse(null, AppMessageConstants.NotFound, StatusCodes.Status404NotFound);
            }
            return StandardAPIResponse<CustomerMaster>.SuccessResponse(data, AppMessageConstants.DataRetrieved);
        }



        [HttpGet]
        [Route("GetAllCustomer")]
        [CustomAuthorize([ScreenNames.CanViewCustomer])]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<CustomerResponseDto>>>> GetAllCustomer()
        {
            var result = await _customerService.GetAllCustomerAsync();
            if (result.data != null)
                return StandardAPIResponse<IEnumerable<CustomerResponseDto>>.SuccessResponse(result.data, "", StatusCodes.Status200OK, ReferenceData: result.referenceData);
            else
                return BadRequest(StandardAPIResponse<IEnumerable<CustomerResponseDto>>.ErrorResponse(null, AppMessageConstants.NotFound, StatusCodes.Status400BadRequest));
        }

        [HttpDelete]
        [Route("{Id}")]
        [CustomAuthorize([ScreenNames.CanDeleteCustomer])]
        public async Task<ActionResult<StandardAPIResponse<bool>>> DeleteCustomerByIdAsync(string Id)
        {
            var userId = _currentUserService.UserId;
            var data = await _customerService.DeleteCustomerByIdAsync(Id, userId);
            if (data)
                return StandardAPIResponse<bool>.SuccessResponse(data, AppMessageConstants.DeleteSuccess);
            else
                return BadRequest(StandardAPIResponse<bool>.ErrorResponse(data, AppMessageConstants.CustomerExits, StatusCodes.Status400BadRequest));
        }

        [HttpGet]
        [Route("TopCustomer")]
        [CustomAuthorize([ScreenNames.CanViewCustomer])]
        public async Task<ActionResult<StandardAPIResponse<List<CustomerMaster>>>> TopCustomer()
        {
            var data = await _customerService.GetTopCustomerDetail();

            if (data == null)
            {
                return StandardAPIResponse<List<CustomerMaster>>.ErrorResponse(null, AppMessageConstants.NotFound, StatusCodes.Status404NotFound);
            }
            return StandardAPIResponse<List<CustomerMaster>>.SuccessResponse(data, AppMessageConstants.DataRetrieved);
        }

        [HttpGet]
        [Route("DashboardOverview")]
        [CustomAuthorize([ScreenNames.CanViewCustomer])]
        public async Task<ActionResult<StandardAPIResponse<DashboardOverview>>> DashboardOverview(DateTime? startDate, DateTime? endDate)
        {
            var data = await _customerService.GetDashboardOverviewDetails(startDate, endDate);

            if (data == null)
            {
                return StandardAPIResponse<DashboardOverview>.ErrorResponse(data, AppMessageConstants.NotFound, StatusCodes.Status404NotFound);
            }
            return StandardAPIResponse<DashboardOverview>.SuccessResponse(data, AppMessageConstants.DataRetrieved);
        }

        [HttpGet]
        [Route("TopLicenseDue")]
        [CustomAuthorize([ScreenNames.CanViewCustomer])]
        public async Task<ActionResult<StandardAPIResponse<List<LicenseDueDetail>>>> TopLicenseDue()
        {
            var data = await _customerService.GetTopLicenseDueDetails();

            if (data == null)
            {
                return StandardAPIResponse<List<LicenseDueDetail>>.ErrorResponse(data, AppMessageConstants.NotFound, StatusCodes.Status404NotFound);
            }
            return StandardAPIResponse<List<LicenseDueDetail>>.SuccessResponse(data, AppMessageConstants.DataRetrieved);
        }



    }
}
