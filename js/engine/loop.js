/*
 * loop.js
 * The music loop: timing, bonus start/stop, loopFinished(), startLoop(), playSounds(), renderLoop(),
 * stopAllStage().
 */

var timenow;
var timespent;
var renderRAF;
var sndMetronome;
var curBonus = null;
function clickBtBonus(e) {
    bonusWaiting = true;
    curBonus = listBonus[(bonusQueue = e) - 1];
    checkSndAspiration(true);
    e = decimal(getRemainingTimeBeforeBonus() / 1000, 2);
    e = (e -= 0.5) < 0.5 ? 0 : e;
    TweenMax.delayedCall(e, showBlackFadeAtStart);
}
function cancelClickBtBonus() {
    if (bonusWaiting) {
        stopBonusVideo();
    }
}
function showBlackFadeAtStart() {
    $boxVideo.addClass("visible");
    $fadeVideo[0].offsetHeight;
    const currentBonusData = app.bonusarray[bonusQueue - 1];

    if (currentBonusData && currentBonusData.fade !== false) {
        $fadeVideo.addClass("animateFadeIn");
    }
    if (!(modeReplay || modeRandom || miniPlayer)) {
        hideDiv($boxPicto, true);
        hideDiv($boxLoaderPolo, true);
    }
}
function blackFadeRemoved() {
    $boxVideo.removeClass();
    $fadeVideo.removeClass();
    if (!(modeReplay || modeRandom || miniPlayer)) {
        $boxStage.removeClass("pointerlock");
        showDiv($boxPicto, true);
        showDiv($boxLoaderPolo, true);
    }
}
function videoSlideDown() {
    if (bottomNeedSlide && !miniPlayer) {
        $body.addClass("bottomSlide");
    }
}
function launchBonusVideo() {
    $boxVideo.addClass("visible");
    $boxStage.addClass("pointerlock");
    $fadeVideo.removeClass();
    pictoForceOnDrop();
    videoSlideDown();
    curBonus.play();
    bonusPlaying = !(bonusWaiting = false);
}
function stopBonusVideo() {
    killTransitionBonus();
    if (curBonus) {
        curBonus.stop();
    }
    videoFadeOut();
    bonusPlaying = bonusWaiting = false;
    cntBoucleBonus = bonusQueue = 0;
    curBonus = null;
}
function videoFadeOut() {
    if ($boxVideo.hasClass("visible")) {
        $fadeVideo.removeClass().addClass("show");
        $fadeVideo[0].offsetHeight;
        if ($body.hasClass("bottomSlide")) {
            $body.removeClass("bottomSlide");
            $boxVideo.one(transitionEnd, function () {
                $fadeVideo.addClass("animateFadeOut").one(animationEnd, blackFadeRemoved);
            });
        } else {
            $fadeVideo.addClass("animateFadeOut").one(animationEnd, blackFadeRemoved);
        }
    } else {
        blackFadeRemoved();
    }
}
function killTransitionBonus() {
    TweenMax.killTweensOf(showBlackFadeAtStart);
}
function checkerCodeBonus(e, o) {
    for (var t = e.id + 1, n = 0; n < nbBonus; n++) {
        listBonus[n].checkCode(t, o);
    }
}
function checkUnlockNextBonus() {
    var e;
    var o;
    if (!(modeReplay || modeRandom)) {
        e = curBonus.getId();
        o = "v" + appVersion + "-bonus-complete";
        if ((storage.getItem(o) || 0) <= e && e < nbBonus - 1) {
            storage.setItem(o, o = e + 1);
            listBonus[o].unlockme();
            popupBonusFindNext();
        }
    }
}
function showDiv(e, o, t) {
    if (o) {
        addTransition(e, "fade", "opacity", t);
    } else {
        e.removeClass("fade");
    }
    e.removeClass("hide");
}
function hideDiv(e, o, t) {
    if (o) {
        addTransition(e, "fade", "opacity", t);
    } else {
        e.removeClass("fade");
    }
    e.addClass("hide");
}
var waitingFirstLoop = false;
var bonusPlaying = false;
var bonusWaiting = false;
var shouldImmediatePlayBonus = false;
var bonusQueue = 0;
var leaveApp = false;
var boucleA = true;
var cntBoucle = 0;
var cntBoucleBonus = 0;
var timeremain = 0;
var pctMetronome = 0;
var pctMetronomeBoucleA = 0;
var frame = 0;
var frameTotal = 0;
var frameHalf = 0;
var framePart2 = 0;
var stepAnimation = 0;
var stepPercent = 0;
var currentSndPart = 0;
var startboucle = 0;
var pausedAt = 0;
function loopFinished() {
    window[`onV${appVersion}LoopFinished`]?.(!boucleA);
    var delayedRemovals = flushDelayedPoloRemoval();
    if (listPoloToRemove && listPoloToRemove.length > 0) {
        for (var i = 0; i < listPoloToRemove.length; i++) {
            var polo = listPoloToRemove[i];
            if (polo && polo.id !== undefined) {
                var lingeringLyrics = document.querySelectorAll(`.polo-lyrics[data-lyrics-polo="${polo.id}"]`);
                lingeringLyrics.forEach(lyrics => lyrics.remove());
                if (typeof stopLyrics === 'function') {
                    stopLyrics(polo.id);
                }
            }
        }
    }

    for (var poloKey in listWaiting) {
        var poloId = Number(poloKey);
        var picto = listWaiting[poloKey];
        var polo = listPolo[poloId];
        var oldPicto = polo.getPicto();
        if (polo && picto) {
            let e = `onV${appVersion}Polo${picto.id}Swap`;
            window[e]?.();
            waitingPictoInstance.remove(poloId, picto.id);
            pictoTouchePolo(polo, picto);
            oldPicto.reactiver(true);
            checkerCodeBonus(oldPicto, false);
        }
    }
    listWaiting = {};
    checkPoloToRemove();
    if (delayedRemovals > 0 && getListPoloBusy().length === 0 && loopOn) {
        stopLoop();
    }
    checkPoloToSolo();
    if (modeRandom) {
        randomMix.loop();
    }
    if (modeReplay) {
        if (replayMix.waitForReloop && cntBoucleBonus == curBonus.nbLoop) {
            replayMix.waitForReloop = false;
            replayMix.reloop = true;
        }
        readingBar.loop();
    }
    if (loopOn) {
        startLoop();
    }
    if (modeRecord) {
        readingBar.loop();
    }
}
function startLoop() {
    if (bonusPlaying && cntBoucleBonus == curBonus.nbLoop && app.bonusendloopA && !boucleA) {
        boucleA = true;
    }
    if (cntBoucle == 0) {
        keepAppAwake();
    }
    startboucle = getTime();
    loopOn = true;
    frame = 0;
    currentSndPart = boucleA ? framePart2 = 0 : (framePart2 = frameHalf, 1);
    clock.start(loopDuration, boucleA);
    sndMetronome.prepare(tabBuffer.metro[0].snd);
    if (modeReplay && readingBar.isLastLoop()) {
        sndMetronome.onComplete(readingBar.loop);
    } else {
        sndMetronome.onComplete(loopFinished);
    }
    if (bonusWaiting || bonusPlaying) {
        playBonus();
    }
    if (!bonusPlaying) {
        playSounds();
    }
    checkSndAspiration();
    sndMetronome.play();
    cntBoucle++;
    boucleA = !boucleA;
    window[`onV${appVersion}LoopStart`]?.(!boucleA);
}
function checkSndAspiration(e) {
    if (bonusWaiting) {
        if (e) {
            if ((boucleA || !app.bonusloopA) && getRemainingTime() > 600) {
                curBonus.playAspiration(decimal(getTimeSpent() / 1000, 2));
            }
        } else if (!boucleA) {
            curBonus.playAspiration(0);
        }
    }
}
function stopLoop() {
    let e = `offV${appVersion}Mix`;
    window[e]?.();
    console.info(`Loop stopped with ${e}()`);
    clearDelayedPoloRemoval();
    boucleA = !(loopOn = false);
    currentSndPart = cntBoucle = 0;
    clock.stop();
    stopBonusVideo();
    checkPoloToRemove(bonusPlaying);
    sndMetronome.stop();
    disableBtClock();
    if (modeRecord) {
        stopRecordMode();
    }
    if (modeReplay) {
        stopReplayMode();
    }
    stopKeepingAppAwake();
}
function playBonus() {
    var e = !app.bonusloopA || boucleA;
    if ((e = modeReplay && !!replayMix.waitForReloop || e) && !bonusPlaying) {
        launchBonusVideo();
        hidePoloLoader();
    }
    if (bonusPlaying && ++cntBoucleBonus > curBonus.nbLoop) {
        checkUnlockNextBonus();
        stopBonusVideo();
    }
}
function playSounds() {
    for (var e = 0; e < nbPoloMax; e++) {
        var o = listPolo[e];
        if (o.getBusy()) {
            if (o.waitOneLoop) {
                o.showLoader();
                o.waitOneLoop = false;
            } else {
                playSoundPolo(o);
            }
        }
    }
}
function playSoundPolo(e, t) {
    var o = currentSndPart == 0 ? "sndA" : "sndB";
    const anime = tabAnime[e.getAssetId()];
    const busyCount = getListPoloBusy().length;
    e.sound.prepare(tabBuffer.sound[e.getAssetId()][o]);
    e.hideLoader();
    e.playingPoloSound = true;
    if (!(e.getMute() || e.getHide())) {
        if (anime.hasStartup && busyCount <= 1) {
            setTimeout(function () {
                if (!e.getMute() && !e.exitActive) {
                    e.mode("anime");
                }
            }, 350);
        } else {
            e.mode("anime");
        }
    }
    e.playSound();
}
function renderLoop() {
    timenow = getTime();
    timespent = getTimeSpent();
    timeremain = getTimeRemain();
    pctMetronome = timespent * stepPercent;
    pctMetronomeBoucleA = app.bonusloopA ? decimal(100 - (pctMetronomeBoucleA = getRemainingTime(!boucleA) * stepPercent) / 2, 2) : pctMetronome;
    frame = Math.floor(timespent * stepAnimation);
    clock.render();
    readingBar.render();
    if (!isnull(curBonus)) {
        if (bonusPlaying) {
            curBonus.render();
        }
    }
    if (!bonusPlaying) {
        mainCanvas.clear();
        for (var e = 0; e < nbPoloMax; e++) {
            listPolo[e].draw();
        }
    }
}
function stopAllStage() {
    for (var i = 0; i < listPolo.length; i++) {
        if (listPolo[i] && listPolo[i].id !== undefined) {
            stopLyrics(listPolo[i].id);
        }
    }
    if (modeRandom) {
        stopRandomMode();
    }
    pictoForceOnDrop();
    for (var e = getListPoloBusy(), o = 0, t = e.length; o < t; o++) {
        var n = e[o];
        listPoloToRemove.push(n);
    }
    o = 0;
    t = listBonus.length;
    for (; o < t; o++) {
        listBonus[o].reinit();
    }
    globalVolumeFadeOut(stopLoop);
    cancelAllDelays();
}
function hidePoloLoader() {
    for (var e = getListPoloBusy(), o = 0, t = e.length; o < t; o++) {
        e[o].hideLoader();
    }
}
