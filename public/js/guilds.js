"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var GuildManager = {
  guilds: [],
  lastClicked: "G003",
  addGuild: function addGuild(guild) {
    this.guilds.push(guild);
  },
  createSave: function createSave() {
    var save = {};
    save.guilds = [];
    this.guilds.forEach(function (guild) {
      save.guilds.push(guild.createSave());
    });
    return save;
  },
  loadSave: function loadSave(save) {
    var _this = this;

    save.guilds.forEach(function (guildSave) {
      var guild = _this.idToGuild(guildSave.id);

      guild.loadSave(guildSave);
    });
  },
  idToGuild: function idToGuild(id) {
    return this.guilds.find(function (g) {
      return g.id === id;
    });
  },
  submitOrder: function submitOrder(gid) {
    var guild = this.idToGuild(gid);
    guild.submitOrder();
  },
  maxGuildLevel: function maxGuildLevel() {
    return (DungeonManager.bossCount() + 1) * 4 - 1;
  },
  maxLvl: function maxLvl() {
    return Math.max.apply(Math, _toConsumableArray(this.guilds.map(function (g) {
      return g.lvl;
    })));
  },
  repopulateUnmastered: function repopulateUnmastered() {
    this.guilds.forEach(function (g) {
      return g.repopulateUnmastered();
    });
  }
};

var Guild =
/*#__PURE__*/
function () {
  function Guild(props) {
    _classCallCheck(this, Guild);

    Object.assign(this, props);
    this.rep = 0;
    this.lvl = 0;
    this.order1 = null;
    this.order2 = null;
    this.order3 = null;
    this.unmastered = [];
  }

  _createClass(Guild, [{
    key: "createSave",
    value: function createSave() {
      var save = {};
      save.id = this.id;
      save.lvl = this.lvl;
      save.rep = this.rep;
      save.order1 = this.order1.createSave();
      save.order2 = this.order2.createSave();
      save.order3 = this.order3.createSave();
      save.unmastered = this.unmastered;
      return save;
    }
  }, {
    key: "loadSave",
    value: function loadSave(save) {
      this.rep = save.rep;
      this.lvl = save.lvl;
      this.order1 = new guildOrderItem(save.order1.gid, save.order1.id, save.order1.lvl);
      this.order1.loadSave(save.order1);
      this.order2 = new guildOrderItem(save.order2.gid, save.order2.id, save.order2.lvl);
      this.order2.loadSave(save.order2);
      this.order3 = new guildOrderItem(save.order3.gid, save.order3.id, save.order3.lvl);
      this.order3.loadSave(save.order3);
      if (save.unmastered !== undefined) this.unmastered = save.unmastered;
    }
  }, {
    key: "addRep",
    value: function addRep(rep) {
      if (this.maxLvlReached()) return;
      this.rep += rep;

      if (this.rep >= this.repLvl()) {
        this.rep = 0;
        this.lvl += 1;
        refreshAllSales();
      }

      refreshguildprogress(this);
    }
  }, {
    key: "repLvl",
    value: function repLvl(givenlvl) {
      givenlvl = givenlvl || this.lvl;
      return miscLoadedValues["guildRepForLvls"][givenlvl];
    }
  }, {
    key: "recipeToBuy",
    value: function recipeToBuy() {
      return recipeList.filterByGuild(this.id).filter(function (r) {
        return !r.owned && r.repReq <= GuildManager.maxGuildLevel();
      }).sort(function (a, b) {
        return a.repReq - b.repReq;
      });
    }
  }, {
    key: "workers",
    value: function workers() {
      return WorkerManager.filterByGuild(this.id).filter(function (w) {
        return w.owned;
      });
    }
  }, {
    key: "orderComplete",
    value: function orderComplete() {
      if (devtools.orderBypass) return true;
      return this.order.every(function (o) {
        return o.complete();
      });
    }
  }, {
    key: "generateNewOrder",
    value: function generateNewOrder(orderNum) {
      var _this2 = this;

      var previous = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "ignore";
      var possibleItems = recipeList.guildOrderItems(this.lvl);

      if (orderNum === 1) {
        var possibleGuildItems = possibleItems.filter(function (r) {
          return r.guildUnlock === _this2.id;
        });
        if (possibleGuildItems.length > 1) possibleGuildItems = possibleGuildItems.filter(function (r) {
          return r.id !== previous;
        });
        var chosenGuildItem = possibleGuildItems[Math.floor(GuildSeedManager.fauxRand(this.id) * possibleGuildItems.length)];
        this.order1 = new guildOrderItem(this.id, chosenGuildItem.id, this.lvl);
        return;
      }

      if (possibleItems.length > 1) possibleItems = possibleItems.filter(function (r) {
        return r.id !== previous;
      });
      var chosenItem = possibleItems[Math.floor(GuildSeedManager.fauxRand(this.id) * possibleItems.length)];
      if (orderNum === 2) this.order2 = new guildOrderItem(this.id, chosenItem.id, this.lvl);
      if (orderNum === 3) this.order3 = new guildOrderItem(this.id, chosenItem.id, this.lvl);
    }
  }, {
    key: "submitItem",
    value: function submitItem(slot) {
      var submitContainer = this.order1;
      if (slot === 2) submitContainer = this.order2;
      if (slot === 3) submitContainer = this.order3;
      var itemString = submitContainer.uniqueID();
      var itemMatch = Inventory.findCraftMatch(itemString);
      if (itemMatch === undefined) return Notifications.cantFindMatch();
      Inventory.removeContainerFromInventory(itemMatch.containerID);
      submitContainer.fufilled += 1;
      this.addRep(submitContainer.rep);
      achievementStats.gold(submitContainer.goldValue());
      ResourceManager.addMaterial("M001", submitContainer.goldValue());
      if (submitContainer.complete()) this.generateNewOrder(slot, submitContainer.id);
      refreshAllOrders();
    }
  }, {
    key: "goldValue",
    value: function goldValue() {
      var gold = this.order.map(function (o) {
        return o.goldValue();
      });
      if (gold.length === 0) return 0;
      return gold.reduce(function (a, b) {
        return a + b;
      });
    }
  }, {
    key: "maxLvlReached",
    value: function maxLvlReached() {
      return this.lvl >= GuildManager.maxGuildLevel();
    }
  }, {
    key: "repopulateUnmastered",
    value: function repopulateUnmastered() {
      this.unmastered = recipeList.unmasteredByGuild(this.id);
    }
  }, {
    key: "unlocked",
    value: function unlocked() {
      return this.workers().length > 0;
    }
  }]);

  return Guild;
}();

var guildOrderItem =
/*#__PURE__*/
function () {
  function guildOrderItem(gid, id, lvl) {
    _classCallCheck(this, guildOrderItem);

    this.gid = gid;
    this.id = id;
    this.item = recipeList.idToItem(id);
    this.lvl = lvl;
    this.rarity = this.generateRarity(lvl);
    this.sharp = this.generateSharp(lvl);
    this.amt = this.generateAmt(lvl);
    this.rep = this.generateRep(lvl, this.amt);
    this.fufilled = 0;
    this.displayName = this.generateName();
  }

  _createClass(guildOrderItem, [{
    key: "createSave",
    value: function createSave() {
      var save = {};
      save.gid = this.gid;
      save.id = this.id;
      save.lvl = this.lvl;
      save.amt = this.amt;
      save.rarity = this.rarity;
      save.sharp = this.sharp;
      save.fufilled = this.fufilled;
      save.rep = this.rep;
      return save;
    }
  }, {
    key: "loadSave",
    value: function loadSave(save) {
      this.amt = save.amt;
      this.rarity = save.rarity;
      this.sharp = save.sharp;
      this.fufilled = save.fufilled;
      this.rep = save.rep;
      this.item = recipeList.idToItem(this.id);
      this.displayName = this.generateName();
    }
  }, {
    key: "goldValue",
    value: function goldValue() {
      var smithBonus = _toConsumableArray(miscLoadedValues["smithChance"]).splice(0, this.sharp);

      var sharpAdd = smithBonus.length === 0 ? 0 : smithBonus.reduce(function (a, b) {
        return a + b;
      });
      return Math.round(this.item.value * (2 * (1 + this.rarity) + sharpAdd));
    }
  }, {
    key: "complete",
    value: function complete() {
      return this.fufilled >= this.amt;
    }
  }, {
    key: "left",
    value: function left() {
      return this.amt - this.fufilled;
    }
  }, {
    key: "generateAmt",
    value: function generateAmt(lvl) {
      var max = miscLoadedValues["goMax"][lvl];
      var min = miscLoadedValues["goMin"][lvl];
      var startAmt = Math.floor(Math.random() * (max - min + 1)) + min;
      startAmt -= this.rarity * 2;
      startAmt -= Math.floor(this.sharp / 1.5);
      return Math.max(1, startAmt);
    }
  }, {
    key: "generateRep",
    value: function generateRep(lvl, amt) {
      return 1 + miscLoadedValues["goMax"][lvl] - amt;
    }
  }, {
    key: "generateRarity",
    value: function generateRarity(lvl) {
      var epicChance = miscLoadedValues["goEpic"][lvl];
      var greatChance = miscLoadedValues["goGreat"][lvl] + epicChance;
      var goodChance = miscLoadedValues["goGood"][lvl] + greatChance;
      var rarityRoll = Math.floor(GuildSeedManager.fauxRand(this.gid) * 100);
      if (epicChance > rarityRoll) return 3;
      if (greatChance > rarityRoll) return 2;
      if (goodChance > rarityRoll) return 1;
      return 0;
    }
  }, {
    key: "generateSharp",
    value: function generateSharp(lvl) {
      var sharpChance = miscLoadedValues["goSharp"][lvl];
      var sharpMin = miscLoadedValues["goSharpMin"][lvl];
      var sharpMax = miscLoadedValues["goSharpMax"][lvl];
      if (sharpChance < Math.floor(GuildSeedManager.fauxRand(this.gid) * 100)) return 0;
      return bellCurveSeed(this.gid, sharpMin, sharpMax);
    }
  }, {
    key: "generateName",
    value: function generateName() {
      if (this.sharp > 0) return "<span>+".concat(this.sharp, " ").concat(this.item.name, "</span>");
      return "".concat(this.item.name);
    }
  }, {
    key: "uniqueID",
    value: function uniqueID() {
      return this.id + "_" + this.rarity + "_" + this.sharp;
    }
  }]);

  return guildOrderItem;
}();

var $guildList = $("#guildList");

function initializeGuilds() {
  $guildList.empty();
  GuildManager.guilds.forEach(function (g) {
    var d1 = $("<div/>").addClass("guildListButton").data("gid", g.id).html("".concat(g.icon, " ").concat(g.name));
    if (GuildManager.lastClicked === g.id) d1.addClass("selected");
    d1.appendTo($guildList);
    $("#".concat(g.id, "Name")).html("<h2>".concat(g.name, "</h2>"));
    $("#".concat(g.id, "Desc")).html(g.description);
    if (!g.unlocked()) d1.hide();
  });
  $(".guildContainer").hide();
  $("#" + GuildManager.lastClicked).show();
  GuildManager.guilds.forEach(function (guild) {
    refreshguildprogress(guild);
    refreshguildOrder(guild);
    refreshSales(guild);
    refreshRecipeMastery(guild);
    refreshGuildWorkers(guild);
  });
}

;

function checkCraftableStatus() {
  // Check if item in guild order can be crafted
  var $orderCraft = $(".orderCraft");
  $orderCraft.removeClass("recipeCraftDisable");
  recipeList.recipes.forEach(function (recipe) {
    if (!recipe.canProduce || !recipe.owned) $("#" + recipe.id + ".orderCraft").addClass("recipeCraftDisable");
  });
}

function refreshguildprogress(guild) {
  var id = guild.id;
  var $gp = $("#".concat(id, "Progress"));
  $gp.empty();
  $("<div/>").addClass("guildLevel").html("Level ".concat(inWords(guild.lvl))).appendTo($gp);
  $gp.append(createGuildBar(guild));
}

function generateProgressBar(options) {
  var prefix = options.prefix,
      tooltip = options.tooltip,
      text = options.text,
      textID = options.textID,
      icon = options.icon,
      width = options.width,
      fill = options.fill;
  var progressBarContainer = $("<div/>").addClass("progressBarContainer ".concat(prefix, "BarContainer"));
  if (tooltip) progressBarContainer.addClass("tooltip").attr({
    "data-tooltip": tooltip
  });
  var progressBarText = $("<div/>").addClass("progressBarText");
  if (text) progressBarText.html(text).appendTo(progressBarContainer);
  if (textID) progressBarText.attr({
    "id": textID
  });
  var progressBarContent = $("<div/>").addClass("progressBarContent");
  if (icon) $("<div/>").addClass("progressBarIcon").html(icon).appendTo(progressBarContent);
  if (icon && text) progressBarText.addClass("containsIcon");
  var progressBar = $("<div/>").addClass("progressBar").appendTo(progressBarContent);
  var progressBarFill = $("<div/>").addClass("progressBarFill").css("width", width).appendTo(progressBar);
  if (fill) progressBarFill.attr({
    "id": fill
  });
  progressBarContainer.append(progressBarContent);
  return progressBarContainer;
}

function createGuildBar(guild) {
  var repBarText = "Reputation: ".concat(guild.rep, "/").concat(guild.repLvl());
  var repPercent = guild.rep / guild.repLvl();
  var repWidth = (repPercent * 100).toFixed(1) + "%";
  var options = {
    prefix: "rep",
    tooltip: "rep",
    icon: miscIcons.guildRep,
    text: repBarText,
    width: repWidth
  };

  if (guild.maxLvlReached()) {
    options.prefix = "repMax";
    options.text = "Max Level Reached!";
    options.width = "100%";
  }

  return generateProgressBar(options);
}

function refreshAllOrders() {
  GuildManager.guilds.forEach(function (g) {
    return refreshguildOrder(g);
  });
  checkCraftableStatus();
}

function refreshguildOrder(guild) {
  var id = guild.id;
  var $go = $("#".concat(id, "Order"));
  $go.empty();

  if (guild.maxLvlReached()) {
    $("<div/>").addClass("guildMaxLvl").html("Max Guild Level Reached - Defeat a Boss to unlock more levels").appendTo($go);
    return;
  }

  $go.append(createOrderCard(guild.order1, id, 1));
  if (guild.lvl < 4) return;
  $go.append(createOrderCard(guild.order2, id, 2));
  if (guild.lvl < 8) return;
  $go.append(createOrderCard(guild.order3, id, 3));
}

;

function createOrderCard(item, id, index) {
  var d1 = $("<div/>").addClass("orderCard R".concat(item.rarity)).data({
    "slot": index,
    "gid": id
  });
  if (item.complete()) d1.addClass('orderComplete');
  $("<div/>").addClass("orderIcon").html(ResourceManager.materialIcon(item.id)).appendTo(d1);
  $("<div/>").addClass("orderName itemName").html(item.displayName).appendTo(d1);
  $("<div/>").addClass("itemToSac tooltip").attr({
    "data-tooltip": "recipe_desc",
    "data-tooltip-value": item.id
  }).appendTo(d1);
  var d2 = $("<div/>").addClass("orderMaterials").appendTo(d1);
  item.item.gcost.forEach(function (g) {
    $("<div/>").addClass("orderGuildWorker").html(GuildManager.idToGuild(g).icon).appendTo(d2);
  });
  $("<div/>").addClass("itemToSacReq").html("".concat(formatToUnits(item.left(), 2), " Left")).appendTo(d1);
  $("<div/>").addClass("orderInv tooltip").attr("data-tooltip", "in_inventory").data("uid", item.uniqueID()).html("<i class=\"fas fa-cube\"></i> ".concat(Inventory.itemCountSpecific(item.uniqueID()))).appendTo(d1);
  $("<div/>").attr("id", item.id).addClass("orderCraft").html("<i class=\"fas fa-hammer\"></i> Craft").appendTo(d1);
  var d3 = $("<div/>").addClass("guildItemSubmit").appendTo(d1);
  $("<div/>").addClass("guildItemSubmitHeading").html("Submit one for:").appendTo(d3);
  var d3a = $("<div/>").addClass("guildItemSubmitRewards").appendTo(d3);
  $("<div/>").addClass("guildItemSubmitItem RewardGold tooltip").attr({
    "data-tooltip": "gold_value",
    "data-tooltip-value": item.goldValue()
  }).html("".concat(miscIcons.gold, " +").concat(item.goldValue())).appendTo(d3a);
  $("<div/>").addClass("guildItemSubmitItem RewardRep tooltip").attr("data-tooltip", "rep").html("+".concat(item.rep, " Reputation")).appendTo(d3a);
  return d1;
}

;

function refreshOrderInvCount() {
  $(".orderInv").each(function () {
    var uniqueID = $(this).data("uid");
    var invCount = Inventory.itemCountSpecific(uniqueID);
    $(this).removeClass("canContribute").html("<i class=\"fas fa-cube\"></i> ".concat(invCount));
    if (invCount > 0) $(this).addClass("canContribute");
  });
}

function refreshAllSales() {
  GuildManager.guilds.forEach(function (g) {
    return refreshSales(g);
  });
}

;

function refreshSales(guild) {
  var $gs = $("#".concat(guild.id, "Sales"));
  $gs.empty();
  guild.recipeToBuy().forEach(function (recipe) {
    $gs.append(createRecipeBuyCard(recipe, guild.lvl));
  });
}

;

function createRecipeBuyCard(recipe, guildLvl) {
  var d1 = $("<div/>").addClass("recipeBuyCard");
  var d2 = $("<div/>").addClass("recipeBuyCardHead").html(recipe.type);
  var d3 = $("<div/>").addClass("recipeBuyCardBody").html(recipe.itemPicName());
  var d3a = $("<div/>").addClass("recipeBuyCardTier recipeItemLevel").html(recipe.itemLevel());

  if (recipe.repReq > guildLvl) {
    var d4 = $("<div/>").addClass("recipeBuyCardBuyLater").html("Reach Guild Level ".concat(recipe.repReq, " to Unlock"));
    return d1.append(d2, d3, d3a, d4);
  }

  var d5 = $("<div/>").addClass("recipeBuyCardBuy").data("rid", recipe.id);
  $("<div/>").addClass("recipeBuyCardBuyText").html("Purchase").appendTo(d5);
  $("<div/>").addClass("recipeBuyCardBuyCost tooltip").attr({
    "data-tooltip": "gold_value",
    "data-tooltip-value": formatWithCommas(recipe.goldCost)
  }).html("".concat(miscIcons.gold, " ").concat(formatToUnits(recipe.goldCost, 2))).appendTo(d5);
  return d1.append(d2, d3, d3a, d5);
}

;

function refreshAllGuildWorkers() {
  GuildManager.guilds.forEach(function (g) {
    return refreshGuildWorkers(g);
  });
}

function refreshGuildWorkers(guild) {
  var $gw = $("#".concat(guild.id, "Workers"));
  $gw.empty();
  guild.workers().forEach(function (worker) {
    $gw.append(createWorkerBuyCard(worker));
  });
}

function createWorkerBuyCard(worker) {
  var d1 = $("<div/>").addClass("workerBuyCard");
  var d2 = $("<div/>").addClass("workerBuyCardBodyImage").html(worker.pic);
  var d3 = $("<div/>").addClass("workerBuyCardBodyName").html(worker.name);
  var d4 = $("<div/>").addClass("workerBuyCardBodyProduction tooltip").attr({
    "data-tooltip": "guild_worker",
    "data-tooltip-value": worker.production
  }).html(worker.productionText());
  var d5 = $('<div/>').addClass('workerBuyCardDesc tooltip').attr({
    "data-tooltip": "worker_desc",
    "data-tooltip-value": worker.workerID
  }).html("<i class='fas fa-info-circle'></i>");
  return d1.append(d2, d3, d4, d5);
}

;

function refreshAllRecipeMastery() {
  GuildManager.guilds.forEach(function (g) {
    return refreshRecipeMastery(g);
  });
}

function refreshRecipeMastery(guild) {
  guild.repopulateUnmastered();
  var $guildNotice = $("#".concat(guild.id, "Mastery .guildMasteryNotice"));
  var $guildMasteryContainer = $("#".concat(guild.id, "Mastery .guildMasteryCardContainer"));
  $guildNotice.empty();
  $guildMasteryContainer.empty();
  if (guild.unmastered.length === 0) $guildNotice.addClass("noMasteryAvailable").html("No recipes to master currently.");else $guildNotice.removeClass("noMasteryAvailable");
  guild.unmastered.forEach(function (rid) {
    var recipe = recipeList.idToItem(rid);
    $guildMasteryContainer.append(createRecipeMasteryCard(recipe));
  });
}

function createRecipeMasteryCard(recipe) {
  var d1 = $("<div/>").addClass("recipeMasteryGuildCard");
  $("<div/>").addClass("recipeMasteryGuildPicName").html(recipe.itemPicName()).appendTo(d1);
  var masteryCost = recipe.masteryCost();
  $("<div/>").addClass("recipeMasteryGuildButton tooltip").attr({
    "id": "rcm" + recipe.id,
    "data-tooltip": "material_desc",
    "data-tooltip-value": masteryCost.id
  }).data("rid", recipe.id).html("Master for ".concat(ResourceManager.materialIcon(masteryCost.id), " ").concat(masteryCost.amt)).appendTo(d1);
  return d1;
}

function refreshRecipeMasteryAmt(recipe) {
  var masteryCost = recipe.masteryCost();
  $("#rcm".concat(recipe.id)).html("Master for ".concat(ResourceManager.materialIcon(masteryCost.id), " ").concat(masteryCost.amt));
} //attempt a mastery


$(document).on("click", ".recipeMasteryGuildButton", function (e) {
  e.preventDefault();
  var rid = $(e.currentTarget).data("rid");
  recipeList.attemptMastery(rid);
}); //submit a guild order

$(document).on("click", ".guildOrderSubmit", function (e) {
  e.preventDefault();
  var gid = $(e.currentTarget).data("gid");
  GuildManager.submitOrder(gid);
  refreshInventoryPlaces();
}); //click guild tab button

$(document).on("click", ".guildListButton", function (e) {
  e.preventDefault();
  $(".guildListButton").removeClass("selected");
  $(e.currentTarget).addClass("selected");
  var gid = $(e.currentTarget).data("gid");
  GuildManager.lastClicked = gid;
  $(".guildContainer").hide();
  $("#" + gid).show();
}); //submit an item to guild order

$(document).on("click", ".orderCard", function (e) {
  e.preventDefault();
  destroyTooltip();
  var itemData = $(e.currentTarget).data();
  GuildManager.idToGuild(itemData.gid).submitItem(itemData.slot);
  refreshOrderInvCount();
}); //buy a recipe from guild

$(document).on("click", ".recipeBuyCardBuy", function (e) {
  e.preventDefault();
  destroyTooltip();
  var recipeId = $(e.currentTarget).data("rid");
  recipeList.buyRecipe(recipeId);
}); //Craft from Order Card

$(document).on('click', '.orderCraft', function (e) {
  e.preventDefault();
  e.stopPropagation();
  var itemID = $(e.currentTarget).attr("id");
  actionSlotManager.addSlot(itemID);
});
//# sourceMappingURL=guilds.js.map