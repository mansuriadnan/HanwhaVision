using HanwhaClient.Application.Interfaces;
using System.Collections;
using System.Reflection;
using System.Text.Json;
using System.Net.Http;
using HanwhaClient.Model.Dto;
using System.Net.Http.Headers;
using System.Text;
using HanwhaClient.Core.Services;
using System.Net;

namespace HanwhaClient.Application.Services
{
    public class DeviceApiService : IDeviceApiService
    {
        private readonly HttpClient _httpClient;
        private readonly HttpClient _httpClientFactory;

        public DeviceApiService(HttpClient httpClient, IHttpClientFactory httpClientFactory)
        {
            _httpClient = httpClient;
            _httpClientFactory = httpClientFactory.CreateClient();
        }


        public async Task<T> CallDeviceApi<T>(string url, string? userName, string? password) where T : class, new()
        {
            try
            {
                var digestCredentials = new DigestAuthClient(userName, password);
                var responseBody = await digestCredentials.GetAsync(url);

                // If response is JSON, deserialize it directly into T
                if (responseBody.Trim().StartsWith("{") || responseBody.Trim().StartsWith("["))
                {
                    return JsonSerializer.Deserialize<T>(responseBody, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    }) ?? new T();
                }

                // If response is key-value format, parse it manually
                return ParseKeyValueResponse<T>(responseBody);
            }
            catch (Exception ex)
            {
                throw new Exception($"API call failed: {ex.Message}");
            }
        }

        public async Task<T> DeleteCallDeviceApi<T>(string url, string? userName, string? password) where T : class, new()
        {
            try
            {
                var digestCredentials = new DigestAuthClient(userName, password);
                var responseBody = await digestCredentials.DeleteAsync(url);

                // If response is JSON, deserialize it directly into T
                if (responseBody.Trim().StartsWith("{") || responseBody.Trim().StartsWith("["))
                {
                    return JsonSerializer.Deserialize<T>(responseBody, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    }) ?? new T();
                }

                // If response is key-value format, parse it manually
                return ParseKeyValueResponse<T>(responseBody);
            }
            catch (Exception ex)
            {
                throw new Exception($"API call failed: {ex.Message}");
            }
        }

        private T ParseKeyValueResponse<T>(string response) where T : new()
        {
            Type type = typeof(T);

            // Check if T is a collection type (List<T>)
            if (type.IsGenericType && type.GetGenericTypeDefinition() == typeof(List<>))
            {
                Type elementType = type.GetGenericArguments()[0];
                var list = (IList)Activator.CreateInstance(typeof(List<>).MakeGenericType(elementType))!;
                var obj = Activator.CreateInstance(elementType)!;

                // Populate object with key-value pairs
                foreach (var line in response.Split(new[] { '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries))
                {
                    var keyValue = line.Split('=', 2);
                    if (keyValue.Length == 2)
                    {
                        string key = keyValue[0].Trim();
                        string value = keyValue[1].Trim();
                        var property = elementType.GetProperty(key, BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance);

                        if (property != null)
                        {
                            try
                            {
                                object convertedValue = Convert.ChangeType(value, property.PropertyType);
                                property.SetValue(obj, convertedValue);
                            }
                            catch { /* Ignore type conversion errors */ }
                        }
                    }
                }

                list.Add(obj);
                return (T)list;
            }
            else
            {
                // If T is a single object, populate and return it
                var obj = new T();
                foreach (var line in response.Split(new[] { '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries))
                {
                    var keyValue = line.Split('=', 2);
                    if (keyValue.Length == 2)
                    {
                        string key = keyValue[0].Trim();
                        string value = keyValue[1].Trim();
                        var property = typeof(T).GetProperty(key, BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance);

                        if (property != null)
                        {
                            try
                            {
                                object convertedValue = Convert.ChangeType(value, property.PropertyType);
                                property.SetValue(obj, convertedValue);
                            }
                            catch { /* Ignore type conversion errors */ }
                        }
                    }
                }

                return obj;
            }
        }
        public async Task<HttpResponseMessage> GetVideoStream(string id)
        {
            //try
            //{
            //    var cameraUrl = $"http://10.37.58.{id}/stw-cgi/video.cgi?msubmenu=stream&action=view&Profile=1&CodecType=MJPEG";
            //    var username = "admin";
            //    var password = "TeamIndia@2025";
            //    var credentials = Convert.ToBase64String(System.Text.Encoding.ASCII.GetBytes($"{username}:{password}"));

            //    var request = new HttpRequestMessage(HttpMethod.Get, cameraUrl);
            //    request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", credentials);

            //    return await _httpClientFactory.SendAsync(request, HttpCompletionOption.ResponseHeadersRead);
            //}
            //catch (Exception ex)
            //{
            //    throw new Exception($"API call failed: {ex.Message}");
            //}
            var url = $"http://10.37.58.{id}/stw-cgi/video.cgi?msubmenu=stream&action=view&Profile=1&CodecType=MJPEG";

            var digest = new DigestAuthFixer(url, "admin", "TeamIndia@2025");

            // This returns an HttpWebResponse, not HttpResponseMessage
            var httpWebResponse = (HttpWebResponse)await digest.GetResponse();

            // Convert to stream or bytes as needed
            var stream = httpWebResponse.GetResponseStream();

            // Optional: copy to memory stream if you need it multiple times
            var ms = new MemoryStream();
            await stream.CopyToAsync(ms);
            ms.Seek(0, SeekOrigin.Begin);

            // You can now pipe `ms` to ASP.NET response or return as a `FileStreamResult`
            return new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StreamContent(ms)
            };
        }
    }
}
