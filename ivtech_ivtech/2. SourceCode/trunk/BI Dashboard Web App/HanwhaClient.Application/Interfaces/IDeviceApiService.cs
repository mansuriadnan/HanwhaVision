using HanwhaClient.Model.Dto;

namespace HanwhaClient.Application.Interfaces
{
    public interface IDeviceApiService
    {
        Task<T> CallDeviceApi<T>(string url, string? userName, string? password) where T : class, new();
        Task<T> DeleteCallDeviceApi<T>(string url, string? userName, string? password) where T : class, new();
        Task<HttpResponseMessage> GetVideoStream(string id);
    }
}
