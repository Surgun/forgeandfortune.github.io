"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

$('#inventory').on("click", ".inventorySell", function (e) {
  e.preventDefault();
  var id = $(e.target).attr("id");
  Inventory.sellInventoryIndex(id);
});
$(document).on("click", "#sortInventory", function (e) {
  e.preventDefault();
  Inventory.sortInventory();
});
$(document).on("click", "#sellAllCommons", function (e) {
  e.preventDefault();
  Inventory.sellCommons();
  Inventory.sortInventory();
});
$(document).on("click", ".inventoryEquip", function (e) {
  e.preventDefault();
  var invID = $(e.target).attr("id");
  gearEquipFromInventory(invID);
});
$(document).on("click", "#closeEquipItem", function (e) {
  e.preventDefault();
  $(".tabcontent").hide();
  $("#inventoryTab").show();
});
$(document).on("click", ".heroEquipBlockEquipButton", function (e) {
  var heroID = $(e.target).attr("hid");
  var equippingTo = parseInt($(e.target).attr("sid"));
  HeroManager.equipItem(equipContainerTarget.containerID, heroID, equippingTo);
  if (HeroManager.heroView === heroID) examineHero(heroID);
  $(".tabcontent").hide();
  $("#inventoryTab").show();
});
var containerid = 0;

var itemContainer =
/*#__PURE__*/
function () {
  function itemContainer(id, rarity) {
    _classCallCheck(this, itemContainer);

    this.id = id;
    this.item = recipeList.idToItem(id);
    this.name = this.item.name;
    this.type = this.item.type;
    this.lvl = this.item.lvl;
    this.rarity = rarity;
    this.containerID = containerid;
    this.sharp = 0;
    this.seed = Math.floor(Math.random() * 1000000);
    this.scale = 0;
    this.powRatio = this.item.pow;
    this.hpRatio = this.item.hp;
    this.techRatio = this.item.tech;
    this.pts = this.item.pts;
    containerid += 1;
  }

  _createClass(itemContainer, [{
    key: "uniqueID",
    value: function uniqueID() {
      var result = this.id + "_" + this.rarity + "_" + this.sharp;
      if (this.scale > 0) return result + "_" + this.scale;
      return result;
    }
  }, {
    key: "createSave",
    value: function createSave() {
      var save = {};
      save.id = this.id;
      save.rarity = this.rarity;
      save.sharp = this.sharp;
      save.seed = this.seed;
      save.scale = this.scale;
      save.powRatio = this.powRatio;
      save.hpRatio = this.hpRatio;
      save.techRatio = this.techRatio;
      return save;
    }
  }, {
    key: "loadSave",
    value: function loadSave(save) {
      this.sharp = save.sharp;
      if (save.seed !== undefined) this.seed = save.seed;
      if (save.scale !== undefined) this.scale = save.scale;
      if (save.powRatio !== undefined) this.powRatio = save.powRatio;
      if (save.hpRatio !== undefined) this.hpRatio = save.hpRatio;
      if (save.techRatio !== undefined) this.techRatio = save.techRatio;
    }
  }, {
    key: "picName",
    value: function picName() {
      var sharp = this.sharp > 0 ? "+".concat(this.sharp, " ") : "";
      return "".concat(this.item.itemPic(), "<div class=\"item-prefix-name\"><span class=\"item-prefix\">").concat(sharp).concat(this.prefix()).concat(this.item.name, "</span></div>");
    }
  }, {
    key: "picNamePlus",
    value: function picNamePlus() {
      var sharp = "<span class=\"item-prefix\">+".concat(this.sharp + 1, " </span>");
      return "".concat(this.item.itemPic(), "<div class=\"item-prefix-name\"><span class=\"item-prefix\">").concat(sharp).concat(this.prefix()).concat(this.item.name, "</span></div>");
    }
  }, {
    key: "itemLevel",
    value: function itemLevel() {
      if (this.scale > 0) return "<div class=\"level_text\">".concat(miscIcons.star, "</div><div class=\"level_integer\">").concat(this.scale, "</div>");
      return "<div class=\"level_text\">LVL</div><div class=\"level_integer\">".concat(this.lvl, "</div>");
    }
  }, {
    key: "pow",
    value: function pow() {
      var sharpIncrease = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var ratioMod = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      return this.statCalc(Math.max(0, this.powRatio + ratioMod) * this.pts, this.item.powScale, sharpIncrease);
    }
  }, {
    key: "hp",
    value: function hp() {
      var sharpIncrease = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var ratioMod = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      return this.statCalc(Math.max(0, 9 * (this.hpRatio + ratioMod)) * this.pts, this.item.hpScale, sharpIncrease);
    }
  }, {
    key: "tech",
    value: function tech() {
      var sharpIncrease = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var ratioMod = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      return this.statCalc(Math.max(0, this.techRatio + ratioMod) * this.pts, this.item.techScale, sharpIncrease);
    }
  }, {
    key: "statCalc",
    value: function statCalc(flat, scale, sharpIncrease) {
      var sharpAdd = sharpIncrease ? 1 : 0;
      return Math.floor((flat * miscLoadedValues.rarityMod[this.rarity] + Math.ceil(scale * this.scale)) * (1 + 0.05 * (this.sharp + sharpAdd)));
    }
  }, {
    key: "goldValueFormatted",
    value: function goldValueFormatted() {
      return "".concat(ResourceManager.materialIcon("M001"), " <span class=\"goldValue\">").concat(formatToUnits(this.goldValue(), 2), "</span>");
    }
  }, {
    key: "goldValue",
    value: function goldValue() {
      return Math.round(this.item.value * (this.rarity + 1) * (1 + this.sharp * 0.1));
    }
  }, {
    key: "material",
    value: function material() {
      if (!this.item.mcost) return "M201";
      return Object.keys(this.item.mcost)[0];
    }
  }, {
    key: "deconType",
    value: function deconType() {
      return this.item.deconType;
    }
  }, {
    key: "deconAmt",
    value: function deconAmt() {
      return Math.floor(this.item.craftTime / 4000);
    }
  }, {
    key: "itemStat",
    value: function itemStat() {
      var sharpIncrease = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var powRatio = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var hpRatio = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
      var techRatio = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
      var stats = {};
      stats[heroStat.pow] = this.pow(sharpIncrease, powRatio);
      stats[heroStat.hp] = this.hp(sharpIncrease, hpRatio);
      stats[heroStat.tech] = this.tech(sharpIncrease, techRatio);
      return stats;
    }
  }, {
    key: "isTrinket",
    value: function isTrinket() {
      return this.item.type === "Trinkets";
    }
  }, {
    key: "prefix",
    value: function prefix() {
      if (this.powRatio === this.item.pow && this.hpRatio === this.item.hp && this.techRatio === this.item.tech) return "";
      return "".concat(adjective[this.powRatio.toString() + this.hpRatio.toString() + this.techRatio.toString()], " ");
    }
  }, {
    key: "transform",
    value: function transform(ratio) {
      this.powRatio = Math.max(0, this.powRatio + ratio[0]);
      this.hpRatio = Math.max(0, this.hpRatio + ratio[1]);
      this.techRatio = Math.max(0, this.techRatio + ratio[2]);
    }
  }, {
    key: "maxRatio",
    value: function maxRatio() {
      return Math.max(this.powRatio, this.hpRatio, this.techRatio);
    }
  }]);

  return itemContainer;
}();

var adjective = {
  "300": "Powerful",
  "210": "Sturdy",
  "201": "Strong",
  "120": "Mighty",
  "111": "Balanced",
  "102": "Potent",
  "012": "Wonderous",
  "021": "Unwieldy",
  "030": "Bulky",
  "003": "Mystical"
};
var rarities = {
  0: "Common",
  1: "Good",
  2: "Great",
  3: "Epic"
};

function blankItemStat() {
  var stats = {};
  stats[heroStat.pow] = 0;
  stats[heroStat.hp] = 0;
  stats[heroStat.tech] = 0;
  return stats;
}

var Inventory = {
  inv: createArray(20, null),
  invMax: 20,
  createSave: function createSave() {
    var save = [];
    this.inv.forEach(function (i) {
      if (i === null) save.push(null);else save.push(i.createSave());
    });
    return save;
  },
  loadSave: function loadSave(save) {
    var _this = this;

    save.forEach(function (item, i) {
      if (item === null) return;
      var container = new itemContainer(item.id, item.rarity);
      container.loadSave(item);
      _this.inv[i] = container;
    });
  },
  addFuseToInventory: function addFuseToInventory(fuse) {
    if (this.full()) return;
    var container = new itemContainer(fuse.id, fuse.rarity);
    container.sharp = fuse.sharp;
    this.findempty(container);
    var item = recipeList.idToItem(container.id);

    if (examineGearTypesCache.includes(item.type)) {
      examineHeroPossibleEquip(examineGearSlotCache, examineGearHeroIDCache);
    }
  },
  addToInventory: function addToInventory(container, skipAnimation) {
    if (this.full()) this.sellContainer(container);else {
      this.findempty(container, skipAnimation);

      if (examineGearTypesCache.includes(container.item.type)) {
        examineHeroPossibleEquip(examineGearSlotCache, examineGearHeroIDCache, skipAnimation);
      }
    }
  },
  findempty: function findempty(item, skipAnimation) {
    var i = this.inv.findIndex(function (r) {
      return r === null;
    });
    this.inv[i] = item;
    if (skipAnimation) return;
    refreshInventoryPlaces();
  },
  craftToInventory: function craftToInventory(id, skipAnimation) {
    if (TownManager.buildingRecipes().includes(id)) return TownManager.unlockBldg(id);
    var item = recipeList.idToItem(id);
    item.addCount(skipAnimation);
    var roll = Math.floor(Math.random() * 1000);
    var sellToggleChart = {
      "None": 0,
      "Common": 1,
      "Good": 2,
      "Great": 3,
      "Epic": 4
    };
    var sellToggle = sellToggleChart[item.autoSell];
    var procRate = this.craftChance(item);

    if (roll < procRate.epic) {
      var epicItem = new itemContainer(id, 3);

      if (sellToggle < 4) {
        this.addToInventory(epicItem, skipAnimation);
        Notifications.exceptionalCraft(item.name, "Epic", "craftEpic");
      } else this.sellContainer(epicItem, skipAnimation);

      achievementStats.craftedItem("Epic");
    } else if (roll < procRate.epic + procRate.great) {
      var greatItem = new itemContainer(id, 2);

      if (sellToggle < 3) {
        this.addToInventory(greatItem, skipAnimation);
        Notifications.exceptionalCraft(item.name, "Great", "craftGreat");
      } else this.sellContainer(greatItem, skipAnimation);

      achievementStats.craftedItem("Great");
    } else if (roll < procRate.epic + procRate.great + procRate.good) {
      var goodItem = new itemContainer(id, 1);

      if (sellToggle < 2) {
        this.addToInventory(goodItem, skipAnimation);
        Notifications.exceptionalCraft(item.name, "Good", "craftGood");
      } else this.sellContainer(goodItem, skipAnimation);

      achievementStats.craftedItem("Good");
    } else {
      var commonItem = new itemContainer(id, 0);
      if (sellToggle < 1) this.addToInventory(commonItem, skipAnimation);else this.sellContainer(commonItem, skipAnimation);
      achievementStats.craftedItem("Common");
    }
  },
  craftChance: function craftChance(item) {
    var masterMod = item.isMastered() ? 2 : 1;
    var fortuneMod = FortuneManager.getProcModifier(item.type, item.lvl);
    var mods = {};
    mods.good = miscLoadedValues.qualityCheck[1] * masterMod * fortuneMod[0];
    mods.great = miscLoadedValues.qualityCheck[2] * masterMod * fortuneMod[1];
    mods.epic = miscLoadedValues.qualityCheck[3] * masterMod * fortuneMod[2];
    return mods;
  },
  removeFromInventoryUID: function removeFromInventoryUID(uniqueID) {
    var container = this.nonblank().find(function (i) {
      return i.uniqueID() === uniqueID;
    });
    this.removeContainerFromInventory(container.containerID);
    refreshInventoryPlaces();
  },
  removeContainerFromInventory: function removeContainerFromInventory(containerID) {
    this.inv = this.inv.filter(function (c) {
      return c === null || c.containerID !== containerID;
    });
    this.inv.push(null);
    refreshInventoryPlaces();
  },
  hasContainer: function hasContainer(containerID) {
    return this.nonblank().some(function (c) {
      return c.containerID === containerID;
    });
  },
  sellInventoryIndex: function sellInventoryIndex(indx) {
    var item = this.inv[indx];
    this.inv[indx] = null;
    this.sellContainer(item);
    refreshInventoryPlaces();
  },
  sellContainer: function sellContainer(container, skipAnimation) {
    var tinkerAteIt = TinkerManager.feedCommon(container);
    if (tinkerAteIt) return;
    var gold = container.goldValue();
    achievementStats.gold(gold);
    ResourceManager.addMaterial("M001", gold, skipAnimation);
  },
  listbyType: function listbyType(types) {
    return this.nonblank().filter(function (r) {
      return types.includes(r.type);
    });
  },
  containerToItem: function containerToItem(containerID) {
    return this.nonblank().find(function (r) {
      return r.containerID === containerID;
    });
  },
  full: function full() {
    var modifier = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
    return this.nonblank().length > this.inv.length - modifier;
  },
  inventoryCount: function inventoryCount() {
    return this.nonblank().length;
  },
  nonblank: function nonblank() {
    return this.inv.filter(function (r) {
      return r !== null;
    });
  },
  sortInventory: function sortInventory() {
    this.inv = this.inv.filter(function (c) {
      return c !== null;
    });
    this.inv.sort(function (a, b) {
      return inventorySort(a, b);
    });

    while (this.inv.length < this.invMax) {
      this.inv.push(null);
    }

    refreshInventoryPlaces();
  },
  getMaxPowByTypes: function getMaxPowByTypes(types) {
    //given a list of types, return highest power
    var pows = this.inv.filter(function (i) {
      return i !== null && types.includes(i.type);
    }).map(function (p) {
      return p.pow();
    });
    if (pows.length === 0) return 0;
    return Math.max.apply(Math, _toConsumableArray(pows));
  },
  getMaxHPByTypes: function getMaxHPByTypes(types) {
    //given a list of types, return highest power
    var hps = this.inv.filter(function (i) {
      return i !== null && types.includes(i.type);
    }).map(function (p) {
      return p.hp();
    });
    if (hps.length === 0) return 0;
    return Math.max.apply(Math, _toConsumableArray(hps));
  },
  sellCommons: function sellCommons() {
    var _this2 = this;

    this.inv.forEach(function (ic, indx) {
      if (ic !== null && ic.rarity === 0 && ic.item.recipeType === "normal") _this2.sellInventoryIndex(indx);
    });
  },
  getFusePossibilities: function getFusePossibilities() {
    var fuses = this.nonblank().filter(function (container) {
      return container.item.recipeType === "normal";
    }).map(function (container) {
      return container.uniqueID();
    });
    var fuseSorted = fuses.reduce(function (fuseList, item) {
      if (item in fuseList) fuseList[item]++;else fuseList[item] = 1;
      return fuseList;
    }, {});
    var fuseFiltered = [];

    for (var _i = 0, _Object$entries = Object.entries(fuseSorted); _i < _Object$entries.length; _i++) {
      var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
          idR = _Object$entries$_i[0],
          num = _Object$entries$_i[1];

      if (num < 3) continue;
      var fuse = uniqueIDProperties(idR);
      fuse.rarity += 1;
      if (fuse.rarity > 3) continue;
      fuseFiltered.push(fuse);
    }

    return fuseFiltered;
  },
  hasThree: function hasThree(uniqueID) {
    var inv = this.nonblank().filter(function (i) {
      return i.uniqueID() === uniqueID;
    });
    return inv.length >= 3;
  },
  itemCount: function itemCount(id, rarity) {
    return this.nonblank().filter(function (r) {
      return r.id === id && r.rarity === rarity;
    }).length;
  },
  itemCountAll: function itemCountAll(id) {
    return this.nonblank().filter(function (r) {
      return r.id === id;
    }).length;
  },
  itemCountSpecific: function itemCountSpecific(uniqueID) {
    return this.nonblank().filter(function (i) {
      return i.uniqueID() === uniqueID;
    }).length;
  },
  findCraftMatch: function findCraftMatch(uniqueID) {
    return this.nonblank().find(function (i) {
      return i.uniqueID() === uniqueID;
    });
  },
  higherRarity: function higherRarity() {
    return this.nonblank().filter(function (i) {
      return i.rarity > 0;
    });
  },
  nonEpic: function nonEpic() {
    return this.nonblank().filter(function (i) {
      return i.rarity < 3 && i.item.recipeType === "normal";
    });
  }
};

function uniqueIDProperties(uniqueID) {
  var props = uniqueID.split("_");
  var item = {};
  item.uniqueID = uniqueID;
  item.id = props[0];
  var recipe = recipeList.idToItem(item.id);
  item.rarity = parseInt(props[1]);
  item.sharp = parseInt(props[2]);
  item.name = item.sharp > 0 ? "".concat(recipe.itemPic(), " +").concat(item.sharp, " ").concat(recipe.name) : "".concat(recipe.itemPic(), " ").concat(recipe.name);
  return item;
}

var $inventory = $("#inventory");
var $sideInventory = $("#inventorySidebar");
var $sideInventoryAmt = $("#invSidebarAmt");

function refreshInventory() {
  $inventory.empty(); //build the sorted inventory

  Inventory.inv.forEach(function (item, i) {
    var itemdiv = $("<div/>").addClass("inventoryItem");
    var itemName = $("<div/>").addClass("inventoryItemName");
    var itemRarity = $("<div/>").addClass("inventoryItemRarity");
    var itemLevel = $("<div/>").addClass("inventoryItemLevel");
    var itemCost = $("<div/>").addClass("inventoryItemValue");
    var itemProps = $("<div/>").addClass("inventoryProps");
    var actionBtns = $("<div/>").addClass("inventoryButtons");

    if (item === null) {
      // Empty Inventory Item Filler for Styling
      itemdiv.addClass("inventoryItemEmpty");
      $("<div/>").addClass("inventoryItemEmptyIcon").html(miscIcons.emptySlot).appendTo(itemName);
      $("<div/>").addClass("inventoryItemEmptyText").html("Empty Slot").appendTo(itemName);
      $("<div/>").addClass("invPropStat").html("<span></span>").appendTo(itemProps);
      $("<div/>").addClass("invPropStat").html("<span></span>").appendTo(itemProps);
      $("<div/>").addClass("invPropStat").html("<span></span>").appendTo(itemProps);
      $("<div/>").appendTo(actionBtns);
      $("<div/>").appendTo(actionBtns);
      itemdiv.append(itemName, itemRarity, itemLevel, itemProps, actionBtns);
      $inventory.append(itemdiv);
      return;
    }

    itemdiv.addClass("R" + item.rarity);
    itemName.addClass("itemName").attr({
      "id": item.id,
      "r": item.rarity
    }).html(item.picName());
    itemRarity.addClass("RT".concat(item.rarity, " tooltip")).attr({
      "data-tooltip": "rarity_".concat(rarities[item.rarity].toLowerCase())
    }).html(miscIcons.rarity);
    itemCost.addClass("tooltip").attr({
      "data-tooltip": "gold_value",
      "data-tooltip-value": formatWithCommas(item.goldValue())
    }).html(item.goldValueFormatted());
    itemLevel.addClass("tooltip").attr({
      "data-tooltip": "item_level"
    }).html(item.itemLevel());

    if (item.goldValue() === 0) {
      itemCost.hide();
    }

    if (item.lvl === 0 && item.scale === 0) {
      itemLevel.hide();
    }

    for (var _i2 = 0, _Object$entries2 = Object.entries(item.itemStat(false)); _i2 < _Object$entries2.length; _i2++) {
      var _Object$entries2$_i = _slicedToArray(_Object$entries2[_i2], 2),
          stat = _Object$entries2$_i[0],
          val = _Object$entries2$_i[1];

      if (val === 0) continue;
      $("<div/>").addClass("invPropStat tooltip").attr("data-tooltip", stat).html("".concat(miscIcons[stat], " <span class=\"statValue\">").concat(val, "</span>")).appendTo(itemProps);
    }

    ;

    if (item.item.recipeType === "normal" || item.item.recipeType === "trinket") {
      $("<div/>").addClass('inventoryEquip').attr("id", i).html("Equip").appendTo(actionBtns);
    }

    if (item.item.recipeType === "trinket") {
      itemLevel.attr({
        "data-tooltip": "star_rating"
      });
      itemRarity.hide();
    }

    if (item.goldValue() > 0) {
      $("<div/>").addClass('inventorySell').attr("id", i).html("Sell").appendTo(actionBtns);
    } else {
      $("<div/>").addClass('inventorySell').attr("id", i).html("Discard").appendTo(actionBtns);
    }

    itemdiv.append(itemName, itemRarity, itemLevel, itemCost, itemProps, actionBtns);
    $inventory.append(itemdiv);
  });
  $sideInventoryAmt.html("".concat(Inventory.inventoryCount(), "/20"));
  if (Inventory.inventoryCount() === 20) $sideInventory.addClass("inventoryFullSide");else $sideInventory.removeClass("inventoryFullSide");
}

function createInventoryCard(container, i) {
  var itemdiv = $("<div/>").addClass("inventoryItem").addClass("R" + container.rarity);
  var itemName = $("<div/>").addClass("inventoryItemName itemName").attr({
    "id": container.id,
    "r": container.rarity
  }).html(container.picName());
  var itemRarity = $("<div/>").addClass("inventoryItemRarity RT".concat(container.rarity, " tooltip")).attr({
    "data-tooltip": "rarity_".concat(rarities[container.rarity].toLowerCase())
  }).html(miscIcons.rarity);
  var itemCost = $("<div/>").addClass("inventoryItemValue tooltip").attr({
    "data-tooltip": "gold_value",
    "data-tooltip-value": formatWithCommas(container.goldValue())
  }).html(container.goldValueFormatted());
  var itemLevel = $("<div/>").addClass("inventoryItemLevel tooltip").attr({
    "data-tooltip": "item_level"
  }).html(container.itemLevel());

  if (container.goldValue() === 0) {
    itemCost.hide();
  }

  if (container.lvl === 0 && container.scale === 0) {
    itemLevel.hide();
  }

  var itemProps = $("<div/>").addClass("inventoryProps");

  for (var _i3 = 0, _Object$entries3 = Object.entries(container.itemStat(false)); _i3 < _Object$entries3.length; _i3++) {
    var _Object$entries3$_i = _slicedToArray(_Object$entries3[_i3], 2),
        stat = _Object$entries3$_i[0],
        val = _Object$entries3$_i[1];

    if (val === 0) continue;
    $("<div/>").addClass("invPropStat tooltip").attr("data-tooltip", stat).html("".concat(miscIcons[stat], " <span class=\"statValue\">").concat(val, "</span>")).appendTo(itemProps);
  }

  ;
  var actionBtns = $("<div/>").addClass("inventoryButtons");

  if (container.item.recipeType === "normal" || container.item.recipeType === "trinket") {
    $("<div/>").addClass('inventoryEquip').attr("id", i).html("Equip").appendTo(actionBtns);
  }

  if (container.item.recipeType === "trinket") {
    itemLevel.attr({
      "data-tooltip": "star_rating"
    });
    itemRarity.hide();
  }

  if (container.goldValue() > 0) {
    $("<div/>").addClass('inventorySell').attr("id", i).html("Sell").appendTo(actionBtns);
  } else {
    $("<div/>").addClass('inventorySell').attr("id", i).html("Discard").appendTo(actionBtns);
  }

  itemdiv.append(itemName, itemRarity, itemLevel, itemCost, itemProps, actionBtns);
  return itemdiv;
}

var equipContainerTarget = null;
var $ietEquip = $("#ietEquip");
var $ietHero = $("#ietHero");

function gearEquipFromInventory(invID) {
  $ietEquip.empty();
  $ietHero.empty();
  equipContainerTarget = Inventory.inv[invID];
  var item = equipContainerTarget.item;
  var itemdiv = $("<div/>").addClass("equipItem");
  itemdiv.addClass("R" + equipContainerTarget.rarity);
  var itemName = $("<div/>").addClass("equipItemName itemName").attr("id", item.id).attr("r", equipContainerTarget.rarity).html(equipContainerTarget.picName());
  var itemRarity = $("<div/>").addClass("inventoryItemRarity RT".concat(equipContainerTarget.rarity, " tooltip")).attr({
    "data-tooltip": "rarity_".concat(rarities[equipContainerTarget.rarity].toLowerCase())
  }).html(miscIcons.rarity);
  var itemLevel = $("<div/>").addClass("equipItemLevel tooltip").attr({
    "data-tooltip": "item_level"
  }).html(equipContainerTarget.itemLevel());
  var itemProps = $("<div/>").addClass("equipItemProps");

  for (var _i4 = 0, _Object$entries4 = Object.entries(equipContainerTarget.itemStat(false)); _i4 < _Object$entries4.length; _i4++) {
    var _Object$entries4$_i = _slicedToArray(_Object$entries4[_i4], 2),
        stat = _Object$entries4$_i[0],
        val = _Object$entries4$_i[1];

    if (val === 0) continue;
    $("<div/>").addClass("invPropStat tooltip").attr("data-tooltip", stat).html("".concat(miscIcons[stat], " <span class=\"statValue\">").concat(val, "</span>")).appendTo(itemProps);
  }

  ;

  if (equipContainerTarget.item.recipeType === "trinket") {
    itemLevel.attr({
      "data-tooltip": "star_rating"
    });
    itemRarity.hide();
  }

  itemdiv.append(itemName, itemRarity, itemLevel, itemProps);
  $ietEquip.html(itemdiv);
  var heroBlocks = HeroManager.slotsByItem(item);
  heroBlocks.forEach(function (hb) {
    var hero = HeroManager.idToHero(hb.id);
    var d = $("<div/>").addClass("heroEquipBlock");
    var d1 = $("<div/>").addClass("heroEquipBlockPic").html(hero.head);
    var d2 = $("<div/>").addClass("heroEquipBlockName").html(hero.name);
    var d3 = $("<div/>").addClass("heroEquipBlockEquips");
    hb.canEquip.forEach(function (tf, i) {
      if (!tf) return;
      var d4 = $("<div/>").addClass("heroEquipBlockEquip").appendTo(d3);
      var currentStats = hero.getSlot(i) ? hero.getSlot(i).itemStat() : blankItemStat();
      var newStats = equipContainerTarget.itemStat();
      var same = true;

      for (var _i5 = 0, _Object$entries5 = Object.entries(newStats); _i5 < _Object$entries5.length; _i5++) {
        var _Object$entries5$_i = _slicedToArray(_Object$entries5[_i5], 2),
            stat = _Object$entries5$_i[0],
            val = _Object$entries5$_i[1];

        var deltaStat = val - currentStats[stat];
        if (deltaStat === 0 && val === 0) continue;
        same = false;
        var d4a = $('<div/>').addClass('heroEquipBlockEquipStat tooltip').attr("data-tooltip", stat).appendTo(d4);
        if (deltaStat > 0) d4a.addClass("hebPositive").html("".concat(miscIcons[stat], " <span class=\"statValue\">").concat(val, " (+").concat(deltaStat, ")</span>"));else if (deltaStat < 0) d4a.addClass("hebNegative").html("".concat(miscIcons[stat], " <span class=\"statValue\">").concat(val, " (").concat(deltaStat, ")</span>"));else d4a.html("".concat(miscIcons[stat]).concat(val));
      }

      if (same) $("<div/>").addClass("heroEquipBlockEquipStat").html("No Change").appendTo(d4);
      $("<div/>").addClass("heroEquipBlockEquipButton").attr("hid", hb.id).attr("sid", i).html("Equip").appendTo(d4);
    });
    d.append(d1, d2, d3);
    $ietHero.append(d);
  });
  $(".tabcontent").hide();
  $("#inventoryEquipTab").show();
}

function refreshInventoryPlaces() {
  refreshInventory();
  refreshCardInvCount();
  refreshOrderInvCount();
  refreshPossibleFuse();
  refreshBankInventory();
  refreshSmithInventory();
  refreshSmithStage();
  refreshSynthInventory();
  refreshFortuneGear();
  refreshTrinketInventory();
}
//# sourceMappingURL=inventory.js.map