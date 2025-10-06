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
    # if (Test-Path $logFile) {
    #     Write-Host "Deleting existing log file: $logFile"
    #     Remove-Item -Path $logFile -Force -ErrorAction SilentlyContinue
    # }
    if (Test-Path $configFile) {
        Write-Host "Deleting existing config file: $configFile"
        Remove-Item -Path $configFile -Force -ErrorAction SilentlyContinue
    }

    # Create MongoDB data and log directories
    Write-Host "Creating data and log directories..."
    New-Item -Path "C:\Program Files\MongoDB\Server\7.0\data\" -ItemType Directory -Force | Out-Null
    New-Item -Path "C:\Program Files\MongoDB\Server\7.0\log\" -ItemType Directory -Force | Out-Null
    New-Item -Path $logFile -ItemType File -Force | Out-Null

    # Create MongoDB config file - START WITHOUT AUTHORIZATION for initial setup
    Write-Host "Creating MongoDB configuration file (without authorization for initial setup)..."
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
# security:
#     authorization: enabled
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

# Function to create MongoDB admin user
function Create-MongoDBAdminUser {
    param (
        [string]$mongoshPath,
        [string]$adminUsername,
        [string]$adminPassword,
        [string]$mongoConnectionString = "mongodb://localhost:27017"
    )
    
    Write-Host "==================== MongoDB Admin User Creation Started ===================="
    
    $mongoDataPath = "C:\Program Files\MongoDB\Server\7.0\data"
    $mongoLogPath = "C:\Program Files\MongoDB\Server\7.0\log"
    
    # Wait for MongoDB service to be ready
    Start-Sleep -Seconds 5
    
    # Create JavaScript script to create admin user
    $adminUserScript = @"
print('Creating admin user...');
use admin;

// Check if admin user already exists
const existingUser = db.getUser('$adminUsername');
if (existingUser) {
    print('Admin user already exists. Skipping creation.');
} else {
    db.createUser({
        user: '$adminUsername',
        pwd: '$adminPassword',
        roles: [
            { role: 'userAdminAnyDatabase', db: 'admin' },
            { role: 'readWriteAnyDatabase', db: 'admin' },
            { role: 'dbAdminAnyDatabase', db: 'admin' },
            { role: 'clusterAdmin', db: 'admin' }
        ]
    });
    print('Admin user created successfully.');
}
"@
    
    # Create temporary script file
    $tempAdminScriptPath = "$mongoDataPath\create_admin_user.js"
    Set-Content -Path $tempAdminScriptPath -Value $adminUserScript -Encoding UTF8
    Write-Host "Created temporary admin user script at $tempAdminScriptPath"
    
    # Execute the admin user creation script
    Write-Host "Creating admin user '$adminUsername'..."
    $process = Start-Process -FilePath "$mongoshPath\mongosh.exe" `
        -ArgumentList "$mongoConnectionString --file `"$tempAdminScriptPath`"" `
        -Wait -PassThru `
        -RedirectStandardOutput "$mongoLogPath\admin_user_output.log" `
        -RedirectStandardError "$mongoLogPath\admin_user_error.log" `
        -WindowStyle Hidden
    
    Write-Host "Admin user creation output:"
    if (Test-Path "$mongoLogPath\admin_user_output.log") {
        Get-Content "$mongoLogPath\admin_user_output.log"
    }
    if (Test-Path "$mongoLogPath\admin_user_error.log") {
        Get-Content "$mongoLogPath\admin_user_error.log"
    }
    
    # Clean up temporary script file
    if (Test-Path $tempAdminScriptPath) {
        Remove-Item $tempAdminScriptPath -Force
        Write-Host "Cleaned up temporary admin script file."
    }
    
    if ($process.ExitCode -eq 0) {
        Write-Host "Admin user creation completed successfully."
    } else {
        Write-Host "Failed to create admin user. Exit code: $($process.ExitCode)"
        return $false
    }
    
    Write-Host "==================== MongoDB Admin User Creation Completed ===================="
    return $true
}

# Function to enable authentication and restart MongoDB
function Enable-MongoDBAuthentication {
    param (
        [string]$configFile,
        [string]$serviceName = "mongodb"
    )
    
    Write-Host "==================== Enabling MongoDB Authentication ===================="
    
    # Update config file to enable authorization
    Write-Host "Updating MongoDB configuration to enable authentication..."
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
    
    # Restart MongoDB service to apply authentication
    Write-Host "Restarting MongoDB service to enable authentication..."
    Restart-Service -Name $serviceName -Force
    Start-Sleep -Seconds 10 # Wait for service to fully restart
    
    Write-Host "MongoDB authentication enabled successfully."
    Write-Host "==================== MongoDB Authentication Enabled ===================="
}

# Function to set up MongoDB database and insert data (updated for authentication)
function Setup-MongoDBDatabase {
    param (
        [string]$mongoshInstallerPath,
        [string]$mongoshPath,
        [string]$mongoConnectionString,
        [string]$mongoScriptPath,
        [string]$logFile,
        [string]$adminUsername,
        [string]$adminPassword
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
        Start-Process -FilePath "msiexec.exe" -ArgumentList "/i `"$mongoshInstallerPath`" /qn INSTALLLOCATION=`"$mongoshPath`" ALLUSERS=1 /l*v `"$logFile`"" -Wait
        
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
    
    # Create authenticated connection string
    $authenticatedConnectionString = "mongodb://$adminUsername`:$adminPassword@localhost:27017/?authSource=admin"
    
    # Create a JavaScript script to run via mongosh with authentication
    $mongoScript = @"
print('Starting database and collection setup with authentication...');
const dbName = '$dbName';
const collectionName = '$collectionName';

// Check if database already exists
const existingDbs = db.adminCommand('listDatabases').databases;
const dbExists = existingDbs.some(database => database.name === dbName);

if (dbExists) {
    print(``Database `${dbName} already exists. Skipping creation.``);
    
    use(dbName);
    
    // Check if collection exists
    const collections = db.getCollectionNames();
    if (collections.includes(collectionName)) {
        print(``Collection `${collectionName} already exists in database `${dbName}.``);
    } else {
        print(``Creating collection: `${collectionName}``);
        db.createCollection(collectionName);
        print(``Collection `${collectionName} created successfully.``);
    }
} else {
    print(``Creating database: `${dbName}``);
    use(dbName);
    print(``Creating collection: `${collectionName}``);
    db.createCollection(collectionName);
    print(``Database `${dbName} and collection `${collectionName} created successfully.``);
}

// Create a database-specific user for the application
print('Creating database-specific user...');
use $dbName;
try {
    db.createUser({
        user: 'appUser',
        pwd: 'appPassword123',
        roles: [
            { role: 'readWrite', db: '$dbName' }
        ]
    });
    print('Database user created successfully.');
} catch (error) {
    if (error.message.includes('User "appUser@$dbName" already exists')) {
        print('Database user already exists. Skipping creation.');
    } else {
        print('Error creating database user: ' + error.message);
    }
}
"@
    
    # Create temporary script file in MongoDB data folder
    $tempScriptPath = "$mongoDataPath\create_db_and_collection_auth.js"
    
    # Create the MongoDB script file
    Set-Content -Path $tempScriptPath -Value $mongoScript -Encoding UTF8
    Write-Host "Created temporary MongoDB script at $tempScriptPath"
    
    # Run the MongoDB shell to execute the script with authentication
    Write-Host "Creating database '$dbName' and collection '$collectionName' with authentication..."
    $process = Start-Process -FilePath "$mongoshPath\mongosh.exe" `
        -ArgumentList "`"$authenticatedConnectionString`" --file `"$tempScriptPath`"" `
        -Wait -PassThru `
        -RedirectStandardOutput "$mongoLogPath\mongosh_auth_output.log" `
        -RedirectStandardError "$mongoLogPath\mongosh_auth_error.log" `
        -WindowStyle Hidden
    
    Write-Host "mongosh execution output:"
    if (Test-Path "$mongoLogPath\mongosh_auth_output.log") {
        Get-Content "$mongoLogPath\mongosh_auth_output.log"
    }
    if (Test-Path "$mongoLogPath\mongosh_auth_error.log") {
        Get-Content "$mongoLogPath\mongosh_auth_error.log"
    }
    
    # Clean up temporary script file
    if (Test-Path $tempScriptPath) {
        Remove-Item $tempScriptPath -Force
        Write-Host "Cleaned up temporary script file."
    }
    
    if ($process.ExitCode -eq 0) {
        Write-Host "Database '$dbName' and collection '$collectionName' created successfully with authentication."
        Write-Host "Application database connection string: mongodb://appUser:appPassword123@localhost:27017/$dbName"
    } else {
        Write-Host "Failed to create database and collection. Exit code: $($process.ExitCode)"
    }
    
    Write-Host "==================== MongoDB Database Setup Completed ===================="
}

# Example usage function that demonstrates the complete setup process
function Complete-MongoDBSetupWithAuth {
    param (
        [string]$installPath = "C:\Program Files\MongoDB\Server\7.0",
        [string]$configFile = "C:\Program Files\MongoDB\Server\7.0\bin\mongod.cfg",
        [string]$logFile = "C:\Program Files\MongoDB\Server\7.0\log\mongod.log",
        [string]$mongoshInstallerPath = "C:\Path\To\mongosh-installer.msi",
        [string]$mongoshPath = "C:\Program Files\mongosh",
        [string]$adminUsername = "admin",
        [string]$adminPassword = "SecureAdminPassword123!"
    )
    
    Write-Host "==================== Starting Complete MongoDB Setup with Authentication ===================="
    
    # Step 1: Configure MongoDB service (without authentication initially)
    Configure-MongoDBService -installPath $installPath -configFile $configFile -logFile $logFile
    
    # Step 2: Create admin user
    $adminCreated = Create-MongoDBAdminUser -mongoshPath $mongoshPath -adminUsername $adminUsername -adminPassword $adminPassword
    
    if ($adminCreated) {
        # Step 3: Enable authentication
        Enable-MongoDBAuthentication -configFile $configFile
        
        # Step 4: Setup database with authentication
        Setup-MongoDBDatabase -mongoshInstallerPath $mongoshInstallerPath -mongoshPath $mongoshPath -mongoConnectionString "mongodb://localhost:27017" -mongoScriptPath "" -logFile $logFile -adminUsername $adminUsername -adminPassword $adminPassword
        
        Write-Host "==================== MongoDB Setup with Authentication Completed Successfully ===================="
        Write-Host "IMPORTANT: Save these credentials securely!"
        Write-Host "Admin Username: $adminUsername"
        Write-Host "Admin Password: $adminPassword"
        Write-Host "Application Username: appUser"
        Write-Host "Application Password: appPassword123"
        Write-Host "Admin Connection String: mongodb://$adminUsername`:$adminPassword@localhost:27017/?authSource=admin"
        Write-Host "App Connection String: mongodb://appUser:appPassword123@localhost:27017/visioninsightBIDashboard"
    } else {
        Write-Error "Failed to create admin user. Aborting authentication setup."
    }
}
#Mongo Function Ended

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
    
    # Import WebAdministration module
    try {
        Import-Module WebAdministration -Force
        Write-Host "WebAdministration module imported successfully."
    }
    catch {
        Write-Host "Failed to import WebAdministration module: $($_.Exception.Message)"
        Write-Host "Attempting to enable IIS features..."
        
        # Enable IIS and management tools
        Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole, IIS-WebServer, IIS-CommonHttpFeatures, IIS-HttpErrors, IIS-HttpLogging, IIS-RequestMonitor, IIS-HttpTracing, IIS-Security, IIS-RequestFiltering, IIS-Performance, IIS-WebServerManagementTools, IIS-ManagementConsole, IIS-IIS6ManagementCompatibility, IIS-Metabase -All
        
        # Try importing again
        Import-Module WebAdministration -Force
    }
    
    Write-Host "Checking if Application Pool '$AppPoolName' exists..."
    
    # Alternative method using Get-IISAppPool (more reliable)
    try {
        $existingPool = Get-IISAppPool -Name $AppPoolName -ErrorAction SilentlyContinue
        if ($existingPool) {
            Write-Host "Application Pool '$AppPoolName' already exists."
        } else {
            New-WebAppPool -Name $AppPoolName
            Write-Host "Application Pool '$AppPoolName' created successfully."
        }
    }
    catch {
        # Fallback method using appcmd.exe
        Write-Host "Using appcmd.exe as fallback method..."
        $appcmdPath = "$env:SystemRoot\System32\inetsrv\appcmd.exe"
        
        if (Test-Path $appcmdPath) {
            # Check if app pool exists
            $result = & $appcmdPath list apppool $AppPoolName 2>$null
            if ($result) {
                Write-Host "Application Pool '$AppPoolName' already exists."
            } else {
                & $appcmdPath add apppool /name:$AppPoolName
                Write-Host "Application Pool '$AppPoolName' created successfully using appcmd.exe."
            }
        } else {
            Write-Host "ERROR: Neither PowerShell cmdlets nor appcmd.exe are available for IIS management."
            throw "IIS management tools are not available."
        }
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

    Write-Host "==================== Creating/Updating IIS Website ===================="
    Write-Host "Site Name: $SiteName"
    Write-Host "Physical Path: $PhysicalPath"
    Write-Host "Port: $Port"
    Write-Host "Application Pool: $AppPoolName"
    Write-Host ""
    
    $appcmdPath = "$env:SystemRoot\System32\inetsrv\appcmd.exe"
    
    # Check if IIS is available
    if (!(Test-Path $appcmdPath)) {
        Write-Host "ERROR: IIS is not installed or appcmd.exe is not available."
        return $false
    }
    
    # Ensure physical path exists
    try {
        if (!(Test-Path $PhysicalPath)) {
            New-Item -ItemType Directory -Path $PhysicalPath -Force | Out-Null
            Write-Host "Created physical path: $PhysicalPath"
        }
    }
    catch {
        Write-Host "ERROR: Cannot create physical path '$PhysicalPath': $($_.Exception.Message)"
        return $false
    }
    
    try {
        # Check if website exists
        Write-Host "Checking if website '$SiteName' exists..."
        $siteList = & $appcmdPath list site $SiteName 2>$null
        $siteExists = ($siteList -and $siteList.Length -gt 0 -and $siteList -notlike "*ERROR*")
        
        if ($siteExists) {
            Write-Host "Website '$SiteName' exists. Updating configuration..."
            
            # Stop the site
            Write-Host "Stopping website '$SiteName'..."
            & $appcmdPath stop site $SiteName 2>$null
            
            # Update the root virtual directory's physical path
            Write-Host "Updating physical path to: $PhysicalPath"
            $result = & $appcmdPath set vdir "${SiteName}/" /physicalPath:$PhysicalPath 2>&1
            if ($LASTEXITCODE -ne 0) {
                Write-Host "WARNING: Failed to update physical path. Output: $result"
                # Try alternative method
                Write-Host "Trying alternative method to update physical path..."
                $altResult = & $appcmdPath set vdir "${SiteName}/" "-physicalPath:$PhysicalPath" 2>&1
                if ($LASTEXITCODE -ne 0) {
                    Write-Host "Alternative method also failed: $altResult"
                } else {
                    Write-Host "Physical path updated successfully using alternative method."
                }
            } else {
                Write-Host "Physical path updated successfully."
            }
            
            # Update the root application's application pool
            Write-Host "Updating application pool to: $AppPoolName"
            $result = & $appcmdPath set app "${SiteName}/" /applicationPool:$AppPoolName 2>&1
            if ($LASTEXITCODE -ne 0) {
                Write-Host "WARNING: Failed to update application pool. Output: $result"
            } else {
                Write-Host "Application pool updated successfully."
            }
            
            # Update binding
            Write-Host "Updating port binding to: $Port"
            $bindingString = "http/*:${Port}:"
            $result = & $appcmdPath set site $SiteName /bindings:$bindingString 2>&1
            if ($LASTEXITCODE -ne 0) {
                Write-Host "WARNING: Failed to update binding. Output: $result"
            } else {
                Write-Host "Port binding updated successfully."
            }
            
            # Start the site
            Write-Host "Starting website '$SiteName'..."
            & $appcmdPath start site $SiteName 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "Website '$SiteName' started successfully."
            } else {
                Write-Host "WARNING: Website updated but failed to start. You may need to start it manually."
            }
            
        } else {
            Write-Host "Website '$SiteName' does not exist. Creating new website..."
            
            # Check if port is in use
            $allSites = & $appcmdPath list site 2>$null
            $portInUse = $false
            foreach ($site in $allSites) {
                if ($site -match ":${Port}:") {
                    $portInUse = $true
                    Write-Host "WARNING: Port $Port appears to be in use by: $site"
                    break
                }
            }
            
            # Create the website
            $bindingString = "http/*:${Port}:"
            Write-Host "Creating website with binding: $bindingString"
            $result = & $appcmdPath add site /name:$SiteName /physicalPath:$PhysicalPath /bindings:$bindingString 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "Website '$SiteName' created successfully."
                
                # Set the application pool for the root application
                Write-Host "Assigning application pool '$AppPoolName'..."
                $result = & $appcmdPath set app "${SiteName}/" /applicationPool:$AppPoolName 2>&1
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "Application pool assigned successfully."
                    
                    # Start the website
                    Write-Host "Starting website '$SiteName'..."
                    & $appcmdPath start site $SiteName 2>$null
                    
                    if ($LASTEXITCODE -eq 0) {
                        Write-Host "Website '$SiteName' started successfully."
                        Write-Host "Website URL: http://localhost:$Port"
                    } else {
                        Write-Host "WARNING: Website created but failed to start."
                    }
                } else {
                    Write-Host "WARNING: Website created but failed to assign application pool. Output: $result"
                }
            } else {
                Write-Host "ERROR: Failed to create website '$SiteName'. Output: $result"
                return $false
            }
        }
        
        # Final verification
        Write-Host ""
        Write-Host "Verifying final configuration..."
        $finalCheck = & $appcmdPath list site $SiteName 2>$null
        if ($finalCheck) {
            Write-Host "Site configuration:"
            Write-Host $finalCheck
            
            # Also check the virtual directory configuration
            $vdirCheck = & $appcmdPath list vdir "${SiteName}/" 2>$null
            if ($vdirCheck) {
                Write-Host "Virtual Directory configuration:"
                Write-Host $vdirCheck
            }
        }
        
        return $true
        
    } catch {
        Write-Host "ERROR: Exception occurred: $($_.Exception.Message)"
        return $false
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

function Convert-ToVersion {
    param ([string]$versionStr)
    try {
        $cleanVersion = ($versionStr -replace '[^\d\.]', '').Trim()
        if ($cleanVersion -match '^\d+\.\d+\.\d+') {
            return [Version]$cleanVersion
        }
    } catch { return $null }
    return $null
}

function Cleanup-DotNetSDK {
    Write-Host "Cleaning up existing .NET SDK registry keys and folders..."

    $registryPaths = @(
        "HKLM:\SOFTWARE\dotnet\Setup\InstalledVersions",
        "HKLM:\SOFTWARE\WOW6432Node\dotnet\Setup\InstalledVersions"
    )
    foreach ($path in $registryPaths) {
        if (Test-Path $path) {
            Write-Host "Removing registry key: $path"
            Remove-Item -Path $path -Recurse -Force -ErrorAction SilentlyContinue
        }
    }

    $folders = @(
        "$env:ProgramFiles\dotnet",
        "${env:ProgramFiles(x86)}\dotnet",
        "$env:USERPROFILE\.dotnet"
    )
    foreach ($folder in $folders) {
        if (Test-Path $folder) {
            Write-Host "Deleting folder: $folder"
            Remove-Item -Path $folder -Recurse -Force -ErrorAction SilentlyContinue
        }
    }

    Write-Host "Cleaning PATH environment variable..."
    $path = [Environment]::GetEnvironmentVariable("PATH", "Machine")
    $newPath = ($path -split ';') | Where-Object { $_ -notmatch "dotnet" } | Join-String -Separator ';'
    [Environment]::SetEnvironmentVariable("PATH", $newPath, "Machine")

    Write-Host "Cleanup complete. Please restart PowerShell or log off/on to fully apply changes."
}

function Get-DotNetSDKVersions {
    $versions = @()

    # File system check
    $paths = @(
        "$env:ProgramFiles\dotnet\sdk",
        "${env:ProgramFiles(x86)}\dotnet\sdk",
        "$env:USERPROFILE\.dotnet\sdk"
    )
    foreach ($path in $paths) {
        if (Test-Path $path) {
            Get-ChildItem -Path $path -Directory | ForEach-Object {
                $v = Convert-ToVersion $_.Name
                if ($v) { $versions += $v }
            }
        }
    }

    # Registry check
    $regKeys = @(
        "HKLM:\SOFTWARE\dotnet\Setup\InstalledVersions\x64\sdk",
        "HKLM:\SOFTWARE\dotnet\Setup\InstalledVersions\x86\sdk",
        "HKLM:\SOFTWARE\WOW6432Node\dotnet\Setup\InstalledVersions\x64\sdk",
        "HKLM:\SOFTWARE\WOW6432Node\dotnet\Setup\InstalledVersions\x86\sdk"
    )
    foreach ($key in $regKeys) {
        if (Test-Path $key) {
            Get-ChildItem -Path $key | ForEach-Object {
                $v = Convert-ToVersion $_.PSChildName
                if ($v) { $versions += $v }
            }
        }
    }

    return $versions | Sort-Object -Unique
}

function Update-DotNetPath {
    param ([string]$DotNetPath)

    $currentPath = [Environment]::GetEnvironmentVariable("PATH", "Machine")
    if (-not $currentPath.Contains($DotNetPath)) {
        $newPath = "$DotNetPath;$currentPath"
        [Environment]::SetEnvironmentVariable("PATH", $newPath, "Machine")
        Write-Host "Added $DotNetPath to system PATH"
    } else {
        Write-Host ".NET path already in system PATH"
    }
}

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
    
    # Helper to find dotnet executable
    function Find-DotNetExecutable {
        $possiblePaths = @(
            "$env:ProgramFiles\dotnet\dotnet.exe",
            "$env:ProgramFiles(x86)\dotnet\dotnet.exe",
            "${env:ProgramW6432}\dotnet\dotnet.exe"
        )
        
        # First check common installation paths
        foreach ($path in $possiblePaths) {
            if (Test-Path $path) {
                Write-Host "Found dotnet at: $path"
                return $path
            }
        }
        
        # Try to find in PATH
        try {
            $dotnetInPath = Get-Command dotnet -ErrorAction SilentlyContinue
            if ($dotnetInPath) {
                Write-Host "Found dotnet in PATH: $($dotnetInPath.Source)"
                return $dotnetInPath.Source
            }
        } catch {
            # Ignore errors
        }
        
        # Refresh environment and try again
        Write-Host "Refreshing environment variables..."
        $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")
        
        try {
            $dotnetInPath = Get-Command dotnet -ErrorAction SilentlyContinue
            if ($dotnetInPath) {
                Write-Host "Found dotnet in refreshed PATH: $($dotnetInPath.Source)"
                return $dotnetInPath.Source
            }
        } catch {
            # Ignore errors
        }
        
        return $null
    }
    
    $minVersion = Convert-ToVersion $MinimumRequiredVersion
    if (-not $minVersion) {
        Write-Error "Invalid minimum required version: $MinimumRequiredVersion"
        return
    }
    
    # Find dotnet executable
    $dotnetExe = Find-DotNetExecutable
    
    if (-not $dotnetExe) {
        Write-Host ".NET runtime/SDK not found. Will proceed with installation."
        $isInstalled = $false
    } else {
        Write-Host "Using dotnet executable: $dotnetExe"
        
        # Get installed .NET SDK versions
        try {
            $sdkListOutput = & $dotnetExe --list-sdks 2>$null
            if ($LASTEXITCODE -eq 0 -and $sdkListOutput) {
                Write-Host "SDK list output:"
                $sdkListOutput | ForEach-Object { Write-Host "  $_" }
                
                $installedVersions = $sdkListOutput | ForEach-Object {
                    if ($_ -match '^(\S+)\s+') {
                        Convert-ToVersion $matches[1]
                    }
                } | Where-Object { $_ -ne $null }
                
                Write-Host "Parsed SDK versions:"
                $installedVersions | ForEach-Object { Write-Host "  $_" }
                
                # Check if any version is >= minimum required
                $isInstalled = $installedVersions | Where-Object { $_ -ge $minVersion }
                
                if ($isInstalled) {
                    $highestVersion = ($installedVersions | Sort-Object -Descending)[0]
                    Write-Host ".NET SDK version $MinimumRequiredVersion or higher is already installed. Highest version: $highestVersion"
                    return
                } else {
                    Write-Host "No SDK version >= $MinimumRequiredVersion found."
                }
            } else {
                Write-Host "Could not retrieve SDK list or no SDKs found. Exit code: $LASTEXITCODE"
                $isInstalled = $false
            }
        } catch {
            Write-Host "Error checking installed SDKs: $_"
            $isInstalled = $false
        }
    }
    
    # Install .NET SDK if not found or version is insufficient
    try {
        if (-Not (Test-Path $InstallerPath)) {
            Write-Error "Installer not found at: $InstallerPath"
            return
        }
        
        Write-Host "Installing .NET SDK from $InstallerPath ..."
        Write-Host "Installer arguments: /install /quiet /norestart"
        
        $process = Start-Process -FilePath $InstallerPath -ArgumentList "/install", "/quiet", "/norestart" -Wait -PassThru
        
        if ($process.ExitCode -eq 0) {
            Write-Host ".NET SDK installed successfully."
            
            # Refresh environment after installation
            Write-Host "Refreshing environment variables after installation..."
            $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")
            
            # Verify installation
            Start-Sleep -Seconds 2
            $dotnetExeAfter = Find-DotNetExecutable
            if ($dotnetExeAfter) {
                Write-Host "Verifying installation..."
                try {
                    $verifyOutput = & $dotnetExeAfter --list-sdks 2>$null
                    if ($LASTEXITCODE -eq 0) {
                        Write-Host "Installation verification successful:"
                        $verifyOutput | ForEach-Object { Write-Host "  $_" }
                    } else {
                        Write-Warning "Installation verification failed with exit code: $LASTEXITCODE"
                    }
                } catch {
                    Write-Warning "Could not verify installation: $_"
                }
            }
        } else {
            Write-Error "Installation failed with exit code: $($process.ExitCode)"
        }
    } catch {
        Write-Error "An error occurred during the SDK installation: $_"
    }
}

# Usage examples:
# Install-DotNetSDK -InstallerPath "C:\path\to\dotnet-sdk-installer.exe"
# Install-DotNetSDK -InstallerPath "C:\path\to\dotnet-sdk-installer.exe" -ForceInstall
# Install-DotNetSDK -InstallerPath "C:\path\to\dotnet-sdk-installer.exe" -CleanDetection
# Install-DotNetSDK -InstallerPath "C:\path\to\dotnet-sdk-installer.exe" -MinimumRequiredVersion "6.0.100" -CleanDetection

# Usage examples:
# Install-DotNetSDK -InstallerPath "C:\path\to\dotnet-sdk-installer.exe"
# Install-DotNetSDK -InstallerPath "C:\path\to\dotnet-sdk-installer.exe" -ForceInstall
# Install-DotNetSDK -InstallerPath "C:\path\to\dotnet-sdk-installer.exe" -CleanDetection
# Install-DotNetSDK -InstallerPath "C:\path\to\dotnet-sdk-installer.exe" -MinimumRequiredVersion "6.0.100" -CleanDetection

# Usage example:
# Install-DotNetSDK -InstallerPath "C:\path\to\dotnet-sdk-installer.exe" -MinimumRequiredVersion "8.0.100"

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

#NetCore-Hosting URL
$NetHostingInstallerUrl = Join-Path $scriptDir  "$InsatalltionFile\dotnet-hosting-9.0.0-win.exe"
$NetSDKInstallerUrl = Join-Path $scriptDir  "$InsatalltionFile\dotnet-sdk-8.0.412-win-x64.exe"

#Set-ExecutionPolicy Unrestricted -Scope CurrentUser
#Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole -All -NoRestart

Install-AspNetCoreHostingBundle -DownloadUrl $NetHostingInstallerUrl
#Install-DotNetSDK -InstallerPath $NetSDKInstallerUrl -MinimumRequiredVersion "8.0.100" -ForceClean
Install-DotNetSDK -InstallerPath $NetSDKInstallerUrl
# Run as admin:
#Install-DotNetSDK -InstallerPath "C:\Path\To\dotnet-sdk-8.0.100-win-x64.exe" -MinimumRequiredVersion "8.0.100" -ForceClean


#Install-MongoDB -mongoInstallerUrl $mongoInstallerUrl -mongoInstallerPath $mongoInstallerPath -installPath $installPath
Install-MongoDB -mongoInstallerPath $mongoInstallerPath -installPath $installPath
Install-MongoDBTools  -toolsInstallerUrl  $toolsInstallerUrl -toolsInstallPath $toolsInstallPath

# Call the complete setup function with your parameters
Complete-MongoDBSetupWithAuth -installPath "C:\Program Files\MongoDB\Server\7.0" -configFile "C:\Program Files\MongoDB\Server\7.0\bin\mongod.cfg" -logFile "C:\Program Files\MongoDB\Server\7.0\log\mongod.log" -mongoshInstallerPath "C:\Path\To\mongosh-installer.msi" -mongoshPath "C:\Program Files\mongosh" -adminUsername "admin" -adminPassword "YourSecurePassword123!"

#Configure-MongoDBService -installPath $installPath -configFile $configFile -logFile $logFile
#Setup-MongoDBDatabase -downloadPath $downloadPath -mongoshInstallerPath $mongoshInstallerPath -mongoshPath $mongoshPath -mongoConnectionString $mongoConnectionString -mongoScriptPath $mongoScriptPath -logFile $logFile
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
# try {
#     $batFilePath = Join-Path -Path $PSScriptRoot -ChildPath "run_installer.bat"
#     if (Test-Path $batFilePath) {
#         Remove-Item $batFilePath -Force
#     }
# } catch {
#     Write-Warning "Failed to delete run_installer.bat: $_"
# }
