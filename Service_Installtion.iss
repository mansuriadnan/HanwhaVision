[Setup]
AppName=My Application
AppVersion=1.0
DefaultDirName={autopf}\MyApp
OutputDir=OutputSchedulor
OutputBaseFilename=MyAppSetup

[Files]
; Include your PowerShell script in the installer
Source: "testrunningapp.ps1"; DestDir: "{app}"; Flags: ignoreversion

[Code]
procedure CreateScheduledTask();
var
  ResultCode: Integer;
  ScriptPath: string;
  PSScript: TStringList;
  TempScriptPath: string;
begin
  ScriptPath := ExpandConstant('{app}\testrunningapp.ps1');
  TempScriptPath := ExpandConstant('{tmp}\CreateTask.ps1');
  
  // Create a temporary PowerShell script file
  PSScript := TStringList.Create;
  try
    PSScript.Add('$TaskName = "MyPowerShellTask"');
    PSScript.Add('$ScriptPath = "' + ScriptPath + '"');
    PSScript.Add('');
    PSScript.Add('$TaskAction = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$ScriptPath`""');
    PSScript.Add('');
    PSScript.Add('$TaskTrigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 5) -RepetitionDuration (New-TimeSpan -Minutes 15)');
    PSScript.Add('');
    PSScript.Add('$TaskPrincipal = New-ScheduledTaskPrincipal -UserId "NT AUTHORITY\SYSTEM" -RunLevel Highest');
    PSScript.Add('');
    PSScript.Add('Register-ScheduledTask -TaskName $TaskName -Action $TaskAction -Trigger $TaskTrigger -Principal $TaskPrincipal -Force');
    PSScript.Add('');
    PSScript.Add('Start-ScheduledTask -TaskName $TaskName');
    
    PSScript.SaveToFile(TempScriptPath);
  finally
    PSScript.Free;
  end;
  
  // Execute the temporary PowerShell script
  if Exec('powershell.exe', 
    '-NoProfile -ExecutionPolicy Bypass -File "' + TempScriptPath + '"',
    '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then
  begin
    if ResultCode = 0 then
      Log('Scheduled task created and started successfully')
    else
      MsgBox('Failed to create scheduled task. Error code: ' + IntToStr(ResultCode), mbError, MB_OK);
  end
  else
    MsgBox('Failed to execute PowerShell command', mbError, MB_OK);
    
  // Clean up temp file
  DeleteFile(TempScriptPath);
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssPostInstall then
  begin
    CreateScheduledTask();
  end;
end;