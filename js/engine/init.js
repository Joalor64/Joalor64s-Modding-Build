/*
 * init.js
 * Page start-up: pageLoadComplete -> documentReady -> pageCanRun -> finalizeInitialization,
 * then pageIndexReady (menu + intro) or pageAppReady (a version). Also switchVersion().
 */

var pageApp = false;
function pageLoadComplete() {
    cloud = new CloudSync();
    storage = new LocalStorage();
    localMixObject = new LocalMixObject();
    checkSystem();
    initLanguage();
    resizeApp();
    localMixObject.saveMixOffline();
    $(document).ready(function () {
        if (isIframe && appBrowser) {
            callParentWindow("appIsReady");
        } else {
            documentReady();
        }
    });
}
function documentReady() {
    $body = $("body");
    boxMenu = new Popup(".box-popup#pop-menu-exit");
    boxDialog = new BoxDialog("#pop-dialog");
    boxPopup = new Popup(".box-popup#pop-popup");
    if (checkSupported() != "ok") {
        removeFadeAll();
        popupGeneralError({
            error: checkSupported(),
            action: "kill"
        });
        return false;
    }
    loadLanguage({
        cbck: function () {
            pageCanRun();
        },
        fail: function () {
            removeFadeAll();
            popupGeneralError({
                error: "no language found",
                action: "reload"
            });
        }
    });
    let e = `onV${appVersion}Start`;
    if (typeof window[e] != "function") {
        e = "onAppStart";
    }
    addToHistory("totalVersionsOpened");
    window.electron?.ipc?.setPresence?.({
        mod: typeof RegisterMod === "string" && RegisterMod !== "Unknown" ? RegisterMod : null,
        version: pageApp ? appVersion : null
    });
    window[e]?.();
    console.log((pageApp ? `v${appVersion}` : 'app') + ` started with function ${e}()`);
}
async function pageCanRun() {
    const urlParams = new URLSearchParams(window.location.search);
    const v = urlParams.get("v");

    await loadVersionConfig();
    await loadUILayout();

    if (pageApp) {
        const config = versionConfig[`v${v}`] || {};
        const existing = versions[`v${v}`];

        const hasRealData = existing &&
            Array.isArray(existing.animearray) &&
            existing.animearray.length > 0;

        if (!hasRealData || config.v8AppJS || typeof app === 'undefined') {
            return loadAppFile(() => finalizeInitialization());
        }

        initVersions();
    }
    finalizeInitialization();
}
function finalizeInitialization() {
    if (pageApp) {
        updateBonusResetVisibility();
        loadParticlesIfExists();
        checkForCustomCursor();
        preloadPictoAssets();
    }
    handleBonusTutorialBloc();
    injectSvgSprite("img/icons.svg");
    initJqueryVar();
    initRulesCSS();
    initFocusEvent();
    initParam();
    initPopup();
    changeDomTxt();
    (pageApp ? pageAppReady : pageIndexReady)();
}

var preloadedPictoPath;

function preloadPictoAssets() {
    if (typeof pageApp !== 'undefined' && pageApp) {
        const { base: pictoName, ext } = splitAssetName(app.gamePicto || "game-picto");

        const pathsToTry = [
            `asset-v${appVersion}/img/${pictoName}@2x${ext}`,
            `asset-v${appVersion}/image/${pictoName}@2x${ext}`,
            `asset-v${appVersion}/img/${pictoName}${ext}`,
            `asset-v${appVersion}/image/${pictoName}${ext}`
        ];

        preloadedPictoPath = pathsToTry[pathsToTry.length - 1];
        let pathIndex = 0;

        function tryNextPath() {
            if (pathIndex >= pathsToTry.length) {
                console.log(`Preload Fallback: No picto found, using: ${preloadedPictoPath}`);
                return;
            }

            const currentPath = pathsToTry[pathIndex];
            const tester = new Image();

            tester.onload = () => {
                preloadedPictoPath = currentPath;
                console.log(`Preload Success: Using picto from ${currentPath} for v${appVersion}`);
            };
            tester.onerror = () => {
                pathIndex++;
                tryNextPath();
            };
            tester.src = currentPath;
        }
        tryNextPath();
    }
}

function loadParticlesIfExists() {
    const particlesPath = `asset-v${appVersion}/particles.json`;
    fetch(particlesPath)
        .then(res => {
            if (!res.ok) throw new Error('File not found');
            return res.json();
        })
        .then(data => {
            particlesJS('particles-js', data);
        })
        .catch(err => {
            console.warn(`No particles.json for version ${appVersion}, skipping particles.`);
        });
}
function checkForCustomCursor() {
    const base = `asset-v${appVersion}/img/cursor`;

    const tryCursor = (path) => {
        const img = new Image();
        img.onload = () => setCustomCursor(path);
        img.onerror = () => { };
        img.src = path;
    };

    tryCursor(base + ".gif");
    tryCursor(base + ".png");
}
function switchVersion(e) {
    const $this = $(this);
    const id = $this.attr("id").replace("icon", "");
    const isSpecial = $this.data("isSpecial") === true;

    let url = "app." + pageExt + "?v=" + id;
    url += (getParameterByName("lang") != null ? "&l=" + getParameterByName("lang") : "");
    url += (getParameterByName("afs") != null ? "&afs=" + getParameterByName("afs") : "");

    if (featureLocked && parseInt(id) > 4) {
        dialogGetApp();
        return;
    }

    if (id != appVersion) {
        lock();
        focusHistory = [];
        deleteFocus();

        if (pageApp) {
            $(".box-popup#pop-switch #icon" + appVersion).addClass("close");
        }

        const performTransition = () => {
            addTransition($fadeAll, "fadeIn", "opacity", function () {
                gotoAppUrl(url);
            });
        };

        if (isSpecial) {
            performTransition();
        } else {
            $this.addClass("open clicked").one(animationEnd, performTransition);
        }
    }
}

window.allowSwitchVersion = true;

function initJqueryVar() {
    $body = $("body");
    $fadeAll = $("#fade-all");
    $lockAll = $("#lock-all").on(pointerEventType.down, stopProp);
    $bckGlobal = $("#bck-global");
    $homeBtModcredits = $("#home-bt-modcredits");
    $homeBtInfo = $("#home-bt-info");
    $homeBtParam = $("#home-bt-param");
    $homeBtFs = $("#home-bt-fs");
    if (pageApp) {
        $incredibox = $("#app-incredibox");
        $lockPause = $("#lock-pause").on(pointerEventType.down, function (e) {
            e.preventDefault();
            if (e.pageY - $incredibox[0].getBoundingClientRect().y < $incredibox[0].getBoundingClientRect().height * 0.7) {
                preventAction(clickBtClock);
            }
        });
        ($mixlist = $("#mixlist")).isOpen = function () {
            return $mixlist.hasClass("show");
        };
        $tabMixlist = $("#tab-mixlist");
        $home = $("#home");
        $homeBck = $("#home #img-bck");
        $homeVersion = $("#home #img-version");
        $homeVersionTxt = $("#home #box-version");
        $homeTitre = $("#home #img-titre");
        $homeTitreTxt = $("#home #box-title");
        $homeLoadbox = $("#home #load-box");
        $homeLoadbar = $("#home #load-box #load-bar");
        $homeBtPlay = new CustomButton($("#home #home-bt-play"));
        $homeBtList = new CustomButton($("#home #home-bt-list"));
        $homeBtSwitch = $("#home #home-bt-switch");
        $boxBt = $("#box-bt");
        $btBack = $("#bt-back");
        ($btTool = $("#bt-tool")).$bck = $("#bt-tool .bck");
        $btTool.$svg = $btTool.$bck.find("svg use");
        $btTool.bounce = function () {
            this.addClass("animateBounce").one(animationEnd, function (e) {
                $(e.target).removeClass("animateBounce");
            });
        };
        $btStop = $("#bt-stop");
        $btRandom = $("#bt-random");
        $btRecord = $("#bt-record");
        $btHome = $("#bt-home");
        $btHelp = $("#bt-help");
        $btSwitch = $("#bt-switch");
        $btClock = $("#bt-clock");
        $cntRecord = $("#cnt-record");
        $btSave = $("#bt-save");
        $btLike = $("#bt-like");
        $boxStage = $("#box-stage");
        $boxVideo = $("#box-video");
        $fadeVideo = $("#fade-video");
        $boxTop = $("#box-top");
        $boxBtBonus = $("#box-bt-bonus");
        $boxBottom = $("#box-bottom");
        $boxPicto = $("#box-picto");
        $boxLoaderPolo = $("#box-loader-polo");
        ($watchInfo = $("#watch-info")).$title = $("#watch-info .title");
        $watchInfo.$name = $("#watch-info .name");
        $watchInfo.$dedi = $("#watch-info .dedi");
        $watchInfo.$date = $("#watch-info .date");
        boxSwitch = new Popup(".box-popup#pop-switch");
        let versionIcon = document.querySelector(".box-popup#pop-switch #icon" + appVersion);
        if (versionIcon && !versionIcon.classList.contains("locked")) {
            versionIcon.classList.add("open");
        }
        $(".box-popup#pop-switch .vicon").on(pointerEventType.up, switchVersion);
    }
}
function removeFadeAll() {
    if (($fadeAll = isnull($fadeAll) ? $("#fade-all") : $fadeAll).hasClass("fadeIn")) {
        $fadeAll.removeClass("fadeIn");
    }
}
function clickAndroidBackButton() {
    if (pageApp) {
        if (onGame && loopOn && !pause) {
            stopAllStage();
        } else {
            gotoAppUrl("index.html?back=1");
        }
    } else {
        exitApp();
    }
}
function applyStartOnAppStuff() {
    if (!StartOnApp || !pageApp) {
        return;
    }
    const homeBtHome = document.getElementById("home-bt-home");
    if (homeBtHome) {
        homeBtHome.remove();
    }
}
function pageIndexReady() {
    cloud.sync(storage.restoreMixFromDB);
    if (StartOnApp) {
        goto(1);
        return false;
    } else {
        removeTransition($("#fade-all"), "fadeIn", "opacity", function () {
            if (window.cordova) {
                $("#fade-all").removeClass("white");
            }
        });
        if (getParameterByName("skipintro")) {
            skipIntro();
            introComplete();
            return false;
        }
        afterPP();
    }
}
function afterPP() {
    checkRatingModul(function () {
        setTimeout(launchIntro, 2000);
    });
}
function launchIntro() {
    $("#page-splash #sp-title").addClass("titleTweenUp");
    $("#page-splash #sp-baseline").addClass("baselineTweenUp");
    $("#page-splash #sp-experience").html(STR("txt.useHeadphones")).addClass("experienceTweenUp");
    $("#page-splash #sp-headphone").addClass("headphoneTweenUp");
    setTimeout(function () {
        $("#page-splash #sp-title").addClass("titleTweenUpHide");
        $("#page-splash #sp-experience").addClass("experienceTweenUpHide");
        $("#page-splash #sp-choose").html(STR("txt.selectVersion")).addClass("chooseTweenUp");
        $("#page-splash #sp-headphone").addClass("headphoneTweenUpHide").one(animationEnd, introComplete);
    }, 2500);
}
function skipIntro() {
    $('#page-splash #sp-title').hide();
    $('#page-splash #sp-baseline').hide();
    $('#page-splash #sp-experience').hide();
    $('#page-splash #sp-choose').html(STR('txt.selectVersion')).addClass('chooseTweenUp');
    $('#page-splash #sp-headphone').hide();
}
function introComplete() {
    $homeBtInfo.on(pointerEventType.down, popupInfo).addClass("animate");
    $homeBtParam.on(pointerEventType.down, popupParam).addClass("animate");
    if (!(window.electron || window.cordova || isMobile)) {
        $homeBtFs.on(pointerEventType.down, function () {
            callParentWindow("openFullscreen");
        }).addClass("animate");
    } else {
        $homeBtFs.hide();
    }
    $homeBtModcredits.addClass("animate");
    addModBt();
    initCustomUI();
    $("#page-splash").addClass("enabled");
    $("#page-splash #sp-select .vicon").addClass("iconTweenUp").on(pointerEventType.up, switchVersion);
    createFocus("index-select");
}
document.addEventListener(window.cordova ? "deviceready" : "DOMContentLoaded", pageLoadComplete, false);
