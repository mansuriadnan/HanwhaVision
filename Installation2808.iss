[Setup]
AppName=MyApp2808
AppVersion=1.0
DefaultDirName={pf}\MyApp2808
DefaultGroupName=MyApp2808
OutputBaseFilename=MyApp2808
Compression=lzma
SolidCompression=yes

[Files]
Source: "D:\Project\React_API_Package\publish_bala\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "D:\Project\React_API_Package\build\*"; DestDir: "{app}\wwwroot"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
; Create a Start Menu shortcut
Name: "{group}\MyApp2808"; Filename: "{app}\WebAPIMongo.exe"

; Create a Desktop shortcut
Name: "{userdesktop}\MyApp2808"; Filename: "{app}\WebAPIMongo.exe"

[Run]
; Run the .NET Core application
Filename: "{app}\WebAPIMongo.exe"; Description: "Run My .NET Core App"; Flags: nowait postinstall;

; Optionally, run a script to start the React application if it's a separate process
 Filename: "{app}\start-react.bat"; Parameters: ""; Flags: nowait postinstall skipifsilent

