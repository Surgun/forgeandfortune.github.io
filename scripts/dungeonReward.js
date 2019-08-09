"use strict";

const $dungeonRewards = $("#dungeonRewards");
const $dreHeader = $("#dreHeader");
const $dreTeam = $("#dreTeam");
const $dreLoot = $("#dreLoot");
const $dreStats = $("#dreStats");
const $dreCollect = $("#dreCollect");

function showDungeonReward(dungeonID,abandoned) {
    $dungeonSelect.hide();
    $dungeonRun.hide();
    $dungeonRewards.show();
    const dungeon = DungeonManager.dungeonByID(dungeonID);
    if (dungeon.status !== DungeonStatus.COLLECT) return;
    $dreHeader.html(`${dungeon.name} ${abandoned ? " Abandoned" : " Complete!"}`);
    $dreTeam.empty();
    dungeon.party.heroes.forEach(hero => {
        const d1 = $("<div/>").addClass("dreTeamHero").appendTo($dreTeam);
            $("<div/>").addClass("dreTeamHeroImage").html(hero.image).appendTo(d1);
            $("<div/>").addClass("dreTeamHeroName").html(hero.name).appendTo(d1);
    });
    $dreLoot.empty();
    dungeon.dropList.forEach(drop => {
        const material = ResourceManager.idToMaterial(drop.id);
        const d2 = $("<div/>").addClass("dreLootDropCard tooltip").attr("data-tooltip",material.name).appendTo($dreLoot);
            $("<div/>").addClass("dreLootDropImage").html(material.img).appendTo(d2);
            $("<div/>").addClass("dreLootDropAmt").html(drop.amt).appendTo(d2);
    });
    $dreStats.empty();
    const d3 = $("<div/>").addClass("dreStatContainer").appendTo($dreStats);
        $("<div/>").addClass("dreStatHeading").html("Total Time").appendTo(d3);
        $("<div/>").addClass("dreStatDescription").html(timeSince(0,dungeon.dungeonTotalTime)).appendTo(d3);
    const d4 = $("<div/>").addClass("dreStatContainer").appendTo($dreStats);
        $("<div/>").addClass("dreStatHeading").html("Floor Reached").appendTo(d4);
        $("<div/>").addClass("dreStatDescription").html("Floor " + dungeon.floorCount).appendTo(d4);
    const d5 = $("<div/>").addClass("dreStatContainer").appendTo($dreStats);
        $("<div/>").addClass("dreStatHeading").html("Turns Taken").appendTo(d5);
        $("<div/>").addClass("dreStatDescription").html(dungeon.beatTotal + " turns").appendTo(d5);
}

$(document).on('click', "#dreCollect", (e) => {
    const dungeonID = DungeonManager.dungeonView;
    const dungeon = DungeonManager.dungeonByID(dungeonID);
    dungeon.resetDungeon();
    openTab("dungeonsTab");
})

//resetDungeon
