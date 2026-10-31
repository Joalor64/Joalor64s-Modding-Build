// electron/mod-library-store.js - the "Played Mods" library, shared by every mod.
// Each mod opened from the launcher has its own storage (see createWindow's partition), so the library
// can't live in IndexedDB anymore: it's kept here, in <userData>/mod-library.json, and the pages reach it
// through window.electron.ipc.modLibrary (elec-preload.js). Records: { name, version, developer, icon,
// background, lastPlayed } keyed by name - the same shape as the old "modIcons" IndexedDB store.
const { app, ipcMain } = require("electron");
const fs = require("fs");
const path = require("path");

let cache = null;

function storeFile() {
    return path.join(app.getPath("userData"), "mod-library.json");
}

function load() {
    if (cache) return cache;
    try {
        const data = JSON.parse(fs.readFileSync(storeFile(), "utf8"));
        cache = data && typeof data === "object" && !Array.isArray(data) ? data : {};
    } catch (e) {
        cache = {};
    }
    return cache;
}

function save() {
    const file = storeFile();
    const tmp = file + ".tmp";
    try {
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(tmp, JSON.stringify(cache));
        fs.renameSync(tmp, file);
    } catch (e) {
        console.error("Mod library: could not save", e);
    }
}

const validName = name => typeof name === "string" && name.length > 0 && name.length <= 200;

function initModLibraryStore() {
    ipcMain.handle("modlib:get", (e, name) => (validName(name) ? load()[name] || null : null));
    ipcMain.handle("modlib:getAll", () => Object.values(load()));
    ipcMain.handle("modlib:put", (e, record) => {
        if (!record || !validName(record.name)) return false;
        const clean = {
            name: record.name,
            version: String(record.version ?? ""),
            developer: String(record.developer ?? ""),
            icon: typeof record.icon === "string" ? record.icon : "",
            background: typeof record.background === "string" ? record.background : "",
            lastPlayed: Number(record.lastPlayed) || Date.now()
        };
        load()[clean.name] = clean;
        save();
        return true;
    });
    ipcMain.handle("modlib:delete", (e, name) => {
        if (!validName(name) || !(name in load())) return false;
        delete cache[name];
        save();
        return true;
    });
}

module.exports = { initModLibraryStore };
