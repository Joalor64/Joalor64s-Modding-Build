/*
 * objects/replay-mix.js
 * ReplayMix: plays back a recorded mix step by step.
 */

function ReplayMix(e) {
    var o;
    var t;
    var n;
    var i;
    var a;
    var s;
    var r;
    var l = this;
    function c() {
        var e;
        var o = getListPoloBusy();
        var t = getListPoloUnmute();
        if (t.length > 1) {
            for (e in o) {
                o[e].setSolo(false);
            }
        } else if (o.length == 1) {
            o[0].setSolo(false);
        } else if (o.length > 1 && t.length == 1) {
            for (e in o) {
                o[e].setSolo(false);
            }
            t[0].setSolo(true);
        }
    }
    this.control = false;
    this.reloop = false;
    this.waitForReloop = false;
    this.init = function () {
        var l;
        var c;
        t = $.parseXML(e);
        if ((o = $(t)).find("compo").length > 0) {
            n = true;
            l = convertFlashXml(e);
            t = $.parseXML(l);
            o = $(t);
        }
        t = o.find("mix");
        i = appBrowserDemo || appBrowserSchool || t.attr("control") === "true" && !appBrowser;
        a = t.children().length;
        s = decimal(loopDuration / 1000, 2);
        r = 0;
        if (i) {
            c = [];
            o.find("user[type=bonus]").each(function () {
                c.push(parseInt($(this).attr("bonus")));
            });
            if ((c = removeDupInArray(c)).length <= app.bonusarray.length) {
                activateControl();
            } else {
                i = false;
            }
        }
        this.control = i;
        this.reloop = false;
        this.waitForReloop = false;
    };
    this.getTotalLoop = function () {
        return a;
    };
    this.start = function () {
        l.loop();
    };
    this.stop = function () {
        TweenMax.killTweensOf(l.appendPolo);
        TweenMax.killTweensOf(l.removePolo);
        TweenMax.killTweensOf(l.mutePolo);
        TweenMax.killTweensOf(l.unmutePolo);
        TweenMax.killTweensOf(l.launchBonus);
        TweenMax.killTweensOf(l.soloPolo);
        this.control = false;
        l.reloop = false;
        l.waitForReloop = false;
    };
    this.loop = function (e) {
        var t;
        var i;
        if (notnull(e)) {
            r = e;
            l.reloop = true;
        }
        if (r == a) {
            stopReplayMode();
        } else {
            e = o.find("loop[count=\"" + r + "\"]");
            if (r === 0 || l.reloop) {
                boucleA = e.attr("boucleA") == "true";
                i = e.find("stage");
                t = 0;
                $(i).children().each(function (e) {
                    var o;
                    var n;
                    var i;
                    var a;
                    var s = this.tagName;
                    if (s == "polo") {
                        o = Number($(this).attr("id"));
                        n = Number($(this).attr("picto"));
                        a = $(this).attr("mute") == "true";
                        e = o == -1 ? listPolo[e] : listPolo[o];
                        o = listPicto[n];
                        n = l.reloop ? 0 : 0.03;
                        i = !!l.reloop;
                        l.appendPolo(e, o, t * n, i);
                        if ($(this).attr("playing") == "false") {
                            e.waitOneLoop = true;
                        }
                        if (a) {
                            l.mutePolo(e);
                        }
                        t++;
                    }
                    if (r > 0 && s == "bonus") {
                        o = Number($(this).attr("id"));
                        n = $(this).attr("playing") === "true";
                        i = $(this).attr("waiting") === "true";
                        a = Number($(this).attr("cntBoucle"));
                        if (i) {
                            TweenMax.delayedCall(0.1, l.launchBonus, [o]);
                        } else if (n) {
                            l.launchBonus(o, a, true);
                        }
                    }
                });
                if (n && (i = getListPoloUnmute()).length == 1 && getListPoloBusy().length > 1) {
                    i[0].setSolo(true);
                }
                l.reloop = false;
            }
            i = e.find("action");
            $(i).children().each(function () {
                var e;
                var o;
                var t;
                var i;
                if (this.tagName == "user") {
                    e = $(this).attr("type");
                    o = decimal(Number($(this).attr("when")), 2);
                    o = s < o ? s : o;
                    if (e == "bonus") {
                        t = Number($(this).attr("bonus"));
                        t = n ? t - 1 : t;
                        o = o === 0 ? 0.1 : o;
                        o = waitingFirstLoop && o < delayassist / 1000 ? o + delayassist / 1000 : o;
                        TweenMax.delayedCall(o, l.launchBonus, [t]);
                    } else {
                        t = Number($(this).attr("polo"));
                        i = Number($(this).attr("picto"));
                        t = t == -1 ? {
                            fromFlash: true
                        } : listPolo[t];
                        i = listPicto[i];
                        if (e == "append") {
                            TweenMax.delayedCall(o, l.appendPolo, [t, i]);
                        } else if (e == "remove") {
                            TweenMax.delayedCall(o, l.removePolo, [t, i]);
                        } else if (e == "mute") {
                            TweenMax.delayedCall(o, l.mutePolo, [t, i]);
                        } else if (e == "unmute") {
                            TweenMax.delayedCall(o, l.unmutePolo, [t, i]);
                        }
                        if (n && e == "solo") {
                            TweenMax.delayedCall(o, l.soloPolo, [i]);
                        }
                    }
                }
            });
            r++;
        }
    };
    this.getBonusList = function () {
        var e = [];
        $(o).find("bonus[playing='true']").each(function () {
            e.push({
                id: parseInt($(this).attr("id")),
                loopIndex: parseInt($(this).parent().parent().attr("count"))
            });
        });
        return e;
    };
    this.appendPolo = function (e, o, t, n) {
        pictoTouchePolo(e = e.fromFlash === true ? getListPoloFree()[0] : e, o, t, n);
        majListPoloDrop();
    };
    this.removePolo = function (e, o) {
        if ((e = e.fromFlash === true ? o.polo : e).getBusy()) {
            clickPolo(e);
        }
    };
    this.mutePolo = function (e, o) {
        if ((e = e.fromFlash === true ? o.polo : e).getBusy() && (mutePolo(e), n)) {
            c();
        }
    };
    this.unmutePolo = function (e, o) {
        if ((e = e.fromFlash === true ? o.polo : e).getBusy() && (unmutePolo(e), n)) {
            c();
        }
    };
    this.launchBonus = function (e, o, t) {
        if (notnull(listBonus[e])) {
            if (t) {
                immediatePlayBonus(e, o);
            } else {
                listBonus[e].launchVideo();
            }
        }
    };
    this.soloPolo = function (e) {
        if (n && (e = e.polo).getBusy()) {
            if (e.getSolo()) {
                e.setSolo(false);
                stopSoloPolo();
            } else {
                for (var o = getListPoloBusy(), t = 0, i = o.length; t < i; t++) {
                    o[t].setSolo(false);
                }
                e.setSolo(true);
                soloPolo();
            }
        }
    };
    if (notnull(e)) {
        this.init();
    }
}
