; MongoDB .NET Installation Script Installer
; Created with Inno Setup

[Setup]
; Basic Information
AppName=MongoDB .NET Installation Without_Host Tool
AppVersion=1.0
AppPublisher=MongoDB NET Without_Host Installer
AppPublisherURL=https://yourwebsite.com
AppSupportURL=https://yourwebsite.com/support
AppUpdatesURL=https://yourwebsite.com/updates
DefaultDirName={autopf}\MongoDB .NET Installer
DefaultGroupName=MongoDB .NET Installer
AllowNoIcons=yes
LicenseFile=
InfoBeforeFile=
InfoAfterFile=
OutputDir=Output
OutputBaseFilename=MongoDB_NET_Installer_Setup_0406_Without_Host
SetupIconFile=
Compression=lzma
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=admin
ArchitecturesAllowed=x64

; Visual Customization
WizardImageFile=
WizardSmallImageFile=
DisableWelcomePage=no
DisableDirPage=no
DisableProgramGroupPage=yes
DisableReadyPage=no
DisableFinishedPage=no

; Ensure elevated privileges for IIS management
PrivilegesRequiredOverridesAllowed=dialog

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Files]
; Include your PowerShell script from full path
Source: "D:\Project\React_API_Package\mongoDB_net_install_live_3001.ps1"; DestDir: "{app}"; Flags: ignoreversion
; Include any additional files if needed
; Source: "D:\Project\React_API_Package\README.txt"; DestDir: "{app}"; Flags: ignoreversion
; Source: "D:\Project\React_API_Package\config.json"; DestDir: "{app}"; Flags: ignoreversion

[InstallDelete]
; Clean up any old batch files
Type: files; Name: "{app}\run_installer.bat"

[Code]
// Create a batch file that ensures proper elevation
procedure CreateElevatedBatchFile;
var
  BatchContent: AnsiString;
  BatchFilePath: String;
begin
  BatchFilePath := ExpandConstant('{app}\run_installer.bat');
  
  BatchContent := '@echo off' + #13#10 +
                  'title MongoDB .NET Installation Script' + #13#10 +
                  'echo ======================================' + #13#10 +
                  'echo MongoDB .NET Installation Script' + #13#10 +
                  'echo ======================================' + #13#10 +
                  'echo.' + #13#10 + #13#10 +
                  'REM Check for administrator privileges' + #13#10 +
                  'net session >nul 2>&1' + #13#10 +
                  'if %errorLevel% == 0 (' + #13#10 +
                  '    echo Administrator privileges confirmed.' + #13#10 +
                  '    goto :run_script' + #13#10 +
                  ') else (' + #13#10 +
                  '    echo Requesting administrator privileges...' + #13#10 +
                  '    powershell -Command "Start-Process ''%~f0'' -Verb RunAs"' + #13#10 +
                  '    exit /b' + #13#10 +
                  ')' + #13#10 + #13#10 +
                  ':run_script' + #13#10 +
                  'echo.' + #13#10 +
                  'echo Starting PowerShell installation script...' + #13#10 +
                  'echo.' + #13#10 + #13#10 +
                  'REM Run the PowerShell script with proper parameters' + #13#10 +
                  '%SystemRoot%\SysNative\WindowsPowerShell\v1.0\powershell.exe -ExecutionPolicy Bypass -NoExit -File "' + ExpandConstant('{app}') + '\mongoDB_net_install_live_3001.ps1"' + #13#10 + #13#10 +
                  'echo.' + #13#10 +
                  'echo Installation process completed.' + #13#10 +
                  'pause';
  
  SaveStringToFile(BatchFilePath, BatchContent, False);
end;

[Icons]
; Create shortcuts using the batch file for proper elevation
Name: "{group}\Run MongoDB .NET Installer"; Filename: "{app}\run_installer.bat"; WorkingDir: "{app}"; IconFilename: "cmd.exe"; Comment: "MongoDB .NET Installation Script (Auto-elevates to Administrator)"
Name: "{group}\Uninstall MongoDB .NET Installer"; Filename: "{uninstallexe}"

[Run]
; Option to run the script immediately after installation using batch file
Filename: "{app}\run_installer.bat"; Flags: postinstall shellexec; Description: "Run MongoDB .NET Installation Script now (will request Administrator privileges)"

[Code]
// Custom Pascal script code for advanced functionality

// Function to check if PowerShell is available
function IsPowerShellInstalled: Boolean;
var
  ResultCode: Integer;
begin
  Result := Exec('powershell.exe', '-Command "Write-Host ''PowerShell Available''"', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) and (ResultCode = 0);
end;

// Function to check if running as administrator
function IsAdminLoggedOn: Boolean;
begin
  Result := IsAdminInstallMode;
end;

// Initialize setup - check prerequisites
function InitializeSetup: Boolean;
begin
  Result := True;
  
  // Check if PowerShell is installed
  if not IsPowerShellInstalled then
  begin
    MsgBox('PowerShell is required but not found on this system. Please install PowerShell and try again.', mbError, MB_OK);
    Result := False;
    Exit;
  end;
  
  // Check if running as administrator
  if not IsAdminLoggedOn then
  begin
    MsgBox('This installer requires administrator privileges. Please run the installer as administrator.', mbError, MB_OK);
    Result := False;
    Exit;
  end;
end;

// Custom page for installation options (optional)
var
  InstallOptionsPage: TInputOptionWizardPage;

procedure InitializeWizard;
begin
  // Create custom options page
  InstallOptionsPage := CreateInputOptionPage(wpSelectDir,
    'Installation Options', 'Choose your installation preferences',
    'Please select the options you want to use during installation.',
    True, False);
  
  InstallOptionsPage.Add('Install dependencies automatically');
  InstallOptionsPage.Add('Create desktop shortcut');
  InstallOptionsPage.Add('Run installation script after setup');
  
  // Set default selections
  InstallOptionsPage.Values[0] := True;
  InstallOptionsPage.Values[1] := False;
  InstallOptionsPage.Values[2] := True;
end;

// Handle the installation process
procedure CurStepChanged(CurStep: TSetupStep);
var
  ResultCode: Integer;
begin
  if CurStep = ssPostInstall then
  begin
    // Create the elevated batch file
    CreateElevatedBatchFile;
    
    // Create desktop shortcut if requested
    if InstallOptionsPage.Values[1] then
    begin
      CreateShellLink(
        ExpandConstant('{userdesktop}\MongoDB .NET Installer.lnk'),
        'MongoDB .NET Installation Tool',
        ExpandConstant('{app}\run_installer.bat'),
        '',
        ExpandConstant('{app}'),
        '',
        0,
        SW_SHOWNORMAL
      );
    end;
  end;
end;

// Uninstall event
procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
begin
  if CurUninstallStep = usPostUninstall then
  begin
    // Clean up desktop shortcut
    if FileExists(ExpandConstant('{userdesktop}\MongoDB .NET Installer.lnk')) then
      DeleteFile(ExpandConstant('{userdesktop}\MongoDB .NET Installer.lnk'));
    
    // Ask if user wants to remove created files/folders
    if MsgBox('Do you want to remove all files created by the MongoDB .NET installation script?', mbConfirmation, MB_YESNO) = IDYES then
    begin
      // Add cleanup logic here if needed
      MsgBox('Please manually remove any files created by the installation script if necessary.', mbInformation, MB_OK);
    end;
  end;
end;