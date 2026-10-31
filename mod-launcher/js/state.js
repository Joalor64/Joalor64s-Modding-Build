/*
 * mod-launcher/js/state.js
 * Shared launcher state: the cards on screen, the focused index and the keyboard button mode.
 */

const State = {
    index: 0,
    isButtonMode: false,
    buttonIndex: 0,
    cards: [],
    allModCards: [],
    isLoadingMods: false,
    startupCanvas: null
};
