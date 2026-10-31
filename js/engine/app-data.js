/*
 * app-data.js
 * Loading and normalizing a version's data (the "app" object).
 * Versions come from js/apps.js (versions.vX = {...}), or from asset-vX/app.json (Modbox format)
 * or asset-vX/app.js (legacy format). translateModboxFormat() fills in defaults for every field.
 */

console.log("%c♫ Powered by incredibox.com", "color:#FFF; background-color:#25447F; padding:2px 10px 2px 6px; font-family: Allan, sans-serif; font-size: 1.6rem; letter-spacing: 0.5rem; font-weight: bold;");
console.log("%c♫ Modding Build by Joalor64 https://joalor64.github.io/", "color:#FFF; background-color:#25447F; font-family: Allan, sans-serif; padding:2px 10px 2px 6px; font-size: 1.2rem; letter-spacing: 0.1rem;");
window.isModboxApp = false;
var versions = {};
/** Turns versions["v" + appVersion] (or `app`) into the final `app` object used by the engine. */
function initVersions() {
    versions.total = Object.keys(versions).length;

    const appData = versions["v" + appVersion] || app;

    if (!appData) {
        popupGeneralError({
            error: "init versions",
            action: "kill"
        });
        return;
    }

    app = translateModboxFormat(appData);
    normalizeLegacyApp();

    app.animearray.forEach(function (e, o) {
        e.soundA = e.name + "_a";
        e.soundB = e.uniqsnd ? e.name + "_a" : e.name + "_b";
        let spritePostfix = app.useModboxAnimeNaming ? "" : "-sprite";
        e.anime = e.name + spritePostfix + ".png";
        e.animeData = e.name + ".json";
    });

    if (app.looptime == null || isNaN(app.looptime)) {
        let timeSignature = app.timeSignature || [4, 4];
        app.looptime = Math.floor((60000 / app.bpm) * (timeSignature[0] / timeSignature[1]) * 4);
    }

    app.recmaxloop = Math.round(180 / (app.looptime / 1000));
    app.recminloop = Math.round(20 / (app.looptime / 1000));
    app.recmintime = Math.round(app.recminloop * (app.looptime / 1000));
    app.recminloop = appBrowserDemo ? 0 : app.recminloop;
    app.maxrecloop = app.maxrecloop ? app.maxrecloop : 24;
}
function translateModboxFormat(modboxApp) {
    const translated = {
        ...modboxApp,

        name: modboxApp.name || "Unknown",
        version: modboxApp.version || app?.version || getVersionFromURL(),
        folder: modboxApp.folder || `asset-v${appVersion}/`,
        bpm: modboxApp.bpm || 120,
        looptime: modboxApp.looptime || 8000,
        totalframe: modboxApp.totalframe || 384,
        timeSignature: modboxApp.timeSignature || [4, 4],
        format: modboxApp.format || ["mp3", "mp4", "ld", "hd"],
        sndExt: modboxApp.sndExt || "mp3",
        vidExt: modboxApp.vidExt || "mp4",
        bonusloopA: modboxApp.bonusloopA !== undefined ? modboxApp.bonusloopA : true,
        bonusendloopA: modboxApp.bonusendloopA !== undefined ? modboxApp.bonusendloopA : false,
        nbloopbonus: modboxApp.nbloopbonus || 1,
        colors: modboxApp.colors || ["#D8A365", "#BA7B3D", "#A16224", "#6A3501", "#422101", "#201200"],
        colBck: modboxApp.colBck || (modboxApp.colors ? modboxApp.colors[5] : "#201200"),
        col0: modboxApp.col0 || (modboxApp.colors ? modboxApp.colors[0] : "#D8A365"),
        col1: modboxApp.col1 || (modboxApp.colors ? modboxApp.colors[1] : "#BA7B3D"),
        col2: modboxApp.col2 || (modboxApp.colors ? modboxApp.colors[2] : "#A16224"),
        col3: modboxApp.col3 || (modboxApp.colors ? modboxApp.colors[3] : "#6A3501"),
        col4: modboxApp.col4 || (modboxApp.colors ? modboxApp.colors[4] : "#422101"),
        colDarkBck: modboxApp.colDarkBck || (modboxApp.colors ? modboxApp.colors[6] : ""),
        background: modboxApp.background || "game-bck.jpg",
        gamePicto: modboxApp.gamePicto || "game-picto.png",
        poloSprite: modboxApp.poloSprite || "polo-sprite.png",
        poloTShirts: modboxApp.poloTShirts || false,
        homeScreen: modboxApp.homeScreen || "home-screen.jpg",
        homeTitre: modboxApp.homeTitre || "home-titre.png",
        homeVersion: modboxApp.homeVersion || "home-version.png",
        customTitle: modboxApp.customTitle !== undefined ? modboxApp.customTitle : false,
        customVersion: modboxApp.customVersion !== undefined ? modboxApp.customVersion : false,
        pictoRadius: modboxApp.pictoRadius || "18%",
        backgroundRadius: modboxApp.backgroundRadius || "0",
        useModboxAnimeNaming: modboxApp.useModboxAnimeNaming != null ? modboxApp.useModboxAnimeNaming : (window.isModboxApp ? true : false),
        nbpolo: modboxApp.nbpolo || 7,
        pictoRowMax: modboxApp.pictoRowMax || 10,
        credit: modboxApp.credit || {},

        animearray: translateAnimeArray(modboxApp.animearray || []),
        bonusarray: translateBonusArray(modboxApp.bonusarray || [])
    };

    return translated;
}
function translateAnimeArray(animearray) {
    return animearray.map(anime => ({
        ...anime,
        name: anime.name || "",
        color: String(anime.color || "FFFFFF").replace('#', '') || "FFFFFF",
        uniqsnd: anime.uniqsnd || false,
        icon: anime.icon || "",
        ignored: anime.ignored || false,
        hasAlt: anime.hasAlt || false
    }));
}
function translateBonusArray(bonusarray) {
    return bonusarray.map(function (bonus) {
        if (!bonus.title && bonus.src) {
            return {
                ...bonus,
                aspire: bonus.aspire || bonus.predrop || "",
                predrop: undefined
            };
        }

        var assetId = bonus.name;
        var displayName = bonus.title;

        var bonusAssetId = assetId || bonus.src || "";

        return {
            ...bonus,

            name: displayName || assetId || "",
            src: bonusAssetId,
            aspire: bonus.predrop || bonus.aspire || "",

            title: undefined,
            predrop: undefined,

            code: typeof bonus.code === "string"
                ? bonus.code.split(',').map(function (s) { return parseInt(s.trim()); })
                : (bonus.code || []),
            sound: bonus.sound || "",
            loop: bonus.loop || 1,
            fade: bonus.fade != null ? bonus.fade : true,
            svg: bonus.svg || "",
            icon: bonus.icon || bonusAssetId || ""
        };
    });
}
function normalizeLegacyApp() {
    app.folder = app.folder || `asset-v${appVersion}/`;
    app.format = app.format || ["mp3", "mp4", "ld", "hd"];
    app.bonusarray = app.bonusarray || [];
    app.animearray = app.animearray || [];
    app.colors = [
        app.col0 || (app.colors && app.colors[0]) || "#D8A365",
        app.col1 || (app.colors && app.colors[1]) || "#BA7B3D",
        app.col2 || (app.colors && app.colors[2]) || "#A16224",
        app.col3 || (app.colors && app.colors[3]) || "#6A3501",
        app.col4 || (app.colors && app.colors[4]) || "#422101",
        app.colBck || (app.colors && app.colors[5]) || "#201200",
        app.colDarkBck || (app.colors && app.colors[6]) || ""
    ];

    app.bonusarray.forEach(function (e) {
        if (typeof e.code === "string") {
            e.code = e.code.split(',').map(function (s) { return parseInt(s.trim()); });
        }
        if (typeof e.src === "string" && !/\.[a-z0-9]+$/i.test(e.src)) {
            e.src = e.src + "." + (app.format[1] || vidExt);
        }
    });
}
/**
 * Loads a version that is not in js/apps.js: tries asset-vX/app.json (Modbox format) first,
 * then asset-vX/app.js (legacy format). Calls `e` once `app` is ready.
 */
function loadAppFile(e) {
    const tryLoadJSON = () => {
        $.ajax({
            url: "./asset-v" + appVersion + "/app.json",
            dataType: "json",
            success: function (jsonData) {
                window.isModboxApp = true;

                versions["v" + appVersion] = jsonData;

                initVersions();

                if (e) e();
            },
            error: tryLoadJS
        });
    };

    const tryLoadJS = () => {
        $.getScript("./asset-v" + appVersion + "/app.js").done(function () {
            versions["v" + appVersion] = app;
            initVersions();

            if (e) e();
        }).fail(function (err, o, t) {
            boxDialog.open("App file not found (neither app.json nor app.js). Please reload or force to quit the app then retry.", "ERROR", ["Reload"], [gotoAppUrl], true);
            removeFadeAll();
        });
    };

    tryLoadJSON();
}
