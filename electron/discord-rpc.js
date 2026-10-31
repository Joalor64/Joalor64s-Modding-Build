// BROUGHT BACK BY RIZSIM STUDIOS (for Incredibox mod)
// Credit me if used! (even tho I took this from the evadare one)
// TO MAKE A CLIENT FOR IT GO TO "https://discord.com/developers"
//
// electron/discord-rpc.js - Discord "Rich Presence" (the "Playing ..." status).
// The page reports where it is with window.electron.ipc.setPresence({ mod, version }).
// "start-game" / "stop-game" still work too.

const { ipcMain } = require("electron");
const DiscordRPC = require("discord-rpc");

const CLIENT_ID = "1449150015904808990"; // catch Application ID!

const client = new DiscordRPC.Client({ transport: "ipc" });
const sessionStart = Date.now();
let presence = { mod: null, version: null, inGame: false };

/** Discord rejects fields longer than 128 characters or shorter than 2. */
function field(text) {
    text = String(text ?? "").slice(0, 128);
    return text.length >= 2 ? text : undefined;
}

function updatePresence() {
    if (!client || !client.transport.socket) return;

    const activity = {
        details: field(presence.inGame ? (presence.mod ? `Mixing in ${presence.mod}` : "Mixing Beats!") : "In the menus"),
        largeImageKey: "icon",
        largeImageText: field(presence.mod || "Playing Incredibox Mod"),
        startTimestamp: sessionStart
    };
    if (presence.inGame) {
        Object.assign(activity, {
            state: field(presence.version != null ? `Version ${presence.version}` : "Playing Incredibox Mod"),
            smallImageKey: presence.version != null ? `icon${String(presence.version).padStart(2, "0")}` : "icon01",
            smallImageText: field(presence.version != null ? `Version ${presence.version}` : "Version 1")
        });
    }
    client.setActivity(activity).catch(console.error);
}

client.on("ready", () => {
    console.log("Connected to Discord RPC!");
    updatePresence();
});

client.login({ clientId: CLIENT_ID }).catch(err => console.warn("Discord RPC unavailable:", err.message));

ipcMain.on("discord-presence", (e, info = {}) => {
    presence = {
        mod: info.mod || null,
        version: info.version ?? null,
        inGame: info.version != null
    };
    updatePresence();
});

ipcMain.on("start-game", () => {
    presence.inGame = true;
    updatePresence();
});

ipcMain.on("stop-game", () => {
    presence.inGame = false;
    updatePresence();
});
