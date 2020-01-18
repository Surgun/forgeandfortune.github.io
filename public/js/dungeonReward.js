"use strict";

var $dreHeader = $("#dreHeader");
var $dreTeam = $("#dreTeam");
var $dreLoot = $("#dreLoot");
var $dreStats = $("#dreStats");
var $dreCollect = $("#dreCollect");
var $dungeonRewards = $("#dungeonRewards");

function showDungeonReward(dungeonID) {
  $dungeonSelect.hide();
  $dungeonRun.hide();
  $dungeonRewards.show();
  var dungeon = DungeonManager.dungeonByID(dungeonID);
  var state = dungeon.completeState;
  if (dungeon.status !== DungeonStatus.COLLECT) return;
  if (dungeon.floorComplete()) $dreHeader.html("".concat(dungeon.name, " Complete!"));else $dreHeader.html("".concat(dungeon.name, " Failed"));
  $dreTeam.empty();
  dungeon.party.heroes.forEach(function (hero) {
    var d1 = $("<div/>").addClass("dreTeamHero").appendTo($dreTeam);
    $("<div/>").addClass("dreTeamHeroImage").html(hero.image).appendTo(d1);
    $("<div/>").addClass("dreTeamHeroName").html(hero.name).appendTo(d1);
  });
  $dreStats.empty();
  var d5 = $("<div/>").addClass("dreStatContainer").appendTo($dreStats);
  $("<div/>").addClass("dreStatHeading").html("Turns Taken").appendTo(d5);
  $("<div/>").addClass("dreStatDescription").html(dungeon.beatTotal + " turns").appendTo(d5);
  var d6 = $("<div/>").addClass("dreStatContainer").appendTo($dreStats);
  $("<div/>").addClass("dreStatHeading").html("Boss HP").appendTo(d6);
  $("<div/>").addClass("dreStatDescription").html(dungeon.bossHPStyling()).appendTo(d6);
  $dreCollect.html("Accept");
}

var $dreRepeat = $("#dreRepeat");
$(document).on('click', "#dreCollect", function (e) {
  var dungeonID = DungeonManager.dungeonView;
  var dungeon = DungeonManager.dungeonByID(dungeonID);
  if (dungeon.floorComplete()) DungeonManager.completeBoss(dungeonID);
  dungeon.resetDungeon();
  openTab("dungeonsTab");
});
//# sourceMappingURL=dungeonReward.js.map