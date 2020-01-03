/*Dungeons consist of three sets of screens:
Clicking on the "Adventures" tab will relocate to the dungeon screen.
This screen JUST has a list of dungeons on it. You can see the progress
of any dungeon (as well as which are available).

Clicking on a dungeon WITHOUT a team brings you to the party selection
screen, where you can select party members for this dungeon. Confirming
a party locks it in and begins the dungeon and brings you to third screen

Adventure screen! Get here by clicking on a dungeon with a group or confirming
a group...
*/

const $dungeonSelect = $("#dungeonSelect");
const $dungeonRun = $("#dungeonRun");
const $DungeonSideBarTeam = $("#DungeonSideBarTeam");
const $dsd1 = $("#dsd1");
const $toggleProgress = $("#toggleProgress");
const $floorRewards = $("#floorRewards");

/*---------------------------
/*-   DUNGEON SELECT CODE   -
/*---------------------------*/

const $dungeonListings = $("#dungeonListings");
const $dungeonListingsBosses = $("#dungeonListingsBosses");

function refreshDungeonSelect() {
    //shows each dungeon so you can select that shit...
    $dungeonListings.empty();
    DungeonManager.dungeons.filter(d=>d.type==="regular" && DungeonManager.dungeonCanSee(d.id)).forEach(dungeon => {
        $dungeonListings.append(dungeonBlock(dungeon));
    });
    $dungeonListingsBosses.empty();
    const bosses = DungeonManager.dungeons.filter(d=>d.type==="boss" && DungeonManager.bossDungeonCanSee(d.id));
    if (bosses.length === 0) $(".dungeonBossDivs").hide();
    else {
        $(".dungeonBossDivs").show();
        DungeonManager.dungeons.filter(d=>d.type==="boss" && DungeonManager.bossDungeonCanSee(d.id)).forEach(dungeon => {
            $dungeonListingsBosses.append(dungeonBlock(dungeon));
        });
    }
}

function dungeonBlock(dungeon) {
    const d1 = $("<div/>").addClass(`dungeonContainer`).attr("id",dungeon.id);
    const d2 = $("<div/>").addClass("dungeonHeader").html(dungeon.name);
    if (dungeon.type === "boss") {
        d1.addClass("dungeonTypeBoss");
        const bossID = DungeonManager.bossByDungeon(dungeon.id);
        if (MonsterHall.bossRefight()) $("<div/>").addClass("dungeonBossLvl").html(`${MonsterHall.monsterKillCount(bossID)} ${miscIcons.skull}`).appendTo(d1);
    }
    const d3 = $("<div/>").addClass("dungeonStatus").attr("id","ds"+dungeon.id);
    if (dungeon.status === DungeonStatus.ADVENTURING) d3.addClass("dungeonInProgress").html(`Fight in Progress`);
    else if (dungeon.status === DungeonStatus.COLLECT) d3.addClass("dungeonComplete").html(`Run Complete`);
    else d3.addClass("dungeonIdle").html("Idle");
    const d4 = $("<div/>").addClass("dungeonBackground");
    const d5 = $("<div/>").addClass("dungeonAdventurers");
    const d6 = $("<div/>").addClass(`dungeonBossPortrait ${dungeon.id}`);
    d1.append(d2,d3,d4,d5);
    if (dungeon.type === "boss") d1.append(d6);
    if (dungeon.status === DungeonStatus.ADVENTURING) {
        dungeon.party.heroes.forEach(h=> {
            const d5a = $("<div/>").addClass("dungeonHeroDungeonSelect").html(h.head);
            d5.append(d5a);
        });
    }
    return d1;
}


//click on a dungeon to start making a team!
$(document).on("click", ".dungeonContainer", (e) => {
    e.preventDefault();
    const dungeonID = $(e.currentTarget).attr("id");
    const dungeon = DungeonManager.dungeonByID(dungeonID);
    if (dungeon.type === "boss" && DungeonManager.bossCleared(dungeonID) && !MonsterHall.bossRefight()) return;
    screenDirectDungeon(dungeonID);
});

$(document).on("click", "#dAbandonAll", (e) => {
    e.preventDefault();
    DungeonManager.abandonAllDungeons();
});

function screenDirectDungeon(dungeonID) {
    DungeonManager.dungeonView = dungeonID;
    const lastParty = DungeonManager.dungeonByID(dungeonID).lastParty;
    $dungeonSelect.hide();
    if (DungeonManager.dungeonStatus(dungeonID) === DungeonStatus.ADVENTURING) showDungeon(dungeonID);
    else if (DungeonManager.dungeonStatus(dungeonID) === DungeonStatus.COLLECT) {
        showDungeonReward(dungeonID,false);
    }
    else if (DungeonManager.dungeonStatus(dungeonID) === DungeonStatus.EMPTY) {
        DungeonManager.dungeonCreatingID = dungeonID;
        PartyCreator.clearMembers();
        PartyCreator.startingTeam(lastParty);
        refreshHeroSelect();
        $dungeonSelect.hide();
        $dungeonTeamSelect.show();
    }
}

/*-----------------------------------------
/*-   DUNGEON RUNNING CODE
/*-----------------------------------------*/

function showDungeon(dungeonID) {
    DungeonManager.dungeonView = dungeonID;
    const dungeon = DungeonManager.dungeonByID(dungeonID);
    if (dungeon.status === DungeonStatus.EMPTY) {
        return 
    }
    BattleLog.clear();
    initiateDungeonFloor(dungeonID);
    $dungeonSelect.hide();
    $dungeonRun.show().removeClass().addClass(dungeonID);
    if (DungeonManager.dungeonByID(dungeonID).type === "boss") $dungeonRun.addClass("DBoss");
}

$(document).on("click", "#dungeonAbandon", (e) => {
    e.preventDefault();
    DungeonManager.abandonCurrentDungeon();
})

$(document).on("click", "#toggleProgress", (e) => {
    e.preventDefault();
    DungeonManager.toggleProgress();
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
        console.log(mob.image);
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
            console.log(dungeon.id,dungeon.getRewards());
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
    console.log(dungeon.type);
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
    console.log("refresh hp for: "+hero.name);
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

$(document).on("click", ".dungeonFarmStatus", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const gid = $(e.currentTarget).data("gid");
    DungeonManager.dungeonByID(gid).toggleProgress();
});