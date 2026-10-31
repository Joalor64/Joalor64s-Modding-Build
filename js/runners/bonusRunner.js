/*
 * runners/bonusRunner.js
 * Adapts the help slideshow and the "reset bonuses" setting to versions without bonuses.
 */

function handleBonusTutorialBloc() {
    const imgRow = document.querySelector(".img-row");
    if (!imgRow) {
        setTimeout(handleBonusTutorialBloc, 50);
        return;
    }

    function updateWidth() {
        const blocCount = imgRow.querySelectorAll(".bloc").length;
        imgRow.style.width = `calc(100% * ${blocCount})`;
        console.log(`Updated width for ${blocCount} blocs`);
    }

    updateWidth();

    new MutationObserver(updateWidth).observe(imgRow, {
        childList: true,
        subtree: false,
    });

    const hasBonusArray =
        (typeof app !== "undefined" &&
            Array.isArray(app.bonusarray) &&
            app.bonusarray.length > 0) || !pageApp;

    if (!hasBonusArray) {
        const bloc5 = document.getElementById("bloc-tuto5");
        if (bloc5) bloc5.remove();
        console.log("bloc-tuto5 removed because app.bonusarray is empty or missing");
    }
}
function updateBonusResetVisibility() {
    const resetParam = document.getElementById("param-reset");
    const bonusHr = document.getElementById("bonus-hr");

    const hasBonusArray =
        typeof app !== "undefined" &&
        Array.isArray(app.bonusarray) &&
        app.bonusarray.length > 0;

    const display = hasBonusArray ? "flex" : "none";
    if (resetParam) resetParam.style.display = display;
    if (bonusHr) bonusHr.style.display = display;
}

window.updateBonusResetVisibility = updateBonusResetVisibility;