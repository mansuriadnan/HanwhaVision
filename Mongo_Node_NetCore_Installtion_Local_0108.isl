; MongoDB .NET Installation Script Installer
; Local files only version with existing installation detection

[Setup]
AppName=Vision Insight Installer
AppVersion=1.0
DefaultDirName={autopf}\Vision Insight Installer
DefaultGroupName=Vision Insight Installer
OutputDir=Output
OutputBaseFilename=Vision Insight Installer
PrivilegesRequired=admin
ArchitecturesAllowed=x64
ArchitecturesInstallIn64BitMode=x64
PrivilegesRequiredOverridesAllowed=dialog
SetupIconFile=Group_1.ico


[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Files]
; Publish folder - uncomment this if you have application files to install
; Source: "Publish\*"; DestDir: "{app}\Publish"; Flags: recursesubdirs createallsubdirs
; External dependency files - these will be in the same folder as the EXE

Source: "{src}\Dependencies\dotnet-hosting-9.0.0-win.exe"; DestDir: "{tmp}"; Flags: external
Source: "{src}\Dependencies\dotnet-sdk-8.0.412-win-x64.exe"; DestDir: "{tmp}"; Flags: external
Source: "{src}\Dependencies\mongodb-windows-x86_64-7.0.12-signed.msi"; DestDir: "{tmp}"; Flags: external
Source: "{src}\Dependencies\mongosh-2.3.0-x64.msi"; DestDir: "{tmp}"; Flags: external

[Icons]
Name: "{userdesktop}\Vision Insight"; Filename: "http://localhost:8080"; IconFilename: "{src}\Group_1.ico"; IconIndex: 0


[Code]
var
  ComponentsPage: TWizardPage;
  NetHostingCheckBox: TCheckBox;
  InstallDotNetSDKCheckBox:TCheckBox;
  MongoDBCheckBox: TCheckBox;
  MongoToolsCheckBox: TCheckBox;
  IISSetupCheckBox: TCheckBox;
  
  ProgressPage: TOutputProgressWizardPage;

function InitializeSetup: Boolean;
var
  ResultCode: Integer;
  SetupDir: String;
  DebugMsg: String;
begin
  Result := True;
  
  // Check if PowerShell is available
  if not Exec('powershell.exe', '-Command "Write-Host PowerShell OK"', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) or (ResultCode <> 0) then
  begin
    MsgBox('PowerShell is required but not available on this system.', mbError, MB_OK);
    Result := False;
    Exit;
  end;
  
  // Get the setup directory and show debug info
  SetupDir := ExtractFilePath(ExpandConstant('{srcexe}'));
  DebugMsg := 'Setup Directory: ' + SetupDir + #13#10 + #13#10;
  
  // Check if Dependencies folder exists
  if DirExists(SetupDir + 'Dependencies') then
    DebugMsg := DebugMsg + 'Dependencies folder: EXISTS' + #13#10
  else
    DebugMsg := DebugMsg + 'Dependencies folder: NOT FOUND' + #13#10;
  
  // Check each required file and show full paths
  DebugMsg := DebugMsg + #13#10 + 'File checks:' + #13#10;
  
  if FileExists(SetupDir + 'Dependencies\dotnet-hosting-9.0.0-win.exe') then
    DebugMsg := DebugMsg + '✓ dotnet-hosting-9.0.0-win.exe: FOUND' + #13#10
  else begin
    DebugMsg := DebugMsg + '✗ dotnet-hosting-9.0.0-win.exe: NOT FOUND' + #13#10;
    DebugMsg := DebugMsg + '  Expected at: ' + SetupDir + 'Dependencies\dotnet-hosting-9.0.0-win.exe' + #13#10;
  end;
  
  if FileExists(SetupDir + 'Dependencies\dotnet-sdk-8.0.412-win-x64.exe') then
    DebugMsg := DebugMsg + '✓ dotnet-sdk-8.0.412-win-x64.exe: FOUND' + #13#10
  else begin
    DebugMsg := DebugMsg + '✗ dotnet-sdk-8.0.412-win-x64.exe: NOT FOUND' + #13#10;
    DebugMsg := DebugMsg + '  Expected at: ' + SetupDir + 'Dependencies\dotnet-sdk-8.0.412-win-x64.exe' + #13#10;
  end;
  
  if FileExists(SetupDir + 'Dependencies\mongodb-windows-x86_64-7.0.12-signed.msi') then
    DebugMsg := DebugMsg + '✓ mongodb-windows-x86_64-7.0.12-signed.msi: FOUND' + #13#10
  else begin
    DebugMsg := DebugMsg + '✗ mongodb-windows-x86_64-7.0.12-signed.msi: NOT FOUND' + #13#10;
    DebugMsg := DebugMsg + '  Expected at: ' + SetupDir + 'Dependencies\mongodb-windows-x86_64-7.0.12-signed.msi' + #13#10;
  end;
  
  if FileExists(SetupDir + 'Dependencies\mongosh-2.3.0-x64.msi') then
    DebugMsg := DebugMsg + '✓ mongosh-2.3.0-x64.msi: FOUND' + #13#10
  else begin
    DebugMsg := DebugMsg + '✗ mongosh-2.3.0-x64.msi: NOT FOUND' + #13#10;
    DebugMsg := DebugMsg + '  Expected at: ' + SetupDir + 'Dependencies\mongosh-2.3.0-x64.msi' + #13#10;
  end;
  
  // Show debug information
  MsgBox(DebugMsg, mbInformation, MB_OK);
  
  // Now check if all required dependency files exist
  
  if not FileExists(SetupDir + 'Dependencies\dotnet-hosting-9.0.0-win.exe') then
  begin
    MsgBox('Required file missing: Dependencies\dotnet-hosting-9.0.0-win.exe' + #13#10 + 
           'Please ensure all dependency files are in the Dependencies folder.', mbError, MB_OK);
    Result := False;
  end;
  
  if not FileExists(SetupDir + 'Dependencies\dotnet-sdk-8.0.412-win-x64.exe') then
  begin
    MsgBox('Required file missing: Dependencies\dotnet-sdk-8.0.412-win-x64.exe' + #13#10 + 
           'Please ensure all dependency files are in the Dependencies folder.', mbError, MB_OK);
    Result := False;
  end;
  
  if not FileExists(SetupDir + 'Dependencies\mongodb-windows-x86_64-7.0.12-signed.msi') then
  begin
    MsgBox('Required file missing: Dependencies\mongodb-windows-x86_64-7.0.12-signed.msi' + #13#10 + 
           'Please ensure all dependency files are in the Dependencies folder.', mbError, MB_OK);
    Result := False;
  end;
  
  if not FileExists(SetupDir + 'Dependencies\mongosh-2.3.0-x64.msi') then
  begin
    MsgBox('Required file missing: Dependencies\mongosh-2.3.0-x64.msi' + #13#10 + 
           'Please ensure all dependency files are in the Dependencies folder.', mbError, MB_OK);
    Result := False;
  end;
end;
  
procedure InitializeWizard;
var
  InfoLabel: TLabel;
begin
  // Create custom components selection page
  ComponentsPage := CreateCustomPage(wpSelectDir, 'Select Components', 'Choose which components to install');
  
  // Add info label
  InfoLabel := TLabel.Create(ComponentsPage);
  InfoLabel.Parent := ComponentsPage.Surface;
  InfoLabel.Caption := 'The installer will check for existing installations and skip components that are already installed.';
  InfoLabel.Left := ScaleX(10);
  InfoLabel.Top := ScaleY(10);
  InfoLabel.Width := ScaleX(400);
  InfoLabel.Height := ScaleY(30);
  InfoLabel.WordWrap := True;
  InfoLabel.Font.Style := [fsBold];
  
  // .NET Hosting Bundle checkbox
  NetHostingCheckBox := TCheckBox.Create(ComponentsPage);
  NetHostingCheckBox.Parent := ComponentsPage.Surface;
  NetHostingCheckBox.Caption := 'ASP.NET Core Hosting Bundle 9.0 (Required for web application)';
  NetHostingCheckBox.Left := ScaleX(10);
  NetHostingCheckBox.Top := ScaleY(60);
  NetHostingCheckBox.Width := ScaleX(400);
  NetHostingCheckBox.Height := ScaleY(17);
  NetHostingCheckBox.Checked := True;
  
    // .NET Hosting Bundle checkbox
  InstallDotNetSDKCheckBox := TCheckBox.Create(ComponentsPage);
  InstallDotNetSDKCheckBox.Parent := ComponentsPage.Surface;
  InstallDotNetSDKCheckBox.Caption := 'ASP.NET SDK 8.0.412 (Required for web application)';
  InstallDotNetSDKCheckBox.Left := ScaleX(10);
  InstallDotNetSDKCheckBox.Top := ScaleY(80);
  InstallDotNetSDKCheckBox.Width := ScaleX(400);
  InstallDotNetSDKCheckBox.Height := ScaleY(17);
  InstallDotNetSDKCheckBox.Checked := True;
  
  // MongoDB checkbox
  MongoDBCheckBox := TCheckBox.Create(ComponentsPage);
  MongoDBCheckBox.Parent := ComponentsPage.Surface;
  MongoDBCheckBox.Caption := 'MongoDB Server 7.0.12 (Database server)';
  MongoDBCheckBox.Left := ScaleX(10);
  MongoDBCheckBox.Top := ScaleY(100);
  MongoDBCheckBox.Width := ScaleX(400);
  MongoDBCheckBox.Height := ScaleY(17);
  MongoDBCheckBox.Checked := True;
  
  // MongoDB Tools checkbox
  MongoToolsCheckBox := TCheckBox.Create(ComponentsPage);
  MongoToolsCheckBox.Parent := ComponentsPage.Surface;
  MongoToolsCheckBox.Caption := 'MongoDB Shell (mongosh) 2.3.0 (Database management tool)';
  MongoToolsCheckBox.Left := ScaleX(10);
  MongoToolsCheckBox.Top := ScaleY(120);
  MongoToolsCheckBox.Width := ScaleX(400);
  MongoToolsCheckBox.Height := ScaleY(17);
  MongoToolsCheckBox.Checked := True;
  
  // IIS Setup checkbox
  IISSetupCheckBox := TCheckBox.Create(ComponentsPage);
  IISSetupCheckBox.Parent := ComponentsPage.Surface;
  IISSetupCheckBox.Caption := 'IIS Web Server and Application Setup (Web hosting configuration)';
  IISSetupCheckBox.Left := ScaleX(10);
  IISSetupCheckBox.Top := ScaleY(140);
  IISSetupCheckBox.Width := ScaleX(400);
  IISSetupCheckBox.Height := ScaleY(17);
  IISSetupCheckBox.Checked := True;
end;

function NextButtonClick(CurPageID: Integer): Boolean;
begin
  Result := True;
  
  // Validate that at least one component is selected
  if CurPageID = ComponentsPage.ID then
  begin
    if not (NetHostingCheckBox.Checked or MongoDBCheckBox.Checked or 
            MongoToolsCheckBox.Checked or IISSetupCheckBox.Checked) then
    begin
      MsgBox('Please select at least one component to install.', mbError, MB_OK);
      Result := False;
    end;
  end;
end;

function SafeExec(const Filename, Params, WorkingDir: String; const ShowCmd: Integer; const Wait: TExecWait; var ResultCode: Integer): Boolean;
begin
  Result := False;
  try
    Result := Exec(Filename, Params, WorkingDir, ShowCmd, Wait, ResultCode);
  except
    
    begin
      
      ResultCode := -1;
    end;
  end;
end;

function IsDotNetHostingBundleInstalled: Boolean;
var
  ResultCode: Integer;
  CheckCmd: String;
  TempFile: String;
  FileLines: TStringList;
begin
  Result := False;
  TempFile := ExpandConstant('{tmp}\dotnet_check.txt');
  
  // Delete existing temp file
  if FileExists(TempFile) then
    DeleteFile(TempFile);
  
  // Check for .NET hosting bundle using multiple methods
  CheckCmd := 'try { ' +
              '$dotnetInfo = dotnet --info 2>$null; ' +
              'if ($dotnetInfo -match "Microsoft.AspNetCore.App 9\.0\." -or $dotnetInfo -match "Microsoft.AspNetCore.App.*9\.0") { ' +
              '  "INSTALLED" | Out-File "' + TempFile + '" -Encoding UTF8; exit 0; ' +
              '} ' +
              '$hostingBundle = Get-WmiObject -Query "SELECT * FROM Win32_Product WHERE Name LIKE ''%ASP.NET Core%'' AND Name LIKE ''%Hosting Bundle%''" 2>$null; ' +
              'if ($hostingBundle) { ' +
              '  "INSTALLED" | Out-File "' + TempFile + '" -Encoding UTF8; exit 0; ' +
              '} ' +
              'if (Test-Path "${env:ProgramFiles}\dotnet\shared\Microsoft.AspNetCore.App") { ' +
              '  $versions = Get-ChildItem "${env:ProgramFiles}\dotnet\shared\Microsoft.AspNetCore.App" | Where-Object {$_.Name -like "9.0.*"}; ' +
              '  if ($versions) { "INSTALLED" | Out-File "' + TempFile + '" -Encoding UTF8; exit 0; } ' +
              '} ' +
              '"NOT_INSTALLED" | Out-File "' + TempFile + '" -Encoding UTF8; exit 1; ' +
              '} catch { "NOT_INSTALLED" | Out-File "' + TempFile + '" -Encoding UTF8; exit 1; }';
  
  if SafeExec('powershell.exe', '-ExecutionPolicy Bypass -Command "' + CheckCmd + '"', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then
  begin
    if FileExists(TempFile) then
    begin
      FileLines := TStringList.Create;
      try
        FileLines.LoadFromFile(TempFile);
        if FileLines.Count > 0 then
        begin
          Result := Pos('INSTALLED', Trim(FileLines[0])) > 0;
        end;
      finally
        FileLines.Free;
      end;
      DeleteFile(TempFile);
    end;
  end;
end;

function IsDotNetSDKInstalled: Boolean;
var
  ResultCode: Integer;
  OutputFile, CheckScript: string;
  Lines: TArrayOfString;
begin
  Result := False;
  OutputFile := ExpandConstant('{tmp}\check_sdk_output.txt');
  CheckScript := ExpandConstant('{tmp}\check_dotnet_sdk.ps1');

  // PowerShell script to check if dotnet SDK 8.0.412 is installed
  SaveStringToFile(CheckScript,
    '$OutputFile = "' + OutputFile + '"' + #13#10 +
    'try {' + #13#10 +
    '  $result = dotnet --list-sdks | Where-Object { $_ -match "8.0.412" }' + #13#10 +
    '  if ($result) { "installed" | Out-File $OutputFile -Encoding utf8 }' + #13#10 +
    '} catch { "error" | Out-File $OutputFile -Encoding utf8 }',
    False);

  // Run the script silently
  if Exec('powershell.exe', '-ExecutionPolicy Bypass -File "' + CheckScript + '"', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then
  begin
    if FileExists(OutputFile) then
    begin
      if LoadStringsFromFile(OutputFile, Lines) then
      begin
        if (GetArrayLength(Lines) > 0) and (Pos('installed', Lines[0]) > 0) then
          Result := True;
      end;
    end;
  end;
end;


function IsMongoDBInstalled: Boolean;
var
  ResultCode: Integer;
  CheckCmd: String;
  TempFile: String;
  FileLines: TStringList;
begin
  Result := False;
  TempFile := ExpandConstant('{tmp}\mongo_check.txt');

  // Check for MongoDB in Program Files, Services, and mongod.exe
  CheckCmd := 'try { ' +
              'if (Test-Path "C:\Program Files\MongoDB\Server") { ' +
              '  $versions = Get-ChildItem "C:\Program Files\MongoDB\Server" | Where-Object { $_.Name -match "7\.0" }; ' +
              '  if ($versions) { "INSTALLED" | Out-File "' + TempFile + '"; exit 0; } ' +
              '} ' +
              'if (Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue) { "INSTALLED" | Out-File "' + TempFile + '"; exit 0; } ' +
              'if (Get-Command mongod.exe -ErrorAction SilentlyContinue) { "INSTALLED" | Out-File "' + TempFile + '"; exit 0; } ' +
              '"NOT_INSTALLED" | Out-File "' + TempFile + '"; exit 1; ' +
              '} catch { "NOT_INSTALLED" | Out-File "' + TempFile + '"; exit 1; }';

  if Exec('powershell.exe', '-ExecutionPolicy Bypass -Command "' + CheckCmd + '"', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then
  begin
    if FileExists(TempFile) then
    begin
      FileLines := TStringList.Create;
      try
        FileLines.LoadFromFile(TempFile);
        if FileLines.Count > 0 then
        begin
          Result := Pos('INSTALLED', Trim(FileLines[0])) > 0;
        end;
      finally
        FileLines.Free;
      end;
      DeleteFile(TempFile);
    end;
  end;
end;



function IsMongoShellInstalled: Boolean;
var
  ResultCode: Integer;
  CheckCmd: String;
  TempFile: String;
  FileLines: TStringList;
begin
  Result := False;
  TempFile := ExpandConstant('{tmp}\mongosh_check.txt');
  
  // Delete existing temp file
  if FileExists(TempFile) then
    DeleteFile(TempFile);
  
  // Check for MongoDB Shell installation
  CheckCmd := 'try { ' +
              'if (Test-Path "C:\Program Files\mongosh\mongosh.exe") { "INSTALLED" | Out-File "' + TempFile + '" -Encoding UTF8; exit 0; } ' +
              'if (Get-Command mongosh -ErrorAction SilentlyContinue) { "INSTALLED" | Out-File "' + TempFile + '" -Encoding UTF8; exit 0; } ' +
              '"NOT_INSTALLED" | Out-File "' + TempFile + '" -Encoding UTF8; exit 1; ' +
              '} catch { "NOT_INSTALLED" | Out-File "' + TempFile + '" -Encoding UTF8; exit 1; }';
  
  if SafeExec('powershell.exe', '-ExecutionPolicy Bypass -Command "' + CheckCmd + '"', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then
  begin
    if FileExists(TempFile) then
    begin
      FileLines := TStringList.Create;
      try
        FileLines.LoadFromFile(TempFile);
        if FileLines.Count > 0 then
        begin
          Result := Pos('INSTALLED', Trim(FileLines[0])) > 0;
        end;
      finally
        FileLines.Free;
      end;
      DeleteFile(TempFile);
    end;
  end;
end;

function IsIISInstalled: Boolean;
var
  ResultCode: Integer;
  CheckCmd: String;
begin
  Result := False;
  
  CheckCmd := 'try { ' +
              'Import-Module WebAdministration -ErrorAction Stop; ' +
              'if (Get-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole | Where-Object {$_.State -eq "Enabled"}) { exit 0; } ' +
              'exit 1; ' +
              '} catch { exit 1; }';
  
  if SafeExec('powershell.exe', '-ExecutionPolicy Bypass -Command "' + CheckCmd + '"', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then
  begin
    Result := (ResultCode = 0);
  end;
end;

function CopyLocalFile(const LocalFileName, TargetPath: string): Boolean;
var
  SetupDir: String;
  SourcePath: String;
begin
  Result := False;
  SetupDir := ExtractFilePath(ExpandConstant('{srcexe}'));
  SourcePath := SetupDir + 'Dependencies\' + LocalFileName;
  
  if FileExists(SourcePath) then
  begin
    Result := FileCopy(SourcePath, TargetPath, False);
    
  end
  else
  begin
    Log('Source file not found: ' + SourcePath);
  end;
end;

function InstallNetHostingBundle: Boolean;
var
  ResultCode: Integer;
  InstallerPath: String;
begin
  Result := True;
  if not NetHostingCheckBox.Checked then Exit;
  
  try
    ProgressPage.SetText('Checking ASP.NET Core Hosting Bundle...', 'Detecting existing installation...');
    ProgressPage.SetProgress(5, 100);
    
    // Check if already installed
    if IsDotNetHostingBundleInstalled then
    begin
      ProgressPage.SetText('ASP.NET Core Hosting Bundle already installed.', 'Skipping installation...');
      ProgressPage.SetProgress(25, 100);
      Sleep(1000);
      Exit;
    end;
    
    ProgressPage.SetText('Installing ASP.NET Core Hosting Bundle...', 'Please wait while the hosting bundle is being installed...');
    ProgressPage.SetProgress(10, 100);
    
    InstallerPath := ExpandConstant('{tmp}\dotnet-hosting-9.0.0-win.exe');
    
    // Copy local file to temp
    if not CopyLocalFile('dotnet-hosting-9.0.0-win.exe', InstallerPath) then
    begin
      MsgBox('Failed to copy .NET Hosting Bundle installer from Dependencies folder.', mbError, MB_OK);
      Result := False;
      Exit;
    end;
    
    if not SafeExec(InstallerPath, '/install /quiet /norestart', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then
    begin
      MsgBox('Failed to execute ASP.NET Core Hosting Bundle installer. Error code: ' + IntToStr(ResultCode), mbError, MB_OK);
      Result := False;
    end
    else if ResultCode <> 0 then
    begin
      MsgBox('ASP.NET Core Hosting Bundle installation failed with exit code: ' + IntToStr(ResultCode), mbError, MB_OK);
      Result := False;
    end;
    
    ProgressPage.SetProgress(25, 100);
  except
    
    begin
      
      Result := False;
    end;
  end;
end;

function InstallDotNetSDK: Boolean;
var
  ResultCode: Integer;
  InstallerPath: String;
begin
  Result := True;

  try
    ProgressPage.SetText('Installing .NET SDK 8.0.412...', 'Checking for existing installation...');
    ProgressPage.SetProgress(5, 100);
    Sleep(1000);
    
    // Check if already installed
    if IsDotNetHostingBundleInstalled then
    begin
      ProgressPage.SetText('ASP.NET Core Hosting Bundle already installed.', 'Skipping installation...');
      ProgressPage.SetProgress(25, 100);
      Sleep(1000);
      Exit;
    end;

    // Set the target temp path for the SDK installer
    InstallerPath := ExpandConstant('{tmp}\dotnet-sdk-8.0.412-win-x64.exe');

    // Copy from local EXE folder to temp
    if not CopyLocalFile('dotnet-sdk-8.0.412-win-x64.exe', InstallerPath) then
    begin
      MsgBox('Failed to copy .NET SDK installer from local directory.', mbError, MB_OK);
      Result := False;
      Exit;
    end;

    ProgressPage.SetText('Installing .NET SDK 8.0.412...', 'Please wait while the SDK is being installed...');
    ProgressPage.SetProgress(10, 100);

    // Run the installer silently
    if not SafeExec(InstallerPath, '/install /quiet /norestart', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then
    begin
      MsgBox('Failed to execute .NET SDK installer. Error code: ' + IntToStr(ResultCode), mbError, MB_OK);
      Result := False;
    end
    else if ResultCode <> 0 then
    begin
      MsgBox('.NET SDK installation failed with exit code: ' + IntToStr(ResultCode), mbError, MB_OK);
      Result := False;
    end;

    ProgressPage.SetProgress(25, 100);
    Sleep(500);
  except
    begin
      MsgBox('Unexpected error during .NET SDK installation.', mbError, MB_OK);
      Result := False;
    end;
  end;
end;


function InstallMongoDB: Boolean;
var
  ResultCode: Integer;
  InstallerPath: String;
  InstallPath: String;
  MongoDir: String;
begin
  Result := True;
  if not MongoDBCheckBox.Checked then Exit;

  ProgressPage.SetText('Checking MongoDB Server...', 'Detecting existing installation...');
  ProgressPage.SetProgress(30, 100);

  // Stronger skip logic: Check service, folder, or executable
  if IsMongoDBInstalled then
  begin
    ProgressPage.SetText('MongoDB Server already installed.', 'Skipping installation...');
    ProgressPage.SetProgress(50, 100);
    Sleep(1000);
    Exit;
  end;

  ProgressPage.SetText('Installing MongoDB Server...', 'Please wait while MongoDB is being installed...');
  ProgressPage.SetProgress(35, 100);

  InstallerPath := ExpandConstant('{tmp}\mongodb-windows-x86_64-7.0.12-signed.msi');
  InstallPath := 'C:\Program Files\MongoDB\Server\7.0\';

  // Check if install folder already exists
  if DirExists(InstallPath) then
  begin
    ProgressPage.SetText('MongoDB directory already exists.', 'Skipping MongoDB installation to avoid conflict...');
    ProgressPage.SetProgress(50, 100);
    Exit;
  end;

  // Copy local file to temp
  if not CopyLocalFile('mongodb-windows-x86_64-7.0.12-signed.msi', InstallerPath) then
  begin
    MsgBox('Failed to copy MongoDB installer from Dependencies folder.', mbError, MB_OK);
    Result := False;
    Exit;
  end;

  // Run installer with verbose log
  if not Exec('msiexec.exe', Format('/i "%s" INSTALLLOCATION="%s" ADDLOCAL=all /quiet /norestart /l*v "%s"',         [InstallerPath, InstallPath, ExpandConstant('{tmp}\mongodb_install.log')]), '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then
  begin
    MsgBox('MongoDB installation failed to execute.', mbError, MB_OK);
    Result := False;
    Exit;
  end;

  // Handle known failure
  if ResultCode = 1603 then
  begin
    MsgBox('MongoDB installation failed with exit code: 1603.' + #13#10 +
           'A possible cause is that MongoDB is already installed or partially installed.' + #13#10 +
           'Check if a MongoDB service exists or remove the folder manually:' + #13#10 +
           'C:\Program Files\MongoDB\Server\7.0\', mbError, MB_OK);
    Result := False;
    Exit;
  end;

  ProgressPage.SetProgress(50, 100);
end;


function InstallMongoTools: Boolean;
var
  ResultCode: Integer;
  InstallerPath: String;
  MongoshPath: String;
  LogFile: String;
begin
  Result := True;
  if not MongoToolsCheckBox.Checked then Exit;

  ProgressPage.SetText('Checking MongoDB Shell...', 'Detecting existing installation...');
  ProgressPage.SetProgress(55, 100);

  // Skip installation if already installed
  if IsMongoShellInstalled then
  begin
    ProgressPage.SetText('MongoDB Shell already installed.', 'Skipping installation...');
    ProgressPage.SetProgress(70, 100);
    Sleep(1000);
    Exit;
  end;

  ProgressPage.SetText('Installing MongoDB Shell...', 'Please wait while MongoDB Shell is being installed...');
  ProgressPage.SetProgress(60, 100);

  InstallerPath := ExpandConstant('{tmp}\mongosh-2.3.0-x64.msi');
  MongoshPath := 'C:\Program Files\mongosh\';
  LogFile := ExpandConstant('{tmp}\mongosh_install.log');

  // Check if mongosh folder exists already (indicating partial install)
  if DirExists(MongoshPath) then
  begin
    ProgressPage.SetText('MongoDB Shell folder already exists.', 'Skipping installation to avoid error 1603...');
    ProgressPage.SetProgress(70, 100);
    Exit;
  end;

  // Copy local file
  if not CopyLocalFile('mongosh-2.3.0-x64.msi', InstallerPath) then
  begin
    MsgBox('Failed to copy MongoDB Shell installer from Dependencies folder.', mbError, MB_OK);
    Result := False;
    Exit;
  end;

  // Run installer with log
  if not Exec('msiexec.exe', Format('/i "%s" /qn INSTALLLOCATION="%s" ALLUSERS=1 /l*v "%s"',[InstallerPath, MongoshPath, LogFile]), '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then
  begin
    MsgBox('MongoDB Shell installation failed to execute.', mbError, MB_OK);
    Result := False;
    Exit;
  end;

  // Handle known failure
  if ResultCode = 1603 then
  begin
    MsgBox('MongoDB Shell installation failed with exit code: 1603.' + #13#10 +
           'It may already be installed or the folder may exist:' + #13#10 +
           MongoshPath + #13#10 +
           'Try removing it manually or check the log file at:' + #13#10 +
           LogFile, mbError, MB_OK);
    Result := False;
    Exit;
  end;

  ProgressPage.SetProgress(70, 100);
end;


function ConfigureMongoDB: Boolean;
var
  ResultCode: Integer;
  ConfigScript: String;
begin
  Result := True;
  if not MongoDBCheckBox.Checked then Exit;
  
  try
    ProgressPage.SetText('Configuring MongoDB Service...', 'Setting up database directories and service...');
    ProgressPage.SetProgress(75, 100);
    
    ConfigScript := 
      'try {' +
      '  New-Item -Path "C:\data\db" -ItemType Directory -Force | Out-Null;' +
      '  New-Item -Path "C:\data\log" -ItemType Directory -Force | Out-Null;' +
      '  $configContent = @"' + #13#10 +
      'systemLog:' + #13#10 +
      '    destination: file' + #13#10 +
      '    path: c:/data/log/mongod.log' + #13#10 +
      '    logAppend: true' + #13#10 +
      'storage:' + #13#10 +
      '    dbPath: c:/data/db' + #13#10 +
      'net:' + #13#10 +
      '    bindIp: 127.0.0.1' + #13#10 +
      '    port: 27017' + #13#10 +
      '"@;' +
      '  $configPath = "C:\Program Files\MongoDB\Server\7.0\mongod.cfg";' +
      '  Set-Content -Path $configPath -Value $configContent;' +
      '  $mongodPath = "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe";' +
      '  if (Test-Path $mongodPath) {' +
      '    & $mongodPath --config $configPath --install;' +
      '    Start-Service mongodb -ErrorAction SilentlyContinue;' +
      '  }' +
      '  Write-Host "MongoDB configured successfully";' +
      '} catch {' +
      '  Write-Host "Error configuring MongoDB: $_";' +
      '  exit 1;' +
      '}';
    
    if not SafeExec('powershell.exe', '-ExecutionPolicy Bypass -Command "' + ConfigScript + '"', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then
    begin
      MsgBox('Warning: MongoDB service configuration may have encountered issues. You may need to configure it manually.', mbInformation, MB_OK);
      // Don't fail the installation for service configuration issues
    end;
    
    ProgressPage.SetProgress(80, 100);
  except
    
    begin
      
      // Don't fail the installation for configuration issues
    end;
  end;
end;

function SetupIIS: Boolean;
var
  ResultCode: Integer;
  IISScript: String;
  PhysicalPath: String;
  AppPoolName: String;
  SiteName: String;
  Port: String;
  DefaultSiteName: String;
  LogFile: String;
  ScriptFile: String;
begin
  Result := True;
  if not IISSetupCheckBox.Checked then Exit;
  
  // Configuration variables
  AppPoolName := 'MyAppPool';
  SiteName := 'MyApp';
  Port := '8080';
  DefaultSiteName := 'Default Web Site';
  PhysicalPath := ExpandConstant('{app}\Publish');
  LogFile := ExpandConstant('{tmp}\IIS_Setup_Log.txt');
  ScriptFile := ExpandConstant('{tmp}\IIS_Setup_Script.ps1');
  
  ProgressPage.SetText('Checking IIS installation...', 'Detecting existing IIS setup...');
  ProgressPage.SetProgress(75, 100);
  
  // Create folder if it doesn't exist
  if not DirExists(PhysicalPath) then
    ForceDirectories(PhysicalPath);
  
  ProgressPage.SetText('Creating PowerShell script...', 'Preparing IIS setup script...');
  ProgressPage.SetProgress(78, 100);
  
  // Create the PowerShell script file with your exact functions
  IISScript := 
    '$ErrorActionPreference = "Stop"' + #13#10 +
    '$LogFile = "' + LogFile + '"' + #13#10 +
    '$AppPoolName = "' + AppPoolName + '"' + #13#10 +
    '$SiteName = "' + SiteName + '"' + #13#10 +
    '$Port = ' + Port + #13#10 +
    '$PhysicalPath = "' + PhysicalPath + '"' + #13#10 +
    '$DefaultSiteName = "' + DefaultSiteName + '"' + #13#10 + #13#10 +
    
    'function Write-Log { param([string]$Message); $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"; "$timestamp - $Message" | Out-File -FilePath $LogFile -Append -Encoding UTF8; Write-Host $Message; }' + #13#10 + #13#10 +
    
    'try {' + #13#10 +
    '    Write-Log "=== IIS Setup Process Started ==="' + #13#10 +
    '    Write-Log "App Pool: $AppPoolName"' + #13#10 +
    '    Write-Log "Site Name: $SiteName"' + #13#10 +
    '    Write-Log "Port: $Port"' + #13#10 +
    '    Write-Log "Physical Path: $PhysicalPath"' + #13#10 + #13#10 +
    
    // Ensure-IISDependencies function
    'function Ensure-IISDependencies {' + #13#10 +
    '    Write-Log "Starting IIS Dependencies Check..."' + #13#10 +
    '    $features = @("IIS-WebServerRole", "IIS-ManagementScriptingTools")' + #13#10 +
    '    foreach ($feature in $features) {' + #13#10 +
    '        Write-Log "Loop $feature is started."' + #13#10 +
    '        $featureStatus = (dism /online /Get-FeatureInfo /FeatureName:$feature 2>&1 | Select-String "State :")' + #13#10 +
    '        if ($featureStatus -and $featureStatus -match "Enabled") {' + #13#10 +
    '            Write-Log "$feature is already enabled."' + #13#10 +
    '        } else {' + #13#10 +
    '            Write-Log "Enabling: $feature..."' + #13#10 +
    '            Start-Process "dism.exe" -ArgumentList "/online", "/Enable-Feature", "/FeatureName:$feature", "/All", "/NoRestart" -Wait -WindowStyle Hidden' + #13#10 +
    '        }' + #13#10 +
    '    }' + #13#10 +
    '}' + #13#10 + #13#10 +
    
    // Import WebAdministration after ensuring IIS is installed
    'Import-Module WebAdministration -ErrorAction Stop' + #13#10 + #13#10 +
    
    // Create-AppPool function
    'function Create-AppPool {' + #13#10 +
    '    Write-Log "==================== Starting IIS Hosting Setup ===================="' + #13#10 +
    '    try {' + #13#10 +
    '        Import-Module WebAdministration -Force' + #13#10 +
    '        Write-Log "WebAdministration module imported successfully."' + #13#10 +
    '    } catch {' + #13#10 +
    '        Write-Log "Failed to import WebAdministration module: $($_.Exception.Message)"' + #13#10 +
    '        Write-Log "Attempting to enable IIS features..."' + #13#10 +
    '        Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole, IIS-WebServer, IIS-CommonHttpFeatures, IIS-HttpErrors, IIS-HttpLogging, IIS-RequestMonitor, IIS-HttpTracing, IIS-Security, IIS-RequestFiltering, IIS-Performance, IIS-WebServerManagementTools, IIS-ManagementConsole, IIS-IIS6ManagementCompatibility, IIS-Metabase -All' + #13#10 +
    '        Import-Module WebAdministration -Force' + #13#10 +
    '    }' + #13#10 +
    '    Write-Log "Checking if Application Pool ''$AppPoolName'' exists..."' + #13#10 +
    '    try {' + #13#10 +
    '        $existingPool = Get-IISAppPool -Name $AppPoolName -ErrorAction SilentlyContinue' + #13#10 +
    '        if ($existingPool) {' + #13#10 +
    '            Write-Log "Application Pool ''$AppPoolName'' already exists."' + #13#10 +
    '        } else {' + #13#10 +
    '            New-WebAppPool -Name $AppPoolName' + #13#10 +
    '            Write-Log "Application Pool ''$AppPoolName'' created successfully."' + #13#10 +
    '        }' + #13#10 +
    '    } catch {' + #13#10 +
    '        Write-Log "Using appcmd.exe as fallback method..."' + #13#10 +
    '        $appcmdPath = "$env:SystemRoot\System32\inetsrv\appcmd.exe"' + #13#10 +
    '        if (Test-Path $appcmdPath) {' + #13#10 +
    '            $result = & $appcmdPath list apppool $AppPoolName 2>$null' + #13#10 +
    '            if ($result) {' + #13#10 +
    '                Write-Log "Application Pool ''$AppPoolName'' already exists."' + #13#10 +
    '            } else {' + #13#10 +
    '                & $appcmdPath add apppool /name:$AppPoolName' + #13#10 +
    '                Write-Log "Application Pool ''$AppPoolName'' created successfully using appcmd.exe."' + #13#10 +
    '            }' + #13#10 +
    '        } else {' + #13#10 +
    '            Write-Log "ERROR: Neither PowerShell cmdlets nor appcmd.exe are available for IIS management."' + #13#10 +
    '            throw "IIS management tools are not available."' + #13#10 +
    '        }' + #13#10 +
    '    }' + #13#10 +
    '}' + #13#10 + #13#10 +
    
    // Stop-DefaultWebsite function using appcmd.exe
    'function Stop-DefaultWebsite {' + #13#10 +
    '    param ([string]$DefaultSiteName)' + #13#10 +
    '    Write-Log "Stopping Default Web Site..."' + #13#10 +
    '    try {' + #13#10 +
    '        Stop-Website -Name $DefaultSiteName -ErrorAction Stop' + #13#10 +
    '        Write-Log "Default Web Site stopped using PowerShell cmdlet."' + #13#10 +
    '    } catch {' + #13#10 +
    '        Write-Log "PowerShell cmdlet failed: $($_.Exception.Message). Using appcmd.exe..."' + #13#10 +
    '        $appcmdPath = "$env:SystemRoot\System32\inetsrv\appcmd.exe"' + #13#10 +
    '        if (Test-Path $appcmdPath) {' + #13#10 +
    '            $result = & $appcmdPath stop site "$DefaultSiteName" 2>&1' + #13#10 +
    '            if ($LASTEXITCODE -eq 0) {' + #13#10 +
    '                Write-Log "Default Web Site stopped using appcmd.exe."' + #13#10 +
    '            } else {' + #13#10 +
    '                Write-Log "appcmd.exe result: $result (Exit code: $LASTEXITCODE)"' + #13#10 +
    '                Write-Log "Note: Default site may already be stopped or not exist."' + #13#10 +
    '            }' + #13#10 +
    '        } else {' + #13#10 +
    '            Write-Log "WARNING: appcmd.exe not found. Cannot stop default website."' + #13#10 +
    '        }' + #13#10 +
    '    }' + #13#10 +
    '}' + #13#10 + #13#10 +
    
    // Create-Website function (simplified version)
    'function Create-Website {' + #13#10 +
    '    param ([string]$SiteName, [string]$PhysicalPath, [int]$Port, [string]$AppPoolName)' + #13#10 +
    '    Write-Log "==================== Creating/Updating IIS Website ===================="' + #13#10 +
    '    Write-Log "Site Name: $SiteName"' + #13#10 +
    '    Write-Log "Physical Path: $PhysicalPath"' + #13#10 +
    '    Write-Log "Port: $Port"' + #13#10 +
    '    Write-Log "Application Pool: $AppPoolName"' + #13#10 +
    '    $appcmdPath = "$env:SystemRoot\System32\inetsrv\appcmd.exe"' + #13#10 +
    '    if (!(Test-Path $appcmdPath)) {' + #13#10 +
    '        Write-Log "ERROR: IIS is not installed or appcmd.exe is not available."' + #13#10 +
    '        return $false' + #13#10 +
    '    }' + #13#10 +
    '    if (!(Test-Path $PhysicalPath)) {' + #13#10 +
    '        New-Item -ItemType Directory -Path $PhysicalPath -Force | Out-Null' + #13#10 +
    '        Write-Log "Created physical path: $PhysicalPath"' + #13#10 +
    '    }' + #13#10 +
    '    $siteList = & $appcmdPath list site $SiteName 2>$null' + #13#10 +
    '    $siteExists = ($siteList -and $siteList.Length -gt 0 -and $siteList -notlike "*ERROR*")' + #13#10 +
    '    if ($siteExists) {' + #13#10 +
    '        Write-Log "Website ''$SiteName'' exists. Updating configuration..."' + #13#10 +
    '        & $appcmdPath stop site $SiteName 2>$null' + #13#10 +
    '        & $appcmdPath set vdir "${SiteName}/" /physicalPath:$PhysicalPath 2>&1' + #13#10 +
    '        & $appcmdPath set app "${SiteName}/" /applicationPool:$AppPoolName 2>&1' + #13#10 +
    '        $bindingString = "http/*:${Port}:"' + #13#10 +
    '        & $appcmdPath set site $SiteName /bindings:$bindingString 2>&1' + #13#10 +
    '        & $appcmdPath start site $SiteName 2>$null' + #13#10 +
    '    } else {' + #13#10 +
    '        Write-Log "Website ''$SiteName'' does not exist. Creating new website..."' + #13#10 +
    '        $bindingString = "http/*:${Port}:"' + #13#10 +
    '        & $appcmdPath add site /name:$SiteName /physicalPath:$PhysicalPath /bindings:$bindingString 2>&1' + #13#10 +
    '        & $appcmdPath set app "${SiteName}/" /applicationPool:$AppPoolName 2>&1' + #13#10 +
    '        & $appcmdPath start site $SiteName 2>&1' + #13#10 +
    '        Write-Log "Website URL: http://localhost:$Port"' + #13#10 +
    '    }' + #13#10 +
    '    return $true' + #13#10 +
    '}' + #13#10 + #13#10 +
    
    // Configure-Permissions function
    'function Configure-Permissions {' + #13#10 +
    '    param ([string]$PhysicalPath)' + #13#10 +
    '    Write-Log "Configuring folder permissions for IIS_IUSRS..."' + #13#10 +
    '    try {' + #13#10 +
    '        $Acl = Get-Acl $PhysicalPath' + #13#10 +
    '        $AccessRule = New-Object System.Security.AccessControl.FileSystemAccessRule("IIS_IUSRS", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow")' + #13#10 +
    '        $Acl.SetAccessRule($AccessRule)' + #13#10 +
    '        Set-Acl -Path $PhysicalPath -AclObject $Acl' + #13#10 +
    '        Write-Log "Permissions successfully configured for IIS_IUSRS."' + #13#10 +
    '    } catch {' + #13#10 +
    '        Write-Log "Failed to configure permissions. Error: $_"' + #13#10 +
    '    }' + #13#10 +
    '}' + #13#10 + #13#10 +
    
    // Start-WebsiteSafely function using appcmd.exe fallback
    'function Start-WebsiteSafely {' + #13#10 +
    '    param ([string]$SiteName)' + #13#10 +
    '    Write-Log "Starting IIS Website ''$SiteName''..."' + #13#10 +
    '    try {' + #13#10 +
    '        Start-Website -Name $SiteName -ErrorAction Stop' + #13#10 +
    '        Write-Log "Website ''$SiteName'' started successfully using PowerShell cmdlet."' + #13#10 +
    '    } catch {' + #13#10 +
    '        Write-Log "PowerShell cmdlet failed: $($_.Exception.Message). Using appcmd.exe..."' + #13#10 +
    '        $appcmdPath = "$env:SystemRoot\System32\inetsrv\appcmd.exe"' + #13#10 +
    '        if (Test-Path $appcmdPath) {' + #13#10 +
    '            $result = & $appcmdPath start site "$SiteName" 2>&1' + #13#10 +
    '            if ($LASTEXITCODE -eq 0) {' + #13#10 +
    '                Write-Log "Website ''$SiteName'' started successfully using appcmd.exe."' + #13#10 +
    '            } else {' + #13#10 +
    '                Write-Log "Failed to start website using appcmd.exe: $result (Exit code: $LASTEXITCODE)"' + #13#10 +
    '                throw "Failed to start website $SiteName"' + #13#10 +
    '            }' + #13#10 +
    '        } else {' + #13#10 +
    '            Write-Log "ERROR: appcmd.exe not found. Cannot start website."' + #13#10 +
    '            throw "Cannot start website - no available method"' + #13#10 +
    '        }' + #13#10 +
    '    }' + #13#10 +
    '    Write-Log "==================== IIS hosting setup completed successfully! ===================="' + #13#10 +
    '}' + #13#10 + #13#10 +
    
    // Execute functions in sequence (like your PS1 file)
    '    Write-Log "Calling Ensure-IISDependencies..."' + #13#10 +
    '    Ensure-IISDependencies' + #13#10 + #13#10 +
    
    '    Write-Log "Calling Create-AppPool..."' + #13#10 +
    '    Create-AppPool -AppPoolName $AppPoolName' + #13#10 + #13#10 +
    
    '    Write-Log "Calling Stop-DefaultWebsite..."' + #13#10 +
    '    Stop-DefaultWebsite -DefaultSiteName $DefaultSiteName' + #13#10 + #13#10 +
    
    '    Write-Log "Calling Create-Website..."' + #13#10 +
    '    Create-Website -SiteName $SiteName -PhysicalPath $PhysicalPath -Port $Port -AppPoolName $AppPoolName' + #13#10 + #13#10 +
    
    '    Write-Log "Calling Configure-Permissions..."' + #13#10 +
    '    Configure-Permissions -PhysicalPath $PhysicalPath' + #13#10 + #13#10 +
    
    '    Write-Log "Calling Start-WebsiteSafely..."' + #13#10 +
    '    Start-WebsiteSafely -SiteName $SiteName' + #13#10 + #13#10 +
    
    '    Write-Log "IIS setup completed successfully!"' + #13#10 +
    '} catch {' + #13#10 +
    '    Write-Log "Error setting up IIS: $_"' + #13#10 +
    '    Write-Log "Exception details: $($_.Exception.Message)"' + #13#10 +
    '    Write-Log "Stack trace: $($_.ScriptStackTrace)"' + #13#10 +
    '    exit 1' + #13#10 +
    '}';
  
  // Save the script to a file
  if not SaveStringToFile(ScriptFile, IISScript, False) then
  begin
    MsgBox('Failed to create PowerShell script file.', mbError, MB_OK);
    Result := False;
    Exit;
  end;
  
  ProgressPage.SetText('Setting up IIS and Web Application...', 'Configuring web server and application...');
  ProgressPage.SetProgress(85, 100);
  
  // Execute the script file
  if not Exec('powershell.exe', '-ExecutionPolicy Bypass -File "' + ScriptFile + '"', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then
  begin
    MsgBox('IIS setup execution failed.', mbError, MB_OK);
    Result := False;
    Exit;
  end;
  
  // Handle result codes with log file information
  if ResultCode <> 0 then
  begin
    if FileExists(LogFile) then
    begin
      MsgBox('IIS setup failed with exit code: ' + IntToStr(ResultCode) + #13#10 + #13#10 +
             'Check the detailed log file:' + #13#10 +
             LogFile + #13#10 + #13#10 +
             'Script file saved at:' + #13#10 +
             ScriptFile + #13#10 + #13#10 +
             'You can run the script manually as Administrator to see detailed error messages.', mbError, MB_OK);
    end
    else
    begin
      MsgBox('IIS setup failed with exit code: ' + IntToStr(ResultCode) + #13#10 + #13#10 +
             'Script file saved at:' + #13#10 +
             ScriptFile + #13#10 + #13#10 +
             'Run this script manually as Administrator:' + #13#10 +
             'powershell.exe -ExecutionPolicy Bypass -File "' + ScriptFile + '"', mbError, MB_OK);
    end;
    Result := False;
    Exit;
  end;
  
  
  
  ProgressPage.SetText('IIS setup completed successfully', 'Web application is ready');
  ProgressPage.SetProgress(95, 100);
  
  // Show success message with URLs
  MsgBox('IIS setup completed successfully!' + #13#10 +
         'Your web application is available at:' + #13#10 +
         'http://localhost:' + Port + #13#10 + #13#10 +
         'Log file: ' + LogFile + #13#10 +
         'Script file: ' + ScriptFile, mbInformation, MB_OK);
end;

function CopyPublishFiles: Boolean;
var
  InstallerDir, SourceDir, DestDir: String;
  ResultCode: Integer;
  CopyScript, ScriptFile, LogFile: String;
begin
  Result := True;

  InstallerDir := ExtractFilePath(ExpandConstant('{srcexe}'));
  SourceDir := InstallerDir + 'Publish';
  DestDir := ExpandConstant('{app}\Publish');
  LogFile := ExpandConstant('{tmp}\Copy_Files_Log.txt');
  ScriptFile := ExpandConstant('{tmp}\Copy_Files_Script.ps1');

  if not DirExists(SourceDir) then
  begin
    MsgBox('Source Publish folder not found: ' + SourceDir, mbError, MB_OK);
    Result := False;
    Exit;
  end;

  CopyScript :=
    '$ErrorActionPreference = "Stop"' + #13#10 +
    '$LogFile = "' + LogFile + '"' + #13#10 +
    '$SourceDir = "' + SourceDir + '"' + #13#10 +
    '$DestDir = "' + DestDir + '"' + #13#10 +
    'function Write-Log { param([string]$msg) "$((Get-Date) -f ''yyyy-MM-dd HH:mm:ss'') - $msg" | Out-File -FilePath $LogFile -Append -Encoding UTF8 }' + #13#10 +
    'try {' + #13#10 +
    '  Write-Log "Copying from $SourceDir to $DestDir"' + #13#10 +
    '  robocopy "$SourceDir" "$DestDir" /E /R:2 /W:1 /NP /LOG+:$LogFile' + #13#10 +
    '  $code = $LASTEXITCODE' + #13#10 +
    '  if ($code -le 7) { Write-Log "Robocopy succeeded (ExitCode=$code)"; exit 0 }' + #13#10 +
    '  else { Write-Log "Robocopy failed (ExitCode=$code)"; exit $code }' + #13#10 +
    '} catch { Write-Log "Exception: $($_.Exception.Message)"; exit 1 }';

  if not SaveStringToFile(ScriptFile, CopyScript, False) then
  begin
    MsgBox('Failed to create copy script.', mbError, MB_OK);
    Result := False;
    Exit;
  end;

  if not Exec('powershell.exe', '-ExecutionPolicy Bypass -File "' + ScriptFile + '"', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then
  begin
    MsgBox('PowerShell script execution failed.', mbError, MB_OK);
    Result := False;
    Exit;
  end;

  if ResultCode <> 0 then
  begin
    MsgBox('File copy failed (Exit Code: ' + IntToStr(ResultCode) + '). Check log file: ' + LogFile, mbError, MB_OK);
    Result := False;
    Exit;
  end;
end;





function CreateDatabase: Boolean;
var
  ResultCode: Integer;
  DatabaseScript: String;
  ScriptPath: String;
  MongoShellPath: String;
begin
  Result := True;
  if not (MongoDBCheckBox.Checked and MongoToolsCheckBox.Checked) then Exit;
  
  try
    ProgressPage.SetText('Creating MongoDB Database...', 'Setting up database and collections...');
    ProgressPage.SetProgress(98, 100);
    
    ScriptPath := ExpandConstant('{tmp}\create_db.js');
    MongoShellPath := 'C:\Program Files\mongosh\mongosh.exe';
    
    // Check if mongosh exists
    if not FileExists(MongoShellPath) then
    begin
      ProgressPage.SetText('MongoDB Shell not found, skipping database creation...', 'Database can be created manually later.');
      ProgressPage.SetProgress(100, 100);
      Exit;
    end;
    
    DatabaseScript := 
      'print("Starting database creation...");' + #13#10 +
      'const dbName = "visioninsightBIDashboard";' + #13#10 +
      'const collectionName = "Test";' + #13#10 +
      'print(`Switching to database: ${dbName}`);' + #13#10 +
      'use(dbName);' + #13#10 +
      'print(`Creating collection: ${collectionName}`);' + #13#10 +
      'db.createCollection(collectionName);' + #13#10 +
      'print(`Database "${dbName}" and collection "${collectionName}" created successfully.`);';
    
    SaveStringToFile(ScriptPath, DatabaseScript, False);
    
    Sleep(3000); // Wait for MongoDB service to be ready
    
    if not SafeExec(MongoShellPath, 'mongodb://localhost:27017/ --file "' + ScriptPath + '"', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then
    begin
      // Don't fail the installation for database creation issues
      ProgressPage.SetText('Database creation completed with warnings.', 'You may need to create the database manually.');
    end;
    
    // Clean up script file
    if FileExists(ScriptPath) then
      DeleteFile(ScriptPath);
      
    ProgressPage.SetProgress(100, 100);
  except
    
    begin
      ProgressPage.SetText('Database creation completed with warnings.', 'You may need to create the database manually.');
      
    end;
  end;
end;

procedure CurStepChanged(CurStep: TSetupStep);
var
  InstallationSuccessful: Boolean;
begin
  if CurStep = ssPostInstall then
  begin
    // Create progress page
    ProgressPage := CreateOutputProgressPage('Installing Components', 'Please wait while the selected components are being installed...');
    ProgressPage.Show;
    
    try
      InstallationSuccessful := True;
      ProgressPage.SetProgress(0, 100);
      ProgressPage.SetText('Starting installation process...', 'Preparing to install selected components...');
      
      // Run installations in sequence - continue even if some fail
      if not InstallNetHostingBundle then
      begin
        Log('InstallNetHostingBundle failed');
        InstallationSuccessful := False;
      end;
      
       if not InstallDotNetSDK then
      begin
        Log('InstallDotNetSDK failed');
        InstallationSuccessful := False;
      end;
      
      if not InstallMongoDB then
      begin
        Log('InstallMongoDB failed');
        InstallationSuccessful := False;
      end;
      
      if not InstallMongoTools then
      begin
        Log('InstallMongoTools failed');
        InstallationSuccessful := False;
      end;
      
      if not ConfigureMongoDB then
      begin
        Log('ConfigureMongoDB failed');
        // Don't mark as unsuccessful for configuration issues
      end;
      
      if not SetupIIS then
      begin
        Log('SetupIIS failed');
        InstallationSuccessful := False;
      end;
      
      if SetupIIS then
  begin
    // Copy files after IIS is set up
    if not CopyPublishFiles then
    begin
      MsgBox('IIS was set up successfully, but file copying failed. ' +
             'You may need to manually copy files from the installation directory.', 
             mbInformation, MB_OK);
    end;
  end;
      
      if not CreateDatabase then
      begin
        Log('CreateDatabase failed');
        // Don't mark as unsuccessful for database creation issues
      end;
      
      if InstallationSuccessful then
      begin
        ProgressPage.SetText('Installation completed successfully!', 'All selected components have been installed.');
      end
      else
      begin
        ProgressPage.SetText('Installation completed with some issues.', 'Some components may need manual configuration.');
      end;
      
      Sleep(2000);
      
    finally
      ProgressPage.Hide;
    end;
  end;
end;

procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
var
  ResultCode: Integer;
begin
  if CurUninstallStep = usPostUninstall then
  begin
    // Stop and remove MongoDB service
    SafeExec('net', 'stop mongodb', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
    SafeExec('sc', 'delete mongodb', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
    
    // Remove IIS site and app pool
    SafeExec('powershell.exe', '-ExecutionPolicy Bypass -Command "try { Import-Module WebAdministration; Remove-IISSite -Name MyApp -Confirm:$false; Remove-IISAppPool -Name MyAppPool -Confirm:$false } catch { Write-Host ''Cleanup completed'' }"', 
         '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
  end;
end;