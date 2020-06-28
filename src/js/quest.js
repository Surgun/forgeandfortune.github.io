"use strict";

const QuestState = Object.freeze({idle:"idle",running:"in_progress",success:"success",failure:"failure"});

const $questSelect = $("#questSelect");
const $questSelectHeader = $("#questSelectHeader");
const $questLocations = $("#questLocations");
const $questPartySelect = $("#questPartySelect");

class Quest {
    constructor(props) {
        Object.assign(this, props);
        this.elapsed = 0;
        this.state = QuestState.idle;
        this.heroids = [];
        this.future = false;
        this.complete = false;
    }
    createSave() {
        const save = {};
        save.id = this.id;
        save.elapsed = this.elapsed;
        save.state = this.state;
        save.heroids = this.heroids;
        save.future = this.future;
        save.complete = this.complete;
        return save;
    }
    loadSave(save) {
        this.elapsed = save.elapsed;
        this.state = save.state;
        this.heroids = save.heroids;
        this.future = save.future;
        this.complete = save.complete;
    }
    lockTeam(heroids) {
        if (this.state !== QuestState.idle) return;
        this.heroids = heroids;
        this.heroids.forEach(heroid => {
            const hero = HeroManager.idToHero(heroid);
            hero.state = HeroState.inQuest;
        })
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
        if (this.state === QuestState.success) {
            this.complete = true;
            if (this.rewardType === "Gold") ResourceManager.addMaterial("M001",this.rewardAmt);
            if (this.rewardType === "Playbook") HeroManager.unlockPlaybook(this.rewardAmt);
        }
        this.state = QuestState.idle;
        this.heroids.forEach(heroid => {
            const hero = HeroManager.idToHero(heroid);
            hero.state = HeroState.idle;
        })
    }
    remaining() {
        return this.timeReq - this.elapsed;
    }
    totalPow(useQuestManager) {
        const heroids = useQuestManager ? QuestManager.heroids() : this.heroids.filter(h=>h);
        if (heroids.length === 0) return 0;
        const heroes = heroids.map(hid=>HeroManager.idToHero(hid));
        return heroes.map(h=>h.getPow()).reduce((a,b) => a+b);
    }
    totalHP(useQuestManager) {
        const heroids = useQuestManager ? QuestManager.heroids() : this.heroids.filter(h=>h);
        if (heroids.length === 0) return 0;
        const heroes = heroids.map(hid=>HeroManager.idToHero(hid));
        return heroes.map(h=>h.maxHP()).reduce((a,b) => a+b);
    }
    successChance(useQuestManager) {
        const total = this.hpReq + 8*this.powReq;
        const current = this.totalHP(useQuestManager) + 8*this.totalPow(useQuestManager);
        const chance = current/total;
        if (chance < 0.05) return 0.05;
        if (chance > 1) return 1;
        return chance;
    }
    available() {
        if (this.openReqType === "Perk" && !Shop.alreadyPurchased(this.openReq)) return false;
        if (this.openReqType === "Quest" && !QuestManager.idToQuest(this.openReq).complete) return false;
        if (this.openReqType === "Boss" && !DungeonManager.beaten(this.openReq)) return false;
        if (this.complete && !this.repeatable) return false;
        return true;
    }
}

const QuestManager = {
    quests : [],
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
        save.quests = [];
        this.quests.forEach(quest => {
            save.quests.push(quest.createSave());
        });
        return save;
    },
    loadSave(save) {
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
    unlocked() {
        return this.quests.some(q=>q.available());
    },
    available() {
        return this.quests.filter(q=>q.available());
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
        if (!this.hero1 && quest.hero1 === heroID) return this.hero1 = heroID;
        if (!this.hero2 && quest.hero2 === heroID) return this.hero2 = heroID;
        if (!this.hero3 && quest.hero3 === heroID) return this.hero3 = heroID;
        if (!this.hero4 && quest.hero4 === heroID) return this.hero4 = heroID;
        //loop through type and add it if it matches
        if (!this.hero1 && quest.hero1 === hero.type) return this.hero1 = heroID;
        if (!this.hero2 && quest.hero2 === hero.type) return this.hero2 = heroID;
        if (!this.hero3 && quest.hero3 === hero.type) return this.hero3 = heroID;
        if (!this.hero4 && quest.hero4 === hero.type) return this.hero4 = heroID;
        //loop through and add to first blank
        if (!this.hero1 && quest.hero1 === "Any") return this.hero1 = heroID;
        if (!this.hero2 && quest.hero2 === "Any") return this.hero2 = heroID;
        if (!this.hero3 && quest.hero3 === "Any") return this.hero3 = heroID;
        if (!this.hero4 && quest.hero4 === "Any") return this.hero4 = heroID;
    },
    pow() {
        const heroIDs = [this.hero1,this.hero2,this.hero3,this.hero4].filter(h=>h);
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
    },
    heroids() {
        return [this.hero1,this.hero2,this.hero3,this.hero4].filter(h=>h);
    }
}

function refreshQuestLocations(skipAnim) {
    $questLocations.empty();
    $questSelect.show();
    $questPartySelect.hide();
    QuestManager.available().forEach(quest => {
        createQuestContainer(quest,skipAnim).appendTo($questLocations);
    });
}

function refreshQuestTimes() {
    QuestManager.quests.forEach(quest => {
        if (quest.state !== QuestState.running) return;
        $("#qst"+quest.id).html(msToTime(quest.remaining()));
    })
}

function refreshQuestText(quest) {
    if (quest.state === QuestState.idle) $("#qst"+quest.id).html(displayText('quests_status_idle'));
    if (quest.state === QuestState.running) $("#qst"+quest.id).html(msToTime(quest.remaining()));
    if (quest.state === QuestState.success) {
        $("#q"+quest.id).removeClass('questActive').addClass("questSuccess");
        $("#qst2"+quest.id).hide();
        $("#qst"+quest.id).html(displayText('quests_status_success'));
        $("#qsti"+quest.id).hide();
    }
    if (quest.state === QuestState.failure) {
        $("#q"+quest.id).removeClass('questActive').addClass("questFailure");
        $("#qst2"+quest.id).hide();
        $("#qst"+quest.id).html(displayText('quests_status_failure'));
        $("#qsti"+quest.id).hide();
    }
}

function generateQuestSelectHeader() {
    $questSelectHeader.empty();
    const a = $("<div/>").addClass("contentHeader").appendTo($questSelectHeader);
        const a1 = $("<div/>").addClass("contentHeading").appendTo(a);
        $("<div/>").addClass("headingIcon").html('<i class="fas fa-map-signs"></i>').appendTo(a1);
            const a1a = $("<div/>").addClass("headingDetails").appendTo(a1);
            $("<div/>").addClass("headingTitle").html(displayText('header_quests_select_title')).appendTo(a1a);
            $("<div/>").addClass("headingDescription").html(displayText('header_quests_select_desc')).appendTo(a1a);
}

function createQuestContainer(quest,skipAnim) {
    const d = $("<div/>").attr("id","q"+quest.id).addClass("questLocationContainer").data("questID",quest.id);
    if (skipAnim) d.css({"animation": "none"});
    if (quest.state === QuestState.running) d.addClass("questActive");
    if (quest.state === QuestState.success) d.removeClass("questActive").addClass("questSuccess");
    if (quest.state === QuestState.failure) d.removeClass("questActive").addClass("questFailure");
    $("<div/>").addClass("questName").html(quest.name).appendTo(d);
    $("<div/>").addClass("questDesc").html(`<span>${quest.description}</span>`).appendTo(d);
    const d1 = $("<div/>").addClass("questReq").appendTo(d);
        $("<div/>").addClass("questReqHeader").html(displayText('quests_location_heading_reqs')).appendTo(d1);
        const equipStats = $("<div/>").addClass("questStats equipStats").appendTo(d1);
            const ed1 = $("<div/>").addClass('gearStat tooltip').attr({"data-tooltip": 'pow'}).appendTo(equipStats);
                $("<div/>").addClass(`pow_img`).html(miscIcons.pow).appendTo(ed1);
                $("<div/>").addClass(`pow_integer statValue`).html(quest.powReq).appendTo(ed1);
            const ed2 = $("<div/>").addClass('gearStat tooltip').attr({"data-tooltip": 'hp'}).appendTo(equipStats);
                $("<div/>").addClass(`hp_img`).html(miscIcons.hp).appendTo(ed2);
                $("<div/>").addClass(`hp_integer statValue`).html(quest.hpReq).appendTo(ed2);
    const questTime = $("<div/>").addClass("questTime tooltip").attr({'data-tooltip':'quest_time'}).appendTo(d1);
        $("<div/>").addClass("questTimeIcon").html(miscIcons.time).appendTo(questTime);
        $("<div/>").addClass("questTimeText").html(msToTime(quest.timeReq)).appendTo(questTime);
    const d2 = $("<div/>").addClass("questStatus").appendTo(d);
        $("<div/>").attr("id","qst2"+quest.id).addClass("questStatusText").html(displayText(`quests_status_${quest.state}`)).appendTo(d2);
    if (quest.state === QuestState.running) {
        const questRunningTime = $("<div/>").addClass("questStatusTime tooltip").attr({'data-tooltip':'quest_time_remaining'}).appendTo(d2);
            $("<div/>").addClass("questTimeIcon").attr("id","qsti"+quest.id).html(miscIcons.time).appendTo(questRunningTime);
            $("<div/>").addClass("questTimeText").attr("id","qst"+quest.id).html(msToTime(quest.remaining())).appendTo(questRunningTime);
    }
    return d;    
}

//click on a quest to start making team
$(document).on("click", ".questLocationContainer", (e) => {
    e.preventDefault();
    const qid = $(e.currentTarget).data("questID");
    const quest = QuestManager.idToQuest(qid);
    if (quest.state === QuestState.running) return;
    if (quest.state === QuestState.failure || quest.state === QuestState.success) {
        quest.collect();
        refreshQuestLocations(true);
        return;
    }
    QuestManager.questView = qid;
    QuestManager.clearParty();
    generateQuestPartyHeaders();
    showQuestParty();
});

function generateSlotClass(type) {
    const hero = HeroManager.idToHero(type);
    const slotClass =  $("<div/>").addClass("slotClass");
    const slotText = $("<div/>").addClass("slotClassText").appendTo(slotClass);
    if (hero !== undefined) {
        slotClass.addClass('classHero');
        slotText.html(hero.name);
    }
    else {
        slotClass.addClass(`class${type}`)
        slotText.html(type);
    }
    return slotClass;
}

const $qpHeader = $("#qpHeader");
const $qpTeam = $("#qpTeam");
const $qpAvailable = $("#qpAvailable");
const $questPartyTeamHeader = $("#questPartyTeamHeader");
const $questHeroesHeader = $("#questHeroesHeader");

function generateQuestPartyHeaders() {
    $questPartyTeamHeader.empty();
    $questHeroesHeader.empty();
    // Quest Party Header
    const a = $("<div/>").addClass("contentHeader").appendTo($questPartyTeamHeader);
        const a1 = $("<div/>").addClass("headingDetails").appendTo(a);
        $("<div/>").addClass("headingTitle").html(displayText('header_quests_party_title')).appendTo(a1);
        $("<div/>").addClass("headingDescription").html(displayText('header_quests_party_desc')).appendTo(a1);
    // Available Heroes Header
    const b = $("<div/>").addClass("contentHeader").appendTo($questHeroesHeader);
        const b1 = $("<div/>").addClass("headingDetails").appendTo(b);
        $("<div/>").addClass("headingTitle").html(displayText('header_quests_heroes_title')).appendTo(b1);
        $("<div/>").addClass("headingDescription").html(displayText('header_quests_heroes_desc')).appendTo(b1);
}

function showQuestParty(skipAnimation) {
    $questSelect.hide();
    $questPartySelect.show();
    const quest = QuestManager.idToQuest(QuestManager.questView);
    //populate header
    $qpHeader.empty().removeClass('questHeaderAnimDisabled');
    if (skipAnimation) $qpHeader.addClass('questHeaderAnimDisabled');
    $("<div/>").addClass(`qpBackButton`).html(`<i class="fas fa-arrow-left"></i>`).appendTo($qpHeader);
    $("<div/>").addClass(`qpHeaderBanner`).css("background", `url(/assets/images/quests/background.png)`).appendTo($qpHeader);
    $("<div/>").addClass(`qpHeaderTitle`).html(quest.name).appendTo($qpHeader);
    $("<div/>").addClass(`qpHeaderFlavor`).html(quest.description).appendTo($qpHeader);

    const a = $("<div/>").addClass(`qpHeaderCriteria`).appendTo($qpHeader);
        const questStats = $("<div/>").addClass("qpHeaderReqStat").appendTo(a);
        const qs1 = $("<div/>").addClass('gearStat tooltip').attr({"data-tooltip": 'pow'}).appendTo(questStats);
            $("<div/>").addClass(`pow_img`).html(miscIcons.pow).appendTo(qs1);
            $("<div/>").addClass(`pow_integer statValue`).html(quest.powReq).appendTo(qs1);
        const qs2 = $("<div/>").addClass('gearStat tooltip').attr({"data-tooltip": 'hp'}).appendTo(questStats);
            $("<div/>").addClass(`hp_img`).html(miscIcons.hp).appendTo(qs2);
            $("<div/>").addClass(`hp_integer statValue`).html(quest.hpReq).appendTo(qs2);
        const questTime = $("<div/>").addClass("qpHeaderTime tooltip").attr({'data-tooltip':'quest_time'}).appendTo(questStats);
            $("<div/>").addClass("questTimeIcon").html(miscIcons.time).appendTo(questTime);
            $("<div/>").addClass("questTimeText").html(msToTime(quest.timeReq)).appendTo(questTime);

    const b = $("<div/>").addClass(`qpActionsContainer`).appendTo($qpHeader);
        const b1 = $("<div/>").addClass("qpHeaderStartQuest actionButton").html(displayText('quests_start_quest_button')).appendTo(b);
        if (!QuestManager.validTeam()) b1.addClass("qpHeaderInvalidTeam");

    const c = $("<div/>").addClass(`qpHeaderCurrent`).appendTo(b);
    const currentStats = $("<div/>").addClass("qpHeaderCurrStat").appendTo(c);
    const cs1 = $("<div/>").addClass('gearStat tooltip').attr({"data-tooltip": 'pow'}).appendTo(currentStats);
        $("<div/>").addClass(`pow_img`).html(miscIcons.pow).appendTo(cs1);
        $("<div/>").addClass(`pow_integer statValue`).html(QuestManager.pow()).appendTo(cs1);
    const cs2 = $("<div/>").addClass('gearStat tooltip').attr({"data-tooltip": 'hp'}).appendTo(currentStats);
        $("<div/>").addClass(`hp_img`).html(miscIcons.hp).appendTo(cs2);
        $("<div/>").addClass(`hp_integer statValue`).html(QuestManager.maxHP()).appendTo(cs2);
    const chanceCount = Math.floor(quest.successChance(true)*100);
    const successChance = $("<div/>").addClass("qpHeaderChance").html(displayText('quests_success_chance').replace('{0}',chanceCount)).appendTo(currentStats);
    if (chanceCount >= 75) successChance.addClass('goodSucessChance');
    else if (chanceCount >= 50) successChance.addClass('neutralSucessChance');
    else successChance.addClass('badSucessChance');

    //populate team
    $qpTeam.empty();
    if (quest.hero1 !== "None") {
        const h1 = characterCard("questTeam","hero1",QuestManager.hero1).appendTo($qpTeam);
        if (!QuestManager.hero1) h1.addClass("noHeroQuestSelect");
        generateSlotClass(quest.hero1).appendTo(h1);
    }
    if (quest.hero2 !== "None") {
        const h2 = characterCard("questTeam","hero2",QuestManager.hero2).appendTo($qpTeam);
        if (!QuestManager.hero2) h2.addClass("noHeroQuestSelect");
        generateSlotClass(quest.hero2).appendTo(h2);
    }
    if (quest.hero3 !== "None") {
        const h3 = characterCard("questTeam","hero3",QuestManager.hero3).appendTo($qpTeam);
        if (!QuestManager.hero3) h3.addClass("noHeroQuestSelect");
        generateSlotClass(quest.hero3).appendTo(h3);
    }
    if (quest.hero4 !== "None") {
        const h4 = characterCard("questTeam","hero4",QuestManager.hero4).appendTo($qpTeam);
        if (!QuestManager.hero4) h4.addClass("noHeroQuestSelect");
        generateSlotClass(quest.hero4).appendTo(h4);
    }
    //populate available
    $qpAvailable.empty();
    const d2 = $("<div/>").addClass("qpAvailableDiv").appendTo($qpAvailable);
    HeroManager.ownedHeroes().forEach(hero => {
        if (hero.state === HeroState.inDungeon) {
            const d2a = characterCard("questNotAvailable",hero.uniqueid,hero.id,"in_dungeon").appendTo(d2);
            generateSlotClass(hero.type).appendTo(d2a);
        }
        else if (hero.state === HeroState.inQuest) {
            const d2a = characterCard("questNotAvailable",hero.uniqueid,hero.id,"in_quest").appendTo(d2);
            generateSlotClass(hero.type).appendTo(d2a);
        }
        else if (QuestManager.inParty(hero.id)) {
            const d2a = characterCard("partyHero questNotAvailable",hero.uniqueid,hero.id,"in_party").appendTo(d2);
            generateSlotClass(hero.type).appendTo(d2a);
        }
        else {
            const d2a = characterCard("questAvailable",hero.uniqueid,hero.id,null).appendTo(d2);
            generateSlotClass(hero.type).appendTo(d2a);
        }
    });
}

//click on a hero to remove from team
$(document).on("click", ".questTeamCardClick", (e) => {
    e.preventDefault();
    const heroID = $(e.currentTarget).attr("heroID");
    QuestManager.removeParty(heroID);
    showQuestParty(true);
});

//click on a hero to add to team
$(document).on("click", ".questAvailableCardClick", (e) => {
    e.preventDefault();
    const heroID = $(e.currentTarget).attr("heroID");
    QuestManager.addParty(heroID);
    showQuestParty(true);
});

//Team Back Button
$(document).on("click", ".qpBackButton", (e) => {
    e.preventDefault();
    refreshQuestLocations();
    generateQuestSelectHeader();
});

//Quest Start Button
$(document).on("click", ".qpHeaderStartQuest", (e) => {
    e.preventDefault();
    if ($(e.currentTarget).hasClass("qpHeaderInvalidTeam")) {
        Notifications.popToast("invalid_quest_team");
        return;
    }
    QuestManager.lockTeam();
    refreshQuestLocations();
    generateQuestSelectHeader();
})