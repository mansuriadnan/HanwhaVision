[Setup]
AppName=MongoReactApp
AppVersion=1.0
DefaultDirName={pf}\MongoReactApp
OutputDir=.
OutputBaseFilename=AdnanInstaller

[Files]
Source: "D:\Project\React_API_Package\publish_bala\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "D:\Project\React_API_Package\build\*"; DestDir: "{app}\build"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "D:\Project\React_API_Package\start.bat"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\MongoReactApp"; Filename: "{app}\start.bat"
