/*
 * audio.js
 * Main AudioContext, global gain/filter, volume fades and the "user gesture" unlock.
 */

var audioPort = "";
var globalSampleRate = 44100;
var globalVolumeMax = 1;
var globalVolumeMin = 0;
var globalFadeSpeed = 0.015;
function rebuildAudioContext() {
    return new Promise(function (e, o) {
        killAudioContext();
        initAudioContext();
        audioCtx.resume().then(() => {
            e();
        }).catch(e => {
            o(e);
        });
    });
}
function initAudioContext() {
    (audioCtx = new AudioContext()).onstatechange = checkStateAudioCtx;
    audioCtx.hasOwnProperty("sampleRate");
    audioCtx.hasOwnProperty("baseLatency");
    (globalGain = audioCtx.createGain()).connect(audioCtx.destination);
    globalGain.gain.value = globalVolumeMin;
}
function killAudioContext() {
    var e;
    var o;
    if (audioCtx) {
        e = audioCtx.createBuffer(2, globalSampleRate / 2, globalSampleRate);
        (o = audioCtx.createBufferSource()).buffer = e;
        o.connect(audioCtx.destination);
        o.start(0);
        o.disconnect();
        audioCtx.close();
        audioCtx = null;
    }
}
function globalVolumeFadeOut(e) {
    globalGain.gain.cancelScheduledValues(audioCtx.currentTime);
    globalGain.gain.setTargetAtTime(globalVolumeMin, audioCtx.currentTime, globalFadeSpeed);
    setTimeout(() => {
        globalGain.gain.value = globalVolumeMin;
        if (e) {
            e();
        }
    }, globalFadeSpeed * 6000);
}
function globalVolumeFadeIn(e) {
    const ctx = audioCtx;
    let stored = parseFloat(localStorage.getItem("modVolume"));
    if (isNaN(stored)) stored = 1.0;
    const targetVolume = Math.max(0, Math.min(1, stored));
    modVolume = targetVolume;
    globalGain.gain.cancelScheduledValues(ctx.currentTime);
    globalGain.gain.setTargetAtTime(targetVolume, ctx.currentTime, globalFadeSpeed);
    setTimeout(() => {
        globalGain.gain.value = targetVolume;
        console.log(`Patched globalVolumeFadeIn → target modVolume: ${Math.round(targetVolume * 100)}%`);
        if (typeof e === 'function') e();
    }, globalFadeSpeed * 6000);
}
function checkStateAudioCtx() {
    if (audioCtx && audioCtx.state != "running" && onGame && loopOn && !pause && !leaveApp) {
        appOnPause();
        appOnResume();
    }
}
function checkAudioCanRun() {
    return new Promise(function (e, o) {
        var t;
        if (audioCtx && audioCtx.currentTime) {
            t = audioCtx.currentTime;
            setTimeout(() => {
                if (t == audioCtx.currentTime) {
                    o(new Error("audioCtx.currentTime is stuck"));
                } else {
                    e();
                }
            }, 150);
        } else {
            o(new Error("audioCtx or audioCtx.currentTime is null"));
        }
    });
}
var needToforceUserGesture = true;
function forceUserGesture(e) {
    if (!needToforceUserGesture) {
        if (e) {
            e();
        }
        return false;
    }
    var o;
    needToforceUserGesture = false;
    var t = new SoundObject();
    t.setSilence();
    t.prepare(tabBuffer.sound[0].sndA);
    t.play();
    t.stop();
    if (listBonus.length) {
        o = 0;
        listBonus.forEach(function (t) {
            var n = t.video.currentTime;
            t.video.play().then(function () {
                t.video.pause();
                t.video.currentTime = n;
                if (++o == listBonus.length && e) {
                    e();
                }
            }).catch(function (e) {
                popupGeneralError({
                    error: "force video play"
                });
                throw new Error(e);
            });
        });
    } else if (e) {
        e();
    }
}
