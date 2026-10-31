/*
 * debug/live-reload.js
 * Live reloading (desktop app): save a file of your mod and the game reloads by itself.
 *   - On by default when `LiveReload = true` in js/registerMod.js (turn it off before releasing!)
 *   - F9 turns it on/off for this session either way.
 *   - Saving only .css files swaps the styles without reloading; saving main-process files
 *     (electron/, elec-*.js) shows a "restart the app" message instead.
 * The watching itself is done by the app (electron/dev.js). While it's on, the mod checker (F8) also
 * runs after every reload and shows a toast when it finds problems.
 */

/** True when live reloading is on for this page. */
function isLiveReloadOn() {
    try {
        const override = sessionStorage.getItem("liveReloadOverride");
        if (override !== null) return override === "1";
    } catch (e) { }
    return typeof LiveReload !== "undefined" && !!LiveReload;
}

const LiveReloadClient = (() => {
    const bridge = () => window.electron?.ipc?.liveReload;

    function notify(title, text) {
        if (typeof toast !== "undefined" && toast.show) toast.show(title, 4, text);
        else console.log(`[live reload] ${title}: ${text}`);
    }

    /** Re-downloads the stylesheets whose file changed (all of them if unsure). */
    function swapCSS(files) {
        const names = files.map(f => f.split("/").pop().toLowerCase());
        document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
            const href = link.getAttribute("href") || "";
            const file = href.split(/[?#]/)[0].split("/").pop().toLowerCase();
            if (!names.length || names.includes(file)) {
                link.setAttribute("href", href.split("?")[0] + "?live=" + Date.now());
            }
        });
        console.log("[live reload] styles updated:", files.join(", "));
    }

    function start() {
        if (!bridge()) return false;
        bridge()(true);
        return true;
    }

    function stop() {
        bridge()?.(false);
    }

    if (window.electron?.ipc?.onLiveReload) {
        window.electron.ipc.onLiveReload(msg => {
            if (!msg || !isLiveReloadOn()) return;
            if (msg.type === "css") swapCSS(msg.files || []);
            if (msg.type === "restart") notify("Restart the app", `${(msg.files || []).join(", ")} changed: main process files only update after a restart.`);
        });
    }

    return { start, stop, swapCSS };
})();

if (isLiveReloadOn()) LiveReloadClient.start();

onKey("F9", () => {
    if (!window.electron?.ipc?.liveReload) {
        console.log("Live reloading only works in the desktop app.");
        return;
    }
    const on = !isLiveReloadOn();
    try {
        sessionStorage.setItem("liveReloadOverride", on ? "1" : "0");
    } catch (e) { }
    if (on) LiveReloadClient.start();
    else LiveReloadClient.stop();
    if (typeof toast !== "undefined" && toast.show) toast.show("Live reload", 3, on ? "On: saving a file reloads the game." : "Off");
}, false, true, "Live reload on/off (desktop)");
