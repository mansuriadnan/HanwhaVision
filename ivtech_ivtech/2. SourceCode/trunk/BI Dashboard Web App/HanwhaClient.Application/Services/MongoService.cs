using HanwhaClient.Application.Interfaces;
using HanwhaClient.Model.Common;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO.Compression;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Application.Services
{
    public class MongoService : IMongoService
    {
        private readonly MongoSettings _config;
        public MongoService(MongoSettings config)
        {
            _config = config;
        }
        public async Task<(bool IsSuccess, string OutputPath, string Error)> BackupDatabaseAsync()
        {
            string backupFolder = null;
            try
            {
                var sw1 = Stopwatch.StartNew();
                var stopwatch = new Stopwatch();
                stopwatch.Start();
                // mongodump process
                backupFolder = Path.Combine("BackupFile", DateTime.Now.Date.ToString("dd-MM-yyyy"), DateTime.Now.ToString("yyyyMMdd_HHmmss") + "_" + _config.DatabaseName);

                if (!Directory.Exists(backupFolder))
                {
                    Directory.CreateDirectory(backupFolder);
                }

                var isDatabaseIfExist = await CheckDatabaseIfExist(_config.DatabaseName);
                if (!isDatabaseIfExist)
                {
                    return (false, null, "Database doesn't exist");
                }

                var mongodump = new ProcessStartInfo
                {
                    FileName = _config.MongoDumpPath,
                    // Arguments = $"--uri=\"{_config.ConnectionString}\" --db={_config.DatabaseName} --out=\"{backupFolder}\" --gzip --numParallelCollections={Environment.ProcessorCount * 2} --quiet --readPreference=secondaryPreferred",
                    Arguments = $"--uri=\"{_config.ConnectionString}\" --db={_config.DatabaseName} --out=\"{backupFolder}\"  --gzip --numParallelCollections={Math.Min(Environment.ProcessorCount * 4, 16)} --quiet --readPreference=secondaryPreferred --excludeCollection=system.indexes --forceTableScan",
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                };

                using var process = Process.Start(mongodump);
                var outputTask = process.StandardOutput.ReadToEndAsync();
                var errorTask = process.StandardError.ReadToEndAsync();
                await Task.WhenAll(outputTask, errorTask);

                sw1.Stop();
                Console.WriteLine($"Backup: {sw1.Elapsed.TotalSeconds:F1}s");
                var error = await errorTask;
                await process.WaitForExitAsync();

                if (process.ExitCode == 0)
                {
                    var sw2 = Stopwatch.StartNew();
                    await CompressBackupAsync(backupFolder);
                    sw2.Stop();
                    Console.WriteLine($"Compression: {sw2.Elapsed.TotalSeconds:F1}s");

                    var sw3 = Stopwatch.StartNew();
                    await EncryptBackupAsync(backupFolder);
                    sw3.Stop();
                    Console.WriteLine($"Encryption: {sw3.Elapsed.TotalSeconds:F1}s");

                    string encryptedFilePath = backupFolder + ".zip.aes";
                    stopwatch.Stop();
                    Console.WriteLine($"Main Mathod Ended: {stopwatch.Elapsed.TotalSeconds:F1}s");

                    if (Directory.Exists("uploads"))
                    {
                        Directory.CreateDirectory("uploads");
                    }

                    return (true, encryptedFilePath, null);
                }
                else
                {
                    return (false, null, error);
                }
            }
            catch (Exception ex)
            {
                throw ex;
                //return (false, null, ex.Message);
            }
            finally
            {
                // Cleanup backup folder in case of any failure
                if (!string.IsNullOrEmpty(backupFolder) && Directory.Exists(backupFolder))
                {

                    await Task.Run(() => Directory.Delete(backupFolder, true));
                }
            }
        }


        private static async Task CompressBackupAsync(string folderPath)
        {
            string zipFilePath = folderPath + ".zip";
            await Task.Run(() => ZipFile.CreateFromDirectory(folderPath, zipFilePath, CompressionLevel.Fastest, false));
        }

        private async Task EncryptBackupAsync(string folderPath)
        {
            string zipFilePath = folderPath + ".zip";
            string encryptedFilePath = zipFilePath + ".aes";

            using var inputStream = new FileStream(zipFilePath, FileMode.Open, FileAccess.Read, FileShare.Read, bufferSize: 4 * 1024 * 1024); // 4MB buffer
            using var fileStream = new FileStream(encryptedFilePath, FileMode.Create, FileAccess.Write, FileShare.None, bufferSize: 4 * 1024 * 1024);
            using var aes = Aes.Create();

            byte[] key = Encoding.UTF8.GetBytes(_config.EncryptionKey);
            byte[] iv = new byte[16];
            aes.Key = key;
            aes.IV = iv;

            using var cryptoStream = new CryptoStream(fileStream, aes.CreateEncryptor(), CryptoStreamMode.Write);
            await inputStream.CopyToAsync(cryptoStream, bufferSize: 4 * 1024 * 1024);

            // Cleanup intermediate files
            // await CleanupTempFilesAsync(folderPath, zipFilePath);
        }


        private static async Task CleanupTempFilesAsync(string backupFolder, string zipFilePath)
        {
            try
            {
                // Delete zip file if it exists
                if (!string.IsNullOrEmpty(zipFilePath) && File.Exists(zipFilePath))
                {
                    await Task.Run(() => File.Delete(zipFilePath));
                    Console.WriteLine($"Temporary zip file '{zipFilePath}' deleted successfully.");
                }

                // Delete backup folder if it exists
                if (!string.IsNullOrEmpty(backupFolder) && Directory.Exists(backupFolder))
                {
                    await Task.Run(() => Directory.Delete(backupFolder, true));
                    Console.WriteLine($"Backup folder '{backupFolder}' deleted successfully.");
                }
            }
            catch (Exception ex)
            {
                throw ex;
                //Console.WriteLine($"Warning: Failed to cleanup temporary files: {ex.Message}");
                // Don't throw - cleanup failures shouldn't fail the backup operation
            }
        }

        private async Task<(bool Success, string Error)> MonitorBackupProcess(Process process)
        {
            var outputTask = process.StandardOutput.ReadToEndAsync();
            var errorTask = process.StandardError.ReadToEndAsync();

            await Task.WhenAll(outputTask, errorTask);
            await process.WaitForExitAsync();

            if (process.ExitCode == 0)
            {
                return (true, null);
            }
            else
            {
                var error = await errorTask;
                return (false, error);
            }
        }

        private async Task<string> WaitAndPostProcess(string backupFolder, Task<(bool Success, string Error)> backupTask)
        {
            // Wait for backup to complete
            await backupTask;

            // Start compression and encryption in parallel if possible
            await CompressBackupAsync(backupFolder);
            await EncryptBackupAsync(backupFolder);

            return backupFolder + ".zip.aes";
        }

        // Instead of ZipFile.CreateFromDirectory
        private static async Task CompressBackupAsync1(string folderPath)
        {
            string zipFilePath = folderPath + ".zip";
            await Task.Run(() => ZipFile.CreateFromDirectory(folderPath, zipFilePath, CompressionLevel.Fastest, false));
        }

        // Make encryption async
        private async Task EncryptBackupAsync1(string folderPath)
        {
            string zipFilePath = folderPath + ".zip";
            string encryptedFilePath = zipFilePath + ".aes";

            using var inputStream = new FileStream(zipFilePath, FileMode.Open, FileAccess.Read, FileShare.Read, bufferSize: 1024 * 1024); // 1MB buffer
            using var fileStream = new FileStream(encryptedFilePath, FileMode.Create, FileAccess.Write, FileShare.None, bufferSize: 1024 * 1024);
            using var aes = Aes.Create();

            byte[] key = Encoding.UTF8.GetBytes(_config.EncryptionKey);
            byte[] iv = new byte[16];
            aes.Key = key;
            aes.IV = iv;

            using var cryptoStream = new CryptoStream(fileStream, aes.CreateEncryptor(), CryptoStreamMode.Write);
            await inputStream.CopyToAsync(cryptoStream, bufferSize: 1024 * 1024);
        }

        //public async Task<(bool IsSuccess, string OutputPath, string Error)> BackupDatabaseAsync()
        //{
        //    try
        //    {
        //        var stopwatch = new Stopwatch();
        //        stopwatch.Start();

        //        var backupFolder = Path.Combine(DateTime.Now.Date.ToString("dd-MM-yyyy"), DateTime.Now.ToString("yyyyMMdd_HHmmss") + "_" + _config.DatabaseName);
        //        if (!Directory.Exists(backupFolder))
        //        {
        //            Directory.CreateDirectory(backupFolder);
        //        }

        //        var isDatabaseIfExist = await CheckDatabaseIfExist(_config.DatabaseName);

        //        if (isDatabaseIfExist)
        //        {
        //            var mongodump = new ProcessStartInfo
        //            {
        //                FileName = _config.MongoDumpPath,
        //                Arguments = $"--uri=\"{_config.ConnectionString}\" --db={_config.DatabaseName} --out=\"{backupFolder}\" --gzip --numParallelCollections=4",
        //                RedirectStandardOutput = true,
        //                RedirectStandardError = true,
        //                UseShellExecute = false,
        //                CreateNoWindow = true
        //            };

        //            using (var process = Process.Start(mongodump))
        //            {
        //                var outputTask = process.StandardOutput.ReadToEndAsync();
        //                var errorTask = process.StandardError.ReadToEndAsync();

        //                await Task.WhenAll(outputTask, errorTask);

        //                var output = await outputTask;
        //                var error = await errorTask;

        //                process.WaitForExit();

        //                if (process.ExitCode == 0)
        //                {
        //                    CompressBackup(backupFolder);
        //                    EncryptBackup(backupFolder);
        //                    stopwatch.Stop();

        //                    string encryptedFilePath = backupFolder + ".zip.aes";

        //                    return (true, encryptedFilePath, null);
        //                }
        //                else
        //                {
        //                    return (false, null, error);
        //                }
        //            }
        //        }
        //        else
        //        {

        //            return (false, null, "Database doesn't exits");
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        return (false, null, ex.Message);
        //    }
        //}


        //private static void CompressBackup(string folderPath)
        //{
        //    string zipFilePath = folderPath + ".zip";
        //    ZipFile.CreateFromDirectory(folderPath, zipFilePath);
        //}

        //private void EncryptBackup(string folderPath)
        //{
        //    string zipFilePath = folderPath + ".zip";
        //    string encryptedFilePath = zipFilePath + ".aes";

        //    using (FileStream fileStream = new FileStream(encryptedFilePath, FileMode.Create))
        //    using (Aes aes = Aes.Create())
        //    {
        //        byte[] key = Encoding.UTF8.GetBytes(_config.EncryptionKey); // Replace with your encryption key
        //        byte[] iv = new byte[16];
        //        aes.Key = key;
        //        aes.IV = iv;

        //        using (CryptoStream cryptoStream = new CryptoStream(fileStream, aes.CreateEncryptor(), CryptoStreamMode.Write))
        //        using (FileStream inputStream = new FileStream(zipFilePath, FileMode.Open))
        //        {
        //            inputStream.CopyTo(cryptoStream);
        //        }
        //    }

        //    if (File.Exists(zipFilePath))
        //    {
        //        File.Delete(zipFilePath);
        //        Console.WriteLine($"File '{zipFilePath}' has been deleted successfully.");
        //    }

        //    try
        //    {
        //        if (Directory.Exists(folderPath))
        //        {
        //            Directory.Delete(folderPath, true);
        //            Console.WriteLine($"Folder '{folderPath}' and all its contents have been deleted successfully.");
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        var msg = ex.Message;
        //        throw;
        //    }
        //}

        private async Task<bool> CheckDatabaseIfExist(string dbName)
        {
            var client = new MongoClient(_config.ConnectionString); // Modify with your MongoDB connection string
            var database = client.GetDatabase(dbName);

            var dbList = await client.ListDatabaseNamesAsync();
            var dbNames = dbList.ToList();

            if (dbNames.Contains(dbName))
            {
                return true;
            }
            else
            {
                return false;
            }
        }

        //public async Task RestoreDatabase(string encryptedFilePath)
        //{
        //    var stopwatch = new Stopwatch();
        //    stopwatch.Start();

        //    try
        //    {
        //        // Step 1: Decrypt the file
        //        string compressedFilePath = DecryptBackup(encryptedFilePath);

        //        // Step 2: Create a temp restore directory
        //        var _backupDirectory = Path.Combine(Path.GetTempPath(), "MongoRestore_" + Guid.NewGuid());
        //        Directory.CreateDirectory(_backupDirectory);

        //        // Step 3: Unzip the backup into temp directory
        //        UnzipBackup(compressedFilePath, _backupDirectory);

        //        // Step 4: Restore
        //        await RestoreDatabaseAsync(_config.DatabaseName, _backupDirectory, compressedFilePath);

        //        // Optional: Clean up extracted files
        //        Directory.Delete(_backupDirectory, true);
        //        stopwatch.Stop();
        //        Console.WriteLine($"Main Mathod Ended: {stopwatch.Elapsed.TotalSeconds:F1}s");
        //    }
        //    catch (Exception ex)
        //    {
        //        //_logger.LogError($"Error during restore process: {ex.Message}");
        //    }

        //    stopwatch.Stop();
        //    Console.WriteLine($"Restore took {stopwatch.Elapsed.TotalMinutes} minutes.");
        //}


        //private string DecryptBackup(string encryptedFilePath)
        //{

        //    string decryptedFilePath = encryptedFilePath.Replace(".aes", "");

        //    byte[] key = Encoding.UTF8.GetBytes(_config.EncryptionKey);
        //    byte[] iv = new byte[16]; // Same IV used during encryption

        //    using (Aes aesAlg = Aes.Create())
        //    {
        //        aesAlg.Key = key;
        //        aesAlg.IV = iv;

        //        using (var decryptor = aesAlg.CreateDecryptor(aesAlg.Key, aesAlg.IV))
        //        using (var encryptedStream = new FileStream(encryptedFilePath, FileMode.Open))
        //        using (var cryptoStream = new CryptoStream(encryptedStream, decryptor, CryptoStreamMode.Read))
        //        using (var decryptedStream = new FileStream(decryptedFilePath, FileMode.Create))
        //        {
        //            cryptoStream.CopyTo(decryptedStream);
        //        }
        //    }

        //    // _logger.LogInformation($"Decryption completed: {decryptedFilePath}");
        //    return decryptedFilePath;
        //}

        //private static void UnzipBackup(string zipFilePath, string extractPath)
        //{
        //    ZipFile.ExtractToDirectory(zipFilePath, extractPath);
        //    Console.WriteLine($"Backup unzipped successfully to {extractPath}");
        //}

        //private async Task RestoreDatabaseAsync(string _dbName, string _backupDirectory, string compressedFilePath)
        //{
        //    // Command for restore using mongorestore
        //    var mongorestore = new ProcessStartInfo
        //    {
        //        FileName = _config.MongoRestorePath,
        //        Arguments = $"--uri=\"{_config.ConnectionString}\" --db={_dbName} --dir=\"{_backupDirectory}\\{_dbName}\" --drop --gzip",
        //        RedirectStandardOutput = true,
        //        RedirectStandardError = true,
        //        UseShellExecute = false,
        //        CreateNoWindow = true
        //    };

        //    try
        //    {
        //        using (var process = new Process { StartInfo = mongorestore })
        //        {
        //            process.Start();

        //            // Read the output and error streams asynchronously
        //            var outputTask = Task.Run(() => process.StandardOutput.ReadToEndAsync());
        //            var errorTask = Task.Run(() => process.StandardError.ReadToEndAsync());

        //            await Task.WhenAll(outputTask, errorTask);

        //            var output = await outputTask;
        //            var error = await errorTask;

        //            process.WaitForExit();

        //            if (process.ExitCode == 0)
        //            {
        //                Console.WriteLine("Restore completed successfully.");
        //                Directory.Delete(Path.Combine(_backupDirectory, _dbName), true);

        //                if (File.Exists(compressedFilePath))
        //                {
        //                    File.Delete(compressedFilePath);
        //                    Console.WriteLine($"File '{compressedFilePath}' has been deleted successfully.");
        //                }
        //            }
        //            else
        //            {
        //                Console.WriteLine($"Restore failed: {error}");
        //            }
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        Console.WriteLine($"Restore failed: {ex.Message}");
        //        throw;
        //    }
        //}




        public async Task RestoreDatabase(string encryptedFilePath)
        {
            var stopwatch = Stopwatch.StartNew();
            Console.WriteLine($"Compression: {stopwatch.Elapsed.TotalSeconds:F1}s");
            string _backupDirectory = null;
            string compressedFilePath = null;

            try
            {

                // Step 1: Decrypt the file (async)
                var sw1 = Stopwatch.StartNew();
                compressedFilePath = await DecryptBackupAsync(encryptedFilePath);
                sw1.Stop();
                Console.WriteLine($"Compression : {sw1.Elapsed.TotalSeconds:F1}s");

                // Step 2: Create temp restore directory
                var sw2 = Stopwatch.StartNew();
                _backupDirectory = Path.Combine(Path.GetTempPath(), "MongoRestore_" + Guid.NewGuid());
                Directory.CreateDirectory(_backupDirectory);
                sw2.Stop();
                Console.WriteLine($"Create temp restore directory : {sw2.Elapsed.TotalSeconds:F1}s");


                // Step 3: Unzip the backup (async)
                var sw3 = Stopwatch.StartNew();
                await UnzipBackupAsync(compressedFilePath, _backupDirectory);
                Directory.CreateDirectory(_backupDirectory);
                sw3.Stop();
                Console.WriteLine($"Unzip the backup : {sw3.Elapsed.TotalSeconds:F1}s");


                // Step 4: Restore (already async)
                var sw4 = Stopwatch.StartNew();
                await RestoreDatabaseAsync(_config.DatabaseName, _backupDirectory, compressedFilePath);
                Directory.CreateDirectory(_backupDirectory);

                sw4.Stop();
                Console.WriteLine($"Restore : {sw4.Elapsed.TotalSeconds:F1}s");


                stopwatch.Stop();
                Console.WriteLine($"Restore took {stopwatch.Elapsed.TotalMinutes:F2} minutes.");
            }
            catch (Exception ex)
            {
                throw ex;
            }
            finally
            {
                // Cleanup in finally block
                await CleanupRestoreFilesAsync(_backupDirectory, compressedFilePath);
            }
        }


        private async Task<string> DecryptBackupAsync(string encryptedFilePath)
        {
            string decryptedFilePath = encryptedFilePath.Replace(".aes", "");
            byte[] key = Encoding.UTF8.GetBytes(_config.EncryptionKey);
            byte[] iv = new byte[16];

            using var aesAlg = Aes.Create();
            aesAlg.Key = key;
            aesAlg.IV = iv;

            using var decryptor = aesAlg.CreateDecryptor(aesAlg.Key, aesAlg.IV);
            using var encryptedStream = new FileStream(encryptedFilePath, FileMode.Open, FileAccess.Read, FileShare.Read, bufferSize: 4 * 1024 * 1024);
            using var cryptoStream = new CryptoStream(encryptedStream, decryptor, CryptoStreamMode.Read);
            using var decryptedStream = new FileStream(decryptedFilePath, FileMode.Create, FileAccess.Write, FileShare.None, bufferSize: 4 * 1024 * 1024);

            await cryptoStream.CopyToAsync(decryptedStream, bufferSize: 4 * 1024 * 1024);

            Console.WriteLine($"Decryption completed: {decryptedFilePath}");
            return decryptedFilePath;
        }


        private static async Task UnzipBackupAsync(string zipFilePath, string extractPath)
        {
            await Task.Run(() => ZipFile.ExtractToDirectory(zipFilePath, extractPath));
            Console.WriteLine($"Backup unzipped successfully to {extractPath}");
        }

        private async Task RestoreDatabaseAsync(string _dbName, string _backupDirectory, string compressedFilePath)
        {
            var mongorestore = new ProcessStartInfo
            {
                FileName = _config.MongoRestorePath,
                Arguments = $"--uri=\"{_config.ConnectionString}\" --db={_dbName} --dir=\"{_backupDirectory}\\{_dbName}\" --drop --gzip --numParallelCollections={Environment.ProcessorCount * 2} --numInsertionWorkersPerCollection=8 --quiet --stopOnError",
                //    Arguments = $"--uri=\"{_config.ConnectionString}\" " +
                //$"--db={_dbName} " +
                //$"--dir=\"{_backupDirectory}\\{_dbName}\" " +
                //"--drop --gzip " +
                //$"--numParallelCollections={Environment.ProcessorCount * 2} " +
                //"--numInsertionWorkersPerCollection=8 " +
                //"--writeConcern={{w:0,j:false}} " + // keep JSON brackets escaped
                //"--quiet --stopOnError",
                //Arguments = $"--uri=\"{_config.ConnectionString}\" --db={_dbName} --dir=\"{_backupDirectory}\\{_dbName}\" --drop --gzip --numParallelCollections={Environment.ProcessorCount * 2} --numInsertionWorkersPerCollection=8 --writeConcern={{w:0,j:false}} --quiet --stopOnError --maintainInsertionOrder=false",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            using var process = new Process { StartInfo = mongorestore };
            process.Start();

            var outputTask = process.StandardOutput.ReadToEndAsync();
            var errorTask = process.StandardError.ReadToEndAsync();

            await Task.WhenAll(outputTask, errorTask);
            await process.WaitForExitAsync();

            var error = await errorTask;

            if (process.ExitCode == 0)
            {
                Console.WriteLine("Restore completed successfully.");
            }
            else
            {
                Console.WriteLine($"Restore failed: {error}");
                throw new Exception($"Restore failed: {error}");
            }
        }

        private static async Task CleanupRestoreFilesAsync(string backupDirectory, string compressedFilePath)
        {
            var cleanupTasks = new List<Task>();

            if (Directory.Exists("BackupFile"))
            {
                Directory.Delete("BackupFile", true);
            }

            // Delete backup directory
            if (!string.IsNullOrEmpty(backupDirectory) && Directory.Exists(backupDirectory))
            {
                cleanupTasks.Add(Task.Run(() =>
                {
                    try
                    {
                        Directory.Delete(backupDirectory, true);
                        Console.WriteLine("Backup directory deleted successfully.");
                    }
                    catch (Exception ex)
                    {
                        throw ex;
                    }
                }));
            }

            // Delete compressed file
            if (Directory.Exists("uploads"))
            {
                cleanupTasks.Add(Task.Run(() =>
                {
                    try
                    {
                        Directory.Delete("uploads", true);
                        Console.WriteLine("Compressed file deleted successfully.");
                    }
                    catch (Exception ex)
                    {
                        throw ex;
                    }
                }));
            }

            if (cleanupTasks.Any())
            {
                await Task.WhenAll(cleanupTasks);
            }
        }

    }
}
