/*
 * convert.js
 * Old Flash mix XML conversion and exporting a mix to MP3 (convert-worker.js + lame).
 */

function convertFlashXml(e) {
    e = $.parseXML(e);
    var o = (e = $(e).find("compo")).attr("boucle") === "true";
    var t = "<mix version=\"flash\">\n";
    e.children().each(function (e) {
        var n = "\t<loop boucleA=\"" + o + "\" count=\"" + e + "\">\n";
        var i = "\t\t<stage>\n";
        var a = "\t\t<action>\n";
        $(this).children().each(function (o) {
            var t;
            var n = (c = $(this)).find("polo");
            var s = c.attr("type");
            var r = n.attr("picto");
            var l = n.attr("vol") === "0";
            n = n.attr("nbBoucle") > 0;
            var c = c.find("moment").attr("seconde");
            c = decimal(Number(c), 2).toString();
            s = (t = (s = (s = (s = (s = s === "ajouter" ? "append" : s) === "supprimer" ? "remove" : s) !== "mute" || l ? s : "mute") === "mute" && l ? "unmute" : s).indexOf("bonus") > -1 ? s.split("bonus").join("") : "") != "" ? "bonus" : s;
            r = Number(r.split("picto").join(""));
            if (Number(appVersion) == 2) {
                switch (r) {
                    case 0:
                        r = 5;
                        break;
                    case 1:
                        r = 6;
                        break;
                    case 2:
                        r = 7;
                        break;
                    case 3:
                        r = 8;
                        break;
                    case 4:
                        r = 9;
                        break;
                    case 5:
                        r = 0;
                        break;
                    case 6:
                        r = 1;
                        break;
                    case 7:
                        r = 2;
                        break;
                    case 8:
                        r = 3;
                        break;
                    case 9:
                        r = 4;
                }
            }
            if (e == 0 && c === "0") {
                i += "\t\t\t<polo id=\"-1\" picto=\"" + r + "\" mute=\"" + l + "\" playing=\"" + n + "\" />\n";
            } else {
                l = "\t\t\t<user type=\"" + s + "\" polo=\"-1\" picto=\"" + r + "\" when=\"" + c + "\" />\n";
                a += l = s === "bonus" ? "\t\t\t<user type=\"" + s + "\" bonus=\"" + t + "\" when=\"" + c + "\" />\n" : l;
            }
        });
        t += n + (i += "\t\t</stage>\n") + (a += "\t\t</action>\n") + "\t</loop>\n";
        o = !o;
    });
    return trim(t += "</mix>");
}
function parseXmlAndCheckAssets() {
    var e = mixToWatch.xml || mixToWatch.mix;
    var o = $.parseXML(e);
    var t = $(o);
    var n = t.find("mix");
    var i = false;
    if (t.find("compo").length > 0) {
        i = true;
        e = convertFlashXml(mixToWatch.xml);
        mixToWatch.xml = e;
        o = $.parseXML(e);
        n = (t = $(o)).find("mix");
    }
    var a = [];
    var s = [];
    var r = [];
    function l(e) {
        var o;
        if (e.attr("type") === "bonus") {
            o = Number(e.attr("bonus"));
            if (!existInArray(s, o = i ? o - 1 : o)) {
                s.push(o);
            }
        } else {
            o = Number(e.attr("picto"));
            if (!existInArray(a, o)) {
                a.push(o);
            }
        }
    }
    n.children().each(function (e) {
        if (e === 0) {
            $(this).find("stage").each(function (e) {
                $(this).children().each(function (e) {
                    l($(this));
                });
            });
        }
        $(this).find("action").each(function (e) {
            $(this).children().each(function (e) {
                l($(this));
            });
        });
    });
    a = a.sort(function (e, o) {
        return e - o;
    });
    s = s.sort(function (e, o) {
        return e - o;
    });
    for (var c = app.animearray[a[0]], u = 0, p = app.animearray.length; u < p; u++) {
        if (!existInArray(a, u)) {
            app.animearray[u] = c;
        }
    }
    u = 0;
    p = s.length;
    for (; u < p; u++) {
        r.push(app.bonusarray[s[u]]);
    }
}
var convertForceStop = false;
var convertWorker = null;
function stopConvert() {
    if (notnull(convertWorker)) {
        convertWorker.terminate();
    } else {
        convertForceStop = true;
    }
}

var baseName = cleanFileName(RegisterMod || "incredibox");

function cleanFileName(str) {
    return str.toLowerCase().replace(/\?/g, "").replace(/\s+/g, "-");
}

function startConvert(e, o) {
    var t;
    var n = new AudioContext();
    convertForceStop = false;
    convertWorker = null;
    var i = $($.parseXML(e.xml)).find("mix");
    var a = o.find("#convert-loader-box");
    var s = a.find(".progress-bar");
    var r = o.find("#bt-save-file");
    o = o.find(".spinner-box");
    var l = "mp3";
    var c = [];
    var u = [];
    var p = baseName + "-v" + app.version + "-" + slugify(e.title) + "-320kbps" + (e.online ? "-" + e.link : "") + "." + l;
    var d = 0;
    for (d = 0; d < nbSound; d++) {
        c.push([tabBuffer.sound[d].sndA, tabBuffer.sound[d].sndB]);
    }
    for (d = 0; d < nbSoundBonus; d++) {
        u.push([tabBuffer.bonus[d].snd, tabBuffer.bonus[d].aspire]);
    }
    var m;
    var f;
    var v = [];
    var h = 0;
    var b = false;
    var g = false;
    $(i).children().length;
    $(i).children().each(function (e) {
        var o = $(this).attr("boucleA") == "true";
        var t = $(this).find("stage");
        var i = $(this).find("action");
        var a = [];
        var s = o ? 0 : 1;
        var r = !app.bonusloopA || o;
        if (b && r) {
            g = !(b = false);
            v.push(u[m][0]);
        }
        var bonusLoop = app.nbloopbonus ? (Array.isArray(app.nbloopbonus) ? app.nbloopbonus[m] : app.nbloopbonus) : app.bonusarray[m].loop;
        if (g && ++h > bonusLoop) {
            g = false;
            f = m = void (h = 0);
        }
        if (!g) {
            t.children().each(function (e) {
                var o;
                var t;
                var r;
                var l;
                if (this.tagName == "polo" && (o = Number($(this).attr("picto")), l = $(this).attr("playing") == "true", t = $(this).attr("mute") == "true", r = [], l)) {
                    l = c[o][s];
                    if (t) {
                        r.push({
                            when: 0,
                            type: "mute"
                        });
                    }
                    i.find("user[picto='" + o + "']").each(function (e) {
                        var o = $(this).attr("type");
                        var t = Number($(this).attr("when"));
                        if (o != "append") {
                            r.push({
                                when: t,
                                type: o
                            });
                        }
                    });
                    if (r.length > 0) {
                        l = function (e, o, t) {
                            for (var i = e.numberOfChannels, a = e.duration, s = n.createBuffer(i, n.sampleRate * a, n.sampleRate), r = 0; r < i; r++) {
                                for (var l = s.getChannelData(r), c = e.getChannelData(r), u = c.length, p = 0, d = o, m = d, f = [], v = 0; v < t.length; v++) {
                                    var h = t[v].when;
                                    h = Math.round(h * u / a);
                                    f.push([h, t[v].type]);
                                }
                                for (var b = f.length > 0, g = 0; g < u; g++) {
                                    if (b && g >= f[p][0]) {
                                        d = f[p][1] == "mute" || f[p][1] == "remove";
                                        if (f.length <= ++p && (b = false, Math.round(g * 100 / u) > 95)) {
                                            d = m;
                                        }
                                        m = d;
                                    }
                                    if (d) {
                                        l[g] = 0;
                                    } else {
                                        l[g] += c[g];
                                    }
                                }
                            }
                            return s;
                        }(l, t, r);
                    }
                    a.push(l);
                }
            });
            i.find("user[type='bonus']").each(function (e) {
                b = true;
                m = Number($(this).attr("bonus"));
                f = Number($(this).attr("when"));
            });
            if (b) {
                i.find("user[type='remove']").each(function (e) {
                    var o = Number($(this).attr("picto"));
                    var t = Number($(this).attr("when"));
                    if (f < t && function (e, o) {
                        for (var t = 0; t < o.length; t++) {
                            if (e == o[t]) {
                                return 1;
                            }
                        }
                    }(o + 1, app.bonusarray[m].code)) {
                        b = false;
                        f = undefined;
                    }
                });
                f = 0;
            }
            if (!(!b || app.bonusloopA && o)) {
                a.push(u[m][1]);
            }
            v.push(function (e) {
                for (var o = e.length, t = 0, i = 0, a = 0; a < o; a++) {
                    if (e[a].numberOfChannels > t) {
                        t = e[a].numberOfChannels;
                    }
                    if (e[a].duration > i) {
                        i = e[a].duration;
                    }
                }
                for (var s = n.createBuffer(t, n.sampleRate * (i - 0), n.sampleRate), r = 0; r < o; r++) {
                    for (var l = 0; l < e[r].numberOfChannels; l++) {
                        for (var c = s.getChannelData(l), u = e[r].getChannelData(l), p = 0; p < u.length; p++) {
                            c[p] += u[p];
                        }
                    }
                }
                return s;
            }(a));
        }
    });
    if (!convertForceStop) {
        for (var x = e = function (e) {
            for (var o = e.length, t = [], i = 0, a = 0; a < o; a++) {
                t.push(e[a].numberOfChannels);
                i += e[a].duration;
            }
            i = Math.ceil(i);
            for (var s = t.reduce(function (e, o) {
                return Math.min(e, o);
            }), r = n.createBuffer(s, n.sampleRate * i, n.sampleRate), l = 0; l < s; l++) {
                for (var c = r.getChannelData(l), u = 0, p = 0; p < o; p++) {
                    var d = e[p].getChannelData(l);
                    c.set(d, u);
                    u += d.length;
                }
            }
            return r;
        }(v), w = 0.9, y = x.numberOfChannels, k = 0; k < y; k++) {
            for (var T = x.getChannelData(k), C = 0, D = 0, S = 0, P = T.length; S < P; S++) {
                if (T[S] > C) {
                    C = T[S];
                }
                if (T[S] < D) {
                    D = T[S];
                }
                if (T[S] > w) {
                    T[S] = w;
                }
                if (T[S] < -w) {
                    T[S] = -w;
                }
            }
        }
        i = e;
        var A = 0;
        convertWorker = new Worker("js/libs/convert-worker.js");
        i = {
            sampleR: i.sampleRate,
            numberC: i.numberOfChannels,
            leftData: i.getChannelData(0),
            rightData: i.getChannelData(1),
            lng: i.length,
            kbps: 320,
            typeToExport: l
        };
        convertWorker.postMessage([i]);
        convertWorker.onmessage = function (e) {
            var o;
            if ((e = e.data).type == "msg") {
                A++;
                o = Math.floor(A * 100 / 40);
                s.css({
                    width: 0 + (o = (o = o < 5 ? 5 : o) > 100 ? 100 : o) + "%"
                });
            } else {
                convertWorker.terminate();
                o = e.val;
                t = new Blob(o, {
                    type: "audio/mp3"
                });
                if (window.cordova && cordova.plugins && cordova.plugins.saveDialog) {
                    boxPopup.$icon.trigger(pointerEventType.down);
                    cordova.plugins.saveDialog.saveFile(t, p).then(e => { }).catch(e => {
                        if (e != "The dialog has been cancelled") {
                            popupGeneralError({
                                error: "file plugin failed"
                            });
                        }
                    });
                } else {
                    t = window.URL.createObjectURL(t);
                    a.addClass("hide");
                    r.attr("href", t).attr("download", p).addClass("enabled");
                    createFocus("popup-convert-mix-ready");
                }
                convertWorker = null;
                n.close();
                n = null;
            }
        };
        o.addClass("hide");
        a.addClass("show");
    }
}
