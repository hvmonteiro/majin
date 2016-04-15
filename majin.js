// 'use strict'; // jshint ignore:line

/* globals require: true, __dirname: true, process: true */

// Copyright (c) 2016 Hugo V. Monteiro
// // Use of this source code is governed by the GPL-2.0 license that can be
// // found in the LICENSE file.

// Debug Log
// console.log(require('module').globalPaths);
// console.log(require('electron'));

// Electron module
const electron = require('electron');

// Module to control application life.
// const app = electron.app;
const app = require('app');

// Module to create native browser window.
// const BrowserWindow = electron.BrowserWindow;
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
  'userAgent': 'Mozilla/5.0 (Linux; U; Android 4.0.3; ko-kr; LG-L160L Build/IML74K) AppleWebkit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30'
};

const appName = 'Majin';
const appVersion = '0.1';
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
    checked: false
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
  }]
}, {
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
  }]
}, {
  label: 'About',
  submenu: [{
    label: 'Learn More',
    click: function () {
      electron.shell.openExternal('https://github.com/hvmonteiro/majin');
    }
  }, {
    label: 'License',
    click: function () {
      dialog.showMessageBox({
        'type': 'info',
        'title': 'License',
        buttons: ['Close'],
        'message': ' '
      });
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
        'message': 'Majin\nVersion ' + appVersion + '\nGPL 2.0 License'
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
    title: appName,
    autoHideMenuBar: true,
    maximizable: false,
    skipTaskbar: false,
    // resizable: true,
    show: false,
    icon: path.join(__dirname, 'images', 'icon@2.png')
  });

  trayIcon = new Tray(path.join(__dirname, 'images', 'icon@2.png'));

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
      console.log('hide');
    } else {
      contextMenu.items[0].checked = true; // contextMenu Item 'Show Window'
      trayIcon.setContextMenu(contextMenu); // re-set contextMenu to reflect changes made above
      mainWindow.show();
      console.log('show');
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
  });

  //
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
      mainWindow = null;
    }
  }
  // Emitted when the window is going to be closed, but it's still opened.
  mainWindow.on('close', onBeforeUnload);

  mainWindow.webContents.on('did-start-loading', function (e, cmd) {
    // Navigate the window back when the user hits their mouse back button
    if (cmd === 'browser-backward' && mainWindow.webContents.canGoBack()) {
      appMenu.items[1].submenu.items[2].enabled = true;
    } else {
      appMenu.items[1].submenu.items[2].enabled = false;
    }
    // Navigate the window forward when the user hits their mouse forward button
    if (cmd === 'browser-forward' && mainWindow.webContents.canGoForward()) {
      appMenu.items[1].submenu.items[4].enabled = true;
    } else {
      appMenu.items[1].submenu.items[4].enabled = false;
    }
  });
  mainWindow.webContents.on('new-window', function (e, goToURL) {
    // prevent a new window being created (ex: target='_blank', etc.)
    e.preventDefault();
    mainWindow.loadURL(goToURL);
  });
  /*
  mainWindow.onbeforeunload = function (e) {
    var remote = require('remote');
    var dialog = remote.require('dialog');
    var choice = dialog.showMessageBox(
    remote.getCurrentWindow(),
      {
        type: 'question',
        buttons: ['Yes', 'No'],
        title: 'Confirm',
        message: 'Are you sure you want to quit?'
      });
    e.returnValue = false;

    return choice === 0;

  };
  */
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
