using HanwhaAdminApi.Model.DbEntities;
using HanwhaAdminApi.Model.EmailTemplate;

namespace HanwhaAdminApi.Application.Interfaces
{
    public interface IEmailTemplateService
    {
        Task<IEnumerable<EmailTemplate>> GetAllEmailTemplatesAsync();
        Task<string> SaveEmailTemplateAsync(EmailTemplateRequestModel emailTemplateRequest, string userId);
        Task<bool> SendTestEmailTemplate(string emailTemplateId, string userId);
        Task<EmailTemplate> GetEmailTemplateByTitle(string Title);
    }
}
