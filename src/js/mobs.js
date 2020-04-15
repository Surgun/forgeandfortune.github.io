"use strict";

const MobManager = {
    monsterDB : [],
    idCount : 0,
    addMob(mob) {
        this.monsterDB.push(mob);
    },
    idToMob(id) {
        return this.monsterDB.find(mob => mob.id === id);
    },
    getUniqueID() {
        this.idCount += 1;
        return this.idCount;
    },
    generateMob(mobID,dungeon) {
        disableEventLayers();
        const mobTemplate = this.monsterDB.find(m=>m.id === mobID);
        if (dungeon.type === "boss") {
            return new Mob(mobTemplate);
        }
        const atk = (dungeon.pow + dungeon.floor * dungeon.powGain);
        const hp = (dungeon.hp + dungeon.floor * dungeon.hpGain);
        const mob = new Mob(mobTemplate, atk, hp);
        return mob;
    },
}

class MobTemplate {
    constructor (props) {
        Object.assign(this, props);
        this.image = '<img src="/assets/images/enemies/' + this.id + '.gif">';
        this.head = '<img src="/assets/images/enemies/heads/' + this.id + '.png">';
    }
    getSkillIDs() {
        return [this.skill1,this.skill2,this.skill3,this.skill4];
    }
    getSkillIcons() {
        return [SkillManager.idToSkill(this.skill1).icon,SkillManager.idToSkill(this.skill2).icon,SkillManager.idToSkill(this.skill3).icon,SkillManager.idToSkill(this.skill4).icon];
    }
}

class Mob extends Combatant {
    constructor (mobTemplate, atk, hp) {
        super(mobTemplate);
        if (this.event === "boss") {
            this.pow = this.powMod;
            this.hpmax = this.hpMod;
            this.hp = this.hpMod;
        }
        else {
            this.pow = Math.floor(atk*this.powMod);
            this.hpmax = Math.floor(hp*this.hpMod);
            this.hp = this.hpmax;
        }
        this.uniqueid = MobManager.getUniqueID();
        this.playbook = PlaybookManager.generatePlayBookFromSkills(this.skill1,this.skill2,this.skill3,this.skill4);
        this.passive = SkillManager.idToSkill(this.passiveSkill);
    }
    createSave() {
        const save = {};
        save.id = this.id;
        save.uniqueid = this.uniqueid;
        save.atk = this.atk;
        save.hp = this.hp;
        save.hpmax = this.hpmax;
        save.buffs = [];
        this.buffs.forEach(buff => {
            save.buffs.push(buff.createSave());
        });
        save.state = this.state; 
        return save;
    }
    loadSave(save) {
        this.uniqueid = save.uniqueid;
        this.atk = save.atk;
        this.hp = save.hp;
        this.hpmax = save.hpmax;
        if (save.buffs !== undefined) {
            save.buffs.forEach(buff => {
                const newBuff = BuffManager.generateSaveBuff(buff.id,this,buff.power);
                newBuff.loadSave(buff);
                this.buffs.push(newBuff);
            });
        }
        this.state = save.state;
        adjustState(this);
    }
}

function adjustState(mob) {
    if (mob.state === "egg") {
        mob.image = '<img src="/assets/images/enemies/B902A.gif">';
        $("#mobImage"+mob.uniqueid).html(mob.image);
        mob.playbook = PlaybookManager.generatePlayBookFromSkills("SM902A","SM902A","SM902A","SM902B");
    }
}