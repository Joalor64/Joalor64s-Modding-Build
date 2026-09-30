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
	function getIncompleteCount(modName) {
		try {
			const ach = JSON.parse(localStorage.getItem(`achievements_${modName}`)) || {};
			const total = Object.keys(ach).length;
			const complete = Object.values(ach).filter(a => a && a.status === "unlocked").length;
			return Math.max(total - complete, 0);
		} catch (e) {
			return 0;
		}
	}
	function updateAchievementCounter(modName) {
		try {
			const total = getAchievementCount(modName);
			const complete = getUnlockedCount(modName);
			const incomplete = getIncompleteCount(modName);
			const allEl = document.getElementById("achievement-counter-all");
			const completeEl = document.getElementById("achievement-counter-complete");
			const incompleteEl = document.getElementById("achievement-counter-incomplete");
			if (allEl) {
				allEl.textContent = `All: ${total}`;
			}
			if (completeEl) {
				completeEl.textContent = `Complete: ${complete}`;
			}
			if (incompleteEl) {
				incompleteEl.textContent = `Incomplete: ${incomplete}`;
			}
		} catch (e) {
			if (console && console.warn) {
				console.warn(e);
			}
		}
	}
	function setAchievementFilter(category) {
		window.currentAchievementFilter = category || "all";
		const buttons = document.querySelectorAll("[data-achievement-filter]");
		buttons.forEach(button => {
			const isActive = button.dataset.achievementFilter === window.currentAchievementFilter;
			button.classList.toggle("active", isActive);
		});
		if (window.displayAchievements) {
			window.displayAchievements(RegisterMod, window.currentAchievementFilter);
		}
	}
	window.getAchievementCount = getAchievementCount;
	window.getUnlockedCount = getUnlockedCount;
	window.getIncompleteCount = getIncompleteCount;
	window.updateAchievementCounter = updateAchievementCounter;
	window.setAchievementFilter = setAchievementFilter;
	try {
		const filterButtons = document.querySelectorAll("[data-achievement-filter]");
		filterButtons.forEach(button => {
			button.addEventListener("click", function () {
				setAchievementFilter(this.dataset.achievementFilter);
			});
		});
		setAchievementFilter("all");
	} catch (e) { }
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