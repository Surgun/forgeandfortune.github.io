"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var TargetType = Object.freeze({
  FIRST: 0,
  SECOND: 1,
  THIRD: 2,
  FOURTH: 3,
  RANDOM: 4,
  SELF: 5,
  ALLENEMIES: 6,
  ALLALLIES: 7
});
var CombatManager = {
  refreshLater: false,
  nextTurn: function nextTurn(dungeon) {
    var attacker = dungeon.order.nextTurn();
    var allies = attacker.unitType === "hero" ? dungeon.party.heroes : dungeon.mobs;
    var enemies = attacker.unitType === "hero" ? dungeon.mobs : dungeon.party.heroes;
    var attack = attacker.getSkill();
    var combatParams = new combatRoundParams(attacker, allies, enemies, attack, dungeon.id);
    this.execute(combatParams);
    dungeon.order.nextPosition();
  },
  execute: function execute(combatRound) {
    SkillManager.skillEffects[combatRound.attack.id](combatRound);
    combatRound.attacker.buffTick("onHitting");
  }
};

var combatRoundParams =
/*#__PURE__*/
function () {
  function combatRoundParams(attacker, allies, enemies, attack, dungeonid) {
    _classCallCheck(this, combatRoundParams);

    this.attacker = attacker;
    this.allies = allies;
    this.enemies = enemies;
    this.attack = attack;
    this.power = Math.floor(this.attacker.getPow() * this.attack.powMod + this.attacker.getTech() * this.attack.techMod);
    this.dungeonid = dungeonid;
  }

  _createClass(combatRoundParams, [{
    key: "getTarget",
    value: function getTarget(target) {
      var livingAllies = this.allies.filter(function (h) {
        return h.alive();
      });
      var livingEnemies = this.enemies.filter(function (h) {
        return h.alive();
      });
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

      if (target === TargetType.FOURTH) return [livingEnemies[livingEnemies.length - 1]];
      if (target === TargetType.RANDOM) return [livingEnemies[Math.floor(Math.random() * livingEnemies.length)]];
      if (target === TargetType.SELF) return [this.attacker];
      if (target === TargetType.ALLENEMIES) return livingEnemies;
      if (target === TargetType.ALLALLIES) return livingAllies;
    }
  }]);

  return combatRoundParams;
}();

var $drLog = $("#drLog");
var BattleLog = {
  log: [],
  addEntry: function addEntry(dungeonid, icon, m) {
    if (dungeonid !== DungeonManager.dungeonView) return;

    if (this.log.length >= 25) {
      this.log.shift();
    }

    this.log.push("".concat(icon, "&nbsp;&nbsp;").concat(m));
    if (CombatManager.refreshLater) return;
    this.refresh();
  },
  clear: function clear() {
    this.log = [];
    $drLog.empty();
  },
  refresh: function refresh() {
    $drLog.empty();
    this.log.forEach(function (m) {
      var d = $("<div/>").addClass("battleLog").html(m);
      $drLog.prepend(d);
    });
  }
};

var Combatant =
/*#__PURE__*/
function () {
  function Combatant(props) {
    _classCallCheck(this, Combatant);

    Object.assign(this, props);
    this.hp = 1;
    this.critDmg = 1.5;
    this.buffs = [];
    this.state = null;
  }

  _createClass(Combatant, [{
    key: "buffTick",
    value: function buffTick(type) {
      this.buffs.forEach(function (buff) {
        buff.buffTick(type);
      });
      this.buffs = this.buffs.filter(function (buff) {
        return !buff.expired();
      });
    }
  }, {
    key: "passiveCheck",
    value: function passiveCheck(type) {
      if (this.passiveSkill === null) return;
      SkillManager.idToSkill(this.passiveSkill).passiveCheck(type, this);
    }
  }, {
    key: "takeAttack",
    value: function takeAttack(attack) {
      battleText(attack, this);
      var reducedDmg = Math.floor(attack.power * this.getProtection());
      BattleLog.addEntry(attack.dungeonid, miscIcons.takeDamage, "".concat(this.name, " takes ").concat(reducedDmg, " damage"));
      this.hp = Math.max(this.hp - reducedDmg, 0);
      refreshHPBar(this);
      if (this.hp === 0) BattleLog.addEntry(attack.dungeonid, miscIcons.dead, "".concat(this.name, " has fallen!"));
      this.buffTick("onHit");
    }
  }, {
    key: "takeDamage",
    value: function takeDamage(dmg) {
      this.hp = Math.max(this.hp - dmg, 0);
      refreshHPBar(this);
    }
  }, {
    key: "hasBuff",
    value: function hasBuff(buffID) {
      return this.buffs.some(function (b) {
        return b.id === buffID;
      });
    }
  }, {
    key: "getBuff",
    value: function getBuff(buffID) {
      return this.buffs.find(function (b) {
        return b.id === buffID;
      });
    }
  }, {
    key: "getBuffStacks",
    value: function getBuffStacks(buffID) {
      if (!this.hasBuff(buffID)) return 0;
      return this.getBuff(buffID).stacks;
    }
  }, {
    key: "addBuff",
    value: function addBuff(buff) {
      this.buffs.push(buff);
      this.hp = Math.min(this.hp, this.maxHP());
    }
  }, {
    key: "removeBuff",
    value: function removeBuff(buffID) {
      this.buffs = this.buffs.filter(function (b) {
        return b.id !== buffID;
      });
    }
  }, {
    key: "getPow",
    value: function getPow() {
      return this.pow + this.getBuffPower();
    }
  }, {
    key: "getTech",
    value: function getTech() {
      return 0;
    }
  }, {
    key: "getProtection",
    value: function getProtection() {
      return 1 - (this.protection + this.getBuffProtection());
    }
  }, {
    key: "getAdjPow",
    value: function getAdjPow() {
      return this.getPow();
    }
  }, {
    key: "dead",
    value: function dead() {
      return this.hp <= 0;
    }
  }, {
    key: "alive",
    value: function alive() {
      return this.hp > 0;
    }
  }, {
    key: "maxHP",
    value: function maxHP() {
      return this.hpmax + this.getBuffMaxHP();
    }
  }, {
    key: "missingHP",
    value: function missingHP() {
      return this.maxHP() - this.hp;
    }
  }, {
    key: "heal",
    value: function heal(hp) {
      if (this.hp === 0) return;
      this.hp = Math.min(this.hp + hp, this.maxHP());
      if (!CombatManager.refreshLater) refreshHPBar(this);
    }
  }, {
    key: "healPercent",
    value: function healPercent(hpPercent) {
      if (this.hp === 0) return;
      this.hp += Math.floor(this.maxHP() * hpPercent / 100);
      this.hp = Math.min(this.maxHP(), this.hp);
      if (!CombatManager.refreshLater) refreshHPBar(this);
    }
  }, {
    key: "resetPlaybookPosition",
    value: function resetPlaybookPosition() {
      this.playbook.reset();
    }
  }, {
    key: "getSkill",
    value: function getSkill() {
      return this.playbook.nextSkill();
    }
  }, {
    key: "getActiveSkill",
    value: function getActiveSkill() {
      return this.playbook.skillCount();
    }
  }, {
    key: "getSkillIcons",
    value: function getSkillIcons() {
      return this.playbook.getSkillIcons();
    }
  }, {
    key: "getSkillIDs",
    value: function getSkillIDs() {
      return this.playbook.getSkillIDs();
    }
  }, {
    key: "getBuffProtection",
    value: function getBuffProtection() {
      var buffs = this.buffs.map(function (b) {
        return b.getProtection();
      });
      return buffs.reduce(function (a, b) {
        return a + b;
      }, 0);
    }
  }, {
    key: "getBuffPower",
    value: function getBuffPower() {
      var buffs = this.buffs.map(function (b) {
        return b.getPow();
      });
      return buffs.reduce(function (a, b) {
        return a + b;
      }, 0);
    }
  }, {
    key: "getBuffTech",
    value: function getBuffTech() {
      var buffs = this.buffs.map(function (b) {
        return b.getTech();
      });
      return buffs.reduce(function (a, b) {
        return a + b;
      }, 0);
    }
  }, {
    key: "getBuffMaxHP",
    value: function getBuffMaxHP() {
      var buffs = this.buffs.map(function (b) {
        return b.maxHP();
      });
      return buffs.reduce(function (a, b) {
        return a + b;
      }, 0);
    }
  }, {
    key: "buffCount",
    value: function buffCount() {
      return this.buffs.length;
    }
  }, {
    key: "debuffCount",
    value: function debuffCount() {
      return this.buffs.filter(function (b) {
        return b.type === "debuff";
      }).length;
    }
  }, {
    key: "removeBuffs",
    value: function removeBuffs() {
      var _this = this;

      this.buffs.forEach(function (buff) {
        BuffRefreshManager.removeBuff(buff, _this);
      });
      this.buffs = [];
      this.hp = Math.min(this.hp, this.maxHP());
    }
  }, {
    key: "removeDebuffs",
    value: function removeDebuffs() {
      var _this2 = this;

      this.buffs.forEach(function (buff) {
        if (buff.type === "debuff") BuffRefreshManager.removeBuff(buff, _this2);
      });
      this.buffs = this.buffs.filter(function (b) {
        return b.type !== "debuff";
      });
      this.hp = Math.min(this.hp, this.maxHP());
    }
  }, {
    key: "isChilled",
    value: function isChilled() {
      return this.buffs.some(function (b) {
        return b.isChilled();
      });
    }
  }]);

  return Combatant;
}();
//# sourceMappingURL=combat.js.map