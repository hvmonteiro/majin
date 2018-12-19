import { app, BrowserWindow } from "electron";

export const navigationMenuTemplate = {
    label: 'Navigation',
    submenu: [{
        label: 'Home',
        accelerator: 'CmdOrCtrl+H',
        click: function (item, BrowserWindow) {
            mainWindow.loadURL(homePageURL, browserOptions);
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
            if (mainWindow) mainWindow.webContents.goBack();
        }
    }, {
        label: 'Reload',
        accelerator: 'F5',
        click: function (item, BrowserWindow) {
            if (mainWindow) mainWindow.reload();
        }
    }, {
        label: 'Forward',
        enabled: false,
        accelerator: 'Alt+Right',
        click: function (item, BrowserWindow) {
            if (mainWindow) mainWindow.webContents.goForward();
        }
    }]
};


