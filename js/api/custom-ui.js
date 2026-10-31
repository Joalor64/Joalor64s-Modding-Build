/*
 * custom-ui.js
 * Builds the extra UI listed in js/customUI.js (`customUI = [...]`): toolbar buttons, home buttons,
 * settings switches/buttons, extra Settings-popup tabs and extra Mixlist tabs.
 *
 * Ported from another modding template and adapted to this engine: it waits for the engine to
 * build its popups/mixlist first (so the engine never binds its own handlers to our elements),
 * uses the engine's pointer events, and plugs custom mixlist tabs into activeBtTab().
 *
 * Every entry: { position, id, ... }  (all fields are explained at the top of js/customUI.js)
 * Callbacks (onClick, onEnable, onDisable, onChange, onOpen) can be functions or code strings.
 * Labels can use "{STR}:some.key" to read from the language files.
 */

let customUIReady = false;
let customUISettingsCount = 0;
let $customUISettingsContainer = null;

function initCustomUI() {
    if (customUIReady) return;
    const list = window.customUI || window._customUI;
    if (!Array.isArray(list) || !list.length) return;
    customUIReady = true;

    list.forEach(item => {
        if (!item || !customUIShouldShow(item)) return;
        try {
            switch (item.position) {
                case "toolbar":
                    customUIAddToolbarButton(item);
                    break;
                case "home-tl":
                case "home-tr":
                case "home-bot":
                    customUIAddHomeButton(item);
                    break;
                case "settings":
                    if (item.type === "toggle") customUIAddSettingToggle(item);
                    else customUIAddSettingButton(item);
                    break;
                case "tab-param":
                    customUIAddParamTab(item);
                    break;
                case "tab-mixlist":
                    customUIAddMixlistTab(item);
                    break;
                default:
                    console.warn("customUI: unknown position \"" + item.position + "\" for", item.id);
            }
        } catch (err) {
            console.error("customUI init error:", item.id, err);
        }
    });
}

/** Current value of a custom settings switch (saved between sessions). */
function getCustomUIValue(id) {
    const item = (window.customUI || window._customUI || []).find(i => i && i.id === id);
    const saved = localStorage.getItem("customUI_" + id);
    if (saved !== null && (!item || item.save !== false)) return saved === "true";
    return !!(item && item.default);
}

/** Changes a custom settings switch from code (runs its callbacks unless `silent`). */
function setCustomUIValue(id, value, silent) {
    const item = (window.customUI || window._customUI || []).find(i => i && i.id === id);
    if (!item) return;
    customUIApplyToggle(item, !!value, silent);
}

function customUIShouldShow(item) {
    const page = getHtmlName();
    if (page === "index.html" && item.skipIndex) return false;
    if (page === "app.html" && item.skipApp) return false;
    if (page === "app.html" && item.version != null) {
        const current = String(getVersionFromURL());
        const versions = Array.isArray(item.version) ? item.version : [item.version];
        if (!versions.some(v => String(v).replace(/^v/i, "") === current)) return false;
    }
    return true;
}

/** Turns a function or a code string into a callable function. */
function customUIFunc(code, args) {
    if (typeof code === "function") return code;
    if (typeof code === "string" && code.trim() !== "") {
        try {
            return args ? new Function(args, code) : new Function(code);
        } catch (err) {
            console.error("customUI: bad callback code:", code, err);
        }
    }
    return null;
}

function customUIRun(code, item, args, values) {
    const fn = customUIFunc(code, args);
    if (!fn) return;
    try {
        fn.apply(item, values || []);
    } catch (err) {
        console.error("customUI callback error:", item.id, err);
    }
}

function customUIText(value) {
    if (typeof value !== "string") return value == null ? "" : String(value);
    if (value.startsWith("{STR}:")) {
        const key = value.slice(6);
        const result = typeof STR === "function" ? STR(key) : null;
        return result == null || result === "" ? key : result;
    }
    return value;
}

function customUIHtml(value, item) {
    return typeof value === "function" ? (value.call(item) || "") : customUIText(value);
}

function customUIIcon(icon, extraClass) {
    if (!icon) return "";
    if (icon.charAt(0) === "#") {
        return "<svg class='icn-svg" + (extraClass ? " " + extraClass : "") + "'><use xlink:href='" + icon + "'></use></svg>";
    }
    return "<img class='icn-img' src='" + escapeHTML(icon) + "' alt=''>";
}

function customUIBindPress($el, handler) {
    $el.on(pointerEventType.down, function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof $el.addTouchAnimation === "function") $el.addTouchAnimation();
        handler.call(this, e);
    });
}

function customUIAddToolbarButton(item) {
    const target = document.querySelector("#box-bt2 .item-left #bt-tool");
    if (!target) return;
    const label = customUIText(item.label);
    const cls = label ? "bt bt-big with-icn" : "bt bt-big bt-round";
    const $el = $("<div class='" + cls + " custom-ui-toolbar' id='" + item.id + "'>" +
        "<div class='bck'>" + customUIIcon(item.icon) +
        (label ? "<div class='txt'>" + label + "</div>" : "") +
        "</div><div class='hitzone'></div></div>");
    let after = target;
    while (after.nextElementSibling && after.nextElementSibling.classList.contains("custom-ui-toolbar")) {
        after = after.nextElementSibling;
    }
    after.parentNode.insertBefore($el[0], after.nextSibling);
    const btn = new CustomButton($el);
    customUIBindPress(btn, () => customUIRun(item.onClick, item));
}

function customUIAddHomeButton(item) {
    const label = customUIText(item.label);
    const $el = $("<div class='bt bt-round bt-44 mod custom-ui-home' id='" + item.id + "'>" +
        "<div class='bck'>" + customUIIcon(item.icon) +
        (label && !item.icon ? "<div class='txt'>" + label + "</div>" : "") +
        "</div><div class='hitzone'></div></div>");
    if (label) $el.attr("title", label);
    if (getHtmlName() === "app.html") $el.addClass("color");

    let $target;
    if (item.position === "home-tl") {
        $target = $("#bt-list-tl");
        $target.append($el);
    } else if (item.position === "home-tr") {
        $target = $("#bt-list");
        $target.prepend($el);
    } else {
        $target = $("#home .main-bt .box-bot");
        $el.removeClass("bt-44").addClass("bt-80");
        $target.append($el);
    }
    if (!$target.length) {
        $el.remove();
        return;
    }
    const btn = new CustomButton($el);
    customUIBindPress(btn, () => {
        if (typeof preventAction === "function" && getHtmlName() === "app.html") {
            preventAction(() => customUIRun(item.onClick, item));
        } else {
            customUIRun(item.onClick, item);
        }
    });
    setTimeout(() => $el.addClass("animate"), 100);
}

function customUISettingInfo(item) {
    if (!item.info) return "";
    return "<div class='ic-info'><svg class='icn-svg'><use xlink:href='#ic-help'></use></svg>" +
        "<div class='hitzone'></div></div>";
}

function customUIBindInfo($el, item) {
    if (!item.info) return;
    $el.find(".ic-info .hitzone").on(pointerEventType.down, function (e) {
        e.preventDefault();
        e.stopPropagation();
        boxDialog.open(customUIText(item.info), customUIText(item.label), [STR("bt.gotit")]);
    });
}

function customUIAddSettingToggle(item) {
    const on = getCustomUIValue(item.id);
    const $el = $("<div class='paramline custom-ui-setting' id='" + item.id + "'>" +
        "<span class='label'>" + customUIText(item.label) + "</span>" + customUISettingInfo(item) +
        "<div class='bt-onoff" + (on ? " active" : "") + "'><div class='slider'></div><div class='hitzone'></div></div></div>");
    $el.find(".bt-onoff .hitzone").on(pointerEventType.down, function (e) {
        e.preventDefault();
        e.stopPropagation();
        const isOn = $el.find(".bt-onoff").hasClass("active");
        customUIApplyToggle(item, !isOn);
    });
    customUIBindInfo($el, item);
    customUIAppendSetting($el, item);
}

function customUIApplyToggle(item, value, silent) {
    $("#" + item.id + " .bt-onoff").toggleClass("active", value);
    if (item.save !== false) localStorage.setItem("customUI_" + item.id, value);
    if (silent) return;
    customUIRun(value ? item.onEnable : item.onDisable, item);
    customUIRun(item.onChange, item, "val", [value]);
    if (item.reload) {
        if (typeof lock === "function") lock();
        setTimeout(() => location.reload(), 800);
    }
}

function customUIAddSettingButton(item) {
    const $el = $("<div class='paramline custom-ui-setting' id='" + item.id + "'>" +
        "<span class='label'>" + customUIText(item.label) + "</span>" + customUISettingInfo(item) +
        "<div class='bt bt-light'><div class='bck'><div class='txt'>" + customUIText(item.btnText || item.label) +
        "</div></div><div class='hitzone'></div></div></div>");
    const btn = new CustomButton($el.find(".bt"));
    customUIBindPress(btn, () => customUIRun(item.onClick, item));
    customUIBindInfo($el, item);
    customUIAppendSetting($el, item);
}

function customUIAppendSetting($el, item) {
    const tab = String(item.tab || "mod").toLowerCase();
    const hr = () => $("<div class='bloc-hr'><hr /></div>");

    if (tab === "setting") {
        const $c = $("#pop-setting .container");
        if ($c.length) { $c.append($el, hr()); return; }
    } else if (tab === "advsetting") {
        const $version = $("#pop-advsetting .container #modVersion");
        if ($version.length) { $version.before($el, hr()); return; }
    }

    if (!$customUISettingsContainer) customUIEnsureModSettingsTab();
    if (!$customUISettingsContainer) return;
    if (customUISettingsCount > 0) $customUISettingsContainer.append(hr());
    $customUISettingsContainer.append($el);
    customUISettingsCount++;
}

function customUIEnsureModSettingsTab() {
    const name = customUIText(window.customUITabName || "Mod");
    $customUISettingsContainer = customUICreateParamTab("tab-modsetting", name, "", null);
    if ($customUISettingsContainer) $customUISettingsContainer.addClass("custom-ui-settings");
}

function customUIAddParamTab(item) {
    const id = item.id.indexOf("tab-") === 0 ? item.id : "tab-" + item.id;
    customUICreateParamTab(id, customUIText(item.label), item.icon, item);
}

/** Creates tab + page in #pop-param and returns the page's .container (jQuery). */
function customUICreateParamTab(tabId, label, icon, item) {
    const $popup = $("#pop-param");
    const $tabs = $popup.find(".box-tab");
    const $box = $popup.find(".box");
    if (!$tabs.length || !$box.length) return null;

    const pageId = tabId.replace(/^tab-/, "pop-");
    const $tab = $("<div class='tab custom-ui-tab' id='" + tabId + "'>" +
        (icon ? "<div class='icon'>" + customUIIcon(icon) + "</div>" : "") +
        "<div class='txt'>" + label + "</div><div class='hitzone'></div></div>");
    const $page = $("<div class='pop custom-ui-page' id='" + pageId + "'><div class='container'></div></div>");
    $tabs.append($tab);
    $box.append($page);
    const $container = $page.find(".container");

    if (item && item.content != null && typeof item.content !== "function") {
        $container.html(customUIText(item.content));
    }

    $tab.on(pointerEventType.down, function (e) {
        e.preventDefault();
        if (boxParam && typeof boxParam.onCloseTab === "function") boxParam.onCloseTab();
        $popup.find(".tab.active").removeClass("active");
        $popup.find(".pop.active").removeClass("active");
        $tab.addClass("active");
        $page.addClass("active");
        if (item) {
            if (typeof item.content === "function") $container.html(item.content.call(item) || "");
            customUIRun(item.onOpen, item, "container", [$container]);
        }
    });
    return $container;
}

function customUIAddMixlistTab(item) {
    const $poplist = $("#poplist");
    if (!$poplist.length) return;
    const tabId = item.id.indexOf("tab-") === 0 ? item.id : "tab-" + item.id;
    const name = tabId.replace(/^tab-/, "");
    const filters = Array.isArray(item["box-mixlist"]) ? item["box-mixlist"] : [];

    const $tab = $("<div class='tab icon custom-ui-tab' id='" + tabId + "'>" +
        (item.icon ? "<div class='icon'>" + customUIIcon(item.icon) + "</div>" : "") +
        "<div class='txt'>" + customUIText(item.label) + "</div><div class='hitzone'></div></div>");
    $poplist.find(".tabbox").append($tab);

    let filterHtml = "";
    if (filters.length) {
        filterHtml = "<div class='tab-filter'>";
        filters.forEach((f, idx) => {
            const fid = f.id ? (f.id.indexOf("bt-") === 0 ? f.id : "bt-" + f.id) : "bt-" + name + "-" + idx;
            f._domId = fid;
            filterHtml += "<div class='bt with-icn color' id='" + fid + "' data-page='" + escapeHTML(f.page || "") + "'>" +
                "<div class='bck'>" + customUIIcon(f.icon) + "<div class='txt'>" + customUIText(f.label) + "</div></div>" +
                "<div class='hitzone'></div></div>";
        });
        filterHtml += "</div>";
    }
    const $page = $("<div class='pagebox custom-ui-page' id='box-" + name + "'>" + filterHtml + "</div>");
    const $scroll = $poplist.find(".containbox #scrollbox");
    if ($scroll.length) $scroll.before($page);
    else $poplist.find(".containbox").append($page);

    function showPage(page) {
        if (typeof cleanScrollbox === "function") cleanScrollbox();
        const lines = item.boxline;
        const html = lines == null ? undefined
            : (typeof lines === "string" || typeof lines === "function") ? lines
                : lines[page];
        $boxline.html(html === undefined ? "" : customUIHtml(html, item));
        const info = item.boxinfo && typeof item.boxinfo === "object" ? item.boxinfo[page] : item.boxinfo;
        $boxinfo.html(info ? customUIHtml(info, item) : "");
        customUIRun(item.onOpen, item, "page", [page]);
    }

    function selectFilter($bt) {
        $page.find(".tab-filter .bt").removeClass("active");
        $bt.addClass("active");
        $activeFilter = $bt;
        showPage($bt.attr("data-page"));
    }

    $page.find(".tab-filter .bt").each(function () {
        const btn = new CustomButton($(this));
        btn.on(pointerEventType.down, function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (btn.hasClass("active")) {
                $scrollbox.scrollTop(0);
                return;
            }
            selectFilter(btn);
        });
    });

    $tab.on(pointerEventType.down, function (e) {
        e.preventDefault();
        e.stopPropagation();
        if ($tab.hasClass("active")) {
            $scrollbox.scrollTop(0);
            return;
        }
        activeBtTab(name);
        if (filters.length) selectFilter($page.find(".tab-filter .bt").first());
        else showPage(null);
    });
}
