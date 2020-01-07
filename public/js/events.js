"use strict";

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EventManager = {
  events: [],
  oldEvents: [],
  eventDB: [],
  eventNum: 0,
  seeOld: false,
  createSave: function createSave() {
    var save = {};
    save.events = [];
    this.events.forEach(function (e) {
      save.events.push(e.createSave());
    });
    save.oldEvents = [];
    this.oldEvents.forEach(function (e) {
      save.oldEvents.push(e.createSave());
    });
    return save;
  },
  loadSave: function loadSave(save) {
    var _this = this;

    save.events.forEach(function (e) {
      var eventTemplate = _this.idToEventDB(e.id);

      var event = new Event(eventTemplate);
      event.loadSave(e);
      event.eventNum = _this.eventNum;
      _this.eventNum += 1;

      _this.events.push(event);
    });
    if (save.oldEvents === undefined) return;
    save.oldEvents.forEach(function (e) {
      var eventTemplate = _this.idToEventDB(e.id);

      var event = new Event(eventTemplate);
      event.loadSave(e);
      event.eventNum = _this.eventNum;
      _this.eventNum += 1;

      _this.oldEvents.push(event);
    });
  },
  loadEvent: function loadEvent(props) {
    this.eventDB.push(new EventTemplate(props));
  },
  idToEventDB: function idToEventDB(eventID) {
    return this.eventDB.find(function (e) {
      return e.id === eventID;
    });
  },
  eventNumToEvent: function eventNumToEvent(eventNum) {
    return this.events.concat(this.oldEvents).find(function (event) {
      return event.eventNum === eventNum;
    });
  },
  addEvent: function addEvent(eventID) {
    var eventTemplate = this.idToEventDB(eventID);
    var event = new Event(eventTemplate);
    event.eventNum = this.eventNum;
    this.eventNum += 1;
    if (event.id === "E001") event.reward = [new idAmt("M001", miscLoadedValues.startingGold)];
    this.events.push(event);
    refreshEvents();
  },
  hasEvents: function hasEvents() {
    return this.events.length > 0;
  },
  hasSeen: function hasSeen(eventID) {
    return this.events.concat(this.oldEvents).map(function (e) {
      return e.id;
    }).includes(eventID);
  },
  readEvent: function readEvent(eventNum) {
    var event = this.eventNumToEvent(eventNum);

    if (event.reward !== null) {
      event.reward.forEach(function (reward) {
        ResourceManager.addMaterial(reward.id, reward.amt);
      });
    }

    event.reward = null;
    if (event.type === "letter" && !this.oldEvents.map(function (e) {
      return e.id;
    }).includes(event.id)) this.oldEvents.push(event);
    this.events = this.events.filter(function (e) {
      return e.eventNum !== eventNum;
    });
    $eventContent.empty();
    refreshEvents();
  },
  badCraft: function badCraft() {
    if (!EventManager.hasSeen("E018")) EventManager.addEvent("E018");
  },
  allDungeonEventIDs: function allDungeonEventIDs() {
    return this.events.filter(function (e) {
      return e.type === "dungeon";
    }).map(function (e) {
      return e.eventNum;
    });
  }
};

var EventTemplate = function EventTemplate(props) {
  _classCallCheck(this, EventTemplate);

  Object.assign(this, props);
  this.image = '<img src="/assets/images/DungeonIcons/event.png" alt="Event">';
  var event2icons = ["E014", "E015", "E016"];
  if (event2icons.includes(this.id)) this.image = '<img src="/assets/images/DungeonIcons/event2.png" alt="Event">';else this.image = '<img src="/assets/images/DungeonIcons/event.png" alt="Event">';
};

var Event =
/*#__PURE__*/
function () {
  function Event(props) {
    _classCallCheck(this, Event);

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

  _createClass(Event, [{
    key: "createSave",
    value: function createSave() {
      var save = {};
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
  }, {
    key: "loadSave",
    value: function loadSave(save) {
      this.reward = save.reward;
      this.time = save.time;
      this.floor = save.floor;
      this.date = save.date;
      if (save.bossKill !== undefined) this.bossKill = save.bossKill;
      if (save.itemReward !== undefined) this.itemReward = save.itemReward;
      if (save.beats !== undefined) this.beats = save.beats;
    }
  }]);

  return Event;
}();

;
var $eventList = $("#eventList");
var $eventContent = $("#eventContent");
var $eventTab = $("#eventTab");

function refreshEvents() {
  //$eventContent.empty();
  if (EventManager.hasEvents()) $eventTab.addClass("hasEvent");else $eventTab.removeClass("hasEvent");
  $eventList.empty();
  var events = EventManager.events;
  if (EventManager.seeOld) events = EventManager.oldEvents;
  events.forEach(function (event) {
    var d1 = $("<div/>").addClass("eventList").attr("eventNum", event.eventNum).html("".concat(event.image, " ").concat(event.title));
    $eventList.append(d1);
  });

  if (events.length == 0) {
    var d1 = $("<div/>").addClass("events-placeholder-details").html("You have no mail to read at the moment.");
    $eventList.append(d1);
  }
}

function dungeonDrops(event) {
  //returns a bunch of divs for the rewards
  var d = $("<div/>").addClass("rewardDiv");
  var d1 = $("<div/>").addClass("rewardDivTitle").html("Rewards");
  d.append(d1);
  if (event.reward === undefined) return d;
  event.reward.forEach(function (reward) {
    var d2 = $("<div/>").addClass("rewardCard tooltip").attr({
      "data-tooltip": "material_desc",
      "data-tooltip-value": reward.id
    });
    var d3 = $("<div/>").addClass("rewardImage").html(ResourceManager.idToMaterial(reward.id).img);
    var d4 = $("<div/>").addClass("rewardAmt").html(reward.amt);
    d.append(d2.append(d3, d4));
  });
  return d;
}

function bossRecipeUnlocks(recipes) {
  var d = $("<div/>").addClass("rewardDiv");
  var d1 = $("<div/>").addClass("rewardDivTitle").html("Rewards");
  d.append(d1);
  recipes.forEach(function (recipe) {
    var d2 = $("<div/>").addClass("rewardCard tooltip").attr({
      "data-tooltip": "recipe_desc",
      "data-tooltip-value": recipe.name
    });
    var d3 = $("<div/>").addClass("rewardImage").html(recipe.itemPic());
    d.append(d2.append(d3));
  });
  return d;
}

$(document).on('click', "div.eventList", function (e) {
  //display the text for a clicked event
  e.preventDefault();
  $("div.eventList").removeClass("highlight");
  $(e.currentTarget).addClass("highlight");
  var eventNum = parseInt($(e.currentTarget).attr("eventNum"));
  var event = EventManager.eventNumToEvent(eventNum);
  $eventContent.empty();
  var d = $("<div/>").addClass("eventBody");
  var d1 = $("<div/>").addClass("eventAuthor").html("<span>Received from:</span> ".concat(event.author));
  var d1a = $("<div/>").addClass("eventAuthor").html("<span>Date:</span> ".concat(event.date));
  var d2 = $("<div/>").addClass("eventMessage").html(event.message);
  d.append(d1, d1a, d2);

  if (event.reward !== null) {
    var d4 = $("<div/>").addClass("eventReward").html(dungeonDrops(event));
    d.append(d4);
  }

  if (event.itemReward !== null) {
    var item = recipeList.idToItem(event.itemReward.id);
    var d5 = $("<div/>").addClass("iR" + event.itemReward.rarity).html(item.itemPicName());
    d.append(d5);
  }

  var d7 = $("<div/>").addClass("eventActionsContainer").appendTo(d);
  $("<div/>").addClass("eventConfirm eventActionButton").attr("eventID", eventNum).html("Accept").appendTo(d7);
  if (EventManager.seeOld) d7.hide();
  if (event.type === "dungeon") $("<div/>").attr("id", "eventCollectAll").addClass("eventActionButton").html("Collect All Dungeon Rewards").appendTo(d7);
  $eventContent.append(d);
});
$(document).on('click', "div.eventConfirm", function (e) {
  //gets rid of event, and adds to inventory if you need to
  e.preventDefault();
  var eventID = parseInt($(e.currentTarget).attr("eventID"));
  EventManager.readEvent(eventID);
});
$(document).on('click', "#eventCollectAll", function (e) {
  e.preventDefault();
  var eventIDs = EventManager.allDungeonEventIDs();
  eventIDs.forEach(function (eventID) {
    return EventManager.readEvent(eventID);
  });
});
$(document).on('click', "#readNew", function (e) {
  $(e.currentTarget).addClass("readActive");
  $("#readOld").removeClass("readActive");
  EventManager.seeOld = false;
  refreshEvents();
});
$(document).on('click', "#readOld", function (e) {
  $(e.currentTarget).addClass("readActive");
  $("#readNew").removeClass("readActive");
  EventManager.seeOld = true;
  refreshEvents();
});

function eventChecker() {
  if (!EventManager.hasSeen("E002") && !WorkerManager.workers.some(function (w) {
    return w.type === "standard" && !w.owned;
  })) EventManager.addEvent("E002");
  if (!EventManager.hasSeen("E003") && WorkerManager.workers.some(function (w) {
    return w.type === "advanced" && w.owned;
  })) EventManager.addEvent("E003");
  if (!EventManager.hasSeen("E005") && achievementStats.totalItemsCrafted >= 10000) EventManager.addEvent("E005");
  if (!EventManager.hasSeen("E006") && masteredItem) EventManager.addEvent("E006");
  if (!EventManager.hasSeen("E007") && Inventory.full()) EventManager.addEvent("E007");
  if (!EventManager.hasSeen("E009") && Shop.purchased.includes("AL4101")) EventManager.addEvent("E009");
  if (!EventManager.hasSeen("E010") && Shop.purchased.includes("AL4102")) EventManager.addEvent("E010");
  if (!EventManager.hasSeen("E011") && Shop.purchased.includes("AL4103")) EventManager.addEvent("E011");
  if (!EventManager.hasSeen("E012") && Shop.purchased.includes("AL4104")) EventManager.addEvent("E012");
  if (!EventManager.hasSeen("E017") && achievementStats.highestFloor() >= 50) EventManager.addEvent("E017");
  if (!EventManager.hasSeen("E019") && Shop.purchased.includes("AL4106")) EventManager.addEvent("E019");
  if (!EventManager.hasSeen("E020") && Shop.purchased.includes("AL4107")) EventManager.addEvent("E020");
  if (!EventManager.hasSeen("E021") && Shop.purchased.includes("AL41071")) EventManager.addEvent("E021");
  if (!EventManager.hasSeen("E022") && Shop.purchased.includes("AL41072")) EventManager.addEvent("E022");
}

var masteredItem = false;