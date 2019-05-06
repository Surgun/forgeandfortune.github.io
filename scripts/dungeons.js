"use strict";
const Stat = Object.freeze({HP:"HP",POW:"Power",AP:"AP"});
const DungeonStatus = Object.freeze({EMPTY:0,ADVENTURING:1});

class TurnOrder {
    constructor(heroes,mobs) {
        this.heroes = heroes;
        this.mobs = mobs;
        this.order =  interlace(heroes,mobs);
        this.position = 0;
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
}


class Dungeon {
    constructor(props) {
        Object.assign(this, props);
        this.maxMonster = 4;
        this.party = null;
        this.mobs = [];
        this.dropList = [];
        this.dungeonTime = 0;
        this.floorCount = 0;
        this.order = null;
        this.status = DungeonStatus.EMPTY;
    }
    createSave() {
        const save = {};
        save.id = this.id;
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
        return save;
    }
    loadSave(save) {
        if (save.party !== null) this.party = new Party(save.party.heroID);
        else save.party = null;
        this.mobs = [];
        save.mobs.forEach(mobSave => {
            const mobTemplate = MobManager.idToMob(mobSave.id);
            const mob = new Mob(mobSave.lvl, mobTemplate);
            mob.loadSave(mobSave);
            this.mobs.push(mob);
            MobManager.addActiveMob(mob);
        });
        if (save.order !== null) {
            this.order = new TurnOrder(this.party.heroes,this.mobs);
            this.order.loadSave(save.order);
        }   
        this.dropList = save.dropList;
        this.dungeonTime = save.dungeonTime;
        this.floorCount = save.floorCount;
        this.status = save.status;
    }
    addTime(t) {
        //if there's enough time, grab the next guy and do some combat
        if (this.status !== DungeonStatus.ADVENTURING) return;
        this.dungeonTime += t;
        if (this.floorComplete() && this.dungeonTime >= DungeonManager.speed) {
            this.nextFloor();
            this.dungeonTime -= DungeonManager.speed;
        }
        else if (!this.floorComplete()) refreshBeatBar(this.dungeonTime);
        while (this.dungeonTime >= DungeonManager.speed) {
            const unit = this.order.nextTurn();
            if (unit.unitType === "hero") CombatManager.launchAttack(unit, this.party.heroes, this.mobs, this.id);
            else CombatManager.launchAttack(unit, this.mobs, this.party.heroes, this.id);
            this.order.nextPosition();
            this.checkDeadMobs();
            if (this.party.isDead()) {
                this.resetDungeon();
                return;
            }
            this.dungeonTime -= DungeonManager.speed;
            if (this.id === DungeonManager.dungeonView) refreshTurnOrder();
        }
    }
    floorComplete() {
        return this.mobs.every(m=>m.looted());
    }
    checkDeadMobs() {
        let needrefresh = false;
        this.mobs.forEach(mob => {
            if (mob.dead() && !mob.looted()) {
                this.addDungeonDrop(mob.rollDrops());
                needrefresh = true;
            }
        })
        /*if (this.mobs.every(m=>m.dead())) {
            this.nextFloor();
            needrefresh = true;
        }*/
        if (needrefresh) initiateDungeonFloor();
    }
    initializeParty(party) {
        this.party = party;
    }
    resetDungeon() {
        this.party.heroes.forEach(h=>{
            h.inDungeon = false;
            h.ap = 0;
            h.hp = h.maxHP()
        });
        if (this.type === "boss") {
            EventManager.addEventBoss(this.id,this.dungeonTime);
            DungeonManager.bossesBeat.push(this.id);
        }
        else EventManager.addEventDungeon(this.dropList,this.dungeonTime,this.floorCount);
        DungeonManager.removeDungeon(this.id);
        console.log(DungeonManager.dungeonView,this.id)
        if (DungeonManager.dungeonView !== this.id) {
            BattleLog.clear();
            openTab("dungeonsTab");
        }
        initializeSideBarDungeon();
        refreshDungeonSelect();
        this.status = DungeonStatus.EMPTY;
        this.order = null;
        this.dungeonTime = 0;
        this.floorCount = 0;
        return;
    }
    addDungeonDrop(drops) {
        drops.forEach(drop => {
            const found = this.dropList.find(d => d.id === drop)
            if (found === undefined) this.dropList.push({"id":drop,"amt":1});
            else found.amt += 1;
        })
    }
    nextFloor() {
        if (this.type === "boss" && this.floorCount === 1) {
            this.resetDungeon();
            return;
        }
        this.floorCount += 1;
        this.mobs = MobManager.generateDungeonFloor(this.id,this.floorCount);
        this.order = new TurnOrder(this.party.heroes,this.mobs);
        if (DungeonManager.dungeonView === this.id) initiateDungeonFloor();
        $("#floorStatus"+this.id).html(`Floor ${this.floorCount}`);
        $("#DungeonSideBarStatus").html(`${this.name} - Floor ${this.floorCount}`);
    }
}

const DungeonManager = {
    dungeons : [],
    dungeonCreatingID : null,
    dungeonView : null,
    speed : 1250,
    dungeonPaid : [],
    bossesBeat : [],
    bossDungeonCanJoin(id) {
        if (this.dungeonByID(id).type === "regular") return true;
        return this.dungeonPaid.includes(id);
    },
    bossDungeonCanSee(id) {
        const dungeon = this.dungeonByID(id);
        if (dungeon.type === "regular" || this.dungeonPaid.includes(id) || dungeon.preReq === null) return true;
        return this.dungeonPaid.includes(dungeon.preReq);
    },
    payDungeonUnlock(id) {
        this.dungeonPaid.push(id);
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
        refreshSpeedButton(this.speed);
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
    },
    createDungeon() {
        const party = PartyCreator.lockParty();
        const dungeon = this.dungeonByID(this.dungeonCreatingID);
        dungeon.status = DungeonStatus.ADVENTURING;
        this.dungeonView = this.dungeonCreatingID;
        dungeon.initializeParty(party);
        dungeon.nextFloor();
    },
    dungeonByID(dungeonID) {
        return this.dungeons.find(d => d.id === dungeonID);
    },
    getCurrentDungeon() {
        return this.dungeonByID(this.dungeonView);
    }
};

const dungeonIcons = {
    //[FloorType.FIGHT] : '<img src="images/DungeonIcons/combat_floor.png" alt="Fight">',
    //[FloorType.TREASURE] : '<img src="images/DungeonIcons/treasure_floor.png" alt="Treasure">',
    [Stat.HP] : '<img src="images/DungeonIcons/hp.png" alt="HP">',
    [Stat.POW] : '<img src="images/DungeonIcons/pow.png" alt="POW">',
    [Stat.AP] : '<img src="images/DungeonIcons/ap.png" alt="AP">',
}