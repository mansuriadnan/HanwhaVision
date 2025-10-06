[Setup]
AppId={{12345678-90ab-cdef-1234-567890abcdef}} ; Replace with a valid GUID
AppName=Combined Installer
AppVersion=1.0
DefaultDirName={pf}\Mongo-Node-NetCore Installer
DefaultGroupName=Mongo-Node-NetCore Installer
OutputBaseFilename=CombinedInstaller
Compression=lzma
SolidCompression=yes
PrivilegesRequired=admin

[Files]
Source: "D:\Project\React_API_Package\Node_NetCore_Mongo_Local.ps1"; DestDir: "{app}"; Flags: ignoreversion
Source: "D:\Project\React_API_Package\publish_bala\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "D:\Project\React_API_Package\build\*"; DestDir: "{app}\wwwroot"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "D:\Project\React_API_Package\StartApp.bat"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{userdesktop}\NetCoreReact2011_New"; Filename: "{app}\StartApp.bat"; IconFileName: "{app}\wwwroot\favicon.ico"

[Code]
function ExecutePowerShellScript(): Boolean;
var
  ResultCode: Integer;
  ScriptPath: String;
begin
  // Log the script path only after app is initialized
  ScriptPath := ExpandConstant('{app}\Node_NetCore_Mongo_Local.ps1');
  Log('Attempting to execute PowerShell script: ' + ScriptPath);
  
  Result := Exec(
    'powershell.exe',
    '-ExecutionPolicy Bypass -WindowStyle Hidden -File "' + ScriptPath + '"',
    '', SW_HIDE, ewWaitUntilTerminated, ResultCode
  );
  
  if Result then
    Log('PowerShell script executed successfully.')
  else begin
    Log('PowerShell script failed with code: ' + IntToStr(ResultCode));
    MsgBox('The PowerShell script failed to execute. Installation will not proceed.', mbError, MB_OK);
  end;
end;

function InitializeSetup(): Boolean;
begin
  // Do not use {app} here; initialization happens later.
  Log('Initializing setup...');
  
  // The script will be executed after app initialization
  Result := True;
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssInstall then begin
    Log('Starting script execution after installation directory is initialized...');
    if not ExecutePowerShellScript() then begin
      Log('PowerShell script execution failed.');
      MsgBox('Installation cannot proceed due to script failure.', mbError, MB_OK);
    end;
  end;
end;

