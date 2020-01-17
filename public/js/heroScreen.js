"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var $heroTab = $("#heroTab");
var $heroGear = $("#heroGear");
var $heroTrinket = $("#heroTrinket");
var $heroList = $("#heroList");
var $heroDetails = $("#heroDetails");
var $heroGearSlots = $("#heroGearSlots");
var $heroOverview = $("#heroOverview");
var slotName = ["Weapon", "Head", "Armament", "Chest", "Handheld", "Accessory", "Trinket"];
var statName = ["".concat(miscIcons.hp, " <span>HP</span>"), "".concat(miscIcons.pow, " <span>Power</span>"), "".concat(miscIcons.tech, " <span>Technique</span>")];
var statDesc = ["hp", "pow", "tech"];

function initializeHeroList() {
  $heroList.empty();
  $("<div/>").attr("id", "heroOverviewButton").addClass("heroOverviewButton highlight").html("<i class=\"fas fa-info-circle\"></i> Hero Overview").appendTo($heroList);
  HeroManager.heroes.forEach(function (hero) {
    var d = $("<div/>").addClass("heroOwnedCard heroInspect").attr("data-value", hero.id);
    var d1 = $("<div/>").addClass("heroOwnedImage").html(hero.head);
    var d2 = $("<div/>").addClass("heroOwnedName").html(hero.name);
    var d3 = $("<div/>").addClass("heroPower").html(HeroManager.heroPower(hero));
    d.append(d1, d2, d3);
    if (!hero.owned) d.hide();
    $heroList.append(d);
  });

  if (HeroManager.heroes.filter(function (h) {
    return !h.owned;
  }).length > 0) {
    var bh1 = $("<div/>").addClass("buyNewHeroCard");
    var bh2 = $("<div/>").addClass("buyNewHeroTitle").html("Looking for more Heroes?");
    var bh3 = $("<div/>").addClass("buyNewHeroDesc").html("Check the Market to get more!");
    bh1.append(bh2, bh3);
    $heroList.append(bh1);
  }

  viewHeroOverview();
}

function viewHeroOverview() {
  $heroOverview.empty();
  var overviewContainer = $("<div/>").addClass("overviewContainer");
  var overviewTitle = $("<div/>").addClass("overviewTitle").html("Hero Overview");
  var overviewDesc = $("<div/>").addClass("overviewDescription").html("A quick glance at all your heroes and their stats.");
  HeroManager.heroes.filter(function (hero) {
    return hero.owned;
  }).forEach(function (hero) {
    var d = $("<div/>").addClass("heroOverviewCard heroInspect").attr("data-value", hero.id);
    var heroInfo = $("<div/>").addClass("heroOverviewInfo").appendTo(d);
    $("<div/>").addClass("heroOverviewImage").html(hero.image).appendTo(heroInfo);
    $("<div/>").addClass("heroOverviewName").html(hero.name).appendTo(heroInfo);
    $("<div/>").addClass("heroOverviewClass").html(hero["class"]).appendTo(heroInfo);
    var heroStats = $("<div/>").addClass("heroOverviewStats").appendTo(d);
    $("<div/>").addClass("heroOverviewHP overviewStat tooltip").attr("data-tooltip", "hp").html("".concat(miscIcons.hp, " ").concat(hero.maxHP())).appendTo(heroStats);
    $("<div/>").addClass("heroOverviewPow overviewStat tooltip").attr("data-tooltip", "pow").html("".concat(miscIcons.pow, " ").concat(hero.getPow())).appendTo(d);
    d.appendTo(overviewContainer);
  });
  $heroOverview.append(overviewTitle, overviewDesc, overviewContainer);
}

function examineHero(ID) {
  var hero = HeroManager.idToHero(ID);
  $heroDetails.empty();
  $heroGearSlots.empty();
  var heroExamineTop = $("<div/>").addClass("heroExamineTop heroExamineContainer");
  var d1 = $("<div/>").addClass("heroExamineName").html(hero.name);
  var d2 = $("<div/>").addClass("heroExamineImage").html(hero.image);
  var d3 = $("<div/>").addClass("heroExamineDescription").html(hero.description);
  var d4 = $("<div/>").addClass("heroExamineLvlClassContainer");
  $("<div/>").addClass("heroClassHeading").html("Hero Class").appendTo(d4);
  $("<div/>").addClass("heroClassText").html(hero["class"]).appendTo(d4);
  var d5 = $("<div/>").addClass("heroAbilityContainer");
  $("<div/>").addClass("heroAbilityHeading").html("Hero Ability").appendTo(d5);
  $("<div/>").addClass("heroAbilityText").html(hero.abilityDesc).appendTo(d5);
  heroExamineTop.append(d1, d2, d3, d4, d5);
  var heroExamineStats = $("<div/>").addClass("heroExamineStats heroExamineContainer");
  var htd = $("<div/>").addClass("heroExamineHeading");
  var htd1 = $("<div/>").addClass("heroExamineStatHeading").html("Hero Stats");
  heroExamineStats.append(htd.append(htd1));
  var stats = [hero.maxHP(), hero.getPow(), hero.getTech()];

  for (var i = 0; i < stats.length; i++) {
    heroExamineStats.append(statRow(statName[i], stats[i], statDesc[i]));
  }

  var lowerDiv = $("<div/>").addClass("heroExamineEquip");
  var slots = hero.getEquipSlots();
  $.each(slots, function (slotNum, equip) {
    if (slotNum !== 6) lowerDiv.append(heroCurrentGearEquip(hero, slotNum, equip));
  });
  $heroDetails.append(heroExamineTop, heroExamineStats);
  $heroGearSlots.append(lowerDiv);
}

function heroCurrentGearEquip(hero, slotNum, equip) {
  var d5 = $("<div/>").addClass("heroExamineEquipment").attr({
    "data-value": slotNum,
    "id": "hEE" + slotNum,
    "heroID": hero.id
  });
  if (hero.equipUpgradeAvailable(slotNum)) d5.addClass("equipUpgradeAvailable");
  $("<div/>").addClass("heroExamineEquipmentSlot").html(slotName[slotNum]).appendTo(d5);

  if (equip === null) {
    $("<div/>").addClass("heroExamineEquipmentEquip itemName").addClass("R0").html(hero.slotTypeIcons(slotNum)).appendTo(d5);
    return d5;
  }

  var d5b = $("<div/>").addClass("heroExamineEquipmentEquip itemName").addClass("R" + equip.rarity).html(equip.picName()).appendTo(d5);
  var d5b1 = $("<div/>").addClass("equipLevel").appendTo(d5b);

  if (equip.scale > 0) {
    $("<div/>").addClass("level_text").html("".concat(miscIcons.star)).appendTo(d5b1);
    $("<div/>").addClass("level_integer").html("".concat(equip.scale)).appendTo(d5b1);
  } else {
    $("<div/>").addClass("level_text").html("LVL").appendTo(d5b1);
    $("<div/>").addClass("level_integer").html("".concat(equip.lvl)).appendTo(d5b1);
  }

  var equipStats = $("<div/>").addClass("equipStats").appendTo(d5b);

  for (var _i = 0, _Object$entries = Object.entries(equip.itemStat()); _i < _Object$entries.length; _i++) {
    var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
        stat = _Object$entries$_i[0],
        val = _Object$entries$_i[1];

    if (val === 0) continue;
    var ed = $("<div/>").addClass("gearStatContainer").appendTo(equipStats);
    $("<div/>").addClass('gearStat').html("".concat(miscIcons[stat]).concat(val)).appendTo(ed);
  }

  var d5c = $("<div/>").addClass("heroExamineEquipmentEquipTypes").html(hero.slotTypeIcons(slotNum)).appendTo(d5);
  $("<div/>").addClass("heroUnequipSlot").attr("heroID", hero.id).attr("slotNum", slotNum).html('<i class="fas fa-times"></i> Unslot Equipment').appendTo(d5c);
  return d5;
}

function statRow(name, value, description) {
  var d1 = $("<div/>").addClass("heroExamineStatRow tooltip").attr("data-tooltip", description);
  var d2 = $("<div/>").addClass("heroExamineStatRowName").html(name);
  var d3 = $("<div/>").addClass("heroExamineStatRowValue").html(value);
  return d1.append(d2, d3);
}

var $heroEquipmentList = $("#heroEquipmentList");
var examineGearSlotCache = null;
var examineGearHeroIDCache = null;
var examineGearTypesCache = [];

function clearExaminePossibleEquip() {
  $heroEquipmentList.empty();
  examineGearHeroIDCache = null;
  examineGearSlotCache = null;
  examineGearTypesCache = [];
}

function examineHeroPossibleEquip(slot, heroID, skipAnimation) {
  if (skipAnimation) return;
  var hero = HeroManager.idToHero(heroID);
  examineGearSlotCache = slot;
  examineGearHeroIDCache = heroID;
  var types = HeroManager.getSlotTypes(slot, heroID);
  examineGearTypesCache = types;
  $heroEquipmentList.empty(); //cycle through everything in bp's and make the div for it

  var equipCardsContainer = $('<div/>').addClass('EquipmentCardsContainer');
  var equipCardsHeader = $('<div/>').addClass('EquipmentCardsHeader').html("Select Your Equipment");
  equipCardsContainer.append(equipCardsHeader); // Check if gear available to display in list

  if (Inventory.listbyType(types).length === 0) {
    var noGearMessage = $('<div/>').addClass('noGearMessage').html("You have no gear available to equip in this slot.");
    $heroEquipmentList.append(equipCardsContainer, noGearMessage);
    return;
  }

  var upgradeAvaialable = false;
  var currentTypes = [];
  Inventory.listbyType(types).forEach(function (itemContainer) {
    if (currentTypes.includes(itemContainer.uniqueID())) return;
    currentTypes.push(itemContainer.uniqueID());
    equipCardsContainer.append(heroEqupCard(hero, itemContainer));
  });
  $heroEquipmentList.append(equipCardsContainer); //returns a value if this slot has an upgrade available

  return upgradeAvaialable;
}

;

function heroEqupCard(hero, itemContainer) {
  var equippedItem = hero.currenEquipByType(itemContainer.type);
  var slotNum = hero.typeToSlot(itemContainer.type);
  var card = $('<div/>').addClass('gearItem').addClass("R" + itemContainer.rarity).attr({
    "id": itemContainer.containerID,
    "heroID": hero.id,
    "slotNum": slotNum
  });
  $('<div/>').addClass('gearItemName itemName').html(itemContainer.picName()).appendTo(card);
  $('<div/>').addClass('gearItemLevel').html(itemContainer.itemLevel()).appendTo(card);
  var equippedStats = equippedItem ? equippedItem.itemStat() : blankItemStat();

  for (var _i2 = 0, _Object$entries2 = Object.entries(itemContainer.itemStat()); _i2 < _Object$entries2.length; _i2++) {
    var _Object$entries2$_i = _slicedToArray(_Object$entries2[_i2], 2),
        stat = _Object$entries2$_i[0],
        val = _Object$entries2$_i[1];

    var deltaStat = val - equippedStats[stat];
    if (deltaStat === 0 && val === 0) continue;
    var d3 = $('<div/>').addClass('gearStatContainer').appendTo(card);
    var d3a = $('<div/>').addClass('gearStat tooltip').attr("data-tooltip", stat).appendTo(d3);
    if (deltaStat > 0) d3a.addClass("gearStatPositive").html("".concat(miscIcons[stat]).concat(val, " (+").concat(deltaStat, ")"));else if (deltaStat < 0) d3a.addClass("gearStatNegative").html("".concat(miscIcons[stat]).concat(val, " (").concat(deltaStat, ")"));else d3a.html("".concat(miscIcons[stat]).concat(val));
  }

  return card;
}

function unequipSlot(slot, heroID) {
  HeroManager.unequip(slot, heroID);
  examineHero(heroID);
}

$(document).on('click', ".heroCounter", function (e) {
  e.preventDefault();
  tabClick(e, "dungeonsTab");
});
var $heroOverviewButton = $("#heroOverviewButton");
var $trinketTab = $("#trinketTab"); // Show or hide hero's info

function showHeroInfo(show) {
  if (TownManager.status("tinker") !== BuildingState.built) $trinketTab.hide();else $trinketTab.hide();

  if (show) {
    $(".heroTabContainer").addClass("grid-show");
    $(".heroOwnedCard").removeClass("highlight");
    $heroOverviewButton.removeClass("highlight");
    $heroOverview.hide();
    return;
  }

  $(".heroOwnedCard").removeClass("highlight");
  $(".heroTabContainer").removeClass("grid-show");
  $(".heroContentContainer").addClass("none");
  $heroOverviewButton.addClass("highlight");
  $heroOverview.show();
} // Show details tab of selected hero


function showHeroDetailsTab() {
  $heroDetails.removeClass("none");
  $heroGear.addClass("none");
  $heroTrinket.addClass("none");
} // Show gear tab of selected hero


function showHeroGearTab() {
  $heroDetails.addClass("none");
  $heroGear.removeClass("none");
  $heroTrinket.addClass("none");
}

function showHeroTrinketTab() {
  $heroDetails.addClass("none");
  $heroGear.addClass("none");
  $heroTrinket.removeClass("none");
  refreshTrinketScreen(HeroManager.idToHero(HeroManager.heroView));
}

$(document).on('click', "#heroOverviewButton", function (e) {
  e.preventDefault();
  showHeroInfo(false);
  $(".heroTab").removeClass("selected");
  $("#heroOverviewButton").addClass("highlight");
  viewHeroOverview();
});
$(document).on('click', "div.heroInspect", function (e) {
  //pop up the detailed character card
  e.preventDefault();
  showHeroInfo(true); //Checks if no tab would be selected and defaults to tab 1, if true

  var ID = $(e.currentTarget).attr("data-value");
  $(".heroOwnedCard[data-value=".concat(ID, "]")).addClass("highlight");
  HeroManager.heroView = ID;
  examineHero(ID);
  $(".heroTab").removeClass("selected");
  $("#heroOverviewButton").removeClass("highlight");

  if (HeroManager.tabSelected === "heroTab1") {
    showHeroDetailsTab();
    $(".heroTab1").addClass("selected");
  } else if (HeroManager.tabSelected === "heroTab2") {
    showHeroGearTab();
    $(".heroTab2").addClass("selected");
  } else {
    showHeroTrinketTab();
    $(".heroTab3").addClass("selected");
  }

  clearExaminePossibleEquip();
});
$(document).on('click', ".heroTab1", function (e) {
  e.preventDefault();
  $(".heroTab").removeClass("selected");
  $(e.currentTarget).addClass("selected");
  HeroManager.tabSelected = "heroTab1";
  showHeroDetailsTab();
});
$(document).on('click', ".heroTab2", function (e) {
  e.preventDefault();
  $(".heroTab").removeClass("selected");
  $(e.currentTarget).addClass("selected");
  HeroManager.tabSelected = "heroTab2";
  showHeroGearTab();
});
$(document).on('click', ".heroTab3", function (e) {
  e.preventDefault();
  $(".heroTab").removeClass("selected");
  $(e.currentTarget).addClass("selected");
  HeroManager.tabSelected = "heroTab3";
  showHeroTrinketTab(HeroManager.idToHero(HeroManager.heroView));
});
$(document).on('click', "div.heroExamineEquipment", function (e) {
  //select an item type to display what you can equip
  e.preventDefault();
  var slot = parseInt($(e.currentTarget).attr("data-value"));
  var heroID = $(e.currentTarget).attr("heroID");
  $(".heroExamineEquipment").removeClass("hEEactive");
  $("#hEE" + slot).addClass("hEEactive");
  examineHeroPossibleEquip(slot, heroID);
});
$(document).on('click', "div.gearItem", function (e) {
  //equip the clicked item
  e.preventDefault();
  var heroID = $(e.currentTarget).attr("heroID");
  var containerID = parseInt($(e.currentTarget).attr("id"));
  var slotNum = parseInt($(e.currentTarget).attr("slotNum"));
  HeroManager.equipItem(containerID, heroID, slotNum);
  examineHero(heroID);
  refreshTrinketScreen(HeroManager.idToHero(heroID));
  clearExaminePossibleEquip();
  updateHeroPower();
  refreshSmithInventory(); //because hero gear is here
});

function updateHeroPower() {
  HeroManager.heroes.forEach(function (hero) {
    var heroCard = $(".heroOwnedCard[data-value=".concat(hero.id, "]"));
    $(heroCard).find(".heroPower").html(HeroManager.heroPower(hero));
  });
}

$(document).on('click', ".buyNewHeroButton", function (e) {
  e.preventDefault();
  HeroManager.purchaseHero();
});
$(document).on('click', ".heroUnequipSlot", function (e) {
  e.stopPropagation();
  e.preventDefault();
  var heroID = $(e.currentTarget).attr("heroID");
  var slotNum = parseInt($(e.currentTarget).attr("slotNum"));
  unequipSlot(slotNum, heroID);
  examineHeroPossibleEquip(slotNum, heroID);
  refreshTrinketScreen(HeroManager.idToHero(heroID));
  updateHeroPower();
  refreshSmithInventory(); //because hero gear is here
});
var $heroEquipTrinket = $("#heroEquipTrinket");
var $heroEquipTrinketAll = $("#heroEquipTrinketAll");

function refreshTrinketScreen(hero) {
  $heroEquipTrinket.empty();
  $heroEquipTrinket.html(heroCurrentGearEquip(hero, 6, hero.slot7));
  refreshTrinketInventory();
}

function refreshTrinketInventory() {
  if (HeroManager.heroView === null) return;
  $heroEquipTrinketAll.empty();
  var hero = HeroManager.idToHero(HeroManager.heroView);
  Inventory.listbyType("Trinkets").forEach(function (trinket) {
    heroEqupCard(hero, trinket).appendTo($heroEquipTrinketAll);
  });
}
//# sourceMappingURL=heroScreen.js.map