"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var ItemType = ["Heavy", "Light", "Arcane", "Armor", "Belts", "Cloaks", "Gauntlets", "Gloves", "Hats", "Helmets", "Masks", "Pendants", "Rings", "Shields", "Shoes", "Thrown", "Tomes", "Vests"];
var $RecipeResults = $("#RecipeResults");

var Item =
/*#__PURE__*/
function () {
  function Item(props) {
    _classCallCheck(this, Item);

    Object.assign(this, props);
    this.craftCount = 0;
    this.mastered = false;
    this.autoSell = "None";
    this.owned = false;
    this.goldComma = this.itemValueCommas(this.value);
  }

  _createClass(Item, [{
    key: "createSave",
    value: function createSave() {
      var save = {};
      save.id = this.id;
      save.craftCount = this.craftCount;
      save.autoSell = this.autoSell;
      save.owned = this.owned;
      save.mastered = this.mastered;
      return save;
    }
  }, {
    key: "loadSave",
    value: function loadSave(save) {
      this.craftCount = save.craftCount;
      this.autoSell = save.autoSell;
      this.owned = save.owned;
      if (save.mastered !== undefined) this.mastered = save.mastered;
    }
  }, {
    key: "itemDescription",
    value: function itemDescription() {
      return this.description;
    }
  }, {
    key: "itemPicName",
    value: function itemPicName() {
      return "<img src='/assets/images/recipes/" + this.type + "/" + this.id + ".png'>" + "<div class='item-name'>" + this.name + "</div>";
    }
  }, {
    key: "itemName",
    value: function itemName() {
      return "<div class='item-name'>" + this.name + "</div>";
    }
  }, {
    key: "itemPic",
    value: function itemPic() {
      return "<img src='/assets/images/recipes/" + this.type + "/" + this.id + ".png'>";
    }
  }, {
    key: "itemLevel",
    value: function itemLevel() {
      return "<div class=\"level_text\">LVL</div><div class=\"level_integer\">".concat(this.lvl, "</div>");
    }
  }, {
    key: "itemValueCommas",
    value: function itemValueCommas() {
      return formatWithCommas(this.value);
    }
  }, {
    key: "itemValueFormatted",
    value: function itemValueFormatted() {
      return formatToUnits(this.value, 2);
    }
  }, {
    key: "itemValue",
    value: function itemValue() {
      return this.value;
    }
  }, {
    key: "visualizeResAndMat",
    value: function visualizeResAndMat() {
      var d = $("<div/>").addClass("itemCost");
      this.gcost.forEach(function (resource) {
        var guild = GuildManager.idToGuild(resource);
        d.append($("<div/>").addClass("indvCost resCost tooltip").attr({
          "data-tooltip": "guild_worker",
          "data-tooltip-value": guild.id
        }).html(guild.icon));
      });
      if (this.mcost === null) return d;

      for (var _i = 0, _Object$entries = Object.entries(this.mcost); _i < _Object$entries.length; _i++) {
        var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
            material = _Object$entries$_i[0],
            amt = _Object$entries$_i[1];

        var mat = ResourceManager.idToMaterial(material);
        var d1 = $("<div/>").addClass("indvCost matCost tooltip").attr("id", "vr" + this.id).attr({
          "data-tooltip": "material_desc",
          "data-tooltip-value": mat.id
        }).html(ResourceManager.formatCost(material, amt));
        d.append(d1);
      }

      return d;
    }
  }, {
    key: "recipeListStats",
    value: function recipeListStats() {
      var d = $("<div/>").addClass("recipeStatList");
      var pow = this.pow * this.pts;
      var hp = 9 * this.hp * this.pts;
      var tech = this.tech * this.pts;
      if (pow > 0) $("<div/>").addClass("recipeStatListPow tooltip").attr("data-tooltip", "pow").html("".concat(miscIcons.pow, "<span class=\"statValue\">").concat(pow, "</span>")).appendTo(d);
      if (hp > 0) $("<div/>").addClass("recipeStatListHP tooltip").attr("data-tooltip", "hp").html("".concat(miscIcons.hp, "<span class=\"statValue\">").concat(hp, "</span>")).appendTo(d);
      if (tech > 0) $("<div/>").addClass("recipeStatListTech tooltip").attr("data-tooltip", "tech").html("".concat(miscIcons.tech, "<span class=\"statValue\">").concat(tech, "</span>")).appendTo(d);
      return d;
    }
  }, {
    key: "count",
    value: function count() {
      return Math.min(this.craftCount, 100);
    }
  }, {
    key: "addCount",
    value: function addCount(skipAnimation) {
      this.craftCount += 1;
      if (skipAnimation) return;
      refreshMasteryBar();
      refreshCraftedCount();
    }
  }, {
    key: "attemptMastery",
    value: function attemptMastery() {
      if (this.isMastered()) return;
      var masteryCost = this.masteryCost();

      if (ResourceManager.materialAvailable(masteryCost.id) < masteryCost.amt) {
        Notifications.recipeMasterNeedMore();
        return;
      }

      ResourceManager.addMaterial(masteryCost.id, -masteryCost.amt);
      this.mastered = true;
      Notifications.masterRecipe(this.name);
      refreshCraftedCount();
      destroyTooltip(); // Removes stuck tooltip after mastering item on recipe card

      refreshProgress();
      refreshMonsterReward();
      GuildManager.repopulateUnmastered();
      refreshAllRecipeMastery();
    }
  }, {
    key: "isMastered",
    value: function isMastered() {
      if (this.recipeType === "building" || this.recipeType === "Trinket") return false;
      return this.mastered;
    }
  }, {
    key: "autoSellToggle",
    value: function autoSellToggle() {
      if (this.autoSell === "None") this.autoSell = "Common";else if (this.autoSell === "Common") this.autoSell = "Good";else if (this.autoSell === "Good") this.autoSell = "Great";else if (this.autoSell === "Great") this.autoSell = "Epic";else this.autoSell = "None";
      return this.autoSell;
    }
  }, {
    key: "setCanCraft",
    value: function setCanCraft(canProduceBucket) {
      var needBucket = groupArray(this.gcost);
      this.canProduce = true;

      for (var _i2 = 0, _Object$entries2 = Object.entries(needBucket); _i2 < _Object$entries2.length; _i2++) {
        var _Object$entries2$_i = _slicedToArray(_Object$entries2[_i2], 2),
            res = _Object$entries2$_i[0],
            amt = _Object$entries2$_i[1];

        if (canProduceBucket[res] === undefined || canProduceBucket[res] < amt) {
          this.canProduce = false;
        }

        ;
      }
    }
  }, {
    key: "material",
    value: function material() {
      if (!this.mcost) return "M201";
      return Object.keys(this.mcost)[0];
    }
  }, {
    key: "reducedCraft",
    value: function reducedCraft() {
      return this.craftTime * MonsterHall.lineIncrease(this.type, 0);
    }
  }, {
    key: "masteryCost",
    value: function masteryCost() {
      var amt = Math.max(this.minMastery, this.maxMastery - this.reductionMastery * this.craftCount);
      var material = this.mcost ? Object.keys(this.mcost)[0] : "M201";
      return new idAmt(material, amt);
    }
  }]);

  return Item;
}();

var recipeList = {
  recipes: [],
  recipeFilterType: "default",
  recipeFilterString: "",
  recipeSortType: "default",
  addItem: function addItem(item) {
    this.recipes.push(item);
  },
  createSave: function createSave() {
    var save = [];
    this.recipes.forEach(function (r) {
      save.push(r.createSave());
    });
    return save;
  },
  loadSave: function loadSave(save) {
    var _this = this;

    save.forEach(function (i) {
      var rec = _this.idToItem(i.id);

      if (rec !== undefined) rec.loadSave(i);
    });
  },
  filteredRecipeList: function filteredRecipeList() {
    var _this2 = this;

    var cleanString = this.recipeFilterString.toLowerCase().replace(/\s+/g, '');
    if (this.recipeFilterType === "default") return this.recipes.filter(function (r) {
      return r.owned && r.name.toLowerCase().includes(cleanString);
    });
    if (this.recipeFilterType === "Matless") return this.recipes.filter(function (r) {
      return r.owned && (r.mcost === null || r.isMastered());
    });
    return this.recipes.filter(function (r) {
      return r.owned && r.type === _this2.recipeFilterType;
    });
  },
  setSortOrder: function setSortOrder(filter) {
    if (this.recipeSortType === filter) this.recipeSortType = this.recipeSortType + "Asc";else this.recipeSortType = filter;
    recipeSort();
  },
  buyRecipe: function buyRecipe(recipeID) {
    var recipe = this.idToItem(recipeID);

    if (ResourceManager.materialAvailable("M001") < recipe.goldCost) {
      Notifications.recipeGoldReq();
      return;
    }

    ResourceManager.deductMoney(recipe.goldCost);
    recipe.owned = true;
    Notifications.buyRecipe(recipe.name);
    refreshRecipeMastery(GuildManager.idToGuild(recipe.guildUnlock));
    refreshRecipeFilters();
    checkCraftableStatus();
    refreshAllSales();
  },
  idToItem: function idToItem(id) {
    return this.recipes.find(function (recipe) {
      return recipe.id === id;
    });
  },
  ownAtLeastOne: function ownAtLeastOne(type) {
    return this.recipes.some(function (r) {
      return r.type === type && r.owned;
    });
  },
  masteryCount: function masteryCount() {
    return this.recipes.filter(function (r) {
      return r.isMastered() && r.recipeType === "normal";
    }).length;
  },
  recipeCount: function recipeCount() {
    return this.recipes.filter(function (r) {
      return r.recipeType === "normal";
    }).length;
  },
  maxTier: function maxTier() {
    var lvls = this.recipes.filter(function (r) {
      return r.owned;
    }).map(function (r) {
      return r.lvl;
    });
    return Math.max.apply(Math, _toConsumableArray(lvls));
  },
  filterByGuild: function filterByGuild(guildID) {
    return this.recipes.filter(function (r) {
      return r.guildUnlock === guildID;
    });
  },
  guildOrderItems: function guildOrderItems(lvl) {
    var _this3 = this;

    var items = [];
    ItemType.forEach(function (type) {
      var typeList = _this3.recipes.filter(function (r) {
        return r.type === type;
      });

      var guildWork = typeList.filter(function (r) {
        return r.repReq <= lvl;
      });
      var guildWorkRepReq = guildWork.map(function (r) {
        return r.repReq;
      });
      var chosenRepReq = Math.max.apply(Math, _toConsumableArray(guildWorkRepReq));
      var item = guildWork.find(function (r) {
        return r.repReq === chosenRepReq;
      });
      if (item !== undefined) items.push(item);
    });
    return items;
  },
  canCraft: function canCraft() {
    var canProduce = WorkerManager.getCurrentProduceAvailable();
    this.recipes.forEach(function (recipe) {
      recipe.setCanCraft(canProduce);
    });
    recipeCanCraft();
  },
  attemptMastery: function attemptMastery(recipeID) {
    this.idToItem(recipeID).attemptMastery();
  },
  unmasteredByGuild: function unmasteredByGuild(guild) {
    return this.recipes.filter(function (r) {
      return r.guildUnlock === guild && !r.mastered && r.owned;
    }).map(function (r) {
      return r.id;
    });
  }
};
var $recipeActionButton = $(".recipeActionButton"); //click the sort by name value etc at the top

$(document).on("click", ".recipeActionButton", function (e) {
  e.preventDefault();
  var toggleFilterA = $(e.currentTarget).hasClass("filterActive") && !$(e.currentTarget).hasClass("toggleFilter");
  $recipeActionButton.removeClass("filterActive toggleFilter");
  $recipeActionButton.removeClass("toggleFilter");
  $(e.currentTarget).addClass("filterActive");
  if (toggleFilterA) $(e.currentTarget).addClass("toggleFilter");
  var filter = $(e.currentTarget).attr("data-filter");
  recipeList.setSortOrder(filter);
});

function refreshRecipeFilters() {
  //hide recipe buttons if we don't know know a recipe and also can't learn one...
  ItemType.forEach(function (type) {
    var recipeIcon = $("#rf" + type);
    if (recipeList.ownAtLeastOne(type)) recipeIcon.show();else recipeIcon.hide();
  });
}

var $recipeContents = $("#recipeContents");
var sortOrder = {
  "default": [],
  defaultAsc: [],
  name: [],
  nameAsc: [],
  mastery: [],
  masteryAsc: [],
  lvl: [],
  lvlAsc: [],
  time: [],
  timeAsc: [],
  value: [],
  valueAsc: [],
  recipeDivDict: {},
  recipeDivs: null
};

function initializeRecipes() {
  //this is run once at the beginning to load ALL the recipes
  recipeList.recipes.filter(function (r) {
    return r.recipeType === "normal";
  }).forEach(function (recipe) {
    var recipeCardInfo = $('<div/>').addClass('recipeCardInfo').append(recipeCardFront(recipe), recipeCardBack(recipe));
    var recipeCardContainer = $('<div/>').addClass('recipeCardContainer').data("recipeID", recipe.id).attr("id", "rr" + recipe.id).append(recipeCardInfo).hide();
    $recipeContents.append(recipeCardContainer);
    sortOrder.recipeDivDict[recipe.id] = recipeCardContainer;
  });
  var tempList = recipeList.recipes.filter(function (r) {
    return r.recipeType === "normal";
  });
  sortOrder["default"] = tempList.sort(function (a, b) {
    return a.id.localeCompare(b.id);
  }).map(function (r) {
    return r.id;
  });
  sortOrder.defaultAsc = tempList.sort(function (a, b) {
    return b.id.localeCompare(a.id);
  }).map(function (r) {
    return r.id;
  });
  sortOrder.name = tempList.sort(function (a, b) {
    return a.name.localeCompare(b.name);
  }).map(function (r) {
    return r.id;
  });
  sortOrder.nameAsc = tempList.sort(function (a, b) {
    return b.name.localeCompare(a.name);
  }).map(function (r) {
    return r.id;
  });
  sortOrder.mastery = tempList.sort(function (a, b) {
    return Math.min(100, a.craftCount) - Math.min(100, b.craftCount);
  }).map(function (r) {
    return r.id;
  });
  sortOrder.masteryAsc = tempList.sort(function (a, b) {
    return Math.min(100, b.craftCount) - Math.min(100, a.craftCount);
  }).map(function (r) {
    return r.id;
  });
  sortOrder.lvl = tempList.sort(function (a, b) {
    return a.lvl - b.lvl;
  }).map(function (r) {
    return r.id;
  });
  sortOrder.lvlAsc = tempList.sort(function (a, b) {
    return b.lvl - a.lvl;
  }).map(function (r) {
    return r.id;
  });
  sortOrder.time = tempList.sort(function (a, b) {
    return a.craftTime - b.craftTime;
  }).map(function (r) {
    return r.id;
  });
  sortOrder.timeAsc = tempList.sort(function (a, b) {
    return b.craftTime - a.craftTime;
  }).map(function (r) {
    return r.id;
  });
  sortOrder.value = tempList.sort(function (a, b) {
    return a.value - b.value;
  }).map(function (r) {
    return r.id;
  });
  sortOrder.valueAsc = tempList.sort(function (a, b) {
    return b.value - a.value;
  }).map(function (r) {
    return r.id;
  });
  sortOrder.recipeDivs = $(".recipeCardContainer");
}

function recipeSort() {
  //assign a data-sort value to each div then re-order as appropriate
  if (recipeList.recipeSortType === "mastery") {
    var tempList = recipeList.recipes.filter(function (r) {
      return r.recipeType === "normal";
    });
    sortOrder.mastery = tempList.sort(function (a, b) {
      return Math.min(100, a.craftCount) - Math.min(100, b.craftCount);
    }).map(function (r) {
      return r.id;
    });
  }

  if (recipeList.recipeSortType === "masteryAsc") {
    var _tempList = recipeList.recipes.filter(function (r) {
      return r.recipeType === "normal";
    });

    sortOrder.masteryAsc = _tempList.sort(function (a, b) {
      return Math.min(100, b.craftCount) - Math.min(100, a.craftCount);
    }).map(function (r) {
      return r.id;
    });
  }

  var sortedList = sortOrder[recipeList.recipeSortType];
  sortOrder.recipeDivs.sort(function (a, b) {
    //$(".recipeCardContainer").sort((a,b) => {
    var aval = sortedList.indexOf($(a).data("recipeID"));
    var bval = sortedList.indexOf($(b).data("recipeID"));
    return aval > bval ? 1 : -1;
  }).appendTo($recipeContents);
}

function recipeFilterList(n) {
  // if "n" not provided, set to 0
  n = n || 0; //uses two recipeLists to cycle through all the items and display as appropriate

  if (n === 0) Object.values(sortOrder.recipeDivDict).forEach(function (div) {
    return div.hide();
  });
  recipeList.filteredRecipeList().map(function (r) {
    return r.id;
  }).slice(0, n + 30).forEach(function (recipe) {
    sortOrder.recipeDivDict[recipe].show();
  });
}

;

function triggerRecipeLoad() {
  var loadCount = 0;
  recipeList.filteredRecipeList().map(function (r) {
    return r.id;
  }).forEach(function (recipe, i) {
    if (sortOrder.recipeDivDict[recipe].is(":visible")) loadCount = i;
  });
  recipeFilterList(loadCount);
}

$("#recipes-list").scroll(function () {
  var condition1 = $("#RecipeResults").height() - $(this).height() + $("#tabs").height() + $("footer").height() - 10;
  var condition2 = $(this).scrollTop();
  if (condition1 <= condition2 + 400) triggerRecipeLoad();
});

function recipeCardFront(recipe) {
  var td1 = $('<div/>').addClass('recipeName').append(recipe.itemPicName());
  var td2 = $('<div/>').addClass('recipeDescription').html("<i class='fas fa-info-circle'></i>");
  var td3 = $('<div/>').addClass('recipeItemLevel tooltip').attr({
    "data-tooltip": "recipe_level"
  }).html(recipe.itemLevel());
  if (recipe.recipeType !== "normal") td3.hide();
  var td4 = $('<div/>').addClass('recipecostdiv').attr("id", recipe.id + "rcd");
  if (recipe.isMastered()) td4.addClass("isMastered");
  var td4a = $('<div/>').addClass('reciperesdiv').html(recipe.visualizeResAndMat());
  if (recipe.isMastered()) td4a.addClass('isMastered');
  td4.append(td4a);
  var td5 = $('<div/>').addClass('recipeTimeAndValue');
  var td5a = $('<div/>').addClass('recipeTimeContainer tooltip').attr("data-tooltip", "crafting_time");
  var td5a1 = $("<div/>").addClass("recipeTimeHeader recipeCardHeader").html("<i class=\"fas fa-clock\"></i>");
  var td5a2 = $('<div/>').addClass('recipeTime').attr("id", "rt".concat(recipe.id)).html(msToTime(recipe.reducedCraft()));
  td5a.append(td5a1, td5a2);
  var td5b = $('<div/>').addClass('recipeAmountContainer tooltip').attr("data-tooltip", "in_inventory");
  $("<div/>").addClass("recipeAmountHeader recipeCardHeader").html("<i class=\"fas fa-cube\"></i>").appendTo(td5b);
  $('<div/>').addClass('recipeAmount').html("".concat(Inventory.itemCountAll(recipe.id))).appendTo(td5b);
  if (recipe.recipeType !== "normal") td5b.hide();
  var td5c = $('<div/>').addClass('recipeValueContainer tooltip').attr({
    "data-tooltip": "recipe_gold",
    "data-tooltip-value": recipe.id
  });
  $("<div/>").addClass("recipeValueHeader recipeCardHeader").html("<img src='/assets/images/resources/M001.png'>").appendTo(td5c);
  $('<div/>').addClass('recipeValue').html(recipe.itemValueFormatted()).appendTo(td5c);
  if (recipe.recipeType !== "normal") td5c.hide();
  td5.append(td5a, td5b, td5c);
  var td6 = $('<div/>').addClass('recipeCountAndCraft');
  var td6a = $('<div/>').addClass('recipeMasteredStatus').attr("id", "rms" + recipe.id).html("UNMASTERED");
  if (recipe.isMastered()) td6a.addClass('isMastered').html("<i class=\"fas fa-star-christmas\"></i> MASTERED");
  if (recipe.recipeType !== "normal") td6a.hide();
  var td6b = $('<div/>').addClass("recipeCraft rr".concat(recipe.id)).attr("id", recipe.id).html("<i class=\"fas fa-hammer\"></i><span>Craft</span>");
  recipe.recipeDiv = td6b;
  td6.append(td6a, td6b);
  return $('<div/>').addClass('recipeCardFront').append(td1, td2, td3, td4, td5, td6);
}

function refreshCraftTimes() {
  recipeList.recipes.forEach(function (recipe) {
    $("#rt".concat(recipe.id)).html(msToTime(recipe.reducedCraft()));
  });
}

function recipeCardBack(recipe) {
  var td6 = $('<div/>').addClass('recipeClose').html("<i class=\"fas fa-times\"></i>");
  var td7 = $('<div/>').addClass('recipeBackTabContainer');
  var td7a = $('<div/>').addClass('recipeBackTab backTab1 selected').html("Details");
  var td7b = $('<div/>').addClass('recipeBackTab backTab2').html("Mastery");
  td7.append(td7a);
  if (recipe.recipeType === 'normal') td7.append(td7b);
  var td8 = $('<div/>').addClass('recipeTabContainer recipeTabDetails');
  var td8a = $('<div/>').addClass('recipeDetailsContainer');
  var td8a1 = $('<div/>').addClass('recipeBackDescription').html(recipe.itemDescription());
  var td8a2 = $('<div/>').addClass('recipeStats').html(recipe.recipeListStats());
  var td8a3 = $('<div/>').addClass('recipeCrafted').attr("id", "rc" + recipe.id).html("".concat(recipe.craftCount, " crafted"));
  td8a.append(td8a1, td8a2, td8a3);
  td8.append(td8a);
  var td9 = $('<div/>').addClass('recipeTabContainer recipeTabMastery');
  var td9a = $('<div/>').addClass('recipeMasteryContainer');
  var td9a1 = $('<div/>').addClass('recipeBackDescription').attr("id", "rbd" + recipe.id).html("Crafting this recipe will reduce the cost to master it, down to a maximum of 100.");
  var masteryCost = recipe.masteryCost();
  var td9a2 = $('<div/>').addClass('recipeTotalCrafted tooltip').attr({
    "id": "rcc" + recipe.id,
    "data-tooltip": "material_desc",
    "data-tooltip-value": masteryCost.id
  }).data("rid", recipe.id).html("Master for ".concat(masteryCost.amt, " ").concat(ResourceManager.idToMaterial(masteryCost.id).img));

  if (recipe.isMastered()) {
    td9a1.addClass("isMastered").html("You have mastered this recipe. Its material cost has been removed, if any, and its higher rarity crafting chance has been doubled.");
    td9a2.addClass("isMastered").html("<i class=\"fas fa-star-christmas\"></i> MASTERED");
  }

  if (recipe.recipeType !== "normal") td9a2.hide();
  td9a.append(td9a1, td9a2);
  td9.append(td9a);
  return $('<div/>').addClass('recipeCardBack').append(td6, td7, td8, td9);
}

function recipeMasteryBar(craftCount) {
  craftCount = Math.min(100, craftCount);
  var masteryWidth = craftCount.toFixed(1) + "%";
  var masteryBarDiv = $("<div/>").addClass("masteryBarDiv").attr("id", "masteryBarDiv");
  var masteryBar = $("<div/>").addClass("masteryBar").attr("id", "masteryBar");

  if (craftCount >= 100) {
    masteryBarDiv.addClass("isMastered");
    masteryBar.attr("data-label", "Mastered");
  } else masteryBar.attr("data-label", "".concat(craftCount, " / 100"));

  var masteryBarFill = $("<div/>").addClass("masteryBarFill").attr("id", "masteryFill").css('width', masteryWidth);
  return masteryBarDiv.append(masteryBar, masteryBarFill);
}

function refreshMasteryBar() {
  recipeList.recipes.forEach(function (recipe) {
    var rr = $("#rc" + recipe.id);
    rr.html("".concat(recipe.craftCount, " crafted"));
  });
}

function refreshCraftedCount() {
  recipeList.recipes.forEach(function (recipe) {
    var rcc = $("#rcc" + recipe.id);
    var rbd = $("#rbd" + recipe.id);
    var rms = $("#rms" + recipe.id);
    var rcd = $("#" + recipe.id + "rcd");
    var material = recipe.mcost ? Object.keys(recipe.mcost)[0] : "M201";
    rcc.html("Master for ".concat(Math.max(100, 1000 - 9 * recipe.craftCount), " ").concat(ResourceManager.idToMaterial(material).img));

    if (recipe.isMastered()) {
      rbd.addClass("isMastered").html("You have mastered this recipe. Its material cost has been removed, if any, and its higher rarity crafting chance has been doubled.");
      rcc.addClass("isMastered").removeClass("tooltip").html("<i class=\"fas fa-star-christmas\"></i> MASTERED");
      rms.addClass("isMastered").html("<i class=\"fas fa-star-christmas\"></i> MASTERED");
      rcd.find(".matCost").attr({
        "data-tooltip": "material_desc_mastered",
        "data-tooltip-value": material.id
      }).addClass("isMastered");
    }
  });
} // Refresh and show current number of item in inventory on recipe card


function refreshCardInvCount() {
  recipeList.recipes.forEach(function (recipe) {
    var rr = $("#rr" + recipe.id + " .recipeAmount");
    var invCount = Inventory.itemCountAll(recipe.id);
    rr.html(invCount);
  });
}

function recipeCanCraft() {
  //loops through recipes, adds class if disabled
  recipeList.recipes.forEach(function (recipe) {
    if (recipe.recipeType !== "normal") return;
    if (recipe.canProduce) recipe.recipeDiv.removeClass("recipeCraftDisable");else recipe.recipeDiv.addClass("recipeCraftDisable");
  });
}

var $blueprintUnlock = $("#BlueprintUnlock");
var cacheBlueprintType = null;
$(document).on('click', '.recipeCraft', function (e) {
  //click on a recipe to slot it
  e.preventDefault();
  var itemID = $(e.currentTarget).attr("id");
  actionSlotManager.addSlot(itemID);
});
$(document).on('click', '.recipeSelect', function (e) {
  //click on a recipe filter
  e.preventDefault();
  $(".recipeCardInfo").removeClass("recipeCardFlipped");
  $(".recipeCardFront").removeClass("recipeCardDisabled");
  var type = $(e.target).attr("id").substring(2);
  recipeList.recipeFilterType = type;
  recipeList.recipeFilterString = "";
  recipeFilterList();
});
$(document).on('click', '.recipeDescription', function (e) {
  e.preventDefault();
  $(".recipeCardInfo").removeClass("recipeCardFlipped");
  $(".recipeCardFront").removeClass("recipeCardDisabled");
  $(".recipeTabContainer").addClass("none");
  $(".recipeBackTab").removeClass("selected");
  $(".backTab1").addClass("selected");
  $(".recipeTabDetails").removeClass("none");
  $(e.currentTarget).parent().addClass("recipeCardDisabled");
  $(e.currentTarget).parent().parent().addClass("recipeCardFlipped");
});
$(document).on('click', '.recipeTotalCrafted', function (e) {
  e.preventDefault();
  var recipeID = $(e.currentTarget).data("rid");
  recipeList.attemptMastery(recipeID);
});
$(document).on('click', '.recipeClose', function (e) {
  e.preventDefault();
  $(e.currentTarget).parent().prev().removeClass("recipeCardDisabled");
  $(e.currentTarget).parent().parent().removeClass("recipeCardFlipped");
});
$(document).on('click', '.recipeBackTab', function (e) {
  e.preventDefault();
  name = $(e.currentTarget).text();
  $(".recipeTabContainer").addClass("none");
  $(".recipeTab" + name).removeClass("none");
  $(".recipeBackTab").removeClass("selected");
  $(e.currentTarget).addClass("selected");
});
var $recipeSortInput = $("#recipeSortInput"); //clicking button runs search

$(document).on('click', '.recipeSortButton', function (e) {
  e.preventDefault();
  var searchString = $recipeSortInput.val();
  if (searchString.length < 2) return Notifications.searchLengthInvalid();
  recipeList.recipeFilterString = searchString;
  recipeList.recipeFilterType = "default";
  recipeFilterList();
}); //enter key searches if you're in sort input

$(document).on('keydown', '.recipeSortInput', function (e) {
  if (e.keyCode !== 13) return;
  e.preventDefault();
  var searchString = $recipeSortInput.val();
  if (searchString.length < 2) return Notifications.searchLengthInvalid();
  recipeList.recipeFilterString = searchString;
  recipeList.recipeFilterType = "default";
  recipeFilterList();
}); // Prevent hotkey input when search bar focused

$(document).on('focus', '.recipeSortInput', function (e) {
  settings.dialogStatus = 1;
  saveSettings();
});
$(document).on('blur', '.recipeSortInput', function (e) {
  settings.dialogStatus = 0;
  saveSettings();
});
//# sourceMappingURL=recipes.js.map