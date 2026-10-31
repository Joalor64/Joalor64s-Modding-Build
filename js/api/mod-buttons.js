/*
 * mod-buttons.js
 * Adds the custom round buttons listed in js/buttons.js (modBtList) to the menus.
 * Each entry: { id, icon, function, skipIndex, skipApp, version, position: "tl" | "tr" }
 */

function addModBt() {
    if (typeof modBtList === "undefined" || !Array.isArray(modBtList)) return;
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
