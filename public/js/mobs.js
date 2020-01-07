"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var MobManager = {
  monsterDB: [],
  activeMobs: [],
  idCount: 0,
  addMob: function addMob(mob) {
    this.monsterDB.push(mob);
    this.unitType = "mob";
  },
  idToMob: function idToMob(id) {
    return this.monsterDB.find(function (mob) {
      return mob.id === id;
    });
  },
  generateDungeonMob: function generateDungeonMob(mobID, difficulty, multiplier) {
    disableEventLayers();
    var mobTemplate = this.monsterDB.find(function (m) {
      return m.id === mobID;
    });
    var mob = new Mob(difficulty, mobTemplate, multiplier);
    return mob;
  },
  getUniqueID: function getUniqueID() {
    this.idCount += 1;
    return this.idCount;
  },
  generateDungeonFloor: function generateDungeonFloor(floor, floorNum, bossMultiplier) {
    var _this = this;

    var mobFloor = [];
    floor.mobs.forEach(function (mob) {
      mobFloor.push(_this.generateDungeonMob(mob, floorNum, bossMultiplier));
      MonsterHall.findMonster(mob);
    });
    return mobFloor;
  },
  allMobDropsByDungeon: function allMobDropsByDungeon(dungeonID) {
    var floors = FloorManager.floorsByDungeon(dungeonID);
    var materials = floors.map(function (f) {
      return f.mat;
    });
    return _toConsumableArray(new Set(materials));
  }
};

var MobTemplate =
/*#__PURE__*/
function () {
  function MobTemplate(props) {
    _classCallCheck(this, MobTemplate);

    Object.assign(this, props);
    this.image = '<img src="/assets/images/enemies/' + this.id + '.gif">';
    this.head = '<img src="/assets/images/enemies/heads/' + this.id + '.png">';
  } //used in the monster hall


  _createClass(MobTemplate, [{
    key: "getHPForFloor",
    value: function getHPForFloor(floor) {
      var hpFloor = this.event === "normal" ? DungeonManager.getHpFloor(floor) : 1;
      return this.hpMod * hpFloor;
    }
  }, {
    key: "getPOWForFloor",
    value: function getPOWForFloor(floor) {
      var powFloor = this.event === "normal" ? DungeonManager.getPowFloor(floor) : 1;
      return this.powMod * powFloor;
    }
  }, {
    key: "getSkillIDs",
    value: function getSkillIDs() {
      return [this.skill1, this.skill2, this.skill3, this.skill4];
    }
  }, {
    key: "getSkillIcons",
    value: function getSkillIcons() {
      return [SkillManager.idToSkill(this.skill1).icon, SkillManager.idToSkill(this.skill2).icon, SkillManager.idToSkill(this.skill3).icon, SkillManager.idToSkill(this.skill4).icon];
    }
  }]);

  return MobTemplate;
}();

var FloorTemplate = function FloorTemplate(props) {
  _classCallCheck(this, FloorTemplate);

  Object.assign(this, props);
};

var FloorManager = {
  floors: [],
  addFloor: function addFloor(floor) {
    this.floors.push(floor);
  },
  floorByID: function floorByID(id) {
    return this.floors.find(function (f) {
      return f.id === id;
    });
  },
  getFloor: function getFloor(dungeon, floor) {
    var possibleFloors = this.floors.filter(function (f) {
      return f.dungeon === dungeon && f.minFloor <= floor && f.maxFloor >= floor;
    });
    var rand = DungeonSeedManager.getFloorSeed(dungeon, floor);
    return possibleFloors[Math.floor(rand * possibleFloors.length)];
  },
  mobsByDungeon: function mobsByDungeon(dungeonid) {
    var floors = this.floors.filter(function (f) {
      return f.dungeon === dungeonid;
    });
    var mobs = flattenArray(floors.map(function (f) {
      return f.mobs;
    }));
    return _toConsumableArray(new Set(mobs));
  },
  mobsByDungeons: function mobsByDungeons(dungeonArray) {
    var floors = this.floors.filter(function (f) {
      return dungeonArray.includes(f.dungeon);
    });
    var mobs = flattenArray(floors.map(function (f) {
      return f.mobs;
    }));
    return _toConsumableArray(new Set(mobs));
  },
  dungeonNameByMob: function dungeonNameByMob(mobID) {
    var floors = this.floors.filter(function (f) {
      return f.mobs.includes(mobID);
    });

    var uniqueDungeons = _toConsumableArray(new Set(floors.map(function (f) {
      return f.dungeon;
    })));

    return DungeonManager.dungeonByID(uniqueDungeons[0]).name;
  },
  floorRangeByMob: function floorRangeByMob(mobID) {
    var floors = this.floors.filter(function (f) {
      return f.mobs.includes(mobID);
    });
    console.log(floors);
    var maxFloor = floors.map(function (f) {
      return f.maxFloor;
    });
    var minFloor = floors.map(function (f) {
      return f.minFloor;
    });
    return {
      "min": Math.min.apply(Math, _toConsumableArray(minFloor)),
      "max": Math.max.apply(Math, _toConsumableArray(maxFloor))
    };
  },
  floorsByDungeon: function floorsByDungeon(dungeonID) {
    return this.floors.filter(function (f) {
      return f.dungeon === dungeonID;
    });
  },
  rewards: function rewards(floorID) {
    var floor = this.floorByID(floorID);
    return new idAmt(floor.material, floor.amt);
  }
};

var Mob =
/*#__PURE__*/
function (_Combatant) {
  _inherits(Mob, _Combatant);

  function Mob(lvl, mobTemplate) {
    var _this2;

    var difficulty = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

    _classCallCheck(this, Mob);

    _this2 = _possibleConstructorReturn(this, _getPrototypeOf(Mob).call(this, mobTemplate));
    _this2.lvl = lvl;
    _this2.difficulty = difficulty;
    var powFloor = mobTemplate.event === "normal" ? DungeonManager.getPowFloor(lvl) : 1;
    var hpFloor = mobTemplate.event === "normal" ? DungeonManager.getHpFloor(lvl) : 1;
    _this2.pow = Math.floor(powFloor * _this2.powMod * Math.pow(miscLoadedValues.bossMultiplier, difficulty));
    _this2.hpmax = Math.floor(hpFloor * _this2.hpMod * Math.pow(miscLoadedValues.bossMultiplier, difficulty));
    _this2.hp = _this2.hpmax;
    _this2.uniqueid = MobManager.getUniqueID();
    _this2.playbook = PlaybookManager.generatePlayBookFromSkills(_this2.skill1, _this2.skill2, _this2.skill3, _this2.skill4);
    _this2.passive = SkillManager.idToSkill(_this2.passiveSkill);
    return _this2;
  }

  _createClass(Mob, [{
    key: "createSave",
    value: function createSave() {
      var save = {};
      save.lvl = this.lvl;
      save.id = this.id;
      save.uniqueid = this.uniqueid;
      save.hp = this.hp;
      save.difficulty = this.difficulty;
      save.buffs = [];
      this.buffs.forEach(function (buff) {
        save.buffs.push(buff.createSave());
      });
      save.state = this.state;
      return save;
    }
  }, {
    key: "loadSave",
    value: function loadSave(save) {
      var _this3 = this;

      this.hp = save.hp;
      this.uniqueid = save.uniqueid;

      if (save.buffs !== undefined) {
        save.buffs.forEach(function (buff) {
          var newBuff = BuffManager.generateSaveBuff(buff.id, _this3, buff.power);
          newBuff.loadSave(buff);

          _this3.buffs.push(newBuff);
        });
      }

      this.state = save.state;
      adjustState(this);
    }
  }]);

  return Mob;
}(Combatant);

function adjustState(mob) {
  console.log(mob);

  if (mob.state === "egg") {
    mob.image = '<img src="/assets/images/enemies/B902A.gif">';
    $("#mobImage" + mob.uniqueid).html(mob.image);
    console.log(mob.uniqueid);
    mob.playbook = PlaybookManager.generatePlayBookFromSkills("SM902A", "SM902A", "SM902A", "SM902B");
  }
}