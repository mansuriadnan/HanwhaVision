using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.EmailTemplate;

namespace HanwhaClient.Application.Interfaces
{
    public interface IEmailTemplateService
    {
        Task<IEnumerable<EmailTemplates>> GetAllEmailTemplatesAsync();
        Task<string> SaveEmailTemplateAsync(EmailTemplateRequestModel emailTemplateRequest, string userId);
        Task<bool> SendTestEmailTemplate(string emailTemplateId, string userId);
        Task<EmailTemplates> GetEmailTemplateByTitle(string Title);
    }
}
