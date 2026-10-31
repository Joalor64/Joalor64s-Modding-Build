/*
 * mod-launcher/js/import.js
 * The "+" (search) card: import a mod from a folder or a .zip file (zips are installed into the app's
 * user data folder, see electron/mods.js). Dropping a .zip or a mod folder on the launcher does the same.
 */

async function importMod(type) {
    Popup.close();
    if (!hasElectron()) {
        Popup.open({ type: "info", title: "Error", content: [{ type: "text", value: "Mods can only be imported in the desktop app." }] });
        return;
    }

    let modPath;
    try {
        modPath = type === "folder"
            ? await window.electron.ipc.pickModFolder()
            : await window.electron.ipc.pickModZip();
    } catch (err) {
        console.error("Error selecting mod:", err);
        Popup.open({ type: "info", title: "Error", content: [{ type: "text", value: "Failed to select mod file/folder" }] });
        return;
    }
    if (!modPath) return;
    await finishImport(modPath);
}

/**
 * After a folder/zip was picked or dropped: `modPath` is a folder, or { needsDecision, ... } when the zip
 * holds a mod that's already installed.
 */
async function finishImport(modPath) {
    if (typeof modPath === "object" && modPath.needsDecision) {
        const choice = await askUpdate(modPath);
        const folder = await window.electron.ipc.zipInstallDecision(modPath.token, choice);
        if (!folder) {
            if (choice !== "cancel") {
                Popup.open({ type: "info", title: "Error", content: [{ type: "text", value: "The mod couldn't be installed. If it's open somewhere (a file or folder), close it and try again." }] });
                AudioSys.play("cancel");
            }
            return;
        }
        const fresh = await window.electron.ipc.loadModMetadata(folder);
        if (!fresh) return;
        fresh.path = folder;
        Mods.add(Cards.create(fresh, false));
        Mods.save();
        Popup.open({
            type: "info",
            title: choice === "update" ? I18n.t("pop.updatedTitle", "Updated") : I18n.t("pop.installedTitle", "Installed"),
            content: [{
                type: "text", value: choice === "update"
                    ? I18n.t("pop.updatedTxt", '"%{name}" was updated to v%{version}. Its saves are kept.').replace("%{name}", fresh.title).replace("%{version}", fresh.version)
                    : `"${fresh.title}" was installed successfully!`
            }]
        });
        AudioSys.play("select");
        return;
    }

    const meta = await window.electron.ipc.loadModMetadata(modPath);
    if (!meta) {
        Popup.open({ type: "info", title: "Error", content: [{ type: "text", value: "No mod.json found in this folder!" }] });
        AudioSys.play("cancel");
        return;
    }
    meta.path = modPath;
    Mods.add(Cards.create(meta));
    Mods.save();
    AudioSys.play("select");
}

Carousel.searchCard.addEventListener("click", e => {
    e.preventDefault();
    AudioSys.play("search");
    Popup.open({
        title: "Import Mod",
        content: [{ label: "How would you like to import your mod?" }],
        footer: [
            { label: I18n.t("pop.cancel"), action: Popup.close },
            { label: "ZIP Archive", action: () => importMod("zip") },
            { label: "Folder", action: () => importMod("folder") }
        ]
    });
});

/** Asks what to do with a zip of an already installed mod. Resolves "update" | "copy" | "cancel". */
function askUpdate(info) {
    return new Promise(resolve => {
        let answered = false;
        let watch = null;
        const answer = choice => {
            if (answered) return;
            answered = true;
            clearInterval(watch);
            if (choice === "cancel") Popup.close();
            resolve(choice);
        };
        Popup.open({
            title: I18n.t("pop.updateTitle", "Already installed"),
            content: [
                {
                    label: I18n.t("pop.updateTxt", '"%{name}" is already installed (v%{old}). Update it to v%{new}? Its saves are kept.')
                        .replace("%{name}", info.name).replace("%{old}", info.installedVersion).replace("%{new}", info.newVersion)
                }
            ],
            footer: [
                { label: I18n.t("pop.cancel"), action: () => answer("cancel") },
                { label: I18n.t("pop.installCopy", "Install separately"), action: () => answer("copy") },
                { label: I18n.t("pop.update", "Update"), action: () => answer("update") }
            ]
        });
        watch = setInterval(() => {
            if (!Popup.isOpen) answer("cancel");
        }, 300);
    });
}

(() => {
    if (!hasElectron() || !window.electron.ipc.importDropped) return;
    let depth = 0;
    const hasFiles = e => [...(e.dataTransfer?.types || [])].includes("Files");
    const setActive = on => {
        document.body.dataset.dropText = I18n.t("pop.dropHere", "Drop a mod's .zip or folder to add it");
        document.body.classList.toggle("drop-active", on);
    };

    window.addEventListener("dragenter", e => {
        if (!hasFiles(e)) return;
        e.preventDefault();
        if (depth++ === 0) setActive(true);
    });
    window.addEventListener("dragover", e => {
        if (!hasFiles(e)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
    });
    window.addEventListener("dragleave", e => {
        if (!hasFiles(e)) return;
        if (--depth <= 0) { depth = 0; setActive(false); }
    });
    window.addEventListener("drop", async e => {
        if (!hasFiles(e)) return;
        e.preventDefault();
        depth = 0;
        setActive(false);
        if (Popup.isOpen) Popup.close();
        const files = [...e.dataTransfer.files];
        for (const file of files) {
            let filePath = "";
            try {
                filePath = window.electron.ipc.pathForFile(file);
            } catch (err) { }
            if (!filePath) continue;
            const result = await window.electron.ipc.importDropped(filePath);
            if (!result || result.error) {
                const why = {
                    noModJson: I18n.t("pop.dropNoModJson", "This folder has no mod.json, so it isn't a mod."),
                    badZip: I18n.t("pop.dropBadZip", "This .zip doesn't contain a mod (no mod.json)."),
                    notMod: I18n.t("pop.dropNotMod", "Drop a mod's .zip or its folder.")
                }[result?.error] || I18n.t("pop.dropNotMod", "Drop a mod's .zip or its folder.");
                Popup.open({ type: "info", title: file.name, content: [{ type: "text", value: why }] });
                AudioSys.play("cancel");
                continue;
            }
            await finishImport(result);
        }
    });
})();
