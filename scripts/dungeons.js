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
        while (this.order[this.position].dead()) this.position++;
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
}


class Dungeon {
    constructor(props) {
        Object.assign(this, props);
        this.maxMonster = 4;
        this.party = null;
        this.mobs = [];
        this.dropList = [];
        this.dungeonTime = 0;
        this.dungeonTotalTime = 0;
        this.floorCount = 0;
        this.order = null;
        this.status = DungeonStatus.EMPTY;
        this.lastParty = null;
        this.floorMaterial = null;
        this.completeState = "none";
        this.progressNextFloor = true;
    }
    createSave() {
        const save = {};
        save.id = this.id;
        save.lastParty = this.lastParty;
        save.floorID = this.floorID;
        if (this.party === null) save.party = null;
        else save.party = this.party.createSave();
        save.mobs = [];
        this.mobs.forEach(m=>{
            save.mobs.push(m.createSave());
        });
        save.dropList = this.dropList;
        save.dungeonTime = this.dungeonTime;
        save.floorCount = this.floorCount;
        save.order = [];
        if (this.order === null) save.order = null;
        else save.order = this.order.createSave();
        save.status = this.status;
        save.completeState = this.completeState;
        save.progressNextFloor = this.progressNextFloor;
        return save;
    }
    loadSave(save) {
        if (save.party !== null) this.party = new Party(save.party.heroID);
        else save.party = null;
        if (save.lastParty !== undefined) this.lastParty = save.lastParty;
        if (save.floorID !== undefined) this.floorID = save.floorID;
        this.mobs = [];
        save.mobs.forEach(mobSave => {
            const mobTemplate = MobManager.idToMob(mobSave.id);
            const mob = new Mob(mobSave.lvl, mobTemplate, mobSave.difficulty);
            mob.loadSave(mobSave);
            this.mobs.push(mob);
        });
        if (save.order !== null) {
            this.order = new TurnOrder(this.party.heroes,this.mobs);
            this.order.loadSave(save.order);
        }   
        this.dropList = save.dropList;
        this.dungeonTime = save.dungeonTime;
        this.floorCount = save.floorCount;
        this.status = save.status;
        if (save.completeState !== undefined) this.completeState = save.completeState;
        if (save.progressNextFloor !== undefined) this.progressNextFloor = save.progressNextFloor;
    }
    addTime(t) {
        //if there's enough time, grab the next guy and do some combat
        if (this.status !== DungeonStatus.ADVENTURING) return;
        this.dungeonTime += t;
        this.dungeonTotalTime += t;
        const dungeonWaitTime = DungeonManager.speed;
        const refreshLater = this.dungeonTime >= 2*dungeonWaitTime;
        CombatManager.refreshLater = refreshLater;
        while (this.dungeonTime >= dungeonWaitTime) {
            //take a turn
            this.buffTick();
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
            CombatManager.nextTurn(this);
            this.dungeonTime -= dungeonWaitTime;
            if (!refreshLater) refreshTurnOrder(this.id);
        }
        if (refreshLater) {
            initiateDungeonFloor(this.id);
            BattleLog.refresh();
        }
        if (DungeonManager.dungeonView === this.id) refreshBeatBar(this.dungeonTime);
    }
    floorComplete() {
        return this.mobs.every(m=>m.dead());
    }
    initializeParty(party) {
        this.party = party;
        this.lastParty = party.heroID;
    }
    endDungeon() {
        if (DungeonManager.dungeonView === this.id) {
            showDungeonReward(this.id);
        }
        initializeSideBarDungeon();
    }
    resetDungeon() {
        this.party.heroes.forEach(h=>{
            h.inDungeon = false;
            h.ap = 0;
            h.hp = h.maxHP()
        });
        if (this.type === "boss" && this.mobs.every(m=>m.dead())) {
            if (!DungeonManager.bossesBeat.includes(this.id)) DungeonManager.bossesBeat.push(this.id);
            refreshALprogress();
            refreshProgress();
            refreshAllOrders();
        }
        DungeonManager.removeDungeon(this.id);
        if (DungeonManager.dungeonView === this.id) {
            BattleLog.clear();
            openTab("dungeonsTab");
        }
        initializeSideBarDungeon();
        refreshDungeonSelect();
        this.status = DungeonStatus.EMPTY;
        this.order = null;
        this.dungeonTime = 0;
        this.floorCount = 0;
        this.dungeonTotalTime = 0;
        this.beatTotal = 0;
        this.dropList = [];
        this.completeState = "none";
        return;
    }
    getRewards() {
        const value = Math.floor(this.floorCount/5);
        const amt = miscLoadedValues.floorMatA[value];
        const mat = FloorManager.floorByID(this.floorID).matA;
        return new idAmt(mat,amt);
    }
    addRewards() {
        const rewards = this.getRewards();
        ResourceManager.addMaterial(rewards.id,rewards.amt);
        ActionLeague.addNoto(this.notoriety());
    }
    nextFloor(refreshLater, previousFloor) {
        if (!previousFloor) this.addRewards();
        if (previousFloor) {
            this.floorCount = Math.max(1,this.floorCount-1);
            this.toggleProgress(false);
        }
        else if (this.progressNextFloor) this.floorCount += 1;
        achievementStats.floorRecord(this.id, this.floorCount);
        const floor = FloorManager.getFloor(this.id, this.floorCount);
        this.floorID = floor.id;
        this.mobs = MobManager.generateDungeonFloor(floor,this.floorCount,this.bossDifficulty());
        this.order = new TurnOrder(this.party.heroes,this.mobs);
        this.party.resetForFloor();
        if (refreshLater) return;
        initiateDungeonFloor(this.id);
        $("#dsb"+this.id).html(`${this.name} - Floor ${this.floorCount}`);
    }
    bossPercent() {
        if (this.type !== "boss") return "0%";
        const boss = this.mobs.find(m=>m.event === "boss")
        return Math.round(100*boss.hp/boss.maxHP())+"%";
    }
    notoriety() {
        return this.floorCount;
    }
    bossDifficulty() {
        if (this.type === "regular") return 0;
        const boss = DungeonManager.bossByDungeon(this.id);
        return MonsterHall.monsterKillCount(boss);
    }
    buffTick() {
        this.party.heroes.forEach(hero => {
            hero.buffTick();
        })
        this.mobs.forEach(enemy => {
            enemy.buffTick();
        })
    }
    toggleProgress(toggle) {
        if (toggle === undefined) toggle = !this.progressNextFloor;
        this.progressNextFloor = toggle;
        if (DungeonManager.dungeonView !== this.id) return;
        if (toggle) $toggleProgress.html("Advance Floors");
        else $toggleProgress.html("Stay Here");
    }
}

const DungeonManager = {
    dungeons : [],
    dungeonCreatingID : null,
    dungeonView : null,
    speed : 750,
    dungeonPaid : [],
    bossesBeat : [],
    partySize : 1,
    unlockDungeon(id) {
        this.dungeonPaid.push(id);
    },
    bossDungeonCanSee(id) {
        if (MonsterHall.bossRefight()) return this.dungeonPaid.includes(id);
        return this.dungeonPaid.includes(id) && !DungeonManager.bossCleared(id);
    },
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
    removeDungeon(dungeonID) {
        const dungeon = this.dungeonByID(dungeonID);
        dungeon.party = null;
        dungeon.status = DungeonStatus.EMPTY;
        initializeSideBarDungeon();
    },
    repeatDungeon(dungeonID) {
        //ends a dungeon and also restarts it?
        const dungeon = this.dungeonByID(dungeonID);
        this.dungeonCreatingID = dungeonID;
        dungeon.resetDungeon();
        PartyCreator.clearMembers();
        PartyCreator.startingTeam(dungeon.lastParty);
        this.createDungeon(true);
    },
    createDungeon(floorSkip) {
        const party = PartyCreator.lockParty();
        const dungeon = this.dungeonByID(this.dungeonCreatingID);
        dungeon.beatTotal = 0;
        if (dungeon.type !== "boss" && floorSkip) dungeon.floorCount = MonsterHall.floorSkip();
        if (devtools.dungeonStart !== undefined) dungeon.floorCount = devtools.dungeonStart;
        dungeon.status = DungeonStatus.ADVENTURING;
        this.dungeonView = this.dungeonCreatingID;
        dungeon.initializeParty(party);
        dungeon.nextFloor();
        initializeSideBarDungeon();
    },
    dungeonByID(dungeonID) {
        return this.dungeons.find(d => d.id === dungeonID);
    },
    getCurrentDungeon() {
        return this.dungeonByID(this.dungeonView);
    },
    dungeonSlotCount() {
        const dungeon = this.dungeonByID(this.dungeonCreatingID);
        if (dungeon.type == "boss") return 4;
        return this.partySize;
    },
    bossCount() {
        return this.bossesBeat.length;
    },
    bossCleared(id) {
        return this.bossesBeat.includes(id);
    },
    bossMaxCount() {
        return this.dungeons.filter(d => d.type === "boss").length;
    },
    abandonCurrentDungeon() {
        const dungeon = this.getCurrentDungeon();
        dungeon.completeState = "abandoned";
        dungeon.endDungeon();
    },
    bossByDungeon(dungeonid) {
        return FloorManager.mobsByDungeon(dungeonid)[0];
    },
    toggleProgress() {
        console.log(this.getCurrentDungeon().progressNextFloor)
        this.getCurrentDungeon().toggleProgress();
        console.log(this.getCurrentDungeon().progressNextFloor)
    }
};