using HanwhaClient.Application.Interfaces;
using HanwhaClient.Application.Services;
using HanwhaClient.Core.Services;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.Dto;
using MongoDB.Driver;
using Quartz;
using System.Text;

namespace HanwhaClient.Server.BackgroundTask
{
    public class ReportSchedulerJob : IJob
    {

        private readonly IServiceProvider _serviceProvider;
        private readonly IEmailTemplateService _emailTemplateService;
        private readonly IFloorRepository _floorRepository;
        private readonly IZoneRepository _zoneRepository;
        public ReportSchedulerJob(IServiceProvider serviceProvider,
                                IEmailTemplateService emailTemplateService,
                                IFloorRepository floorRepository,
                                IZoneRepository zoneRepository)
        {
            _serviceProvider = serviceProvider;
            _emailTemplateService = emailTemplateService;
            _floorRepository = floorRepository;
            _zoneRepository = zoneRepository;
        }
        public async Task Execute(IJobExecutionContext context)
        {
            using var scope = _serviceProvider.CreateScope();
            var deviceClientService = scope.ServiceProvider.GetRequiredService<IClientSettingService>();
            var widgetService = scope.ServiceProvider.GetRequiredService<IWidgetService>();
            var emailService = scope.ServiceProvider.GetRequiredService<EmailSenderService>();
            var userRepository = scope.ServiceProvider.GetRequiredService<IUsersRepository>();

            var scheduleDetails = await deviceClientService.GetClientSetting();
            if (scheduleDetails.ReportSchedule != null)
            {
                if (scheduleDetails.isReportSchedule)
                {
                    var now = DateTime.UtcNow;

                    if (now.Date >= scheduleDetails.ReportSchedule.StartDate.Date)
                    {
                        var startTime = scheduleDetails.ReportSchedule.StartTime.TimeOfDay;
                        var sleepDuration = startTime - now.TimeOfDay;
                        if (now.TimeOfDay <= startTime && sleepDuration <= new TimeSpan(0, 15, 0))
                        {
                            await Task.Delay(sleepDuration);
                            var userDetails = await userRepository.GetUserByUsernameAsync("superadmin");
                            WidgetRequest widgetRequest = new WidgetRequest
                            {
                                FloorIds = scheduleDetails.ReportSchedule.FloorIds,
                                ZoneIds = scheduleDetails.ReportSchedule.zoneIds,
                                userRoles = new List<string> { "super admin" },
                                WidgetTitleNames = scheduleDetails.ReportSchedule.Widgets.Select(x => new WidgetInfo
                                {
                                    Id = x,
                                    Title = WidgetCsvDisplayName.widgetMapping.TryGetValue(x, out var displayName) ? displayName : x 
                                }).ToList(),
                                UserId = userDetails.Id
                            };

                            try
                            {
                                switch (scheduleDetails.ReportSchedule.SendInterval.ToLower())
                                {
                                    case "daily":
                                        widgetRequest.StartDate = now.AddDays(-1);
                                        widgetRequest.EndDate = now;
                                        byte[] attachmentBytesDaily;
                                        string fileNameDaily;
                                        if (scheduleDetails.ReportSchedule.ReportFormat.ToLower() == "csv")
                                        {
                                            var DailyCsvFile = await widgetService.DownloadMultipleWidgetsCsvAsync(widgetRequest);
                                            attachmentBytesDaily = Encoding.UTF8.GetBytes(DailyCsvFile.ToString());
                                            fileNameDaily = "Scheduled Report – Daily - " + DateTime.Now.ToString("MMMM dd, yyyy") + ".csv";
                                        }
                                        else
                                        {
                                            attachmentBytesDaily = await deviceClientService.GenerateChartReportPdf();
                                            fileNameDaily = "Scheduled Report – Daily - " + DateTime.Now.ToString("MMMM dd, yyyy") + ".pdf";
                                        }

                                        foreach (string email in scheduleDetails.ReportSchedule.Emails)
                                        {
                                            string emailSubject = "Scheduled Report – Daily - " + DateTime.Now.ToString("MMMM dd, yyyy");
                                            string emailContent = await GenerateEmailContent(widgetRequest, scheduleDetails.ReportSchedule, email);
                                            await emailService.SendEmailAsync(new List<string> { email }, null, null, emailSubject, emailContent, new List<(string, byte[])> { (fileNameDaily, attachmentBytesDaily) });
                                        }
                                        break;

                                    case "weekly":
                                        string todayDay = now.DayOfWeek.ToString();
                                        string targetDay = scheduleDetails.ReportSchedule.StartDate.DayOfWeek.ToString();
                                        if (todayDay == targetDay)
                                        {
                                            widgetRequest.StartDate = now.AddDays(-7);
                                            widgetRequest.EndDate = now;
                                            byte[] attachmentBytesWeek;
                                            string fileNameWeek;
                                            if (scheduleDetails.ReportSchedule.ReportFormat.ToLower() == "csv")
                                            {
                                                var weeklyCsvFile = await widgetService.DownloadMultipleWidgetsCsvAsync(widgetRequest);
                                                attachmentBytesWeek = Encoding.UTF8.GetBytes(weeklyCsvFile.ToString());
                                                fileNameWeek = "Scheduled Report – Weekly - " + DateTime.Now.ToString("MMMM dd, yyyy") + ".csv";
                                            }
                                            else
                                            {
                                                attachmentBytesWeek = await deviceClientService.GenerateChartReportPdf();
                                                fileNameWeek = "Scheduled Report – Weekly - " + DateTime.Now.ToString("MMMM dd, yyyy") + ".pdf";
                                            }

                                            foreach (string email in scheduleDetails.ReportSchedule.Emails)
                                            {
                                                string emailSubject = "Scheduled Report – Weekly - " + DateTime.Now.ToString("MMMM dd, yyyy");
                                                string emailContent = await GenerateEmailContent(widgetRequest, scheduleDetails.ReportSchedule, email);
                                                await emailService.SendEmailAsync(new List<string> { email }, null, null, emailSubject, emailContent, new List<(string, byte[])> { (fileNameWeek, attachmentBytesWeek) });
                                            }
                                        }
                                        break;
                                    case "monthly":
                                        int todayDate = now.Day;
                                        int targetDate = scheduleDetails.ReportSchedule.StartDate.Day;
                                        if (todayDate == targetDate)
                                        {
                                            widgetRequest.StartDate = now.AddMonths(-1);
                                            widgetRequest.EndDate = now;
                                            byte[] attachmentBytesMonth;
                                            string fileNameMonth;
                                            if (scheduleDetails.ReportSchedule.ReportFormat.ToLower() == "csv")
                                            {
                                                var monthlyCsvFile = await widgetService.DownloadMultipleWidgetsCsvAsync(widgetRequest);
                                                attachmentBytesMonth = Encoding.UTF8.GetBytes(monthlyCsvFile.ToString());
                                                fileNameMonth = "Scheduled Report – Monthly - " + DateTime.Now.ToString("MMMM dd, yyyy") + ".csv";
                                            }
                                            else
                                            {
                                                attachmentBytesMonth = await deviceClientService.GenerateChartReportPdf();
                                                fileNameMonth = "Scheduled Report – Monthly - " + DateTime.Now.ToString("MMMM dd, yyyy") + ".pdf";
                                            }

                                            foreach (string email in scheduleDetails.ReportSchedule.Emails)
                                            {
                                                string emailSubject = "Scheduled Report – Monthly - " + DateTime.Now.ToString("MMMM dd, yyyy");
                                                string emailContent = await GenerateEmailContent(widgetRequest, scheduleDetails.ReportSchedule, email);
                                                await emailService.SendEmailAsync(new List<string> { email }, null, null, emailSubject, emailContent, new List<(string, byte[])> { (fileNameMonth, attachmentBytesMonth) });
                                            }
                                        }
                                        break;
                                }
                            }
                            catch (Exception ex)
                            {
                                throw;
                            }


                        }
                    }
                }
            }
            return;
        }



        public async Task<string> GenerateEmailContent(WidgetRequest widgetRequest, ReportSchedule reportSchedule, string recipientEmail)
        {
            EmailTemplates reportScheduleEmailTemplate = await _emailTemplateService.GetEmailTemplateByTitle("Report Schedule");
            var emailBody = reportScheduleEmailTemplate.EmailTemplateHtml;

            string recipentName = recipientEmail.Split("@")[0];
            emailBody = emailBody.Replace("[[UserName]]", recipentName);

            ProjectionDefinition<FloorPlanMaster> projection = Builders<FloorPlanMaster>.Projection
            .Include("floorPlanName")
            .Include("_id");

            var floors = await _floorRepository.GetManyAsync(widgetRequest.FloorIds, projection);
            
            var zones = await _zoneRepository.GetZonesByMultipleFloorIdZoneIdAsync(floors.Select(x => x.Id).ToList(), null);

            string tableContent = "";
            tableContent += "<tr><td> Selected Floors </td> <td style=\"word-break: break-word;\">" + string.Join(", ", floors.Select(x => x.FloorPlanName).ToList()) + "</td></tr>";
            tableContent += "<tr><td> Selected Zones </td> <td style=\"word-break: break-word;\">" + string.Join(", ", zones.Select(x => x.ZoneName)) + "</td></tr>";
            tableContent += "<tr><td> Selected Widgets </td> <td style=\"word-break: break-word;\">" + string.Join(", ", widgetRequest.WidgetTitleNames.Select(x => x.Title).ToList()) + "</td></tr>";
            tableContent += "<tr><td> Frequency </td> <td>" + reportSchedule.SendInterval + "</td></tr>";
            tableContent += "<tr><td> Generated On </td> <td>" + DateTime.Now.ToString() + "</td></tr>";

            emailBody = emailBody.Replace("[[TableContent]]", tableContent);
            return emailBody;
        }
    }
}
