function setAchievement(e, t, n, i, s, o, c) {
    setTimeout(() => {
        let a = JSON.parse(localStorage.getItem(`achievements_${e}`)) || {};
        if (!a[t]) {
            a[t] = {
                status: "locked",
                icon: n,
                name: i,
                description: s,
                type: o,
                progress: 0,
                maxProgress: c
            };
        }
        localStorage.setItem(`achievements_${e}`, JSON.stringify(a));
        preloadAchievementIcons(e);
    }, 400);
}
function addProgressAchievement(e, t, n) {
    let i = JSON.parse(localStorage.getItem(`achievements_${e}`)) || {};
    if (i[t]) {
        if (i[t].status === "unlocked") {
            return;
        }
        let s = i[t].maxProgress;
        if (s === undefined) {
            return;
        }
        i[t].progress += n;
        if (i[t].progress >= s) {
            i[t].progress = s;
            i[t].status = "unlocked";
        }
        localStorage.setItem(`achievements_${e}`, JSON.stringify(i));
        updateProgressUI(t, i[t].progress, s);
    }
}
function updateProgressUI(e, t, n) {
    document.querySelectorAll(".achievement").forEach(i => {
        let s = i.querySelector(".title");
        if (s && s.textContent.includes(e)) {
            let e = i.querySelector("progress");
            if (e) {
                e.value = t;
                e.max = n;
            }
        }
    });
}
function addProgressAchievement(e, t, n) {
    let i = JSON.parse(localStorage.getItem(`achievements_${e}`)) || {};
    if (i[t]) {
        if (i[t].status === "unlocked") {
            return;
        }
        let s = i[t];
        let o = s.maxProgress;
        if (o === undefined) {
            return;
        }
        s.progress += n;
        if (s.progress >= o) {
            s.progress = o;
            s.status = "unlocked";
            showAchievementNotification(s.name, s.icon, s.description);
        }
        localStorage.setItem(`achievements_${e}`, JSON.stringify(i));
        document.querySelectorAll(".achievement-info progress").forEach(e => {
            if (e.closest(".achievement").querySelector(".title").innerText === s.name) {
                e.value = s.progress;
                e.max = o;
            }
        });
        displayAchievements(RegisterMod);
    }
}
function unlockAchievement(e, t) {
    showAchiNotificationDot();
    let n = JSON.parse(localStorage.getItem(`achievements_${e}`)) || {};
    if (!n[t]) {
        return;
    }
    let i = n[t];
    if (i.status !== "unlocked") {
        i.status = "unlocked";
        localStorage.setItem(`achievements_${e}`, JSON.stringify(n));
        showAchievementNotification(i.name, i.icon, i.description);
        displayAchievements(e);
        localStorage.setItem("achiNotificationDot", achiNotificationDot);
        achiNotificationDot += 1;
        localStorage.setItem("achiNotificationDot", achiNotificationDot);
        showAchiNotificationDot();
    }
}
function showAchievementNotification(e, t, n) {
    let i = document.getElementById("achievement-container");
    if (!i) {
        i = document.createElement("div");
        i.id = "achievement-container";
        document.body.appendChild(i);
    }
    let s = document.createElement("div");
    s.classList.add("achievement-notification");
    let o = `img/mod_achievements/${t}`;
    s.innerHTML = `\n        <img src="${o}" class="achievement-icon">\n        <div class="achievement-text">\n            <div class="title">${e}</div>\n            <div class="text">${n}</div>\n        </div>\n    `;
    i.appendChild(s);
    setTimeout(() => {
        s.classList.add("visible");
    }, 10);
    setTimeout(() => {
        s.classList.remove("visible");
        setTimeout(() => s.remove(), 500);
    }, 5000);
}
function preloadAchievementIcons(modID) {
    const achievements = JSON.parse(localStorage.getItem(`achievements_${modID}`)) || {};
    for (let id in achievements) {
        const img = new Image();
        img.src = `img/mod_achievements/${achievements[id].icon}`;
    }
}
function displayAchievements(e) {
    let t = JSON.parse(localStorage.getItem(`achievements_${e}`)) || {};
    let n = document.getElementById("achievements-list");
    n.innerHTML = "";
    if (Object.keys(t).length !== 0) {
        for (let e in t) {
            let n = t[e];
            let k = n.icon.lastIndexOf('.');
            let s = document.createElement("div");
            s.classList.add("achievement");

            let l = n.status === "locked";
            let o = `img/mod_achievements/${n.icon}`;

            const lockedIcon = `img/mod_achievements/${n.icon.substring(0, k)}-locked${n.icon.substring(k)}`;
            const mainIcon = l ? `background-image: url('${lockedIcon}'), url('${o}');` : `background-image: url('${o}');`;

            let c = l ? "grayscale" : "";
            let a = l && n.type === "hidden" ? "???" : n.name;
            let r = l && n.type === "hidden" ? "???" : n.description;

            s.innerHTML = `
                <div class="achievement-icon ${c}" style="${mainIcon} background-size: cover;"></div>
                <div class="achievement-info">
                    <div class="title">${a}</div>
                    <div class="text">${r}</div>
                    ${n.type === "progress" ? `<progress id="progress-${e}" value="${n.progress}" max="${n.maxProgress}"></progress>` : ""}
                </div>
            `;
            i.appendChild(s);
        }
    } else {
        n.innerHTML = `<p>${STR("extra.txt.noAchiFound")}</p>`;
    }
}
const style = document.createElement("style");
style.innerHTML = `
    .achievement-icon.grayscale {
        filter: grayscale(100%);
        opacity: 0.5;
    }
`;
document.head.appendChild(style);
document.getElementById("tab-myachi").addEventListener("click", function () {
    displayAchievements(RegisterMod);
});