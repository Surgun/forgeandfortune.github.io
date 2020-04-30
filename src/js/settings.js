// Settings Management
// Initial settings code for loading and saving is placed here, 
// place all individual settings code and management in the style.js file

const settings = {
    lang: 'en',
    toastPosition: "top-left",
    dialogStatus: 0,
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
    portSettings();
    localStorage.setItem("settings", JSON.stringify(settings));
}

function clearSettings() {
    localStorage.removeItem("settings");
    location.replace('/');
}

loadSettings();

// Port Settings - Remove old settings, update to new setting values, etc.
function portSettings() {
    delete settings.expandedLogistics;
    delete settings.toggleTurnOrderBars;
    delete settings.battleLogLength;
    delete settings.expandedMaterials;
}
