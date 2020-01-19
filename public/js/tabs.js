"use strict";

function openTab(tabName) {
  // Declare all variables
  DungeonManager.dungeonView = null; //HeroManager.heroView = null;

  if (tabName === "heroesTab") {
    clearExaminePossibleEquip();
    $(".heroExamineEquipment").removeClass("hEEactive");
  }

  if (tabName === "dungeonsTab") {
    $dungeonSelect.show();
    dungeonsTabClicked();
  }

  if (tabName === "townTab") {
    refreshSideTown();
  }

  if (tabName === "inventoryTab") {
    if (TownManager.typeToBuilding('bank').status === BuildingState.built) $("#goToBank").show();else $("#goToBank").hide();
  }

  if (tabName === "marketTab") {
    refreshShop();
  }

  $(".tabcontent").hide();
  $("#" + tabName).show();
}

function tabClick(e, name) {
  openTab(name);
  if (name === "townsTab") name = "townTab";
  navTabHighlight(e, $('#' + name + 'Link')[0]);
}

var $comptitle1 = $("#comptitle1");
var $comptitle2 = $("#comptitle2");
var $comptitle3 = $("#comptitle3");
var $comptitle4 = $("#comptitle4");
$comptitle1.click(function (e) {
  e.preventDefault();
  tabClick(e, "inventoryTab");
});
$comptitle2.click(function (e) {
  e.preventDefault();
  tabClick(e, "recipesTab");
});
$comptitle3.click(function (e) {
  e.preventDefault();
  tabClick(e, "guildTab");
});
$comptitle4.click(function (e) {
  e.preventDefault();
  tabClick(e, "dungeonsTab");
});
$(document).on('click', ".DungeonSideBarStatus", function (e) {
  e.preventDefault();
  tabClick(e, "dungeonsTab");
  var dungeonID = $(e.currentTarget).data("dungeonID");
  screenDirectDungeon(dungeonID);
});
$(document).on('click', "#goToBank", function (e) {
  e.preventDefault();
  tabClick(e, 'townsTab');
  TownManager.lastBldg = "bank";
  $(".buildingName").removeClass("selected");
  $("#bankBldg").addClass("selected");
  showBldg('bank');
});
$(document).on("keypress", function (e) {
  if (settings.dialogStatus === 0) {
    if (e.which === 49) tabClick(e, "inventoryTab");else if (e.which === 50) tabClick(e, "guildTab");else if (e.which === 51) tabClick(e, "recipesTab");else if (e.which === 52) tabClick(e, "heroesTab");else if (e.which === 53) tabClick(e, "dungeonsTab");else if (e.which === 54) tabClick(e, "townsTab");else if (e.which === 55) tabClick(e, "marketTab");else if (e.which === 56) tabClick(e, "eventsTab");else if (e.which === 57) tabClick(e, "progressTab");
  }
});
//# sourceMappingURL=tabs.js.map