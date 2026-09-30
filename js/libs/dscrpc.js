// BROUGHT BACK BY RIZSIM STUDIOS (for Incredibox mod)
// Credit me if used! (even tho I took this from the evadare one)
// TO MAKE A CLIENT FOR IT GO TO "https://discord.com/developers"

const {
	app: e,
	BrowserWindow: a,
	ipcMain: o
} = require("electron");
const t = new (require("discord-rpc").Client)({
	transport: "ipc"
});
let n = false;
async function r() {
	if (t && t.transport.socket) {
		if (n) {
			t.setActivity({
				details: "Mixing Beats!", // CHANGE THIS!
				state: "Playing Incredibox Mod",
				largeImageKey: "icon",
				largeImageText: "Playing Incredibox Mod",
				smallImageKey: "icon01",
				smallImageText: "Version 1",
				startTimestamp: Date.now()
			}).catch(console.error);
		} else {
			t.setActivity({
				details: "Mixing Beats!", // CHANGE THIS!
				largeImageKey: "icon",
				largeImageText: "Playing Incredibox Mod",
				startTimestamp: Date.now()
			}).catch(console.error);
		}
	}
}
t.on("ready", () => {
	console.log("Connected to Discord RPC!");
	r();
});
t.login({
	clientId: "1449150015904808990" // catch Application ID!
}).catch(console.error);
o.on("start-game", () => {
	console.log("Game started! Updating Discord presence...");
	n = true;
	r();
});
o.on("stop-game", () => {
	console.log("Game stopped! Resetting Discord presence...");
	n = false;
	r();
});