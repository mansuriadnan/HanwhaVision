; MongoDB .NET Installation Script Installer
; Updated with improved environment handling for .NET SDK detection
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
Source: "script.ps1"; DestDir: "{tmp}"; Flags: deleteafterinstall

[InstallDelete]
Type: files; Name: "{src}\run_installer.bat"

[Icons]
Name: "{userdesktop}\Vision Insight"; Filename: "http://localhost:8080"; IconFilename: "{src}\Group_1.ico"; IconIndex: 0

[Run]
Filename: "{src}\run_installer.bat"; Flags: postinstall shellexec; Description: "Run IIS Setup Script (PowerShell, requires admin)"

[Code]
// Function to find PowerShell executable
function FindPowerShell(): String;
var
  PowerShellPaths: array of String;
  I: Integer;
begin
  Result := '';
  
  // Define possible PowerShell locations
  SetArrayLength(PowerShellPaths, 6);
  PowerShellPaths[0] := ExpandConstant('{sys}\WindowsPowerShell\v1.0\powershell.exe');
  PowerShellPaths[1] := ExpandConstant('{syswow64}\WindowsPowerShell\v1.0\powershell.exe');
  PowerShellPaths[2] := ExpandConstant('{pf}\PowerShell\7\pwsh.exe');
  PowerShellPaths[3] := ExpandConstant('{pf32}\PowerShell\7\pwsh.exe');
  PowerShellPaths[4] := 'powershell.exe'; // Try from PATH
  PowerShellPaths[5] := 'pwsh.exe'; // Try PowerShell Core from PATH
  
  // Check each path
  for I := 0 to GetArrayLength(PowerShellPaths) - 1 do
  begin
    if (I < 4) and FileExists(PowerShellPaths[I]) then
    begin
      Result := PowerShellPaths[I];
      Exit;
    end
    else if (I >= 4) then
    begin
      // For PATH-based checks, we'll test in the batch file
      Result := PowerShellPaths[I];
      Exit;
    end;
  end;
end;

// Function to create batch file next to .exe
procedure CreateElevatedBatchFile;
var
  BatchContent: AnsiString;
  BatchFilePath: String;
  PowerShellPath: String;
begin
  BatchFilePath := ExpandConstant('{src}\run_installer.bat');
  PowerShellPath := FindPowerShell();
  
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
    '   goto :find_powershell' + #13#10 +
    ')' + #13#10 +
    ':find_powershell' + #13#10 +
    'echo Searching for PowerShell...' + #13#10 +
    'set "POWERSHELL_EXE="' + #13#10 +
    'REM Check common PowerShell locations' + #13#10 +
    'if exist "%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" (' + #13#10 +
    '   set "POWERSHELL_EXE=%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe"' + #13#10 +
    '   goto :elevate' + #13#10 +
    ')' + #13#10 +
    'if exist "%SystemRoot%\SysWOW64\WindowsPowerShell\v1.0\powershell.exe" (' + #13#10 +
    '   set "POWERSHELL_EXE=%SystemRoot%\SysWOW64\WindowsPowerShell\v1.0\powershell.exe"' + #13#10 +
    '   goto :elevate' + #13#10 +
    ')' + #13#10 +
    'if exist "%ProgramFiles%\PowerShell\7\pwsh.exe" (' + #13#10 +
    '   set "POWERSHELL_EXE=%ProgramFiles%\PowerShell\7\pwsh.exe"' + #13#10 +
    '   goto :elevate' + #13#10 +
    ')' + #13#10 +
    'REM Try to find PowerShell in PATH' + #13#10 +
    'where powershell.exe >nul 2>&1' + #13#10 +
    'if %errorLevel% == 0 (' + #13#10 +
    '   set "POWERSHELL_EXE=powershell.exe"' + #13#10 +
    '   goto :elevate' + #13#10 +
    ')' + #13#10 +
    'where pwsh.exe >nul 2>&1' + #13#10 +
    'if %errorLevel% == 0 (' + #13#10 +
    '   set "POWERSHELL_EXE=pwsh.exe"' + #13#10 +
    '   goto :elevate' + #13#10 +
    ')' + #13#10 +
    'echo ERROR: PowerShell not found on this system!' + #13#10 +
    'echo Please install Windows PowerShell or PowerShell Core.' + #13#10 +
    'echo You can download PowerShell from: https://github.com/PowerShell/PowerShell/releases' + #13#10 +
    'pause' + #13#10 +
    'exit /b 1' + #13#10 +
    ':elevate' + #13#10 +
    'echo Found PowerShell: %POWERSHELL_EXE%' + #13#10 +
    '"%POWERSHELL_EXE%" -Command "Start-Process ''%~f0'' -Verb RunAs"' + #13#10 +
    'exit /b' + #13#10 +
    ':run_script' + #13#10 +
    'echo Refreshing environment variables...' + #13#10 +
    'call :RefreshEnv' + #13#10 +
    'echo Running PowerShell script from installer folder...' + #13#10 +
    'echo PowerShell script path: "%~dp0script.ps1"' + #13#10 +
    'if exist "%~dp0script.ps1" (' + #13#10 +
    '   echo PowerShell script found, executing...' + #13#10 +
    '   call :find_and_run_powershell' + #13#10 +
    ') else (' + #13#10 +
    '   echo ERROR: PowerShell script not found!' + #13#10 +
    '   echo Looking for: "%~dp0script.ps1"' + #13#10 +
    '   echo Directory contents:' + #13#10 +
    '   dir "%~dp0" /b' + #13#10 +
    '   pause' + #13#10 +
    ')' + #13#10 +
    'echo.' + #13#10 +
    'pause' + #13#10 +  // Add this line
    'echo Cleaning up batch file...' + #13#10 +
    'timeout /t 1 /nobreak >nul' + #13#10 +
    '(goto) 2>nul & del "%~f0"' + #13#10 +
    'goto :eof' + #13#10 +
    ':find_and_run_powershell' + #13#10 +
    'set "POWERSHELL_EXE="' + #13#10 +
    'REM Check common PowerShell locations' + #13#10 +
    'if exist "%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" (' + #13#10 +
    '   set "POWERSHELL_EXE=%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe"' + #13#10 +
    '   goto :execute_script' + #13#10 +
    ')' + #13#10 +
    'if exist "%SystemRoot%\SysWOW64\WindowsPowerShell\v1.0\powershell.exe" (' + #13#10 +
    '   set "POWERSHELL_EXE=%SystemRoot%\SysWOW64\WindowsPowerShell\v1.0\powershell.exe"' + #13#10 +
    '   goto :execute_script' + #13#10 +
    ')' + #13#10 +
    'if exist "%ProgramFiles%\PowerShell\7\pwsh.exe" (' + #13#10 +
    '   set "POWERSHELL_EXE=%ProgramFiles%\PowerShell\7\pwsh.exe"' + #13#10 +
    '   goto :execute_script' + #13#10 +
    ')' + #13#10 +
    'REM Try to find PowerShell in PATH' + #13#10 +
    'where powershell.exe >nul 2>&1' + #13#10 +
    'if %errorLevel% == 0 (' + #13#10 +
    '   set "POWERSHELL_EXE=powershell.exe"' + #13#10 +
    '   goto :execute_script' + #13#10 +
    ')' + #13#10 +
    'where pwsh.exe >nul 2>&1' + #13#10 +
    'if %errorLevel% == 0 (' + #13#10 +
    '   set "POWERSHELL_EXE=pwsh.exe"' + #13#10 +
    '   goto :elevate' + #13#10 +
    ')' + #13#10 +
    'echo ERROR: PowerShell not found on this system!' + #13#10 +
    'echo Please install Windows PowerShell or PowerShell Core.' + #13#10 +
    'echo You can download PowerShell from: https://github.com/PowerShell/PowerShell/releases' + #13#10 +
    'pause' + #13#10 +
    'exit /b 1' + #13#10 +
    ':elevate' + #13#10 +
    'echo Found PowerShell: %POWERSHELL_EXE%' + #13#10 +
    '"%POWERSHELL_EXE%" -Command "Start-Process ''%~f0'' -Verb RunAs"' + #13#10 +
    'exit /b' + #13#10 +
    ':run_script' + #13#10 +
    'echo Refreshing environment variables...' + #13#10 +
    'call :RefreshEnv' + #13#10 +
    'echo Running PowerShell script from installer folder...' + #13#10 +
    'echo PowerShell script path: "%~dp0script.ps1"' + #13#10 +
    'if exist "%~dp0script.ps1" (' + #13#10 +
    '   echo PowerShell script found, executing...' + #13#10 +
    '   call :find_and_run_powershell' + #13#10 +
    ') else (' + #13#10 +
    '   echo ERROR: PowerShell script not found!' + #13#10 +
    '   echo Looking for: "%~dp0script.ps1"' + #13#10 +
    '   echo Directory contents:' + #13#10 +
    '   dir "%~dp0" /b' + #13#10 +
    '   pause' + #13#10 +
    ')' + #13#10 +
    'echo.' + #13#10 +
    'pause' + #13#10 + // Add this line
    'echo Cleaning up batch file...' + #13#10 +
    'timeout /t 1 /nobreak >nul' + #13#10 +
    '(goto) 2>nul & del "%~f0"' + #13#10 +
    'goto :eof' + #13#10 +
    ':find_and_run_powershell' + #13#10 +
    'set "POWERSHELL_EXE="' + #13#10 +
    'REM Check common PowerShell locations' + #13#10 +
    'if exist "%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" (' + #13#10 +
    '   set "POWERSHELL_EXE=%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe"' + #13#10 +
    '   goto :execute_script' + #13#10 +
    ')' + #13#10 +
    'if exist "%SystemRoot%\SysWOW64\WindowsPowerShell\v1.0\powershell.exe" (' + #13#10 +
    '   set "POWERSHELL_EXE=%SystemRoot%\SysWOW64\WindowsPowerShell\v1.0\powershell.exe"' + #13#10 +
    '   goto :execute_script' + #13#10 +
    ')' + #13#10 +
    'if exist "%ProgramFiles%\PowerShell\7\pwsh.exe" (' + #13#10 +
    '   set "POWERSHELL_EXE=%ProgramFiles%\PowerShell\7\pwsh.exe"' + #13#10 +
    '   goto :execute_script' + #13#10 +
    ')' + #13#10 +
    'REM Try to find PowerShell in PATH' + #13#10 +
    'where powershell.exe >nul 2>&1' + #13#10 +
    'if %errorLevel% == 0 (' + #13#10 +
    '   set "POWERSHELL_EXE=powershell.exe"' + #13#10 +
    '   goto :execute_script' + #13#10 +
    ')' + #13#10 +
    'where pwsh.exe >nul 2>&1' + #13#10 +
    'if %errorLevel% == 0 (' + #13#10 +
    '   set "POWERSHELL_EXE=pwsh.exe"' + #13#10 +
    '   goto :execute_script' + #13#10 +
    ')' + #13#10 +
    'echo ERROR: PowerShell not found!' + #13#10 +
    'pause' + #13#10 +
    'goto :eof' + #13#10 +
    ':execute_script' + #13#10 +
    'echo Using PowerShell: %POWERSHELL_EXE%' + #13#10 +
    '"%POWERSHELL_EXE%" -ExecutionPolicy Bypass -NoProfile -Command "[Environment]::SetEnvironmentVariable(''SEE_MASK_NOZONECHECKS'', ''1'', ''Process''); $env:PATH = [System.Environment]::GetEnvironmentVariable(''PATH'', ''Machine'') + '';'' + [System.Environment]::GetEnvironmentVariable(''PATH'', ''User''); & ''%~dp0script.ps1''; Write-Host ''''; Write-Host ''Script execution completed.''; Write-Host ''Press any key to continue...''; $null = $Host.UI.RawUI.ReadKey(''NoEcho,IncludeKeyDown'')"' + #13#10 +
    'pause' + #13#10 +
    'goto :eof' + #13#10 +
    ':RefreshEnv' + #13#10 +
    'echo Refreshing PATH from registry...' + #13#10 +
    'for /f "skip=2 tokens=3*" %%a in (''reg query HKLM\SYSTEM\CurrentControlSet\Control\Session" Manager\Environment" /v PATH'') do set "SysPath=%%b"' + #13#10 +
    'for /f "skip=2 tokens=3*" %%a in (''reg query HKCU\Environment /v PATH 2^>nul'') do set "UserPath=%%b"' + #13#10 +
    'if defined UserPath (set "PATH=%SysPath%;%UserPath%") else (set "PATH=%SysPath%")' + #13#10 +
    'goto :eof';
  SaveStringToFile(BatchFilePath, BatchContent, False);
end;

function InitializeSetup: Boolean;
var
  ResultCode: Integer;
  PowerShellPath: String;
begin
  Result := True;
  PowerShellPath := FindPowerShell();
  
  if PowerShellPath = '' then
  begin
    MsgBox('PowerShell was not found on this system.' + #13#10 + 
           'Please install Windows PowerShell or PowerShell Core before running this installer.' + #13#10 +
           'You can download PowerShell from: https://github.com/PowerShell/PowerShell/releases', 
           mbError, MB_OK);
    Result := False;
    Exit;
  end;
  
  // Test PowerShell execution (only for file-based paths)
  if (Pos('powershell.exe', PowerShellPath) > 0) and (Pos('\', PowerShellPath) > 0) then
  begin
    if not Exec(PowerShellPath, '-Command "Write-Host PowerShell OK"', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) or (ResultCode <> 0) then
    begin
      MsgBox('PowerShell is available but cannot execute properly.' + #13#10 +
             'This may be due to execution policy restrictions.', mbError, MB_OK);
      Result := False;
    end;
  end;
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssPostInstall then
  begin
    CreateElevatedBatchFile;
  end;
end;