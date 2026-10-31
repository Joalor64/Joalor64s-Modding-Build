/*
 * objects/polo-keyframes.js
 * Custom keyframe animations for the three built-in polo movements (based on PacificY's template):
 *
 *   rebond       a picto was dropped on the polo (the little bounce)
 *   deshabiller  the polo was cleared (it drops off the stage)
 *   remonte      the cleared polo comes back up (also used when the stage first appears)
 *
 * Define any of these in js/mod.js. Each receives the PoloObject (`self`) and returns an animation,
 * or null/undefined to keep the built-in movement:
 *
 *   function _loadAnime_rebond(self) {
 *       return {
 *           totalDuration: 0.3,                       // seconds
 *           keyframes: [                              // `time` goes from 0 to 1 (fraction of totalDuration)
 *               { time: 0,     y: self.targetY },
 *               { time: 1 / 3, y: self.targetY - drawMaxBounceY, ease: "Quint.easeOut" },
 *               { time: 1,     y: self.targetY,                  ease: "Back.easeOut" }
 *           ]
 *       };
 *   }
 *
 * Keyframe properties (all optional, a property left out is not animated by that keyframe):
 *   y            vertical position on the canvas (self.drawPoloY)
 *   x            horizontal position on the canvas (self.drawPoloX, absolute - PacificY compatible)
 *   offsetX      horizontal offset from the polo's slot (easier than x, survives window resizes)
 *   rotate       rotation of the whole polo, in radians (use deg(15) for degrees)
 *   headRotate   extra rotation of the animated head only, in radians
 *   scaleX, scaleY, scale    1 = normal size
 *   pivotX, pivotY           rotation/scale center, 0-1 across the polo (default 0.5, 0.5)
 *   alpha        0-1 opacity
 *   ease         how the polo moves INTO this keyframe: an ease object (Back.easeOut), a string
 *                ("Back.easeOut", "Elastic.easeOut.config(1.3, 0.4)") or GSAP 3 style ("back.out(1.7)")
 *
 * Useful values on `self`: drawPoloY (current Y), targetY (resting Y), id (polo slot),
 * getPicto().id (picto number), rebond_anime / deshabiller_anime / remonte_anime (the "rebond",
 * "deshabiller" and "remonte" fields of the character in app.json or its anime JSON).
 * Globals: drawMaxTopY (off-stage Y), drawMinTopY, drawMaxBounceY (built-in bounce height).
 *
 * defaultPoloAnime.rebond(self) / .deshabiller(self) / .remonte(self) return the built-in movements
 * as keyframes, so you can return them as a fallback or copy them as a starting point.
 *
 * Upside-down and "bat" polos always use the built-in movements.
 */

/** Keyframe field -> PoloObject property. */
const POLO_KEYFRAME_PROPS = {
    y: "drawPoloY",
    x: "drawPoloX",
    offsetX: "animOffsetX",
    rotate: "drawPoloR",
    headRotate: "drawPoloHeadR",
    scaleX: "scaleX",
    scaleY: "scaleY",
    pivotX: "pivotX",
    pivotY: "pivotY",
    alpha: "alpha"
};

/** Degrees -> radians, for keyframes: { rotate: deg(10) } */
function deg(degrees) {
    return degrees * Math.PI / 180;
}

/**
 * Turns an ease given as a string into a GSAP ease. Accepts ease objects/functions as they are.
 *   "Back.easeOut", "Elastic.easeOut.config(1.3, 0.4)", "Linear.easeNone"   (GSAP 2, like PacificY)
 *   "back.out(1.7)", "power2.inOut", "elastic.out(1, 0.3)", "none"           (GSAP 3 names)
 */
function resolvePoloEase(ease, fallback) {
    if (ease == null || ease === "") return fallback;
    if (typeof ease !== "string") return ease;
    const text = ease.trim();
    const parseArgs = args => (args || "").split(",").map(s => parseFloat(s)).filter(n => !isNaN(n));

    let m = text.match(/^([A-Za-z]+\d?)\.(ease[A-Za-z]*)(?:\.config\(([^)]*)\))?$/);
    if (m && window[m[1]] && window[m[1]][m[2]]) {
        let e = window[m[1]][m[2]];
        if (m[3] !== undefined && typeof e.config === "function") e = e.config(...parseArgs(m[3]));
        return e;
    }

    m = text.match(/^([a-z]+)(\d?)(?:\.(in|out|inout))?(?:\(([^)]*)\))?$/i);
    if (m) {
        const name = m[1].toLowerCase();
        if (name === "none" || name === "linear") return Linear.easeNone;
        const className = name === "power" ? "Power" + (m[2] || "1") : name.charAt(0).toUpperCase() + name.slice(1);
        const dir = { in: "easeIn", out: "easeOut", inout: "easeInOut" }[(m[3] || "out").toLowerCase()];
        let e = window[className] && window[className][dir];
        if (e) {
            if (m[4] !== undefined && typeof e.config === "function") e = e.config(...parseArgs(m[4]));
            return e;
        }
    }

    console.warn(`[polo anime] Unknown ease "${ease}", using the default one.`);
    return fallback;
}

/** Built-in movements, as keyframes. */
const defaultPoloAnime = {
    rebond: self => ({
        totalDuration: 0.3,
        keyframes: [
            { time: 0, y: self.targetY },
            { time: 1 / 3, y: self.targetY - drawMaxBounceY, ease: "Quint.easeOut" },
            { time: 1, y: self.targetY, ease: "Back.easeOut" }
        ]
    }),
    deshabiller: self => ({
        totalDuration: 0.3,
        keyframes: [
            { time: 0, y: self.drawPoloY },
            { time: 1, y: drawMaxTopY, ease: "Quint.easeIn" }
        ]
    }),
    remonte: self => ({
        totalDuration: 0.4,
        keyframes: [
            { time: 0, y: self.drawPoloY },
            { time: 1, y: self.targetY, ease: "Back.easeOut" }
        ]
    })
};

/** Asks mod.js for a custom animation (`_loadAnime_<name>(self)`). Returns null to use the built-in one. */
function getPoloAnime(name, polo) {
    const hook = window["_loadAnime_" + name];
    if (typeof hook !== "function") return null;
    let anim;
    try {
        anim = hook(polo);
    } catch (err) {
        console.error(`[polo anime] _loadAnime_${name}() failed:`, err);
        return null;
    }
    if (!anim || !Array.isArray(anim.keyframes) || anim.keyframes.length === 0) return null;
    return anim;
}

/** Stops a polo's keyframe animation (without running its onComplete). */
function killPoloKeyframes(polo) {
    if (polo._keyframeTimeline) {
        polo._keyframeTimeline.eventCallback("onComplete", null);
        polo._keyframeTimeline.kill();
        polo._keyframeTimeline = null;
    }
}

/** Puts rotation/scale/alpha/offset back to normal. */
function resetPoloTransform(polo) {
    polo.drawPoloR = 0;
    polo.drawPoloHeadR = 0;
    polo.scaleX = 1;
    polo.scaleY = 1;
    polo.pivotX = 0.5;
    polo.pivotY = 0.5;
    polo.alpha = 1;
    polo.animOffsetX = 0;
}

/** True when the polo must be drawn with a canvas transform. */
function poloHasTransform(polo) {
    return (polo.drawPoloR || 0) !== 0
        || (polo.scaleX ?? 1) !== 1
        || (polo.scaleY ?? 1) !== 1
        || (polo.alpha ?? 1) !== 1
        || (polo.animOffsetX || 0) !== 0;
}

/**
 * Plays a keyframe animation on a polo.
 * @param anim  { totalDuration, keyframes: [{ time, y, rotate, ..., ease }] }
 * @param opts  { delay (seconds), onComplete, defaultEase }
 */
function playPoloKeyframes(polo, anim, opts = {}) {
    killPoloKeyframes(polo);

    const total = Math.max(0, Number(anim.totalDuration ?? anim.duration) || 0);
    const delay = Math.max(0, Number(opts.delay) || 0);
    const defaultEase = opts.defaultEase || Back.easeOut;
    const frames = anim.keyframes
        .filter(k => k && typeof k.time === "number" && isFinite(k.time))
        .map(k => Object.assign({}, k, { time: Math.min(1, Math.max(0, k.time)) }))
        .sort((a, b) => a.time - b.time);

    const values = kf => {
        const out = {};
        for (const key in POLO_KEYFRAME_PROPS) {
            const v = kf[key];
            if (typeof v === "number" && isFinite(v)) out[POLO_KEYFRAME_PROPS[key]] = v;
        }
        if (typeof kf.scale === "number" && isFinite(kf.scale)) {
            if (!("scaleX" in out)) out.scaleX = kf.scale;
            if (!("scaleY" in out)) out.scaleY = kf.scale;
        }
        return out;
    };

    const tl = new TimelineMax({
        onComplete: () => {
            if (polo._keyframeTimeline === tl) polo._keyframeTimeline = null;
            opts.onComplete?.();
        }
    });
    polo._keyframeTimeline = tl;

    if (frames.length) {
        tl.set(polo, values(frames[0]), delay + frames[0].time * total);
        for (let i = 1; i < frames.length; i++) {
            const prev = frames[i - 1];
            const curr = frames[i];
            const at = delay + prev.time * total;
            const duration = (curr.time - prev.time) * total;
            const v = values(curr);
            if (duration <= 0) {
                tl.set(polo, v, at);
            } else {
                v.ease = resolvePoloEase(curr.ease, defaultEase);
                tl.to(polo, duration, v, at);
            }
        }
    }
    if (tl.duration() < delay + total) tl.set({}, {}, delay + total);
    return tl;
}
