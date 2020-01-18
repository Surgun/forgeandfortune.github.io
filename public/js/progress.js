"use strict";

var $plBoss = $("#plBoss");
var $pbBoss = $("#pbBoss");
var $plRecipeMastery = $("#plRecipeMastery");
var $pbRecipe = $("#pbRecipe");
var $plPerk = $("#plPerk");
var $pbPerk = $("#pbPerk");
var $plOverall = $("#plOverall");
var $pbOverall = $("#pbOverall");

function refreshProgress() {
  //big progress boxes
  var tally = 0;
  var max = 0;
  $plBoss.html("1/1}");
  var bossPercent = 100 .toFixed(2);
  $pbBoss.css('width', bossPercent + "%");
  if (bossPercent === "100.00") $pbBoss.addClass("Completed");
  tally += 1;
  max += 1;
  $plRecipeMastery.html("".concat(recipeList.masteryCount(), "/").concat(recipeList.recipeCount()));
  var recipePercent = (recipeList.masteryCount() / recipeList.recipeCount() * 100).toFixed(2);
  $pbRecipe.css('width', recipePercent + "%");
  if (recipePercent === "100.00") $pbRecipe.addClass("Completed");
  tally += recipeList.masteryCount();
  max += recipeList.recipeCount();
  $plPerk.html("".concat(Shop.perkCount(), "/").concat(Shop.perkMaxCount()));
  var perkPercent = (Shop.perkCount() / Shop.perkMaxCount() * 100).toFixed(2);
  $pbPerk.css('width', perkPercent + "%");
  if (perkPercent === "100.00") $pbPerk.addClass("Completed");
  tally += Shop.perkCount();
  max += Shop.perkMaxCount();
  var overallPercent = tally / max;
  if (overallPercent === 1 && achievementStats.endTime === -1) achievementStats.endTime = Date.now();
  $plOverall.html((overallPercent * 100).toFixed(2) + "%");
  $pbOverall.css('width', (overallPercent * 100).toFixed(2) + "%");
  if (overallPercent === 1) $pbOverall.addClass("Completed");
}

var $statMaxFloor = $("#statMaxFloor");
var $statFloors = $("#statFloors");
var $statTotalGoldEarned = $("#statTotalGoldEarned");
var $statTotalItems = $("#statTotalItems");
var $statCommons = $("#statCommons");
var $statGoods = $("#statGoods");
var $statGreats = $("#statGreats");
var $statEpics = $("#statEpics");
var $statTimePlayed = $("#statTimePlayed");
var $gameTime = $("#gameTime");
var $completeTime = $("#completeTime");
var $statMaxFloorD001 = $("#statMaxFloorD001");
var $statMaxFloorD002 = $("#statMaxFloorD002");
var $statMaxFloorD003 = $("#statMaxFloorD003");
var achievementStats = {
  startTime: 0,
  endTime: -1,
  maxFloor: 0,
  timePlayed: 0,
  totalGoldEarned: 0,
  epicsCrafted: 0,
  greatsCrafted: 0,
  goodsCrafted: 0,
  commonsCrafted: 0,
  totalItemsCrafted: 0,
  totalFloorsBeaten: 0,
  D001floor: 0,
  D002floor: 0,
  D003floor: 0,
  setTimePlayed: function setTimePlayed(ms) {
    this.timePlayed += ms;
    $statTimePlayed.html(timeSince(this.startTime, Date.now()));
    $gameTime.html(currentDate());
    if (achievementStats.endTime > 0) $completeTime.html(timeSince(this.startTime, this.endTime));
  },
  floorRecord: function floorRecord(dungeonID, floor) {
    if (dungeonID === "D001") {
      achievementStats.D001floor = Math.max(achievementStats.D001floor, floor);
      $statMaxFloorD001.html("Floor " + this.D001floor);
    }

    if (dungeonID === "D002") {
      achievementStats.D002floor = Math.max(achievementStats.D002floor, floor);
      $statMaxFloorD002.html("Floor " + this.D002floor);
    }

    if (dungeonID === "D003") {
      achievementStats.D003floor = Math.max(achievementStats.D003floor, floor);
      $statMaxFloorD003.html("Floor " + this.D003floor);
    }

    this.totalFloorsBeaten += 1;
    $statFloors.html(this.totalFloorsBeaten);
  },
  craftedItem: function craftedItem(rarity) {
    this.totalItemsCrafted += 1;
    if (rarity === "Common") this.commonsCrafted += 1;
    if (rarity === "Good") this.goodsCrafted += 1;
    if (rarity === "Great") this.greatsCrafted += 1;
    if (rarity === "Epic") this.epicsCrafted += 1;
    $statTotalItems.html(formatToUnits(this.totalItemsCrafted, 2));
    $statCommons.html(formatToUnits(this.commonsCrafted, 2));
    $statGoods.html(formatToUnits(this.goodsCrafted, 2));
    $statGreats.html(formatToUnits(this.greatsCrafted, 2));
    $statEpics.html(formatToUnits(this.epicsCrafted, 2));
  },
  gold: function gold(g) {
    this.totalGoldEarned += g;
    $statTotalGoldEarned.html(formatToUnits(this.totalGoldEarned, 2));
  },
  createSave: function createSave() {
    var save = {};
    save.startTime = this.startTime;
    save.endTime = this.endTime;
    save.timePlayed = this.timePlayed;
    save.totalGoldEarned = this.totalGoldEarned;
    save.epicsCrafted = this.epicsCrafted;
    save.greatsCrafted = this.greatsCrafted;
    save.goodsCrafted = this.goodsCrafted;
    save.commonsCrafted = this.commonsCrafted;
    save.totalItemsCrafted = this.totalItemsCrafted;
    save.totalFloorsBeaten = this.totalFloorsBeaten;
    save.D001floor = this.D001floor;
    save.D002floor = this.D002floor;
    save.D003floor = this.D003floor;
    return save;
  },
  loadSave: function loadSave(save) {
    this.startTime = save.startTime;
    this.endTime = save.endTime;
    this.maxFloor = save.maxFloor;
    this.timePlayed = save.timePlayed;
    this.totalGoldEarned = save.totalGoldEarned;
    this.epicsCrafted = save.epicsCrafted;
    this.greatsCrafted = save.greatsCrafted;
    this.goodsCrafted = save.goodsCrafted;
    this.commonsCrafted = save.commonsCrafted;
    this.totalItemsCrafted = save.totalItemsCrafted;
    this.totalFloorsBeaten = save.totalFloorsBeaten;

    if (save.D001floor !== undefined) {
      this.D001floor = save.D001floor;
      $statMaxFloorD001.html("Floor " + this.D001floor);
    }

    if (save.D002floor !== undefined) {
      this.D002floor = save.D002floor;
      $statMaxFloorD002.html("Floor " + this.D002floor);
    }

    if (save.D003floor !== undefined) {
      this.D003floor = save.D003floor;
      $statMaxFloorD003.html("Floor " + this.D003floor);
    }

    $statMaxFloor.html("Floor " + this.maxFloor);
    $statTotalGoldEarned.html(formatToUnits(this.totalGoldEarned, 2));
    $statFloors.html(this.totalFloorsBeaten);
    $statTimePlayed.html(timeSince(0, this.timePlayed));
    $statTotalItems.html(this.totalItemsCrafted);
    $statCommons.html(this.commonsCrafted);
    $statGoods.html(this.goodsCrafted);
    $statGreats.html(this.greatsCrafted);
    $statEpics.html(this.epicsCrafted);
  },
  highestFloor: function highestFloor() {
    return Math.max(this.D001floor, this.D002floor, this.D003floor);
  }
};
var $achieve1 = $("#achieve1");
var $achieve2 = $("#achieve2");
var $achieve3 = $("#achieve3");
var $achieve4 = $("#achieve4");
var $achieve5 = $("#achieve5");
var $achieve6 = $("#achieve6");
var $achieve7 = $("#achieve7");
var $achieve8 = $("#achieve8");
var $achieve9 = $("#achieve9");
var $achieve10 = $("#achieve10");