[Setup]
AppName=NetCoreReact
AppVersion=1.0
DefaultDirName={pf}\NetCoreReact
DefaultGroupName=NetCoreReact
OutputBaseFilename=NetCoreReact2011
Compression=lzma
SolidCompression=yes

[Files]
Source: "D:\Project\React_API_Package\publish_bala\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "D:\Project\React_API_Package\build\*"; DestDir: "{app}\wwwroot"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "D:\Project\React_API_Package\StartApp.bat"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
; Create a Start Menu shortcut
Name: "{group}\NetCoreReact"; Filename: "{app}\StartApp.bat"; IconFileName: "{app}\wwwroot\favicon.ico"

; Create a Desktop shortcut
Name: "{userdesktop}\NetCoreReact1911"; Filename: "{app}\StartApp.bat"; IconFileName: "{app}\wwwroot\favicon.ico"


[Run]
; Run the .NET Core application
Filename: "{app}\WebAPIMongo.exe"; Description: "Run My .NET Core App"; Flags: nowait postinstall


; Open the React URL in the default browser
;Filename: "{cmd}"; Parameters: "/c start http://localhost:5000"; Description: "Open React App in Browser"; Flags: postinstall shellexec;
