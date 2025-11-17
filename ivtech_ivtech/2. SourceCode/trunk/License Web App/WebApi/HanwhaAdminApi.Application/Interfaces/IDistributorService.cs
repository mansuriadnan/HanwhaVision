using HanwhaAdminApi.Model.Common.ReferenceData;
using HanwhaAdminApi.Model.DbEntities;
using HanwhaAdminApi.Model.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaAdminApi.Application.Interfaces
{
    public interface IDistributorService
    {
        Task<(string Id, string ErrorMessage)> CreateDistributorAsync(DistributorRequestDto distributor, string userId);

        Task<(IEnumerable<DistributorMaster> data, Dictionary<string, object> referenceData)> GetAllDistributorAsync();

        Task<bool> DeleteDistributorAsync(string id, string userId);
        Task<List<OptionModel<string, string>>> GetDistributorReferenceDataAsync(IEnumerable<string> ids);
        Task<List<OptionModel<string, string>>> GetDistributorEmailReferenceDataAsync(IEnumerable<string> ids);
    }
}
