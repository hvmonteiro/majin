'use strict'; // jshint ignore:line

// jshint esversion: 6
/* globals require: true, __dirname: true, process: true, console: true */

// Copyright (c) 2016 Hugo V. Monteiro
// Use of this source code is governed by the GPL-2.0 license that can be
// found in the LICENSE file.

// Debug Log
// console.log(require('module').globalPaths);
// console.log(require('electron'));

// Electron module
const electron = require('electron');

// Module to control application life.
const app = require('app');

// Module to create native browser window.
const BrowserWindow = require('browser-window');

// Module to display a dialog box
const dialog = require('electron').dialog;

const path = require('path');

// Module to create window main menu
const Menu = electron.Menu;

// Module to create window systrem tray icon
const Tray = electron.Tray;

const browserOptions = {
  'extraHeaders': 'pragma: no-cache\n',
  // could also be used using webContents.setUserAgent(userAgent)
  'userAgent': 'Mozilla/5.0 (Linux; Android 5.1.1; Nexus 5 Build/LMY48B; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/43.0.2357.65 Mobile Safari/537.36'
};

var vjson = require(path.join(__dirname, 'version.json'));

var date = new Date();
var currentYear = date.getFullYear();

const appName = vjson.name;
const appVersion = vjson.version;
const appCopyright = vjson.copyright;
const appLicense = vjson.license;
const appWebURL = vjson.homepageURL;
const appSupportURL = vjson.supportURL;

const homePageURL = 'file://' + path.join(__dirname, 'majin.html');

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
    click: function (item, BrowserWindow) {
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
    checked: true,
    click: function (item, BrowserWindow) {
      mainWindow.setAutoHideMenuBar(item.checked);
    }
  }, {
    type: 'separator'
  }, {
    label: 'Quit',
    accelerator: 'CmdOrCtrl+Q',
    click: function (item, BrowserWindow) {
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
    click: function (item, BrowserWindow) {
      mainWindow.loadURL(homePageURL, browserOptions);
    }
  }, {
    type: 'separator'
  }, {
    label: 'Back',
    enabled: false,
    accelerator: 'CmdOrCtrl+Left',
    click: function (item, BrowserWindow) {
      if (mainWindow) mainWindow.webContents.goBack();
    }
  }, {
    label: 'Reload',
    accelerator: 'CmdOrCtrl+R',
    click: function (item, BrowserWindow) {
      if (mainWindow) mainWindow.reload();
    }
  }, {
    label: 'Forward',
    enabled: false,
    accelerator: 'CmdOrCtrl+Right',
    click: function (item, BrowserWindow) {
      if (mainWindow) mainWindow.webContents.goForward();
    }
  }
]}, {
  label: 'About',
  submenu: [{
    label: 'Learn More',
    click: function () {
      electron.shell.openExternal(appWebURL);
    }
  }, {
    label: 'Support',
    click: function () {
      electron.shell.openExternal(appSupportURL);
    }
  }, {
    label: 'About',
    click: function (item, BrowserWindow) {
      let onTopOption = mainWindow.isAlwaysOnTop();
      mainWindow.setAlwaysOnTop(false);
      dialog.showMessageBox({
        'type': 'info',
        'title': 'About',
        buttons: ['Close'],
        'message': appName + '\nVersion ' + appVersion + '\n' + appCopyright + '\n' + appLicense
      });
      mainWindow.setAlwaysOnTop(onTopOption);
    }
  }]
}];

var syscontextMenu = [{
  label: 'Show Window',
  type: 'checkbox',
  checked: true,
  click: function (item, BrowserWindow) {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
      item.checked = false;
    } else {
      mainWindow.show();
      item.checked = true;
    }
  }
}, {
  label: 'On Top',
  type: 'checkbox',
  checked: true,
  click: function (item, BrowserWindow) {
    mainWindow.setAlwaysOnTop(item.checked);
    appMenu.items[0].submenu.items[0].checked = item.checked;
  }
}, {
  type: 'separator'
}, {
  label: 'Quit',
  accelerator: 'CmdOrCtrl+Q',
  click: function (item, BrowserWindow) {
    if (mainWindow) {
      mainWindow._events.close = null; // Unreference function show that App can close
      app.quit();
    }
  }
}];

appMenu = Menu.buildFromTemplate(mainMenu);
contextMenu = Menu.buildFromTemplate(syscontextMenu);

app.setName(appName);
Menu.setApplicationMenu(appMenu);

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 380,
    height: 380,
    minWidth: 380,
    minHeight: 380,
    maxWidth: 380,
    // maxHeight: 380,
    autoHideMenuBar: true,
    maximizable: false,
    skipTaskbar: false,
    // resizable: true,
    // closable: false,
    show: false,
    icon: path.join(__dirname, 'images/icon@2.png')
  });

  trayIcon = new Tray(path.join(__dirname, 'images/icon@2.png'));

  trayIcon.setToolTip(appName + ' - Mobile Browser for the Desktop');
  trayIcon.setContextMenu(contextMenu);
  trayIcon.setHighlightMode(false);

  trayIcon.on('click', function () {
    if (mainWindow === null) {
      mainWindow.createWindow();
    }
  });

  trayIcon.on('double-click', function (BrowserWindow) {
    if (mainWindow.isVisible()) {
      contextMenu.items[0].checked = false; // contextMenu Item 'Show Window'
      trayIcon.setContextMenu(contextMenu); // re-set contextMenu to reflect changes made above
      mainWindow.hide();
    } else {
      contextMenu.items[0].checked = true; // contextMenu Item 'Show Window'
      trayIcon.setContextMenu(contextMenu); // re-set contextMenu to reflect changes made above
      mainWindow.show();
    }
  });

  // mainWindow.loadURL('about:config', browserOptions);
  mainWindow.loadURL(homePageURL, browserOptions);

  mainWindow.on('show', function (BrowserWindow) {
    mainWindow.setAlwaysOnTop(contextMenu.items[1].checked); // contextMenu Item 'On Top'
    appMenu.items[0].submenu.items[0].checked = contextMenu.items[1].checked;
    mainWindow.on('close', onBeforeUnload);
  });

  mainWindow.on('page-title-updated', function (e) {
    e.preventDefault();
    mainWindow.setTitle(appName + ' - ' +  mainWindow.webContents.getTitle());
  });
/*
  mainWindow.webContents.on('did-finish-load', function (e) {
    mainWindow.setTitle(appName + ' - ' +  mainWindow.webContents.getTitle());
  });
*/
  //
  mainWindow.on('minimize', function () {
    if (appMenu.items[0].submenu.items[2].checked) { // appMenu Item 'Minimize To Tray'
      contextMenu.items[0].checked = false; // contextMenu Item 'Show Window'
      trayIcon.setContextMenu(contextMenu); // re-set contextMenu to reflect changes made above
      mainWindow.hide();
    }
  });

  function onBeforeUnload (e, BrowserWindow) { // Working: but window is still always closed
    if (appMenu.items[0].submenu.items[3].checked) { // appMenu Item 'Close To Tray'
      e.preventDefault();
      contextMenu.items[0].checked = false;
      trayIcon.setContextMenu(contextMenu);
      mainWindow.hide();
      e.returnValue = false;
    } else {
      // If set, unset OnTop state so that the window doesn't hide the dialog
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
  }
  // Emitted when the window is going to be closed, but it's still opened.
  mainWindow.on('close', onBeforeUnload);

  mainWindow.webContents.on('did-start-loading', function (e) {
    //console.log(mainWindow.webContents.canGoBack());
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
  mainWindow.webContents.on('new-window', function (e, goToURL) {
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
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
