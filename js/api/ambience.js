/*
 * ambience.js
 * Looping background ambience per version.
 * Set `ambience: "rain"` in a version's app data to play <asset-vX>/sound/mod/ambience-rain.<ext>,
 * or call setAmbience("rain") / stopAmbience() yourself.
 * The ambience fades out while a picto is being dragged/used or the screen is darkened, and comes back after.
 */

let isAmbiencePlaying = false;
let ambiencePath = null; // the ambience that should play
let playingAmbiencePath = null; // the ambience that is playing
let checkingInterval = null;
let ambienceSource = null;
let ambienceGainNode = null;
let isTransitioning = false;
const FADE_TIME = 1; // in seconds

function anyPictoIsBusy() {
    return Array.from(document.querySelectorAll(".picto"))
        .some(p => p.classList.contains("drag") || p.classList.contains("griser"));
}

function shouldPlayAmbience() {
    return !anyPictoIsBusy() && !document.body.classList.contains("darkback");
}

/** Starts (or switches to) the ambience "ambience-<name>" of the current version. */
async function setAmbience(name) {
    const ext = app.format[0] || sndExt;
    ambiencePath = `asset-v${appVersion}/sound/mod/ambience-${name}.${ext}`;

    if (isAmbiencePlaying || ambienceSource) {
        await stopAmbience(false);
    }
    if (shouldPlayAmbience()) {
        await playAmbience(ambiencePath);
    }
    if (!checkingInterval) {
        observePictoState();
    }
}

async function playAmbience(path) {
    if (isTransitioning || !shouldPlayAmbience()) return;

    isTransitioning = true;
    try {
        const audioContext = await window.getModAudioContext();

        if (ambienceSource) { try { ambienceSource.stop(); ambienceSource.disconnect(); } catch (e) { } }
        if (ambienceGainNode) { try { ambienceGainNode.disconnect(); } catch (e) { } }

        ambienceGainNode = audioContext.createGain();
        ambienceGainNode.gain.setValueAtTime(0, audioContext.currentTime);

        const response = await fetch(path);
        if (!response.ok) throw new Error(`Ambience file not found: ${path}`);
        const audioBuffer = await audioContext.decodeAudioData(await response.arrayBuffer());

        ambienceSource = audioContext.createBufferSource();
        ambienceSource.buffer = audioBuffer;
        ambienceSource.loop = true;
        ambienceSource.connect(ambienceGainNode);
        ambienceGainNode.connect(audioContext.destination);
        ambienceSource.start();
        ambienceGainNode.gain.linearRampToValueAtTime(modVolume, audioContext.currentTime + FADE_TIME);

        isAmbiencePlaying = true;
        playingAmbiencePath = path;
    } catch (error) {
        console.error("Error in playAmbience:", error);
    } finally {
        isTransitioning = false;
    }
}

/**
 * Fades the ambience out. Resolves once it is fully stopped.
 * `stopForGood` (default true) also stops the automatic restart after picto drags.
 */
function stopAmbience(stopForGood = true) {
    if (stopForGood) {
        ambiencePath = null;
        if (checkingInterval) {
            clearInterval(checkingInterval);
            checkingInterval = null;
        }
    }
    if (!ambienceSource || !ambienceGainNode || isTransitioning) return Promise.resolve();

    isTransitioning = true;
    const source = ambienceSource;
    const gain = ambienceGainNode;
    try {
        const now = gain.context.currentTime;
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.linearRampToValueAtTime(0, now + FADE_TIME);
        source.stop(now + FADE_TIME);
    } catch (e) {
        console.warn("Error stopping ambience:", e);
    }

    return new Promise(resolve => {
        setTimeout(() => {
            try {
                source.disconnect();
                gain.disconnect();
            } catch (e) { }
            if (ambienceSource === source) ambienceSource = null;
            if (ambienceGainNode === gain) ambienceGainNode = null;
            isAmbiencePlaying = false;
            playingAmbiencePath = null;
            isTransitioning = false;
            resolve();
        }, FADE_TIME * 1000 + 50);
    });
}

/** Called by volume.js when the in-game volume changes. */
function updateAmbienceVolume() {
    if (ambienceGainNode) {
        const now = ambienceGainNode.context.currentTime;
        ambienceGainNode.gain.cancelScheduledValues(now);
        ambienceGainNode.gain.setTargetAtTime(modVolume, now, 0.05);
    }
}

function observePictoState() {
    checkingInterval = setInterval(async () => {
        if (isTransitioning) return;
        if (shouldPlayAmbience() && ambiencePath) {
            if (isAmbiencePlaying && playingAmbiencePath !== ambiencePath) {
                await stopAmbience(false);
            } else if (!isAmbiencePlaying) {
                await playAmbience(ambiencePath);
            }
        } else if (isAmbiencePlaying) {
            await stopAmbience(false);
        }
    }, 200);
}

/** Starts the version's ambience (called when the mod has loaded). */
function initAmbience() {
    if (app.ambience) {
        setAmbience(app.ambience);
    }
}
