/*
 * device.js
 * Build flags, platform/device detection (checkSystem, getDeviceInfo), pointer events,
 * network state and user info.
 */

var uncache = false;
var debugMute = getParameterByName("mute") || false;
var debugGame = getParameterByName("game") || false;
var debugScene = getParameterByName("scene") || false;
var debugBonus = getParameterByName("bonus") || false;
var isAndroidDevice = /Android/i.test(navigator.userAgent);
var build = {
    store: isAndroidDevice ? "playstore" : "steam",
    platform: isAndroidDevice ? "mobile" : "desktop",
    os: isAndroidDevice ? "and" : "desktop",
    osMinimum: isAndroidDevice ? 23 : null,
    storeURL: isAndroidDevice ? "https://play.google.com/store/apps/details?id=com.sofarsogood.incredibox" : "https://store.steampowered.com/app/1545450/",
    version: "0.7.0",
    htmlExt: "html"
};
var domainOnline = "https://www.incredibox.com/";
var machine = {};
var user = {};
var hasNetwork = false;
var sndExt = "mp3";
var vidExt = "mp4";
var appBrowserDemo = false;
var appBrowserSchool = false;
var featureLocked = false;
var isMouseDevice = checkMouseDevice();
var isTouchDevice = checkTouchDevice();
var isMobile = false;
var trustAppMobile = window.cordova || false;
var isIframe = inIframe();
var pointerEventType = {};
var isIOS = false;
var isIOSMac = false;
var isOSX = false;
var isWin = false;
var isAndroid = false;
var isiPod = false;
var isiPhone = false;
var isiPad = false;
var isiPadPro = false;
var hasHBI = false;
var animSize = 1;
var cnvPXD = 2;
function checkSystem() {
    pageApp = window.location.href.includes("app.html") || window.location.href.includes("app.php") || getParameterByName("afs") == "1";
    pageExt = build.htmlExt;
    appBrowser = build.platform == "browser";
    appBrowserDemo = checkInPWA();
    appBrowserSchool = !!notnull(getParameterByName("afs"));
    featureLocked = (appBrowser || appBrowserDemo) && !appBrowserSchool;
    hasNetwork = networkState();
    machine = getDeviceInfo(true);
    user = getUserInfo();
    isAndroid = /android/i.test(machine.osName);
    isWin = /windows/i.test(machine.osName);
    isOSX = /mac os/i.test(machine.osName);
    isIOS = /ios/i.test(machine.osName);
    isIOSMac = !(!window.device || !window.device.isiOSAppOnMac) && window.device.isiOSAppOnMac;
    if (iosVersion = !(!window.device || !window.device.version) && window.device.version) {
        e = iosVersion.split(".");
        iosVersionNumber = Number(String(e[0]) + String(e[1])[0]);
    }
    isiPod = isIOS && /ipod/i.test(machine.osName);
    isiPhone = isIOS && /iphone/i.test(machine.osName);
    isiPad = isIOS && /ipad/i.test(machine.deviceModel);
    isiPadPro = isIOS && /ipadpro/i.test(machine.deviceModel);
    isRetina = checkRetina();
    isMobile = checkMobile();
    hasHBI = isIOS && checkHBI();
    animSize = isHDMode() ? 2 : 1;
    if (appBrowser) {
        animSize = 1;
        sndExt = checkAudioFormat("mp3") ? "mp3" : sndExt;
        vidExt = isAndroid || machine.browserName == "mozilla firefox" && machine.browserVersion <= 48 ? "webm" : "mp4";
    }
    pointerEventType = setPointerEvent();
    transitionEnd = transitionEndEventName();
    animationEnd = animationEndEventName();
    window.cordova;
    window.electron;
    var e = window.cordova ? document : window;
    e.addEventListener("online", networkOn, false);
    e.addEventListener("offline", networkOff, false);
    document.body.classList.remove("black");
    if (window.electron) {
        document.body.classList.add("electron");
    }
    if (!(pageApp || window.electron)) {
        document.getElementById("fade-all").classList.add("white");
    }
    if (pageApp) {
        document.body.classList.add("v" + appVersion);
        document.body.classList.add("darkback");
    }
    if (!(!appBrowser || appBrowserDemo || appBrowserSchool)) {
        document.body.classList.add("appBrowser");
    }
    if (appBrowserDemo) {
        document.body.classList.add("appBrowserDemo");
    }
    if (appBrowserSchool) {
        document.body.classList.add("afs");
    }
    if (featureLocked) {
        document.body.classList.add("featureLocked");
    }
    if (hasHBI) {
        document.body.classList.add("hasHBI");
    }
    if (miniPlayer) {
        document.body.classList.add("miniPlayer");
    }
    if (window.cordova && isAndroid) {
        document.addEventListener("backbutton", function (e) {
            e.preventDefault();
            clickAndroidBackButton();
        }, false);
    }
    if (window.cordova && pageApp && !isIOSMac && !window.electron) {
        document.addEventListener("pause", appOnPause, false);
        document.addEventListener("resume", appOnResume, false);
    }
    if (window.cordova && pageApp && isAndroid) {
        window.addEventListener("native.keyboardshow", VKBopen);
        window.addEventListener("native.keyboardhide", VKBclose);
    }
    if (pageApp && !window.cordova) {
        window.electron;
    }
}
function checkHBI() {
    if (window.cordova) {
        var e = getComputedStyle(document.documentElement).getPropertyValue("--sab");
        if (e && e != "" && parseInt(e) > 0) {
            return true;
        }
    }
    return false;
}
function getListUUID() {
    var e;
    var o = [];
    o.push(machine.uuid);
    for (e in storage.getAllItem()) {
        if (e.indexOf("uuid-") != -1) {
            if (e.replace("uuid-", "") != "") {
                o.push(e.replace("uuid-", ""));
            } else {
                storage.removeItem(e);
            }
        }
    }
    return removeDupInArray(o, false);
}
function checkInBrowser() {
    return document.URL.indexOf("http://") > -1 || document.URL.indexOf("https://") > -1;
}
function checkInPWA() {
    return !(!window.navigator || window.navigator.standalone !== true) || !!window.matchMedia("(display-mode: standalone)").matches;
}
function checkMobile() {
    var e;
    return !(window.electron || isIOSMac || isiPad || (e = getViewport(), !(isiPod || isiPhone || e.h <= 500 && e.w <= 1000)));
}
function checkRetina() {
    var e;
    return !!window.matchMedia && ((e = window.matchMedia("only screen and (min--moz-device-pixel-ratio: 1.3), only screen and (-o-min-device-pixel-ratio: 2.6/2), only screen and (-webkit-min-device-pixel-ratio: 1.3), only screen  and (min-device-pixel-ratio: 1.3), only screen and (min-resolution: 1.3dppx)")) && e.matches || window.devicePixelRatio > 1);
}
function checkTouchDevice() {
    var e = false;
    try {
        document.createEvent("TouchEvent");
        e = true;
    } catch (e) { }
    if (window.hasOwnProperty("ontouchstart") || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0) {
        e = true;
    }
    return !!window.matchMedia("(pointer: coarse)").matches || e;
}
function checkMouseDevice() {
    return window.matchMedia("(hover: hover)").matches && window.matchMedia("(pointer: fine)").matches;
}
function getAppData() {
    return {
        build: build,
        machine: machine,
        user: user
    };
}
function checkAudioFormat(e) {
    e = e || "mp3";
    var o = document.createElement("audio");
    return !(!o.canPlayType || !o.canPlayType("audio/" + e + ";").replace(/no/, ""));
}
function checkSupported() {
    var e = window.hasOwnProperty("HTMLCanvasElement");
    var o = window.AudioContext || window.webkitAudioContext || false;
    var t = window.requestAnimationFrame || window.webkitRequestAnimationFrame || false;
    var n = typeof new XMLHttpRequest().responseType == "string";
    var i = !isnull(transitionEnd) && !isnull(animationEnd);
    window.AudioContext = o;
    window.requestAnimationFrame = t;
    if (e) {
        if (o) {
            if (n) {
                if (i) {
                    if (t) {
                        return "ok";
                    } else {
                        return "RAF";
                    }
                } else {
                    return "CSS3";
                }
            } else {
                return "XHR";
            }
        } else {
            return "Audio API";
        }
    } else {
        return "Canvas";
    }
}
function lockScreenEdges() {
    if (window.cordova && typeof ScreenEdgesPlugin == "object") {
        ScreenEdgesPlugin.setPreferredEdges(["top", "bottom"], function () { }, function (e) { });
    }
}
function unlockScreenEdges() {
    if (window.cordova && typeof ScreenEdgesPlugin == "object") {
        ScreenEdgesPlugin.setPreferredEdges([], function () { }, function (e) { });
    }
}
function converterCanRun() {
    var e = typeof window.Worker == "function";
    window.cordova;
    return e;
}
function setPointerEvent(e) {
    var o = window.hasOwnProperty("PointerEvent") ? "pointer" : window.hasOwnProperty("TouchEvent") ? "touch" : "mouse";
    e = e || o;
    o = {};
    if (e == "pointer") {
        o.down = "pointerdown";
        o.up = "pointerup";
        o.move = "pointermove";
        o.cancel = "pointercancel";
        o.leave = "pointerleave";
    } else if (e == "touch") {
        o.down = "touchstart";
        o.up = "touchend";
        o.move = "touchmove";
        o.cancel = "touchcancel";
        o.leave = "touchcancel";
    } else if (e == "mouse") {
        o.down = "mousedown";
        o.up = "mouseup";
        o.move = "mousemove";
        o.cancel = "mouseleave";
        o.leave = "mouseleave";
    }
    return o;
}
function initRightClick() {
    window.oncontextmenu = function () {
        return false;
    };
}
function networkOn() {
    hasNetwork = true;
    localMixObject.saveMixOffline();
}
function networkOff() {
    hasNetwork = false;
}
function networkState() {
    var e = false;
    if (navigator.onLine) {
        e = navigator.onLine;
    } else if (navigator.network && navigator.network.connection && navigator.network.connection.type) {
        e = !(navigator.network.connection.type == Connection.NONE);
    }
    return e;
}
function keepAppAwake() {
    if (window.plugins && window.plugins.insomnia && !isIOSMac) {
        window.plugins.insomnia.keepAwake(function () { }, function () { });
    }
}
function stopKeepingAppAwake() {
    if (window.plugins && window.plugins.insomnia && !isIOSMac) {
        window.plugins.insomnia.allowSleepAgain(function () { }, function () { });
    }
}
function getUserInfo() {
    return {
        guid: storage.getItem("user-guid") || "",
        djname: storage.getItem("user-djname") || "",
        lang: storage.getItem("user-lang") || ""
    };
}
function setUserInfo(e) {
    if (notnull(e.guid)) {
        e.guid = e.guid.length == 30 ? e.guid : "";
        user.guid = e.guid;
        storage.setItem("user-guid", user.guid, true);
    }
    if (notnull(e.djname)) {
        user.djname = e.djname;
        storage.setItem("user-djname", user.djname, true);
    }
    if (notnull(e.lang)) {
        user.lang = e.lang;
        storage.setItem("user-lang", user.lang, true);
    }
    user = getUserInfo();
}
function getDeviceInfo(e) {
    var o;
    var t;
    var n = (m = navigator.userAgent || navigator.vendor || window.opera).toLowerCase();
    var i = "(?)";
    if (/(fban|fbios|fbav|fbbv|fbid)/gi.test(n)) {
        i = "Facebook";
    } else if (/(twitter)/gi.test(n)) {
        i = "Twitter";
    }
    var a = "(?)";
    if (window.cordova && device) {
        a = device.platform;
    } else if (/(macintosh)/gi.test(n) && navigator.maxTouchPoints && navigator.maxTouchPoints > 2 || /(iphone|ipad|ipod)/gi.test(n)) {
        a = "iOS";
    } else if (/(mac os x)/gi.test(n)) {
        a = "Mac OS X";
    } else if (/(macppc|macintel|mac_powerpc|macintosh)/gi.test(n)) {
        a = "Mac OS";
    } else if (/(windows|win16)/gi.test(n)) {
        a = "Windows";
    } else if (/(android)/gi.test(n)) {
        a = "Android";
    }
    var s = "(?)";
    var r = n;
    if (window.cordova && device) {
        r = device.model;
    }
    if (/(windows phone|windows phone)/gi.test(r)) {
        s = "Windows phone";
    } else if (/(windows|win16)/gi.test(r)) {
        s = "PC";
    } else if (/(android)/gi.test(r)) {
        s = "Android";
    } else if (/(macintosh)/gi.test(r) && navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && window.screen.width == 1024 && window.screen.height == 1366) {
        s = "iPadPro";
    } else if (/(macintosh)/gi.test(r) && navigator.maxTouchPoints && navigator.maxTouchPoints > 2 || /(ipad)/gi.test(r)) {
        s = "iPad";
    } else if (/(iphone)/gi.test(r)) {
        s = "iPhone";
    } else if (/(ipod)/gi.test(r)) {
        s = "iPod";
    } else if (/(mac)/gi.test(r)) {
        s = "Mac";
    }
    if (window.cordova && device && appleModel[device.model] != null && /ipad pro/i.test(appleModel[device.model])) {
        r = "iPadPro";
    }
    r = "(?)";
    if (window.cordova && device) {
        r = device.model;
    } else if (window.navigator != null && navigator.platform != null) {
        r = navigator.platform;
    }
    var l = "(?)";
    if (window.cordova && device) {
        l = device.version;
    } else if (a == "Windows") {
        if (/(windows 10.0|windows nt 10.0)/gi.test(n)) {
            l = "10";
        } else if (/(windows 8.1|windows nt 6.3)/gi.test(n)) {
            l = "8.1";
        } else if (/(windows 8|windows nt 6.2)/gi.test(n)) {
            l = "8";
        } else if (/(windows 7|windows nt 6.1)/gi.test(n)) {
            l = "7";
        } else if (/(windows nt 6.0)/gi.test(n)) {
            l = "Vista";
        } else if (/(windows nt 5.2)/gi.test(n)) {
            l = "Server 2003";
        } else if (/(windows nt 5.1|windows xp)/gi.test(n)) {
            l = "XP";
        } else if (/(windows nt 5.0|windows 2000)/gi.test(n)) {
            l = "2000";
        } else if (/(win 9x 4.90|windows me)/gi.test(n)) {
            l = "ME";
        } else if (/(windows 98|win98)/gi.test(n)) {
            l = "98";
        } else if (/(windows 95|win95|windows_95)/gi.test(n)) {
            l = "95";
        } else if (/(windows nt 4.0|winnt4.0|winnt|windows nt)/gi.test(n)) {
            l = "NT 4.0";
        } else if (/(windows ce)/gi.test(n)) {
            l = "CE";
        } else if (/(win16)/gi.test(n)) {
            l = "3.11";
        }
    } else if (a == "Android") {
        u = "Android";
        p = m.toLowerCase().indexOf(u.toLowerCase());
        c = parseFloat(m.slice(p + u.length, p + u.length + 6));
        l = isNaN(c) ? l : c;
    } else if (a == "iOS") {
        u = "OS";
        p = m.toLowerCase().indexOf(u.toLowerCase());
        c = m.slice(p + u.length, p + u.length + 6);
        c = parseFloat(c.replace("_", "."));
        l = isNaN(c) ? l : c;
    } else if (a.indexOf("Mac OS") != -1) {
        u = a.indexOf("Mac OS X") != -1 ? "Mac OS X" : "Mac OS";
        p = m.toLowerCase().indexOf(u.toLowerCase());
        c = m.slice(p + u.length, p + u.length + 6);
        c = parseFloat(c.replace("_", "."));
        l = isNaN(c) ? l : c;
    }
    n = 0;
    if (a == "iOS") {
        if (window.cordova && device) {
            if (appleModel[device.model] != null && s == "iPhone") {
                n = appleModel[device.model].replace("iPhone", "").split(" ")[0];
                n = /SE/i.test(n) ? 7 : /X/i.test(n) ? 10 : parseInt(n);
            }
        } else if (s == "iPhone" && (p = window.screen.width, u = window.screen.height, p == 320 && u == 480 ? n = 4 : p == 320 && u == 568 ? n = 5 : p == 375 && u == 667 || p == 414 && u == 736 ? n = 6 : (p == 375 && u == 812 || p == 414 && u == 896) && (n = 10), window.devicePixelRatio == 3) && (p == 812 && u == 375 || u == 896 && p == 414)) {
            n = 10;
        }
    }
    var c = "";
    if (window.cordova && device) {
        c = build.os;
    } else if (/mac os/i.test(a)) {
        c = "osx";
    } else if (/windows/i.test(a)) {
        c = "win";
    } else if (/android/i.test(a)) {
        c = "and";
    } else if (/ios/i.test(a)) {
        c = "ios";
    }
    var u = navigator.appName;
    var p = "" + parseFloat(navigator.appVersion);
    var d = parseInt(navigator.appVersion, 10);
    if ((o = m.indexOf("OPR/")) != -1) {
        u = "Opera";
        p = m.substring(o + 4);
    } else if ((o = m.indexOf("Opera")) != -1) {
        u = "Opera";
        p = m.substring(o + 6);
        if ((o = m.indexOf("Version")) != -1) {
            p = m.substring(o + 8);
        }
    } else if ((o = m.indexOf("Edge")) != -1) {
        u = "Microsoft Edge";
        p = m.substring(o + 5);
    } else if ((o = m.indexOf("MSIE")) != -1) {
        u = "Microsoft Internet Explorer";
        p = m.substring(o + 5);
    } else if ((o = m.indexOf("Trident")) != -1) {
        u = "Microsoft Internet Explorer";
        if ((o = m.indexOf("rv:")) != -1) {
            p = m.substring(o + 3);
        }
    } else if ((o = m.indexOf("CriOS")) != -1 && /iphone|ipod|ipad/i.test(m)) {
        u = "Google Chrome for IOS";
        p = m.substring(o + 6);
    } else if ((o = m.indexOf("Chrome")) != -1) {
        u = "Google Chrome";
        p = m.substring(o + 7);
    } else if ((o = m.indexOf("Safari")) != -1) {
        u = "Safari";
        p = m.substring(o + 7);
        if ((o = m.indexOf("Version")) != -1) {
            p = m.substring(o + 8);
        }
    } else if ((o = m.indexOf("Firefox")) != -1) {
        u = "Mozilla Firefox";
        p = m.substring(o + 8);
    } else if ((t = m.lastIndexOf(" ") + 1) < (o = m.lastIndexOf("/")) && (u = m.substring(t, o), p = m.substring(o + 1), u.toLowerCase() == u.toUpperCase())) {
        u = navigator.appName;
    }
    if ((t = (p = (t = p.indexOf(";")) != -1 ? p.substring(0, t) : p).indexOf(" ")) != -1) {
        p = p.substring(0, t);
    }
    d = parseInt("" + p, 10);
    if (isNaN(d)) {
        p = "" + parseFloat(navigator.appVersion);
        d = parseInt(navigator.appVersion, 10);
    }
    var m = "";
    if (window.device && window.device.uuid) {
        m = device.uuid.toUpperCase();
    } else if (window.electron && window.electron.vars.uuid) {
        m = window.electron.vars.uuid;
    } else if (notnull(storage.getItem("tmp-uuid"))) {
        m = storage.getItem("tmp-uuid");
    } else {
        m = "tmp-" + uniqid("-").toUpperCase();
        storage.setItem("tmp-uuid", m);
    }
    var f = {
        osName: a,
        osTiny: c,
        osVersion: l.toString(),
        deviceModel: s,
        deviceName: r,
        deviceNumber: n,
        browserName: u,
        browserVersion: d,
        browserFullVersion: p,
        browserAppName: navigator.appName,
        browserUserAgent: navigator.userAgent,
        language: navigator.language || "",
        webviewEmbed: i,
        uuid: m
    };
    var v = 0;
    if (e === true) {
        for (v in f) {
            if (typeof f[v] == "string") {
                f[v] = f[v].toLowerCase();
            }
        }
    }
    if (window.device) {
        for (v in device);
    }
    for (v in f);
    return f;
}
window.devicePixelRatio = window.devicePixelRatio || 1;
var appleModel = {};
