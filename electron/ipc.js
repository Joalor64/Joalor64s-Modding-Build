// electron/ipc.js - messages from the page (window.electron.ipc.* in elec-preload.js) about the window itself.
const { ipcMain, clipboard, shell } = require("electron");
const { getMainWindow, setLang, isSafeExternalURL } = require("./window");

function initIPC() {
    ipcMain.handle("clipboard", (e, text) => new Promise((resolve, reject) => {
        clipboard.writeText(text);
        if (clipboard.readText() === text) {
            resolve();
        } else {
            reject("clipboard bug");
        }
    }));

    ipcMain.on("isFullScreen", e => {
        const win = getMainWindow();
        e.returnValue = !!win && win.isFullScreen();
    });

    ipcMain.on("close", () => getMainWindow()?.close());
    ipcMain.on("enterFullScreen", () => getMainWindow()?.setFullScreen(true));
    ipcMain.on("leaveFullScreen", () => getMainWindow()?.setFullScreen(false));
    ipcMain.on("refresh", () => getMainWindow()?.reload());
    ipcMain.on("loadLang", (e, json) => setLang(json));
    ipcMain.on("openURL", (e, url) => {
        if (isSafeExternalURL(url)) shell.openExternal(url);
        else console.warn("openURL blocked:", url);
    });

    ipcMain.on("minimize", () => {
        const win = getMainWindow();
        if (!win) return;
        if (win.isFullScreen()) {
            win.once("leave-full-screen", () => getMainWindow()?.minimize());
            win.setFullScreen(false);
        } else {
            win.minimize();
        }
    });
}

module.exports = { initIPC };
