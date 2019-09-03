"use strict";

const $monsterBuilding = $("#monsterBuilding");
const $monsterDiv = $(".monsterDiv");
const $monsterMobs = $("#monsterMobs");
const $monsterBosses = $("#monsterBosses");
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

$(".monsterHallFilterCheck").change(() => {
    refreshHallMonsterList();
});