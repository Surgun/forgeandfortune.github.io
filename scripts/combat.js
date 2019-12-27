"use strict";

const TargetType = Object.freeze({FIRST:0,SECOND:1,THIRD:2,FOURTH:3,RANDOM:4,SELF:5,ALLENEMIES:6,ALLALLIES:7});

const CombatManager = {
    refreshLater : false,
    nextTurn(dungeon) {
        const attacker = dungeon.order.nextTurn();
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
    getTarget(target) {
        const livingAllies = this.allies.filter(h=>h.alive());
        const livingEnemies = this.enemies.filter(h=>h.alive());
        if (target === TargetType.FIRST) return [livingEnemies[0]];
        if (target === TargetType.SECOND) {
            if (livingEnemies.length === 1) return [livingEnemies[0]];
            return [livingEnemies[1]];
        }
        if (target === TargetType.THIRD) {
            if (livingEnemies.length === 1) return [livingEnemies[0]];
            if (livingEnemies.length === 2) return [livingEnemies[1]];
            return [livingEnemies[3]];
        }
        if (target === TargetType.FOURTH) return [livingEnemies[livingEnemies.length-1]];
        if (target === TargetType.RANDOM) return [livingEnemies[Math.floor(Math.random()*livingEnemies.length)]];
        if (target === TargetType.SELF) return [this.attacker];
        if (target === TargetType.ALLENEMIES) return livingEnemies;
        if (target === TargetType.ALLALLIES) return livingAllies;
    }
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

class Combatant {
    constructor (props) {
        Object.assign(this,props);
        this.hp = 1;
        this.critDmg = 1.5;
        this.buffs = [];
    }
    buffTick(type) {
        this.buffs.forEach(buff => {
            buff.buffTick(type);
        });
        this.buffs = this.buffs.filter(buff => !buff.expired());
    }
    takeAttack(attack) {
        battleText(attack,this);
        const reducedDmg = attack.power * this.getProtection();
        BattleLog.addEntry(attack.dungeonid,miscIcons.takeDamage,`${this.name} takes ${reducedDmg} damage`);
        this.hp = Math.max(this.hp-reducedDmg,0);
        refreshHPBar(this);
        if (this.hp === 0) BattleLog.addEntry(attack.dungeonid,miscIcons.dead,`${this.name} has fallen!`);
        this.buffTick("onHit");
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
    getTech() {
        return 0;
    }
    getProtection() {
        return 1 - (this.protection + this.getBuffProtection());
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
        return this.hpmax + this.getBuffMaxHP();
    }
    missingHP() {
        return this.maxHP()-this.hp;
    }
    heal(hp) {
        if (this.hp === 0) return;
        this.hp = Math.min(this.hp+hp,this.maxHP());
        if (!CombatManager.refreshLater) refreshHPBar(this);
    }
    healPercent(hpPercent) {
        if (this.hp === 0) return;
        this.hp += Math.floor(this.maxHP()*hpPercent/100);
        this.hp = Math.min(this.maxHP(),this.hp);
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
    getBuffProtection() {
        const buffs = this.buffs.map(b=>b.getProtection());
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
    buffCount() {
        return this.buffs.length;
    }
    removeBuffs() {
        this.buffs = [];
        this.hp = Math.min(this.hp,this.maxHP());
    }
    isChilled() {
        return this.buffs.some(b=>b.isChilled());
    }
}

