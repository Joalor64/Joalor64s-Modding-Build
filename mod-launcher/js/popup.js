/*
 * mod-launcher/js/popup.js
 * The base game's popup (same markup, classes and animations as js/engine/ui/dialog.js):
 *   - popups with a `type` ("settings", "info"...) behave like the game's boxPopup:
 *     slide up / slide down, round close button in the corner, click outside to close.
 *   - popups without a type that have buttons behave like the game's boxDialog:
 *     scale in / out, buttons at the bottom (bt-light).
 *
 * Popup.open({ title, type, content: [blocks], footer: "text" | [buttons] })
 *   blocks:  { type: "text" | "html" | "list" | "select" | "toggle" | "input" | "slider", label, value, ... }
 *            a block with only a `label` is shown as plain text.
 *   buttons: { label, action, type: "popup-danger" (red) }
 */

const Popup = (() => {
    const root = $("#pop-popup");
    const bac = $(".bac", root);
    const box = $(".box", root);
    const container = $(".container", root);
    const closeIcon = $(".icon", root);

    let state = "closed";
    let mode = "popup";
    let token = 0;
    let shuttingDown = false;

    const IN = { popup: "slideUp", dialog: "open" };
    const OUT = { popup: "slideDown", dialog: "close" };

    function el(tag, cls, text) {
        const e = document.createElement(tag);
        if (cls) e.className = cls;
        if (text != null) e.textContent = text;
        return e;
    }

    function gameButton(label, cls) {
        const bt = el("div", "bt " + (cls || "bt-light"));
        const bck = el("div", "bck");
        bck.appendChild(el("div", "txt", label));
        bt.appendChild(bck);
        bt.appendChild(el("div", "hitzone"));
        return bt;
    }

    function onPress(bt, fn) {
        bt.addEventListener("click", e => {
            e.stopPropagation();
            bt.classList.remove("ontouch");
            void bt.offsetHeight;
            bt.classList.add("ontouch");
            fn?.(e);
        });
    }

    /** Runs `fn` when `cls`'s animation ends on `node` (with a timeout in case it never fires). */
    function animate(node, cls, fn) {
        let done = false;
        const finish = () => {
            if (done) return;
            done = true;
            node.removeEventListener("animationend", onEnd);
            fn();
        };
        const onEnd = e => { if (e.target === node) finish(); };
        node.addEventListener("animationend", onEnd);
        node.classList.add(cls);
        setTimeout(finish, 450);
    }

    function subtitle(text) {
        return el("div", "subtitle", text);
    }

    const blockBuilders = {
        text: b => el("div", "text", b.value || ""),
        html: b => { const d = el("div", "text html"); d.innerHTML = sanitizeHTML(b.value || ""); return d; },

        list(b) {
            const d = el("div", "list");
            (b.items || []).forEach(txt => {
                const line = el("div", "line");
                line.appendChild(el("div", "text", txt));
                d.appendChild(line);
            });
            return d;
        },

        select(b) {
            const d = el("div", "box-lang");
            (b.options || []).forEach(opt => {
                const value = typeof opt === "string" ? opt : opt.value;
                const label = typeof opt === "string" ? opt : opt.label;
                const bt = gameButton(label, "bt-soft");
                bt.classList.toggle("active", b.value === value);
                onPress(bt, () => {
                    if (bt.classList.contains("active")) return;
                    d.querySelectorAll(".bt").forEach(x => x.classList.remove("active"));
                    bt.classList.add("active");
                    b.action?.(value);
                });
                d.appendChild(bt);
            });
            return d;
        },

        toggle(b) {
            const bt = gameButton(b.value, "bt-light");
            onPress(bt, b.action);
            return bt;
        },

        input(b) {
            const d = el("div", "formline");
            const inp = el("input");
            inp.placeholder = b.placeholder || "";
            if (b.value) inp.value = b.value;
            inp.addEventListener("keydown", e => {
                e.stopPropagation();
                if (e.key === "Enter") b.onEnter?.(inp.value);
                if (e.key === "Escape") close();
            });
            inp.addEventListener("input", () => b.onInput?.(inp.value));
            d.appendChild(inp);
            return d;
        },

        slider(b) {
            const sw = el("div", "bt-onoff");
            sw.appendChild(el("div", "slider"));
            sw.appendChild(el("div", "hitzone"));
            sw.classList.toggle("active", !!b.value);
            sw.addEventListener("click", e => {
                e.stopPropagation();
                sw.classList.toggle("active");
                b.action?.(sw.classList.contains("active"));
            });
            return sw;
        }
    };

    /** One content block, laid out like the game: settings lines or label + text sections. */
    function buildBlock(block) {
        const builder = blockBuilders[block.type];
        if (!builder) {
            return el("div", "text", block.label || "");
        }
        const node = builder(block);

        if (block.type === "slider" || block.type === "toggle") {
            const line = el("div", "paramline");
            line.appendChild(el("span", "label", block.label || ""));
            line.appendChild(node);
            return line;
        }

        const section = el("div", "line");
        if (block.label) section.appendChild(subtitle(block.label));
        section.appendChild(node);
        return section;
    }

    function build(cfg) {
        container.innerHTML = "";
        root.classList.remove("action", "dialog", "settings", "info", "popup");
        mode = !cfg.type && Array.isArray(cfg.footer) ? "dialog" : "popup";
        root.classList.add(mode === "dialog" ? "dialog" : "action");
        if (cfg.type) root.classList.add(cfg.type);
        root.setAttribute("data-name", cfg.type || "dialog");

        if (cfg.title) container.appendChild(el("div", "title", cfg.title));

        const blocks = cfg.content || [];
        const isSettings = blocks.some(b => b.type === "slider" || b.type === "toggle");
        blocks.forEach((block, i) => {
            const node = buildBlock(block);
            container.appendChild(node);
            if (isSettings && i < blocks.length - 1) {
                const hr = el("div", "bloc-hr");
                hr.appendChild(el("hr"));
                container.appendChild(hr);
            }
        });

        container.classList.toggle("params", isSettings);
        const lines = container.querySelectorAll(":scope > .line");
        if (lines.length) {
            lines[0].classList.add("first");
            lines[lines.length - 1].classList.add("last");
        }

        if (typeof cfg.footer === "string") {
            const c = el("div", "content version");
            c.appendChild(el("div", "text mini", cfg.footer));
            container.appendChild(c);
        } else if (Array.isArray(cfg.footer) && cfg.footer.length) {
            const c = el("div", "content");
            cfg.footer.forEach(btn => {
                const bt = gameButton(btn.label, "bt-light" + (btn.type === "popup-danger" ? " danger" : ""));
                onPress(bt, btn.action);
                c.appendChild(bt);
            });
            container.appendChild(c);
        }
        container.scrollTop = 0;
    }

    function showBox(cfg, my) {
        build(cfg);
        box.classList.remove("slideUp", "slideDown", "open", "close");
        void box.offsetHeight;
        state = "opening";
        animate(box, IN[mode], () => {
            if (my === token) state = "open";
        });
    }

    function open(cfg) {
        const my = ++token;
        shuttingDown = false;
        if (state === "open" || state === "opening" || state === "closing") {
            if (!bac.classList.contains("animateFadeIn")) {
                bac.classList.remove("animateFadeOut");
                bac.classList.add("animateFadeIn");
            }
            box.classList.remove(IN[mode]);
            state = "closing";
            animate(box, OUT[mode], () => {
                if (my !== token) return;
                box.classList.remove(OUT.popup, OUT.dialog);
                showBox(cfg, my);
            });
            return;
        }
        root.classList.add("show");
        bac.classList.remove("animateFadeOut");
        bac.classList.add("animateFadeIn");
        showBox(cfg, my);
    }

    function close() {
        if (state === "closed" || shuttingDown) return;
        const my = ++token;
        state = "closing";
        shuttingDown = true;
        AudioSys.play("cancel");
        bac.classList.remove("animateFadeIn");
        animate(bac, "animateFadeOut", () => { });
        box.classList.remove(IN.popup, IN.dialog);
        animate(box, OUT[mode], () => {
            if (my !== token) return;
            root.classList.remove("show");
            bac.classList.remove("animateFadeIn", "animateFadeOut");
            box.classList.remove(OUT.popup, OUT.dialog);
            container.innerHTML = "";
            root.removeAttribute("data-name");
            state = "closed";
            shuttingDown = false;
        });
    }

    closeIcon.addEventListener("click", e => { e.stopPropagation(); close(); });
    bac.addEventListener("click", close);

    return {
        open,
        close,
        get isOpen() { return state === "open" || state === "opening"; }
    };
})();
