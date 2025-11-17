using HanwhaClient.Application.Interfaces;
using HanwhaClient.Application.Services;
using HanwhaClient.Core.Interfaces;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.Dto;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using HanwhaClient.Helper;
using DocumentFormat.OpenXml.Packaging;

namespace HanwhaClient.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [CustomAuthorize([ScreenNames.ReportMaster])]
    public class ReportController : ControllerBase
    {
        private readonly IReportService _reportService;
        private readonly ICurrentUserService _currentUserService;
        private readonly IPdfGenerator _pdfGenerator;
        private readonly IClientSettingService _clientSettingService;


        public ReportController(IReportService reportService, ICurrentUserService currentUserService, IPdfGenerator pdfService, IClientSettingService clientSettingService)
        {
            _reportService = reportService;
            _currentUserService = currentUserService;
            _pdfGenerator = pdfService;
            _clientSettingService = clientSettingService;
        }

        [HttpGet]
        [Route("GetAllReport")]
        [CustomAuthorize([ScreenNames.ViewListofReports])]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<ReportResponseModel>>>> GetAllReport()
        {
            var reportsData = await _reportService.GetAllAsync();
            return StandardAPIResponse<IEnumerable<ReportResponseModel>>.SuccessResponse(reportsData, "", StatusCodes.Status200OK);
        }

        [HttpPost]
        [Route("AddUpdateReport")]
        [CustomAuthorize([ScreenNames.AddOrUpdateReport])]
        public async Task<ActionResult<StandardAPIResponse<string>>> AddUpdate([FromBody] ReportRequestModel model)
        {
            // Example userId; ideally fetch from JWT or auth context
            var userId = _currentUserService.UserId;
            var result = await _reportService.AddUpdateReportAsync(model, userId);
            if (result.Contains("not found") || result.Contains("failed"))
            {
                return StandardAPIResponse<string>.ErrorResponse(null, result, StatusCodes.Status400BadRequest);
            }
            return StandardAPIResponse<string>.SuccessResponse(result, string.IsNullOrEmpty(model.Id) ? AppMessageConstants.RecordAdded : AppMessageConstants.RecordUpdated);
        }

        [HttpDelete("{reportId}")]
        [CustomAuthorize([ScreenNames.DeleteReport])]
        public async Task<ActionResult<StandardAPIResponse<bool>>> DeleteReportById(string reportId)
        {
            try
            {
            var userId = _currentUserService.UserId;
                var data = await _reportService.DeleteReportByIdAsync(reportId, userId);
                if (data.Contains("not found") || data.Contains("required"))
                {
                    return StandardAPIResponse<bool>.ErrorResponse(false, AppMessageConstants.RecordNotFound, StatusCodes.Status404NotFound);
                }
                return StandardAPIResponse<bool>.SuccessResponse(true, AppMessageConstants.RecordDeleted, StatusCodes.Status200OK);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpGet]
        [Route("GetAllFloorBySiteId/{siteId}")]
        [CustomAuthorize([ScreenNames.AddOrUpdateReport])]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<GetFloorDto>>>> GetAllFloorBySiteId(string siteId)
        {
            var reportsData = await _reportService.GetAllFloorBySiteId(siteId);
            return StandardAPIResponse<IEnumerable<GetFloorDto>>.SuccessResponse(reportsData, "", StatusCodes.Status200OK);
        }

        [HttpGet]
        [Route("GenerateReportById/{reportId}")]
        [CustomAuthorize([ScreenNames.ViewListofReports])]
        public async Task<ActionResult<StandardAPIResponse<ReportDto>>> GenerateReportById(string reportId)
        {
            var reportsData = await _reportService.GenerateReportById(reportId);
            return StandardAPIResponse<ReportDto>.SuccessResponse(reportsData, "", StatusCodes.Status200OK);
        }

        [HttpPost]
        [Route("GetAllZoneBySiteId")]
        [CustomAuthorize([ScreenNames.AddOrUpdateReport])]
        public async Task<ActionResult<StandardAPIResponse<IEnumerable<FloorZoneByPermissionDto>>>> GetAllZoneBySiteId(ZonesRequest zonesRequest)
        {
            var reportsData = await _reportService.GetAllZoneBySiteAndFloorId(zonesRequest.SiteId, zonesRequest.FloorIds);
            return StandardAPIResponse<IEnumerable<FloorZoneByPermissionDto>>.SuccessResponse(reportsData, "", StatusCodes.Status200OK);
        }
        [HttpPost]
        [Route("GenerateReportPDF")]
        [CustomAuthorize([ScreenNames.ExportReport])]
        public async Task<ActionResult> GenerateReportPDF(PdfDataRequest PdfDataRequest)
        {
            var reportData = await _reportService.GenerateReportById(PdfDataRequest.ReportId);
            var htmlPath = Path.Combine(Directory.GetCurrentDirectory(), "Assets/Template/Report.html");
            var htmlContent = System.IO.File.ReadAllText(htmlPath);
            var ClientSettingsdata = await _clientSettingService.GetClientSetting();
            var logoPath = ClientSettingsdata.Logo;
            string headerPath = Path.Combine(Directory.GetCurrentDirectory(), "Assets", "Template", "ReportHeader.html");
            //string logoPath = Path.GetFullPath("Assets/images/HanwhaVisionLogo.png");
            string logoPath2 = Path.GetFullPath("Assets/images/VisionInsight.png");
            string htmlHeader = System.IO.File.ReadAllText(headerPath)
            .Replace("[LogoPath]", logoPath)
            .Replace("[LogoPath2]", $"file:///{logoPath2.Replace("\\", "/")}");

            string modifiedHeaderPath = Path.Combine(Path.GetTempPath(), $"Header_{Guid.NewGuid()}.html");
            System.IO.File.WriteAllText(modifiedHeaderPath, htmlHeader);
            string footerPath = Path.Combine(Directory.GetCurrentDirectory(), "Assets", "Template", "ReportFooter.html");
            string finalHtml = _reportService.ReplaceReportPlaceholders(htmlContent, reportData, PdfDataRequest);
            var pdfOptions = new PdfGenerationOptions
            {
                HtmlContent = finalHtml,
                HeaderHtmlPath = modifiedHeaderPath,
                FooterHtmlPath = footerPath,
                Title = "Traffic Report"
            };
            var pdf = await _pdfGenerator.GeneratePdfFromHtml(pdfOptions);
            string fileName = $"{reportData.ReportHeader?.ReportName}_{DateTime.Now:yyyyMMdd_HHmmss}.pdf";
            return File(pdf, "application/pdf", fileName);
        }
      
    }
}
