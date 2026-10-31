/*
 * params.js
 * Base game settings: dark mode, HD mode, reset bonuses.
 */

function initParam() {
    if (appBrowser && isIOS) {
        $("#home-bt-fs").hide();
    }
    if (isDarkMode()) {
        $("body").addClass("darkmode");
        $("#pop-setting #param-dark .bt-onoff").addClass("active");
    }
    if (isHDMode()) {
        $("body").addClass("hdmode");
        $("#pop-setting #param-hd .bt-onoff").addClass("active");
    }
    $("#pop-setting #param-reset .bt").on(pointerEventType.down, clickbtParamReset).parent().find(".ic-info").on(pointerEventType.down, clickbtParamResetInfo);
    $("#pop-setting #param-dark .bt-onoff").on(pointerEventType.down, clickbtParamDark);
    $("#pop-setting #param-hd .bt-onoff").on(pointerEventType.down, clickbtParamHD);
}
function isHDMode() {
    return storage.getItem("param-hd") != null && storage.getItem("param-hd") == "true";
}
function isDarkMode() {
    return storage.getItem("param-dark") != null && storage.getItem("param-dark") == "true";
}
function clickbtParamReset(e) {
    e.preventDefault();
    storage.removeItem("popupDragViewed");
    storage.removeItem("popup-bonus-next");
    storage.removeItem("popup-bonus-unlock");
    for (var o = 1; o <= versions.total; o++) {
        storage.removeItem("v" + o + "-popup-bonus-next");
        storage.removeItem("v" + o + "-popup-bonus-unlock");
        storage.removeItem("v" + o + "-bonus-complete");
    }
    if (pageApp) {
        addTransition($("#fade-all"), "fadeIn", "opacity", function () {
            window.location.href = appNumberVersion !== undefined ? "?v=" + appNumberVersion : "";
        });
    } else {
        $(e.currentTarget).addClass("disable");
    }
}
function clickbtParamResetInfo(e) {
    e.preventDefault();
    boxDialog.open(STR("pop.paramResetInfoText"), "", [STR("bt.gotit")], []);
}
function unlockAllBonus() {
    for (var e = 1; e <= versions.total; e++) {
        storage.setItem("v" + e + "-popup-bonus-next", "ok");
        storage.setItem("v" + e + "-popup-bonus-unlock", "ok");
        storage.setItem("v" + e + "-bonus-complete", "2");
    }
    addTransition($("#fade-all"), "fadeIn", "opacity", function () {
        window.location.href = appNumberVersion !== undefined ? "?v=" + appNumberVersion : "";
    });
}
function clickbtParamDark(e) {
    e.preventDefault();
    if (isDarkMode()) {
        storage.setItem("param-dark", false);
        $body.removeClass("darkmode");
        $("#pop-setting #param-dark .bt-onoff").removeClass("active");
    } else {
        storage.setItem("param-dark", true);
        $body.addClass("darkmode");
        $("#pop-setting #param-dark .bt-onoff").addClass("active");
    }
}
function clickbtParamHD(g) {
    g.preventDefault();
    if (isHDMode()) {
        storage.setItem("param-hd", false);
        $body.removeClass("hdmode");
        $("#pop-setting #param-hd .bt-onoff").removeClass("active");
    } else {
        storage.setItem("param-hd", true);
        $body.addClass("hdmode");
        $("#pop-setting #param-hd .bt-onoff").addClass("active");
    }
    if (pageApp) {
        addTransition($("#fade-all"), "fadeIn", "opacity", function () {
            window.location.href = appNumberVersion !== undefined ? "?v=" + appNumberVersion : "";
        });
    } else {
        $(g.currentTarget).addClass("disable");
    }
}
