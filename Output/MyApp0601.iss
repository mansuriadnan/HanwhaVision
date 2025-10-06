[Setup]
AppName=MyApp0601
AppVersion=1.0
DefaultDirName={pf}\MyApp0601
DefaultGroupName=MyApp0601
OutputBaseFilename=MyApp0601
Compression=lzma
SolidCompression=yes

[Files]
Source: "D:\Project\React_API_Package\publish_bala\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "D:\Project\React_API_Package\build\*"; DestDir: "{app}\wwwroot"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
; Create a Start Menu shortcut
Name: "{group}\MyApp0601"; Filename: "{app}\WebAPIMongo.exe"

; Create a Desktop shortcut
Name: "{userdesktop}\MyApp0601"; Filename: "{app}\WebAPIMongo.exe"

[Run]
; Run the .NET Core application
Filename: "{app}\WebAPIMongo.exe"; Description: "Run My .NET Core App"; Flags: nowait postinstall;



; Optionally, run a script to start the React application if it's a separate process
 ;Filename: "{app}\start-react.bat"; Parameters: ""; Flags: nowait postinstall skipifsilent

