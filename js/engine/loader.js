/*
 * loader.js
 * Asset preloading for a version: sounds, polo animations (sprites + JSON), startup/exit animations,
 * bonus videos and images, with img/image and video/bonus folder fallbacks.
 * preparerArray() builds the list, checkTabToLoad() loads it one by one.
 */

var tabBuffer;
var tabAnime;
var tabStartups;
var tabExits;
var nbSound;
var nbSoundBonus;
var nbSoundTotal;
var nbBonus;
var nbAnime;
var nbData;
var cntTotalAsset;
var nbTotalAsset;
var tabToLoad;
var cntLoad;
var listImages = {};
var tShirtPolos = false;

function pushOptionalImage(keyname, path) {
    function tryLoad(currentPath, isFallback) {
        var img = new Image();
        img.onload = function () {
            listImages[keyname] = this;
        };
        img.onerror = function () {
            if (!isFallback) {
                var fallback = getAssetFallback(currentPath);
                if (fallback) {
                    tryLoad(fallback, true);
                    return;
                }
            }
            console.log("Optional image not found", currentPath);
        };
        img.src = currentPath;
    }
    tryLoad(path, false);
}

function optionalEl(id, cb) {
    const el = document.getElementById(id);
    if (el) cb(el);
}

function optionalQuery(id, cb) {
    const el = document.querySelector(id);
    if (el) cb(el);
}


function preparerArray() {
    frameTotal = app.totalframe;
    frameHalf = frameTotal / 2;
    tabBuffer = {};
    tabAnime = [];
    tabStartups = [];
    tabExits = [];
    tShirtPolos = app.poloTShirts;
    nbSound = app.animearray.length;
    nbSoundBonus = app.bonusarray.length;
    nbSoundTotal = nbSound * 2 + nbSoundBonus + 1;
    nbBonus = app.bonusarray.length;
    nbAnime = app.animearray.length;
    nbData = app.animearray.length;
    nbTotalAsset = nbSoundTotal + nbBonus + nbAnime + nbData + 2;
    tabToLoad = [];
    var e = cntLoad = cntTotalAsset = 0;
    var o = "";
    const config = getVersionConfig();

    function getExt(key, fallback = "png") {
        var ext = config[key] || fallback;
        return ext.toString().replace(".", "").toLowerCase().trim();
    }

    tabBuffer.sound = [];
    e = 0;
    for (; e < nbSound; e++) {
        tabBuffer.sound.push({
            sndA: 0,
            sndB: 0
        });
        tabAnime.push({
            imgSprite: null,
            coverImgData: null,
            ratio: null,
            width: null,
            height: null,
            headWidth: null,
            headHeight: null,
            bat: null,
            version: null,
            upsideDown: null,
            shakeAnim: null,
            dontWearHat: null,
            totalFrames: null,
            width: null,
            height: null,
            waitingPictoOffsetY: null,
            poloStartTween: null,
            movingStaticBody: null,
            onlyXBody: null,
            onlyYBody: null,
            invertXBody: null,
            invertYBody: null,
            renderWaitingBody: null,
            hasAlt: null,
            imgData: null,
            cover: null,
            coverWidth: null,
            coverHeight: null,
            color: app.animearray[e].color.replace('#', '')
        });
    }
    tabBuffer.bonus = [];
    e = 0;
    for (; e < nbSoundBonus; e++) {
        tabBuffer.bonus.push({
            snd: 0,
            aspire: 0,
            expire: 0
        });
    }
    tabBuffer.metro = [{
        snd: 0
    }];
    let modboxPath = app.useModboxAnimeNaming ? "modbox/" : "";
    tabToLoad = [{
        func: loadImage,
        params: {
            keyname: "spritePolo",
            path: "./img/" + modboxPath + renameFile(app.poloTShirts && app.poloSprite ? getTshirtSprite(app.poloSprite) : app.poloSprite ? app.poloSprite : app.poloTShirts ? "polo-sprite-tshirt.png" : "polo-sprite.png")
        }
    }, {
        func: loadImage,
        params: {
            keyname: "gameBck",
            path: auto2xPath("./" + app.folder + `img/${app.background ? app.background : "game-bck.jpg"}`)
        }
    }, {
        func: loadImage,
        params: {
            keyname: "gamePicto",
            path: auto2xPath("./" + app.folder + `img/${app.gamePicto ? app.gamePicto : "game-picto.png"}`)
        }
    }];

    pushOptionalImage("gameFrontTop", "./" + app.folder + "img/game-front-top." + getExt("gameFrontTop"));
    pushOptionalImage("gameFrontBot", "./" + app.folder + "img/game-front-bot." + getExt("gameFrontBot"));
    pushOptionalImage("gameBehindTop", "./" + app.folder + "img/game-behind-top." + getExt("gameBehindTop"));
    pushOptionalImage("gameBehindBot", "./" + app.folder + "img/game-behind-bot." + getExt("gameBehindBot"));
    pushOptionalImage("boxMiddle", "./" + app.folder + "img/box-middle." + getExt("boxMiddle"));
    pushOptionalImage("boxTop", "./" + app.folder + "img/box-top-bck." + getExt("boxTop"));
    pushOptionalImage("boxTopBck1", "./" + app.folder + "img/box-top-bck1." + getExt("boxTopBck1"));
    pushOptionalImage("boxTopBck2", "./" + app.folder + "img/box-top-bck2." + getExt("boxTopBck2"));
    pushOptionalImage("boxBottom", "./" + app.folder + "img/box-bottom-bck." + getExt("boxBottom"));

    if (miniPlayer && appVersion > 4) {
        tabToLoad.pop();
    }
    e = 0;
    for (; e < nbSound; e++) {
        if (app.animearray[e].uniqsnd) {
            tabToLoad.push({
                func: loadSound,
                params: ["sound", app.animearray[e].soundA, e, "sndA", true]
            });
            nbTotalAsset--;
        } else {
            tabToLoad.push({
                func: loadSound,
                params: ["sound", app.animearray[e].soundA, e, "sndA"]
            });
            tabToLoad.push({
                func: loadSound,
                params: ["sound", app.animearray[e].soundB, e, "sndB"]
            });
        }
    }
    for (e = 0; e < nbSoundBonus; e++) {
        tabToLoad.push({
            func: loadSound,
            params: ["bonus", app.bonusarray[e].sound, e, "snd"]
        });
        var aspireSrc = app.bonusarray[e].aspire || app.bonusarray[e].predrop;
        if (aspireSrc) {
            tabToLoad.push({
                func: loadSound,
                params: ["bonus", aspireSrc, e, "aspire"]
            });
        }
        if (app.bonusarray[e].expire) {
            tabToLoad.push({
                func: loadSound,
                params: ["bonus", app.bonusarray[e].expire, e, "expire"]
            });
        }
        var bonusVideoSrc = app.bonusarray[e].src || app.bonusarray[e].name;
        o = renameFile(bonusVideoSrc);
        tabToLoad.push({
            func: loadVideoBonus,
            params: [o, e]
        });
    }
    for (e = 0; e < nbAnime; e++) {
        o = app.animearray[e].animeData;
        tabToLoad.push({
            func: loadAnimeData,
            params: [o, e]
        });
        o = renameFile(app.animearray[e].anime);
        tabToLoad.push({
            func: loadAnime,
            params: [o, e]
        });
    }
    checkTabToLoad();
}
function getTshirtSprite(filename) {
    if (!filename) return "";
    if (filename.endsWith(".png")) {
        return filename.slice(0, -4) + "-tshirt.png";
    }
    return filename + "-tshirt.png";
}
function checkTabToLoad() {
    updatePreload();
    if (cntLoad < tabToLoad.length) {
        tabToLoad[cntLoad].func(tabToLoad[cntLoad].params);
        cntLoad++;
    }
}
function updatePreload() {
    cntTotalAsset++;
    var e = (e = Math.round(cntTotalAsset / nbTotalAsset * 100)) < 5 ? 5 : e;
    $homeLoadbar.css({
        width: String(e > 100 ? 100 : e) + "%"
    });
    if (cntTotalAsset == nbTotalAsset && (createGame(), hideHomeLoadbar(), isIframe)) {
        callParentWindow("appLoadingComplete");
    }
}

function preloadDualAssets(params) {
    var animeName = params[0];
    var index = params[1];
    var doStartup = params[2];
    var doExit = params[3];

    var promises = [];

    if (doStartup) {
        promises.push(
            loadStartupXML(animeName).then(function (frameData) {
                if (frameData && frameData.length > 0) {
                    tabStartups[animeName] = tabStartups[animeName] || {};
                    tabStartups[animeName].startupData = frameData;
                    tabStartups[animeName].hasStartupAuto = true;
                    loadBackgroundStartupSprite(animeName + "_startup.png", animeName, "startupImg");
                    loadBackgroundStartupSprite(animeName + "_startup-shadow.png", animeName, "startupShadowImg");
                }
            })
        );
    }

    if (doExit) {
        promises.push(
            loadExitXML(animeName).then(function (frameData) {
                if (frameData && frameData.length > 0) {
                    tabExits[animeName] = tabExits[animeName] || {};
                    tabExits[animeName].exitData = frameData;
                    tabExits[animeName].hasExitAuto = true;
                    var exitFileName = animeName + "_exit";
                    loadBackgroundExitSprite(animeName, exitFileName + ".png", "exitImg");
                    loadBackgroundExitSprite(animeName, exitFileName + "-shadow.png", "exitShadowImg");
                }
            })
        );
    }

    Promise.all(promises).then(function () {
        console.log("[Pipeline Complete] Successfully processed combined assets for: " + animeName);
        updatePreload();
        if (cntLoad < tabToLoad.length) {
            tabToLoad[cntLoad].func(tabToLoad[cntLoad].params);
            cntLoad++;
        }
    }).catch(function (err) {
        console.error("[Pipeline Error] Combined asset loading failed for " + animeName + ":", err);
        updatePreload();
        if (cntLoad < tabToLoad.length) {
            tabToLoad[cntLoad].func(tabToLoad[cntLoad].params);
            cntLoad++;
        }
    });
}

function loadBackgroundStartupSprite(fileName, index, keyName) {
    var img = new Image();
    img.onload = function () {
        tabStartups[index] = tabStartups[index] || {};
        tabStartups[index][keyName] = img;
        console.log("Background Startup Asset Cached: " + fileName);
    };
    img.onerror = function () {
        console.error("Preload Failed for Startup Asset: " + fileName);

        tabStartups[index] = tabStartups[index] || {};
        tabStartups[index][keyName] = null;

        popupGeneralError({
            error: "Missing startup asset: " + fileName,
            action: "reload"
        });
    };
    img.src = renameFile(startupsFolder + "/" + fileName);
}

function loadBackgroundExitSprite(animeName, fileName, keyName) {
    var img = new Image();
    img.onload = function () {
        tabExits[animeName] = tabExits[animeName] || {};
        tabExits[animeName][keyName] = img;
        console.log("Background Exit Asset Cached: " + fileName);
    };
    img.onerror = function () {
        console.warn("Exit Asset variant path missed: " + fileName);

        tabExits[animeName] = tabExits[animeName] || {};

        if (keyName === "exitShadowImg") {
            tabExits[animeName][keyName] = tabExits[animeName]["exitImg"] || null;
        } else {
            tabExits[animeName][keyName] = null;
            tabExits[animeName].hasExitAuto = false;

            popupGeneralError({
                error: "Missing main exit asset: " + fileName,
                action: "reload"
            });
        }
    };
    img.src = renameFile(exitsFolder + "/" + fileName);
}

function loadSound(e, currentExt) {
    var o = e[0];
    var t = e[1];
    var n = e[2];
    var i = e[3];
    var a = currentExt || app.format[0] || sndExt;
    var s = !isnull(e[4]) && e[4];
    var poloData = tabAnime[n];
    var altFlag = (tabAnime[n] && tabAnime[n].hasAlt) || (app.animearray[n] && app.animearray[n].hasAlt);
    var poloHasAlt = altFlag === "true" || altFlag === true || altFlag === "soundOnly";
    var useAltTrack = expAltModeOn && poloHasAlt;
    var altFolder = useAltTrack ? "/alt/" : "/";
    var r = "./" + app.folder + "sound/" + a + altFolder + t + "." + a;
    var l = new XMLHttpRequest();
    var fallbackExt = currentExt;
    l.open("GET", r, true);
    l.responseType = "arraybuffer";
    l.onload = function () {
        if (l.status >= 400) {
            handleFailure();
            return;
        }
        audioCtx.decodeAudioData(l.response, function (eData) {
            app.detectedSndExt = a;
            tabBuffer[o][n][i] = eData;
            if (s) {
                tabBuffer[o][n].sndB = eData;
            }
            checkTabToLoad();
        }, function (err) {
            console.warn("Decoding failed for " + a + ", trying fallback...");
            handleFailure();
        });
    };
    l.onerror = function () {
        handleFailure();
    };
    function handleFailure() {
        if (a === "mp3") {
            console.log("MP3 failed for " + t + ". Retrying with OGG...");
            loadSound(e, "ogg");
            currentExt = "ogg";
        } else {
            popupGeneralError({
                error: "Loading/Decoding " + r.replace("./", ""),
                action: "reload"
            });
        }
    }
    l.send();
}

function loadAnimeData(e) {
    var o = e[0];
    var t = e[1];
    var altFlag = app.animearray[t] && app.animearray[t].hasAlt;
    var poloHasAlt = altFlag === "true" || altFlag === true || altFlag === "animeOnly";
    var useAltTrack = expAltModeOn && poloHasAlt;
    var altFolder = useAltTrack ? "alt/" : "";
    var n = "./" + app.folder + "anime/" + altFolder + o;
    var i = new XMLHttpRequest();
    i.open("GET", n, true);
    i.responseType = "json";
    i.onload = function () {
        for (var e = i.response, o = e.arrayFrame, a = o.length, s = [], r = [], cov = [], scl = [], rot = [], l = 0; l < a; l++) {
            var c = o[l].prop.split(",");
            var u = [parseInt(c[0]), parseInt(c[1]), parseFloat(c[2]), parseFloat(c[3]), c[4] ? c[4].trim() : ""];
            s.push(u);
            if (o[l].object) {
                var p = o[l].object.split(",");
                var d = [parseInt(p[0]) || 0, parseInt(p[1]) || 0, parseFloat(p[2]) || 0, parseFloat(p[3]) || 0];
                r.push(d);
            } else {
                r.push([0, 0, 0, 0]);
            }
            if (e.cover == "true") {
                var q = o[l].cover.split(",");
                var dwo = [parseInt(q[0]) || 0, parseInt(q[1]) || 0, parseFloat(q[2]) || 0, parseFloat(q[3]) || 0];
                cov.push(dwo);
            } else {
                cov.push([0, 0, 0, 0]);
            }
            var sc = parseFloat(o[l].scale) || 1;
            scl.push(sc);
            var ro = parseFloat(o[l].rotate) || 0;
            rot.push(ro);
        }

        var animeRealName = app.animearray[t].name;

        tabAnime[t].imgData = s;
        tabAnime[t].coverImgData = cov;
        tabAnime[t].cover = e.cover;
        tabAnime[t].coverWidth = e.coverWidth;
        tabAnime[t].coverHeight = e.coverHeight;
        tabAnime[t].headHeight = e.headHeight;
        tabAnime[t].bat = e.bat;
        tabAnime[t].upsideDown = e.upsideDown;
        tabAnime[t].shakeAnim = e.shakeAnim;
        tabAnime[t].dontWearHat = e.dontWearHat;

        tabAnime[t].hasStartup = !!e.hasStartup || false;
        tabAnime[t].hasExit = !!e.hasExit || false;

        tabAnime[t].poloStartTween = e.poloStartTween ?? true;
        tabAnime[t].movingStaticBody = e.movingStaticBody ?? false;
        tabAnime[t].onlyXBody = e.onlyXBody ?? false;
        tabAnime[t].onlyYBody = e.onlyYBody ?? false;
        tabAnime[t].invertXBody = e.invertXBody ?? false;
        tabAnime[t].invertYBody = e.invertYBody ?? false;
        tabAnime[t].renderWaitingBody = e.renderWaitingBody ?? false;
        tabAnime[t].hasAlt = e.hasAlt ?? false;
        tabAnime[t].width = e.width;
        tabAnime[t].height = e.height;
        tabAnime[t].version = e?.version ?? "1";
        tabAnime[t].gap = e?.gap ? Number(e.gap) : 0;
        tabAnime[t].waitingPictoOffsetY = e.waitingPictoOffsetY || "0px";

        tabAnime[t].appAnimeName = app.animearray[t].name;

        ["rebond", "deshabiller", "remonte"].forEach(key => {
            tabAnime[t][key] = e[key] ?? app.animearray[t][key] ?? null;
        });

        if (r.some(e => e.some(e => e !== 0))) {
            tabAnime[t].bodyData = r;
            tabAnime[t].objectWidth = e.objectWidth * animSize || animSize * 164;
            tabAnime[t].objectHeight = e.objectHeight * animSize || animSize * 380;
            tabAnime[t].objectBack = e.objectBack || false;
            tabAnime[t].renderBody = e.renderBody;
            tabAnime[t].bodySprite = n;
            console.log(`Body animation loaded: ${r.length} frames, dimensions: ${tabAnime[t].objectWidth}x${tabAnime[t].objectHeight}, front: ${tabAnime[t].objectBack} Sprite: ${e.bodySprite}`);
        }
        if (scl.some(e => e !== 1)) {
            tabAnime[t].scaleData = scl;
        }
        if (rot.some(e => e !== 0)) {
            tabAnime[t].rotateData = rot;
        }

        tabStartups[animeRealName] = tabStartups[animeRealName] || { startupData: null, hasStartupAuto: false };
        tabExits[animeRealName] = tabExits[animeRealName] || { exitData: null, hasExitAuto: false };

        if (e.hasStartup === true || e.hasExit === true) {
            console.log(`[JSON Setup] Queueing asset pipeline for: ${animeRealName} (Startup: ${!!e.hasStartup}, Exit: ${!!e.hasExit})`);
            nbTotalAsset++;
            tabToLoad.push({
                func: preloadDualAssets,
                params: [animeRealName, t, !!e.hasStartup, !!e.hasExit]
            });
        }

        checkTabToLoad();
    };
    i.onerror = function () {
        popupGeneralError({
            error: "XHR " + n.replace("./", ""),
            action: "reload"
        });
    };
    i.send();
}

function loadAnime(e) {
    var o = e[0];
    var t = e[1];
    var altFlag = app.animearray[t] && app.animearray[t].hasAlt;
    var poloHasAlt = altFlag === "true" || altFlag === true || altFlag === "animeOnly";
    var useAltTrack = expAltModeOn && poloHasAlt;
    var altFolder = useAltTrack ? "alt/" : "";
    var n = "./" + app.folder + "anime/" + altFolder + o;
    var i = new Image();
    i.onload = function () {
        tabAnime[t].imgSprite = i;
        checkTabToLoad();
    };
    i.onerror = function () {
        popupGeneralError({
            error: "Load " + n.replace("./", ""),
            action: "reload"
        });
    };
    i.src = n;
}
/** Bonus index -> video file that couldn't be loaded (those bonuses can't play). */
var brokenBonusVideos = {};
function loadVideoBonus(e) {
    var file = e[0];
    var id = e[1] + 1;

    function tryVideo(path, isFallback) {
        var video = document.createElement("video");
        video.src = path;
        var extMatch = path.match(/\.([^.\/\\?]+)(?:[?#]|$)/i);
        var ext = extMatch ? extMatch[1].toLowerCase() : "mp4";
        video.type = ext === "webm" ? "video/webm" : ext === "ogg" ? "video/ogg" : "video/mp4";
        video.muted = true;
        video.playsInline = true;
        video.setAttribute("playsinline", "");
        video.setAttribute("webkit-playsinline", "");
        video.setAttribute("muted", "");

        video.onerror = function () {
            if (!isFallback) {
                var fallbackPath = "./" + app.folder + "bonus/" + file;
                console.warn("Video failed at primary path:", path, "trying fallback:", fallbackPath);
                tryVideo(fallbackPath, true);
            } else {
                console.error(`Bonus ${id}: video "${file}" could not be loaded (looked in video/ and bonus/). This bonus is switched off. Press F8 to check the mod.`);
                brokenBonusVideos[id - 1] = file;
                $boxVideo.prepend("<div class='video' id='video" + id + "'><video muted playsinline></video></div>");
                checkTabToLoad();
            }
        };

        video.oncanplaythrough = function () {
            video.oncanplaythrough = null;
            $boxVideo.prepend("<div class='video' id='video" + id + "'></div>");
            $boxVideo.find("#video" + id).append(video);
            checkTabToLoad();
        };

        video.load();
    }

    var primaryPath = "./" + app.folder + "video/" + file;
    tryVideo(primaryPath, false);
}
function preloadImageForCSS(e) {
    var o = e.images.length;
    var t = 0;
    var n = {};
    (function i() {
        var a = new Image();
        var s = e.images[t][0];
        var r = e.images[t][1];
        a.onload = function () {
            n[s] = this;
            t++;
            e.progress(Math.floor(t * 100 / o));
            if (t == o) {
                e.good(n);
            } else {
                i();
            }
        };
        a.onerror = function () {
            var o = r.split("/").pop();
            e.nope(o);
        };
        a.src = r;
    })();
}
function loadImage(e) {
    if (!e._originalPath) e._originalPath = e.path;
    var o = new Image();
    o.onload = async function () {
        try {
            if (o.decode) await o.decode();
        } catch (e) { }
        listImages[e.keyname] = this;
        checkTabToLoad();
    };
    o.onerror = function () {
        if (e.path.includes("@2x")) {
            console.warn("@2x asset missing, falling back to standard:", e.path);
            e.path = e.path.replace("@2x", "");
            loadImage(e);
            return;
        }
        var fallback = getAssetFallback(e._originalPath);
        if (fallback && !e._triedFallback) {
            console.warn("Primary asset missing, trying fallback:", fallback);
            e._triedFallback = true;
            e.path = fallback;
            loadImage(e);
            return;
        }
        popupGeneralError({
            error: "Load " + e.path.replace("./", ""),
            action: "reload"
        });
    };
    o.src = cache(e.path);
}
