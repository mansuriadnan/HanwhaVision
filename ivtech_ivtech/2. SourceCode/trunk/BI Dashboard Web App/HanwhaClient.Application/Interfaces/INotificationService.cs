
namespace HanwhaClient.Application.Interfaces
{
    public interface INotificationService
    {
        Task SendNotificationToGroupAsync(string groupName, string message);
        Task SendNotificationToUserAsync(string userId, string message);
        Task AddUserToGroupAsync(string connectionId, string deviceId, string widgetName);
        Task RemoveUserFromGroupAsync(string connectionId, string widgetName);
        Task RemoveAllGroupsAsync(string connectionId);
    }
}
