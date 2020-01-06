"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var synthToggle = Object.freeze({
  DESYNTH: 0,
  RESYNTH: 1
});
var $synthPowerResynthesis = $("#synthPowerResynthesis");
var SynthManager = {
  slot: null,
  resynth: null,
  setting: synthToggle.DESYNTH,
  state: "empty",
  time: 0,
  cookTime: 3000,
  lvl: 1,
  createSave: function createSave() {
    var save = {};
    if (this.slot !== null) save.slot = this.slot.createSave();
    save.state = this.state;
    save.lvl = this.lvl;
    save.resynth = this.resynth;
    save.setting = this.setting;
    return save;
  },
  loadSave: function loadSave(save) {
    if (save.slot !== undefined) {
      var container = new itemContainer(save.slot.id, save.slot.rarity);
      container.loadSave(save.slot);
      this.slot = container;
    }

    if (save.state !== undefined) this.state = save.state;
    if (save.lvl !== undefined) this.lvl = save.lvl;
    if (save.resynth !== undefined) this.resynth = save.resynth;
    if (save.setting !== undefined) this.setting = save.setting;
  },
  possibleSynth: function possibleSynth() {
    return Inventory.higherRarity();
  },
  toggleStatus: function toggleStatus(status) {
    if (this.state !== "empty" && this.state !== "staged") return;

    if (status === synthToggle.DESYNTH && this.setting !== synthToggle.DESYNTH) {
      this.setting = synthToggle.DESYNTH;
      refreshDesynth();
    }

    if (status === synthToggle.RESYNTH && this.setting !== synthToggle.RESYNTH && this.lvl > 1) {
      this.setting = synthToggle.RESYNTH;
      refreshResynth();
    }
  },
  addSynth: function addSynth(containerID) {
    if (this.slot !== null || this.state !== "empty") return;
    var container = Inventory.containerToItem(containerID);
    Inventory.removeContainerFromInventory(containerID);
    this.slot = container;
    this.state = "staged";
    initiateSynthBldg();
  },
  removeSynth: function removeSynth() {
    if (this.state !== "staged") return;

    if (Inventory.full()) {
      Notifications.synthCollectInvFull();
      return;
    }

    Inventory.addToInventory(this.slot);
    this.slot = null;
    this.state = "empty";
    this.resynth = null;
    this.clearResynthSlot();
    initiateSynthBldg();
  },
  stageButton: function stageButton() {
    if (this.state === "staged" && this.setting === synthToggle.DESYNTH) this.startDesynth();
    if (this.state === "staged" && this.setting === synthToggle.RESYNTH) this.startResynth();
    if (this.state === "complete") this.collectSynth();
  },
  startDesynth: function startDesynth() {
    this.state = "desynthing";
    synthBarText("");
    this.time = this.cookTime;
  },
  startResynth: function startResynth() {
    if (this.state !== "staged" || this.resynth === null) return;
    var cost = this.resynthCosts();

    if (!ResourceManager.available("M700", cost.M700) || !ResourceManager.available("M701", cost.M701) || !ResourceManager.available("M702", cost.M702)) {
      Notifications.insufficientResynthMats();
      return;
    }

    ResourceManager.addMaterial("M700", -cost.M700, false);
    ResourceManager.addMaterial("M701", -cost.M701, false);
    ResourceManager.addMaterial("M702", -cost.M702, false);
    this.state = "resynthing";
    synthBarText("");
    $("#synthRemove").hide();
    this.time = this.cookTime;
  },
  addTime: function addTime(ms) {
    if (this.state !== "desynthing" && this.state !== "resynthing") return;
    this.time -= ms;
    if (this.time > 0) return refreshSynthBar();
    this.time = 0;
    if (this.state === "desynthing") this.slot.rarity -= 1;
    if (this.state === "resynthing") this.slot.transform(this.resynthChange());
    this.state = "complete";
    this.resynth = null;
    synthBarText("Collect");
    refreshSynthStage();
    refreshResynth();
  },
  collectSynth: function collectSynth() {
    if (this.state !== "complete") return;

    if (Inventory.full()) {
      Notifications.synthCollectInvFull();
      return;
    }

    if (this.setting === synthToggle.DESYNTH) {
      var reward = this.desynthRewards(true);
      ResourceManager.addMaterial(reward.id, reward.amt);
      Notifications.synthCollect(ResourceManager.idToMaterial(reward.id).name, reward.amt);
    }

    Inventory.addToInventory(this.slot);
    this.slot = null;
    this.state = "empty";
    this.resynth = null;
    initiateSynthBldg();
  },
  desynthRewards: function desynthRewards(increase) {
    var mod = increase ? 1 : 0;
    if (this.slot === null) return null;
    var reward = {};
    if (this.slot.rarity + mod === 1) reward.id = "M700";
    if (this.slot.rarity + mod === 2) reward.id = "M701";
    if (this.slot.rarity + mod === 3) reward.id = "M702";
    reward.amt = Math.floor(this.slot.item.craftTime / 4000);
    return reward;
  },
  resynthCosts: function resynthCosts() {
    var resynthCost = {
      M700: 0,
      M701: 0,
      M702: 0
    };
    if (this.slot === null) return resynthCost;
    var baseline = Math.floor(this.slot.item.craftTime / 4000);

    if (this.slot.maxRatio() === 3) {
      resynthCost.M700 = this.slot.powRatio === 3 ? 0 : baseline;
      resynthCost.M701 = this.slot.hpRatio === 3 ? 0 : baseline;
      resynthCost.M702 = this.slot.techRatio === 3 ? 0 : baseline;
    } else {
      resynthCost.M700 = this.slot.powRatio === 0 ? 0 : baseline;
      resynthCost.M701 = this.slot.hpRatio === 0 ? 0 : baseline;
      resynthCost.M702 = this.slot.techRatio === 0 ? 0 : baseline;
    }

    return resynthCost;
  },
  resynthChange: function resynthChange() {
    var change = [0, 0, 0];
    if (this.slot === null || this.resynth === null) return change;

    if (this.resynth === "M700") {
      change[0] += 1;
      change[1] -= 1;
      change[2] -= 1;
    }

    if (this.resynth === "M701") {
      change[0] -= 1;
      change[1] += 1;
      change[2] -= 1;
    }

    if (this.resynth === "M702") {
      change[0] -= 1;
      change[1] -= 1;
      change[2] += 1;
    }

    return change;
  },
  clearResynthSlot: function clearResynthSlot() {
    if (this.state !== "staged") return;
    this.resynth = null;
    refreshResynth();
  },
  fillResynthSlot: function fillResynthSlot(value) {
    if (this.state !== "staged") return;
    var ratio = {
      "M700": SynthManager.slot.powRatio,
      "M701": SynthManager.slot.hpRatio,
      "M702": SynthManager.slot.techRatio
    };
    var maxRatio = Math.max(SynthManager.slot.powRatio, SynthManager.slot.hpRatio, SynthManager.slot.techRatio);

    if (maxRatio === 3) {
      //we are all-in on a material, ratio = 3 is the one we can't use
      if (ratio[value] === 3) return;
      this.resynth = value;
    } else if (maxRatio === 2) {
      //we are mixed, ratio = 0 is the one we can't use
      if (ratio[value] === 0) return;
      this.resynth = value;
    }

    refreshResynth();
  }
};
var $synthBuilding = $("#synthBuilding");
var $synthSlot = $("#synthSlot");
var $synthList = $("#synthList");
var $synthRewardCard = $("#synthRewardCard");
var $synthRewardAmt = $("#synthRewardAmt");
var $synthReward = $("#synthReward");

function initiateSynthBldg() {
  $synthBuilding.show();
  refreshSynthStage();
  refreshSynthInventory();
  refreshSynthButtons();
  if (SynthManager.setting === synthToggle.DESYNTH) refreshDesynth();
  if (SynthManager.setting === synthToggle.RESYNTH) refreshResynth();
}

function refreshSynthInventory() {
  $synthList.empty();
  $("<div/>").addClass("possibleSynthHead synthHeading").html("Available Items to Synthesize").appendTo($synthList);
  var d1 = $("<div/>").addClass('possibleSynthHolder').appendTo($synthList);
  if (SynthManager.possibleSynth().length === 0) $("<div/>").addClass("synthBlank").html("No Items to Synthesize").appendTo(d1);
  SynthManager.possibleSynth().forEach(function (container) {
    createSynthCard(container, false).appendTo(d1);
  });
}

;

function refreshSynthStage() {
  $synthSlot.empty();

  if (SynthManager.slot === null) {
    $("<div/>").addClass("synthSlotName itemName slotEmpty").html("Empty").appendTo($synthSlot);
    return;
  }

  createSynthStageCard(SynthManager.slot).appendTo($synthSlot);
}

var $desynthRewards = $("#desynthRewards");
var $resynthCost = $("#resynthCost");
var $resynthMaterial = $("#resynthMaterial");
var $resynthMaterials = $("#resynthMaterials");

function refreshDesynth() {
  $desynthRewards.show();
  $resynthCost.hide();
  $(".synthPowerSetting").removeClass("synthPowerEnabled");
  $("#synthPowerDesynthesis").addClass("synthPowerEnabled");
  $synthRewardCard.empty();
  $synthRewardAmt.empty();

  if (SynthManager.slot === null) {
    $desynthRewards.hide();
    return;
  }

  $desynthRewards.show();
  var mod = SynthManager.state === "complete";
  var reward = SynthManager.desynthRewards(mod);
  $("<div/>").addClass("synthMaterialPic").html(ResourceManager.idToMaterial(reward.id).img).appendTo($synthRewardCard);
  $("<div/>").addClass("synthMaterialAmt").html(reward.amt).appendTo($synthRewardAmt);
  $synthReward.addClass("tooltip").attr({
    "data-tooltip": "material_desc",
    "data-tooltip-value": reward.id
  });
  synthBarText("Desynthesize");
  refreshSynthStage();
}

function refreshResynth() {
  $desynthRewards.hide();
  $(".synthPowerSetting").removeClass("synthPowerEnabled");
  $("#synthPowerResynthesis").addClass("synthPowerEnabled");
  if (SynthManager.state === "empty") return $resynthCost.hide();
  $resynthCost.show();
  var idAmts = SynthManager.resynthCosts();
  $resynthMaterials.empty();
  var mats = ["M700", "M701", "M702"];
  mats.forEach(function (mat) {
    if (idAmts[mat] === 0) return;
    $("<div/>").addClass("resynthMaterial").data("matid", mat).html("".concat(ResourceManager.idToMaterial(mat).img, " ").concat(idAmts[mat])).appendTo($resynthMaterials);
  });

  if (SynthManager.state === "staged") {
    synthBarText("Start Resynthesis");
  }

  if (SynthManager.state === "resynthing") {
    $("#synthRemove").hide();
    synthBarText("Resynthing...");
  }

  if (SynthManager.state === "complete") {
    $("#synthRemove").hide();
    synthBarText("Collect");
  }

  refreshSynthStage();
}

function refreshSynthButtons() {
  if (SynthManager.lvl >= 2) $synthPowerResynthesis.html("Resynthesis");
}

function createSynthBar(text) {
  var synthPercent = SynthManager.time / SynthManager.cookTime;
  var synthWidth = (synthPercent * 100).toFixed(1) + "%";
  var d1 = $("<div/>").addClass("synthBarDiv").attr("id", "synthBarDiv");
  var d1a = $("<div/>").addClass("synthBar").attr("id", "synthBar");
  var s1 = $("<span/>").addClass("synthBarFill").attr("id", "synthFill").html(text).css('width', synthWidth);
  return d1.append(d1a, s1);
}

function refreshSynthBar(text) {
  var synthPercent = SynthManager.time / SynthManager.cookTime;
  var synthWidth = (synthPercent * 100).toFixed(1) + "%";
  $("#synthFill").html(text).css('width', synthWidth);
}

function synthBarText(text) {
  $("#synthFill").html(text);
} //click synth on item in inventory


$(document).on('click', '.synthButton', function (e) {
  e.preventDefault();
  var id = parseInt($(e.currentTarget).data("containerID"));
  SynthManager.addSynth(id);
}); //click deynth close button

$(document).on('click', '#synthRemove', function (e) {
  e.preventDefault();
  SynthManager.removeSynth();
}); //click synth start button

$(document).on('click', '#synthBarDiv', function (e) {
  e.preventDefault();
  SynthManager.stageButton();
}); //change to Desynthesis

$(document).on('click', '#synthPowerDesynthesis', function (e) {
  e.preventDefault();
  SynthManager.toggleStatus(synthToggle.DESYNTH);
}); //change to Resynthesis

$(document).on('click', '#synthPowerResynthesis', function (e) {
  e.preventDefault();
  SynthManager.toggleStatus(synthToggle.RESYNTH);
}); //click on a material to add to resynth collection

$(document).on('click', '.resynthMaterial', function (e) {
  e.preventDefault();
  $(".resynthMaterial").removeClass("selected");
  $(e.currentTarget).addClass("selected");
  var type = $(e.currentTarget).data("matid");
  if (SynthManager.state === "staged") SynthManager.fillResynthSlot(type);
});

function createSynthCard(container) {
  var itemdiv = $("<div/>").addClass("inventoryItem").addClass("R" + container.rarity);
  var itemName = $("<div/>").addClass("inventoryItemName itemName").attr({
    "id": container.id,
    "r": container.rarity
  }).html(container.picName());
  var itemRarity = $("<div/>").addClass("inventoryItemRarity RT".concat(container.rarity, " tooltip")).attr({
    "data-tooltip": "rarity_".concat(rarities[container.rarity].toLowerCase())
  }).html(miscIcons.rarity);
  var itemLevel = $("<div/>").addClass("inventoryItemLevel tooltip").attr({
    "data-tooltip": "item_level"
  }).html(container.itemLevel());
  var itemProps = $("<div/>").addClass("inventoryProps");

  for (var _i = 0, _Object$entries = Object.entries(container.itemStat(0)); _i < _Object$entries.length; _i++) {
    var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
        stat = _Object$entries$_i[0],
        val = _Object$entries$_i[1];

    if (val === 0) continue;
    $("<div/>").addClass("invPropStat tooltip").attr("data-tooltip", stat).html("".concat(miscIcons[stat], " <span class=\"statValue\">").concat(val, "</span>")).appendTo(itemProps);
  }

  ;
  var synthButton = $("<div/>").addClass("synthButton").data("containerID", container.containerID).html("Stage Item");
  return itemdiv.append(itemName, itemRarity, itemLevel, itemProps, synthButton);
}

function createSynthStageCard(container) {
  var itemdiv = $("<div/>").addClass("inventoryItem").addClass("R" + container.rarity);
  var itemName = $("<div/>").addClass("inventoryItemName itemName").attr({
    "id": container.id,
    "r": container.rarity
  }).html(container.picName());
  var stageRemove = $('<div/>').attr("id", "synthRemove").html("<i class=\"fas fa-times\"></i>");
  var itemLevel = $("<div/>").addClass("inventoryItemLevel tooltip").attr({
    "data-tooltip": "item_level"
  }).html(container.itemLevel());
  var itemProps = $("<div/>").addClass("inventoryProps");
  var synthStatProps = SynthManager.setting === synthToggle.RESYNTH ? SynthManager.resynthChange() : [0, 0, 0];

  for (var _i2 = 0, _Object$entries2 = Object.entries(container.itemStat(0, synthStatProps[0], synthStatProps[1], synthStatProps[2])); _i2 < _Object$entries2.length; _i2++) {
    var _Object$entries2$_i = _slicedToArray(_Object$entries2[_i2], 2),
        stat = _Object$entries2$_i[0],
        val = _Object$entries2$_i[1];

    if (val === 0) continue;
    $("<div/>").addClass("invPropStat tooltip").attr("data-tooltip", stat).html("".concat(miscIcons[stat], " <span class=\"statValue\">").concat(val, "</span>")).appendTo(itemProps);
  }

  ;
  itemdiv.append(itemName, stageRemove, itemLevel, itemProps);

  if (SynthManager.state === "staged" && SynthManager.resynth !== null) {
    createSynthBar("Resynthesize").appendTo(itemdiv);
  }

  if (SynthManager.state === "staged" && SynthManager.resynth === null) {
    createSynthBar("Select Material").appendTo(itemdiv);
  }

  if (SynthManager.state === "complete") {
    createSynthBar("Collect").appendTo(itemdiv);
    stageRemove.hide();
  }

  return itemdiv;
}

;