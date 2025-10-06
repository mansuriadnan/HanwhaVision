# ============================ MongoDB Installation Script ============================

function GetUninstallString($productName) {
    $x64items = @(Get-ChildItem "HKLM:SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall")
    $x64userItems = @(Get-ChildItem "HKCU:SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall")
    ($x64items + $x64userItems + @(Get-ChildItem "HKLM:SOFTWARE\wow6432node\Microsoft\Windows\CurrentVersion\Uninstall") `
        | ForEach-object { Get-ItemProperty Microsoft.PowerShell.Core\Registry::$_ } `
        | Where-Object { $_.DisplayName -and $_.DisplayName.contains($productName) } `
        | Select UninstallString).UninstallString
}

function UninstallMongoCompass {
    $uninstallCommand = (GetUninstallString "MongoDB Compass")
    if($uninstallCommand) {
        Write-Host "Uninstalling Mongo Compass"

            $uninstallCommand = $uninstallCommand.replace('--uninstall', '').replace('"', '')
            & $uninstallCommand --uninstall

        Write-Host "Uninstalled Mongo Compass" -ForegroundColor Green
    }
}

# Function to install MongoDB
function Install-MongoDB {
    param (
        [string]$mongoInstallerPath,  # Full path to the existing MSI installer
        [string]$installPath          # Where MongoDB should be installed
    )

    $minRequiredVersion = [version]"7.0"
    $mongoBasePath = "C:\Program Files\MongoDB\Server"
    $installedVersion = $null

    if (Test-Path $mongoBasePath) {
        $versionDirs = Get-ChildItem -Path $mongoBasePath -Directory | Select-Object -ExpandProperty Name
        $validVersions = $versionDirs | Where-Object { $_ -match '^\d+\.\d+(\.\d+)?$' } | ForEach-Object { [version]$_ }
        if ($validVersions.Count -gt 0) {
            $installedVersion = ($validVersions | Sort-Object -Descending)[0]
            Write-Host "MongoDB version $installedVersion found."
        }
    }

    if ($installedVersion -ne $null -and $installedVersion -ge $minRequiredVersion) {
        Write-Host "MongoDB version $installedVersion is >= 7.0. Skipping installation."
    } elseif (-not (Test-Path "$installPath\bin\mongod.exe")) {
        Write-Host "==================== MongoDB Installation Started ===================="

        if (-not (Test-Path $mongoInstallerPath)) {
            Write-Error "MongoDB installer not found at path: $mongoInstallerPath"
            exit 1
        }

        # Install MongoDB with the server component (no GUI)
        Start-Process msiexec.exe -ArgumentList "/i `"$mongoInstallerPath`" INSTALLLOCATION=`"$installPath`" ADDLOCAL=all /quiet /norestart" -Wait

        # Verify the installation
        if (Test-Path "$installPath\bin\mongod.exe") {
            Write-Host "MongoDB installed successfully, and mongod.exe is available at $installPath\bin\"
        } else {
            Write-Error "MongoDB installation failed or mongod.exe was not installed."
            exit 1
        }
    } else {
        Write-Host "MongoDB is already installed at $installPath."
    }

    # Add MongoDB to the system path
    if ($env:Path -notlike "*$installPath\bin*") {
        $env:Path += ";$installPath\bin"
        [Environment]::SetEnvironmentVariable("Path", $env:Path, [System.EnvironmentVariableTarget]::Machine)
        Write-Host "MongoDB path added to system PATH."
    }

    Write-Host "==================== MongoDB Installation Completed ===================="
}
function Install-MongoDBTools {
    param (
        [string]$toolsInstallerUrl,
        [string]$toolsInstallPath
    )

    if (-not (Test-Path "$toolsInstallPath\bin")) {
        Write-Host "==================== MongoDB Tools Installation Started ===================="

       # Write-Host "Downloading MongoDB Database Tools from $toolsInstallerUrl..."
       # Invoke-WebRequest -Uri $toolsInstallerUrl -OutFile $toolsInstaller

        Write-Host "Installing MongoDB Database Tools..."
        Start-Process msiexec.exe -ArgumentList "/i `"$toolsInstallerUrl`" INSTALLLOCATION=`"$toolsInstallPath`" /quiet /norestart" -Wait

        # Confirm install
        if (Test-Path "$toolsInstallPath\bin") {
            Write-Host "MongoDB Tools installed successfully at $toolsInstallPath"
        } else {
            Write-Warning "MongoDB Tools installation failed or expected path missing."
            return
        }
    } else {
        Write-Host "MongoDB Tools already installed at $toolsInstallPath"
    }

    # Update system PATH
    if ($env:Path -notlike "*$toolsInstallPath\bin*") {
        $env:Path += ";$toolsInstallPath\bin"
        [Environment]::SetEnvironmentVariable("Path", $env:Path, [System.EnvironmentVariableTarget]::Machine)
        Write-Host "MongoDB Tools path added to system PATH."
    }

    Write-Host "==================== MongoDB Tools Installation Completed ===================="
}

# Function to configure MongoDB service

function Configure-MongoDBService {
    param (
        [string]$installPath,
        [string]$configFile,
        [string]$logFile
    )

    Write-Host "==================== MongoDB Service Configuration Started ===================="

    $serviceName = "mongodb"
    $service = Get-Service -Name $serviceName -ErrorAction SilentlyContinue

    # Check if MongoDB service is already running and healthy
    if ($service -and $service.Status -eq 'Running') {
        Write-Host "MongoDB service '$serviceName' is already running. No changes required."
        Write-Host "==================== MongoDB Service Configuration Completed ===================="
        return # Exit the function if service is already running
    }

    # If service exists but is not running, or if it doesn't exist at all, proceed with configuration/reinstallation

    # Stop and potentially remove existing MongoDB service if it exists but is not running
    if ($service) { # Service exists but is not running (e.g., stopped, pending)
        Write-Host "MongoDB service '$serviceName' found but not running. Attempting to stop (if pending) and uninstall."
        Stop-Service -Name $serviceName -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 5 # Give it a moment to release file handles

        Write-Host "Attempting to uninstall existing MongoDB service..."
        & "$installPath\bin\mongod.exe" --remove --serviceName $serviceName -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2 # Give it time to uninstall
    }

    # Ensure log and config files are not locked before creating/overwriting
    if (Test-Path $logFile) {
        Write-Host "Deleting existing log file: $logFile"
        Remove-Item -Path $logFile -Force -ErrorAction SilentlyContinue
    }
    if (Test-Path $configFile) {
        Write-Host "Deleting existing config file: $configFile"
        Remove-Item -Path $configFile -Force -ErrorAction SilentlyContinue
    }

    # Create MongoDB data and log directories
    Write-Host "Creating data and log directories..."
    New-Item -Path "C:\Program Files\MongoDB\Server\7.0\data\" -ItemType Directory -Force | Out-Null
    New-Item -Path "C:\Program Files\MongoDB\Server\7.0\log\" -ItemType Directory -Force | Out-Null
    New-Item -Path $logFile -ItemType File -Force | Out-Null


    # Create MongoDB config file
    Write-Host "Creating MongoDB configuration file..."
    Set-Content -Path $configFile -Value @"
systemLog:
    destination: file
    path: C:\Program Files\MongoDB\Server\7.0\log\mongod.log
    logAppend: true
storage:
    dbPath: C:\Program Files\MongoDB\Server\7.0\data\
net:
    bindIp: 127.0.0.1
    port: 27017
security:
    authorization: enabled
"@

    # Install MongoDB as a Windows service
    Write-Host "Installing MongoDB as a Windows service..."
    & "$installPath\bin\mongod.exe" --config $configFile --install --serviceName $serviceName

    # Check if MongoDB service is installed and start it
    $service = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
    if (-not $service) {
        Write-Error "MongoDB service failed to install."
        exit 1
    } elseif ($service.Status -ne 'Running') {
        Write-Host "Starting MongoDB service..."
        Start-Service $serviceName
        # Wait for the service to actually start
        Wait-Service -Name $serviceName -Timeout 60 # Wait up to 60 seconds for the service to start
        Write-Host "MongoDB service started."
    } else {
        Write-Host "MongoDB service is already running (after potential reinstallation)."
    }

    Write-Host "==================== MongoDB Service Configuration Completed ===================="
}
# Function to set up MongoDB database and insert data
function Setup-MongoDBDatabase {
    param (
        [string]$mongoshInstallerPath,
        [string]$mongoshPath,
        [string]$mongoConnectionString,
        [string]$mongoScriptPath,
        [string]$logFile
    )
    Write-Host "==================== MongoDB Database Setup Started ===================="
    
    # Use MongoDB's existing data folder for temporary script storage
    $mongoDataPath = "C:\Program Files\MongoDB\Server\7.0\data"
    $mongoLogPath = "C:\Program Files\MongoDB\Server\7.0\log"
    
    # Verify MongoDB folders exist
    if (-not (Test-Path $mongoDataPath)) {
        Write-Host "Warning: MongoDB data folder not found at $mongoDataPath"
    } else {
        Write-Host "Using MongoDB data folder at $mongoDataPath"
    }
    
    if (-not (Test-Path $mongoLogPath)) {
        Write-Host "Warning: MongoDB log folder not found at $mongoLogPath"
    } else {
        Write-Host "Using MongoDB log folder at $mongoLogPath"
    }
    
    # Wait for MongoDB service to start
    Start-Sleep -Seconds 5
    
    # Check if mongosh is already installed
    if (-not (Test-Path "$mongoshPath\mongosh.exe")) {
        Write-Host "Installing MongoDB Shell with logging from local file..."
        # Install the MSI package with logging and silent install
        Write-Host "Installing MongoDB Shell with logging..."
       # Start-Process -FilePath "msiexec.exe" -ArgumentList "/i `"$mongoshInstallerPath`" /qn INSTALLLOCATION=`"$mongoshPath`" ALLUSERS=1 /l*v `"$logFile`"" -Wait
        
        if (-not (Test-Path "$mongoshPath\mongosh.exe")) {
            Write-Host "Failed to install MongoDB Shell."
            Write-Host "Check the log file at $logFile for details."
            exit
        }
    } else {
        Write-Host "MongoDB Shell is already installed at $mongoshPath."
    }
    
    # Define MongoDB database and collection names
    $dbName = "visioninsightBIDashboard"
    $collectionName = "Test"
    
    # Create a JavaScript script to run via mongosh
    $mongoScript = @"
print('Starting database and collection setup...');
const dbName = '$dbName';
const collectionName = '$collectionName';

// Check if database already exists
const existingDbs = db.adminCommand('listDatabases').databases;
const dbExists = existingDbs.some(database => database.name === dbName);

if (dbExists) {
    print(``Database ${dbName} already exists. Skipping creation.``);
    
    use(dbName);
    
    // Check if collection exists
    const collections = db.getCollectionNames();
    if (collections.includes(collectionName)) {
        print(``Collection ${collectionName} already exists in database ${dbName}.``);
    } else {
        print(``Creating collection: ${collectionName}``);
        db.createCollection(collectionName);
        print(``Collection ${collectionName} created successfully.``);
    }
} else {
    print(``Creating database: ${dbName}``);
    use(dbName);
    print(``Creating collection: ${collectionName}``);
    db.createCollection(collectionName);
    print(``Database ${dbName} and collection ${collectionName} created successfully.``);
}
"@
    
    # Create temporary script file in MongoDB data folder
    $tempScriptPath = "$mongoDataPath\create_db_and_collection.js"
    
    # Create the MongoDB script file
    Set-Content -Path $tempScriptPath -Value $mongoScript -Encoding UTF8
    Write-Host "Created temporary MongoDB script at $tempScriptPath"
    
    # Run the MongoDB shell to execute the script
    Write-Host "Creating database '$dbName' and collection '$collectionName'..."
    $process = Start-Process -FilePath "$mongoshPath\mongosh.exe" `
        -ArgumentList "$mongoConnectionString --file `"$tempScriptPath`"" `
        -Wait -PassThru `
        -RedirectStandardOutput "$mongoLogPath\mongosh_output.log" `
        -RedirectStandardError "$mongoLogPath\mongosh_error.log" `
        -WindowStyle Hidden
    
    Write-Host "mongosh execution output:"
    if (Test-Path "$mongoLogPath\mongosh_output.log") {
        Get-Content "$mongoLogPath\mongosh_output.log"
    }
    if (Test-Path "$mongoLogPath\mongosh_error.log") {
        Get-Content "$mongoLogPath\mongosh_error.log"
    }
    
    # Clean up temporary script file
    if (Test-Path $tempScriptPath) {
        Remove-Item $tempScriptPath -Force
        Write-Host "Cleaned up temporary script file."
    }
    
    if ($process.ExitCode -eq 0) {
        Write-Host "Database '$dbName' and collection '$collectionName' created successfully."
    } else {
        Write-Host "Failed to create database and collection. Exit code: $($process.ExitCode)"
    }
    
    Write-Host "==================== MongoDB Database Setup Completed ===================="
}

#Mongo Function Ended

function Ensure-IISDependencies {
    $features = @(
        "IIS-WebServerRole",
        "IIS-WebServer",               # Core IIS Web Server
        "IIS-ManagementScriptingTools",    # Scripting tools
        "IIS-WebMgmtTools",                # IIS Manager GUI (inetmgr)
        "IIS-ManagementService"            # Web Management Service (remote mgmt)
    )

    foreach ($feature in $features) {
        Write-Host "Loop $feature is started."
        $featureStatus = (dism /online /Get-FeatureInfo /FeatureName:$feature 2>&1 | Select-String "State :")

        if ($featureStatus -and $featureStatus -match "Enabled") {
            Write-Host "$feature is already enabled."
        } else {
            Write-Host "Enabling: $feature..."
            Start-Process "dism.exe" -ArgumentList "/online", "/Enable-Feature", "/FeatureName:$feature", "/All", "/NoRestart" -Wait -WindowStyle Hidden
        }
    }
}




# Function: Create Application Pool
function Create-AppPool {
    Write-Host "==================== Starting IIS Hosting Setup ===================="

    Write-Host "Checking if Application Pool '$AppPoolName' exists..."
    if (!(Get-ChildItem IIS:\AppPools | Where-Object { $_.Name -eq $AppPoolName })) {
        New-WebAppPool -Name $AppPoolName
        Write-Host "Application Pool '$AppPoolName' created successfully."
    } else {
        Write-Host "Application Pool '$AppPoolName' already exists."
    }
}

# Function: Stop Default Website
function Stop-DefaultWebsite {
    param ([string]$DefaultSiteName)

    Write-Host "Stopping Default Web Site..."
    Stop-Website -Name $DefaultSiteName -ErrorAction SilentlyContinue
    Write-Host "Default Web Site stopped."
}

# Function: Create IIS Website
function Create-Website {
    param (
        [string]$SiteName,
        [string]$PhysicalPath,
        [int]$Port,
        [string]$AppPoolName
    )

    Write-Host "Checking if IIS Website '$SiteName' exists..."
    if (!(Get-ChildItem IIS:\Sites | Where-Object { $_.Name -eq $SiteName })) {
        New-Website -Name $SiteName -PhysicalPath $PhysicalPath -Port $Port -ApplicationPool $AppPoolName
        Write-Host "Website '$SiteName' created successfully on port $Port."
    } else {
        Write-Host "Website '$SiteName' already exists."
    }
}

# Function: Configure Folder Permissions
function Configure-Permissions {
    param ([string]$PhysicalPath)

    Write-Host "Configuring folder permissions for IIS_IUSRS..."
    try {
        $Acl = Get-Acl $PhysicalPath
        $AccessRule = New-Object System.Security.AccessControl.FileSystemAccessRule(
            "IIS_IUSRS", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow"
        )
        $Acl.SetAccessRule($AccessRule)
        Set-Acl -Path $PhysicalPath -AclObject $Acl
        Write-Host "Permissions successfully configured for IIS_IUSRS."
    } catch {
        Write-Error "Failed to configure permissions. Error: $_"
    }
}

# Function: Start IIS Website
function Start-WebsiteSafely {
    param ([string]$SiteName)

    Write-Host "Starting IIS Website '$SiteName'..."
    Start-Website -Name $SiteName -ErrorAction SilentlyContinue
    Write-Host "Website '$SiteName' started successfully."
    Write-Host "==================== IIS hosting setup completed successfully! ===================="
}

#NetCore-Hosting Installation Started

function Install-AspNetCoreHostingBundle {
    param (
        [string]$DownloadUrl,
        [string]$InstallerName = "dotnet-hosting-9.0.0-win.exe"
    )
 Write-Host "scriptDir - $scriptDir"
    # Define the path where the installer will be saved
    $outputPath = "$env:TEMP\$InstallerName"
    $requiredVersion = "9.0.0"  # Expected version to avoid reinstallation

    # Check if ASP.NET Core Hosting Bundle is already installed using registry or package detection
    $installed = Get-WmiObject -Query "SELECT * FROM Win32_Product WHERE Name LIKE '%ASP.NET Core%' AND Version LIKE '$requiredVersion%'" `
                  -ErrorAction SilentlyContinue

    if ($installed) {
        Write-Host "ASP.NET Core Hosting Bundle version $requiredVersion is already installed."
        return
    }

    try {
        # Download the installer
        Write-Host "Downloading ASP.NET Core Hosting Bundle from $DownloadUrl..."
        Invoke-WebRequest -Uri $DownloadUrl -OutFile $outputPath

        # Install the bundle silently
        Write-Host "Installing ASP.NET Core Hosting Bundle..."
        Start-Process -FilePath $outputPath -ArgumentList "/install", "/quiet", "/norestart" -Wait

        Write-Host "ASP.NET Core Hosting Bundle installation completed successfully."
    }
    catch {
        Write-Error "An error occurred during the installation process: $_"
    }
    finally {
        # Clean up the installer
        if (Test-Path $outputPath) {
            Write-Host "Cleaning up..."
            Remove-Item -Path $outputPath -Force
        }
    }
}


#NetCore-Hosting Installation Ended 

#NetCore SDK Installation Started

function Install-DotNetSDK {
    param (
        [string]$InstallerPath,
        [string]$MinimumRequiredVersion = "8.0.100"
    )
    
    # Helper to convert version strings to System.Version safely
    function Convert-ToVersion($versionStr) {
        try {
            return [Version]$versionStr
        } catch {
            return $null
        }
    }
    
    $minVersion = Convert-ToVersion $MinimumRequiredVersion
    $dotnetPath = "$env:ProgramFiles\dotnet"
    
    # Get installed .NET SDK versions
    $installedVersions = & "$dotnetPath\dotnet.exe" --list-sdks 2>$null |
        ForEach-Object { ($_ -split '\s+')[0] } |
        ForEach-Object { Convert-ToVersion $_ } |
        Where-Object { $_ -ne $null }
    
        Write-Host "installedVersions =  $installedVersions."
    # Check if any version is >= minimum required
    $isInstalled = $installedVersions | Where-Object { $_ -ge $minVersion }
    
    if ($isInstalled) {
        Write-Host ".NET SDK version $MinimumRequiredVersion or higher is already installed."
        # Still check and update PATH if needed
        Update-DotNetPath -DotNetPath $dotnetPath
        return
    }
    
    try {
        if (-Not (Test-Path $InstallerPath)) {
            Write-Error "Installer not found at: $InstallerPath"
            return
        }
        
        Write-Host "Installing .NET SDK from $InstallerPath ..."
        Start-Process -FilePath $InstallerPath -ArgumentList "/install", "/quiet", "/norestart" -Wait
        Write-Host ".NET SDK installed successfully."
        
        # Add .NET to PATH after installation
        Update-DotNetPath -DotNetPath $dotnetPath
        
    }
    catch {
        Write-Error "An error occurred during the SDK installation: $_"
    }
}

function Update-DotNetPath {
    param (
        [string]$DotNetPath
    )
    
    # Check if .NET path is already in the system PATH
    $currentPath = [Environment]::GetEnvironmentVariable("PATH", [EnvironmentVariableTarget]::Machine)
    
    if ($currentPath -notlike "*$DotNetPath*") {
        Write-Host "Adding .NET to system PATH..."
        
        try {
            # Add to machine-level PATH (requires admin privileges)
            $newPath = "$currentPath;$DotNetPath"
            [Environment]::SetEnvironmentVariable("PATH", $newPath, [EnvironmentVariableTarget]::Machine)
            
            # Also update current session PATH
            $env:PATH = "$env:PATH;$DotNetPath"
            
            Write-Host ".NET path added to system PATH successfully."
        }
        catch {
            Write-Warning "Failed to update system PATH (may require administrator privileges): $_"
            Write-Host "You may need to manually add '$DotNetPath' to your PATH environment variable."
        }
    }
    else {
        Write-Host ".NET path is already in system PATH."
    }
}

#NetCore SDK Installation Ended

# Main script execution

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$newDir = Join-Path $scriptDir "Publish"


$InsatalltionFile = "Depedencies" 
$mongoInstallerPath = Join-Path $scriptDir  "$InsatalltionFile\mongodb-windows-x86_64-7.0.12-signed-2908.msi"
#$mongoInstallerPath = "C:\Users\adnan.mansuri\Downloads\mongodb-windows-x86_64-7.0.12-signed-2908.msi"
#$mongoshInstallerPath = "C:\Users\adnan.mansuri\Downloads\mongosh-2.3.0-x64-2908.msi"
$mongoshInstallerPath = Join-Path $scriptDir  "$InsatalltionFile\mongosh-2.3.0-x64-2908.msi"
#$toolsInstallerUrl = "C:\Users\adnan.mansuri\Downloads\mongodb-database-tools-windows-x86_64-100.11.0.msi"
$toolsInstallerUrl = Join-Path $scriptDir  "$InsatalltionFile\mongodb-database-tools-windows-x86_64-100.11.0.msi"
#$toolsInstallerUrl = "https://fastdl.mongodb.org/tools/db/mongodb-database-tools-windows-x86_64-100.12.2.msi"
$installPath = "C:\Program Files\MongoDB\Server\7.0\"
$mongoshToolPath = "C:\Program Files\MongoDB\Server\7.0\bin\"
$toolsInstallPath = "C:\Program Files\MongoDB\Tools"
$mongoshPath = "C:\Program Files\mongosh\"
$logFile = "C:\data\log\mongod.log"
$configFile = "C:\Program Files\MongoDB\Server\7.0\mongod.cfg"
$mongoConnectionString = "mongodb://localhost:27017/"
$mongoScriptPath = "C:\data\create_db_and_collection.js"
#$mongoInstallerPath = "$env:TEMP\mongodb-full.msi"
$downloadPath = "$env:TEMP\mongosh.msi"
$logFile = "$env:TEMP\mongosh_install.log" 

# App Hosting variable 
$SiteName = "MyApp"                         # Name of the IIS website
$PhysicalPath = $newDir     # Path to the publish folder
#$PhysicalPath = "C:\Users\Test\Desktop\RemotePC\Publish"     # Path to the publish folder
#$PhysicalPath = "C:\Users\adnan.mansuri\Desktop\All_Script_File\Publish"     # Path to the publish folder
$Port = 8080                                # Port number for the site
$AppPoolName = "MyAppPool"                  # Name of the Application Pool
$DefaultSiteName = "Default Web Site"       # Default IIS website name

Ensure-IISDependencies #Ensure installing IIS features

#NetCore-Hosting URL
$NetHostingInstallerUrl = Join-Path $scriptDir  "$InsatalltionFile\dotnet-hosting-9.0.0-win.exe"
$NetSDKInstallerUrl = Join-Path $scriptDir  "$InsatalltionFile\dotnet-sdk-8.0.412-win-x64.exe"

# Wait briefly to ensure system updates features
Start-Sleep -Seconds 5

# Try importing the module
try {
    Import-Module WebAdministration -ErrorAction Stop
    Write-Host "WebAdministration module imported successfully."
} catch {
    Write-Error "Failed to import WebAdministration module. IIS components may not be fully installed."
}

#Set-ExecutionPolicy Unrestricted -Scope CurrentUser
#Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole -All -NoRestart

Install-AspNetCoreHostingBundle -DownloadUrl $NetHostingInstallerUrl
Install-DotNetSDK -InstallerPath $NetSDKInstallerUrl 


#Install-MongoDB -mongoInstallerUrl $mongoInstallerUrl -mongoInstallerPath $mongoInstallerPath -installPath $installPath
Install-MongoDB -mongoInstallerPath $mongoInstallerPath -installPath $installPath
Install-MongoDBTools  -toolsInstallerUrl  $toolsInstallerUrl -toolsInstallPath $toolsInstallPath

Configure-MongoDBService -installPath $installPath -configFile $configFile -logFile $logFile
Setup-MongoDBDatabase -downloadPath $downloadPath -mongoshInstallerPath $mongoshInstallerPath -mongoshPath $mongoshPath -mongoConnectionString $mongoConnectionString -mongoScriptPath $mongoScriptPath -logFile $logFile
#Get-Process -Name "*MongoDBCompass*" | Stop-Process
#UninstallMongoCompass




Create-AppPool -AppPoolName $AppPoolName
Stop-DefaultWebsite -DefaultSiteName $DefaultSiteName
Create-Website -SiteName $SiteName -PhysicalPath $PhysicalPath -Port $Port -AppPoolName $AppPoolName
Configure-Permissions -PhysicalPath $PhysicalPath
Start-WebsiteSafely -SiteName $SiteName

# ============================ End of Script ============================
# === Optional Cleanup ===
try {
    $batFilePath = Join-Path -Path $PSScriptRoot -ChildPath "run_installer.bat"
    if (Test-Path $batFilePath) {
        Remove-Item $batFilePath -Force
    }
} catch {
    Write-Warning "Failed to delete run_installer.bat: $_"
}
