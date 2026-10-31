/*
 * window.js
 * jQuery element variables ($body, $home, ...), the exit menu, fullscreen, minimize and quit.
 */

var storage;
var cloud;
var $body;
var $incredibox;
var $bckGlobal;
var $lockAll;
var $lockPause;
var $fadeAll;
var $watchInfo;
var $mixlist;
var $poplist;
var $tabMixlist;
var $home;
var $homeVersion;
var $homeVersionTxt;
var $homeTitre;
var $homeTitreTxt;
var $homeLoadbox;
var $homeLoadbar;
var $homeBtPlay;
var $homeBtList;
var $homeBtSwitch;
var $homeBtModcredits;
var $homeBtInfo;
var $homeBtParam;
var $homeBtFs;
var $homeBck;
var $boxStage;
var $boxVideo;
var $fadeVideo;
var $boxTop;
var $boxBtBonus;
var $boxBottom;
var $boxPicto;
var $boxLoaderPolo;
var $btTool;
var $boxBt;
var $btBack;
var $btHome;
var $btSave;
var $btLike;
var $btHelp;
var $btSwitch;
var $btStop;
var $btRecord;
var $btRandom;
var $btClock;
var $cntRecord;
var boxDialog;
var boxMenu;
var boxPopup;
var boxInfo;
var boxParam;
var boxSwitch;
var isFullScreenable = window.electron && window.electron.vars.isFullScreenable;
var isMinimizable = window.electron && window.electron.vars.isMinimizable;
function popupMenuExit() {
    boxMenu.open({
        name: "menu-exit",
        icntype: "action",
        content: function () {
            var e = isFullScreen() ? STR("bt.fullscreenOff") : STR("bt.fullscreenOn");
            var o = `
\t\t\t\t<div class='title'>Menu</div>
\t\t\t\t<div class='content'>`;
            if (isFullScreenable) {
                o += "<div class=\"bt bt-light\" id=\"bt-exit-fullscreen\"><div class=\"bck\"><div class=\"txt\">" + e + "</div></div><div class=\"hitzone\"></div></div>";
            }
            if (isMinimizable) {
                o += "<div class=\"bt bt-light\" id=\"bt-minimize\"><div class=\"bck\"><div class=\"txt\">" + STR("bt.minimizeWindow") + "</div></div><div class=\"hitzone\"></div></div>";
            }
            o = (o += "<div class=\"bt bt-light\" id=\"bt-open-settings\"><div class=\"bck\"><div class=\"txt\">" + STR("bt.param") + "</div></div><div class=\"hitzone\"></div></div>") + "<div class=\"bt bt-light\" id=\"bt-open-help\"><div class=\"bck\"><div class=\"txt\">" + STR("bt.tuto") + "</div></div><div class=\"hitzone\"></div></div>";
            if (window.cordova || window.electron) {
                o += "<div class=\"bt bt-light\" id=\"bt-exit-app\"><div class=\"bck\"><div class=\"txt\">" + STR("bt.quitApp") + "</div></div><div class=\"hitzone\"></div></div>";
            }
            return o + "</div>";
        },
        onBoxOpenStart: function () {
            createFocus("popup-menu-exit");
        },
        onBoxOpenEnd: function () {
            if (isFullScreenable) {
                boxMenu.$popup.find("#bt-exit-fullscreen").on(pointerEventType.down, switchFullscreen);
            }
            if (isMinimizable) {
                boxMenu.$popup.find("#bt-minimize").on(pointerEventType.down, minimizeWindow);
            }
            if (window.cordova || window.electron) {
                boxMenu.$popup.find("#bt-exit-app").on(pointerEventType.down, exitApp);
            }
            boxMenu.$popup.find("#bt-open-help").on(pointerEventType.down, openHelp);
            boxMenu.$popup.find("#bt-open-settings").on(pointerEventType.down, openSettings);
            boxMenu.$icon.on(pointerEventType.down, boxMenu.close);
        },
        onBoxCloseStart: function () {
            boxMenu.$icon.off();
            boxMenu.$popup.find(".bt").off();
        },
        onCloseComplete: function () {
            removeInFocusHistory("popup-menu-exit");
            createFocusFromHistory();
        }
    });
}
function isFullScreen() {
    return !(!window.electron || !window.electron.ipc.isFullScreen) && window.electron.ipc.isFullScreen();
}
function switchFullscreen(e) {
    if (e) {
        e.preventDefault();
    }
    if (window.electron) {
        if (isFullScreen()) {
            console.log("Leaving fullscreen...");
            window.electron.ipc.leaveFullScreen();
        } else {
            console.log("Entering fullscreen...");
            window.electron.ipc.enterFullScreen();
        }
    }
    if (boxMenu !== undefined && boxMenu.close) {
        boxMenu.close();
    }
}
function minimizeWindow(e) {
    if (e) {
        e.preventDefault();
    }
    console.log("Minimize button clicked");
    if (window.electron && window.electron.ipc.minimize) {
        console.log("Calling electron minimize...");
        window.electron.ipc.minimize();
    } else {
        console.error("Electron minimize function not available!");
    }
    if (boxMenu !== undefined && boxMenu.close) {
        boxMenu.close();
    }
}
function exitApp(e) {
    if (notnull(e)) {
        e.preventDefault();
    }
    if (window.electron) {
        electron.ipc.close();
    } else if (window.cordova) {
        boxDialog.open(STR("txt.quitAppConfirm"), "", [STR("bt.yes"), STR("bt.no")], [() => {
            navigator.app.exitApp();
        }]);
    }
    boxMenu.close();
}
function openSettings() {
    boxMenu.close();
    if (boxInfo.isOpen()) {
        boxInfo.close();
    }
    popupParam();
}
function openHelp() {
    boxMenu.close();
    if (boxParam.isOpen()) {
        boxParam.close();
    }
    popupInfo();
}
