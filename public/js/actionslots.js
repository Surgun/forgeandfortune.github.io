"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var slotState = Object.freeze({
  NEEDMATERIAL: 0,
  CRAFTING: 1
});
$(document).on("click", ".ASCancel", function (e) {
  e.preventDefault();
  e.stopPropagation();
  destroyTooltip(e);
  var slot = parseInt($(e.target).parent().data("slotNum"));
  actionSlotManager.removeSlot(slot);
});
$(document).on("click", ".ASBuySlotButton", function (e) {
  e.preventDefault();
  actionSlotManager.upgradeSlot();
});
$(document).on("click", ".ASauto", function (e) {
  e.preventDefault();
  var slot = parseInt($(e.currentTarget).data("slotNum"));
  var newRarity = actionSlotManager.toggleAuto(slot);
  actionSlotVisualManager.updateAutoSell(e, newRarity);
});

var actionSlot =
/*#__PURE__*/
function () {
  function actionSlot(itemid, slotNum) {
    _classCallCheck(this, actionSlot);

    this.itemid = itemid;
    this.item = recipeList.idToItem(itemid);
    this.craftTime = 0;
    this.status = slotState.NEEDMATERIAL;
    this.slotNum = slotNum;
  }

  _createClass(actionSlot, [{
    key: "createSave",
    value: function createSave() {
      var save = {};
      save.itemid = this.itemid;
      save.craftTime = this.craftTime;
      save.status = this.status;
      save.slotNum = this.slotNum;
      return save;
    }
  }, {
    key: "loadSave",
    value: function loadSave(save) {
      this.craftTime = save.craftTime;
      this.status = save.status;
      this.slotNum = save.slotNum;
    }
  }, {
    key: "itemPicName",
    value: function itemPicName() {
      return this.item.itemPicName();
    }
  }, {
    key: "addTime",
    value: function addTime(t, skipAnimation) {
      if (this.status === slotState.NEEDMATERIAL) this.attemptStart(skipAnimation);

      if (this.status !== slotState.CRAFTING) {
        this.craftTime = 0;
        return;
      }

      this.craftTime += t;

      if (this.craftTime > this.maxCraft()) {
        this.craftTime -= this.maxCraft();
        Inventory.craftToInventory(this.itemid, skipAnimation);
        if (!skipAnimation) refreshRecipeMasteryAmt(this.item);
        this.status = slotState.NEEDMATERIAL;
        this.attemptStart(skipAnimation);
      }

      this.progress = (this.craftTime / this.maxCraft()).toFixed(3) * 100 + "%";
    }
  }, {
    key: "maxCraft",
    value: function maxCraft() {
      return this.item.craftTime * MonsterHall.lineIncrease(this.item.type, 0);
    }
  }, {
    key: "timeRemaining",
    value: function timeRemaining() {
      return this.maxCraft() - this.craftTime;
    }
  }, {
    key: "attemptStart",
    value: function attemptStart(skipAnimation) {
      //attempts to consume requried material, if successful start crafting
      if (this.item.isMastered()) {
        this.status = slotState.CRAFTING;
        return;
      }

      if (!ResourceManager.canAffordMaterial(this.item)) return;
      ResourceManager.deductMaterial(this.item, skipAnimation);
      this.status = slotState.CRAFTING;
    }
  }, {
    key: "autoSellToggle",
    value: function autoSellToggle() {
      return this.item.autoSellToggle();
    }
  }, {
    key: "autoSell",
    value: function autoSell() {
      return this.item.autoSell;
    }
  }, {
    key: "refundMaterial",
    value: function refundMaterial() {
      if (this.status !== slotState.CRAFTING || this.item.isMastered()) return;
      ResourceManager.refundMaterial(this.item);
    }
  }, {
    key: "isMastered",
    value: function isMastered() {
      return this.item.isMastered();
    }
  }, {
    key: "isBuildingMaterial",
    value: function isBuildingMaterial() {
      var types = ["foundry", "bank", "fuse", "smith", "fortune"];
      return types.includes(this.item.recipeType);
    }
  }, {
    key: "resList",
    value: function resList() {
      return this.item.gcost;
    }
  }]);

  return actionSlot;
}();

var actionSlotManager = {
  maxSlots: 1,
  slots: [],
  minTime: 0,
  createSave: function createSave() {
    var save = {};
    save.maxSlots = this.maxSlots;
    save.slots = [];
    this.slots.forEach(function (s) {
      save.slots.push(s.createSave());
    });
    save.minTime = this.minTime;
    return save;
  },
  loadSave: function loadSave(save) {
    var _this = this;

    this.maxSlots = save.maxSlots;
    save.slots.forEach(function (s) {
      var slot = new actionSlot(s.itemid);
      slot.loadSave(s);

      _this.slots.push(slot);
    });
    this.minTime = save.minTime;
  },
  addSlot: function addSlot(itemid) {
    if (this.slots.length >= this.maxSlots) {
      Notifications.slotsFull();
      return;
    }

    var item = recipeList.idToItem(itemid);
    if (item.recipeType !== "normal" && this.isAlreadySlotted(itemid)) return;
    if (!item.owned) return Notifications.recipeNotOwned();

    if (!item.canProduce) {
      Notifications.craftWarning();
      return;
    }

    this.slots.push(new actionSlot(itemid, this.slots.length));
    this.adjustMinTime();
    refreshSideWorkers();
    recipeList.canCraft();
    checkCraftableStatus();
  },
  adjustMinTime: function adjustMinTime() {
    if (this.slots.length === 0) {
      this.minTime = 0;
      return;
    }

    this.minTime = Math.min.apply(Math, _toConsumableArray(this.slots.map(function (s) {
      return s.maxCraft();
    })));
  },
  removeSlot: function removeSlot(slot) {
    this.slots[slot].refundMaterial();
    this.slots.splice(slot, 1);
    this.slots.forEach(function (s, i) {
      return s.slotNum = i;
    });
    this.adjustMinTime();
    refreshSideWorkers();
    recipeList.canCraft();
    checkCraftableStatus();
  },
  removeBldgSlots: function removeBldgSlots() {
    this.slots = this.slots.filter(function (s) {
      return s.item.recipeType === "normal";
    });
    this.adjustMinTime();
    refreshSideWorkers();
    recipeList.canCraft();
    checkCraftableStatus();
  },
  isAlreadySlotted: function isAlreadySlotted(id) {
    return this.slots.map(function (s) {
      return s.itemid;
    }).includes(id);
  },
  addTime: function addTime(t) {
    var _this2 = this;

    if (this.slots.length === 0) return;
    var skipAnimation = t >= this.minTime;

    if (!skipAnimation) {
      this.slots.forEach(function (slot) {
        slot.addTime(t, false);
      });
      return;
    }

    var timeRemaining = t;

    var _loop = function _loop() {
      var timeChunk = Math.min(timeRemaining, _this2.minTime);

      _this2.slots.forEach(function (slot) {
        slot.addTime(timeChunk, true);
      });

      timeRemaining -= timeChunk;
    };

    while (timeRemaining > 0) {
      _loop();
    }

    refreshInventoryAndMaterialPlaces();
  },
  upgradeSlot: function upgradeSlot() {
    if (this.maxSlots === 5) return;
    this.maxSlots += 1;
  },
  autoSell: function autoSell(i) {
    if (this.slots.length <= i) return "";
    return this.slots[i].autoSell();
  },
  toggleAuto: function toggleAuto(i) {
    return this.slots[i].autoSellToggle();
  },
  guildUsage: function guildUsage() {
    var mats = flattenArray.apply(void 0, [this.slots.map(function (s) {
      return s.item.gcost;
    })]);
    var group = groupArray(mats);
    return group;
  },
  materialUsage: function materialUsage() {
    var mats = flattenArray.apply(void 0, [this.slots.map(function (s) {
      return s.item.material();
    })]);

    var uniqueMats = _toConsumableArray(new Set(mats));

    return uniqueMats;
  },
  freeSlots: function freeSlots() {
    return this.maxSlots - this.slots.length;
  }
};
var $actionSlots = $("#actionSlots");

var actionSlotVisualSlotTracking =
/*#__PURE__*/
function () {
  function actionSlotVisualSlotTracking(id, status) {
    _classCallCheck(this, actionSlotVisualSlotTracking);

    this.id = id;
    this.status = status;
  }

  _createClass(actionSlotVisualSlotTracking, [{
    key: "addReference",
    value: function addReference(i) {
      this.timeRef = $("#ASBar".concat(i, " .ASProgressBarTimer"));
      this.progressRef = $("#ASBarFill".concat(i));
    }
  }]);

  return actionSlotVisualSlotTracking;
}();

function newActionSlot(slot) {
  var d = $("<div/>").addClass("ASBlock");
  $("<div/>").addClass("ASName").attr("id", "asSlotName" + slot.slotNum).html(slot.itemPicName()).appendTo(d);
  var d2 = $("<div/>").addClass("ASCancel").data("slotNum", slot.slotNum).appendTo(d);
  $("<div/>").addClass("ASCancelText tooltip").attr({
    "data-tooltip": "cancel_craft"
  }).data("slotNum", slot.slotNum).html("".concat(miscIcons.cancelSlot)).appendTo(d2);
  var d3 = $("<div/>").addClass("ASProgressBar").attr("id", "ASBar" + slot.slotNum).appendTo(d);
  var d3a = $("<div/>").addClass("ASProgressBarTimer tooltip").appendTo(d3);
  if (slot.status === slotState.NEEDMATERIAL) d3a.addClass("matsNeeded").attr({
    "data-tooltip": "materials_needed"
  }).html(miscIcons.alert + "Materials Needed");
  var s3 = $("<span/>").addClass("ProgressBarFill").attr("id", "ASBarFill" + slot.slotNum).appendTo(d3);
  if (slot.isMastered()) s3.addClass("ProgressBarFillMaster");
  var d4 = $("<div/>").addClass("ASauto tooltip").attr("data-tooltip", "autosell_".concat(slot.autoSell().toLowerCase())).attr("id", "asAuto" + slot.slotNum).data("slotNum", slot.slotNum).html(miscIcons.autoSell).appendTo(d);
  if (slot.autoSell() !== "None") d4.addClass("ASautoEnabled" + slot.autoSell());
  if (slot.isBuildingMaterial()) d4.hide();
  if (!slot.resList) return d;
  var d5 = $("<div/>").addClass("asRes").attr("id", "asRes" + slot.slotNum).appendTo(d);
  slot.resList().forEach(function (g) {
    $("<div/>").addClass("asResIcon tooltip").attr({
      "data-tooltip": "guild_worker",
      "data-tooltip-value": g
    }).html(GuildManager.idToGuild(g).icon).appendTo(d5);
  });
  return d;
}

function newEmptyActionSlot() {
  var d = $("<div/>").addClass("ASBlock");
  var d1 = $("<div/>").addClass("ASName ASEmpty").appendTo(d);
  $("<div/>").addClass("ASEmptyIcon").html("".concat(miscIcons.emptySlot)).appendTo(d1);
  $("<div/>").addClass("ASEmptyText").html("Empty Slot").appendTo(d1);
  return d;
}

var actionSlotVisualManager = {
  slots: [],
  slotCount: 0,
  disableRefresh: false,
  updateSlots: function updateSlots() {
    var _this3 = this;

    if (this.disableRefresh) return; //slots changed, just redraw everything

    if (this.slots.length !== actionSlotManager.slots.length || this.slotCount !== actionSlotManager.maxSlots) {
      this.slotCount = actionSlotManager.maxSlots;
      this.slots = [];
      $actionSlots.empty();
      actionSlotManager.slots.forEach(function (slot, i) {
        var newSlot = new actionSlotVisualSlotTracking(slot.item.id, slot.status);
        $actionSlots.append(newActionSlot(slot));
        newSlot.addReference(i);

        _this3.slots.push(newSlot);
      });

      for (var i = 0; i < actionSlotManager.freeSlots(); i++) {
        $actionSlots.append(newEmptyActionSlot());
      }

      return;
    } //otherwise let's just update what we have....


    actionSlotManager.slots.forEach(function (slot, i) {
      var compareSlot = _this3.slots[i];

      if (compareSlot.status === slotState.NEEDMATERIAL && slot.status === slotState.CRAFTING) {
        //update for time format
        compareSlot.timeRef.removeClass("matsNeeded").attr({
          "data-tooltip": "remaining_time"
        }).html(miscIcons.time + msToTime(slot.timeRemaining()));
      } else if (compareSlot.status === slotState.CRAFTING && slot.status === slotState.NEEDMATERIAL) {
        compareSlot.timeRef.addClass("matsNeeded").attr({
          "data-tooltip": "materials_needed"
        }).html(miscIcons.alert + "Materials Needed");
      } else if (compareSlot.status === slotState.CRAFTING) {
        compareSlot.progressRef.css('width', slot.progress);
        compareSlot.timeRef.attr({
          "data-tooltip": "remaining_time"
        }).html(miscIcons.time + msToTime(slot.timeRemaining()));
      }
    });
  },
  updateAutoSell: function updateAutoSell(e, newRarity) {
    $(e.currentTarget).removeClass("ASautoEnabledCommon ASautoEnabledGood ASautoEnabledGreat ASautoEnabledEpic").addClass("ASautoEnabled" + newRarity);
    $(e.currentTarget).attr("data-tooltip", "autosell_".concat(newRarity.toLowerCase()));
    destroyTooltip();
    generateTooltip(e);
  }
};

function refreshInventoryAndMaterialPlaces() {
  refreshInventoryPlaces(); //grab ALL the materials we might have consumed and just update where they might show up

  actionSlotManager.materialUsage().forEach(function (matID) {
    refreshMaterial(matID);
  });
}