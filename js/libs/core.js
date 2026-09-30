const VERSION = {
    major: 0,
    minor: 1,
    patch: 0,

    prerelease: {
        type: "",
        version: null
    },

    build: null,
    hotfix: false
};

function getVersion(v = VERSION, readable = false) {
    let version = `${v.major}.${v.minor}.${v.patch}`;

    if (v.prerelease.type) {
        if (readable) {
            const names = {
                alpha: "Alpha",
                beta: "Beta",
                nightly: "Nightly",
                pre: "Pre-Release",
                rc: "Release Candidate"
            };

            version += ` ${names[v.prerelease.type]} ${v.prerelease.version}`;
        } else {
            version += `-${v.prerelease.type}.${v.prerelease.version}`;
        }
    }

    if (v.hotfix) {
        if (readable) {
            version += " (Hotfix)";
        } else {
            version += "h";
        }
    }

    if (v.build !== null) {
        version += `+${v.build}`;
    }

    return version;
}

enableHeadAnim = true;
enableFaceAnim = true;
let ShakeEffectOn = localStorage.getItem("ShakeEffectOn") === null || localStorage.getItem("ShakeEffectOn") === "true";
let LyricsOn = localStorage.getItem("LyricsOn") === null || localStorage.getItem("LyricsOn") === "true";
let BGorFadeOutsOn = localStorage.getItem("BGorFadeOutsOn") === null || localStorage.getItem("BGorFadeOutsOn") === "true";
let ModSoundsOn = localStorage.getItem("ModSoundsOn") === null || localStorage.getItem("ModSoundsOn") === "true";
let ConfettiEffectOn = localStorage.getItem("ConfettiEffectOn") === null || localStorage.getItem("ConfettiEffectOn") === "true";
let CustomCursorsOn = localStorage.getItem("CustomCursorsOn") === null || localStorage.getItem("CustomCursorsOn") === "true";
let expEventsOn = localStorage.getItem("expEventsOn") === null || "true" === localStorage.getItem("expEventsOn");
let expAltModeOn = localStorage.getItem("expAltModeOn") === null || "true" === localStorage.getItem("expAltModeOn");
let achiNotificationDot = parseInt(localStorage.getItem("achiNotificationDot")) || 0;
let totalBonusesWatched = parseInt(localStorage.getItem("totalBonusesWatched")) || 0;
let totalVersionsOpened = parseInt(localStorage.getItem("totalVersionsOpened")) || 0;
let totalPolosUsed = parseInt(localStorage.getItem("totalPolosUsed")) || 0;
let totalTimeSpent = parseInt(localStorage.getItem("totalTimeSpent")) || 0;
let sessionStartTime = Date.now();
function addToHistory(e) {
    let t = parseInt(localStorage.getItem(e)) || 0;
    t += 1;
    localStorage.setItem(e, t);
}

if (ForceDisableEvents) {
    expEventsOn = false;
}

window.versionCustomIcons = {};

fetch("data/versions.xml").then(e => e.text()).then(e => {
    let t = new DOMParser().parseFromString(e, "text/xml").getElementsByTagName("line");
    let o = document.getElementById("sp-select");
    let n = "";
    let b = 0;
    for (let e = 0; e < t.length; e++) {
        let i = document.createElement("div");
        i.classList.add("sp-line");
        o.appendChild(i);
        let a = t[e].getElementsByTagName("icon");
        for (let e = 0; e < a.length; e++) {
            let t = a[e].getAttribute("ID");
            let o = a[e].getAttribute("color") || "#666";
            let q = a[e].getAttribute("check") || o;
            let x = a[e].getAttribute("radius");
            let s = a[e].getAttribute("name");
            let c = a[e].getAttribute("customIcon");
            let h = a[e].getAttribute("customImageTxt");
            let r = a[e].getAttribute("locked");
            let l = a[e].getAttribute("ignored");
            let d = a[e].getAttribute("customName") === "true";
            let u = a[e].getAttribute("hidden") === "true";
            let f = a[e].getAttribute("tweenUpDelay");
            let y = a[e].getAttribute("isSpecial") === "true";
            let m = document.createElement("div");
            m.classList.add("vicon");
            m.id = "icon" + t;
            m.dataset.name = s;
            m.dataset.color = o;
            m.dataset.check = q;
            m.dataset.locked = r;
            m.dataset.isSpecial = y;
            let p = document.createElement("div");
            if (c) {
                p = document.createElement("img");
                p.id = "customicon";
                p.src = c;
                p.alt = s;
                window.versionCustomIcons[t] = c;
            } else {
                p.classList.add("img");
            }
            p.style.borderRadius = x || "25%";
            m.appendChild(p);
            if (d) {
                m.innerHTML += `<div id="customIconName" style="color: ${o};">${s}</div>`;
            } else if (h) {
                m.innerHTML += `<div class="txtCustom" style="background-image:url('${h}')"></div>`;
            } else {
                m.innerHTML += `<div class="txt"></div>`;
            }
            if (l) {
                m.classList.add("ignored");
            }
            if (r !== "true") {
                m.innerHTML += `
                    <div class="bul">
                        <svg class="icn-svg"><use xlink:href="#ic-check"></use></svg>
                    </div>
                `;
                i.appendChild(m);
            } else {
                m.classList.add("locked");
                m.innerHTML += `
                    <div class="bul">
                        <svg class="icn-svg"><use xlink:href="#ic-lock"></use></svg>
                    </div>
                `;
                let e = document.createElement("div");
                e.classList.add("locked-vicon");
                e.appendChild(m);
                i.appendChild(e);
                e.addEventListener("click", e => {
                    e.preventDefault();
                    fun0 = `onLockedIcon${t}`;
                    window[fun0]?.();
                    fun1 = "onLockedIcon";
                    window[fun1]?.();
                    console.log(`[versions.xml] function "${fun0}()" called and "${fun1}()" called`);
                    document.querySelectorAll(".vicon[data-locked=\"true\"]").forEach(e => {
                        e.classList.remove("open", "clicked");
                    });
                });
            }
            if (u) {
                m.style.display = "none";
            }
            const checkColor = q || o;
            n += `--colV${t}: ${o};\n--colV${t}-check: ${checkColor};\n`;
            let g = JSON.parse(localStorage.getItem("iconColors")) || {};
            g[`colV${t}`] = o;
            g[`colV${t}-check`] = checkColor;
            localStorage.setItem("iconColors", JSON.stringify(g));
            const bul = m.querySelector(".bul");
            if (bul) {
                bul.style.backgroundColor = checkColor;
                bul.style.color = "#ffffff";
                const svgEl = bul.querySelector("svg");
                if (svgEl) {
                    svgEl.style.fill = "#ffffff";
                    svgEl.style.color = "#ffffff";
                }
            }
            m.addEventListener("click", function (e) {
                fun0 = `onIconSelect${t}`;
                window[fun0]?.();
                fun1 = `onIconSelect`;
                window[fun1]?.();
            });

            let finalDelay;
            if (f !== null && f.trim() !== "" && !isNaN(f)) {
                finalDelay = Number(parseFloat(f).toFixed(2));
            } else {
                finalDelay = Number((0.15 + b * 0.05).toFixed(2));
            }

            m.dataset.tweenDelay = finalDelay;
            m.dataset.tweenSource = f && f.trim() !== "" ? "xml" : "auto";
            m.style.setProperty("--tween-delay", `${finalDelay}s`);

            b++;
        }
    }
    let i = document.createElement("style");
    i.innerHTML = `:root {\n${n}}`;
    document.head.appendChild(i);
    applyStoredColors();
});
window.introComplete = function () {
    document.querySelectorAll(".vicon").forEach(vicon => {
        vicon.classList.add("iconTweenUp");
    });
};
let shakingIntervals = [];
let wiggleAnimationFrame = null;
const pictoTransforms = new Map();
function getVersionFromURL() {
    return new URLSearchParams(window.location.search).get("v") || "Unknown";
}
function auto2xPath(path) {
    if (path.toLowerCase().includes("@2x")) return path;

    const dot = path.lastIndexOf(".");
    if (dot === -1) return path;

    return path.slice(0, dot) + "@2x" + path.slice(dot);
}
function getAssetFallback(path) {
    if (path.indexOf('/img/') !== -1) return path.replace('/img/', '/image/');
    if (path.indexOf('/image/') !== -1) return path.replace('/image/', '/img/');
    if (path.indexOf('/video/') !== -1) return path.replace('/video/', '/bonus/');
    if (path.indexOf('/bonus/') !== -1) return path.replace('/bonus/', '/video/');
    return null;
}
function tryImageFallback(path, onFallback) {
    const img = new Image();
    img.onerror = () => {
        const fallback = getAssetFallback(path);
        if (fallback && fallback !== path) onFallback(fallback);
    };
    img.src = path;
}
setInterval(() => {
    let e = Date.now();
    let t = Math.floor((e - sessionStartTime) / 1000);
    localStorage.setItem("totalTimeSpent", totalTimeSpent + t);
}, 1000);
window.addEventListener("beforeunload", () => {
    let e = Math.floor((Date.now() - sessionStartTime) / 1000);
    localStorage.setItem("totalTimeSpent", totalTimeSpent + e);
});
let activeDelays = [];
let isPausedD = false;
let pauseStartTime = null;
class PausableDelay {
    constructor(e, t) {
        this.callback = e;
        this.delay = t;
        this.startTime = Date.now();
        this.timeRemaining = t;
        this.timeoutId = null;
        this.isActive = true;
        if (!isPausedD) {
            this.resume();
        }
    }
    pause() {
        if (this.isActive && this.timeoutId !== null) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
            this.timeRemaining = this.delay - (Date.now() - this.startTime);
            if (this.timeRemaining < 0) {
                this.timeRemaining = 0;
            }
        }
    }
    resume() {
        if (this.isActive && this.timeoutId === null) {
            this.startTime = Date.now();
            this.timeoutId =
                setTimeout(() => {
                    this.complete();
                }, this.timeRemaining);
        }
    }
    complete() {
        if (this.isActive) {
            this.isActive = false;
            this.callback();
            activeDelays = activeDelays.filter(e => e !== this);
        }
    }
    cancel() {
        if (this.isActive) {
            this.isActive = false;
            if (this.timeoutId !== null) {
                clearTimeout(this.timeoutId);
                this.timeoutId = null;
            }
            activeDelays = activeDelays.filter(e => e !== this);
        }
    }
}
function SomeTimes(e, t) {
    if (Math.random() < e) {
        t();
    }
}
function FadeOut(e, t, o = false, n = null) {
    if (!BGorFadeOutsOn) {
        return;
    }
    const i = document.getElementById("global-fade");
    if (i) {
        i.remove();
    }
    const a = document.createElement("div");
    a.id = "global-fade";
    a.style.position = "fixed";
    a.style.top = "0";
    a.style.left = "0";
    a.style.width = "100%";
    a.style.height = "100%";
    a.style.backgroundColor = e;
    a.style.zIndex = "9999";
    a.style.pointerEvents = "none";
    a.style.transition = t > 0 ? `opacity ${t}ms ease-in` : "none";
    a.style.opacity = o ? "0" : "1";
    document.body.appendChild(a);
    a.offsetWidth;
    if (t > 0) {
        a.style.opacity = o ? "1" : "0";
        if (typeof n == "function") {
            setTimeout(() => n(), t);
        }
        if (!o) {
            setTimeout(() => a.remove(), t);
        }
    } else {
        a.style.opacity = o ? "1" : "0";
        if (typeof n == "function") {
            n();
        }
        if (!o) {
            a.remove();
        }
    }
}
function VersionFadeOut(e, t, n = false, o = null) {
    const i = document.getElementById("global-fade");
    if (i) {
        i.remove();
    }
    const a = document.createElement("div");
    a.id = "global-fade";
    a.style.position = "fixed";
    a.style.top = "0";
    a.style.left = "0";
    a.style.width = "100%";
    a.style.height = "100%";
    a.style.backgroundColor = e;
    a.style.zIndex = "9999";
    a.style.pointerEvents = "none";
    a.style.transition = t > 0 ? `opacity ${t}ms ease-in` : "none";
    a.style.opacity = n ? "0" : "1";
    document.body.appendChild(a);
    a.offsetWidth;
    if (t > 0) {
        a.style.opacity = n ? "1" : "0";
        if (typeof o == "function") {
            setTimeout(() => o(), t);
        }
        if (!n) {
            setTimeout(() => a.remove(), t);
        }
    } else {
        a.style.opacity = n ? "1" : "0";
        if (typeof o == "function") {
            o();
        }
        if (!n) {
            a.remove();
        }
    }
}
function Shake(e, t) {
    if (ShakeEffectOn) {
        const o = document.body;
        const n = o.style.cssText;
        let i = null;
        const a = s => {
            if (!i) {
                i = s;
            }
            const c = s - i;
            const r = (t - c) / t;
            const l = (Math.random() * 2 - 1) * e * r;
            const d = (Math.random() * 2 - 1) * e * r;
            o.style.transform = `translate(${l}px, ${d}px)`;
            if (c < t) {
                requestAnimationFrame(a);
            } else {
                o.style.cssText = n;
            }
        };
        requestAnimationFrame(a);
    }
}
window._allAudios = window._allAudios || [];
function playAudio(url, options = {}) {
    if (!ModSoundsOn) {
        return;
    }
    const {
        loop = false,
        fadeIn = false,
        fadeOut = false,
        fadeDuration = 1000
    } = options;
    const audio = new Audio(url);
    audio.loop = !!loop;
    audio.muted = false;
    audio.volume = fadeIn ? 0 : 1;
    audio._wasPlayingBeforeHidden = false;
    audio._userPaused = false;
    audio._stopped = false;
    window._allAudios.push(audio);
    let fadeTimer = null;
    function clearFadeTimer() {
        if (fadeTimer) {
            clearInterval(fadeTimer);
            fadeTimer = null;
        }
    }
    function doFadeIn() {
        clearFadeTimer();
        const step = 50;
        let vol = audio.volume || 0;
        fadeTimer =
            setInterval(() => {
                vol += step / fadeDuration;
                if (vol >= 1) {
                    audio.volume = 1;
                    clearFadeTimer();
                } else {
                    audio.volume = Math.min(1, vol);
                }
            }, step);
    }
    function doFadeOut(callback) {
        clearFadeTimer();
        const step = 50;
        let vol = audio.volume;
        fadeTimer =
            setInterval(() => {
                vol -= step / fadeDuration;
                if (vol <= 0) {
                    audio.volume = 0;
                    clearFadeTimer();
                    if (callback) {
                        callback();
                    }
                } else {
                    audio.volume = Math.max(0, vol);
                }
            }, step);
    }
    function cleanup() {
        clearFadeTimer();
        document.removeEventListener("visibilitychange", visibilityHandler);
        audio.removeEventListener("ended", onEnded);
        const i = (window._allAudios || []).indexOf(audio);
        if (i !== -1) {
            window._allAudios.splice(i, 1);
        }
    }
    function onEnded() {
        if (!audio.loop) {
            cleanup();
        }
    }
    audio.addEventListener("ended", onEnded);
    function visibilityHandler() {
        if (document.visibilityState === "hidden") {
            audio._wasPlayingBeforeHidden = !audio.paused && !audio.ended;
            if (audio._wasPlayingBeforeHidden) {
                safePause(false);
            }
        } else {
            if (audio._wasPlayingBeforeHidden && !audio.ended && !audio._userPaused && !audio._stopped) {
                audio.play().catch(() => { });
            }
            audio._wasPlayingBeforeHidden = false;
        }
    }
    document.addEventListener("visibilitychange", visibilityHandler);
    function safePause(userRequested = true) {
        try {
            audio.pause();
            if (userRequested) {
                audio._userPaused = true;
            }
        } catch (e) { }
    }
    function safeStop() {
        try {
            audio.pause();
        } catch (e) { }
        try {
            audio.currentTime = 0;
        } catch (e) { }
        audio._stopped = true;
        audio._userPaused = false;
        cleanup();
    }
    const playPromise = audio.play();
    if (playPromise !== undefined) {
        playPromise.then(() => {
            audio.muted = false;
            if (fadeIn) {
                doFadeIn();
            }
        }).catch(error => { });
    }
    return {
        audio,
        pause: () => {
            if (fadeOut) {
                doFadeOut(() => safePause(true));
            } else {
                safePause(true);
            }
        },
        stop: () => {
            if (fadeOut) {
                doFadeOut(() => safeStop());
            } else {
                safeStop();
            }
        },
        toggleMute: () => audio.muted = !audio.muted
    };
}
window.pauseAllAudio = function () {
    (window._allAudios || []).forEach(a => {
        try {
            a.pause();
            a._userPaused = true;
        } catch (e) { }
    });
};
window.resumeAllAudio = function () {
    (window._allAudios || []).forEach(a => {
        try {
            if (!a.ended && a.paused && !a._stopped && !a._userPaused) {
                a.play();
            }
        } catch (e) { }
    });
};
if (window.cordova) {
    document.addEventListener("pause", function () {
        if (window.pauseAllAudio) {
            window.pauseAllAudio();
        }
    }, false);
    document.addEventListener("resume", function () {
        if (window.resumeAllAudio) {
            window.resumeAllAudio();
        }
    }, false);
}
function PlayRegularSFX(g) {
    const sfx = new Audio(`./sound/${g}`);
    sfx.volume = modVolume;

    sfx.play().catch(t => {
        boxDialog.open(`Oops! We can't play the sound file "${g}".<br><br>Make sure the file exists at:<br><b>${g}</b>`, "~(>_<。)\\");
    });
}
function PlaySFX(e) {
    if (!ModSoundsOn) return;
    const sfx = new Audio(`./${app.folder}sound/mod/${e}`);
    sfx.volume = modVolume;
    sfx.play().catch(t => {
        boxDialog.open(`Oops! We can't play the sound file "${e}".<br><br>Make sure the file exists at:<br><b>${app.folder}sound/mod/${e}</b>`, "~(>_<。)\\");
    });
}
let btClockWasEnabled = false;
function checkBtClockEnabled() {
    const e = document.getElementById("bt-clock");
    if (e && e.classList.contains("enable")) {
        if (!btClockWasEnabled) {
            btClockWasEnabled = true;
        }
    } else {
        btClockWasEnabled = false;
    }
}
let wasBtClockEnabled = false;
function checkBtClockDisabled() {
    const e = document.getElementById("bt-clock");
    if (e) {
        const t = e.classList.contains("enable");
        wasBtClockEnabled = t;
    }
}
setInterval(() => {
    checkBtClockEnabled();
    checkBtClockDisabled();
});
let bpmCallback = null;
let bpmValue = 0;
let lastBeatTime = 0;
let animFrameId = null;
let isPaused = false;
let timeOffset = 0;
function bpmLoop(e) {
    if (!bpmCallback || isPaused) {
        animFrameId = requestAnimationFrame(bpmLoop);
        return;
    }
    const t = 60 / bpmValue * 1000;
    const o = e - timeOffset;
    if (o - lastBeatTime >= t) {
        lastBeatTime += t;
        if (o - lastBeatTime >= t) {
            lastBeatTime = o;
        }
        bpmCallback();
    }
    animFrameId = requestAnimationFrame(bpmLoop);
}
function onBPM(e, t) {
    offBPM();
    bpmValue = e;
    bpmCallback = t;
    lastBeatTime = performance.now();
    isPaused = false;
    timeOffset = 0;
    animFrameId = requestAnimationFrame(bpmLoop);
}
function offBPM() {
    if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
    }
    bpmCallback = null;
    bpmValue = 0;
    lastBeatTime = 0;
    isPaused = false;
    timeOffset = 0;
}
function pauseBPM() {
    if (!isPaused) {
        isPaused = true;
        pauseStartTime = performance.now();
    }
}
function resumeBPM() {
    if (isPaused) {
        const e = performance.now() - pauseStartTime;
        timeOffset += e;
        isPaused = false;
    }
}
function debounce(e, t) {
    let o;
    return function (...n) {
        clearTimeout(o);
        o = setTimeout(() => e.apply(this, n), t);
    };
}
function RemoveElement(e) {
    const t = document.getElementById(e);
    if (t) {
        t.remove();
    }
}
function CreateElement(e, t = "div", o = "") {
    if (document.getElementById(e)) {
        return;
    }
    const n = document.createElement(t);
    n.id = e;
    n.innerHTML = o;
    document.body.appendChild(n);
}
function applyStoredColors() {
    let e = JSON.parse(localStorage.getItem("iconColors"));
    if (e) {
        for (let t in e) {
            let o = e[t];
            document.documentElement.style.setProperty(`--${t}`, o);
        }
    }
}
function ChangeColorBG(e, t, o) {
    if (BGorFadeOutsOn) {
        const n = document.createElement("div");
        n.classList.add("fade-bg");
        n.style.position = "fixed";
        n.style.top = "0";
        n.style.left = "0";
        n.style.width = "100%";
        n.style.height = "100%";
        n.style.backgroundColor = e;
        n.style.zIndex = "-9999";
        n.style.transition = `opacity ${t}ms ease-out`;
        n.style.opacity = "1";
        document.body.appendChild(n);
        if (!o) {
            setTimeout(() => {
                n.style.opacity = "0";
            }, 10);
            setTimeout(() => {
                n.remove();
            }, t);
        }
    }
}
const messageQueue = [];
function QuickMessage(e, t = 2000) {
    if (LyricsOn) {
        const o = document.createElement("div");
        o.classList.add("quickmessage");
        o.innerHTML = e;
        o.style.position = "fixed";
        o.style.left = "50%";
        o.style.bottom = "50px";
        o.style.transform = "translateX(-50%) translateY(20px)";
        o.style.zIndex = "9999";
        o.style.opacity = "0";
        o.style.transition = "opacity 0.3s ease, transform 0.3s ease, bottom 0.3s ease";
        document.body.appendChild(o);
        messageQueue.unshift(o);
        updateMessagePositions();
        setTimeout(() => {
            o.style.opacity = "1";
            o.style.transform = "translateX(-50%) translateY(0px)";
        }, 10);
        setTimeout(() => {
            o.style.opacity = "0";
            o.style.transform = "translateX(-50%) translateY(20px)";
            setTimeout(() => {
                o.remove();
                messageQueue.pop();
                updateMessagePositions();
            }, 300);
        }, t);
    }
}
function updateMessagePositions() {
    let e = 50;
    for (let t = messageQueue.length - 1; t >= 0; t--) {
        const o = messageQueue[t];
        const n = o.offsetHeight + 10;
        o.style.bottom = `${e}px`;
        e += n;
    }
}
function OnlyOnce(e, t) {
    let o = JSON.parse(localStorage.getItem("executedItems")) || {};
    if (!o[e]) {
        t();
        o[e] = true;
        localStorage.setItem("executedItems", JSON.stringify(o));
    }
}
function ClearItemID(e) {
    let t = JSON.parse(localStorage.getItem("executedItems")) || {};
    let o = JSON.parse(localStorage.getItem("storage")) || {};
    if (t[e]) {
        delete t[e];
        localStorage.setItem("executedItems", JSON.stringify(t));
    }
    if (o[e]) {
        delete o[e];
        localStorage.setItem("storage", JSON.stringify(o));
    }
}
function CleanColorBG() {
    document.querySelectorAll(".fade-bg").forEach(e => {
        e.remove();
    });
}
function goto(e) {
    window.location.href = `app.html?v=${e}`;
}
function getPoloSpriteImage() {
    return "polo-sprite.png";
}
function ReplacePoloSprite(e) {
    getPoloSpriteImage = () => e;
}
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
        }
    }
}
function ChangeMenuTitle(e) {
    setTimeout(() => {
        const t = document.querySelector(".container .title");
        const o = document.getElementById("sp-choose");
        if (t) {
            t.textContent = e;
        }
        if (o) {
            o.textContent = e;
        }
    }, 200);
}
function glitchText(t, i = 10, d = 0) {
    const textEl = document.getElementById(t);
    if (!textEl) return;

    const originalText = textEl.textContent;
    const glitchChars =
        "!@#$%^&*()_+-=[]{}|;:',.<>?/\\ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    function getRandomChar() {
        return glitchChars[Math.floor(Math.random() * glitchChars.length)];
    }

    function generateGlitchedText(text) {
        let result = "";

        for (let j = 0; j < text.length; j++) {
            if (text[j] !== " " && Math.random() < 0.5) {
                result += getRandomChar();
            } else {
                result += text[j];
            }
        }

        return result;
    }

    if (textEl._glitchInterval) {
        clearInterval(textEl._glitchInterval);
    }

    if (textEl._glitchTimeout) {
        clearTimeout(textEl._glitchTimeout);
    }

    textEl._originalText = originalText;

    textEl._glitchInterval = setInterval(() => {
        textEl.textContent = generateGlitchedText(originalText);
    }, Math.max(1, i));

    if (!Number.isFinite(d) || d <= 0) {
        return;
    }

    textEl._glitchTimeout = setTimeout(() => {
        clearInterval(textEl._glitchInterval);
        textEl._glitchInterval = null;

        textEl.textContent = originalText;
    }, d);
}
function unGlitchText(t) {
    const textEl = document.getElementById(t);
    if (!textEl) return;

    if (textEl._glitchInterval) {
        clearInterval(textEl._glitchInterval);
        textEl._glitchInterval = null;
    }

    if (textEl._glitchTimeout) {
        clearTimeout(textEl._glitchTimeout);
        textEl._glitchTimeout = null;
    }

    if (textEl._originalText !== undefined) {
        textEl.textContent = textEl._originalText;
    }
}
function unLock(id) {
    const icon = document.getElementById(`icon${id}`);
    if (!icon) return;

    if (icon.dataset.locked !== "true") return;

    icon.classList.remove("locked", "iconTweenUp");
    icon.style.opacity = "1";
    icon.dataset.locked = "false";

    const oldBul = icon.querySelector(".bul");
    if (oldBul) oldBul.remove();

    const newBul = document.createElement("div");
    newBul.className = "bul";
    newBul.innerHTML = `<svg class="icn-svg"><use xlink:href="#ic-check"></use></svg>`;
    icon.appendChild(newBul);

    const spLine = document.querySelector("#sp-select .sp-line");
    if (!spLine) return;

    const allIcons = [...spLine.children].filter(
        ch => ch.id && ch.id.startsWith("icon")
    );
    const nextHigher = allIcons.find(
        node => parseInt(node.id.replace("icon", ""), 10) > id
    );

    spLine.insertBefore(icon, nextHigher || null);
}
function Call(e) {
    let t = JSON.parse(localStorage.getItem("storage")) || {};
    if (!t[e]) {
        t[e] = {
            callbacks: [],
            active: false
        };
    }
    t[e].active = true;
    t[e].callbacks.forEach(e => {
        if (typeof e == "function") {
            e();
        }
    });
    localStorage.setItem("storage", JSON.stringify(t));
}
function Catch(e, t) {
    let o = JSON.parse(localStorage.getItem("storage")) || {};
    if (!o[e]) {
        o[e] = {
            callbacks: [],
            active: false
        };
    }
    if (typeof t == "function") {
        o[e].callbacks.push(t);
        if (o[e].active) {
            t();
        }
    }
    localStorage.setItem("storage", JSON.stringify(o));
}
function OnClick(elementID, callback) {
    const element = document.getElementById(elementID);
    if (element && typeof callback === "function") {
        element.addEventListener("click", callback);
    }
}
let hasOneCreditSlide = false;
function checkCreditsArrayThing() {
    const arrowPrev = document.querySelector(".modCreditsBox .prev");
    const arrowNext = document.querySelector(".modCreditsBox .next");

    if (arrowPrev && arrowNext) {
        const displayMode = hasOneCreditSlide ? "none" : "block";
        arrowPrev.style.display = displayMode;
        arrowNext.style.display = displayMode;
    }
}
function OpenModCredits() {
    boxPopup.open({
        name: "popup-message",
        icntype: "action",
        bodyclose: true,
        class: "modCreditsBox",
        content: `
            <button class="prev" onclick="prevSlide()">❮</button> 
            <button class="next" onclick="nextSlide()">❯</button>
            <div class="gallery-container">
                <div class="gallery-slider"></div>
            </div>
        `,
        onBoxOpenEnd: function () {
            boxPopup.$popup.find(".icon.bt.bt-round.bt-44").on("click", function () {
                boxPopup.close();
            });
        },
        onBoxCloseStart: function () {
            boxPopup.$popup.find(".icon.bt.bt-round.bt-44").off();
        },
        onCloseComplete: function () { }
    });
    loadCredits();
}
async function fileExists(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        if (response.ok) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error('An error occurred:', error);
        return false;
    }
}
async function loadCredits() {
    const slider = document.querySelector(".gallery-container .gallery-slider");
    let perVersionCreditsPath = `asset-v${getVersionFromURL()}/credits.xml`;

    let usePerVersion = PerVersionCredits
        && getHtmlName() === "app.html"
        && await fileExists(perVersionCreditsPath);

    let creditsPath = usePerVersion ? perVersionCreditsPath : "mod-credits/credits.xml";

    fetch(creditsPath)
        .then(r => {
            if (!r.ok) throw new Error("File missing");
            return r.text();
        })
        .then(str => new DOMParser().parseFromString(str, "text/xml"))
        .then(xml => {
            const pages = xml.querySelectorAll("page");
            slider.innerHTML = "";

            hasOneCreditSlide = pages.length <= 1;

            checkCreditsArrayThing();

            pages.forEach(pg => {
                let text = pg.getAttribute("text");
                let title = pg.getAttribute("title");
                const imgPath = pg.getAttribute("image");
                const noImage = pg.getAttribute("noImage") === "true";

                let pageStyle = parseInt(pg.getAttribute("pageStyle")) || 0;
                if (pageStyle < 0 || pageStyle > 3) {
                    pageStyle = 0;
                }

                text = text
                    .replace(/\(\!line\)/g, "[[BR]]")
                    .replace(/\(\!hr\)/g, "<hr>")
                    .replace(/\(\!bold\/(.*?)\)/g, "<b>$1</b>")
                    .replace(/\(\!underline\/(.*?)\)/g, "<u>$1</u>")
                    .replace(/\(\!italic\/(.*?)\)/g, "<i>$1</i>")
                    .replace(/\(\!color\/#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\/(.*?)\)/g,
                        '<span style="color:#$1;">$2</span>')
                    .replace(/\(\!size\/(\d+px)\/(.*?)\)/g,
                        '<span style="font-size:$1;">$2</span>')
                    .replace(/\(\!emoji\/(.*?)\)/g,
                        (m, name) => `<img src="mod-credits/emoji/${name}" class="credit-emoji">`)
                    .replace(/\(\!button\/#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\/(.*?)\/(https?:\/\/[^\s]+)\/(.*?)\)/g,
                        (m, bg, icon, url, txt) =>
                            `<button class="credit-button" style="background-color:#${bg};" ` +
                            `onclick="confirmNavigation('${url}')"><div class="center">` +
                            `<img src="mod-credits/icons/${icon}" class="button-icon">` +
                            `<span class="button-text">${txt}</span></div></button>`)
                    .replace(/\(\!youtube\/(.*?)\)/g, (m, link) => {
                        const id = (link.match(/(?:youtube\.com\/(?:.*v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/) || [])[1];
                        return id
                            ? `<iframe class="credit-video" src="https://www.youtube.com/embed/${id}" frameborder="0" allowfullscreen></iframe>`
                            : '<span style="color:red">[Invalid YouTube Link]</span>';
                    })
                    .replace(/\(!hyperlink\/((?:https?:\/\/)[^\/\s]+(?:\/[^\s#]*)*)\/(?:#([0-9a-fA-F]{3,6})\/)?(.+?)\)/g,
                        (m, url, col, txt) => {
                            const hasCol = Boolean(col);
                            return `<a href="#" class="credit-link"${hasCol ? ` style="color:#${col}"` : ""}${hasCol ? ' data-hover-opacity="true"' : ""} ` +
                                `onclick="confirmNavigation('${url}')">${txt}</a>`;
                        })
                    .replace(/\(\!img\/(.*?)\)/g, '<img src="mod-credits/$1" class="credit-inline-image">')
                    .replace(/(^|\[\[BR\]\])[ \t]*- /g, "$1• ")
                    .replace(/\[\[BR\]\]/g, "<br>")
                    .replace(/\(\!gradient\/#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\/#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\/(.*?)\)/g,
                        '<span class="gradient-text" style="--start:#$1; --end:#$2;">$3</span>');

                const slide = document.createElement("div");
                slide.classList.add("gallery-slide");
                slide.setAttribute("data-page-style", pageStyle);

                if (pageStyle === 1 || pageStyle === 2) {
                    if (!noImage) {
                        const img = document.createElement("img");
                        img.id = "credits-images";
                        img.src = imgPath;
                        img.onerror = () => { img.src = "img/nocrew.png"; };
                        slide.appendChild(img);
                    }

                    const contentWrapper = document.createElement("div");
                    contentWrapper.className = "credits-content-wrapper";

                    const ttl = document.createElement("div");
                    ttl.className = "title";
                    ttl.innerHTML = title;

                    const txtBox = document.createElement("div");
                    txtBox.id = "text-credits";
                    txtBox.innerHTML = text;

                    contentWrapper.appendChild(ttl);
                    contentWrapper.appendChild(txtBox);
                    slide.appendChild(contentWrapper);
                } else if (pageStyle === 3) {
                    if (!noImage) {
                        const img = document.createElement("img");
                        img.id = "credits-images";
                        img.src = imgPath;
                        img.onerror = () => { img.src = "img/nocrew.png"; };
                        slide.appendChild(img);
                    }

                    const ttl = document.createElement("div");
                    ttl.className = "title";
                    ttl.style.display = "none";
                    ttl.innerHTML = title;
                    slide.appendChild(ttl);

                    const txtBox = document.createElement("div");
                    txtBox.id = "text-credits";
                    txtBox.style.display = "none";
                    txtBox.innerHTML = text;
                    slide.appendChild(txtBox);
                } else {
                    if (!noImage) {
                        const img = document.createElement("img");
                        img.id = "credits-images";
                        img.src = imgPath;
                        img.onerror = () => { img.src = "img/nocrew.png"; };
                        slide.appendChild(img);
                    }

                    const ttl = document.createElement("div");
                    ttl.className = "title";
                    ttl.innerHTML = title;

                    const txtBox = document.createElement("div");
                    txtBox.id = "text-credits";
                    txtBox.innerHTML = text;

                    slide.appendChild(ttl);
                    slide.appendChild(txtBox);
                }

                slider.appendChild(slide);
            });
        })
        .catch(() => {
            hasOneCreditSlide = true;
            checkCreditsArrayThing();

            const errorMsg = `"credits.xml" file missing` + ((PerVersionCredits && getHtmlName() == "app.html") ? ` for version ${getVersionFromURL()}` : "") + "!" + "<br>Please make sure the file exists and is formatted correctly!";
            slider.innerHTML = `
                <div class="gallery-slide">
                    <img src="img/nocrew.png" id="credits-images">
                    <div class="title">ERROR</div>
                    <div id="text-credits">${errorMsg}</div>
                </div>
            `;
        });
}
function confirmNavigation(e) {
    boxDialog.open(STR("extra.pop.externalLinkConfirm").replace("%{url}", e), STR("extra.pop.externalLinkNotice"), [STR("bt.sure"), STR("bt.cancel")], [() => {
        openURL(e);
    }, () => {
        boxDialog.close();
    }]);
}
function moveXof(e, t) {
    const o = document.querySelector(`.${e}`);
    if (o) {
        const e = getComputedStyle(o).transform;
        const n = new WebKitCSSMatrix(e).m41 + t;
        o.style.transform = `translateX(${n}px)`;
    }
}
window.onload = () => loadCredits();
let currentSlideCredits = 0;
function showSlide(e) {
    const t = document.querySelectorAll(".gallery-slide");
    const o = document.querySelector(".gallery-slider");
    currentSlideCredits = e >= t.length ? 0 : e < 0 ? t.length - 1 : e;
    const n = -currentSlideCredits * 100;
    o.style.transform = `translateX(${n}%)`;
}
function nextSlide() {
    showSlide(currentSlideCredits + 1);
}
function prevSlide() {
    showSlide(currentSlideCredits - 1);
}
function OnClickElement(e, t) {
    const o = document.querySelector(e);
    if (o && typeof t == "function") {
        o.addEventListener("click", t);
    }
}
function updateShakeEffectSwitch() {
    var e = document.querySelector("#pop-advsetting #param-disableshake .bt-onoff");
    if (e) {
        e.classList.toggle("active", ShakeEffectOn);
    }
}
function updateLyricsSwitch() {
    var e = document.querySelector("#pop-advsetting #param-disablelyrics .bt-onoff");
    if (e) {
        e.classList.toggle("active", LyricsOn);
    }
}
function updateBGchangesEffectSwitch() {
    var e = document.querySelector("#pop-advsetting #param-bgchanges .bt-onoff");
    if (e) {
        e.classList.toggle("active", BGorFadeOutsOn);
    }
}
function updateModSoundsEffectSwitch() {
    const e = document.querySelector("#pop-advsetting #param-displaymodsounds .bt-onoff");
    if (e) {
        e.classList.toggle("active", ModSoundsOn);
    }
}
function updateParticlesSwitch() {
    const e = document.querySelector("#pop-advsetting #param-particleseffect .bt-onoff");
    if (e) {
        e.classList.toggle("active", ConfettiEffectOn);
    }
}
OnClickElement(".bt-modcredits", () => {
    let e = `onModCreditsOpen`;
    window[e]?.();
    if (window.isModboxApp && app.credit && Object.keys(app.credit).length > 0) {
        popupModboxCredits();
    } else {
        OpenModCredits();
    }
});
OnClick("ShakeeffectsButton", () => {
    ShakeEffectOn = !ShakeEffectOn;
    updateShakeEffectSwitch();
    localStorage.setItem("ShakeEffectOn", ShakeEffectOn);
});
updateShakeEffectSwitch();
OnClick("LyricsDebugButton", () => {
    LyricsOn = !LyricsOn;
    updateLyricsSwitch();
    localStorage.setItem("LyricsOn", LyricsOn);
});
updateLyricsSwitch();
OnClick("bgchangesbutton", () => {
    BGorFadeOutsOn = !BGorFadeOutsOn;
    updateBGchangesEffectSwitch();
    localStorage.setItem("BGorFadeOutsOn", BGorFadeOutsOn);
});
updateBGchangesEffectSwitch();
OnClick("displaymodsoundsButton", () => {
    ModSoundsOn = !ModSoundsOn;
    updateModSoundsEffectSwitch();
    localStorage.setItem("ModSoundsOn", ModSoundsOn);
});
updateModSoundsEffectSwitch();
const secretE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAGQCAMAAAC3Ycb+AAAACXBIWXMAAFxGAABcRgEUlENBAAAC/VBMVEVHcEwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQEBAQEAAAAAAAAAAAABAQEBAgIAAAA9ZrMAAAABAgIAAAABAgIAAAABAQEAAAAAAAABAwMkZEMAAQEAAABkDEoNEhpLarUVGiwcSEQTQjIICw5JJ4JqKGEaIC4OPCQgMDorN2g1Xa0KPR00W3ltHlsbJzItY14RRSkNMBwvRlR0JV4+aYxPNZcoRmRfjal1rdCBv+WBv+Vddd7w5OwAAABLoX8wMmABAQF7levfx+TcVWvT7PswVqpFAV7///9iBkYFOBEBAzMFBgkCAwR5k+phDRtie+A2Xa4ICQ1+u+J7tt4KDRUHOxZpguPrRUXn2OYkJkzs3ulRZ8LQ6vpwieYsL1sRFRiq1e8XGjPe0911j+lHCGFKeL12sdtWbc1ZjMhacdfu4esaH0dRgcJGmXhxqMphls4oK1U/jm3J5/jYyNMudVFMD2V3rdK23POezuxsoMJDb7hwqdkbHzwUHSE2gV9LChwMQx0ODx9qodTGw8YnOkUTTSgSFSiKxOjA4fbk0OUUDQ8yS1qnpKZBVWwjIyTVvNWUyeovLi88OzwbWjW1sbUxRohiKXQPEEBHRkhhkK/IR2RmmLnApMQ+TpVBYHRbiKNBZaJdXF5VfpjS0dNsOXx7Fk1KXrO8QGB1SYhSUlMaJy/49/dXGmxKHHDLss1LcIduD0qWkpQyQXyZm6WNi5I1WYGohLKGHVFHaH5mZW6jL1mTJlXt7e1EVqSGgolJeJCed6c9YJJycXTKs8LYUmmQZZ19eoJGPGloG1e2lrvi4OFIfXevOF0qPXKqdZPgyeQsQE9sGyhIjn3TTmh1e6uEVJImT2V8lMIvVHOGPW1rWJFvaaKbYnuJS1Z1irxfdbbDoLKwv9gZK1gAAR6+0+V5ncqmtNItTZx4MT1of7xQPJ+3jZ9Fa3LEw9xVULaQncpHB0jTOz1YPohIBjWGGyUnAiqep8i4MDYwAklvkMNQc6PK3eugKS9UIyyZg+HIAAAA+nRSTlMATe0FJx0M/vr0n0A0E3PNZv5Z3eV+sqq7ipT+xNb98/3y/P72/f7o/v7+9vLj2dP72b2et7/TzZSEgf////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////7////////////////////////////////////////////////////////////////////////////////////////////+jAT+HwAAQrhJREFUeNrsnF9IW3kWx8d/zY3a6Po3KfFawU1xyliY2YfdDQleSC4Ecx/U+DBdgkmXrRQsaXHZaLYTli1SXUKpD9s6SQbDBINW2DVMO5gqbGnrzmbBimBA1CG0TltfFnbZYeah87Dn97v3JjcxuUlGd3a53vMQaqsGfp98z/ec8zu377wjhxxyyCGHHHLIIYcccsghhxxyyCGHHHLIIYcccsghx/9lVJZBqKo1dS2tmuZ6VeVp+Uj+d3G6qqFVqSgnqHQwRFO5VquqqZRP5wePWo1CmSahEFChjBRRrtVoamUsP6A6yhrx2VsZI2XMDBYJpYA/NpVVVlTJh/Vfj1MN1WpQh9WBWTAMZaW81k0rM+gbdAymoHD/WF7eUisf2XGcOnh16wcX3ts819jY0tbS1qytq1apNPU1ZWWaJiXhYEAGDmrCdzvmCYf9Lo9b79LrXa7hkCcWm/D2AxiKV4yirrleFsoRq6fmOuTR/WDTCpAAH51wugqC6OgatA56l8J+wJAnbMEln5VaTOmF0DbIFdj3N4iWJoK1gvTHnMtDbDE1MRv2DOsLhTsYXPSmkTSWyUdbclRVna5SNREKSmDV/f1WR79jsJ+BMFLw4l1y64sN19KEg2fKXPipfMIl0WjWNhKNDMGBULQTXZtLS+FgMDTscQVd/lAovHTbt+ntYBZ9IVfRTPSPY7dZlRi978leUnSeqjnTxtdGRoXCN+sPuXILwe0JzW52dc0GB4rXyewi5++dDT/7OZiJ7CcFK9mmJg6HkujwhQt+/l2h2OZs8PDfD7gTe7t7yeR29veHOZUovBPewY7OC++/31wlyyVPVJS18OJo33xc7Aff7Y+FszTk3tWRFgh40cV3X2f9Y8jLICTWfvTKMFav8oOyWhnK4aip4xu5/phfX0q4/EIirxfiHA0cpO7eXibcAc9Ev9Ha5WBSPb2CaWqWkWTJo1XBqWOiNBrsxz79x+RcPB7X7e4lEnORZRaJRZewZSG8Petyh6ClT89ZtKpTMgXBkLCaxaH4x/fAIYztucT2AlDQ/XXDtBZYiXA60dlyfnco5vCmmDTVyxz4qG/DPDqfbuuPGEkQi20XEETnTRBrAQ6JLplPXEsOK1vSUVSrXHax6aoejdCNivsvzU79pP4YAmlkdcuEg1MJmX++4vYNMlgkRJ08gUTFbjOWR/ujV+apMad5/BiAuO8BgmUWiGltBRPZ2xYrnxdZJI0NMo/T2D6Y+9+ZzVN2M7wcB5HXCEGAI7K1ymYtsVGLy8cSqdOcdG+v0iIenV8ACyfiYTaPHkfS2gMCK6aURqKISEL0J4Jd2NwJ9cm+YqxSYx4PEAkn5mGePg4gSeQiplSwWavANPKxFVdbdSe6JUHdoPHjN0gYLA6z/ThSlt4G5x9JAzHhlmS3wM/MTmAi6hPsH2pk5+deIhBjLI/REgWSZ8RiI9OujiIQLeQiKLhJl+rE1lfQnhuZc68QDjsnkKnShLCgi5MLieShk7bNZaQsIIIkUrDNWVpE12FEQ73mjEpVefJ4KIHHI8TDzvGwj5aWsBJcJx7fzTrrbfjLdSEQ0yqaNRb8hR6r0QsNCUFRSqq6urX+JLWKFWoGEhbWRzqcECUIRGfhg/xXIptUIAPIfE6JDLg8wi+HgzGHA9p2gmB3vJTq5pODpIw6xMM+DkoZLb5Zd8GnfmU5ssqNR9LHPRzPtBAU0cO27vn8eW/v/tvUoOvG3b4DK39prCDwXoX6pHTvp7TI0L/N0AebuMaK78jZc59f5+a6u7zF78IXgSwg6HvmMn78yUgvjrfsl9f6LvfRNLvTpWShIKG0NVScCCDNYOjEA3OOsJc0tFrGM6vAMktkO9UWrmfxMK1nAbF9NtPLBbp0tF2mcewHfbOx2OPNLgWrE3AUzYkYuCMD+SIXj1I6w23IWfOcR7AqQU6SIC3RyFo2EFRnxQXu8TlmgUXy7sBA8LeIxvnLN3iReZYmOgBIORBpUklfIxUtqEH/LqdASulE5siUFLZQO07GE4gHp5uMWENj3/SF7lvMY6hn6DqSyJO7CMfVzDWvcD+vEelfldSggeKrnAJxllL3euDsU1rAIiEhjUVWD+kDIiKcnngQjpnrPRAgkn2sjpuHPCqELJ5RUuVS7xUr28BAHuXkUeJsMUZ2p907gKaIkfX5gMmUG0jaQyBhfdWLefQMzfSCPs5fyQl8U4G7d2WNtCssNTj6/TQDIZBSb6j2uoXHP78aWTflCaiO7/EpK4gMfaSHjRkQyPkbeSQ4wd7w1kkaSD1a9ThUYaGi1+6cLnGYZeveMhUXQg95gjIWx2ME9HHVln8NlfURSSetcjTizXaQMf6lJBPRJ7vXiuOxBukszgEZFgjk4gFNXxNZA/PPYoloJVxpnUE9+oOsfOVMdYb2kqa9cz9JOYg4kK1I+mbdj4CwDtLze9CH6FuEcdJSSvh2Vwk8nmaWvPYxAZ1SbCSp44EE1sWBBATrQMhCOIFcn6GvFGCObISgCMle7qpQyftQOCwBHk57uu4twUUGFlIjkpUCQFAfssD92GfpjDVz0HejkE2hDpHSSrUZqVQylLH9pRCIfWxKaOwlTLNex7t5AUQKpCzUN+5xJwytx8wQ5+k03XetwLv4CeTrrVIWyMdshhrlbgnHOX1wXIoGYpvjJydby5F5cSBQ9ZLciH54BDfpbKAe/WaB9hPtnFJqaeasU+XoYeWHQgMZH+f83ck5vL1YF0lYolv86HBndasgEK7Ics2ki96e5wDkaoFlex/06xQhzcq3Fj09ft+csWbCArE7p1KOUuT4Xcfv+qyT8RfLojkLDXu5G8MBPxqb8EB69gtLxKVAlW+LJCvfMnQN8inmgc9/CiwcObp9bHI8VQkXuXqyZ+GMIxCxbPxd3ERQkZUUDBbTQC5C0ipQaCGJUFSjJG/ZGxCQB0gP+kmodZ346Cft8CU2ktESJowekltkmF+1RO/skGJAtpYFQDyCuUlPzxAAuVzUPook6ywVd3GLjzx1gT4JroH1wm0vFgPE9jdLFDOYh4J24050eU28xiJTF7jBDIX0jDwv0BoCwnYERJI3VRrKqOh8lesWapyfn0wV5+oebtNn/huLZecPO+nV0VxNyDIp2CUdFpo69Oq3CirEzSAgaokCMXpzbjJMjzmdrLfYi6l7b/yYvS3c+h0AefaCJOcLWPpc6vrJ3Ssoe3uGrPv0jwq9G+rWqUYpAlGDQj7Ot584Dn4+NTldjKXbzv4GP5WzFfnma8vGL3YsEbGMFc1ctt4HIBd5IJeYu/TZ/G80PZkykSYpAmkBhTzNOxyZLHotCwRCAhD8rMGO4YVFNGOtZD2y80RgIh9RxrsiHjJqHkNEYihlNUlxSasVFOI5+jb1NfpPFshSaygXRf9s+DJ7Ly6z5I1kPY2AL3DZae8lq9F46yBv2cvfB7gJlLKkCERLGdtdR+YxfJX+1Q54CNJH/I7hzuG9uGyB3BNeQQ3s84XvxUGj95ZIY4iAoAxq60QPj0gPSFVzI2XsdB+Vx8BZmv73hoXsJi2k5YXBsJFjDyvT0eOZj+u4MJGh6zO9jJG6RNN5B7649IOcZesCIIz0gNQTYCG+Iwvk5nmafkZautEm1icGwy9BLGviPWH2syHP+SW5rxwTB/TlvLOs6SlWIuOfIoVIb7xYSx0HkCs03Zf8I16M+/KZwYAyVkQ8YR16NMQ9whNZ8tNiVa+dfUbC+RQBkd4wqxoBCR/V0EEf//zwL18jHgYUO2IZK0fCwr6O9xxG9h97PhIdZSETga5pDAOR3jCrhaIUHcNHNHSappMvDb/W7Wy8wDw+jKYWSnNXWAu5Hmaz+Z+/+zak14fvilgIbo1QznI+BCAKyW3Cn0L7Ju1H5IG2ot8YBAFNSP6ucPXQ0nv2qt0B3SfyEZlmb8ycLwkAIrl1uUr0fzbcLg3A5OSY8JbddhN4fCvkYfgk6/E14QwL8dC9Fvv9mwBE7O1H8WR6/I0SgEht3FuhAYEQJf3/MpP/4e76QtrK0ji2TpO206mpbWeRndaHtov4uOxTyYWw5KqQ+5Dc5EEkkGyYhJAJFSKzicn6YoRkY5qa4EMcl4q60FWno1mFjq3YRYduRzpuhw4Ud0vdFMddKSLMQ9ndPuz5zrk3uf+j7VPugdLozU3a87vf/+/7HW/ELeovRQad3usW4hFC/u8TrRBdc7SQtau3AaEvj+D0Wjrl3QWVpbeaYQM0AA0dHo20N0ry8cjNScUgg8GCvmr1iQTkq0uqYTo26Nqjnr9FgPRqqCtS1oyOvL1CWagLOlNYwBJgnDg0HiNurhElnRqJRKD1gYUZpwMxHubXXZXKumThucI/1QhpkAvt1PCwuCJmLHJZdxJy4mM8VXh4HyuVjuC+lGgsyhXfwyAfZTEeoddqeRM8Cv3H2jGNSRmQWCwqaMSIIkCoFn0pLCDivTx/FAMygveElEmsMSfG48AsWVsqNv0LPAz6jxrfEadV4vSUqLUynb5CUZSuWrNOY2Lkp+wRAGFH3NXuRmsM/Ct6WopH6HHXgpJNx4n5S5//UOM7TLxNT3nFRTOvqNU14r5MUQYd1XCPN2FWrF8cLa8YFeCR/i/gcdAjBeRWl3JYiB2sL2sVZ6tOVlRSOE65xYNEeSQhF/WTwyIUsMajJd75hkb4y9uK4DDJ8TDfutal1AB0/x5kTP5XqwfOSXOAwP6LK5XeqACSSLqAANHN2E7TMYzHUfPuMdy5FQU5KYN8tL4JyfCAOF3B671DeAKQQnLWzMMEeRc3nZIHhfy4RHoZAfKJTtzdC0bC4nfkSmEsGo164dn1mkBf7ZsVFqisZ0pF9K2tnZifjmv3ticIIKkUAiQi68/zClTmooOiTuoh//5BA6FzZ75+t7pUKm1N7+KZ/rISHuZ/XpLn3qGye2nLbPb2qkd9FQmxB66nopGRiDUtExFwKvjGfJAQY72TmzWeO/UzzONiuKLE0X64FfFuAxx7ivKBw5CFbxQi9K0+s3knWKtLFAgcBq+nsSSk07KOSW9FZ7kfwYR0fQPS0GI8zx2+MvzOcFyPeX8EPLanzcprUx6GQIR+DSpXbwfpGi1XzjiMh3CbPuKWKi1kvtyciCwCr0NdF0RamkE4GJuFaXuPNpNEuB3weNmtgod5XZY5+eYeX7oK7dCaxQ4EiAlkKM1NQXiliIy40zESkLgBEEM9n89z/BNLyy+n5sf7x8ec797NMGgHOOz7qniY12U9clhAyA09pho6C9zeXg4QqEOlVSoiVusbAKSuJz/PW4796n2bGbBzRW+rw4ElRBwY4i6sde7qc5qOa34FJHvdER4QlV45WLtwAlZdZxdRLHhl/n3gSAQJY9KBFh7mv13iiN6FxFiv+atlmvZrpjORUQ/XoFkhgJShd7GuJeTERaPF9vDdpSNIY+uxvW/WXpviNtJnKATZ7ON9sF/TNRxfBIiJzwdE1XuzrNYdOAimzvPvLRaLcWjineAIxDEaJlMtODAgQr9XJCDmnpc1eAGQFLZGuPgvqlFWt7od9V/DPQ48+8aBI+utQDiIbTltP6iNR0iSO0GAbAl03L6dtmtNECbQN+3UYL7BdRG3SwcjO2dOGeEgiqdPpw7t+LKBYDhMbAe97TMfYkHf4n3RqNS3gqs9KKo0aXi+CeQ37NYgs4NoxOouICNS/wWRD04xBnx2ztDT+f7aud7eQX87h8be9n7oMHhAk0PV8YUY5PHvhZd3kQjEWc38e5DnvYmp9mYhxzinkxmq06e4074Mlx23h8eQ66+6OWE7XVkKiXZVEVmo6iwo226Krvbs0Vr0S2DVsRGJaDAWRCNRt7VAWXSSf28622zkT4ukDJRNbuedgbDfb6qA8Xy77DMfYb2oZk+eIAFZFwuQj6a1DDsyIvZYDUCw2oJQ/ZReCiKNH+E8Cn+47StTODjYGwyb6CoK/NpufQmWPHQEQG49rpKTSjUW+iScK1ZtcGfjyDHmeQxGNDoYy0hC9DTU1vjhxWYDIcN10WrLtLfb020+8vq20njyRKqxAJED/NEq8SGLngk/LpurGxGc+J1AgcgxnQ0kNF44aTFQzHcKgoF2LB4UteyGHs2s5XKF/Gp2va8GID0vuu7d552sP8ivv8E+9KBqJNLujVgjsRqHM4xBIKK3078xFdArf6LXb0ehBrLhdvgTDwb99NXtkZ3KDvaVCrYCxWAVZ7FZMvmSpo0P9V3jSQQW5BKCAPNhd6E3oNYJFPZGYlCN0mKzu+ECSiCdAQLNvdRnXFgQcCYSAS4bm7jacbWCx/oMlaEsDCVctlxJC5J1rtXhDj8zIlm7L7EQDip5WyjswSRmEW1abScQnjTrbGYHCK2p37GiEioGhL3bcZdTWOuTuerJ9jaq8prJPdI27A++wMyKm4oytL+H9WI8yCrGhmFSHkxrUUgMUPozIhiQebECJ/WKv3d8ipV/96qnKhaeR6OlxeziZD5DICloGJM+ZEfugBF58JWynTmgOUhkiqsXKTT0y1RUe0oe5j71xqjcLB1p8/NMPNsdHX9B25YsVkRiZnFlrpNfqzPkd1l1O9K9+Xjh/rNnDxZe3FK8bvY9J5DY/YOsrEpVkZxEQJOjSV9W/QyktmadEp8Tv/rx044ve8yjkxwaq8XkSqdoTZewzIxqqa2troXv//39VrGU7EsqvaH8vOLRiah6w1UOMzasCghmc9AX8yI+VUc4QRWwV3bip46ON1mkmoB3x1NIdspXEqTEoS4jyaUcQzEMA/otZ7E4Mln5e8t7HCT2oKSy7ifPSSKuCsgYppXTEx4n4Jg8ZlzEkFEB5GVHx1+xDFAO2xJBYHSplJ2Zmd7gZWUFTnbOqWRVfKVC1QHg/QDbcklqdroPuNS+yIrEeYR621UBcQ4A34meAMFD0belE+fcBjjv/ofbzwJRUdkk+TFDFSenCSIbMJzsUbTsozkpGjwok9L3l4NxOy1m62XjJi5J729XzdWzLp0xAmGFNTAmGQaoJJl+clDwiDOrPtj7Rw5K6PtyiMxBy7OC99u3Rt5uQ5rKYnN4KKGw2MSQxHrjfmfAKa1Qckor2K5ezprSF9/Jh2cRHuIiO3TWVuYFnqL/boYqFLG5yEuec8fMBtFi8MO6TDxKRBiKS9npjY2VjZVsNrtaKFQwzQmMSTmsmERJkOI7266RGAZAKN24WWewwvL0Swf8+BaEcbJ3ebAVk2KlQzbVR/xf9FLqafWRs+6Ky9MSN2BplfuIzAxveXbCKp1aQRKvmzTahibwSSJ6idU/Ogla5GtpopWfuGSHMH20B+3pyjJssENiCpgC3u6NHNp5sV0vYcRypTm5Yza3luNuLxI/ONSqmon322HaMKwxwOCE86SNOhGRJjLR5pRGyLyCuNFG5AB5VAWipIRwYIswib2tLHqVFZtzLFm8ozw3uji5XFxeK2axdxZaIpAw+T6ucU6NfB9GroNsWKvVcQoaHfRRpDp9EZKFQ/1SAeGd3hvkQMdMsnNutUjJBQQQYbLY9x2gqDWhvsIbzpmY6VKRqpzV6eC8sySBpNhtNu9rtWk5/UiBBjVqWYR58aweKGga8UHdjocyO4rbD27Mt3EGBNmJJdh7W0bJg3XgXUd4eQQZkSIvWJ1zpUmP9JbVDay48OvlEDQyajQ8OJG9FzjiCiwDjvrNnjQKnqMz5wzAwO+akE4C0PFBOFh+mJMCMCAy/0qotErYUiNkqomRRbjgAX21kc9QjOy2PAaReAmlt/GqgCj1wLCDcbtJowAPRoSqT53VdOzk2aZz5xobGxoafn4eKDUo121W6taAz/vQQUINpK8W0cOcr+y+wprBnu8Ala8EFr4CTqcgZTXJKMeFOWxYMCL5nThvIdgJx6xSV5ITcgeq1A7XH4JZb65Dlqams3BApsVgvGIxcF1ANgnpDKSx6MTUAINrghgUJCDZARUsMEg4RtnIU/lugYdlGUCCM1pQvc+D7Qh+OWziJKQfhPKmCt+pVjcwECob6o/ypOGkxTHrIVCQXhPbkGTCkAVlHR6Ga7NM5fmf81BaCydVVvJVldWDrAOz1tnp48q9iisP/vAMCOLQn0Ef9c8PzcI/6bZaiZ0OshopeKoOz60AlpmpNofLxu2So21MXhT616vfwPa70CLKZRRtrEUTkMwKedhzvMryIRUys9I5mnMIY0hh0gUWNuwEattnNhf3pptO1REedRHBZ+jV3+znxxbKNh6YGG6zuTwDs8M3x5Wab75juA3kQMggjbWmiQexIUmGyvAqaxXftpJTvQMfZrsIt0l1mktt7BGKI6rR+jgGpO5y8C3/J+/aXtrK1riX2CRqW+ul7RTlnIc5FJ/mDyhu2ASyfUjYNIkwIS9hQkaKc4gPkkA6FWkjB4zWoFhRGpRUH9RYRXREoTjBoqAwVWHkHKZm6imUUcow2nYoc5hy1rf22jt77+xLhHkwuhCN1aRx/dZ3/33fomkbdqkCobArpNxrabXW2yQ7tIy0kV0bEGygI1FqqMvNsVBWqSiyK5Paz6L7QLA2sYdkg1NAw0NVTr7rjlWDMI9DEXO+seAhbTWl0yZjbXV2ywHRMSG2FZIHnrFYLFvAbURBSA8f+GkgMs8Dklkac9S+vatxCVIYhyL2PItFKsCQa3QgQM4E/cmuWdEm0ZPEF1LfV+8AGINJujdmgdXlaUAO1xgREHXhoqPwvEZJgFMf0J4QZL2r5vo+BotH38ivLHwZ9KZvq3erfc3bzQC4WZwNoZHzmuzV2lhOY+2zHWkLt7bcvRCjL1B6ErIKT5wXOQz1mn1dzYCIamuiF1+UkF+19RIofUyFVdvVrEIGz7k0xW/SOrIhQ5r7igXkgN15SwCxxKLI8Uo6tAUEkpHY9ogA0WnqatUiA3P3UVXnV0brEkQf3ep0c55ScIu7sZwGPlwCUrlabi/8QuPzHXbPIgDSS0WTz7xcoVdj4UzwJpFEG/IA9cao4f5fFbqDs567YT2/fN/rRt7RUnQrxeMVAiN4R+3L2oDYcD1kc49NPxcAsXyKfkom+/RUFlekFwwU/S/9BruvOeapMvsE+2u0uSyfWIwXa5GINLlU1IHs9tlRUDre3jEhC6iud17ssG8bPO4tAsgBe5DUC16IaDWOCRHIoxzmDGJEVMZyjGBPK8+EBE8VVxi7Dyms27ISkGsJjpwj0qjlZ0GmN7mPFBaOQAgkafaAK1lBOV51cZVdwYY8srbqA+LkOk+b1eN1tOqu55H7CyVC+7DiycuqALlGeJvdOLCunLRdhx/usWyaBOkeDMg+m042PnPkJCEDHCCOH/SmbfCpeIxI67cqRHiKgrnpVdfyx7iXokOUlZ9oVen32xYQ6UlISiBkAXXOl2bZnQyjB2Rkf2cnSUREfQ1xEjJHNN+/v3qte4U6RqQVC4ni5d6uenwIsJRcypuQBIZldbqyFJaiqQx9hba/bx97QxG59rElgHHSxiI89kV0dgwI+xxqVpp2nfAgOZc64R6gv8lFZ2GGKXYI7yjB9z3XwoohyRdGfHk1OkLSMhD0xigObnX571PRDnoBM0fGFqKUQ0gG9q3j+OMF4JEWNyB6uiyxA/YtPv0aiCxwTNSedohBl30NLev3RF639iIjDFqzAXQ9JGJM00ZzYZ6UrAwwbXEqJK2iK1esD58yR5+ipASFIsTNgcjKioOyryYmscJpQ+qKZQ9kNF2LZW8njTGcs2sHIb5JG4QqmJ41327NRUQeYyLjbY4JnM2Jdy2RvA+0fNd+lh8usAFcrfawxIIok2xeMkyqbdJORR1zGVbV5tgmebQa7YiyOztyyqLH8zzNprlfUpYRO+bRJ1cx8xfkA3C8/4vu5bcQkXePNvN5N+t975Os7JeTpELxUMlrBg6SC5UVlRWGgtOKTxmUcgVEnFdUOTZPmd2ZFvcqJhm2yRhvmwtYfUVZjh/nSa2lRM2FB2y6gTPaQ0q1eCDeRYj6WycEu4VfNMrmwpq1N3WG0bsF2/4IsM0a2BLobCJCYjSZi6quXqowlMN0F9pcXVR1Soc+lFcZkYwEJGxNhfXjP5hxCC1WgCxEH7T5eDCe+Rr3uO0kx7uhZTc4KG5aa9th022kfWHAQVO9lJ1XX15boqcxucB/K9Dr2n7LxfN93GSnHN8hIXEOf0c2vnM0kNWhQFa1GQTFbDaTsrX9tM7Wgjwj7R3mx+mpnMyfGGaXi737gNfx+6e5xNzccmJ5td/Od+Py7NzY4HRc2qOOjMs+EarkWOTZXGRgdaC/Z31oBbTVGO8c9In4p//Tm42J5XmEslO0/SGSi8A2zRNat6WOfGhYxsrI8AhO67Czkr+ht2ebdXFjvZUpT84gw2yQbAjWTzSXLhIVb3tIo3rLIjMopfZie88LiVTXRSIrvGmxiRna81a9eb6EYYL54aPOWwHo1aGxSuze7pSak+Ftmy0rMU1Ttac3F38T/pbtADbpyufyDcP4Z/iE4ca6PJfeOznnE4afrDFB2TCTtgNAZE8GSaSnPyoEl/0JCYi+V1bNm8CEPLsdn/X62cCol6YIgQa9u6n2JYnyCkwBVbydVPG9DvT+a0+xr3Xxxk3INA7fUQXkD4YJxjI53PhcP8mno6PXviztt9ll/PKmNs4n/tS3MOZr9I2hTz2JRL9X1M7gnZfPEcgFkGEHNABhEByd3U2Uw5wZaoSM1dLI9yL1FX4y8uRh98Olke0pCOJPMx6Q14Kg3X7PqhaQvWKYwQweli0Qk5mhRM/k6vyKfPc3/Mya/N98EDUiBG1eB9oNR79NxNXud/RYLG63dDTHr+JOIVVA4DjYCQbISn9eyI/+ElI77e0Pl2Zd4XAgFAoEAqPdnVh7GU//BI6yuiLkhLy23pY6vc0kPvtRAsjWFnxYVKYCtU0jByC1uLsmkZu3B3ZlIql3nejCLsnAp79rVM0FRQTgmmoJBuhzYbGhDoTERFWJ/5Mpm8PR6XDUt3Oq1m6k82DO2cWKKiQjj6TO5oO7JK31KsiMiySEy+RaVEZmzQwiF4BhxqW9nJE5haJh38JC5lW7xJDA4D89PysMHY+f11ziPdnqMvg7rhK31kSZFENRo8mUH/V23BL9SDpjhNdgPzPMhBgQN/dFpR89vjvoDwZTWW3qES90fXLKhPbSfUMLcYtEEWb0VkskB53VPEXh/pxCLtijrxdzR6voMobECB8wIi+DBWVE/1iUJ9RfXGYfkdTWhULVITLq4q1rwV/UJ5m5ZxRHaLkHIg3Lfd7+1fmhdUucWCMJJi0SnaUHCBgibA4KS6+W1lTwafaL5TeKrtHCIhTmIiMKDc2munxJNBaU1MgGz9zJ3H5zKHZ7AQqPpohojTKTQSBfbvFMswc6iHjB7VXUPxeLK2tq6i5fLb18qbS0tNpoKjLRJrr2qsGQR1XdSgDksbg0Ilzt4fwpExjmJCLqE2i08QByXc6AhO05jnsvLjcUVpbV1ORZC7vhCzCSIRHTRgjbm/0MsybZty446VsnBqTLoruI1vJd0c3BDwMgpryev6+9vpBM1vineEPeMRI3S7Z5uSssfTx4sWs51LXq0NtFmw1nFxDJaA3XFXHm9400MuTXSQVky5I7IjA8VjsSgcEN9tKzi0fBhRsgIlNcbPjgtjhsR34vs6i2d77Fxb9OQJA65H75N1WSD7/A6zWWnGFAuJKu93seEPEBfaoBSHx6IjeLnpOA8BLyXz2r3gwzFm8UnOlVaRdG/P1HmmlERiQ4o3KYU8HcJMRtyW15BKuumYIfzsvmtZOaEUhDeIHz++Te6x9EB/TNO5mfJQJkl0n9dRZEeNVfrTpXvXQjn7eq4KwvfEuxLYyrP5LZcgiQ6Zh86zi/N8WMS9ytjdia0uBRz8ZEPDdE8Ku5b2tLSPgMXHGUkx2BwaRNS6FZirKJajzOl0pmnVP3E8ygeM5oHHKLG1lRvGfN7188gc6CG/W0kicw8rLIcPYBKSiBpJYN96aLG0hCaJdTchHh8rNr6CeZIuEMzvUyu7JZsBvT0iKXrllvuaJ9C+gT5GKVFpyHVVwDmXhcGnVKy7jZVgSfZd84Eh4+mehBQT2GZFqkt54PjI8zSjpPK1jXBgSP8zMUnI9VfqnqZta0DRc4WhuKDhGcfkI1mUEPmffvsZBM+ydSban47sSgH38fjJ/IzTrUAsSF54oXnJ+Fp/LTkmkjL/2MfzemmDtZQzIRnFiMxVKw8UcdHR0cJAyDnkMeIcgsJwIEiA6qnTujNmTSK84RICW1eECQmLrhfJeltATLgYFgBqd5PNA6YiQLwZUrHlv6t7IGYCKnqfwcAVJwGReqJa3TIb9c7WTSvRsT/M4TPACRI2RNgkh4fj862vds5YwHCdUPNZgneKr4Z8XnCZASPJdf2vT2KihDROTbdsXG/WDNBTxYlv3w8fjP4+M/P35g2be5A8K/qgY3axSTGsoKztUqxFMx2x/LGKXM4IyCgHAk0ngcecDvM4Acf4nXMXr4wpMzHrwefKVq1LnxGXUXzhcgnF2nxO0jt1wQHg7GskxIJvqb5hFBIHz8MgNIuiXnxEmLXlU91IlLhTXnDA8yOFY6OfYPZNj9E7FsjcWvRaS03nOAfDgWAbKXMyB8Xdh3RaVChTs6UfBact4AuVDDjf4bEcvIzxD07SpR20hGF1kSLCP/Z+96Y5s473Aa0jghEBiEP+GGyOxFtWjQgrR2X5xz3ElYOgfC0uYg2IKI9DTLgduwbE9qId4xuEoFQkRNDRImdVE0RVUCUjdH5cNIMgRWZFGIpVhZu2pS+QCCCGlrEHyotPf3vnf2nX3nhKhMmq9vPsWJL8r7+Pn9fd7f297+vYTH3mcAyGJrvTLreq5/q9PDHSRq6doyw62aVUQTOKgMfv81ChzRF50EUEoe+k4FCDDk8SIBkUEOzHBPtau9105iPMprygyIiHT550llxv41IHJrQFdzEhshsW/7vAzI3un29puLBMQtqx+doeeaDLnWQQxWfZkR14q1ksB/UJ2xowRxQFdyEsO5+R+zQdbevfNwXNq9sOLk7l0FHr9s1QLkSh85NLh2pSEBKVsD02QBkXuKoddfjYJ0V1+UFQM/4vzu6fd7/y0D0v7QvbAE6K4sJR0bcXJz/c6PC3vq77WRY7XVlWUGXbXyAYy+k19cUhwXcTqHr+q3BkklZXpeMlvz0zDhYcHUUOJcLBpyjs7Zk84HBS5ktls6VLu8zLDrlTqsj8Vi5b7BS38gU80wR2L68pKBMRSNwSQBOcya7llQRir586tAr5Q9zTnzG4ZH3/+W/j8c8/NDr4raqtwpmJ2d9764cum932E/MhLTE8r1ggQ+9I9ssj7f/jCwgAzowy7pTDXU6VN2e4prVAdZbx/9zY47ZKLMhsoyQ68KIiU3yQddO7v7jjSOYrM1UEw2Gnj8UIp95SFB+hyRw91bULKfs9vtc43qWbB47uCOD6DqXlVdb3BEUEZSJx/v3tnX3flZ9/HQKHAkNNJTVIj1uL0dJyLT7f8sLgUi3rxrCmrDoTTCw86phge883s8sCyeCrfRpvKqqnVlhl8VNevXrqqCago+Hvj0OUc6TzPF7lIPPGyff/bsGcpDvlFMpNGTvHfhWCCJ8Ug9UGpO/oTpsSOOfhDGNy+VV/yICMpKfiE7k84+czhtHySN2YkiLIGhAXgpfsedx5IuNzZXvROAcBLMFVrjCt3iUTLOb3LcDlgF+yDw3Vj5Ix6rqwga3X1hP9m1FHYk3NCUbk7ifojhmM7DzN2FiAJfv5ZnkvdMzDgVeKR3ZPu37xzGeGSCPO9/EEc/p6ppg7Vvtdc6Uvz9zBq0ZxffT7rlw1f1IAk8/vKbLx9rmbXeXneLXA0bIA1Hrp+XHhzP3oDwPqFHM0VFRObOMbq7zVxtgmt0lhkcjxqMh8Pit6uW/55TUpS8+HGqbGY/jHvxziwcmCCH34YR2z+B4UuvbzNbWAatDD5lbqJNtHTC08A+HW5FcvSF7QWrOUXkJdxMrHcJaAzEhkk7Ptmfzj4zjo8iSL5jPL6tiSEr05k9UbvK4ARZD/yw5ujBKyBJykqf6FjgxdAIzAyFJLlQv+KJ4zDa8rd4fN/r4+lrb2za/quMxWqxZMwHt0i1E7re4AZrI7SqJDz4cERgRQVZ0nMyJkPR2NSiQOnqGpuITkiqLc6pYAd6HCLIYQzHayiysjc3bbNll2crRsS0caWxAYELRzolCMICWI+I2nqlZUg459DQ1bFAsRPTXWO3JkaysiFn6+n+lPJR/PiODJX5+EEinsKfgDBj9eYQsV1uA0SqjZ0awhhsE0W2iwI82KA/35ekkiF5i6PcSCg2dmtsItajinc/7JlCvIgOKfRzXDLJq5/DB4WMKAgRv/y6n2VmFYDYvAcBkc2GjntrUArSQT6uEYAj4rdrLH7uNDeqkiuGolw0OjESHY4m+0eiQyOcWs3I9c+l+IKnBKlg2K942c8wVp8SEc8hPMGh3sBx1upqB22GzQkierCCJhzEcqX6Q0ln/kKugit4Ldk/x9sXs3iBYT02FSJbDdzFJUUT5ELAYgWBHqy/+AYiUJLJ/iRx2KEcKPi7pHN0NJRMptLp4g9R/g2RYRIqQGzefaDM2vCKcU0WcSFhlJ2xTGRRn2uESyo1OJiam0ul0qk0b0+jF3j0lV7Ee4OiEIkE5QpNISDItXfCPJkVRgWkFgHSh8MrgWXD9pe9/CLJAwUSOlAMY1ah4fP6fP95buTO4atwH0/QCu6cEfiXD0g8YSWQsEFiKFll4OvzfNX4xNf41GHgdGR1lWPnax0Mg0gSefl4zKFNT5gxIiIK6JClbIorAHkUmhgONT4ZdRhR4CsxpH6zyVROb9n2BstSLx+QZtj2BgkSNhxWM+TJKHe152uOa3z0FBSlRuRIJTTVy2l61hZnmOBLByRMSdFtAtd4Rb+gzNV9KNWJtbgRIqFR6LAbsFVVWY/xqDrm+98AEhTlPNDXAL6kiWWsuUTEi0LoLpigDUezIB1Zbrh2LtwL6qg27UOfUgRIEZPl9/8gDp+KKBLzhgyLaGLOvfKIANLSMsY523DzcL3Bol+om9TR9JY/w/aY9Z16UGSFJdLHrwqlI8JhZZDbkEB5iE9psW5lZxEcNwFH6tYYCY8KGBddTZsuY3thZQSdAgfFgrlfopFSAsmLok+dBWbMDTmLhVL+qNxOCT2XpIwGytnXrMKjounPyX6cRqGv5mccio6UuESGRJS087NNPpvuAos1lR3jcVE6nFBllNrvsk1kmvrOI9IeJbS9Ok9Bg/UTSlwSHrwgKpxPWBCKANLozJoskK9cPCUhUmuIYKvip/iSMxPdKYedyKtrFReh6mix2fzCkrKUICNEKD73ncVWFBBOMS+t97w0992xxgAJyYpy0Fl3VNHVf8v6VAuj4dah+CSgyPSKyC7Bi/AiA/mG/E4qr3KlLmNB+Vh5EMJ9g9wt46heXvKFrZq1IOY9e5am7+R2ZFaLIkAQXNwIsiK/BIIw28EDSe8UmHv6gHgRQ2bU6pbzktVybCxxRFbDSEz63O0O+pCicOExM4WbLsr12HGReWGjBfTaBhQh0UJYo9iu+POIIVxew77LJbn2VSWdkMD9FQiP82fpn6n6dQmmwGj5EWsmyU8jLBN+cYI0AfGkaAF9O1mEISjqHSqQTdz4qA1f6bm2hDmybiPg8dGJc9mIV+FFBIrPYwgrBUbjLKPZ4dU3ZH4WEPDAU0kIXBSQJzC0q1DI8pcD5Ar1kh0QtGxTOeDRfeJ2G30sLwiNQwlWhQi4ENmqRVhBI5f36yYoPHqzlfgm8kxRrfpRr91vwgmIAjz+6nLdv49vBasrzXr8snUk+zgf6KPbPPm7MgkGP8KrAMnWxxsEjUyFYnVzeOQysM+ISzYLeRRzkTTkTVUaIouDW10u1yFXGx4oUJKI1NaBcvTU+ZYb9JYjhbsSJ9IsXrGpOV3IrCKClReyYzoU4ZGFsgCYnu3EqwfZYmmIDwApGNt8HeFxofWQ6z4OtjaUHh5r6jA/brScOUVv8WjsS4JllGo5lEgw2WqTh81FsDJgLCNGtL0IyvCbyfushCGIbZkieSGcpBsrNFgu15HW1kP3sR8p31RqKWINPid16rbb/Xe6+rLmvsQtWITAUn7ZZuV6rAmBtMJVux7RCb4QepIs0YwB4QXlozQAcTpH8g8+HAFADrS2th6UEpLlpYVIJZ7u13a9q+VMmzZBwFXMskSGEAHLFVZ+rL1oa9WRlh8yP01xhJjrPWUYRkRPUpJNp5SVd/T35gXwIK2wPpAQKa3CFp7K5PgUKnf0z+/obk3cQpQhAitSYapJIUMA/6zKHVmc+WlQBCGVjXEnsQ+RYq5iDHFO6RAEreMyIqVUwMIGqwNlw2ccdGexzYlPmiWxDtPUZFFY/gyjaixC3thgYQqLKvCDWW8OEHFBi4Vri2qGBACPCxIgmCMIkp2l09atwAWsfSfQv3rWVPW5rfjyTCYmzU1UJhFX5g5gtBSEwKoRrW58UBmdebcjQECLN1nsD4aQD1EdQOk9gwFplZfkR+pKxY28CgIT0zG4LPjMObrTZ1vS8jBKNxKBSlcDmx97YYOVO2jQAKyCX/UWeTA0cJ2xgphXciF4HSOIlEg6UlEHZ5/v77uJ/tNPadPWbIa8e8+77+7fv2f37kUB4ptUuhFihiYLKIL8d7NXWZIRwducti3AEDUg7gtS0CuvA8cxIJtLgiIrsUNvc7luB1p6LtKdkj3ZveetXW/htWvX/j2LQcQ7m3MjPOmVJPJjrzCj8hc+K9NEMfknDzSc+n/Zu37QNrI0Lke2ZhQnF+PITuLYZL0JJJhUabYR7+apWbA1wzAgi50bZhZFC0IrFrRcrhMhIljFHXtNTutmBalU3TYOKbbwLmmSym0I17oLR7qDdPe+NyNpZjQzkv/qzZM/2M6R9+nn7/t9/7+//RJOIRSREt01wUV8uECPYbfIE98SBUG2gqjlnFvKZXVMozXIp0NuHtKHt30x+ge3Sby7+YhE6w8q2VGk7r7n8/3zGiAieaREp6c5WMqYBAJBzTp547vH3yKRfjeqkvNJeRwledOnkaebOy97OZWnXhfLow0fth95SGWMknovTN/1AlK3p6fjn/ml94llXSKANN8iYS8YDyLj6MjLbae2+GLzhW3G7nrCkyf+QtT7h4/AP47+1I9wV8YNyE8+TqeiU0Rif16EXgRD5HHW7lbzn0huh+GRU8wxEIGEFwDwbPuPfnjiSs1v+yOODw8fRhYL+4B40u9SECCSRU/ZL8ec0WkJpATvqWlIRiIY+GIPAiIuQMayWl2aZvxxp9cZajzYHGS5nu5sfuV1qt883Hz4j+oYgHhMlgWA6H5AIBwh4W28rxxCCxZap/6KpWG7UGjjoRAE/DoyFrMTs3T76Ys/3NXfXofE0+1emtfFOncroz7y03dff+05Y/mv3UHixC3UaK3Fmdhh1TvWHIe+RVQe8rzlXIgo5bECktc7z24PDFP1PZ33+MGu3G7/1/uzHx68r4zGGIZH3cPv+lYwIBIGFcnE2GBRAmn0wl2M7lf6BiuQR8aKR7KVN6+r3nq8U2z8cdvbUg0/O87nwUCvuy/r3bDX6xA7CQ9RJrZZxuQKhLclaQAIVArVcDzGc7WGvs+7vZT9Dzs7lWN8QPWjN937faiGSA1AZDWuntYM4FHoPcwipA7NimYuQszjZLkqzujgkz8/2fniOB9AQvWff4kK1F0qAojENKc1Cx4W7meE6kiAypQahUdOOV7i8T2tbD179uSrl8f55z6/9/FuqIbYnlY6ngs4qMEquJ4ibrh83tNUEWDvL7c3tzcffPn6uIB8Nzjt883f0aEnt+gO2OXYnrWYET0KQsxvZj80KjwxINmq8fLlmy+M4+T2VfB7XYd2/7p7GAoI+IoYr8YREChK4cYgztXQPWO0huSykxBvNuubmi/77hFoZ8zEkNZhihDnB4a4hpFeHQMQcxKAgM3696AcYkUAYhXg/GT8BhCTaeRREGBDKyDxzgYgBmwSHEQiv4fFIU6FHePr8UvyAh4ty/OO/exoDsmVJwEIreL+3AfkP4HJRXeBXYwbracgRtdc+Tkrj0RaqVBHmCxFnQQinwggu889GhLGIQ168DBuNoue/iq4FKSeR+t2FG2OQGQigBiE1j//1GtffLUVYbPsxrm4neNZ8jGIVEOoZb+9zKDJsmn982+9zvet8MhQup+J4UnQWTrYaXlzDk5Hb5FFk5WtACJbr5xQneZOQiLD+6AhcSuuL3qyik4/ptMgN4rVJwMIZZGtrbePB+ne3UCv124sXYlZo2+KaIjc8AHS63lXziKbdQqIkHD9867+2++vnv/lVZibpdt4xO72y4qfQgggQq8dpMgmINmPEK8TTLakd1RDhv0svWTjIcQuLgRAPBpS11C/2m2ySOp2XeRXWAf8P03bunNIjZbe0OuW2zFBsXSxEokZyGPp3iTpej+XpzAKCNitT58+/qppCMmHh/nDw0MBYS3fomxotRw48LX4dZQOkbouI73/6jJzqROv7HcbeeSVQqsp9/QjjoPrc9hTCqH5ho3BiyNYpKxmWZBuvSSgACHPWo5lAfcy/K83LVd4K1iD55qsRSFBhNKGxjjNAwekH27Es5l0kVan5FZfQ3DeNaejsmywXJh09+olGVlwipT8l4aS9HJcu7JuOkvKHFdrHeF2dgybxRQgdparm+20O909EUHFLRPbZuvUqn1WVSg0LF2H1nE3IGFGq5hlVbr2MYs4t1qvyL1Lt3m5oA0CdQeRMruMHqgoBSTIMZ+MTq4KzvVhfC/vlKcidcTMsisGRmI69ouaZm6KPUiGAMkWTeXo4wiTI/gGEng4LZJaBkzgoKfcHXpksXzUEaoJaoiMRE7uISUXbi2LAkbdgGcWzZypwmAC43BksxUZXcIrCV6EOMFDJssJSWAeV82yLyVuNARkAQdrSHykUiCAXOcGkGXi/e6z/p2rPSmWh1POlRYS8CVurhzCATC2NUQtl8tKTwJCVBIYiniVG0BuEJPVZhqQIgmDygqdRKU++BAgJDDEy9wAcjmU1FkR0zfU5Q+K9mklhBtAFojb22HbZPnG7PyAGPegt4EbQJaIhuxl46Qi/l6LDnAIPxoyTzTEYh6QqOaXDUrq3Li9M7APKMs6q0f1WlhQLuQHEJj/ZBwQyOBEALKBMjzd9p4VcX9zGbuARGkIzE3heW4AuZphPjL0NSf5vCyjSSgkzc9aUtrr24kRq/u7X7rQcpKe4wqQ9EGc3CyfhuyvAyAc7baGTeMHcTJZ5aEwBHOU7LX3ZmkV1jVECdWQGkI8eb1293UpToFIMcDJuswRIHNp4mZ1GDdZSmigTivq+BpHgNAibp317GI4hdwDQFZ4AgQOujSqbFssJRSQAw0A4eqgN6wnRUZsACkONWVhnuJCp0YltNmmkHIYIEYNAOEn+T6wWTHJLfqbKPdlAIQrCiHBOrFZhbhYLB8gHZEAIvBlsWgrUJ5dVjejKCQPCsLdKcMVpknEUw3xpRaNvCBwc15nILdg6pDV7ElRCVeQ7AaxV/Fb3jCaRMhfmWyw62OFAlJpgsVaS/EGCL3scsCsgpRDKb3bpNNsCe5kgZBInlUfy6Ug/pYsmunl8ah6iqiIxn4Q4q+mGyVQkMtJ/gChCcYa+x0nPko3hJiu0xgt9BwVi7RuuhnE5/NW9wTO7uC6iiJr5GkM9p6YUW3WtMta5FJBqIqgBnOhiOotTfmidIme+OQTD/CzGOyCN6MqIV2aV1ziFJAk0DprGUY1chuRhSBKv8IpIJA+QayNUplRzQ1d6vOu8IoHLDZDqMUUixSVKA3ZoDtn5rkFhM5HayyxiLfH2hxWEOjHSvILSGoZEKkw5GEpucghBPB5FxMcC4x/am2GCMTtYJk+g1XVQD+WUjwDMneTJRbx4DG8Pk0XEBZnEnwLqAgr84Zm9Ch0t05ikLUU54DMZjDCbExT+Yam/B5WBRgkvZjgXWiKkYXGa98CtaGdRG04bTST5B6QOdjuWThgAA/FM5juZxCjRYL0Vf7xSCSuiERFJt7uYCpK5MLHah0hIZNKTIOswMo/fdLxRzQe2T24o/OnqcAjcRUG3AqTXEZThC4TJWrDuQEHPW9Mh4IkEouwzneCWV/owlKiF6KWZBFfn58SPOyOIFQzGMEjQEHAYF2aS0yN0FPrsjQ592oEHp0aEqYgAnHJDMzv5CeR9lWH8Bheimo0BeHS5cRUCVxbD1qufL4FdKCP4YXzFR1hvHZ1ugCxo5Fzn08oKqPvMVQ3OO1UHEHs0A2PGudK7GrRF30EXvShWxsWEtMn1NXar56nevjwCNyo3WmREH0pOYWAzF4HGpHOUT1yY5xjMGRBwNevJqZR5q9h4dyaUIbYI/hiYlUWEE7PJ6ZTFiGHou2dT/DhU49i4AkAQ4PxziuJaZX5DEZIPntEho+LBl+PMWDDO76VmlpAEnMCQaR5Koio6ri9V0Rbgq9dGTVYHHdtbnrxSCRX0hgJ+b2TMwQE4GFHkxT/0upg7LoNoq4xvox3KpK6mSbErp3M+1WddlAl+FBoWRnr9th+AaE0nq4UVjCNEKuF2idARI0O9Mwxgg+IP6h+cNvofgRXKw2IyJ1jx+zmiD9/T+UjlGmqVD/w8tzUA5JYEnEGLmRXTsODGmbr4liXK9t5hEQRr1y5wIMWEC8RRErHy/36lrarYQpUNs1QOIwahmX7eG32Ag3qaolYJIjkjVMAZCh9W4QhdNOMussH7pUo4PTChb1yXK01jOFAduOgeiJKDzgzQX9ixCe0m/R0fXrmAglHiIag9dIdQu1694SAHONAZU2zT9df+Fc9gaW+SJd08sXIxyjrmicCpJMndJ4WuVxmcoLCCFqXJMlqQh7FMk6gIkc94VqpIyoCx3OER5YrEIfUJECkRKy5vNE9IpOovT0MSu6IR1w7moAcRG5evUDCETpUVZeo1IFfUe2ITOKcnVaOqB/GHngSqAGZApS+cYGE42JBpK5ZkoNIAyApHBwxSiyCHFU9KBwtQl5UR6Y+idW3WMTFQiWpL8Dt5Hs66w6hjr5Ofo2mw18CVUuUuXB7qSy4LJZkM0mBfD2ydJYDCx0LyCNf0u3fCNggvHoRp4OsQSu85BG9BIgU6mfVIG/oCNSw1bOTUqNAQ8MLGgEKgbp6Q/KJfh/+ZvP1s2jb2j84gA+XdWvw+6jR4nplw9gCF/WQLg1JrQWINPVT5pJKR2+CtZJbbisp1e9QRNaSF4AsDFssh0oa9xHBKq+fYp9Qpd0C10r+f3tXs9o4EoQtx063ZMcaHEVShE0wDARy2Tdo3HfpItBFGAQ6hZCLHsAXXfwGPvq6D+C7H2Geabpa1sZ29DM7kQd2uz4CJgQiqM/VVV9VdWmRXn4F1pKQPlbfe46w+mZZjbRIuF5+dOImb7tsI9OpKE0+0x9IvW7fKk+IKetYdYilCUm63n81mqz2L2BzkdGlWSX58kGB8qnvDeU8XDYgzqV+I/52//t+8rY/+AyGKeroEFEE9DrlE9UJGRJOnpaNyFJfFjeEbNj9DifbOIqKklWQx0ntYwotYqtOiAdrHZYtSCJGqDQpzeN/Q8pqtU9yIukMzKjOOY6uKAmxVA8i88YQUqZAvACYrM++Rz9228Nrs5B/W60OL1kIBxWHkW6yaGUd/v3/diHsL4cQXdg5aTFV5gsejpwQMC6hVP8rWmwP2/3u8PdHuH9drV5Xh8N+F2+zwC+kBeeBOQs4y9sIWUq1Hiie+MI7LJ7aLLURuZFn3OtUJ5KU4vQiItjrwgEIW/tR/r5+z/Mw9f1I8HBschQUWt/gshYLW/3wmYKHKF7PGpMaWXjqIGDcUa93N7gb2aZ0E050YKXsLhUR++OTk6M/cdr3NHnnl9WKnbOozqni1ZMpaQ8hoBCMY6y90SYGPwOBH6CAlL8WCHifmoYmQ8LdgwgjYdbyHIjqnChOyKRBp584yNkeyolnEd4AyvX53Hn0tI+mLOw4D9qSuSSHU05xZWiLr/K62Uyg1c+LfrfD0dRxHqauMTdMy7Do3H2cei7l1HDvddfwBpf9cQ0yLb/FFUEaqnn99gRGVe394sASdmqItML2w8L+Q/gcDqoKtneUt0eRLERCerM2D5Fy7ctbLmDbDWOL5ijyLjMzxTvrbotQz6BqMv+6WBv3QR1GjYrnGYUhVE4YfW4Ua4KQLgp+cCee8cYosmaK7WSqObKaNHQIZuxkr1txUatRHS4ghFiKl7JEUA/qPSSF+lVH31kvABfZNBxaPkhN1SdKNRB1SX2CxVlnr5W3pEipzyDWPiZZIkulgpD3GgsFgo/u3h84csWj6sVI4kuhrvqVnRsdBt7rSoribx1moVNZwV80Vcy40VMdkPdWVbMyeAEt63SN2K0NvRFWHUZkQUD5wknveBfhsxKJQ+kf3Z7oI9lUYUGVPixutc1wLmsMLcNP1ZM0kJbr+kAf20S2HdOquqLgA2dOIM+C2whBfDHaC+mV1X2vaGASUJphlF2ej0CIjrcMAQ/kPIysIybb51fZqSAcUp6FT3l8MiLpF/1FF6fkZKx1wES8mLXNNiErxhkm17liNrD7khEWhKmcCUrSotUo3BTnSEu5Lk3kh1EktRksVXCu17gbmqQcYQmjoGz8cm4iHx9lDXp0i6OhrOvqZVdn/0wVyafCpJCFfJwmpPestFGfOdq1z3LtUS9nUsq2r4N8XMhoUycCfWsw+hOh9WY6g2UB0klIf+ZNUYBUZEDDsfYHp6IGI9s2LcfQxphcIRAIBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKBQCD+2/gJkY602M1iggwAAAAASUVORK5CYII=";
const noWifiImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAMAAADDpiTIAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAL9UExURUdwTJmZmZ+fnwAAAAAAAKCgoJeXl6CgoJ2dnaGhoZmZmZWVlQAAAJiYmJSUlAAAAJOTk5OTk3p6epubm42NjZKSkgAAAIaGhpKSknZ2dpGRkf///3R0dHx8fHh4eHZ2dnR0dHh4eI+Pj5CQkJGRkY2NjZqampaWlpWVlf///3x8fJSUlJCQkH19fY+Pj4+Pj3V1dQAAAI+Pj3x8fIqKint7e46Ojv///4GBgYmJiZaWloqKinh4eAAAAHp6eoSEhIaGhnx8fICAgHZ2doqKinx8fIyMjIGBgZGRkYWFhYKCgnh4eHp6en9/f4uLi4uLi39/f4ODg4yMjIGBgX9/f4aGhn19fXZ2doiIiAAAAIKCgn19fX9/f4WFhXl5eYSEhICAgI6Ojv///4uLi3l5eYWFhYqKioeHh4eHh4aGhoeHh////4iIiAAAAIeHh4SEhAAAAHV1dYWFhYSEhHNzc4mJiYqKin9/f4ODg4mJiYCAgP///4aGhn19fYGBgX5+foKCgv///3h4eI6OjnV1dYuLi////////3p6eoSEhIGBgYODg3h4eP///4KCgnNzc4mJif///////////////////////3R0dIKCgo2Njf///////3R0dP///3Z2dv///3Z2dn5+fv///3t7e/////7+/np6ev///319fXR0dHd3d3x8fHp6enh4eH5+fnd3d////////////9nZ2cnJyf////39/f///4yMjP7+/v////7+/v////z8/P39/fDw8Pv7+w8PD/////////z8/P///39/f9DQ0ODg4MDAwF9fXz8/Py8vLx8fHz8/P7CwsKKiop6ensTExNjY2G9vbx8fH8TExL6+vs3NzU9PT5WVlV9fX5aWlsnJyaOjo8XFxcnJyaqqquDg4P///wAAAICAgMDAwD8/P39/f/Dw8ODg4KCgoC8vL5CQkF9fXw8PD7CwsM/Pzx8fH09PT9DQ0PiIIG9vb/j4+IiIiCAgIHBwcOjo6JiYmKioqLi4uHcZmXIAAADjdFJOUwAKBfv9BBABBgIMFvoOG/4hJOAHTCnziCfrL/7uz+Hu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";
function updateCursorsEffectSwitch() {
    var e = document.querySelector("#pop-advsetting #param-Cursor .bt-onoff");
    if (e) {
        e.classList.toggle("active", CustomCursorsOn);
    }
}
function updateEventsEffectSwitch() {
    var e = document.querySelector("#pop-setting #param-events .bt-onoff");
    if (e) {
        e.classList.toggle("active", expEventsOn);
        if (ForceDisableEvents) {
            e.classList.add("force-disabled");
        }
    }
}
function updateAltModeEffectSwitch() {
    var e = document.querySelector("#pop-setting #param-altMode .bt-onoff");
    if (e) {
        e.classList.toggle("active", expAltModeOn);
    }
}
function resetEverything() {
    OnDelayIn(300, () => {
        localStorage.clear();
        boxDialog.open(STR("extra.pop.resetAllConfirm"), STR("bt.info"), false);
        OnDelayIn(5500, () => {
            location.reload();
        });
    });
}
function showAchiNotificationDot() {
    let e = document.querySelector(".notification__achi");
    if (e) {
        if (achiNotificationDot > 0) {
            e.classList.add("show");
            e.innerText = achiNotificationDot >= 1000000 ? (achiNotificationDot / 1000000).toFixed(1).replace(/\.0$/, "") + "M" : achiNotificationDot >= 1000 ? (achiNotificationDot / 1000).toFixed(1).replace(/\.0$/, "") + "K" : achiNotificationDot;
        } else {
            e.classList.remove("show");
            e.innerText = "";
        }
    }
}
function resetAchievements() {
    const e = `achievements_${RegisterMod}`;
    OnDelayIn(300, () => {
        if (localStorage.getItem(e)) {
            localStorage.removeItem(e);
            boxDialog.open(STR("extra.pop.resetAchiConfirm").replace("%{mod}", RegisterMod), STR("bt.info"), false);
            OnDelayIn(2500, () => {
                location.reload();
            });
        } else {
            customInfo(STR("extra.pop.resetAchiFail"));
        }
    });
}
function getElementPosition(e) {
    const t = document.querySelector(e);
    if (!t) {
        return {
            x: 0.5,
            y: 0.5
        };
    }
    const o = t.getBoundingClientRect();
    return {
        x: (o.left + o.width / 2) / window.innerWidth,
        y: (o.top + o.height / 2) / window.innerHeight
    };
}
function MakeConfetti(e = 2, t = 360, o = 1, n = 200, i = 100, a, s) {
    if (ConfettiEffectOn) {
        const c = getElementPosition(`#${a}`);
        confetti({
            spread: t,
            ticks: n,
            gravity: o,
            decay: 0.94,
            startVelocity: 20,
            particleCount: i,
            origin: c,
            scalar: e,
            shapes: ["image"],
            shapeOptions: {
                image: [{
                    src: s,
                    width: 32,
                    height: 32
                }]
            }
        });
    }
}

let customCursorActive = false;
let customCursor = null;

function setCustomCursor(img) {
    if (!CustomCursorsOn || customCursorActive) return;
    customCursorActive = true;

    if (!document.getElementById("custom-cursor-style")) {
        const style = document.createElement("style");
        style.id = "custom-cursor-style";
        style.textContent = "* { cursor: none !important; }";
        document.head.appendChild(style);
    }

    if (!customCursor) {
        customCursor = document.createElement("div");
        customCursor.id = "custom-cursor";
        customCursor.style.position = "fixed";
        customCursor.style.width = "32px";
        customCursor.style.height = "32px";
        customCursor.style.pointerEvents = "none";
        customCursor.style.zIndex = "9999";
        customCursor.style.transform = "translate(-50%, -50%)";
        document.body.appendChild(customCursor);
    }

    customCursor.style.background = `url('${img}') no-repeat center`;
    customCursor.style.backgroundSize = "contain";

    document.addEventListener("pointermove", e => { customCursor.style.left = e.clientX + "px"; customCursor.style.top = e.clientY + "px"; }, { passive: true });
}

function removeCustomCursor() {
    customCursorActive = false;
    document.getElementById("custom-cursor")?.remove();
    document.getElementById("custom-cursor-style")?.remove();
}

function Bloom(e, t = 1000) {
    if (BGorFadeOutsOn) {
        const o = document.createElement("div");
        o.style.position = "fixed";
        o.style.top = "0";
        o.style.left = "0";
        o.style.width = "100%";
        o.style.height = "100%";
        o.style.zIndex = "99999999";
        o.style.transition = `opacity ${t}ms ease-out`;
        o.style.opacity = "1";
        o.style.pointerEvents = "none";
        const n = e * 0.4;
        o.style.backdropFilter = `blur(${e}px) brightness(${n})`;
        document.body.appendChild(o);
        setTimeout(() => {
            o.style.opacity = "0";
        }, 10);
        setTimeout(() => {
            o.remove();
        }, t);
    }
}
OnClick("particleseffectbutton", () => {
    ConfettiEffectOn = !ConfettiEffectOn;
    updateParticlesSwitch();
    localStorage.setItem("ConfettiEffectOn", ConfettiEffectOn);
    SomeTimes(0.1, () => {
        MakeConfetti(3, 360, 0, 400, 50, "custom-cursor", secretE);
        OnDelayIn(1000, () => {
            MakeConfetti(3, 360, 0, 400, 41, "custom-cursor", secretE);
        });
        OnDelayIn(2000, () => {
            MakeConfetti(3, 360, 0, 400, 29, "custom-cursor", secretE);
        });
        OnDelayIn(3300, () => {
            MakeConfetti(3, 360, 0, 400, 11, "custom-cursor", secretE);
        });
    });
});
updateParticlesSwitch();
OnClick("Cursorbuttoneffect", () => {
    CustomCursorsOn = !CustomCursorsOn;
    updateCursorsEffectSwitch();
    localStorage.setItem("CustomCursorsOn", CustomCursorsOn);
});
updateCursorsEffectSwitch();
OnClick("eventsOnOfButton", (() => {
    if (!ForceDisableEvents) {
        expEventsOn = !expEventsOn;
        updateEventsEffectSwitch();
        localStorage.setItem("expEventsOn", expEventsOn);
        lock();
        setTimeout((function () {
            location.reload()
        }), 800);
    } else {
        boxDialog.open("Special events have been force-disabled by this mod!", "Nuh-Uh 🔒", [STR("bt.gotit")]);
    }
}));
updateEventsEffectSwitch();
OnClick("altModeOnOffButton", () => {
    expAltModeOn = !expAltModeOn;
    updateAltModeEffectSwitch();
    localStorage.setItem("expAltModeOn", expAltModeOn);
    lock();
    setTimeout(function () {
        location.reload();
    }, 800);
});
updateAltModeEffectSwitch();
OnClick("info-bgchanges", () => {
    customInfo(STR("extra.pop.paramBGOrFadeInfo"));
});
OnClick("info-shakeEffects", () => {
    customInfo(STR("extra.pop.paramShakeInfo"));
});
OnClick("info-disablelyrics", () => {
    customInfo(STR("extra.pop.paramLyricsInfo"));
});
OnClick("info-displaymodsounds", () => {
    customInfo(STR("extra.pop.paramSFXInfo"));
});
OnClick("info-particleseffect", () => {
    customInfo(STR("extra.pop.paramParticlesInfo"));
});
OnClick("info-Cursor", () => {
    customInfo(STR("extra.pop.paramCursorInfo"));
});
OnClick("param-events-info", (() => {
    customInfo(STR("extra.pop.paramEventsInfo"));
}))
OnClick("info-achi-reset", () => {
    customInfo(STR("extra.pop.paramResetAchiInfo"));
});
OnClick("action-reset-achi", () => {
    boxDialog.open(STR("extra.pop.resetAchi"), "", [STR("bt.sure"), STR("bt.cancel")], [() => {
        resetAchievements();
    }, () => {
        boxDialog.close();
    }]);
});
OnClick("info-all-reset", () => {
    customInfo(STR("extra.pop.paramResetAllInfo"));
});
OnClick("action-reset-all", () => {
    boxDialog.open(STR("extra.pop.resetAll"), "", [STR("bt.sure"), STR("bt.cancel")], [() => {
        OnDelayIn(300, () => {
            boxDialog.open(STR("extra.pop.resetAllLastWarn"), STR("extra.pop.lastWarn"), [STR("bt.sure"), STR("bt.cancel")], [() => {
                resetEverything();
            }, () => {
                boxDialog.close();
            }]);
        });
    }, () => {
        boxDialog.close();
    }]);
});
OnClick("tab-myachi", function () {
    achiNotificationDot = 0;
    localStorage.setItem("achiNotificationDot", achiNotificationDot);
    showAchiNotificationDot();
});
showAchiNotificationDot();
document.addEventListener("mousemove", e => {
    const t = document.getElementById("custom-cursor");
    t.style.left = `${e.clientX}px`;
    t.style.top = `${e.clientY}px`;
});
let loopIntervals = [];
function onLoop(e, t) {
    if (typeof app.looptime != "number" || app.looptime <= 0) {
        return;
    }
    const o = app.looptime * e;
    if (e <= 0) {
        boxDialog.open("Loop multiplier must be greater than zero.");
        return;
    }
    const n = setInterval(t, o);
    loopIntervals.push(n);
}
function offLoop() {
    loopIntervals.forEach(e => clearInterval(e));
    loopIntervals = [];
}
function Zoom(e, t, o) {
    const n = document.body;
    n.style.transition = "";
    const i = e / 100;
    if (t) {
        n.style.transition = "transform 1s cubic-bezier(0.55, 0.09, 0.68, 0.53)";
        n.style.transform = `scale(${i})`;
    } else if (o) {
        n.style.transition = "transform 1s cubic-bezier(0.22, 0.61, 0.36, 1)";
        n.style.transform = `scale(${i})`;
    } else {
        n.style.transform = `scale(${i})`;
    }
}
function bounceZoom(targetPercentage) {
    const body = document.body;
    const targetScale = targetPercentage / 100;

    body.style.transition =
        "transform 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
    body.style.transform = `scale(${targetScale})`;

    function backToNormal() {
        body.style.transition = "transform 0.25s cubic-bezier(0.25, 1, 0.5, 1)";
        body.style.transform = "scale(1)";

        body.removeEventListener("transitionend", backToNormal);
    }

    body.removeEventListener("transitionend", backToNormal);
    body.addEventListener("transitionend", backToNormal);
}
function showBoundingBoxes() {
    document.querySelectorAll(".polo").forEach(function (e) {
        e.classList.toggle("boundingBoxReveal");
    });
    document.querySelectorAll(".picto").forEach(function (e) {
        e.classList.toggle("boundingBoxReveal");
    });
    document.querySelectorAll(".hitzone").forEach(function (e) {
        e.classList.toggle("boundingBoxReveal");
    });
    document.getElementById("box-polo").classList.toggle("boundingBoxReveal");
}
function updateMixPlayListTab() {
    const e = document.getElementById("tab-mixlist");
    const t = document.getElementById("box-mixlist");
    e.classList.add("active");
    t.classList.add("show");
    activeFilter("bt-mymix");
}
function handleMissingIcon(e) {
    const t = e.parentElement;
    e.remove();
    const o = document.createElement("div");
    o.innerHTML = defaultBonusSVG.trim();
    const n = o.querySelector("svg");
    if (n) {
        n.style.height = "40px";
        n.style.borderRadius = "3px";
        n.style.verticalAlign = "-13px";
        t.innerHTML = "";
        t.appendChild(n);
    }
}
const DB_NAME = "ModLibraryDB";
const DB_VERSION = 3;
function openDatabase(e) {
    const t = indexedDB.open(DB_NAME, 3);
    t.onupgradeneeded = function (e) {
        let t = e.target.result;
        if (!t.objectStoreNames.contains("modIcons")) {
            t.createObjectStore("modIcons", {
                keyPath: "modName"
            });
        }
        if (!t.objectStoreNames.contains("modAchievements")) {
            t.createObjectStore("modAchievements", {
                keyPath: "modName"
            });
        }
    };
    t.onsuccess = function (t) {
        e(t.target.result);
    };
    t.onerror = function (e) { };
}
const RegisterModIcon = "js/mod-icon.png";
const RegisterModBackground = "js/mod-background.png";
const dbRequest = indexedDB.open("ModLibraryDB", 2);
function registerMod() {
    let e;
    let t;
    fetch(RegisterModIcon).then(e => {
        e.status;
        if (!e.ok) {
            throw new Error("Icon file not found!");
        }
        return e.blob();
    }).then(t => {
        t.size;
        t.type;
        if (!(t.size > 1536000)) {
            e = t;
            return fetch(RegisterModBackground);
        }
        OnDelayIn(500, function () {
            boxDialog.open("Icon is too large! Please use an image under 1.5MB.", "Icon Upload Failed");
        });
    }).then(e => {
        e.status;
        if (!e.ok) {
            throw new Error("Background file not found!");
        }
        return e.blob();
    }).then(o => {
        o.size;
        o.type;
        if (!(o.size > 2560000)) {
            t = o;
            return processImages(e, t);
        }
        OnDelayIn(500, function () {
            boxDialog.open("Background is too large! Please use an image under 2.5MB.", "Background Upload Failed");
        });
    }).then(({
        base64Icon: e,
        base64Background: t
    }) => {
        const o = indexedDB.open("ModLibraryDB", 2);
        o.onerror = function () { };
        o.onsuccess = function (o) {
            o.target.result.transaction("modIcons", "readwrite").objectStore("modIcons").put({
                name: RegisterMod,
                version: RegisterModVersion,
                developer: ModDeveloper,
                icon: e,
                background: t,
                lastPlayed: Date.now()
            });
        };
    }).catch(e => {
        boxDialog.open("Failed to load mod assets: " + e.message, "Error");
    });
}
function processImages(e, t) {
    return new Promise((o, n) => {
        let i;
        let a;
        let s = new FileReader();
        let c = new FileReader();
        s.onload = () => {
            i = s.result;
            if (a) {
                o({
                    base64Icon: i,
                    base64Background: a
                });
            }
        };
        c.onload = () => {
            a = c.result;
            if (i) {
                o({
                    base64Icon: i,
                    base64Background: a
                });
            }
        };
        s.onerror = c.onerror = () => n(new Error("Failed to process images"));
        s.readAsDataURL(e);
        c.readAsDataURL(t);
    });
}
function updateLastPlayed(e) {
    const t = indexedDB.open("ModLibraryDB", 2);
    t.onsuccess = function (t) {
        let o = t.target.result.transaction("modIcons", "readwrite").objectStore("modIcons");
        let n = o.get(e);
        n.onsuccess = function () {
            let e = n.result;
            if (e) {
                e.lastPlayed = Date.now();
                o.put(e);
            }
        };
        n.onerror = function () { };
        o.put(modData);
    };
    t.onerror = function () { };
}
function getLastPlayed(e, t) {
    const cb = typeof t === "function" ? t : function () { };
    const o = indexedDB.open("ModLibraryDB", 2);
    o.onsuccess = function (o) {
        let n = o.target.result.transaction("modIcons", "readonly").objectStore("modIcons").get(e);
        n.onsuccess = function () {
            let e = n.result;
            if (e && e.lastPlayed) {
                let o = timeSince(Number(e.lastPlayed));
                cb(o);
            } else {
                cb("Never played");
            }
        };
        n.onerror = function () {
            cb("Unknown");
        };
    };
    o.onerror = function () {
        cb("Unknown");
    };
}
function timeSince(e) {
    if (!e || isNaN(e)) {
        return "Never played";
    }
    let o = Date.now() - e;
    let t = Math.floor(o / 1000);
    let n = Math.floor(t / 60);
    let d = Math.floor(n / 60);
    let a = Math.floor(d / 24);
    let s = Math.floor(a / 7);
    let l = Math.floor(a / 30);
    let r = Math.floor(a / 365);
    if (r > 0) {
        if (r === 1) {
            return "1 year ago";
        } else {
            return `${r} years ago`;
        }
    } else if (l > 0) {
        if (l === 1) {
            return "1 month ago";
        } else {
            return `${l} months ago`;
        }
    } else if (s > 0) {
        if (s === 1) {
            return "1 week ago";
        } else {
            return `${s} weeks ago`;
        }
    } else if (a > 0) {
        if (a === 1) {
            return "1 day ago";
        } else {
            return `${a} days ago`;
        }
    } else if (d > 0) {
        if (d === 1) {
            return "1 hour ago";
        } else {
            return `${d} hours ago`;
        }
    } else if (n > 0) {
        if (n === 1) {
            return "1 minute ago";
        } else {
            return `${n} minutes ago`;
        }
    } else {
        return "Just now";
    }
}
function loadNewButtonModsNews() {
    if (!ForceDisableEvents) {
        fetch("https://raw.githubusercontent.com/RemmieUwU/Incredimods/refs/heads/main/moreModsDataShare.json").then(e => e.json()).then(e => {
            const t = document.querySelector(".mods-buttons-warper");
            let o = document.getElementById("bt-dynamicmod");
            if (!o) {
                o = document.createElement("div");
                o.className = "bt bt-light with-icn";
                o.id = "bt-dynamicmod";
                t?.appendChild(o);
            }
            o.innerHTML = `
                <div class="bck"> 
                    <svg class="icn-svg">
                        <use xlink:href="${e.icon}"></use>
                    </svg>
                    <div class="txt">${e.name}</div>
                </div>\n        
                <a class="hitzone" href="javascript:void(0)"></a>
            `;
            const n = o.cloneNode(true);
            t?.replaceChild(n, o);
            n.querySelector(".hitzone").addEventListener("click", () => {
                boxPopup.open({
                    name: "popup-message",
                    icntype: "action",
                    bodyclose: true,
                    class: "modCreditsBox shadow-box",
                    content: e.innerHTML || "No content available 💔",
                    onBoxOpenEnd: function () {
                        boxPopup.$popup.find(".icon.bt.bt-round.bt-44").on("click", () => {
                            boxPopup.close();
                            document.getElementById("pop-popup").classList.remove("shadow-box");
                        });
                    },
                    onBoxCloseStart: function () {
                        boxPopup.$popup.find(".icon.bt.bt-round.bt-44").off();
                    }
                });
            });
        });
    }
}
function displayNewMods() {
    if (navigator.onLine) {
        const e = document.getElementById("modNews");
        const t = document.querySelector("#pop-modhistory .container");
        let n = document.querySelector(".banner-mods-news");
        if (n) {
            n.style.backgroundImage = "url('https://raw.githubusercontent.com/RemmieUwU/Incredimods/refs/heads/main/main-banner-min.png')";
        } else {
            n = document.createElement("div");
            n.classList.add("banner-mods-news");
            n.style.backgroundColor = "#222";
            n.style.backgroundImage = "url('https://raw.githubusercontent.com/RemmieUwU/Incredimods/refs/heads/main/main-banner-min.png')";
            t.parentElement.insertBefore(n, t);
        }
        fetch("https://raw.githubusercontent.com/RemmieUwU/Incredimods/refs/heads/main/modData.json").then(e => e.json()).then(t => {
            e.innerHTML = "";
            t.mods.forEach(t => {
                const n = document.createElement("div");
                n.classList.add("newsModBoxes");
                n.onclick = () => confirmNavigation(t.modLink);
                if (t.customCSS && t.customCSS.trim() !== "") {
                    const e = document.createElement("style");
                    e.textContent = t.customCSS;
                    n.appendChild(e);
                }
                n.innerHTML += `
                    <div class="newModIcon" style="background-image: url('${t.imgico}');"></div>
                    <div class="tittle">${t.name}</div>
                    <div class="txt">By: ${t.developers}</div>
                    <div class="txt">${t.date}</div>
                    <div class="newModBoxBG" style="background-image:url('${t.imgbg}')"></div>
                `;
                e.appendChild(n);
            });
        });
    } else {
        document.getElementById("modNews").innerHTML = `<div style="color:white; width: 100%; padding:20px; text-align:center;"><img src="${noWifiImage}" style="width: 35%;"></div>`;
    }
}
dbRequest.onupgradeneeded = function (e) {
    let t = e.target.result;
    if (!t.objectStoreNames.contains("modIcons")) {
        t.createObjectStore("modIcons", {
            keyPath: "name"
        });
    }
};
dbRequest.onerror = function () { };
registerMod();
getLastPlayed(RegisterMod, function (result) {
    console.log("Last played:", result);
});
loadNewButtonModsNews();
OnClick("tab-modhistory", function () {
    displayNewMods();
    loadNewButtonModsNews();
});
const modNews = document.getElementById("modNews");
let currentScroll = 0;
let targetScroll = 0;
let isScrolling = false;
if (modNews) {
    function smoothScroll() {
        currentScroll += (targetScroll - currentScroll) * 0.1;
        const e = modNews.scrollWidth - modNews.offsetWidth;
        currentScroll = Math.max(0, Math.min(currentScroll, e));
        modNews.scrollLeft = currentScroll;
        if (Math.abs(targetScroll - currentScroll) > 0.5) {
            requestAnimationFrame(smoothScroll);
        } else {
            currentScroll = targetScroll;
            isScrolling = false;
        }
    }
    modNews.addEventListener("wheel", e => {
        e.preventDefault();
        const t = modNews.scrollWidth - modNews.offsetWidth;
        targetScroll = Math.max(0, Math.min(targetScroll + e.deltaY, t));
        if (!isScrolling) {
            isScrolling = true;
            smoothScroll();
        }
    }, {
        passive: false
    });
}
function initPictoSize() {
    const e = document.getElementById("box-picto");
    if (!e) {
        return;
    }
    const t = e.style.width;
    function o() {
        document.querySelectorAll(".pictoline").forEach(e => {
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
function modLoaded() {
    initUpdatedPictoIcons();
    initPictoSize();
    displayNewMods();
    checkAndShowUpdateNotice(RegisterMod);
    app.recmaxloop = app.maxrecloop;
    initAmbience();
    adjustPictoWidth();
    setupModBanner();
    afterModLoads();
}
function afterModLoads() { }
function replaceHome(e, t) {
    switch (e) {
        case "screen": {
            const path = `../${app.folder}img/${t}`;
            document.documentElement.style.setProperty("--url-img-home-screen", `url(${path})`);
            tryImageFallback(path, fb => document.documentElement.style.setProperty("--url-img-home-screen", `url(${fb})`));
            break;
        }
        case "titre": {
            const path = `../${app.folder}img/${t}`;
            document.documentElement.style.setProperty("--url-img-home-titre", `url(${path})`);
            tryImageFallback(path, fb => document.documentElement.style.setProperty("--url-img-home-titre", `url(${fb})`));
            break;
        }
        case "version": {
            const path = `../${app.folder}img/${t}`;
            document.documentElement.style.setProperty("--url-img-home-version", `url(${path})`);
            tryImageFallback(path, fb => document.documentElement.style.setProperty("--url-img-home-version", `url(${fb})`));
            break;
        }
        case "stores": {
            const path = `../${app.folder}img/${t}`;
            document.documentElement.style.setProperty("--url-img-home-stores", `url(${path})`);
            tryImageFallback(path, fb => document.documentElement.style.setProperty("--url-img-home-stores", `url(${fb})`));
            break;
        }
        case "color":
            document.documentElement.style.setProperty("--colBck", t);
    }
}
function waitForElement(e, t) {
    const o =
        setInterval(() => {
            const n = document.querySelector(e);
            if (n) {
                clearInterval(o);
                t(n);
            }
        }, 100);
}
function changeFavicon(e) {
    let t = document.querySelector("link[rel~='icon']");
    if (!t) {
        t = document.createElement("link");
        t.rel = "icon";
        document.head.appendChild(t);
    }
    t.href = e;
}
window.addEventListener("beforeunload", () => {
    localStorage.setItem("lastPage", window.location.href);
});
waitForElement("#home-bt-play", e => {
    const t = new MutationObserver(o => {
        for (const n of o) {
            if (n.type === "attributes" && n.attributeName === "class" && e.classList.contains("animate")) {
                t.disconnect();
                modLoaded();
            }
        }
    });
    t.observe(e, {
        attributes: true
    });
});
function setFaviconSmart(primarySrc, fallbackSrc) {
    if (getHtmlName() != "app.html") {
        changeFavicon("favicon.png");
        return;
    }

    const img = new Image();

    img.onload = () => {
        changeFavicon(primarySrc);
    };

    img.onerror = () => {
        if (fallbackSrc) {
            changeFavicon(fallbackSrc);
        } else {
            changeFavicon("favicon.png");
        }
    };

    img.src = primarySrc;
}
OnDelayIn(500, function () {
    const versionId = getVersionFromURL();
    setFaviconSmart(`asset-v${versionId}/icon.png`, window.versionCustomIcons?.[versionId]);
    document.title = `${(getHtmlName() == "app.html" ? app.name : "Incredibox") || "Incredibox"} | ${RegisterMod}`;
});
let currentFadeTimeout = null;
let isTransitioningB = false;
let transitionStartTime = null;
let transitionDuration = 0;
let transitionPath = null;
let transitionTimeRemaining = 0;
function replaceBackgroundSprite(e, t = 500) {
    const o = document.getElementById("bck-current");
    const n = document.getElementById("bck-next");

    const path = `${app.folder}img/${e}`;

    if (currentFadeTimeout !== null) {
        clearTimeout(currentFadeTimeout);
        currentFadeTimeout = null;
    }

    if (t === 0) {
        o.style.transition = "none";
        n.style.transition = "none";
        o.style.opacity = 1;
        n.style.opacity = 0;
        o.style.backgroundImage = `url(${path})`;
        tryImageFallback(path, (fb) => (o.style.backgroundImage = `url(${fb})`));
        isTransitioningB = false;
        return;
    }

    const nextLayerImage = n.style.backgroundImage;
    const nextLayerOpacity = parseFloat(getComputedStyle(n).opacity);

    if (isTransitioningB && nextLayerImage === `url("${path}")`) {
        currentFadeTimeout = setTimeout(() => {
            finishBackgroundTransition();
        }, t);
        return;
    }

    transitionPath = e;
    transitionDuration = t;
    transitionStartTime = Date.now();
    transitionTimeRemaining = t;

    if (isTransitioningB) {
        o.style.transition = "none";
        o.style.backgroundImage = nextLayerImage;
        o.style.opacity = nextLayerOpacity;
    }

    n.style.transition = "none";
    n.style.opacity = 0;
    n.style.backgroundImage = `url(${path})`;
    tryImageFallback(path, (fb) => (n.style.backgroundImage = `url(${fb})`));

    if (!isPaused) {
        n.offsetWidth;
        o.style.transition = `opacity ${t}ms ease`;
        n.style.transition = `opacity ${t}ms ease`;
        n.style.opacity = 1;
        o.style.opacity = 0;
        isTransitioningB = true;

        currentFadeTimeout = setTimeout(() => {
            finishBackgroundTransition();
        }, t);
    }
}
function finishBackgroundTransition() {
    const e = document.getElementById("bck-current");
    const t = document.getElementById("bck-next");
    e.style.transition = "none";
    e.style.backgroundImage = t.style.backgroundImage;
    e.style.opacity = 1;
    t.style.transition = "none";
    t.style.opacity = 0;
    currentFadeTimeout = null;
    isTransitioningB = false;
    transitionPath = null;
}
function pauseAllDelays() {
    if (!isPausedD) {
        isPausedD = true;
        pauseStartTime = Date.now();
        activeDelays.forEach(e => {
            e.pause();
        });
        if (isTransitioningB && currentFadeTimeout !== null) {
            const e = Date.now() - transitionStartTime;
            transitionTimeRemaining = Math.max(0, transitionDuration - e);
            clearTimeout(currentFadeTimeout);
            currentFadeTimeout = null;
            const t = document.getElementById("bck-current");
            const o = document.getElementById("bck-next");
            const n = parseFloat(getComputedStyle(t).opacity);
            const i = parseFloat(getComputedStyle(o).opacity);
            t.style.transition = "none";
            o.style.transition = "none";
            t.style.opacity = n;
            o.style.opacity = i;
        }
        console.log("Paused all delays and background transition.");
    }
}
function resumeAllDelays() {
    if (isPausedD) {
        isPausedD = false;
        pauseStartTime = null;
        activeDelays.forEach(e => {
            e.resume();
        });
        if (isTransitioningB && transitionPath !== null) {
            const e = document.getElementById("bck-current");
            const t = document.getElementById("bck-next");
            parseFloat(getComputedStyle(e).opacity);
            parseFloat(getComputedStyle(t).opacity);
            t.offsetWidth;
            e.style.transition = `opacity ${transitionTimeRemaining}ms ease`;
            t.style.transition = `opacity ${transitionTimeRemaining}ms ease`;
            t.style.opacity = 1;
            e.style.opacity = 0;
            transitionStartTime = Date.now();
            currentFadeTimeout =
                setTimeout(() => {
                    finishBackgroundTransition();
                }, transitionTimeRemaining);
        }
        console.log("Resumed all delays and background transition.");
    }
}
function setBackgroundLayer(e) {
    document.getElementById("box-stage-bck").style.setProperty("--layer-image", `url(${e})`);
}
function setEventBackgroundLayer(e) {
    document.getElementById("box-stage-bck").style.setProperty("--layer-image-event", `url(${e})`);
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
function stageFadeOut(e, t, o = false, n = null) {
    const i = document.getElementById("box-stage-bck");
    if (!i) {
        return;
    }
    const a = i.querySelector(".stage-fade");
    if (a) {
        a.remove();
    }
    const s = document.createElement("div");
    s.className = "stage-fade";
    s.style.backgroundColor = e;
    s.style.opacity = o ? "0" : "1";
    s.style.transition = t > 0 ? `opacity ${t}ms ease` : "none";
    i.appendChild(s);
    if (t > 0) {
        s.offsetWidth;
        s.style.opacity = o ? "1" : "0";
        if (o && typeof n == "function") {
            setTimeout(n, t);
        }
    } else {
        s.style.opacity = o ? "1" : "0";
        if (o && typeof n == "function") {
            n();
        }
    }
}
const stageLighting = {
    container: null,
    lighting: null,
    pointLight: null,
    blur: null,

    currentColor: "#ffffff",
    animationFrame: null
};
function initStageLighting() {
    if (stageLighting.container) return;

    const div = document.createElement("div");
    div.innerHTML = `
        <svg style="position:absolute;width:0;height:0;pointer-events:none;">
            <filter
                id="stage-lighting"
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
            >
                <feGaussianBlur
                    id="stage-lighting-blur"
                    in="SourceAlpha"
                    stdDeviation="2"
                    result="blur"
                />

                <feSpecularLighting
                    id="stage-lighting-specular"
                    in="blur"
                    surfaceScale="3"
                    specularConstant="1"
                    specularExponent="15"
                    lighting-color="#ffffff"
                    result="light"
                >
                    <fePointLight
                        id="stage-lighting-point"
                        x="0"
                        y="-150"
                        z="180"
                    />
                </feSpecularLighting>

                <feComposite
                    in="light"
                    in2="SourceAlpha"
                    operator="in"
                    result="litAlpha"
                />

                <feBlend
                    in="SourceGraphic"
                    in2="litAlpha"
                    mode="screen"
                />
            </filter>
        </svg>
    `;

    document.body.appendChild(div);

    stageLighting.container = div;
    stageLighting.blur = div.querySelector("#stage-lighting-blur");
    stageLighting.lighting = div.querySelector("#stage-lighting-specular");
    stageLighting.pointLight = div.querySelector("#stage-lighting-point");
}
function setStageLighting(options = {}) {
    initStageLighting();

    const stage = document.getElementById("cnv-stage");

    if (!stage) return;

    const {
        enabled = true,

        color = "#ffffff",
        transition = 0,

        blur = 2,
        intensity = 3,

        exponent = 15,
        constant = 1.2,

        x = "center",
        y = -150,
        z = 180
    } = options;

    if (!enabled) {
        return;
    }

    if (!stage.dataset.lightingApplied) {
        let currentFilters = getComputedStyle(stage).filter;

        if (currentFilters && currentFilters !== "none") {
            const cleanFilters = currentFilters.replace(/url\(#[^)]+\)/g, '').trim();
            stage.style.filter = `url(#stage-lighting) ${cleanFilters}`;
        } else {
            stage.style.filter = `url(#stage-lighting)`;
        }
        stage.dataset.lightingApplied = "true";
    }

    stageLighting.blur.setAttribute("stdDeviation", blur);
    stageLighting.lighting.setAttribute("surfaceScale", intensity);
    stageLighting.lighting.setAttribute("specularExponent", exponent);
    stageLighting.lighting.setAttribute("specularConstant", constant);

    const rect = stage.getBoundingClientRect();

    stageLighting.pointLight.setAttribute("x", x === "center" ? rect.width / 2 : x);
    stageLighting.pointLight.setAttribute("y", y);
    stageLighting.pointLight.setAttribute("z", z);

    updateLightingColor(color, transition);
}
function updateLightingColor(targetColor, duration = 0) {
    const lighting = stageLighting.lighting;

    if (!lighting) return;

    if (stageLighting.animationFrame) {
        cancelAnimationFrame(stageLighting.animationFrame);
    }

    if (duration <= 0 || stageLighting.currentColor === targetColor) {
        lighting.setAttribute("lighting-color", targetColor);

        stageLighting.currentColor = targetColor;

        return;
    }

    const start = hexToRgb(stageLighting.currentColor);
    const end = hexToRgb(targetColor);
    const startTime = performance.now();

    function animate(now) {
        const t = Math.min((now - startTime) / duration, 1);

        const r = Math.round(start.r + (end.r - start.r) * t);
        const g = Math.round(start.g + (end.g - start.g) * t);
        const b = Math.round(start.b + (end.b - start.b) * t);

        lighting.setAttribute("lighting-color", `rgb(${r},${g},${b})`);

        if (t < 1) {
            stageLighting.animationFrame = requestAnimationFrame(animate);
        } else {
            stageLighting.currentColor = targetColor;
            stageLighting.animationFrame = null;
        }
    }

    stageLighting.animationFrame = requestAnimationFrame(animate);
}
window.addEventListener("resize", () => {
    const stage = document.getElementById("cnv-stage");

    if (!stage || !stageLighting.pointLight)
        return;

    const rect = stage.getBoundingClientRect();

    stageLighting.pointLight.setAttribute("x", rect.width / 2);
});
function hexToRgb(hex) {
    const BigIntColor = parseInt(hex.replace('#', ''), 16);
    return {
        r: (BigIntColor >> 16) & 255,
        g: (BigIntColor >> 8) & 255,
        b: BigIntColor & 255
    };
}
function setupModBanner() {
    const banner = document.getElementById("promo-banner");

    if (banner && typeof ModBanner !== 'undefined' && ModBanner !== "") {
        banner.style.display = "flex";

        try {
            const img = new Image();
            img.onload = function () {
                banner.style.backgroundImage = `url(${ModBanner})`;
            };
            img.onerror = function () {
                console.warn("Failed to load mod banner image:", ModBanner);
                banner.style.backgroundImage = `url("./asset-v1/img/banner-promo-template.png")`;
            };
            img.src = ModBanner;
        } catch (e) {
            console.warn("Failed to set mod banner image:", e);
            banner.style.backgroundImage = `url("./asset-v1/img/banner-promo-template.png")`;
        }

        if (ModBannerLink && ModBannerLink !== "") {
            banner.style.transition = "opacity 0.3s";
            banner.style.pointerEvents = "auto";
            banner.style.cursor = "pointer";
            banner.addEventListener("mouseenter", () => {
                banner.style.opacity = "0.5";
            });
            banner.addEventListener("mouseleave", () => {
                banner.style.opacity = "1";
            });
            banner.addEventListener("click", () => {
                confirmNavigation(ModBannerLink);
            });
        }
    } else {
        if (banner) {
            banner.style.display = "none";
        }
    }
}
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let isAmbiencePlaying = false;
let ambiencePath = null;
let checkingInterval = null;
let ambienceSource = null;
let gainNode = null;
let ambienceGainNode = null;
let isTransitioning = false;
const FADE_TIME = 1;
function shouldPlayAmbience() {
    return !anyPictoIsBusy() && !document.body.classList.contains("darkback");
}
async function setAmbience(e) {
    var sndPath = app.format[0] || sndExt;
    ambiencePath = `asset-v${appVersion}/sound/mod/ambience-${e}.${sndPath}`;
    if (isAmbiencePlaying || isTransitioning) {
        await stopAmbience();
    }
    if (shouldPlayAmbience()) {
        await playAmbience(ambiencePath);
    }
    if (!checkingInterval) {
        observePictoState();
    }
}
async function playAmbience(path) {
    if (isTransitioning) return;
    if (!shouldPlayAmbience()) return;

    isTransitioning = true;
    try {
        const audioContext = await window.getModAudioContext();

        const targetOutput = audioContext.destination;

        if (ambienceSource) { try { ambienceSource.stop(); ambienceSource.disconnect(); } catch (e) { } }
        if (ambienceGainNode) { try { ambienceGainNode.disconnect(); } catch (e) { } }

        ambienceGainNode = audioContext.createGain();
        ambienceGainNode.gain.setValueAtTime(0, audioContext.currentTime);

        const response = await fetch(path);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        ambienceSource = audioContext.createBufferSource();
        ambienceSource.buffer = audioBuffer;
        ambienceSource.loop = true;

        ambienceSource.connect(ambienceGainNode);
        ambienceGainNode.connect(targetOutput);

        ambienceSource.start();

        ambienceGainNode.gain.linearRampToValueAtTime(modVolume, audioContext.currentTime + FADE_TIME);

        isAmbiencePlaying = true;
    } catch (error) {
        console.error("Error in playAmbience:", error);
    } finally {
        isTransitioning = false;
    }
}
async function stopAmbience(clearIntervalFlag = true) {
    if (!ambienceSource || !ambienceGainNode || isTransitioning) return;

    isTransitioning = true;
    try {
        const audioContext = await window.getModAudioContext();
        const now = audioContext.currentTime;

        ambienceGainNode.gain.cancelScheduledValues(now);
        ambienceGainNode.gain.setValueAtTime(ambienceGainNode.gain.value, now);
        ambienceGainNode.gain.linearRampToValueAtTime(0, now + FADE_TIME);

        ambienceSource.stop(now + FADE_TIME);
    } catch (e) {
        console.warn("Error stopping ambience:", e);
    }

    setTimeout(() => {
        try {
            ambienceSource.disconnect();
            ambienceGainNode.disconnect();
        } catch (e) { }
        ambienceSource = null;
        ambienceGainNode = null;
        isAmbiencePlaying = false;
        isTransitioning = false;

        if (clearIntervalFlag && checkingInterval) {
            clearInterval(checkingInterval);
            checkingInterval = null;
        }
    }, FADE_TIME * 1000 + 50);
}
function updateAmbienceVolume() {
    if (ambienceGainNode) {
        const audioContext = ambienceGainNode.context;
        const now = audioContext.currentTime;

        ambienceGainNode.gain.cancelScheduledValues(now);
        ambienceGainNode.gain.setTargetAtTime(modVolume, now, 0.05);

        console.log(`Ambience volume synced to ${Math.round(modVolume * 100)}%`);
    }
}
function anyPictoIsBusy() {
    const e = document.querySelectorAll(".picto");
    return Array.from(e).some(e => e.classList.contains("drag") || e.classList.contains("griser"));
}
function observePictoState() {
    checkingInterval =
        setInterval(async () => {
            if (shouldPlayAmbience()) {
                if (!(isAmbiencePlaying || !ambiencePath || isTransitioning)) {
                    await playAmbience(ambiencePath);
                }
            } else if (isAmbiencePlaying) {
                await stopAmbience(false);
            }
        }, 200);
}
function checkAndShowUpdateNotice(e) {
    fetch("https://raw.githubusercontent.com/RemmieUwU/Incredimods/refs/heads/main/buildUpdateData.json").then(e => e.json()).then(t => {
        const o = t.id;
        let n = JSON.parse(localStorage.getItem("shownMessages") || "[]");
        if (n.includes(o)) {
            return;
        }
        const i = t.devVersionOnly;
        const a = t.versionForEveryone;
        if (i && (e === "Unknown" || e === "Unknow") || a) {
            boxPopup.open({
                name: "popup-message",
                icntype: "action",
                bodyclose: true,
                class: "modCreditsBox",
                content: t.content,
                onBoxOpenEnd: function () {
                    boxPopup.$popup.find(".icon.bt.bt-round.bt-44").on("click", () => {
                        boxPopup.close();
                    });
                },
                onBoxCloseStart: function () {
                    boxPopup.$popup.find(".icon.bt.bt-round.bt-44").off();
                }
            });
            n.push(o);
            localStorage.setItem("shownMessages", JSON.stringify(n));
        }
    }).catch(e => {
        console.error("Couldn't load update message:", e);
    });
}
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
function findInScript(e) {
    let t = "";
    for (var o in window) {
        if (o.toLowerCase().includes(e)) {
            t += `<p>${o}: ${window[o]}</p>`;
        }
    }
    boxPopup.open({
        name: "popup-message",
        icntype: "action",
        bodyclose: true,
        class: "modCreditsBox",
        content: `<div class="info-debug">${t}</div>`,
        onBoxOpenEnd: function () {
            boxPopup.$popup.find(".icon.bt.bt-round.bt-44").on("click", () => {
                boxPopup.close();
            });
        },
        onBoxCloseStart: function () {
            boxPopup.$popup.find(".icon.bt.bt-round.bt-44").off();
        }
    });
}
function updateTransform(e) {
    const t = pictoTransforms.get(e) || {
        shake: {
            x: 0,
            y: 0
        },
        wiggle: {
            x: 0,
            y: 0
        }
    };
    const o = t.shake.x + t.wiggle.x;
    const n = t.shake.y + t.wiggle.y;
    e.style.transform = `translate(${o}px, ${n}px)`;
}
let shakingPictoPower = 0;
let pictoShakeInterval = null;
function initShakingPicto(e, t = 5) {
    clearShakingPicto();
    shakingPictoPower = e;
    const o = document.querySelectorAll(".picto");
    pictoShakeInterval =
        setInterval(() => {
            o.forEach(e => {
                const t = e.querySelector(".bck");
                if (t) {
                    const e = (Math.random() - 0.5) * shakingPictoPower;
                    const o = (Math.random() - 0.5) * shakingPictoPower;
                    const n = pictoTransforms.get(t) || {
                        shake: {
                            x: 0,
                            y: 0
                        },
                        wiggle: {
                            x: 0,
                            y: 0
                        }
                    };
                    n.shake.x = e;
                    n.shake.y = o;
                    pictoTransforms.set(t, n);
                    updateTransform(t);
                }
            });
        }, t);
}
function clearShakingPicto() {
    shakingIntervals.forEach(({
        id: e,
        bck: t
    }) => {
        clearInterval(e);
        const o = pictoTransforms.get(t) || {
            shake: {
                x: 0,
                y: 0
            },
            wiggle: {
                x: 0,
                y: 0
            }
        };
        o.shake.x = 0;
        o.shake.y = 0;
        pictoTransforms.set(t, o);
        updateTransform(t);
    });
    shakingIntervals.length = 0;
}
function wigglePictos(e = 2, t = 10) {
    const o = document.querySelectorAll(".picto");
    let n = null;
    wiggleAnimationFrame = requestAnimationFrame(function i(a) {
        if (!n) {
            n = a;
        }
        const s = (a - n) / 1000;
        o.forEach((o, n) => {
            const i = o.querySelector(".bck");
            if (i) {
                const o = n * 0.3;
                const a = Math.sin((s - o) * e) * t;
                const c = pictoTransforms.get(i) || {
                    shake: {
                        x: 0,
                        y: 0
                    },
                    wiggle: {
                        x: 0,
                        y: 0
                    }
                };
                c.wiggle.y = a;
                pictoTransforms.set(i, c);
                updateTransform(i);
            }
        });
        wiggleAnimationFrame = requestAnimationFrame(i);
    });
}
function stopWiggle() {
    cancelAnimationFrame(wiggleAnimationFrame);
    document.querySelectorAll(".picto").forEach(e => {
        const t = e.querySelector(".bck");
        if (t) {
            const e = pictoTransforms.get(t) || {
                x: 0,
                y: 0
            };
            e.y = 0;
            pictoTransforms.set(t, e);
            updateTransform(t);
        }
    });
}
function toggleDarkMode() {
    document.body.classList.toggle("darkmode");
}
function initAmbience() {
    if (app.ambience) {
        setAmbience(app.ambience);
    }
}
const extraYOffset = {};

async function loadExtraYOffsetConfig(path = "data/configs/aboutYOffsetsData.jsonc") {
    try {
        const res = await fetch(path);
        if (!res.ok) throw new Error("Config not found");
        let text = await res.text();

        text = text.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");

        const data = JSON.parse(text);

        Object.assign(extraYOffset, data);

        console.log("ExtraYOffset config loaded:", extraYOffset);
    } catch (err) {
        console.warn("Failed to load extraYOffset config, using fallback", err);
    }
}

loadExtraYOffsetConfig();

function getExtraY(name) {
    return extraYOffset[name] || 0;
}
function openAboutPop() {
    const versionKey = `v${app.version}`;
    const versionInfo = modInfo && modInfo[versionKey] ? modInfo[versionKey] : {};
    boxPopup.open({
        name: "popup-message",
        bodyclose: true,
        class: "modCreditsBox invBor",
        content: `
            <div class="modCoverWrapper">
                <canvas id="modCoverCanvas" width="678" height="282"></canvas>
            </div>
            <div class="mod-info-single">
                <div class="single-version-icon"></div>
                <div class="title">${RegisterMod || "Unknown"}</div>
                <div class="txt">${versionInfo.description || modInfo && modInfo.description || "No description available"}</div>
                <div class="footer-pop">
                    ${versionInfo.relatedVideo || modInfo && modInfo.relatedVideo ?
                `<iframe style="margin-top: 10px;" width="480" height="270" src="${(versionInfo.relatedVideo || modInfo.relatedVideo).replace("watch?v=", "embed/")}"></iframe>` :
                `<div id="noYT-prev">
                            <div class="icon-prev n2"></div>
                            <div class="icon-prev n1"></div>
                        </div>`
            }
                </div>
            </div>`,
        onBoxOpenEnd: function () {
            const canvas = document.getElementById("modCoverCanvas");
            const ctx = canvas.getContext("2d");

            const imgs = {
                front: new Image(),
                left: new Image(),
                right: new Image()
            };

            const sprites = {
                front: { img: imgs.front, w: 164, h: 380, loaded: false },
                left: { img: imgs.left, w: 164, h: 380, loaded: false },
                right: { img: imgs.right, w: 164, h: 380, loaded: false }
            };

            let picks;

            const animePool = [...app.animearray];
            while (animePool.length < 3) {
                animePool.push(...app.animearray);
            }

            picks = animePool.sort(() => Math.random() - 0.5).slice(0, 3);

            const [frontPick, leftPick, rightPick] = picks;

            const loadJSON = async (name) => {
                const paths = [
                    `${app.folder}/anime/${name}.json`,
                ];

                for (const p of paths) {
                    try {
                        const r = await fetch(p);
                        if (!r.ok) continue;
                        const j = await r.json();
                        return {
                            w: parseInt(j.width) || 164,
                            h: parseInt(j.height) || 380,
                            gap: parseInt(j.gap) || 0
                        };
                    } catch { }
                }
                return { w: 164, h: 380, gap: 0 };
            };

            const loadSprite = (key, name) =>
                new Promise((resolve) => {
                    const img = sprites[key].img;
                    const paths = [
                        `${app.folder}/anime/${name}-sprite-hd.png`,
                        `${app.folder}/anime/${name}.png`
                    ];

                    let i = 0;
                    const next = () => {
                        if (i >= paths.length) return;
                        img.onload = () => {
                            sprites[key].loaded = true;
                            resolve();
                        };
                        img.onerror = () => { i++; next(); };
                        img.src = paths[i];
                    };
                    next();
                });

            function render() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                const bg = ctx.createLinearGradient(44, 0, 146, canvas.height);
                bg.addColorStop(0, (app.colors ? app.colors[1] : app.col1));
                bg.addColorStop(1, (app.colors ? app.colors[3] : app.col3));
                ctx.fillStyle = bg;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                const scale = 0.8;

                ctx.save();
                ctx.globalAlpha = 0.4;

                const leftSprite = sprites.left;
                const leftW = leftSprite.w * scale;
                const leftH = leftSprite.h * scale;
                const leftY = 127 + getExtraY(leftPick.name);

                ctx.drawImage(
                    leftSprite.img,
                    leftPick.gap, 0, leftSprite.w, leftSprite.h,
                    (canvas.width - leftW) / 2 - 145,
                    (canvas.height - leftH) / 2 + leftY,
                    leftW, leftH
                );

                const rightSprite = sprites.right;
                const rightW = rightSprite.w * scale;
                const rightH = rightSprite.h * scale;
                const rightY = 127 + getExtraY(rightPick.name);

                ctx.drawImage(
                    rightSprite.img,
                    rightPick.gap, 0, rightSprite.w, rightSprite.h,
                    (canvas.width - rightW) / 2 + 145,
                    (canvas.height - rightH) / 2 + rightY,
                    rightW, rightH
                );

                ctx.restore();

                const frontSprite = sprites.front;
                const frontY = 137 + getExtraY(frontPick.name);

                ctx.drawImage(
                    frontSprite.img,
                    frontPick.gap, 0, frontSprite.w, frontSprite.h,
                    (canvas.width - frontSprite.w) / 2,
                    (canvas.height - frontSprite.h) / 2 + frontY,
                    frontSprite.w, frontSprite.h
                );
            }

            Promise.all([
                loadJSON(frontPick.name).then(d => {
                    sprites.front.w = d.w * 2;
                    sprites.front.h = d.h * 2;
                    frontPick.gap = d.gap;
                }),
                loadJSON(leftPick.name).then(d => {
                    sprites.left.w = d.w * 2;
                    sprites.left.h = d.h * 2;
                    leftPick.gap = d.gap;
                }),
                loadJSON(rightPick.name).then(d => {
                    sprites.right.w = d.w * 2;
                    sprites.right.h = d.h * 2;
                    rightPick.gap = d.gap;
                }),

                loadSprite("front", frontPick.name),
                loadSprite("left", leftPick.name),
                loadSprite("right", rightPick.name)
            ]).then(render);
        },
        onBoxCloseStart: function () {
            boxPopup.$popup.find(".icon.bt.bt-round.bt-44").off();
        },
        onCloseComplete: function () {
            document.getElementById("pop-popup").classList.remove("invBor");
        }
    });
    loadSingleVersionIcon();
    if (!modInfo.relatedVideo || !modInfo[`v${app.version}`].relatedVideo) {
        const noYTPrev = document.querySelector("#noYT-prev");
        const tryMultiplePaths = (fileName, callback) => {
            const getPath2x = (filename) => {
                const lastDotIndex = filename.lastIndexOf('.');
                if (lastDotIndex === -1) return filename + '@2x';
                return filename.slice(0, lastDotIndex) + '@2x' + filename.slice(lastDotIndex);
            };

            const pathsToTry = [
                `${app.folder}img/${getPath2x(fileName)}`,
                `${app.folder}image/${getPath2x(fileName)}`,
                `${app.folder}img/${fileName}`,
                `${app.folder}image/${fileName}`
            ];

            let pathIndex = 0;
            const tryNextPath = () => {
                if (pathIndex >= pathsToTry.length) return;

                const testImg = new Image();
                const currentPath = pathsToTry[pathIndex];

                testImg.onload = () => {
                    callback(currentPath);
                };
                testImg.onerror = () => {
                    pathIndex++;
                    tryNextPath();
                };
                testImg.src = currentPath;
            };
            tryNextPath();
        };

        const homeScreenName = app.homeScreen || "home-screen.jpg";
        tryMultiplePaths(homeScreenName, path => {
            noYTPrev.style.backgroundImage = `url("${path}")`;
        });

        const icons = document.querySelectorAll("#noYT-prev .icon-prev.n1, #noYT-prev .icon-prev.n2");
        icons.forEach(icon => {
            const pictoName = app.gamePicto || "game-picto.png";
            tryMultiplePaths(pictoName, path => {
                icon.style.backgroundImage = `url('${path}')`;
            });
            const frame = Math.floor(Math.random() * (app.animearray.length - 1));
            icon.style.backgroundPosition = `calc((100% / ${app.animearray.length - 1}) * ${frame}) 0`;
        });
    }
}
document.addEventListener("DOMContentLoaded", function () {
    window.app = window.app || {};
    if (window.electron) {
        app.isElectron = true;
        app.folder = "";
    } else {
        app.isElectron = false;
        app.folder = "asset-v1/";
    }
});

function preloadIconPath(path) {
    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => resolve(path);
        img.onerror = () => reject();

        img.src = path;
    });
}

async function loadSingleVersionIcon() {
    var fallbackIconPath =
        "data:image/png;base64,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";
    const versionId = appVersion;
    const iconElement = document.querySelector(".single-version-icon");
    const primaryPath =
        window.versionCustomIcons?.[versionId] ?? `asset-v${appVersion}/icon.png`;

    try {
        const verifiedPath = await preloadIconPath(primaryPath);
        iconElement.style.backgroundImage = `url("${verifiedPath}")`;
    } catch (error) {
        iconElement.style.backgroundImage = `url("${fallbackIconPath}")`;
    }
}

let singleVersionMod = false;
function logDebug(e) {
    console.log(`[VersionManager] ${e}`);
}
function unHide(e) {
    const t = document.getElementById(`icon${e}`);
    if (!t) {
        return false;
    }
    try {
        t.style.removeProperty("display");
        t.style.display = "block";
        t.dataset.hidden = "false";
        logDebug(`unhid icon${e}`);
        updateSwitchButtonState();
        return true;
    } catch (t) {
        console.error(`Error unhiding icon${e}:`, t);
        return false;
    }
}
function Hide(e) {
    const t = document.getElementById(`icon${e}`);
    if (!t) {
        return false;
    }
    try {
        t.style.display = "none";
        t.dataset.hidden = "true";
        updateSwitchButtonState();
        return true;
    } catch (t) {
        console.error(`Error hiding icon${e}:`, t);
        return false;
    }
}
function updateSwitchButtonState() {
    const e = document.querySelectorAll("[id^=\"icon\"]");
    const t = Array.from(e).filter(e => {
        const t = window.getComputedStyle(e).display !== "none";
        const o = e.classList.contains("vicon");
        return t && o;
    });
    singleVersionMod = t.length === 1;
    const o = document.querySelector("#home-bt-switch use");
    if (o) {
        const e = singleVersionMod ? "#ic-rate" : "#ic-switch";
        o.setAttribute("xlink:href", e);
    }
}
function setupSwitchButton() {
    logDebug("Setting up switch button");
    if (typeof OnClick == "function") {
        OnClick("home-bt-switch", () => {
            if (singleVersionMod) {
                openAboutPop();
            } else {
                popupSwitch();
            }
        });
    } else {
        console.error("OnClick function not available yet");
    }
}
function movePictoLine(e, t, o) {
    if ("v" + getVersionFromURL() !== e) {
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
function smoothNumber(e, t, o, n) {
    let i = e;
    (function e() {
        const a = t - i;
        if (Math.abs(a) < 0.01) {
            i = t;
            n(i);
            return;
        }
        i += a * o;
        n(i);
        requestAnimationFrame(e);
    })();
}
function OnDelayIn(e, t) {
    const o = new PausableDelay(t, e);
    activeDelays.push(o);
    return o;
}
function pauseAllDelays() {
    if (!isPausedD) {
        isPausedD = true;
        pauseStartTime = Date.now();
        activeDelays.forEach(e => {
            e.pause();
        });
        if (typeof currentFadeTimeout == "number" && currentFadeTimeout !== null) {
            clearTimeout(currentFadeTimeout);
        }
    }
}
function resumeAllDelays() {
    if (isPausedD) {
        isPausedD = false;
        pauseStartTime = null;
        activeDelays.forEach(e => {
            e.resume();
        });
    }
}
function cancelAllDelays() {
    activeDelays.forEach(e => {
        e.cancel();
    });
    activeDelays = [];
    if (typeof currentFadeTimeout == "number" && currentFadeTimeout !== null) {
        clearTimeout(currentFadeTimeout);
        currentFadeTimeout = null;
    }
}
function clearAllDelays() {
    activeTimeouts.forEach(clearTimeout);
    activeTimeouts = [];
}
function replaceDefaultPolo(e, t) {
    if (polos[e]?.setSprite) {
        polos[e].setSprite(t);
    } else {
        console.log(`[replace polo] Polo ${e} doesn't exist`);
    }
}
function replaceAllDefaultPolos(e) {
    const t = app.nbpolo || 7;
    for (let o = 0; o < t; o++) {
        if (polos[o]) {
            polos[o].setSprite(e);
        }
    }
    app.poloSprite = e;
}
window.checkAllIcons = function () {
    document.querySelectorAll("[id^=\"icon\"]").forEach(e => {
        e.id;
        window.getComputedStyle(e).display;
    });
    return "Icon check complete";
};
setTimeout(() => {
    updateSwitchButtonState();
    setupSwitchButton();
    const boxBt2 = document.getElementById("box-bt2");
    const switchBt = document.getElementById("bt-switch");
    if (boxBt2 && switchBt) {
        if (singleVersionMod && document.querySelectorAll('#sp-select .vicon').length <= 1) {
            switchBt.remove();
        }
    }
}, 100);
function smoothNumber(e, t, o, n, i) {
    const a = performance.now();
    requestAnimationFrame(function s(c) {
        const r = c - a;
        const l = Math.min(r / o, 1);
        n(e + (t - e) * (1 - (1 - l) * (1 - l)));
        if (l < 1) {
            requestAnimationFrame(s);
        } else if (i) {
            i();
        }
    });
}
const snowCanvas = document.getElementById("snowCanvas");
const ctxSnow = snowCanvas.getContext("2d");
let snowflakes = [];
function resizeCanvas() {
    snowCanvas.width = window.innerWidth;
    snowCanvas.height = window.innerHeight;
}
function createSnowflake() {
    return {
        x: Math.random() * snowCanvas.width,
        y: Math.random() * snowCanvas.height,
        radius: Math.random() * 2 + 1,
        speedY: Math.random() * 1 + 0.5,
        speedX: Math.random() * 0.5 - 0.25
    };
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);
for (let e = 0; e < 100; e++) {
    snowflakes.push(createSnowflake());
}
function drawSnow() {
    if (specialEventName === "Winter" || specialEventName === "Christmas") {
        ctxSnow.clearRect(0, 0, snowCanvas.width, snowCanvas.height);
        ctxSnow.fillStyle = "white";
        ctxSnow.beginPath();
        for (let e of snowflakes) {
            ctxSnow.moveTo(e.x, e.y);
            ctxSnow.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
        }
        ctxSnow.fill();
        updateSnowflakes();
        requestAnimationFrame(drawSnow);
    }
}
function updateSnowflakes() {
    for (let e of snowflakes) {
        e.y += e.speedY;
        e.x += e.speedX;
        if (e.y > snowCanvas.height) {
            e.y = -e.radius;
            e.x = Math.random() * snowCanvas.width;
        }
    }
}
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
function forceRemovePoloById(poloId) {
    if (listPolo[poloId]) {
        if (listPolo[poloId].getBusy() == 1) {
            removePolo(listPolo[poloId]);
            majListPoloDrop();
            console.log(`Polo ${poloId} force removed.`);
        } else {
            console.warn(`Polo ${poloId} is not busy, nothing to remove.`);
        }
    } else {
        console.error(`Invalid poloId (${poloId})`);
    }
}
function forceRemovePoloByPictoId(pictoId) {
    const picto = listPicto && listPicto[pictoId];
    if (picto && picto.polo) {
        if (picto.polo.getBusy && picto.polo.getBusy() == 1) {
            removePolo(picto.polo);
            majListPoloDrop();
            console.log(`Polo for picto ${pictoId} removed.`);
        } else {
            console.warn(`Polo for picto ${pictoId} is not busy or missing getBusy method.`);
        }
    } else {
        console.error(`Invalid pictoId (${pictoId}) or no polo attached.`);
    }
}
function changeSmoothSize(e) {
    app.scaredPolos = e;
    console.log("Start changing size from", e, "to 5");
    smoothNumber(e, 5, 1000, t => {
        app.scaredPolos = t;
        console.log("Smooth size:", t.toFixed(2));
    }, () => {
        console.log("Done! Final size:", app.scaredPolos.toFixed(2));
    });
}
function impactPolos(e, t) {
    app.scaredPolos = e;
    smoothNumber(app.scaredPolos, 0, t, e => {
        app.scaredPolos = e;
    });
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

document.addEventListener("click", (e) => {
    const versionElement = e.target.closest("#box-version, #img-version");

    if (versionElement) {
        const elementId = versionElement.id.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join('');

        window[`on${elementId}Clicked${appVersion}`]?.();
    }

    const brandElement = e.target.closest("#box-title, #img-titre");
    if (brandElement) {
        const id = brandElement.id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
        window[`on${id}Clicked${appVersion}`]?.();
    }
});

let activeBoxVideo = null;

function playBoxVideo(videoPath) {
    if (document.getElementById("box-video-modal")) return;

    const modal = document.createElement("div");
    modal.id = "box-video-modal";
    modal.innerHTML = `
        <div class="box-video-backdrop"></div>
        <div class="box-video-content">
        <video
            id="box-video-player"
            src="${videoPath}"
            autoplay
            playsinline
            preload="auto"
        ></video>
        <div class="box-video-blocker"></div>
        </div>
    `;

    document.body.appendChild(modal);

    activeBoxVideo = document.getElementById("box-video-player");

    activeBoxVideo.controls = false;
    activeBoxVideo.disablePictureInPicture = true;
    activeBoxVideo.controlsList = "nodownload nofullscreen noplaybackrate";
    activeBoxVideo.play().catch(() => {
        console.log("Interaction required for audio/video");
    });

    activeBoxVideo.addEventListener("ended", closeBoxVideo);

    activeBoxVideo.addEventListener("pause", () => {
        if (!activeBoxVideo.ended) {
            activeBoxVideo.play().catch(() => { });
        }
    });
}

function closeBoxVideo() {
    activeBoxVideo?.pause();
    activeBoxVideo = null;
    document.getElementById("box-video-modal")?.remove();
}

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

function poloLyrics(poloId, text, duration, color, font, size, shake = false) {
    stopLyrics(poloId);

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
        const fontName = font.replace(/\.[^/.]+$/, "");
        const fontKey = `font-${fontName}`;

        if (!document.querySelector(`style[data-font="${fontKey}"]`)) {
            const style = document.createElement("style");
            style.setAttribute("data-font", fontKey);

            const basePath = window.location.pathname.includes('/pages/') ? '../' : './';
            const fontPath = `${basePath}font/${font}`;

            style.textContent = `
                @font-face {
                    font-family: "${fontName}";
                    src: url("${fontPath}") format('truetype');
                    font-weight: normal;
                    font-style: normal;
                    font-display: swap;
                }
            `;
            document.head.appendChild(style);

            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'font';
            link.href = fontPath;
            link.type = 'font/ttf';
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
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

    setInterval(() => {
        letters.forEach(letter => {
            const shakeX = (Math.random() * shakeDistance * 1) - shakeDistance;
            const shakeY = (Math.random() * shakeDistance * 1) - shakeDistance;
            letter.style.transform = `translate(${shakeX}px, ${shakeY}px)`;
        });
    }, 1);
}
function addModBt() {
    for (let i = 0; i < modBtList.length; i++) {
        let version = modBtList[i].version;
        let position = modBtList[i].position;
        if ((getHtmlName() == "index.html" && modBtList[i].skipIndex)
            || (getHtmlName() == "app.html" && modBtList[i].skipApp)) {
            continue;
        }
        if (getHtmlName() == "app.html") {
            const currentVersion = getVersionFromURL();
            const versionMatches = version == null || (Array.isArray(version)
                ? version.some(v => String(v) === String(currentVersion))
                : String(version) === String(currentVersion));

            if (!versionMatches) {
                continue;
            }
        }
        let id = modBtList[i].id;
        let icon = modBtList[i].icon;
        const btList = document.getElementById("bt-list" + ((position && position != "tr") ? "-" + position : ""));
        if (!btList) {
            console.error("bt-list element not found");
            continue;
        }
        if (!document.getElementById("home-bt-" + id)) {
            const html = "<div id='home-bt-" + id + "' class='bt bt-round bt-44 mod'><div class='bck'><svg class='icn-svg'><use href='" + icon + "'></use></svg></div><div class='hitzone' onclick='btFunctionById(\"" + id + "\")'></div></div>";
            btList.insertAdjacentHTML(position === "tl" ? "beforeend" : "afterbegin", html);
        }
        if (getHtmlName() == "app.html") {
            $("#home-bt-" + id).addClass("color");
        }
        $("#home-bt-" + id).addClass("animate");
    }
}
function btFunctionById(id) {
    const mod = modBtList.find(item => item.id === id);
    if (mod) {
        mod.function();
    }
}
function openExternal(url) {
    openURL(url, "_blank");
}
function getHtmlName() {
    const path = window.location.pathname;
    const fileName = path.substring(path.lastIndexOf("/") + 1);
    return fileName || "index.html";
}
function loadJS(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = url;
        script.onload = () => resolve(url);
        document.head.appendChild(script);
    });
}
function parseXML(xmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "application/xml");
    return xmlDoc;
}
function parseINI(data) {
    const result = {};
    let section = null;
    const lines = data.split(/\r?\n/);
    for (let line of lines) {
        line = line.trim();
        if (!line || line.startsWith(";") || line.startsWith("#")) {
            continue;
        }
        if (line.startsWith("[") && line.endsWith("]")) {
            section = line.slice(1, -1);
            result[section] = {};
        } else {
            const [key, ...value] = line.split("=");
            const val = value.join("=").trim();
            if (section) {
                result[section][key.trim()] = val;
            } else {
                result[key.trim()] = val;
            }
        }
    }
    return result;
}
function changeCssVar(a, b) {
    document.documentElement.style.setProperty(a, b);
}
function playAnimation(selector, name, duration, timingFunction, delay = "", iterationCount = "", direction = "", fillMode = "") {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
        el.style.animation = "none";
        el.offsetWidth;
        el.style.animation = name + " " + duration + " " + timingFunction + " " + delay + " " + iterationCount + " " + direction + " " + fillMode;
    });
}
function customPopup(popupName, htmlContent, win) {
    boxPopup.open({
        name: popupName,
        icntype: "action",
        bodyclose: true,
        class: win == "big" ? "big column" : "",
        content: htmlContent,
        onBoxOpenEnd: function () {
            boxPopup.$icon.on(pointerEventType.down, boxPopup.close);
        },
        onBoxCloseStart: function () {
            boxPopup.$icon.off();
        }
    });
}
function customInfo(text, title) {
    boxDialog.open(text, (title || ""), [STR("bt.gotit")], []);
}
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

    setTimeout(() => {
        closeBubble(poloid);
    }, duration);
}

function closeBubble(poloid) {
    const bubble = document.querySelector(`[data-speech-polo="${poloid}"]`);
    if (!bubble) return;

    bubble.classList.remove('show');
    // 等待过渡动画结束后移除 DOM
    setTimeout(() => {
        if (bubble.parentElement) {
            bubble.remove();
        }
    }, 300);
}
function rightPopup(text, duration = 3) {
    const popup = document.createElement("div");
    popup.className = "mod-right-popup";
    popup.textContent = text;
    document.body.appendChild(popup);
    setTimeout(() => {
        popup.style.right = "20px";
    }, 10);
    const transitionHandler = () => {
        if (document.body.contains(popup)) {
            popup.removeEventListener("transitionend", transitionHandler);
            document.body.removeChild(popup);
        }
    };
    setTimeout(() => {
        popup.style.right = "-30%";
        popup.addEventListener("transitionend", transitionHandler);
    }, duration * 1000);
}
function leftPopup(text, duration = 3) {
    const popup = document.createElement("div");
    popup.className = "mod-left-popup";
    popup.textContent = text;
    document.body.appendChild(popup);
    setTimeout(() => {
        popup.style.left = "20px";
    }, 10);
    const transitionHandler = () => {
        if (document.body.contains(popup)) {
            popup.removeEventListener("transitionend", transitionHandler);
            document.body.removeChild(popup);
        }
    };
    setTimeout(() => {
        popup.style.left = "-30%";
        popup.addEventListener("transitionend", transitionHandler);
    }, duration * 1000);
}
function topPopup(text, duration = 3) {
    const popup = document.createElement("div");
    popup.className = "mod-top-popup";
    popup.textContent = text;
    document.body.appendChild(popup);
    setTimeout(() => {
        popup.style.top = "20px";
    }, 10);
    const transitionHandler = () => {
        if (document.body.contains(popup)) {
            popup.removeEventListener("transitionend", transitionHandler);
            document.body.removeChild(popup);
        }
    };
    setTimeout(() => {
        popup.style.top = "-30%";
        popup.addEventListener("transitionend", transitionHandler);
    }, duration * 1000);
}
function bottomPopup(text, duration = 3) {
    const popup = document.createElement("div");
    popup.className = "mod-bottom-popup";
    popup.textContent = text;
    document.body.appendChild(popup);
    setTimeout(() => {
        popup.style.bottom = "20px";
    }, 10);
    const transitionHandler = () => {
        if (document.body.contains(popup)) {
            popup.removeEventListener("transitionend", transitionHandler);
            document.body.removeChild(popup);
        }
    };
    setTimeout(() => {
        popup.style.bottom = "-30%";
        popup.addEventListener("transitionend", transitionHandler);
    }, duration * 1000);
}
function fullPopup(url, d) {
    const popup = document.createElement("div");
    popup.className = "mod-full-popup";
    popup.style.backgroundImage = "url(" + url + ")";
    document.body.appendChild(popup);
    if (d != null && !Math.isNaN(d)) {
        setTimeout(function () {
            document.body.removeChild(popup);
        }, d);
    }
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

        const color = `#${app.animearray[pictoId].color.replace('##', '#') || 'ffffff'}`;

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

var defaultSNTVolUP = "sound/volume/plus.wav";
var defaultSNTVolDOWN = "sound/volume/minus.wav";
var defaultSNTVolMAX = "sound/volume/max.wav";

let modVolume = 1.0;
const savedVolume = parseFloat(localStorage.getItem("modVolume"));
if (!isNaN(savedVolume)) {
    modVolume = Math.max(0, Math.min(1, savedVolume));
}

let modGainNode = null;

let resolveGainNode;
window._modGainNodeReady = new Promise((resolve) => {
    resolveGainNode = resolve;
});

let volumeApplied = false;

function applyVolume() {
    if (modGainNode && !volumeApplied) {
        modGainNode.gain.value = modVolume;
        volumeApplied = true;
        console.log(`Applied initial volume: ${Math.round(modVolume * 100)}%`);
    }
}

let preMuteVolume = 1.0;
let isMuted = false;

function toggleMute() {
    const prevVolume = modVolume;

    if (modVolume > 0) {
        preMuteVolume = modVolume;
        modVolume = 0;
        isMuted = true;
        console.log("Muted");
    } else {
        modVolume = preMuteVolume > 0 ? preMuteVolume : 0.5;
        isMuted = false;
        console.log(`Unmuted: ${Math.round(modVolume * 100)}%`);
    }

    if (modGainNode) {
        modGainNode.gain.value = modVolume;
    }

    updateAmbienceVolume();

    localStorage.setItem("modVolume", modVolume.toString());

    playVolumeSound(prevVolume);
    showVolumeOverlay();
}

window.getModAudioContext = async function () {
    const gainNode = await window._modGainNodeReady;
    return gainNode.context;
};

const originalCreateGain = AudioContext.prototype.createGain;
AudioContext.prototype.createGain = function () {
    const gain = originalCreateGain.call(this);

    if (!modGainNode && gain.gain && gain.gain.value === 1) {
        console.log("Intercepted game's GainNode!");
        modGainNode = gain;
        resolveGainNode(gain);
        applyVolume();
    }

    return gain;
};

const originalConnect = AudioNode.prototype.connect;
AudioNode.prototype.connect = function (destination, ...args) {
    if (!modGainNode && destination?.gain?.value === 1) {
        console.log("GainNode hooked via connect()");
        modGainNode = destination;
        resolveGainNode(destination);
        applyVolume();
    }
    return originalConnect.call(this, destination, ...args);
};

const volumePollInterval = setInterval(() => {
    if (modGainNode && !volumeApplied) {
        applyVolume();
        clearInterval(volumePollInterval);
    }
}, 100);

let lastLoggedVolume = null;

function changeVolume(delta) {
    const prevVolume = modVolume;
    const newVolume = Math.round((modVolume + delta) * 10) / 10;
    const clampedVolume = Math.max(0, Math.min(1, newVolume));

    if (clampedVolume === modVolume && (modVolume === 0 || modVolume === 1)) {
        playVolumeSound(prevVolume);
        showVolumeOverlay();
        return;
    }

    modVolume = clampedVolume;
    localStorage.setItem("modVolume", modVolume.toString());

    if (modGainNode) {
        modGainNode.gain.value = modVolume;

        const volumePercent = Math.round(modVolume * 100);
        if (lastLoggedVolume !== volumePercent) {
            console.log(`Game volume set to ${volumePercent}%`);
            lastLoggedVolume = volumePercent;
        }

        updateAmbienceVolume();
        playVolumeSound(prevVolume);
        showVolumeOverlay();
    } else {
        console.warn("GainNode not yet found, try pressing volume keys after the game loads.");
    }
}

document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.ctrlKey || e.metaKey) return;

    const key = e.key.toLowerCase();

    if (key === '-' || key === '_') {
        isMuted = false;
        changeVolume(-0.1);
    } else if (key === '+' || key === '=' || key === 'plus') {
        isMuted = false;
        changeVolume(0.1);
    } else if (key === 'm') {
        toggleMute();
    }
});

let lastEdgeSoundTime = 0;
const EDGE_SOUND_COOLDOWN = 130;

async function playVolumeSound(prevVolume) {
    const audioContext = getUIAudioContext();
    const now = Date.now();
    let soundUrl = null;

    const isAtMax = modVolume === 1;
    const isAtMin = modVolume === 0;
    const wasAtMax = prevVolume === 1;
    const wasAtMin = prevVolume === 0;

    const hittingEdgeAgain = (isAtMax && wasAtMax) || (isAtMin && wasAtMin);

    const wentUp = modVolume > prevVolume;
    const wentDown = modVolume < prevVolume;

    if (hittingEdgeAgain) {
        if (now - lastEdgeSoundTime < EDGE_SOUND_COOLDOWN) return;

        soundUrl = isAtMax ? ((Math.random() < 0.3) ? 'sound/volume/myfavorite.wav' : (traySoundMAX || defaultSNTVolMAX)) : (traySoundDown || defaultSNTVolDOWN);

        lastEdgeSoundTime = now;
    } else if (isAtMax && prevVolume < 1) {
        soundUrl = (Math.random() < 0.3) ? 'sound/volume/myfavorite.wav' : (traySoundMAX || defaultSNTVolMAX);
        lastEdgeSoundTime = now;
    } else if (isAtMin && prevVolume > 0) {
        soundUrl = traySoundDown || defaultSNTVolDOWN;
        lastEdgeSoundTime = now;
    } else if (wentDown) {
        soundUrl = traySoundDown || defaultSNTVolDOWN;
    } else if (wentUp) {
        soundUrl = traySoundUp || defaultSNTVolUP;
    }

    if (!soundUrl) return;

    try {
        const response = await fetch(soundUrl);
        const buffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(buffer);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;

        const gainNode = audioContext.createGain();
        gainNode.gain.value = modVolume;

        source.connect(gainNode).connect(audioContext.destination);
        source.start();
    } catch (err) {
        console.error("Failed to play volume sound:", err);
    }
}

function showVolumeOverlay() {
    let overlay = document.getElementById('mod-volume-overlay');

    const iconMute = 'img/volume/mute.svg';
    const iconVolume = 'img/volume/no-mute.svg';

    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'mod-volume-overlay';

        Object.assign(overlay.style, {
            position: 'fixed',
            top: '77px',
            left: '50%',
            transform: 'translateX(-50%) translateY(-20px)',
            zIndex: '9999',
            pointerEvents: 'none',
            opacity: '0',
            transition: 'opacity 0.25s ease, transform 0.25s ease',
            display: 'flex',
            justifyContent: 'center'
        });

        const box = document.createElement('div');
        box.id = 'mod-volume-box';

        Object.assign(box.style, {
            background: 'var(--col4)',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '12px',
            gap: '15px',
            minWidth: '180px',
            height: '60px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5)',
        });

        const iconImg = document.createElement('img');
        iconImg.id = 'mod-volume-icon-img';
        Object.assign(iconImg.style, {
            width: '42px',
            height: '42px',
            objectFit: 'contain'
        });

        const sliderTrack = document.createElement('div');
        sliderTrack.id = 'mod-volume-track';
        Object.assign(sliderTrack.style, {
            flexGrow: '1',
            height: '4px',
            left: '-10px',
            background: 'white',
            position: 'relative',
            borderRadius: '2px',
            transition: 'opacity 0.2s ease'
        });

        const sliderThumb = document.createElement('div');
        sliderThumb.id = 'mod-volume-thumb';
        Object.assign(sliderThumb.style, {
            width: '20px',
            height: '20px',
            background: 'white',
            borderRadius: '50%',
            position: 'absolute',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            transition: 'left 0.1s ease-out'
        });

        sliderTrack.appendChild(sliderThumb);
        box.appendChild(iconImg);
        box.appendChild(sliderTrack);
        overlay.appendChild(box);
        document.body.appendChild(overlay);
    }

    const iconImg = overlay.querySelector('#mod-volume-icon-img');
    const track = overlay.querySelector('#mod-volume-track');
    const thumb = overlay.querySelector('#mod-volume-thumb');

    if (modVolume <= 0) {
        iconImg.src = iconMute;
        track.style.visibility = 'hidden';
    } else {
        iconImg.src = iconVolume;
        track.style.visibility = 'visible';

        const percentage = Math.min(Math.max(modVolume * 100, 0), 100);
        thumb.style.left = `${percentage}%`;
        const opacityValue = 0.3 + (modVolume * 0.7);
        track.style.opacity = opacityValue;
    }

    overlay.style.display = 'flex';
    void overlay.offsetWidth;
    overlay.style.opacity = '1';
    overlay.style.transform = 'translateX(-50%) translateY(0)';

    clearTimeout(overlay._timeout);
    clearTimeout(overlay._hideTimeout);

    overlay._timeout = setTimeout(() => {
        overlay.style.opacity = '0';
        overlay.style.transform = 'translateX(-50%) translateY(20px)';

        overlay._hideTimeout = setTimeout(() => {
            overlay.style.display = 'none';
        }, 250);
    }, 1500);
}