'use strict'; // jshint ignore:line

// jshint esversion: 6
/* globals require: true, __dirname: true, process: true, console: true */

// Copyright (c) 2024 Hugo V. Monteiro
// Use of this source code is governed by the GPL-2.0 license that can be
// found in the LICENSE file.


// --- Imports

// Electron module
const { app, BrowserWindow, dialog, Menu, shell, Tray } = require('electron');

// To store settings between sessions
const Store = require('electron-store');

// --- Constants

// Consistent directory paths when working with different operating systems
const path = require('path');

// Create a new instance of electron-store
const storeSession = new Store();

// Read application info directly from package.json
const packageJson = require(path.join(__dirname, 'package.json'));

const appName = packageJson.productName;
const appVersion = packageJson.version;
const appCopyright = packageJson.copyright;
const appAuthor = packageJson.author;
const appLicense = packageJson.license;
const appWebURL = packageJson.homePage;
const appSupportURL = packageJson.bugs.url;

const homePageURL = `file://${path.join(__dirname, 'start.html')}`;

const browserOptions = {
	'extraHeaders': 'pragma: no-cache\n',
	'userAgent': 'Mozilla/5.0 (Linux; Android 10; Pixel 3 XL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.6312.40 Mobile Safari/537.36 EdgA/122.0.2365.86'
};


const defaultWindowOptions = {
	title: appName,
	width: 650,
	height: 650,
	minWidth: 300,
	minHeight: 300,
	// maxWidth: 400,
	// maxHeight: 400,
	autoHideMenuBar: false,
	maximizable: false,
	skipTaskbar: false,
	resizable: true,
	// closable: false,
	show: false,
	icon: path.join(__dirname, 'assets/icons/png/32x32.png')
};

const menuName = (process.platform === 'darwin') ? app.getName() : 'Menu';

// --- Variables

// Check if the application is in development mode
var isDevelopment = false;

let openURL;
let savedOpenURL;
let windowOptions;
let mainWindow;
let tray;
let appMenu;
let contextMenu;


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
		label: 'Session',
		submenu: [{
			label: 'Clear Web Cache',
			click() {
				mainWindow.webContents.session.clearCache();
				logDevelopment('Web cache cleared');
			}
		}, {
			label: 'Clear Web Cookies',
			click() {
				mainWindow.webContents.session.clearStorageData({
					storages: ['cookies']
				}, () => {
					logDevelopment('Web cookies information cleared');
				});
			}
		}, {
			label: 'Clear Web Data',
			click() {
				mainWindow.webContents.session.clearStorageData({
					storages: ['appcache', 'cookies', 'filesystem', 'indexdb', 'localstorage', 'shadercache', 'websql', 'serviceworkers']
				}, () => {
					logDevelopment('Web data cleared');
				});
			}
		}, {
			label: 'Clear Application Session',
			click() {
				// Clear the stored session
				storeSession.clear();
				logDevelopment('Application session data cleared');
			}
		}]
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

			let onTopState = appMenu.items[0].submenu.items[0].checked;
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
					saveSession();
					mainWindow.destroy(); // Close the window
					return 0;
				} else { // Option: No
					// Re-set previously saved OnTop state
					mainWindow.setAlwaysOnTop(onTopState);
					event.returnValue = true;
					return 1;
				}
			});
		}
	}]
}, {
	label: 'Navigation',
	submenu: [{
		label: 'Home',
		accelerator: 'CmdOrCtrl+H',
		click() {
			mainWindow.loadURL(homePageURL, browserOptions);
		}
	}, {
		type: 'separator'
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
	}]
}, {
	label: 'Resize',
	submenu: [{
		label: 'Default Size',
		type: 'checkbox',
		checked: true, // Initially checked
		userAgent: 'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Mobile Safari/537.36',
		click(menuItem) {
			uncheckAllExcept(menuItem);
			mainWindow.setSize(650, 650);
			setUserAgent(menuItem.userAgent);
		},
	}, {
		label: 'Portrait',
		submenu: [{
			label: '640x360 (Android Phone)',
			type: 'checkbox',
			checked: false, // Initially unchecked
			userAgent: 'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Mobile Safari/537.36',
			click(menuItem) {
				uncheckAllExcept(menuItem);
				mainWindow.setSize(360, 640);
				setUserAgent(menuItem.userAgent);
			}
		}, {
			label: '667x375 (iPhone 6/7/8)',
			type: 'checkbox',
			checked: false, // Initially unchecked
			userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/97.0.4692.99 Mobile/15E148 Safari/605.1.15',
			click(menuItem) {
				uncheckAllExcept(menuItem);
				mainWindow.setSize(375, 667);
				setUserAgent(menuItem.userAgent);
			}
		}, {
			label: '896x375 (iPhone X/XS/11)',
			type: 'checkbox',
			checked: false, // Initially unchecked
			userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/97.0.4692.99 Mobile/15E148 Safari/605.1.15',
			click(menuItem) {
				uncheckAllExcept(menuItem);
				mainWindow.setSize(375, 896);
				setUserAgent(menuItem.userAgent);
			}
		}, {
			label: '1024x768 (iPad)',
			type: 'checkbox',
			checked: false, // Initially unchecked
			userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/97.0.4692.99 Mobile/15E148 Safari/605.1.15',
			click(menuItem) {
				uncheckAllExcept(menuItem);
				mainWindow.setSize(768, 1024);
				setUserAgent(menuItem.userAgent);
			}
		}, {
			label: '1280x800 (Android Tablet)',
			type: 'checkbox',
			checked: false, // Initially unchecked
			userAgent: 'Mozilla/5.0 (Linux; Android 12; Galaxy Tab S7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36',
			click(menuItem) {
				uncheckAllExcept(menuItem);
				mainWindow.setSize(800, 1280);
				setUserAgent(menuItem.userAgent);
			}
		}, {
			label: '2048x1536 (iPad Retina)',
			type: 'checkbox',
			checked: false, // Initially unchecked
			userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/97.0.4692.99 Mobile/15E148 Safari/605.1.15',
			click(menuItem) {
				uncheckAllExcept(menuItem);
				mainWindow.setSize(1536, 2048);
				setUserAgent(menuItem.userAgent);
			}
		}]
	}, {
		label: 'Landscape',
		submenu: [{
			label: '640x360 (Android Phone)',
			type: 'checkbox',
			checked: false, // Initially unchecked
			userAgent: 'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Mobile Safari/537.36',
			click(menuItem) {
				uncheckAllExcept(menuItem);
				mainWindow.setSize(640, 360);
				setUserAgent(menuItem.userAgent);
			}
		}, {
			label: '667x375 (iPhone 6/7/8)',
			type: 'checkbox',
			checked: false, // Initially unchecked
			userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/97.0.4692.99 Mobile/15E148 Safari/605.1.15',
			click(menuItem) {
				uncheckAllExcept(menuItem);
				mainWindow.setSize(667, 375);
				setUserAgent(menuItem.userAgent);
			}
		}, {
			label: '812x375 (iPhone X/XS/11)',
			type: 'checkbox',
			checked: false, // Initially unchecked
			userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/97.0.4692.99 Mobile/15E148 Safari/605.1.15',
			click(menuItem) {
				uncheckAllExcept(menuItem);
				mainWindow.setSize(812, 375);
				setUserAgent(menuItem.userAgent);
			}
		}, {
			label: '1024x768 (iPad)',
			type: 'checkbox',
			checked: false, // Initially unchecked
			userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/97.0.4692.99 Mobile/15E148 Safari/605.1.15',
			click(menuItem) {
				uncheckAllExcept(menuItem);
				mainWindow.setSize(1024, 768);
				setUserAgent(menuItem.userAgent);
			}
		}, {
			label: '1280x800 (Android Tablet)',
			type: 'checkbox',
			checked: false, // Initially unchecked
			userAgent: 'Mozilla/5.0 (Linux; Android 12; Galaxy Tab S7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36',
			click(menuItem) {
				uncheckAllExcept(menuItem);
				mainWindow.setSize(1280, 800);
				setUserAgent(menuItem.userAgent);
			},
		}, {
			label: '1920x1080 (Desktop Full HD)',
			type: 'checkbox',
			checked: false, // Initially unchecked
			userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36',
			click(menuItem) {
				uncheckAllExcept(menuItem);
				mainWindow.setSize(1920, 1080);
				setUserAgent(menuItem.userAgent);
			}
		}, {
			label: '2048x1536 (iPad Retina)',
			type: 'checkbox',
			checked: false, // Initially unchecked
			userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/97.0.4692.99 Mobile/15E148 Safari/605.1.15',
			click(menuItem) {
				uncheckAllExcept(menuItem);
				mainWindow.setSize(2048, 1536);
				setUserAgent(menuItem.userAgent);
			}
		}
		]
	}
	]
}, {
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
					'Version ' + appVersion + '\n' +
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
	click(event) {

		const { width, height } = mainWindow.getBounds();
		const { x, y } = mainWindow.getPosition();

		const dialogWidth = 300; // Width of the dialog
		const dialogHeight = 150; // Height of the dialog

		const centerX = x + (width - dialogWidth) / 2;
		const centerY = y + (height - dialogHeight) / 2;

		let onTopState = appMenu.items[0].submenu.items[0].checked;
		mainWindow.setAlwaysOnTop(false);
		let windowVisible = mainWindow.isVisible();

		// Show a question dialog when attempting to close the window
		dialog.showMessageBox(mainWindow, {
			type: 'question',
			buttons: ['Yes', 'No'],
			title: 'Confirm Quit',
			message: 'Are you sure you want to quit?',
			x: centerX,
			y: centerY
		}).then(({ response }) => {
			if (windowVisible) mainWindow.show(); // show blured window again
			if (response === 0) { // Yes button clicked
				mainWindow._events.close = null; // Unreference function so that App can close
				event.returnValue = false;
				saveSession();
				mainWindow.destroy(); // Close the window
				return 0;
			} else { // Option: No
				// Re-set previously saved OnTop state
				mainWindow.setAlwaysOnTop(onTopState);
				event.returnValue = true;
				return 1;
			}
		});
	}
}];


// Set menus

appMenu = Menu.buildFromTemplate(mainMenu);
contextMenu = Menu.buildFromTemplate(syscontextMenu);

app.setName(appName);
Menu.setApplicationMenu(appMenu);


// --- Functions

// Function to log troubleshooting text only in development mode
function logDevelopment(...args) {
	if (isDevelopment) {
		console.log(...args);
	}
}

// Sets user-agent based on each selected resize setting in application's 'Resize' menu
function setUserAgent(userAgent) {
	mainWindow.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
		details.requestHeaders['User-Agent'] = userAgent;
		callback({ cancel: false, requestHeaders: details.requestHeaders });
	});
}

// Unchecks all items in application's resize menu except the item specified by 'clickedMenuItem'
function uncheckAllExcept(clickedMenuItem) {
	// Iterate through all submenu items of the 'Resize' menu

	// Default Size
	appMenu.items[2].submenu.items[0].checked = (appMenu.items[2].submenu.items[0].checked === clickedMenuItem);

	// Resize > Landscape
	for (const item of appMenu.items[2].submenu.items[1].submenu.items) {
		// Set checked property to false for all items except the one clicked
		item.checked = (item.label === clickedMenuItem);
	}
	// Resize > Portrait
	for (const item of appMenu.items[2].submenu.items[2].submenu.items) {
		// Set checked property to false for all items except the one clicked
		item.checked = (item.label === clickedMenuItem);
	}
	clickedMenuItem.checked = true;
}


// Asks the user for confirmation when closing the application
function onBeforeUnload(event) {

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
					saveSession();
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
			saveSession();
			app.quit();
		}
	}
}


// Set application to its last session settings if session store file is found
function loadSession() {

	logDevelopment('Loading previous session...\n');

	// Load window options from store if available
	const savedWindowOptions = storeSession.get('windowOptions');
	windowOptions = savedWindowOptions ? { ...defaultWindowOptions, ...savedWindowOptions } : defaultWindowOptions;
	logDevelopment('> Window options: ');
	for (const key in windowOptions) {
		logDevelopment(' > ' + key + ': ' + windowOptions[key]);
	}

	// Window opened URL
	savedOpenURL = storeSession.get('OpenURL');
	logDevelopment('> OpenURL: ' + savedOpenURL);

	// Main Menu
	logDevelopment('> Main Menu: ');
	// Iterate through all submenu items of the 'Main' menu
	for (const item of appMenu.items[0].submenu.items) {
		if (item.type === 'checkbox') {
			const checked = storeSession.get(item.label);
			item.checked = checked;
			logDevelopment(' > ' + item.label + ': ' + checked);
		}
	}


	// Resize Menu
	logDevelopment('> Resize Menu: ');

	// Resize Menu: Default Size
	const checked = storeSession.get('Resize.' + appMenu.items[2].submenu.items[0].label, appMenu.items[2].submenu.items[0].checked);
	appMenu.items[2].submenu.items[0].checked = checked;
	logDevelopment('   > ' + appMenu.items[2].submenu.items[0].label + ': ' + appMenu.items[2].submenu.items[0].checked);

	// Resize Menu: Portrait
	logDevelopment('   > Portrait: ');
	// Iterate through all submenu items of the 'Resize > Portrait' menu
	for (const item of appMenu.items[2].submenu.items[1].submenu.items) {
		if (item.type === 'checkbox') {
			const checked = storeSession.get('Resize.Portrait.' + item.label);
			item.checked = checked;
			logDevelopment('     > ' + item.label + ': ' + item.checked);
		}
	}

	// Resize Menu: Landscape
	logDevelopment('   > Landscape: ');
	// Iterate through all submenu items of the 'Resize > Landscape' menu
	for (const item of appMenu.items[2].submenu.items[2].submenu.items) {
		if (item.type === 'checkbox') {
			const checked = storeSession.get('Resize.Landscape.' + item.label);
			item.checked = checked;
			logDevelopment('     > ' + item.label + ': ' + item.checked);
		}
	}	
}

// Save application session settings so that it can be restored on next execution
function saveSession() {

	logDevelopment('Saving session settings...\n');

	// Window options
	const windowBounds = mainWindow.getBounds();
	const windowOptions = {
		x: windowBounds.x,
		y: windowBounds.y,
		width: windowBounds.width,
		height: windowBounds.height,
		maximizable: windowBounds.maximizable,
		resizable: mainWindow.resizable,
		alwaysOnTop: mainWindow.isAlwaysOnTop(),
		show: mainWindow.isVisible()
	};
	storeSession.set('windowOptions', windowOptions);
	logDevelopment('< Window options: ');
	for (const key in windowBounds) {
		logDevelopment(' < ' + key + ': ' + windowBounds[key]);
	}
	// Window opened URL
	storeSession.set('OpenURL', mainWindow.webContents.getURL());
	logDevelopment('< openURL: ' + mainWindow.webContents.getURL());

	// Main Menu
	logDevelopment('< Main Menu: ');
	// Iterate through all submenu items of the 'Main' menu
	for (const item of appMenu.items[0].submenu.items) {
		if (item.type === 'checkbox') {
			logDevelopment(' < ' + item.label + ': ' + item.checked);
			storeSession.set(item.label, item.checked);
		}
	}

	// Resize Menu
	logDevelopment('< Resize Menu: ');

	// Resize Menu: Default Size
	storeSession.set('Resize.' + appMenu.items[2].submenu.items[0].label, appMenu.items[2].submenu.items[0].checked);
	logDevelopment('   < ' + appMenu.items[2].submenu.items[0].label + ': ' + appMenu.items[2].submenu.items[0].checked);

	// Resize Menu: Portrait
	logDevelopment('   < Portrait: ');
	// Iterate through all submenu items of the 'Resize > Portrait' menu
	for (const item of appMenu.items[2].submenu.items[1].submenu.items) {
		if (item.type === 'checkbox') {
			logDevelopment('     < ' + item.label + ': ' + item.checked);
			storeSession.set('Resize.Portrait.' + item.label, item.checked);
		}
	}

	// Resize Menu: Landscape
	logDevelopment('  < Landscape: ');
	// Iterate through all submenu items of the 'Resize > Landscape' menu
	for (const item of appMenu.items[2].submenu.items[2].submenu.items) {
		if (item.type === 'checkbox') {
			logDevelopment('     < ' + item.label + ': ' + item.checked);
			storeSession.set('Resize.Landscape.' + item.label, item.checked);
		}
	}
}

// --- Main Code Blocks

function createWindow() {

    if (process.argv[2] === '--enable-logging') {
		isDevelopment = true;
		logDevelopment('Starting debug...\n');
	}

	loadSession(); // load past application session if available

	// Create the browser window.
	mainWindow = new BrowserWindow(windowOptions);

	// Enable 'Auto-Hide Menu Bar' menu item accordingly
	if (appMenu.items[0].submenu.items[5].checked) {
		mainWindow.setAutoHideMenuBar(appMenu.items[0].submenu.items[5].checked);
		mainWindow.setMenuBarVisibility(!appMenu.items[0].submenu.items[5].checked);
	}

	// re-set contextMenu to reflect windowOptions.show
	contextMenu.items[0].checked = windowOptions.show;

	openURL = savedOpenURL ? savedOpenURL : homePageURL;
	mainWindow.loadURL(openURL, browserOptions);

	tray = new Tray(path.join(__dirname, 'assets/icons/png/32x32.png'));

	tray.setToolTip(appName + ' - Mobile Browser for the Desktop');
	tray.setContextMenu(contextMenu);

	tray.on('click', function () {
		if (mainWindow === null) {
			mainWindow.createWindow();
		}
	});

	tray.on('double-click', function () {
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

	mainWindow.on('show', function () {
		mainWindow.setAlwaysOnTop(appMenu.items[0].submenu.items[0].checked); // contextMenu Item 'On Top'
		contextMenu.items[1].checked = appMenu.items[0].submenu.items[0].checked;
		mainWindow.on('close', onBeforeUnload);
	});

	mainWindow.on('page-title-updated', function (event) {
		event.preventDefault();
		mainWindow.setTitle(appName + ' - ' + mainWindow.webContents.getTitle());
		tray.setToolTip(appName + ' - ' + mainWindow.webContents.getTitle());
		tray.setContextMenu(contextMenu);
	});
	/*
  mainWindow.webContents.on('did-finish-load', function () {
	mainWindow.setTitle(appName + ' - ' +  mainWindow.webContents.getTitle());
  });
  */
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

	mainWindow.webContents.on('new-window', (event, url) => {
		event.preventDefault(); // Prevent the default behavior
		mainWindow.loadURL(url); // Load the URL in the main window
	});

	// This is only used to test if the application executes cleanly
	// It uses the parameter --test, and if the application starts 
	// without any problem, it will immediatly exit.
	if (process.argv[2] === '--test') {
		if (mainWindow) {
			mainWindow.destroy(); // Close the window
		}
		isDevelopment = true;
		logDevelopment('OpenURL: %s\n\r', openURL);
		logDevelopment('Application Execution Test: Ok\n\r');
		app.quit();
	} else {
		if (windowOptions.show) mainWindow.show();
	}
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
