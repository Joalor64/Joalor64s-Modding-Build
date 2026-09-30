const {
    machineId: machineId,
    machineIdSync: machineIdSync
} = require("node-machine-id");
const {
    clipboard: clipboard,
    ipcMain: ipcMain,
    app: app,
    BrowserWindow: BrowserWindow,
    Menu: Menu,
    dialog: dialog,
    shell: shell,
    globalShortcut: globalShortcut
} = require("electron");
const fs = require("fs");
const path = require("path");
const {
    pathToFileURL
} = require("url");
const crypto = require("crypto");
const AdmZip = require("adm-zip");
let mainWindow;
let menu;
var langJSON = {
    txt: {
        quitAppConfirm: "Do you really want to quit Incredibox?"
    },
    bt: {
        quit: "Quit",
        cancel: "Cancel"
    }
};

function createWindow() {
    mainWindow = new BrowserWindow({
        title: "Incredibox",
        width: 1500,
        height: 900,
        minWidth: 500,
        minHeight: 300,
        titleBarStyle: "hidden",
        backgroundColor: "#000000",
        show: false,
        fullscreen: true,
        autoHideMenuBar: true,
        webPreferences: {
            devTools: true,
            enableRemoteModule: true,
            nodeIntegration: false,
            preload: path.join(__dirname, "elec-preload.js"),
            webviewTag: true,
            additionalArguments: ['--disable-site-isolation-trials'],
            autoplayPolicy: 'no-user-gesture-required'
        }
    });
    initGlobalVars();
    mainWindow.loadFile(path.join(__dirname, "index.html"));
    mainWindow.on("close", e => {
        if (!app.quitting) {
            e.preventDefault();
            if (process.platform === "darwin") {
                dialog.showMessageBox(mainWindow, {
                    type: "question",
                    title: "Confirm",
                    buttons: [langJSON.bt.quit, langJSON.bt.cancel],
                    cancelId: 1,
                    defaultId: 0,
                    message: langJSON.txt.quitAppConfirm
                }).then(e => {
                    if (e.response === 0) {
                        mainWindow.destroy();
                        app.quit();
                    }
                }).catch(e => { });
            } else {
                mainWindow.destroy();
                app.quit();
            }
        }
    });
    mainWindow.once("ready-to-show", () => {
        if (mainWindow != null) {
            mainWindow.show();
        }
    });
    mainWindow.on("closed", function () {
        mainWindow = null;
    });
}
function initGlobalVars() {
    if (mainWindow) {
        process.env.IS_FULLSCREENABLE = mainWindow.isFullScreenable().toString();
        process.env.IS_MINIMIZABLE = mainWindow.isMinimizable().toString();
    } else {
        process.env.IS_FULLSCREENABLE = "true";
        process.env.IS_MINIMIZABLE = "true";
    }
    process.env.LANG = app.getLocale();
    process.env.UUID = machineIdSync({
        original: true
    });
    process.env.ARG = app.commandLine.getSwitchValue("arg") || "";
}
function initIPC() {
    ipcMain.handle("clipboard", (e, n) => new Promise((e, i) => {
        clipboard.writeText(n);
        if (clipboard.readText() === n) {
            e();
        } else {
            i("clipboard bug");
        }
    }));
    ipcMain.on("isFullScreen", e => {
        e.returnValue = !!mainWindow && mainWindow.isFullScreen();
    });
    ipcMain.on("close", () => {
        if (mainWindow) {
            mainWindow.close();
        }
    });
    ipcMain.on("enterFullScreen", () => {
        if (mainWindow) {
            mainWindow.setFullScreen(true);
        }
    });
    ipcMain.on("leaveFullScreen", () => {
        if (mainWindow) {
            mainWindow.setFullScreen(false);
        }
    });
    ipcMain.on("loadLang", (e, n) => {
        langJSON = n;
    });
    ipcMain.on("openURL", (e, n) => {
        require("electron").shell.openExternal(n);
    });
    ipcMain.on("minimize", () => {
        if (mainWindow) {
            if (mainWindow.isFullScreen()) {
                mainWindow.once("leave-full-screen", () => {
                    if (mainWindow) {
                        mainWindow.minimize();
                    }
                });
                mainWindow.setFullScreen(false);
            } else {
                mainWindow.minimize();
            }
        }
    });
    ipcMain.on("refresh", () => {
        if (mainWindow) {
            mainWindow.reload();
        }
    });
}
ipcMain.handle("pick-mod-folder", async () => {
    const win = BrowserWindow.getFocusedWindow();
    if (!win) return null;

    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
        title: "Select Mod Folder",
        properties: ["openDirectory"]
    });

    if (canceled || !filePaths || filePaths.length === 0) {
        return null;
    }

    return filePaths[0];
});

ipcMain.handle("pick-mod-zip", async () => {
    const win = BrowserWindow.getFocusedWindow();
    if (!win) return null;

    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
        title: "Select Mod Zip File",
        properties: ["openFile"],
        filters: [{ name: "Zip Files", extensions: ["zip"] }]
    });

    if (canceled || !filePaths || filePaths.length === 0) {
        return null;
    }

    const selectedPath = filePaths[0];

    if (selectedPath.endsWith('.zip')) {
        const installedModPath = await installModFromZip(selectedPath);
        return installedModPath;
    }

    return null;
});
async function extractModFromZip(zipPath) {
    try {
        const zip = new AdmZip(zipPath);
        const zipEntries = zip.getEntries();

        let rootFolder = "";
        const folderMap = new Map();

        zipEntries.forEach(entry => {
            const parts = entry.entryName.split('/');
            if (parts.length > 1 && !entry.isDirectory) {
                const root = parts[0];
                if (!folderMap.has(root)) {
                    folderMap.set(root, []);
                }
                folderMap.get(root).push(entry);
            }
        });

        if (folderMap.size === 1) {
            rootFolder = Array.from(folderMap.keys())[0];
        }

        const tempFolder = path.join(app.getPath('temp'), 'incredibox-mod-extract', Date.now().toString());
        fs.mkdirSync(tempFolder, { recursive: true });

        zip.extractAllTo(tempFolder, true);

        let modFolder = tempFolder;
        if (rootFolder) {
            const possibleModFolder = path.join(tempFolder, rootFolder);
            if (fs.existsSync(possibleModFolder)) {
                modFolder = possibleModFolder;
            }
        }

        const hasModJson = fs.existsSync(path.join(modFolder, 'mod.json'));
        const hasSrcIndex = fs.existsSync(path.join(modFolder, 'src', 'index.html'));

        if (!hasModJson && !hasSrcIndex) {
            fs.rmSync(tempFolder, { recursive: true, force: true });
            return null;
        }

        return {
            tempFolder: tempFolder,
            modFolder: modFolder,
            originalZip: zipPath
        };
    } catch (error) {
        console.error("Error extracting zip:", error);
        return null;
    }
}

async function installModFromZip(zipPath) {
    const extracted = await extractModFromZip(zipPath);
    if (!extracted) {
        return null;
    }

    try {
        const metadata = await loadModMetadata(extracted.modFolder);
        if (!metadata) {
            fs.rmSync(extracted.tempFolder, { recursive: true, force: true });
            return null;
        }

        const modsFolder = path.join(process.resourcesPath, "mods");
        const modId = crypto.randomUUID();
        const finalModFolder = path.join(modsFolder, modId);

        fs.mkdirSync(modsFolder, { recursive: true });

        if (fs.existsSync(finalModFolder)) {
            fs.rmSync(finalModFolder, { recursive: true, force: true });
        }

        fs.renameSync(extracted.modFolder, finalModFolder);

        metadata.path = finalModFolder;
        metadata.id = modId;

        try {
            fs.rmSync(path.dirname(extracted.tempFolder), { recursive: true, force: true });
        } catch (cleanupError) {
            console.warn("Could not clean up temp folder:", cleanupError);
        }

        return finalModFolder;
    } catch (error) {
        console.error("Error installing mod from zip:", error);
        if (extracted.tempFolder) {
            try {
                fs.rmSync(extracted.tempFolder, { recursive: true, force: true });
            } catch (cleanupError) {
                console.warn("Could not clean up temp folder after error:", cleanupError);
            }
        }
        return null;
    }
}
async function loadModMetadata(modFolder) {
    const modJsonPath = path.join(modFolder, "mod.json");

    if (fs.existsSync(modJsonPath)) {
        try {
            const modData = JSON.parse(fs.readFileSync(modJsonPath, "utf8"));

            const metadata = {
                title: modData.name || "Unknown Mod",
                author: modData.author || "Unknown Developer",
                version: modData.version || "1.0.0",
                RMBVersion: modData.RMBVersion || "6.8.7",
                description: modData.description || "No description provided.",
                modLink: modData.modLink || "",
                borderColor: modData.borderColor || "#919191",
                icon: null,
                background: null,
                startupAnim: modData.startupAnim || "",
                startupSound: modData.startupSound || "",
                path: modFolder,
                id: modData.name || "Unknown Mod"
            };

            if (modData.icon) {
                const iconPath = path.join(modFolder, modData.icon);
                metadata.icon = fs.existsSync(iconPath)
                    ? `file://${path.resolve(iconPath)}`
                    : `file://${path.resolve(__dirname, "img/mod-icon.png")}`;
            } else {
                metadata.icon = `file://${path.resolve(__dirname, "img/mod-icon.png")}`;
            }

            if (modData.banner) {
                const bannerPath = path.join(modFolder, modData.banner);
                metadata.background = fs.existsSync(bannerPath)
                    ? pathToFileURL(bannerPath).href
                    : pathToFileURL(path.join(__dirname, "img/mod-background.png")).href;
            } else {
                metadata.background = pathToFileURL(path.join(__dirname, "img/mod-background.png")).href;
            }

            return metadata;
        } catch (error) {
            console.error("Error parsing mod.json:", error);
            return null;
        }
    }
}
ipcMain.handle("load-mod-metadata", async (event, modPath) => {
    return await loadModMetadata(modPath);
});
ipcMain.handle("getModPath", (event, modName) => {
    const modFolder = path.join(process.resourcesPath, "mods", modName);
    if (fs.existsSync(modFolder)) {
        return modFolder;
    }
    return null;
});
ipcMain.handle("openModHTML", (event, modFolder) => {
    const indexPath = path.join(modFolder, "src", "index.html");
    if (!fs.existsSync(indexPath)) {
        return false;
    }
    if (mainWindow) {
        mainWindow.loadFile(indexPath);
        mainWindow.show();
    }
    return true;
});
ipcMain.on("returnToLauncher", () => {
    if (!mainWindow) {
        return;
    }
    const launcherPath = path.join(__dirname, "mod-launcher/index.html");
    mainWindow.loadFile(launcherPath);
});
function buildMenu() {
    menu = Menu.buildFromTemplate(myMenu);
    Menu.setApplicationMenu(menu);
}

app.name = "Incredibox";
app.on("ready", () => {
    createWindow();
    initIPC();
    buildMenu();
    globalShortcut.register("CommandOrControl+Shift+I", () => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            if (mainWindow.webContents.isDevToolsOpened()) {
                mainWindow.webContents.closeDevTools();
            } else {
                mainWindow.webContents.openDevTools({ mode: 'detach' });
            }
        }
    });
});
app.on("activate", function () {
    if (mainWindow === null) {
        createWindow();
    } else {
        mainWindow.show();
    }
});
app.on("before-quit", () => {
    app.quitting = true;
});
app.on("will-quit", () => {
    globalShortcut.unregisterAll();
});
app.on("window-all-closed", function () {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
const myMenu = [
    {
        role: "window",
        submenu: [
            { role: "zoom" },
            { role: "togglefullscreen" },
            { type: "separator" },
            { role: "minimize" },
            { role: "close" },
        ],
    },
    {
        label: "View",
        submenu: [
            { role: "reload", accelerator: "CmdOrCtrl+R" },
            { role: "forceReload" },
            { type: "separator" },
            { role: "resetZoom", accelerator: "CmdOrCtrl+0" },
            { role: "zoomIn", accelerator: "CmdOrCtrl+=" },
            { role: "zoomOut", accelerator: "CmdOrCtrl+-" }
        ]
    },
    {
        label: "Edit",
        submenu: [
            { role: "undo" },
            { role: "redo" },
            { type: "separator" },
            { role: "cut" },
            { role: "copy" },
            { role: "paste" },
            { role: "delete" },
            { role: "selectall" },
        ],
    },
];

if (process.platform === "darwin") {
    myMenu.unshift({
        label: app.name,
        submenu: [
            { role: "about" },
            { type: "separator" },
            { role: "hide" },
            { role: "hideothers" },
            { role: "unhide" },
            { type: "separator" },
            { role: "quit" },
        ],
    });
}
app.whenReady().then(() => {
    require(path.join(__dirname, "js", "libs", "dscrpc.js"));
});