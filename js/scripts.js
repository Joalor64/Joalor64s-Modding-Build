/*
 * js/scripts.js
 * The ONE list of scripts that index.html (version select menu) and app.html (a version) load, in order.
 * Both pages only contain: <script src="js/scripts.js" data-page="index"></script> (or "app")
 *
 * To add a file: put its path in the right group below. A plain string loads on both pages,
 * { src: "...", page: "app" } (or "index") loads on one page only.
 * Order matters for code that runs while the file loads (see STRUCTURE.md "Load order rule").
 *
 * Why document.write: the files have to run one after another, synchronously, before the page's
 * DOMContentLoaded event (registerMod.js, lifecycle.js... listen for it). Scripts written this way are
 * parsed exactly like <script> tags in the HTML, while scripts added with createElement are not.
 */
(function () {
    const SCRIPTS = [
        // debug tools
        "js/debug/console-viewer.js",
        "js/debug/f3-overlay.js",
        "js/runners/iconsLoader.js",

        // your mod's settings
        "js/registerMod.js",
        "js/api/achievements.js",
        { src: "js/api/achievements-counter.js", page: "app" },
        "js/buttons.js",
        "js/customUI.js",

        // modding API (js/api)
        "js/api/version.js",
        "js/api/helpers.js",
        "js/api/settings.js",
        "js/api/timers.js",
        "js/api/dom.js",
        "js/api/storage.js",
        "js/api/effects.js",
        "js/api/stage-lighting.js",
        "js/api/audio.js",
        "js/api/volume.js",
        "js/api/ambience.js",
        "js/api/messages.js",
        "js/api/lyrics.js",
        "js/api/pictos.js",
        "js/api/polos.js",
        "js/api/background.js",
        "js/api/version-select.js",
        "js/api/credits.js",
        "js/api/settings-menu.js",
        "js/api/mod-library.js",
        "js/api/about.js",
        "js/api/mod-buttons.js",
        "js/api/custom-ui.js",
        "js/api/special-events.js",
        "js/api/lifecycle.js",
        "js/api/keys.js",
        "js/debug/hotkeys.js",
        "js/debug/live-reload.js",
        "js/debug/mod-checker.js",

        // libraries
        "js/libs/jquery.js",
        "js/libs/tsparticles.confetti.bundle.min.js",
        { src: "js/api/clouds.js", page: "app" },
        { src: "js/libs/particles.js", page: "app" },
        "js/libs/TweenMax.min.js",
        "js/libs/EasePack.min.js",
        "js/libs/ScrollToPlugin.min.js",
        "js/runners/flagsLoader.js",
        "lang/lang.js",

        // game engine (js/engine)
        "js/engine/app-data.js",
        "js/engine/utils.js",
        "js/engine/layout.js",
        "js/engine/device.js",
        "js/engine/rules-css.js",
        "js/engine/ui/dialog.js",
        "js/engine/ui/popups.js",
        "js/engine/ui/modbox-credits.js",
        "js/engine/ui/mix-form.js",
        "js/engine/i18n.js",
        "js/engine/loader.js",
        "js/engine/storage.js",
        "js/engine/objects/bonus.js",
        "js/engine/objects/clock.js",
        "js/engine/objects/reading-bar.js",
        "js/engine/objects/render.js",
        "js/engine/focus.js",
        "js/engine/params.js",
        "js/engine/window.js",
        "js/engine/init.js",
        "js/engine/home.js",
        "js/engine/game.js",
        "js/engine/loop.js",
        "js/engine/pause.js",
        "js/engine/queries.js",
        "js/engine/audio.js",
        "js/engine/objects/sound.js",
        "js/engine/objects/picto.js",
        "js/engine/events.js",
        "js/engine/objects/polo-keyframes.js",
        "js/engine/objects/polo.js",
        "js/engine/mixlist.js",
        "js/engine/version-config.js",
        "js/engine/picto-layout.js",
        "js/engine/modes/random.js",
        "js/engine/modes/record.js",
        "js/engine/modes/replay.js",
        "js/engine/objects/replay-mix.js",
        "js/engine/convert.js",
        "js/runners/bonusRunner.js",

        // your mod's code (add your own extra files here, after mod.js if they use it)
        "js/debug/globals-snapshot.js", // lets the mod checker tell your functions from the engine's
        "js/apps.js",
        "js/mod.js",
        { src: "lore/lore.js", page: "app" }
    ];

    const me = document.currentScript;
    const page = (me && me.dataset.page) || (/app\.html$/i.test(location.pathname) ? "app" : "index");
    const files = SCRIPTS
        .map(entry => (typeof entry === "string" ? { src: entry } : entry))
        .filter(entry => !entry.page || entry.page === page)
        .map(entry => entry.src);

    window.LOADED_SCRIPTS = files; // handy when debugging
    document.write(files.map(src => `<script src="${src}"><\/script>`).join("\n"));
})();
