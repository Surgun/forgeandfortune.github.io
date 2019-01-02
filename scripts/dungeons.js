"use strict";
const Stat = Object.freeze({HP:"HP",POW:"Power",AP:"AP",ACT:"Act"});

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
    }
    createSave() {
        const save = {};
        save.id = this.id;
        save.floorNum = this.floorNum;
        save.party = this.party.createSave();
        save.mobs = [];
        this.mobs.forEach(m=>{
            save.mobs.push(m.createSave());
        })
        save.dropList = this.dropList;
        save.dungeonTime = this.dungeonTime;
        return save;
    }
    loadSave(save) {
        this.floorNum = save.floorNum;
        this.mobs = [];
        save.mobs.forEach(mobSave => {
            const mobTemplate = MobManager.idToMob(mobSave.id);
            const mob = new Mob(save.floorNum, mobTemplate);
            mob.loadSave(mobSave);
        });
        this.dropList = save.dropList;
        this.dungeonTime = save.dungeonTime;
    }
    addTime(t) {
        //add time to all combatants, if they're ready for combat they'll bounce back here.
        this.dungeonTime += t;
        while (this.dungeonTime >= 500) {
            this.mobs.forEach(mob =>  {
                mob.addTime();
                if (mob.ready()) CombatManager.mobAttack(mob,this.id);
            });
            if (this.party.isDead()) {
                this.resetDungeon();
                return;
            }
            this.party.heroes.forEach(hero => {
                hero.addTime();
                if (hero.ready()) CombatManager.heroAttack(hero,this.id);
                this.checkDeadMobs();
            });
            this.dungeonTime -= 500;
        }
    }
    checkDeadMobs() {
        let needrefresh = false;
        this.mobs.forEach(mob => {
            if (mob.dead()) {
                this.addDungeonDrop(mob.rollDrops());
                this.mobDeadCount += 1;
                needrefresh = true;
            }
        })
        this.mobs = this.mobs.filter(mob => !mob.dead());
        this.repopulate();
        if (needrefresh) initiateDungeonFloor();
    }
    repopulate() {
        while (this.mobs.length < this.maxMonster) {
            this.mobs.push(MobManager.generateDungeonMob(this.id,this.mobDeadCount));
            console.log(this.mobs.map(m=>m.name));
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