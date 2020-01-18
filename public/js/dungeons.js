"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var DungeonStatus = Object.freeze({
  EMPTY: 0,
  ADVENTURING: 1,
  COLLECT: 2
});

var TurnOrder =
/*#__PURE__*/
function () {
  function TurnOrder(heroes, mobs) {
    _classCallCheck(this, TurnOrder);

    this.heroes = heroes;
    this.mobs = mobs;
    this.order = interlace(heroes, mobs);
    this.position = 0;
    this.nextNotDead();
  }

  _createClass(TurnOrder, [{
    key: "nextNotDead",
    value: function nextNotDead() {
      while (this.order[this.position].dead()) {
        this.position += 1;
      }
    }
  }, {
    key: "getOrder",
    value: function getOrder() {
      return this.order;
    }
  }, {
    key: "nextTurn",
    value: function nextTurn() {
      return this.order[this.position];
    }
  }, {
    key: "nextPosition",
    value: function nextPosition() {
      this.position += 1;
      if (this.position === this.order.length) this.position = 0;
      if (this.order[this.position].dead()) this.nextPosition();
    }
  }, {
    key: "createSave",
    value: function createSave() {
      var save = {};
      save.position = this.position;
      return save;
    }
  }, {
    key: "loadSave",
    value: function loadSave(save) {
      this.position = save.position;
    }
  }, {
    key: "addMob",
    value: function addMob(mob) {
      this.order.splice(this.position + 1, 0, mob);
    }
  }, {
    key: "getCurrentID",
    value: function getCurrentID() {
      return this.order[this.position].uniqueid;
    }
  }]);

  return TurnOrder;
}();

var Area =
/*#__PURE__*/
function () {
  function Area(props) {
    _classCallCheck(this, Area);

    Object.assign(this, props);
    this.unlocked = false;
    this.dungeons = [];
  }

  _createClass(Area, [{
    key: "createSave",
    value: function createSave() {
      var save = {};
      save.id = this.id;
      save.unlocked = this.unlocked;
      return save;
    }
  }, {
    key: "loadSave",
    value: function loadSave(save) {
      this.unlocked = save.unlocked;
    }
  }, {
    key: "unlock",
    value: function unlock() {
      this.unlocked = true;
    }
  }, {
    key: "addDungeon",
    value: function addDungeon(dungeon) {
      this.dungeons.push(dungeon);
    }
  }, {
    key: "status",
    value: function status() {
      if (this.dungeons.some(function (d) {
        return d.status === DungeonStatus.COLLECT;
      })) return DungeonStatus.COLLECT;
      if (this.dungeons.some(function (d) {
        return d.status === DungeonStatus.ADVENTURING;
      })) return DungeonStatus.ADVENTURING;
      return DungeonStatus.EMPTY;
    }
  }, {
    key: "activeParty",
    value: function activeParty() {
      var dungeon = this.dungeons.find(function (d) {
        return d.status === DungeonStatus.ADVENTURING;
      });
      return dungeon.party;
    }
  }, {
    key: "activeDungeonID",
    value: function activeDungeonID() {
      return this.dungeons.find(function (d) {
        return d.status === DungeonStatus.ADVENTURING || d.status === DungeonStatus.COLLECT;
      }).id;
    }
  }]);

  return Area;
}();

var AreaManager = {
  areas: [],
  areaView: null,
  addArea: function addArea(area) {
    this.areas.push(area);
  },
  idToArea: function idToArea(areaID) {
    return this.areas.find(function (a) {
      return a.id === areaID;
    });
  },
  createSave: function createSave() {
    var save = {};
    save.areas = [];
    this.areas.forEach(function (area) {
      return save.areas.push(area.createSave());
    });
  },
  loadSave: function loadSave(save) {
    var _this = this;

    save.areas.forEach(function (areaSave) {
      var area = _this.idToArea(areaSave.id);

      area.loadSave(areaSave);
    });
  },
  unlockArea: function unlockArea(areaID) {
    var area = this.idToArea(areaID);
    area.unlock();
  },
  addDungeon: function addDungeon(dungeon) {
    var area = this.idToArea(dungeon.area);
    area.addDungeon(dungeon);
  }
};

var Dungeon =
/*#__PURE__*/
function () {
  function Dungeon(props) {
    _classCallCheck(this, Dungeon);

    Object.assign(this, props);
    this.party = null;
    this.mobs = [];
    this.maxFloor = 0;
    this.floor = 0;
    this.floorClear = 0;
    this.order = null;
    this.status = DungeonStatus.EMPTY;
    this.lastParty = null;
  }

  _createClass(Dungeon, [{
    key: "createSave",
    value: function createSave() {
      var save = {};
      save.id = this.id;
      if (save.party !== null) save.party = this.party.createSave();else save.party = null;
      save.mobs = [];
      this.mobs.forEach(function (mob) {
        save.mobs.push(mob.createSave());
      });
      save.maxFloor = this.maxFloor;
      save.floor = this.floor;
      if (this.order !== null) save.order = this.order.createSave();else save.order = null;
      save.status = this.status;
      save.lastParty = this.lastParty;
      return save;
    }
  }, {
    key: "loadSave",
    value: function loadSave(save) {
      var _this2 = this;

      if (save.party !== null) this.party = new Party(save.party.heroID);
      save.mobs.forEach(function (mobSave) {
        var mobTemplate = MobManager.idToMob(mobSave.id);
        var mob = new Mob(mobSave.lvl, mobTemplate, mobSave.difficulty);
        mob.loadSave(mobSave);

        _this2.mobs.push(mob);
      });
      if (this.maxFloor !== undefined) this.maxFloor = save.maxFloor;
      if (this.floor !== undefined) this.floor = save.floor;

      if (save.order !== null) {
        this.order = new TurnOrder(this.party.heroes, this.mobs);
        this.order.loadSave(save.order);
      }

      this.status = save.status;
      this.lastParty = save.lastParty;
    }
  }, {
    key: "addTime",
    value: function addTime(t) {
      //if there's enough time, grab the next guy and do some combat
      if (this.status !== DungeonStatus.ADVENTURING) return;
      this.dungeonTime += t;
      var dungeonWaitTime = DungeonManager.speed;
      var refreshLater = this.dungeonTime >= 2 * dungeonWaitTime;
      CombatManager.refreshLater = refreshLater;

      while (this.dungeonTime >= dungeonWaitTime) {
        //take a turn
        this.buffTick("onTurn");
        this.passiveCheck("onTurn");

        if (this.floorComplete()) {
          this.nextFloor(refreshLater);
          this.dungeonTime -= dungeonWaitTime;
          return;
        }

        if (this.party.isDead()) {
          this.nextFloor(refreshLater, true);
          this.dungeonTime -= dungeonWaitTime;
          return;
        }

        if (!refreshLater && DungeonManager.dungeonView === this.id) $("#beatbarFill".concat(this.order.getCurrentID())).css('width', "0%");
        CombatManager.nextTurn(this);
        this.dungeonTime -= dungeonWaitTime;
        if (!refreshLater && DungeonManager.dungeonView === this.id) refreshTurnOrder(this.id);
      }

      if (refreshLater) {
        initiateDungeonFloor(this.id);
        BattleLog.refresh();
      }

      if (DungeonManager.dungeonView === this.id) refreshBeatBar(this.order.getCurrentID(), this.dungeonTime);
    }
  }, {
    key: "initializeParty",
    value: function initializeParty(party) {
      this.party = party;
      this.lastParty = party.heroID;
    }
  }, {
    key: "resetDungeon",
    value: function resetDungeon() {
      if (this.status !== DungeonStatus.ADVENTURING && this.status !== DungeonStatus.COLLECT) return;
      this.party.heroes.forEach(function (h) {
        h.inDungeon = false;
        h.hp = h.maxHP();
      });

      if (DungeonManager.dungeonView === this.id) {
        BattleLog.clear();
        openTab("dungeonsTab");
      }

      initializeSideBarDungeon();
      refreshDungeonSelect();
      this.status = DungeonStatus.EMPTY;
      this.party = null;
      this.order = null;
      this.mobs = [];
      this.floor = 0;
      return;
    }
  }, {
    key: "nextFloor",
    value: function nextFloor(refreshLater, previousFloor) {
      if (this.floorCount > 0 && this.type === "boss") return this.dungeonComplete(previousFloor);
      if (previousFloor) this.floor = Math.max(1, this.floor - 1);else this.floorCount += 1;
      this.maxFloor = Math.max(this.maxFloor, this.floor);
      achievementStats.floorRecord(this.id, this.maxFloor);
      this.mobs = MobManager.generateDungeonFloor(this.id, this.floor, this.bossDifficulty());
      this.party.reset();
      this.order = new TurnOrder(this.party.heroes, this.mobs);
      if (refreshLater) return;
      initiateDungeonFloor(this.id);
      $("#dsb" + this.id).html("".concat(this.name, " - ").concat(this.floorCount));
      refreshSidebarDungeonMats(this.id);
    }
  }, {
    key: "dungeonComplete",
    value: function dungeonComplete() {
      this.status = DungeonStatus.COLLECT;
      refreshDungeonSelect();
      if (DungeonManager.dungeonView === this.id) showDungeonReward(this.id);
    }
  }, {
    key: "bossHPStyling",
    value: function bossHPStyling() {
      if (this.type !== "boss") return "0 (0%)";
      var boss = this.mobs.find(function (m) {
        return m.event === "boss";
      });
      return "".concat(formatToUnits(boss.hp, 2), " (").concat(Math.round(100 * boss.hp / boss.maxHP()) + "%", ")");
    }
  }, {
    key: "bossDifficulty",
    value: function bossDifficulty() {
      if (this.type === "regular") return 0;
      var boss = DungeonManager.bossByDungeon(this.id);
      return MonsterHall.monsterKillCount(boss);
    }
  }, {
    key: "buffTick",
    value: function buffTick(type) {
      this.party.heroes.forEach(function (hero) {
        hero.buffTick(type);
      });
      this.mobs.forEach(function (enemy) {
        enemy.buffTick(type);
      });
    }
  }, {
    key: "passiveCheck",
    value: function passiveCheck(type) {
      this.party.heroes.forEach(function (hero) {
        hero.passiveCheck(type);
      });
      this.mobs.forEach(function (enemy) {
        enemy.passiveCheck(type);
      });
    }
  }, {
    key: "materialGain",
    value: function materialGain() {
      var amt = this.floorClear;
    }
  }]);

  return Dungeon;
}();

var DungeonManager = {
  dungeons: [],
  dungeonView: null,
  speed: 1500,
  createSave: function createSave() {
    var save = {};
    save.dungeons = [];
    this.dungeons.forEach(function (d) {
      save.dungeons.push(d.createSave());
    });
    save.dungeonPaid = this.dungeonPaid;
    save.speed = this.speed;
    save.bossesBeat = this.bossesBeat;
    save.partySize = this.partySize;
    return save;
  },
  addDungeon: function addDungeon(dungeon) {
    this.dungeons.push(dungeon);
    AreaManager.addDungeon(dungeon);
  },
  loadSave: function loadSave(save) {
    save.dungeons.forEach(function (d) {
      var dungeon = DungeonManager.dungeonByID(d.id);
      dungeon.loadSave(d);
    });
    this.speed = save.speed;
    if (typeof save.dungeonPaid !== "undefined") this.dungeonPaid = save.dungeonPaid;
    if (typeof save.bossesBeat !== "undefined") this.bossesBeat = save.bossesBeat;
    if (typeof save.partySize !== "undefined") this.partySize = save.partySize;
  },
  addTime: function addTime(t) {
    this.dungeons.forEach(function (dungeon) {
      dungeon.addTime(t);
    });
  },
  dungeonStatus: function dungeonStatus(dungeonID) {
    return this.dungeons.find(function (d) {
      return d.id === dungeonID;
    }).status;
  },
  createDungeon: function createDungeon(floor) {
    var party = PartyCreator.lockParty();
    var dungeon = this.dungeonByID(this.dungeonCreatingID);
    dungeon.beatTotal = 0;
    dungeon.floorCount = 0;
    dungeon.progressNextFloor = true;
    dungeon.floorCount = floor - 1;
    dungeon.status = DungeonStatus.ADVENTURING;
    this.dungeonView = this.dungeonCreatingID;
    dungeon.initializeParty(party);
    dungeon.nextFloor();
    initializeSideBarDungeon();
  },
  dungeonByID: function dungeonByID(dungeonID) {
    return this.dungeons.find(function (d) {
      return d.id === dungeonID;
    });
  },
  abandonCurrentDungeon: function abandonCurrentDungeon() {
    var dungeon = this.dungeonByID(this.dungeonView);
    dungeon.resetDungeon();
  },
  abandonAllDungeons: function abandonAllDungeons() {
    this.dungeons.forEach(function (dungeon) {
      dungeon.resetDungeon();
    });
  }
};
//# sourceMappingURL=dungeons.js.map