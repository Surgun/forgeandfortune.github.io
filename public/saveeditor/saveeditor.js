"use strict";

var saveFile = localStorage.getItem('saveeditor');
var unpackedSave = null;
var saveBox = document.getElementById("save");
saveBox.setAttribute("value", saveFile);
var Heroes = [];
var Recipes = [];
$.ajax({
  url: "../json/heroes.json"
}).done(function (data) {
  $.each(data, function (i, props) {
    Heroes.push(props);
  });
});
$.ajax({
  url: "../json/recipes.json"
}).done(function (data) {
  $.each(data, function (i, props) {
    Recipes.push(props);
  });
});

function ImportSaveButton() {
  localStorage.setItem('saveeditor', saveBox.value);
  var pakostring = atob(document.getElementById("save").value);
  var unpako = pako.ungzip(pakostring, {
    to: 'string'
  });
  unpackedSave = JSON.parse(JSON.parse(unpako));
  refreshInputs();
}

function refreshInputs() {
  var $heroList = $("#heroList");
  $heroList.empty();
  var h = $("<div/>").addClass("heroHeading").appendTo($heroList);
  $("<div/>").addClass("headingEntry").html("NAME").appendTo(h);
  $("<div/>").addClass("headingEntry").html("SLOT 1").appendTo(h);
  $("<div/>").addClass("headingEntry").html("SLOT 2").appendTo(h);
  $("<div/>").addClass("headingEntry").html("SLOT 3").appendTo(h);
  $("<div/>").addClass("headingEntry").html("SLOT 4").appendTo(h);
  $("<div/>").addClass("headingEntry").html("SLOT 5").appendTo(h);
  $("<div/>").addClass("headingEntry").html("SLOT 6").appendTo(h);
  unpackedSave["h"].forEach(function (hero) {
    var d = $("<div/>").addClass('heroLine').appendTo($heroList);
    $("<div/>").addClass('heroName').html(idToHero[hero.id]).appendTo(d);

    for (var i = 1; i < 7; i++) {
      var s = $("<div/>").addClass('slot').appendTo(d);
      $("<button/>").addClass('slotType').attr("id", hero.id + "type" + i).text(getType(hero, i)).data("hid", hero.id).data("type", "slot".concat(i, "Type")).appendTo(s);
      $("<button/>").addClass('slotRarity').attr("id", hero.id + "rarity" + i).text(getRarity(hero, i)).data("hid", hero.id).appendTo(s);
      $("<button/>").addClass('slotTier').attr("id", hero.id + "tier" + i).text(getTier(hero, i)).data("hid", hero.id).appendTo(s);
      $("<button/>").addClass('slotSharp').attr("id", hero.id + "sharp" + i).text(getSharp(hero, i)).data("hid", hero.id).appendTo(s);
    }

    ;
  });
}

var Tier = ["", "Tier 1", "Tier 2", "Tier 3", "Tier 4", "Tier 5", "Tier 6", "Tier 7", "Tier 8", "Tier 9", "Tier 10"];
var Rarity = ["Common", "Good", "Rare", "Epic"];
var Sharp = ["+0", "+1", "+2", "+3", "+4", "+5", "+6", "+7", "+8", "+9", "+10"];

function getType(hero, i) {
  var slot = hero["slot" + i];

  if (slot === null) {
    var heroContainer = Heroes.find(function (h) {
      return h.id === hero.id;
    });
    return heroContainer["slot".concat(i, "Type")][0];
  }

  return Recipes.find(function (r) {
    return r.id === slot.id;
  }).type;
}

function getRarity(hero, i) {
  var slot = hero["slot" + i];
  if (slot === null) return Rarity[0];
  return Rarity[slot.rarity];
}

function getTier(hero, i) {
  var slot = hero["slot" + i];
  if (slot === null) return Tier[1];
  return Tier[Recipes.find(function (r) {
    return r.id === slot.id;
  }).lvl];
}

function getSharp(hero, i) {
  var slot = hero["slot" + i];
  if (slot === null) return Sharp[0];
  return Sharp[slot.sharp];
}

function allRarity(rarity) {
  $(".slotRarity").text(rarity);
}

function allTier(tier) {
  $(".slotTier").text("Tier " + tier);
}

function allSharp(sharp) {
  $(".slotSharp").text("+" + sharp);
}

$(document).on("click", ".slotType", function (e) {
  e.preventDefault();
  var d = $(e.currentTarget);
  var hid = d.data("hid");
  var slot = d.data("type");
  var currentTarget = d.text();
  var hero = Heroes.find(function (h) {
    return h.id === hid;
  });
  var i = hero[slot].indexOf(currentTarget) + 1;
  if (hero[slot].length === i) i = 0;
  d.text(hero[slot][i]);
});
$(document).on("click", ".slotTier", function (e) {
  e.preventDefault();
  var d = $(e.currentTarget);
  var lvl = Tier.indexOf(d.text());
  lvl += 1;
  if (lvl == 11) lvl = 1;
  d.text(Tier[lvl]);
});
$(document).on("click", ".slotRarity", function (e) {
  e.preventDefault();
  var d = $(e.currentTarget);
  var lvl = Rarity.indexOf(d.text());
  lvl += 1;
  if (lvl == 4) lvl = 0;
  d.text(Rarity[lvl]);
});
$(document).on("click", ".slotSharp", function (e) {
  e.preventDefault();
  var d = $(e.currentTarget);
  var lvl = Sharp.indexOf(d.text());
  lvl += 1;
  if (lvl == 11) lvl = 0;
  d.text(Sharp[lvl]);
});
var idToHero = {
  "H001": "Beorn",
  "H002": "Cedric",
  "H003": "Grim",
  "H004": "Lambug",
  "H101": "Zoe",
  "H102": "Neve",
  "H103": "Titus",
  "H104": "Troy",
  "H201": "Alok",
  "H202": "Grogmar",
  "H203": "Revere",
  "H204": "Caeda"
};

function ExportSave() {
  unpackedSave["h"].forEach(function (hero) {
    hero.slot1 = makeItem(hero.id, 1);
    hero.slot2 = makeItem(hero.id, 2);
    hero.slot3 = makeItem(hero.id, 3);
    hero.slot4 = makeItem(hero.id, 4);
    hero.slot5 = makeItem(hero.id, 5);
    hero.slot6 = makeItem(hero.id, 6);
  });
  var pakoSave = pako.gzip(JSON.stringify(JSON.stringify(unpackedSave)), {
    to: 'string'
  });
  saveFile = btoa(pakoSave);
  saveBox.setAttribute("value", saveFile);
  localStorage.setItem('saveeditor', saveBox.value);
  var $temp = $("<input>");
  $("body").append($temp);
  $temp.val($(saveBox).val()).select();
  document.execCommand("copy");
  $temp.remove();
}

function makeItem(hid, slot) {
  var typeText = $("#".concat(hid, "type").concat(slot)).text();
  var tierText = $("#".concat(hid, "tier").concat(slot)).text();
  var tierFix = Tier.indexOf(tierText);
  var rarityText = $("#".concat(hid, "rarity").concat(slot)).text();
  var sharpText = $("#".concat(hid, "sharp").concat(slot)).text();
  var recipeId = Recipes.find(function (r) {
    return r.type === typeText && r.lvl === tierFix;
  }).id;
  var item = {};
  item.id = recipeId;
  item.rarity = Rarity.indexOf(rarityText);
  item.seed = 1337;
  item.sharp = Sharp.indexOf(sharpText);
  return item;
}
//# sourceMappingURL=saveeditor.js.map