"use strict";

var weekDuration = 86400000;
var weeksInSeason = 4;
var seasonsInYear = 4;
var seasonWords = ["Spring", "Summer", "Fall", "Winter"];

function formatToUnits(number, precision) {
  var abbrev = ['', ' K', ' M', ' B', ' T', 'Q'];
  var unrangifiedOrder = Math.floor(Math.log10(Math.abs(number)) / 3);
  var order = Math.max(0, Math.min(unrangifiedOrder, abbrev.length - 1));
  var suffix = abbrev[order];
  return parseFloat((number / Math.pow(10, order * 3)).toFixedDown(precision)) + suffix;
}

Number.prototype.toFixedDown = function (digits) {
  var re = new RegExp("(\\d+\\.\\d{" + digits + "})(\\d)"),
      m = this.toString().match(re);
  return m ? parseFloat(m[1]) : this.valueOf();
};

function formatWithCommas(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function msToTime(s) {
  var ms = s % 1000;
  s = (s - ms) / 1000;
  var secs = s % 60;
  s = (s - secs) / 60;
  var mins = s % 60;
  s = (s - mins) / 60;
  var hours = s % 60;
  mins = mins + 60 * hours;
  if (secs < 10) secs = "0" + secs;
  if (mins < 10) mins = "0" + mins;
  return mins + ':' + secs;
}

function rollDice(number, sides) {
  var total = 0;

  while (number-- > 0) {
    total += Math.floor(Math.random() * sides) + 1;
  }

  return total;
}

function rollDiceSeed(gid, number, sides) {
  var total = 0;

  while (number-- > 0) {
    total += Math.floor(GuildSeedManager.fauxRand(gid) * sides) + 1;
  }

  return total;
}

function bellCurve(min, max) {
  var total = rollDice(3, 6);
  var percent = (total - 6) / 30;
  return Math.round(percent * (max - min) + min);
}

function bellCurveSeed(gid, min, max) {
  var total = rollDiceSeed(gid, 6, 6);
  var percent = (total - 6) / 30;
  return Math.round(percent * (max - min) + min);
}

function round(number, precision) {
  var shift = function shift(number, precision) {
    var numArray = ("" + number).split("e");
    return +(numArray[0] + "e" + (numArray[1] ? +numArray[1] + precision : precision));
  };

  return shift(Math.round(shift(number, +precision)), -precision).toFixed(precision);
}

function timeSince(startTime, endTime) {
  endTime = endTime || Date.now();
  var s = "";
  var diff = Math.round((endTime - startTime) / 1000);
  var d = Math.floor(diff / (24 * 60 * 60));
  diff = diff - d * 24 * 60 * 60;
  if (d === 1) s += d + " day, ";else s += d + " days, ";
  var h = Math.floor(diff / (60 * 60));
  diff = diff - h * 60 * 60;
  if (h === 1) s += h + " hour, ";else s += h + " hours, ";
  var m = Math.floor(diff / 60);
  diff = diff - m * 60;
  if (m === 1) s += m + " minute, ";else s += m + " minutes, ";
  if (diff === 1) s += diff + " second, ";else s += diff + " seconds, ";
  return s.slice(0, -2);
}

function createArray(len, itm) {
  var arr = [];

  while (len > 0) {
    arr.push(itm);
    len--;
  }

  return arr;
}

var miscIcons = Object.freeze({
  hp: '<i class="fas fa-heart statHP"></i>',
  pow: '<i class="fad fa-sword statPOW"></i>',
  ap: '<img src="/assets/images/DungeonIcons/ap.png">',
  gold: '<img src="/assets/images/DungeonIcons/gold.png">',
  star: '<i class="fas fa-star statSTAR"></i>',
  tech: '<i class="fas fa-book-spells statTECH"></i>',
  skull: '<i class="fas fa-skull"></i>',
  trophy: "<img src='/assets/images/resources/M002.png' alt='Monster Trophy'>",
  arrow: '<i class="fas fa-arrow-right"></i>',
  dead: '<i class="fas fa-skull-crossbones"></i>',
  takeDamage: '<i class="fas fa-shield-cross"></i>',
  guildRep: '<i class="far fa-grin-alt"></i>',
  rarity: '<i class="fad fa-diamond"></i>',
  emptySlot: "<i class=\"fas fa-question-circle\"></i>",
  cancelSlot: "<i class=\"fas fa-times\"></i>",
  autoSell: "<i class=\"fas fa-dollar-sign\"></i>",
  time: "<i class=\"fas fa-clock\"></i>",
  alert: "<i class=\"fas fa-exclamation-circle\"></i>"
});
var heroStat = Object.freeze({
  hp: 'hp',
  pow: 'pow',
  tech: 'tech'
});

function msToSec(ms) {
  return round(ms / 1000, 1) + "s";
}

var miscLoadedValues = {};

function currentDate() {
  var elapsed = achievementStats.timePlayed;
  var weeks = Math.floor(elapsed / weekDuration);
  var seasons = Math.floor(weeks / weeksInSeason);
  var years = Math.floor(seasons / seasonsInYear);
  var weekRemaining = weeks - 4 * seasons;
  var seasonRemaining = seasons - 4 * years;
  return "Week ".concat(weekRemaining + 1, " of ").concat(seasonWords[seasonRemaining], ", Year ").concat(years + 1);
}

function timeLeftinWeek() {
  var elapsed = achievementStats.timePlayed;
  var left = weekDuration - elapsed % weekDuration;
  return timeSince(0, left);
}

function currentWeek() {
  var elapsed = achievementStats.timePlayed;
  return Math.floor(elapsed / weekDuration);
}

function randomChance(num, total) {
  //return true if random(0-total) is less than num
  return num > Math.floor(Math.random() * total);
}

function inventorySort(a, b) {
  var ai = a.item;
  var bi = b.item;
  var aj = ItemType.indexOf(ai.type);
  var bj = ItemType.indexOf(bi.type);
  if (ai.recipeType === "normal" && bi.recipeType !== "normal") return -1;
  if (ai.recipeType !== "normal" && bi.recipeType === "normal") return 1;

  if (ai.recipeType !== "normal" && bi.recipeType !== "normal") {
    if (ai.name !== bi.name) {
      if (ai.id > bi.id) return -1;
      return 1;
    }

    if (a.scale > b.scale) return -1;
    return 1;
  }

  if (ai.lvl > bi.lvl) return -1;
  if (ai.lvl < bi.lvl) return 1;
  if (aj > bj) return -1;
  if (aj < bj) return 1;
  if (a.rarity > b.rarity) return -1;
  if (a.rarity < b.rarity) return 1;
  if (a.sharp > b.sharp) return -1;
  if (b.sharp < a.sharp) return 1;
  return 0;
}

function interlace(a1, a2) {
  //returns a new array mixed between two
  var length = Math.max(a1.length, a2.length);
  var result = [];

  for (var i = 0; i < length; i++) {
    if (a1.length > i) result.push(a1[i]);
    if (a2.length > i) result.push(a2[i]);
  }

  return result;
}

function flattenArray(a) {
  return [].concat.apply([], a);
}

function groupArray(i) {
  return i.reduce(function (a, c) {
    return a[c] = (a[c] || 0) + 1, a;
  }, Object.create(null));
}

var a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
var b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function inWords(num) {
  if (num === 0) return "Zero";
  if ((num = num.toString()).length > 9) return 'overflow';
  n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return;
  var str = '';
  str += n[1] != 0 ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'billion ' : '';
  str += n[2] != 0 ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'million ' : '';
  str += n[3] != 0 ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
  str += n[4] != 0 ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
  str += n[5] != 0 ? (str != '' ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
  return str;
}

function normalDistribution(min, max, skew) {
  var u = 0,
      v = 0;

  while (u === 0) {
    u = Math.random();
  } //Converting [0,1) to (0,1)


  while (v === 0) {
    v = Math.random();
  }

  var num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  num = num / 10.0 + 0.5; // Translate to 0 -> 1

  if (num > 1 || num < 0) num = randn_bm(min, max, skew); // resample between 0 and 1 if out of range

  num = Math.pow(num, skew); // Skew

  num *= max - min; // Stretch to fill range

  num += min; // offset to min

  return num;
}

function extractPounds(text) {
  return text.split("#")[1];
}