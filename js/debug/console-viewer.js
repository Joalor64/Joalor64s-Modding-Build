/*
 * debug/console-viewer.js
 * Set showConsole to true to get an on-screen console (useful on mobile, where there are no dev tools).
 */

let showConsole = false;

if (showConsole) {
    const viewerScript = document.createElement("script");
    viewerScript.src = "https://joalor64.github.io/console-log-viewer/console-log-viewer.js";
    document.head.appendChild(viewerScript);
}