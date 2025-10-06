using HanwhaClient.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HanwhaClient.Application.Services
{
    public class MongoConfigService : IMongoConfigService
    {

        private readonly string _mongoDumpPath = @"mongodump"; // give the full path of the mongodump.exe
        private readonly string _mongoRestorePath = @"mongorestore"; // give the full path of the mongorestore.exe
        private readonly string _backupBasePath = @"C:\MongoBackups";
        //private readonly string _mongoUri = "mongodb+srv://jayendramakwana:Jay%4033333@cluster0.nb1cveu.mongodb.net/hanwhavisionclient?retryWrites=true&w=majority&appName=Cluster0";
        private readonly string _mongoUri = "mongodb://localhost:27017/";
        private readonly string _dbName = "hanwhavisionclient";

        public string BackupDatabase(List<string> collections = null)
        {
            string backupPath = Path.Combine(_backupBasePath, $"Backup_{DateTime.Now:yyyyMMddHHmmss}");
            Directory.CreateDirectory(backupPath);

            if (collections != null && collections.Any())
            {
                foreach (var collection in collections)
                {

                    var processStartInfo = new ProcessStartInfo
                    {
                        FileName = _mongoDumpPath,
                        Arguments = $"--uri={_mongoUri} --db=\"{_dbName}\" --collection={collection} --out \"{backupPath}\"",
                        RedirectStandardOutput = true,
                        RedirectStandardError = true,
                        UseShellExecute = false,
                        CreateNoWindow = true
                    };

                    ExecuteProcess(processStartInfo, backupPath);
                }
            }
            return "";
        }

        public (bool IsSuccess, string Error) RestoreDatabase(string backupPath, List<string> collections = null)
        {
            if (!Directory.Exists(backupPath))
                return (false, "Backup directory does not exist");

            string collectionArgs = collections != null && collections.Any()
                ? string.Join(" ", collections.Select(c => $"--collection={c}"))
                : "";


            var processStartInfo = new ProcessStartInfo
            {
                FileName = _mongoRestorePath,
                Arguments = $"--uri=\"{_mongoUri}\"  --db=\"{_dbName}\" --dir=\"{backupPath}\"",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            var (isSuccess, _, error) = ExecuteProcess(processStartInfo);
            return (isSuccess, error);
        }

        private (bool IsSuccess, string OutputPath, string Error) ExecuteProcess(ProcessStartInfo processStartInfo, string outputPath = "")
        {
            try
            {
                using (Process process = new Process { StartInfo = processStartInfo })
                {
                    process.Start();
                    // Read output and error asynchronously
                    var outputTask = process.StandardOutput.ReadToEndAsync();
                    var errorTask = process.StandardError.ReadToEndAsync();
                    // Wait for the process to exit
                    process.WaitForExit();
                    // Wait for the output and error tasks to complete
                    string output = outputTask.Result;
                    string error = errorTask.Result;
                    bool isSuccess = process.ExitCode == 0;
                    // Log the output and error for debugging
                    Console.WriteLine("Output: " + output);
                    Console.WriteLine("Error: " + error);
                    return (isSuccess, isSuccess ? outputPath : string.Empty, error);
                }
            }
            catch (Exception ex)
            {
                // Log the exception for debugging
                Console.WriteLine("Exception: " + ex.Message);
                return (false, string.Empty, ex.Message);
            }
        }
    }
}
