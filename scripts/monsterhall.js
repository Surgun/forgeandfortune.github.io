"use strict";

const $monsterBuilding = $("#monsterBuilding");
const $monsterDiv = $(".monsterDiv");
const $monsterMobs = $("#monsterMobs");
const $monsterBosses = $("#monsterBosses");
const $monsterRewards = $("#monsterRewards");


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

function intiateMonsterBldg() {
    $monsterBuilding.show();
    $monsterDiv.hide().removeClass("selected");
    $monsterMobs.show().addClass("selected");
    refreshHallMonsters();
}

function refreshHallMonsters() {
    
}
