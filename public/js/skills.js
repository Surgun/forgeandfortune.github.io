"use strict";

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SkillManager = {
  skills: [],
  skillEffects: [],
  addSkill: function addSkill(skill) {
    this.skills.push(skill);
  },
  idToSkill: function idToSkill(id) {
    return this.skills.find(function (skill) {
      return skill.id === id;
    });
  }
};
var PlaybookManager = {
  playbookDB: [],
  addPlaybookTemplate: function addPlaybookTemplate(pb) {
    this.playbookDB.push(pb);
  },
  idToPlaybook: function idToPlaybook(id) {
    return this.playbookDB.find(function (playbook) {
      return playbook.id === id;
    });
  },
  generatePlayBook: function generatePlayBook(playbookID) {
    var playbookTemplate = this.idToPlaybook(playbookID);
    return new Playbook(playbookTemplate);
  },
  generatePlayBookFromSkills: function generatePlayBookFromSkills(s1, s2, s3, s4) {
    var skills = {
      skill1: s1,
      skill2: s2,
      skill3: s3,
      skill4: s4
    };
    return new Playbook(skills);
  }
};

var playBookTemplate = function playBookTemplate(props) {
  _classCallCheck(this, playBookTemplate);

  Object.assign(this, props);
};

var Skill =
/*#__PURE__*/
function () {
  function Skill(props) {
    _classCallCheck(this, Skill);

    Object.assign(this, props);
    this.powerPercent = (props.powMod * 100).toString() + "%";
    this.techPercent = (props.techMod * 100).toString() + "%";
  }

  _createClass(Skill, [{
    key: "passiveCheck",
    value: function passiveCheck(type, target) {
      SkillManager.skillEffects[this.id](type, target);
    }
  }]);

  return Skill;
}();

var Playbook =
/*#__PURE__*/
function () {
  function Playbook(pbTemplate) {
    _classCallCheck(this, Playbook);

    Object.assign(this, pbTemplate);
    this.skills = [SkillManager.idToSkill(pbTemplate.skill1), SkillManager.idToSkill(pbTemplate.skill2), SkillManager.idToSkill(pbTemplate.skill3), SkillManager.idToSkill(pbTemplate.skill4)];
    this.position = 0;
  }

  _createClass(Playbook, [{
    key: "reset",
    value: function reset() {
      this.position = 0;
    }
  }, {
    key: "nextSkill",
    value: function nextSkill() {
      var skill = this.skills[this.position];
      this.position += 1;
      if (this.position >= 4) this.position = 0;
      return skill;
    }
  }, {
    key: "getSkillIcons",
    value: function getSkillIcons() {
      return this.skills.map(function (s) {
        return s.icon;
      });
    }
  }, {
    key: "getSkillIDs",
    value: function getSkillIDs() {
      return this.skills.map(function (s) {
        return s.id;
      });
    }
  }, {
    key: "skillCount",
    value: function skillCount() {
      return this.position;
    }
  }]);

  return Playbook;
}();

function battleText(combatParams, target) {
  var battleTextEdit = combatParams.attack.bText.replace("#ATTACKER#", combatParams.attacker.name);
  battleTextEdit = battleTextEdit.replace("#DEFENDER#", target.name);
  battleTextEdit = battleTextEdit.replace("#DAMAGE#", combatParams.power);
  BattleLog.addEntry(combatParams.dungeonid, combatParams.attack.icon, battleTextEdit);
}

SkillManager.skillEffects['S0000'] = function (combatParams) {
  //Regular Attack
  var targets = combatParams.getTarget(TargetType.FIRST);
  targets.forEach(function (target) {
    target.takeAttack(combatParams);
  });
}; //------------------//
//    HERO SKILLS   //
//------------------//


SkillManager.skillEffects['S0010'] = function (combatParams) {
  //Reinforce - Beorn
  var targets = combatParams.getTarget(TargetType.SELF);
  targets.forEach(function (target) {
    return BuffManager.generateBuff('B0010', target);
  });
};

SkillManager.skillEffects['S0020'] = function (combatParams) {
  //Toughen - Cedric
  var targets = combatParams.getTarget(TargetType.SELF);
  targets.forEach(function (target) {
    if (target.getBuffStacks('B0020') === 5) return;
    BuffManager.generateBuff('B0020', target, combatParams.power);
    target.heal(combatParams.power);
    refreshHPBar(target);
  });
};

SkillManager.skillEffects['S1010'] = function (combatParams) {
  //Meteor - Zoe
  var targets = combatParams.getTarget(TargetType.ALLENEMIES);
  targets.forEach(function (target) {
    target.takeAttack(combatParams);
    BuffManager.generateBuff("B1010", target, Math.floor(combatParams.power / 10));
  });
};

SkillManager.skillEffects['S1020'] = function (combatParams) {
  //Frost Strike - Neve
  var targets = combatParams.getTarget(TargetType.FIRST);
  var originalPower = combatParams.power;
  targets.forEach(function (target) {
    if (target.isChilled()) {
      combatParams.power = Math.floor(2.5 * originalPower);
      target.takeAttack(combatParams);
    } else {
      target.takeAttack(combatParams);
      BuffManager.generateBuff("B1020", target, 0);
    }
  });
};

SkillManager.skillEffects['S2010'] = function (combatParams) {
  //Inspiration - Alok
  var targets = combatParams.getTarget(TargetType.ALLALLIES);
  targets.forEach(function (target) {
    BuffManager.generateBuff("B2010", target, Math.floor(combatParams.power));
  });
};

SkillManager.skillEffects['S2030'] = function (combatParams) {
  //Double Tap - Revere
  var targets = combatParams.getTarget(TargetType.FIRST);
  targets.forEach(function (target) {
    target.takeAttack(combatParams);
    target.takeAttack(combatParams);
  });
}; //------------------//
//     MOB SKILLS   //
//------------------//


SkillManager.skillEffects['SM100'] = function (combatParams) {
  //swift strike - Elf Adventurer
  var targets = combatParams.getTarget(TargetType.FIRST);
  targets.forEach(function (target) {
    return target.takeAttack(combatParams);
  });
  var secondaryTargets = combatParams.getTarget(TargetType.ALLALLIES);
  secondaryTargets.forEach(function (target) {
    return target.heal(combatParams.power);
  });
};

SkillManager.skillEffects['SM101'] = function (combatParams) {
  //Green Ooze - Regenerate
  var targets = combatParams.getTarget(TargetType.SELF);
  targets.forEach(function (target) {
    return target.heal(combatParams.power);
  });
};

SkillManager.skillEffects['SM200'] = function (combatParams) {
  //Translucent - Blinkie
  var targets = combatParams.getTarget(TargetType.SELF);
  targets.forEach(function (target) {
    BuffManager.generateBuff('BM200', target, combatParams.power);
  });
};

SkillManager.skillEffects['SM201'] = function (combatParams) {
  //Purge - Earth Shaman
  var targets = combatParams.getTarget(TargetType.ALLALLIES);
  var debuffCount = targets.reduce(function (a, b) {
    return a + b.debuffCount();
  }, 0);
  var originalPower = combatParams.power;
  targets.forEach(function (target) {
    target.removeDebuffs();
  });

  if (debuffCount > 0) {
    var targets2 = combatParams.getTarget(TargetType.FIRST);
    combatParams.power = originalPower * debuffCount;
    targets2.forEach(function (target) {
      target.takeAttack(combatParams);
    });
  }
};

SkillManager.skillEffects['SM300'] = function (combatParams) {
  //Ray Gun - Dusty Alien
  var targets = combatParams.getTarget(TargetType.FIRST);
  targets.forEach(function (target) {
    target.takeAttack(combatParams);
  });
};

SkillManager.skillEffects['SM301'] = function (combatParams) {
  //Crab Hammer - Crusty Crab
  var targets = combatParams.getTarget(TargetType.FIRST);
  targets.forEach(function (target) {
    combatParams.power = Math.floor(target.maxHP() * 0.25);
    target.takeAttack(combatParams);
  });
}; //------------------//
//    BOSS SKILLS   //
//------------------//


SkillManager.skillEffects['SM901'] = function (combatParams) {
  //Tree Wallop - Loathing Oak
  var targets = combatParams.getTarget(TargetType.SECOND);
  targets.forEach(function (target) {
    target.takeAttack(combatParams);
  });
};

SkillManager.skillEffects['SM902'] = function (combatParams) {
  //Phoenix Fire - Phoenix
  var targets = combatParams.getTarget(TargetType.ALLENEMIES);
  targets.forEach(function (target) {
    target.takeAttack(combatParams);
    BuffManager.generateBuff('BM902', target, combatParams.power);
  });
};

SkillManager.skillEffects['SM902A'] = function (combatParams) {//lol it does nothing
};

SkillManager.skillEffects['SM902B'] = function (combatParams) {
  var target = combatParams.getTarget(TargetType.SELF)[0];
  target.state = null;
  target.image = '<img src="/assets/images/enemies/B902.gif">';
  $("#mobImage" + target.uniqueid).html(target.image);
  target.playbook = PlaybookManager.generatePlayBookFromSkills(target.skill1, target.skill2, target.skill3, target.skill4);
  refreshSkillUnit(target);
  BuffManager.removeBuff('BM902A', target);
  BuffManager.generateBuff('BM902B', target, 0);
  target.healPercent(100);
}; //--------------------//
//   PASSIVE SKILLS   //
//--------------------//


SkillManager.skillEffects['SMP902'] = function (type, target) {
  //Rising Phoenix - Phoenix
  if (type !== "onTurn") return;
  if (target.hp > target.maxHP() / 4 || target.state !== null) return;
  target.state = "egg";
  target.image = '<img src="/assets/images/enemies/B902A.gif">';
  $("#mobImage" + target.uniqueid).html(target.image);
  target.playbook = PlaybookManager.generatePlayBookFromSkills("SM902A", "SM902A", "SM902A", "SM902B");
  refreshSkillUnit(target);
  BuffManager.generateBuff('BM902A', target, 0);
};
//# sourceMappingURL=skills.js.map