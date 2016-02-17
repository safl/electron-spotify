'use strict';
const pkg = require('./package.json');

const electron = require('electron');   // Electron modules
const clipboard = electron.clipboard;   // Control clipboard
const app = electron.app;               // Control application life
const Menu = electron.Menu;             // Instantite menus
const Tray = electron.Tray;             // Controll system tray
const shell = electron.shell;           // Open external browsers etc.

const BrowserWindow = electron.BrowserWindow;   // Module to create native browser window.
const spotifyUrl = 'https://play.spotify.com';

let mainWindow;                                 // Avoid GC of mainWindow, appIcon, and remain.
let appIcon = null;
let remain = true;

function isOSX() {
    return process.platform === 'darwin';
}

function isPrefixed(subject, prefix) {
    return subject.slice(0, prefix.length)===prefix;
}

function createMainWindow () {
    
    mainWindow = new BrowserWindow({             // Instantiate the browser window.
        width: 1024,
        height: 768,
        'web-preferences': {'plugins': true}
    }); 

    mainWindow.on('close', function(evt) {      // When closing, hide it instead
        if (remain) {
            evt.preventDefault();
            mainWindow.hide();
        }
    });
    mainWindow.on('closed', function() {        // When actually closed (remain===false)
        mainWindow = null;
    });
    var menu = Menu.buildFromTemplate([
        {   label: 'File',
            submenu: [
                {   label: 'Open Url from Clipboard',
                    accelerator: 'CmdOrCtrl+O',
                    click: function(item, focusedWindow) {
                        var paste = clipboard.readText();
                        if (isPrefixed(paste, spotifyUrl)) {
                            focusedWindow.loadURL(paste);
                        }
                    }
                },
                {   label: 'Close Window',
                    accelerator: 'CmdOrCtrl+W',
                    click: function() {
                        if (mainWindow.isVisible()) {
                            mainWindow.hide();
                        } else {
                            mainWindow.show();
                        }
                    }
                },
                {   label: 'Quit',
                    accelerator: 'CmdOrCtrl+Q',
                    click: function() {
                        remain = false;
                        app.quit();
                    }
                }
            ]
        },
        {   label: 'View',
            submenu: [
                {   label: 'Reload',
                    accelerator: 'CmdOrCtrl+R',
                    click: function(item, focusedWindow) {
                        if (focusedWindow) {
                            focusedWindow.reload();
                        }
                    }
                },
                {   label: 'Toggle Full Screen',
                    accelerator: isOSX() ? 'Ctrl+Command+F' : 'F11',
                    click: function(item, focusedWindow) {
                        if (focusedWindow) {
                            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
                        }
                    }
                },
                {   label: 'Toggle Developer Tools',
                    accelerator: isOSX() ? 'Alt+Command+I' : 'Ctrl+Shift+I',
                    click: function(item, focusedWindow) {
                        if (focusedWindow) {
                            focusedWindow.toggleDevTools();
                        }
                    }
                }
            ]
        },
        {
            label: 'Help',
            submenu: [
                 {
                    label: 'About',
                    click: function() {
                        shell.openExternal(pkg.homepage);
                    }
                }               
            ]
        }
    ]);
    Menu.setApplicationMenu(menu);          // Use the tray-menu instead of window-menu
    mainWindow.loadURL(spotifyUrl);
}

app.on('ready', function() {
    createMainWindow();
    appIcon = new Tray(__dirname+'/icon128.png');
    var contextMenu = Menu.buildFromTemplate([
        {   label: 'Current Playing'    },
        {   type: 'separator'   },
        {   label: 'Play/Pause'},
        {   label: 'Prev'},
        {   label: 'Next'},
        {   type: 'separator' },
        {   label: 'Toggle Window',
            click: function() {
                if (mainWindow.isVisible()) {
                    mainWindow.hide();
                } else {
                    mainWindow.show();
                }
            }
        },
        {   type: 'separator' },
        {   label: 'Quit',
            click: function() {
                remain = false;
                app.quit();
            }
        },
    ]);
    appIcon.setContextMenu(contextMenu);
    appIcon.setToolTip('All right stop, collaborate and listen...');
    appIcon.on('click', function(evt) {
        if (mainWindow.isVisible()) {
            mainWindow.hide();
        } else {
            mainWindow.show();
        }
    })
});

app.on('window-all-closed', function () {   // Quit when all windows are closed.
    if (!isOSX()) {                         // Except on OSX
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {              // OSX re-actives
        createMainWindow();
    }
});
