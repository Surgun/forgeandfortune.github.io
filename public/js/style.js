"use strict";

// Tab Selection for Recipes List
$(".recipeSelect").on("click", tabHighlight);

function tabHighlight(e) {
  $(".recipeSelect").removeClass("selected");
  $(e.currentTarget).addClass("selected");
} // Tab Selection for Navigation


$(".tablinks").on("click", navTabHighlight);

function navTabHighlight(e) {
  $(".tablinks").removeClass("tab-selected");
  $(e.currentTarget).addClass("tab-selected");
} // Back To Top Button


var $backToTopButton = $(".back-to-top");
if ($backToTopButton) $(window).scroll(function () {
  if ($("body").scrollTop() || $(document).scrollTop() > 200) $backToTopButton.addClass("show-button");else $backToTopButton.removeClass("show-button");
}); // Toast Positioning Setting

$(document).on("change", ".toastPositionSelection", function () {
  $toastSettings.removeAttr("checked");
  $(e.target).attr("checked", "checked");
  $.toast().reset('all');
  settings.toastPosition = $(e.target).val();
  saveSettings();
}); // Event Functions

function disableEventLayers() {
  $(".bgContainer .layer").removeClass("christmasEvent"); // Add event classes to be removed
}

function enableChristmasLayers() {
  $(".bgContainer .layer").addClass("christmasEvent");
} //


var $dbpanel = $("#db-panel");
var dbi = 0;

function dbEnable() {
  $dbpanel.empty();
  dbi = 0;
  var d = $("<button/>").addClass("dbClose").html("<i class=\"fas fa-times\"></i>");
  var d1 = $("<div/>").addClass("singleActionContainer");
  var d1a = $("<div/>");
  $("<button/>").addClass("gmOption dbActionButton").html("God Mode").appendTo(d1a);
  var d1b = $("<div/>");
  $("<button/>").addClass("heroTestOption dbActionButton").html("Hero Equipment Test").appendTo(d1b);
  var d1c = $("<div/>");
  $("<button/>").addClass("materialOption dbActionButton").html("Add Materials").appendTo(d1c);
  var d1d = $("<div/>");
  $("<button/>").addClass("dmOption dbActionButton").html("UI / UX Mode").appendTo(d1d);
  var d1e = $("<div/>");
  $("<button/>").addClass("hyperSpeedOption dbActionButton").html("Hyper Speed").appendTo(d1e);
  var d1f = $("<div/>");
  $("<button/>").addClass("forceTownOption dbActionButton").html("Unlock Town").appendTo(d1f);
  var d1g = $("<div>");
  $("<button/>").addClass("dungeonUnlockOption dbActionButton").html("Unlock Dungeons").appendTo(d1g);
  var d1h = $("<div/>");
  $("<button/>").addClass("heroUnlockOption dbActionButton").html("Unlock Heroes").appendTo(d1h);
  var d1i = $("<div/>");
  $("<button/>").addClass("perkUnlockOption dbActionButton").html("Unlock Perks").appendTo(d1i);
  var d1j = $("<div/>");
  $("<button/>").addClass("trinketUnlockOption dbActionButton").html("Add Trinkets").appendTo(d1j);
  var d1k = $("<div/>");
  $("<button/>").addClass("testRealmUnlockOption dbActionButton").html("Test Dungeon").appendTo(d1k);
  var d1l = $("<div/>");
  $("<button/>").addClass("timewarpOption dbActionButton").html("Time Warp").appendTo(d1l);
  d1.append(d1a, d1b, d1c, d1d, d1e, d1f, d1g, d1h, d1i, d1j, d1k, d1l);
  var d4 = $("<div/>").addClass("addItemContainer dbActionContainer");
  var d4a = $("<div/>").addClass("addItemTitle").html("Add Item to Inventory");
  var d4b = $("<input/>").addClass("addItemName").attr("placeholder", "Item ID");
  var d4c = $("<input/>").addClass("addItemRarity").attr("placeholder", "Item Rarity");
  var d4d = $("<button/>").addClass("addItemBtn dbActionButton").html("Add");
  d4.append(d4a, d4b, d4c, d4d);
  var d5 = $("<div/>").addClass("gearHeroesContainer dbActionContainer");
  var d5a = $("<div/>").addClass("gearHeroesTitle").html("Add Gear to Heroes");
  var d5b = $("<input/>").addClass("gearHeroesLevel").attr("placeholder", "Gear Level");
  var d5c = $("<input/>").addClass("gearHeroesRarity").attr("placeholder", "Gear Rarity");
  var d5d = $("<input/>").addClass("gearHeroesSharp").attr("placeholder", "Gear Sharp");
  var d5e = $("<button/>").addClass("gearHeroesBtn dbActionButton").html("Gear");
  d5.append(d5a, d5b, d5c, d5d, d5e);
  var d6 = $("<div/>").addClass("addGoldContainer dbActionContainer");
  var d6a = $("<div/>").addClass("addGoldTitle").html("Add Gold");
  var d6b = $("<input/>").addClass("addGoldInput").attr("placeholder", "0");
  var d6c = $("<button/>").addClass("addGoldBtn dbActionButton").html("Add");
  d6.append(d6a, d6b, d6c);
  var d7 = $("<div/>").addClass("adjustSpeedContainer dbActionContainer");
  var d7a = $("<div/>").addClass("adjustSpeedTitle").html("Adjust Speed");
  var d7b = $("<input/>").addClass("adjustSpeedInput").attr("placeholder", "0.0");
  var d7c = $("<button/>").addClass("adjustSpeedBtn dbActionButton").html("Adjust");
  d7.append(d7a, d7b, d7c);
  $dbpanel.append(d, d1, d4, d5, d6, d7);
  $dbpanel.css("display", "block");
  settings.db = 1;
  settings.dialogStatus = !settings.dialogStatus;
  saveSettings();
  checkDB();
}

function addButtonDB() {
  var dbButton = $("#debug");

  if (!dbButton.length) {
    dbButton = $("<a/>").attr("id", "debug").addClass("isDialog tooltip").attr("data-tooltip", "debug").html("<i class=\"fas fa-bug\"></i><div class=\"footerButtonText\">Debug</div>");
    $("#bottom-left").append(dbButton);
  }
}

function checkDB() {
  if (settings.db === 1) addButtonDB();
}

checkDB();
$(document).on('click', '.materialOption', function (e) {
  devtools.materials();
});
$(document).on('click', '.forceTownOption', function (e) {
  devtools.forceTown();
});
$(document).on('click', '.hyperSpeedOption', function (e) {
  devtools.hyperSpeed();
});
$(document).on('click', '.dmOption', function (e) {
  devtools.designmode();
});
$(document).on('click', '.dungeonUnlockOption', function (e) {
  devtools.dungeonUnlock();
});
$(document).on('click', '.heroUnlockOption', function (e) {
  devtools.heroUnlock();
});
$(document).on('click', '.perkUnlockOption', function (e) {
  devtools.allPerks();
});
$(document).on('click', '.trinketUnlockOption', function (e) {
  devtools.addTrinkets();
});
$(document).on('click', '.testRealmUnlockOption', function (e) {
  devtools.testRealm();
});
$(document).on('click', '.timewarpOption', function (e) {
  devtools.timeWarp();
});
$(document).on('click', '.addGoldBtn', function (e) {
  var goldAmount = parseInt(document.querySelector(".addGoldInput").value);
  devtools.addGold(goldAmount);
});
$(document).on('click', '.adjustSpeedBtn', function (e) {
  var speedAmount = parseFloat(document.querySelector(".adjustSpeedInput").value).toFixed(2);
  devtools.speed(speedAmount);
});
$(document).on('click', '.gearHeroesBtn', function (e) {
  var itemLevel = Math.min(10, parseInt(document.querySelector(".gearHeroesLevel").value));
  if (itemLevel === undefined) itemLevel = 1;
  var itemRarity = Math.min(3, parseInt(document.querySelector(".gearHeroesRarity").value));
  if (itemRarity === undefined) itemRarity = 3;
  var itemSharp = Math.min(10, parseInt(document.querySelector(".gearHeroesSharp").value));
  if (itemSharp === undefined) itemSharp = 0;
  devtools.gearHeroes(itemLevel, itemRarity, itemSharp);
});
$(document).on('click', '.addItemBtn', function (e) {
  var itemName = document.querySelector(".addItemName").value.toString();
  var itemRarity = parseInt(document.querySelector(".addItemRarity").value);
  devtools.addItem(itemName, itemRarity);
});
$(document).on('click', '.gmOption', function (e) {
  devtools.godmode();
});
$(document).on('click', '.heroTestOption', function (e) {
  devtools.heroTest();
});
$(document).on('click', '.dbClose', function (e) {
  setDialogClose();
  $dbpanel.css("display", "none");
});
$(document).on('click', '#debug', function (e) {
  dbEnable();
});
$(document).on('click', '.recipeCraft', function (e) {
  var $button = $(e.currentTarget);
  $(".recipeCraft").removeClass('btn-press');
  $button.addClass('btn-press');
  resetBtnPressAnimation();
}); // Animation for Craft button clicks

function resetBtnPressAnimation() {
  var btns = document.getElementsByClassName('btn-press');
  Array.prototype.forEach.call(btns, function (btn) {
    btn.style.animation = 'none';
    btn.offsetHeight;
    btn.style.animation = null;
  });
} // Clear Settings


$(document).on('click', '#clearSettings', function (e) {
  e.preventDefault();
  clearSettings();
});