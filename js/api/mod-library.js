/*
 * mod-library.js
 * - Registers this mod in the "Played Mods" library (shared by every mod: kept by the desktop app's
 *   main process, or IndexedDB "ModLibraryDB" in a browser - see ModLibraryStore) with its icon, background, developer and last-played time.
 *   Icon: js/mod-icon.png (max 1.5 MB), background: js/mod-background.png (max 2.5 MB).
 * - The "Mod Library" tab of the info popup: news about new mods, fetched from the Incredimods repo.
 * - Update notices from the modding build (F2 to check again).
 */

const RegisterModIcon = "js/mod-icon.png";
const RegisterModBackground = "js/mod-background.png";
const noWifiImage = "img/no-wifi.png";

const MOD_LIBRARY_DB = "ModLibraryDB";
const MOD_LIBRARY_DB_VERSION = 2;
const MOD_NEWS_URL = "https://raw.githubusercontent.com/RemmieUwU/Incredimods/refs/heads/main/";

/**
 * Where the Played Mods entries live. In the desktop app every mod has its own storage, so the shared
 * list is kept by the main process (electron/mod-library-store.js); in a browser it's IndexedDB.
 * get(name), getAll(), put(record), delete(name) - all return promises.
 */
const ModLibraryStore = (() => {
    const shared = window.electron?.ipc?.modLibrary;
    const local = {
        request(mode, fn) {
            return openModLibraryDB().then(db => new Promise((resolve, reject) => {
                const request = fn(db.transaction("modIcons", mode).objectStore("modIcons"));
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            }));
        },
        get: name => local.request("readonly", s => s.get(name)),
        getAll: () => local.request("readonly", s => s.getAll()),
        put: record => local.request("readwrite", s => s.put(record)),
        delete: name => local.request("readwrite", s => s.delete(name))
    };
    if (!shared) return local;

    (async () => {
        try {
            if (localStorage.getItem("modLibraryMigrated")) return;
            const [old, current] = await Promise.all([local.getAll(), shared.getAll()]);
            const known = new Set(current.map(r => r.name));
            for (const record of old || []) {
                if (record && record.name && !known.has(record.name)) await shared.put(record);
            }
            localStorage.setItem("modLibraryMigrated", "1");
        } catch (e) {
            console.warn("Mod library: migration skipped", e);
        }
    })();
    return shared;
})();

/** Opens the mod library database (creating the "modIcons" store the first time). */
function openModLibraryDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(MOD_LIBRARY_DB, MOD_LIBRARY_DB_VERSION);
        request.onupgradeneeded = e => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains("modIcons")) {
                db.createObjectStore("modIcons", { keyPath: "name" });
            }
        };
        request.onsuccess = e => resolve(e.target.result);
        request.onerror = () => reject(request.error);
    });
}

function blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Failed to process images"));
        reader.readAsDataURL(blob);
    });
}

async function fetchImageBlob(url, maxBytes, label) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`${label} file not found!`);
    }
    const blob = await response.blob();
    if (blob.size > maxBytes) {
        const limit = `${(maxBytes / 1024000).toFixed(1).replace(/\.0$/, "")}MB`;
        OnDelayIn(500, () => showLibraryError(`${label} is too large! Please use an image under ${limit}.`, `${label} Upload Failed`));
        throw new Error(`${label} is larger than ${limit}`);
    }
    return blob;
}

/** Shows an error dialog once the game's dialogs exist. */
function showLibraryError(text, title) {
    if (typeof boxDialog !== "undefined" && boxDialog) {
        boxDialog.open(text, title);
    } else {
        document.addEventListener("DOMContentLoaded", () => setTimeout(() => boxDialog?.open(text, title), 500));
    }
}

/** Old helper name kept for compatibility: converts the two blobs to data URLs. */
async function processImages(iconBlob, backgroundBlob) {
    const [base64Icon, base64Background] = await Promise.all([blobToDataURL(iconBlob), blobToDataURL(backgroundBlob)]);
    return { base64Icon, base64Background };
}

/** Saves/updates this mod's entry in the Played Mods library. */
async function registerMod() {
    try {
        const iconBlob = await fetchImageBlob(RegisterModIcon, 1536000, "Icon");
        const backgroundBlob = await fetchImageBlob(RegisterModBackground, 2560000, "Background");
        const { base64Icon, base64Background } = await processImages(iconBlob, backgroundBlob);

        await ModLibraryStore.put({
            name: RegisterMod,
            version: RegisterModVersion,
            developer: ModDeveloper,
            icon: base64Icon,
            background: base64Background,
            lastPlayed: Date.now()
        });
    } catch (e) {
        console.warn("Mod library: " + e.message);
        if (!/larger than/.test(e.message)) {
            showLibraryError("Failed to load mod assets: " + e.message, "Error");
        }
    }
}

/** Sets the "last played" time of mod `modName` to now. */
async function updateLastPlayed(modName) {
    try {
        const entry = await ModLibraryStore.get(modName);
        if (entry) {
            entry.lastPlayed = Date.now();
            await ModLibraryStore.put(entry);
        }
    } catch (e) { }
}

/** Calls `callback("3 days ago")` with how long ago mod `modName` was last played. */
async function getLastPlayed(modName, callback) {
    const cb = typeof callback === "function" ? callback : () => { };
    try {
        const entry = await ModLibraryStore.get(modName);
        cb(entry && entry.lastPlayed ? timeSince(Number(entry.lastPlayed)) : "Never played");
    } catch (e) {
        cb("Unknown");
    }
}

function loadNewButtonModsNews() {
    if (ForceDisableEvents) return;

    fetch(MOD_NEWS_URL + "moreModsDataShare.json").then(r => r.json()).then(data => {
        const wrapper = document.querySelector(".mods-buttons-warper");
        if (!wrapper) return;

        document.getElementById("bt-dynamicmod")?.remove();
        const button = document.createElement("div");
        button.className = "bt bt-light with-icn";
        button.id = "bt-dynamicmod";
        button.innerHTML = `
            <div class="bck">
                <svg class="icn-svg"><use xlink:href="${data.icon}"></use></svg>
                <div class="txt">${data.name}</div>
            </div>
            <a class="hitzone" href="javascript:void(0)"></a>
        `;
        wrapper.appendChild(button);
        button.querySelector(".hitzone").addEventListener("click", () => {
            openMessagePopup(data.innerHTML || "No content available 💔", "shadow-box", () => {
                document.getElementById("pop-popup")?.classList.remove("shadow-box");
            });
        });
    }).catch(e => console.warn("Couldn't load mod news button:", e.message));
}

function displayNewMods() {
    const list = document.getElementById("modNews");
    if (!list) return;

    if (!navigator.onLine) {
        list.innerHTML = `<div style="color:white; width: 100%; padding:20px; text-align:center;"><img src="${noWifiImage}" style="width: 35%;"></div>`;
        return;
    }

    const container = document.querySelector("#pop-modhistory .container");
    let banner = document.querySelector(".banner-mods-news");
    if (!banner && container) {
        banner = document.createElement("div");
        banner.classList.add("banner-mods-news");
        banner.style.backgroundColor = "#222";
        container.parentElement.insertBefore(banner, container);
    }
    if (banner) {
        banner.style.backgroundImage = `url('${MOD_NEWS_URL}main-banner-min.png')`;
    }

    fetch(MOD_NEWS_URL + "modData.json").then(r => r.json()).then(data => {
        list.innerHTML = "";
        data.mods.forEach(mod => {
            const box = document.createElement("div");
            box.classList.add("newsModBoxes");
            box.onclick = () => confirmNavigation(mod.modLink);
            box.innerHTML = `
                <div class="newModIcon" style="background-image: url('${mod.imgico}');"></div>
                <div class="tittle">${mod.name}</div>
                <div class="txt">By: ${mod.developers}</div>
                <div class="txt">${mod.date}</div>
                <div class="newModBoxBG" style="background-image:url('${mod.imgbg}')"></div>
            `;
            if (mod.customCSS && mod.customCSS.trim() !== "") {
                const style = document.createElement("style");
                style.textContent = mod.customCSS;
                box.prepend(style);
            }
            list.appendChild(box);
        });
    }).catch(e => console.warn("Couldn't load mod news:", e.message));
}

(function () {
    const modNews = document.getElementById("modNews");
    if (!modNews) return;

    let currentScroll = 0;
    let targetScroll = 0;
    let isScrolling = false;

    function smoothScroll() {
        currentScroll += (targetScroll - currentScroll) * 0.1;
        const max = modNews.scrollWidth - modNews.offsetWidth;
        currentScroll = Math.max(0, Math.min(currentScroll, max));
        modNews.scrollLeft = currentScroll;
        if (Math.abs(targetScroll - currentScroll) > 0.5) {
            requestAnimationFrame(smoothScroll);
        } else {
            currentScroll = targetScroll;
            isScrolling = false;
        }
    }

    modNews.addEventListener("wheel", e => {
        e.preventDefault();
        const max = modNews.scrollWidth - modNews.offsetWidth;
        targetScroll = Math.max(0, Math.min(targetScroll + e.deltaY, max));
        if (!isScrolling) {
            isScrolling = true;
            smoothScroll();
        }
    }, { passive: false });
})();

/** Shows the latest build update message once (dev-only messages only show for unnamed mods). */
function checkAndShowUpdateNotice(modName) {
    fetch(MOD_NEWS_URL + "buildUpdateData.json").then(r => r.json()).then(data => {
        const shown = JSON.parse(localStorage.getItem("shownMessages") || "[]");
        if (shown.includes(data.id)) {
            return;
        }
        const isDevBuild = modName === "Unknown" || modName === "Unknow";
        if ((data.devVersionOnly && isDevBuild) || data.versionForEveryone) {
            openMessagePopup(data.content);
            shown.push(data.id);
            localStorage.setItem("shownMessages", JSON.stringify(shown));
        }
    }).catch(e => {
        console.error("Couldn't load update message:", e);
    });
}

registerMod();
getLastPlayed(RegisterMod, result => console.log("Last played:", result));
loadNewButtonModsNews();
OnClick("tab-modhistory", () => {
    displayNewMods();
    loadNewButtonModsNews();
});
