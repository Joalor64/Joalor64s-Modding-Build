# Changelog
All notable changes will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-10-31
A big update! Lots of reorganization was done, mods in the mod launcher now have their own saves, new development tools were added, and more!
See [STRUCTURE.md](./STRUCTURE.md) for more info.

### Added
#### Gameplay
- **Delayed polo removal**: a polo can be set to leave when the next loop starts instead of right away.
  Use the clock button on its controls (desktop) or swipe it sideways (desktop and mobile). A red icon and the loading bar show it's leaving. Doing it again cancels.
- **Custom polo animations**: replace the built-in bounce (`rebond`), drop (`deshabiller`) and comeback (`remonte`) movements with your own keyframes, by defining `_loadAnime_rebond(self)`, `_loadAnime_deshabiller(self)` or `_loadAnime_remonte(self)` in `mod.js`. Keyframes can move, rotate, scale and fade the polo, with GSAP eases written as text (`"Elastic.easeOut.config(1.3, 0.4)"`, `"back.out(1.7)"`). You can also pick a different movement per character with `"rebond"` / `"deshabiller"` / `"remonte"` in `app.json`.
- **Lyric translations**: `poloLyrics()` accepts `[text, translation]` to show a translated line under the lyrics.
- **Custom picto positions**: place the icons anywhere with `data/configs/uiLayout.jsonc` (per version, or all versions).
- **Custom UI** (`js/customUI.js`): extra toolbar and home buttons, switches and buttons in Settings,
  and extra tabs in the Settings and Mixlist popups.
- New messages: `showSpeechBubble()`, `showImagePopup()` and `openMessagePopup()`.
- All / Complete / Incomplete filters in the achievements tab.

#### Modding tools
- **Mod checker (F8)**: checks the whole mod and lists what's wrong, with the file to fix: missing files
  (sprites, sounds, bonus videos, images), broken JSON/XML with the line and column, misspelled field names,
  impossible bonus codes, animations with too few frames, and misspelled hooks in `mod.js` (with the right name
  suggested). In the desktop app it also catches files with the wrong capitalization (fine on Windows, broken on Android).
- **Live reload (F9, desktop)**: set `LiveReload = true` in `js/registerMod.js` and the game reloads when you save a file, saving CSS only swaps the styles without reloading. The mod checker runs after every reload.
- `STRUCTURE.md`: where everything is, every API file and every hook. Check `examples.js` for some of the new features.
- New API Functions: `delayRemovePoloById()`, `cancelDelayRemovePoloById()`, `runModCheck()`, `openModChecker()`, `deg()`,
  `defaultPoloAnime`. New hook: `onVXPoloNDelayRemove(pending)`.

#### Mod launcher
- **Separate saves for every mod**: saved mixes, unlocked bonuses, achievements and settings no longer mix
  between mods. The Played Mods library is still shared by all of them. Set an `"id"` in `mod.json` to keep a
  mod's saves even if you rename it.
- **Saves button** on every card: see what a mod has saved, **export** it to a `.jmbsave` file (backups, moving
  to another PC), **import** one, or **delete** it.
- **Updating mods**: installing a zip of a mod that's already installed asks to update it (keeps its card,
  favorite and saves), install a second copy, or cancel.
- **Missing mods**: a mod whose folder was moved or deleted stays in the list as "Not found", with
  **Locate...** to find it again and **Remove**.
- **Drag & drop**: drop a mod's `.zip` or folder on the launcher to add it.
- **Sort by** name, last played or newest (favorites always first), and "Played 3 days ago" on each card.
- **Open folder** button and "Last played" / "Made with" in a mod's info.
- The card badge shows which build a mod is made with ("JMB v0.2.0"), read from the mod itself.
- Popups now look and animate like the game's.

#### Desktop
- Discord Rich Presence shows the mod and version being played.

### Changed
- **Code reorganization**: `js/libs/core.js` became `js/api/` and `js/script.min.js` became `js/engine/`, meanwhile the Electron side is split into `electron/`.
  - Every public function kept its name, so existing code in `mod.js` keeps working.
- **One list of scripts**: `index.html` and `app.html` now load everything through `js/scripts.js`. Add your own script files there instead of adding `<script>` tags.
- **Upgraded Electron from 24 to 44**: the desktop build works on the latest Electron.
- **The lore popup works on phones and small screens**: a side-by-side layout on landscape phones and a
  one-column layout on portrait phones, with only the text scrolling.
  - Its styles moved to `css/lore.css`.
- **A bonus video that can't be loaded no longer stops the whole version from loading**: that bonus is
  switched off and its button shows as unavailable.
- Mods installed from a zip now go to `%APPDATA%\Incredibox\mods`.
  - Mods installed in `resources/mods` by older versions keep working.
- Deleting a mod installed from a zip moves its files to the Recycle Bin. Mods imported as a folder are only removed from the list.
- `RegisterModVersion` defaults to `"1.0.0"`.

### Removed
- `js/_buttons` support: use `js/buttons.js`. The mod checker warns if a leftover `js/_buttons` is found.
- Unused internals: `openDatabase`, `DB_NAME`, `DB_VERSION`, `dbRequest`, `updateProgressUI`, `setupSwitchButton`.

### Fixed
#### Timers & pausing
- `OnDelayIn` gave the wrong remaining time after pausing more than once.
- Background fades got stuck half-way when the game was paused during them.
- `onBPM` kept firing while paused, and beat timing could drift.

#### Modding API
- `Catch` never ran when the matching `Call` happened later on the same page.
- `fullPopup(url, duration)` crashed.
- `clearShakingPicto` didn't stop the shaking; `stopWiggle` left icons offset.
- `ReplacePoloSprite` did nothing.
- `QuickMessage` and speech bubbles could close the wrong message.
- `poloLyrics`: the shake effect ran forever, font paths were doubled, `.woff` fonts were declared wrong.
- `setAmbience` didn't work when called a second time.
- Stage lighting jumped colors when changed mid-fade, and `enabled: false` did nothing.
- `unLock()` moved icons from the 2nd/3rd line to the first one.
- `setCustomCursor` added a new mouse listener every call; `removeCustomCursor` broke confetti.
- Credits were loaded on every page and could show up empty.
- Achievements: progress unlocks didn't update the counters, and `unlockAchievement` right after `setAchievement` was lost.
- `.jsonc` configs broke `https://` links.

#### Game
- Single-version mods: the home switch button opened two popups.
- About popup: crashed in some setups, didn't embed `youtu.be` links, froze on versions without characters.
- Liking a mix while watching it threw an error.
- The play-time stat counted the current session twice and "Reset everything" was undone by it.
    - "Reset everything" also wiped the launcher's list of installed mods.
- Hotkeys could fire while typing in text fields.
- `gamePicto` values with an extension requested files like `game-picto@2x.png@2x.png`
- Home images ignored `homeScreen` / `homeTitre` / `homeVersion`.
- Legacy `asset-vX/app.js` versions were only partly loaded
- A character without a color crashed Modbox-format versions.
- A leftover loop checked the clock every 4 ms forever.

#### Mod launcher
- Favoriting or deleting a mod while searching dropped the hidden mods from the saved list.
- Importing the same folder twice added it twice.
- A mod without `src/index.html` left the launcher stuck on a black screen.
- Default mod icon and banner pointed to files that don't exist.
- Installing a zip failed when the temp folder and the game were on different drives.
- Startup sounds and animations failed for mod folders with `#` or `%` in their name.

### Security
- Links now open in your browser instead of a new app window.
- The app only opens web and email links, never local files or other programs.
- Mod descriptions in the launcher can't run scripts.
- Mod names and versions in the Played Mods page can't inject HTML.

### Notes for modders updating from 0.1
- Saves made with 0.1 stay in the shared storage and mods opened from the launcher now start with fresh saves
  (the Played Mods list is carried over). Use the launcher's **Import** if you exported saves.
- Add an `"id"` to your `mod.json` (for example `"com.yourname.mymod"`) and never change it: it's what keeps your
  mod's saves.
- If you added `<script>` tags to `index.html` or `app.html`, move those files into `js/scripts.js`.
- Press **F8** once in your mod, it points out anything from 0.1 that needs updating.

## [0.1.0] - 2026-08-12
Initial release!