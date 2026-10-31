/*
 * settings-menu.js
 * Wires the Settings / Adv. Settings popups: the on/off switches, their (?) info buttons,
 * the reset buttons, the mod credits button and the achievements notification dot.
 * The option values themselves live in settings.js.
 */

const SETTING_SWITCHES = [
    {
        key: "BGorFadeOutsOn", get: () => BGorFadeOutsOn, set: v => BGorFadeOutsOn = v,
        switchSelector: "#pop-advsetting #param-bgchanges .bt-onoff", button: "bgchangesbutton",
        infoButton: "info-bgchanges", infoText: "extra.pop.paramBGOrFadeInfo"
    },
    {
        key: "ShakeEffectOn", get: () => ShakeEffectOn, set: v => ShakeEffectOn = v,
        switchSelector: "#pop-advsetting #param-disableshake .bt-onoff", button: "ShakeeffectsButton",
        infoButton: "info-shakeEffects", infoText: "extra.pop.paramShakeInfo"
    },
    {
        key: "LyricsOn", get: () => LyricsOn, set: v => LyricsOn = v,
        switchSelector: "#pop-advsetting #param-disablelyrics .bt-onoff", button: "LyricsDebugButton",
        infoButton: "info-disablelyrics", infoText: "extra.pop.paramLyricsInfo"
    },
    {
        key: "ModSoundsOn", get: () => ModSoundsOn, set: v => ModSoundsOn = v,
        switchSelector: "#pop-advsetting #param-displaymodsounds .bt-onoff", button: "displaymodsoundsButton",
        infoButton: "info-displaymodsounds", infoText: "extra.pop.paramSFXInfo"
    },
    {
        key: "ConfettiEffectOn", get: () => ConfettiEffectOn, set: v => ConfettiEffectOn = v,
        switchSelector: "#pop-advsetting #param-particleseffect .bt-onoff", button: "particleseffectbutton",
        infoButton: "info-particleseffect", infoText: "extra.pop.paramParticlesInfo",
        onToggle: secretConfettiEasterEgg
    },
    {
        key: "CustomCursorsOn", get: () => CustomCursorsOn, set: v => CustomCursorsOn = v,
        switchSelector: "#pop-advsetting #param-Cursor .bt-onoff", button: "Cursorbuttoneffect",
        infoButton: "info-Cursor", infoText: "extra.pop.paramCursorInfo"
    },
    {
        key: "expEventsOn", get: () => expEventsOn, set: v => expEventsOn = v,
        switchSelector: "#pop-setting #param-events .bt-onoff", button: "eventsOnOfButton",
        infoButton: "param-events-info", infoText: "extra.pop.paramEventsInfo",
        reload: true, forceDisabled: () => ForceDisableEvents
    },
    {
        key: "expAltModeOn", get: () => expAltModeOn, set: v => expAltModeOn = v,
        switchSelector: "#pop-setting #param-altMode .bt-onoff", button: "altModeOnOffButton",
        reload: true
    }
];

function updateSettingSwitch(setting) {
    const el = document.querySelector(setting.switchSelector);
    if (el) {
        el.classList.toggle("active", setting.get());
        if (setting.forceDisabled?.()) {
            el.classList.add("force-disabled");
        }
    }
}

function toggleSetting(setting) {
    if (setting.forceDisabled?.()) {
        boxDialog.open("Special events have been force-disabled by this mod!", "Nuh-Uh 🔒", [STR("bt.gotit")]);
        return;
    }
    setting.set(!setting.get());
    updateSettingSwitch(setting);
    localStorage.setItem(setting.key, setting.get());
    setting.onToggle?.();
    if (setting.reload) {
        lock();
        setTimeout(() => location.reload(), 800);
    }
}

SETTING_SWITCHES.forEach(setting => {
    OnClick(setting.button, () => toggleSetting(setting));
    if (setting.infoButton) {
        OnClick(setting.infoButton, () => customInfo(STR(setting.infoText)));
    }
    updateSettingSwitch(setting);
});

const findSetting = key => SETTING_SWITCHES.find(s => s.key === key);

function updateShakeEffectSwitch() { updateSettingSwitch(findSetting("ShakeEffectOn")); }
function updateLyricsSwitch() { updateSettingSwitch(findSetting("LyricsOn")); }
function updateBGchangesEffectSwitch() { updateSettingSwitch(findSetting("BGorFadeOutsOn")); }
function updateModSoundsEffectSwitch() { updateSettingSwitch(findSetting("ModSoundsOn")); }
function updateParticlesSwitch() { updateSettingSwitch(findSetting("ConfettiEffectOn")); }
function updateCursorsEffectSwitch() { updateSettingSwitch(findSetting("CustomCursorsOn")); }
function updateEventsEffectSwitch() { updateSettingSwitch(findSetting("expEventsOn")); }
function updateAltModeEffectSwitch() { updateSettingSwitch(findSetting("expAltModeOn")); }

/** 10% chance of a confetti shower when toggling the Particles switch. */
function secretConfettiEasterEgg() {
    SomeTimes(0.1, () => {
        MakeConfetti(3, 360, 0, 400, 50, "custom-cursor", secretE);
        OnDelayIn(1000, () => MakeConfetti(3, 360, 0, 400, 41, "custom-cursor", secretE));
        OnDelayIn(2000, () => MakeConfetti(3, 360, 0, 400, 29, "custom-cursor", secretE));
        OnDelayIn(3300, () => MakeConfetti(3, 360, 0, 400, 11, "custom-cursor", secretE));
    });
}

/**
 * localStorage keys that belong to the mod launcher (mod-launcher/js). Every mod opened from the
 * launcher shares its storage, so "Reset everything" must not wipe the list of installed mods.
 */
const LAUNCHER_STORAGE_KEYS = ["modsState", "lightmode", "lang"];

/** Wipes ALL saved data (every mod and the base game) and reloads. The launcher's mod list is kept. */
function resetEverything() {
    OnDelayIn(300, () => {
        const kept = {};
        LAUNCHER_STORAGE_KEYS.forEach(k => {
            const v = localStorage.getItem(k);
            if (v !== null) kept[k] = v;
        });
        localStorage.clear();
        Object.entries(kept).forEach(([k, v]) => localStorage.setItem(k, v));
        totalTimeSpent = 0;
        sessionStartTime = Date.now();
        boxDialog.open(STR("extra.pop.resetAllConfirm"), STR("bt.info"), false);
        OnDelayIn(5500, () => location.reload());
    });
}

/** Wipes the achievements of this mod and reloads. */
function resetAchievements() {
    const key = `achievements_${RegisterMod}`;
    OnDelayIn(300, () => {
        if (localStorage.getItem(key)) {
            localStorage.removeItem(key);
            boxDialog.open(STR("extra.pop.resetAchiConfirm").replace("%{mod}", RegisterMod), STR("bt.info"), false);
            OnDelayIn(2500, () => location.reload());
        } else {
            customInfo(STR("extra.pop.resetAchiFail"));
        }
    });
}

OnClick("info-achi-reset", () => customInfo(STR("extra.pop.paramResetAchiInfo")));
OnClick("action-reset-achi", () => {
    boxDialog.open(STR("extra.pop.resetAchi"), "", [STR("bt.sure"), STR("bt.cancel")], [
        () => resetAchievements(),
        () => boxDialog.close()
    ]);
});

OnClick("info-all-reset", () => customInfo(STR("extra.pop.paramResetAllInfo")));
OnClick("action-reset-all", () => {
    boxDialog.open(STR("extra.pop.resetAll"), "", [STR("bt.sure"), STR("bt.cancel")], [
        () => OnDelayIn(300, () => {
            boxDialog.open(STR("extra.pop.resetAllLastWarn"), STR("extra.pop.lastWarn"), [STR("bt.sure"), STR("bt.cancel")], [
                () => resetEverything(),
                () => boxDialog.close()
            ]);
        }),
        () => boxDialog.close()
    ]);
});

OnClickElement(".bt-modcredits", () => {
    callModHook("onModCreditsOpen");
    if (window.isModboxApp && app.credit && Object.keys(app.credit).length > 0) {
        popupModboxCredits();
    } else {
        OpenModCredits();
    }
});

function formatCount(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    return String(n);
}

function showAchiNotificationDot() {
    const dot = document.querySelector(".notification__achi");
    if (!dot) return;
    if (achiNotificationDot > 0) {
        dot.classList.add("show");
        dot.innerText = formatCount(achiNotificationDot);
    } else {
        dot.classList.remove("show");
        dot.innerText = "";
    }
}

OnClick("tab-myachi", () => {
    achiNotificationDot = 0;
    localStorage.setItem("achiNotificationDot", achiNotificationDot);
    showAchiNotificationDot();
});
showAchiNotificationDot();
