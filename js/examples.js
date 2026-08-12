// This is the list of the functions that are used in this API
// Note that it is incomplete, as proper documentation will be added later on

// EFFECTS:
Shake(power, time); // shake the screen
FadeOut(color, time); // add fadeout effect on whole screen
ChangeColorBG(color, time, boolean); // change the background color - boolean is for if you want to keep the color forever
CleanColorBG(); // remove custom BG color (for example if you set it to stay forever)
Bloom(power, time); // add bloom effect
MakeConfetti(scale, spread, gravity, ticks, amount ,element, image); // make confetti - you can set element where it should appear, for example "custom-cursor"
playAudio(file, options); // play sound effect with options (loop, fadein, fadeout, fadeduration)
Zoom(zoomLevel, zoomInSmoothly, zoomOutSmoothly); // zoom in or out the screen | Example Zoom(105, true, false) - will zoom in smoothly by 5
setCustomCursor(image); // set custom cursor
particlesJS.load(particleCanvas, pathToJSON, callback); // load particles.js effect on the screen | Example: particlesJS.load('particle-js', 'asset-v1/particles.json', function() { console.log('callback - particles.js config loaded'); });
playAnimation(element, animationName, duration, timingFunction, delay, iterationCount, direction, fillMode); // play CSS animation on specific element with specific parameters
fullPopup(image, duration); // show full screen popup with image with an optional duration for how long you want it to be on-screen

// MESSAGES & TEXTS:
QuickMessage(text, time); // show message at the bottom of the screen, can be used for lyrics
showNotification(text); // show notification on top (It's used for debug purposes and its disabled, you need to remove .notification{display: none !important;} from CSS to see it)
ChangeMenuTitle(text); // change the title on the menu (for example "Select version to start mixing")
boxDialog.open(text, title, button, boolean); // open dialog box with text, title, button text and boolean if you want to make it not closable
boxDialog.close(); // close existing dialog box
rightPopup(text, time); // show popup on the right side of the screen
leftPopup(text, time); // show popup on the left side of the screen
bottomPopup(text, time); // show popup at the bottom of the screen
topPopup(text, time); // show popup at the top of the screen

// TRIGGERS:
onV1Polo0(); // trigger effects when polo 1 is used | onV2Polo19() - will trigger when polo 20 is used in v2, and etc.
onV1Polo0Swap(); // trigger effects when polo 1 is swapped | onV2Polo19() - will trigger when polo 20 is swapped in v2, and etc.
offV1Polo0(); // trigger effects when polo 1 is removed from mix | onV3Polo5() - will trigger when polo 6 is removed from mix in v3, and etc.
onV1Bonus1Unlock(); // trigger effects when bonus 1 is unlocked | onV2Bonus2Unlock() - will trigger when bonus 2 is unlocked in v2, and etc.
onV1Bonus1Start(); // trigger effects when bonus 1 is started | onV2Bonus2Start() - will trigger when bonus 2 is started in v2, and etc.
onV1Bonus1End(); // trigger effects when bonus 1 is finished | onV3Bonus3End() - will trigger when bonus 3 is finished in v3, and etc.
onV1Start(); // trigger effects when version 1 is started | onV2Start() - will trigger when version 2 is started, and etc.
onV1Mix(); // trigger effects when you start mixing | onV2Mix() - will trigger when you start mixing in v2, and etc.
offV1Mix(); // trigger effects when you stop mixing | offV8Mix() - will trigger when you stop mixing in v8, and etc.
onLockedIcon1(); // trigger effects when you click on locked icon 1 | onLockedIcon2() - will trigger when you click on locked icon 2, and etc.
onLockedIcon(); // trigger effects when you click on any locked icon
onIconSelect1(); // trigger effects when you click on icon 1
onIconSelect(); // trigger effects when you click on any icon
onKey(key, EFFECTS); // trigger effects when you press key | onKey("a", EFFECTS) - will trigger when you press "a" key, and etc.
onKeyHold(key, key, EFFECTS); // trigger effects when you hold key | onKeyHold("a", "b", EFFECTS) - will trigger when you hold "a" and "b" keys, and etc.
OnClick(element, EFFECTS); // trigger effects when you click on element with specific ID | OnClick("myElement", EFFECTS) - will trigger when you click on element with ID "myElement", and etc.

// Example of Trigger:
function onV1Polo1() {
    Shake(10, 500);
    Bloom(5, 500);
    MakeConfetti(3, 0.5, 0.5, 100, 100, "custom-cursor", "asset-v1/hang.png");
    PlaySFX("explosion.ogg");
    QuickMessage("BOOM!", 500);
}

// This will trigger when polo 2 is used in v1, it will shake the screen, add bloom effect, make confetti, play sound effect, show message "BOOM!" and it will last for 500ms

// TIME BASED TRIGGERS:
OnDelayIn(time, EFFECTS); // trigger function after some time
onBPM(bpm, EFFECTS); // trigger function on specific BPM
offBPM(); // stop triggering function on specific BPM
onLoop(loop, EFFECTS); // trigger function on specific loop
offLoop(); // stop triggering function on specific loop

// ACHIEVEMENTS:
setAchievement(modName, id, icon, name, description, type, maxProgress); // set achievement | types = normal, progress, hidden
addProgressAchievement(modName, id, amount); // add progress to achievement
unlockAchievement(modName, achievementId); // unlock achievement

// Example of Achievement:
OnDelayIn(500, function(){
    setAchievement(RegisterMod, "ach_1", "ach_thanks.png", "Thanks!", "Read the credits", "normal");
});

OnClick('home-bt-modcredits', function(){
    unlockAchievement(RegisterMod, "ach_1");
});

// It will unlock achievement "Thanks!" when you open the credits
// NOTE: You need to set achievements insdie OnDelayIn(), else it will not work | The same to any function that happen at the start of the page.
// NOTE: You need to restart achevement progress if you want to updated your mod achievements while workign on it.

// OTHERS:
RemovePicto(pictoNumber); // remove picto icon
AddPicto(pictoNumber, line); // add picto icon in specific line
Hide(version); // hide version in menu
unHide(version) // unhide version in menu
unLock(version); // unlock version
OnlyOnce(id, EFFECTS); // trigger function only once | The ID part is used to make sure it will trigger only once
ClearItemID(id); // clear item ID from OnlyOnce() function and Call() function
Call(id); // call function with specific ID | Its kinda like it save this ID for later use
Catch(id, EFFECTS); // it look for Called ID from Call() function and trigger effects
OpenModCredits(); // open mod credits
changeCssVariable(varName, value); // change CSS variable | Example: changeCssVariable('--main-color', '#FF0000')
loadJS(pathToJS); // load external JS file | Example: loadJS('js/myModScript.js')

// NOTE: Dynamicly adding new picto icons wont work correctly, if you want to add hidden sounds, add them first in apps.js and later remove at the start of the page
// Example of Call and Catch:

function onV1Start() {
    Call("Testing_v1start");
}

function onV2Start() {
    Catch("Testing_v1start", function(){
        OnDelayIn(500, function(){
            boxDialog.open("This message is sent from v1", "Info", "OK", true);
        });
    });
}

// This function saves "Testing_v1start" when you open V1, and when you will go to v2, you will get this message, if you wouldnt go to v1, this message wouldnt appear in v2