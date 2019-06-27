"use strict";

function openTab(tabName) {
    // Declare all variables
    DungeonManager.dungeonView = null;
    //HeroManager.heroView = null;
    if (tabName === "heroesTab") {
        clearExaminePossibleEquip();
       $(".heroExamineEquipment").removeClass("hEEactive");
    }
    if (tabName === "dungeonsTab") {
        $dungeonSelect.show();
        refreshDungeonSelect();
        $dungeonTeamSelect.hide();
        $dungeonRun.hide();
    }
    if (tabName === "townTab") {
        refreshSideTown();
    }
    if (tabName === "inventoryTab") {
        if (TownManager.bankStatus === BuildingState.built) $("#goToBank").show();
        else $("#goToBank").hide();
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
    tabClick(e, "dungeonsTab");
});

$comptitle4.click((e) => {
    e.preventDefault();
    tabClick(e, "guildTab");
});

$(document).on('click', ".DungeonSideBarStatus", (e) => {
    e.preventDefault();
    tabClick(e, "dungeonsTab");
    const dungeonID = $(e.currentTarget).attr("id").substring(3);
    showDungeon(dungeonID);
});

$(document).on('click', "#goToBank", (e) => {
    e.preventDefault();
    tabClick(e, 'townsTab');
    TownManager.lastBldg = "bank";
    TownManager.bankOnce = false;
    $(".buildingName").removeClass("selected");
    $("#bankBldg").addClass("selected");
    showBankBldg();
});

$(document).on( "keypress", (e) => {
    if (settings.dialogStatus === 0) {
        if (e.which === 49) tabClick(e, "inventoryTab");
        else if (e.which === 50) tabClick(e, "guildTab");
        else if (e.which === 51) tabClick(e, "recipesTab");
        else if (e.which === 52) tabClick(e, "heroesTab");
        else if (e.which === 53) tabClick(e, "dungeonsTab");
        else if (e.which === 54) tabClick(e, "townsTab");
        else if (e.which === 55) tabClick(e, "eventsTab");
        else if (e.which === 56) tabClick(e, "progressTab");
    }
});