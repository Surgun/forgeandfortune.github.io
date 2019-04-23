"use strict";

function SAparry(attacker, dungeonid) {
    attacker.parry = true;
    const battleMessage = `<span class="logSpecial"><i class="far fa-swords"></i> <span class="logName">${attacker.name}</span> readies a parry attack!</span>` //parry handled in takeDamage function
    BattleLog.addEntry(dungeonid,battleMessage);
};

function SAarmor(attacker, dungeonid) {
    attacker.armorBuff = true;
    const battleMessage = `<span class="logSpecial"><i class="fas fa-user-shield"></i> <span class="logName">${attacker.name}</span> stands their ground!</span>` //parry handled in takeDamage function
    BattleLog.addEntry(dungeonid,battleMessage);
}

function SAbloodLet(attacker, enemies, dungeonid) {
    const target = getTarget(enemies, attacker.target);
    attacker.damageCurrentPercent(95);
    const damage = attacker.getAdjPow()*3;
    const battleMessage = `<span class="logSpecial"><i class="fas fa-tired"></i> <span class="logName">${attacker.name}</span> lets out a scream and attacks <span class="logName">${target.name}</span> for <span class="logDamage"><i class="fas fa-sword"></i> ${damage} damage</span></span>!`
    BattleLog.addEntry(dungeonid,battleMessage);
    CombatManager.takeDamage(damage, target, attacker, dungeonid);    
}

function SAravage(attacker, enemies, dungeonid) {
    const target = getTarget(enemies, attacker.target);
    const damage = Math.round(attacker.getAdjPow()*1.5);
    const battleMessage = `<span class="logSpecial"><i class="fas fa-fist-raised"></i> Energy soars through <span class="logName">${attacker.name}</span> as they attack <span class="logName">${target.name}</span> for <span class="logDamage"><i class="fas fa-sword"></i> ${damage} damage</span>!</span>`
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
    const battleMessage = `<span class="logSpecial"><i class="fas fa-fire-smoke"></i> <span class="logName">${attacker.name}</span> unleashes a blast at <span class="logName">${target.name}</span> for <span class="logDamage"><i class="fas fa-sword"></i> ${damage} damage</span>!</span>`
    BattleLog.addEntry(dungeonid,battleMessage);
    CombatManager.takeDamage(damage, target, attacker, dungeonid);
};

function SAmeteor(attacker, enemies, dungeonid) {
    const damage = Math.round(attacker.getAdjPow()*1.2);
    const targets = enemies.filter(e => !e.dead());
    const dividedDmg = damage/targets.length;
    const battleMessage = `<span class="logSpecial"><i class="fas fa-meteor"></i> <span class="logName">${attacker.name}</span> unleashes a meteor attack!</span>`;
    BattleLog.addEntry(dungeonid,battleMessage); 
    targets.forEach(enemy => {
        CombatManager.takeDamage(dividedDmg, enemy, attacker, dungeonid);
    });
}

function SAheal(attacker, allies, dungeonid) {
    const target = getTarget(allies, "lowhp");
    const healamt = attacker.getAdjPow();
    const battleMessage = `<span class="logSpecial"><i class="fas fa-heart-circle"></i> <span class="logName">${attacker.name}</span> heals <span class="logName">${target.name}</span> for <span class="logHeal">${healamt} HP</span>!</span>`;
    BattleLog.addEntry(dungeonid,battleMessage);
    target.heal(healamt);
}

function SAmassHeal(attacker, allies, dungeonid) {
    const healamt = Math.round(attacker.getAdjPow()*0.8);
    const targets = allies.filter(a => !a.dead());
    const dividedHeal = Math.round(healamt/targets.length);
    const battleMessage = `<span class="logSpecial"><i class="fas fa-hands-heart"></i> <span class="logName">${attacker.name}</span> heals everyone for <span class="logHeal">${dividedHeal} HP</span>!</span>`;
    BattleLog.addEntry(dungeonid,battleMessage);
    targets.forEach(ally => {
        ally.heal(dividedHeal);
    });
}

function SAsniper(attacker, enemies, dungeonid) {
    const target = getTarget(enemies, "lowhp");
    const damage = attacker.getAdjPow();
    const battleMessage = `<span class="logSpecial"><i class="fas fa-bullseye-arrow"></i> <span class="logName">${attacker.name}</span> snipes <span class="logName">${target.name}</span> for <span class="logDamage"><i class="fas fa-sword"></i> ${damage} damage</span>!</span>`;
    BattleLog.addEntry(dungeonid,battleMessage);
    CombatManager.takeDamage(damage, target, attacker, dungeonid);
}

function SAdouble(attacker, enemies, dungeonid) {
    const target = getTarget(enemies, attacker.target);
    const damage = attacker.getAdjPow();
    const battleMessage = `<span class="logSpecial"><i class="far fa-swords"></i> <span class="logName">${attacker.name}</span> attacks <span class="logName">${target.name}</span> twice for <span class="logDamage"><i class="fas fa-sword"></i> ${damage} damage</span>!</span>`;
    BattleLog.addEntry(dungeonid,battleMessage);
    CombatManager.takeDamage(damage, target, attacker, dungeonid);
    CombatManager.takeDamage(damage, target, attacker, dungeonid);
}

function SAamplify(attacker, enemies, dungeonid) {
    enemies.forEach(e => e.amplify = true);
    const battleMessage = `<span class="logSpecial"><i class="fas fa-flame"></i> <span class="logName">${attacker.name}</span> amps it up!</span>`;
    BattleLog.addEntry(dungeonid,battleMessage);
}

function SAstun(attacker, enemies, dungeonid) {
    const target = getTarget(enemies, attacker.target);
    target.stunned = true;
    const battleMessage = `<span class="logSpecial"><i class="fas fa-bolt"></i> <span class="logName">${attacker.name}</span> stuns <span class="logName">${target.name}</span></span>!`;
    BattleLog.addEntry(dungeonid,battleMessage);
}