"use strict";

const DungeonStatus = Object.freeze({EMPTY:0,ADVENTURING:1,COLLECT:2});

class TurnOrder {
    constructor(heroes,mobs) {
        this.heroes = heroes;
        this.mobs = mobs;
        this.order = interlace(heroes,mobs);
        this.position = 0;
        this.nextNotDead();
    }
    nextNotDead() {
        while (this.order[this.position].dead()) this.position += 1;
    }
    getOrder() {
        return this.order;
    }
    nextTurn() {
        return this.order[this.position];
    }
    nextPosition() {
        this.position += 1;
        if (this.position === this.order.length) this.position = 0;
        if (this.order[this.position].dead()) this.nextPosition();
    }
    createSave() {
        const save = {};
        save.position = this.position;
        return save;
    }
    loadSave(save) {
        this.position = save.position;
    }
    addMob(mob) {
        this.order.splice(this.position+1,0,mob);
    }
    getCurrentID() {
        return this.order[this.position].uniqueid;
    }
}

class Area {
    constructor(props) {
        Object.assign(this, props);
        this.dungeons = [];
    }
    createSave() {
        const save = {};
        return save;
    }
    loadSave(save) {
        return;
    }
    unlocked() {
        return this.dungeons.some(d => d.unlocked());
    }
    addDungeon(dungeon) {
        dungeon.area = this.id;
        this.dungeons.push(dungeon);
        
    }
    status() {
        if (this.dungeons.some(d => d.status === DungeonStatus.COLLECT)) return DungeonStatus.COLLECT;
        if (this.dungeons.some(d => d.status === DungeonStatus.ADVENTURING)) return DungeonStatus.ADVENTURING;
        return DungeonStatus.EMPTY;
    }
    activeParty() {
        const dungeon = this.dungeons.find(d => d.status === DungeonStatus.ADVENTURING);
        return dungeon.party;
    }
    activeDungeonID() {
        const dungeon = this.activeDungeon();
        return dungeon ? dungeon.id : dungeon;
    }
    activeDungeon() {
        const dungeon = this.dungeons.find(d => d.status === DungeonStatus.ADVENTURING || d.status === DungeonStatus.COLLECT);
        return dungeon ? dungeon : null;
    }
    lastOpen() {
        const dungeons = this.dungeons.filter(d => d.unlocked());
        return dungeons[dungeons.length-1];
    }
}

const AreaManager = {
    areas : [],
    areaView : null,
    addArea(area) {
        this.areas.push(area);
    },
    idToArea(areaID) {
        return this.areas.find(a=>a.id === areaID);
    },
    createSave() {
        const save = {};
        save.areas = [];
        this.areas.forEach(area => save.areas.push(area.createSave()));
    },
    loadSave(save) {
        save.areas.forEach(areaSave => {
            const area = this.idToArea(areaSave.id);
            area.loadSave(areaSave);
        });
    },
    addDungeon(dungeon) {
        const area = this.idToArea(dungeon.area);
        area.addDungeon(dungeon);
    }
}

class Dungeon {
    constructor(props) {
        Object.assign(this, props);
        this.party = null;
        this.mobs = [];
        this.mobIDs = [];
        this.mobIDs.push(this.mob1);
        if (this.mob2 !== null) this.mobIDs.push(this.mob2);
        if (this.mob3 !== null) this.mobIDs.push(this.mob3);
        if (this.mob4 !== null) this.mobIDs.push(this.mob4);
        this.maxFloor = 0;
        this.floor = 0;
        this.floorClear = 0;
        this.order = null;
        this.status = DungeonStatus.EMPTY;
        this.lastParty = null;
        this.dungeonTime = 0;
        this.rewardTime = 0;
    }
    createSave() {
        const save = {};
        save.id = this.id;
        if (this.party !== null) save.party = this.party.createSave();
        else save.party = null;
        save.mobs = [];
        this.mobs.forEach(mob => {
            save.mobs.push(mob.createSave());
        });
        save.maxFloor = this.maxFloor;
        save.floor = this.floor;
        save.floorClear = this.floorClear;
        if (this.order !== null) save.order = this.order.createSave();
        else save.order = null;
        save.status = this.status;
        save.lastParty = this.lastParty;
        save.rewardAmt = this.rewardAmt;
        save.rewardTimeRate = this.rewardTimeRate;
        return save;
    }
    loadSave(save) {
        if (save.party !== null) this.party = new Party(save.party.heroID);
        save.mobs.forEach(mobSave => {
            const mobTemplate = MobManager.idToMob(mobSave.id);
            const mob = new Mob(mobTemplate,0,0);
            mob.loadSave(mobSave);
            this.mobs.push(mob);
        });
        if (save.maxFloor !== undefined) this.maxFloor = save.maxFloor;
        if (save.floor !== undefined) this.floor = save.floor;
        if (save.floorClear !== undefined) this.floorClear = save.floorClear;
        if (save.order !== null) {
            this.order = new TurnOrder(this.party.heroes,this.mobs);
            this.order.loadSave(save.order);
        }
        this.status = save.status;
        this.lastParty = save.lastParty;
        this.rewardAmt = save.rewardAmt;
        this.rewardTimeRate = save.rewardTimeRate;
    }
    addTime(t) {
        //if there's enough time, grab the next guy and do some combat
        if (this.status !== DungeonStatus.ADVENTURING) return;
        this.dungeonTime += t;
        const dungeonWaitTime = DungeonManager.speed;
        const refreshLater = this.dungeonTime >= DungeonManager.speed * 2;
        CombatManager.refreshLater = refreshLater;
        this.addDungeonReward(t,refreshLater);
        while (this.dungeonTime >= dungeonWaitTime) {
            this.dungeonTime -= dungeonWaitTime;
            //take a turn
            this.buffTick("onTurn");
            this.passiveCheck("onTurn");
            if (this.mobs.every(m=>m.dead())) {
                console.log('mobs are dead?')
                this.nextFloor(refreshLater);
                return;
            }
            else if (this.party.isDead()) {
                this.previousFloor(refreshLater,true);
                return;
            }
            if (!refreshLater && DungeonManager.dungeonView === this.id) $(`#beatbarFill${this.order.getCurrentID()}`).css('width',"0%");
            CombatManager.nextTurn(this);
            if (!refreshLater && DungeonManager.dungeonView === this.id) refreshTurnOrder(this.id);
            //we repeat this because we need it early for passives, and late for combat
            if (this.mobs.every(m=>m.dead())) {
                this.nextFloor(refreshLater);
            }
            else if (this.party.isDead()) {
                this.previousFloor(refreshLater,true);
            }
        }
        if (refreshLater) {
            initiateDungeonFloor(this.id);
        }
        if (DungeonManager.dungeonView === this.id) refreshBeatBar(this.order.getCurrentID(),this.dungeonTime);
    }
    addDungeonReward(time,skipAnimation) {
        if (this.type === "boss") return;
        this.rewardTime += time;
        if (this.rewardTime > this.rewardTimeRate) {
            this.rewardTime -= this.rewardTimeRate;
            ResourceManager.addMaterial(this.mat,this.rewardAmt,skipAnimation)
        }
        if (!skipAnimation) refreshDungeonMatBar(this.id);
    }
    setRewardRate(floor) {
        this.floorClear = Math.max(floor,this.floorClear);
        this.rewardAmt = Math.ceil(floor/10);
        this.rewardTimeRate = this.rewardAmt/(floor*0.01+0.09)*1000;
    }
    initializeParty(party) {
        this.party = party;
        this.lastParty = party.heroID;
    }
    resetDungeon() {
        if (this.status !== DungeonStatus.ADVENTURING && this.status !== DungeonStatus.COLLECT) return;
        this.party.heroes.forEach(h=>{
            h.inDungeon = false;
            h.hp = h.maxHP()
        });
        if (DungeonManager.dungeonView === this.id) {
            openTab("dungeonsTab");
        }
        initializeSideBarDungeon();
        dungeonsTabClicked();
        this.status = DungeonStatus.EMPTY;
        this.party = null;
        this.order = null;
        this.mobs = [];
        this.floor = 0;
        this.floorClear = 0;
        this.rewardAmt = 0;
        this.rewardTimeRate = 0;
        this.rewardTime = 0;
        return;
    }
    previousFloor(refreshLater) {
        if (this.type === "boss") return this.resetDungeon(); 
        this.floor = Math.max(1,this.floor - 1);
        this.resetFloor(refreshLater);
    }
    nextFloor(refreshLater) {
        if (this.type === "boss") {
            this.maxFloor += 1;
            return this.resetDungeon();
        }
        this.setRewardRate(this.floor);
        this.maxFloor = Math.max(this.maxFloor,this.floor);
        this.floor += 1;        
        achievementStats.floorRecord(this.id, this.maxFloor);
        this.resetFloor(refreshLater);
        refreshFloorMaterial(this.id,this.rewardAmt);
    }
    resetFloor(refreshLater) {
        this.mobs = [];
        this.mobIDs.forEach(mobID => {
            const mob = MobManager.generateMob(mobID,this);
            this.mobs.push(mob);
        });
        this.party.reset();
        this.order = new TurnOrder(this.party.heroes,this.mobs);
        if (refreshLater || DungeonManager.dungeonView !== this.id) return;
        initiateDungeonFloor(this.id);
        $("#dsb"+this.id).html(`${this.name} - ${this.floorClear}`);
        refreshSidebarDungeonMats(this.id);
    }
    bossHPStyling() {
        if (this.type !== "boss") return "0 (0%)";
        const boss = this.mobs.find(m=>m.event === "boss")
        return `${formatToUnits(boss.hp,2)} (${Math.round(100*boss.hp/boss.maxHP())+"%"})`;
    }
    bossDifficulty() {
        return 0;
        //if (this.type === "regular") return 0;
        //const boss = DungeonManager.bossByDungeon(this.id);
        //return MonsterHall.monsterKillCount(boss);
    }
    buffTick(type) {
        this.party.heroes.forEach(hero => {
            hero.buffTick(type);
        })
        this.mobs.forEach(enemy => {
            enemy.buffTick(type);
        })
    }
    passiveCheck(type) {
        this.party.heroes.forEach(hero => {
            hero.passiveCheck(type);
        })
        this.mobs.forEach(enemy => {
            enemy.passiveCheck(type);
        })
    }
    getRewards() {
        return new idAmt("M201",1);
    }
    unlocked() {
        if (this.unlockedBy === null) return true;
        if (this.type === "dungeon") return Shop.alreadyPurchased(this.unlockedBy);
        const bossDungeon = DungeonManager.dungeonByID(this.unlockedBy);
        return bossDungeon.beaten();
    }
    beaten() {
        return this.maxFloor > 0;
    }
}

const DungeonManager = {
    dungeons : [],
    dungeonView : null,
    speed : 1500,
    createSave() {
        const save = {};
        save.dungeons = [];
        this.dungeons.forEach(d => {
            save.dungeons.push(d.createSave());
        });
        save.dungeonPaid = this.dungeonPaid;
        save.speed = this.speed;
        save.bossesBeat = this.bossesBeat;
        save.partySize = this.partySize;
        return save;
    },
    addDungeon(dungeon) {
        this.dungeons.push(dungeon);
        AreaManager.addDungeon(dungeon);
    },
    loadSave(save) {
        save.dungeons.forEach(d => {
            const dungeon = DungeonManager.dungeonByID(d.id);
            dungeon.loadSave(d);
        });
        this.speed = save.speed;
        if (typeof save.dungeonPaid !== "undefined") this.dungeonPaid = save.dungeonPaid;
        if (typeof save.bossesBeat !== "undefined") this.bossesBeat = save.bossesBeat;
        if (typeof save.partySize !== "undefined") this.partySize = save.partySize;
    },
    addTime(t) {
        this.dungeons.forEach(dungeon => {
            dungeon.addTime(t);
        });
    },
    dungeonStatus(dungeonID) {
        return this.dungeons.find(d=>d.id===dungeonID).status;
    },
    createDungeon(dungeonID,floorSkip) {
        const party = PartyCreator.lockParty();
        const dungeon = this.dungeonByID(dungeonID);
        dungeon.floor = floorSkip ? dungeon.maxFloor : 1;
        dungeon.status = DungeonStatus.ADVENTURING;
        this.dungeonView = dungeonID;
        dungeon.initializeParty(party);
        dungeon.resetFloor();
        initializeSideBarDungeon();
    },
    dungeonByID(dungeonID) {
        return this.dungeons.find(d => d.id === dungeonID);
    },
    abandonCurrentDungeon() {
        const dungeon = this.dungeonByID(this.dungeonView);
        dungeon.resetDungeon();
        initializeSideBarDungeon();
        refreshAreaSelect();
    },
    abandonAllDungeons() {
        this.dungeons.forEach(dungeon => {
            dungeon.resetDungeon();
        });
        initializeSideBarDungeon();
        refreshAreaSelect();
    },
    bossCount() {
        const bossDung = this.dungeons.filter(d => d.type === "boss");
        return bossDung.filter(d => d.maxFloor > 0).length;
    },
    availableUpgrades() {
        const bossDung = this.dungeons.filter(d => d.type === "boss").map(d => d.maxFloor);
        return bossDung.reduce((a,b) => a + b);
    },
    beaten(dungeonID) {
        const dungeon = this.dungeonByID(dungeonID);
        return dungeon.beaten();
    }
};