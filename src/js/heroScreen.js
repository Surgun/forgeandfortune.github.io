"use strict";

const $heroTab = $("#heroTab");
const $heroGear = $("#heroGear");
const $heroTrinket = $("#heroTrinket");
const $heroList = $("#heroList");
const $heroDetails = $("#heroDetails");
const $heroGearSlots = $("#heroGearSlots");
const $heroOverview = $("#heroOverview");

const slotName = ["Weapon","Head","Armament","Chest","Handheld","Accessory","Trinket"];
const statName = [
    `${miscIcons.hp} <span>HP</span>`,
    `${miscIcons.pow} <span>Power</span>`,
    `${miscIcons.tech} <span>Technique</span>`,
];

const statDesc = [
    "hp",
    "pow",
    "tech",
];

function initializeHeroList() {
    $heroList.empty();
    $("<div/>").attr("id","heroOverviewButton").addClass("heroOverviewButton highlight").html(`<i class="fas fa-info-circle"></i> Hero Overview`).appendTo($heroList);
    HeroManager.heroes.forEach(hero => {
        const d = $("<div/>").addClass("heroOwnedCard heroInspect").attr("data-value",hero.id);
        const d1 = $("<div/>").addClass("heroOwnedImage").html(hero.head);
        const d2 = $("<div/>").addClass("heroOwnedName").html(hero.name);
        const d3 = $("<div/>").addClass("heroPower").html(hero.getPow());
            $("<div/>").addClass("pow_img").html(miscIcons.pow).appendTo(d3);
            $("<div/>").addClass("pow_integer").html(hero.getPow()).appendTo(d3);
        d.append(d1,d2,d3);
        if (!hero.owned) d.hide();
        $heroList.append(d);
    });
    if (HeroManager.heroes.filter(h=>!h.owned).length > 0) {
        const bh1 = $("<div/>").addClass("buyNewHeroCard")
        const bh2 = $("<div/>").addClass("buyNewHeroTitle").html(`Looking for more Heroes?`);
        const bh3 = $("<div/>").addClass("buyNewHeroDesc").html(`Check the Market to get more!`);
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
                $("<div/>").addClass("heroOverviewHP overviewStat tooltip").attr("data-tooltip","hp").html(`${miscIcons.hp} ${hero.maxHP()}`).appendTo(heroStats);
            $("<div/>").addClass("heroOverviewPow overviewStat tooltip").attr("data-tooltip","pow").html(`${miscIcons.pow} ${hero.getPow()}`).appendTo(d);
            d.appendTo(overviewContainer)
    });
    $heroOverview.append(overviewTitle,overviewDesc,overviewContainer);
}

function examineHero(ID) {
    const hero = HeroManager.idToHero(ID);
    $heroDetails.empty();
    $heroGearSlots.empty();
    const heroExamineTop = $("<div/>").addClass("heroExamineTop heroExamineContainer").appendTo($heroDetails);
    $("<div/>").addClass("heroExamineName").html(hero.name).appendTo(heroExamineTop);
    $("<div/>").addClass("heroExaminePortait").html(hero.portrait).appendTo(heroExamineTop);
    $("<div/>").addClass("heroExamineImage").html(hero.image).appendTo(heroExamineTop);
    $("<div/>").addClass("heroExamineDescription").html(hero.description).appendTo(heroExamineTop);
    const d4 = $("<div/>").addClass("heroExamineLvlClassContainer").appendTo(heroExamineTop);
        $("<div/>").addClass("heroClassHeading").html("Hero Class").appendTo(d4);
        $("<div/>").addClass("heroClassText").html(hero.class).appendTo(d4);
    const heroExamineStats = $("<div/>").addClass("heroExamineStats heroExamineContainer").appendTo($heroDetails);
    $("<div/>").addClass("heroExamineHeading").appendTo(heroExamineStats);
    $("<div/>").addClass("heroExamineStatHeading").html("Hero Stats").appendTo(heroExamineStats);
    const stats = [hero.maxHP(),hero.getPow(), hero.getTech()];
    for (let i=0;i<stats.length;i++) {
        heroExamineStats.append(statRow(statName[i],stats[i],statDesc[i]));
    }
    $("<div/>").addClass("heroExamineSkillsHeading").html("Available Playbooks").appendTo(heroExamineTop);
    $("<div/>").addClass("heroExamineSkillsHeading").html("Unlock additional playbooks in the Market").appendTo(heroExamineTop);
    const p = $("<div/>").addClass("heroExaminePlaybooks").appendTo(heroExamineTop);
    hero.playbooks.forEach(playbookID => {
        const playbook = PlaybookManager.idToPlaybook(playbookID);
        const d = $("<div/>").addClass("playbookDiv").appendTo(p);
        $("<div/>").addClass("playbookName").html(playbook.name).appendTo(d);
        if (hero.playbook.id === playbookID) d.addClass("playbookSelected");
        playbook.skillIDs().forEach(skillID => {
            const skill = SkillManager.idToSkill(skillID);
            $("<div/>").addClass("heroSelectSkill tooltip").attr({"data-tooltip":"skill_desc","data-tooltip-value":skill.id}).html(skill.icon).appendTo(d);
        });
    })
    const d3 = $("<div/>").addClass("heroSlotUpgrades").appendTo(heroExamineTop);
    $("<div/>").addClass("heroSlotUpgradeHeading").html("Equipment Upgrades").appendTo(d3);
    $("<div/>").addClass("heroSlotUpgradeDesc").html(`Use upgrades from monster kills to upgrade your slots. You have ${0} points left to spend`).appendTo(d3);

    const lowerDiv = $("<div/>").addClass("heroExamineEquip").appendTo($heroGearSlots);
    hero.gearSlots.forEach(slot => {
        if (slot.type !== "Trinkets") lowerDiv.append(heroCurrentGearEquip(hero,slot));
    });
}

function heroCurrentGearEquip(hero,gearSlot) {
    const type = gearSlot.type;
    const gear = gearSlot.gear;
    const d = $("<div/>").addClass("heroExamineEquipment").data({"heroID":hero.id,"gearType":type})
    if (hero.equipUpgradeAvailable(type)) d.addClass("equipUpgradeAvailable")
    $("<div/>").addClass("heroExamineEquipmentSlot").html(type).appendTo(d);
    if (gear === null) {
        $("<div/>").addClass("heroExamineEquipmentEquip itemName").addClass("R0").html(type).appendTo(d);
        return d;
    }
    const d1 = $("<div/>").addClass("heroExamineEquipmentEquip itemName").addClass("R"+gear.rarity).html(gear.picName()).appendTo(d);
    const d2 = $("<div/>").addClass("equipLevel").appendTo(d1);
        $("<div/>").addClass("level_text").html(`LVL`).appendTo(d2);
        $("<div/>").addClass("level_integer").html(`${gear.lvl}`).appendTo(d2);
    const equipStats = $("<div/>").addClass("equipStats").appendTo(d1);
    for (const [stat, val] of Object.entries(gear.itemStat())) {
        if (val === 0) continue;
        const ed = $("<div/>").addClass("gearStatContainer").appendTo(equipStats);
            $("<div/>").addClass('gearStat').html(`${miscIcons[stat]}${val}`).appendTo(ed);
    }
    const d3 = $("<div/>").addClass("heroExamineEquipmentEquipTypes").html(type).appendTo(d);
        $("<div/>").addClass("heroUnequipSlot").data({"heroID":hero.id,"gearType":type}).html('<i class="fas fa-times"></i> Unslot Equipment').appendTo(d3);
    return d;
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

function examineHeroPossibleEquip(heroID,gearType,skipAnimation) {
    if (skipAnimation) return;
    const hero = HeroManager.idToHero(heroID);
    examineGearSlotCache = gearType;
    examineGearHeroIDCache = heroID;
    examineGearTypesCache = gearType;
    $heroEquipmentList.empty();
    //cycle through everything in bp's and make the div for it
    const equipCardsContainer = $('<div/>').addClass('EquipmentCardsContainer').appendTo($heroEquipmentList);
        $('<div/>').addClass('EquipmentCardsHeader').html("Select Your Equipment").appendTo(equipCardsContainer);
    // Check if gear available to display in list
    if (Inventory.listbyType(gearType).length === 0) {
        $('<div/>').addClass('noGearMessage').html(`You have no gear available to equip in this slot.`).appendTo($heroEquipmentList);
        return;
    }
    let upgradeAvaialable = false;
    const currentTypes = [];
    //idk why listbytype is returning gear slots
    Inventory.listbyType(gearType).forEach(itemContainer => {
        if (currentTypes.includes(itemContainer.uniqueID())) return;
        currentTypes.push(itemContainer.uniqueID());
        equipCardsContainer.append(heroEqupCard(hero,itemContainer));
    });
    //returns a value if this slot has an upgrade available
    return upgradeAvaialable;
};

function heroEqupCard(hero, itemContainer) {
    const equippedItem = hero.getSlot(itemContainer.type).gear;
    const card = $('<div/>').addClass('gearItem').addClass("R"+itemContainer.rarity).data({"heroID":hero.id,"containerID":itemContainer.containerID});
        $('<div/>').addClass('gearItemName itemName').html(itemContainer.picName()).appendTo(card);
        $('<div/>').addClass('gearItemLevel').html(itemContainer.itemLevel()).appendTo(card);
    const equippedStats = equippedItem ? equippedItem.itemStat() : blankItemStat();
    for (const [stat, val] of Object.entries(itemContainer.itemStat())) {
        const deltaStat = val - equippedStats[stat];
        if (deltaStat === 0 && val === 0) continue;
        const d3 = $('<div/>').addClass('gearStatContainer').appendTo(card);
        const d3a = $('<div/>').addClass('gearStat tooltip').attr("data-tooltip", stat).appendTo(d3);
        if (deltaStat > 0) d3a.addClass("gearStatPositive").html(`${miscIcons[stat]}${val} (+${deltaStat})`);
        else if (deltaStat < 0) d3a.addClass("gearStatNegative").html(`${miscIcons[stat]}${val} (${deltaStat})`);
        else d3a.html(`${miscIcons[stat]}${val}`);
    }
    return card;
}

function unequipSlot(heroID,type) {
    const hero = HeroManager.idToHero(heroID);
    hero.unequip(type);
    examineHero(heroID);
}

$(document).on('click',".heroCounter", (e) => {
    e.preventDefault();
    tabClick(e, "dungeonsTab");
});

const $heroOverviewButton = $("#heroOverviewButton");
const $trinketTab = $("#trinketTab");

// Show or hide hero's info
function showHeroInfo(show) {
    if (TownManager.status("tinker") !== BuildingState.built) $trinketTab.hide();
    else $trinketTab.hide();
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
    const heroID = $(e.currentTarget).data("heroID");
    const gearType = $(e.currentTarget).data("gearType");
    $(".heroExamineEquipment").removeClass("hEEactive");
    $(e.currentTarget).addClass("hEEactive");
    examineHeroPossibleEquip(heroID,gearType)
});

$(document).on('click', "div.gearItem", (e) => {
    //equip the clicked item
    e.preventDefault();
    const heroID = $(e.currentTarget).data("heroID");
    const containerID = $(e.currentTarget).data("containerID");
    HeroManager.equipItem(containerID,heroID);
    examineHero(heroID);
    refreshTrinketScreen(HeroManager.idToHero(heroID));
    clearExaminePossibleEquip();
    updateHeroPower();
    refreshSmithInventory(); //because hero gear is here
});

function updateHeroPower() {
    HeroManager.heroes.forEach(hero => {
        const heroCard = $(`.heroOwnedCard[data-value=${hero.id}]`);
        $(heroCard).find(".pow_integer").html(hero.getPow());
    });
}

$(document).on('click', ".buyNewHeroButton", (e) => {
    e.preventDefault();
    HeroManager.purchaseHero();    
})

$(document).on('click', ".heroUnequipSlot", (e) => {
    e.stopPropagation();
    e.preventDefault();
    const heroID = $(e.currentTarget).data("heroID");
    const gearType = $(e.currentTarget).data("gearType");
    unequipSlot(heroID,gearType);
    examineHeroPossibleEquip(heroID,gearType);
    refreshTrinketScreen(HeroManager.idToHero(heroID));
    updateHeroPower();
    refreshSmithInventory(); //because hero gear is here
});

const $heroEquipTrinket = $("#heroEquipTrinket");
const $heroEquipTrinketAll = $("#heroEquipTrinketAll");

function refreshTrinketScreen(hero) {
    $heroEquipTrinket.empty();
    $heroEquipTrinket.html(heroCurrentGearEquip(hero,hero.trinket()));
    refreshTrinketInventory();
}

function refreshTrinketInventory() {
    if (HeroManager.heroView === null) return;
    $heroEquipTrinketAll.empty();
    const hero = HeroManager.idToHero(HeroManager.heroView);
    Inventory.listbyType("Trinkets").forEach(trinket => {
        heroEqupCard(hero,trinket).appendTo($heroEquipTrinketAll);
    });
}