/*
 * objects/reading-bar.js
 * ReadingBar: the progress bar used when watching/replaying a mix.
 */

function ReadingBar(e, o, t) {
    var n;
    var i = this;
    var a = $(e);
    var s = $("#reading-buffer", a);
    var r = $cntRecord.find("#t-spent");
    var l = $cntRecord.find("#t-duration");
    var c = "00:00";
    var u = false;
    var p = 0;
    var d = "record";
    var m = secToText(app.looptime * (app.maxrecloop || app.recmaxloop));
    var f = 0;
    var v = 0;
    this.minLoop = o;
    this.maxLoop = t;
    this.maxTime = 0;
    this.cntLoop = 0;
    this.bonusList = [];
    this.onLoopsFinished = nada;
    this.onLooping = nada;
    this.isFinished = function () {
        return this.cntLoop == this.maxLoop;
    };
    this.isLastLoop = function () {
        return this.cntLoop + 1 == this.maxLoop;
    };
    this.open = function (e, o) {
        d = e;
        i.createRecordBlock(o);
        i.cntLoop = 0;
        i.maxTime = d == "record" ? m : secToText(i.maxLoop * app.looptime);
        s.css({
            transform: "scaleX(0)"
        });
        c = "00:00";
        r.text(c);
        l.text(" / " + i.maxTime);
        f = 0;
        v = 100 / readingBar.maxLoop;
        a.addClass("open");
        $cntRecord.addClass("fadeIn");
        callParentWindow("replayTime", {
            state: "open",
            spent: c,
            duration: i.maxTime
        });
        return i;
    };
    this.close = function () {
        i.onLoopsFinished = nada;
        i.onLooping = nada;
        removeTransition(a, "open", "transform", function () {
            s.removeClass("progress");
            $("#reading-marker").empty();
            $("#reading-marker-bonus").empty();
            i.bonusList = [];
        });
        $cntRecord.removeClass("fadeIn cssdelay");
        return i;
    };
    this.start = function () {
        u = true;
        i.cntLoop = 0;
        p = 0;
        i.render();
        f = Math.floor(p + n) / i.maxLoop;
        s.css({
            transform: "scaleX(" + f / 100 + ")",
            "animation-duration": decimal(i.maxLoop * app.looptime / 1000, 2) + "s"
        });
        s.addClass("progress");
        callParentWindow("replayTime", {
            state: "start",
            spent: c,
            duration: i.maxTime
        });
        return i;
    };
    this.stop = function () {
        u = false;
        callParentWindow("replayTime", {
            state: "stop",
            spent: c,
            duration: i.maxTime
        });
        return i;
    };
    this.froze = function () {
        s.addClass("froze");
    };
    this.seek = function (e) {
        i.cntLoop = e;
        s.removeClass("progress");
        resetAnimationCSS(s[0]);
        s.css({
            transform: "scaleX(" + v * i.cntLoop / 100 + ")"
        });
        i.render();
    };
    this.unfroze = function () {
        s.css({
            transform: "scaleX(" + v * i.cntLoop / 100 + ")",
            "animation-duration": decimal((i.maxLoop - i.cntLoop) * app.looptime / 1000, 2) + "s"
        });
        s.removeClass("froze").addClass("progress");
    };
    this.openBig = function () {
        a.addClass("seeking");
    };
    this.openNormal = function () {
        a.removeClass("seeking");
    };
    this.loop = function () {
        i.cntLoop++;
        p += n;
        if (i.isFinished()) {
            if (i.onLoopsFinished) {
                i.onLoopsFinished();
            }
        } else if (i.onLooping) {
            i.onLooping();
        }
        return i;
    };
    this.render = function () {
        var e;
        if (u && (n = pctMetronome, e = secToText(getTimeSpent() + loopDuration * i.cntLoop), c != e)) {
            c = e;
            r.text(c);
            callParentWindow("replayTime", {
                state: "render",
                spent: c,
                duration: i.maxTime
            });
        }
    };
    this.createRecordBlock = function (e) {
        var o = d == "record" ? "#D20A0A" : miniPlayer ? "#2C86FE" : "#36B460";
        var t = d == "record" ? decimal(i.minLoop / i.maxLoop, 2) : 0;
        $("#reading-block", a).css({
            transform: "scale(" + t + ", 1)"
        });
        $($cntRecord).css({
            color: o
        });
        s.css({
            "background-color": o
        });
        if (e === true) {
            var n = "";
            var r = 100 / i.maxLoop;
            var l = 0;
            for (l = 0; l < i.maxLoop; l++) {
                n += "<div class='marker' style='left:" + r * l + "%'></div>";
            }
            $("#reading-marker").html(n);
            n = "";
            l = 0;
            for (; l < i.bonusList.length; l++) {
                n += "<div class='marker' style='left:" + r * i.bonusList[l].loopIndex + "%; width:" + r + "%'></div>";
            }
            $("#reading-marker-bonus").html(n);
        }
    };
    this.createRecordBlock();
}
