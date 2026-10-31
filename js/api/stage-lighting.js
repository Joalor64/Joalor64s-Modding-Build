/*
 * stage-lighting.js
 * A colored "spotlight" on the polos, done with an SVG lighting filter on #cnv-stage.
 *
 *   setStageLighting({ color: "#ff0000", transition: 500 });   // turn on / change color
 *   setStageLighting({ enabled: false });                       // turn off
 *
 * Options: color, transition (ms), blur, intensity, exponent, constant, x ("center" or px), y, z
 */

const stageLighting = {
    container: null,
    lighting: null,
    pointLight: null,
    blur: null,
    x: "center",

    currentColor: "#ffffff",
    animationFrame: null
};

function initStageLighting() {
    if (stageLighting.container) return;

    const div = document.createElement("div");
    div.innerHTML = `
        <svg style="position:absolute;width:0;height:0;pointer-events:none;">
            <filter id="stage-lighting" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur id="stage-lighting-blur" in="SourceAlpha" stdDeviation="2" result="blur" />
                <feSpecularLighting id="stage-lighting-specular" in="blur" surfaceScale="3" specularConstant="1"
                    specularExponent="15" lighting-color="#ffffff" result="light">
                    <fePointLight id="stage-lighting-point" x="0" y="-150" z="180" />
                </feSpecularLighting>
                <feComposite in="light" in2="SourceAlpha" operator="in" result="litAlpha" />
                <feBlend in="SourceGraphic" in2="litAlpha" mode="screen" />
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
        if (stage.dataset.lightingApplied) {
            stage.style.filter = stage.style.filter.replace("url(\"#stage-lighting\")", "").replace("url(#stage-lighting)", "").trim();
            delete stage.dataset.lightingApplied;
        }
        return;
    }

    if (!stage.dataset.lightingApplied) {
        const currentFilters = getComputedStyle(stage).filter;
        if (currentFilters && currentFilters !== "none") {
            const cleanFilters = currentFilters.replace(/url\([^)]+\)/g, "").trim();
            stage.style.filter = `url(#stage-lighting) ${cleanFilters}`;
        } else {
            stage.style.filter = "url(#stage-lighting)";
        }
        stage.dataset.lightingApplied = "true";
    }

    stageLighting.blur.setAttribute("stdDeviation", blur);
    stageLighting.lighting.setAttribute("surfaceScale", intensity);
    stageLighting.lighting.setAttribute("specularExponent", exponent);
    stageLighting.lighting.setAttribute("specularConstant", constant);

    stageLighting.x = x;
    const rect = stage.getBoundingClientRect();
    stageLighting.pointLight.setAttribute("x", x === "center" ? rect.width / 2 : x);
    stageLighting.pointLight.setAttribute("y", y);
    stageLighting.pointLight.setAttribute("z", z);

    updateLightingColor(color, transition);
}

/** Fades the light color to `targetColor` over `duration` ms. */
function updateLightingColor(targetColor, duration = 0) {
    const lighting = stageLighting.lighting;
    if (!lighting) return;

    if (stageLighting.animationFrame) {
        cancelAnimationFrame(stageLighting.animationFrame);
        stageLighting.animationFrame = null;
    }

    const start = hexToRgb(stageLighting.currentColor) || parseRgbString(stageLighting.currentColor);
    const end = hexToRgb(targetColor);

    if (duration <= 0 || stageLighting.currentColor === targetColor || !start || !end) {
        lighting.setAttribute("lighting-color", targetColor);
        stageLighting.currentColor = targetColor;
        return;
    }

    const startTime = performance.now();
    function animate(now) {
        const t = Math.min((now - startTime) / duration, 1);
        const r = Math.round(start.r + (end.r - start.r) * t);
        const g = Math.round(start.g + (end.g - start.g) * t);
        const b = Math.round(start.b + (end.b - start.b) * t);
        const rgb = `rgb(${r},${g},${b})`;

        lighting.setAttribute("lighting-color", rgb);
        stageLighting.currentColor = t < 1 ? rgb : targetColor;

        if (t < 1) {
            stageLighting.animationFrame = requestAnimationFrame(animate);
        } else {
            stageLighting.animationFrame = null;
        }
    }
    stageLighting.animationFrame = requestAnimationFrame(animate);
}

function parseRgbString(value) {
    const m = /^rgb\((\d+),(\d+),(\d+)\)$/.exec(String(value).replace(/\s/g, ""));
    return m ? { r: +m[1], g: +m[2], b: +m[3] } : null;
}

window.addEventListener("resize", () => {
    const stage = document.getElementById("cnv-stage");
    if (!stage || !stageLighting.pointLight || stageLighting.x !== "center") return;
    stageLighting.pointLight.setAttribute("x", stage.getBoundingClientRect().width / 2);
});
