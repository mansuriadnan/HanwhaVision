using AutoMapper;
using HanwhaAdminApi.Application.Interfaces;
using HanwhaAdminApi.Infrastructure.Interfaces;
using HanwhaAdminApi.Model.Common.ReferenceData;
using HanwhaAdminApi.Model.DbEntities;
using HanwhaAdminApi.Model.Dto;
using MongoDB.Driver;

namespace HanwhaAdminApi.Application.Services
{
    public class DistributorService : IDistributorService
    {

        private readonly IDistributorRepository _distributorRepository;
        private readonly ICustomerMasterRepository _customerMasterRepository;
        private readonly IRegionCountryRepository _regionCountryRepository;
        private readonly IUsersRepository _usersRepository;
        private readonly IUsersService _userService;

        private readonly IMapper _mapper;

        public DistributorService(IDistributorRepository distributorRepository, IMapper mapper, IRegionCountryRepository regionCountryRepository, IUsersRepository usersRepository
            , IUsersService userService, ICustomerMasterRepository customerMasterRepository)
        {
            this._distributorRepository = distributorRepository;
            this._mapper = mapper;
            this._regionCountryRepository = regionCountryRepository;
            this._usersRepository = usersRepository;
            _userService = userService;
            _customerMasterRepository = customerMasterRepository;
        }


        public async Task<(string Id, string ErrorMessage)> CreateDistributorAsync(DistributorRequestDto distributorRequest, string userId)
        {
            var isExist = await _distributorRepository.IsDistributorNameExistAsync(distributorRequest.DistributorName, distributorRequest.Id);
            if (isExist)
                return ("", $"Distributor name {distributorRequest.DistributorName} already exist.");

            isExist = await _distributorRepository.IsEmailAddressExistAsync(distributorRequest.Email, distributorRequest.Id);
            if (isExist)
                return ("", $"Email {distributorRequest.Email} already exist.");

            var distributor = _mapper.Map<DistributorMaster>(distributorRequest);

            if (string.IsNullOrEmpty(distributor.Id))
            {
                distributor.CreatedBy = userId;
                distributor.CreatedOn = DateTime.Now;
                distributor.UpdatedBy = userId;
                distributor.UpdatedOn = DateTime.Now;

                var data = await _distributorRepository.InsertAsync(distributor);

                return (data, "");
            }
            else
            {
                var update = Builders<DistributorMaster>.Update
                    .Set(c => c.DistributorName, distributor.DistributorName)
                    .Set(c => c.Address, distributor.Address)
                    .Set(c => c.ContactPerson, distributor.ContactPerson)
                    .Set(c => c.CountryId, distributor.CountryId)
                    .Set(c => c.Email, distributor.Email)
                    .Set(c => c.UpdatedOn, DateTime.Now)
                    .Set(c => c.UpdatedBy, userId)
                    .Set(c => c.IsDeleted, distributor.IsDeleted);

                await _distributorRepository.UpdateFieldsAsync(distributor.Id, update);
                return await Task.FromResult((distributor.Id, ""));
            }


        }


        //public async Task<(IEnumerable<DistributorMaster> data, Dictionary<string, object> referenceData)> GetAllDistributorAsync()
        //{
        //    var distributors = await _distributorRepository.GetAllAsync();

        //    Dictionary<string, object> referenceData = new();
        //    var options = new List<OptionModel<string, string>>();

        //    var countryIds = distributors.Where(x => x.CountryId != null).Select(x => x.CountryId).Distinct().ToList();
        //    var updatedByIds = distributors.Where(x => x.UpdatedBy != null).Select(x => x.UpdatedBy).Distinct().ToList();
        //    var createdByIds = distributors.Where(x => x.CreatedBy != null).Select(x => x.CreatedBy).Distinct().ToList();

        //    var mappings = await _regionCountryRepository.GetManyAsync(countryIds);

        //    options = mappings.Select(x => new OptionModel<string, string>(x.Id, x.Name)).ToList();
        //    referenceData.Add("updatedBy", _userService.GetUserMasterReferenceDataAsync(updatedByIds));
        //    referenceData.Add("createdBy", _userService.GetUserMasterReferenceDataAsync(createdByIds));
        //    referenceData.Add("countryId", options);

        //    return (distributors, referenceData);
        //}

        public async Task<(IEnumerable<DistributorMaster> data, Dictionary<string, object> referenceData)> GetAllDistributorAsync()
        {
            var distributors = await _distributorRepository.GetAllAsync();

            Dictionary<string, object> referenceData = new();
            var options = new List<OptionModel<string, string>>();

            var countryIds = distributors.Where(x => x.CountryId != null).Select(x => x.CountryId).Distinct().ToList();
            var updatedByIds = distributors.Where(x => x.UpdatedBy != null).Select(x => x.UpdatedBy).Distinct().ToList();
            var createdByIds = distributors.Where(x => x.CreatedBy != null).Select(x => x.CreatedBy).Distinct().ToList();

            var optionUpdatedByIds = _userService.GetUserMasterReferenceDataAsync(updatedByIds);
            var optionCreatedByIds = _userService.GetUserMasterReferenceDataAsync(createdByIds);

            var mappings = await _regionCountryRepository.GetManyAsync(countryIds);

            options = mappings.Select(x => new OptionModel<string, string>(x.Id, x.Name)).ToList();
            referenceData.Add("updatedBy", optionUpdatedByIds.Result);
            referenceData.Add("createdBy", optionCreatedByIds.Result);
            referenceData.Add("countryId", options);

            return (distributors, referenceData);
        }

        public async Task<bool> DeleteDistributorAsync(string id, string userId)
        {
            var isExits = await _customerMasterRepository.IsDistributorExistAsync(id);
            if (!isExits)
            {
                var getDistributor = _distributorRepository.GetAsync(id);
                if (getDistributor != null)
                {
                    bool Isdeleted = await _distributorRepository.SoftDeleteAsync(id, userId);
                    return Isdeleted;
                } 
            }
            return false;
        }

        public async Task<List<OptionModel<string, string>>> GetDistributorReferenceDataAsync(IEnumerable<string> ids)
        {
            var options = new List<OptionModel<string, string>>();
            ProjectionDefinition<DistributorMaster> projection = Builders<DistributorMaster>.Projection
            .Include("distributorName")
            .Include("_id");
            var users = await _distributorRepository.GetManyAsync(ids, projection);
            options = users.Select(x => new OptionModel<string, string>(x.Id, x.DistributorName)).ToList();
            return options;
        }

        public async Task<List<OptionModel<string, string>>> GetDistributorEmailReferenceDataAsync(IEnumerable<string> ids)
        {
            var options = new List<OptionModel<string, string>>();
            ProjectionDefinition<DistributorMaster> projection = Builders<DistributorMaster>.Projection
            .Include("email")
            .Include("_id");
            var users = await _distributorRepository.GetManyAsync(ids, projection);
            options = users.Select(x => new OptionModel<string, string>(x.Id, x.Email)).ToList();
            return options;
        }
    }
}
