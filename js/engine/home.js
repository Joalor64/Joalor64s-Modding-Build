/*
 * home.js
 * A version's home screen: global game state variables, loading a mix to watch,
 * fullscreen, the home buttons, play / back to home.
 */

var app;
var clock;
var mainCanvas;
var contextCanvas;
var localMixObject;
var rateShown = false;
function checkRatingModul(e) {
    var o;
    var t;
    var n = {
        IyZcm: "false:0",
        TjfgQ: function (e, o) {
            return e(o);
        },
        XrFYO: "QUFpk",
        XPBdo: "steam"
    };
    var i = 0;
    var a = "ratemsg";
    function s(o) {
        if (o == 1) {
            storage.setItem(a, n.IyZcm);
        } else if (o == 2) {
            storage.removeItem(a);
        } else {
            storage.removeItem(a);
            n.TjfgQ(openURL, isIOS || window.electron && isOSX ? build.storeRateURL : build.storeURL);
        }
        e();
    }
    if (!((window.cordova || window.electron) && hasNetwork && n.XPBdo != build.store && (isnull(storage.getItem(a)) && storage.setItem(a, "true:0"), n.TjfgQ(isnull, o = storage.getItem(a)) || (o = String(o).split(":"), t = Boolean(o[0] == "true"), i = Number(o[1]), t && (++i >= 5 ? (rateShown = true, boxDialog.open(STR("pop.rateText"), STR("pop.rateTitle"), [STR("bt.nope"), STR("bt.later"), STR("bt.sure")], [function () {
        s(1);
    }, function () {
        if (n.XrFYO === "lDtel") {
            return n;
        }
        s(2);
    }, function () {
        s(3);
    }])) : storage.setItem(a, "true:" + String(i)))), rateShown))) {
        e();
    }
}
function reinitRatingModul() {
    storage.setItem("ratemsg", "true:0");
}
function showPopupPP(e) {
    e();
}
var loopDuration;
var nbPoloMax;
var mixlink = getParameterByName("mix");
var miniPlayer = mixlink != null || getParameterByName("replay") == "1";
var appNumberVersion = miniPlayer && mixlink ? mixlink.slice(-1) : getParameterByName("v");
var appVersion = pageApp && (isnull(appNumberVersion) || isNaN(appNumberVersion) || appNumberVersion.length != 1) ? 4 : appNumberVersion;
appVersion = pageApp && miniPlayer && mixlink && mixlink.indexOf("-") == -1 && mixlink.length == 13 ? 2 : appVersion;
var appLoaded = false;
var appViewed = false;
var modeWatch = false;
var isBackToHome = false;
var delayassist = 500;
var onGame = false;
var loopOn = false;
var pause = false;
function pageAppReady() {
    initRightClick();
    listenFocus();
    contextCanvas = $("#cnv-stage")[0].getContext("2d");
    initAudioContext();
    $home.addClass("animate");
    $home[0].onanimationend = () => {
        $home.removeClass("animate");
    };
    removeTransition($fadeAll, "fadeIn", "opacity", function () {
        (miniPlayer ? displayHomeReplay : (initMixlist(), showHome))();
    });
}
var listPolo;
var listPicto;
var readingBar;
var randomMix;
var recordMix;
var replayMix;
var mixToWatchLoaded = false;
var displayHomeReplayWaiting = false;
function tryToLoadMix() {
    xhr("GET", domainOnline + "ph3/get-mix-db.php", {
        id: mixlink
    }, function (e) {
        mixToWatchLoaded = !(mixToWatch = null);
        if (e.state == "success") {
            mixToWatch = e.mixlist[0];
        } else {
            popupGeneralError({
                error: "load mix",
                action: "kill"
            });
        }
        if (displayHomeReplayWaiting) {
            displayHomeReplay();
        }
    }, function (e) {
        popupGeneralError({
            error: "mix not found",
            action: "kill"
        });
        mixToWatchLoaded = true;
    });
}
function prepareMixReplay(e) {
    mixToWatchLoaded = true;
    mixToWatch = e;
}
function displayHomeReplay() {
    if (mixToWatchLoaded) {
        if (mixToWatch.dedi && mixToWatch.dedi != "") {
            $("#home #home-dedicated").html(STR("txt.dedicatedTo").replace("%{name}", mixToWatch.dedi));
            $("#home #home-dedicated").addClass("animate");
        }
        $fadeAll.removeClass("fadeIn");
        if (!isnull(mixToWatch)) {
            parseXmlAndCheckAssets();
            showHomeLoadbar();
        }
    } else {
        displayHomeReplayWaiting = true;
        if (!isIframe) {
            tryToLoadMix();
        }
    }
}
function toggleFullscreen() {
    if (
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
    ) {
        triggerExitFullscreen();
    } else {
        triggerFullscreen();
    }
}
function triggerFullscreen() {
    $homeBtFs.find("svg use").attr("xlink:href", "#ic-fullscreen-off");
    if (window !== window.top && typeof window.top.appEvent === "function") {
        window.top.appEvent("openFullscreen");
    }
    else if (!(window.electron || window.cordova)) {
        openFullscreen();
    }
}
function openFullscreen() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
    } else {
        console.warn("Fullscreen API not supported.");
    }
}
function triggerExitFullscreen() {
    $homeBtFs.find("svg use").attr("xlink:href", "#ic-fullscreen-on");
    if (window !== window.top && typeof window.top.appEvent === "function") {
        window.top.appEvent("closeFullscreen");
    }
    else if (!(window.electron || window.cordova)) {
        closeFullscreen();
    }
}
function closeFullscreen() {
    if (document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    } else {
        console.log("Not currently in fullscreen.");
    }
}
function showHome() {
    unlock();
    unlockScreenEdges();
    $fadeAll.removeClass("fadeIn");
    const homeTitre = app.customTitle ? $homeTitre : $homeTitreTxt;
    const homeVersion = app.customVersion ? $homeVersion : $homeVersionTxt;
    homeTitre.addClass("animate");
    homeVersion.addClass("animate");
    if (!(appViewed = !(!miniPlayer || !appBrowserSchool) || appViewed)) {
        appViewed = true;
        (appLoaded ? showBtHome : showHomeLoadbar)();
        $homeBtSwitch.on(pointerEventType.down, function (e) {
            preventAction(clickHomeBtSwitch);
        }).addClass("animate");
        $homeBtInfo.on(pointerEventType.down, function (e) {
            e.preventDefault();
            preventAction(popupInfo);
        }).addClass("animate");
        $homeBtParam.on(pointerEventType.down, function (e) {
            e.preventDefault();
            preventAction(popupParam);
        }).addClass("animate");
        if (!(window.electron || window.cordova || isMobile)) {
            $homeBtFs.on(pointerEventType.down, function (e) {
                e.preventDefault();
                callParentWindow("openFullscreen");
            }).addClass("animate");
        } else {
            $homeBtFs.hide();
        }
        $homeBtModcredits.addClass("animate");
        addModBt();
        initCustomUI();
        applyStartOnAppStuff();
    }
}
function showHomeLoadbar() {
    $homeLoadbox.addClass("animate");
    preparerArray();
}
function hideHomeLoadbar() {
    $homeLoadbox.removeClass("animate");
    if (miniPlayer) {
        if (appBrowserSchool) {
            callParentWindow("replayIsReady", {
                func: function () {
                    if (loopOn) {
                        clickBtClock();
                    } else {
                        forceUserGesture(function () {
                            clickBtWatch(mixToWatch);
                        });
                    }
                }
            });
        } else {
            showBtPlayListen();
        }
    } else {
        showBtHome(true);
    }
}
function showBtPlayListen() {
    $homeBtPlay.on(pointerEventType.down, function () {
        $homeBtPlay.addSpinner();
        forceUserGesture(function () {
            clickBtWatch(mixToWatch);
            callParentWindow("replayStart", mixToWatch);
        });
    });
    $homeBtPlay.addClass("animate");
    var e = 0;
    $body.on(pointerEventType.down, function (o) {
        e = window.top.scrollY;
    });
    $body.on(pointerEventType.up, function (o) {
        if (window.top.scrollY == e && loopOn) {
            clickBtClock();
        }
    });
    $lockPause.off();
}
function showBtHome(e) {
    if (e) {
        createFocus("home");
    }
    $homeBtPlay.addClass("animate");
    $homeBtList.addClass("animate");
    $homeBtPlay.on(pointerEventType.down, function () {
        lock();
        $homeBtPlay.addSpinner();
        forceUserGesture(clickHomeBtPlay);
    });
    $homeBtList.on(pointerEventType.down, function () {
        if (appBrowser) {
            dialogGetApp();
        } else {
            lock();
            $homeBtList.addSpinner();
            forceUserGesture(clickHomeBtPlaylist);
        }
    });
    if (debugGame) {
        clickHomeBtPlay();
    }
}
function clickHomeBtPlaylist() {
    deleteFocus();
    lock();
    TweenMax.delayedCall(0.5, function () {
        unlock();
        openPlaylist();
    });
}
function clickHomeBtPlay() {
    if (appBrowserSchool && !miniPlayer) {
        callParentWindow("clickBtPlay");
    }
    deleteFocus();
    addTransition($fadeAll, "fadeIn", "opacity", function () {
        hideHome();
    });
}
function hideHome() {
    lock();
    lockScreenEdges();
    onGame = !(isBackToHome = false);
    $home.hide();
    $incredibox.addClass("show");
    document.body.classList.remove("darkback");
    $homeBtPlay.removeSpinner();
    renderRAF.start();
    if (modeWatch) {
        prepareReplayMode();
        afficherAllPolo(true);
    } else {
        showDiv($boxBtBonus);
        showDiv($boxPicto);
        showDiv($boxLoaderPolo);
        baisserAllPolo();
    }
    removeTransition($fadeAll, "fadeIn", "opacity", lancerApp);
}
function backToHome(e) {
    deleteFocus();
    lock();
    isBackToHome = true;
    pictoForceOnDrop();
    addTransition($fadeAll, "fadeIn", "opacity", function () {
        hideGame();
        if (e) {
            e();
        }
    });
}
function hideGame() {
    document.body.classList.add("darkback");
    onGame = false;
    stopAllStage();
    renderRAF.stop();
    closeTool();
    checkIfPopupOpen();
    $home.show();
    $incredibox.removeClass("show");
    removeTransition($fadeAll, "fadeIn", "opacity", showHome);
    if (modeWatch) {
        reinitModeWatch();
        createFocusFromHistory();
    } else {
        focusHistory = [];
        createFocus("home");
    }
}
function lancerApp() {
    $fadeAll.removeClass("fadeIn");
    if (modeWatch) {
        startReplayMode();
    } else {
        unlock();
        afficherAllPolo();
        createFocus("toolbar");
        if (isnull(storage.getItem("popupDragViewed"))) {
            setTimeout(popupDrag, 600);
        }
    }
}
