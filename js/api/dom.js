/*
 * dom.js
 * DOM / UI helpers: elements, clicks, popups, dialogs, navigation, favicon.
 */

/** Removes the element with this id (if it exists). */
function RemoveElement(id) {
    document.getElementById(id)?.remove();
}

/** Appends `<tag id="id">html</tag>` to the body, unless an element with that id already exists. */
function CreateElement(id, tag = "div", html = "") {
    if (document.getElementById(id)) {
        return;
    }
    const el = document.createElement(tag);
    el.id = id;
    el.innerHTML = html;
    document.body.appendChild(el);
}

/** Runs `callback` when the element with this id is clicked. */
function OnClick(elementID, callback) {
    const element = document.getElementById(elementID);
    if (element && typeof callback === "function") {
        element.addEventListener("click", callback);
    }
}

/** Same as OnClick, but takes any CSS selector (first match only). */
function OnClickElement(selector, callback) {
    const element = document.querySelector(selector);
    if (element && typeof callback === "function") {
        element.addEventListener("click", callback);
    }
}

/** Opens version `version` (app.html?v=version). */
function goto(version) {
    window.location.href = `app.html?v=${version}`;
}

/** Replaces the "Select a version..." menu title. */
function ChangeMenuTitle(text) {
    setTimeout(() => {
        const title = document.querySelector(".container .title");
        const choose = document.getElementById("sp-choose");
        if (title) title.textContent = text;
        if (choose) choose.textContent = text;
    }, 200);
}

/** Moves the element with class `className` horizontally by `offset` px (relative to where it is now). */
function moveXof(className, offset) {
    const el = document.querySelector(`.${className}`);
    if (el) {
        const x = new WebKitCSSMatrix(getComputedStyle(el).transform).m41 + offset;
        el.style.transform = `translateX(${x}px)`;
    }
}

function toggleDarkMode() {
    document.body.classList.toggle("darkmode");
}

/** Restarts a CSS animation on every element matching `selector`. */
function playAnimation(selector, style) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
        el.style.animation = 'none';
        void el.offsetWidth;
        el.style.animation = style;
    });
}

/**
 * Opens the big popup (boxPopup) with arbitrary HTML and a working close button.
 * Used by the mod credits, the "new mods" news, update notices, etc.
 * `onClose` runs when the close button is pressed, `onOpen` once the popup finished opening.
 */
function openMessagePopup(content, extraClass = "", onClose, onOpen) {
    boxPopup.open({
        name: "popup-message",
        icntype: "action",
        bodyclose: true,
        class: ("modCreditsBox " + extraClass).trim(),
        content: content,
        onBoxOpenEnd: function () {
            if (onOpen) onOpen();
            boxPopup.$popup.find(".icon.bt.bt-round.bt-44").on("click", () => {
                boxPopup.close();
                if (onClose) onClose();
            });
        },
        onBoxCloseStart: function () {
            boxPopup.$popup.find(".icon.bt.bt-round.bt-44").off();
        }
    });
}

/** Opens a popup with your own HTML. Pass "big" as `size` for the large layout. */
function customPopup(popupName, htmlContent, size) {
    boxPopup.open({
        name: popupName,
        icntype: "action",
        bodyclose: true,
        class: size == "big" ? "big column" : "",
        content: htmlContent,
        onBoxOpenEnd: function () {
            boxPopup.$icon.on(pointerEventType.down, boxPopup.close);
        },
        onBoxCloseStart: function () {
            boxPopup.$icon.off();
        }
    });
}

/** Small dialog with a "Got it" button. */
function customInfo(text, title) {
    boxDialog.open(text, (title || ""), [STR("bt.gotit")], []);
}

/** Asks for confirmation before opening an external link. */
function confirmNavigation(url) {
    boxDialog.open(
        STR("extra.pop.externalLinkConfirm").replace("%{url}", url),
        STR("extra.pop.externalLinkNotice"),
        [STR("bt.sure"), STR("bt.cancel")],
        [() => openURL(url), () => boxDialog.close()]
    );
}

/** Opens a link in a new window/the default browser, without confirmation. */
function openExternal(url) {
    openURL(url, "_blank");
}

/** Debug: lists every global whose name contains `text`. */
function findInScript(text) {
    let html = "";
    for (const name in window) {
        if (name.toLowerCase().includes(text)) {
            html += `<p>${name}: ${escapeHTML(String(window[name]))}</p>`;
        }
    }
    openMessagePopup(`<div class="info-debug">${html}</div>`);
}

/** Opens the Mixlist tab of the playlist popup. */
function updateMixPlayListTab() {
    document.getElementById("tab-mixlist")?.classList.add("active");
    document.getElementById("box-mixlist")?.classList.add("show");
    activeFilter("bt-mymix");
}

/** onerror handler for bonus icons: swaps the broken <img> for the default bonus SVG. */
function handleMissingIcon(img) {
    const parent = img.parentElement;
    img.remove();
    const holder = document.createElement("div");
    holder.innerHTML = defaultBonusSVG.trim();
    const svg = holder.querySelector("svg");
    if (svg && parent) {
        svg.style.height = "40px";
        svg.style.borderRadius = "3px";
        svg.style.verticalAlign = "-13px";
        parent.innerHTML = "";
        parent.appendChild(svg);
    }
}

function changeFavicon(src) {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
    }
    link.href = src;
}

/** On app.html uses `primarySrc` if it loads, else `fallbackSrc`, else the default favicon. */
function setFaviconSmart(primarySrc, fallbackSrc) {
    if (getHtmlName() != "app.html") {
        changeFavicon("favicon.png");
        return;
    }
    const img = new Image();
    img.onload = () => changeFavicon(primarySrc);
    img.onerror = () => changeFavicon(fallbackSrc || "favicon.png");
    img.src = primarySrc;
}
