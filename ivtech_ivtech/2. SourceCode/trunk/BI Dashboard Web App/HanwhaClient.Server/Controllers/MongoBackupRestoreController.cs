using HanwhaClient.Application.Interfaces;
using HanwhaClient.Helper;
using HanwhaClient.Model.Common;
using HanwhaClient.Model.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace HanwhaClient.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[CustomAuthorize([ScreenNames.BackupRestoreMaster])]
    public class MongoBackupRestoreController : ControllerBase
    {
        private readonly IMongoService _mongoService;
        private readonly string _tempUploadPath = Path.Combine(Path.GetTempPath(), "ChunkedUploads");

        public MongoBackupRestoreController(IMongoService mongoService)
        {
            this._mongoService = mongoService;
            Directory.CreateDirectory(_tempUploadPath);
        }


        [HttpGet]
        [CustomAuthorize([ScreenNames.CanTakeFullDBBackup])]
        public async Task<IActionResult> DownloadBackup()
        {
            var (isSuccess, outputPath, error) = await _mongoService.BackupDatabaseAsync();

            if (!isSuccess)
                return StatusCode(500, new { message = "Backup failed", error });

            var fileName = Path.GetFileName(outputPath);
            var fileBytes = await System.IO.File.ReadAllBytesAsync(outputPath);
           
            return File(fileBytes, "application/octet-stream", fileName);
        }


        [HttpPost]
        [DisableRequestSizeLimit]
        [CustomAuthorize([ScreenNames.CanRestoreDatabase])]
        public async Task<ActionResult<StandardAPIResponse<string>>> RestoreFromFile(IFormFile backupFile)
        {
            if (backupFile == null || backupFile.Length == 0)
                return StandardAPIResponse<string>.ErrorResponse(null, "No file uploaded", StatusCodes.Status400BadRequest);

            if (!backupFile.FileName.EndsWith(".aes", StringComparison.OrdinalIgnoreCase))
                return StandardAPIResponse<string>.ErrorResponse(null, "Invalid file format. Only .aes files are supported.", StatusCodes.Status400BadRequest);

            var tempFilePath = Path.Combine(Path.GetTempPath(), backupFile.FileName);
            using (var stream = new FileStream(tempFilePath, FileMode.Create))
            {
                await backupFile.CopyToAsync(stream);
            }

            try
            {
                await _mongoService.RestoreDatabase(tempFilePath);
                return StandardAPIResponse<string>.SuccessResponse("", AppMessageConstants.RestoreDatabase);
            }
            catch (Exception ex)
            {
                if (ex.Message.Contains("encryption key is invalid"))
                {
                    return StandardAPIResponse<string>.ErrorResponse(null, "Restore failed: Invalid file or Unauthorized user.", StatusCodes.Status400BadRequest);
                }

                return StandardAPIResponse<string>.ErrorResponse(null, "Database Restore failed", StatusCodes.Status500InternalServerError);
            }
        }

        [HttpPost("chunk")]
        [CustomAuthorize([ScreenNames.CanRestoreDatabase])]
        public async Task<ActionResult<StandardAPIResponse<int>>> UploadChunk()
        {
            try
            {
                var form = await Request.ReadFormAsync();

                var file = form.Files["file"];
                var chunkIndex = int.Parse(form["chunkIndex"]);
                var totalChunks = int.Parse(form["totalChunks"]);
                var uploadId = form["uploadId"];
                var fileName = form["fileName"];

                if (file == null || file.Length == 0)
                    return BadRequest("No file chunk received");

                // Create directory for this upload session
                var uploadDir = Path.Combine(_tempUploadPath, uploadId);
                Directory.CreateDirectory(uploadDir);

                // Save chunk to temporary file
                var chunkPath = Path.Combine(uploadDir, $"chunk_{chunkIndex:D4}");
                using (var stream = new FileStream(chunkPath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Create metadata file
                var metadataPath = Path.Combine(uploadDir, "metadata.json");
                var metadata = new
                {
                    FileName = fileName.ToString(),
                    TotalChunks = totalChunks,
                    UploadedChunks = Directory.GetFiles(uploadDir, "chunk_*").Length
                };

                await System.IO.File.WriteAllTextAsync(metadataPath,
                    System.Text.Json.JsonSerializer.Serialize(metadata));

                return StandardAPIResponse<int>.SuccessResponse(chunkIndex, "uploading");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error uploading chunk: {ex.Message}");
            }
        }

        [HttpPost("finalize")]
        [CustomAuthorize([ScreenNames.CanRestoreDatabase])]
        public async Task<ActionResult<StandardAPIResponse<string>>> FinalizeUpload([FromBody] FinalizeUploadRequest request)
        {
            try
            {
                var uploadDir = Path.Combine(_tempUploadPath, request.UploadId);
                var metadataPath = Path.Combine(uploadDir, "metadata.json");

                if (!System.IO.File.Exists(metadataPath))
                    return BadRequest("Upload session not found");

                var metadataJson = await System.IO.File.ReadAllTextAsync(metadataPath);
                var metadata = System.Text.Json.JsonSerializer.Deserialize<dynamic>(metadataJson);

                // Get all chunk files and sort them
                var chunkFiles = Directory.GetFiles(uploadDir, "chunk_*")
                    .OrderBy(f => f)
                    .ToArray();

                // Combine chunks into final file
                var finalFilePath = Path.Combine("uploads", request.FileName); // Your final destination
                Directory.CreateDirectory(Path.GetDirectoryName(finalFilePath));

                using (var finalFile = new FileStream(finalFilePath, FileMode.Create))
                {
                    foreach (var chunkFile in chunkFiles)
                    {
                        using (var chunkStream = new FileStream(chunkFile, FileMode.Open))
                        {
                            await chunkStream.CopyToAsync(finalFile);
                        }
                    }
                }

                await _mongoService.RestoreDatabase(finalFilePath);

                // Clean up temporary files
                Directory.Delete(uploadDir, true);

                return StandardAPIResponse<string>.SuccessResponse("", AppMessageConstants.RestoreDatabase);

                //return Ok(new
                //{
                //    message = "File uploaded successfully",
                //    filePath = finalFilePath,
                //    fileName = request.FileName
                //});
            }
            catch (Exception ex)
            {
                //return StatusCode(500, $"Error finalizing upload: {ex.Message}");
                throw ex;
                //return StandardAPIResponse<string>.ErrorResponse("", "Error finalizing upload: { ex.Message}");
            }
        }
    }
}
