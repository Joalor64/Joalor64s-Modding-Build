/*
 * special-events.js
 * Falling snow on #snowCanvas during the "Winter" / "Christmas" special events
 * (the events themselves are detected by the engine, see getSpecialEventDetails()).
 */

const snowCanvas = document.getElementById("snowCanvas") || document.createElement("canvas");
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
