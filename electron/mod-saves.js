// electron/mod-saves.js - a mod's saved data, for the launcher's "Saves" popup (mod-launcher/js/saves.js).
//
// Every mod opened from the launcher has its own storage (session partition, see mods.js modPartition).
// The game keeps everything in localStorage: saved mixes, unlocked bonuses, achievements, settings, play
// stats. This module reads/writes that localStorage through a hidden window on a blank local page
// (mod-launcher/storage.html) in the mod's partition, so no game code runs while doing it.
//
// Save files (.jmbsave) are JSON: { format: "jmb-saves", version: 1, mod: { name, id }, exported, data: { key: value } }
const { BrowserWindow, dialog, ipcMain, session } = require("electron");
const fs = require("fs");
const path = require("path");
const { SRC_DIR, getMainWindow } = require("./window");

const FORMAT = "jmb-saves";
const BLANK_PAGE = path.join(SRC_DIR, "mod-launcher", "storage.html");

let modPartition = null;
const pendingImports = new Map();

function readModJSON(modFolder) {
    try {
        return JSON.parse(fs.readFileSync(path.join(modFolder, "mod.json"), "utf8"));
    } catch (e) {
        return null;
    }
}

/** Runs `code` in a hidden page that uses the mod's storage, and returns its result. */
async function inModStorage(modFolder, code) {
    const win = new BrowserWindow({
        show: false,
        webPreferences: { partition: modPartition(modFolder), sandbox: true, contextIsolation: true, nodeIntegration: false }
    });
    try {
        await win.loadFile(BLANK_PAGE);
        return await win.webContents.executeJavaScript(code);
    } finally {
        await win.webContents.session.flushStorageData?.();
        win.destroy();
    }
}

function readAll(modFolder) {
    return inModStorage(modFolder, "JSON.stringify(Object.fromEntries(Object.entries(localStorage)))").then(JSON.parse);
}

function writeAll(modFolder, data) {
    return inModStorage(modFolder, `(() => {
        const data = ${JSON.stringify(data)};
        localStorage.clear();
        for (const key in data) localStorage.setItem(key, data[key]);
        return Object.keys(data).length;
    })()`);
}

function summary(data) {
    const keys = Object.keys(data);
    const bytes = keys.reduce((n, k) => n + (k.length + String(data[k]).length) * 2, 0);
    const achievements = keys.filter(k => k.startsWith("achievements_")).length;
    return { keys: keys.length, bytes, achievements };
}

function safeFileName(name) {
    return String(name || "mod").replace(/[\\/:*?"<>|]+/g, "").trim().slice(0, 60) || "mod";
}

function isModFolder(p) {
    return typeof p === "string" && p.length > 0 && fs.existsSync(path.join(p, "mod.json"));
}

function initModSaves(partitionOf) {
    modPartition = partitionOf;

    ipcMain.handle("saves:info", async (e, modFolder) => {
        if (!isModFolder(modFolder)) return null;
        return summary(await readAll(modFolder));
    });

    ipcMain.handle("saves:export", async (e, modFolder) => {
        if (!isModFolder(modFolder)) return { ok: false, error: "Mod not found." };
        const mod = readModJSON(modFolder) || {};
        const data = await readAll(modFolder);
        if (!Object.keys(data).length) return { ok: false, error: "This mod has no saves yet." };
        const stamp = new Date().toISOString().slice(0, 10);
        const { canceled, filePath } = await dialog.showSaveDialog(BrowserWindow.getFocusedWindow() || getMainWindow(), {
            title: "Export saves",
            defaultPath: `${safeFileName(mod.name)} saves ${stamp}.jmbsave`,
            filters: [{ name: "Mod saves", extensions: ["jmbsave"] }, { name: "JSON", extensions: ["json"] }]
        });
        if (canceled || !filePath) return { ok: false, canceled: true };
        const file = { format: FORMAT, version: 1, mod: { name: mod.name || "", id: mod.id || "" }, exported: new Date().toISOString(), data };
        fs.writeFileSync(filePath, JSON.stringify(file, null, 2));
        return { ok: true, file: filePath, ...summary(data) };
    });

    ipcMain.handle("saves:pickImport", async (e, modFolder) => {
        if (!isModFolder(modFolder)) return { ok: false, error: "Mod not found." };
        const { canceled, filePaths } = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow() || getMainWindow(), {
            title: "Import saves",
            properties: ["openFile"],
            filters: [{ name: "Mod saves", extensions: ["jmbsave", "json"] }]
        });
        if (canceled || !filePaths?.length) return { ok: false, canceled: true };
        let file;
        try {
            file = JSON.parse(fs.readFileSync(filePaths[0], "utf8"));
        } catch (err) {
            return { ok: false, error: "That file isn't a save file (it couldn't be read as JSON)." };
        }
        if (!file || file.format !== FORMAT || !file.data || typeof file.data !== "object" || Array.isArray(file.data)) {
            return { ok: false, error: "That file isn't a mod save file." };
        }
        const data = {};
        for (const [k, v] of Object.entries(file.data)) data[String(k)] = String(v);
        const mod = readModJSON(modFolder) || {};
        const sameMod = file.mod && ((file.mod.id && file.mod.id === mod.id) || (!file.mod.id && file.mod.name === mod.name));
        const token = Math.random().toString(36).slice(2);
        pendingImports.set(token, { modFolder, data });
        return { ok: true, token, fromMod: file.mod?.name || "", sameMod: !!sameMod, exported: file.exported || "", ...summary(data) };
    });

    ipcMain.handle("saves:import", async (e, token) => {
        const pending = pendingImports.get(token);
        pendingImports.delete(token);
        if (!pending) return { ok: false, error: "Nothing to import." };
        const count = await writeAll(pending.modFolder, pending.data);
        return { ok: true, keys: count };
    });

    ipcMain.handle("saves:cancelImport", (e, token) => {
        pendingImports.delete(token);
    });

    ipcMain.handle("saves:clear", async (e, modFolder) => {
        if (!isModFolder(modFolder)) return { ok: false, error: "Mod not found." };
        await clearSaves(modFolder);
        return { ok: true };
    });
}

/** Wipes a mod's storage (localStorage, IndexedDB, caches...). */
async function clearSaves(modFolder) {
    const ses = session.fromPartition(modPartition(modFolder));
    await ses.clearStorageData();
    await ses.clearCache();
}

module.exports = { initModSaves, clearSaves };
