using HanwhaClient.Infrastructure.Connection;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.DbEntities;
using MongoDB.Driver;

namespace HanwhaClient.Infrastructure.Repository
{
    public class EmailTemplateRepository : RepositoryBase<EmailTemplates>, IEmailTemplateRepository
    {
        public EmailTemplateRepository(MongoDbConnectionService mongoDbConnectionService) : base(mongoDbConnectionService, AppDBConstants.EmailTemplates)
        {
        }

        public async Task<EmailTemplates> GetEmailTemplateByTitle(string Title)
        {
            var filter = Builders<EmailTemplates>.Filter.Eq(x => x.EmailTemplateName, Title);
            return await dbEntity.Find(filter).FirstOrDefaultAsync();

        }
    }
}
