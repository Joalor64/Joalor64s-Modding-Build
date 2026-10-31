# Project structure

Everything runs as plain `<script>` files that share one global scope (no modules, no build step).
`index.html` (version select menu) and `app.html` (a version) load the same scripts in the same order:
both pages contain a single `<script src="js/scripts.js" data-page="...">`, and **`js/scripts.js` is the one list
of every script**. To add a file, add it there (entries can be limited to one page with `{ src, page: "app" }`).

## Where to edit your mod

| File | What it's for |
|---|---|
| `js/registerMod.js` | Mod name, version, developer, banner, `modInfo` (about popup), flags like `ForceDisableEvents`, `LiveReload` |
| `js/buttons.js` | Extra round buttons on the menus (`modBtList`) |
| `js/customUI.js` | Extra UI: toolbar/home buttons, settings switches/buttons, Settings & Mixlist tabs (`customUI`) |
| `js/apps.js` | Version data (`versions.v1 = {...}`), or use `asset-vX/app.json` / `app.js` instead |
| `js/mod.js` | Your own code: hooks (`onV1Start()`...), `onKey(...)`, effects, custom polo movements (`_loadAnime_*`) |
| `js/scripts.js` | The list of scripts both pages load (add your own extra files here) |
| `css/mod.css` | Your own CSS |
| `data/versions.xml` | The version icons on the menu (all attributes are explained at the top of the file) |
| `data/configs/*.jsonc` | About-popup Y offsets, per-version auto mode texts, `uiLayout.jsonc` picto positions |
| `mod-credits/credits.xml` | Credits popup pages |
| `lore/data/vX.xml` | Character lore popup (text, images) |
| `css/lore.css` | Look and layout of the lore popup (override it in `css/mod.css`) |
| `js/examples.js` | Reference list of the API with examples (not loaded) |

## Folders

```
src/
├─ index.html, app.html     pages (script order at the bottom of each)
├─ elec-index.js            Electron entry point  ─┐
├─ elec-preload.js          window.electron bridge  │ desktop app only
├─ electron/                window, IPC, mod launcher support (one storage partition per mod),
│                           shared Played Mods store, modding tools (dev.js), menu, Discord RPC
├─ js/
│  ├─ api/                  the modding API (was js/libs/core.js)
│  ├─ engine/               the game engine (was js/script.min.js)
│  │  ├─ ui/                dialogs and popups
│  │  ├─ objects/           Polo, Picto, Bonus, Sound, Clock... "classes"
│  │  └─ modes/             auto (random), record, replay
│  ├─ debug/                F3 overlay, on-screen console, debug hotkeys, mod checker (F8), live reload (F9)
│  ├─ runners/              small page helpers (SVG icons, flags, bonus-less versions)
│  ├─ libs/                 third-party libraries only (jQuery, GSAP, particles, lame...)
│  └─ mod-libs/             the "Played Mods" library page
├─ mod-launcher/            the desktop mod launcher (F1), js/ split the same way
└─ lore/                    lore popup script + data
```

## Load order rule

Because the files share one scope, **a function can use anything from any file**, but code that runs
*immediately while a file loads* (top-level statements, not inside a function) can only use things from
files loaded **before** it. Functions are only "hoisted" inside their own file.
So when you add a file, put it after everything its top-level code needs. Event handlers,
`OnDelayIn`, `DOMContentLoaded`, etc. run after every file has loaded, so they are always safe.

## Modding API (`js/api/`, in load order)

| File | Main functions |
|---|---|
| `version.js` | `VERSION`, `getVersion()` (modding build version) |
| `helpers.js` | `getVersionFromURL`, `getHtmlName`, `auto2xPath`, `splitAssetName`, `getAssetFallback`, `tryImageFallback`, `fileExists`, `loadJS`, `parseXML`, `parseJSONC`, `parseINI`, `changeCssVar`/`changeCssVariable`, `hexToRgb`, `SomeTimes`, `debounce`, `smoothNumber`, `waitForElement`, `timeSince`, `escapeHTML` |
| `settings.js` | The Adv. Settings flags (`ShakeEffectOn`, `LyricsOn`, `BGorFadeOutsOn`, `ModSoundsOn`, `ConfettiEffectOn`, `CustomCursorsOn`, `expEventsOn`, `expAltModeOn`), play stats, `addToHistory` |
| `timers.js` | `OnDelayIn`, `onBPM`/`offBPM`, `onLoop`/`offLoop` — all pause with the game |
| `dom.js` | `OnClick`, `OnClickElement`, `CreateElement`, `RemoveElement`, `goto`, `ChangeMenuTitle`, `customPopup`, `customInfo`, `openMessagePopup`, `confirmNavigation`, `openExternal`, `playAnimation`, `toggleDarkMode`, `changeFavicon` |
| `storage.js` | `OnlyOnce`, `Call`, `Catch`, `ClearItemID` |
| `effects.js` | `FadeOut`, `VersionFadeOut`, `stageFadeOut`, `ChangeColorBG`, `CleanColorBG`, `Bloom`, `Shake`, `Zoom`, `bounceZoom`, `MakeConfetti`, `glitchText`, `unGlitchText`, `setCustomCursor`, `removeCustomCursor`, `playBoxVideo`, `closeBoxVideo` |
| `stage-lighting.js` | `setStageLighting({ color, transition, ... })` |
| `audio.js` | `PlaySFX`, `PlayRegularSFX`, `playAudio(url, { loop, fadeIn, fadeOut, fadeDuration })` |
| `volume.js` | In-game volume keys (`-` `+` `M`), `modVolume` |
| `ambience.js` | `setAmbience(name)`, `stopAmbience()` |
| `messages.js` | `QuickMessage`, `showImagePopup`, `showSpeechBubble`, `rightPopup`/`leftPopup`/`topPopup`/`bottomPopup`, `fullPopup`, `toast.show` |
| `lyrics.js` | `poloLyrics`, `stopLyrics`, `stopLyricsImmediate` |
| `pictos.js` | `AddPicto`, `RemovePicto`, `ReplacePictoID`, `movePictoLine`, `setPictoLayer`, `replacePictoSprite`, `initShakingPicto`/`clearShakingPicto`, `wigglePictos`/`stopWiggle`, `impactIcons` |
| `polos.js` | `forceAddPolo`, `forceRemovePoloById`, `forceRemovePoloByPictoId`, `delayRemovePoloById`, `cancelDelayRemovePoloById`, `replaceDefaultPolo`, `replaceAllDefaultPolos`, `ReplacePoloSprite`, `impactPolos`, `forceMod` |
| `background.js` | `replaceBackgroundSprite`, `setBackgroundLayer`, `setEventBackgroundLayer`, `replaceHome` |
| `version-select.js` | Version icons from `data/versions.xml`, `Hide`, `unHide`, `unLock` |
| `credits.js` | `OpenModCredits` and the credits text codes |
| `settings-menu.js` | Settings switches, reset buttons, achievements dot |
| `mod-library.js` | Played Mods registration, mod news, update notices |
| `about.js` | `openAboutPop` |
| `mod-buttons.js` | `addModBt` (buttons from `js/buttons.js`) |
| `custom-ui.js` | `initCustomUI` (entries from `js/customUI.js`), `getCustomUIValue`, `setCustomUIValue` |
| `special-events.js` | Snow |
| `lifecycle.js` | `modLoaded()` → your `afterModLoads()` |
| `keys.js` | `onKey`, `onKeyHold`, `registerHotkey`, `registerHotkeyText`, `openHotkeyMenu` |
| `achievements.js` | `setAchievement`, `unlockAchievement`, `addProgressAchievement` |
| `achievements-counter.js` | Achievement tab counters/filters (app.html) |
| `clouds.js` | `CloudSystem.init({...})` (app.html) |

## Hooks you can define in `js/mod.js`

The engine calls these if they exist (`X` = version number, `N` = picto/bonus number):

- `onAppStart()`, `afterModLoads()`
- `onVXStart()`, `onVXMix()`, `offVXMix()`
- `onVXPoloN()`, `offVXPoloN()`, `onVXPoloNSwap()`, `onVXPoloNWaitSwap()`
- `onVXPoloNDelayRemove(pending)` (picto N set to leave on the next loop, or cancelled)
- `onVXBonusNUnlock()`, `onVXBonusNStart()`, `onVXBonusNEnd()`
- `onIconSelect()`, `onIconSelectN()`, `onLockedIcon()`, `onLockedIconN()` (menu version icons)
- `onModCreditsOpen()`
- `onBoxVersionClickedX()`, `onImgVersionClickedX()`, `onBoxTitleClickedX()`, `onImgTitreClickedX()`

## Game engine (`js/engine/`, in load order)

| File | Contents |
|---|---|
| `app-data.js` | Loading/normalizing version data (`initVersions`, `loadAppFile`, Modbox format) |
| `utils.js` | Engine helpers (arrays, xhr, file names, URLs, time, CSS transitions) |
| `layout.js` | Polo metrics, polo size XML, `resizeApp` |
| `device.js` | Build flags, device/platform detection |
| `rules-css.js` | Per-version generated CSS |
| `ui/dialog.js` | `BoxDialog` and `Popup` |
| `ui/popups.js` | All game popups |
| `ui/modbox-credits.js` | Credits for Modbox-format versions |
| `ui/mix-form.js` | Save-mix form, convert/saved popups |
| `i18n.js` | Languages, `STR()` |
| `loader.js` | Asset preloading |
| `storage.js` | Saved data, `LocalMixObject` |
| `objects/bonus.js` `clock.js` `reading-bar.js` `render.js` | Bonus, clock, reading bar, RAF/spinner/buttons |
| `focus.js` | Keyboard navigation |
| `params.js` | Dark mode, HD mode, reset bonuses |
| `window.js` | jQuery element vars, exit menu, fullscreen |
| `init.js` | Page start-up sequence, `switchVersion` |
| `home.js` | Version home screen, global game state |
| `game.js` | Game screen, polos/pictos, drag & drop, delayed removal (`delayRemovePolo`) |
| `loop.js` | Music loop and bonus flow, `stopAllStage` |
| `pause.js` | Audio contexts, pause/resume, freeze |
| `queries.js` | State helpers (busy/free lists, lock/unlock) |
| `audio.js` | Main AudioContext and gain |
| `objects/sound.js` `objects/picto.js` | `SoundObject`, `PictoObject` |
| `events.js` | Special events, startup/exit animation XML |
| `objects/polo-keyframes.js` | Custom polo movements: `_loadAnime_rebond/deshabiller/remonte(self)`, `defaultPoloAnime`, `deg()` |
| `objects/polo.js` | `PoloObject` |
| `mixlist.js` | Playlist / saved mixes |
| `version-config.js` | `data/configs/versionConfig.jsonc` |
| `picto-layout.js` | `data/configs/uiLayout.jsonc` custom picto positions |
| `modes/random.js` `record.js` `replay.js` | Auto mode, recording, replay |
| `objects/replay-mix.js` | `ReplayMix` |
| `convert.js` | Flash XML conversion, MP3 export |

## Lore popup

Data: `lore/data/vX.xml`, images: `lore/img/vX/`, code: `lore/lore.js`, look: `css/lore.css`,
HTML template: `#lore-popup` in `app.html`.
