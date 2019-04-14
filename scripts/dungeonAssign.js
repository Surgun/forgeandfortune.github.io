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
const $dungeonTeamSelect = $("#dungeonTeamSelect");
const $dungeonRun = $("#dungeonRun");

const $dtsTop = $("#dtsTop");
const $dtsBottom = $("#dtsBottom");
const $daTop = $("#daTop");
const $daBottom = $("#daBottom");

const $DungeonSideBarTeam = $("#DungeonSideBarTeam");

const $dsd1 = $("#dsd1");

//click on a dungeon to start making a team!
$(document).on("click", ".dungeonContainer", (e) => {
    e.preventDefault();
    $dungeonSelect.hide();
    const dungeonID = $(e.currentTarget).attr("id");
    if (DungeonManager.dungeonStatus(dungeonID) === DungeonStatus.ADVENTURING) showDungeon(dungeonID);
    else if (DungeonManager.dungeonStatus(dungeonID) === DungeonStatus.EMPTY) {
        refreshHeroSelect(dungeonID);
        DungeonManager.dungeonCreatingID = dungeonID;
        $dungeonSelect.hide();
        $dungeonTeamSelect.show();
    }
});

function showDungeon(dungeonID) {
    DungeonManager.dungeonView = dungeonID;
    BattleLog.clear();
    initiateDungeonFloor();
    $dungeonSelect.hide();
    $dungeonRun.show();
}

//clicking a hero to remove them from your party
$(document).on('click', "div.dungeonTeamCardClick", (e) => {
    e.preventDefault();
    const heroID = $(e.currentTarget).attr("heroID");
    PartyCreator.removeMember(heroID);
    refreshHeroSelect();
});

//clicking a hero to add them to your party
$(document).on('click', "div.dungeonAvailableCardClick", (e) => {
    e.preventDefault();
    const ID = $(e.currentTarget).attr("heroid");
    PartyCreator.addMember(ID);
    refreshHeroSelect();
});

//locking in a team to start a dungeon
$(document).on('click', "#dungeonTeamButton", (e) => {
    e.preventDefault();
    if (PartyCreator.validTeam()) {
        DungeonManager.createDungeon();
        initiateDungeonFloor();
        initializeSideBarDungeon();
        $dungeonTeamSelect.hide();
        $dungeonRun.show();
        updateHeroCounter();
    }
    else {
        Notifications.noPartySelected();
    }
});

//pay for heal
$(document).on('click', ".healHero", (e) => {
    e.preventDefault();
    const ID = $(e.currentTarget).attr("id").substring(2);
    HeroManager.idToHero(ID).healPay();
});

$(document).on('click',"#dungeonTeamHeal", (e) => {
    e.preventDefault();
    PartyCreator.payHealPart();
    refreshHealPartyCost();
});

function refreshHeroSelect() {
    //builds the div that we hide and can show when we're selecting for that area
    $dtsTop.empty();
    const d1top = $("<div/>").addClass("dtsTopTitle").html("<h3>Assemble your Team!</h3>");
    $dtsTop.append(d1top);
    const d = $("<div/>").addClass("dungeonTeamCollection");
    PartyCreator.heroes.forEach((hero,i) => {
        const d1 = characterCard("dungeonTeam",i,hero);
        d.append(d1);
    });
    for (let i=0;i<PartyCreator.emptyPartySlots();i++) {
        const d1a = characterCard("dungeonTeam",i).addClass("noHeroDungeonSelect");
        d.append(d1a);
    }
    $dtsTop.append(d);
    const dbutton = $("<div/>").attr("id","dungeonTeamButton").html("Launch Adventure");
    const dbutton2 = $("<div/>").attr("id","dungeonTeamHeal").html(`Heal Party - <div class="healHeroCost">${miscIcons.gold} ${PartyCreator.healCost()}</div>`);
    if (PartyCreator.heroes.length === 0) dbutton.addClass('dungeonStartNotAvailable')
    if (PartyCreator.noheal()) dbutton2.hide();
    $dtsTop.append(dbutton, dbutton2);
    $dtsBottom.empty();
    const d1bot = $("<div/>").addClass("dtsBotTitle").html("<h3>Your Available Heroes</h3>");
    $dtsBottom.append(d1bot);
    const d2 = $("<div/>").addClass("dungeonAvailableCollection");
    HeroManager.ownedHeroes().forEach(hero => {
        if (!hero.inDungeon && !PartyCreator.heroes.includes(hero.id)) {
            const d3 = characterCard("dungeonAvailable",hero.uniqueid,hero.id);
            d2.append(d3);  
        }
    });
    $dtsBottom.append(d2);
}

function refreshHealPartyCost() {
    const button = $("#dungeonTeamHeal");
    button.html(`Heal Party - <div class="healHeroCost">${miscIcons.gold} ${PartyCreator.healCost()}</div>`);
    if (PartyCreator.noheal()) button.hide();
}

const $dungeonListings = $("#dungeonListings");

function refreshDungeonSelect() {
    //shows each dungeon so you can select that shit...
    $dungeonListings.empty();
    DungeonManager.dungeons.forEach(dungeon => {
        const d1 = $("<div/>").addClass("dungeonContainer").attr("id",dungeon.id);
        const d2 = $("<div/>").addClass("dungeonHeader").html(dungeon.name);
        const d3 = $("<div/>").addClass("dungeonStatus").attr("id","ds"+dungeon.id);
        if (dungeon.status === DungeonStatus.ADVENTURING) d3.addClass("dungeonInProgress").html("In Progress");
        else d3.removeClass("dungeonInProgress").html("Idle");
        const d4 = $("<div/>").addClass("dungeonBackground");
        d1.append(d2,d3,d4);
        $dungeonListings.append(d1);
    })
}


function characterCard(prefix,dv,ID) {
    const d = $("<div/>").addClass(prefix+"Card").attr("data-value",dv);
    const dclick = $("<div/>").addClass(prefix+"CardClick").attr("heroID",dv);
    if (!ID) {
        const d1a = $("<div/>").addClass(prefix+"Image").html('<img src="images/heroes/blank.png">');
        const d2a = $("<div/>").addClass(prefix+"Name").html("Empty");
        return d.append(d1a,d2a);
    }
    const hero = HeroManager.idToHero(ID);
    const d1 = $("<div/>").addClass(prefix+"Image").html(hero.image);
    const d2 = $("<div/>").addClass(prefix+"Name").html(hero.name);
    const d3 = $("<div/>").addClass(prefix+"Lvl").html("Level "+hero.lvl);
    const d4 = $("<div/>").addClass(prefix+"Pow").html(miscIcons.pow+"&nbsp;"+hero.getPow())
    const d5 = createHPBar(hero,"Party");    
    const d6 = $("<div/>").addClass("healHero").attr("id","hh"+hero.uniqueid).html(`Heal - <div class="healHeroCost">${miscIcons.gold} ${hero.healCost()}</div>`);
    if (hero.healCost() === 0) d6.hide();
    dclick.append(d1,d2,d3,d4,d5);
    return d.append(dclick,d6);
}

const $floorID = $("#floorID");
const $dungeonHeroList = $("#dungeonHeroList");
const $dungeonMobList = $("#dungeonMobList");
const $drStatsHero = $("#drStatsHero");
const $drStatsMob = $("#drStatsMob");
const $drTurnOrder = $("#drTurnOrder");

function floorStateChange(dungeonID) {
    const dungeon = DungeonManager.dungeonByID(dungeonID);
    if (dungeonID === DungeonManager.dungeonView) {
        initiateDungeonFloor();
    }
    $("#DungeonSideBarStatus").html(`${dungeon.name} - Floor ${dungeon.floorCount}`);
}

function initiateDungeonFloor() {
    const dungeon = DungeonManager.getCurrentDungeon();
    if (dungeon === undefined) return;
    $floorID.html("Floor "+dungeon.floorCount);
    $dungeonHeroList.empty();
    $dungeonMobList.empty();
    $drStatsHero.empty();
    $drStatsMob.empty();
    dungeon.party.heroes.forEach((hero) => {
        const d1 = $("<div/>").addClass("dfc");
        const d1c = $("<div/>").addClass("dfcName").html(hero.name);
        const d1b = $("<div/>").addClass("dfcImage").html(hero.image);
        d1.append(d1b,d1c);
        $dungeonHeroList.prepend(d1);
        const d2 = $("<div/>").addClass("dsc");
        const d2a = $("<div/>").addClass("dscPic").html(hero.head);
        const d2b = $("<div/>").addClass("dscName").html(hero.name);
        const d2c = $("<div/>").addClass("dscHP").html(createHPBar(hero,"Dung"));
        const d2d = $("<div/>").addClass("dscAP").html(createAPBar(hero,"Dung"));
        d2.append(d2a,d2b,d2c,d2d);
        $drStatsHero.prepend(d2);
    });
    dungeon.mobs.forEach((mob) => {
        const d3 = $("<div/>").addClass("dfm").attr("id","dfm"+mob.uniqueid);
        const d3c = $("<div/>").addClass("dfmName").html(mob.name);
        const d3b = $("<div/>").addClass("dfmImage").html(mob.image);
        d3.append(d3b,d3c);
        if (mob.hp === 0) d3.addClass("mobDead");
        $dungeonMobList.prepend(d3);
        const d4 = $("<div/>").addClass("dsm");
        const d4a = $("<div/>").addClass("dsmPic").html(mob.head);
        const d4b = $("<div/>").addClass("dsmName").html(mob.name);
        const d4c = $("<div/>").addClass("dsmHP").html(createHPBar(mob,"Dung"));
        const d4d = $("<div/>").addClass("dsmAP").html(createAPBar(mob,"Dung"));
        d4.append(d4a,d4b,d4c,d4d);
        $drStatsMob.prepend(d4);
    });
    refreshTurnOrder();
}

function refreshTurnOrder() {
    $drTurnOrder.empty();
    const dungeon = DungeonManager.getCurrentDungeon();
    dungeon.order.getOrder().forEach((unit,i) => {
        const d1 = $("<div/>").addClass("orderUnit");
        if (unit.dead()) d1.addClass("orderUnitDead");
        const d1a = $("<div/>").addClass("orderUnitHead").html(unit.head);
        const d1b = $("<div/>").addClass("orderUnitHead").html(unit.name);
        d1.append(d1a,d1b);
        if (dungeon.order.position === i) {
            const d1c = $("<div/>").addClass("unitActive").html("(Next)");
            d1.addClass("orderUnitActive").append(d1c);
        };
        $drTurnOrder.append(d1);
    });
}

function initializeSideBarDungeon() {
    $DungeonSideBarTeam.empty();
    DungeonManager.dungeons.forEach(dungeon => {
        if (dungeon.status !== DungeonStatus.ADVENTURING) return;
        const d = $("<div/>").addClass("dungeonGroup");
        const d1 = $("<div/>").attr("id","DungeonSideBarStatus").attr("dungeonID",dungeon.id).html(`${dungeon.name} - Floor ${dungeon.floorCount}`);
        d.append(d1);
        dungeon.party.heroes.forEach(hero => {
            const d3 = $("<div/>").addClass("dungeonSideBarMember");
            const d3a = $("<div/>").addClass("dungeonSideBarMemberIcon").html(hero.head);
            const d3b = $("<div/>").addClass("dungeonSideBarMemberHP").html(sidebarHP(hero));
            d3.append(d3a,d3b);
            d.append(d3);
        });
        $DungeonSideBarTeam.append(d);
    })
}

function sidebarHP(hero) {
    const hpPercent = hero.hp/hero.maxHP();
    const hpWidth = (hpPercent*100).toFixed(1)+"%";
    const d1 = $("<div/>").addClass("dsbhpBarDiv").html(dungeonIcons[Stat.HP]);
    const d1a = $("<div/>").addClass("dsbhpBar").attr("data-label",hero.hp+"/"+hero.maxHP()).attr("id","hpSide"+hero.uniqueid);
    const s1 = $("<span/>").addClass("dsbhpBarFill").attr("id","hpFillSide"+hero.uniqueid).css('width', hpWidth);
    return d1.append(d1a,s1);
}

function createHPBar(hero,tag) {
    const hpPercent = hero.hp/hero.maxHP();
    const hpWidth = (hpPercent*100).toFixed(1)+"%";
    const d1 = $("<div/>").addClass("hpBarDiv").html(dungeonIcons[Stat.HP]);
    const d1a = $("<div/>").addClass("hpBar").attr("data-label",hero.hp+"/"+hero.maxHP()).attr("id","hp"+tag+hero.uniqueid);
    const s1 = $("<span/>").addClass("hpBarFill").attr("id","hpFill"+tag+hero.uniqueid).css('width', hpWidth);
    return d1.append(d1a,s1);
}

function createAPBar(hero) {
    const apPercent = hero.ap/hero.apmax;
    const apWidth = (apPercent*100).toFixed(1)+"%";
    const d = $("<div/>").addClass("apBarDiv").html(dungeonIcons[Stat.AP]);
    const d1 = $("<div/>").addClass("apBar").attr("data-label",hero.ap+"/"+hero.apmax).attr("id","ap"+hero.uniqueid);
    const s1 = $("<span/>").addClass("apBarFill").attr("id","apFill"+hero.uniqueid).css('width', apWidth);
    return d.append(d1,s1);
}

function refreshHPBar(hero) {
    const hpPercent = hero.hp/hero.maxHP();
    const hpWidth = (hpPercent*100).toFixed(1)+"%";
    $("#hpParty"+hero.uniqueid).attr("data-label",hero.hp+"/"+hero.maxHP());
    $("#hpFillParty"+hero.uniqueid).css('width', hpWidth);
    $("#hpDung"+hero.uniqueid).attr("data-label",hero.hp+"/"+hero.maxHP());
    $("#hpFillDung"+hero.uniqueid).css('width', hpWidth);
    $("#hpSide"+hero.uniqueid).attr("data-label",hero.hp+"/"+hero.maxHP());
    $("#hpFillSide"+hero.uniqueid).css('width', hpWidth);
    const $hh = $("#hh"+hero.uniqueid)
    $hh.html(`Heal - <div class="healHeroCost">${miscIcons.gold} ${hero.healCost()}</div>`);
    if (hero.healCost() > 0) $hh.show();
    else $hh.hide();
}

function refreshAPBar(hero) {
    const apPercent = hero.ap/hero.apmax;
    const apWidth = (apPercent*100).toFixed(1)+"%";
    const d = $("<div/>").addClass("apBarDiv").html(dungeonIcons[Stat.AP]);
    const d1 = $("<div/>").addClass("apBar").attr("data-label",hero.ap+"/"+hero.apmax).attr("id","ap"+hero.uniqueid);
    const s1 = $("<span/>").addClass("apBarFill").attr("id","apFill"+hero.uniqueid).css('width', apWidth);
    $("#ap"+hero.uniqueid).attr("data-label",hero.ap+"/"+hero.apmax);
    $("#apFill"+hero.uniqueid).css('width', apWidth);
}