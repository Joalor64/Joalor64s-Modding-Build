// electron/window.js - the main game window.
const { app, BrowserWindow, dialog, shell } = require("electron");
const path = require("path");
const { machineIdSync } = require("node-machine-id");

const SRC_DIR = path.join(__dirname, "..");

let mainWindow = null;

let langJSON = {
    txt: { quitAppConfirm: "Do you really want to quit Incredibox?" },
    bt: { quit: "Quit", cancel: "Cancel" }
};

/** Only these URL schemes may be handed to the OS (shell.openExternal). */
function isSafeExternalURL(url) {
    try {
        return ["http:", "https:", "mailto:"].includes(new URL(url).protocol);
    } catch (e) {
        return false;
    }
}

/**
 * Links must never open inside the app: child windows inherit the preload (window.electron),
 * so a web page opened with window.open() would get access to the IPC bridge.
 * window.open / target="_blank" -> system browser, and the window may only navigate between local files.
 */
function lockDownNavigation(win) {
    win.webContents.setWindowOpenHandler(({ url }) => {
        if (isSafeExternalURL(url)) shell.openExternal(url);
        return { action: "deny" };
    });
    win.webContents.on("will-navigate", (e, url) => {
        if (url.startsWith("file:")) return;
        e.preventDefault();
        if (isSafeExternalURL(url)) shell.openExternal(url);
    });
}

function getMainWindow() {
    return mainWindow;
}

function setLang(json) {
    langJSON = json;
}

/** Values the preload script exposes to the page as window.electron.vars. */
function initGlobalVars() {
    process.env.IS_FULLSCREENABLE = mainWindow ? mainWindow.isFullScreenable().toString() : "true";
    process.env.IS_MINIMIZABLE = mainWindow ? mainWindow.isMinimizable().toString() : "true";
    process.env.LANG = app.getLocale();
    process.env.UUID = machineIdSync({ original: true });
    process.env.ARG = app.commandLine.getSwitchValue("arg") || "";
}

/**
 * Opens the game window. Only one is open at a time: when a window already exists it is replaced
 * (the new one keeps its size/fullscreen state and the old one closes once the new one is ready).
 *
 * @param opts.file       page to load (default: src/index.html)
 * @param opts.partition  Electron session partition. Mods opened from the launcher each get their own
 *                        ("persist:mod-..."), so their localStorage/IndexedDB (saves, achievements,
 *                        settings...) are separate from every other mod and from the launcher.
 *                        Leave it out for the default session (the launcher and this build itself).
 */
function createWindow(opts = {}) {
    const previous = mainWindow && !mainWindow.isDestroyed() ? mainWindow : null;
    const wasFullScreen = previous ? previous.isFullScreen() : true;

    const win = new BrowserWindow({
        title: "Incredibox",
        width: 1500,
        height: 900,
        minWidth: 500,
        minHeight: 300,
        titleBarStyle: "hidden",
        backgroundColor: "#000000",
        show: false,
        fullscreen: wasFullScreen,
        autoHideMenuBar: true,
        webPreferences: {
            devTools: true,
            nodeIntegration: false,
            preload: path.join(SRC_DIR, "elec-preload.js"),
            webviewTag: true,
            autoplayPolicy: "no-user-gesture-required",
            partition: opts.partition || undefined
        }
    });
    win.modPartition = opts.partition || null;
    if (previous && !wasFullScreen) {
        win.setBounds(previous.getBounds());
        if (previous.isMaximized()) win.maximize();
    }

    mainWindow = win;
    initGlobalVars();
    lockDownNavigation(win);
    win.loadFile(opts.file || path.join(SRC_DIR, "index.html"));

    win.on("close", e => {
        if (app.quitting) return;
        e.preventDefault();
        if (process.platform === "darwin") {
            dialog.showMessageBox(win, {
                type: "question",
                title: "Confirm",
                buttons: [langJSON.bt.quit, langJSON.bt.cancel],
                cancelId: 1,
                defaultId: 0,
                message: langJSON.txt.quitAppConfirm
            }).then(result => {
                if (result.response === 0) {
                    win.destroy();
                    app.quit();
                }
            }).catch(() => { });
        } else {
            win.destroy();
            app.quit();
        }
    });

    let shown = false;
    const show = () => {
        if (shown || win.isDestroyed()) return;
        shown = true;
        win.show();
        win.focus();
        if (previous && !previous.isDestroyed()) previous.destroy();
    };
    win.once("ready-to-show", show);
    win.webContents.once("did-fail-load", show);
    setTimeout(show, 5000);

    win.on("closed", () => {
        if (mainWindow === win) mainWindow = null;
    });
    return win;
}

/** Ctrl/Cmd + Shift + I toggles the dev tools. */
function toggleDevTools() {
    if (mainWindow && !mainWindow.isDestroyed()) {
        if (mainWindow.webContents.isDevToolsOpened()) {
            mainWindow.webContents.closeDevTools();
        } else {
            mainWindow.webContents.openDevTools({ mode: "detach" });
        }
    }
}

module.exports = { SRC_DIR, createWindow, getMainWindow, setLang, toggleDevTools, isSafeExternalURL };
