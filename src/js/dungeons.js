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
        this.unlocked = false;
        this.dungeons = [];
    }
    createSave() {
        const save = {};
        save.id = this.id;
        save.unlocked = this.unlocked;
        return save;
    }
    loadSave(save) {
        this.unlocked = save.unlocked;
    }
    unlock() {
        this.unlocked = true;
    }
    addDungeon(dungeon) {
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
        return this.dungeons.find(d => d.status === DungeonStatus.ADVENTURING || d.status === DungeonStatus.COLLECT).id;
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
    unlockArea(areaID) {
        const area = this.idToArea(areaID);
        area.unlock();
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
        this.maxFloor = 0;
        this.floor = 0;
        this.floorClear = 0;
        this.order = null;
        this.status = DungeonStatus.EMPTY;
        this.lastParty = null;
    }
    createSave() {
        const save = {};
        save.id = this.id;
        if (save.party !== null) save.party = this.party.createSave();
        else save.party = null;
        save.mobs = [];
        this.mobs.forEach(mob => {
            save.mobs.push(mob.createSave());
        });
        save.maxFloor = this.maxFloor;
        save.floor = this.floor;
        if (this.order !== null) save.order = this.order.createSave();
        else save.order = null;
        save.status = this.status;
        save.lastParty = this.lastParty;
        return save;
    }
    loadSave(save) {
        if (save.party !== null) this.party = new Party(save.party.heroID);
        save.mobs.forEach(mobSave => {
            const mobTemplate = MobManager.idToMob(mobSave.id);
            const mob = new Mob(mobSave.lvl, mobTemplate, mobSave.difficulty);
            mob.loadSave(mobSave);
            this.mobs.push(mob);
        });
        if (this.maxFloor !== undefined) this.maxFloor = save.maxFloor;
        if (this.floor !== undefined) this.floor = save.floor;
        if (save.order !== null) {
            this.order = new TurnOrder(this.party.heroes,this.mobs);
            this.order.loadSave(save.order);
        }
        this.status = save.status;
        this.lastParty = save.lastParty;
    }
    addTime(t) {
        //if there's enough time, grab the next guy and do some combat
        if (this.status !== DungeonStatus.ADVENTURING) return;
        this.dungeonTime += t;
        const dungeonWaitTime = DungeonManager.speed;
        const refreshLater = this.dungeonTime >= 2*dungeonWaitTime;
        CombatManager.refreshLater = refreshLater;
        while (this.dungeonTime >= dungeonWaitTime) {
            //take a turn
            this.buffTick("onTurn");
            this.passiveCheck("onTurn");
            if (this.floorComplete()) {
                this.nextFloor(refreshLater);
                this.dungeonTime -= dungeonWaitTime;
                return;
            }
            if (this.party.isDead()) {
                this.nextFloor(refreshLater,true);
                this.dungeonTime -= dungeonWaitTime;
                return;
            }
            if (!refreshLater && DungeonManager.dungeonView === this.id) $(`#beatbarFill${this.order.getCurrentID()}`).css('width',"0%");
            CombatManager.nextTurn(this);
            this.dungeonTime -= dungeonWaitTime;
            if (!refreshLater && DungeonManager.dungeonView === this.id) refreshTurnOrder(this.id);
        }
        if (refreshLater) {
            initiateDungeonFloor(this.id);
            BattleLog.refresh();
        }
        if (DungeonManager.dungeonView === this.id) refreshBeatBar(this.order.getCurrentID(),this.dungeonTime);
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
            BattleLog.clear();
            openTab("dungeonsTab");
        }
        initializeSideBarDungeon();
        refreshDungeonSelect();
        this.status = DungeonStatus.EMPTY;
        this.party = null;
        this.order = null;
        this.mobs = [];
        this.floor = 0;
        return;
    }
    nextFloor(refreshLater, previousFloor) {
        if (this.floorCount > 0 && this.type === "boss") return this.dungeonComplete(previousFloor);
        if (previousFloor) this.floor = Math.max(1,this.floor - 1);
        else this.floorCount += 1;
        this.maxFloor = Math.max(this.maxFloor,this.floor);
        achievementStats.floorRecord(this.id, this.maxFloor);
        this.mobs = MobManager.generateDungeonFloor(this.id,this.floor,this.bossDifficulty());
        this.party.reset();
        this.order = new TurnOrder(this.party.heroes,this.mobs);
        if (refreshLater) return;
        initiateDungeonFloor(this.id);
        $("#dsb"+this.id).html(`${this.name} - ${this.floorCount}`);
        refreshSidebarDungeonMats(this.id);
    }
    dungeonComplete() {
        this.status = DungeonStatus.COLLECT;
        refreshDungeonSelect();
        if (DungeonManager.dungeonView === this.id) showDungeonReward(this.id);
    }
    bossHPStyling() {
        if (this.type !== "boss") return "0 (0%)";
        const boss = this.mobs.find(m=>m.event === "boss")
        return `${formatToUnits(boss.hp,2)} (${Math.round(100*boss.hp/boss.maxHP())+"%"})`;
    }
    bossDifficulty() {
        if (this.type === "regular") return 0;
        const boss = DungeonManager.bossByDungeon(this.id);
        return MonsterHall.monsterKillCount(boss);
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
    materialGain() {
        const amt = this.floorClear
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
    createDungeon(floor) {
        const party = PartyCreator.lockParty();
        const dungeon = this.dungeonByID(this.dungeonCreatingID);
        dungeon.beatTotal = 0;
        dungeon.floorCount = 0;
        dungeon.progressNextFloor = true;
        dungeon.floorCount = floor-1;
        dungeon.status = DungeonStatus.ADVENTURING;
        this.dungeonView = this.dungeonCreatingID;
        dungeon.initializeParty(party);
        dungeon.nextFloor();
        initializeSideBarDungeon();
    },
    dungeonByID(dungeonID) {
        return this.dungeons.find(d => d.id === dungeonID);
    },
    abandonCurrentDungeon() {
        const dungeon = this.dungeonByID(this.dungeonView);
        dungeon.resetDungeon();
    },
    abandonAllDungeons() {
        this.dungeons.forEach(dungeon => {
            dungeon.resetDungeon();
        })
    },
};