using AutoMapper;
using HanwhaClient.Application.Interfaces;
using HanwhaClient.Core.Services;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.EmailTemplate;
using MongoDB.Driver;

namespace HanwhaClient.Application.Services
{
    public class EmailTemplateService : IEmailTemplateService
    {
        private readonly IEmailTemplateRepository _emailTemplateRepository;
        private readonly EmailSenderService _emailSenderService;
        private readonly IUsersRepository _usersRepository;
        private readonly IMapper _mapper;

        public EmailTemplateService(IEmailTemplateRepository emailTemplateRepository,
            EmailSenderService emailSenderService,
            IUsersRepository usersRepository,
            IMapper mapper)
        {
            this._emailTemplateRepository = emailTemplateRepository;
            this._emailSenderService = emailSenderService;
            this._usersRepository = usersRepository;
            this._mapper = mapper;
        }

        public async Task<IEnumerable<EmailTemplates>> GetAllEmailTemplatesAsync()
        {
            ProjectionDefinition<EmailTemplates> projection = Builders<EmailTemplates>.Projection
            .Include("emailTemplateName")
            .Include("emailTemplateTitle")
            .Include("emailTemplateDescription")
            .Include("emailTemplateHtml")
            .Include("_id");
            var data = await _emailTemplateRepository.GetAllAsync(projection);
            return await Task.FromResult(data);
        }
        public async Task<string> SaveEmailTemplateAsync(EmailTemplateRequestModel emailTemplateRequest, string userId)
        {
            if (string.IsNullOrEmpty(emailTemplateRequest.Id))
            {
                var emailTemplate = _mapper.Map<EmailTemplates>(emailTemplateRequest);
                emailTemplate.CreatedBy = emailTemplate.UpdatedBy = userId;
                emailTemplate.CreatedOn = emailTemplate.UpdatedOn = DateTime.Now;
                var data = await _emailTemplateRepository.InsertAsync(emailTemplate);
                return await Task.FromResult(data);
            }
            else
            {
                var update = Builders<EmailTemplates>.Update
                    .Set(c => c.EmailTemplateName, emailTemplateRequest.EmailTemplateName)
                    .Set(c => c.EmailTemplateTitle, emailTemplateRequest.EmailTemplateTitle)
                    .Set(c => c.EmailTemplateDescription, emailTemplateRequest.EmailTemplateDescription)
                    .Set(c => c.EmailTemplateHtml, emailTemplateRequest.EmailTemplateHtml)
                    .Set(c => c.UpdatedBy, userId)
                    .Set(c => c.UpdatedOn, DateTime.Now);
                var data = await _emailTemplateRepository.UpdateFieldsAsync(emailTemplateRequest.Id, update);
                if (data)
                    return await Task.FromResult(emailTemplateRequest.Id);
                return await Task.FromResult(string.Empty);
            }
        }

        public async Task<bool> SendTestEmailTemplate(string emailTemplateId, string userId)
        {
            var user = await _usersRepository.GetAsync(userId);
            var emailTemplate = await _emailTemplateRepository.GetAsync(emailTemplateId);
            if (emailTemplate != null)
            {
                _emailSenderService.SendEmailAsync([user.Email], null, null, emailTemplate.EmailTemplateTitle, emailTemplate.EmailTemplateHtml, []);
                return true;
            }
            return false;
        }

        public async Task<EmailTemplates> GetEmailTemplateByTitle(string Title)
        {
            var data = await _emailTemplateRepository.GetEmailTemplateByTitle(Title);
            return await Task.FromResult(data);
        }
    }
}
