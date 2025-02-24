const { contextBridge, ipcRenderer } = require("electron");
const { IPC_CHANNELS } = require("./modules/stringConstants");
const fs = require("fs");
const path = require("path");

async function readFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, "utf-8", (err, data) => {
            if (err) {
                console.error(err);
                return reject(err);
            }
            
            // Split data by lines and parse each line
            let arrayData = data.split("\r\n");
            let parsedData = [];

            arrayData.forEach(line => {
                let pair = line.split(",");
                let pairObj = {
                    Q: pair[0]?.trim(),
                    A: pair[1]?.trim(),
                    label: pair[2]?.trim() || "",
                };

                parsedData.push(pairObj);
            });

            resolve(parsedData);  // Send the parsed data back
        });
    })
}

contextBridge.exposeInMainWorld("myApi", {
    send: (channel, data) => ipcRenderer.send(channel, data),
    receive: (channel, callback) => ipcRenderer.on(channel, (event, ...args) => callback(...args)),
    startSession: (args) => {
        ipcRenderer.send(IPC_CHANNELS.START_SESSION, args);
    },
    selectFile: async () => {
        const filePaths = await ipcRenderer.invoke("dialog:openFile");
        let pathToReturn;

        if (filePaths && filePaths.length) {
            pathToReturn = filePaths[0];
        }

        return pathToReturn;
    },
    readFile: (filePath) => readFile(filePath),
    saveSelectedFileDirectory: (value) => {
        localStorage.setItem('directoryPath', value);
    },
    getFilesToLoad: async (directoryPath) => {
        return new Promise((resolve, reject) => {
            fs.readdir(directoryPath, async (err, files) => {
                if (err) {
                    console.error(err);
                    return reject(err);
                }

                console.log("files: ", files);
                // Filter and display only CSV files
                const csvFiles = files.filter(file => file.endsWith(".csv"));
                
                // Loop through all the files and directories
                resolve(csvFiles);
            });
        });
    },
    getFormattedPath: (directory, filename) => {
        return path.join(directory, filename);
    },
    getSelectedFileDirectory: () => {
        let directoryPath = localStorage.getItem('directoryPath');
        return directoryPath;
    }
});