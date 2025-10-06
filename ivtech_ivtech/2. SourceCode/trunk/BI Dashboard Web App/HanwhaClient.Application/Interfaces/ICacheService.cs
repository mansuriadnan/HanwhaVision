using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Application.Interfaces
{
    public interface ICacheService
    {
        Task<T> GetAsync<T>(string key);
        Task SetAsync<T>(string key, T value, TimeSpan? expirationTime = null);
        Task RemoveAsync(string key);
        Task ClearAsync();
        //Task<bool> TryGetAsync<T>(string key, out T value);
        Task<bool> ExistsAsync(string key);
    }
}
