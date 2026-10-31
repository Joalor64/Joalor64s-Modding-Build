/*
 * game.js
 * Building the game screen (polos, pictos, bonus buttons), the toolbar and the top buttons,
 * dressing/removing polos, solo/mute, drag & drop of pictos onto polos, the clock button.
 */

var listBonus = [];
var listPoloDrop = [];
var listWaiting = {};
var listPoloToRemove = [];
var listPoloToSolo = [];
var poloAllVisible = false;
var modeRandom = false;
var modeRecord = false;
var modeReplay = false;
var waitForRecording = false;
var mouseX = 0;
var mouseY = 0;
function createGame() {
    appLoaded = true;
    loopDuration = app.looptime;
    nbPoloMax = app.nbpolo;
    stepAnimation = frameHalf / loopDuration;
    stepPercent = 100 / loopDuration;
    tabBuffer.metro[0].snd = audioCtx.createBuffer(2, globalSampleRate * (app.looptime / 1000), globalSampleRate);
    (sndMetronome = new SoundObject("metronome")).setSilence();
    (clock = new ClockObject("cnv-clock")).init(76, 76, 1, 68, 16);
    renderRAF = new RenderRAF(renderLoop);
    mainCanvas = new CanvasObj("cnv-stage");
    if (miniPlayer) {
        (recordMix = function () { }).xmlAction = function () { };
        randomMix = function () { };
    } else {
        randomMix = new RandomMix();
        recordMix = new RecordMix();
    }
    replayMix = new ReplayMix();
    readingBar = new ReadingBar("#reading-bar", app.recminloop, app.recmaxloop);
    listPolo = window.polos = createBoxPolo();
    majListPoloDrop();
    listPicto = createBoxPicto();
    if (nbBonus > 0) {
        createBtBonus();
        listBonus = createBoxBonus();
    } else {
        document.getElementById("box-bt-bonus").style.display = "none";

        if (!(window.cordova || isMobile)) { // to not inconvience mobile users
            const clock = document.getElementById('bt-clock');
            const itemMiddle = document.querySelector("#box-bt2 .item-middle");
            itemMiddle.appendChild(clock);

            console.log("bt-clock moved to center position");
        }
    }
    document.getElementById("box-stage-bck").style.backgroundImage = "url(" + listImages.gameBck.src + ")";
    if (listImages.gameFrontTop) {
        document.getElementById("box-stage-front-top").style.backgroundImage = "url(" + listImages.gameFrontTop.src + ")";
    }
    if (listImages.gameFrontBot) {
        document.getElementById("box-stage-front-bot").style.backgroundImage = "url(" + listImages.gameFrontBot.src + ")";
    }
    if (listImages.gameBehindTop) {
        document.getElementById("box-stage-behind-top").style.backgroundImage = "url(" + listImages.gameBehindTop.src + ")";
    }
    if (listImages.gameBehindBot) {
        document.getElementById("box-stage-behind-bot").style.backgroundImage = "url(" + listImages.gameBehindBot.src + ")";
    }
    if (listImages.boxMiddle) {
        document.getElementById("box-middle").style.backgroundImage = "url(" + listImages.boxMiddle.src + ")";
    }
    if (listImages.boxTop) {
        document.getElementById("box-top").style.backgroundImage = "url(" + listImages.boxTop.src + ")";
    }
    if (listImages.boxTopBck1) {
        document.querySelector("#box-top #box-bt #box-bt1").style.backgroundImage = "url(" + listImages.boxTopBck1.src + ")";
    }
    if (listImages.boxTopBck2) {
        document.querySelector("#box-top #box-bt #box-bt2").style.backgroundImage = "url(" + listImages.boxTopBck2.src + ")";
    }
    if (listImages.boxBottom) {
        document.getElementById("box-bottom").style.backgroundImage = "url(" + listImages.boxBottom.src + ")";
    }
    if (!miniPlayer) {
        document.querySelectorAll(".picto .bck").forEach(e => {
            e.style.backgroundImage = "url(" + listImages.gamePicto.src + ")";
        });
    }
    enableBtGame();
    resizeApp();
}
function createBoxPicto() {
    const customLayout = typeof getPictoLayout === "function" ? getPictoLayout(nbSound) : null;
    if (customLayout) {
        $boxPicto.find(".pictoline").remove();
        $boxPicto.append(buildCustomPictoHtml(customLayout));
        $boxPicto.removeClass("stagger").addClass("custom-layout");
        const customList = [];
        for (let i = 0; i < nbSound; i++) {
            customList.push(new PictoObject(i, $boxPicto));
        }
        return customList;
    }
    $boxPicto.removeClass("custom-layout");

    const rowMax = typeof app.pictoRowMax === "number" && !isNaN(app.pictoRowMax) ? app.pictoRowMax : 10;

    let rows = Array.isArray(app.pictoRows) && app.pictoRows.length
        ? app.pictoRows.map(Number).filter(n => n > 0)
        : [Math.min(rowMax, nbSound)];

    let assigned = rows.reduce((a, b) => a + b, 0);
    if (assigned < nbSound) {
        rows.push(nbSound - assigned);
    } else if (assigned > nbSound) {
        let over = assigned - nbSound;
        for (let r = rows.length - 1; r >= 0 && over > 0; r--) {
            const cut = Math.min(rows[r], over);
            rows[r] -= cut;
            over -= cut;
        }
        rows = rows.filter(n => n > 0);
    }

    const maxRow = Math.max.apply(null, rows);
    const evenRows = rows.length > 1 && rows.every(n => n === rows[0]);

    let html = "";
    let idx = 0;
    rows.forEach((count, r) => {
        const cls = r === 0 ? "top" : r === rows.length - 1 ? "bot" : "mid";
        const rowWidth = (95 * count / maxRow).toFixed(4);
        const rowStyle = evenRows
            ? `width:${rowWidth}%`
            : `width:${rowWidth}%;margin-left:auto;margin-right:auto;align-self:center`;
        html += `<div class="pictoline ${cls}" style="${rowStyle}">`;
        for (let k = 0; k < count; k++, idx++) {
            html += `<div class="picto" id="picto${idx}" data-picto-num="${idx}">
                        <div class="bck"></div>
                        <div class="hitzone"></div>
                     </div>`;
        }
        html += `</div>`;
    });

    $boxPicto.find(".pictoline").remove();
    $boxPicto.append(html);
    $boxPicto.toggleClass("stagger", evenRows);

    const list = [];
    for (let i = 0; i < nbSound; i++) {
        list.push(new PictoObject(i, $boxPicto));
    }
    return list;
}
function createBoxPolo() {
    var e = [];
    var o = "";
    var t = "";
    var n = 0;
    for (n = 0; n < nbPoloMax; n++) {
        o += `<div class="polo" data-polo-id="${n}">
				<div class="ctrl">
					<div class="cbt icon-game-bt-mute"><svg class="icn-svg"><use xlink:href="#ic-mute"></use></svg></div>
					<div class="cbt icon-game-bt-solo"><svg class="icn-svg"><use xlink:href="#ic-solo"></use></svg></div>
					<div class="cbt icon-game-bt-delete-next"><svg class="icn-svg"><use xlink:href="#ic-close-next"></use></svg></div>
					<div class="cbt icon-game-bt-delete"><svg class="icn-svg"><use xlink:href="#ic-close"></use></svg></div>
				</div>
				<div class="remove-pending-badge"><svg class="icn-svg"><use xlink:href="#ic-close-next"></use></svg></div>
			</div>`;
        t += `<div class="zone" data-polo-id="${n}">
				<div class="loader">
					<div class="bar"></div>
				</div>
			</div>`;
    }
    document.querySelector("#box-polo").innerHTML = o;
    document.querySelector("#box-loader-polo").innerHTML = t;
    n = 0;
    for (; n < nbPoloMax; n++) {
        e.push(new PoloObject(n, contextCanvas));
    }
    return e;
}
function createBoxBonus() {
    for (var e = [], o = 0; o < nbBonus; o++) {
        for (var t = app.bonusarray[o], n = t.code, i = $("#bt-bonus-" + (o + 1)), a = 0, s = n.length; a < s; a++) {
            var r = app.animearray[n[a] - 1].color.replace('#', '');
            $(".svg.q" + (a + 1) + " svg", i).css({
                fill: "#" + r
            });
        }
        if (!tabBuffer.bonus[o].aspire) {
            tabBuffer.bonus[o].aspire = audioCtx.createBuffer(2, globalSampleRate * (app.looptime / 1000), globalSampleRate);
        }
        t = new BonusObject(o, t, tabBuffer.bonus[o]);
        e.push(t);
    }
    return e;
}
function createBtBonus() {
    for (var e = "", o = 1; o <= nbBonus; o++) {
        e += "\n\t\t\t<div class=\"bt-bonus\" id=\"bt-bonus-" + o + `">
\t\t\t\t<div class="circle"></div>
\t\t\t\t<div class="quarter">
\t\t\t\t\t<div class="svg q0"><svg x="0px" y="0px" width="86px" height="86px" viewBox="0 0 86 86"><path d="M83.88,29.72A42.83,42.83,0,1,0,86,43,43,43,0,0,0,83.88,29.72ZM43,58.64A15.69,15.69,0,0,1,27.36,43,15.64,15.64,0,1,1,52.18,55.64,15.52,15.52,0,0,1,43,58.64Z"/></svg></div>
\t\t\t\t\t<div class="svg q1"><svg x="0px" y="0px" width="86px" height="86px" viewBox="0 0 86 86"><path d="M57.87,38.17l26-8.45A43,43,0,0,0,43,0V27.36A15.65,15.65,0,0,1,57.87,38.17Z"/></svg></div>
\t\t\t\t\t<div class="svg q2"><svg x="0px" y="0px" width="86px" height="86px" viewBox="0 0 86 86"><path d="M83.88,29.72l-26,8.45a15.58,15.58,0,0,1-5.69,17.47L68.25,77.75a42.83,42.83,0,0,0,15.63-48Z"/></svg></div>
\t\t\t\t\t<div class="svg q3"><svg x="0px" y="0px" width="86px" height="86px" viewBox="0 0 86 86"><path d="M52.18,55.64a15.55,15.55,0,0,1-18.36,0L17.75,77.75a42.77,42.77,0,0,0,50.5,0Z"/></svg></div>
\t\t\t\t\t<div class="svg q4"><svg x="0px" y="0px" width="86px" height="86px" viewBox="0 0 86 86"><path d="M27.36,43a15.71,15.71,0,0,1,.77-4.83l-26-8.45a42.88,42.88,0,0,0,15.64,48L33.82,55.64A15.61,15.61,0,0,1,27.36,43Z"/></svg></div>
\t\t\t\t\t<div class="svg q5"><svg x="0px" y="0px" width="86px" height="86px" viewBox="0 0 86 86"><path d="M43,27.36V0A43,43,0,0,0,2.11,29.72l26,8.45A15.65,15.65,0,0,1,43,27.36Z"/></svg></div>
\t\t\t\t</div>
\t\t\t\t<canvas id="canvas-bt-bonus-` + o + `" width="86" height="86"></canvas>
\t\t\t\t<div class="icon">
\t\t\t\t\t<div class="icn-bck"></div>
\t\t\t\t</div>
\t\t\t\t<div class="hitzone"></div>
\t\t\t\t<div class="box-loader">
\t\t\t\t\t<div class="zone"><div class="loader"><div class="bar"></div></div></div>
\t\t\t\t</div>
\t\t\t</div>`;
    }
    $boxBtBonus.append(e);
}
var isToolbarOpen = false;
var isToolbarMove = false;
function enableBtGame() {
    $btBack.on(pointerEventType.down, function (e) {
        e.preventDefault();
        if (!isToolbarMove) {
            preventAction(clickTool);
        }
    });
    $btStop.on(pointerEventType.down, function (e) {
        e.preventDefault();
        if (!isToolbarMove && loopOn) {
            preventAction(clickBtStop);
        }
    });
    $btRandom.on(pointerEventType.down, function (e) {
        e.preventDefault();
        if (!isToolbarMove) {
            preventAction(clickBtRandom);
        }
    });
    $btRecord.on(pointerEventType.down, function (e) {
        e.preventDefault();
        if (!isToolbarMove) {
            preventAction(clickBtRecord);
        }
    });
    $btHome.on(pointerEventType.down, function (e) {
        e.preventDefault();
        if (!isToolbarMove) {
            preventAction(clickBtHome);
        }
    });
    $btHelp.on(pointerEventType.down, function (e) {
        e.preventDefault();
        if (!isToolbarMove) {
            preventAction(clickBtHelp);
        }
    });
    $btSwitch.on(pointerEventType.down, function (e) {
        e.preventDefault();
        if (!isToolbarMove) {
            preventAction(clickBtSwitch);
        }
    });
    enableBtTool();
    enablePictoDraggable();
}
function enableBtTool() {
    $btTool.on(pointerEventType.down, function (e) {
        e.preventDefault();
        if (!isToolbarMove) {
            preventAction(clickTool);
        }
    });
}
function clickTool() {
    isToolbarMove = true;
    (isToolbarOpen ? closeTool : openTool)();
}
function openTool() {
    deleteFocus();
    document.body.addEventListener(pointerEventType.down, clickStage);
    addTransition($boxBt, "open", "transform", endToolMove, true);
    isToolbarOpen = true;
}
function closeTool() {
    deleteFocus();
    document.body.removeEventListener(pointerEventType.down, clickStage);
    removeTransition($boxBt, "open", "transform", endToolMove);
    isToolbarOpen = false;
}
function endToolMove() {
    isToolbarMove = false;
    if (onGame) {
        createFocus(isToolbarOpen ? "toolbar-open" : "toolbar");
    }
}
function clickStage(e) {
    if (!$boxBt[0].contains(e.target)) {
        clickTool();
    }
}
function clickBtStop() {
    stopAllStage();
}
function clickBtHome() {
    backToHome();
}
function clickBtRandom() {
    tabAnime.length > nbPoloMax ? startRandomMode() : boxDialog.open("Not Enough Polos", "Random mode requires at least " + (nbPoloMax + 1) + " polos.", [STR("bt.gotit")]);
}
function clickBtRecord() {
    startRecordMode();
}
function clickBtHelp() {
    backToHome(popupInfo);
}
function clickBtSwitch() {
    backToHome(popupSwitch);
}
function baisserAllPolo() {
    if (poloAllVisible) {
        poloAllVisible = false;
        for (var e = 0; e < nbPoloMax; e++) {
            listPolo[e].baisser();
        }
    }
}
function afficherAllPolo(e) {
    if (!poloAllVisible) {
        poloAllVisible = true;
        for (var o = 0; o < nbPoloMax; o++) {
            listPolo[o].remonte(o * 0.03, false, e);
        }
    }
}
function habillerPolo(polo, picto, animationDelay, immediate) {
    const functionExecutor = {
        executeFunction: function (func) {
            return func();
        }
    };
    animationDelay = animationDelay === null || typeof animationDelay === "undefined" ? 0 : animationDelay;
    const pictoId = picto.id;
    const animationConfig = tabAnime[pictoId];
    polo.habiller(picto, cntBoucle, animationConfig, animationDelay, immediate);
    if (loopOn) {
        polo.showLoader();
        polo.activerClick();
    }
    else if (!waitingFirstLoop) {
        waitingFirstLoop = true;
        functionExecutor.executeFunction(checkAudioCanRun).then(() => {
            setTimeout(() => {
                startFirstLoop();
            }, app.firstLoopDelay || 0);
        }).catch(error => {
            const errorHandler = {
                reportError: function (errorCallback, errorDetails) {
                    return errorCallback(errorDetails);
                }
            };
            functionExecutor.executeFunction(rebuildAudioContext).then(() => {
                setTimeout(() => {
                    startFirstLoop();
                }, app.firstLoopDelay || 0);
            }).catch(() => {
                stopAllStage();
                errorHandler.reportError(popupGeneralError, {
                    error: "Audio",
                    action: "reload"
                });
            });
        });
    }
}
function startFirstLoop() {
    let e = `onV${appVersion}Mix`;
    window[e]?.();
    console.info(`First loop started with ${e}()`);
    waitingFirstLoop = false;
    globalVolumeFadeIn();
    enableClickFirstPolos();
    startLoop();
    if (waitForRecording) {
        startRecording();
    }
    enableBtClock();
}
function enableClickFirstPolos() {
    for (var e = 0; e < nbPoloMax; e++) {
        var o = listPolo[e];
        if (o.getBusy()) {
            o.activerClick();
        }
    }
}
function clickPolo(e) {
    if (!(bonusPlaying || modeRandom || (e.desactiverClick(), getRemainingTime() < delayassist ? listPoloToRemove.push(e) : removePolo(e), (e = getListPoloBusy().length) !== 0 && e != listPoloToRemove.length))) {
        stopLoop();
    }
}

var listPoloDelayedRemove = [];

function isPoloRemovalPending(polo) {
    return listPoloDelayedRemove.includes(polo);
}

/** Toggles delayed removal for a polo. Returns true if the polo is now set to leave. */
function delayRemovePolo(polo) {
    if (!polo) return false;
    if (isPoloRemovalPending(polo)) {
        cancelDelayedRemovePolo(polo);
        return false;
    }
    if (bonusPlaying || modeRandom || modeReplay || !polo.getBusy() || polo.getDeleting() || listPoloToRemove.includes(polo)) {
        return false;
    }
    if (!loopOn) {
        clickPolo(polo);
        return false;
    }
    if (polo.id in listWaiting) {
        var picto = listWaiting[polo.id];
        delete listWaiting[polo.id];
        waitingPictoInstance.remove(polo.id, picto.id);
        setTimeout(function () {
            picto.reactiver(true);
        }, 300);
    }
    listPoloDelayedRemove.push(polo);
    polo.setRemovalPending(true);
    window[`onV${appVersion}Polo${polo.getPicto().id}DelayRemove`]?.(true);
    return true;
}

function cancelDelayedRemovePolo(polo) {
    if (!isPoloRemovalPending(polo)) return;
    listPoloDelayedRemove = listPoloDelayedRemove.filter(p => p !== polo);
    polo.setRemovalPending(false);
    var picto = polo.getPicto();
    if (picto) window[`onV${appVersion}Polo${picto.id}DelayRemove`]?.(false);
}

/** Loop end: hands the pending polos to the normal remove queue. Returns how many. */
function flushDelayedPoloRemoval() {
    var list = listPoloDelayedRemove;
    listPoloDelayedRemove = [];
    var count = 0;
    list.forEach(function (polo) {
        polo.setRemovalPending(false);
        if (polo.getBusy() && !polo.getDeleting() && !listPoloToRemove.includes(polo)) {
            polo.desactiverClick();
            listPoloToRemove.push(polo);
            count++;
        }
    });
    return count;
}

/** Cancels every pending delayed removal (stop all, leaving the stage...). */
function clearDelayedPoloRemoval() {
    listPoloDelayedRemove.slice().forEach(cancelDelayedRemovePolo);
    listPoloDelayedRemove = [];
}

function mutePolo(e) {
    e.mute();
}
function unmutePolo(e) {
    e.unmute();
}
function soloPolo() {
    for (var e = getListPoloBusy(), o = e.length, t = 0; t < o; t++) {
        var n = e[t];
        if (n.getSolo()) {
            n.unmute();
        } else {
            n.mute();
        }
    }
}
function muteAll(e) {
    for (var o = getListPoloBusy(), t = o.length, n = 0; n < t; n++) {
        var i = o[n];
        if (i.id != e.id) {
            i.setSolo(false);
            i.mute();
        } else {
            i.setSolo(true);
            i.unmute();
        }
    }
}
function unmuteAll() {
    for (var e = getListPoloBusy(), o = e.length, t = 0; t < o; t++) {
        var n = e[t];
        n.setSolo(false);
        listPoloToSolo.push(n);
    }
    if (getRemainingTime() > delayassist) {
        checkPoloToSolo();
    }
}
function checkPoloToSolo() {
    for (var e = 0, o = listPoloToSolo.length; e < o; e++) {
        listPoloToSolo[e].unmute();
    }
    listPoloToSolo = [];
}
function getTotalSolo() {
    for (var e = getListPoloBusy(), o = e.length, t = 0, n = 0; n < o; n++) {
        if (e[n].getSolo()) {
            t++;
        }
    }
    return t;
}
function stopSoloPolo() {
    for (var e = getListPoloBusy(), o = e.length, t = 0; t < o; t++) {
        var n = e[t];
        listPoloToSolo.push(n);
    }
    if (getRemainingTime() > delayassist) {
        checkPoloToSolo();
    }
}
function stopOtherSolo() {
    for (var e = getListPoloBusy(), o = e.length, t = 0; t < o; t++) {
        e[t].setSolo(false);
    }
}
function removePolo(polo, delay) {
    if (isPoloRemovalPending(polo)) {
        listPoloDelayedRemove = listPoloDelayedRemove.filter(p => p !== polo);
        polo.setRemovalPending(false);
    }
    if (polo && polo.id !== undefined) {
        if (typeof stopLyricsImmediate === 'function') {
            stopLyricsImmediate(polo.id);
        } else if (typeof stopLyrics === 'function') {
            stopLyrics(polo.id);
        }
    }

    if (polo.id in listWaiting) {
        var picto = listWaiting[polo.id];
        delete listWaiting[polo.id];
        waitingPictoInstance.remove(polo.id, picto.id);
        setTimeout(function () {
            picto.reactiver(true);
        }, 300);
    }
    checkerCodeBonus(polo.getPicto(), false);
    if (getTotalSolo() == 1 && polo.getSolo()) {
        polo.setSolo(false);
        stopSoloPolo();
    }
    polo.deshabiller(delay, bonusPlaying);
    polo.desactiverClick();
    polo.stopSound(delay);
    delay = getListPoloBusy();
    if (delay.length == 1 && (polo = delay[0]).getSolo() && isMouseDevice && !isTouchDevice) {
        polo.setSolo(false);
    }
}
function checkPoloToRemove(g) {
    var h = listPoloToRemove.length;
    var j = bonusPlaying ? 0.01 : 0.03;
    var k = 0;
    for (var l = h - 1; k < h; k++, l--) {
        removePolo(listPoloToRemove[k], l * j, g);
    }
    listPoloToRemove = [];
}
function poloStartWatchPicto() {
    var g = 0;
    for (var h = listPoloDrop.length; g < h; g++) {
        if (listPoloDrop[g].state != "hover") {
            listPoloDrop[g].mode("regarde");
        }
    }
}
function poloStopWatchPicto() {
    var h = 0;
    for (var i = listPoloDrop.length; h < i; h++) {
        listPoloDrop[h].mode("normal");
    }
}
function checkPictoHoverPolo(g) {
    var h = 0;
    for (var i = listPoloDrop.length; h < i; h++) {
        var j = listPoloDrop[h];
        if (j.hitTestPicto(g)) {
            j.rollover();
            j.pictoHoverId = g.id;
        } else if (j.pictoHoverId == g.id) {
            j.rollout();
            j.pictoHoverId = null;
        }
    }
}
function pictoOnDrop(picto, forcePlacement) {
    let targetPolo = null;
    let poloIndex = 0;
    let isDropped = false;

    const isFromBackToHomeProcessed = forcePlacement || isBackToHome;
    const poloListLength = listPolo.length;
    if (!isFromBackToHomeProcessed && !isBackToHome) {
        for (poloIndex = 0; poloIndex < poloListLength; poloIndex++) {
            if (isDropped) {
                break;
            }
            if (!isDropped) {
                targetPolo = listPolo[poloIndex];

                if (targetPolo.hitTestPicto(picto)) {
                    if (listPoloDrop.includes(targetPolo)) {
                        isDropped = true;
                        pictoTouchePolo(targetPolo, picto);
                    } else if (!(targetPolo.id in listWaiting)) {
                        isDropped = true;
                        pictoWaitPolo(targetPolo, picto);
                    }
                }
            }
        }
    }

    if (isDropped) {
        majListPoloDrop();
        listPoloDrop.length;
    } else {
        picto.replacer();
    }
}
function pictoTouchePolo(polo, picto, animationDelay, immediate) {
    var wasBusy = polo.getBusy();
    var oldPictoId = wasBusy ? polo.getPicto().id : null;

    picto.absorber(polo);

    if (wasBusy) {
        checkerCodeBonus({ id: oldPictoId }, false);
        checkerCodeBonus(picto, true);
    } else {
        checkerCodeBonus(picto, true);
    }

    habillerPolo(polo, picto, animationDelay, immediate);
    if (getTotalSolo() > 0) {
        polo.mute();
    }
}
function pictoWaitPolo(polo, picto) {
    cancelDelayedRemovePolo(polo);
    picto.absorber(polo);
    listWaiting[polo.id] = picto;
    waitingPictoInstance.show(polo.id, picto.id);
    let fun0 = `onV${appVersion}Polo${picto.id}WaitSwap`;
    window[fun0]?.();
}
function checkPoloHeight(polo, waitingPictoEl, tween = false) {
    if (tween) {
        waitingPictoEl.style.transition = "top 0.50s cubic-bezier(.2, .8, .2, 1)";
    } else {
        waitingPictoEl.style.transition = "none";
    }

    waitingPictoEl.style.top = polo.waitingPictoOffsetY || "0px";
}
function majListPoloDrop() {
    listPoloDrop = [];
    for (var e = 0; e < nbPoloMax; e++) {
        var o = listPolo[e];
        if (!o.getBusy()) {
            listPoloDrop.push(o);
        }
    }
}
var btClockClickedAt = 0;
function clickBtClock() {
    if (getTime() - btClockClickedAt > 350) {
        pauseGame();
        btClockClickedAt = getTime();
    }
}
function enableBtClock() {
    $btClock.off().on(pointerEventType.down, function (e) {
        e.preventDefault();
        preventAction(clickBtClock);
    }).addClass("enable");
}
function disableBtClock() {
    $btClock.off().removeClass("enable");
}
