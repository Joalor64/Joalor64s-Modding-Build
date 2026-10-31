/*
 * mod-launcher/js/keyboard.js
 * Keyboard controls: arrows move between cards (down/up enters/leaves a card's buttons),
 * Enter opens, Escape closes popups or asks to exit.
 */

function updateButtonFocus(buttons) {
    buttons.forEach((btn, i) => btn.classList.toggle("focused", State.isButtonMode && i === State.buttonIndex));
}

window.addEventListener("keydown", e => {
    if (e.key === "Escape") {
        if (SearchDropdown.isOpen) { SearchDropdown.hide(); AudioSys.play("cancel"); return; }
        Popup.isOpen ? Popup.close() : openExitConfirm();
        AudioSys.play("cancel");
        return;
    }
    if (Popup.isOpen || SearchDropdown.isOpen) return;

    const card = State.cards[State.index];
    if (!card || card.classList.contains("search-card")) State.isButtonMode = false;
    const buttons = card ? $$(".mod-buttons button", card) : [];

    const actions = {
        ArrowDown: () => { if (buttons.length) { State.isButtonMode = true; State.buttonIndex = 0; } },
        ArrowUp: () => { State.isButtonMode = false; },
        ArrowRight: () => State.isButtonMode ? (State.buttonIndex = (State.buttonIndex + 1) % buttons.length) : State.index++,
        ArrowLeft: () => State.isButtonMode ? (State.buttonIndex = (State.buttonIndex - 1 + buttons.length) % buttons.length) : State.index--
    };

    if (e.key === "Enter") {
        e.preventDefault();
        State.isButtonMode ? buttons[State.buttonIndex]?.click() : card?.click();
        return;
    }

    if (actions[e.key]) {
        actions[e.key]();
        updateButtonFocus(buttons);
        if (!State.isButtonMode) Carousel.update();
        AudioSys.play("scroll");
    }
});
