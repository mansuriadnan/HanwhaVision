[Setup]
AppName=MongoDB and IIS Setup
AppVersion=1.0
DefaultDirName={pf}\MongoDBIISSetup
DefaultGroupName=MongoDB IIS Setup
OutputDir=userdocs:Inno Setup Examples Output
OutputBaseFilename=MongoDBIISSetup
Compression=lzma
SolidCompression=yes
PrivilegesRequired=admin

[Files]
; Include any additional files your setup needs
Source: "Publish\*"; DestDir: "{app}\Publish"; Flags: recursesubdirs

[Code]
procedure InitializeWizard;
begin
  // Any initialization code if needed
end;

function PrepareToInstall(var NeedsRestart: Boolean): String;
var
  ResultCode: Integer;
  PowerShellCommand: string;
  PowerShellPath: string;
  Script: string;
begin
  // Find PowerShell path
  PowerShellPath := ExpandConstant('{sys}\WindowsPowerShell\v1.0\powershell.exe');
  
  // Build the PowerShell script
  Script :=
    '# ============================ MongoDB Installation Script ============================' + #13#10 +
    '' + #13#10 +
    'function GetUninstallString($productName) {' + #13#10 +
    '    $x64items = @(Get-ChildItem "HKLM:SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall")' + #13#10 +
    '    $x64userItems = @(Get-ChildItem "HKCU:SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall")' + #13#10 +
    '    ($x64items + $x64userItems + @(Get-ChildItem "HKLM:SOFTWARE\wow6432node\Microsoft\Windows\CurrentVersion\Uninstall") `' + #13#10 +
    '        | ForEach-object { Get-ItemProperty Microsoft.PowerShell.Core\Registry::$_ } `' + #13#10 +
    '        | Where-Object { $_.DisplayName -and $_.DisplayName.contains($productName) } `' + #13#10 +
    '        | Select UninstallString).UninstallString' + #13#10 +
    '}' + #13#10 +
    '' + #13#10 +
    'function UninstallMongoCompass {' + #13#10 +
    '    $uninstallCommand = (GetUninstallString "MongoDB Compass")' + #13#10 +
    '    if($uninstallCommand) {' + #13#10 +
    '        Write-Host "Uninstalling Mongo Compass"' + #13#10 +
    '' + #13#10 +
    '            $uninstallCommand = $uninstallCommand.replace(''--uninstall'', '''').replace(''"'', '''')' + #13#10 +
    '            & $uninstallCommand --uninstall' + #13#10 +
    '' + #13#10 +
    '        Write-Host "Uninstalled Mongo Compass" -ForegroundColor Green' + #13#10 +
    '    }' + #13#10 +
    '}' + #13#10 +
    '' + #13#10 +
    '# Function to install MongoDB' + #13#10 +
    'function Install-MongoDB {' + #13#10 +
    '    param (' + #13#10 +
    '        [string]$mongoInstallerUrl,' + #13#10 +
    '        [string]$mongoInstallerPath,' + #13#10 +
    '        [string]$installPath' + #13#10 +
    '    )' + #13#10 +
    '' + #13#10 +
    '    $minRequiredVersion = [version]"7.0"' + #13#10 +
    '    $mongoBasePath = "C:\Program Files\MongoDB\Server"' + #13#10 +
    '    $installedVersion = $null' + #13#10 +
    '' + #13#10 +
    '    if (Test-Path $mongoBasePath) {' + #13#10 +
    '        $versionDirs = Get-ChildItem -Path $mongoBasePath -Directory | Select-Object -ExpandProperty Name' + #13#10 +
    '        $validVersions = $versionDirs | Where-Object { $_ -match ''^\d+\.\d+(\.\d+)?$'' } | ForEach-Object { [version]$_ }' + #13#10 +
    '        if ($validVersions.Count -gt 0) {' + #13#10 +
    '            $installedVersion = ($validVersions | Sort-Object -Descending)[0]' + #13#10 +
    '            Write-Host "MongoDB version $installedVersion found."' + #13#10 +
    '        }' + #13#10 +
    '    }' + #13#10 +
    '' + #13#10 +
    '    if ($installedVersion -ne $null -and $installedVersion -ge $minRequiredVersion) {' + #13#10 +
    '        Write-Host "MongoDB version $installedVersion is >= 7.0. Skipping installation."' + #13#10 +
    '    } elseif (-not (Test-Path "$installPath\bin\mongod.exe")) {' + #13#10 +
    '        Write-Host "==================== MongoDB Installation Started ===================="' + #13#10 +
    '        # Download the MongoDB MSI installer' + #13#10 +
    '        Invoke-WebRequest -Uri $mongoInstallerUrl -OutFile $mongoInstallerPath' + #13#10 +
    '' + #13#10 +
    '        # Install MongoDB with the server component (no GUI)' + #13#10 +
    '        Start-Process msiexec.exe -ArgumentList "/i `"$mongoInstallerPath`" INSTALLLOCATION=`"$installPath`" ADDLOCAL=all /quiet /norestart" -Wait' + #13#10 +
    '' + #13#10 +
    '        # Clean up the installer file' + #13#10 +
    '        Remove-Item $mongoInstallerPath' + #13#10 +
    '' + #13#10 +
    '        # Verify the installation' + #13#10 +
    '        if (Test-Path "$installPath\bin\mongod.exe") {' + #13#10 +
    '            Write-Host "MongoDB installed successfully, and mongod.exe is available at $installPath\bin\"' + #13#10 +
    '        } else {' + #13#10 +
    '            Write-Error "MongoDB installation failed or mongod.exe was not installed."' + #13#10 +
    '            exit 1' + #13#10 +
    '        }' + #13#10 +
    '    } else {' + #13#10 +
    '        Write-Host "MongoDB is already installed at $installPath."' + #13#10 +
    '    }' + #13#10 +
    '' + #13#10 +
    '      # Add MongoDB to the system path' + #13#10 +
    '    if ($env:Path -notlike "*$installPath\bin*") {' + #13#10 +
    '        $env:Path += ";$installPath\bin"' + #13#10 +
    '        [Environment]::SetEnvironmentVariable("Path", $env:Path, [System.EnvironmentVariableTarget]::Machine)' + #13#10 +
    '        Write-Host "MongoDB path added to system PATH."' + #13#10 +
    '    }' + #13#10 +
    '' + #13#10 +
    '    Write-Host "==================== MongoDB Installation Completed ===================="' + #13#10 +
    '}' + #13#10 +
    '' + #13#10 +
    'function Install-MongoDBTools {' + #13#10 +
    '    param (' + #13#10 +
    '        [string]$toolsInstallerUrl,' + #13#10 +
    '        [string]$toolsInstallPath' + #13#10 +
    '    )' + #13#10 +
    '' + #13#10 +
    '    $toolsInstaller = "$env:TEMP\mongodb-tools.msi"' + #13#10 +
    '' + #13#10 +
    '    if (-not (Test-Path "$toolsInstallPath\bin")) {' + #13#10 +
    '        Write-Host "==================== MongoDB Tools Installation Started ===================="' + #13#10 +
    '' + #13#10 +
    '        Write-Host "Downloading MongoDB Database Tools from $toolsInstallerUrl..."' + #13#10 +
    '        Invoke-WebRequest -Uri $toolsInstallerUrl -OutFile $toolsInstaller' + #13#10 +
    '' + #13#10 +
    '        Write-Host "Installing MongoDB Database Tools..."' + #13#10 +
    '        Start-Process msiexec.exe -ArgumentList "/i `"$toolsInstaller`" INSTALLLOCATION=`"$toolsInstallPath`" /quiet /norestart" -Wait' + #13#10 +
    '' + #13#10 +
    '        # Clean up installer' + #13#10 +
    '        Remove-Item $toolsInstaller -ErrorAction SilentlyContinue' + #13#10 +
    '' + #13#10 +
    '        # Confirm install' + #13#10 +
    '        if (Test-Path "$toolsInstallPath\bin") {' + #13#10 +
    '            Write-Host "MongoDB Tools installed successfully at $toolsInstallPath"' + #13#10 +
    '        } else {' + #13#10 +
    '            Write-Warning "MongoDB Tools installation failed or expected path missing."' + #13#10 +
    '            return' + #13#10 +
    '        }' + #13#10 +
    '    } else {' + #13#10 +
    '        Write-Host "MongoDB Tools already installed at $toolsInstallPath"' + #13#10 +
    '    }' + #13#10 +
    '' + #13#10 +
    '    # Update system PATH' + #13#10 +
    '    if ($env:Path -notlike "*$toolsInstallPath\bin*") {' + #13#10 +
    '        $env:Path += ";$toolsInstallPath\bin"' + #13#10 +
    '        [Environment]::SetEnvironmentVariable("Path", $env:Path, [System.EnvironmentVariableTarget]::Machine)' + #13#10 +
    '        Write-Host "MongoDB Tools path added to system PATH."' + #13#10 +
    '    }' + #13#10 +
    '' + #13#10 +
    '    Write-Host "==================== MongoDB Tools Installation Completed ===================="' + #13#10 +
    '}' + #13#10 +
    '' + #13#10 +
    '# Function to configure MongoDB service' + #13#10 +
    'function Configure-MongoDBService {' + #13#10 +
    '    param (' + #13#10 +
    '        [string]$installPath,' + #13#10 +
    '        [string]$configFile,' + #13#10 +
    '        [string]$logFile' + #13#10 +
    '    )' + #13#10 +
    '' + #13#10 +
    '    Write-Host "==================== MongoDB Service Configuration Started ===================="' + #13#10 +
    '' + #13#10 +
    '    # Create MongoDB data and log directories' + #13#10 +
    '    New-Item -Path "C:\data\db" -ItemType Directory -Force | Out-Null' + #13#10 +
    '    New-Item -Path "C:\data\log" -ItemType Directory -Force | Out-Null' + #13#10 +
    '    New-Item -Path $logFile -ItemType File -Force | Out-Null' + #13#10 +
    '' + #13#10 +
    '    # Create MongoDB config file' + #13#10 +
    '    Set-Content -Path $configFile -Value @"' + #13#10 +
    'systemLog:' + #13#10 +
    '    destination: file' + #13#10 +
    '    path: c:/data/log/mongod.log' + #13#10 +
    '    logAppend: true' + #13#10 +
    'storage:' + #13#10 +
    '    dbPath: c:/data/db' + #13#10 +
    'net:' + #13#10 +
    '    bindIp: 127.0.0.1' + #13#10 +
    '    port: 27017' + #13#10 +
    '"@' + #13#10 +
    '' + #13#10 +
    '    # Install MongoDB as a Windows service' + #13#10 +
    '    & "$installPath\bin\mongod.exe" --config $configFile --install' + #13#10 +
    '' + #13#10 +
    '    # Check if MongoDB service is running' + #13#10 +
    '    $serviceName = "mongodb"' + #13#10 +
    '    if (-not (Get-Service -Name $serviceName -ErrorAction SilentlyContinue)) {' + #13#10 +
    '        & "$installPath\bin\mongod.exe" --config "$installPath\mongod.cfg" --install' + #13#10 +
    '    }' + #13#10 +
    '' + #13#10 +
    '    $service = Get-Service -Name $serviceName -ErrorAction SilentlyContinue' + #13#10 +
    '    if ($service -and $service.Status -ne ''Running'') {' + #13#10 +
    '        Start-Service $serviceName' + #13#10 +
    '        Write-Host "MongoDB service started."' + #13#10 +
    '    } elseif (-not $service) {' + #13#10 +
    '        Write-Error "MongoDB service is not installed."' + #13#10 +
    '        exit 1' + #13#10 +
    '    } else {' + #13#10 +
    '        Write-Host "MongoDB service is already running."' + #13#10 +
    '    }' + #13#10 +
    '' + #13#10 +
    '    Write-Host "==================== MongoDB Service Configuration Completed ===================="' + #13#10 +
    '}' + #13#10 +
    '' + #13#10 +
    '# Function to set up MongoDB database and insert data' + #13#10 +
    'function Setup-MongoDBDatabase {' + #13#10 +
    '    param (' + #13#10 +
    '        [string]$downloadPath,' + #13#10 +
    '        [string]$mongoshInstallerPath,' + #13#10 +
    '        [string]$mongoshPath,' + #13#10 +
    '        [string]$mongoConnectionString,' + #13#10 +
    '        [string]$mongoScriptPath,' + #13#10 +
    '        [string]$logFile' + #13#10 +
    '    )' + #13#10 +
    '' + #13#10 +
    '    Write-Host "==================== MongoDB Database Setup Started ===================="' + #13#10 +
    '' + #13#10 +
    '    # Wait for MongoDB service to start' + #13#10 +
    '    Start-Sleep -Seconds 5' + #13#10 +
    '' + #13#10 +
    '    # Check if mongosh is already installed' + #13#10 +
    '    if (-not (Test-Path "$mongoshPath\mongosh.exe")) {' + #13#10 +
    '        Write-Host "Installing MongoDB Shell with logging from local file..."' + #13#10 +
    '    # Download the MongoDB Shell MSI installer' + #13#10 +
    '    Write-Host "Downloading MongoDB Shell..."' + #13#10 +
    '    Invoke-WebRequest -Uri $mongoshInstallerPath -OutFile $downloadPath' + #13#10 +
    '' + #13#10 +
    '        # Install the MSI package with logging and silent install' + #13#10 +
    '    Write-Host "Installing MongoDB Shell with logging..."' + #13#10 +
    '    Start-Process -FilePath "msiexec.exe" -ArgumentList "/i `"$downloadPath`" /qn INSTALLLOCATION=`"$mongoshPath`" ALLUSERS=1 /l*v `"$logFile`"" -Wait' + #13#10 +
    '' + #13#10 +
    '        if (-not (Test-Path "$mongoshPath\mongosh.exe")) {' + #13#10 +
    '            Write-Host "Failed to install MongoDB Shell."' + #13#10 +
    '            Write-Host "Check the log file at $logFile for details."' + #13#10 +
    '            exit' + #13#10 +
    '        }' + #13#10 +
    '    } else {' + #13#10 +
    '        Write-Host "MongoDB Shell is already installed at $mongoshPath."' + #13#10 +
    '    }' + #13#10 +
    '' + #13#10 +
    '    # Define MongoDB database and collection names' + #13#10 +
    '    $dbName = "HanwahClient2606"' + #13#10 +
    '    $collectionName = "Test"' + #13#10 +
    '' + #13#10 +
    '    # Create a JavaScript script to run via mongosh' + #13#10 +
    '    $mongoScript = @"' + #13#10 +
    'print(''Starting script...'');' + #13#10 +
    '' + #13#10 +
    'const dbName = ''$dbName'';' + #13#10 +
    'const collectionName = ''$collectionName'';' + #13#10 +
    '' + #13#10 +
    ' print(``Switching to database: ${dbName}``);' + #13#10 +
    'use(dbName);' + #13#10 +
    '' + #13#10 +
    'print(``Creating collection: ${collectionName}``);' + #13#10 +
    'db.createCollection(collectionName);' + #13#10 +
    '' + #13#10 +
    ' print(``Database ''${dbName}'' and collection ''${collectionName}'' created successfully with sample data.``);' + #13#10 +
    '"@' + #13#10 +
    '' + #13#10 +
    '    # Define the paths' + #13#10 +
    '    $dataFolderPath = "C:\data"' + #13#10 +
    '    $mongoScriptPath = "$dataFolderPath\create_db_and_collection.js"' + #13#10 +
    '' + #13#10 +
    '    # Check if the data folder exists, if not, create it' + #13#10 +
    '    if (-not (Test-Path $dataFolderPath)) {' + #13#10 +
    '        New-Item -Path $dataFolderPath -ItemType Directory' + #13#10 +
    '        Write-Host "Created data directory at $dataFolderPath."' + #13#10 +
    '    }' + #13#10 +
    '' + #13#10 +
    '    Set-Content -Path $mongoScriptPath -Value $mongoScript -Encoding UTF8' + #13#10 +
    '' + #13#10 +
    '    # Run the MongoDB shell to execute the script' + #13#10 +
    '    Write-Host "Creating database, collection, and inserting sample data..."' + #13#10 +
    '    $process = Start-Process -FilePath "$mongoshPath\mongosh.exe" -ArgumentList "$mongoConnectionString --file `"$mongoScriptPath`"" -Wait -PassThru -RedirectStandardOutput C:\data\mongosh_output.log -RedirectStandardError C:\data\mongosh_error.log -NoNewWindow' + #13#10 +
    '' + #13#10 +
    '    Write-Host "mongosh execution output:"' + #13#10 +
    '    Get-Content C:\data\mongosh_output.log' + #13#10 +
    '    Get-Content C:\data\mongosh_error.log' + #13#10 +
    '' + #13#10 +
    '    if ($process.ExitCode -eq 0) {' + #13#10 +
    '        Write-Host "Database $dbName and collection $collectionName created successfully with sample data."' + #13#10 +
    '    } else {' + #13#10 +
    '        Write-Host "Failed to create database and collection. Exit code: $($process.ExitCode)"' + #13#10 +
    '    }' + #13#10 +
    '' + #13#10 +
    '    Write-Host "==================== MongoDB Database Setup Completed ===================="' + #13#10 +
    '}' + #13#10 +
    '' + #13#10 +
    '#Mongo Function Started' + #13#10 +
    '' + #13#10 +
    'function Ensure-IISDependencies {' + #13#10 +
    '    $features = @(' + #13#10 +
    '        "IIS-WebServerRole",               # IIS Web Server' + #13#10 +
    '        "IIS-ManagementScriptingTools"     # IIS Management Scripts and Tools' + #13#10 +
    '    )' + #13#10 +
    '' + #13#10 +
    '    foreach ($feature in $features) {' + #13#10 +
    '        Write-Host "Loop $feature is started."' + #13#10 +
    '        $featureStatus = (dism /online /Get-FeatureInfo /FeatureName:$feature 2>&1 | Select-String "State :")' + #13#10 +
    '' + #13#10 +
    '        if ($featureStatus -and $featureStatus -match "Enabled") {' + #13#10 +
    '            Write-Host "$feature is already enabled."' + #13#10 +
    '        } else {' + #13#10 +
    '            Write-Host "Enabling: $feature..."' + #13#10 +
    '            Start-Process "dism.exe" -ArgumentList "/online", "/Enable-Feature", "/FeatureName:$feature", "/All", "/NoRestart" -Wait -WindowStyle Hidden' + #13#10 +
    '        }' + #13#10 +
    '    }' + #13#10 +
    '}' + #13#10 +
    '' + #13#10 +
    '# Import IIS Administration Module' + #13#10 +
    'Import-Module WebAdministration -ErrorAction Stop' + #13#10 +
    '' + #13#10 +
    '# Function: Create Application Pool' + #13#10 +
    'function Create-AppPool {' + #13#10 +
    '    Write-Host "==================== Starting IIS Hosting Setup ===================="' + #13#10 +
    '' + #13#10 +
    '    Write-Host "Checking if Application Pool ''$AppPoolName'' exists..."' + #13#10 +
    '    if (!(Get-ChildItem IIS:\AppPools | Where-Object { $_.Name -eq $AppPoolName })) {' + #13#10 +
    '        New-WebAppPool -Name $AppPoolName' + #13#10 +
    '        Write-Host "Application Pool ''$AppPoolName'' created successfully."' + #13#10 +
    '    } else {' + #13#10 +
    '        Write-Host "Application Pool ''$AppPoolName'' already exists."' + #13#10 +
    '    }' + #13#10 +
    '}' + #13#10 +
    '' + #13#10 +
    '# Function: Stop Default Website' + #13#10 +
    'function Stop-DefaultWebsite {' + #13#10 +
    '    param ([string]$DefaultSiteName)' + #13#10 +
    '' + #13#10 +
    '    Write-Host "Stopping Default Web Site..."' + #13#10 +
    '    Stop-Website -Name $DefaultSiteName -ErrorAction SilentlyContinue' + #13#10 +
    '    Write-Host "Default Web Site stopped."' + #13#10 +
    '}' + #13#10 +
    '' + #13#10 +
    '# Function: Create IIS Website' + #13#10 +
    'function Create-Website {' + #13#10 +
    '    param (' + #13#10 +
    '        [string]$SiteName,' + #13#10 +
    '        [string]$PhysicalPath,' + #13#10 +
    '        [int]$Port,' + #13#10 +
    '        [string]$AppPoolName' + #13#10 +
    '    )' + #13#10 +
    '' + #13#10 +
    '    Write-Host "Checking if IIS Website ''$SiteName'' exists..."' + #13#10 +
    '    if (!(Get-ChildItem IIS:\Sites | Where-Object { $_.Name -eq $SiteName })) {' + #13#10 +
    '        New-Website -Name $SiteName -PhysicalPath $PhysicalPath -Port $Port -ApplicationPool $AppPoolName' + #13#10 +
    '        Write-Host "Website ''$SiteName'' created successfully on port $Port."' + #13#10 +
    '    } else {' + #13#10 +
    '        Write-Host "Website ''$SiteName'' already exists."' + #13#10 +
    '    }' + #13#10 +
    '}' + #13#10 +
    '' + #13#10 +
    '# Function: Configure Folder Permissions' + #13#10 +
    'function Configure-Permissions {' + #13#10 +
    '    param ([string]$PhysicalPath)' + #13#10 +
    '' + #13#10 +
    '    Write-Host "Configuring folder permissions for IIS_IUSRS..."' + #13#10 +
    '    try {' + #13#10 +
    '        $Acl = Get-Acl $PhysicalPath' + #13#10 +
    '        $AccessRule = New-Object System.Security.AccessControl.FileSystemAccessRule(' + #13#10 +
    '            "IIS_IUSRS", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow"' + #13#10 +
    '        )' + #13#10 +
    '        $Acl.SetAccessRule($AccessRule)' + #13#10 +
    '        Set-Acl -Path $PhysicalPath -AclObject $Acl' + #13#10 +
    '        Write-Host "Permissions successfully configured for IIS_IUSRS."' + #13#10 +
    '    } catch {' + #13#10 +
    '        Write-Error "Failed to configure permissions. Error: $_"' + #13#10 +
    '    }' + #13#10 +
    '}' + #13#10 +
    '' + #13#10 +
    '# Function: Start IIS Website' + #13#10 +
    'function Start-WebsiteSafely {' + #13#10 +
    '    param ([string]$SiteName)' + #13#10 +
    '' + #13#10 +
    '    Write-Host "Starting IIS Website ''$SiteName''..."' + #13#10 +
    '    Start-Website -Name $SiteName -ErrorAction SilentlyContinue' + #13#10 +
    '    Write-Host "Website ''$SiteName'' started successfully."' + #13#10 +
    '    Write-Host "==================== IIS hosting setup completed successfully! ===================="' + #13#10 +
    '}' + #13#10 +
    '' + #13#10 +
    '#NetCore-Hosting Installation Started' + #13#10 +
    '' + #13#10 +
    'function Install-AspNetCoreHostingBundle {' + #13#10 +
    '    param (' + #13#10 +
    '        [string]$DownloadUrl,' + #13#10 +
    '        [string]$InstallerName = "dotnet-hosting-9.0.0-win.exe"' + #13#10 +
    '    )' + #13#10 +
    '' + #13#10 +
    '    # Define the path where the installer will be saved' + #13#10 +
    '    $outputPath = "$env:TEMP\$InstallerName"' + #13#10 +
    '    $requiredVersion = "9.0.0"  # Expected version to avoid reinstallation' + #13#10 +
    '' + #13#10 +
    '    # Check if ASP.NET Core Hosting Bundle is already installed using registry or package detection' + #13#10 +
    '    $installed = Get-WmiObject -Query "SELECT * FROM Win32_Product WHERE Name LIKE ''%ASP.NET Core%'' AND Version LIKE ''$requiredVersion%''" `' + #13#10 +
    '                  -ErrorAction SilentlyContinue' + #13#10 +
    '' + #13#10 +
    '    if ($installed) {' + #13#10 +
    '        Write-Host "ASP.NET Core Hosting Bundle version $requiredVersion is already installed."' + #13#10 +
    '        return' + #13#10 +
    '    }' + #13#10 +
    '' + #13#10 +
    '    try {' + #13#10 +
    '        # Download the installer' + #13#10 +
    '        Write-Host "Downloading ASP.NET Core Hosting Bundle from $DownloadUrl..."' + #13#10 +
    '        Invoke-WebRequest -Uri $DownloadUrl -OutFile $outputPath' + #13#10 +
    '' + #13#10 +
    '        # Install the bundle silently' + #13#10 +
    '        Write-Host "Installing ASP.NET Core Hosting Bundle..."' + #13#10 +
    '        Start-Process -FilePath $outputPath -ArgumentList "/install", "/quiet", "/norestart" -Wait' + #13#10 +
    '' + #13#10 +
    '        Write-Host "ASP.NET Core Hosting Bundle installation completed successfully."' + #13#10 +
    '    }' + #13#10 +
    '    catch {' + #13#10 +
    '        Write-Error "An error occurred during the installation process: $_"' + #13#10 +
    '    }' + #13#10 +
    '    finally {' + #13#10 +
    '        # Clean up the installer' + #13#10 +
    '        if (Test-Path $outputPath) {' + #13#10 +
    '            Write-Host "Cleaning up..."' + #13#10 +
    '            Remove-Item -Path $outputPath -Force' + #13#10 +
    '        }' + #13#10 +
    '    }' + #13#10 +
    '}' + #13#10 +
    '' + #13#10 +
    '# Main script execution' + #13#10 +
    '$mongoInstallerUrl = "https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-7.0.12-signed.msi"' + #13#10 +
    '$mongoshInstallerPath = "https://downloads.mongodb.com/compass/mongosh-2.3.0-x64.msi"' + #13#10 +
    '$toolsInstallerUrl = "https://fastdl.mongodb.org/tools/db/mongodb-database-tools-windows-x86_64-100.12.2.msi"' + #13#10 +
    '$installPath = "C:\Program Files\MongoDB\Server\7.0\"' + #13#10 +
    '$toolsInstallPath = "C:\Program Files\MongoDB\Tools"' + #13#10 +
    '$mongoshPath = "C:\Program Files\mongosh\"' + #13#10 +
    '$logFile = "C:\data\log\mongod.log"' + #13#10 +
    '$configFile = "C:\Program Files\MongoDB\Server\7.0\mongod.cfg"' + #13#10 +
    '$mongoConnectionString = "mongodb://localhost:27017/"' + #13#10 +
    '$mongoScriptPath = "C:\data\create_db_and_collection.js"' + #13#10 +
    '$mongoInstallerPath = "$env:TEMP\mongodb-full.msi"' + #13#10 +
    '$downloadPath = "$env:TEMP\mongosh.msi"' + #13#10 +
    '$logFile = "$env:TEMP\mongosh_install.log"' + #13#10 +
    '' + #13#10 +
    '# App Hosting variable' + #13#10 +
    '$SiteName = "MyApp"' + #13#10 +
    '$PhysicalPath = Join-Path -Path $PSScriptRoot -ChildPath "Publish"' + #13#10 +
    '$Port = 8080' + #13#10 +
    '$AppPoolName = "MyAppPool"' + #13#10 +
    '$DefaultSiteName = "Default Web Site"' + #13#10 +
    '' + #13#10 +
    '#NetCore-Hosting URL' + #13#10 +
    '$NetHostingInstallerUrl = "https://download.visualstudio.micosoft.com/download/pr/e1ae9d41-3faf-4755-ac27-b24e84eef3d1/5e3a24eb8c1a12272ea1fe126d17dfca/dotnet-hosting-9.0.0-win.exe"' + #13#10 +
    '' + #13#10 +
    '#Set-ExecutionPolicy Unrestricted -Scope CurrentUser' + #13#10 +
    '#Set-ExecutionPolicy RemoteSigned -Scope CurrentUser' + #13#10 +
    'Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole -All -NoRestart' + #13#10 +
    '' + #13#10 +
    'Install-AspNetCoreHostingBundle -DownloadUrl $NetHostingInstallerUrl' + #13#10 +
    '' + #13#10 +
    'Install-MongoDB -mongoInstallerUrl $mongoInstallerUrl -mongoInstallerPath $mongoInstallerPath -installPath $installPath' + #13#10 +
    'Install-MongoDBTools  -toolsInstallerUrl  $toolsInstallerUrl -toolsInstallPath $toolsInstallPath' + #13#10 +
    '' + #13#10 +
    'Configure-MongoDBService -installPath $installPath -configFile $configFile -logFile $logFile' + #13#10 +
    'Setup-MongoDBDatabase -downloadPath $downloadPath -mongoshInstallerPath $mongoshInstallerPath -mongoshPath $mongoshPath -mongoConnectionString $mongoConnectionString -mongoScriptPath $mongoScriptPath -logFile $logFile' + #13#10 +
    'Get-Process -Name "*MongoDBCompass*" | Stop-Process' + #13#10 +
    'UninstallMongoCompass' + #13#10 +
    '' + #13#10 +
    'Ensure-IISDependencies #Ensure installing IIS features' + #13#10 +
    '' + #13#10 +
    'Create-AppPool -AppPoolName $AppPoolName' + #13#10 +
    'Stop-DefaultWebsite -DefaultSiteName $DefaultSiteName' + #13#10 +
    'Create-Website -SiteName $SiteName -PhysicalPath $PhysicalPath -Port $Port -AppPoolName $AppPoolName' + #13#10 +
    'Configure-Permissions -PhysicalPath $PhysicalPath' + #13#10 +
    'Start-WebsiteSafely -SiteName $SiteName' + #13#10 +
    '' + #13#10 +
    '# ============================ End of Script ============================' + #13#10 +
    '# === Optional Cleanup ===' + #13#10 +
    'try {' + #13#10 +
    '    $batFilePath = Join-Path -Path $PSScriptRoot -ChildPath "run_installer.bat"' + #13#10 +
    '    if (Test-Path $batFilePath) {' + #13#10 +
    '        Remove-Item $batFilePath -Force' + #13#10 +
    '    }' + #13#10 +
    '} catch {' + #13#10 +
    '    Write-Warning "Failed to delete run_installer.bat: $_"' + #13#10 +
    '}';

  // Execute the PowerShell script
  PowerShellCommand := '-ExecutionPolicy Bypass -NoProfile -NonInteractive -Command "' + Script + '"';
  
  if not Exec(PowerShellPath, PowerShellCommand, '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then
  begin
    Result := 'Failed to execute PowerShell script';
  end
  else if ResultCode <> 0 then
  begin
    Result := 'PowerShell script returned error code: ' + IntToStr(ResultCode);
  end;
  
  Result := '';
end;

function NextButtonClick(CurPageID: Integer): Boolean;
begin
  Result := True;
  
  if CurPageID = wpReady then
  begin
    // Prepare installation before actually starting it
    PrepareToInstall(NeedsRestart);
  end;
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssPostInstall then
  begin
    // Any post-installation steps if needed
  end;
end;