/*
 * version-select.js
 * The version icons on the menu (and in the "switch version" popup), built from data/versions.xml.
 * See the comment at the top of data/versions.xml for every supported attribute.
 *
 * Mod hooks (define these functions in mod.js if you want them):
 *   onIconSelect<ID>() / onIconSelect()   - a version icon was clicked
 *   onLockedIcon<ID>() / onLockedIcon()   - a locked version icon was clicked
 *   onBoxVersionClicked<V>() / onImgVersionClicked<V>() / onBoxTitleClicked<V>() / onImgTitreClicked<V>()
 *                                         - the version/title image on the home screen of version V was clicked
 * API: Hide(id), unHide(id), unLock(id)
 */

window.versionCustomIcons = {};
let singleVersionMod = false;

/** Calls window[name]() if the mod defined it. */
function callModHook(name) {
    if (typeof window[name] === "function") {
        window[name]();
        return true;
    }
    return false;
}

function buildVersionIcon(iconXml, index, cssVars) {
    const id = iconXml.getAttribute("ID");
    const color = iconXml.getAttribute("color") || "#666";
    const checkColor = iconXml.getAttribute("check") || color;
    const radius = iconXml.getAttribute("radius");
    const name = iconXml.getAttribute("name");
    const customIcon = iconXml.getAttribute("customIcon");
    const customImageTxt = iconXml.getAttribute("customImageTxt");
    const locked = iconXml.getAttribute("locked") === "true";
    const ignored = iconXml.getAttribute("ignored") === "true";
    const customName = iconXml.getAttribute("customName") === "true";
    const hidden = iconXml.getAttribute("hidden") === "true";
    const tweenUpDelay = iconXml.getAttribute("tweenUpDelay");
    const isSpecial = iconXml.getAttribute("isSpecial") === "true";

    const icon = document.createElement("div");
    icon.classList.add("vicon");
    icon.id = "icon" + id;
    icon.dataset.name = name;
    icon.dataset.color = color;
    icon.dataset.check = checkColor;
    icon.dataset.locked = String(locked);
    icon.dataset.isSpecial = isSpecial;

    let picture;
    if (customIcon) {
        picture = document.createElement("img");
        picture.id = "customicon";
        picture.src = customIcon;
        picture.alt = name;
        window.versionCustomIcons[id] = customIcon;
    } else {
        picture = document.createElement("div");
        picture.classList.add("img");
    }
    picture.style.borderRadius = radius || "25%";
    icon.appendChild(picture);

    if (customName) {
        icon.insertAdjacentHTML("beforeend", `<div id="customIconName" style="color: ${color};">${name}</div>`);
    } else if (customImageTxt) {
        icon.insertAdjacentHTML("beforeend", `<div class="txtCustom" style="background-image:url('${customImageTxt}')"></div>`);
    } else {
        icon.insertAdjacentHTML("beforeend", `<div class="txt"></div>`);
    }

    if (ignored) {
        icon.classList.add("ignored");
    }

    icon.insertAdjacentHTML("beforeend", `
        <div class="bul">
            <svg class="icn-svg"><use xlink:href="${locked ? "#ic-lock" : "#ic-check"}"></use></svg>
        </div>
    `);
    const bul = icon.querySelector(".bul");
    bul.style.backgroundColor = checkColor;
    bul.style.color = "#ffffff";
    const svg = bul.querySelector("svg");
    svg.style.fill = "#ffffff";
    svg.style.color = "#ffffff";

    let element = icon;
    if (locked) {
        icon.classList.add("locked");
        element = document.createElement("div");
        element.classList.add("locked-vicon");
        element.appendChild(icon);
        element.addEventListener("click", e => {
            e.preventDefault();
            callModHook(`onLockedIcon${id}`);
            callModHook("onLockedIcon");
            document.querySelectorAll(".vicon[data-locked=\"true\"]").forEach(v => v.classList.remove("open", "clicked"));
        });
    }

    if (hidden) {
        icon.style.display = "none";
    }

    icon.addEventListener("click", () => {
        callModHook(`onIconSelect${id}`);
        callModHook("onIconSelect");
    });

    const hasCustomDelay = tweenUpDelay !== null && tweenUpDelay.trim() !== "" && !isNaN(tweenUpDelay);
    const delay = hasCustomDelay
        ? Number(parseFloat(tweenUpDelay).toFixed(2))
        : Number((0.15 + index * 0.05).toFixed(2));
    icon.dataset.tweenDelay = delay;
    icon.dataset.tweenSource = hasCustomDelay ? "xml" : "auto";
    icon.style.setProperty("--tween-delay", `${delay}s`);

    cssVars[`colV${id}`] = color;
    cssVars[`colV${id}-check`] = checkColor;

    return element;
}

fetch("data/versions.xml").then(r => r.text()).then(text => {
    const lines = new DOMParser().parseFromString(text, "text/xml").getElementsByTagName("line");
    const container = document.getElementById("sp-select");
    if (!container) return;

    const cssVars = {};
    let index = 0;
    for (const lineXml of lines) {
        const line = document.createElement("div");
        line.classList.add("sp-line");
        container.appendChild(line);
        for (const iconXml of lineXml.getElementsByTagName("icon")) {
            line.appendChild(buildVersionIcon(iconXml, index++, cssVars));
        }
    }

    const style = document.createElement("style");
    style.innerHTML = `:root {\n${Object.entries(cssVars).map(([k, v]) => `--${k}: ${v};`).join("\n")}\n}`;
    document.head.appendChild(style);

    const stored = JSON.parse(localStorage.getItem("iconColors") || "{}");
    localStorage.setItem("iconColors", JSON.stringify(Object.assign(stored, cssVars)));
    applyStoredColors();
    updateSwitchButtonState();
});

/** Applies the version colors saved by the last versions.xml load (so they exist before it loads again). */
function applyStoredColors() {
    let colors = null;
    try {
        colors = JSON.parse(localStorage.getItem("iconColors"));
    } catch (e) { }
    if (colors) {
        for (const name in colors) {
            document.documentElement.style.setProperty(`--${name}`, colors[name]);
        }
    }
}

/** Unlocks a locked version icon (it becomes clickable). */
function unLock(id) {
    const icon = document.getElementById(`icon${id}`);
    if (!icon || icon.dataset.locked !== "true") return;

    icon.classList.remove("locked", "iconTweenUp");
    icon.style.opacity = "1";
    icon.dataset.locked = "false";

    icon.querySelector(".bul")?.remove();
    const newBul = document.createElement("div");
    newBul.className = "bul";
    newBul.innerHTML = `<svg class="icn-svg"><use xlink:href="#ic-check"></use></svg>`;
    newBul.style.backgroundColor = icon.dataset.check;
    icon.appendChild(newBul);

    const wrapper = icon.closest(".locked-vicon");
    const spLine = icon.closest(".sp-line");
    if (!spLine) return;

    const nextHigher = [...spLine.children].find(node => {
        const other = node.classList.contains("locked-vicon") ? node.querySelector(".vicon") : node;
        return other && other !== icon && other.id.startsWith("icon") && parseInt(other.id.replace("icon", ""), 10) > id;
    });
    spLine.insertBefore(icon, nextHigher || null);
    if (wrapper && !wrapper.children.length) wrapper.remove();
}

/** Shows a hidden version icon again. */
function unHide(id) {
    const icon = document.getElementById(`icon${id}`);
    if (!icon) {
        return false;
    }
    icon.style.removeProperty("display");
    icon.style.display = "block";
    icon.dataset.hidden = "false";
    logDebug(`unhid icon${id}`);
    updateSwitchButtonState();
    return true;
}

/** Hides a version icon. */
function Hide(id) {
    const icon = document.getElementById(`icon${id}`);
    if (!icon) {
        return false;
    }
    icon.style.display = "none";
    icon.dataset.hidden = "true";
    updateSwitchButtonState();
    return true;
}

/** With only one visible version, the "switch" button becomes an "about this mod" button. */
function updateSwitchButtonState() {
    const visible = Array.from(document.querySelectorAll(".vicon[id^=\"icon\"]"))
        .filter(icon => window.getComputedStyle(icon).display !== "none");
    singleVersionMod = visible.length === 1;

    const use = document.querySelector("#home-bt-switch use");
    if (use) {
        use.setAttribute("xlink:href", singleVersionMod ? "#ic-rate" : "#ic-switch");
    }

    const switchBt = document.getElementById("bt-switch");
    if (switchBt && singleVersionMod && document.querySelectorAll("#sp-select .vicon").length <= 1) {
        switchBt.remove();
    }
}

/** What the home screen "switch" button does (the engine calls this on press). */
function clickHomeBtSwitch() {
    if (singleVersionMod) {
        openAboutPop();
    } else {
        popupSwitch();
    }
}

/** Debug helper kept for older mods. */
window.checkAllIcons = function () {
    return "Icon check complete";
};

document.addEventListener("click", e => {
    const target = e.target.closest("#box-version, #img-version, #box-title, #img-titre");
    if (!target) return;
    const hookName = target.id.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join("");
    callModHook(`on${hookName}Clicked${appVersion}`);
});
