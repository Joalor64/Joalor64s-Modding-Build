/*
 * modes/random.js
 * Auto mode (random mix): RandomMix.
 */

function showTextRandom() {
    const config = getVersionConfig();

    const title = resolveText(config.autoModeTitle, "txt.randomTitle");
    const text = resolveText(config.autoModeText, "txt.randomText");

    $watchInfo.$title.html(title);
    $watchInfo.$name.html(text);

    $watchInfo.$title[config.useCustomDJTitle ? 'attr' : 'removeAttr']("id", "CustomDJTitle");
    $watchInfo.$name[config.useCustomDJText ? 'attr' : 'removeAttr']("id", "CustomDJText");

    $watchInfo.addClass("fadeIn");
}
function lancerRandomMode() {
    showTextRandom();
    randomMix.start(loopOn);
    unlock();
}
function stopRandomMode() {
    modeRandom = false;
    $body.removeClass("mode-random");
    randomMix.stop();
    $btTool.off();
    $btTool.bounce();
    enableBtTool();
    $bckGlobal.removeClass("fadeIn");
    $btTool.$svg.attr("xlink:href", "#ic-burger");
    $watchInfo.removeClass("fadeIn");
    TweenMax.delayedCall(0.4, afterStopRandom);
}
function afterStopRandom() {
    showDiv($boxBtBonus, true);
    if (!bonusPlaying) {
        showDiv($boxPicto, true);
        showDiv($boxLoaderPolo, true);
    }
    $boxStage.removeClass("pointerlock");
}
function RandomMix(e) {
    var o = this;
    this.start = function () {
        o.loop();
        o.checkIfPoloMuted();
    };
    this.stop = function () { };
    this.checkIfPoloMuted = function () {
        for (var e = getListPoloBusy(), o = 0, t = e.length; o < t; o++) {
            var n = e[o];
            if (n.getMute()) {
                n.unmute();
            }
        }
    };
    this.loop = function () {
        var o = getListPoloFree();
        var t = getListPoloBusy();
        var n = getListPictoFree();
        var i = o.length;
        var a = t.length;
        var s = 0;
        var r = random(6);
        var l = random(5);
        var c = random(2);
        var u = random(5) < 4 ? 2 : 1;
        var p = false;
        var d = 0;
        var m = "ajouter";
        m = r < c ? "rien" : m;
        m = r < l || i === 0 ? "enlever" : m;
        m = !loopOn || a <= 1 ? "ajouter" : m;
        u = !loopOn || a <= 1 ? 1 : u;
        m = e ? "ajouter" : m;
        m = e && i === 0 ? "rien" : m;
        if (bonusPlaying || bonusWaiting) {
            m = "bonus";
            if (cntBoucleBonus == curBonus.nbLoop) {
                p = true;
                m = "enlever";
            }
        } else {
            for (s = 0; s < nbBonus; s++) {
                var f = listBonus[s];
                if (f.found) {
                    m = "bonus";
                    f.launchVideo();
                    break;
                }
            }
        }
        if (m == "ajouter") {
            d = Math.round((random(i - 1) + 1) / u);
            var v;
            var h = [];
            for (s = 0; s < d; s++) {
                v = getRandomObject(o);
                h.push(v.id);
            }
            h.sort();
            s = 0;
            for (; s < d; s++) {
                pictoTouchePolo(v = listPolo[h[s]], getRandomObject(n), s * 0.03);
                majListPoloDrop();
            }
        } else if (m == "enlever") {
            d = Math.round((random(a - 2) + 1) / u);
            d = p && a - d > 4 ? a - 4 : d;
            s = 0;
            d = Math.round((random(a - 2) + 1) / u);
            d = p && a - d > 4 ? a - 4 : d;
            s = 0;
            for (; s < d; s++) {
                if ((v = getRandomObject(t)).getLoop() > 2 || p) {
                    removePolo(v, 0);
                }
            }
        }
        if (m != "bonus") {
            a = (t = getListPoloBusy()).length;
            var b = 0;
            for (s = 0; s < a; s++) {
                var g = t[s];
                if (g.getLoop() > 7 && ++b < a) {
                    removePolo(g, 0);
                }
            }
        }
    };
}
