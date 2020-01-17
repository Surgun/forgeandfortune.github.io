/*Dungeons consist of three sets of screens:
Clicking on the "Adventures" tab will relocate to the area screen.
This screen JUST has a list of areas on it. You can see the status
of any areas (as well as which are available).

Clicking on a area WITHOUT a team there brings you to the party selection
screen, where you can select the dungeon and a party. Confirming
a party locks it in and begins the dungeon and brings you to third screen

Adventure screen! Get here by clicking on an area with a group or confirming
a group...
*/

//tabs
const $areaSelect = $("#areaSelect");
const $areaTeamSelect = $("#areaTeamSelect");
const $dungeonRun = $("#dungeonRun");

//area screen
const $areaListings = $("#areaListings");

/*---------------------------
  -     AREA SELECT CODE    -
  ---------------------------*/

function dungeonsTabClicked() {
    DungeonManager.dungeonView = null;
    AreaManager.areaView = null;
    $areaSelect.show();
    $areaTeamSelect.hide();
    $dungeonRun.hide();
    refreshAreaSelect();
}

function refreshAreaSelect() {
    $areaListings.empty();
    AreaManager.areas.forEach(area => {
        createAreaBlock(area).appendTo($areaListings);
    });
}

function createAreaBlock(area) {
    const statuses = ["Idle","Fight In Progress","Run Complete"];
    const d = $("<div/>").addClass("areaContainer").data("areaID",area.id);
    $("<div/>").addClass("areaHeader").html(area.name).appendTo(d);
    $("<div/>").addClass("areaStatus").html(statuses[area.status()]).appendTo(d);
    $("<div/>").addClass("dungeonBackground").appendTo(d);
    if (area.status() === DungeonStatus.ADVENTURING) {
        const d2 = $("<div/>").addClass("areaAdventurers").appendTo(d);
        area.activeParty().heroes.forEach(h=> {
            $("<div/>").addClass("areaHero").html(h.head).appendTo(d2);
        });
    }
    return d;    
}

//click on a dungeon to start making a team!
$(document).on("click", ".areaContainer", (e) => {
    e.preventDefault();
    const areaID = $(e.currentTarget).data("areaID");
    AreaManager.areaView = areaID;
    screenDirectDungeon(areaID);
});

$(document).on("click", "#dAbandonAll", (e) => {
    e.preventDefault();
    DungeonManager.abandonAllDungeons();
});

function screenDirectDungeon(areaID) {
    $areaSelect.hide();
    const area = AreaManager.idToArea(areaID);
    if (area.status() === DungeonStatus.ADVENTURING) showDungeon(area.activeDungeonID());
    else if (DungeonManager.dungeonStatus(dungeonID) === DungeonStatus.COLLECT) showDungeonReward(area.activeDungeonID(),false);
    else if (area.status() === DungeonStatus.EMPTY) startPartyCreation();
}

/*-----------------------------------------
/*-   DUNGEON RUNNING CODE
/*-----------------------------------------*/

function showDungeon(dungeonID) {
    DungeonManager.dungeonView = dungeonID;
    $dungeonRun.show();
    BattleLog.clear();
    initiateDungeonFloor(dungeonID);
}

$(document).on("click", "#dungeonAbandon", (e) => {
    e.preventDefault();
    DungeonManager.abandonCurrentDungeon();
})


const $floorID = $("#floorID");
const $dungeonHeroList = $("#dungeonHeroList");
const $dungeonMobList = $("#dungeonMobList");
const $drTurnOrder = $("#drTurnOrder");

function initiateDungeonFloor(dungeonID) {
    if (DungeonManager.dungeonView !== dungeonID) return;
    const dungeon = DungeonManager.getCurrentDungeon();
    $dungeonRun.removeClass().addClass(dungeon.id);
    if (dungeon.type === "boss") $dungeonRun.addClass("DBoss");
    $floorID.html("Floor "+dungeon.floorCount);
    const rewards = dungeon.getRewards();
    if (dungeon.type === "normal") $floorRewards.html(`Earning ${rewards.amt} ${ResourceManager.materialIcon(rewards.id)} per clear`)
    $dungeonHeroList.empty();
    $dungeonMobList.empty();
    dungeon.party.heroes.forEach(hero => {
        const d1 = $("<div/>").addClass("dfc");
        const d2 = $("<div/>").addClass("dfcName").html(hero.name);
        const d3 = $("<div/>").addClass("dfcImage").html(hero.image);
        const d4 = $("<div/>").addClass("buffListContent").attr("id","buffList"+hero.uniqueid);
        d1.append(d2,d3,d4);
        $dungeonHeroList.prepend(d1);
    });
    dungeon.mobs.forEach((mob) => {
        const d6 = $("<div/>").addClass("dfm").attr("id","dfm"+mob.uniqueid);
        const d7 = $("<div/>").addClass("dfmName").html(mob.name);
        const d8 = $("<div/>").addClass("dfmImage").attr("id","mobImage"+mob.uniqueid).html(mob.image);
        const d9 = $("<div/>").addClass("buffListContent").attr("id","buffList"+mob.uniqueid);
        d6.append(d7,d8,d9);
        if (mob.hp === 0) d6.addClass("mobDead");
        $dungeonMobList.prepend(d6);
    });
    if (dungeon.progressNextFloor) $toggleProgress.html("Progressing");
    else $toggleProgress.html("Farming");
    generateTurnOrder(dungeonID);
    BuffRefreshManager.hardRefreshBuff();
}

function generateTurnOrder(dungeonID) {
    if (DungeonManager.dungeonView !== dungeonID) return;
    $drTurnOrder.empty();
    const dungeon = DungeonManager.getCurrentDungeon();
    dungeon.order.getOrder().forEach((unit,i) => {
        const d1 = $("<div/>").addClass("orderUnit").appendTo($drTurnOrder);
        $("<div/>").addClass("orderUnitHeadImg").html(unit.head).appendTo(d1);
        $("<div/>").addClass("orderUnitHead").html(unit.name).appendTo(d1);
        $("<div/>").addClass("orderUnitHP").html(createHPBar(unit,"turnOrder")).appendTo(d1);
        const d1a = $("<div/>").attr("id","orderSkills"+unit.uniqueid).appendTo(d1);
        generateSkillIcons(unit).appendTo(d1a);
        const d2 = $("<div/>").addClass("beatBarDiv").appendTo(d1);
        $("<span/>").addClass("beatBarFill").attr("id","beatbarFill"+unit.uniqueid).css('width', "0%").appendTo(d2);
    });
    refreshTurnOrder(dungeonID);
}

function refreshSkillUnit(target) {
    const d = $("#orderSkills"+target.uniqueid).empty();
    generateSkillIcons(target).appendTo(d);
}

function refreshTurnOrder(dungeonID) {
    if (DungeonManager.dungeonView !== dungeonID) return;
    const dungeon = DungeonManager.getCurrentDungeon();
    const uniqueid = dungeon.order.getCurrentID();
    $(".orderUnit").removeClass("orderUnitActive");
    $("#orderUnit"+uniqueid).addClass("orderUnitActive");
    $(".orderUnitSkill").removeClass("orderUnitActiveSkill");
    dungeon.order.getOrder().forEach(unit => {
        const skillNum = unit.getActiveSkill();
        $("#oUS"+unit.uniqueid+skillNum).addClass("orderUnitActiveSkill")
    });
}

function generateSkillIcons(unit) {
    const d1 = $("<div/>").addClass("orderUnitSkills");
    const skillIDs = unit.getSkillIDs();
    unit.getSkillIcons().forEach((icon,i) => {
        $("<div/>").addClass("orderUnitSkill tooltip").attr({"id":"oUS"+unit.uniqueid+i,"data-tooltip":"skill_desc","data-tooltip-value":skillIDs[i]}).html(icon).appendTo(d1);
    });
    return d1;
}

const $dungeonTab = $("#dungeonTab");

function initializeSideBarDungeon() {
    $DungeonSideBarTeam.empty();
    DungeonManager.dungeons.forEach(dungeon => {
        if (dungeon.type !== "regular" && dungeon.status === DungeonStatus.EMPTY) return;
        const d = $("<div/>").addClass("dungeonGroup").appendTo($DungeonSideBarTeam);
        const d1 = $("<div/>").addClass("DungeonSideBarStatus").data("dungeonID",dungeon.id).appendTo(d);
        if (dungeon.type === "regular" && dungeon.status === DungeonStatus.ADVENTURING) {
            d1.addClass("DungeonSideBarAdventuring");
            const d2 = $("<div/>").addClass("dungeonFarmStatus").attr("id","dungeonFarm"+dungeon.id).data("gid",dungeon.id).html(`<i class="fas fa-recycle"></i>`).appendTo(d1);
            if (!dungeon.progressNextFloor) d2.addClass("dungeonFarmActive");
            $("<div/>").addClass("dungeonSidebarFloor").attr("id","dsb"+dungeon.id).html(`${dungeon.name} - ${dungeon.floorCount}`).appendTo(d1);
            if (dungeon.type !== "boss") $("<div/>").addClass("dungeonSidebarReward").html(createDungeonSidebarReward(dungeon.getRewards(),dungeon.id)).appendTo(d);
        }
        else d1.html(`${dungeon.name}`);
    });
}

function refreshDungeonFarmStatus(dungeonid) {
    const dungeon = DungeonManager.dungeonByID(dungeonid);
    if (dungeon.type === "boss") return;
    if (dungeon.progressNextFloor) $("#dungeonFarm"+dungeonid).removeClass("dungeonFarmActive");
    else $("#dungeonFarm"+dungeonid).addClass("dungeonFarmActive");
}

function refreshSidebarDungeonMats(dungeonID) {
    const dungeon = DungeonManager.dungeonByID(dungeonID);
    if (dungeon.type === "boss") return;
    const rewards = dungeon.getRewards();
    $(`#dRR${dungeonID} .dungeonRewardRateIcon`).html(ResourceManager.materialIcon(rewards.id));
    $(`#dRR${dungeonID} .dungeonRewardRateAmt`).html(`+${rewards.amt}`);
}

function createHPBar(hero,tag) {
    const hpPercent = hero.hp/hero.maxHP();
    const hpBarText = hero.hp+" / "+hero.maxHP();
    const hpWidth = (hpPercent*100).toFixed(1)+"%";
    const options = {
        prefix: "hp",
        tooltip: "hp",
        icon: miscIcons.hp,
        text: hpBarText,
        textID: "hp"+tag+hero.uniqueid,
        width: hpWidth,
        fill: "hpFill"+tag+hero.uniqueid
    }
    return generateProgressBar(options);
}

function refreshBeatBar(uniqueid,dungeonTime) {
    const beatWidth = (dungeonTime/DungeonManager.speed*100).toFixed(1)+"%";
    $("#beatbarFill"+uniqueid).css('width',beatWidth);
}

function refreshHPBar(hero) {
    const hpPercent = hero.hp/hero.maxHP();
    const hpBarText = hero.hp+" / "+hero.maxHP();
    const hpWidth = (hpPercent*100).toFixed(1)+"%";
    $(`#hpturnOrder${hero.uniqueid}`).html(hpBarText);
    $(`#hpFillturnOrder${hero.uniqueid}`).css('width', hpWidth);
}

function createDungeonSidebarReward(rewards,dungeonid) {
    const haveReward = ResourceManager.materialAvailable(rewards.id);
    const matWidth = (haveReward/10).toFixed(1)+"%";
    const d = $("<div/>").addClass("dungeonRewardDiv");
        const t1 = $("<div/>").addClass("dungeonRewardRate").attr("id","dRR"+dungeonid).appendTo(d);
            $("<div/>").addClass("dungeonRewardRateIcon").html(`${ResourceManager.materialIcon(rewards.id)}`).appendTo(t1);
            $("<div/>").addClass("dungeonRewardRateAmt").html(`+${rewards.amt}`).appendTo(t1);
    const options = {
        prefix: "dungeonReward",
        text: haveReward.toString(),
        textID: "dsbr"+dungeonid, 
        width: matWidth,
        fill: "dsbrf"+dungeonid
    }
    return d.append(generateProgressBar(options));
}

function refreshDungeonMatBar(dungeonid) {
    const rewards = DungeonManager.dungeonByID(dungeonid).getRewards();
    const haveReward = ResourceManager.materialAvailable(rewards.id);
    const matWidth = (haveReward/10).toFixed(1)+"%";
    $("#dsbr"+dungeonid).html(haveReward);
    $("#dsbrf"+dungeonid).css('width',matWidth);
}
