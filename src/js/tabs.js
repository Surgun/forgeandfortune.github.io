"use strict";

let lastTab = null;

function openTab(tabName) {
    lastTab = tabName;
    // Declare all variables
    DungeonManager.dungeonView = null;
    //HeroManager.heroView = null;
    if (tabName === "heroesTab") {
        refreshHeroOverview();
    }
    if (tabName === "dungeonsTab") {
        $dungeonSelect.show();
        dungeonsTabClicked();
    }
    if (tabName === "townsTab") {
        refreshSideTown();
        refreshTownBuilding();
    }
    if (tabName === "inventoryTab") {
        $inventoryTabSpan.removeClass("hasEvent");
        if (TownManager.typeToBuilding('bank').status === BuildingState.built) $("#goToBank").show();
        else $("#goToBank").hide();
        refreshInventory();
    }
    if (tabName === "marketTab") {
        $marketTabSpan.removeClass("hasEvent");
        refreshShop();
    }
    if (tabName === "questsTab") {
        refreshQuestLocations();
    }
    $(".tabcontent").hide();
    $("#"+tabName).show();
}

function tabClick(e, name) {
    openTab(name);
    if (name === "townsTab") name = "townTab"
    navTabHighlight(e,$('#'+name+'Link')[0]);
}

const $comptitle1 = $("#comptitle1");
const $comptitle2 = $("#comptitle2");
const $comptitle3 = $("#comptitle3");
const $comptitle4 = $("#comptitle4");

$comptitle1.click((e) => {
    e.preventDefault();
    tabClick(e, "inventoryTab");
});

$comptitle2.click((e) => {
    e.preventDefault();
    tabClick(e, "recipesTab");
});

$comptitle3.click((e) => {
    e.preventDefault();
    tabClick(e, "guildTab");
});

$comptitle4.click((e) => {
    e.preventDefault();
    tabClick(e, "dungeonsTab");
});

$(document).on('click', ".DungeonSideBarStatus", (e) => {
    e.preventDefault();
    tabClick(e, "dungeonsTab");
    const areaID = $(e.currentTarget).data("areaID");
    screenDirectDungeon(areaID);
});

$(document).on('click', "#goToBank", (e) => {
    e.preventDefault();
    tabClick(e, 'townsTab');
    TownManager.lastBldg = "bank";
    $(".buildingName").removeClass("selected");
    $("#bankBldg").addClass("selected");
    showBldg('bank');
});

$(document).on( "keypress", (e) => {
    if (settings.dialogStatus !== 0) return;
    if (e.which < 49 || e.which > 56) return;
    const choice = e.which - 49;
    const tabs = generateTabVisibleTabList();
    if (choice >= tabs.length) return;
    tabClick(e, tabs[choice]);
});

function generateTabVisibleTabList() {
    const tabs = [];
    if (recipeList.idToItem("R13001").craftCount > 0) tabs.push("inventoryTab");
    if (Shop.alreadyPurchased("AL1000")) tabs.push("guildTab");
    tabs.push("recipesTab");
    if (HeroManager.heroOwned("H203")) tabs.push("heroesTab");
    if (AreaManager.idToArea("A01").unlocked()) tabs.push("dungeonsTab");
    if (QuestManager.unlocked()) tabs.push("questsTab");
    if (TownManager.buildingsOwned()) tabs.push("townsTab");
    if (achievementStats.totalGoldEarned > 0) tabs.push("marketTab");
    return tabs;
}

const $heroesTabLink = $("#heroesTabLink");
const $dungeonsTabLink = $("#dungeonsTabLink");
const $progressTabLink = $("#progressTabLink");
const $guildTabLink = $("#guildTabLink");
const $questTabLink = $("#questTabLink");
const $inventoryTabLink = $("#inventoryTabLink");
const $inventoryTabSpan = $("#inventoryTabSpan");
const $marketTabLink = $("#marketTabLink");
const $marketTabSpan = $("#marketTabSpan");
const $townTabLink = $("#townTabLink");

function tabHide() {
    if (recipeList.idToItem("R13001").craftCount > 0) $inventoryTabLink.show();
    else $inventoryTabLink.hide();
    if (Shop.alreadyPurchased("AL1000")) $guildTabLink.show();
    else $guildTabLink.hide();
    if (HeroManager.heroOwned("H203")) $heroesTabLink.show();
    else $heroesTabLink.hide();
    if (AreaManager.idToArea("A01").unlocked()) $dungeonsTabLink.show();
    else $dungeonsTabLink.hide();
    if (QuestManager.unlocked()) $questTabLink.show();
    else $questTabLink.hide();
    if (TownManager.buildingsOwned()) $townTabLink.show();
    else $townTabLink.hide();
    if (achievementStats.totalGoldEarned > 0) $marketTabLink.show();
    else $marketTabLink.hide();
}