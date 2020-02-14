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

var MobManager = {
  monsterDB: [],
  idCount: 0,
  addMob: function addMob(mob) {
    this.monsterDB.push(mob);
  },
  idToMob: function idToMob(id) {
    return this.monsterDB.find(function (mob) {
      return mob.id === id;
    });
  },
  getUniqueID: function getUniqueID() {
    this.idCount += 1;
    return this.idCount;
  },
  generateMob: function generateMob(mobID, dungeon) {
    disableEventLayers();
    var atk = dungeon.pow + dungeon.floor * dungeon.powGain;
    var hp = dungeon.hp + dungeon.floor * dungeon.hpGain;
    var mobTemplate = this.monsterDB.find(function (m) {
      return m.id === mobID;
    });
    var mob = new Mob(mobTemplate, atk, hp);
    MonsterHall.findMonster(mobID);
    console.log(mob);
    return mob;
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
  }

  _createClass(MobTemplate, [{
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

var Mob =
/*#__PURE__*/
function (_Combatant) {
  _inherits(Mob, _Combatant);

  function Mob(mobTemplate, atk, hp) {
    var _this;

    _classCallCheck(this, Mob);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Mob).call(this, mobTemplate));
    _this.pow = Math.floor(atk * _this.powMod);
    _this.hpmax = Math.floor(hp * _this.hpMod);
    _this.hp = _this.hpmax;
    _this.uniqueid = MobManager.getUniqueID();
    _this.playbook = PlaybookManager.generatePlayBookFromSkills(_this.skill1, _this.skill2, _this.skill3, _this.skill4);
    _this.passive = SkillManager.idToSkill(_this.passiveSkill);
    return _this;
  }

  _createClass(Mob, [{
    key: "createSave",
    value: function createSave() {
      var save = {};
      save.id = this.id;
      save.uniqueid = this.uniqueid;
      save.hp = this.hp;
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
      var _this2 = this;

      this.hp = save.hp;
      this.uniqueid = save.uniqueid;

      if (save.buffs !== undefined) {
        save.buffs.forEach(function (buff) {
          var newBuff = BuffManager.generateSaveBuff(buff.id, _this2, buff.power);
          newBuff.loadSave(buff);

          _this2.buffs.push(newBuff);
        });
      }

      this.state = save.state;
      adjustState(this);
    }
  }]);

  return Mob;
}(Combatant);

function adjustState(mob) {
  if (mob.state === "egg") {
    mob.image = '<img src="/assets/images/enemies/B902A.gif">';
    $("#mobImage" + mob.uniqueid).html(mob.image);
    mob.playbook = PlaybookManager.generatePlayBookFromSkills("SM902A", "SM902A", "SM902A", "SM902B");
  }
}
//# sourceMappingURL=mobs.js.map