using HanwhaClient.Core.Interfaces;

namespace HanwhaClient.Core.Services
{
    public class FileLogger : IFileLogger
    {
        private static readonly string logDirectory = Path.Combine(Directory.GetCurrentDirectory(), "Logs");

        public void Log(string message)
        {
            try
            {
                // Ensure Logs directory exists
                if (!Directory.Exists(logDirectory))
                    Directory.CreateDirectory(logDirectory);

                // Build file path like "Logs/2025-06-04-log.txt"
                string fileName = $"{DateTime.Now:yyyy-MM-dd}-log.txt";
                string logFilePath = Path.Combine(logDirectory, fileName);

                // Format log message
                string logMessage = $"{DateTime.Now:yyyy-MM-dd HH:mm:ss} | {message}";

                // Write to log file
                File.AppendAllText(logFilePath, logMessage + Environment.NewLine);
            }
            catch (Exception ex)
            {
                // Optional: handle logging exceptions silently
            }
        }
    }
}
