"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var buffTemplate = function buffTemplate(props) {
  _classCallCheck(this, buffTemplate);

  Object.assign(this, props);
};

var Buff =
/*#__PURE__*/
function () {
  function Buff(buffTemplate, target, power) {
    _classCallCheck(this, Buff);

    Object.assign(this, buffTemplate);
    this.stacks = this.stackCast;
    this.target = target;
    this.power = power;
  }

  _createClass(Buff, [{
    key: "addCast",
    value: function addCast() {
      if (this.onCast === "refresh") {
        this.stacks = this.stackCast;
      } else if (this.onCast === "stack") {
        this.stacks = Math.min(this.stacks + this.stackCast, this.maxStack);
      }
    }
  }, {
    key: "createSave",
    value: function createSave() {
      var save = {};
      save.stacks = this.stacks;
      save.power = this.power;
      save.id = this.id;
      return save;
    }
  }, {
    key: "loadSave",
    value: function loadSave(save) {
      this.stacks = save.stacks;
    }
  }, {
    key: "buffTick",
    value: function buffTick(type) {
      if (type === "onTurn") this.onTick();
      if (type === "onHit") this.onHit();
      if (type === "onHitting") this.onHitting();
      if (type !== this.decrease) return;
      this.stacks -= 1;
      if (this.stacks <= 0) BuffRefreshManager.removeBuff(this, this.target);else BuffRefreshManager.updateBuffCount(this, this.target);
    }
  }, {
    key: "expired",
    value: function expired() {
      return this.stacks <= 0;
    }
  }, {
    key: "onTick",
    value: function onTick() {
      return;
    }
  }, {
    key: "onHit",
    value: function onHit() {
      return;
    }
  }, {
    key: "onHitting",
    value: function onHitting() {
      return;
    }
  }, {
    key: "getPow",
    value: function getPow() {
      return 0;
    }
  }, {
    key: "getTech",
    value: function getTech() {
      return 0;
    }
  }, {
    key: "isChilled",
    value: function isChilled() {
      return false;
    }
  }, {
    key: "getProtection",
    value: function getProtection() {
      return 0;
    }
  }, {
    key: "maxHP",
    value: function maxHP() {
      return 0;
    }
  }]);

  return Buff;
}();

var BuffManager = {
  buffDB: [],
  addBuffTemplate: function addBuffTemplate(buff) {
    this.buffDB.push(buff);
  },
  idToBuff: function idToBuff(buffID) {
    return this.buffDB.find(function (b) {
      return b.id === buffID;
    });
  },
  generateBuff: function generateBuff(buffID, target) {
    var power = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

    if (target.hasBuff(buffID)) {
      var _buff = target.getBuff(buffID);

      _buff.addCast();

      BuffRefreshManager.updateBuffCount(_buff, target);
      return;
    }

    var buffTemplate = this.idToBuff(buffID);
    var buff = new BuffLookup[buffID](buffTemplate, target, power);
    target.addBuff(buff);
    BuffRefreshManager.addBuff(buff, target);
  },
  removeBuff: function removeBuff(buffID, target) {
    if (!target.hasBuff(buffID)) return;
    var buff = target.getBuff(buffID);
    target.removeBuff(buffID);
    BuffRefreshManager.removeBuff(buff, target);
  },
  generateSaveBuff: function generateSaveBuff(buffID, target, power) {
    var buffTemplate = this.idToBuff(buffID);
    var buff = new BuffLookup[buffID](buffTemplate, target, power);
    return buff;
  }
};
var BuffRefreshManager = {
  //this is responsible for tracking and updating buffs so we don't have to!
  hardRefreshBuff: function hardRefreshBuff() {
    var _this = this;

    //populate the divs as they're supposed to be!
    var dungeon = DungeonManager.getCurrentDungeon();
    dungeon.party.heroes.forEach(function (ally) {
      var $heroDiv = $("#buffList" + ally.uniqueid);
      $heroDiv.empty();
      ally.buffs.forEach(function (buff) {
        _this.makeBuffContainer(buff, ally.uniqueid).appendTo($heroDiv);
      });
    });
    dungeon.mobs.forEach(function (enemy) {
      var $enemyDiv = $("#buffList" + enemy.uniqueid);
      $enemyDiv.empty();
      enemy.buffs.forEach(function (buff) {
        _this.makeBuffContainer(buff, enemy.uniqueid).appendTo($enemyDiv);
      });
    });
  },
  makeBuffContainer: function makeBuffContainer(buff, uniqueid) {
    var d1 = $("<div/>").addClass("buffContainer tooltip").attr("id", "bc" + uniqueid + buff.id).attr({
      "data-tooltip": "buff_desc",
      "data-tooltip-value": buff.id
    });
    ;
    $("<div/>").addClass("buffContainerIcon").html(buff.icon).appendTo(d1);
    $("<div/>").addClass("buffContainerCount").attr("id", "bcount" + uniqueid + buff.id).html(buff.stacks).appendTo(d1);
    return d1;
  },
  addBuff: function addBuff(buff, combatant) {
    var buffList = $("#buffList" + combatant.uniqueid);
    buffList.append(this.makeBuffContainer(buff, combatant.uniqueid));
  },
  updateBuffCount: function updateBuffCount(buff, combatant) {
    $("#bcount" + combatant.uniqueid + buff.id).html(buff.stacks);
  },
  removeBuff: function removeBuff(buff, combatant) {
    $("#bc" + combatant.uniqueid + buff.id).remove();
  }
};

var B0010 =
/*#__PURE__*/
function (_Buff) {
  _inherits(B0010, _Buff);

  function B0010(buffTemplate, target, power) {
    _classCallCheck(this, B0010);

    return _possibleConstructorReturn(this, _getPrototypeOf(B0010).call(this, buffTemplate, target, power));
  }

  _createClass(B0010, [{
    key: "getProtection",
    value: function getProtection() {
      return 0.5;
    }
  }]);

  return B0010;
}(Buff);

var B0020 =
/*#__PURE__*/
function (_Buff2) {
  _inherits(B0020, _Buff2);

  function B0020(buffTemplate, target, power) {
    _classCallCheck(this, B0020);

    return _possibleConstructorReturn(this, _getPrototypeOf(B0020).call(this, buffTemplate, target, power));
  }

  _createClass(B0020, [{
    key: "maxHP",
    value: function maxHP() {
      return this.power * this.stacks;
    }
  }]);

  return B0020;
}(Buff);

var B1010 =
/*#__PURE__*/
function (_Buff3) {
  _inherits(B1010, _Buff3);

  function B1010(buffTemplate, target, power) {
    _classCallCheck(this, B1010);

    return _possibleConstructorReturn(this, _getPrototypeOf(B1010).call(this, buffTemplate, target, power));
  }

  _createClass(B1010, [{
    key: "onHitting",
    value: function onHitting() {
      this.target.takeDamage(this.power);
    }
  }]);

  return B1010;
}(Buff);

var B1020 =
/*#__PURE__*/
function (_Buff4) {
  _inherits(B1020, _Buff4);

  function B1020(buffTemplate, target, power) {
    _classCallCheck(this, B1020);

    return _possibleConstructorReturn(this, _getPrototypeOf(B1020).call(this, buffTemplate, target, power));
  }

  _createClass(B1020, [{
    key: "isChilled",
    value: function isChilled() {
      return true;
    }
  }]);

  return B1020;
}(Buff);

var B2010 =
/*#__PURE__*/
function (_Buff5) {
  _inherits(B2010, _Buff5);

  function B2010(buffTemplate, target, power) {
    _classCallCheck(this, B2010);

    return _possibleConstructorReturn(this, _getPrototypeOf(B2010).call(this, buffTemplate, target, power));
  }

  _createClass(B2010, [{
    key: "getTech",
    value: function getTech() {
      return this.power;
    }
  }]);

  return B2010;
}(Buff);

var BM200 =
/*#__PURE__*/
function (_Buff6) {
  _inherits(BM200, _Buff6);

  function BM200(buffTemplate, target, power) {
    _classCallCheck(this, BM200);

    return _possibleConstructorReturn(this, _getPrototypeOf(BM200).call(this, buffTemplate, target, power));
  }

  _createClass(BM200, [{
    key: "getProtection",
    value: function getProtection() {
      return 1;
    }
  }]);

  return BM200;
}(Buff);

var BM902 =
/*#__PURE__*/
function (_Buff7) {
  _inherits(BM902, _Buff7);

  function BM902(buffTemplate, target, power) {
    _classCallCheck(this, BM902);

    return _possibleConstructorReturn(this, _getPrototypeOf(BM902).call(this, buffTemplate, target, power));
  }

  _createClass(BM902, [{
    key: "onHitting",
    value: function onHitting() {
      this.target.takeDamage(this.power * this.stacks);
    }
  }]);

  return BM902;
}(Buff);

var BM902A =
/*#__PURE__*/
function (_Buff8) {
  _inherits(BM902A, _Buff8);

  function BM902A(buffTemplate, target, power) {
    _classCallCheck(this, BM902A);

    return _possibleConstructorReturn(this, _getPrototypeOf(BM902A).call(this, buffTemplate, target, power));
  }

  _createClass(BM902A, [{
    key: "getProtection",
    value: function getProtection() {
      return 0.75;
    }
  }]);

  return BM902A;
}(Buff);

var BM902B =
/*#__PURE__*/
function (_Buff9) {
  _inherits(BM902B, _Buff9);

  function BM902B(buffTemplate, target, power) {
    _classCallCheck(this, BM902B);

    return _possibleConstructorReturn(this, _getPrototypeOf(BM902B).call(this, buffTemplate, target, power));
  }

  _createClass(BM902B, [{
    key: "maxHP",
    value: function maxHP() {
      return -Math.floor(this.target.hpmax / 10) * this.stacks;
    }
  }]);

  return BM902B;
}(Buff);

var BuffLookup = {
  B0010: B0010,
  B0020: B0020,
  B1010: B1010,
  B1020: B1020,
  B2010: B2010,
  BM200: BM200,
  BM902: BM902,
  BM902A: BM902A,
  BM902B: BM902B
};