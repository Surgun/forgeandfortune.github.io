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

var Dungeon =
/*#__PURE__*/
function () {
  function Dungeon(props) {
    _classCallCheck(this, Dungeon);

    Object.assign(this, props);
    this.maxMonster = 4;
    this.party = null;
    this.mobs = [];
    this.dropList = [];
    this.dungeonTime = 0;
    this.floorCount = 0;
    this.order = null;
    this.status = DungeonStatus.EMPTY;
    this.lastParty = null;
    this.floorMaterial = null;
    this.completeState = "none";
    this.progressNextFloor = true;
  }

  _createClass(Dungeon, [{
    key: "createSave",
    value: function createSave() {
      var save = {};
      save.id = this.id;
      save.lastParty = this.lastParty;
      save.floorID = this.floorID;
      if (this.party === null) save.party = null;else save.party = this.party.createSave();
      save.mobs = [];
      this.mobs.forEach(function (m) {
        save.mobs.push(m.createSave());
      });
      save.dropList = this.dropList;
      save.dungeonTime = this.dungeonTime;
      save.floorCount = this.floorCount;
      save.order = [];
      if (this.order === null) save.order = null;else save.order = this.order.createSave();
      save.status = this.status;
      save.completeState = this.completeState;
      save.progressNextFloor = this.progressNextFloor;
      return save;
    }
  }, {
    key: "loadSave",
    value: function loadSave(save) {
      var _this = this;

      if (save.party !== null) this.party = new Party(save.party.heroID);else save.party = null;
      if (save.lastParty !== undefined) this.lastParty = save.lastParty;
      if (save.floorID !== undefined) this.floorID = save.floorID;
      this.mobs = [];
      save.mobs.forEach(function (mobSave) {
        var mobTemplate = MobManager.idToMob(mobSave.id);
        var mob = new Mob(mobSave.lvl, mobTemplate, mobSave.difficulty);
        mob.loadSave(mobSave);

        _this.mobs.push(mob);
      });

      if (save.order !== null) {
        this.order = new TurnOrder(this.party.heroes, this.mobs);
        this.order.loadSave(save.order);
      }

      this.dropList = save.dropList;
      this.dungeonTime = save.dungeonTime;
      this.floorCount = save.floorCount;
      this.status = save.status;
      if (save.completeState !== undefined) this.completeState = save.completeState;
      if (save.progressNextFloor !== undefined) this.progressNextFloor = save.progressNextFloor;
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
    key: "floorComplete",
    value: function floorComplete() {
      return this.mobs.every(function (m) {
        return m.dead();
      });
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
      DungeonManager.removeDungeon(this.id);

      if (DungeonManager.dungeonView === this.id) {
        BattleLog.clear();
        openTab("dungeonsTab");
      }

      initializeSideBarDungeon();
      refreshDungeonSelect();
      this.status = DungeonStatus.EMPTY;
      this.order = null;
      this.dungeonTime = 0;
      this.floorCount = 0;
      this.beatTotal = 0;
      this.completeState = "none";
      return;
    }
  }, {
    key: "getRewards",
    value: function getRewards() {
      var floor = FloorManager.floorByID(this.floorID);
      return new idAmt(floor.mat, floor.matAmt);
    }
  }, {
    key: "addRewards",
    value: function addRewards() {
      if (this.type === "boss") {
        this.bossesBeat.push(this.id);
        return;
      }

      ;
      var rewards = this.getRewards();
      console.log(rewards);
      ResourceManager.addMaterial(rewards.id, rewards.amt);
    }
  }, {
    key: "nextFloor",
    value: function nextFloor(refreshLater, previousFloor) {
      if (this.floorCount > 0 && this.type === "boss") return this.dungeonComplete(previousFloor);

      if (!previousFloor && this.floorCount > 0) {
        this.addRewards();
        this.party.setMaxFloor(this.id, this.floorCount);
      }

      if (previousFloor) {
        this.floorCount = Math.max(1, this.floorCount - 1);
        this.toggleProgress(false);
      } else if (this.progressNextFloor || this.floorCount === 0) this.floorCount += 1;

      achievementStats.floorRecord(this.id, this.floorCount);
      var floor = FloorManager.getFloor(this.id, this.floorCount);
      this.floorID = floor.id;
      this.mobs = MobManager.generateDungeonFloor(floor, this.floorCount, this.bossDifficulty());
      this.party.resetForFloor();
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
    key: "toggleProgress",
    value: function toggleProgress(toggle) {
      toggle = toggle || !this.progressNextFloor;
      this.progressNextFloor = toggle;
      refreshDungeonFarmStatus(this.id);
      if (DungeonManager.dungeonView !== this.id) return;
      if (toggle) $toggleProgress.html("Progressing");else $toggleProgress.html("Farming");
    }
  }]);

  return Dungeon;
}();

var DungeonManager = {
  dungeons: [],
  dungeonCreatingID: null,
  dungeonView: null,
  speed: 1500,
  dungeonPaid: [],
  bossesBeat: [],
  partySize: 1,
  unlockDungeon: function unlockDungeon(id) {
    this.dungeonPaid.push(id);
  },
  dungeonCanSee: function dungeonCanSee(id) {
    return this.dungeonPaid.includes(id);
  },
  bossDungeonCanSee: function bossDungeonCanSee(id) {
    if (MonsterHall.bossRefight()) return this.dungeonPaid.includes(id);
    return this.dungeonPaid.includes(id) && !DungeonManager.bossCleared(id);
  },
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
  removeDungeon: function removeDungeon(dungeonID) {
    var dungeon = this.dungeonByID(dungeonID);
    dungeon.party = null;
    dungeon.status = DungeonStatus.EMPTY;
    dungeon.progressNextFloor = true;
    initializeSideBarDungeon();
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
  getCurrentDungeon: function getCurrentDungeon() {
    return this.dungeonByID(this.dungeonView);
  },
  dungeonSlotCount: function dungeonSlotCount() {
    var dungeon = this.dungeonByID(this.dungeonCreatingID);
    if (dungeon.type == "boss") return 4;
    return this.partySize;
  },
  bossCount: function bossCount() {
    return this.bossesBeat.length;
  },
  bossCleared: function bossCleared(id) {
    return this.bossesBeat.includes(id);
  },
  bossMaxCount: function bossMaxCount() {
    return this.dungeons.filter(function (d) {
      return d.type === "boss";
    }).length;
  },
  abandonCurrentDungeon: function abandonCurrentDungeon() {
    var dungeon = this.getCurrentDungeon();
    dungeon.resetDungeon();
  },
  bossByDungeon: function bossByDungeon(dungeonid) {
    return FloorManager.mobsByDungeon(dungeonid)[0];
  },
  toggleProgress: function toggleProgress() {
    this.getCurrentDungeon().toggleProgress();
  },
  getHpFloor: function getHpFloor(x2) {
    var fl = Math.floor((x2 - 1) / 100);
    var ce = Math.ceil((x2 - 1) / 100);
    var x1 = fl * 100 + 1;
    var x3 = ce * 100 + 1;
    var y1 = miscLoadedValues.hpFloor[fl];
    var y3 = miscLoadedValues.hpFloor[ce];
    if (fl === ce) return y1;
    return Math.round((x2 - x1) * (y3 - y1) / (x3 - x1) + y1);
  },
  getPowFloor: function getPowFloor(x2) {
    var fl = Math.floor((x2 - 1) / 100);
    var ce = Math.ceil((x2 - 1) / 100);
    var x1 = fl * 100 + 1;
    var x3 = ce * 100 + 1;
    var y1 = miscLoadedValues.powFloor[fl];
    var y3 = miscLoadedValues.powFloor[ce];
    if (fl === ce) return y1;
    return Math.round((x2 - x1) * (y3 - y1) / (x3 - x1) + y1);
  },
  dungeonMatRefresh: function dungeonMatRefresh(matID) {
    this.dungeons.forEach(function (dungeon) {
      if (dungeon.status !== DungeonStatus.ADVENTURING) return;
      if (FloorManager.floorByID(dungeon.floorID).mat !== matID) return;
      refreshDungeonMatBar(dungeon.id);
    });
  },
  abandonAllDungeons: function abandonAllDungeons() {
    this.dungeons.forEach(function (dungeon) {
      dungeon.resetDungeon();
    });
  },
  completeBoss: function completeBoss(id) {
    this.bossesBeat.push(id);
    refreshAllOrders();
    refreshAllSales();
  }
};