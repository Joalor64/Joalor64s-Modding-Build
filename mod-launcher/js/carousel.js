/*
 * mod-launcher/js/carousel.js
 * The horizontal carousel of mod cards: centering the focused card, mouse wheel and touch swipes.
 */

const Carousel = (() => {
    const track = $(".slideshow");
    const carousel = $(".carousel");
    const searchCard = $(".search-card");

    let touch = { startX: 0, startY: 0, endX: 0, endY: 0, dragging: false, tx: 0 };

    function update() {
        if (!State.cards.length) return;
        State.index = ((State.index % State.cards.length) + State.cards.length) % State.cards.length;

        const card = State.cards[State.index];
        const cRect = card.getBoundingClientRect();
        const pRect = carousel.getBoundingClientRect();
        const delta = (pRect.left + pRect.width / 2) - (cRect.left + cRect.width / 2);

        const current = new DOMMatrixReadOnly(getComputedStyle(track).transform).m41 || 0;
        track.style.transform = `translateX(${current + delta}px)`;

        State.cards.forEach(c => c.classList.remove("focused"));
        card.classList.add("focused");

        if ("vibrate" in navigator && window.matchMedia("(hover: none)").matches) {
            navigator.vibrate(10);
        }
    }

    function handleWheel(e) {
        e.preventDefault();
        State.index += Math.sign(e.deltaY);
        update();
        AudioSys.play("scroll");
    }

    function handleTouchStart(e) {
        const t0 = e.changedTouches[0];
        touch.startX = t0.screenX;
        touch.startY = t0.screenY;
        touch.dragging = true;
        touch.tx = new WebKitCSSMatrix(getComputedStyle(track).transform).m41;
    }

    function handleTouchMove(e) {
        if (!touch.dragging) return;
        const t0 = e.changedTouches[0];
        touch.endX = t0.screenX;
        touch.endY = t0.screenY;
        const dx = touch.endX - touch.startX;
        const dy = touch.endY - touch.startY;
        if (Math.abs(dx) > Math.abs(dy)) {
            e.preventDefault();
            track.style.transition = "none";
            track.style.transform = `translateX(${touch.tx + dx}px)`;
        }
    }

    function handleTouchEnd(e) {
        if (!touch.dragging) return;
        touch.dragging = false;
        const t0 = e.changedTouches[0];
        touch.endX = t0.screenX;
        touch.endY = t0.screenY;
        track.style.transition = "";

        const diff = touch.endX - touch.startX;
        if (Math.abs(diff) > 50) {
            State.index += diff > 0 ? -1 : 1;
            AudioSys.play("scroll");
        }
        update();
    }

    track.addEventListener("wheel", handleWheel, { passive: false });
    carousel.addEventListener("touchstart", handleTouchStart, { passive: true });
    carousel.addEventListener("touchmove", handleTouchMove, { passive: true });
    carousel.addEventListener("touchend", handleTouchEnd, { passive: true });

    let resizeTimer;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(update, 100);
        if (SearchDropdown.isOpen) SearchDropdown.hide();
    });

    return { track, carousel, searchCard, update };
})();
