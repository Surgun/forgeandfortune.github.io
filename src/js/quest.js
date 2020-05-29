"use strict";

/*
  {
    "id": "Q0001",
    "name": "Quest Title",
    "description": "Quest Description",
    "hero1": "Might",
    "hero2": "Mind",
    "hero3": "Moxie",
    "hero4": "None",
    "powReq": 200,
    "hpReq": 1000,
    "timeReq": 1000000,
    "repeatable": true,
    "openReq": "Perk"
  },
  */
 
class Quest {
    constructor(props) {
        Object.assign(this, props);
        this.timesComplete = 0;
        this.timeTrack = 0;
        this.heroIDs = [];
        this.state = "idle";
        this.success = false;
    }
    createSave() {
        const save = {};
        save.id = this.id;
        save.timesComplete = this.timesComplete;
        save.timeTrack = this.timeTrack;
        save.heroIDs = this.heroIDs;
        save.state = this.state;
        save.success = this.success;
        return save;
    }
    loadSave(save) {
        this.timesComplete = save.timesComplete;
        this.timeTrack = save.timeTrack;
        this.heroIDs = save.heroIDs;
        this.heroes = this.heroIDs.map(h=>HeroManager.idToHero(h));
        this.state = save.state;
        this.success = save.success;
    }
    addTime(ms) {
        if (this.state !== "running") return;
        this.timeTrack += ms;
        if (this.timeTrack > this.timeReq) {
            this.timeTrack = 0;
            this.state = "complete";
        }
    }
    complete() {
        if (this.state !== "complete") return;
        this.state = "idle";
        this.timesComplete += 1;
    }
    startQuest(heroIDs) {
        if (this.state !== "idle") return;
        this.heroIDs = heroIDs;
        this.heroes = heroIDs.map(h=>HeroManager.idToHero(h));
        this.timeTrack = 0;
        this.rollSuccess();
        this.state = "running";
    }
    successOdds() {
        const pow = this.heroes.map(h=>h.pow());
        const hp = this.heroes.map(h=>h.maxHP());
        const powPercent = Math.min(1,pow/this.powReq);
        const hpPercent = Math.min(1,hp/this.hpReq);
        const success = Math.floor((powPercent+hpPercent)*50);
        return Math.max(5,(success-80)*5);
    }
    rollSuccess() {
        const criteria = this.successOdds();
        const roll = Math.floor(Math.random() * 100)
        this.success = roll < criteria;
    }
    unlocked() {
        return true;
    }
    heroes() {
        return this.heroIDs.map(h=>HeroManager.idToHero(h));
    }
}

const QuestManager = {
    quests : [],
    unlocked : false,
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
        this.unlocked = save.unlocked;
        save.quests.forEach(questSave => {
            const quest = this.idToQueest(quest.id);
            quest.loadSave(questSave);
        });
    },
    idToQueest(questID) {
        return this.quest.find(quest=>quest.id === questID);
    },
    addTime(ms) {
        this.quests.forEach(quest=>quest.addTime(ms));
    },
    unlockedQuests() {
        this.quests.filter(q=>q.unlocked());
    }
}