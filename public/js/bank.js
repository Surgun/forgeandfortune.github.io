"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var $bankInvSlots = $("#bankInvSlots");
var $bankBankSlots = $("#bankBankSlots");
var $bankBuilding = $("#bankBuilding");
var BankManager = {
  slots: [],
  lvl: 1,
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

    save.slots.forEach(function (item) {
      var container = new itemContainer(item.id, item.rarity);
      container.loadSave(item);

      _this.slots.push(container);
    });
    if (save.lvl !== undefined) this.lvl = save.lvl;
  },
  maxSlots: function maxSlots() {
    return this.lvl * 5 + 10;
  },
  full: function full() {
    return this.slots.length === this.maxSlots();
  },
  containerToItem: function containerToItem(containerID) {
    return this.slots.find(function (s) {
      return s.containerID === containerID;
    });
  },
  addFromInventory: function addFromInventory(containerID) {
    if (this.full()) return;
    var container = Inventory.containerToItem(containerID);
    Inventory.removeContainerFromInventory(containerID);
    this.addContainer(container);
  },
  removeContainer: function removeContainer(containerID) {
    this.slots = this.slots.filter(function (c) {
      return c.containerID !== containerID;
    });
    refreshBankBank();
  },
  sortBank: function sortBank() {
    this.slots.sort(function (a, b) {
      return inventorySort(a, b);
    });
    refreshBankBank();
  },
  addContainer: function addContainer(container) {
    this.slots.push(container);
    refreshBankBank();
  },
  removeFromBank: function removeFromBank(containerID) {
    if (Inventory.full()) return;
    var container = this.containerToItem(containerID);
    this.removeContainer(containerID);
    Inventory.addToInventory(container);
  },
  addLevel: function addLevel() {
    this.lvl += 1;
    refreshBankBank();
    refreshBankInventory();
  }
};

function initiateBankBldg() {
  $bankBuilding.show();
  refreshBankBank();
  refreshBankInventory();
}

function refreshBankInventory() {
  $bankInvSlots.empty();
  var d1 = $("<div/>").addClass("bankInvHeadContainer");
  var d2 = $("<div/>").addClass("bankInvHead").html("Inventory (".concat(Inventory.nonblank().length, "/").concat(Inventory.invMax, ")"));
  var d3 = $("<div/>").attr("id", "sortInventoryBank").addClass("sortInventoryBank actionButton").html("Sort Inventory");
  d1.append(d2, d3);
  $bankInvSlots.append(d1);
  Inventory.nonblank().forEach(function (item) {
    $bankInvSlots.append(itemCard(item, false));
  });
}

function refreshBankBank() {
  $bankBankSlots.empty();
  var d1 = $("<div/>").addClass("bankBankHeadContainer");
  var d2 = $("<div/>").addClass("bankBankHead").html("Bank (".concat(BankManager.slots.length, "/").concat(BankManager.maxSlots(), ")"));
  var d3 = $("<div/>").attr("id", "sortBank").addClass("sortBank actionButton").html("Sort Bank");
  d1.append(d2, d3);
  $bankBankSlots.append(d1);
  BankManager.slots.forEach(function (item) {
    $bankBankSlots.append(itemCard(item, true));
  });
}

function itemCard(item, inBank) {
  var itemdiv = $("<div/>").addClass("bankItem").addClass("R" + item.rarity);
  var itemName = $("<div/>").addClass("bankItemName itemName").html(item.picName());
  var itemLevel = $("<div/>").addClass("bankItemLevel").html(item.itemLevel());
  if (item.item.recipeType === "building") itemLevel.hide();
  var itemProps = $("<div/>").addClass("bankProps");

  for (var _i = 0, _Object$entries = Object.entries(item.itemStat(false)); _i < _Object$entries.length; _i++) {
    var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
        stat = _Object$entries$_i[0],
        val = _Object$entries$_i[1];

    if (val === 0) continue;
    $("<div/>").addClass("invPropStat tooltip").attr("data-tooltip", stat).html("".concat(miscIcons[stat], " ").concat(val)).appendTo(itemProps);
  }

  var locationButton = $("<div/>").attr("containerID", item.containerID);
  if (inBank) locationButton.addClass('bankTake').html("Take");else locationButton.addClass('bankStow').html("Stow");
  return itemdiv.append(itemName, itemLevel, itemProps, locationButton);
}

$(document).on("click", ".bankTake", function (e) {
  e.preventDefault();
  var containerID = parseInt($(e.target).attr("containerID"));
  BankManager.removeFromBank(containerID);
});
$(document).on("click", ".bankStow", function (e) {
  e.preventDefault();
  var containerID = parseInt($(e.target).attr("containerID"));
  BankManager.addFromInventory(containerID);
});
$(document).on("click", "#sortBank", function (e) {
  e.preventDefault();
  BankManager.sortBank();
});
$(document).on("click", "#sortInventoryBank", function (e) {
  e.preventDefault();
  Inventory.sortInventory();
});
//# sourceMappingURL=bank.js.map