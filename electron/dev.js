// electron/dev.js - modding tools that need the main process:
//
//   check-files   used by the mod checker (js/debug/mod-checker.js, F8): which files exist, and which only
//                 exist with a different capitalization (Windows doesn't care, Android and the web do)
//   live-reload   watches the folder of the page that asked (its src/ folder) and, when a file changes:
//                   .css only        -> the page swaps its stylesheets without reloading
//                   electron/, elec-*.js -> the page shows "restart the app" (main process code)
//                   anything else    -> the page reloads
//                 The page turns it on (js/debug/live-reload.js: LiveReload in registerMod.js, or F9).
const { ipcMain, webContents } = require("electron");
const fs = require("fs");
const path = require("path");
const { fileURLToPath } = require("url");

/** Folder of the page shown in `wc` (src/ for index.html and app.html), or null. */
function pageDir(wc) {
    try {
        const url = wc.getURL();
        if (!url.startsWith("file:")) return null;
        return path.dirname(fileURLToPath(url.split(/[?#]/)[0]));
    } catch (e) {
        return null;
    }
}

/**
 * Looks for `rel` (relative to `base`) one folder at a time, comparing exact names.
 * { exists: true } | { exists: true, actual: "Real/Name.png" } (wrong capitalization) | { exists: false }
 */
function checkPath(base, rel, listing) {
    if (typeof rel !== "string" || !rel || path.isAbsolute(rel)) return { exists: false };
    const parts = rel.replace(/\\/g, "/").split("/").filter(p => p && p !== ".");
    if (parts.includes("..")) return { exists: false };
    let dir = base;
    let wrongCase = false;
    const actual = [];
    for (const part of parts) {
        let names = listing.get(dir);
        if (!names) {
            try {
                names = fs.readdirSync(dir);
            } catch (e) {
                names = [];
            }
            listing.set(dir, names);
        }
        let name = names.includes(part) ? part : null;
        if (!name) {
            name = names.find(n => n.toLowerCase() === part.toLowerCase()) || null;
            if (!name) return { exists: false };
            wrongCase = true;
        }
        actual.push(name);
        dir = path.join(dir, name);
    }
    return wrongCase ? { exists: true, actual: actual.join("/") } : { exists: true };
}

const IGNORED = /(^|[\\/])(\.|node_modules[\\/])|~$|\.(tmp|swp|swx|crdownload|part)$|(^|[\\/])4913$/i;
const watchers = new Map();

/**
 * Calls onChange(relativePath) for every change under `dir`. Uses fs.watch's recursive mode
 * (Windows, macOS, newer Linux) or one watcher per folder where that isn't supported.
 */
function watchTree(dir, onChange) {
    try {
        const w = fs.watch(dir, { recursive: true }, (type, file) => file && onChange(String(file)));
        return () => w.close();
    } catch (e) {
        const list = [];
        const add = folder => {
            try {
                list.push(fs.watch(folder, (type, file) => file && onChange(path.relative(dir, path.join(folder, String(file))))));
                for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
                    if (entry.isDirectory() && !IGNORED.test(entry.name)) add(path.join(folder, entry.name));
                }
            } catch (err) { /* folder vanished */ }
        };
        add(dir);
        return () => list.forEach(w => w.close());
    }
}

function stopWatching(id) {
    const w = watchers.get(id);
    if (w) {
        w.close();
        watchers.delete(id);
    }
}

function startWatching(wc) {
    const dir = pageDir(wc);
    if (!dir) return false;
    const current = watchers.get(wc.id);
    if (current && current.dir === dir) return true;
    stopWatching(wc.id);

    let changed = new Set();
    let timer = null;
    const flush = () => {
        timer = null;
        const files = [...changed].map(f => f.replace(/\\/g, "/"));
        changed = new Set();
        if (wc.isDestroyed() || !files.length) return;
        const mainProcess = files.filter(f => /^electron\//.test(f) || /^elec-[^/]*\.js$/.test(f));
        const rest = files.filter(f => !mainProcess.includes(f));
        if (mainProcess.length) wc.send("live-reload", { type: "restart", files: mainProcess });
        if (!rest.length) return;
        if (rest.every(f => /\.css$/i.test(f))) {
            wc.send("live-reload", { type: "css", files: rest });
        } else {
            console.log("[live reload]", rest.join(", "));
            wc.reloadIgnoringCache();
        }
    };
    const close = watchTree(dir, file => {
        if (IGNORED.test(file)) return;
        changed.add(file);
        clearTimeout(timer);
        timer = setTimeout(flush, 250);
    });
    watchers.set(wc.id, { dir, close });
    wc.once("destroyed", () => stopWatching(wc.id));
    console.log("[live reload] watching", dir);
    return true;
}

function initDevTools() {
    ipcMain.handle("check-files", (e, paths) => {
        const base = pageDir(e.sender);
        if (!base || !Array.isArray(paths)) return [];
        const listing = new Map();
        return paths.slice(0, 5000).map(p => checkPath(base, p, listing));
    });

    ipcMain.handle("live-reload", (e, on) => {
        if (on) return startWatching(e.sender);
        stopWatching(e.sender.id);
        return false;
    });
}

module.exports = { initDevTools, checkPath };
