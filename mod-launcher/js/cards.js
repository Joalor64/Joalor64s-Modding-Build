/*
 * mod-launcher/js/cards.js
 * One card per installed mod: building it, its buttons (favorite, info, refresh, delete) and launching the mod.
 */

const Cards = (() => {
    function buildHTML(meta) {
        return `
            <div class="mod-card-bg">
                <div class="mod-rmb-version"${meta.build ? "" : " hidden"}>
                    <svg><use href="#ic-engine"></use></svg>
                    <span>${escapeHTML(meta.build || "")}</span>
                </div>
                <div class="mod-icon"><img src="${escapeHTML(meta.icon)}" alt=""></div>
                <div class="mod-title" data-title="${escapeHTML(meta.title)}">${escapeHTML(meta.title)}</div>
                <div class="mod-desc"></div>
                <div class="mod-played"></div>
            </div>
            <div class="mod-buttons">
                <button class="mod-fav"><svg><use href="#ic-like"></use></svg></button>
                <button class="mod-info"><svg><use href="#ic-info"></use></svg></button>
                <button class="mod-update"><svg><use href="#ic-update"></use></svg></button>
                <button class="mod-saves" title="Saves"><svg><use href="#ic-save"></use></svg></button>
                <button class="mod-delete"><svg><use href="#ic-trash"></use></svg></button>
            </div>
            <div class="mod-heart"><svg><use href="#ic-like"></use></svg></div>
        `;
    }

    function confirmNav(url) {
        Popup.open({
            title: I18n.t("pop.confirmRedirectTitle"),
            content: [{ label: I18n.t("pop.confirmRedirectTxt").replace("%{url}", url) }],
            footer: [
                { label: I18n.t("pop.yes"), action: () => { window.open(url, "_blank"); Popup.close(); } },
                { label: I18n.t("pop.no"), action: Popup.close }
            ]
        });
    }

    function attachEvents(card, meta) {
        const favBtn = card.querySelector(".mod-fav");
        const infoBtn = card.querySelector(".mod-info");
        const updBtn = card.querySelector(".mod-update");
        const delBtn = card.querySelector(".mod-delete");
        const savesBtn = card.querySelector(".mod-saves");

        savesBtn.addEventListener("click", e => {
            e.stopPropagation();
            Saves.open(card._metadata || meta);
        });

        infoBtn.addEventListener("click", e => {
            e.stopPropagation();
            AudioSys.play("search");
            const m = card._metadata || meta;
            const content = [
                { label: I18n.t("pop.modInfoName"), type: "text", value: m.title },
                { label: I18n.t("pop.modInfoAuthor"), type: "text", value: m.author },
                { label: I18n.t("pop.modInfoDesc"), type: "html", value: m.description },
                { label: I18n.t("pop.modInfoVersion"), type: "text", value: m.version },
                { label: I18n.t("pop.modInfoPlayed", "Last played"), type: "text", value: playedText(card) }
            ];
            if (m.build) content.push({ label: I18n.t("pop.modInfoBuild", "Made with"), type: "text", value: m.build });
            const footer = [{
                label: I18n.t("pop.preview"),
                action: () => m.modLink ? confirmNav(m.modLink) : Popup.open({
                    type: "info", title: I18n.t("pop.noLinkTitle"),
                    content: [{ type: "text", value: I18n.t("pop.noLinkTxt") }]
                })
            }];
            if (hasElectron() && window.electron.ipc.openModFolder && m.path) {
                footer.push({ label: I18n.t("pop.openFolder", "Open folder"), action: () => window.electron.ipc.openModFolder(m.path) });
            }
            Popup.open({ type: "info", title: I18n.t("pop.modInfoTitle"), content, footer });
        });

        favBtn.addEventListener("click", e => {
            e.stopPropagation();
            AudioSys.play(card.classList.contains("favorited") ? "cancel" : "select");
            card.classList.toggle("favorited");
            Mods.sort(card);
            Mods.save();
        });

        updBtn.addEventListener("click", async (e) => {
            e.stopPropagation();
            const path = card.dataset.modPath;
            if (!path || !hasElectron()) { Popup.open({ type: "info", title: "Error", content: [{ type: "text", value: "Mod path not found." }] }); AudioSys.play("cancel"); return; }
            const fresh = await window.electron.ipc.loadModMetadata(path);
            if (!fresh) { Popup.open({ type: "info", title: "Update failed", content: [{ type: "text", value: "Could not reload mod metadata." }] }); AudioSys.play("cancel"); return; }
            updateContent(card, fresh);
            Mods.sort(card);
            Mods.save();
            Popup.open({ type: "info", title: "Updated", content: [{ type: "text", value: `"${fresh.title}" was refreshed successfully.` }] });
            AudioSys.play("select");
        });

        delBtn.addEventListener("click", e => {
            e.stopPropagation();
            AudioSys.play("cancel");
            const m = card._metadata || meta;
            const filesNote = m.installed
                ? I18n.t("pop.deleteFilesNote", "Its files will be moved to the Recycle Bin.")
                : I18n.t("pop.deleteListNote", "It will be removed from the list. Your folder stays where it is.");
            let alsoSaves = false;
            const content = [
                { label: I18n.t("pop.deleteConfirm1") + (m.title || I18n.t("pop.deleteConfirm2")) + "?" },
                { label: filesNote }
            ];
            if (hasElectron() && window.electron.ipc.deleteMod) {
                content.push({ type: "slider", label: I18n.t("pop.deleteAlsoSaves", "Also delete its saves"), value: false, action: on => { alsoSaves = on; } });
            }
            Popup.open({
                title: I18n.t("pop.deleteTitle"),
                content,
                footer: [
                    { label: I18n.t("pop.cancel"), action: Popup.close },
                    {
                        label: I18n.t("pop.delete"), type: "popup-danger", action: async () => {
                            if (hasElectron() && window.electron.ipc.deleteMod && m.path) {
                                try {
                                    await window.electron.ipc.deleteMod(m.path, { files: !!m.installed, saves: alsoSaves });
                                } catch (err) {
                                    console.error("[Card] delete failed:", err);
                                }
                            }
                            Mods.remove(card);
                            Popup.close();
                            Mods.save();
                        }
                    }
                ]
            });
        });

        card.addEventListener("click", async () => {
            SearchDropdown.hide();
            const idx = State.cards.indexOf(card);
            if (idx !== -1 && idx !== State.index) {
                State.index = idx;
                Carousel.update();
                AudioSys.play("scroll");
            }
            AudioSys.play("select");
            card.classList.add("selected");
            $("#lock-all")?.classList.add("show");
            document.body.classList.add("zoom");

            await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

            const hasAnim = meta.startupAnim && meta.startupAnim !== "";
            const hasSnd = meta.startupSound && meta.startupSound !== "";
            const promises = [];

            const base = meta.baseURL || `${meta.path}/`;
            const modURL = file => new URL(file, base).href;

            if (hasAnim) {
                promises.push(playStartupAnimation(modURL(meta.startupAnim), base, card)
                    .then(r => { State.startupCanvas = r?.canvas || null; })
                    .catch(err => {
                        console.error("[Card] Animation error:", err);
                        Popup.open({ type: "info", title: "Animation Error", content: [{ type: "text", value: err.message }] });
                    }));
            }
            if (hasSnd) {
                promises.push(new Promise(resolve => {
                    const a = new Audio(modURL(meta.startupSound));
                    a.onended = resolve;
                    a.onerror = () => resolve();
                    a.play().catch(() => resolve());
                }));
            }
            await Promise.all(promises);
            launch(meta);
        });
    }

    function updateContent(card, meta) {
        card.dataset.modPath = meta.path;
        card.dataset.id = meta.id || meta.title;
        const bg = card.querySelector(".mod-card-bg");
        bg.style.setProperty("--mod-bg", `url("${meta.background}?t=${Date.now()}")`);
        if (meta.borderColor) card.style.setProperty("--mod-border", meta.borderColor);
        card.querySelector(".mod-icon img").src = `${meta.icon}?t=${Date.now()}`;
        card.querySelector(".mod-title").textContent = meta.title;
        card.querySelector(".mod-desc").innerHTML = sanitizeHTML(meta.description);
        const badge = card.querySelector(".mod-rmb-version");
        badge.hidden = !meta.build;
        badge.querySelector("span").textContent = meta.build || "";
        card._metadata = meta;
        refreshPlayed(card);
    }

    function playedText(card) {
        const t = Number(card.dataset.lastPlayed || 0);
        return t ? timeAgo(t) : I18n.t("pop.neverPlayed", "Never played");
    }

    /** The "Played 3 days ago" line on a card. */
    function refreshPlayed(card) {
        const el = card.querySelector(".mod-played");
        if (!el) return;
        const t = Number(card.dataset.lastPlayed || 0);
        el.textContent = t ? I18n.t("pop.playedAgo", "Played %{when}").replace("%{when}", timeAgo(t)) : I18n.t("pop.neverPlayed", "Never played");
    }

    function create(meta, showInstalledPopup = true) {
        const card = document.createElement("div");
        card.className = "mod-card";
        card._metadata = meta;
        card.dataset.modPath = meta.path;
        card.dataset.id = meta.id || meta.title;
        card.innerHTML = buildHTML(meta);

        card.querySelector(".mod-desc").innerHTML = sanitizeHTML(meta.description);
        const bg = card.querySelector(".mod-card-bg");
        bg.style.setProperty("--mod-bg", `url("${meta.background}")`);
        if (meta.borderColor) card.style.setProperty("--mod-border", meta.borderColor);

        attachEvents(card, meta);
        refreshPlayed(card);

        if (showInstalledPopup) {
            Popup.open({ type: "info", title: "Installed", content: [{ type: "text", value: `"${meta.title}" was installed successfully!` }] });
        }
        return card;
    }

    /** Undoes the "launching" look if the mod can't be opened. */
    function cancelLaunch(message) {
        $("#fade-overlay")?.classList.remove("show");
        $("#lock-all")?.classList.remove("show");
        document.body.classList.remove("zoom");
        $$(".mod-card.selected").forEach(c => c.classList.remove("selected"));
        State.startupCanvas?.remove();
        State.startupCanvas = null;
        Popup.open({ type: "info", title: "Error", content: [{ type: "text", value: message }] });
        AudioSys.play("cancel");
    }

    function launch(meta) {
        const card = State.allModCards.find(c => c.dataset.modPath === meta.path);
        if (card) {
            card.dataset.lastPlayed = String(Date.now());
            Mods.save();
        }
        setTimeout(() => {
            $("#fade-overlay").classList.add("show");
            setTimeout(async () => {
                if (!meta.path) {
                    cancelLaunch("Could not find mod path!");
                    return;
                }
                if (!hasElectron()) {
                    cancelLaunch("Mods can only be launched from the desktop app.");
                    return;
                }
                const opened = await window.electron.ipc.openModHTML(meta.path).catch(() => false);
                if (!opened) {
                    cancelLaunch(`Could not open this mod: "src/index.html" was not found in\n${meta.path}`);
                }
            }, 600);
        }, 300);
    }

    /**
     * A mod whose folder can't be found anymore (moved, renamed, deleted, drive unplugged).
     * Shown greyed out with Locate... (pick its new folder) and Remove; it stays in the saved list until removed.
     */
    function createMissing(entry) {
        const card = document.createElement("div");
        card.className = "mod-card missing";
        card.dataset.modPath = entry.path;
        card.dataset.id = entry.id || entry.path;
        const name = entry.id || I18n.t("pop.deleteConfirm2");
        card.innerHTML = `
            <div class="mod-missing-badge">${escapeHTML(I18n.t("pop.missingBadge", "Not found"))}</div>
            <div class="mod-card-bg">
                <div class="mod-icon"><img src="img/mod-icon.png" alt=""></div>
                <div class="mod-title">${escapeHTML(name)}</div>
                <div class="mod-desc">${escapeHTML(I18n.t("pop.missingDesc", "This mod's folder was moved or deleted."))}</div>
            </div>
            <div class="mod-buttons">
                <button class="mod-fav"><svg><use href="#ic-like"></use></svg></button>
                <button class="mod-locate" title="Locate"><svg><use href="#ic-search"></use></svg></button>
                <button class="mod-delete"><svg><use href="#ic-trash"></use></svg></button>
            </div>
            <div class="mod-heart"><svg><use href="#ic-like"></use></svg></div>
        `;

        const askRemove = () => {
            Popup.open({
                title: I18n.t("pop.deleteTitle"),
                content: [{ label: I18n.t("pop.missingRemove", 'Remove "%{name}" from the list?').replace("%{name}", name) }],
                footer: [
                    { label: I18n.t("pop.cancel"), action: Popup.close },
                    { label: I18n.t("pop.remove", "Remove"), type: "popup-danger", action: () => { Mods.remove(card); Popup.close(); Mods.save(); } }
                ]
            });
        };

        const locate = async () => {
            Popup.close();
            if (!hasElectron()) return;
            const folder = await window.electron.ipc.pickModFolder().catch(() => null);
            if (!folder) return;
            const meta = await window.electron.ipc.loadModMetadata(folder);
            if (!meta) {
                Popup.open({ type: "info", title: "Error", content: [{ type: "text", value: "No mod.json found in this folder!" }] });
                AudioSys.play("cancel");
                return;
            }
            meta.path = folder;
            Mods.replace(card, create(meta, false));
            Mods.save();
            AudioSys.play("select");
        };

        const showOptions = () => {
            AudioSys.play("search");
            Popup.open({
                title: I18n.t("pop.missingTitle", "Mod not found"),
                content: [
                    { label: I18n.t("pop.missingTxt", "\"%{name}\" isn't where it used to be:").replace("%{name}", name) },
                    { type: "text", value: entry.path }
                ],
                footer: [
                    { label: I18n.t("pop.remove", "Remove"), type: "popup-danger", action: askRemove },
                    { label: I18n.t("pop.missingLocate", "Locate..."), action: locate }
                ]
            });
        };

        card.querySelector(".mod-fav").addEventListener("click", e => {
            e.stopPropagation();
            card.classList.toggle("favorited");
            Mods.sort(card);
            Mods.save();
        });
        card.querySelector(".mod-locate").addEventListener("click", e => { e.stopPropagation(); locate(); });
        card.querySelector(".mod-delete").addEventListener("click", e => { e.stopPropagation(); askRemove(); });
        card.addEventListener("click", () => {
            const idx = State.cards.indexOf(card);
            if (idx !== -1 && idx !== State.index) {
                State.index = idx;
                Carousel.update();
            }
            showOptions();
        });
        return card;
    }

    return { create, createMissing, updateContent, launch, refreshPlayed };
})();
