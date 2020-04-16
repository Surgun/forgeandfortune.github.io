"use strict";

//main divs
const $heroInspectBox = $(".heroInspectBox");
const $heroExamineContainer = $(".heroExamineContainer");
const $heroList = $("#heroList");

//hero overview screen
const $overviewContainer = $("#overviewContainer");
const $heroContentContainer = $(".heroContentContainer");

//other????
const $heroTab = $("#heroTab");
const $heroEquipmentList = $("#heroEquipmentList");

//tabs
const $heroDetailsTab = $("#heroDetailsTab"); //this is just shown up top and needs a direct highlight when it's your "first" tab
const $heroOverview = $("#heroOverview");
const $heroGear = $("#heroGear");
const $heroDetails = $("#heroDetails");
const $heroTrinket = $("#heroTrinket");
const $heroUpgrades = $("#heroUpgrades");

//hero details
const $heroExamineDetails = $("#heroExamineDetails");
const $heroExamineName = $("#heroExamineName");
const $heroExaminePortait = $("#heroExaminePortait");
const $heroExamineImage = $("#heroExamineImage");
const $heroExamineDescription = $("#heroExamineDescription");
const $heroClassText = $("#heroClassText");
const $heroExamineStatsList = $("#heroExamineStatsList");
const $heroExaminePlaybooks = $("#heroExaminePlaybooks");

//hero gear
const $heroGearSlotList = $("#heroGearSlotList");

//upgrades
const $heroUpgradesGear = $("#heroUpgradesGear");
const $heroUpgradesGearText = $("#heroUpgradesGearText");
//trinket
const $heroEquipTrinket = $("#heroEquipTrinket");
const $heroEquipTrinketAll = $("#heroEquipTrinketAll");

const $heroOverviewButton = $("#heroOverviewButton");
const $trinketTab = $("#trinketTab");

//const slotName = ["Weapon","Head","Armament","Chest","Handheld","Accessory","Trinket"];
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

function refreshHeroOverview() {
    HeroManager.heroView = null;
    $heroInspectBox.hide();
    initializeHeroList();
    HeroManager.heroes.filter(h=>h.owned).forEach(hero => {
        createHeroOverlayCard(hero).appendTo($overviewContainer);
    });
}

//populate the sidebar hero list
function initializeHeroList() {
    $heroList.empty();
    // $("<div/>").attr("id","heroOverviewButton").addClass("heroOverviewButton highlight").html(`<i class="fas fa-info-circle"></i> Hero Overview`).appendTo($heroList);
    HeroManager.heroes.forEach(hero => {
        const d = $("<div/>").addClass("heroOwnedCard heroInspect").attr("data-value",hero.id).appendTo($heroList);
        $("<div/>").addClass("heroOwnedImage").html(hero.portrait).appendTo(d);
        $("<div/>").addClass("heroOwnedName").html(hero.name).appendTo(d);
        const d3 = $("<div/>").addClass("heroHP heroStat").appendTo(d);
            $("<div/>").addClass("hp_img").html(miscIcons.hp).appendTo(d3);
            $("<div/>").addClass("hp_integer statValue").html(hero.maxHP()).appendTo(d3);
        const d4 = $("<div/>").addClass("heroPower heroStat").appendTo(d);
            $("<div/>").addClass("pow_img").html(miscIcons.pow).appendTo(d4);
            $("<div/>").addClass("pow_integer statValue").html(hero.getPow()).appendTo(d4);
        const d5 = $("<div/>").addClass("heroTech heroStat").appendTo(d);
            $("<div/>").addClass("tech_img").html(miscIcons.tech).appendTo(d5);
            $("<div/>").addClass("tech_integer statValue").html(hero.getTech()).appendTo(d5);
        if (!hero.owned) d.hide();
    });
    if (HeroManager.heroes.filter(h=>!h.owned).length > 0) {
        const d = $("<div/>").addClass("heroOwnedCard emptyHeroSlot").appendTo($heroList);
        $("<div/>").addClass("heroOwnedImage").html(miscIcons.emptySlot).appendTo(d);
        $("<div/>").addClass("heroOwnedName").html("More Heroes?").appendTo(d);
        $("<div/>").addClass("emptyHeroSlotDescription").html("You can find more heroes by purchasing perks in the Market.").appendTo(d);
        $("<div/>").addClass("emptyHeroSlotMarket actionButton").html(`<i class="fas fa-store"></i> View Market`).appendTo(d);
    }
}

function createHeroOverlayCard(hero) {
    const d = $("<div/>").addClass("heroOverviewCard heroInspect").attr("data-value",hero.id);
        const heroInfo = $("<div/>").addClass("heroOverviewInfo").appendTo(d);
            $("<div/>").addClass("heroOverviewImage").html(hero.image).appendTo(heroInfo);
            $("<div/>").addClass("heroOverviewName").html(hero.name).appendTo(heroInfo);
            $("<div/>").addClass("heroOverviewClass").html(hero.class).appendTo(heroInfo);
        const heroStats = $("<div/>").addClass("heroOverviewStats").appendTo(d);
            $("<div/>").addClass("heroOverviewHP overviewStat tooltip").attr("data-tooltip","hp").html(`${miscIcons.hp} ${hero.maxHP()}`).appendTo(heroStats);
            $("<div/>").addClass("heroOverviewPow overviewStat tooltip").attr("data-tooltip","pow").html(`${miscIcons.pow} ${hero.getPow()}`).appendTo(heroStats);
    return d;
}

function showHeroDetails() {
    $heroContentContainer.hide();
    $heroDetails.show();
    const hero = HeroManager.idToHero(HeroManager.heroView);
    $heroExamineName.html(hero.name);
    $heroExaminePortait.html(hero.portrait);
    $heroExamineImage.html(hero.image);
    $heroExamineDescription.html(hero.description);
    $heroClassText.html(hero.class);
    $heroExamineStatsList.empty();
    const stats = [hero.maxHP(),hero.getPow(), hero.getTech()];
    for (let i=0;i<stats.length;i++) {
        $heroExamineStatsList.append(statRow(statName[i],stats[i],statDesc[i]));
    }
    $heroExaminePlaybooks.empty();
    hero.playbooks.forEach(playbookID => {
        const playbook = PlaybookManager.idToPlaybook(playbookID);
        const d = $("<div/>").addClass("playbookDiv").appendTo($heroExaminePlaybooks);
        $("<div/>").addClass("playbookName").html(playbook.name).appendTo(d);
        if (hero.playbook.id === playbookID) d.addClass("playbookSelected");
        playbook.skillIDs().forEach(skillID => {
            const skill = SkillManager.idToSkill(skillID);
            $("<div/>").addClass("heroSelectSkill tooltip").attr({"data-tooltip":"skill_desc","data-tooltip-value":skill.id}).html(skill.icon).appendTo(d);
        });
    });
}

function showHeroGear() {
    $heroContentContainer.hide();
    $heroGear.show();
    const hero = HeroManager.idToHero(HeroManager.heroView);
    $heroGearSlotList.empty();
    hero.gearSlots.forEach(slot => {
        if (slot.type !== "Trinkets") heroCurrentGearEquip(hero,slot).appendTo($heroGearSlotList);
    });
}

function showHeroUpgrades() {
    $heroContentContainer.hide();
    $heroUpgrades.show();
    $heroUpgradesGear.empty();
    $heroUpgradesGearText.html(`You have ${DungeonManager.availableUpgrades() - HeroManager.totalUpgrades()} Monster Trophies available for Upgrades`)
    const hero = HeroManager.idToHero(HeroManager.heroView);
    hero.gearSlots.forEach(slot => {
        if (slot.type !== "Trinkets") heroUpgradeSlot(HeroManager.heroView,slot).appendTo($heroUpgradesGear);
    });
}

function showHeroTrinket() {
    $heroContentContainer.hide();
    $heroTrinket.show();
    const hero = HeroManager.idToHero(HeroManager.heroView);
    $heroEquipTrinket.empty();
    $heroEquipTrinket.html(heroCurrentGearEquip(hero,hero.trinket()));
    refreshTrinketInventory();
}

function refreshTrinketInventory() {
    if (HeroManager.heroView === null) return;
    $heroEquipTrinketAll.empty();
    const hero = HeroManager.idToHero(HeroManager.heroView);
    if (Inventory.listbyType("Trinkets").length === 0) $("<div/>").addClass("heroUpgradeTrinketsText").html("No Trinkets Available").appendTo($heroEquipTrinketAll);
    Inventory.listbyType("Trinkets").forEach(trinket => {
        heroEqupCard(hero,trinket).appendTo($heroEquipTrinketAll);
    });
}

//creates a gear "slot" used on gear screen and trinket screen
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

//creates a gear "slot" used on upgrades screen
function heroUpgradeSlot(heroid,gearSlot) {
    const type = gearSlot.type;
    const d = $("<div/>").addClass("heroGearUpgradeSlot");
    $("<div/>").addClass("heroGearUpgradeSlotType").html(type).appendTo(d);
    $("<div/>").addClass("heroGearUpgradeSlotLvl").html(`${gearSlot.lvl}/2`).appendTo(d);
    const d1 = $("<div/>").data({"heroID":heroid,"gearType":gearSlot.type}).appendTo(d);
    if (gearSlot.lvl == 2) d1.html("Max Level").addClass("heroGearUpgradeSlotButtonMax");
    else d1.html("Upgrade").addClass("heroGearUpgradeSlotButton");
    return d;
}

//used for cards to show a stat
function statRow(name,value,description) {
    const d1 = $("<div/>").addClass("heroExamineStatRow tooltip").attr("data-tooltip",description);
    const d2 = $("<div/>").addClass("heroExamineStatRowName").html(name);
    const d3 = $("<div/>").addClass("heroExamineStatRowValue").html(value);
    return d1.append(d2,d3);
}


//used for things that populate your inventory so it actually goes
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

//compares a card to see if it's actually an upgrade versus what's equipped before returning
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
    showHeroGear();
}

function updateHeroStats() {
    HeroManager.heroes.forEach(hero => {
        const heroCard = $(`.heroOwnedCard[data-value=${hero.id}]`);
        $(heroCard).find(".pow_integer").html(hero.getPow());
        $(heroCard).find(".hp_integer").html(hero.maxHP());
        $(heroCard).find(".tech_integer").html(hero.getTech());
    });
    $heroInspectBox.hide();
}

$(document).on('click',".heroBackButton", (e) => {
    e.preventDefault();
    $heroInspectBox.addClass('heroInspectClosed');
    setTimeout(() => {
        updateHeroStats();
        $heroInspectBox.removeClass('heroInspectClosed');
    }, 200);
});

$(document).on('click',".emptyHeroSlotMarket", (e) => {
    e.preventDefault();
    tabClick(e, 'marketTab');
});


//Click on a hero to bring up the details for them
$(document).on('click', ".heroInspect", (e) => {
    e.preventDefault();
    const ID = $(e.currentTarget).attr("data-value");
    HeroManager.heroView = ID;
    $("#heroOverviewButton").removeClass("highlight");
    $(`.heroOwnedCard`).removeClass("highlight");
    $(`.heroOwnedCard[data-value=${ID}]`).addClass("highlight");
    $heroInspectBox.show();
    clearExaminePossibleEquip();
    showTab(HeroManager.tabSelected);
});

//click on a tab on hero page
$(document).on('click', ".heroTab", (e) => {
    e.preventDefault();
    $(".heroTab").removeClass("selected");
    $(e.currentTarget).addClass("selected");
    const tabType = $(e.currentTarget).html();
    if (HeroManager.tabSelected === tabType) return;
    HeroManager.tabSelected = tabType;
    showTab(tabType);
});

function showTab(tabName) {
    if (tabName === "Details") showHeroDetails();
    if (tabName === "Equipment") showHeroGear();
    if (tabName === "Upgrades") showHeroUpgrades();
    if (tabName === "Trinket") showHeroTrinket();
}

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
    showHeroGear();
    clearExaminePossibleEquip();
    updateHeroStats();
    refreshSmithInventory(); //because hero gear is here
});


$(document).on('click', ".heroUnequipSlot", (e) => {
    //unequip the item
    e.stopPropagation();
    e.preventDefault();
    const heroID = $(e.currentTarget).data("heroID");
    const gearType = $(e.currentTarget).data("gearType");
    unequipSlot(heroID,gearType);
    examineHeroPossibleEquip(heroID,gearType);
    updateHeroStats();
    refreshSmithInventory(); //because hero gear is here
});

$(document).on('click', ".heroGearUpgradeSlotButton", (e) => {
    e.preventDefault();
    const heroID = $(e.currentTarget).data("heroID");
    const gearType = $(e.currentTarget).data("gearType");
    HeroManager.upgradeSlot(heroID,gearType);
    showHeroUpgrades();
})

