using HanwhaClient.Application.Interfaces;
using HanwhaClient.Helper;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.DbEntities;
using HanwhaClient.Model.User;
using Microsoft.AspNetCore.Mvc;

namespace HanwhaClient.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CacheController : Controller
    {
        private readonly ICacheService _cacheService;

        public CacheController(ICacheService cacheService)
        {
            _cacheService = cacheService;
        }

        [HttpGet]
        [Route("ClearCache")]
        public async Task<ActionResult<StandardAPIResponse<bool>>> ClearCacheAsync()
        {
            await _cacheService.ClearAsync();
            return StandardAPIResponse<bool>.SuccessResponse(true, AppMessageConstants.ApplicationCacheClear);
        }
    }
}
