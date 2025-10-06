using DocumentFormat.OpenXml.Spreadsheet;
using HanwhaClient.Application.Interfaces;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Infrastructure.Repository;
using HanwhaClient.Model.Common.ReferenceData;
using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.License;
using MongoDB.Driver;

namespace HanwhaClient.Application.Services
{
    public class LicenseHistoryService : ILicenseHistoryService
    {
        private readonly IPermissionService _permissionService;
        private readonly ILicenseHistoryRepository _licenseHistoryRepository;
        private readonly IUsersRepository _usersRepository;

        public LicenseHistoryService(IPermissionService permissionService,
            ILicenseHistoryRepository licenseHistoryRepository,
            IUsersRepository usersRepository = null)
        {
            this._permissionService = permissionService;
            this._licenseHistoryRepository = licenseHistoryRepository;
            _usersRepository = usersRepository;
        }

        public async Task<string> SaveLicenseHistoryAsync(string userId)
        {
            LicenseDataModel licenseData = _permissionService._licenseData;
            var licenseHistory = new LicenseHistory
            {
                NumberOfUsers = licenseData.NumberOfUsers,
                ExpiryDate = licenseData.ExpiryDate,
                LicenseType = licenseData.LicenseType,
                MacAddress = licenseData.HardwareId,
                NoOfChannel = licenseData.NumberOfCameras,
                StartDate = licenseData.StartDate,
                CreatedBy = userId,
                CreatedOn = DateTime.UtcNow,
                UpdatedBy = userId,
                UpdatedOn = DateTime.UtcNow
            };
            var result = await _licenseHistoryRepository.InsertAsync(licenseHistory);
            return result;
        }

        public async Task<(IEnumerable<LicenseHistory> data, Dictionary<string, object> referenceData)> GetLicenseHistoryAsync()
        {
            var licenseHistories = await _licenseHistoryRepository.GetAllAsync();
            Dictionary<string, object> referenceData = new();
            var CreatedByIds = licenseHistories.Select(x => x.CreatedBy).Distinct().ToList();
            var createByReferenceData = await GetLicenseHistoryReferenceDataAsync(CreatedByIds);
            referenceData.Add("createdBy", createByReferenceData);
            return await Task.FromResult((licenseHistories.OrderByDescending(x => x.CreatedOn), referenceData));
        }

        public async Task<List<OptionModel<string, string>>> GetLicenseHistoryReferenceDataAsync(IEnumerable<string> ids)
        {
            var options = new List<OptionModel<string, string>>();
            ProjectionDefinition<UserMaster> projection = Builders<UserMaster>.Projection
            .Include("Username")
            .Include("_id");
            var users = await _usersRepository.GetManyAsync(ids, projection);
            options = users.Select(x => new OptionModel<string, string>(x.Id, x.Username)).ToList();
            return options;
        }
    }
}
