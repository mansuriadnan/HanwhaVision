using DocumentFormat.OpenXml.Spreadsheet;
using HanwhaClient.Application.Interfaces;
using HanwhaClient.Infrastructure.Interfaces;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.Common.ReferenceData;
using HanwhaClient.Model.DbEntities;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Linq;

namespace HanwhaClient.Application.Services
{
    public class AuditLogService : IAuditLogService
    {
        private readonly IAuditLogRepository _auditLogRepository;
        private readonly IUsersRepository _userMasterRepository;
        private readonly IRoleRepository _roleRepository;
        private readonly IScreenMasterRepository _screenMasterRepository;

        public AuditLogService(IAuditLogRepository auditLogRepository, IUsersRepository userMasterRepository, IRoleRepository roleRepository
            , IScreenMasterRepository screenMasterRepository)
        {
            this._auditLogRepository = auditLogRepository;
            _userMasterRepository = userMasterRepository;
            _roleRepository = roleRepository;
            _screenMasterRepository = screenMasterRepository;
        }

        public async Task<(AuditLogResponse auditLogDetail, Dictionary<string, object> referenceData)> GetAuditLogDetail(AuditLogRequest auditLogRequest)
        {
            var data = await _auditLogRepository.GetAuditLogDetailByFilter(auditLogRequest);
            AuditLogResponse auditLogResponse = new AuditLogResponse();
            auditLogResponse.AuditLogDetails = data.auditLog.Select(x => new AuditLogDetail
            {
                Id = x.Id,
                CollectionName = x.CollectionName,
                OperationType = x.OperationType,
                RemovedFields = x.RemovedFields,
                DocumentKey = x.DocumentKey != null ? x.DocumentKey["_id"].ToString() : "",
                OperationData = x.FullDocument != null ? x.FullDocument.ToJson() : x.UpdateDescription?.ToJson(),
            }
            ).ToList();
            auditLogResponse.TotalCount = data.totalCount;

            List<BsonDocument> OperationData = data.auditLog.Select(x => x.FullDocument != null ? x.FullDocument : x.UpdateDescription).ToList();
            Dictionary<string, object> referenceData = new();
            if (auditLogRequest.CollectioName == AppDBConstants.UserMaster)
            {
                var createdByIds = OperationData.Where(x => x != null && x.Contains("createdBy") && !x["createdBy"].IsBsonNull).Select(x => x["createdBy"].ToString()).ToList();
                var updatedByIds = OperationData.Where(x => x != null && x.Contains("updatedBy") && !x["updatedBy"].IsBsonNull).Select(x => x["updatedBy"].ToString()).ToList();
                var roleIds = OperationData.Where(x => x != null && x.Contains("roleIds") && !x["roleIds"].IsBsonNull).SelectMany(x => x["roleIds"].AsBsonArray.Select(r => r.ToString())).ToList();
                referenceData.Add("createdBy", await GetUserMasterReferenceData(createdByIds));
                referenceData.Add("updatedBy", await GetUserMasterReferenceData(updatedByIds));
                referenceData.Add("roleIds", await GetRoleMasterReferenceData(roleIds));
            }
            else if (auditLogRequest.CollectioName == AppDBConstants.RoleMaster)
            {
                var createdByIds = OperationData.Where(x => x != null && x.Contains("createdBy") && !x["createdBy"].IsBsonNull).Select(x => x["createdBy"].ToString()).ToList();
                var updatedByIds = OperationData.Where(x => x != null && x.Contains("updatedBy") && !x["updatedBy"].IsBsonNull).Select(x => x["updatedBy"].ToString()).ToList();
                referenceData.Add("createdBy", await GetUserMasterReferenceData(createdByIds));
                referenceData.Add("updatedBy", await GetUserMasterReferenceData(updatedByIds));
            }
            else if(auditLogRequest.CollectioName == AppDBConstants.RoleScreenMapping)
            {
                var createdByIds = OperationData.Where(x => x != null && x.Contains("createdBy") && !x["createdBy"].IsBsonNull).Select(x => x["createdBy"].ToString()).ToList();
                var updatedByIds = OperationData.Where(x => x != null && x.Contains("updatedBy") && !x["updatedBy"].IsBsonNull).Select(x => x["updatedBy"].ToString()).ToList();
                var screenIds = OperationData.Where(x => x != null && x.Contains("screenMappings") && !x["screenMappings"].IsBsonNull ).SelectMany(x => x["screenMappings"].AsBsonArray.Select(y => y["screenId"].ToString())).ToList();
                referenceData.Add("createdBy", await GetUserMasterReferenceData(createdByIds));
                referenceData.Add("updatedBy", await GetUserMasterReferenceData(updatedByIds));
                referenceData.Add("screenIds", await GetScrennMasterReferenceData(screenIds));
            }
            return (auditLogResponse, referenceData);
        }

        public async Task<List<string>> GetAuditLogCollectionName()
        {
            return await _auditLogRepository.GetAuditLogCollectionName();
        }

        private async Task<List<OptionModel<string, string>>> GetUserMasterReferenceData(IEnumerable<string> ids)
        {
            var options = new List<OptionModel<string, string>>();
            ProjectionDefinition<UserMaster> projection = Builders<UserMaster>.Projection
            .Include("username")
            .Include("_id");
            
            var users = await _userMasterRepository.GetManyAsync(ids, projection);
            options = users.Select(x => new OptionModel<string, string>(x.Id, x.Username)).ToList();
            return options;
        }
        private async Task<List<OptionModel<string, string>>> GetRoleMasterReferenceData(IEnumerable<string> ids)
        {
            var options = new List<OptionModel<string, string>>();
            ProjectionDefinition<RoleMaster> projection = Builders<RoleMaster>.Projection
            .Include("_id")
            .Include("roleName");
            var roles = await _roleRepository.GetManyAsync(ids);
            options = roles.Select(x => new OptionModel<string, string>(x.Id, x.RoleName)).ToList();
            return options;
        }
        private async Task<List<OptionModel<string, string>>> GetScrennMasterReferenceData(IEnumerable<string> ids)
        {
            var options = new List<OptionModel<string, string>>();
            ProjectionDefinition<ScreenMaster> projection = Builders<ScreenMaster>.Projection
            .Include("screen_name")
            .Include("_id");

            var users = await _screenMasterRepository.GetManyAsync(ids, projection);
            options = users.Select(x => new OptionModel<string, string>(x.Id, x.ScreenName)).ToList();
            return options;
        }
    }
}
