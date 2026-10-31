/*
 * events.js
 * Polo shake helper, special events (snow, event hats) and startup/exit animation XML loading.
 */

window.getPoloWearing = {};
window.getPoloRemoving = {};
let lastShake = 0;
let targetShake = 0;
let shakeTimer = 0;
function getRealisticShake(e = app.scaredPolos, o = 5) {
    app.scaredPolos = app.scaredPolos || 0;
    if (app.scaredPolos === 0) {
        return 0;
    } else {
        shakeTimer += o;
        if (shakeTimer >= 1) {
            shakeTimer = 0;
            lastShake = targetShake;
            targetShake = Math.random() * e * 2 - e;
        }
        return lastShake + (targetShake - lastShake) * shakeTimer;
    }
}
let snowEffectStarted = false;
function getSpecialEventDetails() {
    if (expEventsOn) {
        fetch("https://raw.githubusercontent.com/RemmieUwU/Incredimods/refs/heads/main/RMB-events/todayEvent.json").then(e => e.json()).then(e => {
            specialEventNow = e.isEventOn || false;
            specialEventName = e.eventName || "No Event Now";
            console.log(`About event: Is happening?: [${specialEventNow}] name of the event: [${specialEventName}].`);
            checkForEventEffects();
        }).catch(e => console.error("Fetch failed:", e));
        return specialEventNow;
    }
}
function checkForEventEffects(retries = 40) {
    if (typeof app === "undefined" || !app || !app.animearray) {
        if (retries > 0) setTimeout(() => checkForEventEffects(retries - 1), 250);
        return;
    }
    if ((app.letEvents || app._letEvents) && (specialEventName === "Winter" || specialEventName === "Christmas") && pageApp) {
        let e = document.getElementById("snowCanvas");
        if (e && !snowEffectStarted) {
            e.style.display = "block";
            drawSnow();
            snowEffectStarted = true;
        } else if (!e) {
            console.error("[SNOW EVENT] Can't find snow canvas!");
        }
    } else {
        console.log(`[SNOW EVENT] Snow effect won't play because: (event name: ${specialEventName})`);
    }
}
getSpecialEventDetails();
let eventHatTesterMode = false;
var eventHatSrc;
function updateEventHatSprite() {
    eventHatSrc = eventHatTesterMode ? "./js/event-hat-preview.png" : "https://raw.githubusercontent.com/RemmieUwU/Incredimods/refs/heads/main/RMB-events/event-hat-sprite.png";
}

window.startupXMLFrames = new Map();
window.exitXMLFrames = new Map();

const startupsFolder = `./asset-v${appVersion}/anime/startups`;
const exitsFolder = `./asset-v${appVersion}/anime/exits`;

async function loadStartupXML(animeName) {
    if (window.startupXMLFrames.has(animeName)) {
        return window.startupXMLFrames.get(animeName);
    }

    try {
        const response = await fetch(`${startupsFolder}/${animeName}_startup.xml`);
        if (!response.ok) {
            console.warn(`Startup XML not found for ${animeName}`);
            return null;
        }

        const txt = await response.text();
        const xml = new DOMParser().parseFromString(txt, "text/xml");
        const frames = [...xml.querySelectorAll("SubTexture")];
        const scale = isHDMode() ? 1 : 0.5;

        const frameData = frames.map((f, i) => {
            const raw = {
                x: +f.getAttribute("x"),
                y: +f.getAttribute("y"),
                w: +f.getAttribute("width"),
                h: +f.getAttribute("height")
            };

            const scaled = {
                x: Math.round(raw.x * scale),
                y: Math.round(raw.y * scale),
                w: Math.round(raw.w * scale),
                h: Math.round(raw.h * scale)
            };

            if (i < 5) {
                console.log(`[${animeName}] Frame ${i}`, {
                    raw,
                    scaled
                });
            }

            return scaled;
        });

        window.startupXMLFrames.set(animeName, frameData);

        console.log(
            `Startup frames loaded for ${animeName}:`,
            frameData.length,
            `| scale: ${scale}`
        );

        return frameData;

    } catch (err) {
        console.error(`Failed to load startup XML for ${animeName}:`, err);
        return null;
    }
}

async function loadExitXML(animeName) {
    if (window.exitXMLFrames && window.exitXMLFrames.has(animeName)) {
        return window.exitXMLFrames.get(animeName);
    }

    if (!window.exitXMLFrames) window.exitXMLFrames = new Map();

    try {
        const path = `${exitsFolder}/${animeName}_exit.xml`;
        console.log(`Loading exit XML from: ${path}`);

        const response = await fetch(path);
        if (!response.ok) {
            console.warn(`Exit XML not found for ${animeName} at ${path}`);
            return null;
        }

        const txt = await response.text();
        const xml = new DOMParser().parseFromString(txt, "text/xml");
        const frames = [...xml.querySelectorAll("SubTexture")];
        const scale = isHDMode() ? 2 : 1;

        const frameData = frames.map((f) => ({
            x: Math.round(parseInt(f.getAttribute("x")) * scale),
            y: Math.round(parseInt(f.getAttribute("y")) * scale),
            w: Math.round(parseInt(f.getAttribute("width")) * scale),
            h: Math.round(parseInt(f.getAttribute("height")) * scale)
        }));

        window.exitXMLFrames.set(animeName, frameData);
        console.log(`Exit frames loaded for ${animeName}:`, frameData.length);
        return frameData;
    } catch (err) {
        console.error(`Failed to load exit XML for ${animeName}:`, err);
        return null;
    }
}
