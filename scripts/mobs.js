"use strict";

const MobManager = {
    monsterDB : [],
    activeMobs : [],
    idCount : 0,
    addMob(mob) {
        this.monsterDB.push(mob);
        this.unitType = "mob";
    },
    idToMob(id) {
        return this.monsterDB.find(mob => mob.id === id);
    },
    generateDungeonMob(mobID, difficulty,multiplier) {
        disableEventLayers();
        const mobTemplate = this.monsterDB.find(m=>m.id === mobID);
        const mob = new Mob(difficulty, mobTemplate, multiplier);
        return mob;
    },
    getUniqueID() {
        this.idCount += 1;
        return this.idCount;
    },
    generateDungeonFloor(floor,floorNum,bossMultiplier) {
        const mobFloor = [];
        floor.mobs.forEach(mob => {
            mobFloor.push(this.generateDungeonMob(mob,floorNum,bossMultiplier));
            MonsterHall.findMonster(mob);
        })
        return mobFloor;
    },
    allMobDropsByDungeon(dungeonID) {
        const mobids = FloorManager.mobsByDungeon(dungeonID);
        const mobs = mobids.map(m => this.idToMob(m));
        const materials = mobs.map(m=>m.drops);
        const matNames = flattenArray(materials.map(m => Object.keys(m)))
        return [...new Set(matNames)];
    }
}

class MobTemplate {
    constructor (props) {
        Object.assign(this, props);
        this.image = '<img src="images/enemies/' + this.id + '.gif">';
        this.head = '<img src="images/enemies/heads/' + this.id + '.png">';
    }
    getPow(floor) {
        return Math.floor(this.powBase + this.powLvl*floor);
    }
    getHP(floor) {
        return Math.floor(this.hpBase + this.hpLvl*floor);
    }
}

class FloorTemplate {
    constructor (props) {
        Object.assign(this, props);
    }
}

const FloorManager = {
    floors : [],
    addFloor(floor) {
        this.floors.push(floor);
    },
    floorByID(id) {
        return this.floors.find(f=>f.id === id);
    },
    getFloor(dungeon,floor) {
        const possibleFloors = this.floors.filter(f => f.dungeon === dungeon && f.minFloor <= floor && f.maxFloor >= floor);
        const rand = DungeonSeedManager.getFloorSeed(dungeon,floor);
        return possibleFloors[Math.floor(rand*possibleFloors.length)];
    },
    mobsByDungeon(dungeonid) {
        const floors = this.floors.filter(f=>f.dungeon === dungeonid);
        const mobs = flattenArray(floors.map(f => f.mobs));
        return [...new Set(mobs)]; 
    },
    mobsByDungeons(dungeonArray) {
        const floors = this.floors.filter(f=>dungeonArray.includes(f.dungeon));
        const mobs = flattenArray(floors.map(f => f.mobs));
        return [...new Set(mobs)]; 
    },
    dungeonNameByMob(mobID) {
        const floors = this.floors.filter(f=>f.mobs.includes(mobID));
        const uniqueDungeons = [...new Set(floors.map(f=>f.dungeon))];
        return DungeonManager.dungeonByID(uniqueDungeons[0]).name;
    },
    floorRangeByMob(mobID) {
        const floors = this.floors.filter(f=>f.mobs.includes(mobID));
        const maxFloor = floors.map(f=>f.maxFloor);
        const minFloor = floors.map(f=>f.minFloor);
        return {"min":Math.min(...minFloor),"max":Math.min(...maxFloor)};
    },
    rewards(floorID) {
        const floor = this.floorByID(floorID);
        return new idAmt(floor.material,floor.amt);
    }
}

class Mob extends Combatant {
    constructor (lvl, mobTemplate, difficulty=0) {
        super(mobTemplate);
        this.lvl = lvl;
        this.difficulty = difficulty;
        this.pow = Math.floor((mobTemplate.powBase + mobTemplate.powLvl*lvl)*Math.pow(miscLoadedValues.bossMultiplier,difficulty));
        this.hpmax = Math.floor((mobTemplate.hpBase + mobTemplate.hpLvl*lvl)*Math.pow(miscLoadedValues.bossMultiplier,difficulty));
        this.hp = this.hpmax;
        this.uniqueid = MobManager.getUniqueID();
        this.gotloot = false;
    }
    createSave() {
        const save = {};
        save.lvl = this.lvl;
        save.id = this.id;
        save.uniqueid = this.uniqueid;
        save.hp = this.hp;
        save.difficulty = this.difficulty;
        save.buffs = [];
        this.buffs.forEach(buff => {
            save.buffs.push(buff.createSave());
        });
        return save;
    }
    loadSave(save) {
        this.hp = save.hp;
        this.uniqueid = save.uniqueid;
        if (save.buffs !== undefined) {
            save.buffs.forEach(buff => {
                const newBuff = BuffManager.generateSaveBuff(buff.id,this,buff.power);
                newBuff.loadSave(buff);
                this.buffs.push(newBuff);
            });
        }
    }
}
