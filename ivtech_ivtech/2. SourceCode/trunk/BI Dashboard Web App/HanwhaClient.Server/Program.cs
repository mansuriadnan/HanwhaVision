using AutoMapper;
using DinkToPdf;
using DinkToPdf.Contracts;
using HanwhaClient.Application.Interfaces;
using HanwhaClient.Application.Mapper;
using HanwhaClient.Application.Services;
using HanwhaClient.Application.Services.Migrations;
using HanwhaClient.BackgroundTask;
using HanwhaClient.Core.Interfaces;
using HanwhaClient.Core.Services;
using HanwhaClient.Core.Services.License;
using HanwhaClient.Core.SignalR;
using HanwhaClient.Helper;
using HanwhaClient.Helper.Extensions;
using HanwhaClient.Infrastructure.Connection;
using HanwhaClient.Infrastructure.Indexes;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Infrastructure.Repository;
using HanwhaClient.Model.Common;
using HanwhaClient.Server.BackgroundTask;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Quartz;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);
var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();
var configuration = builder.Configuration;
// Add services to the container.
var mongoDbConnectionService = new MongoDbConnectionService(builder.Configuration);

var database = mongoDbConnectionService.Database;

var indexInitializer = new MongoIndexInitializer(database);
await indexInitializer.CreateIndexesAsync();

builder.Services.AddScoped<MigrationRunner>();
//builder.Services.AddScoped<IMigration, AddScreenMasterTableData>();

builder.Services.AddSingleton<MongoDbConnectionService, MongoDbConnectionService>();   // as per suggestion AddSingleton is also feasible
builder.Services.AddMemoryCache();
builder.Services.AddScoped<ICacheService, InMemoryCacheService>();

builder.Services.AddScoped<ICustomerService, CustomerService>();
builder.Services.AddScoped<ICustomerRepository, CustomerRepository>();
builder.Services.AddSingleton<LicenseValidator, LicenseValidator>();
builder.Services.AddSingleton<IEncryptionDecryptionService, EncryptionDecryptionService>();
builder.Services.AddSingleton<IDeviceDataStoreService, DeviceDataStoreService>();
builder.Services.AddSingleton<IBackgroundJobCountService, BackgroundJobCountService>();

builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));
builder.Services.Configure<Logs>(builder.Configuration.GetSection("Logs"));
builder.Services.AddScoped<RsaKeyService, RsaKeyService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUsersService, UsersService>();
builder.Services.AddScoped<IUsersRepository, UsersRepository>();
builder.Services.AddScoped<IPasswordHasher, Argon2PasswordHasher>();

builder.Services.AddScoped<IExceptionLogService, ExceptionLogService>();
builder.Services.AddScoped<IExceptionLogRepository, ExceptionLogRepository>();

builder.Services.AddScoped<IRoleService, RoleService>();

builder.Services.AddScoped<ILicenseService, LicenseService>();


builder.Services.AddSingleton<IPermissionService, PermissionService>();
builder.Services.AddScoped<IScreenMasterService, ScreenMasterService>();
builder.Services.AddScoped<IScreenMasterRepository, ScreenMasterRepository>();
builder.Services.AddScoped<IRoleRepository, RoleRepository>();
builder.Services.AddScoped<IZoneCameraRepository, ZoneCameraRepository>();

builder.Services.AddScoped<IPermissionRepository, PermissionRepository>();
builder.Services.AddScoped<IRoleScreenMappingRepository, RoleScreenMappingRepository>();

builder.Services.AddScoped<IOtpRepository, OtpRepository>();
builder.Services.AddScoped<IOtpService, OtpService>();
builder.Services.AddScoped<IRoleScreenMappingService, RoleScreenMappingService>();
builder.Services.AddScoped<IRoleScreenMappingRepository, RoleScreenMappingRepository>();
builder.Services.AddScoped<IZoneService, ZoneService>();
builder.Services.AddScoped<IZoneRepository, ZoneRepository>();
builder.Services.AddScoped<IClientSettingService, ClientSettingService>();
builder.Services.AddScoped<IClientSettingRepository, ClientSettingRepository>();
builder.Services.AddScoped<IFloorRepository, FloorRepository>();
builder.Services.AddScoped<IClientSettingRepository, ClientSettingRepository>();
builder.Services.AddScoped<IEmailTemplateService, EmailTemplateService>();
builder.Services.AddScoped<IEmailTemplateRepository, EmailTemplateRepository>();
builder.Services.AddScoped<EmailSenderService, EmailSenderService>();
builder.Services.AddScoped<IEmailRequestLogRepository, EmailRequestLogRepository>();
builder.Services.AddScoped<IDashboardPreferenceService, DashboardPreferenceService>();
builder.Services.AddScoped<IDashboardPreferenceRepository, DashboardPreferenceRepository>();
builder.Services.AddSingleton(typeof(IConverter), new SynchronizedConverter(new PdfTools()));
builder.Services.AddScoped<IPdfGenerator, PdfGeneratorService>();
builder.Services.AddScoped<IBase64Generator, Base64Generator>();
builder.Services.AddScoped<ICsvGenerator, CsvGeneratorService>();
builder.Services.AddScoped<IExcelGenerator, ExcelGeneratorService>();
builder.Services.AddScoped<IAuditLogService, AuditLogService>();
builder.Services.AddScoped<IAuditLogRepository, AuditLogRepository>();
builder.Services.AddScoped<IMongoService, MongoService>();
builder.Services.AddScoped<IMongoConfigService, MongoConfigService>();
builder.Services.AddScoped<IDeviceMasterService, DeviceMasterService>();
builder.Services.AddScoped<IDeviceMasterRepository, DeviceMasterRepository>();
builder.Services.AddScoped<NotificationHub, NotificationHub>();
builder.Services.AddScoped<IPeopleCountService, PeopleCountService>();
builder.Services.AddScoped<IPeopleCountRepository, PeopleCountRepository>();
builder.Services.AddScoped<IClientTimeZoneService, ClientTimeZoneService>();
builder.Services.AddScoped<IClientTimeZoneRepository, ClientTimeZoneRepository>();
builder.Services.AddScoped<IWidgetService, WidgetService>();
builder.Services.AddScoped<IWidgetRepository, WidgetRepository>();
builder.Services.AddScoped<ILicenseHistoryService, LicenseHistoryService>();
builder.Services.AddScoped<ILicenseHistoryRepository, LicenseHistoryRepository>();
builder.Services.AddScoped<IFloorService, FloorService>();
builder.Services.AddScoped<IDeviceApiService, DeviceApiService>();
builder.Services.AddScoped<IVehicleService, VehicleService>();
builder.Services.AddScoped<IVehicleRepository, VehicleRepository>();
builder.Services.AddScoped<ISiteService, SiteService>();
builder.Services.AddScoped<ISiteRepository, SiteRepository>();
builder.Services.AddScoped<IEventTriggerService, EventTriggerService>();
builder.Services.AddScoped<IWidgetService, WidgetService>();
builder.Services.AddScoped<IQueueManagementRepository, QueueManagementRepository>();
builder.Services.AddScoped<IDeviceEventsRepository, DeviceEventsRepository>();
builder.Services.AddScoped<IShoppingCartCountRepository, ShoppingCartCountRepository>();
builder.Services.AddScoped<IPeopleWidgetService, PeopleWidgetService>();
builder.Services.AddScoped<IMultiLaneVehicleCountRepository, MultiLaneVehicleCountRepository>();
builder.Services.AddScoped<IHeatMapRepository, HeatMapRepository>();
builder.Services.AddScoped<IMonitoringService, MonitoringService>();
builder.Services.AddScoped<IMonitoringRepository, MonitoringRepository>();
builder.Services.AddScoped<IReportService, ReportService>();
builder.Services.AddScoped<IReportRepository, ReportRepository>();
builder.Services.AddScoped<IUserNotificationService, UserNotificationService>();
builder.Services.AddScoped<IUserNotificationRepository, UserNotificationRepository>();
builder.Services.AddScoped<IMultiLaneVehicleCountService, MultiLaneVehicleCountService>();
builder.Services.AddScoped<IForkliftCountService, ForkliftCountService>();
builder.Services.AddScoped<IForkliftCountRepository, ForkliftCountRepository>();
builder.Services.AddScoped<IShoppingCartCountService, ShoppingCartCountService>();
builder.Services.AddScoped<IFileLogger, FileLogger>();
builder.Services.AddSingleton<IDeviceEventsMonitorJobService, DeviceEventsMonitorJobService>();
builder.Services.AddScoped<IDateConvert, DateConvert>();
builder.Services.AddScoped<ISSLCertificateService, SSLCertificateService>();
// Register the hosted service
builder.Services.AddHostedService<DeviceEventsMonitorJob>();

// For .NET 6 or later in Program.cs
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

//builder.Services.AddExceptionHandler<AddExceptionHandler>();
//builder.Services.AddScoped<IExceptionHandler, AddExceptionHandler>();

//builder.WebHost.ConfigureKestrel(options =>
//{
//    options.Limits.MaxRequestBodySize = 52428800; // 50 MB
//});

builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 5242880000; // 5000 MB
});



builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddSignalR();

// Setup JWT authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    // Resolve the RsaKeyService from the DI container
    var rsaKeyService = builder.Services.BuildServiceProvider().GetRequiredService<RsaKeyService>();
    var rsaPublicKey = rsaKeyService.GetPublicKey(); // Get the public key
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new RsaSecurityKey(rsaPublicKey),
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidIssuer = jwtSettings?.Issuer,
        ValidAudience = jwtSettings?.Audience,
        ValidateLifetime = true, // Ensure lifetime validation is enabled
        RoleClaimType = ClaimTypes.Role, // Ensure role claims are properly recognized
        //ClockSkew = TimeSpan.FromMinutes(jwtSettings.TokenExpirationInMinutes) // Adjust the clock skew as needed
        ClockSkew = TimeSpan.Zero,
    };
});


// Add Quartz services
builder.Services.AddQuartz(q =>
{
    // Register job and trigger


    foreach (var job in JobScheduler.GetScheduledJobs())
    {
        var jobKey = new JobKey(job.JobName, job.JobGroup);

        if (job.ScheduleType == typeof(ExampleJob))
        {
            q.AddJob<ExampleJob>(opts => opts.WithIdentity(jobKey));
        }
        else if (job.ScheduleType == typeof(ExampleJob2))
        {
            q.AddJob<ExampleJob2>(opts => opts.WithIdentity(jobKey));
        }
        else if (job.ScheduleType == typeof(PeopleCountJob))
        {
            q.AddJob<PeopleCountJob>(opts => opts.WithIdentity(jobKey));
        }
        else if (job.ScheduleType == typeof(VehicleCountJob))
        {
            q.AddJob<VehicleCountJob>(opts => opts.WithIdentity(jobKey));
        }
        else if (job.ScheduleType == typeof(CheckDeviceStatusJob))
        {
            q.AddJob<CheckDeviceStatusJob>(opts => opts.WithIdentity(jobKey));
        }
        else if (job.ScheduleType == typeof(ShoppingCartCountJob))
        {
            q.AddJob<ShoppingCartCountJob>(opts => opts.WithIdentity(jobKey));
        }
        else if (job.ScheduleType == typeof(ForkliftCountJob))
        {
            q.AddJob<ForkliftCountJob>(opts => opts.WithIdentity(jobKey));
        }
        else if (job.ScheduleType == typeof(MultiLaneVehicleCountJob))
        {
            q.AddJob<MultiLaneVehicleCountJob>(opts => opts.WithIdentity(jobKey));
        }
        else if (job.ScheduleType == typeof(HeatMapJob))
        {
            q.AddJob<HeatMapJob>(opts => opts.WithIdentity(jobKey));
        }
        else if (job.ScheduleType == typeof(ManageOperationalTimingJob))
        {
            q.AddJob<ManageOperationalTimingJob>(opts => opts.WithIdentity(jobKey));
        }
        else if (job.ScheduleType == typeof(CheckZoneOccupancy))
        {
            q.AddJob<CheckZoneOccupancy>(opts => opts.WithIdentity(jobKey));
        }
        else if (job.ScheduleType == typeof(ReportSchedulerJob))
        {
            q.AddJob<ReportSchedulerJob>(opts => opts.WithIdentity(jobKey));
        }

        q.AddTrigger(opts => opts
            .ForJob(jobKey)
            .WithIdentity($"{job.JobName}-trigger")
            .WithPriority(job.Priority)
            .WithCronSchedule(job.CronSchedule)); // set dynamic Cron schedule
    }
});

// Optionally, add Quartz hosted service
builder.Services.AddQuartzHostedService(q => q.WaitForJobsToComplete = true);

//builder.Services.AddCors(options =>
//{
//    options.AddPolicy("CorsPolicy", builder =>
//    {
//        builder.WithOrigins("*")
//              .AllowAnyMethod()
//              .AllowAnyHeader();
//    });
//});

builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy",
        builder => builder
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials()
            .SetIsOriginAllowed(origin => true));
});

builder.Services.Configure<MongoSettings>(builder.Configuration.GetSection("MongoSettings"));
builder.Services.AddSingleton(sp =>
    sp.GetRequiredService<IOptions<MongoSettings>>().Value);



// Add FluentValidation configuration
builder.Services.FluentValidationConfiguration();

////Automapper
var mappingConfig = new MapperConfiguration(mc =>
{
    mc.AddProfile(new AutoMapperMappingProfile());
});
IMapper mapper = mappingConfig.CreateMapper();
builder.Services.AddSingleton(mapper);

// Add support for Swagger/OpenAPI documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Your API", Version = "v1" });


    c.AddSecurityDefinition("ApiKey", new OpenApiSecurityScheme
    {
        Description = "API Key needed to access the endpoints. X-API-Key: Your_API_Key",
        In = ParameterLocation.Header,
        Name = "X-API-Key",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "ApiKeyScheme"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "ApiKey"
                    },
                    Scheme = "ApiKeyScheme",
                    Name = "X-API-Key",
                    In = ParameterLocation.Header
                },
                new List<string>()
            }
        });

    // Define the security scheme (JWT Bearer)
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Please enter into field the word 'Bearer' followed by a space and the JWT token",
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    // Add a requirement for using JWT Bearer in Swagger UI
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

builder.Services.AddHttpClient<DeviceApiService>();

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<GlobalExceptionHandlerMiddleware>();

using (var scope = app.Services.CreateScope())
{
    var migrationRunner = scope.ServiceProvider.GetRequiredService<MigrationRunner>();
    await migrationRunner.RunMigrationsAsync(2025011603);
}
//app.UseExceptionHandler(_ => { });
app.UseCors("CorsPolicy");

app.MapHub<NotificationHub>("/api/NotificationHub");
app.UseHttpsRedirection();

app.UseMiddleware<JwtValidatorMiddleware>();

app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.MapGet("/health", () => Results.Ok(new
{
    status = "healthy",
    timestamp = DateTime.UtcNow
}));


app.Run();

