[Setup]
AppName=MongoDB .NET Installer
AppVersion=1.0
DefaultDirName={autopf}\MongoDBInstaller
DefaultGroupName=MongoDB Installer
OutputDir=Output
OutputBaseFilename=MongoDBInstallerSetup
PrivilegesRequired=admin
ArchitecturesAllowed=x64
ArchitecturesInstallIn64BitMode=x64
WizardStyle=modern
SetupIconFile=Group_1.ico

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Files]
;Source: "Publish\*"; DestDir: "{app}\Publish"; Flags: recursesubdirs createallsubdirs

[Tasks]
Name: "dotnet"; Description: "Install .NET Hosting Bundle"; GroupDescription: "Select components to install:"
Name: "mongodb"; Description: "Install MongoDB Server"; GroupDescription: "Select components to install:"
Name: "tools"; Description: "Install MongoDB Tools"; GroupDescription: "Select components to install:"

[Icons]
Name: "{userdesktop}\MongoDB Installer"; Filename: "http://localhost:8080"; IconFilename: "{app}\Group_1.ico"; IconIndex: 0

[Code]
procedure RunSelectedInstallations();
var
  ResultCode: Integer;
  InstallerPath, Command: string;
begin
  WizardForm.StatusLabel.Visible := True;
  WizardForm.ProgressGauge.Style := npbstMarquee;
  WizardForm.ProgressGauge.Visible := True;

  InstallerPath := ExpandConstant('{src}');

  // .NET Hosting
  if IsTaskSelected('dotnet') then
  begin
    WizardForm.StatusLabel.Caption := 'Installing .NET Hosting Bundle...';
    Command := 'powershell.exe -ExecutionPolicy Bypass -NoProfile -WindowStyle Hidden -Command "' +
      '$exists = Get-WmiObject -Query \"SELECT * FROM Win32_Product WHERE Name LIKE ''%ASP.NET Core%''\" -ErrorAction SilentlyContinue; ' +
      'if (-not $exists) { Start-Process \'''+ InstallerPath + '\dotnet-hosting.exe\'' -ArgumentList "/install", "/quiet", "/norestart" -Wait }"';
    Exec('', Command, '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
  end;

  // MongoDB Server
  if IsTaskSelected('mongodb') then
  begin
    WizardForm.StatusLabel.Caption := 'Installing MongoDB Server...';
    Command := 'powershell.exe -ExecutionPolicy Bypass -NoProfile -WindowStyle Hidden -Command "' +
      'if (-not (Test-Path \"C:\\Program Files\\MongoDB\\Server\\7.0\\bin\\mongod.exe\")) { ' +
      'Start-Process msiexec.exe -ArgumentList \"/i\", \"'+ InstallerPath + '\\mongo.msi\", \"/qn\", \"/norestart\", \"INSTALLLOCATION=\\\"C:\\Program Files\\MongoDB\\Server\\7.0\\\"\" -Wait }"';
    Exec('', Command, '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
  end;

  // MongoDB Tools
  if IsTaskSelected('tools') then
  begin
    WizardForm.StatusLabel.Caption := 'Installing MongoDB Tools...';
    Command := 'powershell.exe -ExecutionPolicy Bypass -NoProfile -WindowStyle Hidden -Command "' +
      'if (-not (Test-Path \"C:\\Program Files\\mongosh\\mongosh.exe\")) { ' +
      'Start-Process msiexec.exe -ArgumentList \"/i\", \"'+ InstallerPath + '\\mongosh.msi\", \"/qn\", \"/norestart\", \"INSTALLLOCATION=\\\"C:\\Program Files\\mongosh\\\"\" -Wait }"';
    Exec('', Command, '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
  end;

  WizardForm.StatusLabel.Caption := 'All selected components installed.';
  WizardForm.ProgressGauge.Visible := False;
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssPostInstall then
    RunSelectedInstallations;
end;

function InitializeSetup(): Boolean;
var
  ResultCode: Integer;
begin
  Result := True;
  if not Exec('powershell.exe', '-Command "Write-Host PowerShell Available"', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then
  begin
    MsgBox('PowerShell is required to run this installer.', mbError, MB_OK);
    Result := False;
  end;
end;