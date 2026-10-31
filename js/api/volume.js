/*
 * volume.js
 * In-game volume control: "-" / "+" keys change the volume in 10% steps, "M" mutes.
 * The engine's master GainNode is found by hooking AudioContext.createGain / AudioNode.connect
 * (the first gain node at 100% is assumed to be the game's), so this file must load before the engine.
 * The volume is saved in localStorage ("modVolume") and exposed as `modVolume` (0-1) for other files.
 * Mods can change the tray sounds with the traySoundUp / traySoundDown / traySoundMAX variables (see mod.js).
 */

var defaultSNTVolUP = "sound/volume/plus.wav";
var defaultSNTVolDOWN = "sound/volume/minus.wav";
var defaultSNTVolMAX = "sound/volume/max.wav";

let modVolume = 1.0;
const savedVolume = parseFloat(localStorage.getItem("modVolume"));
if (!isNaN(savedVolume)) {
    modVolume = Math.max(0, Math.min(1, savedVolume));
}

let modGainNode = null;

let resolveGainNode;
window._modGainNodeReady = new Promise((resolve) => {
    resolveGainNode = resolve;
});

let volumeApplied = false;

function applyVolume() {
    if (modGainNode && !volumeApplied) {
        modGainNode.gain.value = modVolume;
        volumeApplied = true;
        console.log(`Applied initial volume: ${Math.round(modVolume * 100)}%`);
    }
}

let preMuteVolume = 1.0;
let isMuted = false;

function toggleMute() {
    const prevVolume = modVolume;

    if (modVolume > 0) {
        preMuteVolume = modVolume;
        modVolume = 0;
        isMuted = true;
        console.log("Muted");
    } else {
        modVolume = preMuteVolume > 0 ? preMuteVolume : 0.5;
        isMuted = false;
        console.log(`Unmuted: ${Math.round(modVolume * 100)}%`);
    }

    if (modGainNode) {
        modGainNode.gain.value = modVolume;
    }

    updateAmbienceVolume();

    localStorage.setItem("modVolume", modVolume.toString());

    playVolumeSound(prevVolume);
    showVolumeOverlay();
}

window.getModAudioContext = async function () {
    const gainNode = await window._modGainNodeReady;
    return gainNode.context;
};

const originalCreateGain = AudioContext.prototype.createGain;
AudioContext.prototype.createGain = function () {
    const gain = originalCreateGain.call(this);

    if (!modGainNode && gain.gain && gain.gain.value === 1) {
        console.log("Intercepted game's GainNode!");
        modGainNode = gain;
        resolveGainNode(gain);
        applyVolume();
    }

    return gain;
};

const originalConnect = AudioNode.prototype.connect;
AudioNode.prototype.connect = function (destination, ...args) {
    if (!modGainNode && destination?.gain?.value === 1) {
        console.log("GainNode hooked via connect()");
        modGainNode = destination;
        resolveGainNode(destination);
        applyVolume();
    }
    return originalConnect.call(this, destination, ...args);
};

const volumePollInterval = setInterval(() => {
    if (modGainNode && !volumeApplied) {
        applyVolume();
        clearInterval(volumePollInterval);
    }
}, 100);

let lastLoggedVolume = null;

function changeVolume(delta) {
    const prevVolume = modVolume;
    const newVolume = Math.round((modVolume + delta) * 10) / 10;
    const clampedVolume = Math.max(0, Math.min(1, newVolume));

    if (clampedVolume === modVolume && (modVolume === 0 || modVolume === 1)) {
        playVolumeSound(prevVolume);
        showVolumeOverlay();
        return;
    }

    modVolume = clampedVolume;
    localStorage.setItem("modVolume", modVolume.toString());

    if (modGainNode) {
        modGainNode.gain.value = modVolume;

        const volumePercent = Math.round(modVolume * 100);
        if (lastLoggedVolume !== volumePercent) {
            console.log(`Game volume set to ${volumePercent}%`);
            lastLoggedVolume = volumePercent;
        }

        updateAmbienceVolume();
        playVolumeSound(prevVolume);
        showVolumeOverlay();
    } else {
        console.warn("GainNode not yet found, try pressing volume keys after the game loads.");
    }
}

document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
    if (e.ctrlKey || e.metaKey || !e.key) return;

    const key = e.key.toLowerCase();

    if (key === '-' || key === '_') {
        isMuted = false;
        changeVolume(-0.1);
    } else if (key === '+' || key === '=' || key === 'plus') {
        isMuted = false;
        changeVolume(0.1);
    } else if (key === 'm') {
        toggleMute();
    }
});

let lastEdgeSoundTime = 0;
const EDGE_SOUND_COOLDOWN = 130;

/** Tray sound chosen by the mod (mod.js) or the default one. */
function getTraySound(kind) {
    if (kind === "up") return (typeof traySoundUp !== "undefined" && traySoundUp) || defaultSNTVolUP;
    if (kind === "down") return (typeof traySoundDown !== "undefined" && traySoundDown) || defaultSNTVolDOWN;
    return (typeof traySoundMAX !== "undefined" && traySoundMAX) || defaultSNTVolMAX;
}

async function playVolumeSound(prevVolume) {
    const audioContext = getUIAudioContext();
    const now = Date.now();
    let soundUrl = null;

    const isAtMax = modVolume === 1;
    const isAtMin = modVolume === 0;
    const wasAtMax = prevVolume === 1;
    const wasAtMin = prevVolume === 0;

    const hittingEdgeAgain = (isAtMax && wasAtMax) || (isAtMin && wasAtMin);

    const wentUp = modVolume > prevVolume;
    const wentDown = modVolume < prevVolume;

    if (hittingEdgeAgain) {
        if (now - lastEdgeSoundTime < EDGE_SOUND_COOLDOWN) return;

        soundUrl = isAtMax ? ((Math.random() < 0.3) ? 'sound/volume/myfavorite.wav' : getTraySound("max")) : getTraySound("down");

        lastEdgeSoundTime = now;
    } else if (isAtMax && prevVolume < 1) {
        soundUrl = (Math.random() < 0.3) ? 'sound/volume/myfavorite.wav' : getTraySound("max");
        lastEdgeSoundTime = now;
    } else if (isAtMin && prevVolume > 0) {
        soundUrl = getTraySound("down");
        lastEdgeSoundTime = now;
    } else if (wentDown) {
        soundUrl = getTraySound("down");
    } else if (wentUp) {
        soundUrl = getTraySound("up");
    }

    if (!soundUrl) return;

    try {
        const response = await fetch(soundUrl);
        const buffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(buffer);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;

        const gainNode = audioContext.createGain();
        gainNode.gain.value = modVolume;

        source.connect(gainNode).connect(audioContext.destination);
        source.start();
    } catch (err) {
        console.error("Failed to play volume sound:", err);
    }
}

function showVolumeOverlay() {
    let overlay = document.getElementById('mod-volume-overlay');

    const iconMute = 'img/volume/mute.svg';
    const iconVolume = 'img/volume/no-mute.svg';

    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'mod-volume-overlay';

        Object.assign(overlay.style, {
            position: 'fixed',
            top: '77px',
            left: '50%',
            transform: 'translateX(-50%) translateY(-20px)',
            zIndex: '9999',
            pointerEvents: 'none',
            opacity: '0',
            transition: 'opacity 0.25s ease, transform 0.25s ease',
            display: 'flex',
            justifyContent: 'center'
        });

        const box = document.createElement('div');
        box.id = 'mod-volume-box';

        Object.assign(box.style, {
            background: 'var(--col4)',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '12px',
            gap: '15px',
            minWidth: '180px',
            height: '60px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5)',
        });

        const iconImg = document.createElement('img');
        iconImg.id = 'mod-volume-icon-img';
        Object.assign(iconImg.style, {
            width: '42px',
            height: '42px',
            objectFit: 'contain'
        });

        const sliderTrack = document.createElement('div');
        sliderTrack.id = 'mod-volume-track';
        Object.assign(sliderTrack.style, {
            flexGrow: '1',
            height: '4px',
            left: '-10px',
            background: 'white',
            position: 'relative',
            borderRadius: '2px',
            transition: 'opacity 0.2s ease'
        });

        const sliderThumb = document.createElement('div');
        sliderThumb.id = 'mod-volume-thumb';
        Object.assign(sliderThumb.style, {
            width: '20px',
            height: '20px',
            background: 'white',
            borderRadius: '50%',
            position: 'absolute',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            transition: 'left 0.1s ease-out'
        });

        sliderTrack.appendChild(sliderThumb);
        box.appendChild(iconImg);
        box.appendChild(sliderTrack);
        overlay.appendChild(box);
        document.body.appendChild(overlay);
    }

    const iconImg = overlay.querySelector('#mod-volume-icon-img');
    const track = overlay.querySelector('#mod-volume-track');
    const thumb = overlay.querySelector('#mod-volume-thumb');

    if (modVolume <= 0) {
        iconImg.src = iconMute;
        track.style.visibility = 'hidden';
    } else {
        iconImg.src = iconVolume;
        track.style.visibility = 'visible';

        const percentage = Math.min(Math.max(modVolume * 100, 0), 100);
        thumb.style.left = `${percentage}%`;
        const opacityValue = 0.3 + (modVolume * 0.7);
        track.style.opacity = opacityValue;
    }

    overlay.style.display = 'flex';
    void overlay.offsetWidth;
    overlay.style.opacity = '1';
    overlay.style.transform = 'translateX(-50%) translateY(0)';

    clearTimeout(overlay._timeout);
    clearTimeout(overlay._hideTimeout);

    overlay._timeout = setTimeout(() => {
        overlay.style.opacity = '0';
        overlay.style.transform = 'translateX(-50%) translateY(20px)';

        overlay._hideTimeout = setTimeout(() => {
            overlay.style.display = 'none';
        }, 250);
    }, 1500);
}
