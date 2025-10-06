using HanwhaAdminApi.Infrastructure.Connection;
using HanwhaAdminApi.Infrastructure.Interfaces;
using HanwhaAdminApi.Model.Common;
using HanwhaAdminApi.Model.DbEntities;
using MongoDB.Driver;

namespace HanwhaAdminApi.Infrastructure.Repository
{
    public class EmailTemplateRepository : RepositoryBase<EmailTemplate>, IEmailTemplateRepository
    {
        public EmailTemplateRepository(MongoDbConnectionService mongoDbConnectionService) : base(mongoDbConnectionService, AppDBConstants.EmailTemplates)
        {
        }

        public async Task<EmailTemplate> GetEmailTemplateByTitle(string Title)
        {
            var Filter = Builders<EmailTemplate>.Filter.Eq(x => x.EmailTemplateName, Title);
            return await dbEntity.Find(Filter).FirstOrDefaultAsync();

        }
    }
}
