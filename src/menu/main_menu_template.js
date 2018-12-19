import { app, BrowserWindow } from "electron";

/*
if (process.platform === 'darwin') {
    menuName = require('electron').remote.app.getName();
  } else {
    menuName = 'Menu';
  }
*/
import { sysContextMenuTemplate } from "./systray_menu_template.js";

export const mainMenuTemplate = {
    label: 'Main',
    submenu: [{
        label: 'On Top',
        accelerator: 'CmdOrCtrl+T',
        type: 'checkbox',
        checked: true,
        click: function (item, BrowserWindow) {
            mainWindow.setAlwaysOnTop(item.checked);
            sysContextMenuTemplate.items[1].checked = item.checked;
            trayIcon.setContextMenu(sysContextMenuTemplate);
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
            mainWindow.setAutoHideMenuBar(item.checked);
            mainWindow.setMenuBarVisibility(!item.checked);
            sysContextMenuTemplate.items[3].checked = item.checked;
            trayIcon.setContextMenu(sysContextMenuTemplate);
        }
    }, {
        type: 'separator'
    }, {
        label: 'Quit',
        accelerator: 'CmdOrCtrl+Q',
        click: function (item, BrowserWindow) {
            if (app.mainWindow) {
                app.mainWindow._events.close = null; // Unreference function show that App can close
                app.quit();
            }
        }
    },
    ]};


