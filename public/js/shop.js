"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Shop = {
  purchased: [],
  perks: [],
  addPerk: function addPerk(reward) {
    this.perks.push(reward);
  },
  createSave: function createSave() {
    var save = {};
    save.perks = [];
    this.perks.forEach(function (p) {
      return save.perks.push(p.createSave());
    });
    return save;
  },
  loadSave: function loadSave(save) {
    var _this = this;

    save.perks.forEach(function (perk) {
      _this.idToPerk(perk.id).loadSave(perk);
    });
  },
  idToPerk: function idToPerk(id) {
    return this.perks.find(function (r) {
      return r.id === id;
    });
  },
  buyPerk: function buyPerk(id) {
    var perk = this.idToPerk(id);

    if (ResourceManager.materialAvailable("M001") < perk.goldCost || ResourceManager.materialAvailable(perk.mat) < perk.matAmt) {
      Notifications.perkCost();
      return;
    }

    ResourceManager.deductMoney(perk.goldCost);
    ResourceManager.addMaterial(perk.mat, -perk.matAmt);
    perk.purchase();
    refreshShop();
    refreshProgress();
  },
  perkCount: function perkCount() {
    return this.purchased.length;
  },
  perkMaxCount: function perkMaxCount() {
    return this.perks.length;
  },
  perksByType: function perksByType(type) {
    return this.perks.filter(function (p) {
      return p.category === type;
    }).sort(function (a, b) {
      return a.order - b.order;
    });
  },
  nextUnlocks: function nextUnlocks(type) {
    var notPurchased = this.perks.filter(function (p) {
      return p.category === type && !p.purchased;
    }).sort(function (a, b) {
      return a.order - b.order;
    });
    return {
      canPurchase: notPurchased[0],
      nextUp: notPurchased[1]
    };
  },
  boughtPerks: function boughtPerks() {
    return this.perks.filter(function (p) {
      return p.purchased;
    });
  }
};

var Perk =
/*#__PURE__*/
function () {
  function Perk(props) {
    _classCallCheck(this, Perk);

    Object.assign(this, props);
    this.purchased = false;
  }

  _createClass(Perk, [{
    key: "canBuy",
    value: function canBuy() {
      return ResourceManager.materialAvailable("M001") >= this.goldCost && ResourceManager.materialAvailable(this.mat) >= this.matAmt;
    }
  }, {
    key: "purchase",
    value: function purchase() {
      this.purchased = true;
      if (this.type === "hero") HeroManager.gainHero(this.subtype);

      if (this.type === "worker") {
        WorkerManager.gainWorker(this.subtype);
        initializeGuilds();
      }

      if (this.type === "dungeon") DungeonManager.unlockDungeon(this.subtype);
      if (this.type === "boss") DungeonManager.unlockDungeon(this.subtype);
      if (this.type === "craft") actionSlotManager.upgradeSlot();
      if (this.type === "adventure") DungeonManager.partySize += 1;
      if (this.type === "synth" && this.subtype === "open") TownManager.buildingPerk("synth");
      if (this.type === "bank" && this.subtype === "open") TownManager.buildingPerk("bank");
      if (this.type === "bank" && this.subtype === "level") BankManager.addLevel();
      if (this.type === "cauldron" && this.subtype === "open") TownManager.buildingPerk("fusion");
      if (this.type === "cauldron" && this.subtype === "level") FusionManager.addLevel();
      if (this.type === "forge" && this.subtype === "open") TownManager.buildingPerk("forge");
      if (this.type === "forge" && this.subtype === "level") bloopSmith.addLevel();
      if (this.type === "fortune" && this.subtype === "open") TownManager.buildingPerk("fortune");
      if (this.type === "fortune" && this.subtype === "level") FortuneManager.addLevel();
      if (this.type === "tinker" && this.subtype === "open") TownManager.buildingPerk("tinker");
      if (this.type === "tinker" && this.subtype === "level") TinkerManager.addLevel();
      if (this.type === "monster" && this.subtype === "open") TownManager.buildingPerk("monster");
      if (this.type === "monster" && this.subtype === "level") MonsterHall.addLevel();
    }
  }, {
    key: "createSave",
    value: function createSave() {
      var save = {};
      save.id = this.id;
      save.purchased = this.purchased;
      return save;
    }
  }, {
    key: "loadSave",
    value: function loadSave(save) {
      this.purchased = save.purchased;
    }
  }]);

  return Perk;
}();

var $marketsTab = $("#marketsTab");
var $purchasePerks = $("#purchasePerks");
var $remainingPerks = $("#remainingPerks");
var $boughtPerks = $("#boughtPerks");
var $purchasedPerks = $("#purchasedPerks");
var shopDivs = ["Crafting", "Dungeon", "Town"];

function refreshShop() {
  $purchasePerks.empty();
  $remainingPerks.empty();
  shopDivs.forEach(function (type) {
    var perks = Shop.nextUnlocks(type);
    $purchasePerks.append(createALperk(perks.canPurchase, type));
    $remainingPerks.append(showRemainingPerks(type));
  });
  var boughtPerks = Shop.boughtPerks();

  if (boughtPerks.length > 0) {
    $purchasedPerks.show();
    $boughtPerks.empty();
    boughtPerks.forEach(function (perk) {
      createPurchasedperk(perk).appendTo($boughtPerks);
    });
  } else $purchasedPerks.hide();
}

function showRemainingPerks(type) {
  var perkCount = Shop.perksByType(type).length - Shop.perksByType(type).filter(function (perk) {
    return perk.purchased;
  }).length;
  if (perkCount <= 2) return;
  var d1 = $("<div/>").addClass("alPerkRemaining");
  $("<div/>").addClass("alTitle").html("".concat(type, " Perks")).appendTo(d1);
  $("<div/>").addClass("alPerkCount").html("+".concat(perkCount - 2)).appendTo(d1);
  $("<div/>").addClass("alDesc").html("More perks available for purchase.").appendTo(d1);
  $("<div/>").addClass("alBuyPrev").html("Purchase previous perk to unlock more perks.").appendTo(d1);
  return d1;
}

function createALperk(perk, name) {
  var d1 = $("<div/>").addClass("alPerk");
  $("<div/>").addClass("alTitle").html(perk.title).appendTo(d1);
  $("<div/>").addClass("alSection").html("".concat(name, " Perk")).appendTo(d1);
  $("<div/>").addClass("alImage").html(perk.icon).appendTo(d1);
  $("<div/>").addClass("alDesc").html(perk.description).appendTo(d1);

  if (perk.purchased) {
    return d1.addClass("perkPurchased");
  }

  var d5 = $("<div/>").addClass("alPerkBuy").data("pid", perk.id).appendTo(d1);
  if (!perk.canBuy()) d5.addClass("cannotAfford");else d5.removeClass("cannotAfford");
  $("<div/>").addClass("alPerkBuyText").html("Purchase").appendTo(d5);
  var d5a = $("<div/>").addClass("alPerkBuyCost").appendTo(d5);
  $("<div/>").addClass("buyCost tooltip").attr({
    "data-tooltip": "gold_value",
    "data-tooltip-value": formatWithCommas(perk.goldCost)
  }).html("".concat(miscIcons.gold, " ").concat(formatToUnits(perk.goldCost, 2))).appendTo(d5a);
  $("<div/>").addClass("buyCost tooltip").addClass("shopMat" + perk.mat).data("perkID", perk.id).attr({
    "data-tooltip": "material_desc",
    "data-tooltip-value": perk.mat
  }).html("".concat(ResourceManager.materialIcon(perk.mat), " ").concat(perk.matAmt)).appendTo(d5a);
  return d1;
}

function createPurchasedperk(perk) {
  var d1 = $("<div/>").addClass("alPurchasedPerk tooltip").attr({
    "data-tooltip": "perk_desc",
    "data-tooltip-value": perk.id
  });
  $("<div/>").addClass("purchasedPerkTitle").html(perk.title).appendTo(d1);
  $("<div/>").addClass("alSection").html("".concat(perk.category, " Perk")).appendTo(d1);
  $("<div/>").addClass("purchasedPerkImage").html(perk.icon).appendTo(d1);
  return d1;
} //buy a perk


$(document).on("click", ".alPerkBuy", function (e) {
  e.preventDefault();
  destroyTooltip();
  var perkid = $(e.currentTarget).data("pid");
  Shop.buyPerk(perkid);
});
//# sourceMappingURL=shop.js.map