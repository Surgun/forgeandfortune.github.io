// Tab Selection for Recipes List

const recipeItems = document.querySelectorAll(".recipeSelect");

recipeItems.forEach((recipeItem) => recipeItem.addEventListener("click", tabHighlight));

function tabHighlight() {
    recipeItems.forEach((recipeItem) => recipeItem.classList.remove("selected"));
    this.classList.add("selected");
}

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
}

// Status Container Expand and Collapse

const sideHeadings = document.querySelectorAll("#side-content .heading");

sideHeadings.forEach((heading) => heading.addEventListener("click", toggleState));

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
}

const versionHeadings = document.querySelectorAll("#cc-container .version-heading");

versionHeadings.forEach((heading) => heading.addEventListener("click", toggleAboutState));

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
}

// Back To Top Button

const backToTopButton = document.querySelector(".back-to-top");

function backToTop() {
    if (document.body.scrollTop || document.documentElement.scrollTop > 200) {
        backToTopButton.classList.add("show-button");
    } else {
        backToTopButton.classList.remove("show-button");
    }
}

if (backToTopButton) window.onscroll = () => backToTop();

// Dialog Behavior and Tracking

const dialogs = document.querySelectorAll(".dialog");
const dialogsCloseButtons = document.querySelectorAll(".dialog_close");
const dialogTriggers = document.querySelectorAll(".isDialog");

dialogs.forEach((dialog) => dialog.addEventListener("click", closeDialog));
dialogsCloseButtons.forEach((closeButton) => closeButton.addEventListener("click", setDialogClose));
dialogTriggers.forEach((dialogTrigger) => dialogTrigger.addEventListener("click", setDialogOpen));

function closeDialog(dialog) {
    if (this === dialog.target) {
        window.location.assign("#closeDialog");
        setDialogClose();
    }
}

function setDialogOpen() {
    settings.dialogStatus = 1;
    saveSettings();
}

function setDialogClose() {
    settings.dialogStatus = 0;
    saveSettings();
}

if (window.location.href.indexOf("#dialog") > -1) {
    setDialogOpen();
} else {
    setDialogClose();
}

// Export Copy Click Feedback

const clipboardButton = document.querySelector("#exportSaveCopy");

function clipboardText() {
    if(document.querySelector(".ClipboardCopy")) {
        document.querySelector(".ClipboardCopy").remove();
    }
    const copyAlert = document.createElement('div');
    copyAlert.innerHTML = "Copied to clipboard.";
    copyAlert.classList.add("ClipboardCopy");
    clipboardButton.insertAdjacentElement("afterend", copyAlert);
    setTimeout(()=>{
        document.querySelector(".ClipboardCopy").style.opacity = 0;
    }, 2500);
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
    if(parseInt(selection.querySelector("input").value) === settings.theme) {
        selection.querySelector("input").setAttribute("checked", "checked")
    }
});

function assignTheme(e) {
    const option = e.target.getAttribute("value");
    themeSettings.forEach((selection) => {
        selection.querySelector("input").removeAttribute("checked")
    });
    e.target.setAttribute("checked", "checked");
    settings.theme = parseInt(option);
    saveSettings();
    checkTheme();
}

function checkTheme() {
    if (settings.theme === 1) {
        document.body.classList.add("lightmode");
    } else if (settings.theme === 0) {
        document.body.classList.remove("lightmode");
    }
}

checkTheme();

// Battle Log Length Setting

const battleLogSetBtn = document.querySelector('#battleLogSet');
const battleLogResetBtn = document.querySelector('#battleLogReset');
const battleLogLengthInput = document.querySelector('#battleLogValue');

if (battleLogSetBtn && battleLogResetBtn && battleLogLengthInput) {
    battleLogSetBtn.addEventListener("click", assignLogLength);
    battleLogResetBtn.addEventListener("click", resetLogLength);
    battleLogLengthInput.value = settings.battleLogLength;
}

function assignLogLength() {
    if (battleLogLengthInput.value < 5 || battleLogLengthInput.value > 100) {
        addLogNotice("Invalid Value!");
    } else {
        BattleLog.logLength = battleLogLengthInput.value;
        settings.battleLogLength = BattleLog.logLength;
        BattleLog.clear();
        addLogNotice("Updated!");
        saveSettings();
    }
}

function resetLogLength() {
    settings.battleLogLength = 30;
    BattleLog.logLength = settings.battleLogLength;
    battleLogLengthInput.value = settings.battleLogLength;
    BattleLog.clear();
    addLogNotice("Reset!");
    saveSettings();
}

function addLogNotice(notice) {
    if (document.querySelector('.battleLogNotice')) {
        document.querySelector('.battleLogNotice').remove();
    }
    const battleLogNotice = document.createElement('div');
    battleLogNotice.classList.add('battleLogNotice');
    battleLogNotice.innerHTML = notice;
    battleLogResetBtn.insertAdjacentElement('afterend', battleLogNotice);
    setTimeout(()=>{
        document.querySelector(".battleLogNotice").style.opacity = 0;
    }, 2500);
}

// Toggle Turn Order Bars Setting

const turnOrderSettings = document.querySelectorAll("#settings_turnOrderDisplay .selection-container");

turnOrderSettings.forEach((selection) => {
    selection.addEventListener("input", assignTurnOrderPref);
    if(parseInt(selection.querySelector("input").value) === settings.toggleTurnOrderBars) {
        selection.querySelector("input").setAttribute("checked", "checked");
    }
});

function assignTurnOrderPref(e) {
    const option = e.target.getAttribute("value");
    turnOrderSettings.forEach((selection) => {
        selection.querySelector("input").removeAttribute("checked")
    });
    e.target.setAttribute("checked", "checked");
    settings.toggleTurnOrderBars = parseInt(option);;
    saveSettings();
    checkTurnOrderPref();
}

function checkTurnOrderPref() {
    const containers = document.querySelectorAll(".orderUnitHP, .orderUnitAP");
    if (settings.toggleTurnOrderBars === 1) {
        containers.forEach((container) => {
            container.classList.remove("none");
        });
        
    } else if (settings.toggleTurnOrderBars === 0) {
        containers.forEach((container) => {
            container.classList.add("none");
        });
    }
}

// Logo Easter Egg

const $gameLogo = $("#game-logo");
let logoNum = 0;

$gameLogo.click(() => {
    logoNum += 1;
    if (logoNum === 1) $gameLogo.css("background-image","url('images/site-logo.png')");
    else if (logoNum === 2) $gameLogo.css("background-image","url('images/site-logo2.png')");
    else {
        $gameLogo.css("background-image","url('images/site-logo.png')");
        logoNum = 0;
    }
});

// Event Functions

function disableEventLayers() {
    const layers = document.querySelectorAll(".bgContainer .layer");
    layers.forEach((layer)=> {
        layer.classList.remove("christmasEvent"); // Add event classes to be removed
    });
}

function enableChristmasLayers() {
    const layers = document.querySelectorAll(".bgContainer .layer");
    layers.forEach((layer)=> {
        layer.classList.add("christmasEvent");
    });
}

//

const $dbpanel = $("#db-panel");
let dbi = 0;

function dbEnable() {
    $dbpanel.empty();
    dbi = 0;
    const d = $("<button/>").addClass("dbClose").html("Close Debug");

    const d1 = $("<div/>").addClass("gmContainer");
        const d1a = $("<button/>").addClass("gmOption").html("Enable God Mode");
    d1.append(d1a);

    const d2 = $("<div/>").addClass("heroTestContainer");
        const d2a = $("<button/>").addClass("heroTestOption").html("Enable Hero Test");
    d2.append(d2a);

    const d3 = $("<div/>").addClass("materialContainer");
        const d3a = $("<button/>").addClass("materialOption").html("Add Materials");
    d3.append(d3a);

    const d4 = $("<div/>").addClass("addItemContainer");
        const d4a = $("<h5/>").addClass("addItemTitle").html("Add Item to Inventory");
        const d4b = $("<input/>").addClass("addItemName").attr("placeholder", "Item ID");
        const d4c = $("<input/>").addClass("addItemRarity").attr("placeholder", "Item Rarity");
        const d4d = $("<button/>").addClass("addItemBtn").html("Add");
    d4.append(d4a,d4b,d4c,d4d);

    const d5 = $("<div/>").addClass("gearHeroesContainer");
        const d5a = $("<h5/>").addClass("gearHeroesTitle").html("Add Gear to Heroes");
        const d5b = $("<input/>").addClass("gearHeroesLevel").attr("placeholder", "Gear Level");
        const d5c = $("<input/>").addClass("gearHeroesRarity").attr("placeholder", "Gear Rarity");
        const d5d = $("<button/>").addClass("gearHeroesBtn").html("Gear");
    d5.append(d5a,d5b,d5c,d5d);

    const d6 = $("<div/>").addClass("addGoldContainer");
        const d6a = $("<h5/>").addClass("addGoldTitle").html("Add Gold");
        const d6b = $("<input/>").addClass("addGoldInput").attr("placeholder", "0");
        const d6c = $("<button/>").addClass("addGoldBtn").html("Add");
    d6.append(d6a,d6b,d6c);

    const d7 = $("<div/>").addClass("adjustSpeedContainer");
        const d7a = $("<h5/>").addClass("adjustSpeedTitle").html("Adjust Speed");
        const d7b = $("<input/>").addClass("adjustSpeedInput").attr("placeholder", "0.0");
        const d7c = $("<button/>").addClass("adjustSpeedBtn").html("Adjust");
    d7.append(d7a,d7b,d7c);

    $dbpanel.append(d,d1,d2,d3,d4,d5,d6,d7);
    $dbpanel.css("display", "block");
}

$(document).on('click', '.materialOption', (e) => {
    devtools.materials();
});

$(document).on('click', '.addGoldBtn', (e) => {
    const goldAmount = parseInt(document.querySelector(".addGoldInput").value);
    devtools.addGold(goldAmount);
});

$(document).on('click', '.adjustSpeedBtn', (e) => {
    const speedAmount = parseFloat(document.querySelector(".adjustSpeedInput").value).toFixed(2);
    devtools.speed(speedAmount);
});

$(document).on('click', '.gearHeroesBtn', (e) => {
    const itemLevel = parseInt(document.querySelector(".gearHeroesLevel").value);
    const itemRarity = parseInt(document.querySelector(".gearHeroesRarity").value);
    devtools.gearHeroes(itemLevel,itemRarity);
});

$(document).on('click', '.addItemBtn', (e) => {
    const itemName = (document.querySelector(".addItemName").value).toString();
    const itemRarity = parseInt(document.querySelector(".addItemRarity").value);
    devtools.addItem(itemName,itemRarity);
});

$(document).on('click', '.gmOption', (e) => {
    devtools.godmode();
});

$(document).on('click', '.heroTestOption', (e) => {
    devtools.heroTest();
});

$(document).on('click', '.dbClose', (e) => {
    $dbpanel.css("display", "none");
});

$(document).on('click', '#db-init', (e) => {
    (dbi >= 6) ? dbEnable() : dbi++;
});

$(document).on('click', '.recipeCraft', (e) => {
    const $button = $(e.currentTarget);
    $(".recipeCraft").removeClass('btn-press');
    $button.addClass('btn-press');
    resetBtnPressAnimation();
});

// Animation for Craft button clicks

function resetBtnPressAnimation() {
    const btns = document.getElementsByClassName('btn-press');
    Array.prototype.forEach.call(btns, (btn) => {
        btn.style.animation = 'none';
        btn.offsetHeight;
        btn.style.animation = null; 
    });
}
