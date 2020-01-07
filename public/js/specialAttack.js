"use strict";

function SAparry(attacker, dungeonid) {
  attacker.parry = true;
  var battleMessage = $("<span/>").addClass("logSpecial");
  battleMessage.html("".concat(logIcon("far fa-swords"), " ").concat(logName(attacker.name), " readies a parry attack!")); //parry handled in takeDamage function

  BattleLog.addEntry(dungeonid, battleMessage);
}

;

function SAarmor(attacker, dungeonid) {
  attacker.armorBuff = true;
  var battleMessage = $("<span/>").addClass("logSpecial");
  battleMessage.html("".concat(logIcon("fas fa-user-shield"), " ").concat(logName(attacker.name), " stands their ground!")); //parry handled in takeDamage function

  BattleLog.addEntry(dungeonid, battleMessage);
}

function SAbloodLet(attacker, enemies, dungeonid) {
  var target = getTarget(enemies, attacker.target);
  attacker.damageCurrentPercent(95);
  var damage = attacker.getAdjPow(true) * 3;
  var battleMessage = $("<span/>").addClass("logSpecial");
  battleMessage.html("".concat(logIcon("fas fa-tired"), " ").concat(logName(attacker.name), " lets out a scream and attacks ").concat(logName(target.name), " for ").concat(logDmg(damage), "!"));
  BattleLog.addEntry(dungeonid, battleMessage);
  CombatManager.takeDamage(damage, target, attacker, dungeonid);
}

function SAravage(attacker, enemies, dungeonid) {
  var target = getTarget(enemies, attacker.target);
  var damage = Math.round(attacker.getAdjPow(true) * 1.5);
  var battleMessage = $("<span/>").addClass("logSpecial");
  battleMessage.html("".concat(logIcon("fas fa-fist-raised"), " Energy soars through ").concat(logName(attacker.name), " as they attack ").concat(logName(target.name), " for ").concat(logDmg(damage), "!"));
  BattleLog.addEntry(dungeonid, battleMessage);
  CombatManager.takeDamage(damage, target, attacker, dungeonid);

  if (target.dead()) {
    attacker.healPercent(15);
    var battleMessage2 = "<span class=\"logSpecial\"><i class=\"fas fa-heartbeat\"></i> <span class=\"logName\">".concat(attacker.name, "</span> feels rejuvinated after their kill!</span>");
    BattleLog.addEntry(dungeonid, battleMessage2);
  }
}

function SAblast(attacker, enemies, dungeonid) {
  var target = getTarget(enemies, attacker.target);
  target.ignoredArmor = true;
  var damage = Math.round(attacker.getAdjPow(true) * 1.5);
  var battleMessage = $("<span/>").addClass("logSpecial");
  battleMessage.html("".concat(logIcon("fas fa-fire-smoke"), " ").concat(logName(attacker.name), " unleashes a blast at ").concat(logName(target.name), " for ").concat(logDmg(damage), "!"));
  BattleLog.addEntry(dungeonid, battleMessage);
  CombatManager.takeDamage(damage, target, attacker, dungeonid);
}

;

function SAmeteor(attacker, enemies, dungeonid) {
  var damage = Math.round(attacker.getAdjPow(true) * 1.2);
  var targets = enemies.filter(function (e) {
    return !e.dead();
  });
  var dividedDmg = Math.round(damage / targets.length);
  var battleMessage = $("<span/>").addClass("logSpecial");
  battleMessage.html("".concat(logIcon("fas fa-meteor"), " ").concat(logName(attacker.name), " unleashes a meteor attack!"));
  BattleLog.addEntry(dungeonid, battleMessage);
  targets.forEach(function (enemy) {
    CombatManager.takeDamage(dividedDmg, enemy, attacker, dungeonid);
  });
}

function SAheal(attacker, allies, dungeonid) {
  var target = getTarget(allies, "lowMissingHp");
  var healamt = attacker.getAdjPow(true);
  var battleMessage = $("<span/>").addClass("logSpecial");
  battleMessage.html("".concat(logIcon("fas fa-heart-circle"), " ").concat(logName(attacker.name), " heals ").concat(logName(target.name), " for ").concat(logHeal(healamt), "!"));
  BattleLog.addEntry(dungeonid, battleMessage);
  target.heal(healamt);
}

function SAmassHeal(attacker, allies, dungeonid) {
  var healamt = Math.round(attacker.getAdjPow(true) * 0.8);
  var targets = allies.filter(function (a) {
    return !a.dead();
  });
  var dividedHeal = Math.round(healamt / targets.length);
  var battleMessage = $("<span/>").addClass("logSpecial");
  battleMessage.html("".concat(logIcon("fas fa-hands-heart"), " ").concat(logName(attacker.name), " heals everyone for ").concat(logHeal(healamt), "!"));
  BattleLog.addEntry(dungeonid, battleMessage);
  targets.forEach(function (ally) {
    ally.heal(dividedHeal);
  });
}

function SAsniper(attacker, enemies, dungeonid) {
  var target = getTarget(enemies, "lowhp");
  var damage = attacker.getAdjPow(true);
  var battleMessage = $("<span/>").addClass("logSpecial");
  battleMessage.html("".concat(logIcon("fas fa-bullseye-arrow"), " ").concat(logName(attacker.name), " snipes ").concat(logName(target.name), " for ").concat(logDmg(damage), "!"));
  BattleLog.addEntry(dungeonid, battleMessage);
  CombatManager.takeDamage(damage, target, attacker, dungeonid);
}

function SAdouble(attacker, enemies, dungeonid) {
  var target = getTarget(enemies, attacker.target);
  var damage = attacker.getAdjPow(true);
  var battleMessage = $("<span/>").addClass("logSpecial");
  battleMessage.html("".concat(logIcon("far fa-swords"), " ").concat(logName(attacker.name), " attacks ").concat(logName(target.name), " twice for ").concat(logDmg(damage), "!"));
  BattleLog.addEntry(dungeonid, battleMessage);
  CombatManager.takeDamage(damage, target, attacker, dungeonid);
  CombatManager.takeDamage(damage, target, attacker, dungeonid);
}

function SAamplify(attacker, enemies, dungeonid) {
  enemies.forEach(function (e) {
    return e.amplify = true;
  });
  var battleMessage = $("<span/>").addClass("logSpecial");
  battleMessage.html("".concat(logIcon("fas fa-flame"), " ").concat(logName(attacker.name), " amps it up!"));
  BattleLog.addEntry(dungeonid, battleMessage);
}

function SAstun(attacker, enemies, dungeonid) {
  var target = getTarget(enemies, attacker.target);
  target.stunned = true;
  var battleMessage = $("<span/>").addClass("logSpecial");
  battleMessage.html("".concat(logIcon("fas fa-bolt"), " ").concat(logName(attacker.name), " stuns ").concat(logName(target.name), "!"));
  BattleLog.addEntry(dungeonid, battleMessage);
}

function SAsecond(attacker, enemies, dungeonid) {
  var target = getTarget(enemies, "second");
  var damage = Math.round(attacker.getAdjPow(true) * 1.5);
  var battleMessage = $("<span/>").addClass("logSpecial");
  battleMessage.html("".concat(logIcon("fas fa-meteor"), " ").concat(logName(attacker.name), " unleashes an enhanced attack!"));
  BattleLog.addEntry(dungeonid, battleMessage);
  CombatManager.takeDamage(damage, target, attacker, dungeonid);
}

function SAbirdflame(attacker, enemies, dungeonid) {
  var battleMessage = $("<span/>").addClass("logSpecial");
  battleMessage.html("".concat(logIcon("fas fa-meteor"), " ").concat(logName(attacker.name), " unleashes a cool flaming bird attack!"));
  BattleLog.addEntry(dungeonid, battleMessage);

  for (var i = 0; i < 3; i++) {
    var target = getTarget(enemies, "random");
    var damage = attacker.getAdjPow();
    if (target === undefined) return;
    CombatManager.takeDamage(damage, target, attacker, dungeonid);
  }
}

function SAdefenseStance(attacker, dungeonid) {
  attacker.armor += 5;
  var battleMessage = $("<span/>").addClass("logSpecial");
  battleMessage.html("".concat(logIcon("fas fa-user-shield"), " The enemy ").concat(logName(attacker.name), " used Harden!")); //parry handled in takeDamage function

  BattleLog.addEntry(dungeonid, battleMessage);
}

function SAsummon(attacker, dungeonid) {
  DungeonManager.dungeonByID(dungeonid).addSummon();
  var battleMessage = $("<span/>").addClass("logSpecial");
  battleMessage.html("".concat(logIcon("fas fa-user-shield"), " ").concat(attacker.name, " summons some friends!"));
  BattleLog.addEntry(dungeonid, battleMessage);
}

function SAfear(attacker, enemies, dungeonid) {
  var target = getTarget(enemies, "random");
  target.fear = true;
  var battleMessage = $("<span/>").addClass("logSpecial");
  battleMessage.html("".concat(logIcon("fas fa-bolt"), " ").concat(logName(attacker.name), " strikes fear in the heart of ").concat(logName(target.name), "!"));
  BattleLog.addEntry(dungeonid, battleMessage);
}

function SAlowmaxHPStun(attacker, enemies, dungeonid) {
  var target = getTarget(enemies, "lowmaxHP");
  var damage = Math.round(attacker.getAdjPow() * 1.5);
  target.stunned = true;
  var battleMessage = $("<span/>").addClass("logSpecial");
  battleMessage.html("".concat(logIcon("fas fa-meteor"), " ").concat(logName(attacker.name), " wallops ").concat(logName(target.name), "!"));
  BattleLog.addEntry(dungeonid, battleMessage);
  CombatManager.takeDamage(damage, target, attacker, dungeonid);
}

function SAdefenseStancePlus(attacker, dungeonid) {
  attacker.armor += 5;
  attacker.enhance += 1;
  var battleMessage = $("<span/>").addClass("logSpecial");
  battleMessage.html("".concat(logIcon("fas fa-user-shield"), " The enemy ").concat(logName(attacker.name), " is charging!"));
  BattleLog.addEntry(dungeonid, battleMessage);
}

function SAsummon2(attacker, enemies, dungeonid) {
  DungeonManager.dungeonByID(dungeonid).addSummon2();
  var battleMessage = $("<span/>").addClass("logSpecial");
  battleMessage.html("".concat(logIcon("fas fa-user-shield"), " ").concat(attacker.name, " summons some bigger friends!"));
  BattleLog.addEntry(dungeonid, battleMessage);
}

function SAfearap(attacker, enemies, dungeonid) {
  var target = getTarget(enemies, "random");
  target.fear = true;
  target.ap = 0;
  var battleMessage = $("<span/>").addClass("logSpecial");
  battleMessage.html("".concat(logIcon("fas fa-bolt"), " ").concat(logName(attacker.name), " really strikes fear in the heart of ").concat(logName(target.name), "!"));
  BattleLog.addEntry(dungeonid, battleMessage);
}