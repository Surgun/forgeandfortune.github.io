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
    $(".tabcontent").hide();
    $("#"+tabName).show();
}

function tabClick(e, name) {
    openTab(name);
    navTabHighlight(e,$('#'+name+'Link')[0]);
}

const $comptitle1 = $("#comptitle1");
const $comptitle2 = $("#comptitle2");
const $comptitle3 = $("#comptitle3");

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

$(document).on('click', "#DungeonSideBarStatus", (e) => {
    e.preventDefault();
    tabClick(e, "dungeonsTab");
    const dungeonID = $(e.currentTarget).attr("dungeonID");
    showDungeon(dungeonID);
})

$(document).on( "keypress", (e) => {
    if (e.which === 49) tabClick(e, "inventoryTab");
    else if (e.which === 50) tabClick(e, "recipesTab");
    else if (e.which === 51) tabClick(e, "workersTab");
    else if (e.which === 52) tabClick(e, "heroesTab");
    else if (e.which === 53) tabClick(e, "dungeonsTab");
    else if (e.which === 54) tabClick(e, "eventsTab");
    else if (e.which === 55) tabClick(e, "progressTab");
});