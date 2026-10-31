/*
 * polos.js
 * Controlling the polos (the characters) from a mod: add/remove sounds, swap sprites,
 * "impact" effects, debug hitboxes, and forceMod shortcuts.
 */

function getPoloSpriteImage() {
    return "polo-sprite.png";
}

/** Uses another sprite sheet (from the img/ folder) for every default polo. */
function ReplacePoloSprite(fileName) {
    getPoloSpriteImage = () => fileName;
    if (typeof polos !== "undefined" && polos) {
        replaceAllDefaultPolos(fileName);
    }
}

/** Uses another sprite sheet (from the img/ folder) for default polo number `poloIndex`. */
function replaceDefaultPolo(poloIndex, fileName) {
    if (typeof polos !== "undefined" && polos?.[poloIndex]?.setSprite) {
        polos[poloIndex].setSprite(fileName);
    } else {
        console.log(`[replace polo] Polo ${poloIndex} doesn't exist`);
    }
}

/** Same as replaceDefaultPolo, for every polo. */
function replaceAllDefaultPolos(fileName) {
    const count = app.nbpolo || 7;
    for (let i = 0; i < count; i++) {
        if (typeof polos !== "undefined" && polos?.[i]) {
            polos[i].setSprite(fileName);
        }
    }
    app.poloSprite = fileName;
}

/** Drops picto (sound) `pictoId` on polo `poloId`, replacing what it was playing. */
function forceAddPolo(poloId, pictoId) {
    if (listPolo[poloId] && listPicto[pictoId]) {
        if (listPolo[poloId].getBusy() == 1) {
            removePolo(listPolo[poloId]);
            console.warn(`Polo ${poloId} was busy, removing it before adding new one`);
        }
        pictoTouchePolo(listPolo[poloId], listPicto[pictoId]);
        majListPoloDrop();
    } else {
        console.error(`Invalid polo (${poloId}) or picto (${pictoId})`);
    }
}

/** Removes the sound from polo `poloId`. */
function forceRemovePoloById(poloId) {
    if (!listPolo[poloId]) {
        console.error(`Invalid poloId (${poloId})`);
        return;
    }
    if (listPolo[poloId].getBusy() == 1) {
        removePolo(listPolo[poloId]);
        majListPoloDrop();
        console.log(`Polo ${poloId} force removed.`);
    } else {
        console.warn(`Polo ${poloId} is not busy, nothing to remove.`);
    }
}

/** Removes whichever polo is currently playing picto `pictoId`. */
function forceRemovePoloByPictoId(pictoId) {
    const picto = listPicto && listPicto[pictoId];
    if (!picto || !picto.polo) {
        console.error(`Invalid pictoId (${pictoId}) or no polo attached.`);
        return;
    }
    if (picto.polo.getBusy && picto.polo.getBusy() == 1) {
        removePolo(picto.polo);
        majListPoloDrop();
        console.log(`Polo for picto ${pictoId} removed.`);
    } else {
        console.warn(`Polo for picto ${pictoId} is not busy or missing getBusy method.`);
    }
}

/**
 * Removes polo `poloId` when the next loop starts (same as its clock button / swiping it sideways).
 * Calling it again before then cancels. Returns true if the polo is now set to leave.
 */
function delayRemovePoloById(poloId) {
    if (!listPolo[poloId]) {
        console.error(`Invalid poloId (${poloId})`);
        return false;
    }
    return delayRemovePolo(listPolo[poloId]);
}

/** Cancels a delayed removal of polo `poloId`. */
function cancelDelayRemovePoloById(poloId) {
    if (listPolo[poloId]) cancelDelayedRemovePolo(listPolo[poloId]);
}

/** Makes the polos tremble with strength `power`, calming down over `duration` ms. */
function impactPolos(power, duration) {
    app.scaredPolos = power;
    smoothNumber(power, 0, duration, value => {
        app.scaredPolos = value;
    });
}

/** Test helper: animates the polo tremble strength from `from` to 5 over one second. */
function changeSmoothSize(from) {
    app.scaredPolos = from;
    smoothNumber(from, 5, 1000, value => {
        app.scaredPolos = value;
    });
}

/** Debug: outlines polos, pictos and hitzones (I + ( hotkey). */
function showBoundingBoxes() {
    document.querySelectorAll(".polo, .picto, .hitzone").forEach(el => el.classList.toggle("boundingBoxReveal"));
    document.getElementById("box-polo")?.classList.toggle("boundingBoxReveal");
}

/** Shortcuts that act like the player pressed a button. */
const forceMod = {
    openApp: function () {
        forceUserGesture(clickHomeBtPlay);
    },
    openPlayList: function () {
        forceUserGesture(clickHomeBtPlaylist);
    },
    killAllPolos: function () {
        immediateKillAllPolo();
        stopLoop();
    }
};
