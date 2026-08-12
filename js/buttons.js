modBtList = [
    {
        id: "home",
        icon: "#ic-home",
        skipIndex: true,
        function: function () {
            gotoAppUrl();
        },
    },
    {
        id: "lore",
        icon: "#ic-lore",
        skipIndex: true,
        function: () => { }, // the functionality of this button is handled elsewhere
    },
    // EXAMPLE BUTTON
    /*
    {
        id: "test", // button id
        icon: "#ic-note", // svg icon
        skipIndex: false, // if the button shouldn't appear in index.html
        skipApp: false, // if the button shouldn't appear in app.html
        version: 2, // if the button should appear in a specific version
        position: "", // position of the button: tl (top left), or tr (top right/default)
        function: function () { // what happens when the button is pressed
            customPopup("popupExample", "<div class='title'>Custom Popup</div><div class='text'>This is an example popup!</div>");
        },
    },
    */
];