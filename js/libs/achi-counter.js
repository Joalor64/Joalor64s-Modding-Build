(function () {
	if (typeof window === "undefined") {
		return;
	}
	function getAchievementCount(modName) {
		try {
			const ach = JSON.parse(localStorage.getItem(`achievements_${modName}`)) || {};
			return Object.keys(ach).length;
		} catch (e) {
			return 0;
		}
	}
	function getUnlockedCount(modName) {
		try {
			const ach = JSON.parse(localStorage.getItem(`achievements_${modName}`)) || {};
			return Object.values(ach).filter(a => a && a.status === "unlocked").length;
		} catch (e) {
			return 0;
		}
	}
	function updateAchievementCounter(modName) {
		try {
			const el = document.getElementById("achievement-counter");
			if (!el) {
				return;
			}
			const total = getAchievementCount(modName);
			const unlocked = getUnlockedCount(modName);
			el.textContent = STR("extra.txt.achiFinished").replace("%{unlocked}", unlocked).replace("%{total}", total);
		} catch (e) {
			if (console && console.warn) {
				console.warn(e);
			}
		}
	}
	window.getAchievementCount = getAchievementCount;
	window.getUnlockedCount = getUnlockedCount;
	window.updateAchievementCounter = updateAchievementCounter;
	function wrapFunction(objName, fnName, cb) {
		try {
			const orig = window[fnName];
			if (typeof orig !== "function") {
				return false;
			}
			window[fnName] = function () {
				const res = orig.apply(this, arguments);
				try {
					cb.apply(this, arguments);
				} catch (e) {
					if (console && console.warn) {
						console.warn(e);
					}
				}
				return res;
			};
			return true;
		} catch (e) {
			return false;
		}
	}
	const wrappedSet = wrapFunction("window", "setAchievement", function (modName) {
		setTimeout(function () {
			try {
				updateAchievementCounter(modName);
			} catch (e) { }
		}, 500);
	});
	const wrappedUnlock = wrapFunction("window", "unlockAchievement", function (modName) {
		try {
			updateAchievementCounter(modName);
		} catch (e) { }
	});
	try {
		document.addEventListener("DOMContentLoaded", function () {
			try {
				updateAchievementCounter(RegisterMod);
			} catch (e) { }
		});
		const tab = document.getElementById("tab-myachi");
		if (tab) {
			tab.addEventListener("click", function () {
				try {
					updateAchievementCounter(RegisterMod);
				} catch (e) { }
			});
		}
	} catch (e) { }
	if (console && console.log) {
		console.log("achi-counter initialized (wrapped setAchievement/unlockAchievement?)", !!wrappedSet, !!wrappedUnlock);
	}
})();