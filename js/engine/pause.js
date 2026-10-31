/*
 * pause.js
 * Audio contexts, pause/resume (pauseOn/pauseOff), app hidden/visible, freeze/unfreeze the scene.
 */

var audioCtx;

let uiAudioCtx = null;
function getUIAudioContext() {
    if (!uiAudioCtx) {
        try {
            uiAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (err) {
            console.error("Failed to create UI audio context:", err);
        }
    }
    return uiAudioCtx;
}

var gamePausedByUser = false;
function pauseGame() {
    (pause ? (gamePausedByUser = false, pauseOff) : (gamePausedByUser = true, pauseOn))();
}
function pauseOn() {
    if (!pause) {
        pause = true;
        pausedAt = getTime();
        $body.addClass("pause");
        pauseAudioContext();
        if (onGame) {
            if (isToolbarOpen) {
                closeTool();
            }
            if (loopOn && !froze && (clock.pause(), TweenMax.pauseAll(), curBonus)) {
                curBonus.pause();
            }
            if (froze) {
                clearTimeout(controlTimeout);
            }
            renderRAF.stop();
            pauseAllDelays();
            pictoForceOnDrop();
            createFocus("game-paused");
        }
    }
}
function pauseOff() {
    if (pause && (pause = false, startboucle += getTime() - pausedAt, $body.removeClass("pause"), resumeAudioContext(), onGame)) {
        if (loopOn && !froze && (clock.resume(), TweenMax.resumeAll(), curBonus)) {
            curBonus.resume();
        }
        if (froze) {
            controlTimeoutComplete();
        }
        renderRAF.start();
        resumeAllDelays();
        removeInFocusHistory("game-paused");
        createFocusFromHistory();
    }
}
function appOnPause() {
    pauseOn();
    leaveApp = true;
    lock();
    TweenMax.killTweensOf(appOnResumeComplete);
}
function appOnResume() {
    needToforceUserGesture = !(leaveApp = false);
    TweenMax.killTweensOf(appOnResumeComplete);
    TweenMax.delayedCall(0.25, appOnResumeComplete);
}
function appOnResumeComplete() {
    unlock();
    popupStillHere();
}
function clickPopupStillHere() {
    lock();
    forceUserGesture(function () {
        if (!gamePausedByUser) {
            pauseOff();
        }
        unlock();
    });
}
function pauseAudioContext() {
    globalVolumeFadeOut(() => {
        audioCtx.suspend().then(() => { }).catch(e => { });
    });
}
function resumeAudioContext() {
    audioCtx.resume().then(() => {
        checkAudioCanRun().then(() => {
            globalVolumeFadeIn();
        }).catch(e => {
            stopAllStage();
        });
    }).catch(e => {
        stopAllStage();
    });
}
var globalGain;
var globalFilter;
var froze = false;
function frozeScene() {
    if (!(pause || froze)) {
        loopOn = !(froze = true);
        sndMetronome.stop();
        immediateKillAllPolo();
        replayMix.stop();
        readingBar.froze();
        renderRAF.stop();
        clock.stop(true);
        mainCanvas.saveImage();
        mainCanvas.showImage();
        if (notnull(curBonus)) {
            if (bonusWaiting) {
                stopBonusVideo();
            } else if (bonusPlaying) {
                killTransitionBonus();
                curBonus.sound.stop();
                curBonus.pause();
                bonusPlaying = false;
            }
        }
    }
}
function unfrozeScene(e) {
    var o;
    var t;
    if (!pause && froze) {
        o = curBonus;
        t = froze = false;
        replayMix.loop(e);
        renderRAF.start();
        readingBar.unfroze();
        if (o) {
            if (shouldImmediatePlayBonus) {
                if (curBonus.getId() != o.getId()) {
                    o.stop();
                } else {
                    t = true;
                }
            } else {
                stopBonusVideo();
            }
        }
        if (shouldImmediatePlayBonus) {
            shouldImmediatePlayBonus = false;
            replayMix.waitForReloop = true;
            startLoop();
            if (!t) {
                $fadeVideo[0].offsetHeight;
                $fadeVideo.removeClass().addClass("show animateFadeOut");
            }
        } else {
            mainCanvas.showImage();
        }
    }
}
