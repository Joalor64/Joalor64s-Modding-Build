/*
 * ui/dialog.js
 * The BoxDialog (small dialog with buttons) and Popup (big popup) classes.
 * Instances: boxDialog, boxPopup, boxInfo, boxParam, boxSwitch, boxMenu (created in initPopup()).
 */

function BoxDialog(e) {
    var o = this;
    var t = $(e);
    function n(e) {
        e.preventDefault();
        stopProp(e);
        e.data.bt.addTouchAnimation();
        var o = true;
        if (e.data.func !== undefined) {
            if (e.data.func === i) {
                o = false;
            }
            e.data.func();
        }
        if (o) {
            i();
        }
    }
    function i() {
        if (!o.neverClose) {
            o.close();
        }
    }
    this.$div = t;
    this.$bck = t.find(".bac");
    this.$scale = t.find(".scale");
    this.$box = t.find(".box");
    this.$pop = t.find(".pop");
    this.$pop.$title = t.find(".title");
    this.$pop.$text = t.find(".text");
    this.$pop.$content = t.find(".content");
    this.opened = false;
    this.neverClose = false;
    this.isOpen = function () {
        return o.opened;
    };
    this.open = function (e, a, s, r, l, c, u) {
        if (o.isOpen()) {
            removeInFocusHistory("popup-dialog");
            deleteFocus();
            o.killall();
        }
        t.on(pointerEventType.down, stopProp);
        o.opened = true;
        o.neverClose = !isnull(c) && c;
        e = isnull(e) ? "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod" : e;
        a = isnull(a) ? "Info" : a;
        s = isnull(s) ? ["Close"] : s;
        r = isnull(r) ? [i] : r;
        l = !isnull(l) && l;
        if (notnull(u)) {
            t.attr("data-name", u);
        }
        t.addClass("show");
        o.clean();
        o.$pop.$title.html(a);
        o.$pop.$text.html(e);
        for (var p = 0, d = s.length; p < d; p++) {
            var m = s[p];
            var f = $("<div class=\"bt bt-light\" id=\"bt-mini" + p + "\"></div>");
            (f = new CustomButton(f)).html("<div class=\"bck\"><div class=\"txt\">" + m + "</div></div><div class=\"hitzone\"></div>");
            f.on(pointerEventType.down, {
                func: r[p],
                bt: f
            }, n);
            o.$pop.$content.append(f);
        }
        if (l) {
            t.css({
                "z-index": "9999"
            });
        }
        o.fadeInBck();
        o.$box.removeClass("open close").addClass("open");
        createFocus("popup-dialog");
    };
    this.close = function (e) {
        if (notnull(e)) {
            e.preventDefault();
        }
        o.fadeOutBck();
        o.$box.removeClass("open close").addClass("close").one(animationEnd, function (e) {
            $(e.target).removeClass("close");
            t.removeClass("show");
            t.removeAttr("data-name");
            t.off();
            o.clean();
            o.opened = false;
            removeInFocusHistory("popup-dialog");
            createFocusFromHistory();
        });
    };
    this.killall = function () {
        removeInFocusHistory("popup-dialog");
        t.off();
        t.removeAttr("data-name");
        t.removeClass("show");
        o.clean();
        o.$box.removeClass("open close");
        resetAnimationCSS(o.$box[0]);
        o.$bck.removeClass("animateFadeIn animateFadeOut");
        resetAnimationCSS(o.$bck[0]);
        o.opened = false;
    };
    this.fadeInBck = function (e) {
        if (e) {
            o.$bck.addClass("mini");
        } else {
            o.$bck.removeClass("mini");
        }
        o.$bck.addClass("animateFadeIn");
    };
    this.fadeOutBck = function () {
        o.$bck.addClass("animateFadeOut").one(animationEnd, function (e) {
            $(e.target).removeClass("animateFadeIn animateFadeOut");
        });
    };
    this.clean = function () {
        o.$pop.$content.find(".bt").off();
        o.$pop.$content.empty();
        o.$pop.$title.empty();
        o.$pop.$text.empty();
    };
    return this;
}
function Popup(e) {
    var o;
    var t = this;
    var n = $(e);
    var i = n.find(".bac");
    var a = n.find(".box");
    var s = n.find(".bt.icon");
    var r = n.find(".container");
    var l = n.find(".box-tab .tab").length > 0;
    var c = true;
    var u = true;
    function p() {
        c = true;
        i.removeClass("animateFadeIn animateFadeOut");
        t.closeComplete();
    }
    function d(e) {
        u = true;
        a.removeClass("slideUp slideDown").get(0).offsetHeight;
        o.onBoxCloseEnd();
        t.closeComplete();
        tryfunc(e);
    }
    function m() {
        if (notnull(t.onCloseTab)) {
            t.onCloseTab();
        }
        n.find(".tab.active").removeClass("active");
        n.find(".pop.active").removeClass("active");
        var e = $(this);
        var o = n.find(".pop#" + e.attr("id").replace("tab-", "pop-"));
        e.addClass("active");
        o.addClass("active");
        createFocus(o.attr("id"));
    }
    this.$popup = n;
    this.$icon = s;
    this.$container = r;
    this.objCustom = o;
    this.open = function (e) {
        if (!(notnull(o) && e.name == o.name)) {
            if (!n.hasClass("show")) {
                n.addClass("show");
            }
            if (!i.hasClass("animateFadeIn")) {
                t.showBck();
            }
            if (a.hasClass("slideUp")) {
                t.hideBox(function () {
                    t.open(e);
                });
            } else {
                t.custom(e);
                t.showBox();
            }
        }
    };
    this.close = function (e) {
        t.hideBck(e);
        t.hideBox(null, e);
    };
    this.closeComplete = function () {
        if (c && u) {
            t.reinit();
            tryfunc(o.onCloseComplete);
            o = null;
        }
    };
    this.reinit = function () {
        if (!o.static) {
            r.empty();
        }
        n.removeClass("show mini info action action-back no-action");
        n.removeAttr("data-name");
        i.removeClass("animateFadeIn animateFadeOut");
        a.removeClass("slideUp slideDown").get(0).offsetHeight;
    };
    this.custom = function (e) {
        o = {
            static: e.static || false,
            bodyclose: e.bodyclose || false,
            bckclose: e.bckclose || false,
            name: e.name || "no-name",
            icntype: e.icntype || "",
            class: e.class || "",
            content: e.content || "",
            onBoxOpenStart: e.onBoxOpenStart || nada,
            onBoxOpenEnd: e.onBoxOpenEnd || nada,
            onBoxCloseStart: e.onBoxCloseStart || nada,
            onBoxCloseEnd: e.onBoxCloseEnd || nada,
            onCloseComplete: e.onCloseComplete || nada
        };
        n.removeClass("big column mini info action action-back no-action");
        n.addClass(o.class);
        n.attr("data-name", o.name);
        if (o.icntype != "") {
            n.addClass(o.icntype);
            s.find("svg use").attr("xlink:href", "#ic-" + (o.icntype == "action" ? "close" : o.icntype == "action-back" ? "navl" : "info"));
        }
        if (!o.static) {
            r.html(o.content);
        }
    };
    this.refresh = function () {
        if (notnull(o) && notnull(o.content)) {
            r.html(o.content);
        }
    };
    this.showBck = function () {
        c = false;
        i.addClass("animateFadeIn").one(animationEnd, function () { });
    };
    this.hideBck = function (e) {
        if (e === true) {
            p();
        } else {
            i.addClass("animateFadeOut").one(animationEnd, function () {
                p();
            });
        }
    };
    this.showBox = function () {
        u = false;
        o.onBoxOpenStart();
        if (l) {
            n.find(".box-tab .tab").first().trigger(pointerEventType.down.split(" ")[0]);
            deleteFocus();
        }
        a.addClass("slideUp").one(animationEnd, function () {
            if (o.bodyclose) {
                $body.on(pointerEventType.down, t.clickBck);
            }
            if (o.bckclose) {
                i.on(pointerEventType.down, t.close);
            }
            o.onBoxOpenEnd();
        });
    };
    this.hideBox = function (e, n) {
        if (o.bodyclose) {
            $body.off(pointerEventType.down, t.clickBck);
        }
        if (o.bckclose) {
            i.off(pointerEventType.down, t.close);
        }
        o.onBoxCloseStart();
        if (n === true) {
            d(e);
        } else {
            a.addClass("slideDown").one(animationEnd, function () {
                d(e);
            });
        }
    };
    this.clickBck = function (o) {
        o.preventDefault();
        if (!($(o.target).closest(e + " .box").length > 0)) {
            if (!l || (o = notnull((o = ~o.type.indexOf("touch") ? o.originalEvent : o).targetTouches) ? o.targetTouches[0] : o, Math.round(o.pageY) > 100)) {
                t.close();
            }
        }
    };
    this.isOpen = function () {
        return n.hasClass("show");
    };
    this.getName = function () {
        if (notnull(o) && notnull(o.name)) {
            return o.name;
        } else {
            return "";
        }
    };
    if (l) {
        n.find(".box-tab .tab").each(function (e) {
            $(this).on(pointerEventType.down, m);
        });
    }
    return this;
}
