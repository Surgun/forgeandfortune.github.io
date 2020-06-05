"use strict";

const QuestState = Object.freeze({idle:"Idle",running:"In Progress",success:"Success",failure:"Failure"});

const $questLocations = $("#questLocations");
const $questSelect = $("#questSelect");
const $questPartySelect = $("#questPartySelect");

class Quest {
    constructor(props) {
        Object.assign(this, props);
        this.elapsed = 0;
        this.state = QuestState.idle;
        this.unlocked = false;
        this.heroids = [];
        this.future = false;
    }
    createSave() {
        const save = {};
        save.id = this.id;
        save.elapsed = this.elapsed;
        save.state = this.state;
        save.unlocked = this.unlocked;
        save.heroids = this.heroids;
        save.future = this.future;
        return save;
    }
    loadSave(save) {
        this.elapsed = save.elapsed;
        this.state = save.state;
        this.unlocked = save.unlocked;
        this.heroids = save.heroids;
        this.future = save.future;
    }
    lockTeam(heroids) {
        if (this.state !== QuestState.idle) return;
        this.heroids = heroids;
        this.state = QuestState.running;
        this.future = Math.random() < this.successChance();
    }
    addTime(ms) {
        if (this.state !== QuestState.running) return;
        this.elapsed += ms;
        if (this.elapsed >= this.timeReq) {
            this.elapsed = 0;
            if (this.future) this.state = QuestState.success;
            else this.state = QuestState.failure;
            refreshQuestText(this);
        }
    }
    collect() {
        if (this.state !== QuestState.success || this.state !== QuestState.failure) return;
        if (this.state === QuestState.success) {

        }
        this.state = QuestState.idle;
    }
    remaining() {
        return this.timeReq - this.elapsed;
    }
    totalPow() {
        const heroes = this.heroids.map(hid=>HeroManager.idToHero(hid));
        return heroes.map(h=>h.getPow());
    }
    totalHP() {
        const heroes = this.heroids.map(hid=>HeroManager.idToHero(hid));
        return heroes.map(h=>h.maxHP());
    }
    successChance() {
        const total = this.hpReq + 8*this.powReq;
        const current = this.totalHP() + 8*this.totalPow();
        return Math.max(0.05,current/total);
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
        if (lastTab === "questsTab") refreshQuestTimes();
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
        const quest = this.idToQuest(this.questView);
        const hero = HeroManager.idToHero(heroID);
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
    },
    pow() {
        const heroIDs = [this.hero1,this.hero2,this.hero3,this.hero4].filter(h=>h);
        console.log(heroIDs);
        if (heroIDs.length === 0) return 0;
        const pow = heroIDs.map(hid=>HeroManager.idToHero(hid).getPow());
        return pow.reduce((a,b)=>a+b,0);
    },
    maxHP() {
        const heroIDs = [this.hero1,this.hero2,this.hero3,this.hero4].filter(h=>h);
        if (heroIDs.length === 0) return 0;
        const hp = heroIDs.map(hid=>HeroManager.idToHero(hid).maxHP());
        return hp.reduce((a,b)=>a+b,0);
    },
    validTeam() {
        const quest = this.idToQuest(this.questView);
        if (quest.hero1 !== "None" && this.hero1 === null) return false;
        if (quest.hero2 !== "None" && this.hero2 === null) return false;
        if (quest.hero3 !== "None" && this.hero3 === null) return false;
        if (quest.hero4 !== "None" && this.hero4 === null) return false;
        return true;
    },
    lockTeam() {
        const heroids = [this.hero1,this.hero2,this.hero3,this.hero4].filter(h => h !== null);
        const quest = this.idToQuest(this.questView);
        quest.lockTeam(heroids);
        this.questView = null;
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

function refreshQuestTimes() {
    QuestManager.quests.forEach(quest => {
        if (quest.state !== QuestState.running) return;
        $("#qst"+quest.id).html(msToTime(quest.remaining()));
    })
}

function refreshQuestText(quest) {
    if (quest.state === QuestState.idle) $("#qst"+quest.id).html("Idle");
    if (quest.state === QuestState.running) $("#qst"+quest.id).html(msToTime(quest.remaining()));
    if (quest.state === QuestState.success) $("#qst"+quest.id).html("Success");
    if (quest.state === QuestState.failure) $("#qst"+quest.id).html("Failure");   
}

function createQuestContainer(quest) {
    const d = $("<div/>").addClass("questLocationContainer").data("questID",quest.id);
    $("<div/>").addClass("questName").html(quest.name).appendTo(d);
    $("<div/>").addClass("questDesc").html(quest.description).appendTo(d);
    const d1 = $("<div/>").addClass("questReq").html("Requirements").appendTo(d);
    $("<div/>").addClass("questReqStat").html(`${miscIcons.pow} ${quest.powReq} ${miscIcons.hp} ${quest.hpReq}`).appendTo(d1);
    $("<div/>").addClass("questTime").html(`${miscIcons.time} ${msToTime(quest.timeReq)}`).appendTo(d1);
    const d2 = $("<div/>").addClass("questStatus").html("Status").appendTo(d);
    $("<div/>").addClass("questStatusText").html(quest.state).appendTo(d2);
    if (quest.state === QuestState.running) $("<div/>").addClass("questStatusTime").attr("id","qst"+quest.id).html(msToTime(quest.remaining())).appendTo(d2);
    return d;    
}

//click on a quest to start making team
$(document).on("click", ".questLocationContainer", (e) => {
    e.preventDefault();
    const qid = $(e.currentTarget).data("questID");
    const quest = QuestManager.idToQuest(qid);
    if (quest.state !== QuestState.idle) return;
    QuestManager.questView = qid;
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
    $("<div/>").addClass(`qpHeaderTitle`).html(quest.name).appendTo($qpHeader);
    $("<div/>").addClass(`qpHeaderFlavor`).html(quest.description).appendTo($qpHeader);
    const a = $("<div/>").addClass(`qpHeaderCriteria`).appendTo($qpHeader);
        $("<div/>").addClass("qpHeaderReqStat").html(`${miscIcons.pow} ${quest.powReq} ${miscIcons.hp} ${quest.hpReq}`).appendTo(a);
        $("<div/>").addClass("qpHeaderTime").html(`${miscIcons.time} ${msToTime(quest.timeReq)}`).appendTo(a);
    const b = $("<div/>").addClass(`qpHeaderCurrent`).appendTo($qpHeader);
        $("<div/>").addClass("qpHeaderCurrStat").html(`${miscIcons.pow} ${QuestManager.pow()} ${miscIcons.hp} ${QuestManager.maxHP()}`).appendTo(b);
        $("<div/>").addClass("qpHeaderChance").html(`Success chance: ${Math.floor(quest.successChance()*100)}%`).appendTo(b);
    const c = $("<div/>").addClass("qpHeaderStartQuest").html(`Start Quest`).appendTo($qpHeader);
    if (!QuestManager.validTeam()) c.addClass("qpHeaderInvalidTeam");
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
        if (hero.state === HeroState.inDungeon) characterCard("questNotAvailable",hero.uniqueid,hero.id,"in_dungeon").appendTo(d2);
        else if (hero.state === HeroState.inQuest) characterCard("questNotAvailable",hero.uniqueid,hero.id,"in_quest").appendTo(d2);
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

//Quest Start Button
$(document).on("click", ".qpHeaderStartQuest", (e) => {
    e.preventDefault();
    if ($(e.currentTarget).hasClass("qpHeaderInvalidTeam")) {
        Notifications.invalidQuestTeam();
        return;
    }
    QuestManager.lockTeam();
    refreshQuestLocations();
})