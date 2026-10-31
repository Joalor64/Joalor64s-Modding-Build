/*
 * mod-launcher/js/saves.js
 * The "Saves" button of a mod card: see how much a mod has saved, export it to a .jmbsave file,
 * import one, or delete everything it saved. Each mod has its own saves (its own storage, see
 * electron/mod-saves.js); a .jmbsave file is readable JSON.
 */

const Saves = (() => {
    const T = (key, fallback) => I18n.t("pop." + key, fallback);
    const api = () => window.electron?.ipc?.saves;

    function formatSize(bytes) {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    }

    function message(title, text) {
        Popup.open({ type: "info", title, content: [{ type: "text", value: text }] });
    }

    function failed(err) {
        console.error("[Saves]", err);
        message(T("error", "Error"), String(err?.message || err || "Something went wrong."));
        AudioSys.play("cancel");
    }

    /** Opens the Saves popup for a mod card's metadata. */
    async function open(meta) {
        if (!api() || !meta?.path) {
            message(T("error", "Error"), "Saves can only be managed in the desktop app.");
            return;
        }
        AudioSys.play("search");
        let info;
        try {
            info = await api().info(meta.path);
        } catch (err) {
            return failed(err);
        }
        const empty = !info || info.keys === 0;
        const summary = empty
            ? T("savesNone", "This mod hasn't saved anything yet.")
            : T("savesSummary", "%{keys} saved entries (%{size}), %{achievements} achievement list(s).")
                .replace("%{keys}", info.keys).replace("%{size}", formatSize(info.bytes)).replace("%{achievements}", info.achievements);

        const footer = [{ label: T("savesImport", "Import"), action: () => importSaves(meta) }];
        if (!empty) {
            footer.unshift({ label: T("savesExport", "Export"), action: () => exportSaves(meta) });
            footer.push({ label: T("savesDelete", "Delete saves"), type: "popup-danger", action: () => confirmDelete(meta) });
        }
        Popup.open({
            title: `${T("savesTitle", "Saves")} · ${meta.title}`,
            content: [
                { label: summary },
                { label: T("savesWhat", "Saved mixes, unlocked bonuses, achievements and settings of this mod.") }
            ],
            footer
        });
    }

    async function exportSaves(meta) {
        try {
            const r = await api().export(meta.path);
            if (r.canceled) return;
            if (!r.ok) return message(T("savesTitle", "Saves"), r.error);
            AudioSys.play("select");
            message(T("savesTitle", "Saves"), `${T("savesExported", "Saves exported to:")}\n${r.file}`);
        } catch (err) {
            failed(err);
        }
    }

    async function importSaves(meta) {
        let r;
        try {
            r = await api().pickImport(meta.path);
        } catch (err) {
            return failed(err);
        }
        if (r.canceled) return;
        if (!r.ok) return message(T("savesTitle", "Saves"), r.error);

        const lines = [{ label: T("savesImportConfirm", "Replace this mod's saves with the ones in this file? Its current saves will be lost (export them first to keep a copy).") }];
        if (!r.sameMod) {
            lines.push({ label: "⚠ " + T("savesImportOtherMod", 'This file was made with another mod: "%{mod}".').replace("%{mod}", r.fromMod || "?") });
        }
        const when = r.exported ? new Date(r.exported).toLocaleString() : "?";
        lines.push({ label: `${r.keys} · ${formatSize(r.bytes)} · ${when}` });

        let decided = false;
        const cancel = () => {
            if (!decided) api().cancelImport(r.token);
            decided = true;
            Popup.close();
        };
        Popup.open({
            title: `${T("savesImport", "Import")} · ${meta.title}`,
            content: lines,
            footer: [
                { label: I18n.t("pop.cancel", "Cancel"), action: cancel },
                {
                    label: T("savesImport", "Import"), type: "popup-danger", action: async () => {
                        decided = true;
                        try {
                            const done = await api().import(r.token);
                            if (!done.ok) return message(T("savesTitle", "Saves"), done.error);
                            AudioSys.play("select");
                            message(T("savesTitle", "Saves"), T("savesImported", "Saves imported. They'll be used the next time you play this mod."));
                        } catch (err) {
                            failed(err);
                        }
                    }
                }
            ]
        });
    }

    function confirmDelete(meta) {
        Popup.open({
            title: `${T("savesDelete", "Delete saves")} · ${meta.title}`,
            content: [{ label: T("savesDeleteConfirm", "Delete all of this mod's saves? Saved mixes, unlocked bonuses, achievements and settings will be lost.") }],
            footer: [
                { label: I18n.t("pop.cancel", "Cancel"), action: Popup.close },
                {
                    label: T("savesDelete", "Delete saves"), type: "popup-danger", action: async () => {
                        try {
                            const r = await api().clear(meta.path);
                            if (!r.ok) return message(T("savesTitle", "Saves"), r.error);
                            AudioSys.play("cancel");
                            message(T("savesTitle", "Saves"), T("savesDeleted", "Saves deleted."));
                        } catch (err) {
                            failed(err);
                        }
                    }
                }
            ]
        });
    }

    return { open };
})();
