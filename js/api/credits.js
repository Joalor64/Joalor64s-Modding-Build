/*
 * credits.js
 * The mod credits popup (the button in the top-left corner), built from mod-credits/credits.xml,
 * or from asset-vX/credits.xml when PerVersionCredits is on (registerMod.js).
 *
 * <page title="..." text="..." image="..." noImage="true|false" pageStyle="0-3" />
 * Text formatting codes (inside text="..."):
 *   (!line)  (!hr)  (!bold/...)  (!underline/...)  (!italic/...)  (!color/#hex/...)  (!size/20px/...)
 *   (!emoji/file.png)  (!img/file.png)  (!youtube/link)  (!hyperlink/https://url/#hex/text)
 *   (!button/#hex/icon.png/https://url/text)  (!gradient/#hex/#hex/text)
 *   and a line starting with "- " becomes a bullet point.
 */

let hasOneCreditSlide = false;
let currentSlideCredits = 0;

/** Hides the arrows when there is only one page. */
function checkCreditsArrayThing() {
    const arrowPrev = document.querySelector(".modCreditsBox .prev");
    const arrowNext = document.querySelector(".modCreditsBox .next");
    if (arrowPrev && arrowNext) {
        const displayMode = hasOneCreditSlide ? "none" : "block";
        arrowPrev.style.display = displayMode;
        arrowNext.style.display = displayMode;
    }
}

/** Opens the mod credits popup. */
function OpenModCredits() {
    currentSlideCredits = 0;
    openMessagePopup(`
        <button class="prev" onclick="prevSlide()">❮</button>
        <button class="next" onclick="nextSlide()">❯</button>
        <div class="gallery-container">
            <div class="gallery-slider"></div>
        </div>
    `, "", null, () => {
        if (!document.querySelector(".gallery-slide")) loadCredits();
    });
    loadCredits();
}

/** Turns the (!code/...) formatting of credits.xml into HTML. */
function formatCreditsText(text) {
    const hex = "([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})";
    return (text || "")
        .replace(/\(\!line\)/g, "[[BR]]")
        .replace(/\(\!hr\)/g, "<hr>")
        .replace(/\(\!bold\/(.*?)\)/g, "<b>$1</b>")
        .replace(/\(\!underline\/(.*?)\)/g, "<u>$1</u>")
        .replace(/\(\!italic\/(.*?)\)/g, "<i>$1</i>")
        .replace(new RegExp(`\\(\\!color\\/#${hex}\\/(.*?)\\)`, "g"), '<span style="color:#$1;">$2</span>')
        .replace(/\(\!size\/(\d+px)\/(.*?)\)/g, '<span style="font-size:$1;">$2</span>')
        .replace(/\(\!emoji\/(.*?)\)/g, (m, name) => `<img src="mod-credits/emoji/${name}" class="credit-emoji">`)
        .replace(new RegExp(`\\(\\!button\\/#${hex}\\/(.*?)\\/(https?:\\/\\/[^\\s]+)\\/(.*?)\\)`, "g"),
            (m, bg, icon, url, txt) =>
                `<button class="credit-button" style="background-color:#${bg};" onclick="confirmNavigation('${url}')">` +
                `<div class="center"><img src="mod-credits/icons/${icon}" class="button-icon">` +
                `<span class="button-text">${txt}</span></div></button>`)
        .replace(/\(\!youtube\/(.*?)\)/g, (m, link) => {
            const id = (link.match(/(?:youtube\.com\/(?:.*v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/) || [])[1];
            return id
                ? `<iframe class="credit-video" src="https://www.youtube.com/embed/${id}" frameborder="0" allowfullscreen></iframe>`
                : '<span style="color:red">[Invalid YouTube Link]</span>';
        })
        .replace(/\(!hyperlink\/((?:https?:\/\/)[^\/\s]+(?:\/[^\s#]*)*)\/(?:#([0-9a-fA-F]{3,6})\/)?(.+?)\)/g, (m, url, col, txt) => {
            const colorAttrs = col ? ` style="color:#${col}" data-hover-opacity="true"` : "";
            return `<a href="#" class="credit-link"${colorAttrs} onclick="confirmNavigation('${url}')">${txt}</a>`;
        })
        .replace(/\(\!img\/(.*?)\)/g, '<img src="mod-credits/$1" class="credit-inline-image">')
        .replace(/(^|\[\[BR\]\])[ \t]*- /g, "$1• ")
        .replace(/\[\[BR\]\]/g, "<br>")
        .replace(new RegExp(`\\(\\!gradient\\/#${hex}\\/#${hex}\\/(.*?)\\)`, "g"),
            '<span class="gradient-text" style="--start:#$1; --end:#$2;">$3</span>');
}

function makeCreditsElement(tag, props = {}) {
    const node = document.createElement(tag);
    Object.assign(node, props);
    return node;
}

/**
 * pageStyle 0: image, title, text (default)
 * pageStyle 1/2: image + (title, text) wrapped together (for side-by-side layouts)
 * pageStyle 3: image only (title/text are hidden)
 */
function buildCreditsSlide(page) {
    const title = page.getAttribute("title") || "";
    const text = formatCreditsText(page.getAttribute("text"));
    const imgPath = page.getAttribute("image");
    const noImage = page.getAttribute("noImage") === "true";
    let pageStyle = parseInt(page.getAttribute("pageStyle")) || 0;
    if (pageStyle < 0 || pageStyle > 3) {
        pageStyle = 0;
    }

    const slide = makeCreditsElement("div", { className: "gallery-slide" });
    slide.setAttribute("data-page-style", pageStyle);

    if (!noImage) {
        const img = makeCreditsElement("img", { id: "credits-images", src: imgPath });
        img.onerror = () => { img.src = "img/nocrew.png"; };
        slide.appendChild(img);
    }

    const ttl = makeCreditsElement("div", { className: "title", innerHTML: title });
    const txtBox = makeCreditsElement("div", { id: "text-credits", innerHTML: text });

    if (pageStyle === 1 || pageStyle === 2) {
        const wrapper = makeCreditsElement("div", { className: "credits-content-wrapper" });
        wrapper.append(ttl, txtBox);
        slide.appendChild(wrapper);
    } else {
        if (pageStyle === 3) {
            ttl.style.display = "none";
            txtBox.style.display = "none";
        }
        slide.append(ttl, txtBox);
    }
    return slide;
}

async function loadCredits() {
    const slider = document.querySelector(".gallery-container .gallery-slider");
    if (!slider) return;

    const perVersionCreditsPath = `asset-v${getVersionFromURL()}/credits.xml`;
    const usePerVersion = PerVersionCredits
        && getHtmlName() === "app.html"
        && await fileExists(perVersionCreditsPath);
    const creditsPath = usePerVersion ? perVersionCreditsPath : "mod-credits/credits.xml";

    try {
        const response = await fetch(creditsPath);
        if (!response.ok) throw new Error("File missing");
        const xml = new DOMParser().parseFromString(await response.text(), "text/xml");
        const pages = xml.querySelectorAll("page");

        slider.innerHTML = "";
        slider.style.transform = "";
        hasOneCreditSlide = pages.length <= 1;
        checkCreditsArrayThing();
        pages.forEach(page => slider.appendChild(buildCreditsSlide(page)));
    } catch (e) {
        hasOneCreditSlide = true;
        checkCreditsArrayThing();

        const forVersion = (PerVersionCredits && getHtmlName() == "app.html") ? ` for version ${getVersionFromURL()}` : "";
        slider.innerHTML = `
            <div class="gallery-slide">
                <img src="img/nocrew.png" id="credits-images">
                <div class="title">ERROR</div>
                <div id="text-credits">"credits.xml" file missing${forVersion}!<br>Please make sure the file exists and is formatted correctly!</div>
            </div>
        `;
    }
}

function showSlide(index) {
    const slides = document.querySelectorAll(".gallery-slide");
    const slider = document.querySelector(".gallery-slider");
    if (!slider || !slides.length) return;
    currentSlideCredits = index >= slides.length ? 0 : index < 0 ? slides.length - 1 : index;
    slider.style.transform = `translateX(${-currentSlideCredits * 100}%)`;
}

function nextSlide() {
    showSlide(currentSlideCredits + 1);
}

function prevSlide() {
    showSlide(currentSlideCredits - 1);
}
