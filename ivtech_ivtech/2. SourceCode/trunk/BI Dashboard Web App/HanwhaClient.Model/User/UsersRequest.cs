using HanwhaClient.Model.DbEntities;

namespace HanwhaClient.Model.User
{
    public class UsersRequestModel
    {
        public string? Id { get; set; }
        public string? Username { get; set; }
        public string? Firstname { get; set; }
        public string? Lastname { get; set; }
        public string? Email { get; set; }
        public string? Password { get; set; }
        public IEnumerable<string>? RoleIds { get; set; }
        public DataAccessPermission? DataAccessPermission { get; set; }
    }

    public class UserGroup
    {
        public string ConnectionId { get; set; }
        public IEnumerable<string> FloorId { get; set; }
        public IEnumerable<string>? ZoneId { get; set; }
        public string? WidgetName { get; set; }
    }

    public class UserPreferencesRequest
    {
        public string Theme { get; set; }
        public bool IsOsSyncTimeZone { get; set; }
        public string? Timezone { get; set; }
        public bool IsDaylightSavings { get; set; }
        public string Language { get; set; }
        public string? TimeFormat { get; set; }
        public string? UserId { get; set; }
    }
}