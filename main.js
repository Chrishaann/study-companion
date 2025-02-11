const { app, BrowserWindow } = require("electron");
const url = require("url");
const path = require("path");
const ejse = require("ejs-electron");

// imports
const { WINDOWS } = require("./modules/stringConstants");


// windows
let welcomeWindow;

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
                        nodeIntegration: true,
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
                        pathname: path.join(__dirname, "./views/index.ejs"),
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
        default:
            console.log("Invalid window");
    }
}

function proceedToWindow(windowName, args) {
    switch(windowName) {
        case WINDOWS.WELCOME_WINDOW:
            welcomeWindow.show();
            if (args != null) {
                welcomeWindow.webContents.send()
            }
            break;
        default:
            console.log("Invalid window");
    }
}
