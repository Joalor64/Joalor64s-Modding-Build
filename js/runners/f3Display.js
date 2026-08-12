// F3 Debug Overlay (Originally by Rizsim Studios)
let f3Enabled = localStorage.getItem("f3OverlayEnabled") === "true";
let f3Overlay;
let f3TextContainer;
let rememberFPS = true;

const frameHistory = [];
const maxHistory = 40;

function createF3Overlay() {
    f3Overlay = document.createElement("div");
    f3Overlay.id = "f3-overlay";

    let baseStyle = `
        position: fixed;
        top: 0;
        left: 0;
        background: rgba(0, 0, 0, 0.75);
        color: #00ff9f;
        font-family: monospace;
        font-size: 13px;
        line-height: 1.4em;
        padding: 8px 12px;
        border-radius: 0 0 8px 0;
        z-index: 99999;
        white-space: pre-wrap;
        pointer-events: none;
        max-width: 380px;
    `;

    if (window.innerWidth <= 550) {
        baseStyle += `
            font-size: 11px;
            padding: 6px 8px;
            max-width: 90vw;
            border-radius: 0 0 6px 0;
            line-height: 1.3em;
            color: #00e695;
            backdrop-filter: blur(4px);
            background: rgba(0, 0, 0, 0.65);
        `;
    }

    f3Overlay.style = baseStyle;
    f3TextContainer = document.createElement("div");
    f3Overlay.appendChild(f3TextContainer);

    if (window.innerWidth <= 550) {
        const mobileTag = document.createElement("div");
        mobileTag.textContent = "F3 MODE";
        mobileTag.style = `
            position: absolute;
            top: 4px;
            right: 8px;
            font-size: 10px;
            color: #999;
            opacity: 0.5;
        `;
        f3Overlay.appendChild(mobileTag);
    }

    const graphContainer = document.createElement("div");
    graphContainer.id = "f3-graph";
    graphContainer.style = `
        display: flex;
        align-items: flex-end;
        height: 35px;
        margin-top: 8px;
        border-top: 1px dashed rgba(255,255,255,0.2);
        padding-top: 4px;
        gap: 2px;
    `;
    f3Overlay.appendChild(graphContainer);

    document.body.appendChild(f3Overlay);
}

function updateF3Overlay() {
    if (!f3Enabled || !f3Overlay) return;

    const now = performance.now();

    if (updateF3Overlay.last === undefined) {
        updateF3Overlay.last = now;
        updateF3Overlay.lastTextUpdate = now;
        updateF3Overlay.maxDetectedFPS = 60;
        requestAnimationFrame(updateF3Overlay);
        return;
    }

    const delta = now - updateF3Overlay.last;
    updateF3Overlay.last = now;

    const instantFPS = delta > 0 ? 1000 / delta : 0;

    if (instantFPS > updateF3Overlay.maxDetectedFPS && instantFPS < 365) {
        updateF3Overlay.maxDetectedFPS = Math.max(updateF3Overlay.maxDetectedFPS, Math.round(instantFPS));
    }

    frameHistory.push(instantFPS);
    if (frameHistory.length > maxHistory) frameHistory.shift();

    const alpha = 0.1;
    if (updateF3Overlay.smoothedFPS === undefined) updateF3Overlay.smoothedFPS = instantFPS;
    updateF3Overlay.smoothedFPS = updateF3Overlay.smoothedFPS * (1 - alpha) + instantFPS * alpha;

    if (now - updateF3Overlay.lastTextUpdate >= 300) {
        updateF3Overlay.lastTextUpdate = now;

        const fps = Math.round(updateF3Overlay.smoothedFPS);
        const frameTimeMs = delta.toFixed(1);

        let fpsColor = "#00ff9f";
        if (fps < 30) {
            fpsColor = "#ff3b3b";
        } else if (fps < 52) {
            fpsColor = "#ffdd00";
        }

        const onAppPage = window.location.pathname.includes("app.html");
        const screenW = window.innerWidth;
        const screenH = window.innerHeight;

        const buildInfo = [`Debug Mode`];

        if (onAppPage) {
            buildInfo.push(`Version: V${appVersion} (${app.name})`, ``);
        }

        buildInfo.push(
            `[PERFORMANCE]`,
            `Game FPS: ${fps} FPS`,
            `Refresh Rate: ${updateF3Overlay.maxDetectedFPS} Hz`,
            `Frame Time: ${frameTimeMs} ms`,
            ``,
            `[SCREEN INFO]`,
            `Width × Height: ${screenW} × ${screenH}`,
            ``
        );

        if (onAppPage) {
            buildInfo.push(
                `[LOADED FILES]`,
                `tabAnime Count: ${tabAnime?.length ?? "N/A"}`,
                ``
            );
        }

        if (f3TextContainer) {
            f3TextContainer.textContent = buildInfo.join("\n");
        }
        f3Overlay.style.color = fpsColor;
    }

    const graphContainer = f3Overlay.querySelector("#f3-graph");
    if (graphContainer) {
        graphContainer.innerHTML = "";
        frameHistory.forEach(f => {
            const bar = document.createElement("div");
            const heightPercent = Math.min((f / updateF3Overlay.maxDetectedFPS) * 100, 100);

            let barColor = "#00ff9f";
            if (f < 30) barColor = "#ff3b3b";
            else if (f < 52) barColor = "#ffdd00";

            bar.style = `
                flex: 1;
                height: ${heightPercent}%;
                background: ${barColor};
                opacity: 0.7;
            `;
            graphContainer.appendChild(bar);
        });
    }

    requestAnimationFrame(updateF3Overlay);
}

function removeF3Overlay() {
    if (f3Overlay) {
        f3Overlay.remove();
        f3Overlay = null;
        f3TextContainer = null;
    }
}

document.addEventListener("keydown", (e) => {
    if (e.key === "F3") {
        e.preventDefault();

        f3Enabled = !f3Enabled;
        localStorage.setItem("f3OverlayEnabled", f3Enabled);

        if (f3Enabled) {
            if (!f3Overlay) createF3Overlay();
            updateF3Overlay();
        } else {
            removeF3Overlay();
        }
    }
});

if (f3Enabled && rememberFPS) {
    window.addEventListener("DOMContentLoaded", () => {
        createF3Overlay();
        updateF3Overlay();
    });
}