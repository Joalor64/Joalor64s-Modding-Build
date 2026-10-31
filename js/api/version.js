/*
 * version.js
 * Version number of Joalor64's Modding Build (shown in Adv. Settings and the I + @ hotkey).
 */

const VERSION = {
    major: 0,
    minor: 2,
    patch: 0,

    prerelease: {
        type: "",
        version: null
    },

    build: null,
    hotfix: false
};

function getVersion(v = VERSION, readable = false) {
    let version = `${v.major}.${v.minor}.${v.patch}`;

    if (v.prerelease.type) {
        if (readable) {
            const names = {
                alpha: "Alpha",
                beta: "Beta",
                nightly: "Nightly",
                pre: "Pre-Release",
                rc: "Release Candidate"
            };

            version += ` ${names[v.prerelease.type]} ${v.prerelease.version}`;
        } else {
            version += `-${v.prerelease.type}.${v.prerelease.version}`;
        }
    }

    if (v.hotfix) {
        if (readable) {
            version += " (Hotfix)";
        } else {
            version += "h";
        }
    }

    if (v.build !== null) {
        version += `+${v.build}`;
    }

    return version;
}
