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
function formatWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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

function rollDiceSeed(gid, number, sides) {
    let total = 0;
    while(number-- > 0) total += Math.floor(GuildSeedManager.fauxRand(gid) * sides) + 1;
    return total;
}

function bellCurve(min,max) {
    const total = rollDice(3,6);
    const percent = (total-6)/30;
    return Math.round(percent*(max-min)+min);
}

function bellCurveSeed(gid,min,max) {
    const total = rollDiceSeed(gid, 6,6);
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

const miscIcons = Object.freeze({
    hp : '<i class="fas fa-heart statHP"></i>',
    pow : '<i class="fad fa-sword statPOW"></i>',
    ap : '<img src="images/DungeonIcons/ap.png">',
    gold : '<img src="images/DungeonIcons/gold.png">',
    star : '<i class="fas fa-star statSTAR"></i>',
    spow : '<i class="fas fa-book-spells statSPOW"></i>',
    armor : '<i class="fas fa-shield statARMOR"></i>',
    crit : '<i class="fas fa-dagger statCRIT"></i>',
    dodge : '<i class="fas fa-hood-cloak statDODGE"></i>',
    skull : '<i class="fas fa-skull"></i>',
    trophy : `<img src='images/resources/M002.png' alt='Monster Trophy'>`,
    arrow : '<i class="fas fa-arrow-right"></i>',
    dead : '<i class="fas fa-skull-crossbones"></i>',
    takeDamage : '<i class="fas fa-shield-cross"></i>',
    guildRep : '<i class="far fa-grin-alt"></i>',
});

const heroStat = Object.freeze({
    hp : 'hp',
    pow : 'pow',
    armor : 'armor',
    resist : 'resist',
    crit : 'crit',
    dodge : 'dodge',
    spow: 'spow',
    apen: 'apen',
    mpen: 'mpen',
})

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

function flattenArray(a) {
    return [].concat.apply([], a);
}

function groupArray(i) {
    return i.reduce((a, c) => (a[c] = (a[c] || 0) + 1, a), Object.create(null));
}

var a = ['','One ','Two ','Three ','Four ', 'Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
var b = ['', '', 'Twenty','Thirty','Forty','Fifty', 'Sixty','Seventy','Eighty','Ninety'];

function inWords(num) {
    if (num === 0) return "Zero";
    if ((num = num.toString()).length > 9) return 'overflow';
    n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return; var str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'billion ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'million ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
    return str;
}

function normalDistribution(min, max, skew) {
    var u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );

    num = num / 10.0 + 0.5; // Translate to 0 -> 1
    if (num > 1 || num < 0) num = randn_bm(min, max, skew); // resample between 0 and 1 if out of range
    num = Math.pow(num, skew); // Skew
    num *= max - min; // Stretch to fill range
    num += min; // offset to min
    return num;
}