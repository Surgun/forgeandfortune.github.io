// Settings Management
// Initial settings code for loading and saving is placed here, 
// place all individual settings code and management in the style.js file

const settings = {
    toastPosition: "",
    battleLogLength: 15,
    theme: 0
}

function saveSettings() {
    localStorage.setItem("settings", JSON.stringify(settings));
}

function loadSettings() {
    const obj = JSON.parse(localStorage.getItem("settings"));
    for (let setting in obj) {
        settings[setting] = obj[setting];
    }
    localStorage.setItem("settings", JSON.stringify(settings));
}

loadSettings();