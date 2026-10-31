/*
 * ui/popups.js
 * Every popup of the game: info/credits tabs, settings, switch version, get-the-app,
 * errors, "still here?", bonus unlocked/next bonus, recording done...
 */

function checkIfPopupOpen() {
    if (notnull(boxPopup) && boxPopup.isOpen()) {
        boxPopup.close(true);
    }
}
function boxInfoCustom() {
    var e = boxInfo.$popup.find("#pop-tuto .slideshow");
    e.$box = e.find(".img-row");
    e.$btL = e.find(".bt").first();
    e.$btR = e.find(".bt").last();
    e.$nav = e.find(".pt-box");
    e.init = function () {
        for (var e, o = this, t = 0, n = 0, i = 0, a = 0, s = this.find(".bloc").length, r = 100 / s, l = 0, c = 0; c < s; c++) {
            o.$nav.append("<div class=\"pt\"></div>");
        }
        this.addListener = function () {
            document.body.addEventListener(pointerEventType.up, o.onRelease);
            document.body.addEventListener(pointerEventType.leave, o.onRelease);
            document.body.addEventListener(pointerEventType.move, o.onMove);
        };
        this.removeListener = function () {
            document.body.removeEventListener(pointerEventType.up, o.onRelease);
            document.body.removeEventListener(pointerEventType.leave, o.onRelease);
            document.body.removeEventListener(pointerEventType.move, o.onMove);
        };
        this.onPress = function (n) {
            n = "targetTouches" in n ? n.targetTouches[0] : n;
            t = n.pageX;
            o.$box.removeClass("slide");
            e = boxInfo.$popup.find(".slideshow")[0].clientWidth;
            o.removeListener();
            o.addListener();
        };
        this.onMove = function (i) {
            i = "targetTouches" in i ? i.targetTouches[0] : i;
            i = Math.round(t - i.pageX) * -1 * 100 / document.body.clientWidth;
            l = i * document.body.clientWidth / e;
            n = l / s * 0.6;
            o.$box.css({
                transform: "translate(" + (a + n) + "%,0)"
            });
        };
        this.onRelease = function () {
            o.removeListener();
            if (l < -15) {
                if (i != s - 1) {
                    o.slide("left");
                } else {
                    o.slide();
                }
            } else if (l > 15 && i !== 0) {
                o.slide("right");
            } else {
                o.slide();
            }
            l = n = t = 0;
        };
        this.slide = function (e) {
            o.removeListener();
            o.$box.addClass("slide");
            if (e === "left") {
                i++;
            } else if (e === "right") {
                i--;
            }
            a = -i * r;
            o.$box.css({
                transform: "translate(" + String(a) + "%,0)"
            });
            o.lightup();
        };
        this.clickLeft = function (e) {
            if (i !== 0) {
                o.slide("right");
            }
        };
        this.clickRight = function (e) {
            if (i != s - 1) {
                o.slide("left");
            }
        };
        this.lightup = function () {
            o.$nav.find(".pt").removeClass("active");
            o.$nav.find(".pt").eq(i).addClass("active");
            o.$btL.removeClass("disable");
            o.$btR.removeClass("disable");
            if (i === 0) {
                o.$btL.addClass("disable");
            }
            if (i == s - 1) {
                o.$btR.addClass("disable");
            }
        };
        this.desactive = function () {
            if (i > 0) {
                t = n = i = a = l = 0;
                o.slide();
            }
            o.$box[0].removeEventListener(pointerEventType.down, o.onPress);
            o.$btL[0].removeEventListener(pointerEventType.down, o.clickLeft);
            o.$btR[0].removeEventListener(pointerEventType.down, o.clickRight);
            o.removeListener();
        };
        this.active = function () {
            o.$box[0].addEventListener(pointerEventType.down, o.onPress);
            o.$btL[0].addEventListener(pointerEventType.down, o.clickLeft);
            o.$btR[0].addEventListener(pointerEventType.down, o.clickRight);
            o.lightup();
        };
    };
    e.init();
    return e;
}
function initPopup() {
    (boxInfo = new Popup(".box-popup#pop-info")).$slide = boxInfoCustom();
    boxParam = new Popup(".box-popup#pop-param");
    $("#pop-language .box-lang .bt").on(pointerEventType.down, function (e) {
        e.preventDefault();
        preventAction(function () {
            clickBtLang(e);
        });
    });
    $("#pop-follow .bt.color-facebook").on(pointerEventType.down, function (e) {
        e.preventDefault();
        redirectTo("facebook");
    });
    $("#pop-follow .bt.color-twitter").on(pointerEventType.down, function (e) {
        e.preventDefault();
        redirectTo("twitter");
    });
    $("#pop-follow .bt.color-bluesky").on(pointerEventType.down, function (e) {
        e.preventDefault();
        redirectTo("bluesky");
    });
    $("#pop-follow .bt.color-discord").on(pointerEventType.down, function (e) {
        e.preventDefault();
        redirectTo("discord");
    });
    $("#pop-follow .bt.color-instagram").on(pointerEventType.down, function (e) {
        e.preventDefault();
        redirectTo("instagram");
    });
    $("#pop-follow .bt.color-youtube").on(pointerEventType.down, function (e) {
        e.preventDefault();
        redirectTo("youtube");
    });
    $("#pop-follow .bt.color-tumblr").on(pointerEventType.down, function (e) {
        e.preventDefault();
        redirectTo("tumblr");
    });
    $("#pop-follow .bt.color-spotify").on(pointerEventType.down, function (e) {
        e.preventDefault();
        redirectTo("spotify");
    });
    $("#pop-follow .bt.color-bilibili").on(pointerEventType.down, function (e) {
        e.preventDefault();
        redirectTo("bilibili");
    });
    $("#pop-follow .bt.color-tiktok").on(pointerEventType.down, function (e) {
        e.preventDefault();
        redirectTo("tiktok");
    });
    $("#pop-follow .bt.color-modio").on(pointerEventType.down, function (e) {
        e.preventDefault();
        redirectTo("modio");
    });
    $("#pop-follow #bt-modders").on(pointerEventType.down, function (e) {
        e.preventDefault();
        redirectTo("modder");
    });
    $("#pop-follow #bt-feedback").on(pointerEventType.down, function (e) {
        e.preventDefault();
        preventAction(sendFeedback);
    });
    $("#pop-follow #bt-faq").on(pointerEventType.down, function (e) {
        e.preventDefault();
        redirectTo("faq");
    });
    $("#pop-follow #bt-privacy").on(pointerEventType.down, function (e) {
        e.preventDefault();
        redirectTo("privacy");
    });
    $("#pop-follow #bt-rating").on(pointerEventType.down, function (e) {
        e.preventDefault();
        var o = isIOS || isOSX ? build.storeRateURL : build.storeURL;
        preventAction(function () {
            openURL(o);
        });
    });
    $('#pop-merch #shop-apparel svg').on(pointerEventType.down, function (e) {
        e.preventDefault();
        redirectTo('shop');
    })
    $('#pop-merch #shop-apparel .bt').on(pointerEventType.down, function (e) {
        e.preventDefault()
        redirectTo('shop');
    })
    $('#pop-merch #shop-album svg').on(pointerEventType.down, function (e) {
        e.preventDefault();
        redirectTo('merch');
    });
    $('#pop-merch #shop-album .bt').on(pointerEventType.down, function (e) {
        e.preventDefault();
        redirectTo('merch');
    });
}
function dialogGetApp(e, o) {
    if (notnull(e)) {
        e.preventDefault();
    }
    if (appBrowserDemo) {
        popupGetApp(o);
    } else if (appBrowser) {
        popupGetAppBrowser(o);
    } else {
        boxDialog.open("To access this feature you have to download the Incredibox app. Let's go? &#128273;", "&#128274; Locked", [STR("bt.sure"), STR("bt.later")], [], true);
    }
}
function popupGetApp(e) {
    var o = isIOS ? "<div class='bt-store' id='bt-getapp'><div class='bck appstore'></div></div>" : "<div class='bt with-icn' id='bt-getapp'><div class='bck'><svg class='icn-svg'><use xlink:href='#ic-download'></use></svg><div class='txt'>Get the app</div></div><div class='hitzone'></div></div>";
    var t = isIOS ? "appstore" : "store";
    o = isAndroid ? "<div class='bt-store' id='bt-getapp'><div class='bck playstore'></div></div>" : o;
    t = isAndroid ? "playstore" : t;

    boxPopup.open({
        name: "get-full-app",
        icntype: e === true ? "action-back" : "action",
        class: "big column",
        content: `\t\t\t<div class='left'><div class='img-box'"></div></div><div class='right'><div class='title'>` + STR("txt.lockedContent") + `</div><div class='text'>\t` + STR("txt.wantAllFeature") + " " + STR("txt.easyDownload") + "<br><br>\n               \t" + STR("txt.catchyFeatures").replace("%{emoji}", "&#129321") + `</div>` + o + "\n            </div>",
        onBoxOpenEnd: function () {
            if (e === true) {
                boxPopup.$icon.on(pointerEventType.down, popupRecok);
            } else {
                boxPopup.$icon.on(pointerEventType.down, boxPopup.close);
            }

            var imgBox = boxPopup.$popup.find(".img-box");
            var testImg = new Image();
            testImg.onload = function () {
                imgBox.css("background-image", "url(./img/popup-mobile.jpg)");
                imgBox.addClass("fade");
            };
            testImg.onerror = function () {
                console.error("Image failed to load");
                imgBox.css("background-color", "#ccc").html("Image missing");
            };
            testImg.src = "./img/popup-mobile.jpg";

            boxPopup.$popup.find("#bt-getapp").on(pointerEventType.down, function (e) {
                e.preventDefault();
                redirectTo(t);
            });
        },
        onBoxCloseStart: function () {
            boxPopup.$icon.off();
            boxPopup.$popup.find("#bt-getapp").off();
        }
    });
}
function popupGetAppBrowser(e) {
    var o = e === true ? "action-back" : "action";
    var t = "App exclusivity";
    var n = "This feature is only available in the Incredibox App.<br>Choose your store below and access the full experience!";
    var i = "More info";
    var a = getParameterByName("lang") != null && getParameterByName("lang") != "en" ? getParameterByName("lang") + "/" : "";
    var s = domainOnline + a + "app";
    if (isIframe && window.top.i18n != null) {
        t = window.top.i18n.app_exclusivity;
        n = window.top.i18n.feature_only_inapp + "<br>" + window.top.i18n.access_full_xp;
        i = window.top.i18n.bt_more_info;
    }
    boxPopup.open({
        name: "get-full-app-browser",
        icntype: o,
        content: "\n\t\t\t<div class='title'>" + t + " &#128521;</div>\n\t\t\t<div class='text'>" + n + `</div>
\t\t\t<div class='box-bt-store'>
\t\t\t\t<a href="https://apps.apple.com/app/incredibox/id1093131935" target="_blank" class="bt-store"><div class="bck appstore"></div></a>
\t\t\t\t<a href="https://play.google.com/store/apps/details?id=com.sofarsogood.incredibox" target="_blank" class="bt-store"><div class="bck playstore"></div></a>
\t\t\t\t<a href="https://www.amazon.fr/So-Far-Good-Incredibox/dp/B07BKZCDHT/" target="_blank" class="bt-store"><div class="bck amazonstore"></div></a>
\t\t\t\t<a href="https://store.steampowered.com/app/1545450/Incredibox/" target="_blank" class="bt-store"><div class="bck steam"></div></a>
\t\t\t\t<a href="https://apps.apple.com/app/id1437906083" target="_blank" class="bt-store"><div class="bck macappstore"></div></a>
\t\t\t\t<a href="https://www.microsoft.com/fr-fr/p/incredibox/9pdjpp8scs9k?rtc=1&activetab=pivot:overviewtab" target="_blank" class="bt-store"><div class="bck windowsstore"></div></a>
\t\t\t\t<a href="https://www.incredibox.com/schools" target="_blank" class="bt-store"><div class="bck schools"></div></a>
\t\t\t</div>
\t\t\t<div id="bt-more-info" class="bt bt-light with-icn"><div class="bck"><div class="icn"><svg class="icn-svg"><use xlink:href="#ic-navr"></use></svg></div><div class="txt">` + i + "</div></div><div class=\"hitzone\"></div></div>",
        onBoxOpenEnd: function () {
            if (e === true) {
                boxPopup.$icon.on(pointerEventType.down, popupMixSaved);
            } else {
                boxPopup.$icon.on(pointerEventType.down, boxPopup.close);
            }
            boxPopup.$popup.find("#bt-more-info").on(pointerEventType.down, function (e) {
                e.preventDefault();
                openURL(s, "_self");
            });
        },
        onBoxCloseStart: function () {
            boxPopup.$icon.off();
            boxPopup.$popup.find("#bt-more-info").off();
        }
    });
}
function popupGeneralError(e) {
    var o = translateObj && translateObj.trad ? STR("pop.generalErrorText") : "Sorry, the app encountered a technical problem.";
    var t = translateObj && translateObj.trad ? STR("bt.ok") : "Ok";
    var n = e && e.error ? "<br>[ error: " + e.error + " ]" : "";
    var i = e && e.action ? e.action : "";
    e = e && e.txt ? e.txt + n : o + n;
    if (i == "kill") {
        boxDialog.open(e, "&#128533;", [], [], true, true);
    } else if (i === "kill-redirect") {
        boxDialog.open(
            e,
            "&#128533;",
            ["Go Back"],
            [gotoAppUrl],
            true,
            true
        );
    } else if (i == "reload") {
        boxDialog.open(e, "&#128533;", ["Reload"], [reloadPage], true);
    } else {
        boxDialog.open(e, "&#128533;", [t], [], true);
    }
}
function popupStillHere() {
    if (boxDialog != null && boxDialog.$div.attr("data-name") != "dialogStillHere") {
        boxDialog.open(STR("pop.stillHere"), "&#128564;", [STR("bt.sure")], [clickPopupStillHere], true, false, "dialogStillHere");
    }
}
function popupInfo() {
    deleteFocus();
    boxInfo.open({
        static: true,
        bckclose: true,
        name: "popup-info",
        class: "big",
        onBoxOpenEnd: function () {
            boxInfo.$slide.active();
            createFocus("pop-tuto");
        },
        onBoxCloseStart: function () {
            deleteFocus();
            focusHistory = [];
        },
        onBoxCloseEnd: function () {
            boxInfo.$slide.desactive();
        },
        onCloseComplete: function () {
            createFocus(pageApp ? "home" : "index-select");
        }
    });
}
function popupParam() {
    deleteFocus();
    boxParam.open({
        static: true,
        bckclose: true,
        name: "popup-param",
        class: "big",
        onBoxOpenEnd: function () {
            createFocus("pop-language");
        },
        onBoxCloseStart: function () {
            deleteFocus();
            focusHistory = [];
        },
        onCloseComplete: function () {
            createFocus(pageApp ? "home" : "index-select");
        }
    });
}
function popupSwitch() {
    if (singleVersionMod != 1) {
        deleteFocus();
        boxSwitch.open({
            static: true,
            bckclose: true,
            name: "popup-switch",
            onBoxOpenEnd: function () {
                createFocus("popup-switch");
            },
            onBoxCloseStart: function () {
                deleteFocus();
                focusHistory = [];
            },
            onCloseComplete: function () {
                createFocus("home");
            }
        });
    }
}
function popupDrag() {
    var e = STR(modeRecord ? "pop.dragDropText" : "txt.tuto1");
    boxPopup.open({
        name: "drag-and-drop",
        class: "mini",
        bodyclose: true,
        content: "<div class='title'>" + STR("pop.dragDropTitle") + "</div><div class='text'>" + e + "</div>",
        onBoxOpenStart: function () {
            boxPopup.$popup.find(".pop").append("<div id='pointe-box' class='bottom'><div id='pointe'></div></div>");
        },
        onBoxCloseEnd: function () {
            boxPopup.$popup.find("#pointe-box").remove();
            if (!modeRecord) {
                storage.setItem("popupDragViewed", "viewed");
            }
        }
    });
}
function popupShort() {
    boxPopup.open({
        name: "too-short",
        icntype: "info",
        class: "mini",
        bodyclose: true,
        content: "\n\t\t\t<div class='title'>" + STR("pop.toShortTitle") + "</div>\n\t\t\t<div class='text'>" + STR("pop.toShortText").split("%{minimum_time}").join(app.recmintime) + "</div>"
    });
}
function popupBonusPlaying() {
    boxPopup.open({
        name: "bonus-playing",
        icntype: "info",
        class: "mini",
        bodyclose: true,
        content: "\n\t\t\t<div class='title'>" + STR("pop.bonusPlayingTitle") + "</div>\n\t\t\t<div class='text'>" + STR("pop.bonusPlayingText") + "</div>"
    });
}
function popupFindPreviousBonus() {
    boxPopup.open({
        name: "find-previous-bonus",
        icntype: "info",
        class: "mini",
        bodyclose: true,
        content: "\n\t\t\t<div class='title'>" + STR("pop.bonusFindPreviousTitle") + "</div>\n\t\t\t<div class='text'>" + STR("pop.bonusFindPreviousText") + "</div>"
    });
}
function popupBonusUnlocked(e) {
    var o;
    if ((!modeReplay && !modeRandom || e) && (o = "v" + appVersion + "-popup-bonus-unlock", isnull(storage.getItem(o)) || e)) {
        boxPopup.open({
            name: "bonus-unlocked",
            class: "mini",
            bodyclose: true,
            content: "\n\t\t\t\t\t<div class='title'>" + STR("pop.bonusUnlockTitle") + "</div>\n\t\t\t\t\t<div class='text'>" + STR("pop.bonusUnlockText") + "</div>\n\t\t\t\t",
            onBoxOpenStart: function () {
                boxPopup.$popup.find(".pop").append("<div id='pointe-box' class='top'><div id='pointe'></div></div>");
                calcPointePosX(1);
            },
            onBoxCloseEnd: function () {
                storage.setItem(o, "ok");
                boxPopup.$popup.find("#pointe-box").remove();
            }
        });
    }
}
function popupBonusFindNext(e) {
    var o;
    if ((!modeReplay && !modeRandom || e) && (o = "v" + appVersion + "-popup-bonus-next", isnull(storage.getItem(o)) || e)) {
        if (isToolbarOpen) {
            closeTool();
        }
        boxPopup.open({
            name: "find-next-bonus",
            class: "mini",
            bodyclose: true,
            content: "\n\t\t\t\t\t<div class='title'>" + STR("pop.bonusFindNextTitle") + "</div>\n\t\t\t\t\t<div class='text'>" + STR("pop.bonusFindNextText") + "</div>\n\t\t\t\t",
            onBoxOpenStart: function () {
                boxPopup.$popup.find(".pop").append("<div id='pointe-box'><div id='pointe'></div></div>");
            },
            onBoxCloseEnd: function () {
                storage.setItem(o, "ok");
                boxPopup.$popup.find("#pointe-box").remove();
            }
        });
    }
}
function calcPointePosX(e) {
    var o = document.querySelector("#pop-popup .pop").getBoundingClientRect();
    e = (e = (e = (e = document.querySelector("#bt-bonus-" + e).getBoundingClientRect()).left - o.left + e.width / 2) < 30 ? 30 : e) > o.width - 30 ? o.width - 30 : e;
    document.getElementById("pointe").style.left = e + "px";
}
function popupRecok() {
    checkTimeRecok = getTime();
    deleteFocus();
    var e = "\n\t\t<div class='bt bt-haut retry'><div class='bck'><svg class='icn-svg'><use xlink:href='#ic-reset'></use></svg></div><div class='txt'>" + STR("bt.retry") + "</div><div class='hitzone'></div></div>\n\t\t<div class='bt bt-haut replay'><div class='bck'><svg class='icn-svg'><use xlink:href='#ic-eye'></use></svg></div><div class='txt'>" + STR("bt.replay") + "</div><div class='hitzone'></div></div>\n\t\t<div class='bt bt-haut save'><div class='bck'><svg class='icn-svg'><use xlink:href='#ic-edit'></use></svg></div><div class='txt'>" + STR("bt.save") + "</div><div class='hitzone'></div></div>";
    if (appBrowserDemo) {
        e = "\n\t\t\t<div class='bt bt-haut replay'><div class='bck'><svg class='icn-svg'><use xlink:href='#ic-eye'></use></svg></div><div class='txt'>" + STR("bt.replay") + "</div><div class='hitzone'></div></div>\n\t\t\t<div class='bt bt-haut share'><div class='bck'><svg class='icn-svg'><use xlink:href='#ic-share'></use></svg></div><div class='txt'>" + STR("bt.share") + "</div><div class='hitzone'></div></div>\n\t\t\t<div class='bt bt-haut download'><div class='bck'><svg class='icn-svg'><use xlink:href='#ic-download'></use></svg></div><div class='txt'>Get MP3</div><div class='hitzone'></div></div>";
    }
    boxPopup.open({
        name: "record-complete",
        icntype: "action",
        content: "\n\t\t\t<div class='title'>" + STR("pop.recOkTitle") + `</div>
\t\t\t<div class='content'>
\t\t\t\t<div class='box-bt-haut'>
\t\t\t\t\t` + e + `
\t\t\t\t</div>\t
\t\t\t</div>`,
        onBoxOpenEnd: function () {
            boxPopup.$icon.on(pointerEventType.down, boxPopup.close);
            boxPopup.$popup.find(".bt.replay").on(pointerEventType.down, function (e) {
                e.preventDefault();
                preventAction(clickReplayMix);
            });
            if (appBrowserDemo) {
                boxPopup.$popup.find(".bt.share").on(pointerEventType.down, function (e) {
                    e.preventDefault();
                    preventAction(function () {
                        popupGetApp(true);
                    });
                });
                boxPopup.$popup.find(".bt.download").on(pointerEventType.down, function (e) {
                    e.preventDefault();
                    preventAction(function () {
                        popupGetApp(true);
                    });
                });
            } else {
                boxPopup.$popup.find(".bt.retry").on(pointerEventType.down, function (e) {
                    e.preventDefault();
                    preventAction(clickRetryMix);
                });
                boxPopup.$popup.find(".bt.save").on(pointerEventType.down, function (e) {
                    e.preventDefault();
                    preventAction(clickSaveMix);
                });
            }
            createFocus("popup-record-complete");
            unlock();
        },
        onBoxCloseStart: function () {
            deleteFocus();
            boxPopup.$icon.off();
            boxPopup.$popup.find(".bt").off();
        },
        onBoxCloseEnd: function () {
            boxPopup.$icon.off();
            boxPopup.$popup.find(".bt").off();
        },
        onCloseComplete: function () {
            removeInFocusHistory("popup-record-complete");
            if (!modeReplay) {
                createFocus("toolbar");
            }
        }
    });
}
