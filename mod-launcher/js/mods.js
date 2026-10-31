/*
 * mod-launcher/js/mods.js
 * The list of installed mods: keeps every card (State.allModCards), sorts them (favorites first,
 * then by the "Sort by" setting: name, recently played or recently added), filters them for the search
 * box, and saves/restores the list in localStorage ("modsState": [{ id, path, favorited, lastPlayed, addedAt }],
 * sort setting: "modsSort").
 */

const Mods = (() => {
    let query = "";

    const titleOf = card => (card.querySelector(".mod-title")?.textContent || "").toLowerCase();
    const idOf = card => card?.dataset.id || card?.dataset.title || card?.querySelector(".mod-title")?.textContent;

    function matches(card) {
        if (!query) return true;
        const desc = card.querySelector(".mod-desc")?.textContent.toLowerCase() || "";
        return titleOf(card).includes(query) || desc.includes(query);
    }

    const SORT_MODES = ["name", "played", "added"];
    let sortMode = SORT_MODES.includes(localStorage.getItem("modsSort")) ? localStorage.getItem("modsSort") : "name";
    const num = (card, key) => Number(card.dataset[key] || 0);

    function sortList() {
        State.allModCards.sort((a, b) => {
            const fa = a.classList.contains("favorited");
            const fb = b.classList.contains("favorited");
            if (fa !== fb) return fb - fa;
            if (sortMode === "played" && num(a, "lastPlayed") !== num(b, "lastPlayed")) return num(b, "lastPlayed") - num(a, "lastPlayed");
            if (sortMode === "added" && num(a, "addedAt") !== num(b, "addedAt")) return num(b, "addedAt") - num(a, "addedAt");
            return titleOf(a).localeCompare(titleOf(b));
        });
    }

    /** "name" | "played" (recently played first) | "added" (recently added first). Favorites always come first. */
    function setSortMode(mode) {
        if (!SORT_MODES.includes(mode)) return;
        sortMode = mode;
        localStorage.setItem("modsSort", mode);
        sort();
    }

    /** Puts the (filtered) cards in the carousel and focuses `focusCard` (or keeps the current one). */
    function render(focusCard = null) {
        const focusedId = idOf(focusCard || State.cards[State.index]);

        Carousel.track.innerHTML = "";
        Carousel.track.appendChild(Carousel.searchCard);
        State.allModCards.filter(matches).forEach(c => Carousel.track.appendChild(c));

        State.cards = $$(".mod-card", Carousel.track);
        State.index = Math.max(0, State.cards.findIndex(c => idOf(c) === focusedId));
        Carousel.update();
    }

    /** Re-sorts (after a favorite / refresh) and redraws. */
    function sort(focusCard = null) {
        sortList();
        render(focusCard);
    }

    /** Adds a new card (or refreshes the existing card of the same folder) and focuses it. */
    function add(card) {
        const existing = State.allModCards.find(c => c.dataset.modPath && c.dataset.modPath === card.dataset.modPath);
        if (!card.dataset.addedAt) card.dataset.addedAt = String(Date.now());
        if (existing) {
            Cards.updateContent(existing, card._metadata);
            sort(existing);
            return existing;
        }
        State.allModCards.push(card);
        sort(card);
        return card;
    }

    /** Puts `newCard` where `oldCard` was (keeps the favorite) and focuses it. */
    function replace(oldCard, newCard) {
        if (oldCard.classList.contains("favorited")) newCard.classList.add("favorited");
        const i = State.allModCards.indexOf(oldCard);
        if (i === -1) State.allModCards.push(newCard);
        else State.allModCards[i] = newCard;
        oldCard.remove();
        sort(newCard);
    }

    function remove(card) {
        State.allModCards = State.allModCards.filter(c => c !== card);
        card.remove();
        render();
    }

    function save() {
        const mods = State.allModCards.map(c => ({
            id: idOf(c),
            path: c.dataset.modPath || null,
            favorited: c.classList.contains("favorited"),
            lastPlayed: num(c, "lastPlayed") || undefined,
            addedAt: num(c, "addedAt") || undefined
        }));
        localStorage.setItem("modsState", JSON.stringify(mods));
    }

    /** Rebuilds the cards from the saved list (reloading each mod's mod.json). */
    async function restore() {
        let saved = [];
        try {
            saved = JSON.parse(localStorage.getItem("modsState") || "[]");
        } catch (e) { }

        if (!saved.length || !hasElectron()) {
            State.cards = $$(".mod-card", Carousel.track);
            State.index = 0;
            Carousel.update();
            return;
        }

        State.isLoadingMods = true;
        const results = await Promise.all(saved.map(async entry => {
            if (!entry.path) return null;
            let card;
            try {
                const meta = await window.electron.ipc.loadModMetadata(entry.path);
                if (meta) {
                    meta.path = entry.path;
                    card = Cards.create(meta, false);
                }
            } catch (e) {
                console.error(`Failed to load mod at ${entry.path}:`, e);
            }
            if (!card) card = Cards.createMissing(entry);
            if (entry.favorited) card.classList.add("favorited");
            if (entry.lastPlayed) card.dataset.lastPlayed = String(entry.lastPlayed);
            card.dataset.addedAt = String(entry.addedAt || 0);
            Cards.refreshPlayed(card);
            return card;
        }));

        State.allModCards = results.filter(Boolean);
        State.index = 0;
        sort();
        State.isLoadingMods = false;
    }

    /** Shows only the mods whose title/description contains `text`. */
    function search(text) {
        query = text.trim().toLowerCase();
        State.index = 0;
        render(Carousel.searchCard);
    }

    /** Clears the search filter. */
    function restoreAll() {
        query = "";
        render(Carousel.searchCard);
    }

    return { sort, add, replace, remove, save, restore, search, restoreAll, setSortMode, get sortMode() { return sortMode; } };
})();
