# Define task details
$TaskName   = "MyPowerShellTask"
$ScriptPath = "D:\All_Script_File\testrunningapp.ps1"

# Define the action (what to run)
$TaskAction = New-ScheduledTaskAction -Execute "powershell.exe" `
    -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$ScriptPath`""

# Define the trigger – start now, repeat every 5 minutes, for 1 day (auto-renews daily)
$TaskTrigger = New-ScheduledTaskTrigger -Once -At (Get-Date) `
    -RepetitionInterval (New-TimeSpan -Minutes 5) `
    -RepetitionDuration (New-TimeSpan -Minutes 15)

# Run as SYSTEM with highest privileges
$TaskPrincipal = New-ScheduledTaskPrincipal -UserId "NT AUTHORITY\SYSTEM" -RunLevel Highest

# Register the task
Register-ScheduledTask -TaskName $TaskName -Action $TaskAction -Trigger $TaskTrigger -Principal $TaskPrincipal -Force

# 👉 Start it immediately after creation
Start-ScheduledTask -TaskName $TaskName
