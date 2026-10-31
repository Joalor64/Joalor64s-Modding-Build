/*
 * timers.js
 * Time-based triggers for mods: OnDelayIn (pausable timeouts), onBPM, onLoop.
 * Everything here freezes while the game is paused (pauseOn/pauseOff call pauseAllDelays/resumeAllDelays)
 * and is cancelled by stopAllStage() through cancelAllDelays().
 */

let activeDelays = [];
let isPausedD = false;

class PausableDelay {
    constructor(callback, delay) {
        this.callback = callback;
        this.delay = delay;
        this.startTime = Date.now();
        this.timeRemaining = delay;
        this.timeoutId = null;
        this.isActive = true;
        if (!isPausedD) {
            this.resume();
        }
    }
    pause() {
        if (this.isActive && this.timeoutId !== null) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
            this.timeRemaining = Math.max(0, this.timeRemaining - (Date.now() - this.startTime));
        }
    }
    resume() {
        if (this.isActive && this.timeoutId === null) {
            this.startTime = Date.now();
            this.timeoutId = setTimeout(() => this.complete(), this.timeRemaining);
        }
    }
    complete() {
        if (this.isActive) {
            this.isActive = false;
            activeDelays = activeDelays.filter(d => d !== this);
            this.callback();
        }
    }
    cancel() {
        if (this.isActive) {
            this.isActive = false;
            if (this.timeoutId !== null) {
                clearTimeout(this.timeoutId);
                this.timeoutId = null;
            }
            activeDelays = activeDelays.filter(d => d !== this);
        }
    }
}

/**
 * Runs `callback` after `delay` ms. The countdown stops while the game is paused.
 * Returns the delay object (call .cancel() on it to abort).
 */
function OnDelayIn(delay, callback) {
    const d = new PausableDelay(callback, delay);
    activeDelays.push(d);
    return d;
}

/** Called by the engine when the game gets paused. */
function pauseAllDelays() {
    if (isPausedD) return;
    isPausedD = true;
    activeDelays.forEach(d => d.pause());
    pauseBPM();
    if (typeof pauseBackgroundTransition === "function") pauseBackgroundTransition();
}

/** Called by the engine when the game gets unpaused. */
function resumeAllDelays() {
    if (!isPausedD) return;
    isPausedD = false;
    activeDelays.forEach(d => d.resume());
    resumeBPM();
    if (typeof resumeBackgroundTransition === "function") resumeBackgroundTransition();
}

/** Cancels every pending OnDelayIn (the engine calls this from stopAllStage()). */
function cancelAllDelays() {
    activeDelays.slice().forEach(d => d.cancel());
    activeDelays = [];
    if (typeof cancelBackgroundTransition === "function") cancelBackgroundTransition();
}

/** Old name, kept so older mods keep working. */
function clearAllDelays() {
    cancelAllDelays();
}

let bpmCallback = null;
let bpmValue = 0;
let lastBeatTime = 0;
let animFrameId = null;
let bpmPaused = false;
let bpmPauseStartTime = 0;
let timeOffset = 0;

function bpmLoop(now) {
    if (!bpmCallback || bpmPaused) {
        animFrameId = requestAnimationFrame(bpmLoop);
        return;
    }
    const beatLength = 60 / bpmValue * 1000;
    const time = now - timeOffset;
    if (time - lastBeatTime >= beatLength) {
        lastBeatTime += beatLength;
        if (time - lastBeatTime >= beatLength) {
            lastBeatTime = time;
        }
        bpmCallback();
    }
    animFrameId = requestAnimationFrame(bpmLoop);
}

/** Calls `callback` on every beat at `bpm` beats per minute. Only one onBPM can run at a time. */
function onBPM(bpm, callback) {
    offBPM();
    bpmValue = bpm;
    bpmCallback = callback;
    lastBeatTime = performance.now();
    bpmPaused = false;
    timeOffset = 0;
    animFrameId = requestAnimationFrame(bpmLoop);
}

/** Stops the current onBPM. */
function offBPM() {
    if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
    }
    bpmCallback = null;
    bpmValue = 0;
    lastBeatTime = 0;
    bpmPaused = false;
    timeOffset = 0;
}

function pauseBPM() {
    if (!bpmPaused) {
        bpmPaused = true;
        bpmPauseStartTime = performance.now();
    }
}

function resumeBPM() {
    if (bpmPaused) {
        timeOffset += performance.now() - bpmPauseStartTime;
        bpmPaused = false;
    }
}

let loopIntervals = [];

/** Calls `callback` every `loops` loops (app.looptime * loops ms). Skipped while the game is paused. */
function onLoop(loops, callback) {
    if (typeof app.looptime != "number" || app.looptime <= 0) {
        return;
    }
    if (loops <= 0) {
        boxDialog.open("Loop multiplier must be greater than zero.");
        return;
    }
    const id = setInterval(() => {
        if (!isPausedD) callback();
    }, app.looptime * loops);
    loopIntervals.push(id);
}

/** Stops every onLoop. */
function offLoop() {
    loopIntervals.forEach(id => clearInterval(id));
    loopIntervals = [];
}
