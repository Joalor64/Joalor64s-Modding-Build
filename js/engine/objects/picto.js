/*
 * objects/picto.js
 * PictoObject: a draggable icon of the bottom bar, and the pointer handling for dragging.
 */

var pointerList = [];
function enablePictoDraggable() {
    document.body.addEventListener(pointerEventType.down, pictoPointerDown);
    document.body.addEventListener(pointerEventType.up, pictoPointerUp);
    document.body.addEventListener(pointerEventType.cancel, pictoPointerUp);
    document.body.addEventListener(pointerEventType.leave, pictoPointerUp);
    document.body.addEventListener(pointerEventType.move, pictoPointerMove);
}
function pictoPointerDown(e) {
    var o;
    var t;
    var n;
    if (isPictoDiv(e)) {
        t = (o = "targetTouches" in e ? e.targetTouches[0] : e).target.parentNode.dataset.pictoNum;
        if (!((n = listPicto[t]).locked || (mouseX = o.pageX, mouseY = o.pageY, n.onDrag) || getIndexFromPointerList("pictoNum", t) != -1)) {
            e = {
                event: e,
                uniqueId: "identifier" in o ? o.identifier : o.pointerId,
                picto: n,
                pictoNum: t,
                dropForced: false
            };
            if (n.used) {
                n.usedTouchStart();
            } else {
                n.startDrag();
                n.moveDrag(o.pageX, o.pageY);
                poloStartWatchPicto();
            }
            pointerList.push(e);
        }
    }
}
function pictoPointerUp(e) {
    var o;
    if (pointerList.length && (e = getIndexFromPointerList("uniqueId", (e = "changedTouches" in e ? e.changedTouches[0] : e)["identifier" in e ? "identifier" : "pointerId"])) >= 0) {
        if ((o = pointerList[e].picto).used) {
            o.usedTouchEnd();
        } else {
            o.stopDrag();
            pictoOnDrop(o, pointerList[e].dropForced);
        }
        if (pointerList.length == 1) {
            poloStopWatchPicto();
        }
        pointerList.splice(e, 1);
    }
}
function pictoForceOnDrop() {
    for (; pointerList.length;) {
        var e = pointerList[0];
        e.dropForced = true;
        pictoPointerUp(e.event);
    }
}
function pictoPointerMove(e) {
    var o;
    if (pointerList.length && (o = getIndexFromPointerList("uniqueId", (e = "targetTouches" in e ? e.targetTouches[0] : e)["identifier" in e ? "identifier" : "pointerId"])) >= 0 && (o = pointerList[o].picto).onDrag) {
        o.moveDrag(e.pageX, e.pageY);
        checkPictoHoverPolo(o);
        mouseX = pointerList[pointerList.length - 1].picto.pointerAxis.px;
        mouseY = pointerList[pointerList.length - 1].picto.pointerAxis.py;
    }
}
function isPictoDiv(e) {
    return e.target.classList.contains("hitzone") && e.target.parentNode.classList.contains("picto");
}
function getIndexFromPointerList(e, o) {
    return pointerList.findIndex(t => t[e] == o);
}
function PictoObject(e, o) {
    var t;
    var n = this;
    var i = o.find("#picto" + e);
    var a = 0;
    var s = isMobile ? 1.1 : 1.2;
    this.id = e;
    this.ignored = app.animearray[n.id].ignored || false;
    this.used = false;
    this.locked = false;
    this.onDrag = false;
    this.polo = null;
    this.pointerAxis = {
        px: 0,
        py: 0
    };
    if (this.ignored) {
        i.addClass("ignored");
    } else {
        this.startDrag = function () {
            t = i[0].getBoundingClientRect();
            n.onDrag = true;
            i.removeClass("flashme");
            i.addClass("drag");
        };
        this.moveDrag = function (e, o) {
            n.setTranslation(e, o);
        };
        this.stopDrag = function () {
            n.onDrag = false;
            i.removeClass("drag");
        };
        this.replacer = function () {
            n.locked = true;
            i.addClass("replacer").one(animationEnd, n.replacerFini);
        };
        this.absorber = function (e) {
            i.css({
                transform: "translate3d(0px, 0px, 0px)"
            });
            i.removeClass("replacer");
            i.addClass("griser");
            addToHistory("totalPolosUsed");
            n.used = true;
            n.polo = e;
        };
        this.reactiver = function (e) {
            n.locked = true;
            e = !!notnull(e) && e;
            i.removeClass("griser");
            n.polo = null;
            if (!e || modeRandom || modeReplay) {
                n.replacerFini();
            } else {
                i.addClass("flashme").one(animationEnd, function (e) {
                    $(e.target).removeClass("flashme");
                    n.replacerFini();
                });
            }
        };
        this.replacerFini = function () {
            i.removeClass("replacer");
            i.css({
                transform: "translate3d(0px, 0px, 0px)"
            });
            n.used = false;
            n.locked = false;
            n.pointerAxis = {
                px: 0,
                py: 0
            };
        };
        this.usedTouchStart = function () {
            a = getTime();
            showPoloInArray([n.polo.id]);
        };
        this.usedTouchEnd = function () {
            stopShowingPoloInArray(a);
            a = 0;
        };
        this.checkusedTouchStart = function () {
            if (a != 0) {
                n.usedTouchEnd();
            }
        };
        this.hideYourself = function () {
            i.addClass("hideYourself");
        };
        this.stopHiddingYourself = function () {
            i.removeClass("hideYourself");
        };
        this.setTranslation = function (e, o) {
            n.pointerAxis = {
                px: e,
                py: o
            };
            e -= t.x;
            o -= t.y;
            e -= t.width / 2;
            o -= t.width / s;
            i.css({
                transform: "translate3d(" + e + "px, " + o + "px, 0px)"
            });
        };
    }
}
