# Incredibox - Mod Launcher
A mod launcher for RMB-based Incredibox mods!

**NOTE: V8-based mods do work on this! Sometimes, at least.**

Note that this only works on desktop for the time being! <br>
I'll try to get it working on mobile later...

## mod.json
Put a `mod.json` next to the mod's `src/` folder:

```json
{
    "id": "joalor64.my-mod",
    "name": "My Mod",
    "author": "Me",
    "version": "1.0.0",
    "RMBVersion": "0.2.0",
    "description": "Some <b>description</b>",
    "modLink": "https://youtu.be/...",
    "borderColor": "#919191",
    "icon": "icon.png",
    "banner": "banner.png",
    "startupAnim": "startup-anim",
    "startupSound": "startup.ogg"
}
```

`id` decides where the mod's saved data lives (each mod has its own: saves, bonuses, achievements, settings).
Pick one once and never change it. Without it, the name + author are used, so renaming the mod would start
its data fresh.

## Saves
Every mod keeps its own saves (saved mixes, unlocked bonuses, achievements, settings). The **save button**
on a mod's card shows how much it has saved and lets you:
- **Export** them to a `.jmbsave` file (readable JSON), to back them up or move them to another PC
- **Import** a `.jmbsave` file (it replaces the mod's current saves; you're warned if the file comes from another mod)
- **Delete** them

## Deleting a mod
- Mods **installed from a .zip** (they live in `resources/mods/` with a `.launcher-install` file): their files
  are moved to the Recycle Bin.
- Mods **imported as a folder**, or folders you made yourself: only removed from the list, your files stay.
- "Also delete its saves" deletes the mod's saves too.

## Where installed mods go
Mods installed from a .zip go to `%APPDATA%\Incredibox\mods` (the app's user data folder), so they survive
app and Electron upgrades. Mods installed by older versions in `resources/mods` keep working.

Installing a zip of a mod that's already installed (same `mod.json` "id", or name + author) asks first:
**Update** replaces its files in place (it keeps its card, favorite and saves), **Install separately** adds a
second copy, **Cancel** does nothing.

## Missing mods
If a mod's folder is moved, renamed or deleted, its card stays in the list marked **Not found**:
**Locate...** lets you pick its new folder, **Remove** takes it off the list.

## Adding mods by drag & drop
Drop a mod's `.zip` or its folder anywhere on the launcher: same as the "+" card (a zip of an
already installed mod asks whether to update it).

## Cards
- The badge shows which modding build the mod is made with: read from the mod's `src/js/api/version.js`
  (Joalor64's Modding Build), or `"JMBVersion"` / `"RMBVersion"` in `mod.json`. No badge when unknown.
- "Played 3 days ago" / "Never played" is recorded by the launcher each time you open the mod.
- The info button shows the last played time, the build, and an **Open folder** button.

## Sorting
Settings → **Sort by**: Name, Played (most recently played first) or Newest (most recently added first).
Favorites always come first.
