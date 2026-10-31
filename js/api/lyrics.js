/*
 * lyrics.js
 * Lyrics that float above a polo: poloLyrics(), stopLyrics(), stopLyricsImmediate().
 * Lyrics follow their polo when the window is resized and are cleaned up when the polo is removed.
 */

const activeLyricsElements = new Map();
const activeLyricsTimeouts = {};

function setupLyricsCleanupObserver() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
                mutation.removedNodes.forEach((node) => {
                    if (node.classList && node.classList.contains('polo')) {
                        const poloId = node.getAttribute('data-polo-id');
                        if (poloId) {
                            const orphanedLyrics = document.querySelectorAll(`.polo-lyrics[data-lyrics-polo="${poloId}"]`);
                            orphanedLyrics.forEach(lyrics => lyrics.remove());
                            if (typeof stopLyrics === 'function') {
                                stopLyrics(poloId);
                            }
                        }
                    }
                });
            }
        });
    });

    const poloContainer = document.querySelector('#box-polo');
    if (poloContainer) {
        observer.observe(poloContainer, { childList: true, subtree: true });
    }
}

if (typeof window.addEventListener === 'function') {
    window.addEventListener('load', function () {
        setTimeout(setupLyricsCleanupObserver, 1000);
    });
}

let lyricsResizeObserver = null;
let lyricsResizeTimeout = null;

function updateAllLyricsPositions() {
    activeLyricsElements.forEach((lyricsElement, poloId) => {
        if (!lyricsElement || !lyricsElement.parentElement) return;

        const polo = document.querySelector(`[data-polo-id="${poloId}"]`);
        if (!polo) return;

        const poloRect = polo.getBoundingClientRect();
        const containerRect = polo.parentElement.getBoundingClientRect();

        lyricsElement.style.left = `${poloRect.left - containerRect.left + poloRect.width / 2 - 145}px`;
        lyricsElement.style.top = `${poloRect.top - containerRect.top - 25}px`;
    });
}

function handleLyricsResize() {
    if (lyricsResizeTimeout) {
        clearTimeout(lyricsResizeTimeout);
    }
    lyricsResizeTimeout = setTimeout(() => {
        updateAllLyricsPositions();
    }, 100);
}

function initLyricsResizeHandling() {
    if (typeof ResizeObserver !== 'undefined') {
        const poloContainer = document.querySelector('#box-polo');
        if (poloContainer && !lyricsResizeObserver) {
            lyricsResizeObserver = new ResizeObserver(() => {
                updateAllLyricsPositions();
            });
            lyricsResizeObserver.observe(poloContainer);
        }
    }

    window.addEventListener('resize', handleLyricsResize);
}

if (typeof window.addEventListener === 'function') {
    window.addEventListener('load', function () {
        setTimeout(initLyricsResizeHandling, 1000);
    });
}

/**
 * Shows lyrics above a polo.
 * poloLyrics(poloId, text or [text, translation], durationMs, color, fontFile, sizePx, shake)
 * `fontFile` is a file in the font/ folder. Hidden when the "Lyrics" setting is off.
 */
function poloLyrics(poloId, text, duration, color, font, size, shake = false) {
    stopLyrics(poloId);
    if (!LyricsOn) return;

    if (activeLyricsElements.has(poloId)) {
        const oldEl = activeLyricsElements.get(poloId);
        if (oldEl && oldEl.parentElement) oldEl.remove();
        activeLyricsElements.delete(poloId);
    }

    const polo = document.querySelector(`[data-polo-id="${poloId}"]`);
    if (!polo) {
        console.error(`Polo with ID ${poloId} not found`);
        return;
    }

    const lyricsContainer = document.createElement("div");
    lyricsContainer.className = "polo-lyrics";
    lyricsContainer.setAttribute("data-lyrics-polo", poloId);

    let lText1;
    let lText2;

    if (Array.isArray(text)) {
        lText1 = text[0] || "";
        lText2 = text[1] || "";
    } else {
        lText1 = text || "";
        lText2 = "";
    }

    const mainLine = document.createElement("span");
    mainLine.className = "lyrics-text lyrics-primary";
    mainLine.textContent = lText1;
    lyricsContainer.appendChild(mainLine);

    if (lText2) {
        const subLine = document.createElement("span");
        subLine.className = "lyrics-text lyrics-translation";
        subLine.textContent = `(${lText2})`;
        lyricsContainer.appendChild(subLine);
    }

    lyricsContainer.style.color = color || "white";

    if (font) {
        const fontFile = font.replace(/^\.?\/?font\//, "");
        const fontName = fontFile.replace(/^.*\//, "").replace(/\.[^/.]+$/, "");
        const fontKey = `font-${fontName}`;

        if (!document.querySelector(`style[data-font="${fontKey}"]`)) {
            const style = document.createElement("style");
            style.setAttribute("data-font", fontKey);

            const basePath = window.location.pathname.includes('/pages/') ? '../' : './';
            const fontPath = `${basePath}font/${fontFile}`;
            const ext = (fontFile.split(".").pop() || "").toLowerCase();
            const format = { ttf: "truetype", otf: "opentype", woff: "woff", woff2: "woff2" }[ext] || "truetype";

            style.textContent = `
                @font-face {
                    font-family: "${fontName}";
                    src: url("${fontPath}") format('${format}');
                    font-weight: normal;
                    font-style: normal;
                    font-display: swap;
                }
            `;
            document.head.appendChild(style);
        }

        const allLyricsText = lyricsContainer.querySelectorAll('.lyrics-text');
        allLyricsText.forEach(line => {
            line.style.fontFamily = `"${fontName}", system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`;
            line.style.fontWeight = 'normal';
            line.style.fontStyle = 'normal';
        });

        if (document.fonts && document.fonts.load) {
            document.fonts.load(`1em "${fontName}"`).catch(e => console.warn('Font loading failed:', e));
        }
    } else {
        const allLyricsText = lyricsContainer.querySelectorAll('.lyrics-text');
        allLyricsText.forEach(line => {
            line.style.fontFamily = "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
        });
    }

    lyricsContainer.style.fontSize = size ? `${size}px` : "16px";

    if (shake) {
        const shakeTarget = lyricsContainer.querySelector('.lyrics-primary') || lyricsContainer.querySelector('.lyrics-text');
        if (shakeTarget) {
            shakeEffect(shakeTarget);
        }
    }

    const poloRect = polo.getBoundingClientRect();
    const containerRect = polo.parentElement.getBoundingClientRect();

    lyricsContainer.style.left = `${poloRect.left - containerRect.left + poloRect.width / 2 - 145}px`;
    lyricsContainer.style.top = `${poloRect.top - containerRect.top - 25}px`;

    polo.parentElement.appendChild(lyricsContainer);

    activeLyricsElements.set(poloId, lyricsContainer);

    requestAnimationFrame(() => {
        lyricsContainer.classList.add("show");
    });

    if (activeLyricsTimeouts[poloId]) {
        clearTimeout(activeLyricsTimeouts[poloId]);
    }

    activeLyricsTimeouts[poloId] = setTimeout(() => {
        stopLyrics(poloId);
        if (activeLyricsElements.has(poloId)) {
            activeLyricsElements.delete(poloId);
        }
    }, duration);
}
function stopLyrics(poloId) {
    if (activeLyricsTimeouts && activeLyricsTimeouts[poloId]) {
        clearTimeout(activeLyricsTimeouts[poloId]);
        delete activeLyricsTimeouts[poloId];
    }

    if (typeof activeLyricsElements !== 'undefined' && activeLyricsElements.has(poloId)) {
        const el = activeLyricsElements.get(poloId);
        if (el && el.parentElement) {
            el.classList.remove("show");
            el.style.opacity = "0";
            el.style.transform = "translateY(10px) scale(0.9)";

            setTimeout(() => {
                if (el && el.parentElement) {
                    el.remove();
                }
            }, 300);
        }
        activeLyricsElements.delete(poloId);
    }

    const selectors = [
        `[data-lyrics-polo="${poloId}"]`,
        `.polo-lyrics[data-lyrics-polo="${poloId}"]`
    ];

    for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            if (el && el.parentElement) {
                el.classList.remove("show");
                el.style.opacity = "0";
                el.style.transform = "translateY(10px) scale(0.9)";

                setTimeout(() => {
                    if (el && el.parentElement) {
                        el.remove();
                    }
                }, 300);
            }
        });
    }

    const allLyrics = document.querySelectorAll('.polo-lyrics');
    allLyrics.forEach(el => {
        if (el.getAttribute('data-lyrics-polo') == poloId) {
            el.classList.remove("show");
            el.style.opacity = "0";
            el.style.transform = "translateY(10px) scale(0.9)";

            setTimeout(() => {
                if (el && el.parentElement) {
                    el.remove();
                }
            }, 300);
        }
    });
}
function stopLyricsImmediate(poloId) {
    if (activeLyricsTimeouts && activeLyricsTimeouts[poloId]) {
        clearTimeout(activeLyricsTimeouts[poloId]);
        delete activeLyricsTimeouts[poloId];
    }

    if (typeof activeLyricsElements !== 'undefined' && activeLyricsElements.has(poloId)) {
        const el = activeLyricsElements.get(poloId);
        if (el && el.parentElement) {
            el.remove();
        }
        activeLyricsElements.delete(poloId);
    }

    const allLyrics = document.querySelectorAll('.polo-lyrics');
    allLyrics.forEach(el => {
        if (el.getAttribute('data-lyrics-polo') == poloId) {
            el.remove();
        }
    });
}
function shakeEffect(element) {
    const originalText = element.textContent;

    const letters = originalText.split('').map(letter => {
        const span = document.createElement('span');
        if (letter === ' ') {
            span.innerHTML = '&nbsp;';
        } else {
            span.textContent = letter;
            span.classList.add('shake');
            span.style.display = 'inline-block';
        }
        return span;
    });

    element.innerHTML = '';
    letters.forEach(span => element.appendChild(span));

    const shakeDistance = 1.5;

    clearInterval(element._shakeInterval);
    element._shakeInterval = setInterval(() => {
        if (!element.isConnected) {
            clearInterval(element._shakeInterval);
            return;
        }
        letters.forEach(letter => {
            const shakeX = (Math.random() * shakeDistance) - shakeDistance;
            const shakeY = (Math.random() * shakeDistance) - shakeDistance;
            letter.style.transform = `translate(${shakeX}px, ${shakeY}px)`;
        });
    }, 16);
}
