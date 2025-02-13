const { app, BrowserWindow, ipcMain, dialog  } = require("electron");
const url = require("url");
const path = require("path");
const ejse = require("ejs-electron");

// imports
const { WINDOWS, IPC_CHANNELS } = require("./modules/stringConstants");


// windows
let welcomeWindow,
    mainWindow;

app.on("ready", () => {
    createWindows(WINDOWS.WELCOME_WINDOW);
})

function createWindows(windowName, args) {
    switch(windowName) {
        case WINDOWS.WELCOME_WINDOW:
            if (welcomeWindow != null) {
                proceedToWindow(windowName, args);
            } else {
                welcomeWindow = new BrowserWindow({
                    title: "Welcome",
                    webPreferences: {
                        preload: path.join(__dirname, 'preload.js'),
                        nodeIntegration: false, // Keep this as false for security
                        contextIsolation: true,
                        sandbox: false,
                    },
                    height: 800,
                    width: 600,
                    resizable: false,
                    autoHideMenuBar: true,
                    center: true,
                });

                // load html
                welcomeWindow.loadURL(
                    url.format({
                        pathname: path.join(__dirname, "./views/welcome.ejs"),
                        protocol: "file",
                        slashes: true,
                    })
                )

                // show window
                welcomeWindow.on("ready-to-show", () => {
                    proceedToWindow(windowName, args);
                });
            }
            break;
        case WINDOWS.MAIN_WINDOW:
            if (mainWindow != null) {
                proceedToWindow(windowName, args);
            } else {
                mainWindow = new BrowserWindow({
                    title: "Study Companion",
                    webPreferences: {
                        preload: path.join(__dirname, 'preload.js'),
                        nodeIntegration: false, // Keep this as false for security
                        contextIsolation: true,
                        sandbox: false,
                    },
                    height: 600,
                    width: 800,
                    resizable: false,
                    autoHideMenuBar: true,
                    center: true,
                });

                // load html
                mainWindow.loadURL(
                    url.format({
                        pathname: path.join(__dirname, "./views/index.ejs"),
                        protocol: "file",
                        slashes: true,
                    })
                )

                // show window
                mainWindow.on("ready-to-show", () => {
                    proceedToWindow(windowName, args);
                });
            }
            break;
        default:
            console.log("[createWindow] Invalid window");
    }
}

function proceedToWindow(windowName, args) {
    console.log("opening window", { windowName });
    switch(windowName) {
        case WINDOWS.WELCOME_WINDOW:
            welcomeWindow.show();
            if (args != null) {
                welcomeWindow.webContents.send()
            }
            break;
        case WINDOWS.MAIN_WINDOW:
            mainWindow.show();
            if (args != null) {
                mainWindow.webContents.send()
            }
            break;
        default:
            console.log("[proceedToWindow] Invalid window");
    }
}

function openWindow(windowName, args) {
    createWindows(windowName, args);
}

function closeWindow(windowName) {
    switch(windowName) {
        case WINDOWS.WELCOME_WINDOW:
            welcomeWindow.close();
            break;
        case WINDOWS.MAIN_WINDOW:
            mainWindow.close();
            break;
        default:
            console.log("[closeWindow] Invalid window");
    }
}

ipcMain.on(IPC_CHANNELS.START_SESSION, (e, args) => {
    closeWindow(WINDOWS.WELCOME_WINDOW);
    openWindow(WINDOWS.MAIN_WINDOW);
})

ipcMain.handle("dialog:openFile", async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ["openDirectory"],
    });
    return result.filePaths;
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});