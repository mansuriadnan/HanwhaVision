using HanwhaClient.Model.DbEntities;
using MongoDB.Bson.Serialization.Attributes;

namespace HanwhaClient.Model.Role
{
    public class DataAccessPermissionResponseModel
    {
        public string FloorId { get; set; }
        public string FloorPlanName { get; set; }
        public bool AccessAllowed { get; set; }
        public IEnumerable<ZoneResponseModel> Zones { get; set; }
        public class ZoneResponseModel
        {
            public string ZoneId { get; set; }
            public string ZoneName { get; set; }
            public bool AccessAllowed { get; set; }
        }
    }

    public class SaveFloorRoleMappingRequest
    {
        public string RoleId { get; set; }
        public IEnumerable<FloorDataAccessPermission> DataAccessPermissions { get; set; } = [];

    }

    public class WidgetAccessPermissionResponse
    {
        public string Id { get; set; }
        public string CategoryName { get; set; }
        public bool AccessAllowed { get; set; }
        public IEnumerable<WidgetItem> Widgets { get; set; } = [];
        public class WidgetItem
        {
            public string WidgetId { get; set; }
            public string WidgetName { get; set; }
            public bool AccessAllowed { get; set; }
        }
    }

    public class SaveWidgetAccessPermissionRequest
    {
        public string RoleId { get; set; }
        public IEnumerable<WidgetAccessPermission> WidgetAccessPermissions { get; set; } = [];
    }
}
