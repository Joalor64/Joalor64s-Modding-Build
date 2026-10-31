/*
 * mod-launcher/js/audio.js
 * Launcher UI sounds (sound/*.mp3). AudioSys.play("scroll" | "select" | "search" | "cancel")
 */

const AudioSys = (() => {
    const sounds = {};
    const make = (src) => { const a = new Audio(src); a.preload = "auto"; return a; };

    function init() {
        Object.assign(sounds, {
            cancel: make("sound/cancel.mp3"),
            scroll: make("sound/scroll.mp3"),
            search: make("sound/search.mp3"),
            select: make("sound/select.mp3")
        });
        Object.values(sounds).forEach(s => s.volume = 0.5);

        const warmUp = () => Object.values(sounds).forEach(s => {
            s.play()?.then(() => { s.pause(); s.currentTime = 0; }).catch(() => { });
        });
        window.addEventListener("focus", warmUp);
        window.addEventListener("pointermove", warmUp, { once: true });
    }

    function play(name) {
        const s = sounds[name];
        if (!s) return;
        s.pause(); s.currentTime = 0;
        s.play()?.catch(e => console.warn("Playback prevented:", e));
    }

    init();
    return { play };
})();
