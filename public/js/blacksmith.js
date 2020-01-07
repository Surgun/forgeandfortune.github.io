"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var $smithBuilding = $("#smithBuilding");
var $smithInvSlots = $("#smithInvSlots");
var $smithOriginal = $("#smithOriginal");
var $smithImproved = $("#smithImproved");
var $smithMax = $("#smithMax");
var $smithConfirm = $("#smithConfirm");
var $smithCanImproveDiv = $("#smithCanImproveDiv");
var $smithCantImproveDiv = $("#smithCantImproveDiv");
var $smithNoSelectionDiv = $("#smithNoSelectionDiv");
var $smithHeroSlots = $("#smithHeroSlots");
var bloopSmith = {
  smithStage: null,
  lvl: 1,
  heroView: null,
  createSave: function createSave() {
    var save = {};
    save.lvl = this.lvl;
    return save;
  },
  loadSave: function loadSave(save) {
    if (save.lvl !== undefined) this.lvl = save.lvl;
  },
  addSmith: function addSmith(containerID, location) {
    var item = location === "inventory" ? Inventory.containerToItem(containerID) : HeroManager.getContainerID(containerID);
    if (item.sharp >= this.maxSharp()) return Notifications.cantSmithMax();
    this.smithStage = item;
    refreshSmithStage();
  },
  getSmithCost: function getSmithCost() {
    var item = bloopSmith.smithStage;
    var amt = [25, 50, 75, 100, 150, 200, 250, 300, 400, 500];
    return {
      "gold": Math.floor(item.goldValue() * miscLoadedValues.smithChance[item.sharp]),
      "resType": item.material(),
      "resAmt": amt[item.sharp]
    };
  },
  smith: function smith() {
    if (this.smithStage === null) return;
    var params = this.getSmithCost();

    if (ResourceManager.materialAvailable("M001") < params.gold) {
      Notifications.cantAffordSmithGold();
      return;
    }

    if (ResourceManager.materialAvailable(params.resType) < params.resAmt) {
      Notifications.cantAffordSmithMaterials(ResourceManager.idToMaterial(params.resType).name, params.resAmt - ResourceManager.materialAvailable(params.resType));
      return;
    }

    ResourceManager.deductMoney(params.gold);
    ResourceManager.addMaterial(params.resType, -params.resAmt);
    this.smithStage.sharp += 1;
    Notifications.smithSuccess(this.smithStage.name);
    refreshInventoryPlaces();
    refreshSmithStage();
  },
  maxSharp: function maxSharp() {
    if (this.lvl === 1) return 3;
    if (this.lvl === 2) return 6;
    return 10;
  },
  canImprove: function canImprove() {
    return this.smithStage.sharp < this.maxSharp();
  },
  addLevel: function addLevel() {
    this.lvl += 1;
    refreshSmithInventory();
    refreshSmithStage();
  }
};

function initiateForgeBldg() {
  $smithBuilding.show();
  bloopSmith.smithStage = null;
  bloopSmith.heroView = null;
  refreshSmithInventory();
  refreshSmithStage();
}

function refreshSmithInventory() {
  $smithInvSlots.empty();
  $smithHeroSlots.empty();
  var invItems = Inventory.nonblank().filter(function (i) {
    return i.sharp < bloopSmith.maxSharp() && i.item.recipeType === "normal";
  });

  if (invItems.length === 0) {
    $("<div/>").addClass("smithInvBlank").html("No Items in Inventory").appendTo($smithInvSlots);
  } else {
    invItems.forEach(function (item) {
      $smithInvSlots.append(itemCardSmith(item, "inventory", ""));
    });
  }

  if (bloopSmith.heroView === null) {
    HeroManager.heroes.filter(function (hero) {
      return hero.owned;
    }).forEach(function (hero) {
      var heroButton = $("<div/>").addClass("smithHeroButton").data("heroID", hero.id).html("".concat(hero.head)).appendTo($smithHeroSlots);
      $("<div/>").addClass('smithHeroButtonName').html("".concat(hero.name)).appendTo(heroButton);
    });
  } else {
    var smithBackButton = $("<div/>").addClass("smithActionsContainer").appendTo($smithHeroSlots);
    $("<div/>").addClass("smithHeroButton smithHeroBackButton").data("heroID", null).html("<i class=\"fas fa-arrow-left\"></i> Select a different Hero").appendTo(smithBackButton);
    var hero = HeroManager.idToHero(bloopSmith.heroView);
    hero.getEquipSlots(true).forEach(function (gear) {
      if (gear.isTrinket()) return;
      $smithHeroSlots.append(itemCardSmith(gear, "gear", "Equipped to ".concat(hero.name)));
    });
  }
}

;

function refreshSmithStage() {
  if (bloopSmith.smithStage !== null && !Inventory.hasContainer(bloopSmith.smithStage.containerID) && !HeroManager.hasContainer(bloopSmith.smithStage.containerID)) {
    bloopSmith.smithStage = null;
  }

  if (bloopSmith.smithStage === null) {
    $smithNoSelectionDiv.show();
    $smithCanImproveDiv.hide();
    $smithCantImproveDiv.hide();
    return;
  }

  ;

  if (!bloopSmith.canImprove()) {
    $smithCanImproveDiv.hide();
    $smithCantImproveDiv.show();
    $smithNoSelectionDiv.hide();
    $smithMax.html(itemStageCardSmith(bloopSmith.smithStage, false));
    return;
  }

  $smithCanImproveDiv.show();
  $smithCantImproveDiv.hide();
  $smithNoSelectionDiv.hide();
  $smithOriginal.html(itemStageCardSmith(bloopSmith.smithStage, false));
  $smithImproved.html(itemStageCardSmith(bloopSmith.smithStage, true));
  var params = bloopSmith.getSmithCost();
  var improveText = $("<div/>").addClass("improveText").html("Improve for");
  var improveCost = $("<div/>").addClass("improveCostContainer");
  $("<div/>").addClass("improveCost tooltip").attr({
    "data-tooltip": "gold_value",
    "data-tooltip-value": params.gold
  }).html("".concat(miscIcons.gold, " ").concat(formatToUnits(params.gold, 2))).appendTo(improveCost);
  $("<div/>").addClass("improveCost tooltip").attr({
    "data-tooltip": "material_desc",
    "data-tooltip-value": params.resType
  }).html("".concat(ResourceManager.idToMaterial(params.resType).img, " ").concat(params.resAmt)).appendTo(improveCost);
  $smithConfirm.empty().append(improveText, improveCost);
}

function itemCardSmith(item, location, locationText) {
  var itemdiv = $("<div/>").addClass("smithItem").addClass("R" + item.rarity);
  $("<div/>").addClass("smithItemName itemName").html(item.picName()).appendTo(itemdiv);
  $("<div/>").addClass("smithItemLevel").html(item.itemLevel()).appendTo(itemdiv);
  $("<div/>").addClass("smithItemMaterial tooltip").attr({
    "data-tooltip": "material_desc",
    "data-tooltip-value": item.material()
  }).html(ResourceManager.materialIcon(item.material())).appendTo(itemdiv);
  var itemProps = $("<div/>").addClass("smithProps").appendTo(itemdiv);

  for (var _i = 0, _Object$entries = Object.entries(item.itemStat(false)); _i < _Object$entries.length; _i++) {
    var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
        stat = _Object$entries$_i[0],
        val = _Object$entries$_i[1];

    if (val === 0) continue;
    $("<div/>").addClass("invPropStat tooltip").attr("data-tooltip", stat).html("".concat(miscIcons[stat], " ").concat(val)).appendTo(itemProps);
  }

  if (locationText !== "") $("<div/>").addClass("smithItemLocation").html(locationText).appendTo(itemdiv);
  $("<div/>").addClass("smithStage").attr("containerID", item.containerID).data("location", location).html("Smith").appendTo(itemdiv);
  return itemdiv;
}

function itemStageCardSmith(slot, upgrade) {
  if (slot === null) return;
  var itemdiv = $("<div/>").addClass("smithItem").addClass("R" + slot.rarity);
  var itemName = $("<div/>").addClass("smithItemName itemName");
  if (upgrade) itemName.html(slot.picNamePlus());else itemName.html(slot.picName());
  var itemLevel = $("<div/>").addClass("smithItemLevel").html(slot.itemLevel());
  var itemMaterial = $("<div/>").addClass("smithItemMaterial tooltip").attr({
    "data-tooltip": "material_desc",
    "data-tooltip-value": slot.material()
  }).html(ResourceManager.materialIcon(slot.material()));
  var itemProps = $("<div/>").addClass("smithProps");
  var d = $("<div/>").addClass("invProp").appendTo(itemProps);

  for (var _i2 = 0, _Object$entries2 = Object.entries(slot.itemStat(upgrade)); _i2 < _Object$entries2.length; _i2++) {
    var _Object$entries2$_i = _slicedToArray(_Object$entries2[_i2], 2),
        stat = _Object$entries2$_i[0],
        val = _Object$entries2$_i[1];

    if (val === 0) continue;
    $("<div/>").addClass("invPropStat tooltip").attr("data-tooltip", stat).html("".concat(miscIcons[stat], " ").concat(val)).appendTo(d);
  }

  return itemdiv.append(itemName, itemLevel, itemMaterial, itemProps);
}

$(document).on("click", ".smithStage", function (e) {
  e.preventDefault();
  var containerID = parseInt($(e.target).attr("containerID"));
  var location = $(e.target).data("location");
  bloopSmith.addSmith(containerID, location);
  refreshSmithStage();
});
$(document).on("click", "#smithConfirm", function (e) {
  e.preventDefault();
  destroyTooltip();
  bloopSmith.smith();
});
$(document).on("click", ".smithHeroButton", function (e) {
  var heroID = $(e.currentTarget).data("heroID");
  bloopSmith.heroView = heroID;
  refreshSmithInventory();
});