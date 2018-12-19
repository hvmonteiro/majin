import { app, BrowserWindow } from "electron";

export const sysContextMenuTemplate = [{
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
        if (mainWindow) {
            mainWindow._events.close = null; // Unreference function show that App can close
            app.quit();
        }
    }
}];
