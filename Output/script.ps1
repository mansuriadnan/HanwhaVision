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
    # if ($service -and $service.Status -eq 'Running') {
    #     Write-Host "MongoDB service '$serviceName' is already running. Stopping for reconfiguration..."
    #     Stop-Service -Name $serviceName -Force
    #     Start-Sleep -Seconds 5
    # }

    # If service exists, remove it for clean reinstallation
    # if ($service) {
    #     Write-Host "Removing existing MongoDB service for clean reinstallation..."
    #     & "$installPath\bin\mongod.exe" --remove --serviceName $serviceName -ErrorAction SilentlyContinue
    #     Start-Sleep -Seconds 2
    # }

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

    # Create MongoDB config file WITHOUT authentication (for development)
    Write-Host "Creating MongoDB configuration file without authentication..."
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
# Note: Authentication is disabled for development purposes
# To enable authentication, uncomment the following lines:
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
    } else {
        Write-Host "Starting MongoDB service..."
        Start-Service $serviceName
        # Wait for the service to actually start
        Start-Sleep -Seconds 10 # Give MongoDB more time to start
        $serviceStatus = Get-Service -Name $serviceName
        if ($serviceStatus.Status -eq 'Running') {
            Write-Host "MongoDB service started successfully."
        } else {
            Write-Error "MongoDB service failed to start. Status: $($serviceStatus.Status)"
        }
    }

    Write-Host "==================== MongoDB Service Configuration Completed ===================="
}

# Function to set up MongoDB database and insert data
function Setup-MongoDBDatabase {
    param (
        [string]$mongoshInstallerPath,
        [string]$mongoshPath,
        [string]$mongoConnectionString = "mongodb://127.0.0.1:27017", # Default connection without auth
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
    
    # Wait for MongoDB service to start and be ready
    Write-Host "Waiting for MongoDB to be ready..."
    Start-Sleep -Seconds 10
    
    # Test MongoDB connection first
    Write-Host "Testing MongoDB connection..."
    $testProcess = Start-Process -FilePath "$mongoshPath\mongosh.exe" `
        -ArgumentList "$mongoConnectionString --eval `"db.adminCommand('ping')`"" `
        -Wait -PassThru `
        -RedirectStandardOutput "$mongoLogPath\connection_test.log" `
        -RedirectStandardError "$mongoLogPath\connection_error.log" `
        -WindowStyle Hidden
    
    if ($testProcess.ExitCode -ne 0) {
        Write-Host "MongoDB connection test failed. Check if MongoDB service is running."
        if (Test-Path "$mongoLogPath\connection_error.log") {
            Write-Host "Connection error details:"
            Get-Content "$mongoLogPath\connection_error.log"
        }
        return
    } else {
        Write-Host "MongoDB connection test successful."
    }
    
    # Check if mongosh is already installed
    if (-not (Test-Path "$mongoshPath\mongosh.exe")) {
        Write-Host "Installing MongoDB Shell with logging from local file..."
        Start-Process -FilePath "msiexec.exe" -ArgumentList "/i `"$mongoshInstallerPath`" /qn INSTALLLOCATION=`"$mongoshPath`" ALLUSERS=1 /l*v `"$logFile`"" -Wait
        
        if (-not (Test-Path "$mongoshPath\mongosh.exe")) {
            Write-Host "Failed to install MongoDB Shell."
            Write-Host "Check the log file at $logFile for details."
            return
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

try {
    // Test connection
    const result = db.adminCommand('ping');
    print('MongoDB ping successful:', JSON.stringify(result));
    
    // Check if database already exists
    const existingDbs = db.adminCommand('listDatabases').databases;
    const dbExists = existingDbs.some(database => database.name === dbName);

    if (dbExists) {
        print(``Database `${dbName}` already exists. Switching to it.``);
        
        db = db.getSiblingDB(dbName);
        
        // Check if collection exists
        const collections = db.getCollectionNames();
        if (collections.includes(collectionName)) {
            print(``Collection `${collectionName}` already exists in database `${dbName}`.``);
        } else {
            print(``Creating collection: `${collectionName}```);
            db.createCollection(collectionName);
            print(``Collection `${collectionName}` created successfully.``);
        }
    } else {
        print(``Creating database: `${dbName}```);
        db = db.getSiblingDB(dbName);
        print(``Creating collection: `${collectionName}```);
        db.createCollection(collectionName);
        print(``Database `${dbName}` and collection `${collectionName}` created successfully.``);
    }
    
    // Insert a test document to ensure everything works
    const testDoc = { 
        name: "test", 
        createdAt: new Date(), 
        message: "Database setup successful" 
    };
    db[collectionName].insertOne(testDoc);
    print('Test document inserted successfully.');
    
    // Verify the document was inserted
    const count = db[collectionName].countDocuments();
    print(``Collection `${collectionName}` now contains `${count}` document(s).``);
    
} catch (error) {
    print('Error during database setup:', error.message);
    quit(1);
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
        Write-Host "Error output:"
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
        Write-Host "This might be due to authentication requirements or MongoDB not being ready."
    }
    
    Write-Host "==================== MongoDB Database Setup Completed ===================="
}

# Function to set up MongoDB database and insert data


function Setup-MongoDBDatabaseWithAuth {
    param (
        [string]$mongoshPath,
        [string]$username,
        [string]$password,
        [string]$dbName,
        [string]$collectionName = "Test"
    )

    $mongoScript = @"
use $dbName
db.createCollection('$collectionName')
db.$collectionName.insertOne({ 
    name: "test", 
    createdAt: new Date(), 
    message: "Database setup with authentication successful" 
})
print('Database and collection created successfully with authentication')
"@

    $tempScriptPath = "C:\Program Files\MongoDB\Server\7.0\data\setup_db_auth.js"
    Set-Content -Path $tempScriptPath -Value $mongoScript -Encoding UTF8

    $process = Start-Process -FilePath "$mongoshPath\mongosh.exe" `
        -ArgumentList "mongodb://$username`:$password@127.0.0.1:27017/$dbName --file `"$tempScriptPath`"" `
        -Wait -PassThru -WindowStyle Hidden

    Remove-Item $tempScriptPath -Force -ErrorAction SilentlyContinue

    if ($process.ExitCode -eq 0) {
        Write-Host "Database '$dbName' and collection '$collectionName' created successfully with authentication."
    } else {
        Write-Host "Failed to create database and collection with authentication."
    }
}

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
        "IIS-WebServerRole",               # IIS Web Server
        "IIS-ManagementScriptingTools",    # IIS Management Scripts and Tools
        "IIS-WebMgmtTools"                 # Web Management Tools (includes IIS Manager GUI)
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

function Install-DotNetSDK {
    param (
        [string]$InstallerPath,
        [string]$MinimumRequiredVersion = "8.0.100"
    )

    try {
        if (-Not (Test-Path $InstallerPath)) {
            Write-Error "Installer not found at: $InstallerPath"
            return
        }

        Write-Host "Installing .NET SDK from $InstallerPath silently..."

        # Setup log path
        $logPath = Join-Path $env:TEMP "dotnet_install.log"

        # Prepare installer arguments
        $arguments = @(
            "/install",
            "/quiet",
            "/norestart",
            "/log `"$logPath`""
        )

        # Run silent install
        Start-Process -FilePath $InstallerPath -ArgumentList $arguments -Wait -NoNewWindow

        Write-Host ".NET SDK installed successfully."

        # Optionally update PATH
        $defaultDotNetPath = "${env:ProgramFiles}\dotnet"
        if (Test-Path $defaultDotNetPath) {
            Update-DotNetPath -DotNetPath $defaultDotNetPath
        }

        # Refresh environment variables
        $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" +
                    [System.Environment]::GetEnvironmentVariable("PATH", "User")

        # Verify installation
        Write-Host "Verifying installation..."
        Start-Sleep -Seconds 2
        $newVersions = Get-DotNetFromFileSystem
        if ($newVersions) {
            Write-Host "Installation verified. New versions found: $($newVersions -join ', ')"
        } else {
            Write-Warning "Installation may not have completed successfully - no new versions detected"
        }

    } catch {
        Write-Error "An error occurred during the SDK installation: $_"
    }
}

 function Get-DotNetFromFileSystem {
        Write-Host "Checking file system for .NET installations..."
        $versions = @()
        
        # Check both 64-bit and 32-bit locations
        $dotnetPaths = @(
            "${env:ProgramFiles}\dotnet",
            "${env:ProgramFiles(x86)}\dotnet",
            "${env:USERPROFILE}\.dotnet"
        )

        foreach ($dotnetPath in $dotnetPaths) {
            if (Test-Path $dotnetPath) {
                Write-Host "Checking .NET installation at: $dotnetPath"
                
                # Check SDK folders directly
                $sdkPath = Join-Path $dotnetPath "sdk"
                if (Test-Path $sdkPath) {
                    Write-Host "Checking SDK path: $sdkPath"
                    try {
                        $sdkDirs = Get-ChildItem -Path $sdkPath -Directory -ErrorAction SilentlyContinue | Where-Object { $_.Name -match '^\d+\.\d+\.\d+' }
                        foreach ($dir in $sdkDirs) {
                            Write-Host "Found SDK directory: $($dir.Name)"
                            $version = Convert-ToVersion $dir.Name
                            if ($version -ne $null) {
                                Write-Host "Successfully parsed directory version: $version"
                                $versions += $version
                            }
                        }
                    } catch {
                        Write-Host "Error reading SDK directories: $_"
                    }
                }
                
                # Also check if dotnet.exe exists and try to get version info from it
                $dotnetExe = Join-Path $dotnetPath "dotnet.exe"
                if (Test-Path $dotnetExe) {
                    Write-Host "Found dotnet.exe at: $dotnetExe"
                    
                    # Try to get version using a more robust approach
                    try {
                        # Set up environment
                        $originalPath = $env:PATH
                        $env:PATH = "$dotnetPath;$env:PATH"
                        
                        # Use cmd to execute dotnet command with proper environment
                        $cmd = "cmd.exe"
                        $args = "/c `"set PATH=$dotnetPath;%PATH% && `"$dotnetExe`" --list-sdks`""
                        
                        Write-Host "Executing command: $cmd $args"
                        
                        $psi = New-Object System.Diagnostics.ProcessStartInfo
                        $psi.FileName = $cmd
                        $psi.Arguments = $args
                        $psi.RedirectStandardOutput = $true
                        $psi.RedirectStandardError = $true
                        $psi.UseShellExecute = $false
                        $psi.CreateNoWindow = $true
                        $psi.WorkingDirectory = $dotnetPath
                        
                        # Set environment variables for the process
                        $psi.EnvironmentVariables["PATH"] = "$dotnetPath;$($psi.EnvironmentVariables["PATH"])"
                        $psi.EnvironmentVariables["DOTNET_ROOT"] = $dotnetPath
                        
                        $process = New-Object System.Diagnostics.Process
                        $process.StartInfo = $psi
                        
                        if ($process.Start()) {
                            $output = $process.StandardOutput.ReadToEnd()
                            $errors = $process.StandardError.ReadToEnd()
                            $process.WaitForExit(10000) # 10 second timeout
                            
                            Write-Host "Command output: $output"
                            if ($errors) {
                                Write-Host "Command errors: $errors"
                            }
                            
                            if ($output -and $output.Trim() -ne "") {
                                $lines = $output.Split([Environment]::NewLine, [StringSplitOptions]::RemoveEmptyEntries)
                                foreach ($line in $lines) {
                                    if ($line -and $line.Trim() -ne "") {
                                        Write-Host "Processing SDK line: '$line'"
                                        $versionPart = ($line -split '\s+')[0]
                                        $version = Convert-ToVersion $versionPart
                                        if ($version -ne $null) {
                                            Write-Host "Successfully parsed command version: $version"
                                            $versions += $version
                                        }
                                    }
                                }
                            }
                        }
                        
                        # Restore original PATH
                        $env:PATH = $originalPath
                        
                    } catch {
                        Write-Host "Error executing dotnet command: $_"
                        # Restore original PATH in case of error
                        if ($originalPath) {
                            $env:PATH = $originalPath
                        }
                    }
                }
            }
        }
        
        return $versions
    }



function Update-DotNetPath {
    param (
        [string]$DotNetPath
    )

    try {
        Write-Host "Updating PATH to include .NET: $DotNetPath"
        $currentPath = [Environment]::GetEnvironmentVariable('PATH', 'Machine')
        
        if (-not $currentPath) {
            $currentPath = ""
        }
        
        if (-not $currentPath.Contains($DotNetPath)) {
            Write-Host "Adding .NET to system PATH: $DotNetPath"
            $newPath = if ($currentPath.EndsWith(';')) { 
                $currentPath + $DotNetPath 
            } else { 
                $currentPath.TrimEnd(';') + ";" + $DotNetPath 
            }
            
            [Environment]::SetEnvironmentVariable('PATH', $newPath, 'Machine')
            
            # Also update the current session's PATH
            $userPath = [System.Environment]::GetEnvironmentVariable("PATH", "User")
            $env:PATH = $newPath + ";" + $userPath
            
            Write-Host "PATH updated successfully"
        } else {
            Write-Host ".NET path already exists in system PATH"
        }
    } catch {
        Write-Error "Failed to update PATH: $_"
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
$toolsInstallPath = "C:\Program Files\MongoDB\"
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
Install-DotNetSDK -InstallerPath $NetSDKInstallerUrl 

#Install-MongoDB -mongoInstallerUrl $mongoInstallerUrl -mongoInstallerPath $mongoInstallerPath -installPath $installPath
Install-MongoDB -mongoInstallerPath $mongoInstallerPath -installPath $installPath
Install-MongoDBTools  -toolsInstallerUrl  $toolsInstallerUrl -toolsInstallPath $toolsInstallPath

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
# try {
#     $batFilePath = Join-Path -Path $PSScriptRoot -ChildPath "run_installer.bat"
#     if (Test-Path $batFilePath) {
#         Remove-Item $batFilePath -Force
#     }
# } catch {
#     Write-Warning "Failed to delete run_installer.bat: $_"
# }
