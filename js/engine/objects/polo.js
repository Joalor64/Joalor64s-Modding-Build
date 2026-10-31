/*
 * objects/polo.js
 * PoloObject: one character on the stage - sprites, eyes, animations, startup/exit animations,
 * hats, hover, mute/solo, drawing on the canvas.
 */

function PoloObject(e, o) {
    var t;
    this.sound = new SoundObject("polo" + e);
    this.lastShakeTime = 0;
    var n;
    var i = false;
    n = animSize == 1 ? 2 : 1; // is this something???
    this.shakeTimer = 0;
    this.lastShake = 0;
    this.targetShake = 0;
    this.shakeAnimPolo = 0;
    var a;
    var s;
    var r;
    var l;
    var c;
    var u;
    var p;
    var d;
    var m;
    var f;
    var v;
    var h;
    var b;
    var g;
    var x;
    var w;
    var y;
    var k;
    var T;
    var C;
    var D;
    var S;
    var P;
    var A;
    var B;
    var E;
    var F;
    var M;
    var L;
    var R;
    var I;
    var O;
    var H;
    var W;
    var z;
    var N = 0;
    var j = 0;
    var V = this;
    var X = false;
    var Y = 328;
    var U = 426;
    var G = 0;
    var _ = 0;
    var q = 0;
    var Q = 0;
    var K = null;
    var cl;
    var cv;
    var cd;
    var ca;
    var cb;
    var cx;
    var cy;
    var JJ;
    var coverWidth;
    var coverWidth2;
    var coverHeight;
    var coverHeight2;
    var ud;
    var av;
    var vs;
    var inHabiller = false;
    var waitingPictoOffsetY;
    var hasStartTween;
    var Z = $("#box-polo").find(".polo[data-polo-id='" + e + "']");
    var J = $("#box-loader-polo").find(".zone[data-polo-id='" + e + "']");
    var ee = J.find(".loader");
    var oe = J.find(".bar");
    var te = false;
    var ne = o;
    var ie = "";
    var ae = false;
    var se = listImages.spritePolo;
    this.sprite = se;
    eft = 2;
    this.setSprite = function (e) {
        let o = renameFile(e);
        e = `./img/${o}`;
        const t = new Image();
        t.onload = () => {
            this.sprite = t;
            se = t;
        };
        t.onerror = () => {
            console.error(`Failed to load sprite image: ${e}`);
            boxDialog?.open?.(`Failed to load polo sprite image: [${e}]`, "😢");
        };
        t.src = e;
    };
    if (modPoloMaps[`v${appVersion}`] && modPoloMaps["v" + appVersion].length > 0) {
        const o = modPoloMaps["v" + appVersion].find(o => parseInt(o.id) === e);
        if (o) {
            this.setSprite(o.normal);
        }
    }
    this.getPoloShakeAnim = function (e = 5) {
        if (V.shakeAnimPolo === 0) {
            return 0;
        } else {
            V.shakeTimer += e;
            if (V.shakeTimer >= 1) {
                V.shakeTimer = 0;
                V.lastShake = V.targetShake;
                V.targetShake = Math.random() * V.shakeAnimPolo * 2 - V.shakeAnimPolo;
            }
            return V.lastShake + (V.targetShake - V.lastShake) * V.shakeTimer;
        }
    };
    var re = be;
    var le = 0.5;
    var ce = 0;
    var ue = false;
    this.id = e;
    currentPoloId = e;
    this.state = "normal";
    var pe;
    var de = Z.find(".ctrl");
    var me = 100;

    V.startupPlayed = false;
    V.startupActive = false;
    V.startupFrame = 0;
    V.startupData = null;
    V.startupImg = null;
    V.startupStartTime = 0;
    V.exitActive = false;
    V.exitImg = null;
    V.exitData = null;
    V.exitStartTime = 0;
    V.exitSnapshot = null;
    V.isExitingNow = false;

    function fe() { // default polo waiting body
        var localW = (V.myPoloW !== undefined) ? V.myPoloW : drawPoloW;
        var localH = (V.myPoloH !== undefined) ? V.myPoloH : drawPoloH;
        var localCropW = (V.myCropW !== undefined) ? V.myCropW : cropPoloW;
        var localCropH = (V.myCropH !== undefined) ? V.myCropH : cropPoloH;
        var shift = (V.myShiftX !== undefined) ? V.myShiftX : 0;
        var shiftY = (V.myShiftY !== undefined) ? V.myShiftY : 0;

        ne.globalAlpha = 1;
        ne.drawImage(se, 0, 0, localCropW, localCropH, (V.drawPoloX - shift) + me, (V.drawPoloY + shiftY) + pe, localW, localH);
    }

    function ve(e, o) { // polo eyes
        var localEyeY = (V.myEyeY !== undefined) ? V.myEyeY : drawEyeY;
        var localCropEyeW = (V.myCropEyeW !== undefined) ? V.myCropEyeW : cropEyeW;
        var localCropEyeH = (V.myCropEyeH !== undefined) ? V.myCropEyeH : cropEyeH;
        var localDrawEyeW = (V.myEyeW !== undefined) ? V.myEyeW : drawEyeW;
        var localDrawEyeH = (V.myEyeH !== undefined) ? V.myEyeH : drawEyeH;
        var shift = (V.myShiftX !== undefined) ? V.myShiftX : 0;
        var shiftY = (V.myShiftY !== undefined) ? V.myShiftY : 0;
        ne.drawImage(se, e, o, localCropEyeW, localCropEyeH, (V.drawPoloX - shift) + me, (V.drawPoloY + shiftY) + localEyeY + pe, localDrawEyeW, localDrawEyeH);
    }

    function he() { // default polo shadow
        var localW = (V.myPoloW !== undefined) ? V.myPoloW : drawPoloW;
        var localH = (V.myPoloH !== undefined) ? V.myPoloH : drawPoloH;
        var localCropW = (V.myCropW !== undefined) ? V.myCropW : cropPoloW;
        var localCropH = (V.myCropH !== undefined) ? V.myCropH : cropPoloH;
        var shift = (V.myShiftX !== undefined) ? V.myShiftX : 0;
        var shiftY = (V.myShiftY !== undefined) ? V.myShiftY : 0;

        ne.globalAlpha = 1 - le;
        ne.drawImage(se, localCropW, 0, localCropW, localCropH, (V.drawPoloX - shift) + me, (V.drawPoloY + shiftY) + pe, localW, localH);
    }

    function be() {
        var localEyeX = (V.myEyeX !== undefined) ? V.myEyeX : cropEyeX;
        var localCropEyeY = (V.myCropEyeY !== undefined) ? V.myCropEyeY : cropEyeY;
        fe();
        ve(localEyeX, localCropEyeY);
        he();
    }

    function xe() {
        if (!expEventsOn) {
            return;
        }
        if (!(eventHatTesterMode || K && X && specialEventNow)) {
            return;
        }
        if (V && V.hatAnimOffset !== undefined) {
            V.hatAnimOffset;
        }
        if (V && V.poloHeadImpactOffset !== undefined) {
            V.poloHeadImpactOffset;
        }
        if (X) {
            let e = q || 0;
            let o = Q || 0;
            if (V.state !== "anime") {
                e = 0;
                o = 0;
            }
            o += N;
            const t = V.drawPoloX + me + e;
            const n = V.drawPoloY + pe + o;
            const i = Y;
            const a = U;
            const s = G;
            const r = _;
            const l = i * poloRatio * cnvPXD / animSize;
            const c = a * poloRatio * cnvPXD / animSize;
            if (!K || typeof K == "string") {
                console.log("Loading hat sprite...");
                const e = new Image();
                e.src = renameFile(eventHatSrc);
                e.onload = function () {
                    K = e;
                    console.log("Hat sprite loaded successfully");
                    if (X && K && !V.hatAnimationActive) {
                        setTimeout(function () {
                            if (!V.hatAnimationActive) {
                                V.startHatAnimation();
                            }
                        }, 100);
                    }
                };
                e.onerror = function () {
                    console.error("Failed to load hat sprite");
                };
                return;
            }
            const u = ne.globalAlpha;
            ne.globalAlpha = 1;
            if (V.state === "mute" || V.state === "unhide" || V.state === "waiting") {
                ne.drawImage(K, s, r, i, a, t, n, l, c);
            } else {
                ne.drawImage(K, s, r, i, a, t + getRealisticShake() + V.getPoloShakeAnim(), n + getRealisticShake() + V.getPoloShakeAnim(), l, c);
            }
            if (V.state === "mute" || V.state === "unhide") {
                ne.globalAlpha = 0.7;
                ne.drawImage(K, animSize * 164, r, i, a, t, n, l, c);
            } else if (V.state === "hide") {
                ne.globalAlpha = 1;
                ne.drawImage(K, animSize * 164, r, i, a, t, n, l, c);
            }
            ne.globalAlpha = u;
        }
    }

    const CROP_TOP = 1;
    const startupOffsetX = isHDMode() ? 1 : 2;
    const startupOffsetY = isHDMode() ? 1 : 2;

    function we(skipRestore) { // waiting polo thing
        ne.globalAlpha = 1;
        ne.save();

        ofs();

        if (V.renderWaitingBody) {
            AnimeBody();
        }

        if (M) {
            ge(true);
        }

        if (V.startupActive) {
            V.startupFrameCount = (V.startupFrameCount || 0) + 1;
        } else {
            V.startupFrameCount = 0;
        }

        if (V.startupActive && V.startupImg && V.startupImg.complete && V.startupData?.length) {
            const elapsed = performance.now() - V.startupStartTime;
            const STARTUP_FPS = 24;
            const frameDur = 1000 / STARTUP_FPS;
            const currentFrame = Math.floor(elapsed / frameDur);

            if (currentFrame >= V.startupData.length) {
                V.startupActive = false;
                V.startupPlayed = true;
            } else {
                const f = V.startupData[currentFrame];

                const destW = f.w * poloRatio * n;
                const destH = f.h * poloRatio * n;

                const waitingDrawH = av.drawH + V.waitingHeight * poloRatio * n;
                const waitingYOffset = V.waitingHeight * poloRatio * n;
                const yPos = pe - waitingYOffset - (destH - waitingDrawH) / 2 + startupOffsetY;

                const waitingDrawW = drawAnimW + V.waitingWidth * poloRatio * n;
                const waitingXOffset = V.waitingWidth * poloRatio * n;
                const xPos = me - waitingXOffset - (destW - waitingDrawW) / 2 - startupOffsetX;

                let imageToDraw = V.startupImg;
                let alpha = 1;

                if (x === true) {
                    if (V.startupShadowImg && V.startupShadowImg.complete) {
                        imageToDraw = V.startupShadowImg;
                        alpha = 1;
                    } else {
                        imageToDraw = V.startupImg;
                        alpha = 0.5;
                    }
                } else if (b === true) {
                    imageToDraw = V.startupImg;
                    alpha = 1;
                }

                if (alpha !== 1) {
                    ne.save();
                    ne.globalAlpha = alpha;
                    ne.drawImage(imageToDraw, f.x, f.y + CROP_TOP, f.w, f.h, xPos, yPos, destW, destH);
                    ne.restore();
                } else {
                    ne.drawImage(imageToDraw, f.x, f.y + CROP_TOP, f.w, f.h, xPos, yPos, destW, destH);
                }

                ne.restore();
                return;
            }
        }

        if (!p || !p.complete || p.naturalWidth === 0) {
            ne.restore();
            return;
        }

        ne.drawImage(p, JJ, JJ, cropAnimW + V.waitingWidth, av.cropH + V.waitingHeight, me - V.waitingWidth * poloRatio * n / 2, pe - V.waitingHeight * poloRatio * n, drawAnimW + V.waitingWidth * poloRatio * n, av.drawH + V.waitingHeight * poloRatio * n);

        if (!M) {
            ge(true);
        }
        if (!skipRestore) {
            ne.restore();
        }
    }

    function $ex(ignoreMuteCheck) { // exit animation
        if (!V.exitActive || !V.exitSnapshot) return;

        const snap = V.exitSnapshot;
        if (!snap.img || !snap.img.complete) return;

        if (b && !ignoreMuteCheck) {
            $exMute();
            return;
        } else if (x && snap.shadowImg && snap.shadowImg.complete) {
            $exShadow();
            return;
        }

        ne.globalAlpha = 1;
        ne.save();

        const EXIT_FPS = 24;
        const elapsed = performance.now() - V.exitStartTime;
        const frameDur = 1000 / EXIT_FPS;
        const currentFrame = Math.floor(elapsed / frameDur);
        const maxFrames = snap.data ? snap.data.length : 0;

        if (currentFrame < maxFrames) {
            const fData = snap.data[currentFrame];
            if (!fData) {
                V.exitActive = false;
                V.exitSnapshot = null;
                ne.restore();
                return;
            }

            const drawW = fData.w * poloRatio * n;
            const drawH = fData.h * poloRatio * n;

            ne.drawImage(snap.img, fData.x, fData.y, fData.w, fData.h, snap.drawX + me - snap.wWidth / 2 - 1, snap.drawY + pe - snap.wHeight + 1, drawW, drawH);

            if (!M) ge();
            ne.restore();
        } else {
            V.exitActive = false;
            V.exitSnapshot = null;
            ne.restore();
            V.finishExit();
        }
    }

    function $exMute() { // exit mute
        if (!V.exitActive || !V.exitSnapshot) return;

        const snap = V.exitSnapshot;
        const targetSheet = (snap.shadowImg && snap.shadowImg.complete) ? snap.shadowImg : snap.img;
        if (!targetSheet || !targetSheet.complete) return;

        $ex(true);
        ne.save();

        const EXIT_FPS = 24;
        const elapsed = performance.now() - V.exitStartTime;
        const frameDur = 1000 / EXIT_FPS;
        const currentFrame = Math.floor(elapsed / frameDur);
        const maxFrames = snap.data ? snap.data.length : 0;

        if (currentFrame < maxFrames) {
            const fData = snap.data[currentFrame];
            if (!fData) {
                V.exitActive = false;
                V.exitSnapshot = null;
                ne.restore();
                return;
            }

            const drawW = fData.w * poloRatio * n;
            const drawH = fData.h * poloRatio * n;

            ne.globalAlpha = 0.7;
            ne.drawImage(targetSheet, fData.x, fData.y, fData.w, fData.h, snap.drawX + me - snap.wWidth / 2 - 1, snap.drawY + pe - snap.wHeight + 1, drawW, drawH);

            if (!M) ge();
            ne.restore();
        } else {
            V.exitActive = false;
            V.exitSnapshot = null;
            ne.restore();
            V.finishExit();
        }
    }

    function $exShadow() { // exit shadow
        if (!V.exitActive || !V.exitSnapshot) return;

        const snap = V.exitSnapshot;
        if (!snap.shadowImg || !snap.shadowImg.complete) return;

        ne.save();

        const EXIT_FPS = 24;
        const elapsed = performance.now() - V.exitStartTime;
        const frameDur = 1000 / EXIT_FPS;
        const currentFrame = Math.floor(elapsed / frameDur);
        const maxFrames = snap.data ? snap.data.length : 0;

        if (currentFrame < maxFrames) {
            const fData = snap.data[currentFrame];
            if (!fData) {
                V.exitActive = false;
                V.exitSnapshot = null;
                ne.restore();
                return;
            }

            const drawW = fData.w * poloRatio * n;
            const drawH = fData.h * poloRatio * n;

            ne.globalAlpha = b ? 0.7 : 1;
            ne.drawImage(snap.shadowImg, fData.x, fData.y, fData.w, fData.h, snap.drawX + me - snap.wWidth / 2 - 1, snap.drawY + pe - snap.wHeight + 1, drawW, drawH);

            if (!M) ge();
            ne.restore();
        } else {
            V.exitActive = false;
            V.exitSnapshot = null;
            ne.restore();
            V.finishExit();
        }
    }

    function ye() { // mute thing
        if (M) ge(true);
        const STARTUP_FPS = 24;

        if (V.startupActive) {
            we();

            const elapsed = performance.now() - V.startupStartTime;
            const frameDur = 1000 / STARTUP_FPS;
            const frame = Math.floor(elapsed / frameDur);

            if (frame < V.startupData.length) {
                const f = V.startupData[frame];

                const drawW = f.w * poloRatio * n;
                const drawH = f.h * poloRatio * n;

                ne.save();
                ne.globalAlpha = 0.7;
                ne.drawImage(V.startupShadowImg, f.x, f.y + CROP_TOP, f.w, f.h, V.drawPoloX + me - V.waitingWidth / 2 - 1, V.drawPoloY + pe - V.waitingHeight + 1, drawW, drawH);
                ne.restore();

                if (!M) ge();
                xe();
                return;
            } else {
                V.startupActive = false;
            }
        }
        we(true);
        ne.globalAlpha = 0.7;
        ne.drawImage(p, JJ * 3 + cropAnimW * 2 + V.waitingWidth * 2, JJ, cropAnimW + V.waitingWidth, av.cropH + V.waitingHeight, me - V.waitingWidth * poloRatio * n / 2, pe - V.waitingHeight * poloRatio * n, drawAnimW + V.waitingWidth * poloRatio * n, av.drawH + V.waitingHeight * poloRatio * n);
        ne.restore();
        if (!M) {
            ge();
        }
        xe();
    }

    function ke() { // polo shadow / hide
        xe();
        if (M) ge();

        if (V.startupActive && V.startupShadowImg?.complete && V.startupData?.length) {
            const elapsed = performance.now() - V.startupStartTime;
            const STARTUP_FPS = 24;
            const frame = Math.floor(elapsed / (1000 / STARTUP_FPS));

            if (frame < V.startupData.length) {
                const f = V.startupData[frame];
                const drawW = f.w * poloRatio * n;
                const drawH = f.h * poloRatio * n;

                ne.save();
                ne.globalAlpha = b ? 0.7 : 1;
                ne.drawImage(V.startupShadowImg, f.x, f.y + CROP_TOP, f.w, f.h, V.drawPoloX + me - V.waitingWidth / 2 - 1, V.drawPoloY + pe - V.waitingHeight + 1, drawW, drawH);
                ne.restore();

                if (!M) ge();
                return;
            }
        }

        we();
        ce = 1;
        ne.save();
        ne.globalAlpha = ce;
        ofs();
        ne.drawImage(p, JJ * 3 + cropAnimW * 2 + V.waitingWidth * 2, JJ, cropAnimW + V.waitingWidth, av.cropH + V.waitingHeight, me - V.waitingWidth * poloRatio * n / 2, pe - V.waitingHeight * poloRatio * n, drawAnimW + V.waitingWidth * poloRatio * n, av.drawH + V.waitingHeight * poloRatio * n);
        ne.restore();

        if (!M) ge();
    }

    function $e() {
        xe();
        if (M) {
            ge();
        }
        we();
        var e = b ? 0.7 : 0;
        ce = ce <= e ? e : decimal(ce - 0.1, 2);
        ne.save();
        ne.globalAlpha = ce;

        ofs();
        ne.drawImage(p, JJ * 3 + cropAnimW * 2 + V.waitingWidth * 2, JJ, cropAnimW + V.waitingWidth, av.cropH + V.waitingHeight, me - V.waitingWidth * poloRatio * n / 2, pe - V.waitingHeight * poloRatio * n, drawAnimW + V.waitingWidth * poloRatio * n, av.drawH + V.waitingHeight * poloRatio * n);

        ne.restore();

        if (!M) {
            ge();
        }

        if (ce <= e) {
            V.stopHidingYourselfComplete();
        }
    }

    function Te() { // anime part
        if (d) {
            be();
        } else {
            V.anime();
            ne.globalAlpha = 1;
            ne.save();

            ofs();

            if (M) {
                ge(true);
            }
            if (L == "true") {
                AnimeBody();
            }
            const mainRelX = k + getRealisticShake() + me + V.getPoloShakeAnim() - V.waitingWidth * poloRatio * n / 2;
            const mainRelY = T + 1 + getRealisticShake() + pe + V.getPoloShakeAnim();
            let headScaleAnim = av.scaleData ? (av.scaleData[Math.min(frame, av.scaleData.length - 1)] || 1) : 1;
            let scaledDrawAnimW = (drawAnimW + V.waitingWidth * poloRatio * n) * headScaleAnim;
            let scaledY = (y - 1) * headScaleAnim;
            let scaledMainRelX = mainRelX - (scaledDrawAnimW - (drawAnimW + V.waitingWidth * poloRatio * n)) / 2;
            let headRotateAnim = av.rotateData ? (av.rotateData[Math.min(frame, av.rotateData.length - 1)] || 0) : 0;
            const headRotateRad = headRotateAnim * Math.PI / 180 + (V.drawPoloHeadR || 0);
            if (headRotateRad !== 0) {
                const centerX = scaledMainRelX + scaledDrawAnimW / 2;
                const centerY = mainRelY + scaledY / 2;
                ne.translate(centerX, centerY);
                ne.rotate(headRotateRad);
                ne.translate(-centerX, -centerY);
            }
            ne.drawImage(p, D, S + 1 + V.waitingHeight, cropAnimW + V.waitingWidth, C - 1, scaledMainRelX, mainRelY, scaledDrawAnimW, scaledY);
            if (!M) {
                ge(true);
            }
            ne.restore();
            if (V.hatAnimationPlayed) {
                xe();
            }
            if (cv == "true") {
                var centerX = V.drawPoloX + me + drawPoloW / 2;
                var centerY = V.drawPoloY + pe + drawPoloH / 2;
                var coverDrawX = Math.round(centerX + cx - coverWidth2 / 2);
                var coverDrawY = Math.round(centerY + cy - coverHeight2 / 2 - 20);
                ne.drawImage(p, ca, cb, coverWidth, coverHeight, coverDrawX, coverDrawY, coverWidth2, coverHeight2);
            }
        }
    }

    function Ce() {
        var e = timenow - S;
        var localEyeX = (V.myEyeX !== undefined) ? V.myEyeX : cropEyeX;
        var localCropEyeH = (V.myCropEyeH !== undefined) ? V.myCropEyeH : cropEyeH;
        e = Math.floor(e * Pe);
        e = P - 1 < e ? P - 1 : e;
        fe();
        ve(localEyeX, Be[e] * localCropEyeH);
        he();
        if (P - 1 <= e) {
            V.mode("normal");
        }
    }

    function De() { // pupils my ahh
        var localCropEyelidX = (V.myCropEyelidX !== undefined) ? V.myCropEyelidX : cropEyelidX;
        var localEyelid1Y = (V.myEyelid1Y !== undefined) ? V.myEyelid1Y : cropEyelid1Y;
        var localEyelid2Y = (V.myEyelid2Y !== undefined) ? V.myEyelid2Y : cropEyelid2Y;
        var localEyelid3Y = (V.myEyelid3Y !== undefined) ? V.myEyelid3Y : cropEyelid3Y;
        var localEyelid4Y = (V.myEyelid4Y !== undefined) ? V.myEyelid4Y : cropEyelid4Y;
        var e;
        var o;
        if (h) {
            Te();
        } else {
            fe();

            var myDist = V.maxPupMove || drawMaxPupMove;

            o = V.getPupPos(V.myPup1X || drawPup1X, V.myPup1Y || drawPup1Y, myDist);
            e = V.getPupPos(V.myPup2X || drawPup2X, V.myPup2Y || drawPup2Y, myDist);

            if (V.pupilType === "svg") {
                ne.beginPath();
                ne.fillStyle = V.pupilColor || "#000000";
                ne.ellipse(o[0], o[1], V.myPupilW, V.myPupilH, 0, 0, 2 * drawPupW);
                ne.ellipse(e[0], e[1], V.myPupilW, V.myPupilH, 0, 0, 2 * drawPupW);
                ne.fill();
                ne.closePath();
            } else {
                ne.drawImage(se, 0, cropPupY, cropPupW, cropPupW, o[0], o[1], drawPupW, drawPupW);
                ne.drawImage(se, 0, cropPupY, cropPupW, cropPupW, e[0], e[1], drawPupW, drawPupW);
            }

            if ((o = (mouseY - canvasBound.top) * cnvPXD) < V.drawPoloY + poloRatio * 90 * cnvPXD) {
                ve(localCropEyelidX, localEyelid4Y);
            } else if (o >= V.drawPoloY + poloRatio * 90 * cnvPXD && o < V.drawPoloY + poloRatio * 130 * cnvPXD) {
                ve(localCropEyelidX, localEyelid3Y);
            } else if (o >= V.drawPoloY + poloRatio * 170 * cnvPXD) {
                ve(localCropEyelidX, localEyelid2Y);
            } else {
                ve(localCropEyelidX, localEyelid1Y);
            }
        }
    }

    function Se() {
        De();
    }

    function Ae() {
        De();
        he();
    }

    function AnimeBody() {
        const relX = V.getPoloShakeAnim ? getRealisticShake() + me + V.getPoloShakeAnim() - V.waitingWidth * poloRatio * n / 2 : me - V.waitingWidth * poloRatio * n / 2;
        const relY = getRealisticShake() + pe + V.getPoloShakeAnim() - V.waitingHeight * poloRatio * n;
        var offX = (V.movingStaticBody && !V.onlyYBody && V.state === "anime") ? ((V.invertXBody) ? -k : k) : 0;
        var offY = (V.movingStaticBody && !V.onlyXBody && V.state === "anime") ? ((V.invertYBody) ? -T : T) : 0;
        ne.drawImage(p, (2 * JJ) + cropAnimW + V.waitingWidth, JJ, cropAnimW + V.waitingWidth, av.cropH + V.waitingHeight, offX + relX, offY + relY, drawAnimW + V.waitingWidth * poloRatio * n, av.drawH + V.waitingHeight * poloRatio * n);
    }

    function ge() {
        if (V.state === "anime" && B && W && z) {
            const e = me + O;
            const o = pe + H;
            const n = t || p;
            ne.save();
            ne.drawImage(n, R, I, E, F, e + getRealisticShake() + V.getPoloShakeAnim(), o + getRealisticShake() + V.getPoloShakeAnim(), W, z);
            ne.restore();
        }
    }

    function ofs() { // better offset checker omg than rems one for taller polos
        const isModern = av.version === "3"; // basically a check for swftospritev3 to PREVENT IncredJSON Polos from interfering like MBAO for instance

        const scale = poloRatio * n;

        const finalY = isModern ? (V.offY || 0) * scale : 0;

        if (ud) {
            ne.translate(V.drawPoloX + 205 + drawAnimW, V.drawPoloY + av.drawH / 1.4);
            ne.rotate(Math.PI);
        } else {
            ne.translate(V.drawPoloX, V.drawPoloY + finalY);
        }
    }

    pe = window.innerHeight < 500 ? 20 : window.innerHeight < 700 ? 15 : 10;
    V.hatAnimationActive = false;
    V.hatAnimOffset = 0;
    V.poloHeadImpactOffset = 0;
    this.startHatAnimation = function () {
        if ((V.hatAnimationActive || V.hatAnimationPlayed || !eventHatTesterMode) && !specialEventNow) {
            return;
        }
        V.hatAnimationActive = true;
        const e = {
            hatOffset: randomRangeInt(-620, -600),
            headOffset: 0
        };
        TweenMax.to(e, 0.5, {
            hatOffset: 0,
            ease: Quint.easeIn,
            onUpdate: function () {
                V.hatAnimationPlayed = true;
                V.hatAnimOffset = e.hatOffset;
                N = e.hatOffset;
            },
            onComplete: function () {
                TweenMax.to(e, 0, {
                    hatOffset: 20,
                    headOffset: 14,
                    ease: Quint.easeOut,
                    onUpdate: function () {
                        V.hatAnimOffset = e.hatOffset;
                        V.poloHeadImpactOffset = e.headOffset;
                        N = e.hatOffset;
                        j = e.headOffset;
                    },
                    onComplete: function () {
                        TweenMax.to(e, 0.6, {
                            hatOffset: 0,
                            headOffset: 0,
                            ease: Quint.easeOut,
                            onUpdate: function () {
                                V.hatAnimOffset = e.hatOffset;
                                V.poloHeadImpactOffset = e.headOffset;
                                N = e.hatOffset;
                                j = e.headOffset;
                            },
                            onComplete: function () {
                                V.hatAnimationActive = false;
                            }
                        });
                    }
                });
            }
        });
    };
    this.$btcMute = Z.find(".icon-game-bt-mute");
    this.$btcSolo = Z.find(".icon-game-bt-solo");
    this.$btcStop = Z.find(".icon-game-bt-delete");
    this.$btcDelay = Z.find(".icon-game-bt-delete-next");
    this.removalPending = false;
    this.setRemovalPending = function (flag) {
        flag = !!flag;
        if (V.removalPending === flag) return;
        V.removalPending = flag;
        Z.toggleClass("remove-pending", flag);
        J.toggleClass("remove-pending", flag);
        V.$btcDelay.toggleClass("light", flag);
        if (flag) {
            V.showLoader();
        } else if (v) {
            V.hideLoader();
        }
    };
    this.pictoHoverId = null;
    this.reinit = function () {
        Fe();
        V.draw();
        ue = false;
        V.pictoHoverId = null;
        a = s = r = 0;
        ie = l = c = u = p = null;
        d = m = f = v = h = b = g = x = false;
        i = false;
        B = null;
        E = F = 0;
        M = false;
        R = I = O = H = 0;
        W = z = 0;
        V.startupPlayed = false;
        V.startupActive = false;
        V.startupStartTime = 0;
        V.startupImg = null;
        V.exitActive = false;
        V.exitImg = null;
        V.exitData = null;
        V.exitSnapshot = null;
        V.isExitingNow = false;
        V.originalAnimHeight = undefined;
        V.originalAnimWidth = undefined;
        V.waitingHeight = 0;
        V.waitingWidth = 0;
        X = false;
        null;
        Y = 328;
        U = 426;
        false;
        G = _ = 0;
        q = Q = 0;
        0;
        K = null;
        TweenMax.killTweensOf(V);
        killPoloKeyframes(V);
        resetPoloTransform(V);
        V.setRemovalPending?.(false);
        V.hatAnimationActive = false;
        V.hatAnimOffset = 0;
        V.poloHeadImpactOffset = 0;
        V.hatAnimationPlayed = false;
        if (N !== undefined) {
            N = 0;
        }
        if (j !== undefined) {
            j = 0;
        }
        V.shakeTimer = 0;
        V.lastShake = 0;
        V.targetShake = 0;
        V.shakeAnimPolo = 0;
    };
    this.getPicto = function () {
        return l;
    };
    this.getAssetId = function () {
        return c;
    };
    this.getMoment = function () {
        return a;
    };
    this.getLoop = function () {
        return s;
    };
    this.getEnabled = function () {
        return m;
    };
    this.getBusy = function () {
        return f;
    };
    this.getHover = function () {
        return ue;
    };
    this.getDeleting = function () {
        return h;
    };
    this.getPlaying = function () {
        return v;
    };
    this.getDiv = function () {
        return Z;
    };
    this.getMute = function () {
        return b;
    };
    this.getHide = function () {
        return x;
    };
    this.getSolo = function () {
        return g;
    };
    this.setSolo = function (e) {
        if (g = e) {
            V.$btcSolo.addClass("light");
        } else {
            V.$btcSolo.removeClass("light");
        }
    };
    this.setLoop = function (e) {
        s = e;
    };
    this.setMoment = function (e) {
        a = e;
    };
    this.setPlaying = function (e) {
        v = e;
    };
    this.habiller = function (e, o, n, s, m) {
        V.checkState();
        B = null;
        t = null;
        E = F = 0;
        W = z = 0;
        M = false;
        R = I = O = H = 0;
        c = (l = e).id;
        a = o;
        u = n.imgData;
        cd = n.coverImgData;
        p = n.imgSprite;
        w = n.headHeight;
        C = n.headHeight * animSize;
        av = n; // is av like the saving the uhh thing?

        n.height = n.version == 0 ? 380 : n.height; // version shit my ahh

        av.cropH = (n.height, animSize);
        av.cropW = n.width * animSize;
        av.cropH = n.height * animSize;
        av.drawW = n.width * poloRatio * cnvPXD;
        av.drawH = n.height * poloRatio * cnvPXD;

        ie = n.color.replace('#', '');

        vs = n.version;

        JJ = n.gap * animSize; // gap ahh (cropGap)
        r = u.length;
        getPoloWearing[c] = V.id;
        V.animeId = (l = e).id; // store the correct anime id
        V.hasStartTween = n.poloStartTween === "false" ? false : true;
        V.movingStaticBody = n.movingStaticBody === "true" || n.movingStaticBody === true;
        V.onlyXBody = n.onlyXBody === "true" || n.onlyXBody === true;
        V.onlyYBody = n.onlyYBody === "true" || n.onlyYBody === true;
        V.invertXBody = n.invertXBody === "true" || n.invertXBody === true;
        V.invertYBody = n.invertYBody === "true" || n.invertYBody === true;
        V.waitingPictoOffsetY = n.waitingPictoOffsetY || 0;
        V.hasAlt = n.hasAlt === "true" || n.hasAlt === true;

        V.appAnimeName = n.appAnimeName;

        V.rebond_anime = n.rebond || null;
        V.deshabiller_anime = n.deshabiller || null;
        V.remonte_anime = n.remonte || null;

        cv = n.cover;
        coverWidth = n.coverWidth * animSize;
        coverWidth2 = n.coverWidth * poloRatio * 2;
        coverHeight = n.coverHeight * animSize;
        coverHeight2 = n.coverHeight * poloRatio * 2;

        inHabiller = true;

        V.offX = ((sizes.polo.sprAnimW - n.width) / 2) * animSize;
        V.offY = (sizes.polo.maxTopY - n.height) * animSize;

        console.log("[POLO] gap:", n.gap);

        if (n.hasStartup && !V.startupPlayed && !V.startupActive) {
            var preloaded = tabStartups[n.appAnimeName];
            if (preloaded && preloaded.startupData) {
                V.startupData = preloaded.startupData;
                V.startupImg = preloaded.startupImg || document.getElementById(`startupImg-${preloaded}`);
                V.startupShadowImg = preloaded.startupShadowImg || V.startupImg;
                V.startupStartTime = performance.now();
                V.startupActive = true;
                console.log(`Instant Startup Cache Bound for: ${n.appAnimeName} on Slot: ${c}`);
            } else {
                console.warn(`Startup assets missing from cache for: ${n.appAnimeName}`);
            }
        }

        V.hasExit = n.hasExit || false;

        let v = `onV${appVersion}Polo${c}`;
        window[v]?.();
        console.log(`Polo ${c} used by ${V.id} | ${v}()`);
        V.waitingHeight = n.height * animSize - av.cropH || 0;
        V.waitingWidth = n.width * animSize - cropAnimW || 0;
        V.originalAnimHeight = n.height || 0;
        V.originalAnimWidth = n.width || 0;
        ud = n.bat || false;
        i = n.upsideDown || false;
        V.shakeAnimPolo = n.shakeAnim || 0;
        L = n.animRenderBody || n.renderBody || "true";
        console.log(`as.waitingHeight: ${V.waitingHeight} | as.waitingWidth: ${V.waitingWidth}`);
        if (X && K && !V.hatAnimationActive && !V.hatAnimationPlayed && !ud && (app.letEvents || app._letEvents)) {
            TweenMax.delayedCall(0, V.startHatAnimation);
        }
        X = n.dontWearHat || false;
        f = true;
        if (X && n.hatSprite) {
            const e = new Image();
            e.src = `./js/${n.hatSprite}`;
            e.onload = function () {
                K = e;
                console.log("Hat sprite loaded for polo " + V.id);
            };
            if (!n.hatBack) {
                false;
            }
            Y = n.hatWidth || 164;
            U = n.hatHeight || 213;
            G = n.hatCropX || 0;
            _ = n.hatCropY || 0;
            q = n.hatOffsetX || 0;
            Q = n.hatOffsetY || 0;
        } else if (X) {
            const e = new Image();
            e.src = renameFile(eventHatSrc);
            e.onload = function () {
                K = e;
            };
            false;
            Y = 328;
            U = 426;
            G = 0;
            _ = 0;
            q = 0;
            Q = 0;
            if (animSize == 2) {
                Y = 328;
                U = 426;
            } else {
                Y = 164;
                U = 213;
            }
        }
        if (X) {
            Y * poloRatio * cnvPXD * animSize;
            U * poloRatio * cnvPXD * animSize;
        }

        V.drawPoloY = V.drawPoloY;

        if (n.bodyData) {
            B = n.bodyData;
            E = n.bodyWidth || n.objectWidth || 164;
            F = n.bodyHeight || n.objectHeight || 380;
            M = n.bodyBack || n.objectBack || false;
            t = n.imgSprite;
            W = E * poloRatio * cnvPXD / 2;
            z = F * poloRatio * cnvPXD / 2;
            console.log(`Body habiller - animRenderBody: ${L}, bodyHeight: ${F}, drawBodyW: ${W}, drawBodyH: ${z}, poloRatio: ${poloRatio}, cnvPXD: ${cnvPXD}`);
        }
        V.resize();
        oe.css({
            "background-color": "#" + ie
        });
        if (ae) {
            if (ud) {
                TweenMax.killTweensOf(V);
            }
            V.mode("waiting");
        } else {
            d = true;
            TweenMax.delayedCall(s, function () {
                V.hasStartTween ? V.rebond(m) : V.rebondAlt(m);
            });
        }
        recordMix.xmlAction("append", V);
    };

    this.checkState = function () {
        if (h && !ae) {
            TweenMax.killTweensOf(V);
            killPoloKeyframes(V);
            V.remonte(0, true, false);
        }
    };

    this.performLegacyExit = function (o, n) {
        f = !(h = true);
        t = null;
        var custom = !n && !(i || ud) ? getPoloAnime("deshabiller", V) : null;
        if (custom) {
            TweenMax.killTweensOf(V);
            playPoloKeyframes(V, custom, {
                delay: o,
                defaultEase: Quint.easeIn,
                onComplete: function () {
                    V.remonte(0, true, n);
                }
            });
            return;
        }
        if (V._keyframeTimeline) {
            killPoloKeyframes(V);
            resetPoloTransform(V);
        }
        if (i || ud) {
            TweenMax.to(V, n ? 0 : 0.3, {
                drawPoloY: -drawMaxTopY,
                ease: Quint.easeIn,
                onComplete: V.remonteFromUp,
                onCompleteParams: [0, true, n],
                delay: o,
                overwrite: true
            });
        } else {
            TweenMax.to(V, n ? 0 : 0.3, {
                drawPoloY: drawMaxTopY,
                ease: Quint.easeIn,
                onComplete: V.remonte,
                onCompleteParams: [0, true, n],
                delay: o,
                overwrite: true
            });
        }
    };

    this.loadExitShit = function (o, n, cachedExit) {
        f = !(h = true);
        t = null;

        V.exitSnapshot = {
            data: cachedExit.exitData,
            img: cachedExit.exitImg,
            shadowImg: cachedExit.exitShadowImg,
            drawX: V.drawPoloX,
            drawY: V.drawPoloY,
            wWidth: V.waitingWidth,
            wHeight: V.waitingHeight,
            animeName: V.appAnimeName
        };
        V.exitActive = true;
        V.exitStartTime = performance.now();
        V.isExitingNow = true;
        V.mode("exit");

        console.log(`Exit triggered for: ${V.appAnimeName}`);
    };

    this.deshabiller = function (o, n) {
        if (this.id !== undefined) {
            if (typeof stopLyricsImmediate === 'function') {
                stopLyricsImmediate(this.id);
            } else if (typeof stopLyrics === 'function') {
                stopLyrics(this.id);
            }
        }
        let a = `offV${appVersion}Polo${c}`;
        console.log(`${a}()`);
        window[a]?.();
        stopLyrics(getPoloWearing[c]);
        getPoloWearing[c] = undefined;
        inHabiller = false;
        if (d) {
            d = false;
            TweenMax.killTweensOf(V.rebond);
            TweenMax.killTweensOf(V.rebond2);
        }
        if (app.poloHoverEffect) {
            const o = modPoloMaps["v" + appVersion].find(o => parseInt(o.id) === e);
            if (o) {
                polos[e].setSprite(o.normal);
            } else {
                polos[e].setSprite(app.poloSprite);
            }
        }
        V.exitImmediate = n;

        var cachedExit = window.tabExits ? window.tabExits[V.appAnimeName] : null;

        if (V.hasExit && !n && cachedExit && cachedExit.exitData) {
            V.loadExitShit(o, n, cachedExit);
        } else {
            V.performLegacyExit(o, n);
        }
        this.hideLoader();
        recordMix.xmlAction("remove", V);
    };
    this.baisser = function () {
        V.drawPoloY = drawMaxTopY;
    };
    this.remonteFromUp = function (e, o, t) {
        V.drawPoloY = -V.drawPoloY;
        if ((ae = true) === o) {
            o = !modeReplay && !modeRandom && !modeWatch;
            l.reactiver(o);
            getPoloRemoving[l.id] = V.id;
            V.reinit();
            majListPoloDrop();
        }
        V.mode("normal");
        o = randomRangeInt(drawMinTopY, drawMinTopY + drawMaxRandPosY);
        TweenMax.to(V, t ? 0 : 0.4, {
            drawPoloY: o,
            ease: Back.easeOut,
            delay: t ? 0 : e,
            overwrite: true,
            onComplete: function () {
                ae = false;
            }
        });
    };
    this.remonte = function (e, o, t) {
        var n = i;
        if ((ae = true) === o) {
            o = !modeReplay && !modeRandom && !modeWatch;
            l.reactiver(o);
            getPoloRemoving[l.id] = V.id;
            V.reinit();
            majListPoloDrop();
        }
        V.mode("normal");
        o = randomRangeInt(drawMinTopY, drawMinTopY + drawMaxRandPosY);
        V.targetY = n ? -o : o;
        var custom = !t && !n ? getPoloAnime("remonte", V) : null;
        if (custom) {
            TweenMax.killTweensOf(V);
            playPoloKeyframes(V, custom, {
                delay: e,
                onComplete: function () {
                    ae = false;
                }
            });
            return;
        }
        if (n) {
            TweenMax.to(V, t ? 0 : 0.4, {
                drawPoloY: -o,
                ease: Back.easeOut,
                delay: t ? 0 : e,
                overwrite: true,
                onComplete: function () {
                    ae = false;
                }
            });
        } else {
            TweenMax.to(V, t ? 0 : 0.4, {
                drawPoloY: o,
                ease: Back.easeOut,
                delay: t ? 0 : e,
                overwrite: true,
                onComplete: function () {
                    ae = false;
                }
            });
        }
    };
    this.finishExit = function () {
        var shouldReactivate = !modeReplay && !modeRandom && !modeWatch;
        if (l) {
            l.reactiver(shouldReactivate);
            getPoloRemoving[l.id] = V.id;
        }

        V.reinit();
        majListPoloDrop();

        V.drawPoloY = drawMaxTopY;

        V.mode("normal");
        var newY = randomRangeInt(drawMinTopY, drawMinTopY + drawMaxRandPosY);
        var delay = V.exitImmediate ? 0 : 0.4;
        V.targetY = (i || ud) ? -newY : newY;

        var custom = !V.exitImmediate && !(i || ud) ? getPoloAnime("remonte", V) : null;
        if (custom) {
            TweenMax.killTweensOf(V);
            playPoloKeyframes(V, custom, {
                onComplete: function () { ae = false; }
            });
            return;
        }

        if (i || ud) {
            TweenMax.to(V, delay, {
                drawPoloY: -newY,
                ease: Back.easeOut,
                overwrite: true,
                onComplete: function () { ae = false; }
            });
        } else {
            TweenMax.to(V, delay, {
                drawPoloY: newY,
                ease: Back.easeOut,
                overwrite: true,
                onComplete: function () { ae = false; }
            });
        }
    };
    this.rebond = function (e) {
        if (this.id !== undefined) {
            const lyricsToClean = document.querySelectorAll(`.polo-lyrics[data-lyrics-polo="${this.id}"]`);
            lyricsToClean.forEach(lyrics => lyrics.remove());
            if (typeof stopLyrics === 'function') {
                stopLyrics(this.id);
            }
        }
        var o = V.drawPoloY - drawMaxBounceY;
        var t = v ? "anime" : "waiting";
        var n = e ? 0 : 0.1;
        t = V.getMute() ? "mute" : t;
        V.mode(t);
        if (!V._keyframeTimeline || V.targetY === undefined) V.targetY = V.drawPoloY;
        var custom = !e && !(i || ud) ? getPoloAnime("rebond", V) : null;
        if (custom) {
            TweenMax.killTweensOf(V);
            playPoloKeyframes(V, custom);
            d = false;
            return;
        }
        if (V._keyframeTimeline) {
            killPoloKeyframes(V);
            resetPoloTransform(V);
            o = V.targetY - drawMaxBounceY;
        }
        TweenMax.to(V, n, {
            drawPoloY: o,
            ease: Quint.easeOut,
            onComplete: V.rebond2,
            onCompleteParams: [e],
            overwrite: true
        });
        d = false;
    };
    this.rebondAlt = function (e) {
        var o = V.drawPoloY - drawMaxBounceY;
        var t = v ? "anime" : "waiting";
        var n = e ? 0 : 0.1;
        t = V.getMute() ? "mute" : t;
        V.mode(t);
        TweenMax.to(V, n, {
            onCompleteParams: [e],
            overwrite: true
        });
        d = false;
    };
    this.rebond2 = function (e) {
        var o = V.drawPoloY + drawMaxBounceY;

        console.log("Rebond2 Polo Height:", av ? av.height : 380, "Target Y:", o, "Polo Height Offset:", V.offY);

        TweenMax.to(V, e ? 0 : 0.2, {
            drawPoloY: o,
            ease: Back.easeOut,
            overwrite: true
        });
    };
    this.showLoader = function () {
        te = true;
        ee.addClass("show");
        oe.css({
            "animation-duration": decimal(getRemainingTime() / 1000, 2) + "s"
        });
        oe.addClass("progress");
    };
    this.hideLoader = function () {
        if (te) {
            te = false;
            ee.removeClass("show");
            oe.removeClass("progress");
        }
    };
    this.hideYourself = function () {
        if (v || f) {
            x = true;
            ce = b ? 0.7 : ce;
            V.mode("hide");
        }
    };
    this.stopHidingYourself = function () {
        if (v || f) {
            V.mode("unhide");
        }
    };
    this.stopHidingYourselfComplete = function () {
        x = false;
        if (b) {
            V.mode("mute");
        } else if (v) {
            V.mode("anime");
        } else {
            V.mode("waiting");
        }
    };
    this.drawPoloX = 0 + me;
    this.drawPoloY = drawMaxTopY;
    this.resize = function () { // resize function 
        const anime = tabAnime[V.animeId];
        const version = "v" + (anime?.version ?? "1"); // prepends "v" to match config keys
        const isModern = anime?.version === "3"; // basically a check for swftospritev3 to PREVENT IncredJSON Polos from interfering like MBAO for instance

        if (inHabiller) {
            console.log("[DEBUG] isModern:", isModern);
            console.log("[DEBUG] SWFtoSprite Version:", version);
        }

        if (av) {
            cropAnimW = sizes.polo.sprAnimW * animSize;
            drawAnimW = sizes.polo.sprAnimW * poloRatio * cnvPXD;
            av.cropH = isModern ? av.height * animSize : sizes.polo.sprAnimH * animSize; // placed this here so incredijson based mbao polos are supported properly -_-
            av.drawH = isModern ? av.height * poloRatio * cnvPXD : sizes.polo.sprAnimH * poloRatio * cnvPXD; // im guessing i have to rewrite drawanimH?
            V.waitingHeight = V.originalAnimHeight * animSize - av.cropH;
            V.waitingWidth = V.originalAnimWidth * animSize - cropAnimW;
            console.log("[DEBUG] cropAnimH / drawAnimH:", av.cropH, av.drawH);
        }

        y = w * poloRatio * cnvPXD;
        V.drawPoloX = poloBlocX * V.id * cnvPXD;
        Z[0].style.left = poloBlocX * V.id + (sizes.polo.overlapW * poloRatio + me) / 2 + "px";
        Z[0].style.width = poloBlocW - sizes.polo.overlapW * poloRatio + "px";
        J[0].style.left = poloBlocX * V.id + sizes.polo.overlapW * poloRatio / 2 + "px";
        J[0].style.width = poloBlocW - sizes.polo.overlapW * poloRatio + "px";
        if (B) {
            W = E * poloRatio * cnvPXD / animSize;
            z = F * poloRatio * cnvPXD / animSize;
        }
        if (X) {
            Y * poloRatio * cnvPXD / animSize;
            U * poloRatio * cnvPXD / animSize;
        }
    };

    var nativeAlpha = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, "globalAlpha");
    this.draw = function () {
        if (!poloHasTransform(V)) {
            re();
            return;
        }
        var cx = V.drawPoloX + me + drawPoloW * (V.pivotX ?? 0.5);
        var cy = V.drawPoloY + pe + drawPoloH * (V.pivotY ?? 0.5);
        var alpha = Math.max(0, Math.min(1, V.alpha ?? 1));
        ne.save();
        ne.translate(cx + (V.animOffsetX || 0), cy);
        ne.rotate(V.drawPoloR || 0);
        ne.scale(V.scaleX ?? 1, V.scaleY ?? 1);
        ne.translate(-cx, -cy);
        if (alpha !== 1) {
            Object.defineProperty(ne, "globalAlpha", {
                configurable: true,
                get: function () { return alpha === 0 ? 0 : nativeAlpha.get.call(ne) / alpha; },
                set: function (v) { nativeAlpha.set.call(ne, v * alpha); }
            });
            nativeAlpha.set.call(ne, alpha);
        }
        try {
            re();
        } finally {
            if (alpha !== 1) delete ne.globalAlpha;
            ne.restore();
        }
    };
    this.mode = function (o) {
        if (o != V.state) {
            TweenMax.killTweensOf(Me);
            V.state = o;
            switch (V.state) {
                case "normal":
                    if (app.poloHoverEffect) {
                        const o = modPoloMaps["v" + appVersion].find(o => parseInt(o.id) === e);
                        if (o) {
                            polos[e].setSprite(o.normal);
                        } else {
                            polos[e].setSprite(app.poloSprite);
                        }
                    }
                    re = be;
                    Fe();
                    break;
                case "cligne":
                    re = Ce;
                    break;
                case "regarde":
                    if (app.poloHoverEffect) {
                        const o = modPoloMaps["v" + appVersion].find(o => parseInt(o.id) === e);
                        if (o) {
                            polos[e].setSprite(o.normal);
                        } else {
                            polos[e].setSprite(app.poloSprite);
                        }
                    }
                    re = Ae;
                    break;
                case "hover":
                    if (app.poloHoverEffect) {
                        const o = modPoloMaps["v" + appVersion].find(o => parseInt(o.id) === e);
                        if (o) {
                            polos[e].setSprite(o.hover);
                        } else {
                            polos[e].setSprite(app.poloSprite.replace(/\.png$/, "-hover.png"));
                        }
                    }
                    re = Se;
                    break;
                case "waiting":
                    re = we;
                    break;
                case "exit":
                    re = $ex;
                    break;
                case "anime":
                    re = Te;
                    if (X && K && !V.hatAnimationActive && !V.hatAnimationPlayed && !ud && (app.letEvents || app._letEvents)) {
                        TweenMax.delayedCall(0, V.startHatAnimation);
                    }
                    break;
                case "mute":
                    re = ye;
                    break;
                case "hide":
                    re = ke;
                    break;
                case "unhide":
                    re = $e;
            }
        }
    };
    this.anime = function () {
        var e = frame;
        if (boucleA && r == frameTotal) {
            e += frameHalf;
        }

        if (u && u.length > 0) {
            if (e >= u.length) e = u.length - 1;
            if (e < 0) e = 0;
        }

        if (enableFaceAnim) {
            D = (u[e] ? u[e][0] : 0) * animSize;
            S = (u[e] ? u[e][1] : 0) * animSize;
        } else {
            D = 0;
            S = animSize * 380;
        }
        if (enableHeadAnim) {
            k = (u[e] ? u[e][2] : 0) * poloRatio * cnvPXD;
            T = (u[e] ? u[e][3] : 0) * poloRatio * cnvPXD;
        } else {
            var targetE = r - 1 <= e ? r - 1 : e;
            if (u && u.length > 0) {
                if (targetE >= u.length) targetE = u.length - 1;
                if (targetE < 0) targetE = 0;
            }
            e = targetE;

            D = (u[e] ? u[e][0] : 0) * animSize;
            S = (u[e] ? u[e][1] : 0) * animSize;
            k = poloRatio * 0 * cnvPXD;
            T = poloRatio * 0 * cnvPXD;
        }

        T += j;

        const o = u[e] ? u[e][4] : null;
        const t = o ? o.trim().replace(/^\[|\]$/g, "") : "";
        const n = Date.now();

        if (t) {
            if (!this._lastCueTimes) this._lastCueTimes = {};
            const now = n;
            const last = this._lastCueTimes[t] || 0;
            if (now - last > 150) {
                if (typeof window[t] == "function" && h == 0) {
                    window[t]();
                } else {
                    console.warn(`No function named "${t}" found.`);
                }
                this._lastCueTimes[t] = now;
            }
        }
        if (B && B[e]) {
            R = B[e][0] * animSize;
            I = B[e][1] * animSize;
            O = B[e][2] * poloRatio * cnvPXD;
            H = B[e][3] * poloRatio * cnvPXD;
        }
        if (enableHeadAnim) {
            if (X) {
                q = u[e][2] * poloRatio * cnvPXD;
                Q = u[e][3] * poloRatio * cnvPXD;
            }
        } else if (X) {
            q = 0;
            Q = 0;
        }
        if (cv == "true" && cd && cd[e]) {
            ca = cd[e][0] * animSize;
            cb = cd[e][1] * animSize;
            cx = cd[e][2] * poloRatio * cnvPXD;
            cy = cd[e][3] * poloRatio * cnvPXD;
        }
    };
    this.getPupPos = function (e, o, dist) {
        var pupLimitW = V.myPupilW || drawPupW;
        var t = (mouseX - canvasBound.left) * cnvPXD;
        var n = (mouseY - canvasBound.top) * cnvPXD;

        var i = V.drawPoloX + me + e + pupLimitW / 2;
        var a = V.drawPoloY + pe + o + pupLimitW / 2;
        var s = t - i;
        var r = n - a;
        var l = Math.atan2(r, s);

        var offset = (V.pupilType === "svg") ? 0 : pupLimitW / 2;

        var moveX = 1.0;
        var moveY = 1.0;

        var nudgeRight = V.nudgeRight || 1.0;
        var nudgeLeft = V.nudgeLeft || 1.0;
        var nudgeDown = V.nudgeDown || 1.0;
        var nudgeUp = V.nudgeUp || 1.0;

        moveY = (l > 0) ? nudgeDown : nudgeUp;
        moveX = (Math.cos(l) > 0) ? nudgeRight : nudgeLeft;

        var finalDist = V.maxPupMove || dist;

        return [
            (finalDist * Math.cos(l) * moveX) + i - offset + getRealisticShake(1),
            (finalDist * Math.sin(l) * moveY) + a - offset + getRealisticShake(1)
        ];
    };

    async function loadPoloEyesXML(url, poloId) {
        try {
            const res = await fetch(url);
            const text = await res.text();
            const xml = new DOMParser().parseFromString(text, "text/xml");

            const version = "v" + appVersion;

            const idSelector = `${version} poloMap[id="${poloId}"] eyes`;
            const versionSelector = `${version} > eyes`;
            const defaultSelector = `default eyes`;

            let nodes = xml.querySelectorAll(idSelector);

            if (!nodes.length) {
                nodes = xml.querySelectorAll(versionSelector);
            }

            if (!nodes.length) {
                nodes = xml.querySelectorAll(defaultSelector);
            }

            if (!nodes.length) {
                console.warn(`⚠️ No XML eyes found for Polo ${poloId}, using fallback`);
                Ee = fallbackPoloEyes;
                return;
            }

            Ee = Array.from(nodes).map(n =>
                n.textContent.split(",").map(Number)
            );
        } catch (err) {
            console.warn("Failed to load eyes XML, using fallback", err);
            Ee = fallbackPoloEyes;
        }
    }

    // polo eyes thing omg
    var Pe = 0;
    var Be = [];
    let Ee = fallbackPoloEyes;

    var fallbackPoloEyes = [[0, 1, 2, 2, 1, 0], [0, 3, 4, 5, 6, 7, 8, 0], [0, 3, 4, 4, 3, 0], [0, 1, 2, 2, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 1, 2, 2, 2, 2, 0], [0, 1, 2, 2, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 1, 2, 2, 9, 9, 9, 9, 2, 2, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 0], [0, 1, 2, 2, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 2, 2, 2, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 1, 2, 2, 10, 10, 10, 10, 10, 2, 2, 0], [2, 2, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 2, 2, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 2, 2, 1, 1]];

    function Fe() {
        var e = random(7) + 2;
        TweenMax.delayedCall(e, Me);
    }
    var lastEye = -1;

    function Me() {
        S = getTime();

        let e;
        do {
            e = Math.floor(Math.random() * Ee.length);
        } while (e === lastEye && Ee.length > 1);

        lastEye = e;

        Be = Ee[e];
        P = Be.length;
        Pe = P / (P * 36);

        V.mode("cligne");
    }

    loadPoloEyesXML("data/polo/poloEyes.xml");

    var Le = 0;
    var Re = 0;
    var Ie = 0;
    var Oe = 0;
    function He(e) {
        if (notnull(e)) {
            e.preventDefault();
        }
        if (g) {
            if (getTotalSolo() == 1) {
                stopSoloPolo();
            } else {
                V.mute();
            }
            g = false;
        } else {
            V.switchMute();
        }
        if (!(b || g)) {
            stopOtherSolo();
        }
    }
    function We(e) {
        if (notnull(e)) {
            e.preventDefault();
        }
        clickPolo(V);
    }
    function ze(e) {
        if (notnull(e)) {
            e.preventDefault();
        }
        (g ? (g = false, unmuteAll) : (g = true, muteAll))(V);
    }
    function delayBt(e) {
        if (notnull(e)) {
            e.preventDefault();
        }
        delayRemovePolo(V);
    }
    this.activerClick = function () {
        if (!m) {
            m = true;
            Z[0].addEventListener(pointerEventType.down, V.touchStart);
            V.activerCtrl();
        }
    };
    this.desactiverClick = function () {
        if (m) {
            m = false;
            TweenMax.killTweensOf(V.touchLong);
            Z[0].removeEventListener(pointerEventType.down, V.touchStart);
            Z[0].removeEventListener(pointerEventType.move, V.touchMove);
            Z[0].removeEventListener(pointerEventType.up, V.touchEnd);
            V.desactiverCtrl();
        }
    };
    this.touchStart = function (e) {
        e.preventDefault();
        var o = "targetTouches" in e ? e.targetTouches[0] : e;
        Le = Re = o.pageX;
        Ie = Oe = o.pageY;
        V.swipedSideways = false;
        TweenMax.delayedCall(0.25, V.touchLong, [e]);
        Z[0].removeEventListener(pointerEventType.down, V.touchStart);
        Z[0].addEventListener(pointerEventType.move, V.touchMove);
        Z[0].addEventListener(pointerEventType.up, V.touchEnd);
    };
    this.touchMove = function (e) {
        e.preventDefault();
        var o = ("targetTouches" in e);
        e = o ? e.targetTouches[0] : e;
        var t = o ? 60 : 20;
        Re = e.pageX;
        Oe = e.pageY;
        if (Oe < Ie - t && Math.abs(Re - Le) < t) {
            V.notClick = true;
            TweenMax.killTweensOf(V.touchLong);
            var polo = V;
            if (polo.id in listWaiting) {
                var picto = listWaiting[polo.id];
                delete listWaiting[polo.id];
                waitingPictoInstance.remove(polo.id, picto.id);
                setTimeout(function () {
                    picto.reactiver(true);
                }, 300);
            }
        }
        if (Ie + (o ? 60 : 20) < Oe && Math.abs(Re - Le) < t || ud && Ie - (o ? 60 : 20) > Oe && Math.abs(Re - Le) < t) {
            TweenMax.killTweensOf(V.touchLong);
            clickPolo(V);
            return;
        }
        var side = o ? 70 : 40;
        if (!V.swipedSideways && Math.abs(Re - Le) > side && Math.abs(Oe - Ie) < t) {
            V.swipedSideways = true;
            TweenMax.killTweensOf(V.touchLong);
            delayRemovePolo(V);
        }
    };
    this.touchLong = function (e) {
        e.preventDefault();
        TweenMax.killTweensOf(V.touchLong);
        g = true;
        soloPolo();
        V.$btcSolo.addClass("light");
    };

    this.touchEnd = function (e) {
        e.preventDefault();
        TweenMax.killTweensOf(V.touchLong);
        Z[0].removeEventListener(pointerEventType.move, V.touchMove);
        Z[0].removeEventListener(pointerEventType.up, V.touchEnd);
        Z[0].addEventListener(pointerEventType.down, V.touchStart);
        if (V.swipedSideways) {
            V.swipedSideways = false;
            return;
        }
        if (g) {
            if (getTotalSolo() == 1) {
                stopSoloPolo();
            } else {
                V.mute();
            }
            g = false;
            V.$btcSolo.removeClass("light");
        } else {
            V.switchMute();
        }
    };
    this.activerCtrl = function () {
        de.addClass("visible").on(pointerEventType.down, stopProp);
        V.$btcMute.on(pointerEventType.down, He);
        V.$btcSolo.on(pointerEventType.down, ze);
        V.$btcStop.on(pointerEventType.down, We);
        V.$btcDelay.on(pointerEventType.down, delayBt);
    };
    this.desactiverCtrl = function () {
        de.removeClass("visible").off();
        V.$btcMute.off().removeClass("light");
        V.$btcSolo.off().removeClass("light");
        V.$btcStop.off().removeClass("light");
        V.$btcDelay.off();
    };
    this.playSound = function () {
        v = true;
        this.sound.play();
        s++;
    };
    this.stopSound = function (e) {
        v = false;
        this.sound.stop(e);
    };
    this.mute = function () {
        if (this.id !== undefined) {
            if (typeof stopLyricsImmediate === 'function') {
                stopLyricsImmediate(this.id);
            } else if (typeof stopLyrics === 'function') {
                stopLyrics(this.id);
            }
        }
        b = true;
        if (!x) {
            V.mode("mute");
            V.$btcMute.addClass("light");
        }
        V.sound.mute();
        recordMix.xmlAction("mute", V);
    };
    this.unmute = function () {
        b = false;
        if (!x) {
            if (v) {
                this.mode("anime");
            } else {
                this.mode("waiting");
            }
            V.$btcMute.removeClass("light");
        }
        this.sound.unmute();
        recordMix.xmlAction("unmute", V);
    };
    this.switchMute = function () {
        if (b) {
            V.unmute();
        } else {
            V.mute();
        }
    };
    this.hitTest = function (e, o) {
        e = (e - canvasBound.left) * cnvPXD;
        o = (o - canvasBound.top) * cnvPXD;
        var t = poloOverlapW * cnvPXD / 2;
        return e > V.drawPoloX + me + t && e < V.drawPoloX + me + drawPoloW - t && o > V.drawPoloY && o < canvasBound.height * cnvPXD;
    };
    this.hitTestPicto = function (e) {
        return !h && V.hitTest(Math.round(e.pointerAxis.px), Math.round(e.pointerAxis.py));
    };
    this.rollover = function () {
        if (!ue) {
            ue = true;
            V.mode("hover");
        }
    };
    this.rollout = function (e) {
        if (notnull(e) && e) {
            ue = false;
            V.mode("normal");
        } else if (ue) {
            ue = false;
            V.mode("regarde");
        }
    };
    this.resize();
    this.reinit();
}

updateEventHatSprite();
