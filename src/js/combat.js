"use strict";

const TargetType = Object.freeze({FIRST:0,SECOND:1,THIRD:2,FOURTH:3,SELF:5,ALL:6,MISSINGHP:7,LOWESTHP:8,BEHIND:9,CLEAVE:10,BEFORE:11,AFTER:12,ADJACENT:13,MIRROR:14,});
const SideType = Object.freeze({ALLIES:0,ENEMIES:1});

const CombatManager = {
    refreshLater : false,
    nextTurn(dungeon) {
        const attacker = dungeon.order.nextTurn();
        attacker.buffTick("onMyTurn");
        const allies = (attacker.unitType === "hero") ? dungeon.party.heroes : dungeon.mobs;
        const enemies = (attacker.unitType === "hero") ? dungeon.mobs : dungeon.party.heroes;
        const attack = attacker.getSkill();
        const combatParams = new combatRoundParams(attacker,allies,enemies,attack,dungeon.id);
        this.execute(combatParams);
        dungeon.order.nextPosition();
    },
    execute(combatRound) {
        SkillManager.skillEffects[combatRound.attack.id](combatRound);
        combatRound.attacker.buffTick("onHitting");        
    }
}

class combatRoundParams {
    constructor (attacker,allies,enemies,attack,dungeonid) {
        this.attacker = attacker;
        this.allies = allies;
        this.enemies = enemies;
        this.attack = attack;
        this.power = Math.floor(this.attacker.getPow() * this.attack.powMod + this.attacker.getTech() * this.attack.techMod);
        this.dungeonid = dungeonid;
    }
    getTarget(target,side) {
        const aliveEnemys = this.enemies.filter(h=>h.alive());
        const enemies = aliveEnemys.some(h=>h.mark()) ? aliveEnemys.filter(h=>h.mark()) : aliveEnemys;
        const living = (side === SideType.ALLIES) ? this.allies.filter(h=>h.alive()) : enemies;
        if (target === TargetType.FIRST) return [living[0]];
        if (target === TargetType.SECOND) {
            if (living.length === 1) return [living[0]];
            return [living[1]];
        }
        if (target === TargetType.THIRD) {
            if (living.length === 1) return [living[0]];
            if (living.length === 2) return [living[1]];
            return [living[3]];
        }
        if (target === TargetType.FOURTH) return [living[living.length-1]];
        if (target === TargetType.SELF) return [this.attacker];
        if (target === TargetType.ALL) return living;
        if (target === TargetType.MISSINGHP) return [living.reduce((a,b) => a.missingHP() >= b.missingHP() ? a : b)];
        if (target === TargetType.LOWESTHP) return [living.reduce((a,b) => a.hp < b.hp ? a : b)];
        //[Beorn,Titus,Alok,Grim] => indx 1 returns 0
        if (target === TargetType.BEFORE) {
            const uid = this.attacker.uniqueid;
            const indx = living.findIndex(h=>h.uniqueid === uid);
            if (indx === 0) return null;
            return [living[indx-1]];
        }
        if (target === TargetType.AFTER) {
            const uid = this.attacker.uniqueid;
            const indx = living.findIndex(h=>h.uniqueid === uid);
            if (indx === living.length-1) return null;
            return [living[indx+1]];
        }
        if (target === TargetType.BEFORE) {
            const uid = this.attacker.uniqueid;
            const indx = living.findIndex(h=>h.uniqueid === uid);
            if (indx === 0) return null;
            return [living[indx-1]];
        }
        if (target === TargetType.BEHIND) {
            const uid = this.attacker.uniqueid;
            const indx = living.findIndex(h=>h.uniqueid === uid);
            if (indx === living.length-1) return null;
            return living.slice(indx+1,living.length);
        }
        if (target === TargetType.CLEAVE) {
            if (living.length === 1) return [living[0]];
            return living.slice(0,2);
        }
        if (target === TargetType.ADJACENT) {
            const uid = this.attacker.uniqueid;
            const indx = living.findIndex(h=>h.uniqueid === uid);
            const targets = [];
            if (indx !== living.length-1) targets.push(living[indx+1]);
            if (indx !== 0) targets.push(living[indx-1]);
            return targets;
        }
        if (target === TargetType.MIRROR) {
            const uid = this.attacker.uniqueid;
            const indx = living.findIndex(h=>h.uniqueid === uid);
            if (living.length-1 < indx) return living[living.length-1];
            return living[indx];
        }
    }
}

class Combatant {
    constructor (props) {
        Object.assign(this,props);
        this.hp = 1;
        this.critDmg = 1.5;
        this.buffs = [];
        this.state = null;
    }
    buffTick(type,attack) {
        this.buffs.forEach(buff => {
            buff.buffTick(type,attack);
        });
        this.buffs = this.buffs.filter(buff => !buff.expired());
    }
    passiveCheck(type,attack) {
        if (this.passiveSkill === null) return;
        SkillManager.idToSkill(this.passiveSkill).passiveCheck(type,this,attack);
    }
    takeAttack(attack) {
        const reducedDmg = Math.floor(attack.power * this.getProtection() * this.getVulnerability(attack.attacker)); //attack.attacker because you need his type
        this.hp = Math.max(this.hp-reducedDmg,0);
        if (this.hp === 0) this.passiveCheck("dead",attack);
        refreshHPBar(this);
        if (this.thorns() > 0) attack.attacker.takeDamage(this.thorns());
        if (this.parry() > 0) attack.attacker.takeDamage(this.parry());
        if (this.beornTank() > 0) {
            HeroManager.idToHero("H001").takeDamage(this.beornTank());
        }
        this.buffTick("onHit",attack); //this has to be after thorns/parry so it can remove them as appropriate
    }
    takeDamage(dmg) {
        this.hp = Math.max(this.hp-dmg,0);
        if (!CombatManager.refreshLater) refreshHPBar(this);
    }
    takeDamagePercent(hpPercent) {
        this.hp -= Math.floor(this.maxHP()*hpPercent/100);
        this.hp = Math.max(0,this.hp);
        if (!CombatManager.refreshLater) refreshHPBar(this);
    }
    hasBuff(buffID) {
        return this.buffs.some(b => b.id === buffID);
    }
    getBuff(buffID) {
        return this.buffs.find(b => b.id === buffID);
    }
    getBuffStacks(buffID) {
        if (!this.hasBuff(buffID)) return 0;
        return this.getBuff(buffID).stacks;
    }
    addBuff(buff) {
        this.buffs.push(buff);
        this.hp = Math.min(this.hp,this.maxHP());
    }
    removeBuff(buffID) {
        this.buffs = this.buffs.filter(b=>b.id !== buffID);
    }
    getPow() {
        return Math.floor(this.pow + this.getBuffPower());
    }
    getTech() {
        return 0;
    }
    getProtection() {
        return 1 - (this.protection + this.getBuffProtection());
    }
    getVulnerability(attacker) {
        return 1 + this.getBuffVulnerability(attacker);   
    }
    getAdjPow() {
        return this.getPow();
    }
    dead() {
        return this.hp <= 0;
    }
    alive() {
        return this.hp > 0;
    }
    maxHP() {
        return Math.floor(this.hpmax + this.getBuffMaxHP());
    }
    missingHP() {
        return this.maxHP()-this.hp;
    }
    hpLessThan(percent) {
        return this.maxHP() * percent >= this.hp;
    }
    hpGreaterThan(percent) {
        return this.maxHP() * percent <= this.hp;
    }
    heal(hp) {
        if (this.hp === 0) return;
        if (this.isWilt()) hp = Math.floor(hp/2);
        this.hp = Math.min(this.hp+hp,this.maxHP());
        if (!CombatManager.refreshLater) refreshHPBar(this);
    }
    healPercent(hpPercent) {
        if (this.hp === 0) return;
        if (this.isWilt()) hp = Math.floor(hp/2);
        this.hp += Math.floor(this.maxHP()*hpPercent/100);
        this.hp = Math.min(this.maxHP(),this.hp);
        if (!CombatManager.refreshLater) refreshHPBar(this);
    }
    setHP(hp) {
        if (this.hp === 0) return;
        this.hp = Math.min(hp,this.maxHP());
        if (!CombatManager.refreshLater) refreshHPBar(this);
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
    mark() {
        return this.buffs.some(b=>b.mark());
    }
    parry() {
        return this.buffs.map(b=>b.parry()).reduce((a,b) => a+b,0);
    }
    getBuffProtection() {
        const buffs = this.buffs.map(b=>b.getProtection());
        return buffs.reduce((a,b) => a+b, 0);
    }
    getBuffVulnerability(attacker) {
        const buffs = this.buffs.map(b=>b.getVulnerability(attacker));
        return buffs.reduce((a,b) => a+b, 0);
    }
    getBuffPower() {
        const buffs = this.buffs.map(b=>b.getPow());
        return buffs.reduce((a,b) => a+b, 0);
    }
    getBuffTech() {
        const buffs = this.buffs.map(b=>b.getTech());
        return buffs.reduce((a,b) => a+b, 0);
    }
    getBuffMaxHP() {
        const buffs = this.buffs.map(b=>b.maxHP());
        return buffs.reduce((a,b) => a+b, 0);
    }
    debuffImmune() {
        return this.buffs.some(b=>b.debuffImmune());
    }
    buffCount() {
        return this.buffs.filter(b => b.type === "buff").length;
    }
    debuffCount() {
        return this.buffs.filter(b => b.type === "debuff").length;
    }
    removeBuffs() {
        this.buffs.forEach(buff => {
            BuffRefreshManager.removeBuff(buff,this);
        });
        this.buffs = [];
        this.hp = Math.min(this.hp,this.maxHP());
    }
    removeDebuffs() {
        this.buffs.forEach(buff => {
            if (buff.type === "debuff") BuffRefreshManager.removeBuff(buff,this);
        });
        this.buffs = this.buffs.filter(b => b.type !== "debuff");
        this.hp = Math.min(this.hp,this.maxHP());
    }
    isChilled() {
        return this.buffs.some(b=>b.isChilled());
    }
    isLifeTapped() {
        return this.buffs.some(b=>b.isLifeTapped());
    }
    isWilt() {
        return this.buffs.some(b=>b.isWilt());
    }
    underHalfHP() {
        return 2*this.hp <= this.maxHP();
    }
    thorns() {
        const thorns = this.buffs.map(b=>b.thorns());
        return thorns.reduce((a,b) => a+b, 0);
    }
    beornTank() {
        return this.buffs.map(b=>b.beornTank()).reduce((a,b) => a+b, 0);
    }
}

