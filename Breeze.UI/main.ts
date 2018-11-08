const electron = require('electron');
import "isomorphic-fetch";

// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;
const nativeImage = require('electron').nativeImage

const path = require('path');
const url = require('url');
const os = require('os');

let serve;
let testnet;
const args = process.argv.slice(1);
serve = args.some(val => val === "--serve" || val === "-serve");
testnet = args.some(val => val === "--testnet" || val === "-testnet");

if (args.some(val => val === "--mainnet" || val === "-mainnet")) {
  testnet = false;
}

if (serve) {
  require('electron-reload')(__dirname, {
    electron: require('${__dirname}/../../node_modules/electron')
  });
}

require('electron-context-menu')({
  showInspectElement: serve
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow = null;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 650,
    frame: true,
    minWidth: 1200,
    minHeight: 650,
    title: "Breeze Wallet"
  });

   // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, '/index.html'),
    protocol: 'file:',
    slashes: true
  }));

  if (serve) {
    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  // Emitted when the window is going to close.
  mainWindow.on('close', function () {
  })
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function () {
  if (serve) {
    console.log("Breeze UI was started in development mode. This requires the user to be running the Breeze Daemon himself.")
  }
  else {
    startDeStreamApi();
  }
  createTray();
  createWindow();
  if (os.platform() === 'darwin'){
    createMenu();
  }
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
      fetch('http://localhost:56864/api/node/shutdown', {
          method: 'POST',
          headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
          }
      })
          .then(response => app.quit())
          .catch(error => setTimeout(() => app.quit(), 5000));      
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

function startDeStreamApi() {
  var destreamProcess;
  const spawnDeStream = require('child_process').spawn;

  //Start Breeze DeStream Daemon
  let apiPath = path.resolve(__dirname, 'assets//daemon//DeStream.DeStreamD');
  if (os.platform() === 'win32') {
    apiPath = path.resolve(__dirname, '..\\..\\resources\\daemon\\DeStream.DeStreamD.exe');
  } else if(os.platform() === 'linux') {
	  apiPath = path.resolve(__dirname, '..//..//resources//daemon//DeStream.DeStreamD');
  } else {
	  apiPath = path.resolve(__dirname, '..//..//resources//daemon//DeStream.DeStreamD');
  }

  if (!testnet) {
    destreamProcess = spawnDeStream(apiPath, ['destream'], {
      detached: false
    });
  } else if (testnet) {
    destreamProcess = spawnDeStream(apiPath, ['destream', '-testnet'], {
      detached: false
    });
  }
  destreamProcess.stdout.on('data', (data) => {
    writeLog(`DeStream: ${data}`);
  });
}

function createTray() {
  //Put the app in system tray
  const Menu = electron.Menu;
  const Tray = electron.Tray;

  let trayIcon;
  if (serve) {
    trayIcon = nativeImage.createFromPath('./src/assets/images/breeze-logo-tray.png');
  } else {
    trayIcon = nativeImage.createFromPath(path.resolve(__dirname, '../../resources/src/assets/images/breeze-logo-tray.png'));
  }

  let systemTray = new Tray(trayIcon);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Hide/Show',
      click: function() {
        mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
      }
    },
    {
      label: 'Exit',
      click: function() {
        app.quit();
      }
    }
  ]);
  systemTray.setToolTip('Breeze Wallet');
  systemTray.setContextMenu(contextMenu);
  systemTray.on('click', function() {
    if (!mainWindow.isVisible()) {
      mainWindow.show();
    }

    if (!mainWindow.isFocused()) {
      mainWindow.focus();
    }
  });

  app.on('window-all-closed', function () {
    if (systemTray) systemTray.destroy();
  });
};

function writeLog(msg) {
  console.log(msg);
};

function createMenu() {
  const Menu = electron.Menu;

  // Create the Application's main menu
  var menuTemplate = [{
    label: "Application",
    submenu: [
        { label: "About Application", selector: "orderFrontStandardAboutPanel:" },
        { type: "separator" },
        { label: "Quit", accelerator: "Command+Q", click: function() { app.quit(); }}
    ]}, {
    label: "Edit",
    submenu: [
        { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
        { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
        { type: "separator" },
        { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
        { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
        { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
        { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
    ]}
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
};
