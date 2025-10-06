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
        [string]$mongoInstallerUrl,
        [string]$mongoInstallerPath,
        [string]$installPath
    )

    if (-not (Test-Path "$installPath\bin\mongod.exe")) {
        Write-Host "==================== MongoDB Installation Started ===================="
        # Download the MongoDB MSI installer
        Invoke-WebRequest -Uri $mongoInstallerUrl -OutFile $mongoInstallerPath

        # Install MongoDB with the server component (no GUI)
        Start-Process msiexec.exe -ArgumentList "/i `"$mongoInstallerPath`" INSTALLLOCATION=`"$installPath`" ADDLOCAL=all /quiet /norestart" -Wait

        # Clean up the installer file
        Remove-Item $mongoInstallerPath

        # Verify the installation
        if (Test-Path "$installPath\bin\mongod.exe") {
                Write-Host "MongoDB installed successfully, and mongod.exe is available at $installPath\bin\"
        } else {
                Write-Error "MongoDB installation failed or mongod.exe was not installed."
                exit 1
        }
    } else {
        Write-Host "MongoDB is already installed."
    }

    # Add MongoDB to the system path
$env:Path += ";$installPath\bin"
[Environment]::SetEnvironmentVariable("Path", $env:Path, [System.EnvironmentVariableTarget]::Machine)

    Write-Host "==================== MongoDB Installation Completed ===================="
}

# Function to configure MongoDB service
function Configure-MongoDBService {
    param (
        [string]$installPath,
        [string]$configFile,
        [string]$logFile
    )

    Write-Host "==================== MongoDB Service Configuration Started ===================="

    # Create MongoDB data and log directories
    New-Item -Path "C:\data\db" -ItemType Directory -Force
    New-Item -Path "C:\data\log" -ItemType Directory -Force
    New-Item -Path $logFile -ItemType File -Force

    # Create MongoDB config file
    Set-Content -Path $configFile -Value @"
systemLog:
    destination: file
    path: c:/data/log/mongod.log
    logAppend: true
storage:
    dbPath: c:/data/db
net:
    bindIp: 127.0.0.1
    port: 27017
"@

    # Install MongoDB as a Windows service
    & "$installPath\bin\mongod.exe" --config $configFile --install

    # Check if MongoDB service is running
    $serviceName = "mongodb"
    if (-not (Get-Service -Name $serviceName -ErrorAction SilentlyContinue)) {
        & "$installPath\bin\mongod.exe" --config "$installPath\mongod.cfg" --install
    }

    $service = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
    if ($service -and $service.Status -ne 'Running') {
        Start-Service $serviceName
        Write-Host "MongoDB service started."
    } elseif (-not $service) {
        Write-Error "MongoDB service is not installed."
        exit 1
    } else {
        Write-Host "MongoDB service is already running."
    }

    Write-Host "==================== MongoDB Service Configuration Completed ===================="
}

# Function to set up MongoDB database and insert data
function Setup-MongoDBDatabase {
    param (
        [string]$downloadPath,
        [string]$mongoshInstallerPath,
        [string]$mongoshPath,
        [string]$mongoConnectionString,
        [string]$mongoScriptPath,
        [string]$logFile
    )

    Write-Host "==================== MongoDB Database Setup Started ===================="

    # Wait for MongoDB service to start
    Start-Sleep -Seconds 5

    # Check if mongosh is already installed
    if (-not (Test-Path "$mongoshPath\mongosh.exe")) {
        Write-Host "Installing MongoDB Shell with logging from local file..."
    # Download the MongoDB Shell MSI installer
    Write-Host "Downloading MongoDB Shell..."
    Invoke-WebRequest -Uri $mongoshInstallerPath -OutFile $downloadPath


        # Install the MSI package with logging and silent install
    Write-Host "Installing MongoDB Shell with logging..."
    Start-Process -FilePath "msiexec.exe" -ArgumentList "/i `"$downloadPath`" /qn INSTALLLOCATION=`"$mongoshPath`" ALLUSERS=1 /l*v `"$logFile`"" -Wait


        if (-not (Test-Path "$mongoshPath\mongosh.exe")) {
            Write-Host "Failed to install MongoDB Shell."
            Write-Host "Check the log file at $logFile for details."
            exit
        }
    } else {
        Write-Host "MongoDB Shell is already installed at $mongoshPath."
    }

    # Define MongoDB database and collection names
    $dbName = "TestDB2401"
    $collectionName = "Employee"

    # Create a JavaScript script to run via mongosh
    $mongoScript = @"
print('Starting script...');

const dbName = '$dbName';
const collectionName = '$collectionName';

 print(``Switching to database: ${dbName}``);
use(dbName);

print(``Creating collection: ${collectionName}``);
db.createCollection(collectionName);

print('Inserting sample documents...');
db[collectionName].insertMany([
    { firstname: "Himansu", lastname: "Mohanthy", gender: "Male", city: "Chennai" },
    { firstname: "James", lastname: "Hoking", gender: "Male", city: "LA" },
    { firstname: "Rowdy", lastname: "Rack", gender: "Female", city: "Chicago" },
    { firstname: "Judy", lastname: "Bange", gender: "male", city: "New York" },
]);

 print(``Database '${dbName}' and collection '${collectionName}' created successfully with sample data.``);
"@

    # Define the paths
    $dataFolderPath = "C:\data"
    $mongoScriptPath = "$dataFolderPath\create_db_and_collection.js"

    # Check if the data folder exists, if not, create it
    if (-not (Test-Path $dataFolderPath)) {
        New-Item -Path $dataFolderPath -ItemType Directory
        Write-Host "Created data directory at $dataFolderPath."
    }

    Set-Content -Path $mongoScriptPath -Value $mongoScript -Encoding UTF8

    # Run the MongoDB shell to execute the script
    Write-Host "Creating database, collection, and inserting sample data..."
    $process = Start-Process -FilePath "$mongoshPath\mongosh.exe" -ArgumentList "$mongoConnectionString --file `"$mongoScriptPath`"" -Wait -PassThru -RedirectStandardOutput C:\data\mongosh_output.log -RedirectStandardError C:\data\mongosh_error.log -NoNewWindow

    Write-Host "mongosh execution output:"
    Get-Content C:\data\mongosh_output.log
    Get-Content C:\data\mongosh_error.log

    if ($process.ExitCode -eq 0) {
        Write-Host "Database $dbName and collection $collectionName created successfully with sample data."
    } else {
        Write-Host "Failed to create database and collection. Exit code: $($process.ExitCode)"
    }

    Write-Host "==================== MongoDB Database Setup Completed ===================="
}

#Mongo Function Started

function Ensure-IISDependencies {
    $features = @(
        "IIS-WebServerRole",              # IIS Web Server
        "IIS-ManagementScriptingTools",   # IIS Management Scripts and Tools
        "IIS-ManagementConsole"           # IIS Management Console
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

# Import IIS Administration Module
Import-Module WebAdministration -ErrorAction Stop

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

#Mongo Function Ended


#NetCore-Hosting Installation Started

function Install-AspNetCoreHostingBundle {
    param (
        [string]$DownloadUrl,
        [string]$InstallerName = "dotnet-hosting-9.0.0-win.exe"
    )

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


# Main script execution
$mongoInstallerUrl = "https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-7.0.12-signed.msi"
$mongoshInstallerPath = "https://downloads.mongodb.com/compass/mongosh-2.3.0-x64.msi"
$installPath = "C:\Program Files\MongoDB\Server\7.0\"
$mongoshPath = "C:\Program Files\mongosh\"
$logFile = "C:\data\log\mongod.log"
$configFile = "C:\Program Files\MongoDB\Server\7.0\mongod.cfg"
$mongoConnectionString = "mongodb://localhost:27017/"
$mongoScriptPath = "C:\data\create_db_and_collection.js"
$mongoInstallerPath = "$env:TEMP\mongodb-full.msi"
$downloadPath = "$env:TEMP\mongosh.msi"
$logFile = "$env:TEMP\mongosh_install.log" 

# App Hosting variable 
$SiteName = "MyApp"                         # Name of the IIS website
$PhysicalPath = Join-Path -Path $PSScriptRoot -ChildPath "Publish"     # Path to the publish folder
#$PhysicalPath = "C:\Users\Test\Desktop\RemotePC\Publish"     # Path to the publish folder
#$PhysicalPath = "C:\Users\adnan.mansuri\Desktop\All_Script_File\Publish"     # Path to the publish folder
$Port = 8080                                # Port number for the site
$AppPoolName = "MyAppPool"                  # Name of the Application Pool
$DefaultSiteName = "Default Web Site"       # Default IIS website name

#NetCore-Hosting URL
$NetHostingInstallerUrl = "https://download.visualstudio.microsoft.com/download/pr/e1ae9d41-3faf-4755-ac27-b24e84eef3d1/5e3a24eb8c1a12272ea1fe126d17dfca/dotnet-hosting-9.0.0-win.exe"

#Set-ExecutionPolicy Unrestricted -Scope CurrentUser
#Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole -All -NoRestart

Install-AspNetCoreHostingBundle -DownloadUrl $NetHostingInstallerUrl

Install-MongoDB -mongoInstallerUrl $mongoInstallerUrl -mongoInstallerPath $mongoInstallerPath -installPath $installPath
Configure-MongoDBService -installPath $installPath -configFile $configFile -logFile $logFile
Setup-MongoDBDatabase -downloadPath $downloadPath -mongoshInstallerPath $mongoshInstallerPath -mongoshPath $mongoshPath -mongoConnectionString $mongoConnectionString -mongoScriptPath $mongoScriptPath -logFile $logFile
#Get-Process -Name "*MongoDBCompass*" | Stop-Process
#UninstallMongoCompass


Ensure-IISDependencies #Ensure installing IIS features


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
        Write-Host "Batch file 'run_installer.bat' removed successfully."
    }
} catch {
    Write-Warning "Failed to delete run_installer.bat: $_"
}
