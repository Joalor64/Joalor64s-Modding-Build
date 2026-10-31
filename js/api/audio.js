/*
 * audio.js
 * Sound effects for mods.
 *   PlaySFX("boom.ogg")            -> plays <version folder>/sound/mod/boom.ogg
 *   PlayRegularSFX("click.wav")    -> plays sound/click.wav (shared, not per version)
 *   playAudio(url, { loop, fadeIn, fadeOut, fadeDuration }) -> returns { audio, pause, stop, toggleMute }
 * All of them follow the in-game volume (modVolume, see volume.js). PlaySFX and playAudio are
 * silent when the "Custom SFX" setting is off.
 */

window._allAudios = window._allAudios || [];

/**
 * Plays a sound file with optional loop and fades. Pauses automatically while the app is hidden.
 * Returns a small controller: { audio, pause(), stop(), toggleMute() } (or undefined when SFX are off).
 */
function playAudio(url, options = {}) {
    if (!ModSoundsOn) {
        return;
    }
    const {
        loop = false,
        fadeIn = false,
        fadeOut = false,
        fadeDuration = 1000
    } = options;

    const audio = new Audio(url);
    audio.loop = !!loop;
    audio.muted = false;
    audio.volume = fadeIn ? 0 : modVolume;
    audio._wasPlayingBeforeHidden = false;
    audio._userPaused = false;
    audio._stopped = false;
    window._allAudios.push(audio);

    let fadeTimer = null;
    const FADE_STEP = 50;

    function clearFadeTimer() {
        if (fadeTimer) {
            clearInterval(fadeTimer);
            fadeTimer = null;
        }
    }
    function doFadeIn() {
        clearFadeTimer();
        let vol = audio.volume || 0;
        fadeTimer = setInterval(() => {
            vol += (FADE_STEP / fadeDuration) * modVolume;
            if (vol >= modVolume) {
                audio.volume = modVolume;
                clearFadeTimer();
            } else {
                audio.volume = Math.max(0, Math.min(1, vol));
            }
        }, FADE_STEP);
    }
    function doFadeOut(callback) {
        clearFadeTimer();
        let vol = audio.volume;
        const stepSize = (FADE_STEP / fadeDuration) * Math.max(vol, 0.01);
        fadeTimer = setInterval(() => {
            vol -= stepSize;
            if (vol <= 0) {
                audio.volume = 0;
                clearFadeTimer();
                if (callback) callback();
            } else {
                audio.volume = Math.max(0, vol);
            }
        }, FADE_STEP);
    }
    function cleanup() {
        clearFadeTimer();
        document.removeEventListener("visibilitychange", visibilityHandler);
        audio.removeEventListener("ended", onEnded);
        const i = window._allAudios.indexOf(audio);
        if (i !== -1) {
            window._allAudios.splice(i, 1);
        }
    }
    function onEnded() {
        if (!audio.loop) {
            cleanup();
        }
    }
    function visibilityHandler() {
        if (document.visibilityState === "hidden") {
            audio._wasPlayingBeforeHidden = !audio.paused && !audio.ended;
            if (audio._wasPlayingBeforeHidden) {
                safePause(false);
            }
        } else {
            if (audio._wasPlayingBeforeHidden && !audio.ended && !audio._userPaused && !audio._stopped) {
                audio.play().catch(() => { });
            }
            audio._wasPlayingBeforeHidden = false;
        }
    }
    function safePause(userRequested = true) {
        try {
            audio.pause();
            if (userRequested) {
                audio._userPaused = true;
            }
        } catch (e) { }
    }
    function safeStop() {
        try { audio.pause(); } catch (e) { }
        try { audio.currentTime = 0; } catch (e) { }
        audio._stopped = true;
        audio._userPaused = false;
        cleanup();
    }

    audio.addEventListener("ended", onEnded);
    document.addEventListener("visibilitychange", visibilityHandler);

    audio.play().then(() => {
        if (fadeIn) {
            doFadeIn();
        }
    }).catch(() => { });

    return {
        audio,
        pause: () => fadeOut ? doFadeOut(() => safePause(true)) : safePause(true),
        stop: () => fadeOut ? doFadeOut(safeStop) : safeStop(),
        toggleMute: () => audio.muted = !audio.muted
    };
}

/** Pauses every sound started with playAudio(). */
window.pauseAllAudio = function () {
    window._allAudios.forEach(a => {
        try {
            a.pause();
            a._userPaused = true;
        } catch (e) { }
    });
};

/** Resumes sounds paused by the system (not the ones paused on purpose). */
window.resumeAllAudio = function () {
    window._allAudios.forEach(a => {
        try {
            if (!a.ended && a.paused && !a._stopped && !a._userPaused) {
                a.play();
            }
        } catch (e) { }
    });
};

if (window.cordova) {
    document.addEventListener("pause", () => window.pauseAllAudio(), false);
    document.addEventListener("resume", () => window.resumeAllAudio(), false);
}

function playSimpleSound(src, displayPath) {
    const sfx = new Audio(src);
    sfx.volume = modVolume;
    sfx.play().catch(() => {
        boxDialog.open(`Oops! We can't play the sound file "${displayPath}".<br><br>Make sure the file exists at:<br><b>${displayPath}</b>`, "~(>_<。)\\");
    });
    return sfx;
}

/** Plays a sound from the shared sound/ folder. */
function PlayRegularSFX(fileName) {
    return playSimpleSound(`./sound/${fileName}`, `sound/${fileName}`);
}

/** Plays a sound from the current version's sound/mod/ folder (respects the "Custom SFX" setting). */
function PlaySFX(fileName) {
    if (!ModSoundsOn) return;
    return playSimpleSound(`./${app.folder}sound/mod/${fileName}`, `${app.folder}sound/mod/${fileName}`);
}
