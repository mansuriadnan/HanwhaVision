using AutoMapper;
using HanwhaAdminApi.Application.Interfaces;
using HanwhaAdminApi.Core.Services;
using HanwhaAdminApi.Infrastructure.Interfaces;
using HanwhaAdminApi.Model.DbEntities;
using HanwhaAdminApi.Model.EmailTemplate;
using MongoDB.Driver;


namespace HanwhaAdminApi.Application.Services
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

        public async Task<IEnumerable<EmailTemplate>> GetAllEmailTemplatesAsync()
        {
            ProjectionDefinition<EmailTemplate> projection = Builders<EmailTemplate>.Projection
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
                var emailTemplate = _mapper.Map<EmailTemplate>(emailTemplateRequest);
                emailTemplate.CreatedBy = emailTemplate.UpdatedBy = userId;
                emailTemplate.CreatedOn = emailTemplate.UpdatedOn = DateTime.Now;
                var data = await _emailTemplateRepository.InsertAsync(emailTemplate);
                return await Task.FromResult(data);
            }
            else
            {
                var update = Builders<EmailTemplate>.Update
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

        public async Task<EmailTemplate> GetEmailTemplateByTitle(string Title)
        {
            var data = await _emailTemplateRepository.GetEmailTemplateByTitle(Title);
            return await Task.FromResult(data);
        }

        public async Task<bool> SendTestEmailTemplate(string emailTemplateId, string userId)
        {
            var user = _usersRepository.GetAsync(userId);
            var emailTemplate = await _emailTemplateRepository.GetAsync(emailTemplateId);
            if (emailTemplate != null)
            {
                await _emailSenderService.SendEmailAsync([user.Result.Email], null, null, emailTemplate.EmailTemplateTitle, emailTemplate.EmailTemplateHtml, []);
                return true;
            }
            return false;
        }
    }
}
