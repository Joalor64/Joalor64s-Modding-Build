/*
 * settings.js
 * Player options (Adv. Settings switches) and play statistics, both stored in localStorage.
 * The switches themselves are wired up in settings-menu.js.
 */

/** Reads a true/false option from localStorage. Options that were never set default to ON. */
function readBoolSetting(key) {
    const value = localStorage.getItem(key);
    return value === null || value === "true";
}

var enableHeadAnim = true;
var enableFaceAnim = true;

let ShakeEffectOn = readBoolSetting("ShakeEffectOn");
let LyricsOn = readBoolSetting("LyricsOn");
let BGorFadeOutsOn = readBoolSetting("BGorFadeOutsOn");
let ModSoundsOn = readBoolSetting("ModSoundsOn");
let ConfettiEffectOn = readBoolSetting("ConfettiEffectOn");
let CustomCursorsOn = readBoolSetting("CustomCursorsOn");
let expEventsOn = readBoolSetting("expEventsOn");
let expAltModeOn = readBoolSetting("expAltModeOn");

if (ForceDisableEvents) {
    expEventsOn = false;
}

let achiNotificationDot = parseInt(localStorage.getItem("achiNotificationDot")) || 0;
let totalBonusesWatched = parseInt(localStorage.getItem("totalBonusesWatched")) || 0;
let totalVersionsOpened = parseInt(localStorage.getItem("totalVersionsOpened")) || 0;
let totalPolosUsed = parseInt(localStorage.getItem("totalPolosUsed")) || 0;
let totalTimeSpent = parseInt(localStorage.getItem("totalTimeSpent")) || 0;
let sessionStartTime = Date.now();

/** Adds 1 to a stored counter ("totalBonusesWatched", "totalVersionsOpened", "totalPolosUsed", ...). */
function addToHistory(key) {
    const count = (parseInt(localStorage.getItem(key)) || 0) + 1;
    localStorage.setItem(key, count);

    if (key === "totalBonusesWatched") totalBonusesWatched = count;
    else if (key === "totalVersionsOpened") totalVersionsOpened = count;
    else if (key === "totalPolosUsed") totalPolosUsed = count;
}

function saveTimeSpent() {
    const seconds = Math.floor((Date.now() - sessionStartTime) / 1000);
    localStorage.setItem("totalTimeSpent", totalTimeSpent + seconds);
}
setInterval(saveTimeSpent, 1000);
window.addEventListener("beforeunload", saveTimeSpent);
