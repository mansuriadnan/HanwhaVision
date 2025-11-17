using HanwhaAdminApi.Model.DbEntities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaAdminApi.Infrastructure.Interfaces
{
    public interface IEmailTemplateRepository : IRepositoryBase<EmailTemplate>
    {
        public Task<EmailTemplate> GetEmailTemplateByTitle(string Title);
    }
}
