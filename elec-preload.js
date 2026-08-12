/* 1.2.8 2023-12-16 16:49:20 - Incredibox - Designed with love & passion since 2009 */
const {
    contextBridge,
    ipcRenderer
} = require("electron");
var IPCAPI = {
    process: {
        arch: process.arch,
        argv: process.argv,
        platform: process.platform,
        versions: process.versions
    },
    vars: {
        isFullScreenable: process.env.IS_FULLSCREENABLE === "true",
        isMinimizable: process.env.IS_MINIMIZABLE === "true",
        lang: process.env.LANG,
        uuid: process.env.UUID,
        arg: process.env.ARG
    },
    ipc: {
        clipboard: e => ipcRenderer.invoke("clipboard", e),
        isFullScreen: () => ipcRenderer.sendSync("isFullScreen"),
        enterFullScreen: () => ipcRenderer.send("enterFullScreen"),
        leaveFullScreen: () => ipcRenderer.send("leaveFullScreen"),
        minimize: () => ipcRenderer.send("minimize"),
        close: () => ipcRenderer.send("close"),
        loadLang: e => ipcRenderer.send("loadLang", e),
        openURL: e => ipcRenderer.send("openURL", e),
        pickModFolder: () => ipcRenderer.invoke("pick-mod-folder"),
        pickModZip: () => ipcRenderer.invoke("pick-mod-zip"),
        loadModMetadata: path => {
            if (typeof path !== "string") {
                throw new TypeError("Path must be a string");
            }
            return ipcRenderer.invoke("load-mod-metadata", path);
        },
        getModPath: modName => ipcRenderer.invoke("getModPath", modName),
        openModHTML: modFolder => ipcRenderer.invoke("openModHTML", modFolder)
    }
};
window.addEventListener("keydown", e => {
    if (e.key === "F1") {
        ipcRenderer.send("returnToLauncher");
    }
});
contextBridge.exposeInMainWorld("electron", IPCAPI);