using HanwhaClient.Application.Interfaces;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Model.Common.ReferenceData;
using HanwhaClient.Model.DbEntities;
using Microsoft.AspNetCore.Http;
using MongoDB.Driver;
using PuppeteerSharp.Media;
using PuppeteerSharp;
using Microsoft.Extensions.Configuration;
using HanwhaClient.Model.Common;

namespace HanwhaClient.Application.Services
{
    public class ClientSettingService : IClientSettingService
    {
        private readonly IClientSettingRepository _clientSettingRepository;
        private ClientSettings _clientSetting;
        private readonly IAuthService _authService;
        private readonly IUsersService _usersService;
        private readonly ICacheService _cacheService;
        private readonly string appUrl;

        public ClientSettingService(IClientSettingRepository clientSettingRepository,
        IAuthService authService,
            IUsersService usersService,
            IConfiguration configuration,
            ICacheService cacheService)
        {
            this._clientSettingRepository = clientSettingRepository;
            _authService = authService;
            _usersService = usersService;
            _cacheService = cacheService;
            appUrl = configuration["ApplicationUrl"];
        }
        public async Task AddDefaultSettingEntry(string userId)
        {
            _clientSetting = await _clientSettingRepository.GetClientSettingsAsync();
            if (_clientSetting == null)
            {
                _clientSetting = new ClientSettings()
                {
                    CreatedBy = userId,
                    CreatedOn = DateTime.UtcNow,
                    UpdatedBy = userId,
                    UpdatedOn = DateTime.UtcNow
                };
                _clientSetting.Id = await _clientSettingRepository.InsertAsync(_clientSetting);
            }
            await _cacheService.RemoveAsync(CacheConstants.ClientSettings);
        }

        public async Task<bool> SaveClientLogo(IFormFile file, string userId)
        {
            await AddDefaultSettingEntry(userId);

            using var memoryStream = new MemoryStream();
            await file.CopyToAsync(memoryStream);
            var fileBytes = memoryStream.ToArray();
            var base64Image = Convert.ToBase64String(fileBytes);
            var mimeType = file.ContentType;
            var base64ImageWithMime = $"data:{mimeType};base64,{base64Image}";
            var update = Builders<ClientSettings>.Update
                .Set(c => c.Logo, base64ImageWithMime)
                .Set(c => c.UpdatedBy, userId)
                .Set(c => c.UpdatedOn, DateTime.UtcNow);
            var data = await _clientSettingRepository.UpdateFieldsAsync(_clientSetting.Id, update);
            await _cacheService.RemoveAsync(CacheConstants.ClientSettings);
            return await Task.FromResult(data);
        }
        public async Task<string?> GetClientLogo(string userId)
        {
            await AddDefaultSettingEntry(userId);
            return await Task.FromResult(_clientSetting.Logo);
        }

        public async Task<bool> SaveClientSMTPSettings(SmtpSettings smtpSettings, string userId)
        {
            await AddDefaultSettingEntry(userId);

            var update = Builders<ClientSettings>.Update
                .Set(c => c.SmtpSettings, smtpSettings)
                .Set(c => c.UpdatedBy, userId)
                .Set(c => c.UpdatedOn, DateTime.UtcNow);
            var data = await _clientSettingRepository.UpdateFieldsAsync(_clientSetting.Id, update);
            await _cacheService.RemoveAsync(CacheConstants.ClientSettings);
            return data;
        }

        public async Task<bool> SaveClientOperationalTiming(ClientOperationalTimingRequest clientOperationalTiming, string userId)
        {
            await AddDefaultSettingEntry(userId);
            var update = Builders<ClientSettings>.Update
                .Set(c => c.OperationalTiming.StartTime, clientOperationalTiming.StartTime)
                .Set(c => c.OperationalTiming.EndTime, clientOperationalTiming.EndTime)
                .Set(c => c.UpdatedBy, userId)
                .Set(c => c.UpdatedOn, DateTime.UtcNow);

            var data = await _clientSettingRepository.UpdateFieldsAsync(_clientSetting.Id, update);
            await _cacheService.RemoveAsync(CacheConstants.ClientSettings);
            return data;
        }

        public async Task<bool> UploadSSLCertificate(string fileName, string userId)
        {
            await AddDefaultSettingEntry(userId);
            var update = Builders<ClientSettings>.Update
                .Set(c => c.SSLCertificateFileName, fileName)
                .Set(c => c.UpdatedBy, userId)
                .Set(c => c.UpdatedOn, DateTime.UtcNow);

            var data = await _clientSettingRepository.UpdateFieldsAsync(_clientSetting.Id, update);
            await _cacheService.RemoveAsync(CacheConstants.ClientSettings);
            return data;
        }


        public async Task<bool> SaveClientOperationalTimeZone(ClientOperationalTimeZoneRequest clientOperationalTimeZone, string userId)
        {
            await AddDefaultSettingEntry(userId);
            var update = Builders<ClientSettings>.Update
                .Set(c => c.TimeZone, clientOperationalTimeZone.TimeZone)
                .Set(c => c.UpdatedBy, userId)
                .Set(c => c.UpdatedOn, DateTime.UtcNow);

            var data = await _clientSettingRepository.UpdateFieldsAsync(_clientSetting.Id, update);
            await _cacheService.RemoveAsync(CacheConstants.ClientSettings);
            return data;
        }

        public async Task<ClientSettings> GetClientSetting()
        {
            var cachedClientSettings = await _cacheService.GetAsync<ClientSettings>(CacheConstants.ClientSettings);
            if (cachedClientSettings != null)
            {
                return cachedClientSettings;
            }
            var data = await _clientSettingRepository.GetClientSettingsAsync();
            await _cacheService.SetAsync(CacheConstants.ClientSettings, data);
            return data;
        }

        public async Task<bool> SaveGoogleApiKeyAsync(GoogleApiKeyRequest googleApiKeyRequest, string userId)
        {
            await AddDefaultSettingEntry(userId);
            var update = Builders<ClientSettings>.Update
                .Set(c => c.GoogleApiKey, googleApiKeyRequest.ApiKey)
                .Set(c => c.UpdatedBy, userId)
                .Set(c => c.UpdatedOn, DateTime.UtcNow);

            var data = await _clientSettingRepository.UpdateFieldsAsync(_clientSetting.Id, update);
            await _cacheService.RemoveAsync(CacheConstants.ClientSettings);
            return data;
        }

        public async Task<bool> SaveFTPConfigurationAsync(FtpConfigurationRequest ftpConfigurationRequest, string userId)
        {
            await AddDefaultSettingEntry(userId);
            var ftpConfiguration = new FtpConfigurationSetting
            {
                Host = ftpConfigurationRequest.Host,
                Password = ftpConfigurationRequest.Password,
                Username = ftpConfigurationRequest.Username,
                Port = ftpConfigurationRequest.Port
            };

            var update = Builders<ClientSettings>.Update
                .Set(c => c.FtpConfiguration, ftpConfiguration);

            var data = await _clientSettingRepository.UpdateFieldsAsync(_clientSetting.Id, update);
            await _cacheService.RemoveAsync(CacheConstants.ClientSettings);
            return data;
        }

        public async Task<bool> TurnReportScheduleAsync(TurnReportSchedule turnReportSchedule, string userId)
        {
            await AddDefaultSettingEntry(userId);
            var update = Builders<ClientSettings>.Update
                .Set(c => c.isReportSchedule, turnReportSchedule.IsReportSchedule)
                .Set(c => c.UpdatedBy, userId)
                .Set(c => c.UpdatedOn, DateTime.UtcNow);

            var data = await _clientSettingRepository.UpdateFieldsAsync(_clientSetting.Id, update);
            await _cacheService.RemoveAsync(CacheConstants.ClientSettings);
            return data;
        }

        public async Task<bool> AddUpdateReportScheduleAsync(ReportScheduleRequest reportScheduleRequest, string userId)
        {           
            await AddDefaultSettingEntry(userId);
            var reportSchedule = new ReportSchedule
            {
                Emails = reportScheduleRequest.Emails,
                ReportFormat = reportScheduleRequest.ReportFormat,
                SendInterval = reportScheduleRequest.SendInterval,
                StartDate = reportScheduleRequest.StartDate,
                StartTime = reportScheduleRequest.StartTime,
                Widgets = reportScheduleRequest.Widgets,
                FloorIds = reportScheduleRequest.FloorIds,
                zoneIds = reportScheduleRequest.ZoneIds,
            };

            var update = Builders<ClientSettings>.Update
                .Set(c => c.ReportSchedule, reportSchedule)
                .Set(c => c.UpdatedBy, userId)
                .Set(c => c.UpdatedOn, DateTime.UtcNow);
            var data = await _clientSettingRepository.UpdateFieldsAsync(_clientSetting.Id, update);
            await _cacheService.RemoveAsync(CacheConstants.ClientSettings);
            return data;
        }

        public async Task<byte[]> GenerateChartReportPdf()
        {
            //var browser = await Puppeteer.LaunchAsync(new LaunchOptions
            //{
            //    Headless = true,
            //    Args = new[] { "--no-sandbox" }, // important for Docker/Linux
            //    //ExecutablePath = @"C:\Program Files\Google\Chrome\Application\chrome.exe"
            //    ExecutablePath = @"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
            //});
            var browserPath = GetBrowserPath();
            if (browserPath == null)
            {
                throw new Exception(
                    "No compatible browser found. Please install Microsoft Edge or Google Chrome.");
            }

            var browser = await Puppeteer.LaunchAsync(new LaunchOptions
            {
                Headless = true,
                Args = new[] { "--no-sandbox" },
                ExecutablePath = browserPath
            });

            using var page = await browser.NewPageAsync();

            string url = $"{appUrl}report-scheduler-pdf";
            var UserName = "superadmin"; var Password = "SAdmin@25!";

            var result = await _authService.LoginAsync(UserName, Password);
            var token = "";
            if (result.AccessToken != null)
            {
                token = result.AccessToken;
            }

            var UserData = _authService.GetUserFromToken(token);
            var userZoneData = await _usersService.GetUsersProfile(UserData.Id);
            var offset = "";
           
            if (userZoneData.referenceData?.TryGetValue("timeZone", out var timeZoneRaw) == true)
            {
                if (timeZoneRaw is OptionModel<string, object> timeZoneOption)
                {
                    if (timeZoneOption.label is ClientTimezones tzData)
                    {
                        offset = tzData.UtcOffset;
                    }
                }
            }
            var ClientSettingsdata = await GetClientSetting();
            var logo = ClientSettingsdata.Logo;
            var appRoot = AppDomain.CurrentDomain.BaseDirectory;
            var centerLogoPath = Path.Combine(Directory.GetCurrentDirectory(), "Assets/Images/vision_insight_logo.svg");
            //var centerLogoPath = Path.Combine(appRoot, "Assets", "Images", "vision_insight_logo.svg");
            //var centerLogoPath = Path.Combine(_env.WebRootPath, "Images", "vision_insight_logo.svg");
            string logoBase64 = Convert.ToBase64String(System.IO.File.ReadAllBytes(centerLogoPath));
            string logoDataUrl = $"data:image/svg+xml;base64,{logoBase64}";

            await page.EvaluateFunctionOnNewDocumentAsync($@"() => {{
                    localStorage.setItem('accessToken', '{token}');
                    localStorage.setItem('userProfileReferenceData', JSON.stringify({{
                      timeZone: {{
                        label: {{
                          utcOffset: '{offset}'
                        }}
                      }}
                    }}));
                }}");

            // Make sure the URL is available and running
            //await page.GoToAsync(url, WaitUntilNavigation.Networkidle2);
            await page.GoToAsync(url, new NavigationOptions
            {
                WaitUntil = new[] { WaitUntilNavigation.Load }, // Or Networkidle2
                Timeout = 90000 // Adjust depending on your app's load time
            });

            // Optional: Wait for specific content (like chart or DOM element)
            // await page.WaitForSelectorAsync("svg");
            // Wait until data is loaded and ready (based on that marker div)
            await page.WaitForSelectorAsync("#pdf-ready-marker", new WaitForSelectorOptions
            {
                Timeout = 70000
            });
            // Generate PDF
            var pdfBytes = await page.PdfDataAsync(new PdfOptions
            {
                Format = PaperFormat.A4,
                PrintBackground = true,
                DisplayHeaderFooter = true,
                MarginOptions = new MarginOptions
                {
                    Top = "100px",
                    Bottom = "80px",
                    Left = "20px",
                    Right = "20px"
                },
                HeaderTemplate = $@"
                <div style='width: 100%; font-size: 10px; padding: 0 20px;'>
                    <div style='display: flex; justify-content: space-between; align-items: center;'>
                        <img src=""{logo}"" height='40px' />
                        <img src=""{logoDataUrl}"" height='30px' />
                    </div>
                    <div style='border-bottom: 1px solid #999; margin-top: 10px;'></div>
                </div>
                ",

                FooterTemplate = @"
                    <div style='width: 100%; font-size: 10px; padding: 10px 20px; color: gray; position: relative;'>
                    <div style='width: 100%; height: 2px; background-color: #999; margin-bottom: 5px;'></div>
                    <div style='position: absolute; right: 20px; bottom: 5px;'>
                        Page <span class='pageNumber'></span> of <span class='totalPages'></span>
                    </div>
                     </div>
                    "
            });

            await browser.CloseAsync();

            return pdfBytes;

        }
        public string GetBrowserPath()
        {
            // Edge paths
            string[] edgePaths = new[]
            {
                @"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
                @"C:\Program Files\Microsoft\Edge\Application\msedge.exe"
            };

            foreach (var path in edgePaths)
            {
                if (File.Exists(path))
                    return path;
            }

            // Chrome paths
            string[] chromePaths = new[]
            {
                @"C:\Program Files\Google\Chrome\Application\chrome.exe",
                @"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
                Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.UserProfile),
                @"AppData\Local\Google\Chrome\Application\chrome.exe")
            };

            foreach (var path in chromePaths)
            {
                if (File.Exists(path))
                    return path;
            }

            return null; // No browser found
        }


    }
}
