let fastNavigation = localStorage.getItem("fastNavigation") === null || "true" === localStorage.getItem("fastNavigation");

function onKey(keyName, callback, allowSpam = true, preventDefault = true, description) {
    let isPressed = false;

    if (description) {
        registerHotkey({
            type: "single",
            key: keyName,
            description
        });
    }

    document.addEventListener("keydown", function (e) {
        if (e.key === keyName) {
            if (preventDefault) {
                e.preventDefault();
            }

            if (!allowSpam && isPressed) return;

            isPressed = true;
            callback();
        }
    });

    document.addEventListener("keyup", function (e) {
        if (e.key === keyName) isPressed = false;
    });
}

function onKeyHold(triggerKey, targetKey, callback, allowSpam = false, preventDefault = false, description) {
    let holdingTrigger = false;
    let canTrigger = true;

    if (description) {
        registerHotkey({
            type: "combo",
            hold: triggerKey,
            key: targetKey,
            description
        });
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === triggerKey) {
            holdingTrigger = true;
        }

        if (e.key === targetKey && holdingTrigger) {
            if (preventDefault) e.preventDefault();

            if (allowSpam) {
                callback();
            } else if (canTrigger) {
                callback();
                canTrigger = false;
            }
        }
    });

    document.addEventListener("keyup", (e) => {
        if (e.key === triggerKey) {
            holdingTrigger = false;
            canTrigger = true;
        }

        if (e.key === targetKey) {
            canTrigger = true;
        }
    });
}

function blockedKeyMsg() {
    console.log("This command cannot be used on the index page!");
}

const HOTKEYS = [];
function registerHotkey(config) {
    HOTKEYS.push(config);
}
function registerHotkeyText(display, description) {
    registerHotkey({
        type: "custom",
        display,
        description
    });
}

const isMac = /Mac|iPhone|iPad/.test(navigator.platform);

function formatKeyDisplay(key) {
    if (key === "Meta") return isMac ? "⌘" : "Meta";
    if (key === "Control") return isMac ? "⌃" : "Ctrl";
    if (key === "Alt") return isMac ? "⌥" : "Alt";
    if (key === "Shift") return isMac ? "⇧" : "Shift";

    return key.toUpperCase();
}

function openHotkeyMenu() {
    let html = `
        <div style="
            max-height: 400px;
            overflow-y: auto;
            padding-right: 10px;
        ">
     `;

    HOTKEYS.forEach(h => {
        let comboText = "";

        if (h.type === "combo") {
            comboText = `${formatKeyDisplay(h.hold)} + ${formatKeyDisplay(h.key)}`;
        } else if (h.type === "single") {
            comboText = formatKeyDisplay(h.key);
        } else if (h.type === "custom") {
            comboText = h.display;
        }

        html += `
            <div style="margin-bottom: 8px;">
                <b style="color:${app.colors ? app.colors[1] : app.col1}">${comboText}</b> - ${h.description}
            </div>
        `;
    });

    html += "</div>";

    customInfo(html, "HOTKEY LIST (Shift + H)");
}

onKeyHold("I", "!", function () {
    if (getHtmlName() === "index.html") {
        return blockedKeyMsg();
    }
    QuickMessage(`\n        <span style="color: ${app.colors ? app.colors[1] : app.col1}">Version data:</span><br><br>\n        <div class="modding-build">\n        Name: ${app.name} v${app.version}<br>\n        Date: ${app.date}<br>\n        Folder: ${app.folder}<br>\n        BPM: ${app.bpm}<br>\n        Looptime: ${app.looptime}<br>\n        Totalframe: ${app.totalframe}</div><br><hr>\n        <span style="color: ${app.colors ? app.colors[0] : app.col0}">■ </span><span style="color: ${app.colors ? app.colors[1] : app.col1}">■ </span><span style="color: ${app.colors ? app.colors[2] : app.col2}">■ </span>\n        <span style="color: ${app.colors ? app.colors[3] : app.col3}">■ </span><span style="color: ${app.colors ? app.colors[4] : app.col4}">■ </span>\n        \n    `, 8000);
}, false, true, "Show version data");
onKeyHold("I", "@", function () {
    if (getHtmlName() === "index.html") {
        return blockedKeyMsg();
    }
    QuickMessage(`\n        <span style="color: ${app.colors ? app.colors[1] : app.col1}">Joalor64's Modding Build ${getVersion()}</span><br><hr><br>\n        <div class="modding-build">\n            <span style="text-align: right !important;">Mod Name: ${RegisterMod}</span><br>\n            <span style="text-align: right !important;">Mod Version: v${RegisterModVersion}</span><br>\n            <span style="text-align: right !important;">Developer: ${ModDeveloper}</span><br>\n        </div>\n    `, 8000);
}, false, true, "Show mod info");
onKeyHold("I", "#", function () {
    if (getHtmlName() === "index.html") {
        return blockedKeyMsg();
    }
    QuickMessage(`\n        <span style="color: ${app.colors ? app.colors[1] : app.col1}">ADV. OPTIONS</span><br><hr><br>\n        <div class="modding-build">\n            Background Changes: ${BGorFadeOutsOn ? "ON" : "OFF"}<br>\n            Shake Effects: ${ShakeEffectOn ? "ON" : "OFF"}<br>\n            Lyrics: ${LyricsOn ? "ON" : "OFF"}<br>\n            Mod Sounds: ${ModSoundsOn ? "ON" : "OFF"}<br>\n            Particles Effects: ${ConfettiEffectOn ? "ON" : "OFF"}<br>\n            Custom Cursors: ${CustomCursorsOn ? "ON" : "OFF"}<br>\n        </div>\n    `, 8000);
}, false, true, "Advanced options");
onKeyHold("I", "$", function () {
    if (getHtmlName() === "index.html") {
        return blockedKeyMsg();
    }
    let e = app.animearray.map(e => `\n        <div>\n            <b>${e.name}</b> / \n            <span style="color: #${e.color}">■</span> /\n            2 loops: ${e.uniqsnd ? "No" : "Yes"}\n        </div>\n    `).join("");
    QuickMessage(`\n        <span style="color: ${app.colors ? app.colors[1] : app.col1}">Character's INFO</span><br><hr><br>\n        <div class="modding-build">\n            ${e}\n        </div>\n    `, 10000);
}, false, true, "Character info");
onKeyHold("I", "%", function () {
    if (getHtmlName() === "index.html") {
        return blockedKeyMsg();
    }
    let e = (parseInt(localStorage.getItem("totalTimeSpent")) || 0) + Math.floor((Date.now() - sessionStartTime) / 1000);
    let t = Math.floor(e / 3600);
    let o = Math.floor(e % 3600 / 60);
    let n = e % 60;
    let i = `${t.toString().padStart(2, "0")}:${o.toString().padStart(2, "0")}:${n.toString().padStart(2, "0")}`;
    QuickMessage(`\n        <span style="color: ${app.colors ? app.colors[1] : app.col1}">Your Info!</span><br><hr><br>\n        <div class="modding-build">\n            • ${i} Of playing mods <br>\n            • ${totalBonusesWatched} Bonuses watched <br>\n            • ${totalVersionsOpened} Versions opened <br>  \n            • ${totalPolosUsed} Polos used <br>            \n        </div>\n    `, 8000);
}, false, true, "Show user play stats");
onKeyHold("I", "^", function () {
    window.location.href = "js/mod-libs/index.html";
}, false, true, "Open mod library");
onKeyHold("I", "&", function () {
    if (getHtmlName() === "index.html") {
        return blockedKeyMsg();
    }
    if (!app.bonusarray || app.bonusarray.length === 0) {
        QuickMessage(`
            <span style="color: ${app.colors ? app.colors[1] : app.col1}">BONUS INFO</span><br><hr><br>
            <div class="modding-build" style="opacity:0.6;text-align:center;padding:10px;">
                No bonuses available
            </div>
        `, 10000);
        return;
    }
    let e = app.bonusarray.map((bonus, idx) => {
        const hasIcon = bonus.icon && bonus.icon.trim() !== "";
        const hasSVG = bonus.svg && bonus.svg.trim() !== "";

        let iconHTML;
        if (hasIcon) {
            iconHTML = `<img 
                style="height:40px;border-radius:3px;vertical-align: -13px;"
                src="${app.folder}video/${bonus.icon}"
                onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-block';"
            ><span 
                class="svg-fallback"
                style="display:none;height:40px;width:40px;vertical-align: -13px;"
            >${hasSVG ? bonus.svg : defaultBonusSVG}</span>`;
        } else if (hasSVG) {
            iconHTML = `<span 
                style="display:inline-block;height:40px;width:40px;vertical-align: -13px;"
            >${bonus.svg}</span>`;
        } else {
            iconHTML = `<span 
                style="display:inline-block;height:40px;width:40px;vertical-align: -13px;"
            >${defaultBonusSVG}</span>`;
        }

        return `\n        <div>
            <span class="icon-container">
              ${iconHTML}
            </span>
            <b style="text-transform: capitalize;">${bonus.name}</b> /
            <span class="code-icons" style="vertical-align: -10px;">
                ${bonus.code.map(c => `\n                  <span class="sprite-icon" style="\n                      display:inline-block;\n                      width:34px;\n                      height:34px;\n                      background-image:url('${app.folder}img/game-picto@2x.png');\n                      background-size:auto 200%;\n                      background-position:-${(parseInt(c) - 1) * 34}px 0;\n                      margin-right:3px;\n                      border-radius: 5px;\n                  "></span>\n                `).join("")}
            </span> / Loops: ${bonus.loop}
        </div>\n    `;
    }).join("");

    QuickMessage(`\n        <span style="color: ${app.colors ? app.colors[1] : app.col1}">BONUS INFO</span><br><hr><br>\n        <div class="modding-build">\n            ${e}\n        </div>\n    `, 10000);
}, false, true, "Bonus info");
onKeyHold("I", "*", () => {
    if (getHtmlName() === "index.html") {
        return blockedKeyMsg();
    }
    openAboutPop();
}, false, true, "About popup");
onKeyHold("I", "(", () => {
    if (getHtmlName() === "index.html") {
        return blockedKeyMsg();
    }
    showBoundingBoxes();
}, false, true, "Show polo hitboxes");
onKeyHold("D", "!", function () {
    toggleDarkMode();
}, false, true, "Toggle dark mode");
onKeyHold("D", "@", function () {
    if (getHtmlName() === "index.html") {
        return blockedKeyMsg();
    }
    forceMod.killAllPolos();
}, false, true, "Kill all polos");
onKeyHold("D", "#", function () {
    if (getHtmlName() === "index.html") {
        return blockedKeyMsg();
    }
    unlockAllBonus();
}, false, true, "Unlock all bonuses");
onKeyHold("D", "$", function () {
    location.href = "app.html?v=1";
}, false, true, "Shortcut to V1");
onKeyHold("D", "%", function () {
    fastNavigation = !fastNavigation;
    localStorage.setItem("fastNavigation", fastNavigation);
    QuickMessage("Fast Navigation is " + (fastNavigation ? "ON" : "OFF"));
}, false, true, "Toggle fast navigation");
onKeyHold("D", "&", function () {
    if (getHtmlName() === "index.html") {
        return blockedKeyMsg();
    }
    enableHeadAnim = !enableHeadAnim;
    QuickMessage("Head animations are now " + (enableHeadAnim ? "ON" : "OFF"));
}, false, true, "Toggle head animations");
onKeyHold("D", "*", function () {
    if (getHtmlName() === "index.html") {
        return blockedKeyMsg();
    }
    enableFaceAnim = !enableFaceAnim;
    QuickMessage("Face animations are now " + (enableFaceAnim ? "ON" : "OFF"));
}, false, true, "Toggle face animations");
onKeyHold("D", "E", function () {
    if (getHtmlName() === "index.html") {
        return blockedKeyMsg();
    }
    if (app.letEvents || app._letEvents) {
        eventHatTesterMode = !eventHatTesterMode;
        updateEventHatSprite();
        QuickMessage("Event Hat template are now " + (eventHatTesterMode ? "ON" : "OFF"));
    }
}, false, true, "Event hat testing");
onKeyHold("Shift", "H", () => {
    openHotkeyMenu();
}, false, true, "Open hotkey list");
onKeyHold("q", "r", () => {
    if (getHtmlName() === "index.html") {
        return blockedKeyMsg();
    }
    forceMod.openApp();
    clickBtRecord();
}, false, true, "Record shortcut");
onKeyHold("w", "r", () => {
    if (getHtmlName() === "index.html") {
        return blockedKeyMsg();
    }
    forceMod.openApp();
    clickBtRandom();
}, false, true, "Auto mode shortcut");
onKeyHold("a", "r", () => {
    if (getHtmlName() === "index.html") {
        return blockedKeyMsg();
    }
    stopAllStage();
}, false, true, "Stop all");

registerHotkey({
    type: "combo",
    hold: "Control",
    key: "R",
    description: "Force reload"
});

registerHotkey({
    type: "single",
    key: "F1",
    description: "Open mod launcher"
});

onKey("F2", function () {
    checkAndShowUpdateNotice(RegisterMod);
}, false, true, "Check mod updates");

registerHotkey({
    type: "single",
    key: "F3",
    description: "Toggle debug overlay"
});

let vHeld = false;
async function checkAssetExists(version) {
    const urls = [
        `asset-v${version}/app.js`,
        `asset-v${version}/app.json`
    ];

    const results = await Promise.allSettled(
        urls.map(url => fetch(url, { method: 'HEAD' }))
    );

    return results.some(res => res.status === 'fulfilled' && res.value.ok);
}
document.addEventListener("keydown", async function (e) {
    if (!fastNavigation) return;
    if (e.key === "v") {
        vHeld = true;
    }
    if (vHeld && /^[0-9]$/.test(e.key)) {
        const targetVersion = e.key;
        const current = getVersionFromURL();

        if (targetVersion == current && current !== null) {
            boxDialog.open("You're already on this version??", "&#128528;");
            return;
        }

        if (versions[`v${targetVersion}`]) {
            goto(targetVersion);
            return;
        }

        const assetExists = await checkAssetExists(targetVersion);

        if (assetExists) {
            goto(targetVersion);
        } else {
            Shake(10, 500);
            boxDialog.open(`Version v${targetVersion} does not exist!`, "OOPS!");
        }
    }
});
document.addEventListener("keyup", function (e) {
    if (e.key === "v") {
        vHeld = false;
    }
});

registerHotkey({
    type: "combo",
    hold: "V",
    key: "0-9",
    description: "Switch game version"
});

let debugEnabled = false;

onKeyHold("Alt", "h", () => {
    debugEnabled = !debugEnabled;
    document.documentElement.classList.toggle('debug-mode', debugEnabled);
    QuickMessage("Showing Hitzones: " + (debugEnabled ? "ON" : "OFF"));
}, false, true, "Show element hitzones");

registerHotkey({
    type: "single",
    key: "Plus",
    description: "Volume Up"
});

registerHotkey({
    type: "single",
    key: "Minus",
    description: "Volume Down"
});

registerHotkey({
    type: "single",
    key: "M",
    description: "Toggle Mute"
});