using AutoMapper;
using HanwhaAdminApi.Application.Interfaces;
using HanwhaAdminApi.Application.Mapper;
using HanwhaAdminApi.Application.Services;
using HanwhaAdminApi.Application.Services.Migrations;
using HanwhaAdminApi.Core.Interfaces;
using HanwhaAdminApi.Core.Services;
using HanwhaAdminApi.Core.Services.License;
using HanwhaAdminApi.Helper;
using HanwhaAdminApi.Helper.Extensions;
using HanwhaAdminApi.Infrastructure.Connection;
using HanwhaAdminApi.Infrastructure.Interfaces;
using HanwhaAdminApi.Infrastructure.Repository;
using HanwhaAdminApi.Model.Common;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using MongoDB.Driver;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);
var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();
var configuration = builder.Configuration;

// Add services to the container.


builder.Services.AddScoped<MongoDbConnectionService, MongoDbConnectionService>();   // as per suggestion AddSingleton is also feasible
var mongoDbConnectionService = new MongoDbConnectionService(builder.Configuration);
//var migrationRunner = new MigrationRunner(mongoDbConnectionService);

// Register MigrationRunner
builder.Services.AddScoped<MigrationRunner>();

//builder.Services.AddScoped<IMigration, AddScreenMasterTableData>();
//builder.Services.AddScoped<ICustomerService, CustomerService>();
//builder.Services.AddScoped<ICameraService, CameraService>();
builder.Services.AddScoped<LicenseGenerator, LicenseGenerator>();
builder.Services.AddScoped<IEncryptionDecryptionService, EncryptionDecryptionService>();

//For Migratation
//builder.Services.AddScoped<SeedData>();

builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));
builder.Services.Configure<Logs>(builder.Configuration.GetSection("Logs"));
builder.Services.AddScoped<RsaKeyService, RsaKeyService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUsersService, UsersService>();
builder.Services.AddScoped<IUsersRepository, UsersRepository>();
builder.Services.AddScoped<IPasswordHasher, Argon2PasswordHasher>();
builder.Services.AddScoped<IRoleRepository, RoleRepository>();
builder.Services.AddScoped<IOtpRepository, OtpRepository>();
builder.Services.AddScoped<IOtpService, OtpService>();

builder.Services.AddScoped<IExceptionLogService, ExceptionLogService>();
builder.Services.AddScoped<IExceptionLogRepository, ExceptionLogRepository>();

builder.Services.AddScoped<IRoleService, RoleService>();

builder.Services.AddScoped<ICustomerMasterService, CustomerMasterService>();
builder.Services.AddScoped<ICustomerMasterRepository, CustomerMasterRepository>();

builder.Services.AddScoped<ILicenseService, LicenseService>();
builder.Services.AddScoped<ILicenseRequestRepository, LicenseRequestRepository>();

builder.Services.AddScoped<IEmailRequestLogRepository, EmailRequestLogRepository>();
builder.Services.AddScoped<IClientSettingService, ClientSettingService>();
builder.Services.AddScoped<IClientSettingRepository, ClientSettingRepository>();
builder.Services.AddScoped<EmailSenderService>();
builder.Services.AddScoped<IEmailTemplateService, EmailTemplateService>();
builder.Services.AddScoped<IEmailTemplateRepository, EmailTemplateRepository>();
builder.Services.AddScoped<EmailSenderService, EmailSenderService>();

builder.Services.AddSingleton<IPermissionService, PermissionService>();
builder.Services.AddScoped<IScreenMasterService, ScreenMasterService>();
builder.Services.AddScoped<IScreenMasterRepository, ScreenMasterRepository>();
//builder.Services.AddScoped<ICameraRepository, CameraRepository>();

builder.Services.AddScoped<IPermissionRepository, PermissionRepository>();
builder.Services.AddScoped<IRoleScreenMappingRepository, RoleScreenMappingRepository>();


builder.Services.AddScoped<IRoleScreenMappingService, RoleScreenMappingService>();
builder.Services.AddScoped<IRoleScreenMappingRepository, RoleScreenMappingRepository>();
//builder.Services.AddScoped<ISiteService, SiteService>();
//builder.Services.AddScoped<ISiteRepository, SiteRepository>();
//builder.Services.AddScoped<IZoneService, ZoneService>();
//builder.Services.AddScoped<IZoneRepository, ZoneRepository>();
//builder.Services.AddScoped<IClientSettingService, ClientSettingService>();
//builder.Services.AddScoped<IClientSettingRepository, ClientSettingRepository>();
//builder.Services.AddScoped<IFloorRepository, FloorRepository>();
//builder.Services.AddScoped<IClientSettingRepository, ClientSettingRepository>();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();

builder.Services.AddScoped<IRegionService, RegionService>();
builder.Services.AddScoped<IRegionCountryRepository, RegionCountryRepository>();
builder.Services.AddScoped<IRegionStateRepository, RegionStateRepository>();
builder.Services.AddScoped<IRegionCityRepository, RegionCityRepository>();

builder.Services.AddScoped<IDistributorService, DistributorService>();
builder.Services.AddScoped<IDistributorRepository, DistributorRepository>();
builder.Services.AddScoped<IRolePermissionHistoryRepository, RolePermissionHistoryRepository>();
// For .NET 6 or later in Program.cs



builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

//builder.Services.AddExceptionHandler<AddExceptionHandler>();
//builder.Services.AddScoped<IExceptionHandler, AddExceptionHandler>();


builder.Services.AddHttpContextAccessor();
builder.Services.AddMemoryCache();

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
    options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
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
    options.AddPolicy("CorsPolicy", builder =>
    {
        builder.WithOrigins("*")
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});




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



var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}


using (var scope = app.Services.CreateScope())
{
    var migrationRunner = scope.ServiceProvider.GetRequiredService<MigrationRunner>();
    await migrationRunner.RunMigrationsAsync(2025011602);
}

//await migrationRunner.RunMigrationsAsync(2025011607);

app.UseMiddleware<GlobalExceptionHandlerMiddleware>();
//app.UseExceptionHandler(_ => { });

// add for Migratation
//await app.Services.SeedMongoDataAsync();

app.UseCors("CorsPolicy");

app.UseHttpsRedirection();

app.UseMiddleware<JwtValidatorMiddleware>();

app.UseAuthorization();

app.MapControllers();

app.Run();

