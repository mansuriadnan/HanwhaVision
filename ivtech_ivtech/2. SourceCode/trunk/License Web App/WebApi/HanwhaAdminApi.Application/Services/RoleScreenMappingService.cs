using HanwhaAdminApi.Application.Interfaces;
using HanwhaAdminApi.Infrastructure.Interfaces;
using HanwhaAdminApi.Model.Common.ReferenceData;
using HanwhaAdminApi.Model.DbEntities;
using HanwhaAdminApi.Model.Dto.Role;

namespace HanwhaAdminApi.Application.Services
{
    public class RoleScreenMappingService : IRoleScreenMappingService
    {
        private readonly IRoleScreenMappingRepository _roleScreenMappingRepository;
        private readonly IScreenMasterRepository _screenMasterRepository;
        private readonly IRolePermissionHistoryRepository _rolePermissionHistoryRepository;

        public RoleScreenMappingService(IRoleScreenMappingRepository _roleScreenMappingrepository,
            IScreenMasterRepository screenMasterRepository,
            IRolePermissionHistoryRepository rolePermissionHistoryRepository)
        {
            this._roleScreenMappingRepository = _roleScreenMappingrepository;
            this._screenMasterRepository = screenMasterRepository;
            this._rolePermissionHistoryRepository = rolePermissionHistoryRepository;
        }

        public async Task<IEnumerable<RoleScreenMapping>> GetRoleScreenMappings()
        {
            var data = await _roleScreenMappingRepository.GetAllAsync();
            return data;
        }

        public async Task<(IEnumerable<ScreenMaster> data, Dictionary<string, object> referenceData)> GetRoleScreenMappingsByRoleIdAsync(string roleId)
        {
            // Validate roleId if necessary (e.g., ensure it's not null or empty)
            if (string.IsNullOrEmpty(roleId))
                throw new ArgumentException("Role_Id cannot be null or empty.");

            var screens = await _screenMasterRepository.GetAllAsync();
            screens = screens.OrderBy(screen => screen.SequenceNo).ToList();

            Dictionary<string, object> referenceData = new();
            var options = new List<OptionModel<string, bool>>();
            var mappings = await _roleScreenMappingRepository.GetRoleScreenMappingAsync(roleId);
            if (mappings != null)
            {
                options = mappings.ScreenMappings.Select(x => new OptionModel<string, bool>(x.ScreenId, x.AccessAllowed)).ToList();
            }
            referenceData.Add("screensMapping", options);
            return (screens, referenceData);
        }

        public async Task<string> AddUpdateRoleScreenMapping(List<RoleScreenMappingRequestDto> roleScreenMappings, string userId)
        {
            var roleId = roleScreenMappings.FirstOrDefault()?.roleId;
            if (string.IsNullOrEmpty(roleId)) return null;

            var mappingData = roleScreenMappings.Select(x => new ScreenMapping { ScreenId = x.Id, AccessAllowed = x.AccessAllowed });

            var updateCount = await _roleScreenMappingRepository.SaveRoleScreenMappingAsync(roleId, mappingData, userId);

            if (updateCount > 0)
            {
                await InsertRolePermissionHistory(roleId, "Update", mappingData, userId);
                return roleId;
            }

            var newRecordId = await InsertNewRoleScreenMapping(roleId, mappingData, userId);

            return newRecordId ?? roleScreenMappings.FirstOrDefault()?.Id;
        }

        // Extracted helper method for inserting new RoleScreenMapping
        private async Task<string> InsertNewRoleScreenMapping(string roleId, IEnumerable<ScreenMapping> mappingData, string userId)
        {
            var newRecord = new RoleScreenMapping
            {
                RoleId = roleId,
                ScreenMappings = mappingData,
                CreatedOn = DateTime.Now,
                CreatedBy = userId,
                UpdatedOn = DateTime.Now,
                UpdatedBy = userId,
            };

            var newRecordId = await _roleScreenMappingRepository.InsertAsync(newRecord);

            if (!string.IsNullOrEmpty(newRecordId))
            {
                await InsertRolePermissionHistory(roleId, "Insert", mappingData, userId);
            }

            return newRecordId;
        }

        // Extracted helper method for inserting RolePermissionHistory
        private async Task InsertRolePermissionHistory(string roleId, string action, IEnumerable<ScreenMapping> mappingData, string userId)
        {
            var historyRecord = new RolePermissionHistory
            {
                RoleId = roleId,
                Action = action,
                ScreenMappings = mappingData,
                CreatedOn = DateTime.Now,
                CreatedBy = userId,
                UpdatedOn = DateTime.Now,
                UpdatedBy = userId,
            };

            await _rolePermissionHistoryRepository.InsertAsync(historyRecord);
        }

    }
}
