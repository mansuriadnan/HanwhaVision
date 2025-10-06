using HanwhaClient.Model.Dto;

namespace HanwhaClient.Application.Interfaces
{
    public interface IUserNotificationService
    {
        Task<bool> AddUserNotification(string title, string content, string? ActionName, string? ActionParameter);
        Task<bool> MarkReadUserNotification(MarkReadNotificationRequest markReadNotificationRequest);
    }
}
