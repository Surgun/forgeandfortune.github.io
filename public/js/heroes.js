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

var floorTracker =
/*#__PURE__*/
function () {
  function floorTracker(d001, d002, d003) {
    _classCallCheck(this, floorTracker);

    this.d001 = d001;
    this.d002 = d002;
    this.d003 = d003;
  }

  _createClass(floorTracker, [{
    key: "createSave",
    value: function createSave() {
      var save = {};
      save.d001 = this.d001;
      save.d002 = this.d002;
      save.d003 = this.d003;
      return save;
    }
  }, {
    key: "loadSave",
    value: function loadSave(save) {
      if (save.d001) this.d001 = save.d001;
      if (save.d002) this.d002 = save.d002;
      if (save.d003) this.d003 = save.d003;
    }
  }, {
    key: "setMax",
    value: function setMax(id, floor) {
      if (id === "D001") this.d001 = Math.max(this.d001, floor);
      if (id === "D002") this.d002 = Math.max(this.d002, floor);
      if (id === "D003") this.d003 = Math.max(this.d003, floor);
    }
  }, {
    key: "getMax",
    value: function getMax(id) {
      if (id === "D001") return this.d001;
      if (id === "D002") return this.d002;
      if (id === "D003") return this.d003;
      return 1;
    }
  }]);

  return floorTracker;
}();

var Hero =
/*#__PURE__*/
function (_Combatant) {
  _inherits(Hero, _Combatant);

  function Hero(props) {
    var _this;

    _classCallCheck(this, Hero);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Hero).call(this, props));
    _this.uniqueid = _this.id;
    _this.hp = _this.initialHP;
    _this.pow = _this.initialPow;
    _this.critdmg = 1.5;
    _this.unitType = "hero";
    _this.slot1 = null;
    _this.slot2 = null;
    _this.slot3 = null;
    _this.slot4 = null;
    _this.slot5 = null;
    _this.slot6 = null;
    _this.slot7 = null;
    _this.image = '<img src="/assets/images/heroes/' + _this.id + '.gif">';
    _this.head = '<img src="/assets/images/heroes/heads/' + _this.id + '.png">';
    _this.owned = false;
    _this.inDungeon = false;
    _this.protection = 0;
    _this.playbook = PlaybookManager.generatePlayBook(_this.playbookTemplate);
    _this.passiveSkill = null;
    _this.floorTracker = new floorTracker(1, 1, 1);
    return _this;
  }

  _createClass(Hero, [{
    key: "createSave",
    value: function createSave() {
      var save = {};
      save.id = this.id;
      save.hp = this.hp;
      save.inDungeon = this.inDungeon;
      if (this.slot1 === null) save.slot1 = null;else save.slot1 = this.slot1.createSave();
      if (this.slot2 === null) save.slot2 = null;else save.slot2 = this.slot2.createSave();
      if (this.slot3 === null) save.slot3 = null;else save.slot3 = this.slot3.createSave();
      if (this.slot4 === null) save.slot4 = null;else save.slot4 = this.slot4.createSave();
      if (this.slot5 === null) save.slot5 = null;else save.slot5 = this.slot5.createSave();
      if (this.slot6 === null) save.slot6 = null;else save.slot6 = this.slot6.createSave();
      if (this.slot7 === null) save.slot7 = null;else save.slot7 = this.slot7.createSave();
      save.owned = this.owned;
      save.buffs = [];
      this.buffs.forEach(function (buff) {
        save.buffs.push(buff.createSave());
      });
      save.floorTracker = this.floorTracker.createSave();
      return save;
    }
  }, {
    key: "loadSave",
    value: function loadSave(save) {
      var _this2 = this;

      this.hp = save.hp;
      this.inDungeon = save.inDungeon;

      if (save.slot1 !== null) {
        this.slot1 = new itemContainer(save.slot1.id, save.slot1.rarity);
        this.slot1.loadSave(save.slot1);
      }

      if (save.slot2 !== null) {
        this.slot2 = new itemContainer(save.slot2.id, save.slot2.rarity);
        this.slot2.loadSave(save.slot2);
      }

      if (save.slot3 !== null) {
        this.slot3 = new itemContainer(save.slot3.id, save.slot3.rarity);
        this.slot3.loadSave(save.slot3);
      }

      if (save.slot4 !== null) {
        this.slot4 = new itemContainer(save.slot4.id, save.slot4.rarity);
        this.slot4.loadSave(save.slot4);
      }

      if (save.slot5 !== null) {
        this.slot5 = new itemContainer(save.slot5.id, save.slot5.rarity);
        this.slot5.loadSave(save.slot5);
      }

      if (save.slot6 !== null) {
        this.slot6 = new itemContainer(save.slot6.id, save.slot6.rarity);
        this.slot6.loadSave(save.slot6);
      }

      if (save.slot7 !== null && save.slot7 !== undefined) {
        this.slot7 = new itemContainer(save.slot7.id, save.slot7.rarity);
        this.slot7.loadSave(save.slot7);
      }

      if (save.buffs !== undefined) {
        save.buffs.forEach(function (buff) {
          var newBuff = BuffManager.generateSaveBuff(buff.id, _this2, buff.power);
          newBuff.loadSave(buff);

          _this2.buffs.push(newBuff);
        });
      }

      this.owned = save.owned;
      if (save.floorTracker) this.floorTracker.loadSave(save.floorTracker);
    }
  }, {
    key: "getPow",
    value: function getPow() {
      var slots = this.getEquipSlots(true).map(function (s) {
        return s.pow();
      });
      var powerFromGear = slots.length === 0 ? 0 : slots.reduce(function (a, b) {
        return a + b;
      });
      return this.initialPow + powerFromGear + this.getBuffPower();
    }
  }, {
    key: "maxHP",
    value: function maxHP() {
      var slots = this.getEquipSlots(true).map(function (s) {
        return s.hp();
      });
      var hpFromGear = slots.length === 0 ? 0 : slots.reduce(function (a, b) {
        return a + b;
      });
      return this.initialHP + hpFromGear + this.getBuffMaxHP();
    }
  }, {
    key: "getTech",
    value: function getTech() {
      var slots = this.getEquipSlots(true).map(function (s) {
        return s.tech();
      });
      if (slots.length === 0) return 0;
      return slots.reduce(function (a, b) {
        return a + b;
      });
    }
  }, {
    key: "getAdjPow",
    value: function getAdjPow(tech) {
      if (tech) return Math.floor(this.getPow() + this.getTech());
      return Math.floor(this.getPow());
    }
  }, {
    key: "getPowSlot",
    value: function getPowSlot(slot) {
      var slots = this.getEquipSlots();
      if (slots[slot] === null) return 0;
      return slots[slot].pow();
    }
  }, {
    key: "getHPSlot",
    value: function getHPSlot(slot) {
      var slots = this.getEquipSlots();
      if (slots[slot] === null) return 0;
      return slots[slot].hp();
    }
  }, {
    key: "getEquipSlots",
    value: function getEquipSlots(nonblank) {
      //return an object with 
      var slots = [this.slot1, this.slot2, this.slot3, this.slot4, this.slot5, this.slot6, this.slot7];
      if (!nonblank) return slots;
      return slots.filter(function (s) {
        return s !== null;
      });
    }
  }, {
    key: "equip",
    value: function equip(item, slot) {
      if (slot === 0) this.slot1 = item;
      if (slot === 1) this.slot2 = item;
      if (slot === 2) this.slot3 = item;
      if (slot === 3) this.slot4 = item;
      if (slot === 4) this.slot5 = item;
      if (slot === 5) this.slot6 = item;
      if (slot === 6) this.slot7 = item;
    }
  }, {
    key: "removeSlot",
    value: function removeSlot(slot) {
      if (slot === 0) this.slot1 = null;
      if (slot === 1) this.slot2 = null;
      if (slot === 2) this.slot3 = null;
      if (slot === 3) this.slot4 = null;
      if (slot === 4) this.slot5 = null;
      if (slot === 5) this.slot6 = null;
      if (slot === 6) this.slot7 = null;
    }
  }, {
    key: "slotTypesByNum",
    value: function slotTypesByNum(num) {
      return this.getSlotTypes()[num];
    }
  }, {
    key: "getSlotTypes",
    value: function getSlotTypes() {
      return [this.slot1Type, this.slot2Type, this.slot3Type, this.slot4Type, this.slot5Type, this.slot6Type, this.slot7Type];
    }
  }, {
    key: "slotTypeIcons",
    value: function slotTypeIcons(num) {
      var s = "";
      this.slotTypesByNum(num).forEach(function (slot) {
        s += slot.toUpperCase() + "<br>";
      });
      return s;
    }
  }, {
    key: "slotEmpty",
    value: function slotEmpty(slot) {
      return this.getEquipSlots()[slot] === null;
    }
  }, {
    key: "getSlot",
    value: function getSlot(slot) {
      return this.getEquipSlots()[slot];
    }
  }, {
    key: "unequip",
    value: function unequip(slot) {
      if (Inventory.full()) {
        Notifications.inventoryFull();
        return;
      }

      var item = this.getSlot(slot);
      if (item === null) return;
      this.removeSlot(slot);
      Inventory.addToInventory(item);
    }
  }, {
    key: "currenEquipByType",
    value: function currenEquipByType(type) {
      if (this.slot1Type.includes(type)) return this.slot1;
      if (this.slot2Type.includes(type)) return this.slot2;
      if (this.slot3Type.includes(type)) return this.slot3;
      if (this.slot4Type.includes(type)) return this.slot4;
      if (this.slot5Type.includes(type)) return this.slot5;
      if (this.slot6Type.includes(type)) return this.slot6;
      if (this.slot7Type.includes(type)) return this.slot7;
      return null;
    }
  }, {
    key: "hasEquip",
    value: function hasEquip(type) {
      if (this.slot1Type.includes(type)) return this.slot1 !== null;
      if (this.slot2Type.includes(type)) return this.slot2 !== null;
      if (this.slot3Type.includes(type)) return this.slot3 !== null;
      if (this.slot4Type.includes(type)) return this.slot4 !== null;
      if (this.slot5Type.includes(type)) return this.slot5 !== null;
      if (this.slot6Type.includes(type)) return this.slot6 !== null;
      if (this.slot7Type.includes(type)) return this.slot7 !== null;
    }
  }, {
    key: "typeToSlot",
    value: function typeToSlot(type) {
      if (this.slot1Type.includes(type)) return 0;
      if (this.slot2Type.includes(type)) return 1;
      if (this.slot3Type.includes(type)) return 2;
      if (this.slot4Type.includes(type)) return 3;
      if (this.slot5Type.includes(type)) return 4;
      if (this.slot6Type.includes(type)) return 5;
      if (this.slot7Type.includes(type)) return 6;
    }
  }, {
    key: "equipUpgradeAvailable",
    value: function equipUpgradeAvailable(slot) {
      var types = this.slotTypesByNum(slot);
      var currentPow = this.getPowSlot(slot);
      var currentHP = this.getHPSlot(slot);
      var invMaxPow = Inventory.getMaxPowByTypes(types);
      var invMaxHP = Inventory.getMaxHPByTypes(types);
      return invMaxPow > currentPow || invMaxHP > currentHP;
    }
  }, {
    key: "canEquipType",
    value: function canEquipType(type) {
      return this.slot1Type.includes(type) || this.slot2Type.includes(type) || this.slot3Type.includes(type) || this.slot4Type.includes(type) || this.slot5Type.includes(type) || this.slot6Type.includes(type) || this.slot7Type.includes(type);
    }
  }, {
    key: "getMax",
    value: function getMax(dungeonID) {
      return this.floorTracker.getMax(dungeonID);
    }
  }, {
    key: "setMax",
    value: function setMax(id, floor) {
      this.floorTracker.setMax(id, floor);
    }
  }]);

  return Hero;
}(Combatant);

var HeroManager = {
  heroes: [],
  heroView: null,
  tabSelected: "heroTab1",
  addHero: function addHero(hero) {
    this.heroes.push(hero);
  },
  createSave: function createSave() {
    var save = [];
    this.heroes.forEach(function (h) {
      save.push(h.createSave());
    });
    return save;
  },
  loadSave: function loadSave(save) {
    var _this3 = this;

    save.forEach(function (h) {
      var hero = _this3.idToHero(h.id);

      hero.loadSave(h);
    });
  },
  heroOwned: function heroOwned(ID) {
    return this.idToHero(ID).owned;
  },
  idToHero: function idToHero(ID) {
    return this.heroes.find(function (hero) {
      return hero.id === ID;
    });
  },
  isHeroID: function isHeroID(ID) {
    return this.heroes.some(function (hero) {
      return hero.id === ID;
    });
  },
  equipItem: function equipItem(containerID, heroID, slot) {
    var item = Inventory.containerToItem(containerID);
    var hero = this.idToHero(heroID);
    Inventory.removeContainerFromInventory(containerID);
    hero.unequip(slot);
    hero.equip(item, slot);
  },
  getSlotTypes: function getSlotTypes(slot, heroID) {
    var hero = this.idToHero(heroID);
    return hero.slotTypesByNum(slot);
  },
  slotEmpty: function slotEmpty(slot, heroID) {
    var hero = this.idToHero(heroID);
    return hero.slotEmpty(slot);
  },
  unequip: function unequip(slot, heroID) {
    var hero = this.idToHero(heroID);
    hero.unequip(slot);
  },
  ownedHeroes: function ownedHeroes() {
    return this.heroes.filter(function (hero) {
      return hero.owned;
    });
  },
  gainHero: function gainHero(heroID) {
    this.idToHero(heroID).owned = true;
    initializeHeroList();
  },
  heroPower: function heroPower(hero) {
    return "<div class=\"pow_img\">".concat(miscIcons.pow, "</div><div class=\"pow_interger\">").concat(hero.getPow(), "</div>");
  },
  slotsByItem: function slotsByItem(item) {
    //return a list of heroes and the appropriate slot
    var type = item.type;
    var results = [];
    this.heroes.filter(function (h) {
      return h.owned && h.canEquipType(type);
    }).forEach(function (hero) {
      var hres = {};
      hres.id = hero.id;
      hres.canEquip = [];
      hero.getSlotTypes().forEach(function (slot) {
        hres.canEquip.push(slot.includes(type));
      });
      results.push(hres);
    });
    return results;
  },
  getContainerID: function getContainerID(containerID) {
    return this.heroes.map(function (h) {
      return h.getEquipSlots(true);
    }).flat().find(function (i) {
      return i.containerID === containerID;
    });
  },
  hasContainer: function hasContainer(containerID) {
    return this.heroes.map(function (h) {
      return h.getEquipSlots(true);
    }).flat().map(function (i) {
      return i.containerID;
    }).includes(containerID);
  }
};