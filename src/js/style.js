// Tab Selection for Recipes List

$(".recipeSelect").on("click", tabHighlight);

function tabHighlight(e) {
    $(".recipeSelect").removeClass("selected");
    $(e.currentTarget).addClass("selected");
}

// Tab Selection for Navigation

$(".tablinks").on("click", navTabHighlight);

function navTabHighlight(e, tab = null) {
    $(".tablinks").removeClass("tab-selected");
    if (tab) $(tab).addClass("tab-selected");
    else $(e.currentTarget).addClass("tab-selected");
}

// Back To Top Button

const $backToTopButton = $(".back-to-top");

if ($backToTopButton) $(window).scroll(() => {
    if ($("body").scrollTop() || $(document).scrollTop() > 200) $backToTopButton.addClass("show-button");
    else $backToTopButton.removeClass("show-button");
});

// Toast Positioning Setting

$(document).on("change", ".toastPositionSelection", () => {
    $toastSettings.removeAttr("checked");
    $(e.target).attr("checked", "checked")
    $.toast().reset('all');
    settings.toastPosition = $(e.target).val();
    saveSettings();
});

// Event Functions

function disableEventLayers() {
    $(".bgContainer .layer").removeClass("christmasEvent"); // Add event classes to be removed
}

function enableChristmasLayers() {
    $(".bgContainer .layer").addClass("christmasEvent");
}

//

const $dbpanel = $("#db-panel");
let dbi = 0;

function dbEnable() {
    $dbpanel.empty();
    dbi = 0;

    const d = $("<button/>").addClass("dbClose").html(`<i class="fas fa-times"></i>`);

    const d1 = $("<div/>").addClass("singleActionContainer");
        const d1a = $("<div/>");
            $("<button/>").addClass("gmOption dbActionButton").html("God Mode").appendTo(d1a);
        const d1b = $("<div/>");
            $("<button/>").addClass("heroTestOption dbActionButton").html("Hero Equipment Test").appendTo(d1b);
        const d1c = $("<div/>");
            $("<button/>").addClass("materialOption dbActionButton").html("Add Materials").appendTo(d1c);
        const d1d = $("<div/>");
            $("<button/>").addClass("dmOption dbActionButton").html("UI / UX Mode").appendTo(d1d);
        const d1e = $("<div/>");
            $("<button/>").addClass("hyperSpeedOption dbActionButton").html("Hyper Speed").appendTo(d1e);
        const d1f = $("<div/>");
            $("<button/>").addClass("forceTownOption dbActionButton").html("Unlock Town").appendTo(d1f);
        const d1g = $("<div>");
            $("<button/>").addClass("dungeonUnlockOption dbActionButton").html("Unlock Dungeons").appendTo(d1g);
        const d1h = $("<div/>");
            $("<button/>").addClass("heroUnlockOption dbActionButton").html("Unlock Heroes").appendTo(d1h);
        const d1i = $("<div/>");
            $("<button/>").addClass("perkUnlockOption dbActionButton").html("Unlock Perks").appendTo(d1i);
        const d1j = $("<div/>");
            $("<button/>").addClass("trinketUnlockOption dbActionButton").html("Add Trinkets").appendTo(d1j);
        const d1k = $("<div/>");
            $("<button/>").addClass("testRealmUnlockOption dbActionButton").html("Test Dungeon").appendTo(d1k);
        const d1l = $("<div/>");
            $("<button/>").addClass("timewarpOption dbActionButton").html("Time Warp").appendTo(d1l);
        d1.append(d1a,d1b,d1c,d1d,d1e,d1f,d1g,d1h,d1i,d1j,d1k,d1l);

    const d4 = $("<div/>").addClass("addItemContainer dbActionContainer");
        const d4a = $("<div/>").addClass("addItemTitle").html("Add Item to Inventory");
        const d4b = $("<input/>").addClass("addItemName").attr("placeholder", "Item ID");
        const d4c = $("<input/>").addClass("addItemRarity").attr("placeholder", "Item Rarity");
        const d4d = $("<button/>").addClass("addItemBtn dbActionButton").html("Add");
    d4.append(d4a,d4b,d4c,d4d);

    const d5 = $("<div/>").addClass("gearHeroesContainer dbActionContainer");
        const d5a = $("<div/>").addClass("gearHeroesTitle").html("Add Gear to Heroes");
        const d5b = $("<input/>").addClass("gearHeroesLevel").attr("placeholder", "Gear Level");
        const d5c = $("<input/>").addClass("gearHeroesRarity").attr("placeholder", "Gear Rarity");
        const d5d = $("<input/>").addClass("gearHeroesSharp").attr("placeholder", "Gear Sharp");
        const d5e = $("<button/>").addClass("gearHeroesBtn dbActionButton").html("Gear");
    d5.append(d5a,d5b,d5c,d5d,d5e);

    const d6 = $("<div/>").addClass("addGoldContainer dbActionContainer");
        const d6a = $("<div/>").addClass("addGoldTitle").html("Add Gold");
        const d6b = $("<input/>").addClass("addGoldInput").attr("placeholder", "0");
        const d6c = $("<button/>").addClass("addGoldBtn dbActionButton").html("Add");
    d6.append(d6a,d6b,d6c);

    const d7 = $("<div/>").addClass("adjustSpeedContainer dbActionContainer");
        const d7a = $("<div/>").addClass("adjustSpeedTitle").html("Adjust Speed");
        const d7b = $("<input/>").addClass("adjustSpeedInput").attr("placeholder", "0.0");
        const d7c = $("<button/>").addClass("adjustSpeedBtn dbActionButton").html("Adjust");
    d7.append(d7a,d7b,d7c);

    $dbpanel.append(d,d1,d4,d5,d6,d7);
    $dbpanel.css("display", "block");

    settings.db = 1;
    settings.dialogStatus = !settings.dialogStatus;
    saveSettings();
    checkDB();
}

function addButtonDB() {
    let dbButton = $("#debug");
    if (!dbButton.length) {
        dbButton = $("<a/>").attr("id", "debug").addClass("isDialog tooltip").attr("data-tooltip", "debug").html(`<i class="fas fa-bug"></i><div class="footerButtonText">Debug</div>`)
        $("#bottom-left").append(dbButton);
    }
}

function checkDB() {
    if (settings.db === 1) addButtonDB();
}

checkDB();

$(document).on('click', '.materialOption', (e) => {
    devtools.materials();
});

$(document).on('click', '.forceTownOption', (e) => {
    devtools.forceTown();
});

$(document).on('click', '.hyperSpeedOption', (e) => {
    devtools.hyperSpeed();
});

$(document).on('click', '.dmOption', (e) => {
    devtools.designmode();
});

$(document).on('click', '.dungeonUnlockOption', (e) => {
    devtools.dungeonUnlock();
})

$(document).on('click', '.heroUnlockOption', (e) => {
    devtools.heroUnlock();
})

$(document).on('click', '.perkUnlockOption', (e) => {
    devtools.allPerks();
})

$(document).on('click', '.trinketUnlockOption', (e) => {
    devtools.addTrinkets();
});

$(document).on('click', '.testRealmUnlockOption', (e) => {
    devtools.testRealm();
})

$(document).on('click', '.timewarpOption', (e) => {
    devtools.timeWarp();
})

$(document).on('click', '.addGoldBtn', (e) => {
    const goldAmount = parseInt(document.querySelector(".addGoldInput").value);
    devtools.addGold(goldAmount);
});

$(document).on('click', '.adjustSpeedBtn', (e) => {
    const speedAmount = parseFloat(document.querySelector(".adjustSpeedInput").value).toFixed(2);
    devtools.speed(speedAmount);
});

$(document).on('click', '.gearHeroesBtn', (e) => {
    let itemLevel = Math.min(10,parseInt(document.querySelector(".gearHeroesLevel").value));
    if (itemLevel === undefined) itemLevel = 1;
    let itemRarity = Math.min(3,parseInt(document.querySelector(".gearHeroesRarity").value));
    if (itemRarity === undefined) itemRarity = 3;
    let itemSharp = Math.min(10,parseInt(document.querySelector(".gearHeroesSharp").value));
    if (itemSharp === undefined) itemSharp = 0;
    devtools.gearHeroes(itemLevel,itemRarity,itemSharp);
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
    setDialogClose();
    $dbpanel.css("display", "none");
});

$(document).on('click', '#debug', (e) => {
    dbEnable();
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

// Clear Settings

$(document).on('click', '#clearSettings', (e) => {
    e.preventDefault();
    clearSettings();
});
