'use strict';
const pkg = require('./package.json');

const electron = require('electron');   // Electron modules
const clipboard = electron.clipboard;   // Control clipboard
const app = electron.app;               // Control application life
const Menu = electron.Menu;             // Instantite menus
const Tray = electron.Tray;             // Controll system tray
const shell = electron.shell;           // Open external browsers etc.

let appIcon = null;
let remain = true;
let spotifyUrl = 'https://play.spotify.com';

const BrowserWindow = electron.BrowserWindow;   // Module to create native browser window.

let mainWindow;                                 // Avoid GC of window object

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
    mainWindow.on('closed', function() {        // When actually closed (remain==false)
        mainWindow = null;
    });
    var menu = Menu.buildFromTemplate([
        {   label: 'File',
            submenu: [
                {   label: 'Open Url from Clipboard',
                    accelerator: 'CmdOrCtrl+O',
                    
                    click: function() {
                        var paste = clipboard.readText();
                        if (paste.slice(0, spotifyUrl.length)==spotifyUrl) {
                            var res = mainWindow.loadURL(paste);
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
                    accelerator: (function() {
                        if (process.platform == 'darwin') {
                            return 'Ctrl+Command+F';
                        } else {
                            return 'F11';
                        }
                    })(),
                    click: function(item, focusedWindow) {
                        if (focusedWindow) {
                            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
                        }
                    }
                },
                {   label: 'Toggle Developer Tools',
                    accelerator: (function() {
                        if (process.platform == 'darwin') {
                            return 'Alt+Command+I';
                        } else {
                            return 'Ctrl+Shift+I';
                        }
                    })(),
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
    mainWindow.webContents.openDevTools();  // Won't start rendering...
    mainWindow.webContents.closeDevTools(); // ... unless this is done.
}

app.on('ready', function() {
    createMainWindow();
    appIcon = new Tray(__dirname+'/icon128.png');
    var contextMenu = Menu.buildFromTemplate([
        {   label: 'Quit',
            accelerator: 'CmdOrCtrl+q',
            click: function() {
                remain = false;
                app.quit();
            }
        },
    ]);
    appIcon.setContextMenu(contextMenu);
    appIcon.setToolTip('All right stop, collaborate and listen...');
    appIcon.on('click', function(evt) {
        mainWindow
        if (mainWindow.isVisible()) {
            mainWindow.hide();
        } else {
            mainWindow.show();
        }
    })
});

app.on('window-all-closed', function () {   // Quit when all windows are closed.
    if (process.platform !== 'darwin') {    // Except on OS X
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {  // OS X
        createMainWindow();
    }
});
