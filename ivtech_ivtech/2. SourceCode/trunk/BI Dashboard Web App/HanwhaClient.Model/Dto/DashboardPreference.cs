using System.ComponentModel;
using System.Data;

namespace HanwhaClient.Model.Dto
{
    public class SaveDashboardDesign
    {
        public string? Id { get; set; }
        public string? DashboardDesignjson { get; set; }
        public string? DashboardName { get; set; }
    }

    public class GetDashboardPreferenceResponse
    {
        public string Id { get; set; }
        public string? DashboardPreferenceJson { get; set; }
        public string DashboardName { get; set; }

    }

    public class GeneratePdfDataRequest
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public IEnumerable<GeneratePdfSVGData> SVGData { get; set; }
    }

    public class GeneratePdfSVGData
    {
        public string WidgetName { get; set; }
        public string SVGData { get; set; }
    }

    public class UserNotificationResponse
    {
        public string NotificationId { get; set; }
        public string Title { get; set; }
        public string? Content { get; set; }
        public bool IsRead { get; set; }
        public string? ActionName { get; set; }
        public string? ActionParameter { get; set; }
        public DateTime CreatedOn { get; set; }
    }

    public class MarkReadNotificationRequest
    {
        public string NotificationId { get; set; }
        public string  UserId { get; set; }
    }
}
