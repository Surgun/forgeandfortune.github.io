"use strict";

const $dreHeader = $("#dreHeader");
const $dreTeam = $("#dreTeam");
const $dreLoot = $("#dreLoot");
const $dreStats = $("#dreStats");
const $dreCollect = $("#dreCollect");
const $dungeonRewards = $("#dungeonRewards");

function showDungeonReward(dungeonID) {
    $dungeonSelect.hide();
    $dungeonRun.hide();
    $dungeonRewards.show();
    const dungeon = DungeonManager.dungeonByID(dungeonID);
    const state = dungeon.completeState;
    if (dungeon.status !== DungeonStatus.COLLECT) return;
    if (dungeon.floorComplete()) $dreHeader.html(`${dungeon.name} Complete!`);
    else $dreHeader.html(`${dungeon.name} Failed`);
    $dreTeam.empty();
    dungeon.party.heroes.forEach(hero => {
        const d1 = $("<div/>").addClass("dreTeamHero").appendTo($dreTeam);
            $("<div/>").addClass("dreTeamHeroImage").html(hero.image).appendTo(d1);
            $("<div/>").addClass("dreTeamHeroName").html(hero.name).appendTo(d1);
    });
    $dreStats.empty();
    const d5 = $("<div/>").addClass("dreStatContainer").appendTo($dreStats);
        $("<div/>").addClass("dreStatHeading").html("Turns Taken").appendTo(d5);
        $("<div/>").addClass("dreStatDescription").html(dungeon.beatTotal + " turns").appendTo(d5);
    const d6 = $("<div/>").addClass("dreStatContainer").appendTo($dreStats);
        $("<div/>").addClass("dreStatHeading").html("Boss HP").appendTo(d6);
        $("<div/>").addClass("dreStatDescription").html(dungeon.bossHPStyling()).appendTo(d6);
    $dreCollect.html("Accept")
}

const $dreRepeat = $("#dreRepeat"); 

$(document).on('click', "#dreCollect", (e) => {
    const dungeonID = DungeonManager.dungeonView;
    const dungeon = DungeonManager.dungeonByID(dungeonID);
    if (dungeon.floorComplete()) DungeonManager.completeBoss(dungeonID);
    dungeon.resetDungeon();
    openTab("dungeonsTab");
})