/*
 * rules-css.js
 * initRulesCSS(): generates the per-version CSS (colors, radii, picto sprites, home images)
 * and probes img/ vs image/ and @2x assets.
 */

function initRulesCSS() {
    const root = document.documentElement;
    const sal = parseInt(getComputedStyle(root).getPropertyValue("--sal"));
    const sar = parseInt(getComputedStyle(root).getPropertyValue("--sar"));
    const padding = Math.max(sal, sar, 20);

    const colors = pageApp ? {
        colBck: ((app.colors) ? app.colors[5] : app.colBck),
        col0: ((app.colors) ? app.colors[0] : app.col0),
        col1: ((app.colors) ? app.colors[1] : app.col1),
        col2: ((app.colors) ? app.colors[2] : app.col2),
        col3: ((app.colors) ? app.colors[3] : app.col3),
        col4: ((app.colors) ? app.colors[4] : app.col4),
        colDarkBck: ((app.colors) ? app.colors[6] : app.colDarkBck)
    } : null;

    const lang = currentLanguage.split("-")[0];
    const assetPath = `../asset-v${appVersion}/img`;

    let css = `:root {
        --fullfill-padding: ${padding}px;
        --url-img-bt-stores: url(${domainOnline}img/bt-stores-${lang}.png);
    `;

    if (pageApp) {
        css += `        --app-v: ${appVersion};
            --colBck: ${colors.colBck};
            --col0: ${colors.col0};
            --col1: ${colors.col1};
            --col2: ${colors.col2};
            --col3: ${colors.col3};
            --col4: ${colors.col4};
            --url-img-home-screen: url(${assetPath}/${app.homeScreen || "home-screen.jpg"});
        `;

        if (app.customTitle) {
            css += `        --url-img-home-titre: url(${assetPath}/${app.homeTitre || "home-titre.png"});\n`;
        }

        if (app.customVersion) {
            css += `        --url-img-home-version: url(${assetPath}/${app.homeVersion || "home-version.png"});\n`;
        }

        const darkBckVar = colors.colDarkBck ? `        --col-general-bck: ${colors.colDarkBck};\n` : "";
        css += `}
            .darkmode {
            --app-v: ${appVersion};
            --colBck: ${colors.colBck};
            --col0: ${colors.col0};
            --col1: ${colors.col1};
            --col2: ${colors.col2};
            --col3: ${colors.col3};
            --col4: ${colors.col4};
            ${darkBckVar}}`;

        if (!(window.cordova || isMobile)) {
            const radius = "20px";
            optionalEl("box-top", el => {
                el.style.borderTopLeftRadius = radius;
                el.style.borderTopRightRadius = radius;
            });
            optionalQuery("#box-top #box-bt #box-bt1", el => {
                el.style.borderTopLeftRadius = radius;
                el.style.borderTopRightRadius = radius;
            });
            optionalQuery("#box-top #box-bt #box-bt2", el => {
                el.style.borderTopLeftRadius = radius;
                el.style.borderTopRightRadius = radius;
            });
            optionalEl("box-bottom", el => {
                el.style.borderBottomLeftRadius = radius;
                el.style.borderBottomRightRadius = radius;
            });
        }

        css += `
            #box-bottom #box-picto .picto, 
            #box-bottom #box-picto .picto .bck, 
            .waiting-picto {
                border-radius: ${app.pictoRadius};
            }
            .waiting-picto {
                background-image: url(./asset-v${appVersion}/img/${app.gamePicto || "game-picto@2x.png"});
            }`;

        css += `
            #game #box-stage-bck,
            #game #box-stage-front-bot,
            #game #box-stage-front-top,
            #game #box-stage-behind-bot,
            #game #box-stage-behind-top,
            #game #box-stage #particles-js,
            #game #box-stage #clouds,
            #game #box-video,
            #game #box-video .video,
            #game #box-video .video video,
            #game #fade-video {
                border-radius: ${app.backgroundRadius};
            }
            
            #game #bottom-shadow {
                border-radius: 0 0 ${app.backgroundRadius} ${app.backgroundRadius};
            }
            `;
    } else {
        css += "}";
    }

    const style = document.createElement("style");
    style.id = "rules-css";
    style.type = "text/css";
    style.innerHTML = css;
    (document.head || document.getElementsByTagName("head")[0]).appendChild(style);

    if (pageApp) {
        const plainName = (name, fallback) => {
            const parts = splitAssetName(name || fallback, fallback.slice(fallback.lastIndexOf(".")));
            return parts.base + parts.ext;
        };
        const assetsToCheck = [
            { id: "--url-img-home-screen", file: plainName(app.homeScreen, "home-screen.jpg"), type: "root" },
            { id: "--url-img-home-titre", file: plainName(app.homeTitre, "home-titre.png"), type: "root", active: app.customTitle },
            { id: "--url-img-home-version", file: plainName(app.homeVersion, "home-version.png"), type: "root", active: app.customVersion },
            { id: ".waiting-picto", file: plainName(app.gamePicto, "game-picto.png"), type: "class" }
        ];

        assetsToCheck.forEach(asset => {
            if (asset.active === false) return;

            const pathsToTry = [
                `asset-v${appVersion}/img/${auto2xPath(asset.file)}`,
                `asset-v${appVersion}/image/${auto2xPath(asset.file)}`,
                `asset-v${appVersion}/img/${asset.file}`,
                `asset-v${appVersion}/image/${asset.file}`
            ];
            let pathIndex = 0;

            function tryNextPath() {
                if (pathIndex >= pathsToTry.length) return;

                const testImg = new Image();
                const currentPath = pathsToTry[pathIndex];

                testImg.onload = function () {
                    if (asset.type === "root") {
                        document.documentElement.style.setProperty(asset.id, `url(../${currentPath})`);
                    } else {
                        const sheet = style.sheet;
                        if (sheet) {
                            sheet.insertRule(`${asset.id} { background-image: url(./${currentPath}) !important; }`, sheet.cssRules.length);
                        }
                    }
                };
                testImg.onerror = function () {
                    pathIndex++;
                    tryNextPath();
                };
                testImg.src = currentPath;
            }
            tryNextPath();
        });
    }
}
