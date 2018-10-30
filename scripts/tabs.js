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
    navTabHighlight(e,$('#inventoryTabLink')[0]);
});

$comptitle2.click((e) => {
    e.preventDefault();
    openTab("recipesTab");
    navTabHighlight(e,$('#recipeTab')[0]);
});

$comptitle3.click((e) => {
    e.preventDefault();
    openTab("dungeonsTab");
    navTabHighlight(e,$('#dungeonsTabLink')[0]);
});

$(document).on('click', "#DungeonSideBarStatus", (e) => {
    e.preventDefault();
    openTab("dungeonsTab");
    navTabHighlight(e,$('#dungeonsTabLink')[0]);
    const dungeonID = $(e.currentTarget).attr("dungeonID");
    showDungeon(dungeonID);
})