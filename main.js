'use strict';

const appName = 'QTube';

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
  'userAgent': 'Mozilla/5.0 (Linux; U; Android 4.0.3; ko-kr; LG-L160L Build/IML74K) AppleWebkit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30'
};

var menuName = '';
if (process.platform === 'darwin') {
  menuName = require('electron').remote.app.getName();
} else {
  menuName = 'Menu';
}

var mainMenu = [{
  label: menuName,
  submenu: [{
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
  }, {
    type: 'separator'
  }, {
    label: 'Toggle Full Screen',
    accelerator: (function () {
      if (process.platform === 'darwin') return 'Ctrl+Command+F';
      else return 'F11';
    })(),
    click: function (item, focusedWindow) {
      if (focusedWindow) focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
    }
  }, {
    label: 'Minimize to Tray ',
    type: 'checkbox',
    checked: true
  }, {
    label: 'On Top',
    accelerator: 'CmdOrCtrl+T',
    type: 'checkbox',
    checked: false,
    click: function (item, focusedWindow) {
      if (focusedWindow) {
        focusedWindow.setAlwaysOnTop(item.checked);
        contextMenu.items[1].checked = item.checked;
      }
    }
  }, {
    type: 'separator'
  }, {
    label: 'Auto-Hide Menu',
    click: function (item, focusedWindow) {
      if (focusedWindow) focusedWindow.setAutoHideMenuBar(!focusedWindow.isMenuBarAutoHide());
    },
    type: 'checkbox',
    checked: 'true'
  }, {
    type: 'separator'
  }, {
    label: 'Quit',
    accelerator: 'CmdOrCtrl+Q',
    click: function (item, focusedWindow) {
      if (focusedWindow) focusedWindow.close();
    }
  }]
}, {
  label: 'About',
  submenu: [{
    label: 'Learn More',
    click: function () {
      require('electron').shell.openExternal('https://github.com/hvmonteiro/qtube');
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
        'message': 'An handy application to connect to Youtube to view videos, avoiding the hassle to use a full-blown browser. It renders Youtube\'s mobile website and can be minimized to desktop\'s tray.'
      });
  }*/
  }]
}];

var sysTrayMenu = [{
  label: 'Show Window',
  type: 'checkbox',
  checked: true,
  click: function (item, BrowserWindow) {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
    }
  }
}, {
  label: 'On Top',
  type: 'checkbox',
  checked: false,
  click: function (item, BrowserWindow) {
    mainWindow.setAlwaysOnTop(item.checked);
  }
}, {
  type: 'separator'
}, {
  label: 'Quit',
  accelerator: 'CmdOrCtrl+Q',
  click: function (item, BrowserWindow) {
    if (mainWindow) mainWindow.close();
  }
}];

var appMenu = Menu.buildFromTemplate(mainMenu);
var contextMenu = Menu.buildFromTemplate(sysTrayMenu);

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
    maxHeight: 380,
    title: appName,
    autoHideMenuBar: true,
    maximizable: false,
    skipTaskbar: false,
    kiosk: true,
    resizable: false,
    icon: 'images/icon@2.png'
  });

  var appIcon = new Tray('images/icon@2.png');

  appIcon.setToolTip(appName + ' - Quick Youtube Viewer');
  appIcon.setContextMenu(contextMenu);

  appIcon.on('click', function () {
    if (mainWindow === null) {
      mainWindow.createWindow();
    }
  });

  // and load the index.html of the app.
  mainWindow.loadURL('about:config', browserOptions);
  // mainWindow.loadURL('http://www.youtube.com/', browserOptions);

  // mainWindow.show();
  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
  mainWindow.on('show', function () {
    mainWindow.setAlwaysOnTop(contextMenu.items[1].checked); // contextMenu Item 'On Top'
  });

  //
  mainWindow.on('minimize', function () {
    if (!contextMenu.items[0].checked) mainWindow.hide();
    // FIXME console.log(appMenu.items[0].subMenu[0].item.checked);
    // FIXME appMenu.items[6].checked; // MainMenu Item 'minimize to Tray'
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
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
