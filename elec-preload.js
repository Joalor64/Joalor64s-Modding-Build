/* 1.2.8 2023-12-16 16:49:20 - Incredibox - Designed with love & passion since 2009 */
const {
    contextBridge,
    ipcRenderer,
    webUtils
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
        openModHTML: modFolder => ipcRenderer.invoke("openModHTML", modFolder),
        deleteMod: (modFolder, opts) => ipcRenderer.invoke("delete-mod", modFolder, opts),
        zipInstallDecision: (token, choice) => ipcRenderer.invoke("zip-install-decision", token, choice),
        importDropped: path => ipcRenderer.invoke("import-dropped", path),
        openModFolder: modFolder => ipcRenderer.invoke("open-mod-folder", modFolder),
        pathForFile: file => (webUtils && webUtils.getPathForFile ? webUtils.getPathForFile(file) : file.path),
        saves: {
            info: modFolder => ipcRenderer.invoke("saves:info", modFolder),
            export: modFolder => ipcRenderer.invoke("saves:export", modFolder),
            pickImport: modFolder => ipcRenderer.invoke("saves:pickImport", modFolder),
            import: token => ipcRenderer.invoke("saves:import", token),
            cancelImport: token => ipcRenderer.invoke("saves:cancelImport", token),
            clear: modFolder => ipcRenderer.invoke("saves:clear", modFolder)
        },
        setPresence: info => ipcRenderer.send("discord-presence", info),
        startGame: () => ipcRenderer.send("start-game"),
        modLibrary: {
            get: name => ipcRenderer.invoke("modlib:get", name),
            getAll: () => ipcRenderer.invoke("modlib:getAll"),
            put: record => ipcRenderer.invoke("modlib:put", record),
            delete: name => ipcRenderer.invoke("modlib:delete", name)
        },
        stopGame: () => ipcRenderer.send("stop-game"),
        checkFiles: paths => ipcRenderer.invoke("check-files", paths),
        liveReload: on => ipcRenderer.invoke("live-reload", !!on),
        onLiveReload: callback => {
            ipcRenderer.removeAllListeners("live-reload");
            ipcRenderer.on("live-reload", (e, msg) => callback(msg));
        }
    }
};
window.addEventListener("keydown", e => {
    if (e.key === "F1") {
        ipcRenderer.send("returnToLauncher");
    }
});
contextBridge.exposeInMainWorld("electron", IPCAPI);