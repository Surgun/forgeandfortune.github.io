"use strict";

function openTab(tabName) {
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
    if (tabName === "townTab") {
        refreshSideTown();
    }
    if (tabName === "inventoryTab") {
        $inventoryTabSpan.removeClass("hasEvent");
        if (TownManager.typeToBuilding('bank').status === BuildingState.built) $("#goToBank").show();
        else $("#goToBank").hide();
    }
    if (tabName === "marketTab") {
        $marketTabSpan.removeClass("hasEvent");
        refreshShop();
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
    if (settings.dialogStatus === 0) {
        if (e.which === 49) tabClick(e, "inventoryTab");
        else if (e.which === 50) tabClick(e, "guildTab");
        else if (e.which === 51) tabClick(e, "recipesTab");
        else if (e.which === 52) tabClick(e, "heroesTab");
        else if (e.which === 53) tabClick(e, "dungeonsTab");
        else if (e.which === 54) tabClick(e, "townsTab");
        else if (e.which === 55) tabClick(e, "marketTab");
        else if (e.which === 56) tabClick(e, "eventsTab");
        else if (e.which === 57) tabClick(e, "progressTab");
    }
});

const $heroesTabLink = $("#heroesTabLink");
const $dungeonsTabLink = $("#dungeonsTabLink");
const $progressTabLink = $("#progressTabLink");
const $guildTabLink = $("#guildTabLink");
const $inventoryTabLink = $("#inventoryTabLink");
const $inventoryTabSpan = $("#inventoryTabSpan");
const $marketTabLink = $("#marketTabLink");
const $marketTabSpan = $("#marketTabSpan");

function tabHide() {
    if (recipeList.idToItem("R13001").craftCount > 0) $inventoryTabLink.show();
    else $inventoryTabLink.hide();
    if (HeroManager.heroOwned("H203")) $heroesTabLink.show();
    else $heroesTabLink.hide();
    if (AreaManager.idToArea("A01").unlocked()) $dungeonsTabLink.show();
    else $dungeonsTabLink.hide();
    if (Shop.alreadyPurchased("AL3001")) $progressTabLink.show();
    else $progressTabLink.hide();
    if (Shop.alreadyPurchased("AL3001")) $progressTabLink.show();
    else $progressTabLink.hide();
    if (Shop.alreadyPurchased("AL1000")) $guildTabLink.show();
    else $guildTabLink.hide();
    if (achievementStats.totalGoldEarned > 0) $marketTabLink.show();
    else $marketTabLink.hide();
}