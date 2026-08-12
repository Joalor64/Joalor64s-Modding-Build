async function injectSvgSprite(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const svgText = await response.text();

        const div = document.createElement("div");
        div.hidden = true;
        div.style.position = "absolute";
        div.innerHTML = svgText;

        document.body.insertBefore(div, document.body.firstChild);
    } catch (error) {
        console.warn("Could not inject icons sprite:", error);
    }
}