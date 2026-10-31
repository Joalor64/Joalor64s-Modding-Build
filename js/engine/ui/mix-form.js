/*
 * ui/mix-form.js
 * Saving a recorded mix: the form (title, DJ name, country...), virtual keyboard handling,
 * mix saved / convert-to-mp3 popups and feedback.
 */

var androidKB;
var translateObj;
var defaultLanguage;
var currentLanguage;
var checkTimeRecok = 0;
function canIclickRecok() {
    return getTime() - checkTimeRecok > 600;
}
function clickRetryMix() {
    if (canIclickRecok()) {
        boxPopup.close();
        TweenMax.delayedCall(0.2, startRecordMode);
    }
}
function clickReplayMix() {
    if (canIclickRecok()) {
        boxPopup.close();
        prepareReplayMode();
        startReplayMode();
    }
}
function clickSaveMix() {
    popupForm();
}
function popupForm() {
    boxPopup.open({
        name: "save-form",
        icntype: "action-back",
        content: function () {
            var e = "\n\t\t\t<div class='title'>" + STR("pop.formTitle") + `</div>
\t\t\t<div class='content'>
\t\t\t\t<form action='javascript:validFormMix()' method='post' target='_self' autocomplete='off'>
\t\t\t\t\t<div class='formzone'>
\t\t\t\t\t\t<div class='formline ic-name'><div class='icn-box'><svg class='icn-svg'><use xlink:href='#ic-user-mini'></use></svg></div><input type='text' id='input-name' placeholder='` + STR("txt.inputName") + "' value='" + user.djname + "' maxlength='26' autocorrect='off' spellcheck='false'/></div>\n\t\t\t\t\t\t<div class='formline ic-title'><div class='icn-box'><svg class='icn-svg'><use xlink:href='#ic-note-mini'></use></svg></div><input type='text' id='input-title' placeholder='" + STR("txt.inputTitle") + "' value='' maxlength='26' autocorrect='off' spellcheck='false'/></div>\n\t\t\t\t\t\t<div class='formline ic-dedi'><div class='icn-box'><svg class='icn-svg'><use xlink:href='#ic-like-mini'></use></svg></div><input type='text' id='input-dedi' placeholder='" + STR("txt.dedicatedTo").split("%{name}").join("...") + "' value='' maxlength='26' autocorrect='off' spellcheck='false'/></div>";
            e += `</div>
\t\t\t\t\t<div class='btzone'>
\t\t\t\t\t\t<div class='bt bt-round bt-big valid'><div class='bck'><svg class='icn-svg'><use xlink:href='#ic-check'></use></svg></div><div class='hitzone'></div></div>
\t\t\t\t\t</div>
\t\t\t\t\t<input type='submit' style='visibility:hidden;position:absolute'/><div class='clear'></div>
\t\t\t\t</form>
\t\t\t</div>`;
            if (appBrowser && !appBrowser) {
                e += "<div style='margin-top: 25px; color:#777; font-size:14px; line-height:20px;'>" + STR("pop.dontUseName") + " &#128521;</div>";
            }
            return e;
        },
        onBoxOpenEnd: function () {
            var e;
            var o;
            createFocus("popup-save-form");
            boxPopup.$icon.on(pointerEventType.down, popupRecok);
            boxPopup.$popup.find(".bt.valid").on(pointerEventType.down, function (e) {
                e.preventDefault();
                preventAction(clickBtValidFormMix);
            });
            if (window.cordova && !isIOSMac) {
                boxPopup.$popup.find(".formline:not(.ic-private)").on(pointerEventType.down, function (e) {
                    boxPopup.$popup.find(".formline").off(pointerEventType.down);
                    Spinner.add($(this).find(".icn-box"));
                });
                boxPopup.$popup.find(".formline input").on("focus", function () {
                    boxPopup.$popup.find(".formline input").off("focus");
                    Spinner.reset();
                });
            }
            if (!(appBrowser)) {
                e = boxPopup.$popup.find(".formline.ic-private .bt-onofftext");
                o = boxPopup.$popup.find(".formline.ic-private svg use");
                e.on(pointerEventType.down, function (t) {
                    t.preventDefault();
                    if (e.hasClass("active")) {
                        e.removeClass("active");
                        o.attr("xlink:href", "#ic-lock-mini");
                    } else {
                        e.addClass("active");
                        o.attr("xlink:href", "#ic-view-mini");
                    }
                });
            }
        },
        onBoxCloseStart: function () {
            removeInFocusHistory("popup-save-form");
            deleteFocus();
            boxPopup.$icon.off();
            boxPopup.$popup.find(".bt").off();
            boxPopup.$popup.find(".bt-onofftext").off();
            boxPopup.$popup.find(".formline").off();
            boxPopup.$popup.find(".formline input").off();
            boxPopup.$popup.find("input").off();
            if (window.cordova) {
                blurAll();
            }
        }
    });
}
var formProcessing = false;
function clickBtValidFormMix() {
    validFormMix();
}
function validFormMix() {
    var h;
    var j;
    var k;
    var m;
    var q;
    var v;
    var w;
    var x;
    var y;
    var z;
    var A;
    function B() {
        TweenMax.delayedCall(1, function () {
            Spinner.reset();
            popupMixSaved();
        });
    }
    if (!(boxPopup.$popup.find(".formzone .formline input").hasClass("focused") || formProcessing)) {
        formProcessing = true;
        lock();
        h = appBrowser || true || !boxPopup.$popup.find(".formzone .bt-onofftext").hasClass("active");
        j = boxPopup.$popup.find(".formzone #input-name");
        k = boxPopup.$popup.find(".formzone #input-title");
        m = boxPopup.$popup.find(".formzone #input-dedi");
        q = j.val().substr(0, 26);
        v = k.val().substr(0, 26);
        w = m.val().substr(0, 26);
        q = cleanInputText(q);
        v = cleanInputText(v);
        w = cleanInputText(w);
        z = regexList.classic;
        x = q.replace(/ /g, "");
        y = v.replace(/ /g, "");
        A = w.replace(/ /g, "");
        if (z.test(x)) {
            invalidField(j);
        } else if (z.test(y)) {
            invalidField(k);
        } else if (z.test(A)) {
            invalidField(m);
        } else if (x === "") {
            invalidField(j);
        } else if (y === "") {
            invalidField(k);
        } else {
            deleteFocus();
            boxPopup.$popup.find(".formzone input").blur();
            z = {
                mymix: true,
                online: false,
                name: ucwords(q),
                title: ucwords(v),
                dedi: ucwords(w),
                app: app.version,
                datedb: getDateNow(),
                link: getUniqLink(),
                private: true,
                nbview: 0,
                nblike: 0,
                xml: trim(recordMix.getXML())
            };
            A = boxPopup.$popup.find(".bt.valid");
            Spinner.add(A);
            recordMix.setData(z);
            localMixObject.saveMix(z);
            mixToShare = z;
            setUserInfo({
                djname: ucwords(q)
            });
            delete XHRmemotime.mymix;
            saveMixDB(z, B);
            B();
        }
    }
}
function invalidField(e) {
    e.addClass("invalid").one(animationEnd, function (e) {
        $(e.target).removeClass("invalid");
    });
    formProcessing = false;
    unlock();
}
function VKBopen(e) {
    if (window.cordova && isAndroid && boxPopup.isOpen() && boxPopup.$popup.attr("data-name") == "save-form") {
        e = e.keyboardHeight || document.body.clientHeight * 0.7;
        (androidKB = new FocusKeyboardAndroid()).init(e);
    }
}
function VKBclose() {
    if (window.cordova && isAndroid && boxPopup.isOpen() && boxPopup.$popup.attr("data-name") == "save-form" && androidKB) {
        androidKB.kill();
        androidKB = null;
    }
}
function FocusKeyboardAndroid() {
    var e;
    var o;
    var t;
    function n(e) {
        i(e.target);
    }
    function i(e) {
        var t = (e = e.getBoundingClientRect()).top;
        e = e.height;
        t = Math.round(o - (t + e / 2));
        TweenMax.to(boxPopup.$popup, 0.3, {
            scrollTo: {
                y: "-=" + t
            },
            ease: Quad.easeInOut,
            overwrite: true
        });
    }
    this.init = function (a) {
        e = a;
        o = (document.body.clientHeight - e) / 2;
        (t = document.querySelectorAll("#pop-popup[data-name=save-form] input[type=text]")).forEach(function (e) {
            e.addEventListener("focus", n);
            if (document.activeElement == e) {
                i(e);
            }
        });
        boxPopup.$popup.addClass("VKBopen");
        boxPopup.$popup.find(".bac").css({
            height: "calc(100% + " + e + "px)"
        });
        window.cordova;
    };
    this.kill = function () {
        t.forEach(function (e) {
            e.removeEventListener("focus", n);
        });
        TweenMax.to(boxPopup.$popup, 0, {
            scrollTo: {
                y: 0
            },
            overwrite: true
        });
        boxPopup.$popup.removeClass("VKBopen");
        boxPopup.$popup.find(".bac").css({
            height: "100%"
        });
        window.cordova;
    };
}
function blurAll() {
    if (notnull(document.activeElement)) {
        document.activeElement.blur();
    }
}
function listenFocus() {
    var e = false;
    if (isIOS) {
        document.addEventListener("focusin", function () {
            e = true;
        });
        document.addEventListener("focusout", function () {
            e = false;
            setTimeout(function () {
                if (!e) {
                    window.scrollTo(0, 0);
                }
            }, 250);
        });
    }
}
function popupConvertMix() {
    var e = "action";
    var o = appBrowserSchool && miniPlayer ? mixToWatch : mixToShare;
    if (!($mixlist.hasClass("show") || appBrowserSchool)) {
        e = "action-back";
    }
    boxPopup.open({
        name: "convert-mix",
        icntype: e,
        content: "\n\t\t\t<div class='title'>" + STR("pop.convertMixTitle") + "</div>\n\t\t\t<div class='text'>" + STR("pop.convertMixText") + `</div>
\t\t\t<div class='content'>
\t\t\t\t<div id='convert-loader-box' class='progress-box'><div class='progress-bar'></div></div>
\t\t\t\t<a class='bt with-icn color download' id='bt-save-file'><div class='bck'><svg class='icn-svg'><use xlink:href='#ic-download'></use></svg><div class='txt'>` + STR("bt.saveFile") + `</div></div><div class='hitzone'></div></a>
\t\t\t\t<div class='spinner-box spin'><svg class='icn-svg col-version'><use xlink:href='#ic-loader'></use></svg></div>
\t\t\t</div>`,
        onBoxOpenEnd: function () {
            createFocus("popup-convert-mix");
            boxPopup.$icon.on(pointerEventType.down, function () {
                if (e == "action") {
                    boxPopup.close();
                } else {
                    popupMixSaved();
                }
            });
            if (notnull(o) && converterCanRun()) {
                startConvert(o, boxPopup.$popup);
            } else {
                popupGeneralError({
                    error: "converter mix"
                });
            }
        },
        onBoxCloseStart: function () {
            removeInFocusHistory("popup-convert-mix");
            removeInFocusHistory("popup-convert-mix-ready");
            createFocus("playlist-line-open");
            boxPopup.$icon.off();
            stopConvert();
        }
    });
}
function popupMixSaved() {
    formProcessing = false;
    boxPopup.open({
        name: "mix-saved",
        icntype: "action",
        content: function () {
            var e = appBrowser ? STR("pop.shareMixSaved") : STR("pop.shareMixSavedPlaylist");
            e = mixToShare.private == 1 ? e.split("<br>")[0] : e;
            var o = "";
            if (converterCanRun()) {
                o += "<div class='bt bt-haut download hoverLocked'><div class='bck'><svg class='icn-svg'><use xlink:href='#ic-download'></use></svg></div><div class='txt'>" + STR("bt.exportFile") + "</div><div class='ic-locked'><svg class='icn-svg'><use xlink:href='#ic-lock'></use></svg></div><div class='hitzone'></div></div>";
            }
            o += "<div class='bt bt-haut mixlist color hoverLocked'><div class='bck'><svg class='icn-svg'><use xlink:href='#ic-mixlist'></use></svg></div><div class='txt'>" + STR("bt.myMix") + "</div><div class='ic-locked'><svg class='icn-svg'><use xlink:href='#ic-lock'></use></svg></div><div class='hitzone'></div></div>";
            return "\n\t\t\t\t<div class='title'>" + STR("pop.shareTitle") + "</div>\n\t\t\t\t<div class='text'>" + e + `</div>
\t\t\t\t<div class='content'>
\t\t\t\t\t<div class='box-bt-haut'>` + o + "</div>\n\t\t\t\t</div>";
        },
        onBoxOpenEnd: function () {
            createFocus("popup-mix-saved");
            boxPopup.$icon.on(pointerEventType.down, boxPopup.close);
            if (boxPopup.$popup.find(".bt.mixlist").length) {
                if (appBrowser && !appBrowserSchool) {
                    boxPopup.$popup.find(".bt.mixlist").on(pointerEventType.down, function (e) {
                        dialogGetApp(e, true);
                    });
                } else if (appBrowser && appBrowserSchool) {
                    boxPopup.$popup.find(".bt.mixlist").on(pointerEventType.down, function (e) {
                        callParentWindow("clickBtMixlist");
                    });
                } else {
                    boxPopup.$popup.find(".bt.mixlist").on(pointerEventType.down, function (e) {
                        preventAction(clickBtGoToMixlist);
                    });
                }
            }
            if (boxPopup.$popup.find(".bt.download").length) {
                if (appBrowser && !appBrowserSchool) {
                    boxPopup.$popup.find(".bt.download").on(pointerEventType.down, function (e) {
                        dialogGetApp(e, true);
                    });
                } else if (appBrowser && appBrowserSchool) {
                    boxPopup.$popup.find(".bt.download").on(pointerEventType.down, function () {
                        callParentWindow("exportMP3");
                    });
                } else {
                    boxPopup.$popup.find(".bt.download").on(pointerEventType.down, function () {
                        preventAction(popupConvertMix);
                    });
                }
            }
            unlock();
        },
        onBoxCloseStart: function () {
            deleteFocus();
            boxPopup.$icon.off();
            boxPopup.$popup.find(".bt").off();
        },
        onCloseComplete: function () {
            if (onGame) {
                createFocus("toolbar");
            }
            mixToShare = {};
        }
    });
}
function saveMixDB(e, o, t) { }
function clickBtGoToMixlist() {
    backToHome(function () {
        openPlaylist("mixlist", true, true);
    });
}
function checkIfMixSavedThenShare(e, o) {
    lock();
    deleteFocus();
    Spinner.add(o);
    if (hasNetwork) {
        if (mixToShare.mymix !== true || mixToShare.online) {
            shareMix(e);
        } else {
            saveMixDB(mixToShare, function () {
                $scrollbox.find(".line[data-key='mix-" + mixToShare.link + "']").removeClass("isoffline");
                shareMix(e);
            }, function (e) {
                boxDialog.open(STR("pop.noCoServerText"), STR("pop.noCoServerTitle"), [STR("bt.ok")], []);
                Spinner.reset();
                unlock();
            });
        }
    } else {
        o = $mixlist.hasClass("show") ? STR("pop.noCoShareText") : STR("pop.noCoShareText") + " " + STR("pop.noCoShareText2");
        boxDialog.open(o, STR("pop.noNetworkTitle"), [STR("bt.ok")], [function () {
            Spinner.reset();
        }]);
        unlock();
    }
}
function shareMix(e, o) { }
function sendFeedback() {
    var e = "feedback@incredibox.com";
    var o = "App feedback";
    var t = "<br><br>----------";
    if (window.cordova) {
        o += " - " + (appleModel[device.model] || device.model) + " " + device.platform + " " + device.version + (isIOSMac ? " (iOS on Mac)" : "");
    } else {
        o += " - " + machine.deviceModel + " " + machine.osName + " " + machine.osVersion;
    }
    t = (t = (t = (t = (t = (t = (t = (t = (t = (t = (t = (t += "<br>Store : " + build.store) + "<br>From : " + ucwords(build.platform) + " - " + (app !== undefined ? app.name + " - v" + app.version : "index")) + "<br>Version : " + build.version) + "<br>DJ Name : " + user.djname) + "<br>Ids : " + machine.uuid + " - " + user.guid + (trustAppMobile ? " - " + device.serial : "")) + "<br>Lang : " + user.lang + " (" + currentLanguage + ")") + "<br>Device : " + machine.deviceModel + " - " + document.body.clientWidth + "x" + document.body.clientHeight + " - " + (window.devicePixelRatio || 1)) + "<br>System : " + machine.osName + " - " + machine.osVersion + (isIOSMac ? " - iOS on Mac" : "")) + "<br>WV : " + machine.browserFullVersion) + "<br>Anime size " + animSize + " - cnv density " + cnvPXD + "<br>fileExt : " + sndExt + " " + vidExt) + "<br>Evt : " + pointerEventType.down) + "<br>SpRate : " + (window.audioCtx && window.audioCtx.sampleRate ? audioCtx.sampleRate : "") + " - " + (window.audioCtx && window.audioCtx.baseLatency ? audioCtx.baseLatency : "");
    if (window.cordova && window.plugins && window.plugins.socialsharing) {
        t = (t = (t += "<br>----------") + "<br>App.device : " + (appleModel[device.model] || device.model) + " - " + device.manufacturer) + "<br>App.system : " + device.platform + " - " + device.version;
        window.plugins.socialsharing.shareViaEmail("<br><br><br><i>" + t + "</i>", o, e, null, null, [], () => { }, e => {
            popupGeneralError({
                txt: STR("pop.shareErrorText"),
                error: e
            });
        });
    } else {
        t = t.replace(/<br>/g, "\r\n");
        e = "mailto:" + e + "?subject=" + o + "&body=" + encodeURIComponent(t);
        if (window.electron) {
            electron.ipc.openURL(e);
        } else {
            window.location.href = e;
        }
    }
}
