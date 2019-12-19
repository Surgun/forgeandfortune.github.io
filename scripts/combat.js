"use strict";

const CombatManager = {
    refreshLater : false,
    nextTurn(dungeon) {
        const attacker = dungeon.order.nextTurn();
        const allies = (attacker.unitType === "hero") ? dungeon.party.heroes : dungeon.mobs;
        const enemies = (attacker.unitType === "hero") ? dungeon.mobs : dungeon.party.heroes;
        const attack = attacker.getSkill();
        const combatRound = new combatRoundParams(attacker,allies,enemies,attack,dungeon.id);
        combatRound.execute();
        attacker.buffTick("onHitting");
        dungeon.order.nextPosition();
    },
}

class combatRoundParams {
    constructor (attacker,allies,enemies,attack,dungeonid) {
        this.attacker = attacker;
        this.allies = allies;
        this.enemies = enemies;
        this.attack = attack;
        this.power = this.attacker.getPow() * this.attack.powerMod;
        this.dungeonid = dungeonid;
    }
    getTarget(override) {
        const livingAllies = allies.filter(h=>h.alive());
        const target = override || this.attack.targetType;
        const livingEnemies = enemies.filter(h=>h.alive());
        if (target === "first") return [livingEnemies[0]];
        if (target === "second") {
            if (livingEnemies.length === 1) return [livingEnemies[0]];
            return [livingEnemies[1]];
        }
        if (target === "third") {
            if (livingEnemies.length === 1) return [livingEnemies[0]];
            if (livingEnemies.length === 2) return [livingEnemies[1]];
            return [livingEnemies[3]];
        }
        if (target === "last") return [livingEnemies[livingEnemies.length-1]];
        if (target === "random") return [livingEnemies[Math.floor(Math.random()*livingEnemies.length)]];
        if (target === "self") return [attacker];
        if (target === "allEnemies") return livingEnemies;
        if (target === "allAllies") return livingAllies;
    }
    execute() {
        SkillManager.skillEffects[attack.id](this);
        BattleLog.addEntry(this.dungeonid,this.icon,this.battleText());
    }
    battleText() {
        let battleTextEdit = this.bText.replace("#ATTACKER#",this.attacker.name);
        battleTextEdit = battleTextEdit.replace("#DEFENDER#",this.defender.name);
        return battleTextEdit.replace("#DAMAGE#",this.power);
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
    getSpow() {
        return this.spow + this.getBuffSpower();
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
        return this.hpmax;
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
    getBuffSpower() {
        const buffs = this.buffs.map(b=>b.getSpow());
        return buffs.reduce((a,b) => a+b, 0);
    }
    removeBuffs() {
        this.buffs = [];
    }
}

