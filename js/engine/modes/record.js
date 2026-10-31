/*
 * modes/record.js
 * Recording a mix: RecordMix.
 */

function startRecordMode() {
    if (bonusPlaying) {
        popupBonusPlaying();
    } else {
        lock();
        modeRecord = true;
        $body.addClass("mode-record");
        waitForRecording = false;
        recordMix.init();
        readingBar.maxLoop = app.recmaxloop;
        readingBar.open("record");
        closeTool();
        $btTool.off().on(pointerEventType.down, function (e) {
            e.preventDefault();
            preventAction(stopRecordMode);
        });
        $btTool.bounce();
        $btTool.$svg.attr("xlink:href", "#ic-live");
        if (loopOn) {
            lancerRecordMode();
        } else {
            TweenMax.delayedCall(0.4, lancerRecordMode);
        }
    }
}
function lancerRecordMode() {
    (loopOn ? startRecording : (waitForRecording = true, popupDrag))();
    unlock();
}
function startRecording() {
    waitForRecording = false;
    readingBar.start();
    readingBar.onLoopsFinished = () => {
        stopRecordMode();
    };
    readingBar.onLooping = () => {
        recordMix.loop();
    };
    recordMix.start();
}
function stopRecordMode() {
    for (var i = 0; i < listPolo.length; i++) {
        if (listPolo[i] && listPolo[i].id !== undefined) {
            stopLyrics(listPolo[i].id);
        }
    }
    modeRecord = false;
    $body.removeClass("mode-record");
    readingBar.stop();
    readingBar.close();
    recordMix.stop();
    $btTool.$svg.attr("xlink:href", "#ic-burger");
    $btTool.off();
    $btTool.bounce();
    enableBtTool();
    if (readingBar.cntLoop < readingBar.minLoop && !waitForRecording) {
        TweenMax.delayedCall(0.25, popupShort);
    }
    if (readingBar.cntLoop >= readingBar.minLoop && !waitForRecording) {
        lock();
        pictoForceOnDrop();
        stopAllStage();
        popupRecok();
    }
}
function RecordMix() {
    var e;
    var o;
    var t;
    var n;
    var i;
    var a = this;
    var s = decimal(loopDuration / 1000, 2);
    this.init = function () {
        o = e = "";
        t = false;
        n = 0;
        i = {};
    };
    this.setData = function (e) {
        i = e;
    };
    this.getData = function () {
        return i;
    };
    this.getXML = function () {
        return e;
    };
    this.start = function () {
        a.init();
        t = true;
        a.xmlOpen();
    };
    this.loop = function () {
        a.xmlCloseAction();
        a.xmlCloseLoop();
        n++;
        a.xmlOpenLoop();
        a.xmlOpenAction();
    };
    this.stop = function () {
        t = false;
        a.xmlClose();
    };
    this.xmlOpen = function () {
        e = "<mix version='" + build.version + "' control='true'>\n";
        a.xmlOpenLoop();
        a.xmlOpenAction();
    };
    this.xmlClose = function () {
        a.xmlCloseAction();
        a.xmlCloseLoop();
        e += "</mix>\n";
    };
    this.xmlOpenLoop = function () {
        o = "\t<loop boucleA='" + !boucleA + "' count='" + n + "'>\n";
        o += "\t\t<stage>\n";
        if (bonusPlaying) {
            o += "\t\t\t<bonus id='" + (bonusQueue - 1) + "' playing='true' cntBoucle='" + cntBoucleBonus + "' />\n";
        } else {
            if (bonusWaiting && n > 0) {
                o += "\t\t\t<bonus id='" + (bonusQueue - 1) + "' waiting='true'/>\n";
            }
            for (var e = 0; e < nbPoloMax; e++) {
                var t;
                var i = listPolo[e];
                if (i.getBusy()) {
                    "";
                    t = i.getPlaying() || i.getMoment() !== 0 || i.getLoop() !== 0 ? "\t\t\t<polo id='" + i.id + "' picto='" + i.getPicto().id + "' mute='" + i.getMute() + "' playing='" + i.getPlaying() + "'/>\n" : "\t\t\t<polo id='" + i.id + "' picto='" + i.getPicto().id + "' mute='" + i.getMute() + "' playing='true'/>\n";
                    o += t;
                }
            }
        }
        o += "\t\t</stage>\n";
    };
    this.xmlCloseLoop = function () {
        e += o += "\t</loop>\n";
    };
    this.xmlOpenAction = function () {
        o += "\t\t<action>\n";
        if (n === 0 && bonusWaiting) {
            recordMix.xmlAction("bonus", listBonus[bonusQueue - 1], true);
        }
    };
    this.xmlCloseAction = function () {
        o += "\t\t</action>\n";
    };
    this.xmlAction = function (e, n, i) {
        var a;
        var r;
        if (t) {
            i = i !== undefined && i;
            a = decimal(getTimeSpent(true) / 1000, 2);
            r = "";
            if (e == "bonus") {
                r += i ? "\t\t\t<user type='" + e + "' bonus='" + n.getId() + "' when='0.1'/>\n" : "\t\t\t<user type='" + e + "' bonus='" + n.getId() + "' when='" + a + "'/>\n";
            } else {
                a = s - delayassist / 1000 < a ? s : a;
                r += "\t\t\t<user type='" + e + "' polo='" + n.id + "' picto='" + n.getPicto().id + "' when='" + a + "'/>\n";
            }
            o += r;
        }
    };
}
