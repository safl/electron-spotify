'use strict';
const pkg = require('./package.json');

const electron = require('electron');   // Electron modules
const clipboard = electron.clipboard;   // Control clipboard
const app = electron.app;               // Control application life
const Menu = electron.Menu;             // Instantite menus
const Tray = electron.Tray;             // Controll system tray
const shell = electron.shell;           // Open external browsers etc.
const ipcMain = electron.ipcMain;           // Communication with Spotify webview

const BrowserWindow = electron.BrowserWindow;   // Module to create native browser window.
const defaultUrl = 'https://play.spotify.com/';

let mainWindow;                                 // Avoid GC of mainWindow, appIcon, and remain.
let appIcon = null;
let remain = true;
let playerStatus = null;
let pollingPlayerStatus = false;

function isOSX() {
    return process.platform === 'darwin';
}

function isPrefixed(subject, prefix) {
    return subject.slice(0, prefix.length)===prefix;
}

function createMainWindow () {

    var menu = Menu.buildFromTemplate([
        {   label: 'File',
            submenu: [
                {   label: 'Open Url from Clipboard',
                    accelerator: 'CmdOrCtrl+O',
                    click: function(item, focusedWindow) {
                        var paste = clipboard.readText();
                        if (isPrefixed(paste, defaultUrl)) {
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
    Menu.setApplicationMenu(menu);
    
    mainWindow = new BrowserWindow({             // Instantiate the browser window.
        width: 1024,
        height: 768,
        'web-preferences': {'plugins': true},
        preload: __dirname+'/preload.js'
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

    mainWindow.loadURL(defaultUrl);

    mainWindow.webContents.on("did-stop-loading", function() {
        if (!pollingPlayerStatus) {
            pollingPlayerStatus = true;
            setInterval(function() {
                mainWindow.webContents.send('player-status');
            }, 1000);
        }
    });
};

/*
    Accesses global var: playerStatus and appIcon
*/
function updateAppIconTooltip() {
    if ((playerStatus === null) || 
        (appIcon === null) || 
        (playerStatus["track"]["name"] == "Unknown Track")) {
        return;
    }
    var artists = playerStatus["track"]["artists"];

    var tip = playerStatus["track"]["name"];    // Track name
    tip += " - ";                               // Artist
    for(var i=0; i<artists.length; ++i) {
        tip += artists[i];
        if (i<artists.length-2) {
            tip += ", ";
        }
    }                                           // Progress
    tip += " - " +
            String(playerStatus["track"]["current"]["min"]) + ":" +
            String(playerStatus["track"]["current"]["sec"]) + " / "+
            String(playerStatus["track"]["length"]["min"])  + ":" +
            String(playerStatus["track"]["length"]["sec"]);

    appIcon.setToolTip(tip);
}

function createAppIcon() {
    appIcon = new Tray(__dirname+'/icon128.png');
    var contextMenu = Menu.buildFromTemplate([
        {   label: 'Play/Pause',
            click: function() {
                mainWindow.webContents.send('player-play-toggle');
            }
        },
        {   label: 'Prev',
            click: function() {
                mainWindow.webContents.send('player-previous');
            }
        },
        {   label: 'Next',
            click: function() {
                mainWindow.webContents.send('player-next');
            }
        },
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
    appIcon.on('click', function(event) {
        if (mainWindow.isVisible()) {
            mainWindow.hide();
        } else {
            mainWindow.show();
        }
    });
};

ipcMain.on('player-status', function(event, arg) {
    playerStatus = arg;
    updateAppIconTooltip();
});

app.on('ready', function() {
    createMainWindow();
    createAppIcon();
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
