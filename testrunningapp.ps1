# Get the script directory (where the .ps1 is located)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Host("path = ",$scriptDir)
# Define Logs folder path
$logDir = Join-Path $scriptDir "Logs"
Write-Host("path = ",$logDir)

# Create Logs folder if not exists
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir | Out-Null
}

while ($true) {
    try {
        # Date-wise log file (e.g., 2025-09-29.log)
        $logFile = Join-Path $logDir ("{0}.log" -f (Get-Date -Format "yyyy-MM-dd"))

        # Perform request
        Invoke-WebRequest -Uri "http://localhost:8090/" -UseBasicParsing | Out-Null
        "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss'): Ping successful" | Out-File -FilePath $logFile -Append
    } catch {
        "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss'): Ping failed - $_" | Out-File -FilePath $logFile -Append
    }

    # Wait 10 seconds before next check
    Start-Sleep -Seconds 10
}
