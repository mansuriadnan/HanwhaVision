using HanwhaClient.Application.Interfaces;
using HanwhaClient.Helper;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.Dto;
using HanwhaClient.Model.PeopleWidget;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HanwhaClient.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [CustomAuthorize([ScreenNames.PeopleCountByGender], ScreenNames.People)]
    public class PeopleWidgetController : ControllerBase
    {
        private readonly IPeopleWidgetService _peopleWidgetService;

        public PeopleWidgetController(
            IPeopleWidgetService peopleWidgetService)
        {
            this._peopleWidgetService = peopleWidgetService;
        }

        [HttpPost]
        [Route("GenderWisePeopleCounting")]
        [CustomAuthorize([ScreenNames.PeopleCountByGender], ScreenNames.People)]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<GenderWisePeopleCounting>>>> GenderWisePeopleCounting(WidgetRequest widgetRequest)
        {
            var result = await _peopleWidgetService.GenderWisePeopleCounting(widgetRequest);
            return StandardAPIResponse<IEnumerable<GenderWisePeopleCounting>>.SuccessResponse(result, "", StatusCodes.Status200OK);
        }
    }
}
