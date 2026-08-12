const LAUNCHER_VERSION = "0.1.0";

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const wait = (ms) => new Promise(r => setTimeout(r, ms));

const AudioSys = (() => {
    const sounds = {};
    const make = (src) => { const a = new Audio(src); a.preload = "auto"; return a; };

    function init() {
        Object.assign(sounds, {
            cancel: make("sound/cancel.mp3"),
            scroll: make("sound/scroll.mp3"),
            search: make("sound/search.mp3"),
            select: make("sound/select.mp3")
        });
        Object.values(sounds).forEach(s => s.volume = 0.5);

        const warmUp = () => Object.values(sounds).forEach(s => {
            s.play()?.then(() => { s.pause(); s.currentTime = 0; }).catch(() => { });
        });
        window.addEventListener("focus", warmUp);
        window.addEventListener("pointermove", warmUp, { once: true });
    }

    function play(name) {
        const s = sounds[name];
        if (!s) return;
        s.pause(); s.currentTime = 0;
        s.play()?.catch(e => console.warn("Playback prevented:", e));
    }

    init();
    return { play };
})();

const I18n = (() => {
    const languages = [
        { code: "en-US", name: "English" },
        { code: "es", name: "Español" },
        { code: "fr", name: "Français" },
        { code: "pt-BR", name: "Português" },
        { code: "zh-CN", name: "简体中文" },
        { code: "zh-TW", name: "繁體中文" }
    ];
    const cache = {};
    let current = null;

    async function load(code) {
        if (!cache[code]) {
            const res = await fetch(`lang/${code}.json`);
            cache[code] = await res.json();
        }
        current = cache[code];
        localStorage.setItem("lang", code);
    }

    function t(path) {
        return path.split(".").reduce((o, k) => o?.[k], current?.translation) ?? path;
    }

    return { languages, load, t, get current() { return current; } };
})();

const Theme = (() => {
    let light = localStorage.getItem("lightmode") === "true";
    function apply() { document.body.classList.toggle("lightmode", light); }
    function set(v) { light = v; localStorage.setItem("lightmode", v); apply(); }
    function toggle() { set(!light); }
    return { apply, set, toggle, get active() { return light; } };
})();

const State = {
    index: 0,
    isButtonMode: false,
    buttonIndex: 0,
    cards: [],
    allModCards: [],
    isLoadingMods: false,
    startupCanvas: null
};

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

    function rebuildCards() {
        State.allModCards = $$(".mod-card", track).filter(c => !c.classList.contains("search-card"));
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

    return { track, carousel, searchCard, update, rebuildCards };
})();

const Mods = (() => {
    function sort(focusCard = null) {
        Carousel.rebuildCards();
        const mods = $$(".mod-card", Carousel.track).filter(c => !c.classList.contains("search-card"));

        mods.sort((a, b) => {
            const fa = a.classList.contains("favorited");
            const fb = b.classList.contains("favorited");
            if (fa !== fb) return fb - fa;
            const ta = (a.querySelector(".mod-title")?.textContent || "").toLowerCase();
            const tb = (b.querySelector(".mod-title")?.textContent || "").toLowerCase();
            return ta.localeCompare(tb);
        });

        const focusedId = focusCard
            ? (focusCard.dataset.id || focusCard.dataset.title || focusCard.querySelector(".mod-title")?.textContent)
            : (State.cards[State.index]?.dataset.id || State.cards[State.index]?.dataset.title || State.cards[State.index]?.querySelector(".mod-title")?.textContent);

        Carousel.track.innerHTML = "";
        Carousel.track.appendChild(Carousel.searchCard);
        mods.forEach(c => Carousel.track.appendChild(c));

        State.cards = $$(".mod-card", Carousel.track);
        State.index = State.cards.findIndex(c => {
            const id = c.dataset.id || c.dataset.title || c.querySelector(".mod-title")?.textContent;
            return id === focusedId;
        });
        if (State.index === -1) State.index = 0;
        Carousel.update();
    }

    function save() {
        const mods = State.allModCards.map(c => ({
            id: c.dataset.id || c.dataset.title || c.querySelector(".mod-title")?.textContent,
            path: c.dataset.modPath || null,
            favorited: c.classList.contains("favorited")
        }));
        localStorage.setItem("modsState", JSON.stringify(mods));
    }

    async function restore() {
        const raw = localStorage.getItem("modsState");
        if (!raw) { State.cards = $$(".mod-card", Carousel.track); State.index = 0; Carousel.update(); return; }

        const state = JSON.parse(raw);
        if (!state.length) { State.cards = $$(".mod-card", Carousel.track); State.index = 0; Carousel.update(); return; }

        State.isLoadingMods = true;
        $$(".mod-card:not(.search-card)", Carousel.track).forEach(c => c.remove());
        Carousel.rebuildCards();

        const results = await Promise.all(state.map(async (saved) => {
            if (!saved.path) return null;
            try {
                const meta = await window.electron.ipc.loadModMetadata(saved.path);
                if (!meta) return null;
                meta.path = saved.path;
                const card = Cards.create(meta, false);
                if (saved.favorited) card.classList.add("favorited");
                return { card, favorited: saved.favorited };
            } catch (e) {
                console.error(`Failed to load mod at ${saved.path}:`, e);
                return null;
            }
        }));

        const valid = results.filter(Boolean).sort((a, b) => {
            if (a.favorited !== b.favorited) return b.favorited - a.favorited;
            const ta = (a.card.querySelector(".mod-title")?.textContent || "").toLowerCase();
            const tb = (b.card.querySelector(".mod-title")?.textContent || "").toLowerCase();
            return ta.localeCompare(tb);
        });

        valid.forEach(({ card }) => Carousel.track.appendChild(card));
        State.cards = $$(".mod-card", Carousel.track);
        State.index = 0;
        Carousel.rebuildCards();
        Carousel.update();
        State.isLoadingMods = false;
    }

    function search(query) {
        const q = query.trim().toLowerCase();
        Carousel.track.innerHTML = "";
        Carousel.track.appendChild(Carousel.searchCard);

        const filtered = State.allModCards.filter(c => {
            const title = c.querySelector(".mod-title")?.textContent.toLowerCase() || "";
            const desc = c.querySelector(".mod-desc")?.textContent.toLowerCase() || "";
            return title.includes(q) || desc.includes(q);
        });

        filtered.forEach(c => Carousel.track.appendChild(c));
        State.cards = $$(".mod-card", Carousel.track);
        State.index = 0;
        Carousel.update();
    }

    function restoreAll() {
        Carousel.track.innerHTML = "";
        Carousel.track.appendChild(Carousel.searchCard);
        State.allModCards.forEach(c => Carousel.track.appendChild(c));
        State.cards = $$(".mod-card", Carousel.track);
        State.index = 0;
        Carousel.update();
    }

    return { sort, save, restore, search, restoreAll };
})();

const Popup = (() => {
    const overlay = $("#popup-overlay");
    const content = $(".popup-content", overlay);
    const popupEl = $(".popup", overlay);
    const closeBtn = $(".popup-close", overlay);

    const blockBuilders = {
        text: (b) => { const d = document.createElement("div"); d.className = "popup-text"; d.textContent = b.value || ""; return d; },
        html: (b) => { const d = document.createElement("div"); d.className = "popup-html"; d.innerHTML = sanitizeHTML(b.value || ""); return d; },
        list: (b) => { const d = document.createElement("div"); d.className = "popup-list"; b.items.forEach(txt => { const i = document.createElement("div"); i.className = "popup-item"; i.textContent = txt; d.appendChild(i); }); return d; },

        select(b) {
            const sel = document.createElement("select");
            sel.className = "popup-control";
            b.options.forEach(opt => {
                const o = document.createElement("option");
                o.value = typeof opt === "string" ? opt : opt.value;
                o.textContent = typeof opt === "string" ? opt : opt.label;
                if (b.value === o.value) o.selected = true;
                sel.appendChild(o);
            });
            sel.addEventListener("change", () => b.action?.(sel.value));
            return sel;
        },

        toggle(b) {
            const btn = document.createElement("button");
            btn.className = "popup-toggle";
            btn.textContent = b.value;
            btn.onclick = b.action;
            return btn;
        },

        input(b) {
            const inp = document.createElement("input");
            inp.className = "popup-input";
            inp.placeholder = b.placeholder || "";
            inp.addEventListener("keydown", e => { if (e.key === "Enter") b.onEnter?.(inp.value); });
            inp.addEventListener("input", () => b.onInput?.(inp.value));
            return inp;
        },

        slider(b) {
            const d = document.createElement("div");
            d.className = "popup-slider";
            d.classList.toggle("on", b.value);
            d.onclick = () => { d.classList.toggle("on"); b.action?.(d.classList.contains("on")); };
            return d;
        }
    };

    function buildBlock(block) {
        const wrap = document.createElement("div");
        wrap.className = "popup-block";
        if (block.label) {
            const lbl = document.createElement("span");
            lbl.className = "popup-label";
            lbl.textContent = block.label;
            wrap.appendChild(lbl);
        }
        const builder = blockBuilders[block.type];
        if (builder) wrap.appendChild(builder(block));
        return wrap;
    }

    function open(cfg) {
        content.innerHTML = "";
        popupEl.className = "popup opening";
        if (cfg.type) popupEl.classList.add(cfg.type);

        if (cfg.title) {
            const h2 = document.createElement("h2");
            h2.className = "popup-title";
            h2.textContent = cfg.title;
            content.appendChild(h2);
        }

        cfg.content?.forEach(block => content.appendChild(buildBlock(block)));

        if (cfg.footer) {
            const footer = document.createElement("div");
            footer.className = "popup-footer";
            if (typeof cfg.footer === "string") {
                footer.classList.add("text");
                footer.textContent = cfg.footer;
            } else if (Array.isArray(cfg.footer)) {
                cfg.footer.forEach(btn => {
                    const b = document.createElement("button");
                    b.className = `popup-btn ${btn.type || ""}`;
                    b.textContent = btn.label;
                    b.onclick = btn.action;
                    footer.appendChild(b);
                });
            }
            content.appendChild(footer);
        }

        overlay.classList.add("show");
        popupEl.addEventListener("animationend", () => popupEl.classList.remove("opening"), { once: true });
    }

    function close() {
        if (!overlay.classList.contains("show")) return;
        popupEl.classList.add("closing");
        overlay.classList.remove("show");
        AudioSys.play("cancel");
        popupEl.addEventListener("animationend", () => popupEl.classList.remove("closing"), { once: true });
    }

    closeBtn.addEventListener("click", close);
    overlay.addEventListener("click", e => { if (e.target === overlay) close(); });

    return { open, close, get isOpen() { return overlay.classList.contains("show"); } };
})();

const SearchDropdown = (() => {
    let dropdown = null;
    let input = null;
    let clearBtn = null;
    let open = false;

    function build() {
        dropdown = document.createElement("div");
        dropdown.className = "search-dropdown";
        dropdown.innerHTML = `
            <div class="search-dropdown-inner">
                <svg><use href="#ic-search"></use></svg>
                <input type="text" class="search-input" placeholder="${I18n.t("pop.searchHint")}" autocomplete="off" spellcheck="false">
                <button class="search-clear" aria-label="Clear">×</button>
            </div>
        `;
        document.body.appendChild(dropdown);

        input = dropdown.querySelector(".search-input");
        clearBtn = dropdown.querySelector(".search-clear");

        input.addEventListener("input", () => {
            const val = input.value;
            clearBtn.style.opacity = val ? "1" : "0";
            if (val.trim() === "") Mods.restoreAll();
            else Mods.search(val);
        });

        clearBtn.addEventListener("click", () => {
            input.value = "";
            clearBtn.style.opacity = "0";
            Mods.restoreAll();
            input.focus();
        });

        input.addEventListener("keydown", (e) => {
            if (e.key === "Escape") { e.stopPropagation(); hide(); }
        });

        document.addEventListener("click", onDocClick);
    }

    function onDocClick(e) {
        if (!open) return;
        if (!dropdown.contains(e.target) && !e.target.closest("#btn-search")) {
            hide();
        }
    }

    function position() {
        const btn = $("#btn-search");
        if (!btn) return;
        const rect = btn.getBoundingClientRect();
        dropdown.style.left = `${rect.left + rect.width / 2}px`;
        dropdown.style.top = `${rect.bottom + 10}px`;
    }

    function show() {
        if (!dropdown) build();
        position();
        input.value = "";
        clearBtn.style.opacity = "0";
        dropdown.classList.add("show");
        open = true;
        requestAnimationFrame(() => input.focus());
    }

    function hide() {
        if (!dropdown) return;
        dropdown.classList.remove("show");
        open = false;
    }

    function toggle() {
        open ? hide() : show();
    }

    return { show, hide, toggle, get isOpen() { return open; } };
})();

function sanitizeHTML(html) {
    const dangerous = ["script", "iframe", "object", "embed", "form", "input"];
    let s = html;
    dangerous.forEach(tag => {
        s = s.replace(new RegExp(`<<${tag}[^>]*>.*?</${tag}>`, "gi"), "");
    });
    return s.replace(/on\w+\s*=\s*["'][^"']*["']/gi, "").replace(/javascript:/gi, "");
}

function getFramesFromXML(xmlDoc) {
    const atlas = xmlDoc.querySelector("TextureAtlas");
    if (!atlas) throw new Error("Invalid animation XML: No TextureAtlas found");
    return [...atlas.querySelectorAll("SubTexture")].map(tex => ({
        name: tex.getAttribute("name"),
        x: parseInt(tex.getAttribute("x")) || 0,
        y: parseInt(tex.getAttribute("y")) || 0,
        width: parseInt(tex.getAttribute("width")) || 0,
        height: parseInt(tex.getAttribute("height")) || 0
    })).sort((a, b) => {
        const na = parseInt(a.name.match(/\d+$/)?.[0] || "0");
        const nb = parseInt(b.name.match(/\d+$/)?.[0] || "0");
        return na - nb;
    });
}

async function playStartupAnimation(xmlUrl, basePath, cardEl) {
    console.log("[StartupAnim] Starting...", xmlUrl);
    const res = await fetch(xmlUrl);
    if (!res.ok) throw new Error("Failed to load animation XML");

    const xmlDoc = new DOMParser().parseFromString(await res.text(), "text/xml");
    const frames = getFramesFromXML(xmlDoc);
    const imagePath = xmlDoc.querySelector("TextureAtlas").getAttribute("imagePath");

    const img = new Image();
    img.src = `${basePath}/${imagePath}`;
    await img.decode();

    const rect = cardEl.getBoundingClientRect();
    const canvas = document.createElement("canvas");
    canvas.className = "mod-startup-canvas";
    canvas.width = rect.width;
    canvas.height = rect.height;

    const bg = cardEl.querySelector(".mod-card-bg");
    bg.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    const fps = 24;
    const frameDuration = 1000 / fps;
    const startTime = performance.now();

    return new Promise(resolve => {
        let lastFrame = -1;
        function animate(now) {
            const raw = Math.floor((now - startTime) / frameDuration);
            const idx = Math.min(raw, frames.length - 1);
            if (idx === lastFrame) { requestAnimationFrame(animate); return; }
            lastFrame = idx;

            const f = frames[idx];
            if (!f) { canvas.remove(); resolve(); return; }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const scale = Math.min(canvas.width / f.width, canvas.height / f.height);
            const dw = f.width * scale, dh = f.height * scale;
            const dx = (canvas.width - dw) / 2, dy = (canvas.height - dh) / 2;
            ctx.drawImage(img, f.x, f.y, f.width, f.height, dx, dy, dw, dh);

            if (idx === frames.length - 1) { resolve({ canvas, ctx }); return; }
            requestAnimationFrame(animate);
        }
        requestAnimationFrame(animate);
    });
}

const Cards = (() => {
    function buildHTML(meta) {
        return `
            <div class="mod-card-bg">
                <div class="mod-rmb-version">
                    <svg><use href="#ic-engine"></use></svg>
                    <span>RMB v${meta.RMBVersion}</span>
                </div>
                <div class="mod-icon"><img src="${meta.icon}" alt=""></div>
                <div class="mod-title" data-title="${meta.title}">${meta.title}</div>
                <div class="mod-desc" data-description="${meta.description}"></div>
            </div>
            <div class="mod-buttons">
                <button id="mod-fav"><svg><use href="#ic-like"></use></svg></button>
                <button id="mod-info"><svg><use href="#ic-info"></use></svg></button>
                <button id="mod-update"><svg><use href="#ic-update"></use></svg></button>
                <button id="mod-delete"><svg><use href="#ic-trash"></use></svg></button>
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
        const favBtn = card.querySelector("#mod-fav");
        const infoBtn = card.querySelector("#mod-info");
        const updBtn = card.querySelector("#mod-update");
        const delBtn = card.querySelector("#mod-delete");

        infoBtn.addEventListener("click", e => {
            e.stopPropagation();
            AudioSys.play("search");
            Popup.open({
                type: "info",
                title: I18n.t("pop.modInfoTitle"),
                content: [
                    { label: I18n.t("pop.modInfoName"), type: "text", value: meta.title },
                    { label: I18n.t("pop.modInfoAuthor"), type: "text", value: meta.author },
                    { label: I18n.t("pop.modInfoDesc"), type: "html", value: meta.description },
                    { label: I18n.t("pop.modInfoVersion"), type: "text", value: meta.version }
                ],
                footer: [{
                    label: I18n.t("pop.preview"),
                    action: () => meta.modLink ? confirmNav(meta.modLink) : Popup.open({
                        type: "info", title: I18n.t("pop.noLinkTitle"),
                        content: [{ type: "text", value: I18n.t("pop.noLinkTxt") }]
                    })
                }]
            });
        });

        favBtn.addEventListener("click", e => {
            e.stopPropagation();
            card.classList.contains("favorited") ? AudioSys.play("cancel") : AudioSys.play("select");
            card.classList.toggle("favorited");
            Mods.sort(card);
            Mods.save();
        });

        updBtn.addEventListener("click", async (e) => {
            e.stopPropagation();
            const path = card.dataset.modPath;
            if (!path) { Popup.open({ type: "info", title: "Error", content: [{ type: "text", value: "Mod path not found." }] }); AudioSys.play("cancel"); return; }
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
            Popup.open({
                title: I18n.t("pop.deleteTitle"),
                content: [{ label: I18n.t("pop.deleteConfirm1") + (meta.title || I18n.t("pop.deleteConfirm2")) + "?" }],
                footer: [
                    { label: I18n.t("pop.cancel"), action: Popup.close },
                    { label: I18n.t("pop.delete"), type: "popup-danger", action: () => { card.remove(); Popup.close(); Mods.sort(); Mods.save(); } }
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

            if (hasAnim) {
                promises.push(playStartupAnimation(`${meta.path}/${meta.startupAnim}`, meta.path, card)
                    .then(r => { State.startupCanvas = r?.canvas || null; })
                    .catch(err => {
                        console.error("[Card] Animation error:", err);
                        Popup.open({ type: "info", title: "Animation Error", content: [{ type: "text", value: err.message }] });
                    }));
            }
            if (hasSnd) {
                promises.push(new Promise(resolve => {
                    const a = new Audio(`${meta.path}/${meta.startupSound}`);
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
        card._metadata = meta;
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

        if (showInstalledPopup) {
            Popup.open({ type: "info", title: "Installed", content: [{ type: "text", value: `"${meta.title}" was installed successfully!` }] });
        }
        return card;
    }

    function launch(meta) {
        setTimeout(() => {
            const overlay = $("#fade-overlay");
            overlay.classList.add("show");
            setTimeout(async () => {
                if (!meta.path) {
                    Popup.open({ type: "info", title: "Error", content: [{ type: "text", value: "Could not find mod path!" }] });
                    return;
                }
                await window.electron.ipc.openModHTML(meta.path);
            }, 600);
        }, 300);
    }

    return { create, updateContent, launch };
})();

async function installModFromZip(zipPath) {
    try {
        const result = await window.electron.ipc.handleDroppedZip(zipPath);
        if (!result.success) {
            Popup.open({ type: "info", title: "Error", content: [{ type: "text", value: `Failed to install mod: ${result.error}` }] });
            AudioSys.play("cancel");
            return false;
        }
        const meta = result.metadata;
        meta.path = result.modPath;
        const card = Cards.create(meta);
        Carousel.track.appendChild(card);
        State.cards = $$(".mod-card", Carousel.track);
        Mods.sort(card);
        Mods.save();
        Popup.open({ type: "info", title: "Installed", content: [{ type: "text", value: `"${meta.title}" was installed successfully from zip!` }] });
        AudioSys.play("select");
        return true;
    } catch (e) {
        console.error("Error installing mod from zip:", e);
        Popup.open({ type: "info", title: "Error", content: [{ type: "text", value: "An error occurred while installing the mod." }] });
        AudioSys.play("cancel");
        return false;
    }
}

Carousel.searchCard.addEventListener("click", async (e) => {
    e.preventDefault();
    AudioSys.play("search");

    Popup.open({
        title: "Import Mod",
        content: [{ label: "How would you like to import your mod?" }],
        footer: [
            { label: I18n.t("pop.cancel"), action: Popup.close },
            { label: "ZIP Archive", action: () => doImport("zip") },
            { label: "Folder", action: () => doImport("folder") }
        ]
    });

    async function doImport(type) {
        Popup.close();
        let modPath;
        try {
            modPath = type === "folder" ? await window.electron.ipc.pickModFolder()
                : await window.electron.ipc.pickModZip();
        } catch (err) {
            console.error("Error selecting mod:", err);
            Popup.open({ type: "info", title: "Error", content: [{ type: "text", value: "Failed to select mod file/folder" }] });
            return;
        }
        if (!modPath) return;

        const meta = await window.electron.ipc.loadModMetadata(modPath);
        if (!meta) {
            Popup.open({ type: "info", title: "Error", content: [{ type: "text", value: "No mod.json found in this folder!" }] });
            AudioSys.play("cancel");
            return;
        }
        meta.path = modPath;
        const card = Cards.create(meta);
        Carousel.track.appendChild(card);
        State.cards = $$(".mod-card", Carousel.track);
        Mods.sort(card);
        Mods.save();
        AudioSys.play("select");
    }
});

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
    const buttons = $$(".mod-buttons button", card);

    const actions = {
        ArrowDown: () => { State.isButtonMode = true; State.buttonIndex = 0; },
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

function isFullScreen() {
    return window.electron?.ipc?.isFullScreen ? window.electron.ipc.isFullScreen() : false;
}

function openSettings() {
    Popup.open({
        type: "settings",
        title: I18n.t("pop.settingsTitle"),
        content: [
            {
                label: I18n.t("pop.settingsLang"),
                type: "select",
                value: I18n.current?.code || "en-US",
                options: I18n.languages.map(l => ({ label: l.name, value: l.code })),
                action: async (code) => { await I18n.load(code); Popup.close(); openSettings(); }
            },
            {
                label: I18n.t("pop.settingsLight"),
                type: "slider",
                value: Theme.active,
                action: (on) => { Theme.set(on); }
            },
            {
                label: I18n.t("pop.settingsFullscreen"),
                type: "slider",
                value: isFullScreen(),
                action: () => {
                    if (!window.electron) return;
                    isFullScreen() ? window.electron.ipc.leaveFullScreen() : window.electron.ipc.enterFullScreen();
                }
            }
        ],
        footer: [{ label: I18n.t("pop.exit"), type: "popup-danger", action: openExitConfirm }]
    });
}

function openExitConfirm() {
    Popup.open({
        title: I18n.t("pop.exit"),
        content: [{ label: I18n.t("pop.exitConfirm") }],
        footer: [
            { label: I18n.t("pop.cancel"), action: Popup.close },
            { label: I18n.t("pop.returnToGame"), action: () => window.location.href = "../index.html" },
            {
                label: I18n.t("pop.exit"), type: "popup-danger", action: () => {
                    if (window.electron) window.electron.ipc.close();
                    else if (window.cordova) navigator.app.exitApp();
                }
            }
        ]
    });
}

function openInfo() {
    Popup.open({
        type: "info",
        title: I18n.t("pop.infoTitle"),
        content: [
            { label: I18n.t("pop.about"), type: "text", value: I18n.t("pop.aboutTxt") },
            { label: I18n.t("pop.howTo"), type: "text", value: I18n.t("pop.howToTxt") },
            { label: I18n.t("pop.credits"), type: "text", value: I18n.t("pop.creditsTxt") }
        ],
        footer: I18n.t("pop.version") + LAUNCHER_VERSION
    });
}

function openSearch() {
    AudioSys.play("search");
    SearchDropdown.toggle();
}

$("#btn-settings").onclick = openSettings;
$("#btn-info").onclick = openInfo;
$("#btn-search").onclick = openSearch;

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