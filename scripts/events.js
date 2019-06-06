"use strict";

const EventManager = {
    events : [],
    oldEvents : [],
    eventDB : [],
    eventNum : 0,
    seeOld : false,
    createSave() {
        const save = {};
        save.events = [];
        this.events.forEach(e => {
            save.events.push(e.createSave());
        })
        save.oldEvents = [];
        this.oldEvents.forEach(e => {
            save.oldEvents.push(e.createSave());
        })
        return save;
    },
    loadSave(save) {
        save.events.forEach(e => {
            const eventTemplate = this.idToEventDB(e.id);
            const event = new Event(eventTemplate);
            event.loadSave(e);
            event.eventNum = this.eventNum;
            this.eventNum += 1;
            this.events.push(event);
        });
        if (save.oldEvents === undefined) return;
        save.oldEvents.forEach(e => {
            const eventTemplate = this.idToEventDB(e.id);
            const event = new Event(eventTemplate);
            event.loadSave(e);
            event.eventNum = this.eventNum;
            this.eventNum += 1;
            this.oldEvents.push(event);
        });
    },
    loadEvent(props) {
        this.eventDB.push(new EventTemplate(props));
    },
    idToEventDB(eventID) {
        return this.eventDB.find(e => e.id === eventID);
    },
    eventNumToEvent(eventNum) {
        return this.events.concat(this.oldEvents).find(event => event.eventNum === eventNum)
    },
    addEvent(eventID) {
        const eventTemplate = this.idToEventDB(eventID);
        const event = new Event(eventTemplate);
        event.eventNum = this.eventNum;
        this.eventNum += 1;
        if (event.id === "E001") event.reward = [{id:"M001",amt:miscLoadedValues.startingGold}];
        this.events.push(event);
        refreshEvents();
    },
    addEventDungeon(id, reward,time,floor,beats) {
        const eventTemplate = this.idToEventDB(id);
        const event = new Event(eventTemplate);
        event.reward = reward;
        event.time = time;
        event.floor = floor;
        event.beats = beats;
        event.eventNum = this.eventNum;
        this.eventNum += 1;
        this.events.push(event);
        refreshEvents();
    },
    addEventBoss(id,time) {
        const eventTemplate = this.idToEventDB("E013");
        const event = new Event(eventTemplate);
        event.bossKill = id;
        event.time = time;
        event.eventNum = this.eventNum;
        this.eventNum += 1;
        this.events.push(event);
        refreshEvents();
    },
    addEventFuse(container) {
        const eventTemplate = this.idToEventDB("E009")
        const event = new Event(eventTemplate);
        event.itemReward = container;
        event.eventNum = this.eventNum;
        this.eventNum += 1;
        this.events.push(event);
        refreshEvents();
    },
    hasEvents() {
        return this.events.length > 0;
    },
    hasSeen(eventID) {
        return this.events.concat(this.oldEvents).map(e=>e.id).includes(eventID);
    },
    readEvent(eventNum) {
        const event = this.eventNumToEvent(eventNum);
        if (event.reward !== null) {
            ResourceManager.addDungeonDrops(event.reward);
            ActionLeague.addNoto(event.notoriety());
        }
        event.reward = null;
        if (event.itemReward !== null) {
            if (Inventory.full()) {
                Notifications.rewardInvFull();
                return;
            }
            Inventory.addToInventory(event.itemReward.id,event.itemReward.rarity,-1);
        }
        if (event.id === "E009") {
            TownManager.bankOnce = true;
            TownManager.bankSee = true;
            refreshSideTown();
        }
        if (event.id === "E010") {
            TownManager.fuseOnce = true;
            TownManager.fuseSee = true;
            refreshSideTown();
        }
        if (event.id === "E011") {
            TownManager.smithOnce = true;
            TownManager.smithSee = true;
            refreshSideTown();
        }
        if (event.id === "E012") {
            TownManager.fortuneOnce = true;
            TownManager.fortuneSee = true;
            refreshSideTown();
        }
        if (event.type === "letter" && !this.oldEvents.map(e=>e.id).includes(event.id)) this.oldEvents.push(event);
        this.events = this.events.filter(e=>e.eventNum !== eventNum);
        refreshEvents();
    }
};

class EventTemplate {
    constructor (props) {
        Object.assign(this, props);
        this.image = '<img src="images/DungeonIcons/event.png" alt="Event">';
        const event2icons = ["E014", "E015", "E016"];
        if (event2icons.includes(this.id)) this.image = '<img src="images/DungeonIcons/event2.png" alt="Event">';
        else this.image = '<img src="images/DungeonIcons/event.png" alt="Event">';
    }
}

class Event {
    constructor(props) {
        this.reward = null;
        this.itemReward = null;
        this.time = null;
        this.floor = null;
        this.recipeRewards = null;
        this.bossKill = null;
        this.beats = null;
        Object.assign(this, props);
        this.date = currentDate();
    }
    createSave() {
        const save = {};
        save.id = this.id;
        save.reward = this.reward;
        save.time = this.time;
        save.floor = this.floor;
        save.date = this.date;
        save.itemReward = this.itemReward;
        save.bossKill = this.bossKill;
        save.beats = this.beats;
        return save;
    }
    loadSave(save) {
        this.reward = save.reward;
        this.time = save.time;
        this.floor = save.floor;
        this.date = save.date;
        if (save.bossKill !== undefined) this.bossKill = save.bossKill;
        if (save.itemReward !== undefined) this.itemReward = save.itemReward;
        if (save.beats !== undefined) this.beats = save.beats;
    }
    notoriety() {
        if (this.reward === null) return;
        return ActionLeague.generateNoto(this.reward);
    }
};

const $eventList = $("#eventList");
const $eventContent = $("#eventContent");
const $eventTab = $("#eventTab");

function refreshEvents() {
    $eventContent.empty();
    if (EventManager.hasEvents()) $eventTab.addClass("hasEvent");
    else $eventTab.removeClass("hasEvent");
    $eventList.empty();
    let events = EventManager.events;
    if (EventManager.seeOld) events = EventManager.oldEvents;
    events.forEach(event => {
        const d1 = $("<div/>").addClass("eventList").attr("eventNum",event.eventNum).html(`${event.image} ${event.title}`);
        $eventList.append(d1);
    });
    if (events.length == 0) {
        const d1 = $("<div/>").addClass("events-placeholder-details").html("You have no mail to read at the moment."); 
        $eventList.append(d1);
    }
}

function dungeonDrops(event) {
    //returns a bunch of divs for the rewards
    const d = $("<div/>").addClass("rewardDiv");
    const d1 = $("<div/>").addClass("rewardDivTitle").html("Rewards");
    d.append(d1);
    event.reward.forEach(reward => {
        const d2 = $("<div/>").addClass("rewardCard tooltip").attr("data-tooltip",ResourceManager.idToMaterial(reward.id).name);
        const d3 = $("<div/>").addClass("rewardImage").html(ResourceManager.idToMaterial(reward.id).img);
        const d4 = $("<div/>").addClass("rewardAmt").html(reward.amt);
        d.append(d2.append(d3,d4));
    });
    return d;
}

function bossRecipeUnlocks(recipes) {
    const d = $("<div/>").addClass("rewardDiv");
    const d1 = $("<div/>").addClass("rewardDivTitle").html("Rewards");
    d.append(d1);
    recipes.forEach(recipe => {
        const d2 = $("<div/>").addClass("rewardCard tooltip").attr("data-tooltip",recipe.name);
        const d3 = $("<div/>").addClass("rewardImage").html(recipe.itemPic());
        d.append(d2.append(d3));
    });
    return d;
}

$(document).on('click', "div.eventList", (e) => {
    //display the text for a clicked event
    e.preventDefault();
    $("div.eventList").removeClass("highlight");
    $(e.currentTarget).addClass("highlight");
    const eventNum = parseInt($(e.currentTarget).attr("eventNum"));
    const event = EventManager.eventNumToEvent(eventNum);
    $eventContent.empty();
    const d = $("<div/>").addClass("eventBody");
    const d1 = $("<div/>").addClass("eventAuthor").html(`<span>Received from:</span> ${event.author}`);
    const d1a = $("<div/>").addClass("eventAuthor").html(`<span>Date:</span> ${event.date}`);
    const d2 = $("<div/>").addClass("eventMessage").html(event.message);
    const d3 = $("<div/>").addClass("eventStatsContainer");
    d.append(d1,d1a,d2,d3);
    if (event.time !== null) {
        const d3a = $("<div/>").addClass("eventTimeContainer eventContainer");
        const d3a1 = $("<div/>").addClass("eventTimeHeading eventHeading").html("Total Time");
        const d3a2 = $("<div/>").addClass("eventTime eventDescription").html(timeSince(0,event.time));
        d3.append(d3a.append(d3a1,d3a2));
    }
    if (event.floor !== null) {
        const d3b = $("<div/>").addClass("eventFloorContainer eventContainer");
        const d3b1 = $("<div/>").addClass("eventFloorHeading eventHeading").html("Floor Reached");
        const d3b2 = $("<div/>").addClass("eventFloor eventDescription").html("Floor " + event.floor);
        d3.append(d3b.append(d3b1,d3b2));
    }
    if (event.beats !== null) {
        const d3c = $("<div/>").addClass("eventBeatContainer eventContainer");
        const d3c1 = $("<div/>").addClass("eventBeatHeading eventHeading").html("Turns Taken");
        const d3c2 = $("<div/>").addClass("eventBeat eventDescription").html(event.beats + " turns");
        d3.append(d3c.append(d3c1,d3c2));
    }
    if (event.reward !== null ) {
        const d4 = $("<div/>").addClass("eventReward").html(dungeonDrops(event));
        d.append(d4);
    }
    if (event.itemReward !== null) {
        const item = recipeList.idToItem(event.itemReward.id);
        const d5 = $("<div/>").addClass("iR"+event.itemReward.rarity).html(item.itemPicName());
        d.append(d5);
    }
    if (event.reward !== null && event.id !== "E001") {
        const d6 = $("<div/>").addClass("eventNotorietyContainer")
        const d6a = $("<div/>").addClass("eventNotorietyHeading").html(`Notoriety Earned`);
        const d6b = $("<div/>").addClass("eventNotoriety").html(` You have earned <span>${event.notoriety()} Notoriety</span>. Make use of it in The Action League. `)
        d.append(d6.append(d6a,d6b));
    }
    const d7 = $("<div/>").addClass("eventConfirm").attr("eventID",eventNum).html("ACCEPT");
    if (EventManager.seeOld) d7.hide();
    d.append(d7);
    $eventContent.append(d);
});

$(document).on('click', "div.eventConfirm", (e) => {
    //gets rid of event, and adds to inventory if you need to
    e.preventDefault();
    const eventID = parseInt($(e.currentTarget).attr("eventID"));
    EventManager.readEvent(eventID);
})

$(document).on('click', "#readNew", (e) => {
    $(e.currentTarget).addClass("readActive");
    $("#readOld").removeClass("readActive");
    EventManager.seeOld = false;
    refreshEvents();
})

$(document).on('click', "#readOld", (e) => {
    $(e.currentTarget).addClass("readActive");
    $("#readNew").removeClass("readActive");
    EventManager.seeOld = true;
    refreshEvents();
})

function eventChecker() {
    if (!EventManager.hasSeen("E002") && !WorkerManager.workers.some(w => w.type === "standard" && !w.owned)) EventManager.addEvent("E002");
    if (!EventManager.hasSeen("E003") && WorkerManager.workers.some(w => w.type === "advanced" && w.owned)) EventManager.addEvent("E003");
    if (!EventManager.hasSeen("E005") && achievementStats.totalItemsCrafted >= 10000) EventManager.addEvent("E005");
    if (!EventManager.hasSeen("E006") && masteredItem) EventManager.addEvent("E006");
    if (!EventManager.hasSeen("E007") && Inventory.full()) EventManager.addEvent("E007");
    if (!EventManager.hasSeen("E009") && achievementStats.maxFloor >= miscLoadedValues.buildingFloorUnlock[0]) EventManager.addEvent("E009");
    if (!EventManager.hasSeen("E010") && TownManager.bankUnlock && achievementStats.maxFloor >= miscLoadedValues.buildingFloorUnlock[1]) EventManager.addEvent("E010");
    if (!EventManager.hasSeen("E011") && TownManager.fuseUnlock && achievementStats.maxFloor >= miscLoadedValues.buildingFloorUnlock[2]) EventManager.addEvent("E011");
    if (!EventManager.hasSeen("E012") && TownManager.smithUnlock && achievementStats.maxFloor >= miscLoadedValues.buildingFloorUnlock[3]) EventManager.addEvent("E012");
}

let masteredItem = false;