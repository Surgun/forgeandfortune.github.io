"use strict";

function SAparry(attacker, dungeonid) {
    attacker.parry = true;
    const battleMessage = $("<span/>").addClass("logSpecial");
    battleMessage.html(`${logIcon("far fa-swords")} ${logName(attacker.name)} readies a parry attack!`); //parry handled in takeDamage function
    BattleLog.addEntry(dungeonid,battleMessage);
};

function SAarmor(attacker, dungeonid) {
    attacker.armorBuff = true;
    const battleMessage = $("<span/>").addClass("logSpecial");
    battleMessage.html(`${logIcon("fas fa-user-shield")} ${logName(attacker.name)} stands their ground!`); //parry handled in takeDamage function
    BattleLog.addEntry(dungeonid,battleMessage);
}

function SAbloodLet(attacker, enemies, dungeonid) {
    const target = getTarget(enemies, attacker.target);
    attacker.damageCurrentPercent(95);
    const damage = attacker.getAdjPow()*3;
    const battleMessage = $("<span/>").addClass("logSpecial");
    battleMessage.html(`${logIcon("fas fa-tired")} ${logName(attacker.name)} lets out a scream and attacks ${logName(target.name)} for ${logDmg(damage)}!`);
    BattleLog.addEntry(dungeonid,battleMessage);
    CombatManager.takeDamage(damage, target, attacker, dungeonid);    
}

function SAravage(attacker, enemies, dungeonid) {
    const target = getTarget(enemies, attacker.target);
    const damage = Math.round(attacker.getAdjPow()*1.5);
    const battleMessage = $("<span/>").addClass("logSpecial");
    battleMessage.html(`${logIcon("fas fa-fist-raised")} Energy soars through ${logName(attacker.name)} as they attack ${logName(target.name)} for ${logDmg(damage)}!`);
    BattleLog.addEntry(dungeonid,battleMessage);
    CombatManager.takeDamage(damage, target, attacker, dungeonid);
    if (target.dead()) {
        attacker.healPercent(15);
        const battleMessage2 = `<span class="logSpecial"><i class="fas fa-heartbeat"></i> <span class="logName">${attacker.name}</span> feels rejuvinated after their kill!</span>`;
        BattleLog.addEntry(dungeonid,battleMessage2);
    }
}

function SAblast(attacker, enemies, dungeonid) {
    const target = getTarget(enemies, attacker.target);
    target.ignoredArmor = true;
    const damage = Math.round(attacker.getAdjPow()*1.5);
    const battleMessage = $("<span/>").addClass("logSpecial");
    battleMessage.html(`${logIcon("fas fa-fire-smoke")} ${logName(attacker.name)} unleashes a blast at ${logName(target.name)} for ${logDmg(damage)}!`);
    BattleLog.addEntry(dungeonid,battleMessage);
    CombatManager.takeDamage(damage, target, attacker, dungeonid);
};

function SAmeteor(attacker, enemies, dungeonid) {
    const damage = Math.round(attacker.getAdjPow()*1.2);
    const targets = enemies.filter(e => !e.dead());
    const dividedDmg = Math.round(damage/targets.length);
    const battleMessage = $("<span/>").addClass("logSpecial");
    battleMessage.html(`${logIcon("fas fa-meteor")} ${logName(attacker.name)} unleashes a meteor attack!`);
    BattleLog.addEntry(dungeonid,battleMessage); 
    targets.forEach(enemy => {
        CombatManager.takeDamage(dividedDmg, enemy, attacker, dungeonid);
    });
}

function SAheal(attacker, allies, dungeonid) {
    const target = getTarget(allies, "lowhp");
    const healamt = attacker.getAdjPow();
    const battleMessage = $("<span/>").addClass("logSpecial");
    battleMessage.html(`${logIcon("fas fa-heart-circle")} ${logName(attacker.name)} heals ${logName(target.name)} for ${logHeal(healamt)}!`);
    BattleLog.addEntry(dungeonid,battleMessage);
    target.heal(healamt);
}

function SAmassHeal(attacker, allies, dungeonid) {
    const healamt = Math.round(attacker.getAdjPow()*0.8);
    const targets = allies.filter(a => !a.dead());
    const dividedHeal = Math.round(healamt/targets.length);
    const battleMessage = $("<span/>").addClass("logSpecial");
    battleMessage.html(`${logIcon("fas fa-hands-heart")} ${logName(attacker.name)} heals everyone for ${logHeal(healamt)}!`);
    BattleLog.addEntry(dungeonid,battleMessage);
    targets.forEach(ally => {
        ally.heal(dividedHeal);
    });
}

function SAsniper(attacker, enemies, dungeonid) {
    const target = getTarget(enemies, "lowhp");
    const damage = attacker.getAdjPow();
    const battleMessage = $("<span/>").addClass("logSpecial");
    battleMessage.html(`${logIcon("fas fa-bullseye-arrow")} ${logName(attacker.name)} snipes ${logName(target.name)} for ${logDmg(damage)}!`);
    BattleLog.addEntry(dungeonid,battleMessage);
    CombatManager.takeDamage(damage, target, attacker, dungeonid);
}

function SAdouble(attacker, enemies, dungeonid) {
    const target = getTarget(enemies, attacker.target);
    const damage = attacker.getAdjPow();
    const battleMessage = $("<span/>").addClass("logSpecial");
    battleMessage.html(`${logIcon("far fa-swords")} ${logName(attacker.name)} attacks ${logName(target.name)} twice for ${logDmg(damage)}!`);
    BattleLog.addEntry(dungeonid,battleMessage);
    CombatManager.takeDamage(damage, target, attacker, dungeonid);
    CombatManager.takeDamage(damage, target, attacker, dungeonid);
}

function SAamplify(attacker, enemies, dungeonid) {
    enemies.forEach(e => e.amplify = true);
    const battleMessage = $("<span/>").addClass("logSpecial");
    battleMessage.html(`${logIcon("fas fa-flame")} ${logName(attacker.name)} amps it up!`);
    BattleLog.addEntry(dungeonid,battleMessage);
}

function SAstun(attacker, enemies, dungeonid) {
    const target = getTarget(enemies, attacker.target);
    target.stunned = true;
    const battleMessage = $("<span/>").addClass("logSpecial");
    battleMessage.html(`${logIcon("fas fa-bolt")} ${logName(attacker.name)} stuns ${logName(target.name)}!`);
    BattleLog.addEntry(dungeonid,battleMessage);
}

function SAsecond(attacker, enemies, dungeonid) {
    const target = getTarget(enemies, "second");
    const damage = Math.round(attacker.getAdjPow()*1.5);
    const battleMessage = $("<span/>").addClass("logSpecial");
    battleMessage.html(`${logIcon("fas fa-meteor")} ${logName(attacker.name)} unleashes an enhanced attack!`);
    BattleLog.addEntry(dungeonid,battleMessage); 
    CombatManager.takeDamage(damage, target, attacker, dungeonid);
}

function SAbirdflame(attacker, enemies, dungeonid) {
    const damage = Math.round(attacker.getAdjPow()*2);
    const targets = enemies.filter(e => !e.dead());
    const dividedDmg = Math.round(damage/targets.length);
    const battleMessage = $("<span/>").addClass("logSpecial");
    battleMessage.html(`${logIcon("fas fa-meteor")} ${logName(attacker.name)} unleashes a flaming bird attack!`);
    BattleLog.addEntry(dungeonid,battleMessage); 
    targets.forEach(enemy => {
        CombatManager.takeDamage(dividedDmg, enemy, attacker, dungeonid);
    });
}

function SAdefenseStance(attacker, dungeonid) {
    attacker.armor += 5;
    const battleMessage = $("<span/>").addClass("logSpecial");
    battleMessage.html(`${logIcon("fas fa-user-shield")} The enemy ${logName(attacker.name)} used Harden!`); //parry handled in takeDamage function
    BattleLog.addEntry(dungeonid,battleMessage);
}

function SAsummon(attacker, dungeonid) {
    DungeonManager.dungeonByID(dungeonid).addSummon();
    const battleMessage = $("<span/>").addClass("logSpecial");
    battleMessage.html(`${logIcon("fas fa-user-shield")} ${attacker.name} summons a friend!`);
    BattleLog.addEntry(dungeonid, battleMessage);
}

function SAstunLinger(attacker, enemies, dungeonid) {
    const target = getTarget(enemies, "random");
    target.stunLinger = true;
    const battleMessage = $("<span/>").addClass("logSpecial");
    battleMessage.html(`${logIcon("fas fa-bolt")} ${logName(attacker.name)} stuns ${logName(target.name)} really bad!`);
    BattleLog.addEntry(dungeonid,battleMessage);
}