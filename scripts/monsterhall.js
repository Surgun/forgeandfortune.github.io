"use strict";

const $monsterBuilding = $("#monsterBuilding");
const $monsterDiv = $(".monsterDiv");
const $monsterMobs = $("#monsterMobs");
const $monsterRewards = $("#monsterRewards");
const $monsterMobsInspect = $("#monsterMobsInspect");

const MonsterHall = {
    lvl : 1,
    createSave() {
        const save = {};
        save.lvl = this.lvl;
        return save;
    },
    loadSave(save) {
        if (save.lvl !== undefined) this.lvl = save.lvl;
    },
}

function initiateMonsterBldg() {
    $monsterBuilding.show();
    $monsterDiv.hide().removeClass("selected");
    $monsterMobs.show().addClass("selected");
    refreshHallMonsterList();
}

function initiateMonsterHall() {
    MobManager.monsterDB.forEach(monster => {
        createMonsterHallCard(monster).appendTo($monsterMobs);
    });
};

const monsterHallMonserDivs = [];

function createMonsterHallCard(monster) {
    const d = $("<div/>").addClass("monsterCard").data("monsterID",monster.id).hide();
    $("<div/>").addClass("monsterCardName").html(monster.name).appendTo(d);
    $("<div/>").addClass("monsterCardImage").html(monster.head).appendTo(d);
    monsterHallMonserDivs.push(d);
    return d;
}

const $monsterHallFilterD001 = $("#monsterHallFilterD001");
const $monsterHallFilterD002 = $("#monsterHallFilterD002");
const $monsterHallFilterD003 = $("#monsterHallFilterD003");


function refreshHallMonsterList() {
    const dungeons = [];
    if ($monsterHallFilterD001.is(':checked')) dungeons.push("D001");
    if ($monsterHallFilterD002.is(':checked')) dungeons.push("D002");
    if ($monsterHallFilterD003.is(':checked')) dungeons.push("D003");
    const shownMobs = FloorManager.mobsByDungeons(dungeons);
    monsterHallMonserDivs.forEach(monsterDiv => {
        const monsterID = monsterDiv.data("monsterID");
        if (shownMobs.includes(monsterID)) monsterDiv.show();
        else monsterDiv.hide();
    });
}

function refreshHallMonsterInspect(monster) {
    $monsterMobsInspect.empty();
    $("<div/>").addClass("mhiBack").attr("id","mhiBackButton").html("Back to Beastiary").appendTo($monsterMobsInspect);
    const floorRange = FloorManager.floorRangeByMob(monster.id);
    const dungeonName = FloorManager.dungeonNameByMob(monster.id);
    mhiBlock("Name",monster.name).appendTo($monsterMobsInspect);
    $("<div/>").addClass("mhiBlockImage").html(monster.image).appendTo($monsterMobsInspect);
    mhiBlock("Dungeon",dungeonName).appendTo($monsterMobsInspect);
    mhiBlock("Floors",`${floorRange.min} - ${floorRange.max}`).appendTo($monsterMobsInspect);
    const stats = [`${monster.getHP(floorRange.min)} - ${monster.getHP(floorRange.max)}`,`${monster.getPow(floorRange.min)} - ${monster.getPow(floorRange.max)}`, monster.spow, monster.apmax, monster.armor, monster.crit+"%", monster.dodge+"%"];
    for (let i=0;i<stats.length;i++) {
        $monsterMobsInspect.append(statRow(statName[i],stats[i],statDesc[i]));
    }
}

function mhiBlock(heading,text) {
    const d = $("<div/>").addClass("mhiBlock");
        $("<div/>").addClass("mhiHeader").html(heading).appendTo(d);
        $("<div/>").addClass("mhiText").html(text).appendTo(d);
    return d;
}

$(".monsterHallFilterCheck").change(() => {
    refreshHallMonsterList();
});

$(document).on('click', "#mhiBackButton", (e) => {
    e.preventDefault();
    $monsterMobsInspect.hide();
    refreshHallMonsterList();
    $monsterMobs.show();
})

$(document).on('click', ".monsterCard", (e) => {
    e.preventDefault();
    const monsterID = $(e.currentTarget).data("monsterID");
    const monster = MobManager.idToMob(monsterID);
    refreshHallMonsterInspect(monster);
    $monsterMobs.hide();
    $monsterMobsInspect.show();
});