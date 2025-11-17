using HanwhaClient.Model.Auth;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Application.Interfaces
{
    public interface IReportService
    {
        Task<string> AddUpdateReportAsync(ReportRequestModel model, string userId);
        Task<IEnumerable<ReportResponseModel>> GetAllAsync();
        Task<IEnumerable<GetFloorDto>> GetAllFloorBySiteId(string siteId);
        Task<string> DeleteReportByIdAsync(string reportId,string userId);
        Task<ReportDto> GenerateReportById(string reportId);
        Task<IEnumerable<FloorZoneByPermissionDto>> GetAllZoneBySiteAndFloorId(string siteId, IEnumerable<string> floorIds);
        string ReplaceReportPlaceholders(string htmlTemplate, ReportDto reportData, PdfDataRequest pdfDataRequest);
        Task<StandardAPIResponse<TokenResponseModel>> GetAuthToken(HttpClient httpClient, string username, string password);
    }

}
