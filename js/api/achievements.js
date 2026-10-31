/*
 * achievements.js
 * Achievements, saved per mod in localStorage ("achievements_<RegisterMod>").
 *   setAchievement(RegisterMod, id, icon, name, description, type, maxProgress)
 *       type: "normal", "progress" (needs maxProgress) or "hidden" (name/description shown as ??? until unlocked)
 *       icon: file in img/mod_achievements/ (an optional "<name>-locked.<ext>" is used while locked)
 *   unlockAchievement(RegisterMod, id)
 *   addProgressAchievement(RegisterMod, id, amount)
 * Achievements should be declared inside OnDelayIn(...) so the page is ready.
 */

function loadAchievements(modName) {
    try {
        return JSON.parse(localStorage.getItem(`achievements_${modName}`)) || {};
    } catch (e) {
        return {};
    }
}

function saveAchievements(modName, achievements) {
    localStorage.setItem(`achievements_${modName}`, JSON.stringify(achievements));
}

/**
 * Declares an achievement. Name, icon, description, type and maxProgress are refreshed every time
 * (so editing them in your mod just works); the unlocked state and progress are kept.
 */
function setAchievement(modName, id, icon, name, description, type, maxProgress) {
    const achievements = loadAchievements(modName);
    const existing = achievements[id];
    achievements[id] = {
        status: existing ? existing.status : "locked",
        icon: icon,
        name: name,
        description: description,
        type: type,
        progress: existing ? existing.progress : 0,
        maxProgress: maxProgress
    };
    saveAchievements(modName, achievements);
    preloadAchievementIcons(modName);
}

function onAchievementUnlocked(modName, achievement) {
    showAchievementNotification(achievement.name, achievement.icon, achievement.description);
    displayAchievements(modName, window.currentAchievementFilter || "all");
    achiNotificationDot += 1;
    localStorage.setItem("achiNotificationDot", achiNotificationDot);
    showAchiNotificationDot();
}

/** Adds `amount` to a "progress" achievement; unlocks it when it reaches maxProgress. */
function addProgressAchievement(modName, id, amount) {
    const achievements = loadAchievements(modName);
    const achievement = achievements[id];
    if (!achievement || achievement.status === "unlocked" || achievement.maxProgress === undefined) {
        return;
    }
    achievement.progress = Math.min((achievement.progress || 0) + amount, achievement.maxProgress);
    const justUnlocked = achievement.progress >= achievement.maxProgress;
    if (justUnlocked) {
        achievement.status = "unlocked";
    }
    saveAchievements(modName, achievements);

    if (justUnlocked) {
        onAchievementUnlocked(modName, achievement);
    } else {
        document.querySelectorAll(`#progress-${CSS.escape(id)}`).forEach(bar => {
            bar.value = achievement.progress;
            bar.max = achievement.maxProgress;
        });
    }
}

/** Unlocks an achievement (shows the notification the first time). */
function unlockAchievement(modName, id) {
    const achievements = loadAchievements(modName);
    const achievement = achievements[id];
    if (!achievement || achievement.status === "unlocked") {
        return;
    }
    achievement.status = "unlocked";
    saveAchievements(modName, achievements);
    onAchievementUnlocked(modName, achievement);
}

/** The "achievement unlocked" toast. */
function showAchievementNotification(name, icon, description) {
    let container = document.getElementById("achievement-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "achievement-container";
        document.body.appendChild(container);
    }
    const note = document.createElement("div");
    note.classList.add("achievement-notification");
    note.innerHTML = `
        <img src="img/mod_achievements/${icon}" class="achievement-icon">
        <div class="achievement-text">
            <div class="title">${name}</div>
            <div class="text">${description}</div>
        </div>
    `;
    container.appendChild(note);
    setTimeout(() => note.classList.add("visible"), 10);
    setTimeout(() => {
        note.classList.remove("visible");
        setTimeout(() => note.remove(), 500);
    }, 5000);
}
function preloadAchievementIcons(modID) {
    const achievements = JSON.parse(localStorage.getItem(`achievements_${modID}`)) || {};
    for (let id in achievements) {
        const img = new Image();
        img.src = `img/mod_achievements/${achievements[id].icon}`;
    }
}
function displayAchievements(e, filter = window.currentAchievementFilter || "all") {
    let t = JSON.parse(localStorage.getItem(`achievements_${e}`)) || {};
    let list = document.getElementById("achievements-list");
    if (!list) {
        return;
    }
    list.innerHTML = "";
    const entries = Object.entries(t).filter(([key, value]) => {
        if (filter === "complete") {
            return value && value.status === "unlocked";
        }
        if (filter === "incomplete") {
            return value && value.status !== "unlocked";
        }
        return true;
    });
    if (entries.length !== 0) {
        for (let [key, value] of entries) {
            let item = value;
            item.icon = item.icon || "";
            let k = item.icon.lastIndexOf('.');
            let s = document.createElement("div");
            s.classList.add("achievement");

            let l = item.status === "locked";
            let o = `img/mod_achievements/${item.icon}`;

            const lockedIcon = `img/mod_achievements/${item.icon.substring(0, k)}-locked${item.icon.substring(k)}`;
            const mainIcon = l ? `background-image: url('${lockedIcon}'), url('${o}');` : `background-image: url('${o}');`;

            let c = l ? "grayscale" : "";
            let a = l && item.type === "hidden" ? "???" : item.name;
            let r = l && item.type === "hidden" ? "???" : item.description;

            s.innerHTML = `
                <div class="achievement-icon ${c}" style="${mainIcon} background-size: cover;"></div>
                <div class="achievement-info">
                    <div class="title">${a}</div>
                    <div class="text">${r}</div>
                    ${item.type === "progress" ? `<progress id="progress-${key}" value="${item.progress}" max="${item.maxProgress}"></progress>` : ""}
                </div>
            `;
            list.appendChild(s);
        }
    } else {
        list.innerHTML = `<p>${STR("extra.txt.noAchiFound")}</p>`;
    }
}
(function () {
    const style = document.createElement("style");
    style.innerHTML = `
        .achievement-icon.grayscale {
            filter: grayscale(100%);
            opacity: 0.5;
        }
    `;
    document.head.appendChild(style);
    document.getElementById("tab-myachi")?.addEventListener("click", function () {
        displayAchievements(RegisterMod, window.currentAchievementFilter || "all");
    });
})();