/*
 * objects/bonus.js
 * BonusObject: a bonus (combo) - its button, unlock code check, video and sound.
 */

const defaultBonusSVG = "<svg viewBox=\"0 0 70 70\" xmlns=\"http://www.w3.org/2000/svg\"><path fill=\"#ffffff\" d=\"M 56.7 34.35Q 52.95 27.7 47.2 23.95 41.45 20.2 35.2 20.2 28.85 20.2 23.1 24 17.3 27.9 13.6 34.35 12.85 35.15 13.6 35.75 17.3 42.55 23.1 46.25 28.75 50 35.2 50 41.3 50 47.2 46.2 52.75 42.5 56.7 35.75 56.9 35.15 56.7 34.35M 35.2 28Q 38 28 40.2 30.2 42.2 32.2 42.2 35.1 42.2 38 40.2 40.1 38 42.25 35.2 42.25 32.2 42.25 30.1 40.1 28.1 38.2 28.1 35.1 28.1 32.25 30.2 30.2 32.35 28 35.2 28M 114.25 23.9Q 114.25 20.5 111.65 17.75 108.8 14.9 104.9 14.9 100.95 14.9 98.1 17.75 95.35 20.6 95.35 23.9L 95.35 29.25 92.75 29.25Q 91.85 29.25 91.1 30 90.45 30.6 90.45 31.55L 90.45 49Q 90.45 50 91.1 50.5 91.85 51.25 92.75 51.25L 117.15 51.25Q 118.1 51.25 118.75 50.5 119.45 49.95 119.45 49L 119.45 31.55Q 119.45 30.6 118.75 30 118.1 29.25 117.15 29.25L 114.25 29.25 114.25 23.9M 109.25 20.25Q 110.9 22.05 110.9 23.9L 110.9 29.25 98.85 29.25 98.85 23.9Q 98.85 21.95 100.5 20.25 102.25 18.3 104.9 18.3 107.4 18.3 109.25 20.25 Z\"/></svg>";
const lockedBonusSVG = "<svg viewBox=\"0 0 70 70\" xmlns=\"http://www.w3.org/2000/svg\"><path fill=\"#ffffff\" d=\"M 44.3 29.25L 44.3 23.9Q 44.3 20.5 41.7 17.75 38.85 14.9 34.95 14.9 31 14.9 28.15 17.75 25.4 20.6 25.4 23.9L 25.4 29.25 22.8 29.25Q 21.9 29.25 21.15 30 20.5 30.6 20.5 31.55L 20.5 49Q 20.5 50 21.15 50.5 21.9 51.25 22.8 51.25L 47.2 51.25Q 48.15 51.25 48.8 50.5 49.5 49.95 49.5 49L 49.5 31.55Q 49.5 30.6 48.8 30 48.15 29.25 47.2 29.25L 44.3 29.25M 40.95 23.9L 40.95 29.25 28.9 29.25 28.9 23.9Q 28.9 21.95 30.55 20.25 32.3 18.3 34.95 18.3 37.45 18.3 39.3 20.25 40.95 22.05 40.95 23.9M -52.7 37Q -52.5 36.4 -52.7 35.6 -56.45 28.95 -62.2 25.2 -67.95 21.45 -74.2 21.45 -80.55 21.45 -86.3 25.25 -92.1 29.15 -95.8 35.6 -96.55 36.4 -95.8 37 -92.1 43.8 -86.3 47.5 -80.65 51.25 -74.2 51.25 -68.1 51.25 -62.2 47.45 -56.65 43.75 -52.7 37M -69.2 31.45Q -67.2 33.45 -67.2 36.35 -67.2 39.25 -69.2 41.35 -71.4 43.5 -74.2 43.5 -77.2 43.5 -79.3 41.35 -81.3 39.45 -81.3 36.35 -81.3 33.5 -79.2 31.45 -77.05 29.25 -74.2 29.25 -71.4 29.25 -69.2 31.45 Z\"/></svg>";
function BonusObject(e, o, t) {
    const n = this;
    const i = e + 1;
    const a = $(`#bt-bonus-${i}`);
    const s = a.find(".quarter");
    const r = $(".circle", a);
    const l = $(`#box-video .video#video${i}`);
    const c = $(`#box-video .video#video${i} video`)[0];
    const u = new SoundObject("bonus" + i);
    const p = new SoundObject("aspire" + i);
    const d = new SoundObject("expire" + i);
    const shouldFade = o.fade || true;
    const m = t.snd;
    const f = t.aspire;
    const v = t.expire || "";
    const h = o.code;
    const b = h.length;
    const g = [];
    let x;
    let w = 0;
    let y = false;
    let k = 0;
    const T = a.find(".box-loader .zone");
    const C = T.find(".loader");
    const D = T.find(".bar");
    const S = new ClockObject("canvas-bt-bonus-" + i);
    S.init(43, 43, 1, 35, 16);
    this.$div = l;
    this.tabSVG = g;
    this.video = c;
    this.found = false;
    this.unlock = false;
    this.cntCode = 0;
    this.nbLoop = o.loop !== undefined ? o.loop : Array.isArray(app.nbloopbonus) ? app.nbloopbonus[e] : app.nbloopbonus !== undefined ? app.nbloopbonus : 1;
    this.sound = u;
    this.inprogress = false;
    /** True when the bonus video couldn't be loaded (loader.js): the bonus can be found but not played. */
    this.unavailable = typeof brokenBonusVideos !== "undefined" && brokenBonusVideos[e] !== undefined;
    this.init = function () {
        const e = storage.getItem("v" + appVersion + "-bonus-complete") || 0;
        if (n.getId() == 0 || n.getId() <= e) {
            n.unlockme();
        } else {
            n.lockme();
        }
        for (let e = 0; e < b; e++) {
            g.push({
                obj: $(`.svg.q${e + 1}`, s),
                col: $(`.svg.q${e + 1} svg`, s).css("fill")
            });
        }
        n.modeTouch();
        n.initBonusIcon();
        if (n.unavailable) {
            a.addClass("unavailable").attr("title", "This bonus's video is missing");
        }
    };
    this.reinit = function () {
        n.hideLoader();
        a.removeClass("inprogress found bounce");
        s.find(".svg").removeClass("directshow show hide");
        n.found = false;
        n.inprogress = false;
        n.cntCode = 0;
        n.modeTouch();
    };
    this.modeTouch = function () {
        a.off().on(pointerEventType.down, n.touchStart);
    };
    this.modeClick = function () {
        a.off().on(pointerEventType.down, n.launchVideo);
    };
    this.unlockme = function () {
        a.addClass("unlock");
        n.unlock = true;
    };
    this.lockme = function () {
        a.removeClass("unlock");
        n.unlock = false;
    };
    this.getId = function () {
        return i - 1;
    };
    this.getCode = function () {
        return h;
    };
    this.getFade = function () {
        return shouldFade;
    };
    this.showLoader = function () {
        y = true;
        C.addClass("show");
        D.css({
            "animation-duration": decimal(getRemainingTimeBeforeBonus() / 1000, 2) + "s"
        });
        D.addClass("progress");
    };
    this.hideLoader = function () {
        if (y) {
            y = false;
            C.removeClass("show");
            D.removeClass("progress");
        }
    };
    this.playAspiration = function (e = 0) {
        p.prepare(f, 0);
        p.play(e, true);
    };
    this.stopAspiration = function () {
        p.stop(true);
    };
    this.playExpire = function (e = 0) {
        if (v) {
            d.prepare(v);
            d.play(e, true);
            console.log("Expire sound played for bonusId:", i);
        } else {
            console.warn("No expire audio for bonusId:", i);
        }
    };
    this.stopExpire = function () {
        d.stop(true);
    };
    this.hasCode = function (e) {
        return h.includes(e);
    };
    this.checkCode = function (e, o) {
        const t = h.indexOf(e);
        if (t !== -1) {
            if (o) {
                n.showQuarter(t);
            } else {
                n.hideQuarter(t);
            }
        }
    };
    this.showQuarter = function (e) {
        n.cntCode++;
        const o = g[e];
        const t = o.obj;
        const i = o.col;
        if (n.cntCode === b && n.unlock) {
            n.hasBeenFound();
        }
        if (n.cntCode === 1) {
            n.inprogress = true;
            a.addClass("inprogress");
        }
        r.addClass("show").one(animationEnd, e => {
            $(e.target).removeClass("show");
        });
        r.css({
            "border-color": i
        });
        t.removeClass("hide").addClass("directshow show");
    };
    this.hideQuarter = function (e) {
        const o = g[e].obj;
        if (n.unlock) {
            o.addClass("hide").one(animationEnd, e => {
                $(e.target).removeClass("directshow show hide");
            });
        } else {
            o.removeClass("directshow show hide");
        }
        if (n.cntCode === b) {
            cancelClickBtBonus();
            n.notFoundAnymore();
        }
        n.cntCode = Math.max(0, n.cntCode - 1);
        if (n.cntCode === 0) {
            n.inprogress = false;
            a.removeClass("inprogress");
        }
    };
    this.hideClock = function () {
        S.stop(true);
    };
    this.render = function () {
        S.render();
    };
    this.hasBeenFound = function () {
        if (n.unavailable) {
            a.addClass("found");
            n.modeClick();
            n.found = true;
            return;
        }
        if (!modeReplay) {
            let e = `onV${appVersion}Bonus${i}Unlock`;
            window[e]?.();
            a.addClass("found bounce");
            popupBonusUnlocked();
        }
        n.modeClick();
        n.found = true;
    };
    this.notFoundAnymore = function () {
        if (!modeReplay) {
            a.removeClass("found bounce");
        }
        n.found = false;
        n.hideClock();
        n.hideLoader();
        n.modeTouch();
    };
    this.touchStart = function (e) {
        e.preventDefault();
        if (n.unlock && !bonusPlaying) {
            x = ~e.type.indexOf("touch") ? a : $body;
            x.on(pointerEventType.up, n.touchEnd);
            k = getTime();
            showPoloAndPictoInCombo(i);
        } else if (curBonus === n && bonusPlaying) {
            return;
        } else {
            popupFindPreviousBonus();
        }
    };
    let P = {};
    let A = false;
    document.addEventListener("keydown", function (e) {
        P[e.key] = true;
        A = !!P.Control;
    });
    document.addEventListener("keyup", function (e) {
        P[e.key] = false;
        A = false;
    });
    this.touchEnd = function (e) {
        e.preventDefault();
        x.off(pointerEventType.up, n.touchEnd);
        stopShowingPoloInArray(k);
        if (A && !n.inprogress) {
            e.preventDefault();
            for (let e = 0; e < n.getCode().length; e++) {
                let o = n.getCode()[e] - 1;
                setTimeout(() => {
                    forceAddPolo(e + (function () {
                        switch (n.getCode().length) {
                            case 1: return 3;
                            case 2:
                            case 3: return 2;
                            case 4:
                            case 5: return 1;
                            default: return 0;
                        }
                    })(), o);
                }, e * 30);
            }
        }
    };
    this.launchVideo = function () {
        if (n.unavailable) {
            if (!modeRandom && !modeReplay) {
                boxDialog.open(`Bonus ${i} can't play: its video is missing.`, "😕");
            }
            return;
        }
        if (!(bonusWaiting || bonusPlaying || !(!app.bonusloopA || boucleA || modeWatch || getRemainingTime() >= 500))) {
            n.modeTouch();
            n.showLoader();
            recordMix.xmlAction("bonus", n);
            clickBtBonus(i);
            a.removeClass("bounce");
            r.addClass("showCircle").one(animationEnd, e => {
                $(e.target).removeClass("showCircle");
            });
            n.prepareVideo(1);
        }
    };
    this.prepareVideo = function (e) {
        if (c.error) {
            c.load();
        }
        w = app.looptime * (e - 1) / 1000;
        c.currentTime = w;
    };
    this.videoPlaying = function () { };
    this.videoEnded = function () { };
    this.play = function () {
        let e = `onV${appVersion}Bonus${i}Start`;
        window[e]?.();
        console.log(e, "called for bonusId:", i);
        a.addClass("playing");
        n.hideLoader();
        S.start(loopDuration * n.nbLoop, false);
        u.prepare(m);
        u.play(w);
        l.addClass("show");
        c.play().then(() => { }).catch(e => {
            throw new Error(e);
        });
    };
    this.stop = function () {
        let e = `onV${appVersion}Bonus${i}End`;
        addToHistory("totalBonusesWatched");
        window[e]?.();
        console.log(e, "called for bonusId:", i);
        a.removeClass("playing");
        if (loopOn && n.found) {
            n.modeClick();
        }
        u.stop(true);
        S.stop(true);
        n.stopAspiration();
        l.removeClass("show");
        c.pause();
        curBonus.playExpire(0);
    };
    this.pause = function () {
        c.pause();
        S.pause();
    };
    this.resume = function () {
        c.play();
        S.resume();
    };
    this.initBonusIcon = function () {
        const e = a.find(".icon .icn-bck")[0];
        if (!e) {
            return;
        }
        const t = new Map();

        const bonusAssetId = (o.icon || o.src || (o.name && o.name.trim()) || "").trim();
        const basePath = isModboxApp ? `asset-v${appVersion}/bonus/${bonusAssetId}` : `asset-v${appVersion}/video/${o.icon}`;
        const extensions = [".svg", ".png", ".gif"];

        const hasExtension = (filename) => /\.[a-zA-Z0-9]+$/.test(filename);

        const n = e => new Promise((o, reject) => {
            if (t.has(e)) {
                o({ img: t.get(e), path: e });
                return;
            }
            const i = new Image();
            i.onload = () => {
                t.set(e, i);
                o({ img: i, path: e });
            };
            i.onerror = () => {
                var fallback = getAssetFallback(e);
                if (fallback) {
                    const fb = new Image();
                    fb.onload = () => {
                        t.set(e, fb);
                        o({ img: fb, path: fallback });
                    };
                    fb.onerror = () => reject(new Error(`Failed to load image: ${e}`));
                    fb.src = fallback;
                } else {
                    reject(new Error(`Failed to load image: ${e}`));
                }
            };
            i.src = e;
        });

        const tryLoadAsset = (path) => {
            if (!path || path.trim() === "") return Promise.reject("Empty path");
            if (hasExtension(path)) {
                return n(path);
            }

            return n(path + extensions[0])
                .catch(() => n(path + extensions[1]))
                .catch(() => n(path + extensions[2]));
        };

        const renderSVGString = (svgString) => {
            e.style.backgroundImage = "";
            e.innerHTML = svgString;
            console.log(`Bonus SVG rendered directly for bonus ${i}`);
        };

        const renderImage = (src) => {
            e.innerHTML = "";
            e.style.backgroundImage = `url('${src}')`;
            e.style.backgroundSize = "cover";
            e.style.backgroundPosition = "center";
            e.style.backgroundRepeat = "no-repeat";
            console.log(`Bonus icon loaded: ${src} for bonus ${i}`);
        };

        const s = () => {
            const t = a.hasClass("unlock");
            const s = o.icon && o.icon.trim() !== "";
            const hasSVG = o.svg && o.svg.trim() !== "";

            if (t) {
                if (s) {
                    tryLoadAsset(basePath).then((result) => {
                        renderImage(result.path);
                    }).catch(() => {
                        console.warn(`Failed to find icon file with any extension (.svg, .png, .gif) for: ${basePath}`);
                        if (hasSVG) {
                            renderSVGString(o.svg);
                        } else {
                            renderSVGString(defaultBonusSVG);
                        }
                    });
                }
                else if (hasSVG) {
                    renderSVGString(o.svg);
                }
                else {
                    renderSVGString(defaultBonusSVG);
                }
            } else {
                e.style.backgroundImage = "";
                e.innerHTML = lockedBonusSVG;
            }
        };

        if (o.icon && o.icon.trim() !== "") {
            tryLoadAsset(basePath).catch(() => {
                console.warn(`Failed to preload bonus icon with any extension: ${basePath}`);
            });
        }

        s();

        new MutationObserver(s).observe(a[0], {
            attributes: true,
            attributeFilter: ["class"]
        });
    };
    this.init();
}
