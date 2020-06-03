"use strict";

const QuestState = Object.freeze({idle:0,running:1,complete:2});

const $questLocations = $("#questLocations");

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
}

const QuestManager = {
    quests : [],
    unlocked: false,
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
    }
}

function refreshQuestLocations() {
    $questLocations.empty();
    QuestManager.available().forEach(quest => {
        createQuestContainer(quest).appendTo($questLocations);
    });
}

function createQuestContainer(quest) {
    const d = $("<div/>").addClass("questLocationContainer");
    $("<div/>").addClass("questName").html(quest.name).appendTo(d);
    $("<div/>").addClass("questDesc").html(quest.description).appendTo(d);
    const d1 = $("<div/>").addClass("questReq").html("Requirements:").appendTo(d);
    $("<div/>").addClass("questReqStat").html(`${miscIcons.pow} ${quest.powReq} ${miscIcons.hp} ${quest.hpReq}`).appendTo(d1);
    $("<div/>").addClass("questTime").html(`${miscIcons.time} ${msToTime(quest.timeReq)}`);
    return d;    
}