/*
 * ui/modbox-credits.js
 * Credits popup for Modbox-format versions (app.json "credit" field).
 */

let kC = false;
let kD = false;
let kCsrc = '';

function popupModboxCredits() {
    const crewJpg = cache(`${app.folder}image/crew.jpg`);
    const crewPng = cache(`${app.folder}image/crew.png`);
    const fallbackPath = 'img/nocrew.png';
    let imagePath = kD ? fallbackPath : (kC ? kCsrc : crewJpg);

    boxPopup.open({
        name: 'popup-modcredit',
        icntype: 'action',
        bodyclose: true,
        class: 'rollover',
        content: `
            <div class="bck-box">
                <div class="img-box"></div>
                ${kC ? '' : `
                    <div class="icn-box">
                        <svg class="icn-svg icn-gray spin"><use xlink:href="#ic-loader"></use></svg>
                    </div>
                `}
            </div>
            <div class="info-box">
                <div class="title">${app.name}</div>
                <div class="text">
                    <div class="present">
                        An Incredimod by <span class="crewname">
                            ${app.credit.crewname || 'Unknown'}
                            <div class="icn-box"><svg class="icn-svg"><use xlink:href="#ic-modder"></use></svg></div>
                        </span>
                    </div>
                    <div class="date">${getStringDate(app.date) || ''}</div>
                    ${app.credit.modio ? `
                        <div class="modurl">
                            <span>${app.credit.modio.replace('https://mod.io/u/', '')}</span>
                            <div class="icn-box"><svg class="icn-svg"><use xlink:href="#ic-link"></use></svg></div>
                        </div>
                    ` : ''}
                    <br>
                    <hr><br>
                    <span class="modders-info">
                        ${app.credit.process ? `<b>Process</b>: ${app.credit.process.join(', ')}<br>` : ''}
                        ${app.credit.music ? `<b>Music</b>: ${app.credit.music.join(', ')}<br>` : ''}
                        ${app.credit.design ? `<b>Design</b>: ${app.credit.design.join(', ')}<br>` : ''}
                        ${app.credit.animation ? `<b>Animation</b>: ${app.credit.animation.join(', ')}<br>` : ''}
                        ${app.credit.bonus ? `<b>Bonus</b>: ${app.credit.bonus.join(', ')}<br>` : ''}
                        ${app.credit.thanks ? `<b>Thanks</b>: ${app.credit.thanks}<br>` : ''}
                    </span>
                </div>
            </div>
        `,
        onBoxOpenStart: function () {
            if (kC) {
                boxPopup.$popup
                    .find('.img-box')
                    .css({ 'background-image': `url(${imagePath})` })
                    .addClass('directfade');
            }
        },
        onBoxOpenEnd: function () {
            boxPopup.$icon.on(pointerEventType.down, boxPopup.close);
            boxPopup.$popup.removeClass('rollover');

            boxPopup.$popup.find('.bck-box').on(pointerEventType.down, function () {
                if (!boxPopup.$popup.hasClass('rollover')) {
                    boxPopup.$popup.addClass('rollover');
                }
            });

            boxPopup.$popup.find('.info-box').on(pointerEventType.down, function () {
                if (boxPopup.$popup.hasClass('rollover')) {
                    boxPopup.$popup.removeClass('rollover');
                }
            });

            boxPopup.$popup.find('.text .crewname').on(pointerEventType.down, function () {
                if (!appBrowserDemo) {
                    boxPopup.close();
                    redirectTo('modder');
                }
            });

            boxPopup.$popup.find('.text .modurl').on('click', function () {
                if (!appBrowserDemo) {
                    const username = boxPopup.$popup.find('.modurl span').html();
                    openURL(`https://mod.io/u/${username}`);
                }
            });

            if (!kC) {
                let triedPng = false;
                const img = new Image();
                img.src = imagePath;

                img.onload = () => {
                    kC = true;
                    kCsrc = imagePath;
                    boxPopup.$popup.find('.bck-box .icn-box').remove();
                    boxPopup.$popup
                        .find('.img-box')
                        .css({ 'background-image': `url(${imagePath})` })
                        .addClass('fade');
                };

                img.onerror = () => {
                    if (!triedPng) {
                        triedPng = true;
                        imagePath = crewPng;
                        img.src = imagePath;
                    } else {
                        kD = true;
                        imagePath = fallbackPath;
                        kC = true;
                        kCsrc = fallbackPath;
                        boxPopup.$popup.find('.bck-box .icn-box').remove();
                        boxPopup.$popup
                            .find('.img-box')
                            .css({ 'background-image': `url(${imagePath})` })
                            .addClass('fade');
                    }
                };
            }
        },
        onBoxCloseStart: function () {
            boxPopup.$icon.off();
            boxPopup.$popup.find('.bck-box').off();
            boxPopup.$popup.find('.info-box').off();
            boxPopup.$popup.find('span.modurl').off();
        },
    });
}
