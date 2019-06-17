"use strict";

const MobManager = {
    monsterDB : [],
    activeMobs : [],
    addMob(mob) {
        this.monsterDB.push(mob);
        this.unitType = "mob";
    },
    idToMob(id) {
        return this.monsterDB.find(mob => mob.id === id);
    },
    generateDungeonMob(mobID, difficulty) {
        disableEventLayers();
        const mobTemplate = this.monsterDB.find(m=>m.id === mobID);
        const mob = new Mob(difficulty, mobTemplate);
        this.addActiveMob(mob);
        return mob;
    },
    addActiveMob(mob) {
        console.log(mob.id);
        this.activeMobs.push(mob);
    },
    removeMobs(mobs) {
        const ids = mobs.map(m=>m.uniqueid);
        this.activeMobs = this.activeMobs.filter(m => !ids.includes(m.uniqueid));
    },
    uniqueidToMob(id) {
        return this.activeMobs.find(mob => mob.uniqueid === id);
    },
    getUniqueID() {
        let i = 0;
        const mobIds = this.activeMobs.map(m=>m.uniqueid);
        while (mobIds.includes(i)) {
            i += 1;
        }
        return i;
    },
    generateDungeonFloor(dungeonid,floorNum) {
        const mobFloor = [];
        const floor = FloorManager.getFloor(dungeonid,floorNum);
        floor.mobs.forEach(mob => {
            mobFloor.push(this.generateDungeonMob(mob,floorNum));
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
    getFloor(dungeon,floor) {
        const possibleFloors = this.floors.filter(f => f.dungeon === dungeon && f.minFloor <= floor && f.maxFloor >= floor);
        const rand = DungeonSeedManager.getFloorSeed(dungeon,floor);
        return possibleFloors[Math.floor(rand*possibleFloors.length)];
    },
    isSanctuary(dungeon,floor) {
        //so hackish
        console.log(dungeon,floor);
        const possibleFloors = this.floors.filter(f => f.dungeon === dungeon && f.minFloor <= floor && f.maxFloor >= floor);
        if (possibleFloors.every(f => f.type === "sanctuary")) return true;
        return false;
    },
    mobsByDungeon(dungeonid) {
        const floors = this.floors.filter(f=>f.dungeon === dungeonid);
        const mobs = flattenArray(floors.map(f => f.mobs));
        return [...new Set(mobs)]; 
    }
}

class Mob {
    constructor (lvl,mobTemplate) {
        Object.assign(this, mobTemplate);
        this.lvl = lvl;
        this.pow = Math.floor(mobTemplate.powBase + mobTemplate.powLvl*lvl);
        this.hpmax = Math.floor(mobTemplate.hpBase + mobTemplate.hpLvl*lvl);
        this.hp = this.hpmax;
        this.ap = 0;
        this.apmax = 120;
        this.uniqueid = MobManager.getUniqueID();
        this.gotloot = false;
    }
    createSave() {
        const save = {};
        save.lvl = this.lvl;
        save.id = this.id;
        save.uniqueid = this.uniqueid;
        save.hp = this.hp;
        save.ap = this.ap
        return save;
    }
    loadSave(save) {
        this.hp = save.hp;
        this.ap = save.ap;
        this.uniqueid = save.uniqueid;
    }
    addTime() {
    }
    getPow() {
        return this.pow;
    }
    getAdjPow() {
        return this.getPow();
    }
    getArmor() {
        if (this.ignoredArmor) return 0;
        if (this.armorBuff) return this.armor + Math.round(this.getAdjPow() * 0.2);
        return this.armor;
    }
    pic() {
        return this.image;
    }
    dead() {
        return this.hp === 0;
    }
    alive() {
        return this.hp > 0;
    }
    maxHP() {
        return this.hpmax;
    }
    missingHP() {
        return this.maxHP()-this.hp;
    }
    addAP() {
        this.ap += this.apAdd;
    }
    deadCheck() {
        if (this.hp > 0 || this.status === MobState.DEAD) return;
        this.status = MobState.DEAD;
        this.rollDrops();
    }
    rollDrops() {
        const mobDrops = [];
        if (this.drops === null || this.gotloot) {
            this.gotloot = true;
            return mobDrops;
        }
        for (const [material, success] of Object.entries(this.drops)) {
            const roll = Math.floor(Math.random() * 100);
            if (success > roll) mobDrops.push(material);
        }
        this.gotloot = true;
        return mobDrops;
    }
    looted() {
        return this.gotloot;
    }
    healCost() {
        return 0;
    }
}
