; Copyright (c) 2016 Hugo V. Monteiro
; Use of this source code is governed by the GPL-2.0 license that can be
; found in the LICENSE file.
;
#define MyAppName "Majin"
#define MyAppVersion "0.1"
#define MyAppPublisher "Hugo V. Monteiro"
#define MyAppURL "https://root.hugovmonteiro.net/majin"
#define MyAppExeName "Majin.exe"

[Setup]
; NOTE: The value of AppId uniquely identifies this application.
; Do not use the same AppId value in installers for other applications.
; (To generate a new GUID, click Tools | Generate GUID inside the IDE.)
AppId={{853AD67A-8C9E-40DB-878A-B7F015B329BB}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppVerName={#MyAppName} {#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={#MyAppName}
DisableDirPage=yes
DisableProgramGroupPage=yes
LicenseFile=D:\Workspace\Inno Setup\Majin-win32-x64\resources\app\LICENSE
OutputDir=D:\Workspace\Inno Setup\Majin Setup\Output
OutputBaseFilename=majin-0.1-install
SetupIconFile=D:\Workspace\Inno Setup\Majin-win32-x64\resources\app\images\icon.ico
Compression=lzma
SolidCompression=yes
PrivilegesRequired=lowest
Uninstallable=yes

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Files]
Source: "D:\Workspace\Inno Setup\Majin-win32-x64\*"; DestDir: "{userappdata}\Majin"; Flags: ignoreversion recursesubdirs createallsubdirs
; NOTE: Don't use "Flags: ignoreversion" on any shared system files

[Icons]
Name: "{commonprograms}\{#MyAppName}"; Filename: "{userappdata}\Majin\{#MyAppExeName}"

[Run]
Filename: "{userappdata}\Majin\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent

