"use strict";

const HeroState = Object.freeze({idle:"Idle",inDungeon:"In Dungeon",inQuest:"In Quest"});

class Hero extends Combatant {
    constructor (props) {
        super(props);
        this.uniqueid = this.id;
        this.hp = this.initialHP;
        this.pow = this.initialPow;
        this.critdmg = 1.5;
        this.unitType = "hero";
        this.gearSlots = this.populateGearSlots();
        this.image = '<img src="/assets/images/heroes/'+this.id+'.gif">';
        this.head = '<img src="/assets/images/heroes/heads/'+this.id+'.png">';
        this.portrait = '<img src="/assets/images/heroes/portraits/'+this.id+'.png">';
        this.owned = false;
        this.state = HeroState.idle;
        this.protection = 0;
        this.playbook = PlaybookManager.generatePlayBook(this.startingPlaybook);
        this.passiveSkill = null;
    }
    createSave() {
        const save = {};
        save.id = this.id;
        save.hp = this.hp;
        save.state = this.state;
        save.gearSlots = [];
        this.gearSlots.forEach(gearSlot => {
            save.gearSlots.push(gearSlot.createSave());
        });
        save.owned = this.owned;
        save.buffs = [];
        this.buffs.forEach(buff => {
            save.buffs.push(buff.createSave());
        });
        save.playbook = this.playbook.id;
        save.state = this.state;
        return save;
    }
    loadSave(save) {
        this.hp = save.hp;
        this.state = save.state;
        save.gearSlots.forEach((gearSlot,i) => {
            this.gearSlots[i].loadSave(gearSlot);
        });
        if (save.playbook !== undefined) {
            this.playbook = PlaybookManager.generatePlayBook(save.playbook);
        }
        this.owned = save.owned;
        if (save.buffs !== undefined) {
            save.buffs.forEach(buff => {
                const newBuff = BuffManager.generateSaveBuff(buff.id,this,buff.power,buff.power2);
                newBuff.loadSave(buff);
                this.buffs.push(newBuff);
            });
        }
        if (save.state !== undefined) this.state = save.state;
    }
    populateGearSlots() {
        const gearslots = [];
        for (let i=1;i<8;i++) {
            gearslots.push(new gearSlot(this[`slot${i}Type`]));
        }
        return gearslots;
    }
    getPow() {
        const pow = Math.floor(this.initialPow + this.gearSlots.map(g=>g.pow()).reduce((a,b) => a+b) + this.getBuffPower());
        return Math.floor(pow * (1+this.getBuffPowerPercent()));
    }
    maxHP() {
        const hp = Math.floor(this.initialHP + this.gearSlots.map(g=>g.hp()).reduce((a,b) => a+b) + this.getBuffMaxHP());
        return Math.floor(hp * (1+this.getBuffMaxHPPercent()));
    }
    getAdjPow() {
        return Math.floor(this.getPow());
    }
    getEquipSlots(nonblank) {
        if (nonblank) return this.gearSlots.map(g=>g.gear).filter(s => s !== null);
        else return this.gearSlots.map(g=>g.gear);
    }
    equip(container) {
        const gearSlot = this.getSlot(container.type)
        if (gearSlot === undefined) return;
        if (gearSlot.gear !== null) {
            Inventory.addToInventory(gearSlot.gear,false);
            gearSlot.removeGear();
        }
        gearSlot.setGear(container);
    }
    remove(type) {
        const gearSlot = this.getSlot(type);
        if (gearSlot !== undefined) gearSlot.removeGear();
    }
    slotEmpty(type) {
        const gearSlot = this.getSlot(type);
        if (gearSlot === undefined) return true;
        return gearSlot.empty();
    }
    getSlot(type) {
        return this.gearSlots.find(g=>g.type === type);
    }
    unequip(type) {
        if (Inventory.full()) {
            Notifications.inventoryFull();
            return;
        }
        const item = this.getSlot(type);
        if (item === undefined) return;
        Inventory.addToInventory(item.gear);
        this.remove(type);
    }
    hasEquip(type) {
        const gearSlot = this.getSlot(type);
        if (gearSlot === undefined) return false;
        return !gearSlot.empty();
    }
    equipUpgradeAvailable(type) {
        const currentPow = this.getPow(type);
        const currentHP = this.maxHP(type);
        const invMaxPow = Inventory.getMaxPowByType(type);
        const invMaxHP = Inventory.getMaxHPByType(type);
        return invMaxPow > currentPow || invMaxHP > currentHP;
    }
    canEquipType(type) {
        return this.getSlot(type) !== undefined;
    }
    trinket() {
        return this.gearSlots[6];
    }
    totalUpgrades() {
        const upgrades = this.gearSlots.map(g=>g.lvl);
        return upgrades.reduce((a,b) => a + b);
    }
    upgradeSlot(type) {
        this.getSlot(type).addLevel();
    }
    changePlaybook(playbookID) {
        this.playbook = PlaybookManager.generatePlayBook(playbookID);
    }
    swapPlaybook(pbid) {
        this.playbook = PlaybookManager.generatePlayBook(pbid);
    }
    canLearnPlaybook(pbid) {
        return this.playbooks.includes(pbid);
    }
}

class gearSlot {
    constructor (type) {
        this.gear = null;
        this.type = type;
        this.lvl = 0;
    }
    createSave() {
        const save = {};
        if (this.gear !== null) save.gear = this.gear.createSave();
        else save.gear = null;
        save.lvl = this.lvl;
        return save;
    }
    loadSave(save) {
        this.lvl = save.lvl;
        if (save.gear !== null) {
            const newGear = new itemContainer(save.gear.id,save.gear.rarity);
            newGear.loadSave(save.gear);
            this.gear = newGear;
        }
    }
    setGear(container) {
        this.gear = container;
    }
    removeGear() {
        this.gear = null;
    }
    pow() {
        if (this.gear === null) return 0;
        return Math.floor(this.gear.pow() * (1+this.lvl*0.1));
    }
    hp() {
        if (this.gear === null) return 0;
        return Math.floor(this.gear.hp() * (1+this.lvl*0.1));
    }
    empty() {
        return this.gear === null;
    }
    addLevel() {
        this.lvl += 1;
    }
}

const HeroManager = {
    heroes : [],
    heroView : null,
    tabSelected : "Details",
    addHero(hero) {
        this.heroes.push(hero);
    },
    createSave() {
        const save = [];
        this.heroes.forEach(h=> {
            save.push(h.createSave());
        });
        return save;
    },
    loadSave(save) {
        save.forEach(h => {
            const hero = this.idToHero(h.id);
            hero.loadSave(h);
        })
    },
    heroOwned(ID) {
        return this.idToHero(ID).owned;
    },
    idToHero(ID) {
        return this.heroes.find(hero => hero.id === ID);
    },
    isHeroID(ID) {
        return this.heroes.some(hero => hero.id === ID);
    },
    equipItem(containerID,heroID) {
        const item = Inventory.containerToItem(containerID);
        const hero = this.idToHero(heroID);
        Inventory.removeContainerFromInventory(containerID);
        hero.equip(item);
    },
    ownedHeroes() {
        return this.heroes.filter(hero => hero.owned);
    },
    gainHero(heroID) {
        this.idToHero(heroID).owned = true;
    },
    heroesThatCanEquip(item) {
        return this.heroes.filter(h=>h.owned && h.canEquipType(item.type));
    },
    slotsByItem(item) {
        //return a list of heroes and the appropriate slot
        const type = item.type;
        const results = [];
        this.heroes.filter(h=>h.owned && h.canEquipType(type)).forEach(hero=> {
            const hres = {}
            hres.id = hero.id;
            hres.canEquip = [];
            hero.gearSlots.forEach(slot => {
                hres.canEquip.push(slot.type === type);
            });
            results.push(hres);
        });
        return results;
    },
    getContainerID(containerID) {
        return this.heroes.map(h=>h.getEquipSlots(true)).flat().find(i=>i.containerID === containerID);
    },
    hasContainer(containerID) {
        return this.heroes.map(h=>h.getEquipSlots(true)).flat().map(i=>i.containerID).includes(containerID);
    },
    upgradeSlot(heroID,gearType) {
        if (this.totalUpgrades() >= DungeonManager.availableUpgrades()) return Notifications.cantAffordSlotUpgrade();
        const hero = this.idToHero(heroID);
        hero.upgradeSlot(gearType);
    },
    totalUpgrades() {
        const upgrades = this.heroes.map(h => h.totalUpgrades());
        return upgrades.reduce((a,b) => a+b);
    },
    swapPlaybook(hid,pbid) {
        const hero = this.idToHero(hid);
        hero.swapPlaybook(pbid);
    },
    unlockPlaybook(playbookID) {
        const hero = this.heroes.find(h=>h.canLearnPlaybook(playbookID));
        hero.unlockPlaybook(playbookID);
    }
}