namespace HanwhaClient.Model.EmailTemplate
{
    public class EmailTemplateRequestModel
    {
        public string? Id { get; set; }
        public string EmailTemplateName { get; set; }
        public string EmailTemplateTitle { get; set; }
        public string? EmailTemplateDescription { get; set; }
        public string EmailTemplateHtml { get; set; }
    }

    public class TestEmailRequestModel
    {
        public string Id { get; set; }
    }
}
