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
    if (dungeon.type === "boss" && state === "partyDead") $dreHeader.html(`${dungeon.name} Failed`);
    else if (state === "abandoned") $dreHeader.html(`${dungeon.name} Abandoned`);
    else $dreHeader.html(`${dungeon.name} Complete!`);
    $dreTeam.empty();
    dungeon.party.heroes.forEach(hero => {
        const d1 = $("<div/>").addClass("dreTeamHero").appendTo($dreTeam);
            $("<div/>").addClass("dreTeamHeroImage").html(hero.image).appendTo(d1);
            $("<div/>").addClass("dreTeamHeroName").html(hero.name).appendTo(d1);
    });
    $dreStats.empty();
    const d3 = $("<div/>").addClass("dreStatContainer").appendTo($dreStats);
        $("<div/>").addClass("dreStatHeading").html("Total Time").appendTo(d3);
    const d5 = $("<div/>").addClass("dreStatContainer").appendTo($dreStats);
        $("<div/>").addClass("dreStatHeading").html("Turns Taken").appendTo(d5);
        $("<div/>").addClass("dreStatDescription").html(dungeon.beatTotal + " turns").appendTo(d5);
    const d6 = $("<div/>").addClass("dreStatContainer").appendTo($dreStats);
        $("<div/>").addClass("dreStatHeading").html("Boss Percent").appendTo(d6);
        $("<div/>").addClass("dreStatDescription").html(dungeon.bossPercent()).appendTo(d6);
    $dreCollect.html("Accept")
}

const $dreRepeat = $("#dreRepeat"); 

$(document).on('click', "#dreCollect", (e) => {
    const dungeonID = DungeonManager.dungeonView;
    const dungeon = DungeonManager.dungeonByID(dungeonID);
    dungeon.resetDungeon();
    openTab("dungeonsTab");
})