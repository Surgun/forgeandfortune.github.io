"use strict";

const QuestState = Object.freeze({idle:"Idle",running:"In Progress",complete:"Complete"});

const $questLocations = $("#questLocations");
const $questSelect = $("#questSelect");
const $questPartySelect = $("#questPartySelect");

class Quest {
    constructor(props) {
        Object.assign(this, props);
        this.elapsed = 0;
        this.state = QuestState.idle;
        this.unlocked = false;
    }
    createSave() {
        const save = {};
        save.id = this.id;
        save.elapsed = this.elapsed;
        save.state = this.state;
        save.unlocked = this.unlocked;
        return save;
    }
    loadSave(save) {
        this.elapsed = save.elapsed;
        this.state = save.state;
        this.unlocked = save.unlocked;
    }
    startQuest() {
        if (this.state !== QuestState.idle) return;
        this.state = QuestState.running;
    }
    addTime(ms) {
        if (this.state !== QuestState.running) return;
        this.elapsed += ms;
        if (this.elapsed >= this.timeReq) {
            this.elapsed = 0;
            this.state = QuestState.complete;
        }
    }
    collect() {
        if (this.state !== QuestState.complete) return;
        this.state = QuestState.idle;
    }
    remaining() {
        return this.elapsed - this.timeReq;
    }
}

const QuestManager = {
    quests : [],
    unlocked: false,
    hero1 : null,
    hero2 : null,
    hero3 : null,
    hero4 : null,
    questView : null,
    addQuest(quest) {
        this.quests.push(quest);
    },
    createSave() {
        const save = {};
        save.unlocked = this.unlocked;
        save.quests = [];
        this.quests.forEach(quest => {
            save.quests.push(quest.createSave());
        });
        return save;
    },
    loadSave(save) {
        save.unlocked = this.unlocked;
        save.quests.forEach(questSave => {
            const quest = this.idToQuest(questSave.id);
            quest.loadSave(questSave);
        });
    },
    idToQuest(questID) {
        return this.quests.find(q=>q.id === questID);
    },
    addTime(ms) {
        this.quests.forEach(q=>q.addTime(ms));
    },
    available() {
        return this.quests;
    },
    inParty(heroID) {
        return this.hero1 === heroID || this.hero2 === heroID || this.hero3 === heroID || this.hero4 === heroID;
    },
    clearParty() {
        this.hero1 = null;
        this.hero2 = null;
        this.hero3 = null;
        this.hero4 = null;
    },
    removeParty(heroID) {
        if (heroID === "hero1") this.hero1 = null;
        if (heroID === "hero2") this.hero2 = null;
        if (heroID === "hero3") this.hero3 = null;
        if (heroID === "hero4") this.hero4 = null;
    },
    addParty(heroID) {
        console.log(heroID);
        const quest = this.idToQuest(this.questView);
        const hero = HeroManager.idToHero(heroID);
        console.log(quest.hero1,hero.type,quest.hero1 === hero.type);
        //check if heroID matches slot requirement -- if so add it
        if (quest.hero1 === heroID) return this.hero1 = heroID;
        if (quest.hero2 === heroID) return this.hero2 = heroID;
        if (quest.hero3 === heroID) return this.hero3 = heroID;
        if (quest.hero4 === heroID) return this.hero4 = heroID;
        //loop through type and add it if it matches
        if (quest.hero1 === hero.type) return this.hero1 = heroID;
        if (quest.hero2 === hero.type) return this.hero2 = heroID;
        if (quest.hero3 === hero.type) return this.hero3 = heroID;
        if (quest.hero4 === hero.type) return this.hero4 = heroID;
        //loop through and add to first blank
        if (quest.hero1 === null) return this.hero1 = heroID;
        if (quest.hero2 === null) return this.hero2 = heroID;
        if (quest.hero3 === null) return this.hero3 = heroID;
        if (quest.hero4 === null) return this.hero4 = heroID;
    }
}

function refreshQuestLocations() {
    $questLocations.empty();
    $questSelect.show();
    $questPartySelect.hide();
    QuestManager.available().forEach(quest => {
        createQuestContainer(quest).appendTo($questLocations);
    });
}

function createQuestContainer(quest) {
    const d = $("<div/>").addClass("questLocationContainer").data("questID",quest.id);
    $("<div/>").addClass("questName").html(quest.name).appendTo(d);
    $("<div/>").addClass("questDesc").html(quest.description).appendTo(d);
    const d1 = $("<div/>").addClass("questReq").html("Requirements").appendTo(d);
    $("<div/>").addClass("questReqStat").html(`${miscIcons.pow} ${quest.powReq} ${miscIcons.hp} ${quest.hpReq}`).appendTo(d1);
    $("<div/>").addClass("questTime").html(`${miscIcons.time} ${msToTime(quest.timeReq)}`);
    const d2 = $("<div/>").addClass("questStatus").html("Status").appendTo(d);
    $("<div/>").addClass("questStatusText").html(quest.state).appendTo(d2);
    if (quest.state === QuestState.running) $("<div/>").addClass("questStatusTime").html(msToTime(quest.remaining())).appendTo(d2);
    return d;    
}

//click on a quest to start making team
$(document).on("click", ".questLocationContainer", (e) => {
    e.preventDefault();
    QuestManager.questView = $(e.currentTarget).data("questID");
    QuestManager.clearParty();
    showQuestParty();
});

const $qpHeader = $("#qpHeader");
const $qpTeam = $("#qpTeam");
const $qpAvailable = $("#qpAvailable");

function showQuestParty() {
    $questSelect.hide();
    $questPartySelect.show();
    const quest = QuestManager.idToQuest(QuestManager.questView);
    //populate header
    $qpHeader.empty();
    $("<div/>").addClass(`qpBackButton`).html(`<i class="fas fa-arrow-left"></i>`).appendTo($qpHeader);
    $("<div/>").addClass(`qpHeaderBanner`).css("background", `url(/assets/images/quest/background.jpg)`).appendTo($qpHeader);
    $("<div/>").addClass(`qpHeaderTitle`).html(quest.name).appendTo($dtsHeader);
    $("<div/>").addClass(`qpHeaderFlavor`).html(quest.description).appendTo($dtsHeader);
    //populate team
    $qpTeam.empty();
    if (quest.hero1 !== "None") characterCard("questTeam","hero1",QuestManager.hero1).appendTo($qpTeam);
    if (quest.hero2 !== "None") characterCard("questTeam","hero2",QuestManager.hero2).appendTo($qpTeam);
    if (quest.hero3 !== "None") characterCard("questTeam","hero3",QuestManager.hero3).appendTo($qpTeam);
    if (quest.hero4 !== "None") characterCard("questTeam","hero4",QuestManager.hero4).appendTo($qpTeam);
    //populate available
    $qpAvailable.empty();
    const d = $("<div/>").addClass("qpSelectHeader").appendTo($qpAvailable);
        const d1 = $("<div/>").addClass("headingDetails").appendTo(d);
        $("<div/>").addClass("headingTitle").html("Your Available Heroes").appendTo(d1);
        $("<div/>").addClass("headingDescription").html("A list of your available heroes").appendTo(d1);
    const d2 = $("<div/>").addClass("qpAvailableDiv").appendTo($qpAvailable);
    HeroManager.ownedHeroes().forEach(hero => {
        if (hero.inDungeon) characterCard("questNotAvailable",hero.uniqueid,hero.id,"in_dungeon").appendTo(d2);
        else if (hero.inQuest) characterCard("questNotAvailable",hero.uniqueid,hero.id,"in_quest").appendTo(d2);
        else if (QuestManager.inParty(hero.id)) characterCard("partyHero questNotAvailable",hero.uniqueid,hero.id,"in_party").appendTo(d2);
        else characterCard("questAvailable",hero.uniqueid,hero.id,null).appendTo(d2);
    });
}

//click on a hero to remove from team
$(document).on("click", ".questTeamCardClick", (e) => {
    e.preventDefault();
    const heroID = $(e.currentTarget).data("heroID");
    QuestManager.removeParty(heroID);
    showQuestParty();
});

//click on a hero to add to team
$(document).on("click", ".questAvailableCardClick", (e) => {
    e.preventDefault();
    const heroID = $(e.currentTarget).attr("heroID");
    QuestManager.addParty(heroID);
    showQuestParty();
});

//Team Back Button
$(document).on("click", ".qpBackButton", (e) => {
    e.preventDefault();
    refreshQuestLocations();
});