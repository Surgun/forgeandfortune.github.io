"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var $fortuneBuilding = $("#fortuneBuilding");
var fortuneSlotid = 0;

var fortuneSlot =
/*#__PURE__*/
function () {
  function fortuneSlot(container) {
    _classCallCheck(this, fortuneSlot);

    this.container = container;
    this.type = container.item.type;
    this.rarity = container.rarity;
    this.lvl = container.item.lvl;
    this.slotid = fortuneSlotid;
    this.state = "unlocked";
    if (container.rarity === 0) this.amt = 20;else if (container.rarity === 1) this.amt = 50;else if (container.rarity === 2) this.amt = 100;
    fortuneSlotid += 1;
  }

  _createClass(fortuneSlot, [{
    key: "createSave",
    value: function createSave() {
      var save = {};
      save.container = this.container.createSave();
      save.type = this.type;
      save.rarity = this.rarity;
      save.lvl = this.lvl;
      save.amt = this.amt;
      save.state = this.state;
      return save;
    }
  }, {
    key: "loadSave",
    value: function loadSave(save) {
      this.type = save.type;
      this.rarity = save.rarity;
      this.lvl = save.lvl;
      var newContainer = new itemContainer(save.container.id, save.container.rarity);
      newContainer.loadSave(save.container);
      this.container = newContainer;
      this.state = save.state;
      this.amt = save.amt;
    }
  }, {
    key: "lockFortune",
    value: function lockFortune() {
      this.state = "locked";
      this.rarity += 1;
    }
  }, {
    key: "locked",
    value: function locked() {
      return this.state === "locked";
    }
  }, {
    key: "picName",
    value: function picName() {
      return this.container.picName();
    }
  }, {
    key: "material",
    value: function material() {
      return this.container.material();
    }
  }, {
    key: "itemLevel",
    value: function itemLevel() {
      return this.container.itemLevel();
    }
  }]);

  return fortuneSlot;
}();

var FortuneManager = {
  slots: [],
  lvl: 1,
  createSave: function createSave() {
    var save = {};
    save.lvl = this.lvl;
    save.slots = [];
    this.slots.forEach(function (slot) {
      var saveSlot = slot.createSave();
      save.slots.push(saveSlot);
    });
    return save;
  },
  loadSave: function loadSave(save) {
    var _this = this;

    save.slots.forEach(function (slot) {
      var container = new itemContainer(slot.container.id, slot.container.rarity);
      container.loadSave(container);
      var saveSlot = new fortuneSlot(container);
      saveSlot.loadSave(slot);

      _this.slots.push(saveSlot);
    });
    this.lvl = save.lvl;
  },
  stageItem: function stageItem(containerID) {
    if (this.slots.length >= this.maxSlot()) {
      Notifications.fortuneNoSlot();
      return;
    }

    var container = Inventory.containerToItem(containerID);
    if (container === undefined) return;
    var newfortuneSlot = new fortuneSlot(container);
    this.slots.push(newfortuneSlot);
    Inventory.removeContainerFromInventory(containerID);
    refreshFortuneSlots();
  },
  fortuneByID: function fortuneByID(fortuneID) {
    return this.slots.find(function (f) {
      return f.slotid == fortuneID;
    });
  },
  removeFortune: function removeFortune(fortuneID) {
    if (Inventory.full()) {
      Notifications.fortuneInvFull();
      return;
    }

    var fortune = this.fortuneByID(fortuneID);
    Inventory.addToInventory(fortune.container);
    this.slots = this.slots.filter(function (f) {
      return f.slotid !== fortuneID;
    });
    refreshFortuneSlots();
  },
  removeLockedFortune: function removeLockedFortune(fortuneID) {
    this.slots = this.slots.filter(function (f) {
      return f.slotid !== fortuneID;
    });
    refreshFortuneSlots();
  },
  lockFortune: function lockFortune(fortuneID) {
    var fortune = this.fortuneByID(fortuneID);
    fortune.lockFortune();
    refreshFortuneSlots();
  },
  emptySlotCount: function emptySlotCount() {
    return this.maxSlot() - this.slots.length;
  },
  getMaterialCost: function getMaterialCost(slot) {
    if (slot === null) return null;
    return {
      id: slot.material(),
      amt: 20
    };
  },
  getProcModifier: function getProcModifier(line, tier) {
    var modifier = [1, 1, 1];
    var mods = this.slots.filter(function (s) {
      return s.type === line && s.lvl === tier;
    });
    mods.forEach(function (s) {
      modifier[s.rarity - 1] = 2;
      s.amt -= 1;
    });
    if (this.slots.some(function (f) {
      return f.amt <= 0;
    })) this.purgeDone();
    refreshFortuneSlots();
    return modifier;
  },
  maxSlot: function maxSlot() {
    return this.lvl;
  },
  purgeDone: function purgeDone() {
    this.slots = this.slots.filter(function (f) {
      return f.amt > 0;
    });
    refreshFortuneSlots();
  },
  addLevel: function addLevel() {
    this.lvl += 1;
    refreshFortuneSlots();
  }
};
var $fortuneStage = $("#fortuneStage");
var $fortuneGear = $("#fortuneGear");

function initiateFortuneBldg() {
  $fortuneBuilding.show();
  refreshFortuneSlots();
  refreshFortuneGear();
}

function refreshFortuneSlots() {
  $fortuneStage.empty();
  FortuneManager.slots.forEach(function (slot) {
    if (slot.locked()) $fortuneStage.append(createFortuneCardLocked(slot));else $fortuneStage.append(createFortuneCard(slot));
  });

  for (var i = 0; i < FortuneManager.emptySlotCount(); i++) {
    $fortuneStage.append(createFortuneBlank());
  }
}

function refreshFortuneGear() {
  $fortuneGear.empty();
  Inventory.nonEpic().forEach(function (container) {
    $fortuneGear.append(createFortuneInv(container));
  });
}

function createFortuneInv(item) {
  var itemdiv = $("<div/>").addClass("fortuneItem").addClass("R" + item.rarity);
  var itemName = $("<div/>").addClass("fortuneItemName itemName").html(item.picName());
  var itemLevel = $("<div/>").addClass("fortuneItemLevel").html(item.itemLevel());
  var fortuneButton = $("<div/>").addClass("fortuneStage").attr("containerID", item.containerID).html("Offer");
  return itemdiv.append(itemName, itemLevel, fortuneButton);
}

function createFortuneCard(slot) {
  var rarity = ["Common", "Good", "Great", "Epic"];
  var itemdiv = $("<div/>").addClass("fortuneSlot").addClass("R" + slot.rarity);
  $("<div/>").addClass("fortuneItemName itemName").html(slot.picName()).appendTo(itemdiv);
  $("<div/>").addClass("fortuneItemLevel").html(slot.itemLevel()).appendTo(itemdiv);
  $("<div/>").addClass("fortuneItemDesc").html("2x ".concat(rarity[slot.rarity + 1], " Chance")).appendTo(itemdiv);
  var cost = FortuneManager.getMaterialCost(slot);
  var sacContainer = $("<div/>").addClass("fortuneItemSac").data("fortuneID", slot.slotid).appendTo(itemdiv);
  $("<div/>").addClass("fortune_text").html("Sacrifice for").appendTo(sacContainer);
  $("<div/>").addClass("fortune_cost tooltip").attr({
    "data-tooltip": "material_desc",
    "data-tooltip-value": cost.id
  }).html("".concat(ResourceManager.idToMaterial(cost.id).img, " ").concat(cost.amt)).appendTo(sacContainer);
  $('<div/>').addClass("fortuneItemClose").data("fortuneID", slot.slotid).html("<i class=\"fas fa-times\"></i>").appendTo(itemdiv);
  return itemdiv;
}

function createFortuneCardLocked(slot) {
  var rarity = ["Common", "Good", "Great", "Epic"];
  var itemdiv = $("<div/>").addClass("fortuneSlot").addClass("R" + slot.rarity);
  $("<div/>").addClass("fortuneItemName itemName").html(slot.picName()).appendTo(itemdiv);
  $("<div/>").addClass("fortuneItemLevel").html(slot.itemLevel()).appendTo(itemdiv);
  $("<div/>").addClass("fortuneItemDesc").html("2x ".concat(rarity[slot.rarity], " Chance")).appendTo(itemdiv);
  $("<div/>").addClass("fortuneItemAmt").html("".concat(slot.amt, " Crafts Left")).appendTo(itemdiv);
  $('<div/>').addClass("fortuneItemSetClose").data("fortuneID", slot.slotid).html("<i class=\"fas fa-times\"></i>").appendTo(itemdiv);
  return itemdiv;
}

function createFortuneBlank() {
  var itemdiv = $("<div/>").addClass("fortuneSlot");
  $("<div/>").addClass("fortuneSlotEmpty").html("Fortune Available").appendTo(itemdiv);
  return itemdiv;
}

$(document).on('click', '.fortuneStage', function (e) {
  e.preventDefault();
  var containerID = parseInt($(e.currentTarget).attr("containerID"));
  FortuneManager.stageItem(containerID);
  refreshFortuneSlots();
});
$(document).on('click', '.fortuneItemSac', function (e) {
  e.preventDefault();
  destroyTooltip();
  var fortuneID = parseInt($(e.currentTarget).data("fortuneID"));
  FortuneManager.lockFortune(fortuneID);
  refreshFortuneSlots();
});
$(document).on('click', '.fortuneItemClose', function (e) {
  e.preventDefault();
  var fortuneID = parseInt($(e.currentTarget).data("fortuneID"));
  FortuneManager.removeFortune(fortuneID);
  refreshFortuneSlots();
});
$(document).on('click', '.fortuneItemSetClose', function (e) {
  e.preventDefault();
  var fortuneID = parseInt($(e.currentTarget).data("fortuneID"));
  FortuneManager.removeLockedFortune(fortuneID);
  refreshFortuneSlots();
});
//# sourceMappingURL=fortune.js.map