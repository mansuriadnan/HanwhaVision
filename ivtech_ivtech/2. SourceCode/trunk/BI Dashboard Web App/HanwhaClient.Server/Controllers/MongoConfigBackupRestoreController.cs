using HanwhaClient.Application.Interfaces;
using HanwhaClient.Helper;
using HanwhaClient.Model.Common;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HanwhaClient.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [CustomAuthorize([ScreenNames.BackupRestoreMaster])]
    public class MongoConfigBackupRestoreController : ControllerBase
    {
        private readonly IMongoConfigService _mongoCollectionService;
        private readonly IConfiguration _configuration;

        public MongoConfigBackupRestoreController(IMongoConfigService mongoCollectionService, IConfiguration configuration)
        {
            _mongoCollectionService = mongoCollectionService;
            _configuration = configuration;
        }

        // Endpoint to trigger MongoDB collection backup for multiple collections
        [HttpPost("backup-collections")]
        public IActionResult BackupMongoCollections()
        {
            var collections = _configuration.GetSection("SpecificCollections").Get<List<string>>();
            if (collections == null || !collections.Any())
                return BadRequest(new { message = "No collection names found in configuration" });

            var backupResults = _mongoCollectionService.BackupDatabase(collections);
            return Ok(new { message = "Collections backup completed", results = backupResults });
        }

        // Endpoint to trigger MongoDB collection restore for multiple collections
        [HttpPost("restore-collections")]
        public IActionResult RestoreMongoCollections(string backupPath)
        {
            if (string.IsNullOrEmpty(backupPath))
                return BadRequest(new { message = "Backup path is required" });

            var collections = _configuration.GetSection("SpecificCollections").Get<List<string>>();
            if (collections == null || !collections.Any())
                return BadRequest(new { message = "No collection names found in configuration" });

            var restoreResults = _mongoCollectionService.RestoreDatabase(backupPath, collections);
            return Ok(new { message = "Collections restore completed", results = restoreResults });
        }
    }
}
