/*
 * objects/sound.js
 * SoundObject: one decoded sound played through the main AudioContext.
 */

function SoundObject(e) {
    if (typeof audioCtx != "object" || !audioCtx) {
        throw new Error("Aucun AudioContxt n'a été déclaré");
    }
    var o = this;
    var t = null;
    var n = null;
    var i = null;
    var a = 0;
    var s = false;
    var r = false;
    var l = false;
    this.getMute = function () {
        return s;
    };
    this.getDuration = function () {
        if (n != null) {
            return n.duration;
        } else {
            return 0;
        }
    };
    this.getCurrentTime = function () {
        if (t != null && t.context != null) {
            return t.context.currentTime;
        } else {
            return 0;
        }
    };
    this.setSilence = function () {
        l = true;
    };
    this.setVolume = function (e) {
        i.gain.setValueAtTime(e, audioCtx.currentTime);
    };
    this.onComplete = function (e) {
        t.onended = e;
    };
    this.prepare = function (e, a) {
        n = e;
        i = audioCtx.createGain();
        (t = audioCtx.createBufferSource()).buffer = n;
        e = a == 0 || s || l ? globalVolumeMin : globalVolumeMax;
        o.setVolume(e);
        t.connect(i);
        i.connect(globalGain);
        globalGain.connect(audioCtx.destination);
    };
    this.play = function (e, n) {
        r = true;
        a = (a = (a = decimal(e, 3) || 0) > o.getDuration() ? decimal(o.getDuration(), 2) - 0.01 : a) < 0 ? 0 : a;
        t.start(0, a);
        if (!(n !== true || s || l)) {
            o.fadeIn();
        }
    };
    this.stop = function (e) {
        if (e || t == null || !r || l || s) {
            o.stopSource();
        } else {
            o.fadeOut(true);
        }
    };
    this.stopSource = function () {
        if (t != null && r) {
            t.stop(0);
            t.onended = null;
        }
        a = 0;
        i = t = null;
        r = s = false;
    };
    this.fadeOut = function (e) {
        i.gain.setTargetAtTime(globalVolumeMin, audioCtx.currentTime, globalFadeSpeed);
        if (e) {
            t.stop(audioCtx.currentTime + globalFadeSpeed * 6);
            t.onended = o.stopSource;
        }
    };
    this.fadeIn = function () {
        i.gain.setTargetAtTime(globalVolumeMax, audioCtx.currentTime, globalFadeSpeed);
    };
    this.mute = function () {
        if (t && !l) {
            o.fadeOut();
        }
        s = true;
    };
    this.unmute = function () {
        if (t && !l) {
            o.fadeIn();
        }
        s = false;
    };
}
