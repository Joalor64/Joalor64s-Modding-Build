/*
 * utils.js
 * General engine helpers: arrays, xhr, file names (LD/HD), URLs, time formatting, strings,
 * CSS transition/animation helpers, iframe messaging.
 */

let specialEventNow;
let specialEventName;
function nada() { }
var preventActionUsed = false;
var preventActionDelay = 0.25;
function preventAction(e) {
    if (!preventActionUsed) {
        preventActionUsed = true;
        e();
        setTimeout(function () {
            preventActionUsed = false;
        }, preventActionDelay);
    }
}
function tryfunc(e) {
    if (notnull(e) && (typeof e).toLowerCase() === "function") {
        e();
    }
}
function inIframe() {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}
function callParentWindow(e, o) {
    if (isIframe) {
        if (notnull(window.top) && notnull(window.top.appEvent)) {
            window.top.appEvent(e, o);
        } else {
            setTimeout(function () {
                callParentWindow(e, o);
            }, 200);
        }
    }
}
function removeDupInArray(e, o) {
    var t;
    var n = [];
    for (t of e) {
        if (!existInArray(n, t, o)) {
            n.push(t);
        }
    }
    return n;
}
function uniqueBetweenArray(e, o, t) {
    var n;
    var i = [];
    for (n of e) {
        if (!existInArray(o, n, t)) {
            i.push(n);
        }
    }
    for (n of o) {
        if (!existInArray(e, n, t)) {
            i.push(n);
        }
    }
    return i;
}
function existInArray(e, o, t) {
    for (var n = !notnull(t) || t, i = false, a = 0, s = e.length; a < s; a++) {
        if (n) {
            if (e[a] === o) {
                i = true;
                break;
            }
        } else if (e[a].toLowerCase() === o.toLowerCase()) {
            i = true;
            break;
        }
    }
    return i;
}
function removeInArray(e, o) {
    for (var t = 0, n = o.length; t < n; t++) {
        if (o[t] === e) {
            o.splice(t, 1);
            break;
        }
    }
    return o;
}
function existInArrayFromProp(e, o, t) {
    for (var n = 0, i = t.length; n < i; n++) {
        if (t[n][o] === e) {
            return true;
        }
    }
    return false;
}
function numberArray(e) {
    for (var o = 0, t = e.length; o < t; o++) {
        e[o] = e[o] | 0;
    }
    return e;
}
function xhr(e, o, t, n, i) {
    $.ajax({
        type: e,
        url: o,
        crossdomain: true,
        data: t,
        success: function (e) {
            n(e, t);
        },
        error: i || function () { },
        dataType: "json"
    });
}
function convertToVolumePercentange(pct) {
    const v = pct / 100;
    return v > 1 ? 1 : (v < 0 ? 0 : v);
}
function renameFile(g) {
    if (!app.useModboxAnimeNaming) {
        if (animSize === 1) {
            if (isHDMode() && app?.format?.includes("hd")) {
                animSize = 2;
                return nameToHD(g);
            }
            animSize = 1;
            return g;
        } else {
            return nameToHD(g);
        }

    } else {
        if (isHDMode()) {
            animSize = 2;
            return g;
        } else {
            if (app?.format?.includes("ld")) {
                animSize = 1;
                return nameToLD(g);
            }
            animSize = 2;
            return g;
        }
    }
}
function nameToHD(e) {
    var o = e.substr(e.lastIndexOf("."));
    var base = e.substr(0, e.lastIndexOf("."));
    if (base.endsWith("-hd")) {
        return e;
    }
    return base + "-hd" + o;
}
function nameToLD(e) {
    var o = e.substr(e.lastIndexOf("."));
    var base = e.substr(0, e.lastIndexOf("."));
    if (base.endsWith("-ld")) {
        return e;
    }
    return base + "-ld" + o;
}
function cache(a) {
    if (uncache) {
        return a + "?" + new Date().getTime();
    } else {
        return a;
    }
}
function loadSnd(e, o, t, n) {
    var i = new XMLHttpRequest();
    i.open("GET", e, true);
    i.responseType = "arraybuffer";
    i.onload = function () {
        o.decodeAudioData(i.response, function (e) {
            t(e);
        }, function (e) {
            n();
        });
    };
    i.onerror = function () {
        n();
    };
    i.send();
}
function gotoAppUrl(e, s) {
    e = isnull(e) ? appBrowser ? "" : "index.html" + (s ? "?skipintro=1" : "") : e;
    window.location.href = e;
}
function reloadPage() {
    (appBrowser ? window.top : window).location.reload();
}
function openURL(e, o) {
    var t = isIframe ? window.top : window;
    o = isnull(o) ? "_blank" : o;
    o = appBrowserDemo && isIOS ? "_self" : o;
    if (window.electron) {
        electron.ipc.openURL(e);
    } else if (window.cordova) {
        cordova.InAppBrowser.open(e, "_system", "hidden=yes,location=no");
    } else {
        t.open(e, o);
    }
}
function redirectTo(e) {
    const urlMap = {
        facebook: "https://www.facebook.com/incredibox",
        twitter: "https://twitter.com/incredibox_",
        instagram: "https://www.instagram.com/incredibox.official/",
        youtube: "https://www.youtube.com/incredibox/",
        spotify: "https://open.spotify.com/artist/0Io8DfxzVXhbhm22RCQy0F",
        tumblr: "https://incredibox.tumblr.com/",
        tiktok: "https://www.tiktok.com/@incredibox",
        modio: "https://mod.io/g/incredibox/",
        modder: "https://www.incredibox.com/mod/",
        faq: "https://www.incredibox.com/info/faq",
        privacy: "https://www.incredibox.com/info/privacy",
        shop: "https://incredibox.threadless.com/",
        merch: "https://incredibox.bandcamp.com/merch",
        store: "https://incredibox.com/info/store",
        playstore: "https://play.google.com/store/apps/details?id=com.sofarsogood.incredibox",
        appstore: "https://apps.apple.com/app/incredibox/id1093131935",
    };
    const o = urlMap[e] || e;
    openURL(o);
}
function windowPopup(e, o, t, n) {
    var i = n ? screen.height / 2 - t / 2 : 0;
    n = n ? screen.width / 2 - o / 2 : 0;
    window.open(e, "", "menubar=no,toolbar=no,resizable=yes,scrollbars=yes,width=" + o + ",height=" + t + ",top=" + i + ",left=" + n);
}
function getParameterByName(e) {
    var o = {};
    window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (e, t, n) {
        o[t] = n;
    });
    var t = null;
    if (e in o) {
        return o[e];
    } else {
        return t;
    }
}
function getPageNameGA() {
    if (window.location.href.indexOf("app.html") != -1) {
        return "app.html?v=" + getParameterByName("v");
    } else {
        return "index.html";
    }
}
function secToText(e) {
    var o = parseInt(e / 1000 % 60);
    var t = parseInt(e / 60000 % 60);
    parseInt(e / 3600000 % 24);
    return (t < 10 ? "0" + t : t) + ":" + (o < 10 ? "0" + o : o);
}
function getTime() {
    return new Date().getTime();
}
function getTimeAgo(e, o) {
    e = e.indexOf("/") == -1 ? e.split("-").join("/") : e;
    o = o.indexOf("/") == -1 ? o.split("-").join("/") : o;
    var t = new Date(e);
    if ((o = timeConversion(new Date(o).getTime() - t.getTime())) === false) {
        return getStringDate(e);
    } else {
        return o;
    }
}
function timeConversion(e) {
    var o = (e / 1000).toFixed(1);
    var t = (e / 60000).toFixed(1);
    var n = (e / 3600000).toFixed(1);
    e = (e / 86400000).toFixed(1);
    var i = "";
    if (o < 60) {
        i = (o = Math.round(o)).toString() + " " + (o < 2 && notnull(STR("txt.time.tSec.one")) ? STR("txt.time.tSec.one") : STR("txt.time.tSec.other"));
    } else if (t < 60) {
        i = (o = Math.round(t)).toString() + " " + (o < 2 && notnull(STR("txt.time.tMin.one")) ? STR("txt.time.tMin.one") : STR("txt.time.tMin.other"));
    } else if (n < 23) {
        i = (t = Math.round(n)).toString() + " " + (t < 2 && notnull(STR("txt.time.tHou.one")) ? STR("txt.time.tHou.one") : STR("txt.time.tHou.other"));
    } else {
        if (!(e < 10)) {
            return false;
        }
        i = (o = Math.round(e)).toString() + " " + (o < 2 && notnull(STR("txt.time.tDay.one")) ? STR("txt.time.tDay.one") : STR("txt.time.tDay.other"));
    }
    return STR("txt.ago").split("%{date_time}").join(i);
}
function getDateNow() {
    var e = (a = new Date()).getDate();
    var o = a.getMonth() + 1;
    var t = a.getFullYear();
    var n = a.getHours();
    var i = a.getMinutes();
    var a = a.getSeconds();
    e = String(e < 10 ? "0" + e : e);
    o = String(o < 10 ? "0" + o : o);
    n = String(n < 10 ? "0" + n : n);
    i = String(i < 10 ? "0" + i : i);
    a = String(a < 10 ? "0" + a : a);
    return String(t + "-" + o + "-" + e + " " + n + ":" + i + ":" + a);
}
function jsonDecode(e) {
    if (isnull(e)) {
        return null;
    } else {
        e = e.split("\t").join("").split("\n").join("");
        return JSON.parse(e);
    }
}
function jsonEncode(e) {
    if (isnull(e)) {
        return null;
    } else {
        return JSON.stringify(e);
    }
}
function random(e) {
    return Math.round(Math.random() * e);
}
function randomRangeInt(e, o) {
    e = Math.ceil(e);
    o = Math.floor(o);
    return Math.floor(Math.random() * (o - e + 1)) + e;
}
function decimal(e, o) {
    o = isnull(o) ? 2 : o;
    o = Math.pow(10, o);
    return Math.round(e * o) / o;
}
function numberSpaced(e) {
    var o;
    if (e) {
        e = e.toString();
        o = e.indexOf(".");
        return e.replace(/\d(?=(?:\d{3})+(?:\.|$))/g, function (e, t) {
            if (o < 0 || t < o) {
                return e + " ";
            } else {
                return e;
            }
        });
    } else {
        return 0;
    }
}
function trim(e) {
    if (isnull(e)) {
        return "";
    } else {
        return (e = (e = (e = e.split("\t").join("")).split("\n").join("")).split("\r").join("")).replace(/^\s+|\s+$|\s+(?=\s)/g, "");
    }
}
function cleanInputText(e) {
    return (e = trim(e = ucwords(e))).replace(regexList.max3letters, "");
}
function slugify(e) {
    return e.toString().toLowerCase().replace(/\s+/g, "-").replace(/&/g, "-and-").replace(/[^\w\-]+/g, "").replace(/\-\-+/g, "-").replace(/^-+/, "");
}
function ucwords(e) {
    return (e = e.toLowerCase()).charAt(0).toUpperCase() + e.slice(1);
}
function uniqid(e) {
    function o() {
        return Math.floor((1 + Math.random()) * 65536).toString(16).substring(1);
    }
    e = e || "";
    return o() + e + o() + e + o() + e + o() + e + o();
}
function uniqid30() {
    function e() {
        return Math.floor((1 + Math.random()) * 65536).toString(16);
    }
    return e() + e() + e() + e() + e() + e();
}
function getUniqLink(e) {
    e = notnull(e) ? e.app : app.version;
    return uniqid() + "-v" + e;
}
function isnull(e) {
    return e == null || e === "undefined";
}
function notnull(e) {
    return e != null && e !== "undefined";
}
function copyToClipboard(e) {
    var o = document.createElement("textarea");
    o.value = e;
    o.setAttribute("readonly", "");
    o.style = {
        position: "absolute",
        visibility: "hidden",
        pointerEvents: "none"
    };
    document.body.appendChild(o);
    o.select();
    document.execCommand("copy");
    document.body.removeChild(o);
}
function resetAnimationCSS(e) {
    e.style.animation = "none";
    e.offsetHeight;
    e.style.animation = null;
}
function transitionEndEventName() {
    var e;
    var o = document.createElement("div");
    var t = {
        transition: "transitionend",
        OTransition: "oTransitionEnd",
        MozTransition: "transitionend",
        WebkitTransition: "webkitTransitionEnd"
    };
    for (e in t) {
        if (t.hasOwnProperty(e) && o.style[e] !== undefined) {
            return t[e];
        }
    }
    return null;
}
function animationEndEventName() {
    var e;
    var o = document.createElement("div");
    var t = {
        animation: "animationend",
        OAnimation: "oanimationend",
        MozAnimation: "animationend",
        WebkitAnimation: "webkitAnimationEnd"
    };
    for (e in t) {
        if (t.hasOwnProperty(e) && o.style[e] !== undefined) {
            return t[e];
        }
    }
    return null;
}
function addTransition(e, o, t, n, i) {
    i = !!notnull(i) && i;
    e.off(transitionEnd).addClass(o).on(transitionEnd, {
        div: e,
        prop: t,
        func: n,
        log: i
    }, transitionComplete);
}
function removeTransition(e, o, t, n, i) {
    i = !!notnull(i) && i;
    e.off(transitionEnd).removeClass(o).on(transitionEnd, {
        div: e,
        prop: t,
        func: n,
        log: i
    }, transitionComplete);
}
function transitionComplete(e) {
    if (notnull(e.data) && notnull(e.data.func) && e.originalEvent.propertyName.replace("-webkit-", "") == e.data.prop && e.data.div.attr("id") == e.target.id) {
        notnull(e.data.log);
        e.data.div.off(transitionEnd);
        e.data.func();
    }
}
function stopProp(e) {
    if (notnull(e)) {
        e.stopPropagation();
    }
}
String.prototype.replaceAt = function (e, o) {
    return this.substr(0, e) + o + this.substr(e + o.length);
};
