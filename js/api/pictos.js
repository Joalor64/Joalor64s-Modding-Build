/*
 * pictos.js
 * The picto icons (bottom bar): add/remove/move icons, change their sprites/layers,
 * shake & wiggle effects, and the "waiting" picto shown on a polo while a sound waits for the next loop.
 */

let wiggleAnimationFrame = null;
const pictoTransforms = new Map();
function ReplacePictoID(e, t) {
    const o = document.getElementById(`picto${e}`);
    if (o) {
        o.setAttribute("data-picto-num", t);
        o.id = `picto${t}`;
    }
}
function RemovePicto(e) {
    const t = document.getElementById(`picto${e}`);
    if (t) {
        t.remove();
    }
}
function AddPicto(e, t) {
    const o = document.getElementById("box-picto");
    if (o) {
        let n;
        if (t === 1) {
            n = o.querySelector(".pictoline.top");
        } else if (t === 2) {
            n = o.querySelector(".pictoline.bot");
        }
        if (n) {
            const t = document.createElement("div");
            t.classList.add("picto");
            t.id = `picto${e}`;
            t.setAttribute("data-picto-num", e);
            const o = document.createElement("div");
            o.classList.add("bck");
            const iconPath = auto2xPath(`./${app.folder}img/game-picto.png`);
            o.style.backgroundImage = `url(${iconPath})`;
            tryImageFallback(iconPath, fallback => {
                o.style.backgroundImage = `url(${fallback})`;
            });
            const i = document.createElement("div");
            i.classList.add("hitzone");
            t.appendChild(o);
            t.appendChild(i);
            n.appendChild(t);
            if (typeof applyCustomPictoPos === "function") applyCustomPictoPos(t, Number(e));
        }
    }
}
function initPictoSize() {
    const e = document.getElementById("box-picto");
    if (!e) {
        return;
    }
    const t = e.style.width;
    function o() {
        document.querySelectorAll(".pictoline:not(.custom-pos)").forEach(e => {
            const t = e.querySelectorAll(".picto").length * 85 / e.parentElement.offsetWidth * 100;
            e.style.width = `${t}%`;
        });
    }
    if (e.offsetWidth !== 920) {
        e.style.width = "920px";
        requestAnimationFrame(() => {
            o();
            e.style.width = t || "";
        });
    } else {
        o();
    }
}
function adjustPictoWidth() {
    document.querySelectorAll(".picto .bck").forEach((e, t) => {
        e.style.backgroundPosition = `calc((100% / ${app.animearray.length - 1}) * ${t}) 0`;
    });
}
function setPictoLayer(e, t = null) {
    let o = document.querySelectorAll(".picto .bck");
    if (t === null) {
        o.forEach(t => {
            t.style.setProperty("--layer-image", `url(${e})`);
        });
    } else {
        t.forEach(t => {
            if (t >= 0 && t < o.length) {
                o[t].style.setProperty("--layer-image", `url(${e})`);
            }
        });
    }
}
function replacePictoSprite(e) {
    document.querySelectorAll(".picto .bck").forEach(t => {
        t.style.backgroundImage = `url(${e})`;
    });
}
function initUpdatedPictoIcons() {
    document.querySelectorAll(".picto").forEach(e => {
        const t = parseInt(e.getAttribute("data-picto-num"), 10);
        const o = app.animearray[t];
        if (o && o.icon && o.icon.trim() !== "") {
            const t = e.querySelector(".bck");
            if (t) {
                const path = `${app.folder}img/${o.icon}`;
                t.style.backgroundImage = `url('${path}')`;
                tryImageFallback(path, fb => t.style.backgroundImage = `url('${fb}')`);
            }
        }
    });
}

function getPictoTransform(bck) {
    let t = pictoTransforms.get(bck);
    if (!t) {
        t = { shake: { x: 0, y: 0 }, wiggle: { x: 0, y: 0 } };
        pictoTransforms.set(bck, t);
    }
    return t;
}

function updateTransform(bck) {
    const t = getPictoTransform(bck);
    bck.style.transform = `translate(${t.shake.x + t.wiggle.x}px, ${t.shake.y + t.wiggle.y}px)`;
}

let shakingPictoPower = 0;
let pictoShakeInterval = null;

/** Makes every picto icon shake with `power` px (updated every `interval` ms) until clearShakingPicto(). */
function initShakingPicto(power, interval = 5) {
    clearShakingPicto();
    shakingPictoPower = power;
    const pictos = document.querySelectorAll(".picto");
    pictoShakeInterval = setInterval(() => {
        pictos.forEach(picto => {
            const bck = picto.querySelector(".bck");
            if (bck) {
                const t = getPictoTransform(bck);
                t.shake.x = (Math.random() - 0.5) * shakingPictoPower;
                t.shake.y = (Math.random() - 0.5) * shakingPictoPower;
                updateTransform(bck);
            }
        });
    }, interval);
}

/** Stops initShakingPicto(). */
function clearShakingPicto() {
    if (pictoShakeInterval) {
        clearInterval(pictoShakeInterval);
        pictoShakeInterval = null;
    }
    pictoTransforms.forEach((t, bck) => {
        t.shake.x = 0;
        t.shake.y = 0;
        updateTransform(bck);
    });
}

/** Makes the picto icons bob up and down like a wave (`speed`, `height` in px) until stopWiggle(). */
function wigglePictos(speed = 2, height = 10) {
    stopWiggle();
    const pictos = document.querySelectorAll(".picto");
    let start = null;
    wiggleAnimationFrame = requestAnimationFrame(function frame(now) {
        if (!start) start = now;
        const seconds = (now - start) / 1000;
        pictos.forEach((picto, index) => {
            const bck = picto.querySelector(".bck");
            if (bck) {
                getPictoTransform(bck).wiggle.y = Math.sin((seconds - index * 0.3) * speed) * height;
                updateTransform(bck);
            }
        });
        wiggleAnimationFrame = requestAnimationFrame(frame);
    });
}

/** Stops wigglePictos(). */
function stopWiggle() {
    if (wiggleAnimationFrame) {
        cancelAnimationFrame(wiggleAnimationFrame);
        wiggleAnimationFrame = null;
    }
    pictoTransforms.forEach((t, bck) => {
        t.wiggle.x = 0;
        t.wiggle.y = 0;
        updateTransform(bck);
    });
}

function movePictoLine(e, t, o) {
    if ("v" + getVersionFromURL() !== e) {
        return;
    }
    if (typeof hasCustomPictoLayout === "function" && hasCustomPictoLayout()) {
        console.warn("movePictoLine: this version uses custom picto positions (data/configs/uiLayout.jsonc)");
        return;
    }
    const n = document.querySelector(".pictoline.bot");
    const i = document.querySelector(".pictoline.top");
    if (n && i) {
        for (let e = 0; e < t + o; e++) {
            const t = document.querySelector(`#picto${e}.picto`);
            if (t) {
                i.appendChild(t);
            }
        }
        for (let e = t; e < t + o; e++) {
            const t = document.querySelector(`#picto${e}.picto`);
            if (t) {
                n.appendChild(t);
            }
        }
        i.style.cssText = `
            display: flex;
            justify-content: center;
            width: 47%;
            margin-right: 3%;
        `;
        n.style.cssText = `
            display: flex;
            justify-content: center;
            width: 47%;
            margin-left: 3%;
        `;
        initPictoSize();
    }
}
function impactIcons(e, t) {
    initShakingPicto(e);
    smoothNumber(e, 0, t, e => {
        shakingPictoPower = e;
        if (e <= 0.01) {
            clearShakingPicto();
        }
    });
}

class waitingPicto {
    constructor() {
        this.activeElements = new Map();
        this.rafId = null;
        this._tick = this._tick.bind(this);
    }

    show(poloId, pictoId) {
        if (null == poloId) return null;
        const selector = ".polo[data-polo-id='" + poloId + "']";
        const poloDiv = document.querySelector(selector);
        if (!poloDiv) return null;
        const elId = 'picto' + pictoId;
        let el = poloDiv.querySelector('#' + elId);
        if (el) return el;

        el = document.createElement('div');
        el.className = 'waiting-picto';
        el.id = elId;
        el.dataset.poloId = poloId;
        el.dataset.pictoId = pictoId;

        const color = `#${String(app.animearray[pictoId]?.color || 'ffffff').replace(/^#+/, '')}`;

        const ring = document.createElement('div');
        ring.className = 'waiting-picto-ring';
        el.appendChild(ring);

        el.style.backgroundImage = `url(${listImages["gamePicto"]["src"]})`;
        el.style.backgroundPosition = `calc((100% / ${nbSound - 1}) * ${pictoId}) 0`;
        poloDiv.appendChild(el);

        const initialRemain = typeof timeremain !== 'undefined' ? timeremain : (typeof loopDuration !== 'undefined' ? loopDuration : 1);
        this.activeElements.set(elId, { el, ring, color, initialRemain });
        if (!this.rafId) this._startTick();

        return el;
    }

    remove(poloId, pictoId) {
        if (null == poloId) return;
        const selector = ".polo[data-polo-id='" + poloId + "']";
        const poloDiv = document.querySelector(selector);
        if (!poloDiv) return;
        const elId = 'picto' + pictoId;
        const el = poloDiv.querySelector('#' + elId);
        if (!el) return;

        this.activeElements.delete(elId);
        if (this.activeElements.size === 0) this._stopTick();

        try {
            const animationName = 'removeWaitingPicto';
            el.style.animationName = animationName;
            el.style.animationDuration = '.7s';
            el.style.animationFillMode = 'forwards';

            const onEnd = () => {
                el.removeEventListener('animationend', onEnd);
                if (el.parentNode) el.parentNode.removeChild(el);
            };

            el.addEventListener('animationend', onEnd);

            setTimeout(() => {
                if (el.parentNode) {
                    try { el.parentNode.removeChild(el); } catch (e) { }
                }
            }, 900);
        } catch (e) {
            if (el.parentNode) el.parentNode.removeChild(el);
        }
    }

    _startTick() {
        this.rafId = requestAnimationFrame(this._tick);
    }

    _stopTick() {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }

    _tick() {
        const remain = typeof timeremain !== 'undefined' ? timeremain : 0;

        for (const item of this.activeElements.values()) {
            if (item.ring) {
                const progress = item.initialRemain > 0
                    ? Math.max(0, Math.min(1, remain / item.initialRemain))
                    : 0;
                const donePct = (1 - progress) * 100;
                item.ring.style.background =
                    `conic-gradient(transparent ${donePct}%, ${item.color} ${donePct}%)`;
            }
        }

        this.rafId = requestAnimationFrame(this._tick);
    }
}
const waitingPictoInstance = new waitingPicto();
