/*
 * helpers.js
 * Small general-purpose utilities used everywhere (paths, files, colors, math, parsing).
 * Nothing in here touches the game directly.
 */

/** Returns the `?v=` value of the current URL (the version number), or "Unknown". */
function getVersionFromURL() {
    return new URLSearchParams(window.location.search).get("v") || "Unknown";
}

/** Returns the current page's file name ("index.html", "app.html", ...). */
function getHtmlName() {
    const path = window.location.pathname;
    const fileName = path.substring(path.lastIndexOf("/") + 1);
    return fileName || "index.html";
}

/** "img/foo.png" -> "img/foo@2x.png" (paths that already contain @2x are returned untouched). */
function auto2xPath(path) {
    if (path.toLowerCase().includes("@2x")) return path;

    const dot = path.lastIndexOf(".");
    if (dot === -1) return path;

    return path.slice(0, dot) + "@2x" + path.slice(dot);
}

/**
 * Splits an asset file name into its base name and extension, dropping any "@2x" suffix.
 * "game-picto@2x.png" -> { base: "game-picto", ext: ".png" }
 */
function splitAssetName(fileName, defaultExt = ".png") {
    const match = /^(.*?)(@2x)?(\.[a-z0-9]+)?$/i.exec(fileName || "");
    return { base: match[1], ext: match[3] || defaultExt };
}

/**
 * Mods can name their folders "img" or "image", and "video" or "bonus".
 * Given one spelling, returns the path with the other spelling (or null).
 */
function getAssetFallback(path) {
    if (path.indexOf("/img/") !== -1) return path.replace("/img/", "/image/");
    if (path.indexOf("/image/") !== -1) return path.replace("/image/", "/img/");
    if (path.indexOf("/video/") !== -1) return path.replace("/video/", "/bonus/");
    if (path.indexOf("/bonus/") !== -1) return path.replace("/bonus/", "/video/");
    return null;
}

/** Tries to load `path` as an image; if it fails, calls `onFallback(otherPath)` with the img/image swapped path. */
function tryImageFallback(path, onFallback) {
    const img = new Image();
    img.onerror = () => {
        const fallback = getAssetFallback(path);
        if (fallback && fallback !== path) onFallback(fallback);
    };
    img.src = path;
}

/** Resolves with `path` if the image loads, rejects otherwise. */
function preloadIconPath(path) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(path);
        img.onerror = () => reject();
        img.src = path;
    });
}

/** Returns true if `url` answers a HEAD request with a 2xx status. */
async function fileExists(url) {
    try {
        const response = await fetch(url, { method: "HEAD" });
        return response.ok;
    } catch (error) {
        console.error("An error occurred:", error);
        return false;
    }
}

/** Loads an extra script file. Resolves with the url once it ran, rejects if it could not be loaded. */
function loadJS(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = url;
        script.onload = () => resolve(url);
        script.onerror = () => reject(new Error(`Could not load script: ${url}`));
        document.head.appendChild(script);
    });
}

/** Parses an XML string into a Document. */
function parseXML(xmlString) {
    return new DOMParser().parseFromString(xmlString, "application/xml");
}

/**
 * Parses a JSON-with-comments (.jsonc) string: // and /* *\/ comments and trailing commas are allowed.
 * Comment markers inside strings (like "https://...") are left alone.
 */
function parseJSONC(text) {
    let out = "";
    let inString = false;
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        const next = text[i + 1];
        if (inString) {
            out += ch;
            if (ch === "\\") {
                out += next;
                i++;
            } else if (ch === "\"") {
                inString = false;
            }
        } else if (ch === "\"") {
            inString = true;
            out += ch;
        } else if (ch === "/" && next === "/") {
            while (i < text.length && text[i] !== "\n") i++;
            out += "\n";
        } else if (ch === "/" && next === "*") {
            i += 2;
            while (i < text.length && !(text[i] === "*" && text[i + 1] === "/")) i++;
            i++;
        } else {
            out += ch;
        }
    }
    return JSON.parse(out.replace(/,(\s*[}\]])/g, "$1"));
}

/** Parses an .ini style string into an object (sections become nested objects). */
function parseINI(data) {
    const result = {};
    let section = null;
    for (let line of data.split(/\r?\n/)) {
        line = line.trim();
        if (!line || line.startsWith(";") || line.startsWith("#")) continue;

        if (line.startsWith("[") && line.endsWith("]")) {
            section = line.slice(1, -1);
            result[section] = {};
        } else {
            const [key, ...value] = line.split("=");
            const val = value.join("=").trim();
            if (section) {
                result[section][key.trim()] = val;
            } else {
                result[key.trim()] = val;
            }
        }
    }
    return result;
}

/** Sets a CSS custom property on :root. Example: changeCssVar("--colBck", "#000") */
function changeCssVar(name, value) {
    document.documentElement.style.setProperty(name, value);
}
/** Alias kept because the examples/docs use this name. */
function changeCssVariable(name, value) {
    changeCssVar(name, value);
}

/**
 * "#rgb" / "#rrggbb" -> { r, g, b } (or null if it is not a hex color).
 * Same behaviour as the particles.js helper of the same name, so whichever loads last is fine.
 */
function hexToRgb(hex) {
    hex = String(hex).replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

/** Runs `callback` with the given probability (0-1). Example: SomeTimes(0.1, () => ...) */
function SomeTimes(chance, callback) {
    if (Math.random() < chance) {
        callback();
    }
}

/** Returns a debounced version of `fn` that only runs after `wait` ms without calls. */
function debounce(fn, wait) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), wait);
    };
}

/**
 * Animates a number from `from` to `to` over `duration` ms (ease-out) and calls `onUpdate(value)`
 * every frame, then `onDone()` once finished.
 */
function smoothNumber(from, to, duration, onUpdate, onDone) {
    const start = performance.now();
    requestAnimationFrame(function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        onUpdate(from + (to - from) * (1 - (1 - progress) * (1 - progress)));
        if (progress < 1) {
            requestAnimationFrame(step);
        } else if (onDone) {
            onDone();
        }
    });
}

/** Center of the element matched by `selector`, as a 0-1 fraction of the window (used for confetti). */
function getElementPosition(selector) {
    const el = document.querySelector(selector);
    if (!el) {
        return { x: 0.5, y: 0.5 };
    }
    const rect = el.getBoundingClientRect();
    return {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight
    };
}

/** Polls every 100 ms until `selector` exists, then calls `callback(element)` once. */
function waitForElement(selector, callback) {
    const timer = setInterval(() => {
        const el = document.querySelector(selector);
        if (el) {
            clearInterval(timer);
            callback(el);
        }
    }, 100);
}

/** Timestamp (ms) -> "3 days ago" style text. */
function timeSince(timestamp) {
    if (!timestamp || isNaN(timestamp)) {
        return "Never played";
    }
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    const units = [
        ["year", 365 * 24 * 3600],
        ["month", 30 * 24 * 3600],
        ["week", 7 * 24 * 3600],
        ["day", 24 * 3600],
        ["hour", 3600],
        ["minute", 60]
    ];
    for (const [name, size] of units) {
        const amount = Math.floor(seconds / size);
        if (amount > 0) {
            return amount === 1 ? `1 ${name} ago` : `${amount} ${name}s ago`;
        }
    }
    return "Just now";
}

/** Returns the current date and time as a list: [year, month, day, hour, minute, second]. */
function getTimeList() {
    const d = new Date();
    return [
        d.getFullYear(),
        String(d.getMonth() + 1).padStart(2, '0'),
        String(d.getDate()).padStart(2, '0'),
        String(d.getHours()).padStart(2, '0'),
        String(d.getMinutes()).padStart(2, '0'),
        String(d.getSeconds()).padStart(2, '0')
    ];
}

/** Escapes text so it can be safely inserted with innerHTML. */
function escapeHTML(text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function logDebug(message) {
    console.log(`[VersionManager] ${message}`);
}
