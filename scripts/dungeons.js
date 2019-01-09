"use strict";
const Stat = Object.freeze({HP:"HP",POW:"Power",AP:"AP",ACT:"Act"});

class turnOrder {
    constructor(unit) {
        this.unit = unit;
        this.act = 0;
    }
    setAct(initialAct) {
        if (initialAct) this.act = this.unit.initialAct();
        else this.act = this.unit.actmax();
    }
    getUnit() {
        return this.unit;
    }
    reductAct(amt) {
        this.act -= amt;
    }
    createSave() {
        const save = {};
        save.unitid = this.unit.uniqueid;
        save.act = this.act;
        return save;
    }
    loadSave(save) {

        this.act = save.act;    
    }
}

class Dungeon {
    constructor(id,party) {
        this.id = id;
        this.name = "Groovy Grove"
        this.maxMonster = party.size();
        this.party = party;
        this.mobs = [];
        this.dropList = [];
        this.dungeonTime = 0;
        this.mobDeadCount = 0;
        this.order = [];
    }
    createSave() {
        const save = {};
        save.id = this.id;
        save.floorNum = this.floorNum;
        save.party = this.party.createSave();
        save.mobs = [];
        this.mobs.forEach(m=>{
            save.mobs.push(m.createSave());
        });
        save.dropList = this.dropList;
        save.dungeonTime = this.dungeonTime;
        save.order = [];
        this.order.forEach(o=> {
            save.order.push(o.createSave());
        })
        return save;
    }
    loadSave(save) {
        this.floorNum = save.floorNum;
        this.mobs = [];
        save.mobs.forEach(mobSave => {
            const mobTemplate = MobManager.idToMob(mobSave.id);
            const mob = new Mob(save.floorNum, mobTemplate);
            mob.loadSave(mobSave);
            MobManager.addActiveMob(mob);
        });
        this.dropList = save.dropList;
        this.dungeonTime = save.dungeonTime;
        this.order = [];
        save.order.forEach(orderSave => {
            if (HeroManager.isHeroID(orderSave.unitid)) {
                const heroUnit = HeroManager.idToHero(orderSave.unitid);
                const to = new turnOrder(heroUnit);
                to.loadSave(orderSave);
                this.order.push(to);
            }
            else {
                const mobUnit = MobManager.uniqueidToMob(orderSave.unitid);
                const to = new turnOrder(mobUnit);
                to.loadSave(orderSave);
                this.order.push(to);
            }
        })
    }
    addToOrder(unit,act) {
        const unitOrder = new turnOrder(unit);
        unitOrder.setAct(act);
        if (this.order.length === 0) {
            this.order.push(unitOrder);
            return;
        }
        for (let i=0;i<this.order.length;i++) {
            if (this.order[i].act > unitOrder.act) {
                this.order.splice(i,0,unitOrder);
                return;
            }
        }
        this.order.push(unitOrder);
    }
    getNextOrder() {
        const next = this.order.shift();
        const reduceAmt = this.order[0].act;
        this.order.forEach(o => o.reductAct(reduceAmt));
        return next.getUnit();
    }
    addTime(t) {
        //if there's enough time, grab the next guy and do some combat
        this.dungeonTime += t;
        while (this.dungeonTime >= 1000) {
            const unit = this.getNextOrder();
            if (unit.unitType === "hero") CombatManager.heroAttack(unit,this.id);
            else CombatManager.mobAttack(unit,this.id);
            this.addToOrder(unit,false);
            this.checkDeadMobs();
            if (this.party.isDead()) {
                this.resetDungeon();
                return;
            }
            this.dungeonTime -= 1000;
            this.order.forEach(o => console.log(o.unit.name,o.act));
            console.log("-------------")
        }
    }
    checkDeadMobs() {
        let needrefresh = false;
        this.mobs.forEach(mob => {
            if (mob.dead()) {
                this.addDungeonDrop(mob.rollDrops());
                this.mobDeadCount += 1;
                MobManager.removeMob(mob);
                this.order = this.order.filter(to => to.unit.uniqueid !== mob.uniqueid);
                console.log(`${mob.name} died!`)
                needrefresh = true;
            }
        })
        this.mobs = this.mobs.filter(mob => !mob.dead());
        
        this.repopulate();
        if (needrefresh) initiateDungeonFloor();
    }
    initializeParty() {
        this.party.heroes.forEach(hero => {
            this.addToOrder(hero,true);
        })
    }
    repopulate() {
        while (this.mobs.length < this.maxMonster) {
            const mob = MobManager.generateDungeonMob(this.id,this.mobDeadCount);
            this.mobs.push(mob);
            this.addToOrder(mob,true);
            console.log(`${mob.name} added!`)
        }
    }
    resetDungeon() {
        this.party.heroes.forEach(h=>{
            h.inDungeon = false;
            h.ap = 0;
        });
        EventManager.addEventDungeon(this.dropList,this.dungeonTime,this.floorNum);
        DungeonManager.removeDungeon(this.id);
        if (DungeonManager.dungeonView !== null) {
            openTab("dungeonsTab");
        }
        initializeSideBarDungeon();
        BattleLog.clear();
        return;
    }
    addDungeonDrop(drops) {
        drops.forEach(drop => {
            const found = this.dropList.find(d => d.id === drop)
            if (found === undefined) this.dropList.push({"id":drop,"amt":1});
            else found.amt += 1;
        })
    }
}

const DungeonManager = {
    dungeons : [],
    dungeonCreatingID : null,
    dungeonView : null,
    createSave() {
        const save = {};
        save.dungeons = [];
        this.dungeons.forEach(d => {
            save.dungeons.push(d.createSave());
        });
        return save;
    },
    loadSave(save) {
        save.dungeons.forEach(d => {
            const party = new Party(d.party.heroID);
            const dungeon = new Dungeon(d.id,party);
            dungeon.loadSave(d);
            this.dungeons.push(dungeon);
        });
    },
    addTime(t) {
        this.dungeons.forEach(dungeon => {
            dungeon.addTime(t);
        });
        if (this.dungeonView !== null) refreshDungeonFloorBars();
    },
    removeDungeon(id) {
        this.dungeons = this.dungeons.filter(d => d.id !== id);
    },
    dungeonStatus(dungeonID) {
        return this.dungeons.filter(d=>d.id === dungeonID).length > 0;
    },
    createDungeon() {
        const party = PartyCreator.lockParty();
        const dungeon = new Dungeon(this.dungeonCreatingID,party);
        dungeon.initializeParty();
        dungeon.repopulate();
        this.dungeons.push(dungeon);
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
    [Stat.ACT] : '<img src="images/DungeonIcons/act.png" alt="Act">',
    [Stat.AP] : '<img src="images/DungeonIcons/ap.png" alt="AP">',
}