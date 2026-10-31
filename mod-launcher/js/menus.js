/*
 * mod-launcher/js/menus.js
 * The top-right buttons: settings (language, light mode, fullscreen), info, search, and the exit dialog.
 */

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
                label: I18n.t("pop.settingsSort", "Sort by"),
                type: "select",
                value: Mods.sortMode,
                options: [
                    { label: I18n.t("pop.sortName", "Name"), value: "name" },
                    { label: I18n.t("pop.sortPlayed", "Played"), value: "played" },
                    { label: I18n.t("pop.sortAdded", "Newest"), value: "added" }
                ],
                action: mode => Mods.setSortMode(mode)
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
