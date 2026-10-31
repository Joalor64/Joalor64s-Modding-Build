/*
 * mod-launcher/js/core.js
 * Shared helpers for the launcher scripts (they are plain scripts sharing one global scope,
 * loaded in the order listed in mod-launcher/index.html).
 */

const LAUNCHER_VERSION = "0.2.0";

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const wait = (ms) => new Promise(r => setTimeout(r, ms));

/** True when running inside the desktop app (the launcher needs it to read mod folders). */
const hasElectron = () => !!(window.electron && window.electron.ipc);

/**
 * Removes dangerous markup from mod descriptions (they come from mod.json files).
 * Strips script-like elements, inline event handlers and javascript: URLs.
 */
function sanitizeHTML(html) {
    const template = document.createElement("template");
    template.innerHTML = String(html);
    template.content.querySelectorAll("script, iframe, frame, object, embed, form, input, button, textarea, link, meta, style, base, svg, math, template").forEach(el => el.remove());
    const URL_ATTRS = ["href", "src", "xlink:href", "action", "formaction", "srcset", "poster", "background"];
    template.content.querySelectorAll("*").forEach(el => {
        [...el.attributes].forEach(attr => {
            const name = attr.name.toLowerCase();
            const value = attr.value.replace(/[\s\u0000-\u001f]/g, "").toLowerCase();
            const badURL = URL_ATTRS.includes(name) && (/^(javascript|vbscript):/.test(value)
                || (value.startsWith("data:") && !/^data:image\/(png|jpe?g|gif|webp);/.test(value)));
            if (name.startsWith("on") || name === "srcdoc" || badURL) {
                el.removeAttribute(attr.name);
            }
        });
    });
    template.content.querySelectorAll("a[href]").forEach(a => a.setAttribute("target", "_blank"));
    return template.innerHTML;
}

/** "just now", "5 minutes ago", "3 days ago"... for a timestamp in ms. */
function timeAgo(ms) {
    const s = Math.max(0, Math.floor((Date.now() - Number(ms)) / 1000));
    const units = [["year", 31536000], ["month", 2592000], ["week", 604800], ["day", 86400], ["hour", 3600], ["minute", 60]];
    for (const [name, size] of units) {
        const n = Math.floor(s / size);
        if (n >= 1) return `${n} ${name}${n > 1 ? "s" : ""} ago`;
    }
    return "just now";
}

/** Escapes text for use inside HTML attributes / content. */
function escapeHTML(text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
