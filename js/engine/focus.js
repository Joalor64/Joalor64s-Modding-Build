/*
 * focus.js
 * Keyboard / gamepad style navigation: focus lists for every screen and hitKey().
 */

var focusList = [];
var focusPos = -1;
var focusHistory = [];
function initFocusEvent() {
    killFocusEvent();
    document.addEventListener("keydown", keyDown, false);
    $(document).on(pointerEventType.down, e => {
        if (e.isTrigger != 3) {
            removeFocus(e);
        }
    });
}
function killFocusEvent() {
    document.removeEventListener("keydown", keyDown, false);
    $(document).off(pointerEventType.down, removeFocus);
}
function keyDown(e) {
    var o = e.key.toLowerCase();
    if (!(e.shiftKey && e.keyCode == 9)) {
        if (e.keyCode == 9) {
            e.preventDefault();
        }
        if (e.keyCode == 27) {
            e.preventDefault();
        }
        if (e.keyCode == 38) {
            e.preventDefault();
        }
        if (e.keyCode == 40) {
            e.preventDefault();
        }
        if (!$("input").is(":focus")) {
            if (e.keyCode == 13) {
                e.preventDefault();
            }
            if (e.keyCode == 37) {
                e.preventDefault();
            }
            if (e.keyCode == 39) {
                e.preventDefault();
            }
        }
        hitKey(o);
    }
}
function nextFocus() {
    var e;
    var o;
    focusPos = ++focusPos > focusList.length - 1 ? focusList.length - 1 : focusPos;
    if (focusHistory[focusHistory.length - 1] == "playlist-all" && (o = $scrollbox.find(".boxline .line.focused")).length && (e = o.index()) > 0) {
        o = o.height();
        $scrollbox[0].scroll({
            top: e * o,
            left: 0,
            behavior: "smooth"
        });
    }
    addFocus();
}
function prevFocus() {
    var e;
    var o;
    focusPos = --focusPos < 0 ? 0 : focusPos;
    if (focusHistory[focusHistory.length - 1] == "playlist-all" && (o = $scrollbox.find(".boxline .line.focused")).length && (e = o.index()) > 0) {
        o = o.height();
        $scrollbox[0].scroll({
            top: e * o - o * 2,
            left: 0,
            behavior: "smooth"
        });
    }
    addFocus();
}
function addFocus() {
    if (notnull($focused)) {
        $focused.removeClass("focused");
        $focused = null;
    }
    if (focusList.length > 0) {
        ($focused = focusList[focusPos].toFocus).addClass("focused");
    }
}
function removeFocus() {
    if (notnull($focused)) {
        $focused.removeClass("focused");
        $focused = null;
        focusPos = -1;
    }
}
function enterFocus() {
    var e;
    if (notnull($focused)) {
        if (notnull(focusList[focusPos].onEnter)) {
            focusList[focusPos].onEnter();
        } else {
            e = focusList[focusPos].toClick || focusList[focusPos].toFocus;
            if ($._data(e, "events") != null) {
                e.trigger(pointerEventType.down);
            } else {
                e[0].dispatchEvent(new Event(pointerEventType.down));
            }
        }
    }
}
function deleteFocus() {
    if (focusHistory[focusHistory.length - 1] == "popup-menu-exit") {
        return false;
    }
    if (notnull($focused)) {
        $focused.removeClass("focused");
        $focused = null;
    }
    focusList = [];
    focusPos = -1;
}
function hitKey(e) {
    switch (e) {
        case "tab":
            if ($("input").is(":focus")) {
                blurAll();
            }
            nextFocus();
            break;
        case "enter":
            if (
                pageApp && onGame &&
                !(!(pageApp && onGame && loopOn) ||
                    $lockAll.hasClass("show") ||
                    (boxMenu !== undefined && boxMenu.isOpen()))
            ) {
                $btClock.trigger(pointerEventType.down);
                return false;
            }

            if ($("input").hasClass("focused") && $("input").is(":focus")) {
                blurAll();
                nextFocus();
            }
            enterFocus();
            break;
        case "escape":
            if ($("input").is(":focus")) {
                blurAll();
                return false;
            }
            if (notnull($focused)) {
                removeFocus();
            }
            if (pageApp && pause) {
                return false;
            }
            if (boxDialog.isOpen()) {
                return false;
            }
            if (pageApp && $lockAll.hasClass("show")) {
                return false;
            }
            if (focusHistory[focusHistory.length - 1] == "popup-switch") {
                boxSwitch.close();
                return false;
            }
            if (boxInfo.isOpen()) {
                boxInfo.close();
                return false;
            }
            if (boxParam.isOpen()) {
                boxParam.close();
                return false;
            }
            if (pageApp && boxPopup.isOpen()) {
                if (boxPopup.$popup.hasClass("action") || boxPopup.$popup.hasClass("action-back")) {
                    boxPopup.$icon.trigger(pointerEventType.down);
                } else {
                    boxPopup.close();
                }
                return false;
            }
            if (pageApp && $mixlist.isOpen()) {
                if (focusHistory[focusHistory.length - 1] == "playlist-line-open") {
                    $lineOpened.trigger(pointerEventType.down).trigger(pointerEventType.up);
                    return false;
                }
                if (focusHistory[focusHistory.length - 1] == "playlist-all") {
                    closePlaylist();
                    return false;
                }
            }
            if ((window.cordova || window.electron) && $focused == null) {
                removeFocus();
                if (boxMenu.isOpen()) {
                    boxMenu.close();
                } else {
                    popupMenuExit();
                }
                return false;
            }
            break;
        case " ":
            if (!(!(pageApp && onGame && loopOn) || $lockAll.hasClass("show") || boxMenu !== undefined && boxMenu.isOpen())) {
                $btClock.trigger(pointerEventType.down);
            }
            break;
        case "arrowright":
        case "arrowdown":
            if (!$("input").is(":focus")) {
                nextFocus();
            }
            break;
        case "arrowleft":
        case "arrowup":
            if (!$("input").is(":focus")) {
                prevFocus();
            }
            break;
    }
}
function createFocus(e, o) {
    if (boxMenu && boxMenu.isOpen() && e != "popup-menu-exit") {
        removeInArray("popup-menu-exit", focusHistory);
        focusHistory.push(e);
        focusHistory.push("popup-menu-exit");
        return false;
    }
    if (boxDialog && boxDialog.isOpen() && e != "popup-dialog") {
        removeInArray("popup-dialog", focusHistory);
        focusHistory.push(e);
        focusHistory.push("popup-dialog");
        return false;
    }
    var t;
    var n;
    var i;
    focusList = [];
    focusPos = -1;
    if (e == "popup-menu-exit") {
        boxMenu.$popup.find(".bt:not(.icon)").each(function (e) {
            focusList.push({
                toFocus: $(this)
            });
        });
        focusList.push({
            toFocus: boxMenu.$icon
        });
    }
    if (pageApp && e == "home") {
        focusList.push({
            toFocus: $homeBtInfo
        });
        focusList.push({
            toFocus: $homeBtParam
        });
        if ($("#home-bt-fs").is(":visible")) {
            focusList.push({
                toFocus: $("#home-bt-fs")
            });
        }
        focusList.push({
            toFocus: $homeBtSwitch
        });
        focusList.push({
            toFocus: $homeBtPlay
        });
        focusList.push({
            toFocus: $homeBtList
        });
    }
    if (!(e != "pop-tuto" && e != "pop-credit" && e != "pop-follow")) {
        $("#pop-info .box-tab .tab").each(function (e) {
            focusList.push({
                toFocus: $(this)
            });
        });
    }
    if (e == "pop-tuto") {
        $("#pop-info #pop-tuto .bt").each(function (e) {
            focusList.push({
                toFocus: $(this)
            });
        });
    }
    if (e == "pop-credit") {
        $("#pop-info #pop-credit .bt").each(function (e) {
            focusList.push({
                toFocus: $(this)
            });
        });
    }
    if (e == "pop-follow") {
        $("#pop-info #pop-follow .bt").each(function (e) {
            focusList.push({
                toFocus: $(this)
            });
        });
    }
    if (!(e != "pop-language" && e != "pop-setting")) {
        $("#pop-param .box-tab .tab").each(function (e) {
            focusList.push({
                toFocus: $(this)
            });
        });
    }
    if (e == "pop-language") {
        $("#pop-param #pop-language .bt").each(function (e) {
            focusList.push({
                toFocus: $(this)
            });
        });
    }
    if (e == "pop-setting") {
        $("#pop-param #pop-setting .bt-onoff, #pop-param #pop-setting .bt").each(function (e) {
            focusList.push({
                toFocus: $(this)
            });
        });
    }
    if (e == "index-select") {
        if ($("#home-bt-fs").is(":visible")) {
            focusList.push({
                toFocus: $("#home-bt-fs")
            });
        }
        focusList.push({
            toFocus: $("#home-bt-info")
        });
        focusList.push({
            toFocus: $("#home-bt-param")
        });
        $("#sp-select .vicon:not(.open)").each(function (e) {
            focusList.push({
                toFocus: $(this).find(".img"),
                onEnter: () => {
                    $(this).trigger(pointerEventType.up);
                }
            });
        });
    }
    if (e == "popup-switch") {
        $("#sp-select .vicon:not(.open)").each(function (e) {
            focusList.push({
                toFocus: $(this).find(".img"),
                onEnter: () => {
                    $(this).trigger(pointerEventType.up);
                }
            });
        });
    }
    if (e == "toolbar") {
        focusList.push({
            toFocus: $btTool
        });
        focusList.push({
            toFocus: $btClock
        });
    }
    if (e == "toolbar-open") {
        $("#game #box-bt1 .bt").each(function (e) {
            focusList.push({
                toFocus: $(this)
            });
        });
    }
    if (e == "game-paused") {
        if ($lockPause.css("visibility") == "visible") {
            focusList.push({
                toFocus: $btClock,
                toClick: $lockPause
            });
        } else {
            focusList.push({
                toFocus: $btClock
            });
        }
    }
    if (e == "mode-replay") {
        focusList.push({
            toFocus: $btTool
        });
        focusList.push({
            toFocus: $btClock
        });
        focusList.push({
            toFocus: $btSave
        });
        focusList.push({
            toFocus: $btLike
        });
    }
    if (e == "popup-record-complete") {
        boxPopup.$popup.find(".box-bt-haut .bt").each(function (e) {
            focusList.push({
                toFocus: $(this)
            });
        });
        focusList.push({
            toFocus: boxPopup.$icon
        });
    }
    if (e == "popup-save-form") {
        boxPopup.$popup.find(".formzone .formline:visible input").each(function (e) {
            var o = $(this);
            focusList.push({
                toFocus: o,
                onEnter: function () {
                    var e = o.val().length;
                    o.focus();
                    o[0].setSelectionRange(e, e);
                }
            });
        });
        focusList.push({
            toFocus: boxPopup.$popup.find(".bt-onofftext")
        });
        focusList.push({
            toFocus: boxPopup.$popup.find(".bt.valid")
        });
        focusList.push({
            toFocus: boxPopup.$icon
        });
    }
    if (e == "popup-mix-saved") {
        boxPopup.$popup.find(".box-bt-haut .bt").each(function (e) {
            focusList.push({
                toFocus: $(this)
            });
        });
        focusList.push({
            toFocus: boxPopup.$icon
        });
    }
    if (e == "popup-global-share") {
        boxPopup.$popup.find(".box-bt-haut .bt").each(function (e) {
            focusList.push({
                toFocus: $(this)
            });
        });
        focusList.push({
            toFocus: boxPopup.$icon
        });
    }
    if (e == "popup-email-form") {
        boxPopup.$popup.find(".formzone .formline input").each(function (e) {
            var o = $(this);
            focusList.push({
                toFocus: o,
                onEnter: function () {
                    var e = o.val().length;
                    o.focus();
                    o[0].setSelectionRange(e, e);
                }
            });
        });
        focusList.push({
            toFocus: boxPopup.$popup.find(".bt.valid")
        });
        focusList.push({
            toFocus: boxPopup.$icon
        });
    }
    if (e == "popup-convert-mix") {
        focusList.push({
            toFocus: boxPopup.$icon
        });
    }
    if (e == "popup-convert-mix-ready") {
        t = boxPopup.$popup.find("#bt-save-file");
        focusList.push({
            toFocus: t,
            onEnter: function () {
                t[0].click();
            }
        });
        focusList.push({
            toFocus: boxPopup.$icon
        });
    }
    if (e == "popup-dialog") {
        $("#pop-dialog .bt").each(function (e) {
            focusList.push({
                toFocus: $(this)
            });
        });
    }
    if (e == "playlist-all") {
        $("#mixlist .tabbox .tab").each(function (e) {
            focusList.push({
                toFocus: $(this)
            });
        });
        (n = $("#mixlist .pagebox.show")).find(".tab-filter:visible").find(".bt").each(function (e) {
            focusList.push({
                toFocus: $(this)
            });
        });
        $scrollbox.find(".boxline .line").each(function (e) {
            var o = $(this);
            focusList.push({
                toFocus: o,
                onEnter: function () {
                    o.trigger(pointerEventType.down).trigger(pointerEventType.up);
                }
            });
        });
    }
    if (e == "playlist-line-open" && $lineOpened) {
        $lineOpened.find(".box-action .bt").each(function (e) {
            focusList.push({
                toFocus: $(this)
            });
        });
    }
    var a = [];
    for (i in focusList) {
        if (isVisible(focusList[i])) {
            a.push(focusList[i]);
        }
    }
    focusList = a;
    if (e != focusHistory[focusHistory.length - 1]) {
        focusHistory.push(e);
    }
    if (focusHistory.length > 5) {
        focusHistory.shift();
    }
    if (notnull(o)) {
        for (var s = 0, r = focusList.length; s < r; s++) {
            if (focusList[s].toFocus && focusList[s].toFocus[0] === o[0]) {
                focusPos = s;
                break;
            }
        }
    }
}
function removeInFocusHistory(e) {
    removeInArray(e, focusHistory);
}
function createFocusFromHistory() {
    if (focusHistory.length) {
        createFocus(focusHistory[focusHistory.length - 1]);
    }
}
function isVisible(e) {
    return !!notnull(e) && !!(e = notnull(e.toClick) ? e.toClick : e.toFocus).length && e.css("visibility") != "hidden" && e.css("display") != "none";
}
