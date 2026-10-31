/*
 * i18n.js
 * Languages: loads lang/<code>.json, fills the translated texts in the page, STR("key.path").
 */

function initLanguage() {
    var e;
    currentLanguage = defaultLanguage = "en-US";
    var o = "";
    if (languageListe && Object.keys(languageListe).length < 2) {
        document.getElementById("tab-language").remove();
        console.log("Only one language available, hiding language tab.");
    } else {
        for (e in languageListe) {
            o += "<div class=\"bt bt-soft\" id=\"bt-lang-" + e + "\"><div class=\"bck\"><div class=\"txt\">" + languageListe[e] + "</div></div><div class=\"hitzone\"></div></div>";
        }
        $("#pop-language .box-lang").append(o);
    }
}
function checkLanguageCode(e) {
    var o = e.toLowerCase();
    if (o.indexOf("en-") > -1) {
        return "en-US";
    } else if (o.indexOf("pt-") > -1) {
        return "pt-BR";
    } else if (o.indexOf("fr-") > -1) {
        return "fr";
    } else if (o.indexOf("es-") > -1) {
        return "es";
    } else if (o.indexOf("it-") > -1) {
        return "it";
    } else if (o.indexOf("de-") > -1) {
        return "de";
    } else if (o.indexOf("cn") > -1) {
        return "zh-CN";
    } else if (o == "zh-hant" || o == "zh-hk" || o == "zh-tw") {
        return "zh-TW";
    } else if (o == "zh-hans" || o == "zh-cn") {
        return "zh-CN";
    } else if (o == "en") {
        return "en-US";
    } else if (o == "pt") {
        return "pt-BR";
    } else if (o == "zh") {
        return "zh-CN";
    } else if (o == "hi") {
        return "hi-IN";
    } else if (o == "bn") {
        return "bn-IN";
    } else if (o == "ta") {
        return "ta-IN";
    } else if (o == "te") {
        return "te-IN";
    } else if (o == "nb" || o == "nn") {
        return "no";
    } else {
        return e;
    }
}

function changeDomTxt() {
    var e;
    var o = translateObj.trad;
    $("#pop-info .tab#tab-tuto .txt").html(o.bt.tuto);
    $("#pop-info #bloc-tuto1 .txt span").html(o.txt.tuto1);
    $("#pop-info #bloc-tuto2 .txt span").html(o.txt.tuto2);
    $("#pop-info #bloc-tuto3 .txt span").html(o.txt.tuto3);
    $("#pop-info #bloc-tuto4 .txt span").html(o.txt.tuto4);
    $("#pop-info #bloc-tuto5 .txt span").html(o.txt.tuto5);
    $("#pop-info .tab#tab-credit .txt").html(o.bt.credit);
    $("#pop-info .tab#tab-follow .txt").html(o.bt.links);
    $("#pop-info .tab#tab-merch .txt").html(o.bt.merch);
    $("#pop-info .tab#tab-modhistory .txt").html(o.extra.bt.modLib);
    $("#pop-info #pop-merch #shop-apparel .bt .txt").html(o.bt.apparel);
    $("#pop-info #pop-merch #shop-album .bt .txt").html(o.bt.cdvinyl);
    $("#pop-info #pop-merch .title#shop").html(o.txt.visitShop);
    $("#pop-info #pop-modhistory .title").html(o.extra.txt.modLibTitle);
    $("#pop-info #pop-modhistory .mods-buttons-warper #bt-playedmods .txt").html(o.extra.bt.playedMods);
    $("#pop-info #pop-credit #copy").html(o.txt.copyright.replace("%{year}", new Date().getFullYear()));
    var a8 = o.txt.team.split("<br>");
    $("#pop-info #pop-credit #team-faces .face:eq(0) .text").html("Allan<br><span>" + a8[0] + "</span>");
    $("#pop-info #pop-credit #team-faces .face:eq(1) .text").html("Romain<br><span>" + a8[1] + "</span>");
    $("#pop-info #pop-credit #team-faces .face:eq(2) .text").html("Paul<br><span>" + a8[2] + "</span>");
    $("#pop-info #pop-credit .title").html(o.txt.stayTuned);
    $("#pop-info #pop-follow #bt-feedback .txt").html(o.bt.feedback);
    $("#pop-info #pop-follow #bt-rating .txt").html(o.bt.rate);
    $("#pop-info #pop-follow #bt-privacy .txt").html(o.bt.privacy);
    $("#pop-info #pop-follow #bt-faq .txt").html(o.bt.faq);
    $("#pop-info #pop-follow #bt-modders .txt").html(o.extra.bt.modders);
    $("#pop-info #pop-follow .title#git").html(o.bt.git);
    $("#pop-param .tab#tab-language .txt").html(o.txt.language);
    $("#pop-param .tab#tab-setting .txt").html(o.bt.param);
    $("#pop-param .tab#tab-advsetting .txt").html(o.extra.bt.paramAdv);
    $("#pop-param #pop-setting #param-dark .label").html(o.txt.modeDark);
    $("#pop-param #pop-setting #param-hd .label").html(o.extra.txt.modeHD);
    $("#pop-param #pop-setting #param-reset-achi .label").html(o.extra.txt.paramResetAchi);
    $("#pop-param #pop-setting #param-reset-all .label").html(o.extra.txt.paramResetAll);
    $("#pop-param #pop-setting #param-reset .label").html(o.txt.resetBonus);
    $("#pop-param #pop-setting #param-reset .bt .txt").html(o.bt.reset);
    $("#pop-param #pop-setting #param-reset-achi .bt .txt").html(o.bt.reset);
    $("#pop-param #pop-setting #param-reset-all .bt .txt").html(o.bt.reset);
    $("#pop-param #pop-advsetting #param-bgchanges .label").html(o.extra.txt.paramBGOrFade);
    $("#pop-param #pop-advsetting #param-disableshake .label").html(o.extra.txt.paramShake);
    $("#pop-param #pop-advsetting #param-disablelyrics .label").html(o.extra.txt.paramLyrics);
    $("#pop-param #pop-advsetting #param-displaymodsounds .label").html(o.extra.txt.paramSFX);
    $("#pop-param #pop-advsetting #param-particleseffect .label").html(o.extra.txt.paramParticles);
    $("#pop-param #pop-advsetting #param-Cursor .label").html(o.extra.txt.paramCursor);
    $("#pp-box #bt-ppaccept .txt").html(o.bt.accept);
    $("#pp-box #bt-pprefuse .txt").html(o.bt.refuse);
    if (pageApp) {
        if (!app.customTitle) {
            document.getElementById("img-titre").style.display = "none";
            document.getElementById("box-title").style.display = "block";
            $("#home #box-title .txt").html(app.name);
        }
        if (!app.customVersion) {
            document.getElementById("img-version").style.display = "none";
            document.getElementById("box-version").style.display = "block";
            renderHomeVersionText();
        }
        if (document.querySelector("#pop-param #pop-setting #param-events")) {
            $("#pop-param #pop-setting #param-events .label").html(o.extra.txt.paramEvents);
        }
        $("#mixlist .tab#tab-mixlist .txt").html(o.bt.myMix);
        $("#mixlist .tab#tab-myachi .txt").html(o.extra.bt.achievements);
        $('#mixlist .tab-filter #bt-mymix .txt').html(o.bt.myMix);
        $('#mixlist .tab-filter #bt-myfav .txt').html(o.bt.myFav);
        $("#mixlist .box-info .offline .txt").html(o.txt.offline);
        $("#watch-info #bt-save .txt").html(o.bt.save);
        $("#watch-info .offline .txt").html(o.txt.offline);
        if (notnull(localMixObject)) {
            e = localMixObject.getMixlist().length == 0 ? STR("txt.mixlistEmpty") : STR("txt.mixlistInfo");
            $("#list-mymix .boxinfo", $poplist).html(e);
        }
        $("#watch-info .date, .box-info .date").each(function () {
            var e;
            if ($(this).attr("data-date")) {
                e = $(this).attr("data-date");
                $(this).html(getStringDate(e));
            }
        });
        $("#pop-switch .title").html(o.txt.enjoyVersion);
        $("#game #box-bt1 #bt-stop .txt").html(o.bt.menuRestart);
        $("#game #box-bt1 #bt-random .txt").html(o.bt.menuRandom);
        $("#game #box-bt1 #bt-record .txt").html(o.bt.menuRecord);
    } else {
        $("#page-splash #sp-baseline").html(STR("txt.baseline"));
        $("#page-splash #sp-experience").html(STR("txt.sp-experience"));
        $("#page-splash #sp-choose").html(STR("txt.selectVersion"));
    }
    if (notnull(boxPopup) && boxPopup.isOpen()) {
        boxPopup.refresh();
    }
}
function renderHomeVersionText() {
    let el = document.getElementById("box-version");
    if (!el) return false;

    var segments = (typeof app !== 'undefined' && app && Array.isArray(app.homeVersionText))
        ? app.homeVersionText
        : null;
    if (!segments || !segments.length) {
        const config = getVersionConfig();
        const hasCustomVersion = config && typeof config.boxVersion === "string" && config.boxVersion.trim() !== "";
        const versionLabel = hasCustomVersion ? config.boxVersion : `${(RegisterMod) ? RegisterMod.toUpperCase() : "INCREDIBOX"} <span>V${app.version}</span>`;
        $("#home #box-version .txt").html(versionLabel);
    } else {
        el.innerHTML = '';
        segments.forEach(function (seg) {
            var span = document.createElement('span');
            span.textContent = seg.text || '';
            var color = String(seg.color || 'FFFFFF').replace(/^#/, '');
            span.style.color = '#' + color;
            if (seg.bold) span.style.fontWeight = '800';
            if (seg.italic) span.style.fontStyle = 'italic';
            if (seg.font) span.style.fontFamily = '"' + seg.font + '", ' + 'poppinsmedium, Sans-Serif';
            el.appendChild(span);
        });
    }
}
function loadLanguage(e) {
    var o;
    var t = notnull(o = e && e.lang ? e.lang : null) && notnull(languageListe[o]) ? o : notnull(user.lang) && user.lang != "" ? user.lang : machine.language != "" ? machine.language : defaultLanguage;
    function n() {
        if (e && e.fail) {
            e.fail();
        } else {
            loadLanguageFailed();
        }
        return false;
    }
    if (appBrowser) {
        t = getParameterByName("lang") ? getParameterByName("lang") : machine.language;
    }
    if (window.electron && isnull(o) && user.lang == "" && notnull(electron.vars.lang)) {
        t = checkLanguageCode(electron.vars.lang);
    }
    t = checkLanguageCode(t);
    if (isnull(languageListe[t])) {
        t = defaultLanguage;
    }
    $("#pop-language .box-lang .bt-soft#bt-lang-" + t).addClass("active");
    if (notnull(translateObj)) {
        $("body").removeClass("lang-" + currentLanguage);
    }
    (o = new XMLHttpRequest()).addEventListener("load", function () {
        if (this.status != 200) {
            n();
            return false;
        }
        translateObj = jsonDecode(this.responseText);
        setUserInfo({
            lang: currentLanguage = t
        });
        $("body").addClass("lang-" + currentLanguage);
        if (e && e.cbck) {
            e.cbck();
        }
    }, false);
    o.addEventListener("error", n, false);
    o.open("GET", "./lang/" + t + ".json");
    o.send();
}
function loadLanguageFailed() {
    setUserInfo({
        lang: defaultLanguage
    });
    boxDialog.open("Impossible to load language settings. Please reload or force to quit the app then retry.", "ERROR", ["Reload"], [gotoAppUrl], true);
}
function clickBtLang(e) {
    var o = (e = $(e.currentTarget)).attr("id").replace("bt-lang-", "");
    if (!e.hasClass("active")) {
        $("#pop-language .box-lang .bt").removeClass("active");
        e.addClass("active");
        loadLanguage({
            cbck: changeDomTxt,
            lang: o
        });
    }
}
function STR(e) {
    if (!translateObj || !translateObj.trad) {
        return e;
    }

    let keys = e.split(".");
    let t = translateObj.trad;

    for (let i = 0; i < keys.length; i++) {
        let k = keys[i];

        if (!t || !(k in t)) {
            return e;
        }

        t = t[k];
    }

    return t;
}
