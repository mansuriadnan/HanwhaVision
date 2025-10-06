; MongoDB .NET Installation Script Installer
; Updated to run .ps1 from installer .exe directory

[Setup]
AppName=MongoDB .NET Installation Tool Path
AppVersion=1.0
DefaultDirName={autopf}\MongoDB .NET Installer
DefaultGroupName=MongoDB .NET Installer Path
OutputDir=Output
OutputBaseFilename=MongoDB_NET_Installer_Setup_Path
PrivilegesRequired=admin
ArchitecturesAllowed=x64
PrivilegesRequiredOverridesAllowed=dialog

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Files]
; We do not copy the PowerShell file; it stays next to the installer .exe
; This line is optional since we won't embed it:
 Source: "mongoDB_net_install_live_3001.ps1"; Flags: dontcopy

[InstallDelete]
Type: files; Name: "{src}\run_installer.bat"

[Icons]
Name: "{group}\Run MongoDB .NET Installer"; Filename: "{src}\run_installer.bat"; WorkingDir: "{src}"; IconFilename: "cmd.exe"; Comment: "Run IIS setup (as admin)"
Name: "{group}\Uninstall MongoDB .NET Installer"; Filename: "{uninstallexe}"

[Run]
Filename: "{src}\run_installer.bat"; Flags: postinstall shellexec; Description: "Run IIS Setup Script (PowerShell, requires admin)"

[Code]
// Function to create batch file next to .exe
procedure CreateElevatedBatchFile;
var
  BatchContent: AnsiString;
  BatchFilePath: String;
begin
  BatchFilePath := ExpandConstant('{src}\run_installer.bat');

  BatchContent :=
    '@echo off' + #13#10 +
    'title MongoDB .NET Installation Script' + #13#10 +
    'echo ======================================' + #13#10 +
    'echo MongoDB .NET Installation Script' + #13#10 +
    'echo ======================================' + #13#10 +
    'echo.' + #13#10 +
    'REM Check admin privileges' + #13#10 +
    'net session >nul 2>&1' + #13#10 +
    'if %errorLevel% == 0 (' + #13#10 +
    '    echo Administrator privileges confirmed.' + #13#10 +
    '    goto :run_script' + #13#10 +
    ') else (' + #13#10 +
    '    echo Requesting administrator privileges...' + #13#10 +
    '    powershell -Command "Start-Process ''%~f0'' -Verb RunAs"' + #13#10 +
    '    exit /b' + #13#10 +
    ')' + #13#10 +
    ':run_script' + #13#10 +
    'echo Running PowerShell script from installer folder...' + #13#10 +
    '%SystemRoot%\SysNative\WindowsPowerShell\v1.0\powershell.exe -ExecutionPolicy Bypass -NoExit -File "%~dp0mongoDB_net_install_live_3001.ps1"' + #13#10 +
    'echo.' + #13#10 +
    'echo Script completed.' + #13#10 +
    'pause';

  SaveStringToFile(BatchFilePath, BatchContent, False);
end;

function InitializeSetup: Boolean;
var
  ResultCode: Integer;
begin
  Result := True;

  if not Exec('powershell.exe', '-Command "Write-Host PowerShell OK"', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) or (ResultCode <> 0) then
  begin
    MsgBox('PowerShell is required but not available on this system.', mbError, MB_OK);
    Result := False;
  end;
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssPostInstall then
  begin
    CreateElevatedBatchFile;
  end;
end;
