/*
 * version-config.js
 * data/configs/versionConfig.jsonc: per-version texts for the auto (random) mode overlay.
 */

let versionConfig = {};

async function loadVersionConfig(path = "data/configs/versionConfig.jsonc") {
    try {
        const res = await fetch(path);
        if (!res.ok) throw new Error("Config not found");

        versionConfig = parseJSONC(await res.text());

        console.log("Version config loaded:", versionConfig);
    } catch (err) {
        console.warn("Using default version behavior", err);
    }
}

function getVersionConfig() {
    return versionConfig["v" + appVersion] || {};
}

function resolveText(value, fallbackKey) {
    if (!value) return STR(fallbackKey);

    if (typeof value === "string" && value.startsWith("{STR}:")) {
        const key = value.replace("{STR}:", "");
        const result = STR(key);
        return result ?? key;
    }

    return value;
}

async function setDynamicOverlay() {
    const overlay = document.querySelector('.screen-overlay');
    if (!overlay) return;

    const config = getVersionConfig();
    const isBack = config.overlayBack !== false;

    overlay.classList.toggle('layer-back', isBack);
    overlay.classList.toggle('layer-front', !isBack);

    const basePath = `asset-v${appVersion}/img/game-overlay`;
    const extensions = ['.png', '.gif', '.svg'];
    const cacheBuster = Date.now();

    const probes = extensions.map(ext => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const path = `${basePath}${ext}?v=${cacheBuster}`;

            img.onload = () => resolve(path);
            img.onerror = () => reject();
            img.src = path;
        });
    });

    try {
        const fastestPath = await Promise.any(probes);
        overlay.style.backgroundImage = `url('${fastestPath}')`;
    } catch (err) {
        console.warn("Overlay: No images found for any extension.");
    }
}

loadVersionConfig().then(() => {
    setDynamicOverlay();
});
