# Force the script directory to be where the .ps1 file is actually located
$scriptDir = if ($PSScriptRoot) { 
    $PSScriptRoot 
} else { 
    Split-Path -Parent $MyInvocation.MyCommand.Path 
}

Write-Host "Script Directory: $scriptDir"

# Define Logs folder path
$logDir = Join-Path $scriptDir "Logs"
Write-Host "Log Directory: $logDir"

# Create Logs folder if not exists with error handling
try {
    if (-not (Test-Path $logDir)) {
        New-Item -ItemType Directory -Path $logDir -Force | Out-Null
        Write-Host "Created log directory: $logDir"
    }
    
    # Test write permissions by creating a test file
    $testFile = Join-Path $logDir "test.tmp"
    "test" | Out-File -FilePath $testFile -Force
    Remove-Item $testFile -Force
    Write-Host "Write permissions verified"
    
} catch {
    # Fallback to a location where SYSTEM definitely has permissions
    $logDir = "C:\ProgramData\HanwhaVision\Logs"
    Write-Host "Using fallback log directory: $logDir"
    
    if (-not (Test-Path $logDir)) {
        New-Item -ItemType Directory -Path $logDir -Force | Out-Null
    }
}

Write-Host "Starting monitoring loop..."

while ($true) {
    try {
        # Date-wise log file (e.g., 2025-09-29.log)
        $logFile = Join-Path $logDir ("{0}.log" -f (Get-Date -Format "yyyy-MM-dd"))
        
        # Perform request
        $response = Invoke-WebRequest -Uri "http://localhost:8090/" -UseBasicParsing -TimeoutSec 30
        
        $logMessage = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss'): Ping successful (Status: $($response.StatusCode))"
        Write-Host $logMessage
        
        # Use -Encoding UTF8 to ensure proper file writing
        Add-Content -Path $logFile -Value $logMessage -Encoding UTF8 -Force
        
    } catch {
        $logMessage = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss'): Ping failed - $($_.Exception.Message)"
        Write-Host $logMessage
        
        try {
            Add-Content -Path $logFile -Value $logMessage -Encoding UTF8 -Force
        } catch {
            # If even logging fails, write to Windows Event Log
            Write-EventLog -LogName Application -Source "HanwhaVision" -EventId 1001 -EntryType Warning -Message $logMessage -ErrorAction SilentlyContinue
        }
    }
    
    # Wait 10 seconds before next check
    Start-Sleep -Seconds 10
}