/*
 * storage.js
 * Persistent flags for mods (saved in localStorage, so they survive reloads and version switches).
 *   OnlyOnce(id, fn)  - run fn the first time only
 *   Call(id)          - mark `id` as happened (and run anything waiting for it)
 *   Catch(id, fn)     - run fn if/when `id` has been Call()ed
 *   ClearItemID(id)   - forget `id` for both systems
 */

function readStoredObject(key) {
    try {
        return JSON.parse(localStorage.getItem(key)) || {};
    } catch (e) {
        return {};
    }
}

/** Runs `callback` only the very first time this `id` is seen (ever, not per session). */
function OnlyOnce(id, callback) {
    const executed = readStoredObject("executedItems");
    if (!executed[id]) {
        callback();
        executed[id] = true;
        localStorage.setItem("executedItems", JSON.stringify(executed));
    }
}

/** Resets an id used by OnlyOnce() or Call(). */
function ClearItemID(id) {
    const executed = readStoredObject("executedItems");
    const storage = readStoredObject("storage");
    if (executed[id]) {
        delete executed[id];
        localStorage.setItem("executedItems", JSON.stringify(executed));
    }
    if (storage[id]) {
        delete storage[id];
        localStorage.setItem("storage", JSON.stringify(storage));
    }
}

const pendingCatches = {};

/** Marks `id` as happened. Any Catch(id, ...) registered on this page runs immediately. */
function Call(id) {
    const storage = readStoredObject("storage");
    storage[id] = { active: true };
    localStorage.setItem("storage", JSON.stringify(storage));
    (pendingCatches[id] || []).forEach(callback => callback());
}

/** Runs `callback` now if `id` was already Call()ed (on any page, any time), otherwise when it is. */
function Catch(id, callback) {
    if (typeof callback != "function") return;
    (pendingCatches[id] = pendingCatches[id] || []).push(callback);
    if (readStoredObject("storage")[id]?.active) {
        callback();
    }
}
