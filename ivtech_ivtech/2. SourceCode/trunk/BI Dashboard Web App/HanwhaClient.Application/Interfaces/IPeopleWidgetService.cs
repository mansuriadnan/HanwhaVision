using HanwhaClient.Model.Dto;
using HanwhaClient.Model.PeopleWidget;

namespace HanwhaClient.Application.Interfaces
{
    public interface IPeopleWidgetService
    {
        Task<IEnumerable<GenderWisePeopleCounting>> GenderWisePeopleCounting(WidgetRequest widgetRequest);
    }
}
