; Majin, Copyright (c) 2016 Hugo V. Monteiro
; Use of this source code is governed by the GPL-2.0 license that can be
; found in the LICENSE file.
;
; Description: Scripting file used by Inno Setup to generate an installer for Windows Operating System,
;             the installation does not requries any elevated Windows privileges (Administrator or Power User)
;             and will install in user's %APPDATA% .
;
;
#define MyAppName "Majin"
#define MyAppVersion "0.1"
#define MyAppPublisher "Hugo V. Monteiro"
#define MyAppURL "https://root.hugovmonteiro.net/majin"
#define MyAppDevURL "https://github.com/hvmonteiro/majin"
#define MyAppExeName "Majin.exe"
#define WorkspaceDir "D:\Workspace"
#define AppBuildDir "D:\Workspace\Majin-win32-x64"

[Setup]
AppId={{853AD67A-8C9E-40DB-878A-B7F015B329BB}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppVerName={#MyAppName} {#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppDevURL}/issues
AppUpdatesURL={#MyAppDevURL}/releases
DefaultDirName={userappdata}\Majin
UsePreviousAppDir=yes
DisableDirPage=yes
DisableProgramGroupPage=yes
LicenseFile={#AppBuildDir}\LICENSE
OutputDir={#WorkspaceDir}
OutputBaseFilename=majin-0.1-install
SetupIconFile={#AppBuildDir}\majin.ico
Compression=lzma
SolidCompression=yes
PrivilegesRequired=lowest
Uninstallable=yes
UninstallFilesDir={userappdata}\Majin

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Files]
Source: "{#AppBuildDir}\*"; DestDir: "{userappdata}\Majin"; Excludes: "{#AppBuildDir}\*.iss,{#AppBuildDir}\*.~*"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{commonprograms}\{#MyAppName}"; Filename: "{userappdata}\Majin\{#MyAppExeName}"

[Run]
Filename: "{userappdata}\Majin\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent


