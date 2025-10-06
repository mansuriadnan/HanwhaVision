using AutoMapper;
using HanwhaAdminApi.Application.Interfaces;
using HanwhaAdminApi.Core.Services;
using HanwhaAdminApi.Core.Services.License;
using HanwhaAdminApi.Infrastructure.Interfaces;
using HanwhaAdminApi.Infrastructure.Repository;
using HanwhaAdminApi.Model.Common;
using HanwhaAdminApi.Model.DbEntities;
using HanwhaAdminApi.Model.Dto;
using MongoDB.Driver;
using System.Reflection.Metadata;


namespace HanwhaAdminApi.Application.Services
{
    public class CustomerMasterService : ICustomerMasterService
    {
        private readonly ICustomerMasterRepository _customerMasterRepository;
        private readonly IMapper _mapper;
        private readonly EmailSenderService _EmailSenderService;
        private readonly IEmailTemplateService _EmailTemplateService;
        private readonly ILicenseRequestRepository _licenseRequestRepository;
        private readonly IUsersRepository _usersRepository;
        private readonly IUsersService _usersService;
        private readonly IDistributorService _distributorService;


        public CustomerMasterService(ICustomerMasterRepository customerMasterRepository, IMapper mapper, EmailSenderService emailSenderService,
            IEmailTemplateService emailTemplateService, ILicenseRequestRepository licenseRequestRepository, IUsersRepository usersRepository,
            IUsersService usersService, IDistributorService distributorService)

        {
            this._customerMasterRepository = customerMasterRepository;
            this._mapper = mapper;
            _EmailSenderService = emailSenderService;
            _EmailTemplateService = emailTemplateService;
            _licenseRequestRepository = licenseRequestRepository;
            _usersRepository = usersRepository;
            _usersService = usersService;
            _distributorService = distributorService;
        }

        public async Task<IEnumerable<CustomerMaster>> GetAllUsersAsync()
        {   
            var users = await _customerMasterRepository.GetAllAsync();
            return await Task.FromResult(users);
        }
        public async Task<(string Id, string ErrorMessage)> SaveCustomerAsync(CustomerMaster customerRequest, string userId)
        {

            //var isExist = await customerMasterRepository.IsEmailnameExistAsync(customerRequest.EmailAddress, customerRequest.Id);
            //if (isExist)
            //    return ("", $"Email {customerRequest.EmailAddress} already exist.");

            //var user = mapper.Map<CustomerMaster>(customerRequest);

            var keys = GenerateRsaKeyPairs.Generate();

            var isExist = await _customerMasterRepository.IsEmailnameExistAsync(customerRequest.EmailAddress, customerRequest.Id);
            if (isExist)
                return ("", $"Email {customerRequest.EmailAddress} already exist.");

            var customerNameExist = await _customerMasterRepository.IsCustomerNameExistAsync(customerRequest.CustomerName, customerRequest.Id);
            if (customerNameExist)
                return ("", $"Customer Name {customerRequest.CustomerName} already exist.");
            if (string.IsNullOrEmpty(customerRequest.Id))
            {
                customerRequest.CustomerName = customerRequest.CustomerName;
                customerRequest.DistributorId = customerRequest.DistributorId;
                customerRequest.ContactPersonName = customerRequest.ContactPersonName;
                customerRequest.ContactPersonMobile = customerRequest.ContactPersonMobile;
                customerRequest.OfficePhone = customerRequest.OfficePhone;
                customerRequest.EmailAddress = customerRequest.EmailAddress;
                customerRequest.CountryId = customerRequest.CountryId;
                customerRequest.StateId = customerRequest.StateId == "" ? null : customerRequest.StateId;
                customerRequest.CityId = customerRequest.CityId == "" ? null : customerRequest.CityId;
                customerRequest.PostalCode = customerRequest.PostalCode;
                customerRequest.Address = customerRequest.Address;
                customerRequest.PublicKeyPem = keys.PublicKeyPem;
                customerRequest.PrivateKeyPem = keys.PrivateKeyPem;
                customerRequest.CustomerNo = await _customerMasterRepository.GetLatestCustomerIdAsync();
                customerRequest.CreatedOn = DateTime.Now;
                customerRequest.CreatedBy = userId;
                customerRequest.UpdatedOn = DateTime.Now;
                customerRequest.UpdatedBy = userId;

                var data = await _customerMasterRepository.InsertAsync(customerRequest);
                //CustomerCreatedEmailNotificationToCustomer(customerRequest.EmailAddress, keys.PublicKeyPem);
                return await Task.FromResult((data, AppMessageConstants.InsertSuccess));
            }
            else
            {
                var update = Builders<CustomerMaster>.Update
                            .Set(c => c.CustomerName, customerRequest.CustomerName)
                            .Set(c => c.DistributorId, customerRequest.DistributorId)
                            .Set(c => c.ContactPersonName, customerRequest.ContactPersonName)
                            .Set(c => c.ContactPersonMobile, customerRequest.ContactPersonMobile)
                            .Set(c => c.OfficePhone, customerRequest.OfficePhone)
                            .Set(c => c.EmailAddress, customerRequest.EmailAddress)
                            .Set(c => c.CountryId, customerRequest.CountryId)
                            .Set(c => c.StateId, customerRequest.StateId == "" ? null : customerRequest.StateId)
                            .Set(c => c.CityId, customerRequest.CityId == "" ? null : customerRequest.CityId)
                            .Set(c => c.PostalCode, customerRequest.PostalCode)
                            .Set(c => c.Address, customerRequest.Address)
                            .Set(c => c.PublicKeyPem, keys.PublicKeyPem)
                            .Set(c => c.PrivateKeyPem, keys.PrivateKeyPem)
                            .Set(c => c.UpdatedOn, DateTime.Now)
                            .Set(c => c.UpdatedBy, userId);
                await _customerMasterRepository.UpdateFieldsAsync(customerRequest.Id, update);
                //CustomerCreatedEmailNotificationToCustomer(customerRequest.EmailAddress);
                return await Task.FromResult((customerRequest.Id, AppMessageConstants.UpdateSuccess));
            }
        }
        public void CustomerCreatedEmailNotificationToCustomer(string EmailId, string PublicKey)
        {
            EmailTemplate welcomeEmailTemplate = _EmailTemplateService.GetEmailTemplateByTitle("Welcome Email").Result;

            if (welcomeEmailTemplate != null)
            {
                var re = _EmailSenderService.SendEmailAsync(new string[] { EmailId }, null, null, welcomeEmailTemplate.EmailTemplateDescription, welcomeEmailTemplate.EmailTemplateHtml, null);
            }

            EmailTemplate publicKeyEmailTemplate = _EmailTemplateService.GetEmailTemplateByTitle("Email public key").Result;
            if (publicKeyEmailTemplate != null)
            {

                string fileName = "PublicKey.txt";
                string fileContent = PublicKey;


                string filePath = Path.Combine(Directory.GetCurrentDirectory(), fileName);
                File.WriteAllText(filePath, fileContent);

                byte[] fileBytes = File.ReadAllBytes(filePath);

                IEnumerable<(string fileName, byte[] fileBytes)> files = new List<(string, byte[])>
            {
                (fileName, fileBytes)
            };

                var re1 = _EmailSenderService.SendEmailAsync(new string[] { EmailId }, null, null, publicKeyEmailTemplate.EmailTemplateDescription, publicKeyEmailTemplate.EmailTemplateHtml, files);
            }
        }
        public async Task<CustomerMaster> GetCustomerAsync(string id)
        {
            var data = await _customerMasterRepository.GetAsync(id);
            return await Task.FromResult(data);
        }
        public async Task<(IEnumerable<CustomerResponseDto> data, Dictionary<string, object> referenceData)> GetAllCustomerAsync()
        {
            //ProjectionDefinition<CustomerMaster> projection = Builders<CustomerMaster>.Projection
            //.Include("address")
            //.Include("contactPersonName")
            //.Include("contactPersonMobile")
            //.Include("emailAddress")
            //.Include("_id")
            //.Include("createdOn")
            //.Include("createdBy")
            //.Include("updatedOn")
            //.Include("updatedBy");

            //var customerMasterData = await _customerMasterRepository.GetAllAsync(projection);
            var customerMasterData = await _customerMasterRepository.GetAllAsync();
            Dictionary<string, object> referenceData = new();
            var updatedByIds = customerMasterData.Where(x => x.UpdatedBy != null).Select(x => x.UpdatedBy).Distinct().ToList();
            var createdByIds = customerMasterData.Where(x => x.CreatedBy != null).Select(x => x.CreatedBy).Distinct().ToList();
            var distributorIds = customerMasterData.Where(x => x.DistributorId != null).Select(x => x.DistributorId).Distinct().ToList();

            referenceData.Add("updatedBy", await _usersService.GetUserMasterReferenceDataAsync(updatedByIds));
            referenceData.Add("createdBy", await _usersService.GetUserMasterReferenceDataAsync(createdByIds));
            referenceData.Add("distributorId", await _distributorService.GetDistributorReferenceDataAsync(distributorIds));
            referenceData.Add("distributorIdEmail", await _distributorService.GetDistributorEmailReferenceDataAsync(distributorIds));

            var result = _mapper.Map<IEnumerable<CustomerResponseDto>>(customerMasterData);
            return (result, referenceData);

        }
        public async Task<bool> DeleteCustomerByIdAsync(string customerId, string userId)
        {
            var licenceDetail = await _licenseRequestRepository.GetLicenseByCustomerId(customerId);
            if (licenceDetail.Count() > 0 && licenceDetail.Where(x => x.LicenseType == "Permanent").Count() > 0)
            {
                return false;
            }
            else if (licenceDetail.Where(x => x.LicenseType.ToLower() == "trial").Count() > 0)
            {
                return false;
            }

            var dataCustomer = await _customerMasterRepository.GetAsync(customerId);

            if (dataCustomer != null)
            {
                var customerDetail = await _licenseRequestRepository.DeleteLicenseByCustomerId(customerId, userId);
                var data = await _customerMasterRepository.SoftDeleteAsync(customerId, userId);
                return await Task.FromResult(data);
            }
            return false;
        }
        public async Task<List<CustomerMaster>> GetTopCustomerDetail()
        {
            var licenceDetail = await _licenseRequestRepository.GetTopLicense();
            var customerIds = licenceDetail.Select(x => x.Id).ToList();
            var customerDetail = await _customerMasterRepository.GetManyAsync(customerIds);
            return (List<CustomerMaster>)customerDetail;
        }

        public async Task<DashboardOverview> GetDashboardOverviewDetails(DateTime? startDate, DateTime? endDate)
        {
            DashboardOverview dashboardOverview = new DashboardOverview();
            var licenceCount = await _licenseRequestRepository.GetLicenseCountForDashboard(startDate, endDate);
            var customerCount = await _customerMasterRepository.GetCustomerCountForDashboard(startDate, endDate);
            var userCount = await _usersRepository.GetUserCountForDashboard(startDate, endDate);
            dashboardOverview.TotalGeneratedLicenses = licenceCount["TotalLicense"];
            dashboardOverview.ActiveLicenses = licenceCount["ActiveLicense"];
            dashboardOverview.ExpiredLicenses = licenceCount["ExpiredLicense"];
            dashboardOverview.FutureLicenses = licenceCount["FutureLicense"];
            dashboardOverview.TotalCustomer = customerCount["TotalCustomers"];
            dashboardOverview.TotalActiveCustomer = customerCount["ActiveCustomers"];
            dashboardOverview.TotalUsers = userCount["TotalUser"];
            dashboardOverview.TotalActiveUsers = userCount["ActiveUser"];
            return dashboardOverview;
        }

        public async Task<List<LicenseDueDetail>> GetTopLicenseDueDetails()
        {
            var licenseDueDetails = await _licenseRequestRepository.GetTopDueLicense();
            var customerIds = licenseDueDetails.Select(x => x.Id).ToList(); //need to be discussed
            var customerDetail = await _customerMasterRepository.GetManyAsync(customerIds);
            List<LicenseDueDetail> data = licenseDueDetails.Select(x => new LicenseDueDetail
            {
                //CustomerName = customerDetail.Where(y => y.Id == x.Id).FirstOrDefault().CustomerName, //need to be discussed
                ExpiredOn = x.ExpiryDate,
                NoOfChannel = x.NoOfChannel,
                NoUser = x.NoOfUsers
            }).ToList();

            return data;
        }
    }
}
