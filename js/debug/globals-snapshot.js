/*
 * debug/globals-snapshot.js
 * Remembers every global name defined before js/apps.js and js/mod.js load, so the mod checker (F8)
 * knows which functions are the mod's own (to spot misspelled hooks). Keep it right before js/apps.js in js/scripts.js.
 */
window.__engineGlobals = new Set(Object.getOwnPropertyNames(window));
