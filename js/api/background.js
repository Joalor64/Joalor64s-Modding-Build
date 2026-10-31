/*
 * background.js
 * Stage background & home screen images:
 *   replaceBackgroundSprite("night.png", 500)  - cross-fades the stage background (pauses with the game)
 *   setBackgroundLayer(url) / setEventBackgroundLayer(url) - extra layers drawn on the stage
 *   replaceHome("screen" | "titre" | "version" | "stores" | "color", value) - home screen images
 * Plus the promo banner (ModBanner / ModBannerLink in registerMod.js).
 */

/** Replaces a home screen image (file name inside the version's img folder) or the background color. */
function replaceHome(part, value) {
    if (part === "color") {
        document.documentElement.style.setProperty("--colBck", value);
        return;
    }
    if (!["screen", "titre", "version", "stores"].includes(part)) return;

    const cssVar = `--url-img-home-${part}`;
    const path = `../${app.folder}img/${value}`;
    document.documentElement.style.setProperty(cssVar, `url(${path})`);
    tryImageFallback(path, fallback => document.documentElement.style.setProperty(cssVar, `url(${fallback})`));
}

let currentFadeTimeout = null;
let isTransitioningB = false;
let transitionStartTime = null;
let transitionDuration = 0;
let transitionPath = null;
let transitionTimeRemaining = 0;

function startBackgroundFade(duration) {
    const current = document.getElementById("bck-current");
    const next = document.getElementById("bck-next");
    next.offsetWidth;
    current.style.transition = `opacity ${duration}ms ease`;
    next.style.transition = `opacity ${duration}ms ease`;
    next.style.opacity = 1;
    current.style.opacity = 0;
    transitionStartTime = Date.now();
    currentFadeTimeout = setTimeout(finishBackgroundTransition, duration);
}

/** Cross-fades the stage background to `fileName` (in the version's img folder) over `duration` ms. */
function replaceBackgroundSprite(fileName, duration = 500) {
    const current = document.getElementById("bck-current");
    const next = document.getElementById("bck-next");
    if (!current || !next) return;

    const path = `${app.folder}img/${fileName}`;

    if (currentFadeTimeout !== null) {
        clearTimeout(currentFadeTimeout);
        currentFadeTimeout = null;
    }

    if (duration === 0) {
        current.style.transition = "none";
        next.style.transition = "none";
        current.style.opacity = 1;
        next.style.opacity = 0;
        current.style.backgroundImage = `url(${path})`;
        tryImageFallback(path, fb => current.style.backgroundImage = `url(${fb})`);
        isTransitioningB = false;
        transitionPath = null;
        return;
    }

    const nextLayerImage = next.style.backgroundImage;
    const nextLayerOpacity = parseFloat(getComputedStyle(next).opacity);

    if (isTransitioningB && nextLayerImage === `url("${path}")` && !isPausedD) {
        currentFadeTimeout = setTimeout(finishBackgroundTransition, duration);
        return;
    }

    if (isTransitioningB) {
        current.style.transition = "none";
        current.style.backgroundImage = nextLayerImage;
        current.style.opacity = nextLayerOpacity;
    }

    next.style.transition = "none";
    next.style.opacity = 0;
    next.style.backgroundImage = `url(${path})`;
    tryImageFallback(path, fb => next.style.backgroundImage = `url(${fb})`);

    isTransitioningB = true;
    transitionPath = fileName;
    transitionDuration = duration;
    transitionTimeRemaining = duration;
    transitionStartTime = Date.now();

    if (!isPausedD) {
        startBackgroundFade(duration);
    }
}

function finishBackgroundTransition() {
    const current = document.getElementById("bck-current");
    const next = document.getElementById("bck-next");
    if (current && next) {
        current.style.transition = "none";
        current.style.backgroundImage = next.style.backgroundImage;
        current.style.opacity = 1;
        next.style.transition = "none";
        next.style.opacity = 0;
    }
    currentFadeTimeout = null;
    isTransitioningB = false;
    transitionPath = null;
}

/** Freezes a running background fade (called by pauseAllDelays). */
function pauseBackgroundTransition() {
    if (!isTransitioningB || currentFadeTimeout === null) return;

    transitionTimeRemaining = Math.max(0, transitionTimeRemaining - (Date.now() - transitionStartTime));
    clearTimeout(currentFadeTimeout);
    currentFadeTimeout = null;

    const current = document.getElementById("bck-current");
    const next = document.getElementById("bck-next");
    const currentOpacity = parseFloat(getComputedStyle(current).opacity);
    const nextOpacity = parseFloat(getComputedStyle(next).opacity);
    current.style.transition = "none";
    next.style.transition = "none";
    current.style.opacity = currentOpacity;
    next.style.opacity = nextOpacity;
}

/** Continues a frozen background fade (called by resumeAllDelays). */
function resumeBackgroundTransition() {
    if (isTransitioningB && transitionPath !== null && currentFadeTimeout === null) {
        startBackgroundFade(transitionTimeRemaining);
    }
}

/**
 * Called by cancelAllDelays(): a fade that is still running is left to finish on its own,
 * a fade that is frozen (game paused) jumps straight to its end so it can't get stuck half-way.
 */
function cancelBackgroundTransition() {
    if (isTransitioningB && currentFadeTimeout === null) {
        finishBackgroundTransition();
    }
}

function setBackgroundLayer(url) {
    document.getElementById("box-stage-bck")?.style.setProperty("--layer-image", `url(${url})`);
}

function setEventBackgroundLayer(url) {
    document.getElementById("box-stage-bck")?.style.setProperty("--layer-image-event", `url(${url})`);
}

function setupModBanner() {
    const banner = document.getElementById("promo-banner");
    if (!banner) return;

    if (typeof ModBanner === "undefined" || ModBanner === "") {
        banner.style.display = "none";
        return;
    }

    banner.style.display = "flex";
    const img = new Image();
    img.onload = () => banner.style.backgroundImage = `url(${ModBanner})`;
    img.onerror = () => {
        console.warn("Failed to load mod banner image:", ModBanner);
        banner.style.backgroundImage = `url("./asset-v1/img/banner-promo-template.png")`;
    };
    img.src = ModBanner;

    if (ModBannerLink && ModBannerLink !== "") {
        banner.style.transition = "opacity 0.3s";
        banner.style.pointerEvents = "auto";
        banner.style.cursor = "pointer";
        banner.addEventListener("mouseenter", () => banner.style.opacity = "0.5");
        banner.addEventListener("mouseleave", () => banner.style.opacity = "1");
        banner.addEventListener("click", () => confirmNavigation(ModBannerLink));
    }
}
