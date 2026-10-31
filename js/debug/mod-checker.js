/*
 * debug/mod-checker.js
 * F8: checks the whole mod for mistakes and shows a report.
 *
 * What it checks:
 *   - data/versions.xml, data/configs/*.jsonc, mod-credits/credits.xml, lore/data/vX.xml (syntax)
 *   - every version in versions.xml: its data (js/apps.js or asset-vX/app.json), typos in field names,
 *     colors, bonus codes, and that every file the engine will load exists:
 *     anime JSON + sprite (+ HD/LD variants), sounds A/B, bonus sounds and videos, stage images,
 *     startup/exit animations
 *   - each anime JSON: syntax, frames, headHeight, totalFrame, functions called from frame cues
 *   - mod.js: functions that look like hooks but are misspelled or point at a version/polo/bonus that
 *     doesn't exist (onV3Polo25, _loadAnime_rebound, onv1Start...)
 *   - files with the wrong capitalization (fine on Windows, broken on Android and the web) - desktop app only
 *
 * It also runs by itself when the page loads while live reloading is on (js/registerMod.js `LiveReload`),
 * and shows a toast when it finds problems.
 * From code: runModCheck() returns the report, openModChecker() shows it.
 */

const ModChecker = (() => {
    // fields the engine reads (anything else is fine, but a near-miss is probably a typo)
    const APP_KEYS = ["name", "version", "date", "folder", "bpm", "looptime", "totalframe", "timeSignature", "format", "sndExt", "vidExt",
        "bonusloopA", "bonusendloopA", "nbloopbonus", "colors", "colBck", "col0", "col1", "col2", "col3", "col4", "colDarkBck", "background",
        "gamePicto", "poloSprite", "poloTShirts", "homeScreen", "homeTitre", "homeVersion", "homeVersionText", "customTitle", "customVersion",
        "pictoRadius", "backgroundRadius", "useModboxAnimeNaming", "nbpolo", "pictoRowMax", "pictoRows", "credit", "animearray", "bonusarray",
        "letEvents", "_letEvents", "ambience", "firstLoopDelay", "maxrecloop", "poloHoverEffect", "scaredPolos"];
    const ANIME_KEYS = ["name", "color", "uniqsnd", "icon", "ignored", "hasAlt", "rebond", "deshabiller", "remonte"];
    const BONUS_KEYS = ["name", "title", "src", "code", "sound", "aspire", "predrop", "expire", "loop", "fade", "svg", "icon"];
    const ANIME_JSON_KEYS = ["animeName", "percentageMax", "totalFrame", "arrayFrame", "width", "height", "headHeight", "headWidth", "version",
        "gap", "bat", "upsideDown", "shakeAnim", "dontWearHat", "hasStartup", "hasExit", "poloStartTween", "movingStaticBody", "onlyXBody",
        "onlyYBody", "invertXBody", "invertYBody", "renderWaitingBody", "renderBody", "animRenderBody", "hasAlt", "waitingPictoOffsetY", "cover",
        "coverWidth", "coverHeight", "objectWidth", "objectHeight", "objectBack", "bodySprite", "rebond", "deshabiller", "remonte",
        "hatSprite", "hatWidth", "hatHeight", "hatCropX", "hatCropY", "hatOffsetX", "hatOffsetY", "hatBack"];

    // hook names with every number replaced by "#"
    const HOOKS = ["onAppStart", "afterModLoads", "onV#Start", "onV#Mix", "offV#Mix", "onV#LoopStart", "onV#LoopFinished",
        "onV#Polo#", "offV#Polo#", "onV#Polo#Swap", "onV#Polo#WaitSwap", "onV#Polo#DelayRemove",
        "onV#Bonus#Unlock", "onV#Bonus#Start", "onV#Bonus#End",
        "onIconSelect", "onIconSelect#", "onLockedIcon", "onLockedIcon#", "onModCreditsOpen",
        "onBoxVersionClicked#", "onImgVersionClicked#", "onBoxTitleClicked#", "onImgTitreClicked#",
        "_loadAnime_rebond", "_loadAnime_deshabiller", "_loadAnime_remonte"];

    let report = null;

    function distance(a, b) {
        if (Math.abs(a.length - b.length) > 3) return 99;
        const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
        for (let j = 1; j <= b.length; j++) d[0][j] = j;
        for (let i = 1; i <= a.length; i++) {
            for (let j = 1; j <= b.length; j++) {
                d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
            }
        }
        return d[a.length][b.length];
    }

    /** A known name `key` is probably a typo of, or null. */
    function closest(key, known) {
        if (known.includes(key)) return null;
        let best = null;
        let bestD = 3;
        for (const k of known) {
            const dist = k.toLowerCase() === key.toLowerCase() ? 0 : distance(key.toLowerCase(), k.toLowerCase());
            if (dist < bestD) {
                best = k;
                bestD = dist;
            }
        }
        return key.length >= 3 && bestD <= (key.length <= 5 ? 1 : 2) ? best : null;
    }

    function typoCheck(obj, known, where, add, file) {
        if (!obj || typeof obj !== "object") return;
        for (const key of Object.keys(obj)) {
            const guess = closest(key, known);
            if (guess) add("warning", where, `Unknown field "${key}" - did you mean "${guess}"?`, file);
        }
    }

    /** JSON.parse with a "line X, column Y" error message. */
    function parseJSON(text) {
        try {
            return { data: JSON.parse(text.replace(/^﻿/, "")) };
        } catch (err) {
            const m = /position (\d+)/.exec(err.message);
            if (m && !/line \d+/.test(err.message)) {
                const before = text.slice(0, Number(m[1]));
                const line = before.split("\n").length;
                const col = before.length - before.lastIndexOf("\n");
                return { error: `${err.message.replace(/ in JSON at position \d+/, "")} (line ${line}, column ${col})` };
            }
            return { error: err.message };
        }
    }

    function parseXMLError(text) {
        const doc = new DOMParser().parseFromString(text, "text/xml");
        const err = doc.querySelector("parsererror");
        return err ? err.textContent.replace(/\s+/g, " ").replace(/^.*?error[^:]*:\s*/i, "").slice(0, 200) : null;
    }

    async function readText(path) {
        try {
            const res = await fetch(path, { cache: "no-store" });
            return res.ok ? await res.text() : null;
        } catch (e) {
            return null;
        }
    }

    /**
     * Existence of many files at once: { path: { exists, actual } }. `actual` is set when the file only
     * exists with a different capitalization (desktop app only: it asks the main process).
     */
    async function checkFiles(paths) {
        const unique = [...new Set(paths)];
        const out = {};
        const bridge = window.electron?.ipc?.checkFiles;
        if (bridge) {
            try {
                const results = await bridge(unique);
                unique.forEach((p, i) => { out[p] = results[i] || { exists: false }; });
                return out;
            } catch (e) {
                console.warn("Mod checker: file check through the app failed, using fetch", e);
            }
        }
        await Promise.all(unique.map(async p => {
            try {
                let res = await fetch(p, { method: "HEAD", cache: "no-store" });
                if (res.status === 405) res = await fetch(p, { cache: "no-store" });
                out[p] = { exists: res.ok };
            } catch (e) {
                out[p] = { exists: false };
            }
        }));
        return out;
    }

    const clean = p => p.replace(/^\.\//, "").replace(/\/{2,}/g, "/");
    const withSuffix = (file, suffix) => {
        const dot = file.lastIndexOf(".");
        return dot === -1 ? file + suffix : file.slice(0, dot) + suffix + file.slice(dot);
    };
    const imgCandidates = (folder, file) => {
        const list = [];
        for (const dir of ["img/", "image/"]) {
            list.push(folder + dir + file);
            if (!/@2x/i.test(file)) list.push(folder + dir + withSuffix(file, "@2x"));
            else list.push(folder + dir + file.replace(/@2x/i, ""));
        }
        return list;
    };

    async function run() {
        const entries = [];
        const add = (level, where, msg, file) => entries.push({ level, where, msg, file: file ? clean(file) : "" });
        const fileRules = []; // { candidates, level, where, msg }
        const requireFile = (candidates, level, where, msg) => fileRules.push({ candidates: (Array.isArray(candidates) ? candidates : [candidates]).map(clean), level, where, msg });
        const started = performance.now();

        if (typeof RegisterMod !== "undefined" && (RegisterMod === "Unknown" || !RegisterMod)) {
            add("info", "registerMod.js", 'RegisterMod is still "Unknown": give your mod a name.', "js/registerMod.js");
        }
        if (typeof RegisterModVersion !== "undefined" && RegisterModVersion === "6.8.7") {
            add("info", "registerMod.js", 'RegisterModVersion is "6.8.7" (that\'s the RMB version): set your own mod\'s version, like "1.0.0".', "js/registerMod.js");
        }
        if (await readText("js/_buttons") != null) {
            add("warning", "js/_buttons", "js/_buttons isn't used anymore (old RMB mods): add those buttons to js/buttons.js instead.", "js/_buttons");
        }
        if (typeof LiveReload !== "undefined" && LiveReload) {
            add("info", "registerMod.js", "LiveReload is on. Turn it off before releasing your mod.", "js/registerMod.js");
        }

        (window.LOADED_SCRIPTS || []).forEach(src => requireFile(src, "error", "scripts.js", "Listed script is missing"));

        const versionIds = [];
        const versionsXml = await readText("data/versions.xml");
        if (versionsXml == null) {
            add("error", "versions.xml", "data/versions.xml is missing.", "data/versions.xml");
        } else {
            const err = parseXMLError(versionsXml);
            if (err) {
                add("error", "versions.xml", `XML error: ${err}`, "data/versions.xml");
            } else {
                const doc = new DOMParser().parseFromString(versionsXml, "text/xml");
                const seen = new Set();
                doc.querySelectorAll("icon").forEach(icon => {
                    const id = icon.getAttribute("ID") ?? icon.getAttribute("id");
                    const label = icon.getAttribute("name") || `icon ${id}`;
                    if (!id || isNaN(Number(id))) {
                        add("error", "versions.xml", `"${label}" has no valid ID="..." number.`, "data/versions.xml");
                        return;
                    }
                    if (seen.has(id)) add("error", "versions.xml", `ID="${id}" is used twice.`, "data/versions.xml");
                    seen.add(id);
                    versionIds.push(Number(id));
                    const customIcon = icon.getAttribute("customIcon");
                    if (customIcon) requireFile(customIcon, "warning", `v${id}`, "Menu icon (customIcon) not found");
                    const customImageTxt = icon.getAttribute("customImageTxt");
                    if (customImageTxt) requireFile(customImageTxt, "warning", `v${id}`, "customImageTxt image not found");
                    const color = icon.getAttribute("color");
                    if (color && !/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(color)) add("warning", "versions.xml", `"${label}" color="${color}" is not a #hex color.`, "data/versions.xml");
                });
                if (!versionIds.length) add("error", "versions.xml", "No <icon> versions are listed.", "data/versions.xml");
            }
        }

        for (const name of ["aboutYOffsetsData", "versionConfig", "uiLayout"]) {
            const path = `data/configs/${name}.jsonc`;
            const text = await readText(path);
            if (text == null) continue;
            try {
                (typeof parseJSONC === "function" ? parseJSONC : JSON.parse)(text);
            } catch (err) {
                add("error", "configs", `Syntax error: ${err.message}`, path);
            }
        }
        const xmlFiles = ["mod-credits/credits.xml", "data/polo/poloMain.xml", "data/polo/poloEyes.xml"].concat(versionIds.map(id => `lore/data/v${id}.xml`));
        for (const path of xmlFiles) {
            const text = await readText(path);
            if (text == null) continue;
            const err = parseXMLError(text);
            if (err) add("error", path.split("/").pop(), `XML error: ${err}`, path);
        }

        const versionInfo = {};
        for (const id of versionIds) {
            await checkVersion(id, add, requireFile, versionInfo);
        }

        checkHooks(add, versionInfo);

        const allPaths = fileRules.flatMap(r => r.candidates);
        const files = await checkFiles(allPaths);
        for (const rule of fileRules) {
            const found = rule.candidates.find(p => files[p] && files[p].exists && !files[p].actual);
            if (found) continue;
            const wrongCase = rule.candidates.find(p => files[p] && files[p].exists && files[p].actual);
            if (wrongCase) {
                add("warning", rule.where, `Wrong capitalization: the file is "${files[wrongCase].actual}". Works on Windows, breaks on Android and the web.`, wrongCase);
            } else {
                add(rule.level, rule.where, rule.msg, rule.candidates[0]);
            }
        }

        const order = { error: 0, warning: 1, info: 2 };
        entries.sort((a, b) => order[a.level] - order[b.level]);
        report = {
            entries,
            errors: entries.filter(e => e.level === "error").length,
            warnings: entries.filter(e => e.level === "warning").length,
            infos: entries.filter(e => e.level === "info").length,
            versions: versionIds,
            filesChecked: Object.keys(files).length,
            ms: Math.round(performance.now() - started),
            caseChecked: !!window.electron?.ipc?.checkFiles
        };
        return report;
    }

    async function checkVersion(id, add, requireFile, versionInfo) {
        const where = `v${id}`;
        let raw = null;
        let source = "js/apps.js";
        let modbox = false;

        const loadedFromJSON = window.isModboxApp && typeof getVersionFromURL === "function" && String(getVersionFromURL()) === String(id);
        if (!loadedFromJSON && typeof versions !== "undefined" && versions["v" + id] && typeof versions["v" + id] === "object") {
            raw = versions["v" + id];
        } else {
            source = `asset-v${id}/app.json`;
            const text = await readText(source);
            if (text != null) {
                const parsed = parseJSON(text);
                if (parsed.error) {
                    add("error", where, `app.json syntax error: ${parsed.error}`, source);
                    return;
                }
                raw = parsed.data;
                modbox = true;
            } else if (await readText(`asset-v${id}/app.js`) != null) {
                add("info", where, "Uses a legacy app.js: its data can't be checked without opening the version.", `asset-v${id}/app.js`);
                return;
            } else {
                add("error", where, `No data for this version: add versions.v${id} to js/apps.js, or asset-v${id}/app.json.`, `asset-v${id}/app.json`);
                return;
            }
        }

        typoCheck(raw, APP_KEYS, where, add, source);
        const folder = (raw.folder || `asset-v${id}/`).replace(/^\.\//, "").replace(/\/?$/, "/");
        const format = raw.format || ["mp3", "mp4", "ld", "hd"];
        const sndExt = format[0] || raw.sndExt || "mp3";
        const vidExt = format[1] || raw.vidExt || "mp4";
        const modboxNaming = raw.useModboxAnimeNaming != null ? !!raw.useModboxAnimeNaming : modbox;
        const animes = Array.isArray(raw.animearray) ? raw.animearray : [];
        const bonuses = Array.isArray(raw.bonusarray) ? raw.bonusarray : [];
        const nbpolo = raw.nbpolo || 7;
        versionInfo[id] = { animes: animes.length, bonuses: bonuses.length };

        if (!Array.isArray(raw.animearray)) add("error", where, "animearray is missing (the list of characters).", source);
        else if (!animes.length) add("error", where, "animearray is empty.", source);
        if (raw.looptime != null && (isNaN(Number(raw.looptime)) || Number(raw.looptime) <= 0)) add("error", where, `looptime "${raw.looptime}" is not a positive number (milliseconds).`, source);
        if (raw.looptime == null && raw.bpm == null) add("warning", where, "Neither looptime nor bpm is set: the default 8000 ms loop is used.", source);
        if (raw.totalframe != null && isNaN(Number(raw.totalframe))) add("error", where, `totalframe "${raw.totalframe}" is not a number.`, source);
        if (raw.colors && (!Array.isArray(raw.colors) || raw.colors.length < 6)) add("warning", where, "colors should be a list of at least 6 colors.", source);
        const totalframe = Number(raw.totalframe || 384);

        const sound = name => {
            const list = [`${folder}sound/${sndExt}/${name}.${sndExt}`];
            if (sndExt === "mp3") list.push(`${folder}sound/ogg/${name}.ogg`);
            return list;
        };

        const names = new Map();
        animes.forEach(a => a && a.name && names.set(a.name, (names.get(a.name) || 0) + 1));
        names.forEach((count, name) => {
            if (count > 1) add("info", `${where} · ${name}`, `Used by ${count} characters (they share the same files and sounds). Fine for placeholders.`, source);
        });
        const checked = new Set();
        for (let i = 0; i < animes.length; i++) {
            const a = animes[i] || {};
            const label = `${where} · ${a.name || "#" + i}`;
            typoCheck(a, ANIME_KEYS, label, add, source);
            if (!a.name) {
                add("error", `${where} · character ${i}`, "Character has no name.", source);
                continue;
            }
            if (a.color != null && !/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(String(a.color))) add("warning", label, `color "${a.color}" is not a hex color.`, source);

            if (checked.has(a.name)) continue;
            checked.add(a.name);
            requireFile(`${folder}anime/${a.name}.json`, "error", label, "Animation data (anime JSON) not found");
            const sprite = modboxNaming ? `${a.name}.png` : `${a.name}-sprite.png`;
            requireFile(`${folder}anime/${sprite}`, "error", label, "Animation sprite not found");
            if (modboxNaming && format.includes("ld")) requireFile(`${folder}anime/${withSuffix(sprite, "-ld")}`, "warning", label, 'Low-res sprite (-ld) not found: used when HD mode is off');
            if (!modboxNaming && format.includes("hd")) requireFile(`${folder}anime/${withSuffix(sprite, "-hd")}`, "warning", label, "HD sprite (-hd) not found: used in HD mode");
            requireFile(sound(`${a.name}_a`), "error", label, "Sound A not found");
            if (!a.uniqsnd) requireFile(sound(`${a.name}_b`), "error", label, 'Sound B not found (or set "uniqsnd": true if it has only one)');
            if (a.hasAlt === true || a.hasAlt === "true" || a.hasAlt === "soundOnly") requireFile(`${folder}sound/${sndExt}/alt/${a.name}_a.${sndExt}`, "warning", label, "Alt sound not found (hasAlt)");
            if (a.hasAlt === true || a.hasAlt === "true" || a.hasAlt === "animeOnly") requireFile(`${folder}anime/alt/${a.name}.json`, "warning", label, "Alt animation not found (hasAlt)");

            await checkAnimeJSON(`${folder}anime/${a.name}.json`, label, totalframe, folder, a.name, add, requireFile);
        }

        const codes = new Map();
        bonuses.forEach((b, i) => {
            b = b || {};
            const label = `${where} · bonus ${i + 1}${b.title || b.name ? ` (${b.title || b.name})` : ""}`;
            typoCheck(b, BONUS_KEYS, label, add, source);
            const code = typeof b.code === "string" ? b.code.split(",").map(s => parseInt(s.trim())) : b.code;
            if (!Array.isArray(code) || !code.length) {
                add("error", label, "code is missing (the picto numbers that unlock it).", source);
            } else {
                const bad = code.filter(n => !Number.isInteger(n) || n < 1 || n > animes.length);
                if (bad.length) add("error", label, `code uses ${bad.join(", ")}: picto numbers go from 1 to ${animes.length}.`, source);
                if (code.length > nbpolo) add("error", label, `code needs ${code.length} characters but only ${nbpolo} polos fit on stage.`, source);
                if (new Set(code).size !== code.length) add("warning", label, "code has the same picto twice.", source);
                const key = [...code].sort((x, y) => x - y).join(",");
                if (codes.has(key)) add("warning", label, `Same code as bonus ${codes.get(key)}.`, source);
                codes.set(key, i + 1);
            }
            if (!b.sound) add("error", label, "sound is missing.", source);
            else requireFile(sound(b.sound), "error", label, "Bonus sound not found");
            const aspire = b.aspire || b.predrop;
            if (aspire) requireFile(sound(aspire), "error", label, "Bonus intro sound (aspire/predrop) not found");
            if (b.expire) requireFile(sound(b.expire), "error", label, "Bonus outro sound (expire) not found");

            let video = (!b.title && b.src) ? b.src : (b.name || b.src || "");
            if (!video) {
                add("error", label, "No video: set src (or name in Modbox format).", source);
            } else {
                if (!/\.[a-z0-9]+$/i.test(video)) video += "." + vidExt;
                requireFile([`${folder}video/${video}`, `${folder}bonus/${video}`], "error", label, "Bonus video not found (in video/ or bonus/)");
                if (modboxNaming && format.includes("ld")) requireFile([`${folder}video/${withSuffix(video, "-ld")}`, `${folder}bonus/${withSuffix(video, "-ld")}`], "warning", label, "Low-res video (-ld) not found: used when HD mode is off");
                if (!modboxNaming && format.includes("hd")) requireFile([`${folder}video/${withSuffix(video, "-hd")}`, `${folder}bonus/${withSuffix(video, "-hd")}`], "warning", label, "HD video (-hd) not found: used in HD mode");
            }
        });

        requireFile(imgCandidates(folder, raw.background || "game-bck.jpg"), "warning", where, "Stage background (background) not found");
        requireFile(imgCandidates(folder, raw.gamePicto || "game-picto.png"), "warning", where, "Picto icons sprite (gamePicto) not found");
        requireFile(imgCandidates(folder, raw.homeScreen || "home-screen.jpg"), "warning", where, "Home screen image (homeScreen) not found");
        if (raw.customTitle) requireFile(imgCandidates(folder, raw.homeTitre || "home-titre.png"), "warning", where, "Custom title image (homeTitre) not found");
        if (raw.customVersion) requireFile(imgCandidates(folder, raw.homeVersion || "home-version.png"), "warning", where, "Custom version image (homeVersion) not found");
        const poloSprite = raw.poloTShirts ? (raw.poloSprite ? withSuffix(raw.poloSprite, "-tshirt") : "polo-sprite-tshirt.png") : (raw.poloSprite || "polo-sprite.png");
        requireFile(`img/${modboxNaming ? "modbox/" : ""}${poloSprite}`, "error", where, "Polo sprite (poloSprite) not found");
    }

    async function checkAnimeJSON(path, label, totalframe, folder, name, add, requireFile) {
        const text = await readText(path);
        if (text == null) return;
        const parsed = parseJSON(text);
        if (parsed.error) {
            add("error", label, `Anime JSON syntax error: ${parsed.error}`, path);
            return;
        }
        const d = parsed.data || {};
        typoCheck(d, ANIME_JSON_KEYS, label, add, path);
        if (!Array.isArray(d.arrayFrame) || !d.arrayFrame.length) {
            add("error", label, "arrayFrame is missing or empty.", path);
            return;
        }
        if (d.headHeight == null || isNaN(Number(d.headHeight))) add("error", label, "headHeight is missing (the height of the animated head).", path);
        const frames = d.arrayFrame.length;
        if (d.totalFrame != null && Number(d.totalFrame) !== frames) add("warning", label, `totalFrame says ${d.totalFrame} but arrayFrame has ${frames} frames.`, path);
        const half = Math.floor(totalframe / 2);
        if (frames < half) add("warning", label, `Only ${frames} frames: one loop needs ${half} (totalframe ${totalframe} / 2), so the animation freezes on its last frame.`, path);
        else if (frames > half && frames < totalframe) add("info", label, `${frames} frames: frames ${half}-${frames - 1} are never shown (the 2nd loop only uses its own frames when there are ${totalframe}).`, path);

        const missingCues = new Set();
        for (let i = 0; i < frames; i++) {
            const f = d.arrayFrame[i];
            const prop = f && typeof f.prop === "string" ? f.prop.split(",") : null;
            if (!prop || prop.length < 4 || prop.slice(0, 4).some(v => v.trim() === "" || isNaN(Number(v)))) {
                add("error", label, `Frame ${i}: "prop" must be "x,y,headX,headY" (got ${JSON.stringify(f && f.prop)}).`, path);
                break;
            }
            const cue = (prop[4] || "").trim().replace(/^\[|\]$/g, "");
            if (cue && typeof window[cue] !== "function") missingCues.add(cue);
        }
        missingCues.forEach(cue => add("warning", label, `A frame calls ${cue}(), which isn't defined (mod.js).`, path));

        if (d.hasStartup) requireFile(`${folder}anime/startups/${name}_startup.xml`, "error", label, "hasStartup is on but the startup animation XML is missing");
        if (d.hasExit) requireFile(`${folder}anime/exits/${name}_exit.xml`, "error", label, "hasExit is on but the exit animation XML is missing");
    }

    function checkHooks(add, versionInfo) {
        const engine = window.__engineGlobals;
        if (!engine) return;
        const knownVersions = Object.keys(versionInfo).map(Number);
        const modFunctions = Object.getOwnPropertyNames(window).filter(n => !engine.has(n) && typeof window[n] === "function");
        const hookSet = new Set(HOOKS);
        for (const name of modFunctions) {
            const shape = name.replace(/\d+/g, "#");
            const nums = (name.match(/\d+/g) || []).map(Number);
            if (hookSet.has(shape)) {
                if (/^(on|off)V#/.test(shape) && knownVersions.length && !knownVersions.includes(nums[0])) {
                    add("warning", "mod.js", `${name}() is for v${nums[0]}, which isn't in versions.xml.`, "js/mod.js");
                    continue;
                }
                const info = versionInfo[nums[0]];
                if (info && /Polo#/.test(shape) && nums[1] >= info.animes) {
                    add("warning", "mod.js", `${name}(): v${nums[0]} only has pictos 0-${info.animes - 1} (polo hooks count from 0).`, "js/mod.js");
                }
                if (info && /Bonus#/.test(shape) && (nums[1] < 1 || nums[1] > info.bonuses)) {
                    add("warning", "mod.js", `${name}(): v${nums[0]} has bonuses 1-${info.bonuses} (bonus hooks count from 1).`, "js/mod.js");
                }
                continue;
            }
            if (!/^(on|off|_load)/i.test(name)) continue;
            const guess = closest(shape, HOOKS);
            if (guess) {
                let i = 0;
                const suggestion = guess.replace(/#/g, () => nums[i++] ?? "N");
                add("warning", "mod.js", `${name}() never runs: it isn't a hook name. Did you mean ${suggestion}()?`, "js/mod.js");
            }
        }
    }

    function injectStyle() {
        if (document.getElementById("mod-checker-style")) return;
        const style = document.createElement("style");
        style.id = "mod-checker-style";
        style.textContent = `
#mod-checker { position: fixed; inset: 0; z-index: 2147483000; display: flex; align-items: center; justify-content: center;
    background: rgba(0,0,0,.55); font-family: "Poppins", "Segoe UI", sans-serif; }
#mod-checker .mc-panel { width: min(860px, calc(100vw - 32px)); max-height: calc(100vh - 48px); display: flex; flex-direction: column;
    background: #1c1c1f; color: #e8e8ea; border-radius: 14px; box-shadow: 0 20px 60px rgba(0,0,0,.5); overflow: hidden; }
#mod-checker .mc-head { display: flex; align-items: center; gap: 12px; padding: 16px 20px; border-bottom: 1px solid #2e2e33; }
#mod-checker .mc-title { font-weight: 600; font-size: 17px; flex: 1; }
#mod-checker .mc-sum { display: flex; gap: 8px; font-size: 13px; }
#mod-checker .mc-pill { padding: 3px 10px; border-radius: 99px; background: #2a2a2f; }
#mod-checker .mc-pill.error { background: #4a1d20; color: #ff9a9e; }
#mod-checker .mc-pill.warning { background: #45360f; color: #ffd36b; }
#mod-checker .mc-pill.ok { background: #173b26; color: #7ee2a3; }
#mod-checker .mc-list { overflow-y: auto; padding: 8px 12px; }
#mod-checker .mc-row { display: grid; grid-template-columns: 74px 1fr; gap: 4px 12px; padding: 10px 8px; border-bottom: 1px solid #26262b; font-size: 13.5px; line-height: 1.4; }
#mod-checker .mc-row:last-child { border-bottom: 0; }
#mod-checker .mc-badge { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; padding-top: 2px; }
#mod-checker .mc-badge.error { color: #ff7a80; } #mod-checker .mc-badge.warning { color: #ffc940; } #mod-checker .mc-badge.info { color: #8ab4ff; }
#mod-checker .mc-where { color: #a9a9b2; font-size: 12px; }
#mod-checker .mc-file { grid-column: 2; font-family: Consolas, "Courier New", monospace; font-size: 12px; color: #8d8d96; word-break: break-all; }
#mod-checker .mc-empty { padding: 40px 20px; text-align: center; color: #7ee2a3; font-size: 15px; }
#mod-checker .mc-foot { display: flex; gap: 8px; align-items: center; padding: 12px 20px; border-top: 1px solid #2e2e33; font-size: 12px; color: #8d8d96; }
#mod-checker .mc-foot span { flex: 1; }
#mod-checker button { font: inherit; font-size: 13px; color: #e8e8ea; background: #2e2e34; border: 0; border-radius: 8px; padding: 7px 14px; cursor: pointer; }
#mod-checker button:hover { background: #3a3a42; }
#mod-checker button.mc-primary { background: #3d5afe; } #mod-checker button.mc-primary:hover { background: #5470ff; }`;
        document.head.appendChild(style);
    }

    const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

    function reportText(r) {
        return [`Mod check: ${r.errors} errors, ${r.warnings} warnings, ${r.infos} notes`]
            .concat(r.entries.map(e => `[${e.level.toUpperCase()}] ${e.where}: ${e.msg}${e.file ? `  (${e.file})` : ""}`)).join("\n");
    }

    function render(r) {
        injectStyle();
        let root = document.getElementById("mod-checker");
        if (!root) {
            root = document.createElement("div");
            root.id = "mod-checker";
            root.addEventListener("pointerdown", e => { if (e.target === root) close(); });
            document.body.appendChild(root);
        }
        const pills = r ? (r.errors + r.warnings === 0
            ? `<span class="mc-pill ok">All good</span>`
            : `${r.errors ? `<span class="mc-pill error">${r.errors} error${r.errors > 1 ? "s" : ""}</span>` : ""}${r.warnings ? `<span class="mc-pill warning">${r.warnings} warning${r.warnings > 1 ? "s" : ""}</span>` : ""}`)
            + (r.infos ? `<span class="mc-pill">${r.infos} note${r.infos > 1 ? "s" : ""}</span>` : "") : "";
        const body = !r
            ? `<div class="mc-empty" style="color:#a9a9b2">Checking…</div>`
            : r.entries.length === 0
                ? `<div class="mc-empty">No problems found in ${r.versions.length} version${r.versions.length === 1 ? "" : "s"}.</div>`
                : r.entries.map(e => `<div class="mc-row"><div class="mc-badge ${e.level}">${e.level}</div><div><div class="mc-where">${esc(e.where)}</div>${esc(e.msg)}</div>${e.file ? `<div class="mc-file">${esc(e.file)}</div>` : ""}</div>`).join("");
        const foot = r ? `${r.filesChecked} files checked in ${r.ms} ms${r.caseChecked ? "" : " · capitalization is only checked in the desktop app"}` : "";
        root.innerHTML = `<div class="mc-panel" role="dialog" aria-label="Mod check">
            <div class="mc-head"><div class="mc-title">Mod check</div><div class="mc-sum">${pills}</div></div>
            <div class="mc-list">${body}</div>
            <div class="mc-foot"><span>${foot}</span>
                <button data-a="copy">Copy report</button><button data-a="run">Check again</button><button class="mc-primary" data-a="close">Close</button></div>
        </div>`;
        root.querySelector('[data-a="close"]').onclick = close;
        root.querySelector('[data-a="run"]').onclick = () => open();
        root.querySelector('[data-a="copy"]').onclick = e => {
            if (!report) return;
            const text = reportText(report);
            const done = () => { e.target.textContent = "Copied!"; setTimeout(() => { e.target.textContent = "Copy report"; }, 1500); };
            (window.electron?.ipc?.clipboard ? window.electron.ipc.clipboard(text) : navigator.clipboard.writeText(text)).then(done, done);
        };
    }

    function close() {
        document.getElementById("mod-checker")?.remove();
    }

    async function open() {
        render(null);
        const r = await run();
        render(r);
        console.log(reportText(r));
        return r;
    }

    document.addEventListener("keydown", e => {
        if (e.key === "Escape" && document.getElementById("mod-checker")) close();
    });

    return { run, open, close, reportText };
})();

/** Checks the mod and returns the report ({ entries, errors, warnings, ... }) without showing it. */
function runModCheck() {
    return ModChecker.run();
}
/** Checks the mod and shows the report panel. */
function openModChecker() {
    return ModChecker.open();
}

onKey("F8", () => {
    if (document.getElementById("mod-checker")) ModChecker.close();
    else ModChecker.open();
}, false, true, "Check the mod for mistakes");

window.addEventListener("load", () => {
    if (typeof isLiveReloadOn !== "function" || !isLiveReloadOn()) return;
    setTimeout(async () => {
        const r = await ModChecker.run();
        console.log(ModChecker.reportText(r));
        if (r.errors + r.warnings > 0 && typeof toast !== "undefined" && toast.show) {
            toast.show("Mod check", 6, `${r.errors} error(s), ${r.warnings} warning(s). Press F8 to see them.`);
        }
    }, 1500);
});
