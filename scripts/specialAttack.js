"use strict";

function SAparry(attacker, dungeonid) {
    attacker.parry = true;
    const battleMessage = `${attacker.name} readies a parry attack!` //parry handled in takeDamage function
    BattleLog.addEntry(dungeonid,battleMessage);
};

function SAarmor(attacker, dungeonid) {
    attacker.armorBuff = true;
    const battleMessage = `${attacker.name} stands their ground!` //parry handled in takeDamage function
    BattleLog.addEntry(dungeonid,battleMessage);
}

function SAbloodLet(attacker, enemies, dungeonid) {
    const target = getTarget(enemies, attacker.target);
    attacker.damageCurrentPercent(95);
    const damage = attacker.getAdjPow()*3;
    const battleMessage = `${attacker.name} lets out a scream and attacks ${target.name} for ${damage} damage!`
    BattleLog.addEntry(dungeonid,battleMessage);
    CombatManager.takeDamage(damage, target, attacker, dungeonid);    
}

function SAravage(attacker, enemies, dungeonid) {
    const target = getTarget(enemies, attacker.target);
    const damage = Math.round(attacker.getAdjPow()*1.5);
    const battleMessage = `Energy soars through ${attacker.name} as they attack ${target.name} for ${damage} damage!`
    BattleLog.addEntry(dungeonid,battleMessage);
    CombatManager.takeDamage(damage, target, attacker, dungeonid);
    if (target.dead()) {
        attacker.healPercent(15);
        const battleMessage2 = `${attacker.name} feels rejuvinated after their kill!`;
        BattleLog.addEntry(dungeonid,battleMessage2);
    }
}

function SAblast(attacker, enemies, dungeonid) {
    const target = getTarget(enemies, attacker.target);
    target.ignoredArmor = true;
    const damage = Math.round(attacker.getAdjPow()*1.5);
    const battleMessage = `${attacker.name} unleashes a blast at ${target.name} for ${damage} damage!`
    BattleLog.addEntry(dungeonid,battleMessage);
    CombatManager.takeDamage(damage, target, attacker, dungeonid);
};

function SAmeteor(attacker, enemies, dungeonid) {
    const damage = Math.round(attacker.getAdjPow()*1.2);
    const targets = enemies.filter(e => !e.dead());
    const dividedDmg = damage/targets.length;
    const battleMessage = `${attacker.name} unleashes a meteor attack!`;
    BattleLog.addEntry(dungeonid,battleMessage); 
    targets.forEach(enemy => {
        CombatManager.takeDamage(dividedDmg, enemy, attacker, dungeonid);
    });
}

function SAheal(attacker, allies, dungeonid) {
    const target = getTarget(allies, "lowhp");
    const healamt = attacker.getAdjPow();
    const battleMessage = `${attacker.name} heals ${target.name} for ${healamt} HP!`;
    BattleLog.addEntry(dungeonid,battleMessage);
    target.heal(healamt);
}

function SAmassHeal(attacker, allies, dungeonid) {
    const healamt = Math.round(attacker.getAdjPow()*0.8);
    const targets = allies.filter(a => !a.dead());
    const dividedHeal = Math.round(healamt/targets.length);
    const battleMessage = `${attacker.name} heals everyone for ${dividedHeal} HP!`;
    BattleLog.addEntry(dungeonid,battleMessage);
    targets.forEach(ally => {
        ally.heal(dividedHeal);
    });
}

function SAsniper(attacker, enemies, dungeonid) {
    const target = getTarget(enemies, "lowhp");
    const damage = attacker.getAdjPow();
    const battleMessage = `${attacker.name} snipes ${target.name} for ${damage} damage!`;
    BattleLog.addEntry(dungeonid,battleMessage);
    CombatManager.takeDamage(damage, target, attacker, dungeonid);
}

function SAdouble(attacker, enemies, dungeonid) {
    const target = getTarget(enemies, attacker.target);
    const damage = attacker.getAdjPow();
    const battleMessage = `${attacker.name} attacks ${target.name} twice for ${damage} damage!`;
    BattleLog.addEntry(dungeonid,battleMessage);
    CombatManager.takeDamage(damage, target, attacker, dungeonid);
    CombatManager.takeDamage(damage, target, attacker, dungeonid);
}

function SAamplify(attacker, enemies, dungeonid) {
    enemies.forEach(e => e.amplify = true);
    const battleMessage = `${attacker.name} amps it up!`;
    BattleLog.addEntry(dungeonid,battleMessage);
}

function SAamplify(attacker, enemies, dungeonid) {
    enemies.forEach(e => e.amplify = true);
    const battleMessage = `${attacker.name} amps it up!`;
    BattleLog.addEntry(dungeonid,battleMessage);
}

function SAstun(attacker, enemies, dungeonid) {
    const target = getTarget(enemies, attacker.target);
    target.stunned = true;
    const battleMessage = `${attacker.name} stuns ${target.name}!`;
    BattleLog.addEntry(dungeonid,battleMessage);
}