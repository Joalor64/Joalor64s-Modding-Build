/*
 * objects/clock.js
 * ClockObject: the round loop clock / pause button.
 */

function ClockObject(e) {
    var o;
    var t;
    var n;
    var i;
    var a;
    var s;
    var r;
    var l;
    var c;
    var u;
    var p;
    var d = this;
    var m = $("#" + e)[0].getContext("2d");
    var f = Math.PI * 2;
    var v = Math.PI / 2;
    var h = false;
    var b = false;
    var g = 0;
    this.start = function (e, o) {
        l = isDarkMode() ? "#CCC" : "#5A5A5A";
        m.strokeStyle = l;
        b = !(h = true);
        p = o;
        u = 100 / e;
        c = getTime();
    };
    this.stop = function (e) {
        h = false;
        if (e) {
            d.clear();
        } else {
            b = true;
            o = p ? 0 : 1;
        }
    };
    this.pause = function () {
        g = getTime();
    };
    this.resume = function () {
        var e = getTime() - g;
        c += e;
    };
    this.render = function () {
        var e;
        var a;
        if (h || b) {
            if (h) {
                e = getTime() - c;
                t = e * u / 100;
            } else if (b) {
                t += (o - t) * 0.2;
            }
            if ((t = t < 0.001 ? 0.001 : t) > 0.999) {
                t = 0.999;
            }
            e = p ? -v : f * t - v;
            a = p ? f * t - v : -v;
            d.clear();
            m.beginPath();
            m.arc(n, i, s, e, a, false);
            m.stroke();
            if (!(!b || t != 0.001 && t != 0.999)) {
                b = false;
                d.clear();
            }
        }
    };
    this.clear = function () {
        m.clearRect(n - s - r / 2, i - s - r / 2, s * 2 + r, s * 2 + r);
    };
    this.init = function (e, o, t, c, u, p) {
        n = e == null ? 0 : e;
        i = o == null ? 0 : o;
        a = t == null ? 1 : t;
        s = c == null ? 18 : c;
        r = u == null ? 6 : u;
        l = p == null ? "#FFFFFF" : p;
        m.lineWidth = r;
        m.strokeStyle = l;
        m.globalAlpha = a;
    };
}
