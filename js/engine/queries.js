/*
 * queries.js
 * Small helpers about the current state: kill all polos, play a bonus now, show combos,
 * time left, lists of busy/free polos and pictos, lock/unlock the screen.
 */

function immediateKillAllPolo() {
    for (var i = 0; i < nbPoloMax; i++) {
        if (listPolo[i] && listPolo[i].id !== undefined) {
            stopLyrics(listPolo[i].id);
        }
    }
    for (var e = getListPoloBusy(), o = 0, t = e.length; o < t; o++) {
        checkerCodeBonus(e[o].getPicto(), false);
        e[o].stopSound();
        e[o].deshabiller(0, true);
        e[o].desactiverClick();
    }
}
function immediatePlayBonus(e, o) {
    if (listBonus[e] && listBonus[e].unavailable) return; // its video couldn't be loaded
    bonusWaiting = shouldImmediatePlayBonus = true;
    (curBonus = listBonus[bonusQueue = e]).prepareVideo(o);
    cntBoucleBonus = o - 1;
}
function showPoloAndPictoInCombo(e) {
    for (var o = getListPoloBusy(), t = listBonus[e - 1], n = [], i = 0, a = o.length; i < a; i++) {
        var s = o[i].getPicto().id;
        if (t.hasCode(s + 1)) {
            n.push(o[i].id);
        }
    }
    showPoloInArray(n);
    showPictoInCombo(e);
}
function showPoloInArray(e) {
    TweenMax.killTweensOf(stopShowPoloInArray);
    var o = getListPoloBusy();
    if (o.length > 1) {
        for (var t = 0, n = o.length; t < n; t++) {
            var i = o[t];
            if (existInArray(e, i.id)) {
                if (i.getHide()) {
                    i.stopHidingYourself();
                }
            } else {
                i.hideYourself();
            }
        }
    }
}
function stopShowingPoloInArray(e) {
    var o = getListPoloHidden();
    e = e || 0;
    e = decimal((getTime() - e) / 1000, 2);
    TweenMax.delayedCall(e < 1 ? 1 : 0.1, stopShowPoloInArray, [o]);
}
function stopShowPoloInArray(e) {
    for (var o = 0, t = e.length; o < t; o++) {
        e[o].stopHidingYourself();
    }
    stopShowPictoInCombo();
}
function showPictoInCombo(e) {
    stopShowPictoInCombo();
    for (var o = listBonus[e - 1].getCode(), t = o.length, n = 0, i = listPicto.length; n < i; n++) {
        for (var a = listPicto[n], s = 0; s < t; s++) {
            if (!existInArray(o, a.id + 1)) {
                a.hideYourself();
            }
        }
    }
}
function stopShowPictoInCombo() {
    for (var e = 0, o = listPicto.length; e < o; e++) {
        listPicto[e].stopHiddingYourself();
    }
}
function getStringDate(e, o) {
    var t;
    var n;
    e = e.indexOf("/") == -1 ? e.split("-").join("/") : e;
    e = new Date(e);
    if (o) {
        o = e.getHours();
        t = e.getMinutes();
        n = e.getSeconds();
        o = String(o < 10 ? "0" + o : o);
        t = String(t < 10 ? "0" + t : t);
        n = String(n < 10 ? "0" + n : n);
        return String(o + ":" + t + ":" + n);
    } else {
        o = e.getDate();
        t = e.getMonth();
        n = e.getFullYear();
        e = o + " " + STR("txt.months")[t] + " " + n;
        if (currentLanguage.toLowerCase() != "zh-cn" && currentLanguage.toLowerCase() != "zh-tw") {
            return e;
        } else {
            return n + " 年 " + (t + 1) + " 月 " + o + " 日";
        }
    }
}
function getTimeSpent(e) {
    if (loopOn || e) {
        return timenow - startboucle;
    } else {
        return 0;
    }
}
function getTimeRemain() {
    return loopDuration - getTimeSpent();
}
function getRemainingTime(e) {
    if (e = e !== undefined && e) {
        return loopDuration * 2 - (getTime() - startboucle);
    } else {
        return loopDuration - (getTime() - startboucle);
    }
}
function getRemainingTimeBeforeBonus() {
    return getRemainingTime(!!app.bonusloopA && !boucleA);
}
function getRandomObject(e) {
    var o = Math.floor(Math.random() * e.length);
    return e.splice(o, 1)[0];
}
function getListPoloBusy() {
    for (var e = [], o = 0; o < nbPoloMax; o++) {
        var t = listPolo[o];
        if (t.getBusy()) {
            e.push(t);
        }
    }
    return e;
}
function getListPoloUnmute() {
    for (var e = [], o = getListPoloBusy(), t = 0, n = o.length; t < n; t++) {
        var i = o[t];
        if (!i.getMute()) {
            e.push(i);
        }
    }
    return e;
}
function getListPoloFree() {
    for (var e = [], o = 0; o < nbPoloMax; o++) {
        var t = listPolo[o];
        if (!t.getBusy()) {
            e.push(t);
        }
    }
    return e;
}
function getListPictoBusy() {
    for (var e = [], o = 0; o < nbSound; o++) {
        var t = listPicto[o];
        if (t.used) {
            e.push(t);
        }
    }
    return e;
}
function getListPictoFree() {
    for (var e = [], o = 0; o < nbSound; o++) {
        var t = listPicto[o];
        if (!(t.used || t.ignored)) {
            e.push(t);
        }
    }
    return e;
}
function getListPoloHidden() {
    for (var e = [], o = getListPoloBusy(), t = 0, n = o.length; t < n; t++) {
        var i = o[t];
        if (i.getHide()) {
            e.push(i);
        }
    }
    return e;
}
function lock() {
    $lockAll.addClass("show");
    pictoForceOnDrop();
}
function unlock() {
    $lockAll.removeClass("show");
}
