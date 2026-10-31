/*
 * objects/render.js
 * RenderRAF (requestAnimationFrame loop), Spinner, CustomButton and CanvasObj helpers.
 */

function RenderRAF(e) {
    var o;
    var t = e || nada;
    var n = false;
    function i(e) {
        t();
        o = requestAnimationFrame(i);
    }
    this.start = function () {
        if (!n) {
            n = true;
            i();
        }
    };
    this.stop = function () {
        if (n) {
            n = false;
            cancelAnimationFrame(o);
        }
    };
}
var $focused;
var Spinner = {
    $bt: null,
    $svg: null,
    xlink: "",
    add: function (e) {
        if (notnull(e)) {
            this.$bt = e;
            this.$svg = this.$bt.find("svg use");
            if (this.$svg.length > 0) {
                this.xlink = this.$svg.attr("xlink:href");
                this.$svg.attr("xlink:href", "#ic-loader");
            }
            this.$bt.addClass("spin");
        }
    },
    reset: function () {
        if (notnull(this.$bt)) {
            this.$bt.removeClass("spin");
        }
        if (notnull(this.$svg) && this.$svg.length > 0) {
            this.$svg.attr("xlink:href", this.xlink);
        }
        this.$bt = null;
        this.$svg = null;
        this.xlink = "";
    }
};
function CustomButton(e) {
    var o = e;
    var t = o.find("svg");
    var n = t.find("use");
    var i = n.attr("xlink:href");
    var a = false;
    var s = false;
    o.addSpinner = function () {
        if (!a) {
            a = true;
            n.attr("xlink:href", "#ic-loader");
            t.addClass("spin");
        }
        return o;
    };
    o.removeSpinner = function () {
        if (a) {
            a = false;
            n.attr("xlink:href", i);
            t.removeClass("spin");
        }
        return o;
    };
    o.addTouchAnimation = function () {
        if (s) {
            o.removeClass("ontouch").get(0).offsetHeight;
        }
        s = true;
        o.addClass("ontouch").one(animationEnd, function (e) {
            o.removeClass("ontouch");
            s = false;
        });
        return o;
    };
    return o;
}
function CanvasObj(e) {
    var o;
    var t = this;
    this.id = e;
    this.div = document.getElementById(e);
    this.context = this.div.getContext("2d");
    this.saveImage = function () {
        o = t.context.getImageData(0, 0, t.div.width, t.div.height);
    };
    this.showImage = function () {
        t.clear();
        t.context.putImageData(o, 0, 0);
    };
    this.clear = function () {
        t.context.clearRect(0, 0, t.div.width, t.div.height);
    };
    return this;
}
