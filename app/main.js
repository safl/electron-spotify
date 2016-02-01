'use strict';

const electron = require('electron');
const app = electron.app;   // Module to control application life.

const Menu = electron.Menu;
const Tray = electron.Tray;

let appIcon = null;
let remain = true;

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
    mainWindow.loadURL('file://' + __dirname + '/index.html');

    mainWindow.webContents.openDevTools();  // Won't start rendering...
    mainWindow.webContents.closeDevTools(); // ... unless this is done.
}

app.on('ready', function() {
    createMainWindow();
    appIcon = new Tray(__dirname+'/icon128.png');
    var contextMenu = Menu.buildFromTemplate([
        { label: 'Quit', click: function() {
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
