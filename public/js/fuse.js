"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var $fuseBuilding = $("#fuseBuilding");

var fuse =
/*#__PURE__*/
function () {
  function fuse(uniqueID) {
    _classCallCheck(this, fuse);

    var props = uniqueIDProperties(uniqueID);
    Object.assign(this, props);
    this.recipe = recipeList.idToItem(this.id);
    this.fuseTime = 0;
    this.started = false;
  }

  _createClass(fuse, [{
    key: "createSave",
    value: function createSave() {
      var save = {};
      save.fuseTime = this.fuseTime;
      save.started = this.started;
      save.uniqueID = this.uniqueID;
      return save;
    }
  }, {
    key: "loadSave",
    value: function loadSave(save) {
      if (save.fuseTime !== undefined) this.fuseTime = save.fuseTime;
      if (save.started !== undefined) this.started = save.started;
    }
  }, {
    key: "addTime",
    value: function addTime(ms) {
      this.fuseTime = Math.min(this.fuseTime + ms, this.getMaxFuse());
    }
  }, {
    key: "getMaxFuse",
    value: function getMaxFuse() {
      return this.recipe.craftTime * MonsterHall.lineIncrease(this.recipe.type, 0) * this.rarity;
    }
  }, {
    key: "timeRemaining",
    value: function timeRemaining() {
      return this.getMaxFuse() - this.fuseTime;
    }
  }, {
    key: "fuseComplete",
    value: function fuseComplete() {
      if (this.notStarted()) return false;
      return this.fuseTime === this.getMaxFuse();
    }
  }, {
    key: "increaseRarity",
    value: function increaseRarity() {
      this.rarity += 1;
      this.uniqueID = this.id + "_" + this.rarity + "_" + this.sharp;
    }
  }, {
    key: "notStarted",
    value: function notStarted() {
      return !this.started;
    }
  }]);

  return fuse;
}();

var FusionManager = {
  slots: [],
  lvl: 1,
  fuseNum: 0,
  createSave: function createSave() {
    var save = {};
    save.lvl = this.lvl;
    save.slots = [];
    this.slots.forEach(function (slot) {
      save.slots.push(slot.createSave());
    });
    return save;
  },
  loadSave: function loadSave(save) {
    var _this = this;

    save.slots.forEach(function (s) {
      var slot = new fuse(s.uniqueID);
      slot.loadSave(s);
      slot.fuseID = _this.fuseNum;
      _this.fuseNum += 1;

      _this.slots.push(slot);
    });
    if (save.lvl !== undefined) this.lvl = save.lvl;
  },
  addFuse: function addFuse(uniqueid) {
    if (!Inventory.hasThree(uniqueid)) return;

    if (this.slots.length === this.maxSlots()) {
      Notifications.noFuseSlots();
      return;
    }

    var fuseProps = uniqueIDProperties(uniqueid);

    if (ResourceManager.materialAvailable("M001") < this.getFuseCost(fuseProps)) {
      Notifications.cantAffordFuse();
      return;
    }

    ResourceManager.deductMoney(this.getFuseCost(fuseProps));
    Inventory.removeFromInventoryUID(uniqueid);
    Inventory.removeFromInventoryUID(uniqueid);
    Inventory.removeFromInventoryUID(uniqueid);
    var newFuse = new fuse(uniqueid);
    newFuse.fuseID = this.fuseNum;
    this.fuseNum += 1;
    this.slots.push(newFuse);
    refreshFuseSlots();
  },
  fuseByID: function fuseByID(fuseID) {
    return this.slots.find(function (f) {
      return f.fuseID === fuseID;
    });
  },
  startFuse: function startFuse(fuseid) {
    var fuse = this.fuseByID(fuseid);
    fuse.increaseRarity();
    fuse.started = true;
    refreshFuseSlots();
  },
  cancelFuse: function cancelFuse(fuseid) {
    var fuse = this.fuseByID(fuseid);

    if (Inventory.full(3)) {
      Notifications.fuseInvFull();
      return;
    }

    ResourceManager.addMaterial("M001", this.getFuseCost(fuse));
    Inventory.addFuseToInventory(fuse);
    Inventory.addFuseToInventory(fuse);
    Inventory.addFuseToInventory(fuse);
    this.slots = this.slots.filter(function (f) {
      return f.fuseID !== fuseid;
    });
    refreshFuseSlots();
  },
  addTime: function addTime(ms) {
    this.slots.forEach(function (fuse) {
      if (fuse.started) fuse.addTime(ms);
    });
    refreshFuseBars();
  },
  getFuseCost: function getFuseCost(fuse) {
    var item = recipeList.idToItem(fuse.id);
    return 4 * item.value * fuse.rarity;
  },
  aFuseIsDone: function aFuseIsDone() {
    return this.slots.some(function (f) {
      return f.fuseComplete();
    });
  },
  collectFuse: function collectFuse(fuseID) {
    var slot = this.slots.find(function (f) {
      return f.fuseID === fuseID;
    });
    if (slot === undefined || !slot.fuseComplete()) return;

    if (Inventory.full()) {
      Notifications.fuseInvFull();
      return;
    }

    Inventory.addFuseToInventory(slot);
    this.slots = this.slots.filter(function (f) {
      return f.fuseID !== fuseID;
    });
    refreshFuseSlots();
  },
  maxSlots: function maxSlots() {
    return 1 + this.lvl;
  },
  addLevel: function addLevel() {
    this.lvl += 1;
    refreshFuseSlots();
  },
  getMaxFuse: function getMaxFuse(uniqueIDProperties) {
    //this takes a uniqueIDProperties return (which is only from the fusion creation screen) to give fuse time
    var recipe = recipeList.idToItem(uniqueIDProperties.id);
    return recipe.craftTime * MonsterHall.lineIncrease(recipe.type, 0) * uniqueIDProperties.rarity;
  }
};

function initiateFusionBldg() {
  $fuseBuilding.show();
  refreshFuseSlots();
  refreshPossibleFuse();
}

function createFuseBar(fuse) {
  var fusePercent = fuse.fuseTime / fuse.getMaxFuse();
  var fuseAmt = msToTime(fuse.getMaxFuse() - fuse.fuseTime);
  var fuseWidth = (fusePercent * 100).toFixed(1) + "%";
  var d1 = $("<div/>").addClass("fuseBarDiv").attr("id", "fuseBarDiv" + fuse.fuseID);
  var d1a = $("<div/>").addClass("fuseBar").attr("data-label", fuseAmt).attr("id", "fuseBar" + fuse.fuseID);
  var s1 = $("<span/>").addClass("fuseBarFill").attr("id", "fuseFill" + fuse.fuseID).css('width', fuseWidth);
  return d1.append(d1a, s1);
}

function refreshFuseBars() {
  FusionManager.slots.forEach(function (fuse) {
    if (fuse.fuseComplete()) {
      $("#fuseBarDiv" + fuse.fuseID).hide();
      $("#fuseSlotCollect" + fuse.fuseID).show();
    }

    var fusePercent = fuse.fuseTime / fuse.getMaxFuse();
    var fuseAmt = msToTime(fuse.getMaxFuse() - fuse.fuseTime);
    var fuseWidth = (fusePercent * 100).toFixed(1) + "%";
    $("#fuseBar" + fuse.fuseID).attr("data-label", fuseAmt);
    $("#fuseFill" + fuse.fuseID).css('width', fuseWidth);
  });
}

var $fuseSlots = $("#fuseSlots");
var $fuseList = $("#fuseList");

function refreshFuseSlots() {
  $fuseSlots.empty();
  FusionManager.slots.forEach(function (slot) {
    var d1 = $("<div/>").addClass("fuseSlot").addClass("R" + slot.rarity);
    var d2 = $("<div/>").addClass("fuseSlotName itemName").html(slot.name);
    var d3 = createFuseBar(slot);
    var d4 = $("<div/>").addClass("fuseSlotCollect").attr("id", "fuseSlotCollect" + slot.fuseID).attr("fuseid", slot.fuseID).html("Collect Fuse").hide();
    var d5 = $("<div/>").addClass("fuseSlotStart").attr("id", "fuseSlotStart" + slot.fuseID).attr("fuseid", slot.fuseID).html("Start Fuse").hide();
    var d6 = $('<div/>').addClass("fuseClose").attr("fuseid", slot.fuseID).html("<i class=\"fas fa-times\"></i>").hide();

    if (slot.fuseComplete()) {
      d3.hide();
      d4.show();
    }

    if (slot.notStarted()) {
      d3.hide();
      d5.show();
      d6.show();
    }

    d1.append(d2, d3, d4, d5, d6);
    $fuseSlots.append(d1);
  });

  for (var i = 0; i < FusionManager.maxSlots() - FusionManager.slots.length; i++) {
    var d4 = $("<div/>").addClass("fuseSlot");
    var d5 = $("<div/>").addClass("fuseSlotName itemName").html("Empty");
    d4.append(d5);
    $fuseSlots.append(d4);
  }
}

function refreshPossibleFuse() {
  $fuseList.empty();
  var d1 = $("<div/>").addClass("possibleFuseHead").html("Possible Fuses");
  var d2 = $("<div/>").addClass('possibleFuseHolder');
  var rarities = ["Common", "Good", "Great", "Epic"];
  if (Inventory.getFusePossibilities().length === 0) d2.addClass("fuseInvBlank").html("No Items Available to Fuse");

  if (Inventory.getFusePossibilities().length > 0) {
    Inventory.getFusePossibilities().forEach(function (f) {
      var d3 = $("<div/>").addClass("possibleFusegroup");
      var d4 = $("<div/>").addClass("possibleFusegroupHeader").addClass("possibleFuseRarity" + f.rarity).html("".concat(rarities[f.rarity], " Fuse"));
      var d5 = $("<div/>").addClass("possibleFuse").html(f.name);
      var d6 = $("<div/>").addClass("fuseTime tooltip").attr("data-tooltip", "fuse_time").html("<i class=\"fas fa-clock\"></i> ".concat(msToTime(FusionManager.getMaxFuse(f))));
      var d7 = $("<div/>").addClass("fuseStart").attr("uniqueid", f.uniqueID);
      $("<div/>").addClass("fuseStartText").html("Fuse").appendTo(d7);
      $("<div/>").addClass("fuseStartCost tooltip").attr({
        "data-tooltip": "gold_value",
        "data-tooltip-value": formatWithCommas(FusionManager.getFuseCost(f))
      }).html("".concat(ResourceManager.materialIcon("M001")).concat(formatToUnits(FusionManager.getFuseCost(f), 2))).appendTo(d7);
      d3.append(d4, d5, d6, d7);
      d2.append(d3);
    });
  }

  $fuseList.append(d1, d2);
}

$(document).on('click', '.fuseStart', function (e) {
  e.preventDefault();
  destroyTooltip();
  var uniqueid = $(e.currentTarget).attr("uniqueid");
  FusionManager.addFuse(uniqueid);
});
$(document).on('click', '.fuseClose', function (e) {
  e.preventDefault();
  var fuseid = parseInt($(e.currentTarget).attr("fuseid"));
  FusionManager.cancelFuse(fuseid);
});
$(document).on('click', '.fuseSlotStart', function (e) {
  e.preventDefault();
  var fuseid = parseInt($(e.currentTarget).attr("fuseid"));
  FusionManager.startFuse(fuseid);
});
$(document).on('click', '.fuseSlotCollect', function (e) {
  e.preventDefault();
  var id = parseInt($(e.currentTarget).attr("fuseid"));
  FusionManager.collectFuse(id);
});