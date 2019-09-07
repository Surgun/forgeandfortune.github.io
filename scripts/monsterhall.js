"use strict";

const $monsterBuilding = $("#monsterBuilding");
const $monsterDiv = $(".monsterDiv");
const $monsterMobs = $("#monsterMobs");
const $monsterRewards = $("#monsterRewards");
const $monsterMobsInspect = $("#monsterMobsInspect");
const $monsterMobsList = $("#monsterMobsList");

const MonsterHall = {
    lvl : 1,
    kills : [],
    lastTab : "Beastiary",
    createSave() {
        const save = {};
        save.lvl = this.lvl;
        save.kills = [];
        this.kills.forEach(kill => {
            save.kills.push(kill.createSave());
        });
        return save;
    },
    loadSave(save) {
        this.lvl = save.lvl;
        save.kills.forEach(kill => {
            const newKill = new monsterKill(kill.id,kill.amt);
            newKill.loadSave(kill);
            this.kills.push(newKill);
        });
    },
    addLevel() {
        this.lvl += 1;
    },
    bossRefight() {
        return this.lvl > 1;
    },
    monsterKillCount(mobID) {
        const killCount = this.kills.find(m=>m.id === mobID);
        return (killCount === undefined) ? 0 : killCount.amt;
    },
    addKill(mobID) {
        let killCount = this.kills.find(m=>m.id === mobID);
        if (killCount === undefined) {
            killCount = new monsterKill(mobID,1);
            this.kills.push(killCount);
        }
        else killCount.amt += 1;
    }
}

class monsterKill {
    constructor (id,amt) {
        this.id = id;
        this.amt = amt;
    }
    addKill() {
        this.amt += 1;
    }
    createSave() {
        const save = {};
        save.id = this.id;
        save.amt = this.amt;
        return save;
    }
    loadSave(save) {
        return;
    }
}

function initiateMonsterBldg() {
    $monsterBuilding.show();
    $monsterDiv.hide().removeClass("selected");
    $monsterMobs.show().addClass("selected");
    refreshHallMonsterList();
}

function initiateMonsterHall() {
    MobManager.monsterDB.forEach(monster => {
        createMonsterHallCard(monster).appendTo($monsterMobsList);
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
    mhiBlock("Kills",`${MonsterHall.monsterKillCount(monster.id)}`).appendTo($monsterMobsInspect);
    const d = $("<div/>").addClass("mhiStats");
    const stats = [`${monster.getHP(floorRange.min)} - ${monster.getHP(floorRange.max)}`,`${monster.getPow(floorRange.min)} - ${monster.getPow(floorRange.max)}`, monster.spow, monster.apmax, monster.armor, monster.crit+"%", monster.dodge+"%"];
    for (let i=0;i<stats.length;i++) {
        d.append(statRow(statName[i],stats[i],statDesc[i]));
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