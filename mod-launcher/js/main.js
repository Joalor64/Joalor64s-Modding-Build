/*
 * mod-launcher/js/main.js
 * Start-up: language, theme, then the saved mod list.
 */

document.addEventListener("DOMContentLoaded", async () => {
    document.body.classList.add("page-zoom");
    await I18n.load(localStorage.getItem("lang") || "en-US");
    Theme.apply();

    State.cards = $$(".mod-card", Carousel.track);
    State.index = 0;
    Carousel.update();

    setTimeout(() => Mods.restore().catch(err => console.error("Error loading mods:", err)), 100);
    setTimeout(Carousel.update, 200);
    setTimeout(Carousel.update, 500);
});
