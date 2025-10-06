using HanwhaClient.Application.Interfaces;
using Microsoft.Extensions.Caching.Memory;

namespace HanwhaClient.Application.Services
{
    public class InMemoryCacheService : ICacheService
    {
        private readonly IMemoryCache _memoryCache;

        public InMemoryCacheService(IMemoryCache memoryCache)
        {
            _memoryCache = memoryCache;
        }

        public async Task<T?> GetAsync<T>(string key)
        {
            _memoryCache.TryGetValue(key, out T value);
            return await Task.FromResult(value);
        }

        public Task SetAsync<T>(string key, T value, TimeSpan? expirationTime = null)
        {
            var cacheEntryOptions = new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = expirationTime ?? TimeSpan.FromMinutes(30) // Default expiration time
            };
            _memoryCache.Set(key, value, cacheEntryOptions);
            return Task.CompletedTask;
        }

        public Task RemoveAsync(string key)
        {
            _memoryCache.Remove(key);
            return Task.CompletedTask;
        }

        public Task ClearAsync()
        {
            // Clear the entire cache (requires custom extension)
            if (_memoryCache is MemoryCache memoryCache)
            {
                memoryCache.Compact(1.0);
            }
            return Task.CompletedTask;
        }

        public Task<bool> ExistsAsync(string key)
        {
            return Task.FromResult(_memoryCache.TryGetValue(key, out _));
        }
    }
}
