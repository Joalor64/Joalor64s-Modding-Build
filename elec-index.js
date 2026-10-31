// Electron entry point (package.json "main"). The actual work is split into src/electron/:
//   window.js      - the game window
//   ipc.js         - window controls requested by the page (fullscreen, minimize, clipboard...)
//   mods.js        - mod launcher support (pick/install/open mods, one storage partition per mod)
//   mod-library-store.js - the "Played Mods" library shared by every mod
//   dev.js         - modding tools: mod checker file lookups (F8), live reload (F9)
//   menu.js        - application menu / shortcuts
//   discord-rpc.js - Discord Rich Presence
const { app, globalShortcut } = require("electron");
const { createWindow, getMainWindow, toggleDevTools } = require("./electron/window");
const { initIPC } = require("./electron/ipc");
const { initModIPC } = require("./electron/mods");
const { initModLibraryStore } = require("./electron/mod-library-store");
const { initDevTools } = require("./electron/dev");
const { buildMenu } = require("./electron/menu");

app.name = "Incredibox";

initModIPC();
initModLibraryStore();
initDevTools();

app.on("ready", () => {
    createWindow();
    initIPC();
    buildMenu();
    globalShortcut.register("CommandOrControl+Shift+I", toggleDevTools);
    require("./electron/discord-rpc");
});

app.on("activate", () => {
    const win = getMainWindow();
    if (win === null) {
        createWindow();
    } else {
        win.show();
    }
});

app.on("before-quit", () => {
    app.quitting = true;
});

app.on("will-quit", () => {
    globalShortcut.unregisterAll();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
