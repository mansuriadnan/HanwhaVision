using DocumentFormat.OpenXml.Spreadsheet;
using DocumentFormat.OpenXml.Wordprocessing;
using HanwhaClient.Application.Interfaces;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Infrastructure.Repository;
using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.Dto;
using HanwhaClient.Model.Role;
using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Data;

namespace HanwhaClient.Application.Services
{
    public class MonitoringService : IMonitoringService
    {
        private readonly IMonitoringRepository _monitoringRepository;

        public MonitoringService(
            IMonitoringRepository monitoringRepository)
        {
            _monitoringRepository = monitoringRepository;
        }

        public async Task<string> AddUpdateMonitoringAsync(MonitoringRequestModel model, string userId)
        {
            // Check if the monitoring name already exists (excluding current ID for update case)
            bool isExists = await _monitoringRepository.IsMonitoringNameExistAsync(model.MonitoringName, model.MonitoringId);

            if (isExists)
            {
                return "Monitoring already exists.";
            }

            if (string.IsNullOrEmpty(model.MonitoringId))
            {
                // Create new Monitoring
                var newMonitoring = new Monitoring
                {
                    MonitoringName = model.MonitoringName,
                    CreatedOn = DateTime.UtcNow,
                    CreatedBy = userId,
                    UpdatedOn = DateTime.UtcNow,
                    UpdatedBy = userId
                };

                var insertedId = await _monitoringRepository.InsertAsync(newMonitoring);
                return insertedId;
            }
            else
            {
                // Update existing Monitoring's name
                var existingMonitoring = await _monitoringRepository.GetAsync(model.MonitoringId);
                if (existingMonitoring == null)
                {
                    return "Monitoring not found.";
                }

                existingMonitoring.MonitoringName = model.MonitoringName;
                existingMonitoring.UpdatedBy = userId;
                existingMonitoring.UpdatedOn = DateTime.UtcNow;

                await _monitoringRepository.UpdateAsync(existingMonitoring);
                return "Monitoring updated successfully.";
            }
        }


        public async Task<string> AddUpdateMonitoringGroupAsync(MonitoringGroupRequest model, string userId)
        {
            if (string.IsNullOrEmpty(model.MonitoringId))
                return "MonitoringId is required.";

            var monitoring = await _monitoringRepository.GetAsync(model.MonitoringId);
            if (monitoring == null)
                return "Monitoring not found.";

            var existingGroup = monitoring.MonitoringGroup?.FirstOrDefault(g => g.GroupId == model.GroupId);

            if (existingGroup == null)
            {
                // Adding a new group
                var newGroup = new MonitoringGroup
                {
                    GroupId = ObjectId.GenerateNewId().ToString(),
                    GroupName = model.GroupName,
                    GroupItem = new List<GroupItem>(),
                };

                monitoring.MonitoringGroup ??= new List<MonitoringGroup>();
                monitoring.MonitoringGroup.Add(newGroup);
            }
            else
            {
                // Updating an existing group
                existingGroup.GroupName = model.GroupName;
            }

            await _monitoringRepository.UpdateAsync(monitoring);

            return "Success";
        }
        public async Task<string> AddUpdateMonitoringGroupItemAsync(MonitoringGroupItemRequest model, string userId)
        {

            var GroupItemIdNew = "";
            if (string.IsNullOrEmpty(model.MonitoringId))
                return "MonitoringId is required.";

            if (string.IsNullOrEmpty(model.GroupId))
                return "GroupId is required.";

            var monitoring = await _monitoringRepository.GetAsync(model.MonitoringId);
            if (monitoring == null)
                return "Monitoring not found.";

            var existingGroup = monitoring.MonitoringGroup?.FirstOrDefault(g => g.GroupId == model.GroupId);

            if (existingGroup == null)
                return "Group not found.";

            var existingGroupItem = existingGroup.GroupItem?.FirstOrDefault(g => g.GroupItemId == model.GroupItemId);
            if (existingGroupItem == null)
            {
                // Adding a new group
                var newGroup = new GroupItem
                {
                    GroupItemId = ObjectId.GenerateNewId().ToString(),
                    Name = model.Name,
                    Url = model.Url,
                    Location = model.Location,
                };
                GroupItemIdNew = newGroup.GroupItemId;
                existingGroup.GroupItem.Add(newGroup);
                //return newGroup.GroupItemId;
            }
            else
            {
                // Updating an existing group
                existingGroupItem.Name = model.Name;
                existingGroupItem.Url = model.Url;
                existingGroupItem.Location = model.Location;
            }

            await _monitoringRepository.UpdateAsync(monitoring);
            return GroupItemIdNew;
            //return "Success";
        }

        public async Task<string> DeleteMonitoringGroupAsync(string monitoringId, string groupId)
        {
            if (string.IsNullOrEmpty(monitoringId) || string.IsNullOrEmpty(groupId))
                return "MonitoringId and GroupId are required.";

            var monitoring = await _monitoringRepository.GetAsync(monitoringId);
            if (monitoring == null)
                return "Monitoring not found.";

            var groupToRemove = monitoring.MonitoringGroup?.FirstOrDefault(g => g.GroupId == groupId);
            if (groupToRemove == null)
                return "Group not found.";

            monitoring.MonitoringGroup.Remove(groupToRemove);

            await _monitoringRepository.UpdateAsync(monitoring);

            return "Group deleted successfully.";
        }

        public async Task<bool> DeleteMonitoringAsync(string monitoringId, string userId)
        {
            var result = await _monitoringRepository.SoftDeleteAsync(monitoringId, userId);
            return result;
        }

        public async Task<string> DeleteMonitoringGroupItemAsync(string monitoringId, string groupId, string monitoringGroupItemId)
        {
            if (string.IsNullOrEmpty(monitoringId) || string.IsNullOrEmpty(groupId))
                return "MonitoringId and GroupId are required.";

            var monitoring = await _monitoringRepository.GetAsync(monitoringId);
            if (monitoring == null)
                return "Monitoring not found.";

            var groupCheck = monitoring.MonitoringGroup?.FirstOrDefault(g => g.GroupId == groupId);
            if (groupCheck == null)
                return "Group not found.";

            var groupToRemove = groupCheck.GroupItem?.FirstOrDefault(g => g.GroupItemId == monitoringGroupItemId);
            if (groupCheck == null)
                return "Group Item not found.";

            groupCheck.GroupItem.Remove(groupToRemove);

            await _monitoringRepository.UpdateAsync(monitoring);

            return "Group Item deleted successfully.";
        }

        public async Task<IEnumerable<MonitoringResponseModel>> GetMonitoringAsync()
        {
            ProjectionDefinition<Monitoring> projection = Builders<Monitoring>.Projection
           .Include("monitoringName")
           .Include("_id");
            var monitoringData = await _monitoringRepository.GetAllAsync(projection);
            var data = monitoringData.Select(r => new MonitoringResponseModel
            {
                Id = r.Id,
                MonitoringName = r.MonitoringName,
            });

            return await Task.FromResult(data);
        }

        public async Task<IEnumerable<MonitoringGroupWithItemsResponse>> GetAllMonitoringGroupsAsync(string monitoringId)
        {
            if (string.IsNullOrEmpty(monitoringId))
                return new List<MonitoringGroupWithItemsResponse>();

            var monitoring = await _monitoringRepository.GetAsync(monitoringId);
            if (monitoring == null || monitoring.MonitoringGroup == null)
                return new List<MonitoringGroupWithItemsResponse>();

            var result = monitoring.MonitoringGroup.Select(group => new MonitoringGroupWithItemsResponse
            {
                GroupId = group.GroupId,
                GroupName = group.GroupName,
                GroupItems = group.GroupItem?.Select(item => new GroupItemResponse
                {
                    GroupItemId = item.GroupItemId,
                    Name = item.Name,
                    Url = item.Url,
                    Location = item.Location
                }).ToList() ?? new List<GroupItemResponse>()
            }).ToList();

            return result;
        }
    }
}
