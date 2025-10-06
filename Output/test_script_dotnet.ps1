Write-Host "=== SIMPLE .NET DEBUG ===" -ForegroundColor Yellow

# 1. Check file system locations
Write-Host "`n--- FILE SYSTEM CHECK ---" -ForegroundColor Cyan
$locations = @(
    "${env:ProgramFiles}\dotnet",
    "${env:ProgramFiles(x86)}\dotnet", 
    "${env:USERPROFILE}\.dotnet"
)

foreach ($location in $locations) {
    Write-Host "Checking: $location"
    if (Test-Path $location) {
        Write-Host "  EXISTS" -ForegroundColor Green
        
        # Check dotnet.exe
        $dotnetExe = Join-Path $location "dotnet.exe"
        if (Test-Path $dotnetExe) {
            Write-Host "  dotnet.exe: EXISTS" -ForegroundColor Green
        } else {
            Write-Host "  dotnet.exe: NOT FOUND" -ForegroundColor Red
        }
        
        # Check SDK folder
        $sdkPath = Join-Path $location "sdk"
        if (Test-Path $sdkPath) {
            Write-Host "  SDK folder: EXISTS" -ForegroundColor Green
            $sdkDirs = Get-ChildItem -Path $sdkPath -Directory -ErrorAction SilentlyContinue
            foreach ($dir in $sdkDirs) {
                Write-Host "    SDK Version: $($dir.Name)" -ForegroundColor White
            }
        } else {
            Write-Host "  SDK folder: NOT FOUND" -ForegroundColor Red
        }
        
    } else {
        Write-Host "  DOES NOT EXIST" -ForegroundColor Gray
    }
}

# 2. Check registry
Write-Host "`n--- REGISTRY CHECK ---" -ForegroundColor Cyan
$regPaths = @(
    "HKLM:\SOFTWARE\dotnet\Setup\InstalledVersions\x64\sdk",
    "HKLM:\SOFTWARE\dotnet\Setup\InstalledVersions\x86\sdk",
    "HKLM:\SOFTWARE\WOW6432Node\dotnet\Setup\InstalledVersions\x64\sdk",
    "HKLM:\SOFTWARE\WOW6432Node\dotnet\Setup\InstalledVersions\x86\sdk"
)

foreach ($regPath in $regPaths) {
    Write-Host "Checking: $regPath"
    if (Test-Path $regPath) {
        Write-Host "  EXISTS" -ForegroundColor Green
        $items = Get-ChildItem -Path $regPath -ErrorAction SilentlyContinue
        foreach ($item in $items) {
            Write-Host "    Version: $($item.PSChildName)" -ForegroundColor White
        }
    } else {
        Write-Host "  DOES NOT EXIST" -ForegroundColor Gray
    }
}

# 3. Check PATH
Write-Host "`n--- PATH CHECK ---" -ForegroundColor Cyan
$machinePath = [Environment]::GetEnvironmentVariable("PATH", "Machine")
$userPath = [Environment]::GetEnvironmentVariable("PATH", "User")

Write-Host "Machine PATH dotnet entries:"
if ($machinePath) {
    $machineEntries = $machinePath -split ';' | Where-Object { $_ -like '*dotnet*' }
    if ($machineEntries) {
        foreach ($entry in $machineEntries) {
            Write-Host "  $entry" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  None found" -ForegroundColor Gray
    }
}

Write-Host "User PATH dotnet entries:"
if ($userPath) {
    $userEntries = $userPath -split ';' | Where-Object { $_ -like '*dotnet*' }
    if ($userEntries) {
        foreach ($entry in $userEntries) {
            Write-Host "  $entry" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  None found" -ForegroundColor Gray
    }
}

# 4. Test global command
Write-Host "`n--- GLOBAL COMMAND TEST ---" -ForegroundColor Cyan
try {
    $result = dotnet --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Global dotnet works: $result" -ForegroundColor Green
    } else {
        Write-Host "Global dotnet failed" -ForegroundColor Red
    }
} catch {
    Write-Host "Global dotnet not found" -ForegroundColor Red
}

Write-Host "`n=== DEBUG COMPLETE ===" -ForegroundColor Yellow