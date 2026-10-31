/*
 * effects.js
 * Visual effects for mods: fades, shake, bloom, zoom, background colors, confetti,
 * glitch text, custom cursor and the full-screen video player.
 * Effects that flash the screen respect the "Fade Outs / BG Changes" setting (BGorFadeOutsOn),
 * shaking respects "Shake Effects" (ShakeEffectOn), confetti respects "Particles" (ConfettiEffectOn).
 */

/** Image used by the secret confetti easter egg in the settings menu. */
const secretE = "img/confetti-secret.png";

function screenFade(color, duration, fadeIn, onComplete) {
    document.getElementById("global-fade")?.remove();

    const layer = document.createElement("div");
    layer.id = "global-fade";
    Object.assign(layer.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        backgroundColor: color,
        zIndex: "9999",
        pointerEvents: "none",
        transition: duration > 0 ? `opacity ${duration}ms ease-in` : "none",
        opacity: fadeIn ? "0" : "1"
    });
    document.body.appendChild(layer);
    layer.offsetWidth;
    layer.style.opacity = fadeIn ? "1" : "0";

    if (duration > 0) {
        if (typeof onComplete == "function") setTimeout(onComplete, duration);
        if (!fadeIn) setTimeout(() => layer.remove(), duration);
    } else {
        if (typeof onComplete == "function") onComplete();
        if (!fadeIn) layer.remove();
    }
}

/**
 * Covers the whole screen with `color` and fades it away over `duration` ms.
 * With `fadeIn` = true it does the opposite (fades to the color and stays).
 */
function FadeOut(color, duration, fadeIn = false, onComplete = null) {
    if (!BGorFadeOutsOn) {
        return;
    }
    screenFade(color, duration, fadeIn, onComplete);
}

/** Same as FadeOut but ignores the "Fade Outs" setting (used for version transitions). */
function VersionFadeOut(color, duration, fadeIn = false, onComplete = null) {
    screenFade(color, duration, fadeIn, onComplete);
}

/** Same idea as FadeOut, but only over the stage background (behind the polos). */
function stageFadeOut(color, duration, fadeIn = false, onComplete = null) {
    const stage = document.getElementById("box-stage-bck");
    if (!stage) {
        return;
    }
    stage.querySelector(".stage-fade")?.remove();

    const layer = document.createElement("div");
    layer.className = "stage-fade";
    layer.style.backgroundColor = color;
    layer.style.opacity = fadeIn ? "0" : "1";
    layer.style.transition = duration > 0 ? `opacity ${duration}ms ease` : "none";
    stage.appendChild(layer);

    if (duration > 0) {
        layer.offsetWidth;
        layer.style.opacity = fadeIn ? "1" : "0";
        if (fadeIn && typeof onComplete == "function") {
            setTimeout(onComplete, duration);
        }
    } else {
        layer.style.opacity = fadeIn ? "1" : "0";
        if (fadeIn && typeof onComplete == "function") {
            onComplete();
        }
    }
}

/** Flashes the page background with `color`, fading out over `duration` ms (or forever if `keep`). */
function ChangeColorBG(color, duration, keep) {
    if (!BGorFadeOutsOn) return;

    const layer = document.createElement("div");
    layer.classList.add("fade-bg");
    Object.assign(layer.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        backgroundColor: color,
        zIndex: "-9999",
        transition: `opacity ${duration}ms ease-out`,
        opacity: "1"
    });
    document.body.appendChild(layer);
    if (!keep) {
        setTimeout(() => layer.style.opacity = "0", 10);
        setTimeout(() => layer.remove(), duration);
    }
}

/** Removes every background color added by ChangeColorBG. */
function CleanColorBG() {
    document.querySelectorAll(".fade-bg").forEach(el => el.remove());
}

/** Blurs + brightens the whole screen, then fades back over `duration` ms. */
function Bloom(power, duration = 1000) {
    if (!BGorFadeOutsOn) return;

    const layer = document.createElement("div");
    Object.assign(layer.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        zIndex: "99999999",
        transition: `opacity ${duration}ms ease-out`,
        opacity: "1",
        pointerEvents: "none",
        backdropFilter: `blur(${power}px) brightness(${power * 0.4})`
    });
    document.body.appendChild(layer);
    setTimeout(() => layer.style.opacity = "0", 10);
    setTimeout(() => layer.remove(), duration);
}

/** Shakes the whole page with `power` px, calming down over `duration` ms. */
function Shake(power, duration) {
    if (!ShakeEffectOn) return;

    const body = document.body;
    const originalCss = body.style.cssText;
    let start = null;
    const step = now => {
        if (!start) start = now;
        const elapsed = now - start;
        const strength = (duration - elapsed) / duration;
        const x = (Math.random() * 2 - 1) * power * strength;
        const y = (Math.random() * 2 - 1) * power * strength;
        body.style.transform = `translate(${x}px, ${y}px)`;
        if (elapsed < duration) {
            requestAnimationFrame(step);
        } else {
            body.style.cssText = originalCss;
        }
    };
    requestAnimationFrame(step);
}

/** Zooms the page to `percent`% (100 = normal). `easeIn` / `easeOut` pick a smooth 1 s transition. */
function Zoom(percent, easeIn, easeOut) {
    const body = document.body;
    body.style.transition = "";
    if (easeIn) {
        body.style.transition = "transform 1s cubic-bezier(0.55, 0.09, 0.68, 0.53)";
    } else if (easeOut) {
        body.style.transition = "transform 1s cubic-bezier(0.22, 0.61, 0.36, 1)";
    }
    body.style.transform = `scale(${percent / 100})`;
}

/** Quick "punch" zoom to `percent`% that springs back to 100%. */
function bounceZoom(percent) {
    const body = document.body;

    body.style.transition = "transform 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
    body.style.transform = `scale(${percent / 100})`;

    function backToNormal() {
        body.style.transition = "transform 0.25s cubic-bezier(0.25, 1, 0.5, 1)";
        body.style.transform = "scale(1)";
        body.removeEventListener("transitionend", backToNormal);
    }
    body.removeEventListener("transitionend", backToNormal);
    body.addEventListener("transitionend", backToNormal);
}

/**
 * Shoots image confetti from the element with id `elementId` (use "custom-cursor" for the mouse).
 * MakeConfetti(scale, spread, gravity, ticks, amount, elementId, imageSrc)
 */
function MakeConfetti(scale = 2, spread = 360, gravity = 1, ticks = 200, amount = 100, elementId, image) {
    if (!ConfettiEffectOn) return;

    confetti({
        spread: spread,
        ticks: ticks,
        gravity: gravity,
        decay: 0.94,
        startVelocity: 20,
        particleCount: amount,
        origin: getElementPosition(`#${elementId}`),
        scalar: scale,
        shapes: ["image"],
        shapeOptions: {
            image: [{ src: image, width: 32, height: 32 }]
        }
    });
}

/**
 * Scrambles the text of the element with id `elementId` every `speed` ms.
 * Stops by itself after `duration` ms (0 = until unGlitchText is called).
 */
function glitchText(elementId, speed = 10, duration = 0) {
    const textEl = document.getElementById(elementId);
    if (!textEl) return;

    const glitchChars = "!@#$%^&*()_+-=[]{}|;:',.<>?/\\ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const randomChar = () => glitchChars[Math.floor(Math.random() * glitchChars.length)];
    const scramble = text => [...text].map(ch => (ch !== " " && Math.random() < 0.5 ? randomChar() : ch)).join("");

    const originalText = textEl._glitchInterval ? textEl._originalText : textEl.textContent;
    clearInterval(textEl._glitchInterval);
    clearTimeout(textEl._glitchTimeout);

    textEl._originalText = originalText;
    textEl._glitchInterval = setInterval(() => {
        textEl.textContent = scramble(originalText);
    }, Math.max(1, speed));

    if (Number.isFinite(duration) && duration > 0) {
        textEl._glitchTimeout = setTimeout(() => unGlitchText(elementId), duration);
    }
}

/** Stops glitchText and restores the original text. */
function unGlitchText(elementId) {
    const textEl = document.getElementById(elementId);
    if (!textEl) return;

    clearInterval(textEl._glitchInterval);
    clearTimeout(textEl._glitchTimeout);
    textEl._glitchInterval = null;
    textEl._glitchTimeout = null;

    if (textEl._originalText !== undefined) {
        textEl.textContent = textEl._originalText;
    }
}

let customCursorActive = false;

function getCustomCursorElement() {
    let el = document.getElementById("custom-cursor");
    if (!el) {
        el = document.createElement("div");
        el.id = "custom-cursor";
        document.body.appendChild(el);
    }
    return el;
}

document.addEventListener("pointermove", e => {
    const el = document.getElementById("custom-cursor");
    if (el) {
        el.style.left = `${e.clientX}px`;
        el.style.top = `${e.clientY}px`;
    }
}, { passive: true });

/** Replaces the mouse cursor with an image (respects the "Custom Cursor" setting). */
function setCustomCursor(img) {
    if (!CustomCursorsOn) return;
    customCursorActive = true;

    if (!document.getElementById("custom-cursor-style")) {
        const style = document.createElement("style");
        style.id = "custom-cursor-style";
        style.textContent = "* { cursor: none !important; }";
        document.head.appendChild(style);
    }

    const el = getCustomCursorElement();
    el.style.background = `url('${img}') no-repeat center`;
    el.style.backgroundSize = "contain";
}

/** Brings the normal mouse cursor back. */
function removeCustomCursor() {
    customCursorActive = false;
    const el = document.getElementById("custom-cursor");
    if (el) el.style.background = "";
    document.getElementById("custom-cursor-style")?.remove();
}

let activeBoxVideo = null;

/** Plays a video full-screen (it can't be paused or skipped) and removes it when it ends. */
function playBoxVideo(videoPath) {
    if (document.getElementById("box-video-modal")) return;

    const modal = document.createElement("div");
    modal.id = "box-video-modal";
    modal.innerHTML = `
        <div class="box-video-backdrop"></div>
        <div class="box-video-content">
            <video id="box-video-player" src="${videoPath}" autoplay playsinline preload="auto"></video>
            <div class="box-video-blocker"></div>
        </div>
    `;
    document.body.appendChild(modal);

    const video = document.getElementById("box-video-player");
    activeBoxVideo = video;
    video.controls = false;
    video.disablePictureInPicture = true;
    video.controlsList = "nodownload nofullscreen noplaybackrate";
    video.play().catch(() => {
        console.log("Interaction required for audio/video");
    });

    video.addEventListener("ended", closeBoxVideo);
    video.addEventListener("pause", () => {
        if (activeBoxVideo === video && !video.ended) {
            video.play().catch(() => { });
        }
    });
}

/** Stops and removes the video started by playBoxVideo. */
function closeBoxVideo() {
    const video = activeBoxVideo;
    activeBoxVideo = null;
    video?.pause();
    document.getElementById("box-video-modal")?.remove();
}
