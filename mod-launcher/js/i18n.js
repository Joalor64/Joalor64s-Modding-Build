/*
 * mod-launcher/js/i18n.js
 * Launcher translations (lang/<code>.json). I18n.t("pop.exit")
 */

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

    /** Translated text for `path`; `fallback` (English) when this language doesn't have it yet. */
    function t(path, fallback) {
        return path.split(".").reduce((o, k) => o?.[k], current?.translation) ?? fallback ?? path;
    }

    return { languages, load, t, get current() { return current; } };
})();
