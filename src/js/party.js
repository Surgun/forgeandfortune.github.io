"use strict";
//creates a party as outlined in DungeonManager. Initated with CreateParty();

const $dtsBanner = $("#dtsBanner");
const $dtsDungeons = $("#dtsDungeons");
const $dungeonTeamCollection = $("#dungeonTeamCollection");
const $dtsBottom = $("#dtsBottom");

const $dungeonTeamButton = $("#dungeonTeamButton");
const $dungeonTeamButtonSkip = $("#dungeonTeamButtonSkip");


class Party {
    constructor (heroID) {
        this.heroID = heroID;
        this.heroes = heroID.map(h => HeroManager.idToHero(h));
    }
    createSave() {
        const save = {};
        save.heroID = this.heroID;
        return save;
    }
    hasMember(member) {
        return this.heroes.includes(member);
    }
    size() {
        return this.heroes.length;
    }
    alive() {
        return this.heroes.some(hero => !hero.dead());
    }
    isDead() {
        return this.heroes.every(hero => hero.dead());
    }
    addTime(t) {
        this.heroes.forEach(h=> {
            h.addTime(t, dungeonID);
        })
    }
    reset() {
        this.heroes.forEach(hero => {
            hero.hp = hero.maxHP();
            hero.resetPlaybookPosition();
            hero.removeBuffs();
        });
    }
}

const PartyCreator = {
    heroes : [],
    dungeonSelect : null,
    areaSelect : null,
    removeMember(slotNum) {
        this.heroes.splice(slotNum,1);
    },
    addMember(heroID) {
        if (this.emptyPartySlots() === 0) return false;
        this.heroes.push(heroID);
    },
    clearMembers() {
        this.heroes = [];
    },
    validTeam() {
        if (this.heroes.length === 0) return false;
        const heroesReal = this.heroes.map(hid => HeroManager.idToHero(hid));
        return heroesReal.every(h => h.alive());
    },
    lockParty() {
        this.heroes.map(hid => HeroManager.idToHero(hid)).forEach(h=>{
            h.inDungeon = true;
            h.hp = h.maxHP();
        });
        const party = new Party(this.heroes);
        this.heroes = [];
        return party;
    },
    startingTeam(team) {
        if (team === null) return;
        const statuses = team.map(h=>HeroManager.idToHero(h).inDungeon)
        if (statuses.some(h=>h)) return;
        team.forEach(h => this.addMember(h));
    },
    emptyPartySlots() {
        const dungeon = DungeonManager.dungeonByID(this.dungeonSelect);
        return dungeon.partySize - this.heroes.length;
    },
    setDungeon(dungeonid) {
        PartyCreator.dungeonSelect = dungeonid;
        console.log(PartyCreator.dungeonSelect);
    }
}

function startPartyCreation() {
    const area = PartyCreator.areaSelect;
    if (PartyCreator.dungeonSelect === null) PartyCreator.setDungeon(area.lastOpen().id);
    $areaTeamSelect.show();
    //Team Banner
    $dtsBanner.empty();
    $("<div/>").addClass(`dts${area.id} dtsBackground`).appendTo($dtsBanner);
    $("<div/>").addClass(`dts${area.id} dtsHeader`).html(area.name).appendTo($dtsBanner);
    $("<div/>").addClass(`dts${area.id} dtsBackButton`).html(`<i class="fas fa-arrow-left"></i>`).appendTo($dtsBanner);
    //Possible Dungeons
    $dtsDungeons.empty();
    area.dungeons.forEach(dungeon => {
        const d = $("<div/>").addClass("dtsDungeon").data("dungeonID",dungeon.id).appendTo(dtsDungeons);
        if (PartyCreator.dungeonSelect === dungeon.id) d.addClass("dtsHighlight");
        if (dungeon.mat !== null) {
            const mat = ResourceManager.idToMaterial(dungeon.mat);
            $("<div/>").addClass("dtsMaterial tooltip").attr({"data-tooltip":"material_desc","data-tooltip-value":dungeon.mat}).html(mat.img).appendTo(d);
        }
        $("<div/>").addClass("dtsDungeonName").html(dungeon.name).appendTo(d);
    });
    $dungeonTeamCollection.empty();
    //actual members
    PartyCreator.heroes.forEach((hero,i) => {
        characterCard("dungeonTeam",i,hero).prependTo($dungeonTeamCollection);
    });
    const emptySlots = DungeonManager.dungeonByID(PartyCreator.dungeonSelect).partySize - PartyCreator.heroes.length;
    for (let i=0;i<emptySlots;i++) {
        const d1a = characterCard("dungeonTeam",i).addClass("noHeroDungeonSelect");
        $dungeonTeamCollection.prepend(d1a);
    }
    if (PartyCreator.heroes.length === 0) {
        $dungeonTeamButton.addClass('dungeonStartNotAvailable');
        $dungeonTeamButtonSkip.addClass('dungeonStartNotAvailable');
    }
    else {
        $dungeonTeamButton.removeClass('dungeonStartNotAvailable');
        $dungeonTeamButtonSkip.removeClass('dungeonStartNotAvailable');
    }
    $dtsBottom.empty();
    //available heroes
    const d1bot = $("<div/>").addClass("dtsBotTitle").html("<h3>Your Available Heroes</h3>");
    $dtsBottom.append(d1bot);
    const d2 = $("<div/>").addClass("dungeonAvailableCollection");
    HeroManager.ownedHeroes().forEach(hero => {
        //if (dungeon.bannedHero.includes(hero.id)) characterCard("heroBanned dungeonNotAvailable",hero.uniqueid,hero.id, "Banned from Here").appendTo(d2);
        if (hero.inDungeon) characterCard("dungeonNotAvailable",hero.uniqueid,hero.id,"In Dungeon").appendTo(d2);
        else if (PartyCreator.heroes.includes(hero.id)) characterCard("partyHero dungeonNotAvailable",hero.uniqueid,hero.id, "Already in Party").appendTo(d2);
        else characterCard("dungeonAvailable",hero.uniqueid,hero.id,null).appendTo(d2);
    });
    $dtsBottom.append(d2);
}

//change dungeon selection
$(document).on('click', ".dtsDungeon", (e) => {
    e.preventDefault();
    const dungeonid = $(e.currentTarget).data("dungeonID");
    if (PartyCreator.dungeonSelect === dungeonid) return;
    PartyCreator.setDungeon(dungeonid);
    PartyCreator.clearMembers();
    startPartyCreation();
});

//Go back to dungeon select screen
$(document).on('click', ".dtsBackButton", (e) => {
    e.preventDefault();
    tabClick(e, "dungeonsTab");
});

//clicking a hero to remove them from your party
$(document).on('click', "div.dungeonTeamCardClick", (e) => {
    e.preventDefault();
    const heroID = $(e.currentTarget).attr("heroID");
    PartyCreator.removeMember(heroID);
    startPartyCreation(DungeonManager.dungeonCreatingID);
});

//clicking a hero to add them to your party
$(document).on('click', "div.dungeonAvailableCardClick", (e) => {
    e.preventDefault();
    const ID = $(e.currentTarget).attr("heroid");
    PartyCreator.addMember(ID);
    startPartyCreation(DungeonManager.dungeonCreatingID);
});

//locking in a team to start a dungeon
$(document).on('click', "#dungeonTeamButton", (e) => {
    e.preventDefault();
    if (PartyCreator.validTeam()) {
        console.log(PartyCreator.dungeonSelect);
        DungeonManager.createDungeon(PartyCreator.dungeonSelect,false);
        initializeSideBarDungeon();
        $areaTeamSelect.hide();
        $dungeonRun.show();
    }
    else {
        Notifications.noPartySelected();
    }
});

$(document).on('click', "#dungeonTeamButtonSkip", (e) => {
    e.preventDefault();
    if (PartyCreator.validTeam()) {
        console.log(PartyCreator.dungeonSelect);
        DungeonManager.createDungeon(PartyCreator.dungeonSelect,true);
        initializeSideBarDungeon();
        $areaTeamSelect.hide();
        $dungeonRun.show();
    }
    else {
        Notifications.noPartySelected();
    }
});

function characterCard(prefix,dv,ID,status) {
    const d = $("<div/>").addClass(prefix+"Card").attr("data-value",dv);
    if (!ID) {
        $("<div/>").addClass(prefix+"Image").html('<img src="/assets/images/heroes/blank.png">').appendTo(d);
        $("<div/>").addClass(prefix+"Name").html("Empty").appendTo(d);
        return d;
    }
    const dclick = $("<div/>").addClass(prefix+"CardClick").attr("heroID",dv).appendTo(d);
    const hero = HeroManager.idToHero(ID);
    $("<div/>").addClass(prefix+"Image").html(hero.image).appendTo(dclick);
    $("<div/>").addClass(prefix+"Name").html(hero.name).appendTo(dclick);
    const d3 = $("<div/>").addClass(prefix+"Stats").appendTo(dclick);
        $("<div/>").addClass(prefix+"HP"+" heroStat"+" tooltip").attr("data-tooltip","hp").html(`${miscIcons.hp} ${hero.maxHP()}`).appendTo(d3);
        $("<div/>").addClass(prefix+"Pow"+" heroPowStat"+" tooltip").attr("data-tooltip","pow").html(`${miscIcons.pow} ${hero.getPow()}`).appendTo(d3);
    const d5 = $("<div/>").addClass("heroStatus").html(status).appendTo(dclick);
    if (status === null) d5.hide();
    else d.addClass("heroUnavailable");
    $("<div/>").addClass("partyMaxFloor").html(`Floor ${hero.getMax(DungeonManager.dungeonCreatingID)}`).appendTo(dclick);
    return d;
}