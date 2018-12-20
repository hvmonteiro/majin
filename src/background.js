'use strict'; // jshint ignore:line

// jshint esversion: 6
/* globals require: true, __dirname: true, process: true, console: true */

// Copyright (c) 2018 Hugo V. Monteiro
// Use of this source code is governed by the GPL-2.0 license that can be
// found in the LICENSE file.

// Debug Log
// console.log(require('module').globalPaths);
// console.log(require('electron'));


// This is main process of Electron, started as first thing when your
// app starts. It runs through entire life of your application.

import path from "path";
import url from "url";
const electron = require('electron');
import { app, Menu, dialog, BrowserWindow } from "electron";
import { devMenuTemplate } from "./menu/dev_menu_template";
//import { mainMenuTemplate } from "./menu/main_menu_template";
//import { navigationMenuTemplate } from "./menu/navigation_menu_template";
//import { aboutMenuTemplate } from "./menu/about_menu_template";
import { editMenuTemplate } from "./menu/edit_menu_template";
//import { syscontextMenu } from "./menu/systray_menu_template.js";
import createWindow from "./helpers/window";

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


// Module to create window main menu
//const Menu = electron.Menu;

// Module to create window systrem tray icon
const Tray = electron.Tray;

const browserOptions = {
    'extraHeaders': 'pragma: no-cache\n',
    // could also be used using webContents.setUserAgent(userAgent)
    'userAgent': 'Mozilla/5.0 (Linux; Android 7.0; SM-G892A Build/NRD90M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/60.0.3112.107 Mobile Safari/537.36'
};


//import { vjson } from 'app/version.json';

var date = new Date();
var currentYear = date.getFullYear();

const appName = 'vjson.name';
const appVersion = 'vjson.version';
const appBuildID = 'vjson.buildID';
const appCopyright = 'vjson.copyright';
const appLicense = 'vjson.license';
const appWebURL = 'vjson.homepageURL';
const appSupportURL = 'vjson.supportURL';

// Solving a bug where in windows, files inside a asar packages,
// cannot be directly opened because of incorrect handling of '/' instead of '\'.
/*
if ( /^win/.test(process.platform) ) {
    var homePageURL = 'https://www.google.com/';
} else {
    var homePageURL = 'file://' + path.join(__dirname, 'majin.html');
}*/
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
    click: function (item, BrowserWindow) {
      BrowserWindow.setAlwaysOnTop(item.checked);
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
    click: function (item, BrowserWindow) {
      BrowserWindow.setAutoHideMenuBar(item.checked);
      BrowserWindow.setMenuBarVisibility(!item.checked);
      contextMenu.items[3].checked = item.checked;
      trayIcon.setContextMenu(contextMenu);
    }
  }, {
    type: 'separator'
  }, {
    label: 'Quit',
    accelerator: 'CmdOrCtrl+Q',
    click: function (item, BrowserWindow) {
        BrowserWindow.close();
        BrowserWindow._events.close = null; // Unreference function show that App can close
        app.quit();
    }
  }
]}, {
  label: 'Navigation',
  submenu: [{
    label: 'Home',
    accelerator: 'CmdOrCtrl+H',
    click: function (item, BrowserWindow) {
      BrowserWindow.loadURL(homePageURL, browserOptions);
    }
  }, {
    type: 'separator'
/*
  }, {
    label: 'Open',
    accelerator: 'CmdOrCtrl+O',
    click: function (item, BrowserWindow) {
      mainWindow.loadURL(homePageURL, browserOptions);
    }
  }, {
    type: 'separator'
*/
  }, {
    label: 'Back',
    enabled: false,
    accelerator: 'Alt+Left',
    click: function (item, BrowserWindow) {
      if (BrowserWindow) BrowserWindow.webContents.goBack();
    }
  }, {
    label: 'Reload',
    accelerator: 'F5',
    click: function (item, BrowserWindow) {
      BrowserWindow.webContents.reloadIgnoringCache();
    }
  }, {
    label: 'Forward',
    enabled: false,
    accelerator: 'Alt+Right',
    click: function (item, BrowserWindow) {
      if (BrowserWindow) BrowserWindow.webContents.goForward();
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
// Create a developer menu which is enabled using a command line argument --devel(?)
  }, {
    type: 'separator'
  }, {
    label: 'Clear Web Cache',
    click: function (item, BrowserWindow) {
      BrowserWindow.webContents.session.clearStorageData(['storages: localstorage'], function() {});
    }
  }, {
    label: 'About',
    click: function (item, BrowserWindow) {
      let onTopOption = BrowserWindow.isAlwaysOnTop();
      BrowserWindow.setAlwaysOnTop(false);
      dialog.showMessageBox({
        'type': 'info',
        'title': 'About',
        buttons: ['Close'],
        'message': appName + '\nVersion ' + appVersion + ' (' + appBuildID + ')' + '\n' + appCopyright + '\n' + appLicense
      });
      BrowserWindow.setAlwaysOnTop(onTopOption);
    }
  }]
}];

var syscontextMenu = [{
  label: 'Show Window',
  type: 'checkbox',
  checked: true,
  click: function (item, BrowserWindow) {
//      if (BrowserWindow.isVisible()) {
  if (BrowserWindow) {
      BrowserWindow.hide();
      item.checked = false;
    } else {
      app.BrowserWindow.show();
      item.checked = true;
    }
  }
}, {
  label: 'On Top',
  type: 'checkbox',
  checked: true,
  click: function (item, BrowserWindow) {
    if (BrowserWindow.isVisible()) {
      BrowserWindow.setAlwaysOnTop(item.checked);
      appMenu.items[0].submenu.items[0].checked = item.checked;
    }
  }
}, {
  type: 'separator'
}, {
  label: 'Auto-Hide Menu Bar',
  type: 'checkbox',
  checked: false,
  click: function (item, BrowserWindow) {
    mainWindow.setAutoHideMenuBar(item.checked);
    mainWindow.setMenuBarVisibility(!item.checked);
    appMenu.items[0].submenu.items[5].checked = item.checked;
  }
}, {
  label: 'Quit',
  accelerator: 'CmdOrCtrl+Q',
  click: function (item, BrowserWindow) {
    BrowserWindow.close();
    BrowserWindow._events.close = null; // Unreference function show that App can close
    app.quit();
  }
}];

const setApplicationMenu = () => {
  appMenu = Menu.buildFromTemplate(mainMenu);
  contextMenu = Menu.buildFromTemplate(syscontextMenu);
/*
  if (env.name !== "production") {
      appMenu.push(devMenuTemplate);
  }
*/
  Menu.setApplicationMenu(appMenu);
};

app.setName(appName);

app.on('ready', () => {

//function createMainWindow () {
  setApplicationMenu(appMenu);

  // Create the browser window.
  const mainWindow = createWindow('main', {
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
      icon: path.join(__dirname, 'assets/icons/png/32x32.png')
    });

    trayIcon = new Tray(path.join(__dirname, 'assets/icons/png/32x32.png'));
  
    trayIcon.setToolTip(appName + ' - Mobile Browser for the Desktop');
    trayIcon.setContextMenu(contextMenu);
    trayIcon.setHighlightMode(false);
  
    trayIcon.on('click', function () {
      if (mainWindow === null) {
      mainWindow.createMainWindow();
      }
    });
  
    trayIcon.on('double-click', function (BrowserWindow) {
//      if (BrowserWindow.isVisible()) {
      if (BrowserWindow) {
          contextMenu.items[0].checked = false; // contextMenu Item 'Show Window'
        trayIcon.setContextMenu(contextMenu); // re-set contextMenu to reflect changes made above
        BrowserWindow.hide();
      } else {
        contextMenu.items[0].checked = true; // contextMenu Item 'Show Window'
        trayIcon.setContextMenu(contextMenu); // re-set contextMenu to reflect changes made above
        BrowserWindow.show();
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
      mainWindow.setTitle(appName + ' - ' + mainWindow.webContents.getTitle());
      trayIcon.setToolTip(appName + ' - ' + mainWindow.webContents.getTitle());
      trayIcon.setContextMenu(contextMenu);
    });
  
    /*
    mainWindow.webContents.on('did-finish-load', function (e) {
      mainWindow.setTitle(appName + ' - ' +  mainWindow.webContents.getTitle());
    });
    */
    //
    /*
    mainWindow.on('minimize', function () {
    if (appMenu.items[0].submenu.items[2].checked) { // appMenu Item 'Minimize To Tray'
      contextMenu.items[0].checked = false; // contextMenu Item 'Show Window'
      trayIcon.setContextMenu(contextMenu); // re-set contextMenu to reflect changes made above
        mainWindow.hide();
      }
    });
  */
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

    mainWindow.webContents.on('new-window', function (e, goToURL) {
      // prevent a new window of being created (ex: target='_blank', etc.)
      e.preventDefault();
      mainWindow.loadURL(goToURL);
    });

    // This is only used to test if the application start without any problem,
    // the application immediatly exits after this if everything is ok
    if (process.argv[2] === '--test') {
      console.log('Application Execution Test: Ok');
      mainWindow._events.close = null; // Unreference function so that App can close
      mainWindow.close();
      app.quit();
    } else {
      mainWindow.show();
    }
    /*
    if (env.name === "development") {
        mainWindow.openDevTools();
    }
    */

//} // function createMainWindow
});


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
//app.on('ready', createMainWindow);

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
