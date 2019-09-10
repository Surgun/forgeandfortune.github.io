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
    lineUpgrades : [],
    lastTab : "Beastiary",
    createSave() {
        const save = {};
        save.lvl = this.lvl;
        save.kills = [];
        this.kills.forEach(kill => {
            save.kills.push(kill.createSave());
        });
        save.lineUpgrades = [];
        this.lineUpgrades.forEach(upgrade => {
            save.lineUpgrades.push(upgrade.createSave());
        });
        return save;
    },
    loadSave(save) {
        this.lvl = save.lvl;
        save.kills.forEach(kill => {
            const newKill = new idAmt(kill.id,kill.amt);
            newKill.loadSave(kill);
            this.kills.push(newKill);
        });
        save.lineUpgrades.forEach(upgrade => {
            const newUpgrade = new idAmt(upgrade.id,upgrade.amt);
            newUpgrade.loadSave(upgrade);
            this.lineUpgrades.push(newUpgrade);
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
    totalKills() {
        return this.kills.reduce((a,b) => a+b.amt,0);
    },
    totalLineUpgrades() {
        return this.lineUpgrades.reduce((a,b) => a+b.amt,0);
    },
    lineUpgradesAvailable() {
        return this.totalKills()-this.totalLineUpgrades();
    },
    addKill(mobID) {
        let killCount = this.kills.find(m=>m.id === mobID);
        if (killCount === undefined) {
            killCount = new idAmt(mobID,1);
            this.kills.push(killCount);
        }
        else killCount.amt += 1;
    },
    addLineUpgrade(line) {
        let upgrade = this.lineUpgrades.find(m=>m.id === line);
        if (upgrade === undefined) {
            upgrade = new idAmt(line,1);
            this.lineUpgrades.push(upgrade);
        }
        else upgrade.amt += 1;
    },
    lineUpgradeCount(line) {
        const upgrade = this.lineUpgrades.find(u=>u.id === line);
        return (upgrade === undefined) ? 0 : upgrade.amt;
    },
    floorSkip() {
        return Math.floor(recipeList.masteryCount()*2.5);
    },
    lineIncrease(type,additional=0) {
        const num = this.lineUpgradeCount(type);
        return Math.round(Math.pow(0.95,num+additional),1);
    },
    buyLine(type) {
        if (this.lineUpgradesAvailable() <= 0) return Notifications.cantAffordLineUpgrade();
        this.addLineUpgrade(type);
        refreshMonsterRewardLines();
    }
}

class idAmt {
    constructor (id,amt) {
        this.id = id;
        this.amt = amt;
    }
    addAmt() {
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
    $monsterDiv.hide().removeClass("selected"); //hide all the tabs besides monster mobs
    $monsterMobs.show().addClass("selected");
    refreshHallMonsterList();
}

const $monsterNavMobs = $("#monsterNavMobs");
const $monsterNavRewards = $("#monsterNavRewards");
const $monsterNavButton  = $(".monsterNavButton");

$(document).on('click', "#monsterNavRewards", (e) => {
    console.log('monster rewards');
    e.preventDefault();
    $monsterNavButton.removeClass("selected");
    $monsterNavRewards.addClass("selected");
    $monsterDiv.hide().removeClass("selected");
    $monsterRewards.show().addClass("selecteD");
});

$(document).on('click', "#monsterNavMobs", (e) => {
    console.log('monster nav');
    e.preventDefault();
    $monsterNavButton.removeClass("selected");
    $monsterNavMobs.addClass("selected");
    $monsterDiv.hide().removeClass("selected");
    $monsterMobs.show().addClass("selecteD");
});

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
    const d = $("<div/>").addClass("monsterInspectContainer");
    const d1 = $("<div/>").addClass("monsterActionsContainer");
    $("<div/>").addClass("mhiBack").attr("id","mhiBackButton").html("Back to Beastiary").appendTo(d1);
    const d2 = $("<div/>").addClass("monsterDetails");
        const d2a = $("<div/>").addClass("monsterInfoDetails");
        const floorRange = FloorManager.floorRangeByMob(monster.id);
        const dungeonName = FloorManager.dungeonNameByMob(monster.id);
        mhiBlock("Name",monster.name).appendTo(d2a);
        $("<div/>").addClass("mhiBlockImage").html(monster.image).appendTo(d2a);
        const d2b = $("<div/>").addClass("monsterDungeonDetails");
        mhiBlock("Dungeon",dungeonName).appendTo(d2b);
        mhiBlock("Floors",`${floorRange.min} - ${floorRange.max}`).appendTo(d2b);
        mhiBlock("Kills",`${MonsterHall.monsterKillCount(monster.id)}`).appendTo(d2b);
        d2.append(d2a,d2b);
    const d3 = $("<div/>").addClass("mhiStats");
    const stats = [`${monster.getHP(floorRange.min)} - ${monster.getHP(floorRange.max)}`,`${monster.getPow(floorRange.min)} - ${monster.getPow(floorRange.max)}`, monster.spow, monster.apmax, monster.armor, monster.crit+"%", monster.dodge+"%"];
    for (let i=0;i<stats.length;i++) {
        d3.append(statRow(statName[i],stats[i],statDesc[i]));
    }
    d.append(d1,d2,d3);
    $monsterMobsInspect.append(d);
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

const $mRWM = $("#mRWM");
const $mRWS = $("#mRWS");
const $mRTmax = $("#mRTmax");
const $mRTavail = $("#mRTavail");

function refreshMonsterReward() {
    $mRWM.html(recipeList.masteryCount());
    $mRWS.html(MonsterHall.floorSkip());
    $mRTmax.html(MonsterHall.totalKills());
    $mRTavail.html(MonsterHall.lineUpgradesAvailable());
}

const $mRewardLines = $("#mRewardLines");

function refreshMonsterRewardLines() {
    $mRewardLines.empty();
    ItemType.forEach(type => {
        const d = $("<div/>").addClass("lineRewardContainer").appendTo($mRewardLines);
        const d1 = $("<div/>").addClass("lineRewardTitle").appendTo(d);
            $("<div/>").addClass("lineRewardTitleImage").html(`<img src='../../images/recipeFilter/${type}32.png'`).appendTo(d1);
            $("<div/>").addClass("lineRewardTitleName").html(type);
        $("<div/>").addClass("lineRewardCurrent").html(`Craft Speed: ${100*MonsterHall.lineIncrease(type)}% ${miscIcons.arrow} ${100*MonsterHall.lineIncrease(type,1)}%`).appendTo(d);
        $("<div/>").addClass("lineRewardPay").attr("id","monsterPay").data("line",type).html(`Increase - 1 ${miscIcons.trophy}`).appendTo(d);
    });
}

$(document).on('click', "#monsterPay", (e) => {
    e.preventDefault();
    const type = $(e.currentTarget).data("type"); 
    MonsterHall.buyLine(type);
})