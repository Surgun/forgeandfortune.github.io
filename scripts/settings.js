// Settings Management
// Initial settings code for loading and saving is placed here, 
// place all individual settings code and management in the style.js file

const settings = {
    toastPosition: "top-left",
    dialogStatus: 0,
    battleLogLength: 30,
    theme: 0,
    toggleTurnOrderBars: 1,
    db: 0
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

function clearSettings() {
    localStorage.removeItem("settings");
    location.replace('/');
}

loadSettings();