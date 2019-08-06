"use strict";
//creates a party as outlined in DungeonManager. Initated with CreateParty();

const $dungeonTeamSelect = $("#dungeonTeamSelect");
const $dtsBanner = $("#dtsBanner");
const $dtsMaterials = $("#dtsMaterials");
const $dtsTop = $("#dtsTop");
const $dtsBottom = $("#dtsBottom");

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
}

const PartyCreator = {
    heroes : [],
    emptyPartySlots() {
        return DungeonManager.dungeonSlotCount() - this.heroes.length;
    },
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
        return heroesReal.some(h => h.alive());
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
    healCost() {
        if (this.heroes.length === 0) return 0;
        return this.heroes.map(h=>HeroManager.idToHero(h).healCost()).reduce((total,h) => total + h);
    },
    noheal() {
        if (this.heroes.length === 0) return true;
        return this.heroes.map(h=>HeroManager.idToHero(h)).every(h=>h.hp === h.maxHP());
    },
    payHealPart() {
        const amt = this.healCost();
        if (ResourceManager.materialAvailable("M001") < amt) {
            Notifications.cantAffordHealParty();
            return;
        }
        ResourceManager.deductMoney(amt);
        this.heroes.map(h=>HeroManager.idToHero(h)).forEach(h=>h.healPercent(100));
    },
    startingTeam(team) {
        if (team === null) return;
        const statuses = team.map(h=>HeroManager.idToHero(h).inDungeon)
        if (statuses.some(h=>h)) return;
        team.forEach(h => this.addMember(h));
    }
}

function refreshHeroSelect() {
    const dungeon = DungeonManager.dungeonByID(DungeonManager.dungeonCreatingID);
    //builds the div that we hide and can show when we're selecting for that area
    //Team Banner
    $dtsBanner.empty();
        const b1 = $("<div/>").addClass(`dts${dungeon.id} dtsBackground`).appendTo($dtsBanner);
        const b2 = $("<div/>").addClass(`dts${dungeon.id} dtsHeader`).html(dungeon.name).appendTo($dtsBanner);
            $("<div/>").addClass(`dts${dungeon.id} dtsBackButton`).html(`<i class="fas fa-arrow-left"></i>`).appendTo($dtsBanner);
        if (dungeon.type === "boss") {
            b1.addClass("DBoss");
            b2.addClass("DBoss");
        }
    //Materials in Dungeon
    $dtsMaterials.empty();
    if (dungeon.type !== "boss") {
        const dmTitle = $("<div/>").addClass("dtsMaterialTitle").attr("data-value",dungeon.id).html(`Materials Found In This Dungeon <i class="fas fa-chevron-down"></i>`).appendTo($dtsMaterials);
        const dm = $("<div/>").addClass("dtsMaterialContainer");
        if (settings.expandedMaterials[dungeon.id] === 1) {
            dmTitle.addClass("toggleActive");
            dm.addClass("expanded");
        }
        if (ResourceManager.materialSeenDungeon(dungeon.id).length === 0) {
            const dm1 = $("<div/>").addClass("dtsMaterialNone").html("You have not discovered any materials.");
            dm.append(dm1);
        }
        ResourceManager.materialSeenDungeon(dungeon.id).forEach(m => {
            const dm1 = $("<div/>").addClass("dtsMaterial").appendTo(dm);
                $("<div/>").addClass("dtsMaterialIcon").html(m.img).appendTo(dm1);
                $("<div/>").addClass("dtsMaterialName").html(m.name).appendTo(dm1);
                $("<div/>").addClass("dtsMaterialAmt tooltip").attr("data-tooltip","Amount Owned").html(formatToUnits(m.amt,2)).appendTo(dm1);
        });
        $dtsMaterials.append(dm);
    }
    $dtsTop.empty();
    const d1top = $("<div/>").addClass("dtsTopTitle").html("<h3>Assemble your Team!</h3>");
    $dtsTop.append(d1top);
    const d = $("<div/>").addClass("dungeonTeamCollection");
    //actual members
    PartyCreator.heroes.forEach((hero,i) => {
        const d1 = characterCard("dungeonTeam",i,hero);
        d.append(d1);
    });
    //empty slots
    for (let i=0;i<PartyCreator.emptyPartySlots();i++) {
        const d1a = characterCard("dungeonTeam",i).addClass("noHeroDungeonSelect");
        d.append(d1a);
    }
    $dtsTop.append(d);
    const dbutton = $("<div/>").attr("id","dungeonTeamButton").html("Launch Adventure");
    if (PartyCreator.heroes.length === 0) dbutton.addClass('dungeonStartNotAvailable')
    $dtsTop.append(dbutton);
    $dtsBottom.empty();
    //available heroes
    const d1bot = $("<div/>").addClass("dtsBotTitle").html("<h3>Your Available Heroes</h3>");
    $dtsBottom.append(d1bot);
    const d2 = $("<div/>").addClass("dungeonAvailableCollection");
    HeroManager.ownedHeroes().forEach(hero => {
        if (dungeon.bannedHero.includes(hero.id)) characterCard("heroBanned dungeonNotAvailable",hero.uniqueid,hero.id, "Banned from Here").appendTo(d2);
        else if (hero.inDungeon) characterCard("dungeonNotAvailable",hero.uniqueid,hero.id,"In Dungeon").appendTo(d2);
        else if (PartyCreator.heroes.includes(hero.id)) characterCard("partyHero dungeonNotAvailable",hero.uniqueid,hero.id, "Already in Party").appendTo(d2);
        else characterCard("dungeonAvailable",hero.uniqueid,hero.id,null).appendTo(d2);
    });
    $dtsBottom.append(d2);
}

// Toggle displaying dungeon materials on select screen
$(document).on('click','.dtsMaterialTitle', (e) => {
    e.preventDefault();
    const toggleActive = $(e.currentTarget).hasClass("toggleActive");
    const title = $(".dtsMaterialTitle");
    const dungeonID = title.attr("data-value");
    $(".dtsMaterialContainer").addClass("expanded");
    title.addClass("toggleActive");
    settings.expandedMaterials[dungeonID] = 1;
    if (toggleActive) {
        $(e.currentTarget).removeClass("toggleActive");
        $(".dtsMaterialContainer").removeClass("expanded");
        settings.expandedMaterials[dungeonID] = 0;
    }
    saveSettings();
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
    refreshHeroSelect(DungeonManager.dungeonCreatingID);
});

//clicking a hero to add them to your party
$(document).on('click', "div.dungeonAvailableCardClick", (e) => {
    e.preventDefault();
    const ID = $(e.currentTarget).attr("heroid");
    PartyCreator.addMember(ID);
    refreshHeroSelect(DungeonManager.dungeonCreatingID);
});

//locking in a team to start a dungeon
$(document).on('click', "#dungeonTeamButton", (e) => {
    e.preventDefault();
    if (PartyCreator.validTeam()) {
        DungeonManager.createDungeon();
        initializeSideBarDungeon();
        $dungeonTeamSelect.hide();
        $dungeonRun.show();
    }
    else {
        Notifications.noPartySelected();
    }
});

function characterCard(prefix,dv,ID,status) {
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
    const d3 = $("<div/>").addClass(prefix+"Stats");
        const d3a = $("<div/>").addClass(prefix+"HP"+" heroStat"+" tooltip").attr("data-tooltip","HP").html(`${miscIcons.hp} ${hero.maxHP()}`);
        const d3b = $("<div/>").addClass(prefix+"AP"+" heroStat"+" tooltip").attr("data-tooltip","AP Per Hit").html(`${miscIcons.ap} ${hero.apAdded()}`);
        d3.append(d3a,d3b);
    const d4 = $("<div/>").addClass(prefix+"Pow"+" heroPowStat"+" tooltip").attr("data-tooltip","POW").html(`${miscIcons.pow} ${hero.getPow()}`);
    const d5 = $("<div/>").addClass("heroStatus").html(status);
    if (status === null) d5.hide();
    else d.addClass("heroUnavailable");
    dclick.append(d1,d2,d3,d4,d5);
    return d.append(dclick);
}