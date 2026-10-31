/*
 * customUI.js
 * Extra UI for your mod: toolbar buttons, home buttons, settings switches/buttons and extra tabs.
 * Built by js/api/custom-ui.js once the version's home screen (or the menu) is ready.
 *
 * Common fields (every entry):
 *   position   "toolbar" | "home-tl" | "home-tr" | "home-bot" | "settings" | "tab-param" | "tab-mixlist"
 *   id         unique element id
 *   icon       "#ic-something" (SVG from img/icons.svg) or an image path
 *   label      text (use "{STR}:some.key" to take it from the lang/*.json files)
 *   version    only show in these versions: 2, "v2" or [1, 3]   (optional)
 *   skipIndex  don't show on the menu (index.html)               (optional)
 *   skipApp    don't show inside versions (app.html)             (optional)
 *
 * Callbacks can be real functions (recommended) or code strings like the old template:
 *   onClick: () => customInfo("hi")      or      onClick: "customInfo('hi')"
 *
 * position: "toolbar"     in-game top bar, right of the burger button (app.html only)
 *   onClick
 *
 * position: "home-tl" / "home-tr" / "home-bot"   round buttons on the home screen
 *   onClick              (home-bot = bottom row next to the play button, app.html only)
 *
 * position: "settings"    a line in the Settings popup
 *   type      "toggle" or "button"
 *   tab       "mod" (default: its own tab, named by customUITabName below),
 *             "setting" (Settings tab) or "advsetting" (Adv. Settings tab)
 *   info      text for a (?) help button                       (optional)
 *   toggle:   default (true/false), save (default true = remembered between sessions),
 *             reload (reload the page after switching), onEnable, onDisable, onChange(val)
 *             Read it anywhere with getCustomUIValue("id"), set it with setCustomUIValue("id", true)
 *   button:   btnText, onClick
 *
 * position: "tab-param"   extra tab in the Settings popup
 *   content   HTML (string) or a function returning HTML (rebuilt each time the tab opens)
 *   onOpen(container)                                        (optional)
 *
 * position: "tab-mixlist" extra tab in the Mixlist popup (next to Mixlist / Achievements)
 *   "box-mixlist"   filter buttons: [{ id, icon, label, page }]  (optional)
 *   boxline         { page: HTML } for each filter page, or one HTML string without filters
 *   boxinfo         grey text at the bottom (string, or { page: text })
 *   onOpen(page)                                             (optional)
 */

customUITabName = "Mod"; // name of the settings tab that holds tab: "mod" entries

customUI = [
    // EXAMPLES
    /*
    { position: "toolbar", id: "demo-toolbar", icon: "#ic-mixlist", onClick: () => customInfo("Toolbar button!") },

    { position: "home-tr", id: "demo-home-tr", icon: "#ic-note", label: "Demo", onClick: () => customInfo("Home button!") },

    {
        position: "settings", type: "toggle", id: "demo-toggle", label: "Demo Toggle", default: false,
        info: "This switch is remembered between sessions.",
        onEnable: () => console.log("on"), onDisable: () => console.log("off")
    },
    { position: "settings", type: "button", id: "demo-btn", label: "Demo Button", btnText: "Click", onClick: () => customInfo("Button!") },
    { position: "settings", type: "toggle", id: "demo-adv-toggle", tab: "advsetting", label: "Adv. Demo", default: true },

    { position: "tab-param", id: "tab-demo-param", label: "Demo", content: "<div class='title'>Param Tab</div><div class='text'>Anything you want here.</div>" },

    {
        position: "tab-mixlist", id: "tab-demo-mixlist", icon: "#ic-mixlist-mini", label: "Demo",
        "box-mixlist": [
            { id: "bt-demo-page1", icon: "#ic-mixlist", label: "Page 1", page: "p1" },
            { id: "bt-demo-page2", icon: "#ic-trophy", label: "Page 2", page: "p2" }
        ],
        boxline: {
            "p1": "<div style='padding:20px'>Page 1 content</div>",
            "p2": "<div style='padding:20px'>Page 2 content</div>"
        },
        boxinfo: "Demo tab info text"
    },
    */
];
