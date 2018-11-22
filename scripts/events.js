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
    addEventDungeon(reward,time,floor) {
        const eventTemplate = this.idToEventDB("E004");
        const event = new Event(eventTemplate);
        event.reward = reward;
        event.time = time;
        event.floor = floor;
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
        if (event.reward !== null) ResourceManager.addDungeonDrops(event.reward);
        event.reward = null;
        if (event.itemReward !== null) {
            if (Inventory.full()) {
                Notifications.rewardInvFull();
                return;
            }
            Inventory.addToInventory(event.itemReward.id,event.itemReward.rarity,-1);
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
    }
}

class Event {
    constructor(props) {
        this.reward = null;
        this.itemReward = null;
        this.time = null;
        this.floor = null;
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
        return save;
    }
    loadSave(save) {
        this.reward = save.reward;
        this.time = save.time;
        this.floor = save.floor;
        this.date = save.date;
        if (save.itemReward !== undefined) this.itemReward = save.itemReward;
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

$(document).on('click', "div.eventList", (e) => {
    //display the text for a clicked event
    e.preventDefault();
    $("div.eventList").removeClass("highlight");
    $(e.currentTarget).addClass("highlight");
    const eventNum = parseInt($(e.currentTarget).attr("eventNum"));
    const event = EventManager.eventNumToEvent(eventNum);
    $eventContent.empty();
    const d = $("<div/>").addClass("eventBody");
    const d1 = $("<div/>").addClass("eventAuthor").html(`FROM: ${event.author}`);
    const d1a = $("<div/>").addClass("eventAuthor").html(`DATE: ${event.date}`);
    const d2 = $("<div/>").addClass("eventMessage").html(event.message);
    d.append(d1,d1a,d2);
    if (event.time !== null) {
        const d3a = $("<div/>").addClass("eventStatTitle").html("Adventure Statistics");
        const d3 = $("<div/>").addClass("eventTimeHeading").html("Total Time:");
        const d4 = $("<div/>").addClass("eventTime").html(msToTime(event.time));
        d.append(d3a,d3,d4);
    }
    if (event.floor !== null) {
        const d5 = $("<div/>").addClass("eventFloorHeading").html("Floor Reached:");
        const d6 = $("<div/>").addClass("eventFloor").html("Floor " + event.floor);
        d.append(d5,d6);
    }
    if (event.reward !== null ) {
        const d7 = $("<div/>").addClass("eventReward").html(dungeonDrops(event));
        d.append(d7);
    }
    if (event.itemReward !== null) {
        const item = recipeList.idToItem(event.itemReward.id);
        const d8 = $("<div/>").addClass("iR"+event.itemReward.rarity).html(item.itemPicName());
        d.append(d8);
    }
    const d9 = $("<div/>").addClass("eventConfirm").attr("eventID",eventNum).html("ACCEPT");
    if (EventManager.seeOld) d9.hide();
    d.append(d9);
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
}

function autoSacEvent() {
    if (!EventManager.hasSeen("E008")) EventManager.addEvent("E008");
}

let masteredItem = false;