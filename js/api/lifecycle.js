/*
 * lifecycle.js
 * Page-level glue: runs modLoaded() once the version finished loading (the play button appears),
 * sets the tab title/favicon, and remembers the last page for the mod library's back button.
 *
 * Hook: define afterModLoads() in mod.js to run code once everything is ready.
 */

/** Runs once the current version has loaded (app.html). */
function modLoaded() {
    initUpdatedPictoIcons();
    initPictoSize();
    displayNewMods();
    checkAndShowUpdateNotice(RegisterMod);
    app.recmaxloop = app.maxrecloop;
    initAmbience();
    adjustPictoWidth();
    setupModBanner();
    afterModLoads();
}
/** Empty hook: redefine it in mod.js. */
function afterModLoads() { }
window.addEventListener("beforeunload", () => {
    localStorage.setItem("lastPage", window.location.href);
});

if (getHtmlName() !== "index.html") {
    waitForElement("#home-bt-play", playButton => {
        const observer = new MutationObserver(() => {
            if (playButton.classList.contains("animate")) {
                observer.disconnect();
                modLoaded();
            }
        });
        observer.observe(playButton, { attributes: true, attributeFilter: ["class"] });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    OnDelayIn(500, function () {
        const versionId = getVersionFromURL();
        const versionIconPath = isModboxApp ? `asset-v${versionId}/image/icon.jpg` : `asset-v${versionId}/icon.png`;
        setFaviconSmart(versionIconPath, window.versionCustomIcons?.[versionId]);
        document.title = `${(getHtmlName() == "app.html" ? app?.name : "Incredibox") || "Incredibox"} | ${RegisterMod}`;
    });
});

document.addEventListener("DOMContentLoaded", function () {
    window.app = window.app || {};
    if (window.electron) {
        app.isElectron = true;
        app.folder = "";
    } else {
        app.isElectron = false;
        app.folder = "asset-v1/";
    }
});
