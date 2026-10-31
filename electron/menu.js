// electron/menu.js - the application menu (hidden by default, but it provides the keyboard shortcuts).
const { app, Menu } = require("electron");

function buildMenu() {
    const template = [
        {
            role: "window",
            submenu: [
                { role: "zoom" },
                { role: "togglefullscreen" },
                { type: "separator" },
                { role: "minimize" },
                { role: "close" }
            ]
        },
        {
            label: "View",
            submenu: [
                { role: "reload", accelerator: "CmdOrCtrl+R" },
                { role: "forceReload" },
                { type: "separator" },
                { role: "resetZoom", accelerator: "CmdOrCtrl+0" },
                { role: "zoomIn", accelerator: "CmdOrCtrl+=" },
                { role: "zoomOut", accelerator: "CmdOrCtrl+-" }
            ]
        },
        {
            label: "Edit",
            submenu: [
                { role: "undo" },
                { role: "redo" },
                { type: "separator" },
                { role: "cut" },
                { role: "copy" },
                { role: "paste" },
                { role: "delete" },
                { role: "selectall" }
            ]
        }
    ];

    if (process.platform === "darwin") {
        template.unshift({
            label: app.name,
            submenu: [
                { role: "about" },
                { type: "separator" },
                { role: "hide" },
                { role: "hideothers" },
                { role: "unhide" },
                { type: "separator" },
                { role: "quit" }
            ]
        });
    }

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

module.exports = { buildMenu };
