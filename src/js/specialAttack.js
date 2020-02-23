"use strict";

function SAparry(attacker, dungeonid) {
    attacker.parry = true;
};

function SAarmor(attacker, dungeonid) {
    attacker.armorBuff = true;
}

function SAbloodLet(attacker, enemies, dungeonid) {
    const target = getTarget(enemies, attacker.target);
    attacker.damageCurrentPercent(95);
    const damage = attacker.getAdjPow(true)*3;
    CombatManager.takeDamage(damage, target, attacker, dungeonid);    
}

function SAravage(attacker, enemies, dungeonid) {
    const target = getTarget(enemies, attacker.target);
    const damage = Math.round(attacker.getAdjPow(true)*1.5);
    CombatManager.takeDamage(damage, target, attacker, dungeonid);
    if (target.dead()) {
        attacker.healPercent(15);
    }
}

function SAblast(attacker, enemies, dungeonid) {
    const target = getTarget(enemies, attacker.target);
    target.ignoredArmor = true;
    const damage = Math.round(attacker.getAdjPow(true)*1.5);
    CombatManager.takeDamage(damage, target, attacker, dungeonid);
};

function SAmeteor(attacker, enemies, dungeonid) {
    const damage = Math.round(attacker.getAdjPow(true)*1.2);
    const targets = enemies.filter(e => !e.dead());
    const dividedDmg = Math.round(damage/targets.length);
    targets.forEach(enemy => {
        CombatManager.takeDamage(dividedDmg, enemy, attacker, dungeonid);
    });
}

function SAheal(attacker, allies, dungeonid) {
    const target = getTarget(allies, "lowMissingHp");
    const healamt = attacker.getAdjPow(true);
    target.heal(healamt);
}

function SAmassHeal(attacker, allies, dungeonid) {
    const healamt = Math.round(attacker.getAdjPow(true)*0.8);
    const targets = allies.filter(a => !a.dead());
    const dividedHeal = Math.round(healamt/targets.length);
    targets.forEach(ally => {
        ally.heal(dividedHeal);
    });
}

function SAsniper(attacker, enemies, dungeonid) {
    const target = getTarget(enemies, "lowhp");
    const damage = attacker.getAdjPow(true);
    CombatManager.takeDamage(damage, target, attacker, dungeonid);
}

function SAdouble(attacker, enemies, dungeonid) {
    const target = getTarget(enemies, attacker.target);
    const damage = attacker.getAdjPow(true);
    CombatManager.takeDamage(damage, target, attacker, dungeonid);
    CombatManager.takeDamage(damage, target, attacker, dungeonid);
}

function SAamplify(attacker, enemies, dungeonid) {
    enemies.forEach(e => e.amplify = true);
}

function SAstun(attacker, enemies, dungeonid) {
    const target = getTarget(enemies, attacker.target);
    target.stunned = true;
}

function SAsecond(attacker, enemies, dungeonid) {
    const target = getTarget(enemies, "second");
    const damage = Math.round(attacker.getAdjPow(true)*1.5);
    CombatManager.takeDamage(damage, target, attacker, dungeonid);
}

function SAbirdflame(attacker, enemies, dungeonid) {
    for (let i=0;i<3;i++) {
        const target = getTarget(enemies, "random");
        const damage = attacker.getAdjPow();
        if (target === undefined) return;
        CombatManager.takeDamage(damage, target, attacker, dungeonid);
    }
}

function SAdefenseStance(attacker, dungeonid) {
    attacker.armor += 5;
}

function SAsummon(attacker, dungeonid) {
    DungeonManager.dungeonByID(dungeonid).addSummon();
}

function SAfear(attacker, enemies, dungeonid) {
    const target = getTarget(enemies, "random");
    target.fear = true;
}

function SAlowmaxHPStun(attacker, enemies, dungeonid) {
    const target = getTarget(enemies, "lowmaxHP");
    const damage = Math.round(attacker.getAdjPow()*1.5);
    target.stunned = true;
    CombatManager.takeDamage(damage, target, attacker, dungeonid);
}

function SAdefenseStancePlus(attacker, dungeonid) {
    attacker.armor += 5;
    attacker.enhance += 1;
}

function SAsummon2(attacker, enemies, dungeonid) {
    DungeonManager.dungeonByID(dungeonid).addSummon2();
}

function SAfearap(attacker, enemies, dungeonid) {
    const target = getTarget(enemies, "random");
    target.fear = true;
    target.ap = 0;
}