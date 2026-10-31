/*
 * mixlist.js
 * The playlist popup (My mix / My fav / achievements tabs) and the list of saved mixes.
 */

var $activeTab;
var $activeFilter;
var $activePage;
var $scrollbox;
var $boxline;
var $boxinfo;

var mixToWatch = null;
var mixToShare = null;
var XHRmemotime = {};
var $lineOpened = null;
var scrollPosY = 0;
var lineClicked = null;
var showLastMix = false;
var mixDB = {
    totalNbMix: 0
};

function initMixlist() {
    $poplist = $mixlist.find("#poplist");
    $mixlist.$bck = $mixlist.find(".bac");
    $mixlist.$bck.fadeIn = function () {
        this.addClass("animateFadeIn");
    };
    $mixlist.$bck.fadeOut = function () {
        this.addClass("animateFadeOut").one(animationEnd, function (e) {
            $(e.target).removeClass("animateFadeIn animateFadeOut");
        });
    };
    $scrollbox = $poplist.find("#scrollbox");
    $boxinfo = $scrollbox.find(".boxinfo");
    $boxline = $scrollbox.find(".boxline");
    $tabMixlist = $("#tab-mixlist");
    $mixlist.find(".tabbox .tab").on(pointerEventType.down, clickBtTab);
    $mixlist.find(".pagebox .tab-filter .bt").on(pointerEventType.down, clickBtFilter);
}
function openPlaylist(g, h, i) {
    lock();
    showLastMix = i === true;
    $mixlist.addClass("show");
    $mixlist.$bck.fadeIn();
    if (h) {
        enableMixlist();
    } else {
        $poplist.addClass("open").one(animationEnd, enableMixlist);
    }
    if (g == "mixlist" || !hasNetwork || true) {
        delete XHRmemotime.mymix;
        activeBtTab("mixlist");
    }
}
function enableMixlist() {
    unlock();
    $homeBtList.removeSpinner();
    $poplist.addClass("opened");
    $mixlist.$bck.on(pointerEventType.down, closePlaylist);
}
function closePlaylist() {
    focusHistory = [];
    deleteFocus();
    lock();
    $mixlist.$bck.off();
    $mixlist.$bck.fadeOut();
    $poplist.removeClass("opened").addClass("close").one(animationEnd, hideMixlist);
}
function hideMixlist() {
    closeActionLine($lineOpened);
    $poplist.removeClass("open close");
    $mixlist.removeClass("show");
    $(".tab", $poplist).removeClass("active");
    $activeFilter = $activePage = $activeTab = null;
    blurAll();
    unlock();
    createFocus("home");
}
function cleanScrollbox() {
    if ($boxline) {
        $scrollbox.scrollTop(0);
        closeActionLine($lineOpened);
        unbindAllLine();
        $boxline.empty();
        $boxinfo.empty();
    }
}
function bindAllLine() {
    $boxline.find(".line").on(pointerEventType.down, clickLineStart);
    $boxline.find(".line").on(pointerEventType.up, clickLineEnd);
    $boxline.find(".box-action").on(pointerEventType.down, stopProp);
    $boxline.find(".box-action").on(pointerEventType.up, stopProp);
    $boxline.find(".bt.watch").on(pointerEventType.down, clickBtWatch);
    $boxline.find(".bt.fav").on(pointerEventType.down, clickBtFav);
    $boxline.find(".bt.delete").on(pointerEventType.down, clickBtDelete);
    $boxline.find(".bt.download").on(pointerEventType.down, clickBtDownload);
}
function unbindAllLine() {
    $boxline.find(".line").off();
    $boxline.find(".line .box-action").off();
    $boxline.find(".line .box-action .bt").off();
}
function unbindLine(e) {
    e.off();
    e.find(".box-action").off();
    e.find(".box-action .bt").off();
}
function clickLineStart(e) {
    var o = $(e.currentTarget).parent().parent();
    scrollPosY = o.scrollTop();
    lineClicked = $(e.currentTarget);
}
function clickLineEnd(e) {
    if (lineClicked && $(e.currentTarget).parent().parent().scrollTop() == scrollPosY && lineClicked.attr("data-key") == $(e.currentTarget).attr("data-key")) {
        openActionLine(e.currentTarget);
    }
    lineClicked = null;
}
function clickBtTab() {
    blurAll();
    if ($(this).hasClass("active")) {
        $scrollbox.scrollTop(0);
    } else {
        activeBtTab($(this).attr("id").replace("tab-", ""));
    }
}
function activeBtTab(e) {
    blurAll();
    $scrollbox.find(".spinner-box").removeClass("spin");
    $scrollbox.find(".spinner-box").hide();
    $boxinfo.empty();
    $poplist.find(".tabbox .tab").removeClass("active");
    ($activeTab = $poplist.find(".tabbox .tab#tab-" + e)).addClass("active");
    cleanScrollbox();
    $poplist.find(".pagebox").removeClass("show");
    ($activePage = $poplist.find(".pagebox#box-" + e)).addClass("show");
    if (e == "mixlist") {
        activeFilter("mymix");
    }
}
function clickBtFilter() {
    blurAll();
    if ($(this).hasClass("active")) {
        $scrollbox.scrollTop(0);
    } else {
        activeFilter($(this).attr("id").replace("bt-", ""));
    }
}
function activeFilter(e) {
    blurAll();
    $poplist.find(".tab-filter .bt").removeClass("active");
    ($activeFilter = $poplist.find(".tab-filter .bt#bt-" + e)).addClass("active");
    if (["mymix", "myfav"].includes(e)) {
        cleanScrollbox();
        loadMixlist();
    }
}
function getActiveTabString() {
    if ($activeTab && $activeTab.length) {
        return $activeTab.attr("id").replace("tab-", "");
    } else {
        return "";
    }
}
function getActiveFilterString() {
    if ($activePage.find(".tab-filter").length && $activeFilter && $activeFilter.length) {
        return $activeFilter.attr("id").replace("bt-", "");
    } else {
        return "";
    }
}
function openActionLine(e) {
    e = $(e);
    var o = $lineOpened !== null ? $lineOpened.index() : -1;
    toggleAcionLine($lineOpened);
    if (o != e.index()) {
        toggleAcionLine(e);
    }
}
function toggleAcionLine(e) {
    if (e !== null) {
        if (e.hasClass("animateOpen")) {
            e.removeClass("animateOpen").addClass("animateClose").one(animationEnd, function () {
                e.removeClass("animateClose");
            });
            $lineOpened = null;
            removeInFocusHistory("playlist-line-open");
            createFocus("playlist-all", e);
        } else {
            e.removeClass("animateClose").addClass("animateOpen");
            $lineOpened = e;
            createFocus("playlist-line-open");
        }
    }
}
function closeActionLine(e) {
    if (e !== null) {
        e.removeClass("animateOpen").removeClass("animateClose");
        $lineOpened = null;
    }
}
function showSpin(e) {
    e.addClass("spin");
    e.find("svg use").attr("xlink:href", "#ic-loader-mini");
    $scrollbox.find(".spinner-box").addClass("spin");
    $scrollbox.find(".spinner-box").show();
}
function hideSpin(e, o) {
    e.removeClass("spin");
    e.find("svg use").attr("xlink:href", o);
    $scrollbox.find(".spinner-box").removeClass("spin");
    $scrollbox.find(".spinner-box").hide();
}
function clickBtFav(e) {
    e.stopPropagation();
    var o = (t = (e = $(this).parent().parent()).attr("data-key")).replace("mix-", "");
    var t = t.replace("mix-", "fav-");
    if (notnull(o = searchMixInCurrentList(o))) {
        if (isMixInFav(o)) {
            e.removeClass("isfavoris");
            localMixObject.deleteMix(t);
            if (getActiveFilterString() == "myfav") {
                unbindLine(e);
                closeActionLine(e);
                e.remove();
                createFocus("playlist-all");
            }
        } else {
            e.addClass("isfavoris");
            localMixObject.saveMix(o, true);
            $tabMixlist.find("svg use").attr("xlink:href", "#ic-rate-mini");
            $tabMixlist.removeClass("animateFavIcon").addClass("animateFavIcon").one(animationEnd, function () {
                $tabMixlist.find("svg use").attr("xlink:href", "#ic-mixlist-mini");
                $tabMixlist.removeClass("animateFavIcon");
            });
        }
    } else {
        popupGeneralError({
            error: STR("pop.notFoundTitle")
        });
    }
}
function clickBtDelete(e) {
    e.stopPropagation();
    var o = $(this);
    var t = o.parent().parent();
    var n = searchMixInCurrentList(t.attr("data-key").replace("mix-", ""));
    Spinner.add(o);
    if (!n.online || hasNetwork) {
        boxDialog.open(STR("pop.deleteText"), STR("pop.deleteTitle"), [STR("bt.yes"), STR("bt.no")], [function () {
            deleteMixConfirm(o, t, n);
        }, function () {
            unlock();
            Spinner.reset();
        }]);
    } else {
        boxDialog.open(STR("pop.noNetworkText"), STR("pop.noNetworkTitle"), [STR("bt.ok")], [function () {
            unlock();
            Spinner.reset();
        }]);
    }
}
function deleteMixConfirm(e, o, t) {
    if (localMixObject.deleteMix("mix-" + t.link)) {
        localMixObject.deleteMix("fav-" + t.link);
        unbindLine(o);
        closeActionLine(o);
        o.remove();
        if ((o = localMixObject.getMixlist().length) <= 5) {
            $scrollbox.scrollTop(0);
        }
        if (o == 0) {
            $boxinfo.html(STR("txt.mixlistEmpty"));
        }
        unlock();
        createFocus("playlist-all");
    } else {
        boxDialog.open(STR("pop.deleteBugText"), STR("pop.notFoundTitle"), [STR("bt.ok")], [function () {
            unlock();
        }]);
    }
    Spinner.reset();
    if (t.online) {
        $.ajax({
            type: "POST",
            url: domainOnline + "ph3/delete-mix-db.php",
            data: {
                uuid: getListUUID(),
                mix: t
            },
            dataType: "json",
            crossdomain: true,
            success: function (e) { },
            error: function (e) { }
        });
    }
}
function clickBtDownload(e) {
    e.stopPropagation();
    var o = (e = $(this)).parent().parent().attr("data-key").replace("mix-", "");
    if (notnull(mixToShare = searchMixInCurrentList(o))) {
        if (converterCanRun()) {
            popupConvertMix();
        } else {
            checkIfMixSavedThenShare("download", e);
        }
    } else {
        boxDialog.open(STR("pop.notFoundText"), STR("pop.notFoundTitle"), [STR("bt.ok")], [function () {
            Spinner.reset();
        }]);
    }
}
var controlTimeout;
function loadMixlist() {
    if (localMixObject.getMixlist().length || localMixObject.getFavlist().length) {
        fillMixlist();
    } else {
        $boxinfo.html(STR("txt.mixlistEmpty"));
    }
}
function fillMixlist() {
    var h;
    var i;
    var j;
    var k;
    if ($mixlist.isOpen() && $tabMixlist.hasClass("active")) {
        j = [];
        if ((h = $activePage.find(".tab-filter").length && $activeFilter && $activeFilter.length ? $activeFilter.attr("id").replace("bt-", "") : "") == "mymix") {
            if ((k = localMixObject.getMixlist()).length && (j = generateHtml(k, generateLineMix, "mymix"), $boxline.html(j[0]), hasNetwork ? $boxinfo.html(STR("txt.mixlistInfo").replace("%{date_time}", 2)) : $boxinfo.html(STR("txt.mixlistNoCo")), minuteMoreThan(2, false, "mymix") && localMixObject.getStatMixOnline(), showLastMix)) {
                if (window.initFlags) window.initFlags();
                showLastMix = false;
                (i = $boxline.find(".line").first()).addClass("bckFlash").one(animationEnd, function () {
                    i.removeClass("bckFlash");
                });
            } else {
                if (window.initFlags) window.initFlags();
            }
        } else if (h == "myfav" && (k = localMixObject.getFavlist()).length && (j = generateHtml(k, generateLineMix, "myfav"), $boxline.html(j[0]), $boxinfo.empty(), minuteMoreThan(2, false, "myfav"))) {
            if (window.initFlags) window.initFlags();
            localMixObject.getStatFavOnline();
        }
        bindAllLine();
        createFocus("playlist-all");
    }
}

function generateHtml(e, o, t) {
    for (var n = "", i = [], a = 0, s = e.length; a < s; a++) {
        var r = e[a];
        i.push(r);
        n += o(r, a, t);
    }
    return [n, i];
}
function getAutoCountry() {
    try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const tzMap = {
            "London": "GB", "Manchester": "GB",
            "Paris": "FR", "Lyon": "FR", "Marseille": "FR",
            "Berlin": "DE", "Munich": "DE", "Frankfurt": "DE",
            "Rome": "IT", "Milan": "IT",
            "Madrid": "ES", "Barcelona": "ES",
            "New_York": "US", "Chicago": "US", "Los_Angeles": "US", "Denver": "US", "Phoenix": "US",
            "Toronto": "CA", "Vancouver": "CA", "Montreal": "CA",
            "Tokyo": "JP", "Osaka": "JP",
            "Seoul": "KR",
            "Shanghai": "CN", "Beijing": "CN",
            "Sao_Paulo": "BR", "Rio_de_Janeiro": "BR",
            "Mexico_City": "MX",
            "Sydney": "AU", "Melbourne": "AU", "Perth": "AU",
            "Moscow": "RU", "Kyiv": "UA",
            "Istanbul": "TR",
            "Brussels": "BE", "Amsterdam": "NL", "Stockholm": "SE", "Oslo": "NO"
        };

        const city = tz ? tz.split('/')[1] : null;

        if (city && tzMap[city]) {
            console.log("Auto-Flag: Detected via Timezone (" + city + ") -> " + tzMap[city]);
            return tzMap[city];
        }

        const lang = navigator.language || "";
        if (lang.includes('-')) {
            const langCode = lang.split('-')[1].toUpperCase();
            console.log("Auto-Flag: Detected via Language (" + lang + ") -> " + langCode);
            return langCode;
        }

        console.log("Auto-Flag: No specific detection found. Using Fallback -> NULL");
    } catch (e) {
        console.warn("Auto-Flag: Detection error, defaulting to NULL", e);
    }

    return "NULL";
}
function generateLineMix(e, o, t) {
    e = e || {};
    o = o + 1 || 0;
    var i = t === "search";
    var a = t === "search";
    var s = t === "mymix" && !e.online;
    var r = e.private == "1";
    var l = t === "mymix";
    var c = t === "mymix";
    var u = trustAppMobile;
    t = t === "myfav" || isMixInFav(e);
    var m = sameMixInLocal(e);
    var f = notnull(e.datedb) ? e.datedb : getDateNow();
    var v = "line";
    v = "<div data-key='mix-" + e.link + "' class='" + v + (s ? " isoffline" : "") + (r ? " isprivate" : "") + (t ? " isfavoris" : "") + (m ? " ismymix" : "") + "'>";
    return (v += "<div class='mixbanner box-info'>") + "<div class='info'><span class='title'>" + e.title + "</span><div class='dj'>" + (s ? "<div class='box-flag'><div class='fflag fflag-" + (e.country || getAutoCountry()).toUpperCase() + "'></div></div>" : "") + "<span class='name'>" + e.name + "</span></div></div><div class='data'><div class='stat'><div class='boxstat myfav'><div class='bck'><svg class='icn-svg'><use xlink:href='#ic-rate-mini'></use></svg></div></div><div class='boxstat offline'><div class='txt'>" + STR("extra.txt.modMix") + "</div></div><div class='boxstat liked'><div class='txt'>" + numberSpaced(e.nblike) + "</div><div class='bck'><svg class='icn-svg'><use xlink:href='#ic-like-mini'></use></svg></div></div><div class='boxstat viewed'><div class='txt'>" + numberSpaced(e.nbview) + "</div><div class='bck'><svg class='icn-svg'><use xlink:href='#ic-view-mini'></use></svg></div></div></div><span class='date' data-date='" + f + "'>" + (a ? getTimeAgo(f, e.dateQuery) : getStringDate(f)) + "</span></div></div><div class='box-action'><div class='bt bt-round bt-big watch color-green'><div class='bck'><svg class='icn-svg'><use xlink:href='#ic-eye'></use></svg></div><div class='hitzone'></div></div>" + (u ? "<div class='bt bt-round bt-big link color'><div class='bck'><svg class='icn-svg'><use xlink:href='#ic-link'></use></svg></div><div class='hitzone'></div></div>" : "") + "<div class='bt bt-round bt-big fav'><div class='bck'><svg class='icn-svg'><use xlink:href='#ic-rate'></use></svg></div><div class='hitzone'></div></div>" + (c ? "<div class='bt bt-round bt-big download'><div class='bck'><svg class='icn-svg'><use xlink:href='#ic-download'></use></svg></div><div class='hitzone'></div></div>" : "") + (l ? "<div class='bt bt-round bt-big delete color-red'><div class='bck'><svg class='icn-svg'><use xlink:href='#ic-trash'></use></svg></div><div class='hitzone'></div></div>" : "") + "</div></div>";
}
function sameMixInLocal(e) {
    return checkMixInArray(e.id, localMixObject.getMixlist());
}
function isMixInFav(e) {
    return existInArrayFromProp(e.link, "link", localMixObject.getFavlist());
}
function checkMixInArray(e, o, t) {
    t = t || "id";
    for (var n in o) {
        if (e == o[n][t]) {
            return true;
        }
    }
    return false;
}
function getMixInArray(e, o, t) {
    t = t || "id";
    for (var n in o) {
        if (e == o[n][t]) {
            return o[n];
        }
    }
}
function searchMixInCurrentList(e) {
    var o;
    var t = getActiveTabString();
    var n = getActiveFilterString();
    var i = e.replace("mix-", "");
    switch (t) {
        case "mixlist":
            switch (n) {
                case "mymix":
                    o = getMixInArray(i, localMixObject.getMixlist(), "link");
                    break;
                case "myfav":
                    o = getMixInArray(i, localMixObject.getFavlist(), "link");
            }
            break;
    }
    return o;
}
function minuteMoreThan(e, o, t) {
    var n;
    if (isnull(XHRmemotime[t])) {
        return !o || e;
    } else {
        e *= 60;
        n = new Date();
        t = XHRmemotime[t].getTime() - n.getTime();
        n = Math.round(Math.abs(t / 1000));
        if (o === true) {
            return secToText((e - n) * 1000);
        } else {
            return e <= n;
        }
    }
}
function startRandomMode() {
    modeRandom = true;
    $body.addClass("mode-random");
    lock();
    closeTool();
    hideDiv($boxBtBonus);
    hideDiv($boxPicto, true);
    hideDiv($boxLoaderPolo, true);
    $btTool.off().on(pointerEventType.down, function (e) {
        e.preventDefault();
        preventAction(stopRandomMode);
    });
    $btTool.bounce();
    $btTool.$svg.attr("xlink:href", "#ic-random");
    $bckGlobal.addClass("fadeIn");
    $boxStage.addClass("pointerlock");
    TweenMax.delayedCall(0.4, lancerRandomMode);
}
