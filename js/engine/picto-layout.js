/*
 * picto-layout.js
 * Custom picto (icon) positions from data/configs/uiLayout.jsonc.
 *
 * When the current version has a "picto" list, the icons are placed freely instead of in rows:
 *   "v1": { "picto": { "0": { "x": "0.95%", "y": "0%", "size": "7.6%" }, ... } }
 * x, y and size are relative to the WIDTH of the icon area (so one row step = size + gap),
 * numbers are read as %, and "px" values work too. A "default" entry applies to every version
 * without its own. Icons missing from the list are placed on extra rows below.
 *
 * A global `_UI` object (same shape, e.g. from a JS file) is merged over the .jsonc file.
 */

let uiLayout = {};

async function loadUILayout(path = "data/configs/uiLayout.jsonc") {
    try {
        const res = await fetch(path);
        if (res.ok) uiLayout = parseJSONC(await res.text()) || {};
    } catch (err) { }
    if (typeof _UI === "object" && _UI) {
        Object.keys(_UI).forEach(k => {
            uiLayout[k] = Object.assign({}, uiLayout[k], _UI[k]);
        });
    }
}

/** The layout of the current version ({ picto: {...} }) or null. */
function getUILayout() {
    return uiLayout["v" + appVersion] || uiLayout["default"] || null;
}

/** Normalized picto positions [{x, y, size}] for `count` icons, or null when not customized. */
function getPictoLayout(count) {
    const layout = getUILayout();
    if (!layout || !layout.picto) return null;
    const src = layout.picto;
    const keys = Object.keys(src);
    if (!keys.length) return null;

    const unit = v => {
        if (v == null || v === "") return null;
        if (typeof v === "number") return v + "%";
        v = String(v).trim();
        return /^-?[\d.]+$/.test(v) ? v + "%" : v;
    };

    const list = [];
    let lastSize = "7.6%";
    let maxBottomPct = 0;
    for (let i = 0; i < count; i++) {
        const p = src[i] || src[String(i)];
        if (!p) {
            list.push(null);
            continue;
        }
        const pos = {
            x: unit(p.x) || "0%",
            y: unit(p.y) || "0%",
            size: unit(p.size) || lastSize,
            z: p.z
        };
        lastSize = pos.size;
        const y = parseFloat(pos.y), s = parseFloat(pos.size);
        if (pos.y.endsWith("%") && pos.size.endsWith("%")) maxBottomPct = Math.max(maxBottomPct, y + s);
        list.push(pos);
    }

    const missing = list.map((p, i) => p ? -1 : i).filter(i => i >= 0);
    if (missing.length) {
        console.warn("uiLayout: no position for picto " + missing.join(", ") + " in v" + appVersion + ", placing them below");
        const size = 7.6, gap = 1.9, perRow = 10;
        const startY = maxBottomPct ? maxBottomPct + gap : 0;
        missing.forEach((idx, n) => {
            const row = Math.floor(n / perRow), col = n % perRow;
            list[idx] = {
                x: (gap / 2 + col * (size + gap)).toFixed(2) + "%",
                y: (startY + row * (size + gap)).toFixed(2) + "%",
                size: size + "%"
            };
        });
    }
    return list;
}

/** HTML for #box-picto with absolutely positioned icons (used by createBoxPicto in game.js). */
function buildCustomPictoHtml(layout) {
    const bottoms = layout.map(p => "calc(" + p.y + " + " + p.size + ")");
    let html = "<div class=\"pictoline top custom-pos\" style=\"padding-bottom:max(" + bottoms.join(",") + ")\">";
    layout.forEach((p, idx) => {
        html += `<div class="picto" id="picto${idx}" data-picto-num="${idx}" style="${pictoPosStyle(p)}">
                    <div class="bck"></div>
                    <div class="hitzone"></div>
                 </div>`;
    });
    return html + "</div>";
}

function pictoPosStyle(p) {
    return `left:${p.x};margin-top:${p.y};width:${p.size};${p.z != null ? "z-index:" + p.z + ";" : ""}`;
}

/** Places one picto element using the layout (for icons added later with AddPicto). */
function applyCustomPictoPos(el, idx) {
    if (!el || !el.parentElement || !el.parentElement.classList.contains("custom-pos")) return;
    const layout = getPictoLayout(Math.max(idx + 1, app.animearray.length));
    if (layout && layout[idx]) el.setAttribute("style", pictoPosStyle(layout[idx]));
}

function hasCustomPictoLayout() {
    return !!document.querySelector("#box-picto .pictoline.custom-pos");
}
