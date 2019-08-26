"use strict";

const $heroTab = $("#heroTab");
const $heroGear = $("#heroGear");
const $heroTrinket = $("#heroTrinket");
const $heroList = $("#heroList");
const $heroDetails = $("#heroDetails");
const $heroGearSlots = $("#heroGearSlots");
const $heroOverview = $("#heroOverview");

const slotName = ["Weapon","Head","Armament","Chest","Handheld","Accessory","Trinket"];
const statName = [`${miscIcons.hp} HP`,`${miscIcons.pow} Power`,`${miscIcons.spow} SPower`,`${miscIcons.ap} AP`,`${miscIcons.armor} Armor`,`${miscIcons.crit} Crit`,`${miscIcons.dodge} Dodge`];
const statDesc = [
    "Amount of damage your hero can sustain before being downed.",
    "Amount of damage your hero can deal.",
    "Amount of additional damage your hero can deal with special attacks.",
    "Amount of action points your hero needs to initiate their hero ability.",
    "Damage resistance your hero possesses.",
    "Chance of an attack dealing bonus damage.",
    "Chance your hero may avoid an enemy attack."
];

function initializeHeroList() {
    $heroList.empty();
    $("<div/>").attr("id","heroOverviewButton").addClass("heroOverviewButton highlight").html(`<i class="fas fa-info-circle"></i> Hero Overview`).appendTo($heroList);
    HeroManager.heroes.forEach(hero => {
        const d = $("<div/>").addClass("heroOwnedCard heroInspect").attr("data-value",hero.id);
        const d1 = $("<div/>").addClass("heroOwnedImage").html(hero.head);
        const d2 = $("<div/>").addClass("heroOwnedName").html(hero.name);
        const d3 = $("<div/>").addClass("heroPower").html(HeroManager.heroPower(hero));
        d.append(d1,d2,d3);
        if (!hero.owned) d.hide();
        $heroList.append(d);
    });
    if (HeroManager.heroes.filter(h=>!h.owned).length > 0) {
        const bh1 = $("<div/>").addClass("buyNewHeroCard")
        const bh2 = $("<div/>").addClass("buyNewHeroTitle").html(`Looking for more Heroes?`);
        const bh3 = $("<div/>").addClass("buyNewHeroDesc").html(`Gain notoriety with the Action League to unlock more!`);
        bh1.append(bh2,bh3);
        $heroList.append(bh1);
    }
    viewHeroOverview();
}

function viewHeroOverview() {
    $heroOverview.empty();
    const overviewContainer = $("<div/>").addClass("overviewContainer");
    const overviewTitle = $("<div/>").addClass("overviewTitle").html("Hero Overview");
    const overviewDesc = $("<div/>").addClass("overviewDescription").html("A quick glance at all your heroes and their stats.");
    HeroManager.heroes.filter(hero => hero.owned).forEach(hero => {
        const d = $("<div/>").addClass("heroOverviewCard heroInspect").attr("data-value",hero.id);
            const heroInfo = $("<div/>").addClass("heroOverviewInfo").appendTo(d);
                $("<div/>").addClass("heroOverviewImage").html(hero.image).appendTo(heroInfo);
                $("<div/>").addClass("heroOverviewName").html(hero.name).appendTo(heroInfo);
                $("<div/>").addClass("heroOverviewClass").html(hero.class).appendTo(heroInfo);
            const heroStats = $("<div/>").addClass("heroOverviewStats").appendTo(d);
                $("<div/>").addClass("heroOverviewHP overviewStat tooltip").attr("data-tooltip","HP").html(`${miscIcons.hp} ${hero.maxHP()}`).appendTo(heroStats);
                $("<div/>").addClass("heroOverviewAP overviewStat tooltip").attr("data-tooltip","AP").html(`${miscIcons.ap} ${hero.apmax}`).appendTo(heroStats);
            $("<div/>").addClass("heroOverviewPow overviewStat tooltip").attr("data-tooltip","POW").html(`${miscIcons.pow} ${hero.getPow()}`).appendTo(d);
            d.appendTo(overviewContainer)
    });
    $heroOverview.append(overviewTitle,overviewDesc,overviewContainer);
}

function examineHero(ID) {
    const hero = HeroManager.idToHero(ID);
    $heroDetails.empty();
    $heroGearSlots.empty();
    const heroExamineTop = $("<div/>").addClass("heroExamineTop heroExamineContainer");
    const d1 = $("<div/>").addClass("heroExamineName").html(hero.name);
    const d2 = $("<div/>").addClass("heroExamineImage").html(hero.image);
    const d3 = $("<div/>").addClass("heroExamineDescription").html(hero.description);
    const d4 = $("<div/>").addClass("heroExamineLvlClassContainer");
        $("<div/>").addClass("heroClassHeading").html("Hero Class").appendTo(d4);
        $("<div/>").addClass("heroClassText").html(hero.class).appendTo(d4);
    const d5 = $("<div/>").addClass("heroAbilityContainer");
        $("<div/>").addClass("heroAbilityHeading").html("Hero Ability").appendTo(d5);
        $("<div/>").addClass("heroAbilityText").html(hero.abilityDesc).appendTo(d5);
    heroExamineTop.append(d1,d2,d3,d4,d5);
    const heroExamineStats = $("<div/>").addClass("heroExamineStats heroExamineContainer");
    const htd = $("<div/>").addClass("heroExamineHeading");
    const htd1 = $("<div/>").addClass("heroExamineStatHeading").html("Hero Stats");
    heroExamineStats.append(htd.append(htd1));
    const stats = [hero.maxHP(),hero.getPow(), hero.getSpow(), hero.apmax, hero.getArmor(), hero.getCrit()+"%", hero.getDodge()+"%"];
    for (let i=0;i<stats.length;i++) {
        heroExamineStats.append(statRow(statName[i],stats[i],statDesc[i]));
    }
    const lowerDiv = $("<div/>").addClass("heroExamineEquip");
    const slots = hero.getEquipSlots();
    $.each(slots, (slotNum,equip) => {
        if (slotNum !== 6) lowerDiv.append(heroCurrentGearEquip(hero,slotNum,equip));
    });
    $heroDetails.append(heroExamineTop,heroExamineStats);
    $heroGearSlots.append(lowerDiv);
}

function heroCurrentGearEquip(hero,slotNum,equip) {
    const d5 = $("<div/>").addClass("heroExamineEquipment").attr({"data-value":slotNum,"id":"hEE"+slotNum,"heroID":hero.id});
    if (hero.equipUpgradeAvailable(slotNum)) d5.addClass("equipUpgradeAvailable")
    $("<div/>").addClass("heroExamineEquipmentSlot").html(slotName[slotNum]).appendTo(d5);
    if (equip === null) {
        $("<div/>").addClass("heroExamineEquipmentEquip").addClass("R0").html(hero.slotTypeIcons(slotNum)).appendTo(d5);
        return d5;
    }
    const d5b = $("<div/>").addClass("heroExamineEquipmentEquip").addClass("R"+equip.rarity).html(equip.picName()).appendTo(d5);
    const d5b1 = $("<div/>").addClass("equipLevel").appendTo(d5b);
    if (equip.scale > 0) {
        $("<div/>").addClass("level_text").html(`${miscIcons.star}`).appendTo(d5b1);
        $("<div/>").addClass("level_integer").html(`${equip.scale}`).appendTo(d5b1);
    }
    else {
        $("<div/>").addClass("level_text").html(`LVL`).appendTo(d5b1);
        $("<div/>").addClass("level_integer").html(`${equip.lvl}`).appendTo(d5b1);
    }
    const equipStats = $("<div/>").addClass("equipStats").appendTo(d5b);
    for (const [stat, val] of Object.entries(equip.itemStat())) {
        if (val === 0) continue;
        const ed = $("<div/>").addClass("gearStatContainer").appendTo(equipStats);
            $("<div/>").addClass('gearStat').html(`${miscIcons[stat]}${val}`).appendTo(ed);
    }
    const d5c = $("<div/>").addClass("heroExamineEquipmentEquipTypes").html(hero.slotTypeIcons(slotNum)).appendTo(d5);
        $("<div/>").addClass("heroUnequipSlot").attr("heroID",hero.id).attr("slotNum",slotNum).html('<i class="fas fa-times"></i> Unslot Equipment').appendTo(d5c);
    return d5
}

function statRow(name,value,description) {
    const d1 = $("<div/>").addClass("heroExamineStatRow tooltip").attr("data-tooltip",description);
    const d2 = $("<div/>").addClass("heroExamineStatRowName").html(name);
    const d3 = $("<div/>").addClass("heroExamineStatRowValue").html(value);
    return d1.append(d2,d3);
}

const $heroEquipmentList = $("#heroEquipmentList");

let examineGearSlotCache = null;
let examineGearHeroIDCache = null;
let examineGearTypesCache = [];

function clearExaminePossibleEquip() {
    $heroEquipmentList.empty();
    examineGearHeroIDCache = null;
    examineGearSlotCache = null;
    examineGearTypesCache = [];
}

function examineHeroPossibleEquip(slot,heroID) {
    const hero = HeroManager.idToHero(heroID);
    examineGearSlotCache = slot;
    examineGearHeroIDCache = heroID;
    const types = HeroManager.getSlotTypes(slot,heroID);
    examineGearTypesCache = types;
    $heroEquipmentList.empty();
    //cycle through everything in bp's and make the div for it
    const equipCardsContainer = $('<div/>').addClass('EquipmentCardsContainer');
    const equipCardsHeader = $('<div/>').addClass('EquipmentCardsHeader').html("Select Your Equipment");
    equipCardsContainer.append(equipCardsHeader);
    // Check if gear available to display in list
    if (Inventory.listbyType(types).length === 0) {
        const noGearMessage = $('<div/>').addClass('noGearMessage').html(`You have no gear available to equip in this slot.`);
        $heroEquipmentList.append(equipCardsContainer,noGearMessage);
        return;
    }
    let upgradeAvaialable = false;
    const currentTypes = [];
    Inventory.listbyType(types).forEach(itemContainer => {
        if (currentTypes.includes(itemContainer.uniqueID())) return;
        currentTypes.push(itemContainer.uniqueID());
        equipCardsContainer.append(heroEqupCard(hero,itemContainer));
    });
    $heroEquipmentList.append(equipCardsContainer);
    //returns a value if this slot has an upgrade available
    return upgradeAvaialable;
};

function heroEqupCard(hero, itemContainer) {
    const equippedItem = hero.currenEquipByType(itemContainer.type)
    const slotNum = hero.typeToSlot(itemContainer.type);
    const card = $('<div/>').addClass('gearItem').addClass("R"+itemContainer.rarity).attr({"id":itemContainer.containerID,"heroID":hero.id,"slotNum":slotNum});
        $('<div/>').addClass('gearItemName').html(itemContainer.picName()).appendTo(card);
        $('<div/>').addClass('gearItemLevel').html(itemContainer.itemLevel()).appendTo(card);
    const equippedStats = equippedItem ? equippedItem.itemStat() : blankItemStat();
    for (const [stat, val] of Object.entries(itemContainer.itemStat())) {
        const deltaStat = val - equippedStats[stat];
        if (deltaStat === 0 && val === 0) continue;
        const d3 = $('<div/>').addClass('gearStatContainer').appendTo(card);
        const d3a = $('<div/>').addClass('gearStat tooltip').attr("data-tooltip",stat).appendTo(d3);
        if (deltaStat > 0) d3a.addClass("gearStatPositive").html(`${miscIcons[stat]}${val} (+${deltaStat})`);
        else if (deltaStat < 0) d3a.addClass("gearStatNegative").html(`${miscIcons[stat]}${val} (${deltaStat})`);
        else d3a.html(`${miscIcons[stat]}${val}`);
    }
    return card;
}

function unequipSlot(slot,heroID) {
    HeroManager.unequip(slot,heroID);
    examineHero(heroID);
}

const $heroCount = $(".heroCount");
const $heroCountText = $(".heroCountText");
const $heroCounter = $(".heroCounter");

function updateHeroCounter() {
    const count = HeroManager.heroes.filter(h=>h.owned && !h.inDungeon).length;
    if (count === 0) {
        $heroCounter.addClass("heroesCountZero").removeClass("heroesCountActive");
        return;
    }
    $heroCounter.addClass("heroesCountActive").removeClass("heroesCountZero");
    $heroCount.html(count);
    if (count == 1) $heroCountText.html(" Hero Available");
    else $heroCountText.html(" Heroes Available");
}

$(document).on('click',".heroCounter", (e) => {
    e.preventDefault();
    tabClick(e, "dungeonsTab");
});

const $heroOverviewButton = $("#heroOverviewButton");

// Show or hide hero's info
function showHeroInfo(show) {
    if (show) {
        $(".heroTabContainer").addClass("grid-show");
        $(".heroOwnedCard").removeClass("highlight");
        $heroOverviewButton.removeClass("highlight");
        $heroOverview.hide();
        return;
    }
    $(".heroOwnedCard").removeClass("highlight");
    $(".heroTabContainer").removeClass("grid-show");
    $(".heroContentContainer").addClass("none");
    $heroOverviewButton.addClass("highlight");
    $heroOverview.show();
}

// Show details tab of selected hero
function showHeroDetailsTab() {
    $heroDetails.removeClass("none");
    $heroGear.addClass("none");
    $heroTrinket.addClass("none");
}

// Show gear tab of selected hero
function showHeroGearTab() {
    $heroDetails.addClass("none");
    $heroGear.removeClass("none");
    $heroTrinket.addClass("none");
}

function showHeroTrinketTab() {
    $heroDetails.addClass("none");
    $heroGear.addClass("none");
    $heroTrinket.removeClass("none");
    refreshTrinketScreen(HeroManager.idToHero(HeroManager.heroView));
}

$(document).on('click',"#heroOverviewButton", (e) => {
    e.preventDefault();
    showHeroInfo(false);
    $(".heroTab").removeClass("selected");
    $("#heroOverviewButton").addClass("highlight");
    viewHeroOverview();
});

$(document).on('click', "div.heroInspect", (e) => {
    //pop up the detailed character card
    e.preventDefault();
    showHeroInfo(true);
    //Checks if no tab would be selected and defaults to tab 1, if true
    const ID = $(e.currentTarget).attr("data-value");
    $(`.heroOwnedCard[data-value=${ID}]`).addClass("highlight");
    HeroManager.heroView = ID;
    examineHero(ID);
    $(".heroTab").removeClass("selected");
    $("#heroOverviewButton").removeClass("highlight");
    if (HeroManager.tabSelected === "heroTab1") {
        showHeroDetailsTab();
        $(".heroTab1").addClass("selected");
    }
    else if (HeroManager.tabSelected === "heroTab2") {
        showHeroGearTab();
        $(".heroTab2").addClass("selected");
    }
    else {
        showHeroTrinketTab();
        $(".heroTab3").addClass("selected");
    }
    clearExaminePossibleEquip();
});

$(document).on('click', ".heroTab1", (e) => {
    e.preventDefault();
    $(".heroTab").removeClass("selected");
    $(e.currentTarget).addClass("selected");
    HeroManager.tabSelected = "heroTab1";
    showHeroDetailsTab();
})

$(document).on('click', ".heroTab2", (e) => {
    e.preventDefault();
    $(".heroTab").removeClass("selected");
    $(e.currentTarget).addClass("selected");
    HeroManager.tabSelected = "heroTab2";
    showHeroGearTab();
})

$(document).on('click', ".heroTab3", (e) => {
    e.preventDefault();
    $(".heroTab").removeClass("selected");
    $(e.currentTarget).addClass("selected");
    HeroManager.tabSelected = "heroTab3";
    showHeroTrinketTab(HeroManager.idToHero(HeroManager.heroView));
})

$(document).on('click', "div.heroExamineEquipment", (e) => {
    //select an item type to display what you can equip
    e.preventDefault();
    const slot = parseInt($(e.currentTarget).attr("data-value"));
    const heroID = $(e.currentTarget).attr("heroID");
    $(".heroExamineEquipment").removeClass("hEEactive");
    $("#hEE"+slot).addClass("hEEactive");
    examineHeroPossibleEquip(slot,heroID)
});

$(document).on('click', "div.gearItem", (e) => {
    //equip the clicked item
    e.preventDefault();
    const heroID = $(e.currentTarget).attr("heroID");
    const containerID = parseInt($(e.currentTarget).attr("id"));
    const slotNum = parseInt($(e.currentTarget).attr("slotNum"));
    HeroManager.equipItem(containerID,heroID,slotNum);
    examineHero(heroID);
    refreshTrinketScreen(HeroManager.idToHero(heroID));
    clearExaminePossibleEquip();
    updateHeroPower();
});

function updateHeroPower() {
    HeroManager.heroes.forEach(hero => {
        const heroCard = $(`.heroOwnedCard[data-value=${hero.id}]`);
        $(heroCard).find(".heroPower").html(HeroManager.heroPower(hero));
    });
}

$(document).on('click', ".buyNewHeroButton", (e) => {
    e.preventDefault();
    HeroManager.purchaseHero();    
})

$(document).on('click', ".heroUnequipSlot", (e) => {
    e.stopPropagation();
    e.preventDefault();
    const heroID = $(e.currentTarget).attr("heroID");
    const slotNum = parseInt($(e.currentTarget).attr("slotNum"));
    unequipSlot(slotNum,heroID);
    examineHeroPossibleEquip(slotNum,heroID);
    refreshTrinketScreen(HeroManager.idToHero(heroID));
    updateHeroPower();
});

const $heroEquipTrinket = $("#heroEquipTrinket");
const $heroEquipTrinketAll = $("#heroEquipTrinketAll");

function refreshTrinketScreen(hero) {
    $heroEquipTrinket.empty();
    $heroEquipTrinket.html(heroCurrentGearEquip(hero,6,hero.slot7));
    $heroEquipTrinketAll.empty();
    Inventory.listbyType("Trinkets").forEach(trinket => {
        heroEqupCard(hero,trinket).appendTo($heroEquipTrinketAll);
    });
}