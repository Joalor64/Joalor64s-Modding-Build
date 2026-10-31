// Register your mod here
var RegisterMod = "Unknown";
var RegisterModVersion = "1.0.0";
var ModDeveloper = "Secret Developer";
var ModBanner = "";
var ModBannerLink = "";
var PerVersionCredits = false;
var ForceDisableEvents = false;
var StartOnApp = false;
var LiveReload = false; // true while making your mod, turn it OFF before releasing!

modInfo = {
	description: "You can edit mod description and details inside js/registerMod.js", // Some description about your mod, not too long
	relatedVideo: "", // YouTube video link of a teaser or release (or just anything about mod) - you can also leave it empty
	// You can also add version specific info like this:
	/*
	v1: {
		description: "Description for version 1",
		relatedVideo: "" // YouTube video link
	},
	*/
};

// version text
document.addEventListener("DOMContentLoaded", () => {
	const modVersion = document.getElementById("modVersion");
	if (modVersion) {
		modVersion.innerHTML = `Joalor64's Modding Build v${getVersion()} (RMB 6.8.7) <br> ${RegisterMod} v${RegisterModVersion} by ${ModDeveloper}`;
	}
});
