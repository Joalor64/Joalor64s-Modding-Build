function goBack() {
    let e = localStorage.getItem("lastPage");
    if (e) {
        window.location.href = e;
    } else {
        alert("No previous page found!");
    }
}
function displayMods() {
    indexedDB.open("ModLibraryDB", 2).onsuccess = function (e) {
        let o = e.target.result.transaction("modIcons", "readonly").objectStore("modIcons").getAll();
        o.onsuccess = function () {
            let e = o.result;
            let t = document.getElementById("library");
            t.innerHTML = "";
            let n = document.getElementById("mods-found");
            if (e.length === 0) {
                t.innerHTML = `<div id="lib_text-info">Open the version to load progress.</div>`;
                n.innerText = "No mods found!";
                return;
            }
            e.forEach(e => {
                let o = document.createElement("div");
                o.classList.add("mod-card");
                o.id = e.name;
                let n = document.createElement("div");
                n.classList.add("special-bg");
                n.style.backgroundImage = `url(${e.background})`;
                let d = e.lastPlayed && !isNaN(e.lastPlayed) ? getTimeAgo(Number(e.lastPlayed)) : "Never played";
                o.innerHTML = `
                    <img src="${e.icon}" class="mod-icon">
                    <div class="mod-info">
                        <h3>${e.name}</h3>
                        <p>Version: ${e.version}</p>
                        <p>By: ${e.developer}</p>
                        <br>
                        <div class="played-date">Last played: ${d}</div>
                    </div>
                    <div class="delete-button" onclick="confirmDeleteMod('${e.name}')">
                        <svg class="icn-svg">
                            <use xlink:href="#ic-trash"></use>
                        </svg>
                    </div>
                `;
                o.appendChild(n);
                t.appendChild(o);
                countMods();
            });
        };
    };
}
function deleteMod(e) {
    indexedDB.open("ModLibraryDB", 2).onsuccess = function (o) {
        o.target.result.transaction("modIcons", "readwrite").objectStore("modIcons").delete(e);
        const card = document.getElementById(e);
        if (card) {
            card.remove();
        }
        countMods();
    };
}
let pendingDeleteModName = null;
function confirmDeleteMod(e) {
    pendingDeleteModName = e;
    const text = document.getElementById("popup-delete-text");
    if (text) {
        text.innerText = `Do you really want to delete "${e}" from your library?`;
    }
    const popup = document.getElementById("popup-delete-mod");
    if (popup) {
        popup.classList.add("show");
        const box = popup.querySelector(".box");
        if (box) {
            box.classList.remove("close");
            box.classList.add("open");
        }
        const bac = popup.querySelector(".bac");
        if (bac) {
            bac.classList.add("animateFadeIn");
        }
    }
}
function closeDeletePopup() {
    const popup = document.getElementById("popup-delete-mod");
    if (!popup) {
        return;
    }
    const box = popup.querySelector(".box");
    const bac = popup.querySelector(".bac");
    if (box) {
        box.classList.remove("open");
        box.classList.add("close");
        box.addEventListener("animationend", function handler() {
            box.removeEventListener("animationend", handler);
            popup.classList.remove("show");
            box.classList.remove("close");
            if (bac) {
                bac.classList.remove("animateFadeIn", "animateFadeOut");
            }
        }, { once: true });
    } else {
        popup.classList.remove("show");
        if (bac) {
            bac.classList.remove("animateFadeIn", "animateFadeOut");
        }
    }
}
function deleteModConfirmed() {
    if (pendingDeleteModName) {
        deleteMod(pendingDeleteModName);
        pendingDeleteModName = null;
    }
    closeDeletePopup();
}
function countMods() {
    let e = document.querySelectorAll(".mod-card").length;
    let o = document.getElementById("mods-found");
    if (o) {
        o.innerHTML = `Mods found: ${e}`;
    }
}
function getTimeAgo(e) {
    if (!e || isNaN(e)) {
        return "Never played";
    }
    let o = Date.now() - e;
    let t = Math.floor(o / 1000);
    let n = Math.floor(t / 60);
    let d = Math.floor(n / 60);
    let a = Math.floor(d / 24);
    let s = Math.floor(a / 7);
    let l = Math.floor(a / 30);
    let r = Math.floor(a / 365);
    if (r > 0) {
        if (r === 1) {
            return "1 year ago";
        } else {
            return `${r} years ago`;
        }
    } else if (l > 0) {
        if (l === 1) {
            return "1 month ago";
        } else {
            return `${l} months ago`;
        }
    } else if (s > 0) {
        if (s === 1) {
            return "1 week ago";
        } else {
            return `${s} weeks ago`;
        }
    } else if (a > 0) {
        if (a === 1) {
            return "1 day ago";
        } else {
            return `${a} days ago`;
        }
    } else if (d > 0) {
        if (d === 1) {
            return "1 hour ago";
        } else {
            return `${d} hours ago`;
        }
    } else if (n > 0) {
        if (n === 1) {
            return "1 minute ago";
        } else {
            return `${n} minutes ago`;
        }
    } else {
        return "Just now";
    }
}
document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("page-zoom");
    if (localStorage.getItem("param-dark") === "true") {
        document.body.classList.add("darkmode");
        console.log("Dark mode enabled");
    } else {
        console.log("Dark mode disabled");
    }
    document.body.classList.add("page-zoom");
    injectSvgSprite("../../img/icons.svg");

    const cancelBtn = document.getElementById("popup-delete-cancel");
    const confirmBtn = document.getElementById("popup-delete-confirm");
    const popup = document.getElementById("popup-delete-mod");
    if (cancelBtn) {
        cancelBtn.addEventListener("click", closeDeletePopup);
    }
    if (popup) {
        const background = popup.querySelector(".bac");
        if (background) {
            background.addEventListener("click", closeDeletePopup);
        }
    }
    if (confirmBtn) {
        confirmBtn.addEventListener("click", deleteModConfirmed);
    }
    if (popup) {
        popup.addEventListener("click", (event) => {
            if (event.target === popup) {
                closeDeletePopup();
            }
        });
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && popup.classList.contains("show")) {
                closeDeletePopup();
            }
        });
    }

    displayMods();
});