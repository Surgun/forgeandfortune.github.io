"use strict";

class Hero extends Combatant {
    constructor (props) {
        super(props);
        this.uniqueid = this.id;
        this.hp = this.initialHP;
        this.pow = this.initialPow;
        this.critdmg = 1.5;
        this.unitType = "hero";
        this.slot1 = null;
        this.slot2 = null;
        this.slot3 = null;
        this.slot4 = null;
        this.slot5 = null;
        this.slot6 = null;
        this.slot7 = null;
        this.image = '<img src="images/heroes/'+this.id+'.gif">';
        this.head = '<img src="images/heroes/heads/'+this.id+'.png">';
        this.owned = false;
        this.inDungeon = false;
        this.protection = 0;
        this.playbook = PlaybookManager.generatePlayBook(this.playbook);
    }
    createSave() {
        const save = {};
        save.id = this.id;
        save.hp = this.hp;
        save.inDungeon = this.inDungeon;
        if (this.slot1 === null) save.slot1 = null;
        else save.slot1 = this.slot1.createSave();
        if (this.slot2 === null) save.slot2 = null;
        else save.slot2 = this.slot2.createSave();
        if (this.slot3 === null) save.slot3 = null;
        else save.slot3 = this.slot3.createSave();
        if (this.slot4 === null) save.slot4 = null;
        else save.slot4 = this.slot4.createSave();
        if (this.slot5 === null) save.slot5 = null;
        else save.slot5 = this.slot5.createSave();
        if (this.slot6 === null) save.slot6 = null;
        else save.slot6 = this.slot6.createSave();
        if (this.slot7 === null) save.slot7 = null;
        else save.slot7 = this.slot7.createSave();
        save.owned = this.owned;
        save.buffs = [];
        this.buffs.forEach(buff => {
            save.buffs.push(buff.createSave());
        });
        return save;
    }
    loadSave(save) {
        this.hp = save.hp;
        this.inDungeon = save.inDungeon;
        if (save.slot1 !== null) {
            this.slot1 = new itemContainer(save.slot1.id,save.slot1.rarity);
            this.slot1.loadSave(save.slot1);
        }
        if (save.slot2 !== null) {
            this.slot2 = new itemContainer(save.slot2.id,save.slot2.rarity);
            this.slot2.loadSave(save.slot2);
        }
        if (save.slot3 !== null) {
            this.slot3 = new itemContainer(save.slot3.id,save.slot3.rarity);
            this.slot3.loadSave(save.slot3);
        }
        if (save.slot4 !== null) {
            this.slot4 = new itemContainer(save.slot4.id,save.slot4.rarity);
            this.slot4.loadSave(save.slot4);
        }
        if (save.slot5 !== null) {
            this.slot5 = new itemContainer(save.slot5.id,save.slot5.rarity);
            this.slot5.loadSave(save.slot5);
        }
        if (save.slot6 !== null) {
            this.slot6 = new itemContainer(save.slot6.id,save.slot6.rarity);
            this.slot6.loadSave(save.slot6);
        }
        if (save.slot7 !== null && save.slot7 !== undefined) {
            this.slot7 = new itemContainer(save.slot7.id,save.slot7.rarity);
            this.slot7.loadSave(save.slot7);
        }
        if (save.buffs !== undefined) {
            save.buffs.forEach(buff => {
                const newBuff = BuffManager.generateSaveBuff(buff.id,this,buff.power);
                newBuff.loadSave(buff);
                this.buffs.push(newBuff);
            });
        }
        this.owned = save.owned;
    }
    getPow() {
        const slots = this.getEquipSlots(true).map(s=>s.pow());
        const powerFromGear = slots.length === 0 ? 0 : slots.reduce((a,b) => a+b);
        return this.initialPow + powerFromGear + this.getBuffPower();
    }
    maxHP() {
        const slots = this.getEquipSlots(true).map(s=>s.hp());
        if (slots.length === 0) return this.initialHP;
        return this.initialHP + slots.reduce((a,b) => a + b);
    }
    getSpow() {
        const slots = this.getEquipSlots(true).map(s=>s.spow());
        if (slots.length === 0) return this.initialSpow;
        return this.initialSpow + slots.reduce((a,b) => a+b);
    }
    getAdjPow(spow) {
        if (spow) return Math.floor(this.getPow() + this.getSpow());
        return Math.floor(this.getPow());
    }
    getPowSlot(slot) {
        const slots = this.getEquipSlots();
        if (slots[slot] === null) return 0;
        return slots[slot].pow();
    }
    getHPSlot(slot) {
        const slots = this.getEquipSlots();
        if (slots[slot] === null) return 0;
        return slots[slot].hp();
    }
    getEquipSlots(nonblank) {
        //return an object with 
        const slots = [this.slot1,this.slot2,this.slot3,this.slot4,this.slot5,this.slot6,this.slot7];
        if (!nonblank) return slots;
        return slots.filter(s=>s!==null);
    }
    equip(item,slot) {
        if (slot === 0) this.slot1 = item;
        if (slot === 1) this.slot2 = item;
        if (slot === 2) this.slot3 = item;
        if (slot === 3) this.slot4 = item;
        if (slot === 4) this.slot5 = item;
        if (slot === 5) this.slot6 = item;
        if (slot === 6) this.slot7 = item;
    }
    removeSlot(slot) {
        if (slot === 0) this.slot1 = null;
        if (slot === 1) this.slot2 = null;
        if (slot === 2) this.slot3 = null;
        if (slot === 3) this.slot4 = null;
        if (slot === 4) this.slot5 = null;
        if (slot === 5) this.slot6 = null;
        if (slot === 6) this.slot7 = null;
    }
    slotTypesByNum(num) {
        return this.getSlotTypes()[num];
    }
    getSlotTypes() {
        return [this.slot1Type,this.slot2Type,this.slot3Type,this.slot4Type,this.slot5Type,this.slot6Type,this.slot7Type];
    }
    slotTypeIcons(num) {
        let s = ""
        this.slotTypesByNum(num).forEach(slot => {
            s += slot.toUpperCase() + "<br>";
        })
        return s;
    }
    slotEmpty(slot) {
        return this.getEquipSlots()[slot] === null;
    }
    getSlot(slot) {
        return this.getEquipSlots()[slot];
    }
    unequip(slot) {
        if (Inventory.full()) {
            Notifications.inventoryFull();
            return;
        }
        const item = this.getSlot(slot);
        if (item === null) return;
        this.removeSlot(slot);
        Inventory.addToInventory(item);
    }
    currenEquipByType(type) {
        if (this.slot1Type.includes(type)) return this.slot1;
        if (this.slot2Type.includes(type)) return this.slot2;
        if (this.slot3Type.includes(type)) return this.slot3;
        if (this.slot4Type.includes(type)) return this.slot4;
        if (this.slot5Type.includes(type)) return this.slot5;
        if (this.slot6Type.includes(type)) return this.slot6;
        if (this.slot7Type.includes(type)) return this.slot7;
        return null;
    }
    hasEquip(type) {
        if (this.slot1Type.includes(type)) return this.slot1 !== null;
        if (this.slot2Type.includes(type)) return this.slot2 !== null;
        if (this.slot3Type.includes(type)) return this.slot3 !== null;
        if (this.slot4Type.includes(type)) return this.slot4 !== null;
        if (this.slot5Type.includes(type)) return this.slot5 !== null;
        if (this.slot6Type.includes(type)) return this.slot6 !== null;
        if (this.slot7Type.includes(type)) return this.slot7 !== null;
    }
    typeToSlot(type) {
        if (this.slot1Type.includes(type)) return 0;
        if (this.slot2Type.includes(type)) return 1;
        if (this.slot3Type.includes(type)) return 2;
        if (this.slot4Type.includes(type)) return 3;
        if (this.slot5Type.includes(type)) return 4;
        if (this.slot6Type.includes(type)) return 5;
        if (this.slot7Type.includes(type)) return 6;
    }
    equipUpgradeAvailable(slot) {
        const types = this.slotTypesByNum(slot)
        const currentPow = this.getPowSlot(slot);
        const currentHP = this.getHPSlot(slot);
        const invMaxPow = Inventory.getMaxPowByTypes(types);
        const invMaxHP = Inventory.getMaxHPByTypes(types);
        return invMaxPow > currentPow || invMaxHP > currentHP;
    }
    canEquipType(type) {
        return this.slot1Type.includes(type) || this.slot2Type.includes(type) || this.slot3Type.includes(type) || this.slot4Type.includes(type) || this.slot5Type.includes(type) || this.slot6Type.includes(type) || this.slot7Type.includes(type);
    }
}

const HeroManager = {
    heroes : [],
    heroView : null,
    tabSelected : "heroTab1",
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
    equipItem(containerID,heroID,slot) {
        const item = Inventory.containerToItem(containerID);
        const hero = this.idToHero(heroID);
        Inventory.removeContainerFromInventory(containerID);
        hero.unequip(slot);
        hero.equip(item,slot);
    },
    getSlotTypes(slot,heroID) {
        const hero = this.idToHero(heroID);
        return hero.slotTypesByNum(slot);
    },
    slotEmpty(slot,heroID) {
        const hero = this.idToHero(heroID);
        return hero.slotEmpty(slot);
    },
    unequip(slot,heroID) {
        const hero = this.idToHero(heroID);
        hero.unequip(slot);
    },
    ownedHeroes() {
        return this.heroes.filter(hero => hero.owned);
    },
    gainHero(heroID) {
        this.idToHero(heroID).owned = true;
        initializeHeroList();
    },
    heroPower(hero) {
        return `<div class="pow_img">${miscIcons.pow}</div><div class="pow_interger">${hero.getPow()}</div>`
    },
    slotsByItem(item) {
        //return a list of heroes and the appropriate slot
        const type = item.type;
        const results = [];
        this.heroes.filter(h=>h.owned && h.canEquipType(type)).forEach(hero=> {
            const hres = {}
            hres.id = hero.id;
            hres.canEquip = [];
            hero.getSlotTypes().forEach(slot => {
                hres.canEquip.push(slot.includes(type));
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
    }
}