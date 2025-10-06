using HanwhaAdminApi.Infrastructure.Repository;
using HanwhaAdminApi.Model.DbEntities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaAdminApi.Infrastructure.Interfaces
{
    public interface IDistributorRepository : IRepositoryBase<DistributorMaster>
    {
        Task<bool> IsDistributorNameExistAsync(string distributorname, string distributorId = null);
        Task<bool> IsEmailAddressExistAsync(string distributoremail, string distributorId = null);
    }
}
