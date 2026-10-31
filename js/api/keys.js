/*
 * keys.js
 * Keyboard triggers for mods and the hotkey list (Shift + H).
 *
 *   onKey("a", () => ...)                    - when "a" is pressed
 *   onKeyHold("Shift", "H", () => ...)       - when "H" is pressed while "Shift" is held
 *   registerHotkeyText("Ctrl + R", "Reload") - only adds a line to the hotkey list
 *
 * Pass a `description` to onKey/onKeyHold to list the key in the hotkey popup.
 * Keys typed into text fields (like the "save mix" form) never trigger anything.
 */

const HOTKEYS = [];
const isMac = /Mac|iPhone|iPad/.test(navigator.platform);

/** True when the key event comes from a text field, so shortcuts must not fire. */
function isTypingTarget(e) {
    const t = e.target;
    return !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable);
}

/**
 * Runs `callback` when `keyName` is pressed (e.key, so "a", "A", "F5", "ArrowUp", " "...).
 * allowSpam: keep firing while the key is held down. preventDefault: block the browser's default action.
 */
function onKey(keyName, callback, allowSpam = true, preventDefault = true, description) {
    let isPressed = false;

    if (description) {
        registerHotkey({ type: "single", key: keyName, description });
    }

    document.addEventListener("keydown", e => {
        if (e.key !== keyName || isTypingTarget(e)) return;
        if (preventDefault) {
            e.preventDefault();
        }
        if (!allowSpam && isPressed) return;
        isPressed = true;
        callback();
    });

    document.addEventListener("keyup", e => {
        if (e.key === keyName) isPressed = false;
    });
}

/** Runs `callback` when `targetKey` is pressed while `triggerKey` is held down. */
function onKeyHold(triggerKey, targetKey, callback, allowSpam = false, preventDefault = false, description) {
    let holdingTrigger = false;
    let canTrigger = true;

    if (description) {
        registerHotkey({ type: "combo", hold: triggerKey, key: targetKey, description });
    }

    document.addEventListener("keydown", e => {
        if (isTypingTarget(e)) return;
        if (e.key === triggerKey) {
            holdingTrigger = true;
        }
        if (e.key === targetKey && holdingTrigger) {
            if (preventDefault) e.preventDefault();
            if (allowSpam) {
                callback();
            } else if (canTrigger) {
                callback();
                canTrigger = false;
            }
        }
    });

    document.addEventListener("keyup", e => {
        if (e.key === triggerKey) {
            holdingTrigger = false;
            canTrigger = true;
        }
        if (e.key === targetKey) {
            canTrigger = true;
        }
    });

    window.addEventListener("blur", () => {
        holdingTrigger = false;
        canTrigger = true;
    });
}

/** Adds an entry to the hotkey list: { type: "single", key } / { type: "combo", hold, key } / { type: "custom", display }. */
function registerHotkey(config) {
    HOTKEYS.push(config);
}

/** Adds a free-text entry to the hotkey list. */
function registerHotkeyText(display, description) {
    registerHotkey({ type: "custom", display, description });
}

function formatKeyDisplay(key) {
    if (key === "Meta") return isMac ? "⌘" : "Meta";
    if (key === "Control") return isMac ? "⌃" : "Ctrl";
    if (key === "Alt") return isMac ? "⌥" : "Alt";
    if (key === "Shift") return isMac ? "⇧" : "Shift";
    return key.toUpperCase();
}

/** Opens the hotkey list popup. */
function openHotkeyMenu() {
    const color = app.colors ? app.colors[1] : app.col1;
    const lines = HOTKEYS.map(h => {
        let comboText = "";
        if (h.type === "combo") {
            comboText = `${formatKeyDisplay(h.hold)} + ${formatKeyDisplay(h.key)}`;
        } else if (h.type === "single") {
            comboText = formatKeyDisplay(h.key);
        } else if (h.type === "custom") {
            comboText = h.display;
        }
        return `<div style="margin-bottom: 8px;"><b style="color:${color}">${comboText}</b> - ${h.description}</div>`;
    });

    customInfo(`<div style="max-height: 400px; overflow-y: auto; padding-right: 10px;">${lines.join("")}</div>`, "HOTKEY LIST (Shift + H)");
}
