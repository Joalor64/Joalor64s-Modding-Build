/*
 * about.js
 * The "about this mod" popup (the switch button becomes this when the mod has a single version,
 * and the I + * hotkey). Shows 3 random polos, the version icon, the description and the
 * YouTube video from modInfo (registerMod.js), with per-version overrides in modInfo.v1, modInfo.v2...
 *
 * data/configs/aboutYOffsetsData.jsonc can nudge tall/short characters up or down: { "polo_name": -10 }
 */

const extraYOffset = {};

async function loadExtraYOffsetConfig(path = "data/configs/aboutYOffsetsData.jsonc") {
    try {
        const res = await fetch(path);
        if (!res.ok) throw new Error("Config not found");
        Object.assign(extraYOffset, parseJSONC(await res.text()));
        console.log("ExtraYOffset config loaded:", extraYOffset);
    } catch (err) {
        console.warn("Failed to load extraYOffset config, using fallback", err);
    }
}
loadExtraYOffsetConfig();

function getExtraY(name) {
    return extraYOffset[name] || 0;
}

/** Any YouTube link -> embeddable URL (or "" if it isn't one). */
function toYouTubeEmbed(link) {
    const id = (String(link).match(/(?:youtube\.com\/(?:.*v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/) || [])[1];
    return id ? `https://www.youtube.com/embed/${id}` : "";
}

/** Tries img/x@2x, image/x@2x, img/x, image/x in the version folder and calls back with the first that exists. */
function findVersionImage(fileName, callback) {
    const hd = auto2xPath(fileName);
    const pathsToTry = [...new Set([
        `${app.folder}img/${hd}`,
        `${app.folder}image/${hd}`,
        `${app.folder}img/${fileName}`,
        `${app.folder}image/${fileName}`
    ])];
    let index = 0;
    const tryNext = () => {
        if (index >= pathsToTry.length) return;
        const path = pathsToTry[index++];
        const img = new Image();
        img.onload = () => callback(path);
        img.onerror = tryNext;
        img.src = path;
    };
    tryNext();
}

function openAboutPop() {
    const versionKey = `v${app.version}`;
    const globalInfo = (typeof modInfo !== "undefined" && modInfo) || {};
    const versionInfo = globalInfo[versionKey] || {};
    const description = versionInfo.description || globalInfo.description || "No description available";
    const videoUrl = toYouTubeEmbed(versionInfo.relatedVideo || globalInfo.relatedVideo || "");

    boxPopup.open({
        name: "popup-message",
        bodyclose: true,
        class: "modCreditsBox invBor",
        content: `
            <div class="modCoverWrapper">
                <canvas id="modCoverCanvas" width="678" height="282"></canvas>
            </div>
            <div class="mod-info-single">
                <div class="single-version-icon"></div>
                <div class="title">${RegisterMod || "Unknown"}</div>
                <div class="txt">${description}</div>
                <div class="footer-pop">
                    ${videoUrl
                ? `<iframe style="margin-top: 10px;" width="480" height="270" src="${videoUrl}"></iframe>`
                : `<div id="noYT-prev">
                            <div class="icon-prev n2"></div>
                            <div class="icon-prev n1"></div>
                        </div>`}
                </div>
            </div>`,
        onBoxOpenEnd: drawAboutCover,
        onBoxCloseStart: function () {
            boxPopup.$popup.find(".icon.bt.bt-round.bt-44").off();
        },
        onCloseComplete: function () {
            document.getElementById("pop-popup").classList.remove("invBor");
        }
    });

    loadSingleVersionIcon();

    if (!videoUrl) {
        const preview = document.querySelector("#noYT-prev");
        findVersionImage(app.homeScreen || "home-screen.jpg", path => {
            if (preview) preview.style.backgroundImage = `url("${path}")`;
        });

        const frames = Math.max(1, app.animearray.length - 1);
        document.querySelectorAll("#noYT-prev .icon-prev.n1, #noYT-prev .icon-prev.n2").forEach(icon => {
            findVersionImage(app.gamePicto || "game-picto.png", path => {
                icon.style.backgroundImage = `url('${path}')`;
            });
            const frame = Math.floor(Math.random() * frames);
            icon.style.backgroundPosition = `calc((100% / ${frames}) * ${frame}) 0`;
        });
    }
}

/** Draws three random polos (front + two faded ones behind) on the popup's cover canvas. */
function drawAboutCover() {
    const canvas = document.getElementById("modCoverCanvas");
    if (!canvas || !app.animearray.length) return;
    const ctx = canvas.getContext("2d");
    const folder = app.folder.replace(/\/$/, "");

    const pool = [];
    while (pool.length < 3) pool.push(...app.animearray);
    const picks = pool.sort(() => Math.random() - 0.5).slice(0, 3)
        .map(anime => ({ name: anime.name, img: new Image(), w: 164 * 2, h: 380 * 2, gap: 0, loaded: false }));
    const [front, left, right] = picks;

    const loadJSON = async pick => {
        try {
            const r = await fetch(`${folder}/anime/${pick.name}.json`);
            if (!r.ok) return;
            const j = await r.json();
            pick.w = (parseInt(j.width) || 164) * 2;
            pick.h = (parseInt(j.height) || 380) * 2;
            pick.gap = parseInt(j.gap) || 0;
        } catch (e) { }
    };

    const loadSprite = pick => new Promise(resolve => {
        const paths = [`${folder}/anime/${pick.name}-sprite-hd.png`, `${folder}/anime/${pick.name}.png`];
        let i = 0;
        const next = () => {
            if (i >= paths.length) return resolve();
            pick.img.onload = () => {
                pick.loaded = true;
                resolve();
            };
            pick.img.onerror = () => {
                i++;
                next();
            };
            pick.img.src = paths[i];
        };
        next();
    });

    const drawPick = (pick, offsetX, baseY, scale) => {
        if (!pick.loaded) return;
        const w = pick.w * scale;
        const h = pick.h * scale;
        ctx.drawImage(
            pick.img,
            pick.gap, 0, pick.w, pick.h,
            (canvas.width - w) / 2 + offsetX,
            (canvas.height - h) / 2 + baseY + getExtraY(pick.name),
            w, h
        );
    };

    const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const bg = ctx.createLinearGradient(44, 0, 146, canvas.height);
        bg.addColorStop(0, app.colors ? app.colors[1] : app.col1);
        bg.addColorStop(1, app.colors ? app.colors[3] : app.col3);
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.globalAlpha = 0.4;
        drawPick(left, -145, 127, 0.8);
        drawPick(right, 145, 127, 0.8);
        ctx.restore();

        drawPick(front, 0, 137, 1);
    };

    Promise.all(picks.flatMap(pick => [loadJSON(pick), loadSprite(pick)])).then(render);
}

/** Puts the version icon (custom icon from versions.xml, asset-vX/icon.png, or a fallback) in the popup. */
async function loadSingleVersionIcon() {
    const iconElement = document.querySelector(".single-version-icon");
    if (!iconElement) return;
    const primaryPath = window.versionCustomIcons?.[appVersion] ?? `asset-v${appVersion}/icon.png`;
    try {
        const verifiedPath = await preloadIconPath(primaryPath);
        iconElement.style.backgroundImage = `url("${verifiedPath}")`;
    } catch (error) {
        iconElement.style.backgroundImage = `url("img/version-icon-fallback.png")`;
    }
}
