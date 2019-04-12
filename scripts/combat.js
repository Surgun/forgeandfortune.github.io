"use strict";
const EnhanceTypes = Object.freeze({PARRY:0,ARMOR:1,BLOODLET:2,SURGE:3});

const CombatManager = {
    heroAttack(hero, dungeonID) {
        const dungeon = DungeonManager.dungeonByID(dungeonID);
        const enemies = dungeon.mobs;
        const target = getTarget(enemies, hero.target);
        const battleMessage = new BattleMessage(dungeonID, hero, target);
        this.executeAttack(hero,target,battleMessage);
    },
    mobAttack(mob, dungeonID) {
        const dungeon = DungeonManager.dungeonByID(dungeonID);
        const enemies = dungeon.party.heroes;
        const target = getTarget(enemies, mob.target);
        const battleMessage = new BattleMessage(dungeonID, mob, target);
        this.executeAttack(mob, target, battleMessage);
    },
    executeAttack(attacker, defender, battleMessage) {
        const critical = this.rollStat(attacker.crit);
        battleMessage.critical = critical;
        let damage = attacker.getAdjPow();
        if (critical) damage = Math.round(damage*attacker.critdmg);
        if (attacker.ap === attacker.apmax) {
            battleMessage.apAttack = true;
            damage = Math.round(damage * 2);
            attacker.ap = 0;
        }
        attacker.addAP();
        refreshAPBar(attacker);
        battleMessage.damage = damage;
        this.takeDamage(damage, defender, battleMessage);
    },
    takeDamage(damage,defender,battleMessage) {
        damage -= defender.armor;
        battleMessage.damage = damage;
        battleMessage.armor = defender.armor;
        const dodge = this.rollStat(defender.dodgeChance);
        battleMessage.dodge = dodge;
        if (!dodge) {
            defender.hp = Math.max(defender.hp - damage, 0);
        }
        battleMessage.defenderDead = defender.hp === 0;
        refreshHPBar(defender);
        BattleLog.addBattleLog(battleMessage);
    },
    rollStat(critChance) {
        return critChance > Math.floor(Math.random()*100) + 1
    },
}


function getTarget(party,type) {
    party = party.filter(h => h.alive());
    if (type === "first") return party[0]
    else if (type === "reverse") return party.reverse()[0];
    else if (type === "random") return party[Math.floor(Math.random()*party.length)];
    else if (type === "highhp") return party.sort((a,b) => {return b.hp - a.hp})[0];
    else if (type === "lowhp") return party.sort((a,b) => {return a.hp - b.hp})[0];
}

const $drLog = $("#drLog");

const BattleLog = {
    log : [],
    logLength : settings.battleLogLength,
    addLog(m) {
        if (this.log.length >= this.logLength) {
            this.log.shift();
        }
        this.log.push(m);
        $drLog.empty();
        this.log.forEach(m=> {
            const d = $("<div/>").addClass("battleLog").html(m);
            $drLog.prepend(d);
        });
    },
    clear() {
        this.log = [];
        $drLog.empty();
    },
    mobDrops(name,drops) {
        if (drops.length === 0) return;
        const dropnames = drops.map(m=>ResourceManager.idToMaterial(m).name);
        this.addLog(`${name} dropped ${dropnames.join(", ")}`)
    },
    addBattleLog(battleMessage) {
        if (battleMessage.dungeonID !== DungeonManager.dungeonView) return;
        this.addLog(battleMessage.message());
    },
}

class BattleMessage {
    constructor (dungeonID, attacker, defender, isHero) {
        this.dungeonID = dungeonID;
        this.isHero = isHero;
        this.attacker = attacker;
        this.defender = defender;
        this.defenderDead = false;
        this.critical = false;
        this.apAttack = false;
        this.damage = 0;
    }
    attackerDiv() {
        const d = $("<div/>").addClass("blAttacker").html(this.attacker.name);
        if (this.isHero) d.addClass("blHero");
        return d
    }
    defenderDiv() {
        const d = $("<div/>").addClass("blDefender").html(this.defender.name);
        console.log(this.defender.name);
        if (!this.isHero) d.addClass("blHero");
        return d;
    }
    message() {
        const attacker = this.attackerDiv();
        const defender = this.defenderDiv();
        const damage = $("<div/>").addClass("blDamage").html(`${this.damage} damage. `)
        const message = $("<div/>").addClass("battleMessage").html(attacker);
        if (this.critical) message.append(" crits ");
        else message.append(" attacks ")
        message.append(defender);
        if (this.apAttack) message.append("for an enhanced ");
        else message.append("for ");
        message.append(damage);
        if (this.defenderDead) message.append(" ",defender.clone()," died!");
        return message;
    }
}
