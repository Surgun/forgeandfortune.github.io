// Tab Selection for Recipes List

var recipeItem = document.querySelectorAll("#RecipeFilter a.recipeSelect");

for (i = 0; i < recipeItem.length; i++) {
    recipeItem[i].addEventListener("click", tabHighlight);
};

function tabHighlight() {
    for (i = 0; i < recipeItem.length; i++) {
        recipeItem[i].classList.remove("selected");
    };
    this.classList.add("selected");
};

// Tab Selection for Navigation

const navTabs = document.querySelectorAll(".tablinks");

navTabs.forEach((navTab) => {
    navTab.addEventListener("click", navTabHighlight);
});

function navTabHighlight(evt, tgt) {
    navTabs.forEach((navTab) => {
        navTab.classList.remove("tab-selected");
    });
    if (tgt) {
        tgt.classList.add("tab-selected");
    } else {
        evt.target.parentNode.classList.add("tab-selected");
    }      
};

// Status Container Expand and Collapse

const sideHeadings = document.querySelectorAll("#side-content .heading");

for (i = 0; i < sideHeadings.length; i++) {
    sideHeadings[i].addEventListener("click", toggleState);
};

function toggleState(e) {
    if (e.currentTarget.parentNode.classList.contains("height-collapse")) {
        e.currentTarget.parentNode.classList.remove("height-collapse");
        let arrow = e.currentTarget.getElementsByClassName("heading-arrow");
        arrow[0].classList.remove("arrow-rotate");
    } else {
        e.currentTarget.parentNode.classList.add("height-collapse");
        let arrow = e.currentTarget.getElementsByClassName("heading-arrow");
        arrow[0].classList.add("arrow-rotate");
    }
};

const versionHeadings = document.querySelectorAll("#cc-container .version-heading");

for (i = 0; i < versionHeadings.length; i++) {
    versionHeadings[i].addEventListener("click", toggleAboutState);
};

function toggleAboutState(e) {
    if (e.currentTarget.nextElementSibling.classList.contains("expanded")) {
        e.currentTarget.nextElementSibling.classList.remove("expanded");
        let arrow = e.currentTarget.getElementsByClassName("heading-arrow");
        arrow[0].classList.remove("arrow-rotate");
    } else {
        e.currentTarget.nextElementSibling.classList.add("expanded");
        let arrow = e.currentTarget.getElementsByClassName("heading-arrow");
        arrow[0].classList.add("arrow-rotate");
    }
};

/* Back To Top Button */

const backToTopButton = document.querySelector(".back-to-top");

function backToTop() {
    if (document.body.scrollTop || document.documentElement.scrollTop > 200) {
        backToTopButton.classList.add("show-button");
    } else {
        backToTopButton.classList.remove("show-button");
    }
}

if (backToTopButton) window.onscroll = () => backToTop();

/* Close Dialogs with Click Outside of Element */

const dialogs = document.querySelectorAll(".dialog");

dialogs.forEach((dialog) => dialog.addEventListener("click", closeDialog));

function closeDialog(dialog) {
    if (this === dialog.target) window.location.assign("#closeDialog");
}

/* Export Copy Click Feedback */

const clipboardButton = document.querySelector("#exportSaveCopy");

function clipboardText() {
    if(document.querySelector(".ClipboardCopy")) {
        document.querySelector(".ClipboardCopy").remove();
    }
    const copyAlert = document.createElement('div');
    copyAlert.innerHTML = "Copied to clipboard.";
    copyAlert.classList.add("ClipboardCopy");
    clipboardButton.insertAdjacentElement("afterend", copyAlert);
}

if (clipboardButton) {
    clipboardButton.addEventListener("click", clipboardText);
}

// Toast Positioning Setting

const toastSettings = document.querySelectorAll("#settings_notificationLocation .selection-container");

toastSettings.forEach((selection) => {
    selection.addEventListener("input", assignToastPosition);
    if(selection.querySelector("input").value === settings.toastPosition) {
        selection.querySelector("input").setAttribute("checked", "checked")
    };
});

function assignToastPosition(e) {
    const option = e.target.getAttribute("value");
    toastSettings.forEach((selection) => {
        selection.querySelector("input").removeAttribute("checked")
    });
    e.target.setAttribute("checked", "checked");
    toastPosition = option;
    $.toast().reset('all');
    settings.toastPosition = toastPosition;
    saveSettings();
}

// Theme Management Setting

const themeSettings = document.querySelectorAll("#settings_siteTheme .selection-container");

themeSettings.forEach((selection) => {
    selection.addEventListener("input", assignTheme);
    if(selection.querySelector("input").value === settings.theme) {
        selection.querySelector("input").setAttribute("checked", "checked")
    };
});

function assignTheme(e) {
    const option = e.target.getAttribute("value");
    themeSettings.forEach((selection) => {
        selection.querySelector("input").removeAttribute("checked")
    });
    e.target.setAttribute("checked", "checked");
    theme = option;
    settings.theme = theme;
    saveSettings();
    checkTheme();
}

function checkTheme() {
    if (settings.theme == 1) {
        document.body.classList.add("lightmode");
    } else if (settings.theme == 0) {
        document.body.classList.remove("lightmode");
    }
}

checkTheme();

// Battle Log Length Setting

const battleLogSetBtn = document.querySelector('#battleLogSet');
const battleLogResetBtn = document.querySelector('#battleLogReset');
const battleLogLengthInput = document.querySelector('#battleLogValue');
const battleLogNotice = document.createElement('div');

battleLogSetBtn.addEventListener("click", assignLogLength);
battleLogResetBtn.addEventListener("click", resetLogLength);
battleLogLengthInput.value = settings.battleLogLength;

function assignLogLength() {
    if (battleLogLengthInput.value < 5 || battleLogLengthInput.value > 100) {
        battleLogNotice.innerHTML = "Invalid Value!";
        addLogNotice();
        return;
    } else {
        battleLogNotice.innerHTML = "Updated!";
        BattleLog.logLength = battleLogLengthInput.value;
        settings.battleLogLength = BattleLog.logLength;
        addLogNotice();
        saveSettings();
    }
}

function resetLogLength() {
    battleLogNotice.innerHTML = "Reset!";
    settings.battleLogLength = 15;
    BattleLog.logLength = settings.battleLogLength;
    battleLogLengthInput.value = settings.battleLogLength;
    addLogNotice();
    saveSettings();
}

function addLogNotice() {
    if (document.querySelector('.battleLogNotice')) {
        document.querySelector('.battleLogNotice').remove();
    }
    battleLogNotice.classList.add('battleLogNotice');
    battleLogResetBtn.insertAdjacentElement('afterend', battleLogNotice);
}

// Logo Easter Egg

const $gameLogo = $("#game-logo");
let logoNum = 0;

$gameLogo.click((e) => {
    logoNum += 1;
    if (logoNum === 1) $gameLogo.css("background-image","url('images/site-logo.png')");
    else if (logoNum === 2) $gameLogo.css("background-image","url('images/site-logo2.png')");
    else {
        $gameLogo.css("background-image","none");
        logoNum = 0;
    }
});

