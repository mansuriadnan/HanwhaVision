using DocumentFormat.OpenXml.Spreadsheet;
using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Application.Interfaces
{
    public interface ISiteService
    {
        Task<(IEnumerable<SiteDto> data, Dictionary<string, object> referenceData)> GetAllSitesAsync();
        Task<(string data, string errorMessage)> AddOrUpdateSiteAsync(SiteChileRequestDto siteDto, string userId);
        Task<(string data, string errorMessage)> AddOrUpdateChildSiteAsync(ChildSiteDto childSiteDto, string userId);
        Task<bool> DeleteChildSiteAsync(string id, string userId);
        Task<bool> DeleteSubChildSiteAsync(string parentSiteId, string childSiteId, string userId);
    }
}
