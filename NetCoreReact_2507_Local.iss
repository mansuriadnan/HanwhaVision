; MongoDB .NET Installation Script Installer
; Updated to run .ps1 from installer .exe directory
[Setup]
AppName=Vision Insight Installer
AppVersion=1.0
DefaultDirName={autopf}\Vision Insight Installer
DefaultGroupName=Vision Insight Installer
OutputDir=Output
OutputBaseFilename=Vision Insight Installer
PrivilegesRequired=admin
ArchitecturesAllowed=x64
PrivilegesRequiredOverridesAllowed=dialog
SetupIconFile=Group_1.ico

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Files]
; We do not copy the PowerShell file; it stays next to the installer .exe
; This line is optional since we won't embed it:
 Source: "Vision_Insight_Installer_Script.ps1"; DestDir: "{tmp}"; Flags: deleteafterinstall

[InstallDelete]
Type: files; Name: "{src}\run_installer.bat"

[Icons]
; Shortcut to launch your website in the default browser
Name: "{userdesktop}\Vision Insight"; Filename: "http://localhost:8080"; IconFilename: "{src}\Group_1.ico"; IconIndex: 0

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
    'echo Current directory: %CD%' + #13#10 +
    'echo Batch file location: %~dp0' + #13#10 +
    'echo.' + #13#10 +
    'REM Check admin privileges' + #13#10 +
    'net session >nul 2>&1' + #13#10 +
    'if %errorLevel% == 0 (' + #13#10 +
    '   echo Administrator privileges confirmed.' + #13#10 +
    '   goto :run_script' + #13#10 +
    ') else (' + #13#10 +
    '   echo Requesting administrator privileges...' + #13#10 +
    '   powershell -Command "Start-Process ''%~f0'' -Verb RunAs"' + #13#10 +
    '   exit /b' + #13#10 +
    ')' + #13#10 +
    ':run_script' + #13#10 +
    'echo Running PowerShell script from installer folder...' + #13#10 +
    'echo PowerShell script path: "%~dp0Vision_Insight_Installer_Script.ps1"' + #13#10 +
    'if exist "%~dp0Vision_Insight_Installer_Script.ps1" (' + #13#10 +
    '   echo PowerShell script found, executing...' + #13#10 +
    '   powershell.exe -ExecutionPolicy Bypass -Command "& ''%~dp0Vision_Insight_Installer_Script.ps1''; Write-Host ''''; Write-Host ''Script execution completed.''; Write-Host ''Press any key to continue...''; $null = $Host.UI.RawUI.ReadKey(''NoEcho,IncludeKeyDown'')"' + #13#10 +
    ') else (' + #13#10 +
    '   echo ERROR: PowerShell script not found!' + #13#10 +
    '   echo Looking for: "%~dp0Vision_Insight_Installer_Script.ps1"' + #13#10 +
    '   echo Directory contents:' + #13#10 +
    '   dir "%~dp0" /b' + #13#10 +
    '   pause' + #13#10 +
    ')' + #13#10 +
    'echo.' + #13#10 +
    'echo Cleaning up batch file...' + #13#10 +
    'timeout /t 1 /nobreak >nul' + #13#10 +
    '(goto) 2>nul & del "%~f0"';
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
