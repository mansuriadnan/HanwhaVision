using AutoMapper;
using HanwhaAdminApi.Application.Interfaces;
using HanwhaAdminApi.Core.Services;
using HanwhaAdminApi.Core.Services.License;
using HanwhaAdminApi.Infrastructure.Interfaces;
using HanwhaAdminApi.Model.Common.CommonEnum;
using HanwhaAdminApi.Model.Common.ReferenceData;
using HanwhaAdminApi.Model.DbEntities;
using HanwhaAdminApi.Model.License;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using MongoDB.Driver;
using System.Text;


namespace HanwhaAdminApi.Application.Services
{
    public class LicenseService : ILicenseService
    {
        private readonly ILicenseRequestRepository _licenseRequestRepository;
        private readonly ICustomerMasterRepository _customerMasterRepository;
        private readonly IMapper _mapper;
        private readonly IEmailTemplateService _EmailTemplateService;
        private readonly EmailSenderService _EmailSenderService;
        private readonly IConfiguration _configuration;
        private readonly LicenseGenerator _licenseGenerator;
        private readonly IDistributorRepository _distributorRepository;
        private readonly IUsersService _usersService;

        public LicenseService(ILicenseRequestRepository licenseRequestRepository,
            ICustomerMasterRepository clientMasterRepository,
            IMapper mapper,
            EmailSenderService emailSenderService,
            IEmailTemplateService emailTemplateService,
            IConfiguration configuration,
            LicenseGenerator licenseGenerator,
            IDistributorRepository distributorRepository,
            IUsersService usersService
            )
        {
            this._licenseRequestRepository = licenseRequestRepository;
            this._customerMasterRepository = clientMasterRepository;
            this._mapper = mapper;
            this._EmailSenderService = emailSenderService;
            this._EmailTemplateService = emailTemplateService;
            this._configuration = configuration;
            this._licenseGenerator = licenseGenerator;
            this._distributorRepository = distributorRepository;
            this._usersService = usersService;
        }


        public async Task<(bool isSuccess, string ErrorMessage)> GenerateLicense(LicenseRequestModel licenseRequest, string userId)
        {
            // Retrieve existing licenses for this customer
            var getLicenseList = await _licenseRequestRepository.GetLicenseByCustomerId(licenseRequest.CustomerId);

            // License validation
            bool hasPermanentLicense = getLicenseList.Any(item => item.LicenseType.Equals("permanent", StringComparison.OrdinalIgnoreCase));
            var existingTrials = getLicenseList
                .Where(item => item.LicenseType.Equals("trial", StringComparison.OrdinalIgnoreCase))
                .ToList();

            int totalUsedDays = existingTrials.Sum(x => x.TrialDurationDays);

            //  If permanent exists, no more trials allowed
            if (hasPermanentLicense && licenseRequest.LicenseType.Equals("trial", StringComparison.OrdinalIgnoreCase))
            {
                return (false, "Only a Permanent license is allowed when a Permanent license already exists.");
            }

            //  Only Permanent allowed when 15-day and 30-day trials already used
            bool has15DayTrial = existingTrials.Any(x => x.TrialDurationDays == 15);
            bool has30DayTrial = existingTrials.Any(x => x.TrialDurationDays == 30);

            if (has15DayTrial && has30DayTrial && !licenseRequest.LicenseType.Equals(LicenseType.Permanent.ToString(), StringComparison.OrdinalIgnoreCase))
            {
                return (false, "Only permanent license is allowed when a 15-day and 30-day trial exists.");
            }

            //  If 15-day trial already exists
            if (has15DayTrial && licenseRequest.TrialDurationDays == 15)
            {
                var existing15Trial = existingTrials.FirstOrDefault(x => x.TrialDurationDays == 15);

                if (existing15Trial != null && licenseRequest.StartDate <= existing15Trial.ExpiryDate)
                {
                    return (false, "The start date must be greater than the expiry date of the existing 15-day trial period.");
                }
            }

            //  If any trial already exists and a new trial requested → adjust days to max 30
            if (licenseRequest.LicenseType.Equals("trial", StringComparison.OrdinalIgnoreCase))
            {
                var existing30Trial = existingTrials.FirstOrDefault(x => x.TrialDurationDays == 15);

                if (existing30Trial != null && licenseRequest.StartDate <= existing30Trial.ExpiryDate)
                {
                    return (false, "The start date must be greater than the expiry date of the existing 15-day trial period.");
                }

                int maxAllowedTrialDays = 30;
                int remainingDays = maxAllowedTrialDays - totalUsedDays;

                if (remainingDays <= 0)
                {
                    return (false, "You have exceeded the 30-day trial license period. Please generate a new permanent license to continue using the application.");
                }

                if (licenseRequest.TrialDurationDays > remainingDays)
                {
                    licenseRequest.TrialDurationDays = remainingDays; // Adjust trial days
                }
            }

            // Get client
            var client = await _customerMasterRepository.GetAsync(licenseRequest.CustomerId);

            // Map and set audit fields
            var licenseRequestObject = _mapper.Map<LicenseRequest>(licenseRequest);
            licenseRequestObject.CreatedBy = licenseRequestObject.UpdatedBy = userId;
            licenseRequestObject.CreatedOn = licenseRequestObject.UpdatedOn = DateTime.Now;

            // Set expiry for trial
            if (licenseRequest.LicenseType.Equals("trial", StringComparison.OrdinalIgnoreCase))
            {
                licenseRequestObject.ExpiryDate = licenseRequest.StartDate.AddDays(licenseRequest.TrialDurationDays - 1);
            }

            // Generate license
            var encryptionKey = _configuration["EncryptionDecryptionService:Key"].ToString();
            var licenseBytes = _licenseGenerator.GenerateLicense(
                client.CustomerName,
                licenseRequest.LicenseType,
                licenseRequest.SiteName,
                licenseRequest.StartDate,
                licenseRequestObject.ExpiryDate,
                licenseRequest.MACAddress,
                client.PrivateKeyPem,
                licenseRequest.NoOfUsers,
                licenseRequest.TrialDurationDays,
                licenseRequest.NoOfChannel
            );

            // Save and email license
            if (licenseRequest != null)
            {
                licenseRequestObject.StartDate = DateTime.SpecifyKind(licenseRequestObject.StartDate, DateTimeKind.Utc);
                licenseRequestObject.ExpiryDate = DateTime.SpecifyKind(licenseRequestObject.ExpiryDate, DateTimeKind.Utc);

                var result = await _licenseRequestRepository.InsertAsync(licenseRequestObject);
                var distributorDetail = await _distributorRepository.GetAsync(client.DistributorId);
                EmailTemplate LicenseTemplate = await _EmailTemplateService.GetEmailTemplateByTitle("Generate License");

                var isTrial = licenseRequest.LicenseType.Equals("trial", StringComparison.OrdinalIgnoreCase);
                var emailBody = LicenseTemplate.EmailTemplateHtml
                                .Replace("[Distributor Name]", distributorDetail?.DistributorName ?? "")
                                .Replace("[Trial / Permanent]", licenseRequest.LicenseType)
                                .Replace("[Customer Name]", client?.CustomerName ?? "")
                                .Replace("[Start Date]", licenseRequest.StartDate.ToString("dd-MMM-yyyy"))
                                //.Replace("[Expiry Date]", licenseRequest.LicenseType.Equals("trial", StringComparison.OrdinalIgnoreCase) ? licenseRequestObject.ExpiryDate.ToString("dd-MMM-yyyy") : "Permanent")
                                .Replace("[Expiry Date]", isTrial ? $"<li><strong>License Expiry Date:</strong> {licenseRequestObject.ExpiryDate:dd-MMM-yyyy}</li>" : "")

                                .Replace("[No. of Users]", licenseRequest.NoOfUsers.ToString())
                                .Replace("[No of Cameras]", licenseRequest.NoOfChannel.ToString())
                                .Replace("[Site Name]", licenseRequest.SiteName.ToString());

                var emailSubject = LicenseTemplate.EmailTemplateDescription
                               .Replace("[Trial / Permanent]", licenseRequest.LicenseType)
                               .Replace("[Customer Name]", client?.CustomerName ?? "");

                var publicKeyArray = Encoding.UTF8.GetBytes(client.PublicKeyPem);

                if (LicenseTemplate != null)
                {
                    await _EmailSenderService.SendEmailAsync(
                        new string[] { distributorDetail.Email },
                        null,
                        null,
                        emailSubject,
                        emailBody,
                        new List<(string, byte[])> { ("License.lic", licenseBytes), ("publickey.pem", publicKeyArray) }
                    );
                }

                return (true, "License has been generated.");
            }

            return (false, "License request failed.");
        }



        public async Task Uploadfile(IFormFile file, string directoryName, string? fileName = null)
        {
            string _licenseDirectory = Path.Combine(Directory.GetCurrentDirectory(), directoryName);

            if (!Directory.Exists(_licenseDirectory))
            {
                Directory.CreateDirectory(_licenseDirectory);
            }

            var filePath = Path.Combine(_licenseDirectory, (fileName ?? file.FileName));

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }
        }


        public async Task<(IEnumerable<LicenseRequest> data, Dictionary<string, object> referenceData)> GetLicenseByClientId(string customerId)
        {
            var licenseMasterData = await _licenseRequestRepository.GetLicenseByCustomerId(customerId);

            Dictionary<string, object> referenceData = new();
            var options = new List<OptionModel<string, string>>();
            var customerIds = licenseMasterData.Where(x => x.CustomerId != null).Select(x => x.CustomerId).Distinct();
            var mappings = await _customerMasterRepository.GetManyAsync(customerIds);
            options = mappings.Select(x => new OptionModel<string, string>(x.Id, x.CustomerName)).ToList();
            referenceData.Add("clientMapping", options);

            var createdByIds = licenseMasterData.Where(x => x.CreatedBy != null).Select(x => x.CreatedBy).Distinct();
            referenceData.Add("createdBy", await _usersService.GetUserMasterReferenceDataAsync(createdByIds));

            // commet as per discuss with jayendra
            //var machineidOptions = mappings.Select(x => new OptionModel<string, string>(x.Id, x.MacAddress)).ToList();
            //referenceData.Add("clientMachineId", machineidOptions);


            return await Task.FromResult((licenseMasterData, referenceData));
        }

        public async Task<bool> ResendLicense(string licenseId)
        {
            var licenseDetail = await _licenseRequestRepository.GetAsync(licenseId);
            if (licenseDetail != null)
            {
                var client = await _customerMasterRepository.GetAsync(licenseDetail.CustomerId);
                var distributorDetail = await _distributorRepository.GetAsync(client.DistributorId);
                var licenseBytes = _licenseGenerator.GenerateLicense(
                       client.CustomerName, licenseDetail.LicenseType,
                       "", licenseDetail.StartDate,
                       licenseDetail.ExpiryDate, licenseDetail.MacAddress,
                       client.PrivateKeyPem, licenseDetail.NoOfUsers,
                       licenseDetail.TrialDurationDays, licenseDetail.NoOfChannel);
                EmailTemplate licenseTemplate = await _EmailTemplateService.GetEmailTemplateByTitle("Generate License");

                var isTrial = licenseDetail.LicenseType.Equals("trial", StringComparison.OrdinalIgnoreCase);
                var emailBody = licenseTemplate.EmailTemplateHtml
                                .Replace("[Distributor Name]", distributorDetail?.DistributorName ?? "")
                                .Replace("[Trial / Permanent]", licenseDetail.LicenseType)
                                .Replace("[Customer Name]", client?.CustomerName ?? "")
                                .Replace("[Start Date]", licenseDetail.StartDate.ToString("dd-MMM-yyyy"))
                                //.Replace("[Expiry Date]", licenseRequest.LicenseType.Equals("trial", StringComparison.OrdinalIgnoreCase) ? licenseRequestObject.ExpiryDate.ToString("dd-MMM-yyyy") : "Permanent")
                                .Replace("[Expiry Date]", isTrial ? $"<li><strong>License Expiry Date:</strong> {licenseDetail.ExpiryDate:dd-MMM-yyyy}</li>" : "")

                                .Replace("[No. of Users]", licenseDetail.NoOfUsers.ToString())
                                .Replace("[No of Cameras]", licenseDetail.NoOfChannel.ToString())
                                .Replace("[Site Name]", licenseDetail.SiteName.ToString());

                var emailSubject = licenseTemplate.EmailTemplateDescription
                               .Replace("[Trial / Permanent]", licenseDetail.LicenseType)
                               .Replace("[Customer Name]", client?.CustomerName ?? "");

                var publicKeyArray = Encoding.UTF8.GetBytes(client.PublicKeyPem);

                if (licenseTemplate != null)
                {
                    await _EmailSenderService.SendEmailAsync(
                        new string[] { distributorDetail.Email },
                        null,
                        null,
                        emailSubject,
                        emailBody,
                        new List<(string, byte[])> { ("License.lic", licenseBytes), ("publickey.pem", publicKeyArray) }
                    );
                }

               
                return true;

            }
            return false;
        }

        public async Task<(byte[] licenseFileData, string errorMessage)> DownloadLicense(string licenseRequestId)
        {
            var licenseDetail = await _licenseRequestRepository.GetAsync(licenseRequestId);
            var clientDetail = await _customerMasterRepository.GetAsync(licenseDetail.CustomerId);
            if (licenseDetail != null && clientDetail != null)
            {


                var licenseBytes = _licenseGenerator.GenerateLicense(
                       clientDetail.CustomerName, licenseDetail.LicenseType, "", licenseDetail.StartDate, licenseDetail.ExpiryDate,
                       licenseDetail.MacAddress, clientDetail.PrivateKeyPem, licenseDetail.NoOfUsers, licenseDetail.TrialDurationDays, licenseDetail.NoOfChannel);
                return (licenseBytes, null);
            }
            else
            {
                return (null, "License request not found");
            }
        }

        public async Task<(byte[] publicFileData, string errorMessage)> DownloadPublicKeyData(string licenseRequestId)
        {
            var licenseDetail = await _licenseRequestRepository.GetAsync(licenseRequestId);
            var clientDetail = await _customerMasterRepository.GetAsync(licenseDetail.CustomerId);
            if (licenseDetail != null && clientDetail != null)
            {
                var publicKeyArray = Encoding.UTF8.GetBytes(clientDetail.PublicKeyPem);
                return (publicKeyArray, null);
            }
            else
            {
                return (null, "License request not found");
            }
        }
    }
}
