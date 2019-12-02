"use strict";

const CombatManager = {
    refreshLater : false,
    nextTurn(dungeon) {
        const attacker = dungeon.order.nextTurn();
        const allies = (attacker.unitType === "hero") ? dungeon.party.heroes : dungeon.mobs;
        const enemies = (attacker.unitType === "hero") ? dungeon.mobs : dungeon.party.heroes;
        const attack = attacker.getSkill();
        attack.execute(attacker,allies,enemies,dungeon.id);
        dungeon.order.nextPosition();
    },
}

function getTarget(wholeparty, self, type) {
    const party = wholeparty.filter(h => h.alive());
    if (type === "first") return party[0]
    else if (type === "second") {
        if (party.length === 1) return party[0];
        return party[1];
    }
    else if (type === "third") {
        if (party.length === 1) return party[0];
        if (party.length === 2) return party[2];
        return party[3]
    }
    else if (type === "last") return party[party.length-1];
    else if (type === "reverse") return party.reverse()[0];
    else if (type === "random") {
        return party[Math.floor(Math.random()*party.length)];
    }
    else if (type === "highhp") return party.sort((a,b) => {return b.hp - a.hp})[0];
    else if (type === "lowhp") return party.sort((a,b) => {return a.hp - b.hp})[0];
    else if (type === "lowmaxHP") return party.sort((a,b) => {return b.maxHP() - a.maxHP()})[0];
    else if (type === "lowMissingHp") return party.sort((a,b) => {return b.missingHP() - a.missingHP()})[0];
    else if (type === "self") return self;
    else if (type === "all") return wholeparty;
}

function rollStat(stat) {
    return stat > Math.floor(Math.random()*100) + 1
}

const $drLog = $("#drLog");

const BattleLog = {
    log : [],
    logLength : settings.battleLogLength,
    addEntry(dungeonid,icon,m) {
        if (dungeonid !== DungeonManager.dungeonView) return;
        if (this.log.length >= this.logLength) {
            this.log.shift();
        }
        this.log.push(`${icon}&nbsp;&nbsp;${m}`);
        if (CombatManager.refreshLater) return;
        this.refresh();
    },
    clear() {
        this.log = [];
        $drLog.empty();
    },
    refresh() {
        $drLog.empty();
        this.log.forEach(m=> {
            const d = $("<div/>").addClass("battleLog").html(m);
            $drLog.prepend(d);
        });
    },
}

class Attack {
    constructor (attacker, power, skill, dungeonid) {
        this.attacker = attacker;
        this.power = power;
        this.type = skill.damageType;
        this.element = skill.damageElement;
        this.canDodge = skill.canDodge;
        this.dungeonid = dungeonid;
    }
}

class Combatant {
    constructor (props) {
        Object.assign(this,props);
        this.hp = 1;
        this.critDmg = 1.5;
        this.buffs = [];
    }
    buffTick() {
        this.buffs.forEach(buff => {
            buff.buffTick();
        });
        this.buffs = this.buffs.filter(buff => !buff.expired());
    }
    takeAttack(attack) {
        const dodge = attack.canDodge ? rollStat(this.getDodge()) : false;
        if (dodge) {
            BattleLog.addEntry(attack.dungeonid,miscIcons.dodge,`${this.name} dodged the attack!`);
            return;
        }
        const reducedDmg = Math.ceil(attack.power * 100/(100+this.getArmor()));
        BattleLog.addEntry(attack.dungeonid,miscIcons.takeDamage,`${this.name} takes ${reducedDmg} damage`);
        this.hp = Math.max(this.hp-reducedDmg,0);
        refreshHPBar(this);
        if (this.hp === 0) BattleLog.addEntry(attack.dungeonid,miscIcons.dead,`${this.name} has fallen!`);
        this.buffs.forEach(b=>b.onAttacked(attack.attacker));
    }
    takeDamage(dmg) {
        this.hp = Math.max(this.hp-dmg,0);
        refreshHPBar(this);
    }
    hasBuff(buffID) {
        return this.buffs.some(b => b.id === buffID);
    }
    getBuff(buffID) {
        return this.buffs.find(b => b.id === buffID);
    }
    addBuff(buff) {
        this.buffs.push(buff);
    }
    getPow() {
        return this.pow + this.getBuffPower();
    }
    getAdjPow() {
        return this.getPow();
    }
    getArmor() {
        return this.armor + this.getBuffDodge();
    }
    getCrit() {
        return this.crit;
    }
    getDodge() {
        return this.dodge + this.getBuffDodge();
    }
    dead() {
        return this.hp <= 0;
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
    heal(hp) {
        if (this.hp === 0) return;
        this.hp = Math.min(this.hp+hp,this.maxHP());
        if (CombatManager.refreshLater) refreshHPBar(this);
    }
    healPercent(hpPercent) {
        if (this.hp === 0) return;
        this.hp += Math.floor(this.maxHP()*hpPercent/100);
        this.hp = Math.min(this.maxHP(),this.hp);
        if (CombatManager.refreshLater) refreshHPBar(this);
    }
    resetPlaybookPosition() {
        this.playbook.reset();
    }
    getSkill() {
        return this.playbook.nextSkill();
    }
    getActiveSkill() {
        return this.playbook.skillCount();
    }
    getSkillIcons() {
        return this.playbook.getSkillIcons();
    }
    getSkillIDs() {
        return this.playbook.getSkillIDs();
    }
    getBuffArmor() {
        const buffs = this.buffs.map(b=>b.getArmor());
        return buffs.reduce((a,b) => a+b, 0);
    }
    getBuffDodge() {
        const buffs = this.buffs.map(b=>b.getDodge());
        return buffs.reduce((a,b) => a+b, 0);
    }
    getBuffPower() {
        const buffs = this.buffs.map(b=>b.getPow());
        return buffs.reduce((a,b) => a+b, 0);
    }
    removeBuffs() {
        this.buffs = [];
    }
}

