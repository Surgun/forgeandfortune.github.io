"use strict";

function openTab(tabName) {
    // Declare all variables
    DungeonManager.dungeonView = null;
    HeroManager.heroView = null;
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
    $(".tabcontent").hide();
    $("#"+tabName).show();
}

const $comptitle1 = $("#comptitle1");
const $comptitle2 = $("#comptitle2");
const $comptitle3 = $("#comptitle3");

$comptitle1.click((e) => {
    e.preventDefault();
    openTab("inventoryTab");
});

$comptitle2.click((e) => {
    e.preventDefault();
    openTab("recipesTab");
});

$comptitle3.click((e) => {
    e.preventDefault();
    openTab("dungeonsTab");
});