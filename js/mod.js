////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////   /$$$$$$                  /$$                 /$$                                     ////////////////
////////////  /$$__  $$                | $$                | $$                                     ////////////////
//////////// | $$  \__/  /$$$$$$   /$$$$$$$  /$$$$$$       | $$$$$$$   /$$$$$$   /$$$$$$   /$$$$$$  ////////////////
//////////// | $$       /$$__  $$ /$$__  $$ /$$__  $$      | $$__  $$ /$$__  $$ /$$__  $$ /$$__  $$ ////////////////
//////////// | $$      | $$  \ $$| $$  | $$| $$$$$$$$      | $$  \ $$| $$$$$$$$| $$  \__/| $$$$$$$$ ////////////////
//////////// | $$    $$| $$  | $$| $$  | $$| $$_____/      | $$  | $$| $$_____/| $$      | $$_____/ ////////////////
//////////// |  $$$$$$/|  $$$$$$/|  $$$$$$$|  $$$$$$$      | $$  | $$|  $$$$$$$| $$      |  $$$$$$$ ////////////////
////////////  \______/  \______/  \_______/ \_______/      |__/  |__/ \_______/|__/       \_______/ ////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const modPoloMaps = {};

var traySoundDown = "sound/volume/minus.wav";
var traySoundUp = "sound/volume/plus.wav";
var traySoundMAX = "sound/volume/max.wav";

// Custom polo movements (see STRUCTURE.md "Custom polo movements"): uncomment to try.
/*
function _loadAnime_rebond(self) {
	return {
		totalDuration: 0.6,
		keyframes: [
			{ time: 0.00, rotate: 0 },
			{ time: 0.20, y: self.targetY - drawMaxBounceY, rotate: deg(10), ease: "Quint.easeOut" },
			{ time: 0.50, y: self.targetY, rotate: deg(-6), ease: "Back.easeOut" },
			{ time: 1.00, rotate: 0, ease: "Elastic.easeOut.config(1.2, 0.4)" }
		]
	};
}
*/

function afterModLoads() {
	if (Number(getVersionFromURL()) === 8) {
		CloudSystem.init({
			count: 10,
			minDuration: 12,
			maxDuration: 28,
			minScale: 0.5,
			maxScale: 1.3,
			color: '#ffe6b96d',
			minTop: 2,
			maxTop: 35
		});

		CloudSystem.setFluffy(true);
	}
}

// i was lightning, before the thunder
//       vvvvvvvv
function THUNDAH() {
	Shake(10, 500);
    Bloom(4, 500);
}

// this is just copied from eternyx but whatever
function batShriek() {
	impactIcons(3.5, 930);
	Shake(2.5, 1000);
}

// disable for now so i don't accidentally click on it
/*
function onBoxVersionClicked8() {
	let spookyVideos = ["OOGA_BOOGA", "shatdafakap"];
	let randomVideo = spookyVideos[Math.floor(Math.random() * spookyVideos.length)];
	playBoxVideo(`asset-v8/secret/${randomVideo}.mp4`);
}
*/

function onLockedIcon() {
	boxDialog.open("locked");
}

function onAppStart() {
	OnDelayIn(100, () => {
		glitchText("sp-choose", 20, 8000);
	});
}

onKey("F5", () => {
	unGlitchText("sp-choose");
})