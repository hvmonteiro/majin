'use strict'; // jshint ignore:line

// jshint esversion: 6
/* globals require: true, __dirname: true, process: true, console: true */

// Copyright (c) 2024 Hugo V. Monteiro
// Use of this source code is governed by the GPL-2.0 license that can be
// found in the LICENSE file.

// Debug Log
// console.log(require('module').globalPaths);
// console.log(require('electron'));

// Electron module
const { app, BrowserWindow, dialog, Menu, shell, Tray  } = require ('electron');

const path = require('path');

const browserOptions = {
	'extraHeaders': 'pragma: no-cache\n',
	// could also be used using webContents.setUserAgent(userAgent)
	'userAgent': 'Mozilla/5.0 (Linux; Android 10; Pixel 3 XL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.6312.40 Mobile Safari/537.36 EdgA/122.0.2365.86'
};

var vjson = require(path.join(__dirname, 'version.json'));

var date = new Date();
var currentYear = date.getFullYear();

// Solving a bug where in windows, files inside asar packages
// cannot be directly opened because of incorrect handling of '/' instead of '\'.
if ( /^win/.test(process.platform) ) {
	var homePageURL = `file://${path.join(__dirname, 'start.html')}`;
} else {
	var homePageURL = `file://${path.join(__dirname, 'start.html')}`;
}
// var homePageURL = 'about:config';

const appName = vjson.name;
const appVersion = vjson.version;
const appBuild = vjson.build;
const appCopyright = vjson.copyright;
const appAuthor = vjson.author;
const appLicense = vjson.license;
const appWebURL = vjson.homepageURL;
const appSupportURL = vjson.supportURL;

let mainWindow;
let tray;
let appMenu;
let contextMenu;

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
		click(item) {
			mainWindow.setAlwaysOnTop(item.checked);
			contextMenu.items[1].checked = item.checked;
			tray.setContextMenu(contextMenu);
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
		click(item) {
			mainWindow.setAutoHideMenuBar(item.checked);
			mainWindow.setMenuBarVisibility(!item.checked);
			contextMenu.items[3].checked = item.checked;
			tray.setContextMenu(contextMenu);
		}
	}, {
		type: 'separator'
	}, {
		label: 'Quit',
		accelerator: 'CmdOrCtrl+Q',
		click(event) {

			const { width, height } = mainWindow.getBounds();
			const { x, y } = mainWindow.getPosition();

			const dialogWidth = 300; // Width of the dialog
			const dialogHeight = 150; // Height of the dialog

			const centerX = x + (width - dialogWidth) / 2;
			const centerY = y + (height - dialogHeight) / 2;

			mainWindow.setAlwaysOnTop(false);

		    // Show a question dialog when attempting to close the window
			dialog.showMessageBox(mainWindow, {
				type: 'question',
				buttons: ['Yes', 'No'],
				title: 'Confirm Quit',
				message: 'Are you sure you want to quit?',
				x: centerX,
				y: centerY
			}).then(({ response }) => {
				mainWindow.show(); // show blured window again
				if (response === 0) { // Yes button clicked
					mainWindow._events.close = null; // Unreference function so that App can close
					event.returnValue = false;
					mainWindow.destroy(); // Close the window
					return 0;
				} else { // Option: No
					// Re-set previously saved OnTop state
					mainWindow.setAlwaysOnTop(onTopState);
					event.preventDefault();
					event.returnValue = true;
					return 1;
				}
			});		}
	}
	]}, {
		label: 'Navigation',
		submenu: [{
			label: 'Home',
			accelerator: 'CmdOrCtrl+H',
			click() {
				mainWindow.loadURL(homePageURL, browserOptions);
			}
		}, {
			type: 'separator'
			/*
  }, {
	label: 'Open',
	accelerator: 'CmdOrCtrl+O',
	click() {
	  mainWindow.loadURL(homePageURL, browserOptions);
	}
  }, {
	type: 'separator'
	*/
		}, {
			label: 'Back',
			enabled: false,
			accelerator: 'Alt+Left',
			click() {
				if (mainWindow) mainWindow.webContents.goBack();
			}
		}, {
			label: 'Reload',
			accelerator: 'F5',
			click() {
				if (mainWindow) mainWindow.reload();
			}
		}, {
			label: 'Forward',
			enabled: false,
			accelerator: 'Alt+Right',
			click() {
				if (mainWindow) mainWindow.webContents.goForward();
			}
			/* Create a developer menu which is enabled using a command line argument --devel(?)
  }, {
	type: 'separator'
  }, {
	label: 'Clear Web Cache',
	click() {
	  if (mainWindow) mainWindow.webContents.session.clearStorageData(['storages: localstorage'], function() {});
	}
	*/
		}, {
			type: 'separator'
		}, {
			label: 'Clear Cache',
			click() {
				mainWindow.webContents.session.clearCache();
				console.log('Web cache cleared');
			}
		}, {
			label: 'Clear Cookies',
			click() {
				mainWindow.webContents.session.clearStorageData({
					storages: ['cookies']
				  }, () => {
					console.log('Web cookies information cleared');
				  });		
				}
		}, {
			label: 'Clear Web Data',
			click() {
				mainWindow.webContents.session.clearStorageData({
					storages: ['appcache', 'cookies', 'filesystem', 'indexdb', 'localstorage', 'shadercache', 'websql', 'serviceworkers']
				  }, () => {
					console.log('Web data cleared');
				  });
				}
		}
		]}, {
			label: 'Resize',
			submenu: [{
				label: 'Default Size',
				click() {
					mainWindow.setSize(650, 650);
					mainWindow.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
						details.requestHeaders['User-Agent'] = 'Mozilla/5.0 (Linux; Android 10; Pixel 3 XL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.6312.40 Mobile Safari/537.36 EdgA/122.0.2365.86';
						callback({ cancel: false, requestHeaders: details.requestHeaders });
					});
				},
			}, {
				label: 'Portrait',
				submenu: [{
					label: '640x360 (Android Phone)',
					click() {
							mainWindow.setSize(360, 640);
							mainWindow.userAgent = '';
							mainWindow.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
								details.requestHeaders['User-Agent'] = 'Mozilla/5.0 (Linux; Android <AndroidVersion>; <DeviceModel>) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/<ChromeVersion> Mobile Safari/537.36';
								callback({ cancel: false, requestHeaders: details.requestHeaders });
							});
					}
				}, {
					label: '667x375 (iPhone 6/7/8)',
					click() {
						mainWindow.setSize(375, 667);
						mainWindow.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
							details.requestHeaders['User-Agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/97.0.4692.99 Mobile/15E148 Safari/605.1.15';
							callback({ cancel: false, requestHeaders: details.requestHeaders });
						});
					}
				}, {
					label: '896x375 (iPhone X/XS/11)',
					click() {
						mainWindow.setSize(375, 896);
						mainWindow.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
							details.requestHeaders['User-Agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/97.0.4692.99 Mobile/15E148 Safari/605.1.15';
							callback({ cancel: false, requestHeaders: details.requestHeaders });
						});
					}
				}, {
					label: '1024x768 (iPad)',
					click() {
						mainWindow.setSize(768, 1024);
						mainWindow.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
							details.requestHeaders['User-Agent'] = 'Mozilla/5.0 (iPad; CPU OS 15_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/97.0.4692.99 Mobile/15E148 Safari/605.1.15';
							callback({ cancel: false, requestHeaders: details.requestHeaders });
						});
					}
				}, {
					label: '1280x800 (Android Tablets)',
					click() {
						mainWindow.setSize(800, 1280);
						mainWindow.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
							details.requestHeaders['User-Agent'] = 'Mozilla/5.0 (Linux; Android 12; Galaxy Tab S7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36';
							callback({ cancel: false, requestHeaders: details.requestHeaders });
						});
					}
				}, {
					label: '2048x1536 (iPad Retina)',
					click() {
						mainWindow.setSize(1536, 2048);
						mainWindow.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
							details.requestHeaders['User-Agent'] = 'Mozilla/5.0 (iPad; CPU OS 15_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/97.0.4692.99 Mobile/15E148 Safari/605.1.15';
							callback({ cancel: false, requestHeaders: details.requestHeaders });
						});
					}
				}
				]}, {
					label: 'Landscape',
					submenu: [{
						label: '640x360 (Android)',
						click() {
							mainWindow.setSize(640, 360);
							mainWindow.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
								details.requestHeaders['User-Agent'] = 'Mozilla/5.0 (Linux; Android 11; Pixel C) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36';
								callback({ cancel: false, requestHeaders: details.requestHeaders });
							});
						}
					}, {
						label: '667x375 (iPhone 6/7/8)',
						click() {
							mainWindow.setSize(667, 375);
							mainWindow.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
								details.requestHeaders['User-Agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/97.0.4692.99 Mobile/15E148 Safari/605.1.15';
								callback({ cancel: false, requestHeaders: details.requestHeaders });
							});
						}
					}, {
						label: '812x375 (iPhone X/XS/11)',
						click() {
							mainWindow.setSize(812, 375);
							mainWindow.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
								details.requestHeaders['User-Agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/97.0.4692.99 Mobile/15E148 Safari/605.1.15';
								callback({ cancel: false, requestHeaders: details.requestHeaders });
							});
						}
					}, {
						label: '1024x768 (iPad)',
						click() {
							mainWindow.setSize(1024, 768);
							mainWindow.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
								details.requestHeaders['User-Agent'] = 'Mozilla/5.0 (iPad; CPU OS 15_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/97.0.4692.99 Mobile/15E148 Safari/605.1.15';
								callback({ cancel: false, requestHeaders: details.requestHeaders });
							});
						}
					}, {
						label: '1280x800 (Android Tablets)',
						click() {
							mainWindow.setSize(1280, 800);
							mainWindow.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
								details.requestHeaders['User-Agent'] = 'Mozilla/5.0 (Linux; Android 12; Galaxy Tab S7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36';
								callback({ cancel: false, requestHeaders: details.requestHeaders });
							});
						},
					}, {
						label: '1920x1080 (Desktop Full HD)',
						click() {
							mainWindow.setSize(1920, 1080);
							mainWindow.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
								details.requestHeaders['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36';
								callback({ cancel: false, requestHeaders: details.requestHeaders });
							});
						}
					}, {
						label: '2048x1536 (iPad Retina)',
						click() {
							mainWindow.setSize(2048, 1536);
							mainWindow.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
								details.requestHeaders['User-Agent'] = 'Mozilla/5.0 (iPad; CPU OS 15_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/97.0.4692.99 Mobile/15E148 Safari/605.1.15';
								callback({ cancel: false, requestHeaders: details.requestHeaders });
							});
						}
					}
				]}
			]}, {
			label: 'About',
			submenu: [{
				label: 'Learn More',
				click() {
					shell.openExternal(appWebURL);
				}
			}, {
				label: 'Support',
				click() {
					shell.openExternal(appSupportURL);
				}
			}, {
				label: 'About',
				click() {

					const { width, height } = mainWindow.getBounds();
					const { x, y } = mainWindow.getPosition();
				
					const dialogWidth = 300; // Width of the dialog
					const dialogHeight = 150; // Height of the dialog
				
					const centerX = x + (width - dialogWidth) / 2;
					const centerY = y + (height - dialogHeight) / 2;

					let onTopOption = mainWindow.isAlwaysOnTop();
					mainWindow.setAlwaysOnTop(false);
					mainWindow.setEnabled(false); // Disable the main window

					dialog.showMessageBox({
						'type': 'info',
						'title': 'About',
						buttons: ['Close'],
						modal: true,
						'message': appName + '\n' +
						'Version ' + appVersion + ' (' + appBuild + ')' + '\n' + 
						appCopyright + '\n' + 
						appAuthor + '\n' + 
						appLicense,
						x: centerX,
						y: centerY
					}).then(() => {
						mainWindow.setAlwaysOnTop(onTopOption);
						mainWindow.setEnabled(true); // Re-enable the main window when dialog is closed
						mainWindow.focus(); // Bring the main window to front

					});
				}
			}]
		}];

var syscontextMenu = [{
	label: 'Show Window',
	type: 'checkbox',
	checked: true,
	click: function (item) {
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
	click: function (item) {
		mainWindow.setAlwaysOnTop(item.checked);
		appMenu.items[0].submenu.items[0].checked = item.checked;
	}
}, {
	type: 'separator'
}, {
	label: 'Auto-Hide Menu Bar',
	type: 'checkbox',
	checked: false,
	click: function (item) {
		mainWindow.setAutoHideMenuBar(item.checked);
		mainWindow.setMenuBarVisibility(!item.checked);
		appMenu.items[0].submenu.items[5].checked = item.checked;
	}
}, {
	label: 'Quit',
	accelerator: 'CmdOrCtrl+Q',
	click() {
		mainWindow.close(); // Close the window when 'Quit' is clicked
	}
}];

appMenu = Menu.buildFromTemplate(mainMenu);
contextMenu = Menu.buildFromTemplate(syscontextMenu);

app.setName(appName);
Menu.setApplicationMenu(appMenu);

function createWindow () { 
	// Create the browser window.
	mainWindow = new BrowserWindow({
		title: appName,
		width: 650,
		height: 650,
		minWidth: 400,
		minHeight: 400,
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

	tray = new Tray(path.join(__dirname, 'assets/icons/png/32x32.png'));

	tray.setToolTip(appName + ' - Mobile Browser for the Desktop');
	tray.setContextMenu(contextMenu);

	tray.on('click', function () {
		if (mainWindow === null) {
			mainWindow.createWindow();
		}
	});

	tray.on('double-click', function (BrowserWindow) {
		if (mainWindow.isVisible()) {
			contextMenu.items[0].checked = false; // contextMenu Item 'Show Window'
			tray.setContextMenu(contextMenu); // re-set contextMenu to reflect changes made above
			mainWindow.hide();
		} else {
			contextMenu.items[0].checked = true; // contextMenu Item 'Show Window'
			tray.setContextMenu(contextMenu); // re-set contextMenu to reflect changes made above
			mainWindow.show();
		}
	});

	mainWindow.loadURL(homePageURL, browserOptions);

	mainWindow.on('show', function (BrowserWindow) {
		mainWindow.setAlwaysOnTop(contextMenu.items[1].checked); // contextMenu Item 'On Top'
		appMenu.items[0].submenu.items[0].checked = contextMenu.items[1].checked;
		mainWindow.on('close', onBeforeUnload);
	});

	mainWindow.on('page-title-updated', function (e) {
		e.preventDefault();
		mainWindow.setTitle(appName + ' - ' + mainWindow.webContents.getTitle());
		tray.setToolTip(appName + ' - ' + mainWindow.webContents.getTitle());
		tray.setContextMenu(contextMenu);
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
			tray.setContextMenu(contextMenu); // re-set contextMenu to reflect changes made above
			mainWindow.hide();
		}
	});
	
	// Emitted when the window is going to be closed, but it's still opened.
	mainWindow.on('close', onBeforeUnload);

	mainWindow.webContents.on('did-start-loading', function () {
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
	mainWindow.webContents.on('new-window', (event, url, frameName, disposition, options) => {
		event.preventDefault(); // Prevent the default behavior
		mainWindow.loadURL(url); // Load the URL in the main window
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
	console.log(homePageURL);
} // function createWindow

// Initialization is ready to create main window
app.whenReady().then(createWindow);

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

function onBeforeUnload(event) { // Working: but window is still always closed

	event.preventDefault();
	if (appMenu.items[0].submenu.items[3].checked) { // appMenu Item 'Close To Tray'
		contextMenu.items[0].checked = false;
		tray.setContextMenu(contextMenu);
		mainWindow.hide();
		event.returnValue = false;
	} else {
		// If set, unset OnTop state so that the window doesn't hide the dialog
		// and save existing OnTop state to re-set it later on
		let onTopState = appMenu.items[0].submenu.items[0].checked;
		if (mainWindow) {
			
			const { width, height } = mainWindow.getBounds();
			const { x, y } = mainWindow.getPosition();

			const dialogWidth = 300; // Width of the dialog
			const dialogHeight = 150; // Height of the dialog

			const centerX = x + (width - dialogWidth) / 2;
			const centerY = y + (height - dialogHeight) / 2;

			mainWindow.setAlwaysOnTop(false);
			//mainWindow.blur(); // Hide window temporarely so that doesn't overlaps dialog window

		    // Show a question dialog when attempting to close the window
			dialog.showMessageBox(mainWindow, {
				type: 'question',
				buttons: ['Yes', 'No'],
				title: 'Confirm Quit',
				message: 'Are you sure you want to quit?',
				x: centerX,
				y: centerY
			}).then(({ response }) => {
				mainWindow.show(); // show blured window again
				if (response === 0) { // Yes button clicked
					mainWindow._events.close = null; // Unreference function so that App can close
					event.returnValue = false;
					mainWindow.destroy(); // Close the window
					return 0;
				} else { // Option: No
					// Re-set previously saved OnTop state
					mainWindow.setAlwaysOnTop(onTopState);
					event.preventDefault();
					event.returnValue = true;
					return 1;
				}
			});
		} else {
			app.quit();
		}
	}
}
