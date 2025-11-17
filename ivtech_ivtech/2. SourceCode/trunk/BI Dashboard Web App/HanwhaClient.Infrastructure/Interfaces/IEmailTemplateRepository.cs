using HanwhaClient.Model.DbEntities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Infrastructure.Interfaces
{
    public interface IEmailTemplateRepository : IRepositoryBase<EmailTemplates>
    {
        public Task<EmailTemplates> GetEmailTemplateByTitle(string Title);
    }
}
