/*
 * modes/replay.js
 * Watching / replaying a saved mix, likes and views, and the head controls while watching.
 */

function prepareReplayMode() {
    modeReplay = true;
    $body.addClass("mode-replay");
    lock();
    closeTool();
    $btTool.off().on(pointerEventType.down, function (e) {
        e.preventDefault();
        preventAction(stopReplayMode);
    });
    $btTool.bounce();
    hideDiv($boxBtBonus, !modeWatch);
    hideDiv($boxPicto, !modeWatch);
    hideDiv($boxLoaderPolo, !modeWatch);
    $btTool.$svg.attr("xlink:href", "#ic-close");
    $btSave.on(pointerEventType.down, function (e) {
        e.preventDefault();
        preventAction(function () {
            Spinner.add($btSave);
            stopReplayMode(true);
        });
    });
    $boxStage.addClass("pointerlock");
    if (modeWatch) {
        $body.addClass("mode-watch");
        $mixlist.hide();
        $watchInfo.addClass("fadeIn");
    } else {
        $watchInfo.addClass("fadeIn");
        $watchInfo.$title.html(STR("txt.replayTitle"));
        $watchInfo.$name.html(STR("txt.replayText"));
        $watchInfo.$dedi.empty();
        $btSave.find(".txt").html(STR("bt.save"));
    }
}
function startReplayMode() {
    var e = modeWatch ? mixToWatch.xml != null ? mixToWatch.xml : mixToWatch.mix : recordMix.getXML();
    replayMix = new ReplayMix(e);
    readingBar.maxLoop = replayMix.getTotalLoop();
    readingBar.bonusList = replayMix.getBonusList();
    TweenMax.delayedCall(0.4, function () {
        readingBar.open("play", replayMix.control);
        readingBar.onLoopsFinished = () => {
            stopReplayMode();
        };
        readingBar.onLooping = () => {
            replayMix.loop();
        };
        readingBar.start();
        replayMix.start();
    });
    TweenMax.delayedCall(0.6, function () {
        createFocus("mode-replay");
        unlock();
    });
}
function stopReplayMode(e) {
    for (var i = 0; i < listPolo.length; i++) {
        if (listPolo[i] && listPolo[i].id !== undefined) {
            stopLyrics(listPolo[i].id);
        }
    }
    removeInFocusHistory("mode-replay");
    deleteFocus();
    if (!froze) {
        desactivateControl();
        $btTool.off();
        modeReplay = false;
        readingBar.stop();
        readingBar.close();
        replayMix.stop();
        if (modeWatch) {
            if (miniPlayer) {
                stopAllStage();
            }
            backToHome();
        } else {
            stopAllStage();
            $btTool.bounce();
            $btTool.$svg.attr("xlink:href", "#ic-burger");
            $watchInfo.removeClass("fadeIn");
            if (e === true) {
                Spinner.reset();
                if (appBrowserDemo) {
                    popupGetApp(true);
                } else {
                    popupForm();
                }
            } else {
                popupRecok();
            }
            TweenMax.delayedCall(0.4, afterStopReplay);
        }
        enableBtTool();
    }
}
function afterStopReplay() {
    showDiv($boxBtBonus, !modeWatch);
    showDiv($boxPicto, !modeWatch);
    showDiv($boxLoaderPolo, !modeWatch);
    $body.removeClass("mode-replay");
    $boxStage.removeClass("pointerlock");
}
function reinitModeWatch() {
    afterStopReplay();
    modeWatch = false;
    $body.removeClass("mode-watch");
    $btTool.$svg.attr("xlink:href", "#ic-burger");
    $watchInfo.removeClass();
    $mixlist.show();
}
function clickBtWatch(e) {
    var o;
    if (e.type !== undefined) {
        e.stopPropagation();
    }
    var t = isnull(e = e.type === undefined ? e : null);
    if (isnull(e = t ? searchMixInCurrentList((o = $(this).parent().parent()).attr("data-key").replace("mix-", "")) : e)) {
        boxDialog.open(STR("pop.notFoundText"), STR("pop.notFoundTitle"), [STR("bt.ok")]);
    } else {
        modeWatch = true;
        mixToWatch = e;
        $watchInfo.$title.html(e.title);
        $watchInfo.$name.html(STR("txt.createdBy").split("%{name}").join(e.name));
        $watchInfo.$dedi.html(e.dedi == "" ? "" : STR("txt.dedicatedTo").split("%{name}").join(e.dedi));
        $watchInfo.$date.html(getStringDate(e.datedb));
        $watchInfo.$date.attr("data-date", e.datedb);
        $watchInfo.find(".mixbanner").attr("class", "mixbanner");
        $watchInfo.find(".stat").empty();
        if (t) {
            t = o.find(".stat").html();
            $watchInfo.find(".stat").html(t);
            t = $watchInfo.find(".dj .box-flag");
            var countryToShow = e.country || getAutoCountry();

            if (countryToShow) {
                t.find(".fflag").removeClass().addClass("fflag fflag-" + countryToShow.toUpperCase());
                if (window.initFlags) window.initFlags();
            } else {
                t.hide();
            }
            t = "";
            t = (t = (t = (t = (t += o.hasClass("ismymix") ? " ismymix" : "") + (o.hasClass("isfavoris") ? " isfavoris" : "")))) + (o.hasClass("isprivate") ? " isprivate" : "");
            $watchInfo.find(".mixbanner").addClass(t);
        } else {
            $watchInfo.find(".stat").html("\n\t\t\t\t<div class='boxstat liked'><div class='txt'>" + numberSpaced(e.nblike) + "</div><div class='bck'><svg class='icn-svg'><use xlink:href='#ic-like-mini'></use></svg></div></div>\n\t\t\t\t<div class='boxstat viewed'><div class='txt'>" + numberSpaced(e.nbview) + "</div><div class='bck'><svg class='icn-svg'><use xlink:href='#ic-view-mini'></use></svg></div></div>\n\t\t\t");
        }
        if (!(mixToWatch.mymix || ($btLike.removeClass("liked already disabled"), $btLike.off().on(pointerEventType.down, clickBtLikeMix), e.liked && $btLike.addClass("liked"), miniPlayer))) {
            countView();
        }
        clickHomeBtPlay();
    }
}
function clickBtLikeMix(e) {
    e.preventDefault();
    if ($btLike.hasClass("disabled")) {
        return false;
    }
    if (hasNetwork) {
        $btLike.addClass("disabled");
        Spinner.add($btLike);
        TweenMax.delayedCall(0.5, function () {
            if (mixToWatch.liked === true) {
                $btLike.removeClass("liked");
                TweenMax.delayedCall(0.5, function () {
                    $btLike.removeClass("disabled");
                });
                countLike("nbunlike");
            } else {
                $btLike.addClass("liked");
                TweenMax.delayedCall(0.5, function () {
                    $btLike.removeClass("disabled");
                });
                countLike("nblike");
            }
        });
    } else {
        boxDialog.open(STR("pop.noNetworkVotedText"), STR("pop.noNetworkTitle"), [STR("bt.ok")]);
    }
}
function countLike(e) {
    var o = {
        uuid: trustAppMobile ? device.uuid : "unknown",
        id: mixToWatch.id,
        link: mixToWatch.link,
        row: e
    };
    xhr("POST", domainOnline + "ph3/save-stat-mix.php", o, function (e) {
        if (e.state == "success") {
            switch (e.info) {
                case "like ok":
                    mixToWatch.liked = true;
                    mixToWatch.nblike++;
                    break;
                case "unlike ok":
                    delete mixToWatch.liked;
                    mixToWatch.nblike--;
                    mixToWatch.nblike = mixToWatch.nblike < 0 ? 0 : mixToWatch.nblike;
                    break;
                case "already liked":
                    boxDialog.open(STR("pop.alreadyVotedText"), STR("pop.alreadyVotedTitle"), [STR("bt.ok")]);
                    $btLike.addClass("already liked");
                    mixToWatch.liked = true;
            }
        }
        Spinner.reset();
        $watchInfo.$like = $watchInfo.find(".stat .liked");
        $watchInfo.$like.find(".bck").addClass("popIn").one(animationEnd, function (e) {
            $(e.target).removeClass("popIn");
        });
        $watchInfo.$like.find(".txt").text(numberSpaced(mixToWatch.nblike));
        if (!miniPlayer) {
            $lineOpened.find(".stat .liked .txt").text(numberSpaced(mixToWatch.nblike));
        }
    }, function (e) { });
}
function countView() {
    var e = {
        uuid: trustAppMobile ? device.uuid : "unknown",
        link: mixToWatch.link,
        row: "nbview"
    };
    if (hasNetwork) {
        xhr("POST", domainOnline + "ph3/save-stat-mix.php", e, function (e) {
            if (e.state == "success") {
                mixToWatch.viewed = true;
            }
        });
    }
}
var adBreak;
var adConfig;
var controlBoucle = 0;
var controlIsBuzy = false;
function activateControl() {
    $boxStage[0].addEventListener(pointerEventType.down, listenControlPress);
}
function listenControlPress(e) {
    e.preventDefault();
    if (!controlIsBuzy) {
        clearTimeout(controlTimeout);
        $boxStage[0].removeEventListener(pointerEventType.move, moveControlHead);
        $boxStage[0].addEventListener(pointerEventType.move, moveControlHead);
        document.body.removeEventListener(pointerEventType.up, listenControlRelease);
        document.body.addEventListener(pointerEventType.up, listenControlRelease);
        readingBar.openBig();
        moveControlHead(e);
        frozeScene();
    }
}
function listenControlRelease(e) {
    e.preventDefault();
    clearTimeout(controlTimeout);
    $boxStage[0].removeEventListener(pointerEventType.move, moveControlHead);
    document.body.removeEventListener(pointerEventType.up, listenControlRelease);
    readingBar.openNormal();
    controlTimeout = setTimeout(controlTimeoutComplete, 400);
}
function controlTimeoutComplete() {
    controlIsBuzy = true;
    unfrozeScene(controlBoucle = readingBar.cntLoop);
    setTimeout(function () {
        controlIsBuzy = false;
    }, 200);
}
function moveControlHead(e) {
    e = "targetTouches" in e ? e.targetTouches[0] : e;
    var o = $incredibox[0].offsetLeft;
    e = e.pageX - o;
    e = (e = (e = Math.floor(readingBar.maxLoop * e / (document.body.clientWidth - o * 2))) < 0 ? 0 : e) > readingBar.maxLoop - 1 ? readingBar.maxLoop - 1 : e;
    readingBar.seek(e);
}
function desactivateControl() {
    $boxStage[0].removeEventListener(pointerEventType.down, listenControlPress);
    $boxStage[0].removeEventListener(pointerEventType.move, moveControlHead);
    document.body.removeEventListener(pointerEventType.up, listenControlRelease);
    controlBoucle = 0;
    clearTimeout(controlTimeout);
}
