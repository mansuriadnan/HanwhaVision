using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.Dto;

namespace HanwhaClient.Infrastructure.Interfaces
{
    public interface IUserNotificationRepository : IRepositoryBase<UserNotification>
    {
        Task<IEnumerable<UserNotificationResponse>> GetUserNotificationAsync(int pageNo, int pageSize);
        Task<long> GetUserNotificationCountAsync();
        Task<bool> MarkAllReadUserNotification(MarkReadNotificationRequest markReadNotificationRequest);
        Task<bool> UpdateNotificationDeviceEventsStatusAsync(string id, string userId);
    }
}
