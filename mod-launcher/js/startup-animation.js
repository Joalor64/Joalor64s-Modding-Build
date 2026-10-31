/*
 * mod-launcher/js/startup-animation.js
 * Plays a mod's startup animation (mod.json "startupAnim": a Sparrow/TextureAtlas XML + its image) on its card.
 */

function getFramesFromXML(xmlDoc) {
    const atlas = xmlDoc.querySelector("TextureAtlas");
    if (!atlas) throw new Error("Invalid animation XML: No TextureAtlas found");
    return [...atlas.querySelectorAll("SubTexture")].map(tex => ({
        name: tex.getAttribute("name"),
        x: parseInt(tex.getAttribute("x")) || 0,
        y: parseInt(tex.getAttribute("y")) || 0,
        width: parseInt(tex.getAttribute("width")) || 0,
        height: parseInt(tex.getAttribute("height")) || 0
    })).sort((a, b) => {
        const na = parseInt(a.name.match(/\d+$/)?.[0] || "0");
        const nb = parseInt(b.name.match(/\d+$/)?.[0] || "0");
        return na - nb;
    });
}

/**
 * @param xmlUrl  URL of the atlas XML
 * @param baseUrl URL of the mod folder (ends with "/")
 * The atlas image is looked up next to the XML first (the usual Sparrow layout), then in the mod folder.
 */
async function playStartupAnimation(xmlUrl, baseUrl, cardEl) {
    console.log("[StartupAnim] Starting...", xmlUrl);
    const res = await fetch(xmlUrl);
    if (!res.ok) throw new Error("Failed to load animation XML");

    const xmlDoc = new DOMParser().parseFromString(await res.text(), "text/xml");
    const frames = getFramesFromXML(xmlDoc);
    if (!frames.length) throw new Error("Invalid animation XML: no SubTexture frames");
    const imagePath = xmlDoc.querySelector("TextureAtlas").getAttribute("imagePath");
    if (!imagePath) throw new Error("Invalid animation XML: TextureAtlas has no imagePath");

    const candidates = [...new Set([new URL(imagePath, xmlUrl).href, new URL(imagePath, baseUrl).href])];
    let img = null;
    for (const src of candidates) {
        const attempt = new Image();
        attempt.src = src;
        try {
            await attempt.decode();
            img = attempt;
            break;
        } catch (e) { /* try the next location */ }
    }
    if (!img) throw new Error(`Could not load animation image "${imagePath}"`);

    const rect = cardEl.getBoundingClientRect();
    const canvas = document.createElement("canvas");
    canvas.className = "mod-startup-canvas";
    canvas.width = rect.width;
    canvas.height = rect.height;

    const bg = cardEl.querySelector(".mod-card-bg");
    bg.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    const fps = 24;
    const frameDuration = 1000 / fps;
    const startTime = performance.now();

    return new Promise(resolve => {
        let lastFrame = -1;
        function animate(now) {
            const raw = Math.floor((now - startTime) / frameDuration);
            const idx = Math.min(raw, frames.length - 1);
            if (idx === lastFrame) { requestAnimationFrame(animate); return; }
            lastFrame = idx;

            const f = frames[idx];
            if (!f) { canvas.remove(); resolve(); return; }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const scale = Math.min(canvas.width / f.width, canvas.height / f.height);
            const dw = f.width * scale, dh = f.height * scale;
            const dx = (canvas.width - dw) / 2, dy = (canvas.height - dh) / 2;
            ctx.drawImage(img, f.x, f.y, f.width, f.height, dx, dy, dw, dh);

            if (idx === frames.length - 1) { resolve({ canvas, ctx }); return; }
            requestAnimationFrame(animate);
        }
        requestAnimationFrame(animate);
    });
}
