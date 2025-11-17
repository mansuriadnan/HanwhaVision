using AutoMapper;
using HanwhaClient.Application.Interfaces;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.Common.ReferenceData;
using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.Dto;
using MongoDB.Bson;
using MongoDB.Driver;

namespace HanwhaClient.Application.Services
{
    public class SiteService : ISiteService
    {
        private readonly ISiteRepository _siteRepository;
        private readonly IUsersRepository _usersRepository;
        private readonly IMapper _mapper;
        private readonly IReportService _reportService;

        public SiteService(ISiteRepository siteRepository, IMapper mapper, IUsersRepository usersRepository, IReportService reportService)
        {
            _siteRepository = siteRepository;
            _mapper = mapper;
            _usersRepository = usersRepository;
            _reportService = reportService;
        }

        public async Task<(IEnumerable<SiteDto> data, Dictionary<string, object> referenceData)> GetAllSitesAsync()
        {
            var resultSiteMaster = await _siteRepository.GetAllAsync();
            Dictionary<string, object> referenceData = new();

            var createdByIds = resultSiteMaster.Select(x => x.CreatedBy).Distinct().ToList();
            var createdByReferenceData = await GetUserMasterReferenceDataAsync(createdByIds);
            referenceData.Add("createdBy", createdByReferenceData);

            var updatedByIds = resultSiteMaster.Select(x => x.UpdatedBy).Distinct().ToList();
            var updatedByReferenceData = await GetUserMasterReferenceDataAsync(updatedByIds);
            referenceData.Add("updatedBy", updatedByReferenceData);

            // Map SiteMaster to SiteDto
            var mappedSites = _mapper.Map<IEnumerable<SiteDto>>(resultSiteMaster);

            return (mappedSites, referenceData);
        }

        public async Task<(string data, string errorMessage)> AddOrUpdateSiteAsync(SiteChileRequestDto siteChileRequestDto, string userId)
        {
            var apiBaseUrl = siteChileRequestDto.HostingAddress;
            var username = siteChileRequestDto.Username;
            var password = siteChileRequestDto.Password;

            using var httpClient = new HttpClient();
            httpClient.BaseAddress = new Uri(apiBaseUrl);

            try
            {
                var loginResponse = await _reportService.GetAuthToken(httpClient, username, password);
                if (loginResponse != null && loginResponse.IsSuccess == false)
                {
                    return ("", AppMessageConstants.CredetialWrongAddDevice);
                }
            }
            catch (Exception ex)
            {
                return ("", AppMessageConstants.SiteUnavailable);
            }


            if (string.IsNullOrEmpty(siteChileRequestDto.Id))
            {
                // Adding a new main site
                SiteMaster objSite = new SiteMaster
                {
                    SiteName = siteChileRequestDto.SiteName,
                    HostingAddress = siteChileRequestDto.HostingAddress,
                    Username = siteChileRequestDto.Username,
                    Password = siteChileRequestDto.Password,
                    CreatedBy = userId,
                    CreatedOn = DateTime.UtcNow,
                    UpdatedBy = userId,
                    UpdatedOn = DateTime.UtcNow,
                    ChildSites = new List<ChildSite>()
                };
                await _siteRepository.InsertAsync(objSite);


                // Write Hosting Address to File
                SaveHostingAddressToFile(siteChileRequestDto.HostingAddress);

                return (objSite.Id, AppMessageConstants.RecordAdded);
            }
            else
            {
                // Updating existing site details (excluding child sites)
                var updateDefinition = Builders<SiteMaster>.Update
                    .Set(c => c.SiteName, siteChileRequestDto.SiteName)
                    .Set(c => c.HostingAddress, siteChileRequestDto.HostingAddress)
                    .Set(c => c.Username, siteChileRequestDto.Username)
                    .Set(c => c.Password, siteChileRequestDto.Password)
                    .Set(c => c.UpdatedBy, userId)
                    .Set(c => c.UpdatedOn, DateTime.UtcNow);

                await _siteRepository.UpdateFieldsAsync(siteChileRequestDto.Id, updateDefinition);
                return (siteChileRequestDto.Id, AppMessageConstants.RecordUpdated);
            }
        }

        private void SaveHostingAddressToFile(string hostingAddress)
        {
            string filePath = Path.Combine(Directory.GetCurrentDirectory(), "hostingAddress.txt");

            // Append the hosting address to the file
            File.AppendAllText(filePath, hostingAddress + Environment.NewLine);
        }
        // Method to Add or Update a Single Child Site
        public async Task<(string data, string errorMessage)> AddOrUpdateChildSiteAsync(ChildSiteDto childSiteDto, string userId)
        {
            if (childSiteDto == null)
                throw new Exception("Child Site not found");
            var parentSite = await _siteRepository.GetAsync(childSiteDto.parentSiteId);
            if (parentSite == null)
                throw new Exception("Parent site not found");


            var apiBaseUrl = childSiteDto.HostingAddress;
            var username = childSiteDto.Username;
            var password = childSiteDto.Password;

            using var httpClient = new HttpClient();
            httpClient.BaseAddress = new Uri(apiBaseUrl);

            try
            {
                var loginResponse = await _reportService.GetAuthToken(httpClient, username, password);
                if(loginResponse != null && loginResponse.IsSuccess == false)
                {
                    return ("", AppMessageConstants.CredetialWrongAddDevice);
                }
            }
            catch (Exception ex)
            {
                return ("", AppMessageConstants.SiteUnavailable);
            }

            if (string.IsNullOrEmpty(childSiteDto.Id))
            {
                // Adding a new child site
                var newChildSite = new ChildSite
                {
                    Id = ObjectId.GenerateNewId().ToString(),
                    SiteName = childSiteDto.SiteName,
                    HostingAddress = childSiteDto.HostingAddress,
                    Username = childSiteDto.Username,
                    Password = childSiteDto.Password,
                    CreatedBy = userId,
                    CreatedOn = DateTime.UtcNow,
                    UpdatedBy = userId,
                    UpdatedOn = DateTime.UtcNow,
                };

                var addChildUpdate = Builders<SiteMaster>.Update.Push(c => c.ChildSites, newChildSite);
                await _siteRepository.UpdateFieldsAsync(childSiteDto.parentSiteId, addChildUpdate);
                return (newChildSite.Id, "");
            }
            else
            {
                // Updating an existing child site
                var childUpdate = Builders<SiteMaster>.Update
                    .Set("ChildSites.$[elem].siteName", childSiteDto.SiteName)
                    .Set("ChildSites.$[elem].hostingAddress", childSiteDto.HostingAddress)
                    .Set("ChildSites.$[elem].username", childSiteDto.Username)
                    .Set("ChildSites.$[elem].password", childSiteDto.Password)
                    .Set("ChildSites.$[elem].updatedOn", DateTime.UtcNow)
                    .Set("ChildSites.$[elem].updatedBy", userId);

                var updateResult = await _siteRepository.UpdateFieldsAsync(
                    childSiteDto.parentSiteId,
                    childUpdate,
                    new UpdateOptions
                    {
                        ArrayFilters = new[] { new BsonDocumentArrayFilterDefinition<BsonDocument>(
                    new BsonDocument("elem._id", new ObjectId(childSiteDto.Id))) }
                    });

                if (!updateResult)
                    return ("", AppMessageConstants.ChildSiteUnAvailable);

                return (childSiteDto.Id, "");
            }
        }

        public async Task<bool> DeleteChildSiteAsync(string id, string userId)
        {
            return await _siteRepository.SoftDeleteAsync(id, userId);
        }

        public async Task<bool> DeleteSubChildSiteAsync(string parentSiteId, string childSiteId, string userId)
        {
            var deleteChildUpdate = Builders<SiteMaster>.Update.PullFilter(c => c.ChildSites,
                                                                           child => child.Id == childSiteId);

            var updateResult = await _siteRepository.UpdateFieldsAsync(parentSiteId, deleteChildUpdate);

            return updateResult; // Returns true if modified, false if no changes
        }

        public async Task<List<OptionModel<string, string>>> GetUserMasterReferenceDataAsync(IEnumerable<string> ids)
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
