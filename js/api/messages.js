/*
 * messages.js
 * Everything that shows text/images on top of the game:
 * QuickMessage, image popups, speech bubbles, sliding popups, full-screen popup and toasts.
 */

const messageQueue = [];

/** Shows `html` at the bottom of the screen for `duration` ms. Hidden when the "Lyrics" setting is off. */
function QuickMessage(html, duration = 2000) {
    if (!LyricsOn) return;

    const msg = document.createElement("div");
    msg.classList.add("quickmessage");
    msg.innerHTML = html;
    Object.assign(msg.style, {
        position: "fixed",
        left: "50%",
        bottom: "50px",
        transform: "translateX(-50%) translateY(20px)",
        zIndex: "9999",
        opacity: "0",
        transition: "opacity 0.3s ease, transform 0.3s ease, bottom 0.3s ease"
    });
    document.body.appendChild(msg);
    messageQueue.unshift(msg);
    updateMessagePositions();

    setTimeout(() => {
        msg.style.opacity = "1";
        msg.style.transform = "translateX(-50%) translateY(0px)";
    }, 10);
    setTimeout(() => {
        msg.style.opacity = "0";
        msg.style.transform = "translateX(-50%) translateY(20px)";
        setTimeout(() => {
            msg.remove();
            const i = messageQueue.indexOf(msg);
            if (i !== -1) messageQueue.splice(i, 1);
            updateMessagePositions();
        }, 300);
    }, duration);
}

function updateMessagePositions() {
    let bottom = 50;
    for (let i = messageQueue.length - 1; i >= 0; i--) {
        const msg = messageQueue[i];
        msg.style.bottom = `${bottom}px`;
        bottom += msg.offsetHeight + 10;
    }
}

/**
 * Shows an image (or a list of images played as frames) at x/y for `duration` ms.
 * showImagePopup(images, width, height, x, y, duration, fadeInMs, fadeOutMs)
 */
function showImagePopup(images, w, h, x, y, duration, fadeIn, fadeOut) {
    w = w || '90%';
    h = h || '90%';
    fadeIn = fadeIn || 0;
    fadeOut = fadeOut || 0;
    var isArray = Array.isArray(images);
    var list = isArray ? images : [images];

    var div = document.createElement('div');
    div.style.cssText = 'position:fixed;left:' + x + ';top:' + y + ';width:' + w + ';height:' + h + ';transform:translate(-50%,-50%);z-index:9999;opacity:' + (fadeIn ? 0 : 1) + ';transition:opacity ' + fadeIn + 'ms;pointer-events: none;';
    if (fadeIn) setTimeout(function () { div.style.opacity = '1'; }, 10);

    var img = document.createElement('img');
    img.src = list[0];
    img.style.cssText = 'width:100%;height:100%;object-fit:contain;display:block';
    div.appendChild(img);
    document.body.appendChild(div);

    if (isArray && list.length > 1) {
        var frame = 0;
        var interval = duration / list.length;
        var timer = setInterval(function () {
            frame++;
            if (frame < list.length) {
                img.src = list[frame];
            } else {
                clearInterval(timer);
            }
        }, interval);
    }

    setTimeout(function () {
        if (fadeOut) {
            div.style.transition = 'opacity ' + fadeOut + 'ms';
            div.style.opacity = '0';
            setTimeout(function () { document.body.removeChild(div); }, fadeOut);
        } else {
            document.body.removeChild(div);
        }
    }, duration + (fadeIn ? fadeIn : 0));
}

const bubbleTimers = {};

/** Shows a speech bubble (avatar + text) above polo `poloid` for `duration` ms (default 6 s). */
function showSpeechBubble(poloid, text, imageUrl, duration) {
    if (duration === undefined) duration = 6000;

    if (!window._spbWrapped) {
        window._spbWrapped = true;
        var origRemovePolo = window.removePolo;
        window.removePolo = function (polo, delay, immediate) {
            closeBubble(polo.id);
            return origRemovePolo(polo, delay, immediate);
        };
    }

    const selector = ".polo[data-polo-id='" + poloid + "']";
    const polo = document.querySelector(selector);
    if (!polo) {
        toast.show(`Polo with ID [${poloid}] does not exist`);
        return;
    }

    const existingBubble = document.querySelector(`[data-speech-polo="${poloid}"]`);
    if (existingBubble) {
        existingBubble.remove();
    }

    const bubble = document.createElement('div');
    bubble.className = 'speech-bubble';
    bubble.setAttribute('data-speech-polo', poloid);
    bubble.innerHTML = `
        <div class="bubble-content">
            <img src="${imageUrl}" alt="avatar" class="bubble-avatar">
            <span class="bubble-text">${text}</span>
        </div>
    `;

    polo.appendChild(bubble);

    requestAnimationFrame(() => {
        bubble.classList.add('show');
    });

    clearTimeout(bubbleTimers[poloid]);
    bubbleTimers[poloid] = setTimeout(() => closeBubble(poloid), duration);
}

function closeBubble(poloid) {
    const bubble = document.querySelector(`[data-speech-polo="${poloid}"]`);
    if (!bubble) return;

    bubble.classList.remove('show');
    setTimeout(() => {
        if (bubble.parentElement) {
            bubble.remove();
        }
    }, 300);
}

function slidePopup(side, text, duration) {
    const popup = document.createElement("div");
    popup.className = `mod-${side}-popup`;
    popup.textContent = text;
    document.body.appendChild(popup);
    setTimeout(() => popup.style[side] = "20px", 10);

    const onHidden = () => {
        popup.removeEventListener("transitionend", onHidden);
        popup.remove();
    };
    setTimeout(() => {
        popup.style[side] = "-30%";
        popup.addEventListener("transitionend", onHidden);
    }, duration * 1000);
    return popup;
}

/** Slides a text popup in from the right for `duration` seconds. */
function rightPopup(text, duration = 3) { return slidePopup("right", text, duration); }
/** Slides a text popup in from the left for `duration` seconds. */
function leftPopup(text, duration = 3) { return slidePopup("left", text, duration); }
/** Slides a text popup in from the top for `duration` seconds. */
function topPopup(text, duration = 3) { return slidePopup("top", text, duration); }
/** Slides a text popup in from the bottom for `duration` seconds. */
function bottomPopup(text, duration = 3) { return slidePopup("bottom", text, duration); }

/** Covers the screen with an image. Removed after `duration` ms (omit it to keep it). */
function fullPopup(url, duration) {
    const popup = document.createElement("div");
    popup.className = "mod-full-popup";
    popup.style.backgroundImage = `url(${url})`;
    document.body.appendChild(popup);
    if (duration != null && !isNaN(duration)) {
        setTimeout(() => popup.remove(), duration);
    }
    return popup;
}

class ToastSystem {
    constructor() {
        this.container = null;
        this.toasts = [];
        this.spacing = 15;
        this.initContainer();
    }

    initContainer() {
        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
    }

    updatePositions() {
        let y = 20;
        for (let i = 0; i < this.toasts.length; i++) {
            const t = this.toasts[i];
            t.index = i;
            t.el.dataset.index = i;
            const height = t.el.offsetHeight || 72;
            t.el.style.transition = 'bottom 0.25s ease';
            t.el.style.bottom = `${y}px`;
            y += height + this.spacing;
            setTimeout(() => { if (t.el) t.el.style.transition = ''; }, 300);
        }
    }

    show(title = "----------------", duration = 3, message = "") {
        const el = document.createElement('div');
        el.className = 'toast';
        const header = title ? `<div class="toast-header"><span class="toast-title">${title}</span></div>` : '';
        el.innerHTML = `
            ${header}
            <div class="toast-content">
                <div class="toast-message">${message}</div>
            </div>
            <div class="toast-progress" style="animation-duration: ${duration}s"></div>
        `;

        const index = this.toasts.length;
        el.dataset.index = index;

        const toast = {
            el,
            index,
            durationMs: duration * 1000,
            remainingMs: duration * 1000,
            startTime: null,
            timeoutId: null
        };

        this.container.appendChild(el);
        this.toasts.push(toast);

        requestAnimationFrame(() => {
            this.updatePositions();
            requestAnimationFrame(() => {
                toast.startTime = Date.now();
                toast.timeoutId = setTimeout(() => this.remove(toast), toast.remainingMs);
                el.classList.add('show');
            });
        });

        const progressEl = el.querySelector('.toast-progress');
        if (progressEl) {
            const onAnimEnd = () => {
                progressEl.removeEventListener('animationend', onAnimEnd);
                this.remove(toast);
            };
            progressEl.addEventListener('animationend', onAnimEnd);
        }

        el.addEventListener('click', () => this.remove(toast));

        el.addEventListener('mouseenter', () => {
            if (toast.timeoutId) {
                clearTimeout(toast.timeoutId);
                toast.timeoutId = null;
                const elapsed = Date.now() - (toast.startTime || Date.now());
                toast.remainingMs = Math.max(0, toast.remainingMs - elapsed);
            }
            if (progressEl) progressEl.style.animationPlayState = 'paused';
        });
        el.addEventListener('mouseleave', () => {
            if (!toast.timeoutId && toast.remainingMs > 0) {
                toast.startTime = Date.now();
                toast.timeoutId = setTimeout(() => this.remove(toast), toast.remainingMs);
            }
            if (progressEl) progressEl.style.animationPlayState = 'running';
        });

        return el;
    }

    remove(toast) {
        if (!toast || !toast.el.parentNode) return;
        if (toast.timeoutId) { clearTimeout(toast.timeoutId); toast.timeoutId = null; }

        toast.el.classList.remove('show');
        toast.el.classList.add('exit');

        setTimeout(() => {
            if (toast.el.parentNode) toast.el.remove();
            this.toasts = this.toasts.filter(t => t !== toast);
            this.updatePositions();
        }, 300);
    }

    clearAll() {
        for (let i = this.toasts.length - 1; i >= 0; i--) this.remove(this.toasts[i]);
    }
}
const toast = new ToastSystem();
window.toast = toast;
