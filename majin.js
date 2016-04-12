'use strict';

const appName = 'Majin';

// Electron module
const electron = require('electron');

// Module to control application life.
const app = electron.app;

// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

// Module to create window main menu
const Menu = electron.Menu;

// Module to create window systrem tray icon
const Tray = electron.Tray;

const browserOptions = {
  'extraHeaders': 'pragma: no-cache\n',
  // could also be used using webContents.setUserAgent(userAgent)
  'userAgent': 'Mozilla/5.0 (Linux; U; Android 4.0.3; ko-kr; LG-L160L Build/IML74K) AppleWebkit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30'
};

var trayIcon = null;
var appMenu = null;
var contextMenu = null;

var path = require('path');

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
    checked: false,
    click: function (item, mainWindow) {
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
    checked: 'true',
    click: function (item, focusedWindow) {
      focusedWindow.setAutoHideMenuBar(item.checked);
    }
  }, {
    type: 'separator'
  }, {
    label: 'Quit',
    accelerator: 'CmdOrCtrl+Q',
    click: function (item, BrowserWindow) {
      if (mainWindow) {
        BrowserWindow._events.close = null; // Unreference function show that App can close
        app.quit();
      }
    }
  }]
}, {
  label: 'Navigation',
  submenu: [{
    label: 'Home',
    accelerator: 'CmdOrCtrl+H',
    click: function (item, mainWindow) {
      mainWindow.loadURL('file:///' + path.join(__dirname, 'index.html'), browserOptions);
    }
  }, {
    type: 'separator'
  }, {
    label: 'Back',
    accelerator: 'CmdOrCtrl+Left',
    click: function (item, mainWindow) {
      if (mainWindow) mainWindow.webContents.goBack();
    }
  }, {
    label: 'Reload',
    accelerator: 'CmdOrCtrl+R',
    click: function (item, mainWindow) {
      if (mainWindow) mainWindow.reload();
    }
  }, {
    label: 'Forward',
    accelerator: 'CmdOrCtrl+Right',
    click: function (item, mainWindow) {
      if (mainWindow) mainWindow.webContents.goForward();
    }
  }]
}, {
  label: 'About',
  submenu: [{
    label: 'Learn More',
    click: function () {
      require('electron').shell.openExternal('https://github.com/hvmonteiro/majin');
    }
  }, {
    label: 'About'
    /*
    click: function () {
      var remote = require('remote');
      var dialog = remote.require('dialog');
      dialog.showMessageBox({
        'type': 'info',
        'title': 'About',
        buttons: ['Close'],
        'message': 'Mobile DEsktop Browser that can be minimized to desktop\'s tray.'
      });
  }*/
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
    console.log(contextMenu.items[0].checked);
  }
}, {
  label: 'On Top',
  type: 'checkbox',
  checked: false,
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
      BrowserWindow._events.close = null; // Unreference function show that App can close
      app.quit();
    }
  }
}];

appMenu = Menu.buildFromTemplate(mainMenu);
contextMenu = Menu.buildFromTemplate(syscontextMenu);

app.setName(appName);
Menu.setApplicationMenu(appMenu);

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

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

  trayIcon.on('click', function () {
    if (mainWindow === null) {
      mainWindow.createWindow();
    }
  });

  trayIcon.on('double-click', function () {
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

  // and load the index.html of the app.
  // mainWindow.loadURL('about:config', browserOptions);
  mainWindow.loadURL('file:///' + path.join(__dirname, 'index.html'), browserOptions);

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
  mainWindow.on('show', function () {
    mainWindow.setAlwaysOnTop(contextMenu.items[1].checked); // contextMenu Item 'On Top'
    appMenu.items[0].submenu.items[0].checked = contextMenu.items[1].checked;
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
    console.log(mainWindow);
    if (appMenu.items[0].submenu.items[3].checked) { // appMenu Item 'Close To Tray'
      e.preventDefault();
      mainWindow.hide();
      e.returnValue = false;
    } else {
      mainWindow = null;
    }
  }
  // Emitted when the window is going to be closed, but it's still opened.
  mainWindow.on('close', onBeforeUnload);

  /*
  mainWindow.onbeforeunload = function (e) {
    console.log('onbeforeunload');
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
