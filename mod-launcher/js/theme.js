/*
 * mod-launcher/js/theme.js
 * Light/dark theme (saved in localStorage "lightmode").
 */

const Theme = (() => {
    let light = localStorage.getItem("lightmode") === "true";
    function apply() { document.body.classList.toggle("lightmode", light); }
    function set(v) { light = v; localStorage.setItem("lightmode", v); apply(); }
    function toggle() { set(!light); }
    return { apply, set, toggle, get active() { return light; } };
})();
