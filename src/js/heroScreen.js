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
const $previewCardHero = $('.previewCardHero');
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
const $heroExamineImage = $("#heroExamineImage");
const $heroExamineDescription = $("#heroExamineDescription");
const $heroClassText = $("#heroClassText");
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
    $heroInspectBox.removeClass('isOpened');
    initializeHeroList();
    HeroManager.heroes.filter(h=>h.owned).forEach(hero => {
        createHeroOverlayCard(hero).appendTo($overviewContainer);
    });
    if (Shop.alreadyPurchased("AL3007")) $heroTabUpgrade.show();
    else $heroTabUpgrade.hide();
    if (TinkerManager.lvl > 0) $heroTabTrinket.show();
    else $heroTabTrinket.hide();
}

const $heroTabUpgrade = $("#heroTabUpgrade");
const $heroTabTrinket = $("#heroTabTrinket");

//populate the sidebar hero list
function initializeHeroList() {
    $heroList.empty();
    HeroManager.heroes.forEach(hero => {
        const d = generateHeroCard(hero, true).appendTo($heroList);
        if (!hero.owned) d.hide();
    });
    if (HeroManager.heroes.filter(h=>!h.owned).length > 0) {
        const d = $("<div/>").addClass("heroOwnedCard emptyHeroSlot").appendTo($heroList);
        $("<div/>").addClass("heroOwnedImage").html(miscIcons.emptySlot).appendTo(d);
        $("<div/>").addClass("heroOwnedName").html("More Heroes?").appendTo(d);
        $("<div/>").addClass("emptyHeroSlotDescription").html("You can find more heroes by purchasing perks in the Market.").appendTo(d);
        const marketButton = $("<div/>").addClass("emptyHeroSlotMarket actionButton").html(`<i class="fas fa-store"></i>`).appendTo(d);
            $("<div/>").addClass("actionButtonTextRight").html(`View Market`).appendTo(marketButton);
    }
}

function generateHeroCard(hero, inspect) {
    const d = $("<div/>").addClass("heroOwnedCard").attr("data-value",hero.id);
        if (inspect) d.addClass('heroInspect');
        $("<div/>").addClass("heroOwnedImage").html(hero.portrait).appendTo(d);
        $("<div/>").addClass("heroOwnedName").html(hero.name).appendTo(d);
        const d3 = $("<div/>").addClass("heroHP heroStat tooltip").attr("data-tooltip","hp").appendTo(d);
            $("<div/>").addClass("hp_img").html(miscIcons.hp).appendTo(d3);
            $("<div/>").addClass("hp_integer statValue").html(hero.maxHP()).appendTo(d3);
        const d4 = $("<div/>").addClass("heroPower heroStat tooltip").attr("data-tooltip","pow").appendTo(d);
            $("<div/>").addClass("pow_img").html(miscIcons.pow).appendTo(d4);
            $("<div/>").addClass("pow_integer statValue").html(hero.getPow()).appendTo(d4);
        const d5 = $("<div/>").addClass("heroTech heroStat tooltip").attr("data-tooltip","tech").appendTo(d);
            $("<div/>").addClass("tech_img").html(miscIcons.tech).appendTo(d5);
            $("<div/>").addClass("tech_integer statValue").html(hero.getTech()).appendTo(d5);
    return d;
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

function inspectHeroPreview(hero) {
    $previewCardHero.empty();
    $previewCardHero.append(generateHeroCard(hero, false))
}

function cyclePreviewHeroPrevious() {
    const ID = $('.previewCardHero .heroOwnedCard').attr("data-value");
    const heroesList = HeroManager.heroes.filter(hero => hero.owned);
    const heroIndex = heroesList.findIndex(hero => hero.id === ID);
    let newHeroIndex = 0;
    if (heroIndex > 0) newHeroIndex = heroIndex - 1
    else newHeroIndex = heroesList.length - 1
    HeroManager.heroView = heroesList[newHeroIndex].id
}

function cyclePreviewHeroNext() {
    const ID = $('.previewCardHero .heroOwnedCard').attr("data-value");
    const heroesList = HeroManager.heroes.filter(hero => hero.owned);
    const heroIndex = heroesList.findIndex(hero => hero.id === ID);
    let newHeroIndex = 0;
    if (heroIndex < heroesList.length - 1) newHeroIndex = heroIndex + 1
    HeroManager.heroView = heroesList[newHeroIndex].id
}

$(document).on('click', ".previewCardPrevious", (e) => {
    cyclePreviewHeroPrevious();
    inspectHeroPreview(HeroManager.idToHero(HeroManager.heroView))
    clearExaminePossibleEquip();
    showTab(HeroManager.tabSelected);
});

$(document).on('click', ".previewCardNext", (e) => {
    cyclePreviewHeroNext();
    inspectHeroPreview(HeroManager.idToHero(HeroManager.heroView))
    clearExaminePossibleEquip();
    showTab(HeroManager.tabSelected);
});

function showHeroDetails() {
    $heroContentContainer.hide();
    $heroDetails.show();
    const hero = HeroManager.idToHero(HeroManager.heroView);
    $heroExamineName.html(hero.name);
    $heroExamineImage.html(hero.image);
    $heroExamineDescription.html(hero.description);
    $heroClassText.html(hero.class);
    $heroExaminePlaybooks.empty();
    generateHeroPlaybooks(hero).appendTo($heroExaminePlaybooks);
}

function generateHeroPlaybooks(hero) {
    const d = $("<div/>").addClass("playbooksHeroContainer");
    hero.playbooks.forEach(playbookID => {
        const playbook = PlaybookManager.idToPlaybook(playbookID);
            $("<div/>").addClass("playbookName").html(playbook.name).appendTo(d);
        const d1 = $("<div/>").addClass("playbookSkillsContainer").appendTo(d);
        if (hero.playbook.id === playbookID) d.addClass("playbookSelected");
        playbook.skillIDs().forEach(skillID => {
            const skill = SkillManager.idToSkill(skillID);
            $("<div/>").addClass("heroSelectSkill tooltip").attr({"data-tooltip":"skill_desc","data-tooltip-value":skill.id}).html(skill.icon).appendTo(d1);
        });
    });
    return d;
}

function showHeroGear() {
    $heroContentContainer.hide();
    $heroGear.show();
    const hero = HeroManager.idToHero(HeroManager.heroView);
    $heroGearSlotList.empty();
    hero.gearSlots.forEach(slot => {
        if (slot.type !== "Trinkets") heroCurrentGearEquip(hero,slot).appendTo($heroGearSlotList);
    });
    examineHeroPossibleEquip(hero.id,hero.slot1Type);
    $(".heroExamineEquipment:first-of-type").addClass("selected");
}

function showHeroUpgrades() {
    $heroContentContainer.hide();
    $heroUpgrades.show();
    $heroUpgradesGear.empty();
    $heroUpgradesGearText.html(`${DungeonManager.availableUpgrades() - HeroManager.totalUpgrades()} Monster Trophies`)
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
    $(".heroExamineEquipment:first-of-type").addClass("selected");
    refreshTrinketInventory();
}

function refreshTrinketInventory() {
    if (HeroManager.heroView === null) return;
    $heroEquipTrinketAll.empty();
    const hero = HeroManager.idToHero(HeroManager.heroView);
    const trinketsCardsHeadingContainer = $('<div/>').addClass('equipCardsTrinketsHeadingContainer').appendTo($heroEquipTrinketAll);
        const headingDetails = $('<div/>').addClass('headingDetails').appendTo(trinketsCardsHeadingContainer);
            $('<div/>').addClass('headingTitle').html(displayText("trinket_select_title")).appendTo(headingDetails);
            $('<div/>').addClass('headingDescription').html(displayText("trinket_select_desc")).appendTo(headingDetails);
    const trinketsGearContainer = $('<div/>').addClass('trinketsGearContainer').appendTo($heroEquipTrinketAll);
    if (Inventory.listbyType("Trinkets").length === 0) $("<div/>").addClass("heroUpgradeTrinketsText").html(displayText("no_trinkets_desc")).appendTo($heroEquipTrinketAll);
    Inventory.listbyType("Trinkets").forEach(trinket => {
        trinketsGearContainer.append(heroEquipCard(hero,trinket));
    });
}

//creates a gear "slot" used on gear screen and trinket screen
function heroCurrentGearEquip(hero,gearSlot) {
    const type = gearSlot.type;
    const gear = gearSlot.gear;
    const d = $("<div/>").addClass("heroExamineEquipment").data({"heroID":hero.id,"gearType":type})
    if (hero.equipUpgradeAvailable(type)) d.addClass("equipUpgradeAvailable")
    $("<div/>").addClass("heroExamineEquipmentSlot").html(displayText(`type_${type}`)).appendTo(d);
    if (gear === null) {
        const d1 = $("<div/>").addClass("heroExamineEquipmentEquip emptyGearSlot").appendTo(d);
            $("<div/>").addClass("emptyGearSlotIcon").html(miscIcons.emptySlot).appendTo(d1);
            $("<div/>").addClass("emptyGearSlotTitle").html('Empty Slot').appendTo(d1);
            $("<div/>").addClass("emptyGearSlotLevel equipLevel").appendTo(d1);
            $("<div/>").addClass("emptyGearSlotRarity equipRarity").appendTo(d1);
            const equipStats = $("<div/>").addClass("emptyEquipStats").appendTo(d1);
            for (let i = 0; i < 2; i++) {
                const ed = $("<div/>").addClass('gearStat').appendTo(equipStats);
                $("<div/>").addClass(`empty_img`).appendTo(ed);
                $("<div/>").addClass(`empty_integer statValue`).appendTo(ed);
            }
        return d;
    }
    const d1 = $("<div/>").addClass("heroExamineEquipmentEquip").addClass("R"+gear.rarity).appendTo(d);
        $("<div/>").addClass("itemName").html(gear.picName()).appendTo(d1);
    const d2 = $("<div/>").addClass("equipLevel").appendTo(d1);
        $("<div/>").addClass("level_text").html(`LVL`).appendTo(d2);
        $("<div/>").addClass("level_integer").html(`${gear.lvl}`).appendTo(d2);
    $("<div/>").addClass("equipRarity itemRarity").addClass(`RT${gear.rarity} tooltip`).attr({"data-tooltip": `rarity_${rarities[gear.rarity].toLowerCase()}`}).html(miscIcons.rarity).appendTo(d1);
    const equipStats = $("<div/>").addClass("equipStats").appendTo(d1);
    for (const [stat, val] of Object.entries(gear.itemStat())) {
        if (val === 0) continue;
        const ed = $("<div/>").addClass('gearStat tooltip').attr({"data-tooltip": stat}).appendTo(equipStats);
            $("<div/>").addClass(`${stat}_img`).html(miscIcons[stat]).appendTo(ed);
            $("<div/>").addClass(`${stat}_integer statValue`).html(val).appendTo(ed);
    }
    $("<div/>").attr({"data-tooltip": "equipment_remove"}).addClass("heroUnequipSlot tooltip").data({"heroID":hero.id,"gearType":type}).html('<i class="fas fa-times"></i>').appendTo(d);
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
    const equipCardsHeadingContainer = $('<div/>').addClass('equipCardsHeadingContainer').appendTo($heroEquipmentList);
        const headingDetails = $('<div/>').addClass('headingDetails').appendTo(equipCardsHeadingContainer);
            $('<div/>').addClass('headingTitle').html(displayText("equipment_select_title")).appendTo(headingDetails);
            $('<div/>').addClass('headingDescription').html(displayText("equipment_select_desc")).appendTo(headingDetails);
        $('<div/>').attr({id: 'equipRecipeButton'}).data("recipeType", examineGearTypesCache).addClass('equipRecipeButton actionButton').html(displayText("equipment_recipes_button").replace("{0}", examineGearTypesCache)).appendTo(equipCardsHeadingContainer);
    const equipCardsContainer = $('<div/>').addClass('equipCardsContainer').appendTo($heroEquipmentList);
    // Check if gear available to display in list
    if (Inventory.listbyType(gearType).length === 0) {
        $('<div/>').addClass('noGearMessage').html(displayText("no_equipment_desc")).appendTo($heroEquipmentList);
        return;
    }
    let upgradeAvaialable = false;
    const currentTypes = [];
    //idk why listbytype is returning gear slots
    Inventory.listbyType(gearType).forEach(itemContainer => {
        if (currentTypes.includes(itemContainer.uniqueID())) return;
        currentTypes.push(itemContainer.uniqueID());
        equipCardsContainer.append(heroEquipCard(hero,itemContainer));
    });
    //returns a value if this slot has an upgrade available
    return upgradeAvaialable;
};

//compares a card to see if it's actually an upgrade versus what's equipped before returning
function heroEquipCard(hero, itemContainer) {
    const equippedItem = hero.getSlot(itemContainer.type).gear;
    const card = $('<div/>').addClass('gearItem').addClass("R"+itemContainer.rarity).data({"heroID":hero.id,"containerID":itemContainer.containerID});
        $('<div/>').addClass('gearItemName itemName').html(itemContainer.picName()).appendTo(card);
        $('<div/>').addClass('gearItemLevel').html(itemContainer.itemLevel()).appendTo(card);
        $("<div/>").addClass("gearItemRarity itemRarity").addClass(`RT${itemContainer.rarity} tooltip`).attr({"data-tooltip": `rarity_${rarities[itemContainer.rarity].toLowerCase()}`}).html(miscIcons.rarity).appendTo(card);
    const equippedStats = equippedItem ? equippedItem.itemStat() : blankItemStat();
    const d3 = $('<div/>').addClass('equipStats').appendTo(card);
    for (const [stat, val] of Object.entries(itemContainer.itemStat())) {
        const deltaStat = val - equippedStats[stat];
        if (deltaStat === 0 && val === 0) continue;
        const d3a = $('<div/>').addClass('gearStat tooltip').attr("data-tooltip", stat).appendTo(d3);
            const d3a1 = $("<div/>").addClass(`${stat}_img`).appendTo(d3a);
            const d3a2 = $("<div/>").addClass(`${stat}_integer statValue`).appendTo(d3a);
        if (deltaStat > 0) {
            d3a.addClass("gearStatPositive");
            d3a1.html(miscIcons[stat]);
            d3a2.html(`${val} (+${deltaStat})`);
        }
        else if (deltaStat < 0) {
            d3a.addClass("gearStatNegative");
            d3a1.html(miscIcons[stat]);
            d3a2.html(`${val} (${deltaStat})`);
        }
        else {
            d3a1.html(miscIcons[stat]);
            d3a2.html(`${val}`);
        }
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
}

function equipHeroRecipesButton(e) {
    tabClick(e, 'recipesTab');
    const type = $(e.target).data("recipeType");
    recipeList.recipeFilterType = type;
    recipeList.recipeFilterString = "";
    recipeFilterList();
    $(".recipeSelect").removeClass("selected");
    $(`#rf${type}`).addClass("selected");  
}

$(document).on('click',".equipRecipeButton", (e) => {
    e.preventDefault();
    equipHeroRecipesButton(e);
});

$(document).on('click',".heroBackButton", (e) => {
    e.preventDefault();
    $heroInspectBox.addClass('heroInspectClosed');
    setTimeout(() => {
        updateHeroStats();
        $heroInspectBox.removeClass('heroInspectClosed isOpened');
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
    $heroInspectBox.addClass('isOpened');
    inspectHeroPreview(HeroManager.idToHero(ID))
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
    $(".heroExamineEquipment").removeClass("selected");
    $(e.currentTarget).addClass("selected");
    examineHeroPossibleEquip(heroID,gearType);
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
    destroyTooltip();
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
    destroyTooltip();
});

$(document).on('click', ".heroGearUpgradeSlotButton", (e) => {
    e.preventDefault();
    const heroID = $(e.currentTarget).data("heroID");
    const gearType = $(e.currentTarget).data("gearType");
    HeroManager.upgradeSlot(heroID,gearType);
    showHeroUpgrades();
})

