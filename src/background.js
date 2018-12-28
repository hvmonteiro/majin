'use strict'; // jshint ignore:line

// jshint esversion: 6
/* globals require: true, __dirname: true, process: true, console: true */

// Copyright (c) 2018 Hugo V. Monteiro
// Use of this source code is governed by the GPL-2.0 license that can be
// found in the LICENSE file.

// This is main process, started as first thing when window starts. 
// It runs through entire life of the application process.

const electron = require('electron');
import jetpack from "fs-jetpack";
import path from "path";
import url from "url";
import { app, Menu, dialog, Tray, BrowserWindow, nativeImage } from "electron";
import { devMenuTemplate } from "./menu/dev_menu_template";
import { editMenuTemplate } from "./menu/edit_menu_template";
//import createWindow from "./helpers/window";

// Special module holding environment variables which you declared
// in config/env_xxx.json file.
import env from "env";


// Save userData in separate folders for each environment.
// Thanks to this you can use production and development versions of the app
// on same machine like those are two separate apps.
if (env.name !== "production") {
    const userDataPath = app.getPath("userData");
    app.setPath("userData", `${userDataPath} (${env.name})`);
}

const browserOptions = {
    'extraHeaders': 'pragma: no-cache\n',
    // could also be used using webContents.setUserAgent(userAgent)
    'userAgent': 'Mozilla/5.0 (Linux; Android 7.0; SM-G892A Build/NRD90M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/60.0.3112.107 Mobile Safari/537.36'
};

const appDir = jetpack.cwd(app.getAppPath());
const manifest = appDir.read("package.json", "json");

const appName = manifest.productName;
const appVersion = manifest.version;
const appBuildID = manifest.appId;
const appCopyright = manifest.copyright;
const appLicense = manifest.license;
const appWebURL = manifest.url;
const appSupportURL = manifest.bugs.url;

// Solving a bug where in windows, files inside a asar packages,
// cannot be directly opened because of incorrect handling of '/' instead of '\'.
var homePageURL = url.format({
  pathname: path.join(__dirname, "app.html"),
  protocol: "file:",
  slashes: true
  });

if (env.name === "production") {
   homePageURL = 'https://www.google.com/';
}

var mainWindow = null;
var trayIcon = null;
var appMenu = null;
var contextMenu = null;

var menuName = '';
if (process.platform === 'darwin') {
  menuName = require('electron').remote.app.getName();
} else {
  menuName = 'Menu';
}

var mainMenu = [{
  label: menuName,
  submenu: [{
    label: 'On Top',
    accelerator: 'CmdOrCtrl+T',
    type: 'checkbox',
    checked: true,
    click: (item) => {
      mainWindow.setAlwaysOnTop(item.checked);
      contextMenu.items[1].checked = item.checked;
      trayIcon.setContextMenu(contextMenu);
    }
  }, {
    type: 'separator'
  }, {
    label: 'Minimize to Tray ',
    accelerator: 'CmdOrCtrl+Z',
    type: 'checkbox',
    checked: true
  }, {
    label: 'Close to Tray ',
    type: 'checkbox',
    checked: true
  }, {
    type: 'separator'
  }, {
    label: 'Auto-Hide Menu Bar',
    type: 'checkbox',
    checked: false,
    click: (item) => {
      mainWindow.setAutoHideMenuBar(item.checked);
      mainWindow.setMenuBarVisibility(!item.checked);
      contextMenu.items[3].checked = item.checked;
      trayIcon.setContextMenu(contextMenu);
    }
  }, {
    type: 'separator'
  }, {
    label: 'Quit',
    accelerator: 'CmdOrCtrl+Q',
    click: (item) => {
      if (mainWindow) {
        mainWindow._events.close = null; // Unreference function show that App can close
        app.quit();
      }
    }
  }
]}, {
  label: 'Navigation',
  submenu: [{
    label: 'Home',
    accelerator: 'CmdOrCtrl+H',
    click: (item) => {
      mainWindow.loadURL(homePageURL, browserOptions);
    }
  }, {
    type: 'separator'
/*
  }, {
    label: 'Open',
    accelerator: 'CmdOrCtrl+O',
    click: function (item) {
      mainWindow.loadURL(homePageURL, browserOptions);
    }
  }, {
    type: 'separator'
*/
  }, {
    label: 'Back',
    enabled: false,
    accelerator: 'Alt+Left',
    click: (item) => {
      if (mainWindow) mainWindow.webContents.goBack();
    }
  }, {
    label: 'Reload',
    accelerator: 'F5',
    click: (item) => {
      if (mainWindow) mainWindow.reload();
    }
  }, {
    label: 'Forward',
    enabled: false,
    accelerator: 'Alt+Right',
    click: (item) => {
      if (mainWindow) mainWindow.webContents.goForward();
    }
  }, {
    type: 'separator'
  }, {
    label: 'Clear All Web Cache',
    click: (item) => {
      mainWindow.webContents.session.clearStorageData(['storages: localstorage'], function() {});
    }
  } 
]}, {
  label: 'About',
  submenu: [{
    label: 'Learn More',
    click: () => {
      electron.shell.openExternal(appWebURL);
    }
  }, {
    label: 'Support',
    click: () => {
      electron.shell.openExternal(appSupportURL);
    }
  }, {
    type: 'separator'
  }, {
    label: 'About',
    click: (item) => {
      let onTopOption = mainWindow.isAlwaysOnTop();
      mainWindow.setAlwaysOnTop(false);
      dialog.showMessageBox({
        'type': 'info',
        'title': 'About',
        buttons: ['Close'],
        'message': appName + ' ' + appVersion + '\n' + 'Copyright ' + appCopyright + '\n' + appLicense
      });
      mainWindow.setAlwaysOnTop(onTopOption);
    }
  }]
}];

var syscontextMenu = [{
  label: 'Show Window',
  type: 'checkbox',
  checked: true,
  click: (item ) => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    mainWindow.isVisible() ? trayIcon.setHighlightMode('always') : trayIcon.setHighlightMode('never');
    item.checked = mainWindow.isVisible();
  }
}, {
  label: 'On Top',
  type: 'checkbox',
  checked: true,
  click: (item) => {
    mainWindow.setAlwaysOnTop(item.checked);
    appMenu.items[0].submenu.items[0].checked = item.checked;
  }
}, {
  type: 'separator'
}, {
  label: 'Auto-Hide Menu Bar',
  type: 'checkbox',
  checked: false,
  click: (item) => {
    mainWindow.setAutoHideMenuBar(item.checked);
    mainWindow.setMenuBarVisibility(!item.checked);
    appMenu.items[0].submenu.items[5].checked = item.checked;
  }
}, {
  label: 'Quit',
  accelerator: 'CmdOrCtrl+Q',
  click: (item) => {
    if (mainWindow) {
      mainWindow._events.close = null; // Unreference function show that App can close
      app.quit();
    }
  }
}];

const setApplicationMenu = () => {
  appMenu = Menu.buildFromTemplate(mainMenu);
  contextMenu = Menu.buildFromTemplate(syscontextMenu);
  Menu.setApplicationMenu(appMenu);
};

app.setName(appName);

function createWindow() {

  setApplicationMenu(appMenu);

  // Create the browser window.
//  const mainWindow = createWindow('main', {
  mainWindow = new BrowserWindow({
    title: appName,
    width: 400,
    height: 400,
    minWidth: 400,
    minHeight: 250,
    // maxWidth: 400,
    // maxHeight: 400,
    autoHideMenuBar: false,
    maximizable: false,
    skipTaskbar: false,
    resizable: true,
    // closable: false,
    show: false,
    icon: nativeImage.createFromPath(path.join(__dirname, 'assets/icons/png/32x32.png')),
    webPreferences: { backgroundThrottling: true }
  });

  trayIcon = new Tray(nativeImage.createFromPath(path.join(__dirname, 'assets/icons/png/32x32.png')));

  trayIcon.setToolTip(appName + ' - Mobile Browser for the Desktop');
  trayIcon.setContextMenu(contextMenu);
  trayIcon.setHighlightMode('always');

  trayIcon.on('click', function () {
    if (mainWindow === null) {
      mainWindow.createWindow();
    }
  });

  trayIcon.on('double-click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    contextMenu.items[0].checked = mainWindow.isVisible(); // contextMenu Item 'Show Window'
    trayIcon.setContextMenu(contextMenu); // re-set contextMenu to reflect changes made above
  });

  mainWindow.loadURL(homePageURL, browserOptions);

  mainWindow.on('show', () => {
    mainWindow.setAlwaysOnTop(contextMenu.items[1].checked); // contextMenu Item 'On Top'
    appMenu.items[0].submenu.items[0].checked = contextMenu.items[1].checked;
    mainWindow.on('close', onBeforeUnload);
  });

  mainWindow.on('page-title-updated', function (e) {
    e.preventDefault();
    mainWindow.setTitle(appName + ' - ' + mainWindow.webContents.getTitle());
    trayIcon.setToolTip(appName + ' - ' + mainWindow.webContents.getTitle());
    trayIcon.setContextMenu(contextMenu);
  });

/*
  mainWindow.webContents.on('did-finish-load', function (e) {
    mainWindow.setTitle(appName + ' - ' +  mainWindow.webContents.getTitle());
  });
*/

  mainWindow.on('minimize', function () {
  if (appMenu.items[0].submenu.items[2].checked) { // appMenu Item 'Minimize To Tray'
    contextMenu.items[0].checked = false; // contextMenu Item 'Show Window'
    trayIcon.setContextMenu(contextMenu); // re-set contextMenu to reflect changes made above
      mainWindow.hide();
    }
  });

  function onBeforeUnload (e) { // Working: but window is still always closed

    if (appMenu.items[0].submenu.items[3].checked) { // appMenu Item 'Close To Tray'
      e.preventDefault();
      contextMenu.items[0].checked = false;
      trayIcon.setContextMenu(contextMenu);
      mainWindow.hide();
      e.returnValue = false;

    } else {
      // If OnTop is set, temporarely unset its state so that the window doesn't hide the dialog
      // and save existing OnTop state to re-set it later on
      let onTopState = appMenu.items[0].submenu.items[0].checked;
      if (mainWindow) {
        mainWindow.setAlwaysOnTop(false);

        mainWindow.blur(); // Hide window temporarely so that doesn't overlaps dialog window

        let dialogChoice = dialog.showMessageBox({
          type: 'question',
          title: 'Confirm',
          message: 'Are you sure you want to quit?',
          buttons: ['Yes', 'No']
        });
        mainWindow.show(); // show blured window again

        if (dialogChoice === 0) {   // Option: Yes
          mainWindow._events.close = null; // Unreference function so that App can close
          mainWindow.on('close', function () { app.quit(); }); // Re-set 'close' event so that App can close
          e.returnValue = false;
          mainWindow.close();
          return 0;
        } else {              // Option: No
          // Re-set previously saved OnTop state
          mainWindow.setAlwaysOnTop(onTopState);
          e.preventDefault();
          e.returnValue = true;
          return 1;
        }
      } else {
        app.quit();
      }
    }
  } // function onBeforeUnload

  // Emitted when the window is going to be closed, but it's still opened.
  mainWindow.on('close', onBeforeUnload);

  mainWindow.webContents.on('did-start-loading', () => {
    // console.log(mainWindow.webContents.canGoBack());
    // Enable/Disable Navigation subMenu item "Back"
    if (mainWindow.webContents.canGoBack()) {
      appMenu.items[1].submenu.items[2].enabled = true;
    } else {
      appMenu.items[1].submenu.items[2].enabled = false;
    }
    // Enable/Disable Navigation subMenu item "Forward"
    if (mainWindow.webContents.canGoForward()) {
      appMenu.items[1].submenu.items[4].enabled = true;
    } else {
      appMenu.items[1].submenu.items[4].enabled = false;
    }
  });

  mainWindow.webContents.on('new-window', (e, goToURL) => {
    // prevent a new window of being created (ex: target='_blank', etc.)
    e.preventDefault();
    mainWindow.loadURL(goToURL);
  });

  mainWindow.show();
} // function createWindow

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

