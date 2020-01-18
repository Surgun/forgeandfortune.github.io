"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var $tinkerBuilding = $("#tinkerBuilding");
var $tinkerMaterials = $("#tinkerMaterials");
var $tinkerSlots = $("#tinkerSlots");
var $tinkerCommands = $("#tinkerCommands");

var tinkerCommand =
/*#__PURE__*/
function () {
  function tinkerCommand(props) {
    _classCallCheck(this, tinkerCommand);

    Object.assign(this, props);
    this.time = 0;
    this.acted = 0;
    this.min = 1;
    this.state = "idle";
    this.enabled = false;
    this.reward = null;
  }

  _createClass(tinkerCommand, [{
    key: "createSave",
    value: function createSave() {
      var save = {};
      save.id = this.id;
      save.time = this.time;
      save.state = this.state;
      save.enabled = this.enabled;
      if (this.reward !== null) save.reward = this.reward.createSave();else save.reward = null;
      save.acted = this.acted;
      save.min = this.min;
      save.act = this.act;
      return save;
    }
  }, {
    key: "loadSave",
    value: function loadSave(save) {
      this.time = save.time;
      this.state = save.state;
      this.enabled = save.enabled;

      if (save.reward !== null) {
        this.reward = new idAmt(save.reward.id, save.reward.amt);
        this.reward.loadSave(save.reward);
      }

      this.acted = save.acted;
      this.min = save.min;
    }
  }, {
    key: "addTime",
    value: function addTime(ms) {
      if (!this.enabled) return;
      if (this.state === "idle" || this.state === "Need Material") this.attemptStart();
      if (this.state === "Inventory Full" && !Inventory.full()) this.state = "running";

      if (this.state === "running") {
        this.time += ms;

        if (this.time >= this.maxTime) {
          this.time = this.maxTime;
          this.act();
        }
      }
    }
  }, {
    key: "toggle",
    value: function toggle() {
      this.enabled = !this.enabled;
    }
  }, {
    key: "attemptStart",
    value: function attemptStart() {
      if (this.state === "running") return;
      if (this.id === "T001") return;
      if (!ResourceManager.available(this.mcost1, this.mcost1amt)) return this.state = "Need Material";
      if (!ResourceManager.available(this.mcost2, this.mcost2amt)) return this.state = "Need Material";
      ResourceManager.addMaterial(this.mcost1, -this.mcost1amt);
      ResourceManager.addMaterial(this.mcost2, -this.mcost2amt);
      this.state = "running";
    }
  }, {
    key: "act",
    value: function act() {
      if (this.id === "T001") {
        if (this.reward.id !== null) ResourceManager.addMaterial(this.reward.id, this.reward.amt);
        this.reward = null;
        this.time = 0;
        this.state = "idle";
        this.increaseAct();
        return;
      }

      if (Inventory.full()) return this.state = "Inventory Full";
      TinkerManager.newTrinket(this.id, this.creates, this.min);
      this.time = 0;
      this.state = "idle";
      this.increaseAct();
    }
  }, {
    key: "increaseAct",
    value: function increaseAct() {
      if (this.min === TinkerManager.max()) return;
      this.acted += 1;

      if (this.acted >= 5) {
        this.acted = 0;
        this.min += 1;
        this.min = Math.min(this.min, TinkerManager.max());
        refreshTinkerCommands();
      }
    }
  }, {
    key: "feedCommon",
    value: function feedCommon(container) {
      if (this.id !== "T001" || this.state === "running" || container.type === "Trinkets") return false;
      this.reward = new idAmt("M802", container.deconAmt());
      this.state = "running";
      return true;
    }
  }]);

  return tinkerCommand;
}();

var TinkerManager = {
  commands: [],
  lvl: 1,
  dT002: 0,
  dT003: 0,
  dT004: 0,
  createSave: function createSave() {
    var save = {};
    save.lvl = this.lvl;
    save.commands = [];
    save.dT002 = this.dT002;
    save.dT003 = this.dT003;
    save.dT004 = this.dT004;
    this.commands.forEach(function (c) {
      return save.commands.push(c.createSave());
    });
    return save;
  },
  loadSave: function loadSave(save) {
    var _this = this;

    save.commands.forEach(function (c) {
      var command = _this.idToCommand(c.id);

      command.loadSave(c);
    });
    this.lvl = save.lvl;
    if (save.dT002 !== undefined) this.dT002 = save.dT002;
    if (save.dT003 !== undefined) this.dT003 = save.dT003;
    if (save.dT004 !== undefined) this.dT004 = save.dT004;
  },
  addTime: function addTime(ms) {
    this.commands.forEach(function (command) {
      return command.addTime(ms);
    });
    refreshTinkerSlotProgress();
  },
  idToCommand: function idToCommand(id) {
    return this.commands.find(function (a) {
      return a.id === id;
    });
  },
  addCommand: function addCommand(action) {
    this.commands.push(action);
  },
  newTrinket: function newTrinket(commandID, trinketID, min) {
    var scale = Math.floor(normalDistribution(min, this.max(), 3));
    if (scale < this["d" + commandID]) return;
    var item = new itemContainer(trinketID, 0);
    item.scale = scale;
    Inventory.addToInventory(item);
  },
  toggle: function toggle(commandID) {
    var command = this.idToCommand(commandID);
    command.toggle();
  },
  max: function max() {
    return 40 + this.lvl * 10;
  },
  addLevel: function addLevel() {
    this.lvl += 1;
    refreshTinkerCommands();
  },
  feedCommon: function feedCommon(container) {
    if (container.rarity !== 0) return false;
    return this.idToCommand("T001").feedCommon(container);
  },
  tinkerMats: function tinkerMats() {
    return ["M700", "M701", "M702", "M802"];
  }
};

function initiateTinkerBldg() {
  $tinkerBuilding.show();
  refreshTinkerMats();
  refreshTinkerCommands();
}

function refreshTinkerMats() {
  $tinkerMaterials.empty();
  TinkerManager.tinkerMats().forEach(function (mat) {
    $("<div/>").addClass("tinkerMat tooltip").attr({
      "data-tooltip": "material_desc",
      "data-tooltip-value": mat
    }).html(ResourceManager.sidebarMaterial(mat)).appendTo($tinkerMaterials);
  });
}

;

function refreshTinkerCommands() {
  $tinkerCommands.empty();
  TinkerManager.commands.forEach(function (command) {
    var d1 = $("<div/>").addClass("tinkerCommand").data("tinkerID", command.id).appendTo($tinkerCommands);
    var toggle = $("<div/>").addClass("toggleStatus");
    $("<div/>").addClass("toggleCue").appendTo(toggle);
    var enable = $("<div/>").attr("id", "enable" + command.id).addClass("tinkerCommandEnable").append(toggle).appendTo(d1);
    if (!command.enabled) enable.removeClass("tinkerCommandEnable").addClass("tinkerCommandDisable");
    $("<div/>").addClass("tinkerCommandName").html(command.name).appendTo(d1);
    $("<div/>").addClass("tinkerCommandHeader").html("Command Start Cost").appendTo(d1);
    var d2 = $("<div/>").addClass("trinketCommandCost").html("Any sold common item").appendTo(d1);

    if (command.id !== "T001") {
      d2.html(createTinkerMaterialDiv(command.mcost1, command.mcost1amt));
      d2.append(createTinkerMaterialDiv(command.mcost2, command.mcost2amt));
    }

    $("<div/>").addClass("tinkerCommandHeader").html("Command Finish Reward").appendTo(d1);
    var d3 = $("<div/>").addClass("trinketCommandReward").appendTo(d1);
    $("<div/>").addClass("commandRewardContent").html("Earn ".concat(ResourceManager.idToMaterial("M802").img, " instead of Gold for sale.")).appendTo(d3);

    if (command.id !== "T001") {
      d3.html(createTinkerStatDiv(command.stat));
      $("<div/>").addClass("commandRewardTrinket").html("Trinket").appendTo(d3);
    }

    $("<div/>").addClass("tinkerCommandStatus").html(command.status).appendTo(d1);
    if (command.id !== "T001") $("<div/>").addClass("tinkerCommandRange").html("".concat(miscIcons.star, " ").concat(command.min, "-").concat(TinkerManager.max())).appendTo(d1);
    createTinkerProgress(command).appendTo(d1);
  });
}

;

function createTinkerMaterialDiv(id, amt) {
  var res = ResourceManager.idToMaterial(id);
  return $("<div/>").addClass("indvCost tooltip").attr({
    "data-tooltip": "material_desc",
    "data-tooltip-value": res.id
  }).html("".concat(res.img, "&nbsp;&nbsp;").concat(amt));
}

function createTinkerStatDiv(stat) {
  var d = $("<div/>").addClass("tinkerCommandStat");
  $("<span/>").addClass("tinkerCommandStatIcon").html(miscIcons[stat]).appendTo(d);
  $("<span/>").addClass("tinkerCommandStatName").html(stat).appendTo(d);
  return d;
}

function refreshTinkerSlotProgress() {
  TinkerManager.commands.forEach(function (command) {
    var percent = command.time / command.maxTime;
    var width = (percent * 100).toFixed(1) + "%";
    var datalabel = "disabled";
    if (command.enabled && command.state !== "running") datalabel = command.state;else if (command.enabled) datalabel = msToTime(command.maxTime - command.time);
    $("#tinkerBar" + command.id).attr("data-label", datalabel);
    $("#tinkerFill" + command.id).css('width', width);
  });
}

;

function createTinkerProgress(command) {
  var percent = command.time / command.maxTime;
  var width = (percent * 100).toFixed(1) + "%";
  var d1 = $("<div/>").addClass("tinkerProgressDiv");
  var datalabel = command.enabled ? msToTime(command.maxTime - command.time) : "";
  var d1a = $("<div/>").addClass("tinkerBar").attr("id", "tinkerBar" + command.id).attr("data-label", datalabel);
  var s1 = $("<span/>").addClass("tinkerBarFill").attr("id", "tinkerFill" + command.id).css('width', width);
  return d1.append(d1a, s1);
}

var $tinkerRangeContainer = $("#tinkerRangeContainer");

function populateTinkerRange() {
  TinkerManager.commands.forEach(function (command) {
    if (command.id === "T001") return;
    var d = $("<div/>").addClass("tinkerRangeBox").appendTo($tinkerRangeContainer);
    var tinkerRangeDesc = $("<div/>").addClass("tinkerRangeDesc").attr("id", "rangeLabel" + command.id).appendTo(d);
    var commandName = $("<div/>").addClass("commandName").html("".concat(command.name));
    var commandStatus = $("<div/>").addClass("commandStatus");
    if (TinkerManager["d" + command.id] === 0) $(commandStatus).addClass("commandDisabled").html("Disabled");else $(commandStatus).html("".concat(TinkerManager["d" + command.id]).concat(miscIcons.star));
    tinkerRangeDesc.append(commandName, commandStatus);
    $("<input type='range'/>").addClass("tinkerRange").attr({
      "id": "range" + command.id,
      "max": 100,
      "min": 0,
      "step": 1,
      "value": TinkerManager["d" + command.id]
    }).data("tinkerID", command.id).appendTo(d);
  });
}

$(document).on('input', '.tinkerRange', function (e) {
  var tinkerID = $(e.currentTarget).data("tinkerID");
  var value = parseInt($(e.currentTarget).val());
  TinkerManager["d" + tinkerID] = value;
  var commandName = $("<div/>").addClass("commandName").html("".concat(TinkerManager.idToCommand(tinkerID).name));
  var commandStatus = $("<div/>").addClass("commandStatus commandDisabled").html("Disabled");
  if (value === 0) $("#rangeLabel" + tinkerID).empty().append(commandName, commandStatus);else {
    $(commandStatus).removeClass("commandDisabled").html("".concat($(e.currentTarget).val()).concat(miscIcons.star));
    $("#rangeLabel" + tinkerID).empty().append(commandName, commandStatus);
  }
}); //enable or disable

$(document).on('click', '.tinkerCommand', function (e) {
  e.preventDefault();
  var commandID = $(e.currentTarget).data("tinkerID");
  TinkerManager.toggle(commandID);
  var command = TinkerManager.idToCommand(commandID);
  if (command.enabled) $("#enable" + commandID).addClass("tinkerCommandEnable").removeClass("tinkerCommandDisable");else $("#enable" + commandID).removeClass("tinkerCommandEnable").addClass("tinkerCommandDisable");
});
//# sourceMappingURL=tinker.js.map