import { app, BrowserWindow } from "electron";

export const aboutMenuTemplate = {
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
    },
        /* Create a developer menu which is enabled using a command line argument --devel(?)
  }, {
    type: 'separator'
  }, {
    label: 'Clear Web Cache',
    click: function (item, BrowserWindow) {
      if (mainWindow) mainWindow.webContents.session.clearStorageData(['storages: localstorage'], function() {});
    }
    */
        {
            label: 'About',
            click: function (item, BrowserWindow) {
                let onTopOption = mainWindow.isAlwaysOnTop();
                mainWindow.setAlwaysOnTop(false);
                dialog.showMessageBox({
                    'type': 'info',
                    'title': 'About',
                    buttons: ['Close'],
                    'message': appName + '\nVersion ' + appVersion + ' (' + appBuildID + ')' + '\n' + appCopyright + '\n' + appLicense
                });
                mainWindow.setAlwaysOnTop(onTopOption);
            }
        }]
};


