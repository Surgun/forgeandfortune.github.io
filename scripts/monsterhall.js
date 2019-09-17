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
    lineUpgradesAvailable() {
        return ResourceManager.materialAvailable("M002");
    },
    addKill(mobID) {
        let killCount = this.kills.find(m=>m.id === mobID);
        if (killCount === undefined) {
            killCount = new idAmt(mobID,1);
            this.kills.push(killCount);
        }
        else killCount.amt += 1;
    },
    findMonster(mobID) {
        if (this.kills.find(m=>m.id === mobID)) return;
        const seen = new idAmt(mobID,0);
        this.kills.push(seen);
        refreshHallMonsterList();
    },
    haveSeen(mobID) {
        return this.kills.find(m=>m.id === mobID) !== undefined;
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
    maxUpgrade(line) {
        return this.lineUpgradeCount(line) >= 10;
    },
    floorSkip() {
        if (this.lvl < 3) return 0;
        return Math.floor(recipeList.masteryCount()*2.5);
    },
    lineIncrease(type,additional) {
        return Math.pow(0.95,this.lineUpgradeCount(type)+additional);
    },
    buyLine(type) {
        if (this.maxUpgrade(type)) return;
        if (ResourceManager.materialAvailable("M002") <= 0) return Notifications.cantAffordLineUpgrade();
        ResourceManager.addMaterial("M002",-1);
        this.addLineUpgrade(type);
        refreshMonsterRewardLines();
        refreshCraftTimes();
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

const $monsterNavMobs = $("#monsterNavMobs");
const $monsterNavRewards = $("#monsterNavRewards");
const $monsterNavButton  = $(".monsterNavButton");

function initiateMonsterBldg() {
    $monsterBuilding.show();
    $monsterDiv.hide().removeClass("selected"); //hide all the tabs besides monster mobs
    $monsterNavButton.removeClass("selected");
    $monsterNavMobs.addClass("selected");
    $monsterMobs.show().addClass("selected");
    refreshHallMonsterList();
}

$(document).on('click', "#monsterNavRewards", (e) => {
    e.preventDefault();
    $monsterNavButton.removeClass("selected");
    $monsterNavRewards.addClass("selected");
    $monsterDiv.hide().removeClass("selected");
    $monsterRewards.show().addClass("selected");
});

$(document).on('click', "#monsterNavMobs", (e) => {
    e.preventDefault();
    $monsterNavButton.removeClass("selected");
    $monsterNavMobs.addClass("selected");
    $monsterDiv.hide().removeClass("selected");
    $monsterMobs.show().addClass("selected");
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
const $monsterHallFilterBosses = $("#monsterHallFilterBosses")

function refreshHallMonsterList() {
    const dungeons = [];
    if ($monsterHallFilterD001.is(':checked')) dungeons.push("D001");
    if ($monsterHallFilterD002.is(':checked')) dungeons.push("D002");
    if ($monsterHallFilterD003.is(':checked')) dungeons.push("D003");
    const showBoss = ($monsterHallFilterBosses.is(':checked')) ? true : false;
    const shownMobs = FloorManager.mobsByDungeons(dungeons);
    monsterHallMonserDivs.forEach(monsterDiv => {
        const monsterID = monsterDiv.data("monsterID");
        const monster = MobManager.idToMob(monsterID);
        if (shownMobs.includes(monsterID) && MonsterHall.haveSeen(monsterID)) monsterDiv.show();
        else if (showBoss && monster.event === "boss" && MonsterHall.haveSeen(monsterID)) monsterDiv.show();
        else monsterDiv.hide();
    });
}

function refreshHallMonsterInspect(monster) {
    $monsterMobsInspect.empty();
    const d = $("<div/>").addClass("monsterInspectContainer");
    const d1 = $("<div/>").addClass("monsterActionsContainer");
    $("<div/>").addClass("monsterActionsButton").attr("id","mhiBackButton").html(`<i class="fas fa-arrow-left"></i> Back to Beastiary`).appendTo(d1);
    const d2 = $("<div/>").addClass("monsterDetails");
        const d2a = $("<div/>").addClass("monsterInfoDetails");
        const floorRange = FloorManager.floorRangeByMob(monster.id);
        const dungeonName = FloorManager.dungeonNameByMob(monster.id);
        mhiBlock("Name",monster.name).appendTo(d2a);
        $("<div/>").addClass("mhiBlockImage").html(monster.image).appendTo(d2a);
        const d2b = $("<div/>").addClass("monsterDungeonDetails");
        mhiBlock("Dungeon",dungeonName).appendTo(d2b);
        if (monster.event !== "boss") mhiBlock("Floors",`${floorRange.min} - ${floorRange.max}`).appendTo(d2b);
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
        $("<div/>").addClass("lineRewardLevel").html(`Level ${MonsterHall.lineUpgradeCount(type)}`).appendTo(d);
        const d1 = $("<div/>").addClass("lineRewardTitle").appendTo(d);
            $("<div/>").addClass("lineRewardTitleImage").html(`<img src='./images/recipeFilter/${type}32.png'>`).appendTo(d1);
            $("<div/>").addClass("lineRewardTitleName").html(type).appendTo(d1);
        const d2 = $("<div/>").addClass("lineRewardCurrent").appendTo(d);
            $("<div/>").addClass("lineRewardCurrentTitle").html(`Craft Speed`).appendTo(d2);
            const d2a = $("<div/>").addClass("lineRewardCurrentChange").appendTo(d2);
                $("<div/>").addClass("lineRewardCurrentChangeBefore").html(`+${(100-100*MonsterHall.lineIncrease(type,0)).toFixed(1)}%`).appendTo(d2a);
                if (!MonsterHall.maxUpgrade(type)) {
                    $("<div/>").addClass("lineRewardCurrentChangeMedian").html(`${miscIcons.arrow}`).appendTo(d2a);
                    $("<div/>").addClass("lineRewardCurrentChangeAfter").html(`+${(100-100*MonsterHall.lineIncrease(type,1)).toFixed(1)}%`).appendTo(d2a);
                }
        const d3 = $("<div/>").addClass("lineRewardPay").attr("id","monsterPay").data("line",type).appendTo(d);
            if (MonsterHall.maxUpgrade(type)) {
                $("<div/>").addClass("lineRewardPayText").html(`Max Level`).appendTo(d3);
            }
            else {
                $("<div/>").addClass("lineRewardPayText").html(`Increase`).appendTo(d3);
                $("<div/>").addClass("lineRewardPayCost tooltip").attr("data-tooltip", "Monster Trophy").html(`1 ${miscIcons.trophy}`).appendTo(d3);
            }
    });
}

$(document).on('click', "#monsterPay", (e) => {
    e.preventDefault();
    const type = $(e.currentTarget).data("line"); 
    MonsterHall.buyLine(type);
})