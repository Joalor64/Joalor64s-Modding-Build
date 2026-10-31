// electron/mods.js - everything the mod launcher (src/mod-launcher) needs from the main process:
// picking a mod folder / zip, installing zips into resources/mods/<uuid>, reading mod.json and opening a mod.
const { app, BrowserWindow, dialog, ipcMain, shell } = require("electron");
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const crypto = require("crypto");
const AdmZip = require("adm-zip");
const { SRC_DIR, getMainWindow, createWindow } = require("./window");
const { initModSaves, clearSaves } = require("./mod-saves");

const DEFAULT_ICON = path.join(SRC_DIR, "mod-launcher", "img", "mod-icon.png");
const DEFAULT_BANNER = path.join(SRC_DIR, "mod-launcher", "img", "mod-background.png");

/**
 * Where mods installed from a zip go: <user data>/mods (%APPDATA%\Incredibox\mods on Windows).
 * Outside the app folder, so installs survive app/Electron upgrades and work even where the app folder
 * is read-only (Program Files).
 */
function modsFolder() {
    return path.join(app.getPath("userData"), "mods");
}

/** Where older versions installed zips (resources/mods next to the app): still read, never written. */
function legacyModsFolder() {
    return path.join(process.resourcesPath, "mods");
}

function installRoots() {
    return [modsFolder(), legacyModsFolder()];
}

const INSTALL_MARKER = ".launcher-install";
const UUID_NAME = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * True for mods the launcher installed from a zip: their files belong to the launcher and can be deleted.
 * A folder you made yourself (even inside resources/mods/) or imported from elsewhere is never deleted.
 */
function isInstalledMod(modFolder) {
    if (typeof modFolder !== "string" || !modFolder) return false;
    const full = path.resolve(modFolder);
    return installRoots().some(root => {
        const rel = path.relative(root, full);
        if (!rel || rel.startsWith("..") || path.isAbsolute(rel) || rel.includes(path.sep)) return false;
        return fs.existsSync(path.join(full, INSTALL_MARKER)) || UUID_NAME.test(rel);
    });
}

function dialogParent() {
    return BrowserWindow.getFocusedWindow() || getMainWindow();
}

/** Moves a folder, copying instead when source and target are on different drives. */
function moveFolder(from, to) {
    try {
        fs.renameSync(from, to);
    } catch (err) {
        if (err.code !== "EXDEV" && err.code !== "EPERM") throw err;
        fs.cpSync(from, to, { recursive: true });
        fs.rmSync(from, { recursive: true, force: true });
    }
}

/** First existing file among `candidates` (paths relative to the mod folder), as a file:// URL. */
function findImage(modFolder, candidates, fallback) {
    for (const name of candidates) {
        if (!name) continue;
        const file = path.join(modFolder, name);
        if (fs.existsSync(file)) return pathToFileURL(file).href;
    }
    return pathToFileURL(fallback).href;
}

/**
 * Which modding build a mod is made with, for the badge on its card:
 *   mod.json "JMBVersion" > the version in the mod's own src/js/api/version.js (Joalor64's Modding Build)
 *   > mod.json "RMBVersion" > nothing (no badge).
 */
function detectBuild(modFolder, modData) {
    if (modData.JMBVersion) return `JMB v${modData.JMBVersion}`;
    try {
        const text = fs.readFileSync(path.join(modFolder, "src", "js", "api", "version.js"), "utf8");
        const num = key => (new RegExp(`\\b${key}\\s*:\\s*(\\d+)`).exec(text) || [])[1];
        const major = num("major"), minor = num("minor"), patch = num("patch");
        if (major !== undefined && minor !== undefined && patch !== undefined) {
            let v = `${major}.${minor}.${patch}`;
            const pre = /prerelease\s*:\s*\{[^}]*type\s*:\s*["']([a-z]+)["'][^}]*version\s*:\s*(\d+)/i.exec(text);
            if (pre) v += `-${pre[1]}.${pre[2]}`;
            return `JMB v${v}`;
        }
    } catch (e) { }
    if (modData.RMBVersion) return `RMB v${modData.RMBVersion}`;
    return "";
}

/**
 * Reads <modFolder>/mod.json. Returns null when there is no (valid) mod.json.
 * mod.json fields: id, name, author, version, JMBVersion / RMBVersion, description, modLink, borderColor,
 * icon (default icon.png), banner (default banner.png), startupAnim, startupSound.
 */
function loadModMetadata(modFolder) {
    const modJsonPath = path.join(modFolder, "mod.json");
    if (!fs.existsSync(modJsonPath)) {
        return null;
    }
    try {
        const modData = JSON.parse(fs.readFileSync(modJsonPath, "utf8"));
        return {
            title: modData.name || "Unknown Mod",
            author: modData.author || modData.by || "Unknown Developer",
            version: modData.version || "1.0.0",
            RMBVersion: modData.RMBVersion || "",
            build: detectBuild(modFolder, modData),
            description: modData.description || modData.summary || "No description provided.",
            modLink: modData.modLink || modData.video || "",
            borderColor: modData.borderColor || modData.color || "#919191",
            icon: findImage(modFolder, [modData.icon, "icon.png"], DEFAULT_ICON),
            background: findImage(modFolder, [modData.banner, "banner.png"], DEFAULT_BANNER),
            startupAnim: modData.startupAnim || modData.startAnim || "",
            startupSound: modData.startupSound || modData.startSound || "",
            path: modFolder,
            installed: isInstalledMod(modFolder),
            baseURL: pathToFileURL(modFolder).href.replace(/\/?$/, "/"),
            id: modData.name || "Unknown Mod"
        };
    } catch (error) {
        console.error("Error parsing mod.json:", error);
        return null;
    }
}

/**
 * Session partition for a mod, so each mod keeps its own saved data (localStorage, IndexedDB...).
 * Based on mod.json "id" (recommended: set it once and never change it), else name + author.
 * Two copies of the same mod (same id) share their data; renaming a mod without an "id" starts fresh.
 */
function modPartition(modFolder) {
    let key = null;
    try {
        const modData = JSON.parse(fs.readFileSync(path.join(modFolder, "mod.json"), "utf8"));
        key = modData.id ? `id:${modData.id}` : `name:${modData.name || ""}|author:${modData.author || modData.by || ""}`;
    } catch (e) { }
    if (!key || key === "name:|author:") key = `path:${path.resolve(modFolder)}`;
    const hash = crypto.createHash("sha1").update(key).digest("hex").slice(0, 16);
    return `persist:mod-${hash}`;
}

/** Extracts a zip to a temp folder. If everything is inside one top folder, that folder is the mod. */
function extractModFromZip(zipPath) {
    try {
        const zip = new AdmZip(zipPath);
        const roots = new Set();
        zip.getEntries().forEach(entry => {
            const parts = entry.entryName.split("/");
            if (parts.length > 1 && !entry.isDirectory) roots.add(parts[0]);
        });

        const tempFolder = path.join(app.getPath("temp"), "incredibox-mod-extract", Date.now().toString());
        fs.mkdirSync(tempFolder, { recursive: true });
        zip.extractAllTo(tempFolder, true);

        let modFolder = tempFolder;
        if (roots.size === 1) {
            const possibleModFolder = path.join(tempFolder, [...roots][0]);
            if (fs.existsSync(possibleModFolder)) modFolder = possibleModFolder;
        }

        if (!fs.existsSync(path.join(modFolder, "mod.json"))) {
            fs.rmSync(tempFolder, { recursive: true, force: true });
            return null;
        }
        return { tempFolder, modFolder };
    } catch (error) {
        console.error("Error extracting zip:", error);
        return null;
    }
}

function readModJSON(folder) {
    try {
        return JSON.parse(fs.readFileSync(path.join(folder, "mod.json"), "utf8"));
    } catch (e) {
        return null;
    }
}

/** Same mod? By mod.json "id", or name + author when there's no id. */
function sameMod(a, b) {
    if (!a || !b) return false;
    if (a.id || b.id) return !!a.id && a.id === b.id;
    return !!a.name && a.name === b.name && (a.author || a.by || "") === (b.author || b.by || "");
}

/** An already installed (from a zip) copy of the mod described by `modData`, or null. */
function findInstalledCopy(modData) {
    for (const root of installRoots()) {
        let entries = [];
        try {
            entries = fs.readdirSync(root, { withFileTypes: true });
        } catch (e) {
            continue;
        }
        for (const entry of entries) {
            if (!entry.isDirectory()) continue;
            const folder = path.join(root, entry.name);
            if (isInstalledMod(folder) && sameMod(readModJSON(folder), modData)) return folder;
        }
    }
    return null;
}

function removeTemp(extracted) {
    try {
        fs.rmSync(extracted.tempFolder, { recursive: true, force: true });
    } catch (e) {
        console.warn("Could not clean up temp folder:", e);
    }
}

function markInstalled(folder) {
    try {
        fs.writeFileSync(path.join(folder, INSTALL_MARKER), "Installed by the mod launcher from a zip. Deleting the mod in the launcher deletes this folder.\n");
    } catch (e) { }
}

/** Puts an extracted mod into <user data>/mods/<uuid>. Returns the new folder, or null. */
function installExtracted(extracted) {
    try {
        fs.mkdirSync(modsFolder(), { recursive: true });
        const finalModFolder = path.join(modsFolder(), crypto.randomUUID());
        moveFolder(extracted.modFolder, finalModFolder);
        markInstalled(finalModFolder);
        return finalModFolder;
    } catch (error) {
        console.error("Error installing mod from zip:", error);
        return null;
    } finally {
        removeTemp(extracted);
    }
}

/**
 * Replaces the files of an installed mod with an extracted newer version, in the same folder (so the
 * launcher keeps its card, favorite and saves). The old files are kept until the new ones are in place.
 */
function updateInstalled(existing, extracted) {
    const backup = `${existing}.old-${Date.now()}`;
    try {
        fs.renameSync(existing, backup);
    } catch (error) {
        console.error("Could not replace the installed mod (is a file open?):", error);
        removeTemp(extracted);
        return null;
    }
    try {
        moveFolder(extracted.modFolder, existing);
        markInstalled(existing);
    } catch (error) {
        console.error("Update failed, putting the old version back:", error);
        try {
            fs.rmSync(existing, { recursive: true, force: true });
            fs.renameSync(backup, existing);
        } catch (e) { }
        removeTemp(extracted);
        return null;
    }
    removeTemp(extracted);
    shell.trashItem(backup).catch(() => fs.rmSync(backup, { recursive: true, force: true }));
    return existing;
}

/** Installs a mod zip into <user data>/mods/<uuid> (always as a new copy). Returns the installed folder, or null. */
function installModFromZip(zipPath) {
    const extracted = extractModFromZip(zipPath);
    if (!extracted) return null;
    if (!loadModMetadata(extracted.modFolder)) {
        removeTemp(extracted);
        return null;
    }
    return installExtracted(extracted);
}

const pendingZips = new Map();

/**
 * A zip picked in the launcher. Installs it right away, or, when that mod is already installed,
 * returns { needsDecision, token, name, installedVersion, newVersion } for the launcher to ask
 * (answered with "zip-install-decision"). Returns the installed folder, or null.
 */
function prepareZip(zipPath) {
    if (typeof zipPath !== "string" || !zipPath.toLowerCase().endsWith(".zip")) return null;
    const extracted = extractModFromZip(zipPath);
    if (!extracted) return null;
    const modData = readModJSON(extracted.modFolder);
    if (!modData || !loadModMetadata(extracted.modFolder)) {
        removeTemp(extracted);
        return null;
    }
    const existing = findInstalledCopy(modData);
    if (!existing) return installExtracted(extracted);
    const token = crypto.randomUUID();
    pendingZips.set(token, { extracted, existing });
    const old = readModJSON(existing) || {};
    return {
        needsDecision: true,
        token,
        name: modData.name || "Unknown Mod",
        installedVersion: old.version || "?",
        newVersion: modData.version || "?",
        existing
    };
}

function initModIPC() {
    ipcMain.handle("pick-mod-folder", async () => {
        const { canceled, filePaths } = await dialog.showOpenDialog(dialogParent(), {
            title: "Select Mod Folder",
            properties: ["openDirectory"]
        });
        return canceled || !filePaths?.length ? null : filePaths[0];
    });

    ipcMain.handle("pick-mod-zip", async () => {
        const { canceled, filePaths } = await dialog.showOpenDialog(dialogParent(), {
            title: "Select Mod Zip File",
            properties: ["openFile"],
            filters: [{ name: "Zip Files", extensions: ["zip"] }]
        });
        if (canceled || !filePaths?.length) return null;
        return prepareZip(filePaths[0]);
    });

    ipcMain.handle("zip-install-decision", (event, token, choice) => {
        const pending = pendingZips.get(token);
        pendingZips.delete(token);
        if (!pending) return null;
        if (choice === "update") return updateInstalled(pending.existing, pending.extracted);
        if (choice === "copy") return installExtracted(pending.extracted);
        removeTemp(pending.extracted);
        return null;
    });

    ipcMain.handle("load-mod-metadata", (event, modPath) => loadModMetadata(modPath));

    ipcMain.handle("getModPath", (event, modName) => {
        if (typeof modName !== "string" || !modName || /[\\/]|\.\./.test(modName)) return null;
        for (const root of installRoots()) {
            const modFolder = path.join(root, modName);
            if (fs.existsSync(modFolder)) return modFolder;
        }
        return null;
    });

    ipcMain.handle("openModHTML", (event, modFolder) => {
        const indexPath = path.join(modFolder, "src", "index.html");
        if (!fs.existsSync(indexPath)) {
            return false;
        }
        createWindow({ file: indexPath, partition: modPartition(modFolder) });
        return true;
    });

    /**
     * Deleting a mod from the launcher. opts: { files, saves }
     *   files: move the mod's folder to the Recycle Bin - only for mods installed from a zip
     *          (a folder you imported yourself is never deleted, it's just removed from the list)
     *   saves: delete everything the mod saved (mixes, bonuses, achievements, settings)
     */
    ipcMain.handle("delete-mod", async (event, modFolder, opts = {}) => {
        const result = { filesDeleted: false, savesDeleted: false };
        if (typeof modFolder !== "string" || !modFolder) return result;
        if (opts.saves && fs.existsSync(path.join(modFolder, "mod.json"))) {
            try {
                await clearSaves(modFolder);
                result.savesDeleted = true;
            } catch (err) {
                console.error("Could not delete the mod's saves:", err);
            }
        }
        if (opts.files && isInstalledMod(modFolder) && fs.existsSync(modFolder)) {
            try {
                await shell.trashItem(modFolder);
                result.filesDeleted = true;
            } catch (err) {
                try {
                    fs.rmSync(modFolder, { recursive: true, force: true });
                    result.filesDeleted = true;
                } catch (err2) {
                    console.error("Could not delete the mod's files:", err2);
                }
            }
        }
        return result;
    });

    ipcMain.handle("import-dropped", (event, droppedPath) => {
        if (typeof droppedPath !== "string" || !droppedPath) return null;
        try {
            if (fs.statSync(droppedPath).isDirectory()) {
                return fs.existsSync(path.join(droppedPath, "mod.json")) ? droppedPath : { error: "noModJson" };
            }
        } catch (e) {
            return null;
        }
        if (droppedPath.toLowerCase().endsWith(".zip")) return prepareZip(droppedPath) || { error: "badZip" };
        return { error: "notMod" };
    });

    ipcMain.handle("open-mod-folder", async (event, modFolder) => {
        if (typeof modFolder !== "string" || !fs.existsSync(path.join(modFolder, "mod.json"))) return false;
        return (await shell.openPath(modFolder)) === "";
    });

    initModSaves(modPartition);

    ipcMain.on("returnToLauncher", () => {
        const launcher = path.join(SRC_DIR, "mod-launcher", "index.html");
        const win = getMainWindow();
        if (win && win.modPartition) {
            createWindow({ file: launcher });
        } else {
            win?.loadFile(launcher);
        }
    });
}

module.exports = { initModIPC, loadModMetadata, installModFromZip, prepareZip, modPartition, isInstalledMod, modsFolder };
