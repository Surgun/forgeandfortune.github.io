const weekDuration = 86400000;
const weeksInSeason = 4;
const seasonsInYear = 4;
const seasonWords = ["Spring","Summer","Fall","Winter"];

function formatToUnits(number, precision) {
    const abbrev = ['', ' K', ' M', ' B', ' T', 'Q'];
    const unrangifiedOrder = Math.floor(Math.log10(Math.abs(number)) / 3)
    const order = Math.max(0, Math.min(unrangifiedOrder, abbrev.length -1 ))
    const suffix = abbrev[order];
    return parseFloat((number / Math.pow(10, order * 3)).toFixed(precision)) + suffix;
}

function msToTime(s) {
    const ms = s % 1000;
    s = (s - ms) / 1000;
    let secs = s % 60;
    s = (s - secs) / 60;
    let mins = s % 60;
    s = (s - mins) / 60;
    let hours = s % 60;
    mins = mins + 60*hours;
    if (secs < 10) secs = "0" + secs
    if (mins < 10) mins = "0" + mins   
    return mins + ':' + secs;
}

function rollDice(number, sides) {
    let total = 0;
    while(number-- > 0) total += Math.floor(Math.random() * sides) + 1;
    return total;
}

function bellCurve(min,max) {
    const total = rollDice(3,6);
    const percent = (total-6)/30;
    return Math.round(percent*(max-min)+min);
}

function round(number, precision) {
    var shift = function (number, precision) {
      var numArray = ("" + number).split("e");
      return +(numArray[0] + "e" + (numArray[1] ? (+numArray[1] + precision) : precision));
    };
    return shift(Math.round(shift(number, +precision)), -precision).toFixed(precision);
}

function timeSince(startTime,endTime) {
    endTime = endTime || Date.now()
    let s = "";
    let diff = Math.round((endTime-startTime)/1000);
    const d = Math.floor(diff/(24*60*60))
    diff = diff-d*24*60*60
    if (d === 1) s += d + " day, ";
    else s += d + " days, ";
    const h = Math.floor(diff/(60*60));
    diff = diff-h*60*60;
    if (h === 1) s += h + " hour, ";
    else s += h + " hours, ";
    const m = Math.floor(diff/60);
    diff = diff-m*60;
    if (m === 1) s += m + " minute, ";
    else s += m + " minutes, ";
    if (diff === 1) s += diff + " second, ";
    else s += diff + " seconds, ";
    return s.slice(0, -2);
}

function createArray(len, itm) {
    const arr = [];
    while (len > 0) {
        arr.push(itm);
        len--;
    }
    return arr;
}

const miscIcons = {
    hp : '<img src="images/DungeonIcons/hp.png">',
    pow : '<img src="images/DungeonIcons/pow.png">',
    ap : '<img src="images/DungeonIcons/ap.png">',
    gold : '<img src="images/DungeonIcons/gold.png">'
}

function msToSec(ms) {
    return round(ms/1000,1) + "s"
}

const miscLoadedValues = {};

function currentDate() {
    const elapsed = achievementStats.timePlayed;
    const weeks = Math.floor(elapsed/weekDuration);
    const seasons = Math.floor(weeks/weeksInSeason);
    const years = Math.floor(seasons/seasonsInYear);
    const weekRemaining = weeks-4*seasons;
    const seasonRemaining = seasons-4*years;
    
    return `Week ${weekRemaining+1} of ${seasonWords[seasonRemaining]}, Year ${years+1}`;
}

function timeLeftinWeek() {
    const elapsed = achievementStats.timePlayed;
    const left = weekDuration-elapsed%weekDuration;
    return timeSince(0,left);
}

function currentWeek() {
    const elapsed = achievementStats.timePlayed;
    return Math.floor(elapsed/weekDuration);
}

function randomChance(num,total) {
    //return true if random(0-total) is less than num
    return num > Math.floor(Math.random() * total);
}

function inventorySort(a, b) {
    const ai = a.item;
    const bi = b.item;
    const aj = ItemType.indexOf(ai.type);
    const bj = ItemType.indexOf(bi.type);
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

function interlace(a1,a2) {
    //returns a new array mixed between two
    const length = Math.max(a1.length,a2.length);
    const result = [];
    for (let i=0;i<length;i++) {
        if (a1.length > i) result.push(a1[i]);
        if (a2.length > i) result.push(a2[i]);
    }
    return result;
}
