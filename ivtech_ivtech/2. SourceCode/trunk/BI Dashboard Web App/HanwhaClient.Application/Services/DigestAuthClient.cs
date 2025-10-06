using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace HanwhaClient.Application.Services
{
    public class DigestAuthClient
    {
        private readonly HttpClient _httpClient;

        public DigestAuthClient(string username, string password)
        {
            var handler = new HttpClientHandler
            {
                Credentials = new NetworkCredential(username, password),
                PreAuthenticate = true, // Enables Digest Authentication
                ServerCertificateCustomValidationCallback = (sender, cert, chain, sslPolicyErrors) => { return true; }

            };

            _httpClient = new HttpClient(handler);
            _httpClient.DefaultRequestHeaders.Accept.Clear();
            _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }

        public async Task<string> GetAsync(string url)
        {
            try
            {
                
                var response = await _httpClient.GetAsync(url);
                if (response.StatusCode == HttpStatusCode.Unauthorized)
                {
                    Console.WriteLine("Authentication failed. Check credentials or permissions.");
                    throw new UnauthorizedAccessException("Authentication failed for the requested resource.");
                }

                response.EnsureSuccessStatusCode();
                return await response.Content.ReadAsStringAsync();
            }
            catch (HttpRequestException ex)
            {
                Console.WriteLine($"Request error: {ex.Message}");
                throw;
            }
        }

        public async Task<string> PostAsync(string url, HttpContent content)
        {
            try
            {
                var response = await _httpClient.PostAsync(url, content);

                if (response.StatusCode == HttpStatusCode.Unauthorized)
                {
                    // Handle unauthorized access
                    Console.WriteLine("Authentication failed for POST request.");
                    throw new UnauthorizedAccessException("Authentication failed for the requested resource.");
                }

                response.EnsureSuccessStatusCode();
                return await response.Content.ReadAsStringAsync();
            }
            catch (HttpRequestException ex)
            {
                Console.WriteLine($"POST request error: {ex.Message}");
                throw;
            }
        }

        public async Task<string> DeleteAsync(string url)
        {
            try
            {
                var response = await _httpClient.DeleteAsync(url);
                if (response.StatusCode == HttpStatusCode.Unauthorized)
                {
                    Console.WriteLine("Authentication failed. Check credentials or permissions.");
                    throw new UnauthorizedAccessException("Authentication failed for the requested resource.");
                }

                response.EnsureSuccessStatusCode();
                return await response.Content.ReadAsStringAsync();
            }
            catch (HttpRequestException ex)
            {
                Console.WriteLine($"Request error: {ex.Message}");
                throw;
            }
        }
    }
}
