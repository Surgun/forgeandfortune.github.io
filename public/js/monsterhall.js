"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var $monsterBuilding = $("#monsterBuilding");
var $monsterDiv = $(".monsterDiv");
var $monsterMobs = $("#monsterMobs");
var $monsterRewards = $("#monsterRewards");
var $monsterMobsInspect = $("#monsterMobsInspect");
var $monsterMobsList = $("#monsterMobsList");
var MonsterHall = {
  lvl: 1,
  kills: [],
  lineUpgrades: [],
  lastTab: "Beastiary",
  createSave: function createSave() {
    var save = {};
    save.lvl = this.lvl;
    save.kills = [];
    this.kills.forEach(function (kill) {
      save.kills.push(kill.createSave());
    });
    save.lineUpgrades = [];
    this.lineUpgrades.forEach(function (upgrade) {
      save.lineUpgrades.push(upgrade.createSave());
    });
    return save;
  },
  loadSave: function loadSave(save) {
    var _this = this;

    this.lvl = save.lvl;
    save.kills.forEach(function (kill) {
      var newKill = new idAmt(kill.id, kill.amt);
      newKill.loadSave(kill);

      _this.kills.push(newKill);
    });
    save.lineUpgrades.forEach(function (upgrade) {
      var newUpgrade = new idAmt(upgrade.id, upgrade.amt);
      newUpgrade.loadSave(upgrade);

      _this.lineUpgrades.push(newUpgrade);
    });
  },
  addLevel: function addLevel() {
    this.lvl += 1;
  },
  bossRefight: function bossRefight() {
    return this.lvl > 1;
  },
  monsterKillCount: function monsterKillCount(mobID) {
    var killCount = this.kills.find(function (m) {
      return m.id === mobID;
    });
    return killCount === undefined ? 0 : killCount.amt;
  },
  totalKills: function totalKills() {
    return 0;
    /*const bossKills = this.kills.filter(m=>MobManager.idToMob(m.id).event === "boss");
    return bossKills.reduce((a,b) => a+b.amt,0);*/
  },
  lineUpgradesAvailable: function lineUpgradesAvailable() {
    return ResourceManager.materialAvailable("M002");
  },
  addKill: function addKill(mobID) {
    var killCount = this.kills.find(function (m) {
      return m.id === mobID;
    });

    if (killCount === undefined) {
      killCount = new idAmt(mobID, 1);
      this.kills.push(killCount);
    } else killCount.amt += 1;
  },
  findMonster: function findMonster(mobID) {
    if (this.kills.find(function (m) {
      return m.id === mobID;
    })) return;
    var seen = new idAmt(mobID, 0);
    this.kills.push(seen);
    refreshHallMonsterList();
  },
  haveSeen: function haveSeen(mobID) {
    return this.kills.find(function (m) {
      return m.id === mobID;
    }) !== undefined;
  },
  addLineUpgrade: function addLineUpgrade(line) {
    var upgrade = this.lineUpgrades.find(function (m) {
      return m.id === line;
    });

    if (upgrade === undefined) {
      upgrade = new idAmt(line, 1);
      this.lineUpgrades.push(upgrade);
    } else upgrade.amt += 1;
  },
  lineUpgradeCount: function lineUpgradeCount(line) {
    var upgrade = this.lineUpgrades.find(function (u) {
      return u.id === line;
    });
    return upgrade === undefined ? 0 : upgrade.amt;
  },
  maxUpgrade: function maxUpgrade(line) {
    return this.lineUpgradeCount(line) >= 10;
  },
  floorSkip: function floorSkip() {
    if (this.lvl < 3) return 0;
    return Math.floor(recipeList.masteryCount() * 2.5);
  },
  lineIncrease: function lineIncrease(type, additional) {
    return Math.pow(0.95, this.lineUpgradeCount(type) + additional);
  },
  buyLine: function buyLine(type) {
    if (this.maxUpgrade(type)) return;
    if (ResourceManager.materialAvailable("M002") <= 0) return Notifications.cantAffordLineUpgrade();
    ResourceManager.addMaterial("M002", -1);
    this.addLineUpgrade(type);
    refreshMonsterRewardLines();
    refreshCraftTimes();
  }
};

var idAmt =
/*#__PURE__*/
function () {
  function idAmt(id, amt) {
    _classCallCheck(this, idAmt);

    this.id = id;
    this.amt = amt;
  }

  _createClass(idAmt, [{
    key: "addAmt",
    value: function addAmt() {
      this.amt += 1;
    }
  }, {
    key: "createSave",
    value: function createSave() {
      var save = {};
      save.id = this.id;
      save.amt = this.amt;
      return save;
    }
  }, {
    key: "loadSave",
    value: function loadSave(save) {
      return;
    }
  }]);

  return idAmt;
}();

var $monsterNavMobs = $("#monsterNavMobs");
var $monsterNavRewards = $("#monsterNavRewards");
var $monsterNavButton = $(".monsterNavButton");

function initiateMonsterBldg() {
  $monsterBuilding.show();
  $monsterDiv.hide().removeClass("selected"); //hide all the tabs besides monster mobs

  $monsterNavButton.removeClass("selected");
  $monsterNavMobs.addClass("selected");
  $monsterMobs.show().addClass("selected");
  if (MonsterHall.lvl < 2) $monsterNavRewards.hide();
  refreshHallMonsterList();
}

$(document).on('click', "#monsterNavRewards", function (e) {
  e.preventDefault();
  $monsterNavButton.removeClass("selected");
  $monsterNavRewards.addClass("selected");
  $monsterDiv.hide().removeClass("selected");
  $monsterRewards.show().addClass("selected");
});
$(document).on('click', "#monsterNavMobs", function (e) {
  e.preventDefault();
  $monsterNavButton.removeClass("selected");
  $monsterNavMobs.addClass("selected");
  $monsterDiv.hide().removeClass("selected");
  $monsterMobs.show().addClass("selected");
});

function initiateMonsterHall() {
  MobManager.monsterDB.forEach(function (monster) {
    createMonsterHallCard(monster).appendTo($monsterMobsList);
  });
}

;
var monsterHallMonserDivs = [];

function createMonsterHallCard(monster) {
  var d = $("<div/>").addClass("monsterCard").data("monsterID", monster.id).hide();
  $("<div/>").addClass("monsterCardName").html(monster.name).appendTo(d);
  $("<div/>").addClass("monsterCardImage").html(monster.head).appendTo(d);
  monsterHallMonserDivs.push(d);
  return d;
}

var $monsterHallFilterD001 = $("#monsterHallFilterD001");
var $monsterHallFilterD002 = $("#monsterHallFilterD002");
var $monsterHallFilterD003 = $("#monsterHallFilterD003");
var $monsterHallFilterBosses = $("#monsterHallFilterBosses");

function refreshHallMonsterList() {
  /*const dungeons = [];
  if ($monsterHallFilterD001.is(':checked')) dungeons.push("D001");
  if ($monsterHallFilterD002.is(':checked')) dungeons.push("D002");
  if ($monsterHallFilterD003.is(':checked')) dungeons.push("D003");
  const showBoss = ($monsterHallFilterBosses.is(':checked')) ? true : false;
  const shownMobs = FloorManager.mobsByDungeons(dungeons);
  monsterHallMonserDivs.forEach(monsterDiv => {
      const monsterID = monsterDiv.data("monsterID");
      const monster = MobManager.idToMob(monsterID);
      if (shownMobs.includes(monsterID) && MonsterHall.haveSeen(monsterID)) monsterDiv.show();
      else if (showBoss && monster.event === "boss" && MonsterHall.haveSeen(monsterID)) monsterDiv.show();
      else monsterDiv.hide();
  });*/
}

function refreshHallMonsterInspect(monster) {
  $monsterMobsInspect.empty();
  var d = $("<div/>").addClass("monsterInspectContainer").appendTo($monsterMobsInspect);
  var d1 = $("<div/>").addClass("monsterActionsContainer").appendTo(d);
  $("<div/>").addClass("monsterActionsButton").attr("id", "mhiBackButton").html("<i class=\"fas fa-arrow-left\"></i> Back to Beastiary").appendTo(d1);
  var d2 = $("<div/>").addClass("monsterDetails").appendTo(d);
  var d2a = $("<div/>").addClass("monsterInfoDetails");
  var floorRange = FloorManager.floorRangeByMob(monster.id);
  var dungeonName = FloorManager.dungeonNameByMob(monster.id);
  mhiBlock("Name", monster.name).appendTo(d2a);
  $("<div/>").addClass("mhiBlockImage").html(monster.image).appendTo(d2a);
  var d2b = $("<div/>").addClass("monsterDungeonDetails");
  mhiBlock("Dungeon", dungeonName).appendTo(d2b);
  if (monster.event !== "boss") mhiBlock("Seen on Floors", "".concat(floorRange.min, " - ").concat(floorRange.max)).appendTo(d2b);
  mhiBlock("Kills", "".concat(MonsterHall.monsterKillCount(monster.id))).appendTo(d2b);
  d2.append(d2a, d2b);
  var d3 = $("<div/>").addClass("mhiStats").appendTo(d);
  var stats = ["".concat(monster.getHPForFloor(floorRange.min), " - ").concat(monster.getHPForFloor(floorRange.max)), "".concat(monster.getPOWForFloor(floorRange.min), " - ").concat(monster.getPOWForFloor(floorRange.max))];
  if (monster.event === "boss") stats = ["".concat(monster.getHPForFloor(1)), "".concat(monster.getPOWForFloor(1))];

  for (var i = 0; i < stats.length; i++) {
    d3.append(statRow(statName[i], stats[i], statDesc[i]));
  }

  var d4 = $("<div/>").addClass("mhiSkills").appendTo(d);
  $("<div/>").addClass("mhiSkillHeading").html("Monster Skills").appendTo(d4);
  var d4a = $("<div/>").addClass("mhiSkillBox").appendTo(d4);
  generateSkillIcons(monster).appendTo(d4a);
}

function mhiBlock(heading, text) {
  var d = $("<div/>").addClass("mhiBlock");
  $("<div/>").addClass("mhiHeader").html(heading).appendTo(d);
  $("<div/>").addClass("mhiText").html(text).appendTo(d);
  return d;
}

$(".monsterHallFilterCheck").change(function () {
  refreshHallMonsterList();
});
$(document).on('click', "#mhiBackButton", function (e) {
  e.preventDefault();
  $monsterMobsInspect.hide();
  refreshHallMonsterList();
  $monsterMobs.show();
});
$(document).on('click', ".monsterCard", function (e) {
  e.preventDefault();
  var monsterID = $(e.currentTarget).data("monsterID");
  var monster = MobManager.idToMob(monsterID);
  refreshHallMonsterInspect(monster);
  $monsterMobs.hide();
  $monsterMobsInspect.show();
});
var $mRWM = $("#mRWM");
var $mRWS = $("#mRWS");
var $mRTmax = $("#mRTmax");
var $mRTavail = $("#mRTavail");
var $monsterRewardWarpContainer = $("#monsterRewardWarpContainer");

function refreshMonsterReward() {
  if (MonsterHall.lvl >= 3) {
    $monsterRewardWarpContainer.show();
    $mRWM.html(recipeList.masteryCount());
    $mRWS.html(MonsterHall.floorSkip());
  } else {
    $monsterRewardWarpContainer.hide();
  }

  $mRTmax.html(MonsterHall.totalKills());
  $mRTavail.html(MonsterHall.lineUpgradesAvailable());
}

var $mRewardLines = $("#mRewardLines");

function refreshMonsterRewardLines() {
  $mRewardLines.empty();
  ItemType.forEach(function (type) {
    var d = $("<div/>").addClass("lineRewardContainer").appendTo($mRewardLines);
    $("<div/>").addClass("lineRewardLevel").html("Level ".concat(MonsterHall.lineUpgradeCount(type))).appendTo(d);
    var d1 = $("<div/>").addClass("lineRewardTitle").appendTo(d);
    $("<div/>").addClass("lineRewardTitleImage").html("<img src='/assets/images/recipeFilter/".concat(type, "32.png'>")).appendTo(d1);
    $("<div/>").addClass("lineRewardTitleName").html(type).appendTo(d1);
    var d2 = $("<div/>").addClass("lineRewardCurrent").appendTo(d);
    $("<div/>").addClass("lineRewardCurrentTitle").html("Craft Speed").appendTo(d2);
    var d2a = $("<div/>").addClass("lineRewardCurrentChange").appendTo(d2);
    $("<div/>").addClass("lineRewardCurrentChangeBefore").html("+".concat((100 - 100 * MonsterHall.lineIncrease(type, 0)).toFixed(1), "%")).appendTo(d2a);

    if (!MonsterHall.maxUpgrade(type)) {
      $("<div/>").addClass("lineRewardCurrentChangeMedian").html("".concat(miscIcons.arrow)).appendTo(d2a);
      $("<div/>").addClass("lineRewardCurrentChangeAfter").html("+".concat((100 - 100 * MonsterHall.lineIncrease(type, 1)).toFixed(1), "%")).appendTo(d2a);
    }

    var d3 = $("<div/>").addClass("lineRewardPay").attr("id", "monsterPay").data("line", type).appendTo(d);

    if (MonsterHall.maxUpgrade(type)) {
      $("<div/>").addClass("lineRewardPayText").html("Max Level").appendTo(d3);
    } else {
      $("<div/>").addClass("lineRewardPayText").html("Increase").appendTo(d3);
      $("<div/>").addClass("lineRewardPayCost tooltip").attr({
        "data-tooltip": "material_desc",
        "data-tooltip-value": "M002"
      }).html("1 ".concat(miscIcons.trophy)).appendTo(d3);
    }
  });
}

$(document).on('click', "#monsterPay", function (e) {
  e.preventDefault();
  var type = $(e.currentTarget).data("line");
  MonsterHall.buyLine(type);
});
//# sourceMappingURL=monsterhall.js.map