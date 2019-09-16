"use strict";

const $tinkerBuilding = $("#tinkerBuilding");
const $tinkerMaterials = $("#tinkerMaterials");
const $tinkerSlots = $("#tinkerSlots");
const $tinkerCommands = $("#tinkerCommands");

class tinkerCommand {
    constructor(props) {
        Object.assign(this, props);
        this.time = 0;
        this.acted = 0;
        this.min = 1;
        this.state = "idle";
        this.enabled = false;
        this.reward = null;
    }
    createSave() {
        const save = {};
        save.id = this.id;
        save.time = this.time;
        save.state = this.state;
        save.enabled = this.enabled;
        if (this.reward !== null) save.reward = this.reward.createSave();
        else save.reward = null;
        save.acted = this.acted;
        save.min = this.min;
        save.act = this.act;
        return save;
    }
    loadSave(save) {
        this.time = save.time;
        this.state = save.state;
        this.enabled = save.enabled;
        if (save.reward !== null) {
            this.reward = new idAmt(save.reward.id,save.reward.amt);
            this.reward.loadSave(save.reward);
        }
        this.acted = save.acted;
        this.min = save.min;
    }
    addTime(ms) {
        if (!this.enabled) return;
        if (this.state === "idle" || this.state === "Need Material") this.attemptStart();
        if (this.state === "Inventory Full" && !Inventory.full()) this.state = "running";
        if (this.state === "running") {
            this.time += ms;
            if (this.time >= this.maxTime) {
                this.time = this.maxTime
                this.act();
            }
        }
    }
    toggle() {
        this.enabled = !this.enabled;
    }
    attemptStart() {
        if (this.state === "running") return;
        if (this.id === "T001")  return;
        if (!ResourceManager.available(this.mcost1,this.mcost1amt)) return this.state = "Need Material"; 
        if (!ResourceManager.available(this.mcost2,this.mcost2amt)) return this.state = "Need Material";
        ResourceManager.addMaterial(this.mcost1,-this.mcost1amt);
        ResourceManager.addMaterial(this.mcost2,-this.mcost2amt);
        this.state = "running";
    }
    act() {
        if (this.id === "T001") {
            if (this.reward.id !== null) ResourceManager.addMaterial(this.reward.id,this.reward.amt);
            this.reward = null;
            this.time = 0;
            this.state = "idle";
            this.increaseAct();
            return;
        }
        if (Inventory.full()) return this.state = "Inventory Full";
        TinkerManager.newTrinket(this.id,this.creates,this.min);
        this.time = 0;
        this.state = "idle";
        this.increaseAct();
    }
    increaseAct() {
        if (this.min === TinkerManager.max()) return;
        this.acted += 1;
        if (this.acted >= 5) {
            this.acted = 0;
            this.min += 1;
            this.min = Math.min(this.min,TinkerManager.max());
            refreshTinkerCommands();
        }
    }
    feedCommon(container) {
        if (this.id !== "T001" || this.state === "running" || container.type === "Trinkets") return false;
        this.reward = new idAmt("M802",container.deconAmt());
        this.state = "running";
        return true;
    }
}

const TinkerManager = {
    commands : [],
    lvl : 1,
    dT002 : 0,
    dT003 : 0,
    dT004 : 0,
    createSave() {
        const save = {};
        save.lvl = this.lvl;
        save.commands = [];
        save.dT002 = this.dT002;
        save.dT003 = this.dT003;
        save.dT004 = this.dT004;
        this.commands.forEach(c => save.commands.push(c.createSave()));
        return save;
    },
    loadSave(save) {
        save.commands.forEach(c => {
            const command = this.idToCommand(c.id);
            command.loadSave(c);
        });
        this.lvl = save.lvl;
        if (save.dT002 !== undefined) this.dT002 = save.dT002;
        if (save.dT003 !== undefined) this.dT003 = save.dT003;
        if (save.dT004 !== undefined) this.dT004 = save.dT004;
    },
    addTime(ms) {
        this.commands.forEach(command => command.addTime(ms));
        refreshTinkerSlotProgress();
    },
    idToCommand(id) {
        return this.commands.find(a => a.id === id);
    },
    addCommand(action) {
        this.commands.push(action);                                                             
    },
    newTrinket(commandID,trinketID,min) {
        const scale = Math.floor(normalDistribution(min,this.max(),3));
        if (scale < this["d"+commandID]) return;
        const item = new itemContainer(trinketID,0);
        item.scale = scale;
        Inventory.addToInventory(item);
    },
    toggle(commandID) {
        const command = this.idToCommand(commandID);
        command.toggle();
    },
    max() {
        return 40+this.lvl*10;
    },
    addLevel() {
        this.lvl += 1;
        refreshTinkerCommands();
    },
    feedCommon(container) {
        if (container.rarity !== 0) return false;
        return this.idToCommand("T001").feedCommon(container);
    }
}

function initiateTinkerBldg () {
    $tinkerBuilding.show();
    refreshTinkerMats();
    refreshTinkerCommands();
}

function refreshTinkerMats() {
    const mats = ["M700","M701","M702","M802"];
    $tinkerMaterials.empty();
    mats.forEach(mat => {
        $("<div/>").addClass("tinkerMat tooltip").attr("data-tooltip",ResourceManager.idToMaterial(mat).name).html(ResourceManager.sidebarMaterial(mat)).appendTo($tinkerMaterials);
    });
};  

function refreshTinkerCommands() {
    $tinkerCommands.empty();
    TinkerManager.commands.forEach(command => {
        const d1 = $("<div/>").addClass("tinkerCommand").data("tinkerID",command.id).appendTo($tinkerCommands);
            const toggle = $("<div/>").addClass("toggleStatus");
                $("<div/>").addClass("toggleCue").appendTo(toggle);
            const enable = $("<div/>").attr("id","enable"+command.id).addClass("tinkerCommandEnable").append(toggle).appendTo(d1);
            if (!command.enabled) enable.removeClass("tinkerCommandEnable").addClass("tinkerCommandDisable");
            $("<div/>").addClass("tinkerCommandName").html(command.name).appendTo(d1);
            $("<div/>").addClass("tinkerCommandHeader").html("Command Start Cost").appendTo(d1);
            const d2 = $("<div/>").addClass("trinketCommandCost").html("Any sold common item").appendTo(d1);
            if (command.id !== "T001") {
                d2.html(createTinkerMaterialDiv(command.mcost1,command.mcost1amt));
                d2.append(createTinkerMaterialDiv(command.mcost2,command.mcost2amt));
            }
            $("<div/>").addClass("tinkerCommandHeader").html("Command Finish Reward").appendTo(d1);
            const d3 = $("<div/>").addClass("trinketCommandReward").appendTo(d1);
                $("<div/>").addClass("commandRewardContent").html(`Earn ${ResourceManager.idToMaterial("M802").img} instead of Gold for sale.`).appendTo(d3);
            if (command.id !== "T001") {
                d3.html(createTinkerStatDiv(command.stat));
                $("<div/>").addClass("commandRewardTrinket").html(`Trinket`).appendTo(d3);
            }
            $("<div/>").addClass("tinkerCommandStatus").html(command.status).appendTo(d1);
            if (command.id !== "T001") $("<div/>").addClass("tinkerCommandRange").html(`${miscIcons.star} ${command.min}-${TinkerManager.max()}`).appendTo(d1);
            createTinkerProgress(command).appendTo(d1);
    });
};

function createTinkerMaterialDiv(id,amt) {
    const res = ResourceManager.idToMaterial(id);
    return $("<div/>").addClass("indvCost tooltip").attr("data-tooltip",res.name).html(`${res.img}&nbsp;&nbsp;${amt}`);
}

function createTinkerStatDiv(stat) {
    const d = $("<div/>").addClass("tinkerCommandStat");
        $("<span/>").addClass("tinkerCommandStatIcon").html(miscIcons[stat]).appendTo(d);
        $("<span/>").addClass("tinkerCommandStatName").html(stat).appendTo(d);
    return d;
}

function refreshTinkerSlotProgress() {
    TinkerManager.commands.forEach(command => {
        const percent = command.time/command.maxTime;
        const width = (percent*100).toFixed(1)+"%";
        let datalabel = "disabled";
        if (command.enabled && command.state !== "running") datalabel = command.state;
        else if (command.enabled) datalabel = msToTime(command.maxTime-command.time);
        $("#tinkerBar"+command.id).attr("data-label",datalabel);
        $("#tinkerFill"+command.id).css('width', width);
    })
};

function createTinkerProgress(command) {
    const percent = command.time/command.maxTime;
    const width = (percent*100).toFixed(1)+"%";
    const d1 = $("<div/>").addClass("tinkerProgressDiv");
    const datalabel = command.enabled ? msToTime(command.maxTime-command.time) : "";
    const d1a = $("<div/>").addClass("tinkerBar").attr("id","tinkerBar"+command.id).attr("data-label",datalabel);
    const s1 = $("<span/>").addClass("tinkerBarFill").attr("id","tinkerFill"+command.id).css('width', width);
    return d1.append(d1a,s1);
}

const $tinkerRangeContainer = $("#tinkerRangeContainer");

function populateTinkerRange() {
    TinkerManager.commands.forEach(command => {
        if (command.id === "T001") return;
        const d = $("<div/>").addClass("tinkerRangeBox").appendTo($tinkerRangeContainer);
            const tinkerRangeDesc = $("<div/>").addClass("tinkerRangeDesc").attr("id","rangeLabel"+command.id).appendTo(d);
            const commandName = $("<div/>").addClass("commandName").html(`${command.name}`);
            const commandStatus = $("<div/>").addClass("commandStatus");
                if ((TinkerManager["d"+command.id] === 0)) $(commandStatus).addClass("commandDisabled").html(`Disabled`);
                else $(commandStatus).html(`${TinkerManager["d"+command.id]}${miscIcons.star}`);
                tinkerRangeDesc.append(commandName,commandStatus);
            $("<input type='range'/>").addClass("tinkerRange").attr({"id":"range"+command.id,"max":100,"min":0,"step":1,"value":TinkerManager["d"+command.id],}).data("tinkerID",command.id).appendTo(d);
    })
}

$(document).on('input', '.tinkerRange', (e) => {
    const tinkerID = $(e.currentTarget).data("tinkerID");
    const value = parseInt($(e.currentTarget).val());
    TinkerManager["d"+tinkerID] = value;
    const commandName = $("<div/>").addClass("commandName").html(`${TinkerManager.idToCommand(tinkerID).name}`);
    const commandStatus = $("<div/>").addClass("commandStatus commandDisabled").html(`Disabled`);
    if (value === 0) $("#rangeLabel"+tinkerID).empty().append(commandName,commandStatus);
    else {
        $(commandStatus).removeClass("commandDisabled").html(`${$(e.currentTarget).val()}${miscIcons.star}`);
        $("#rangeLabel"+tinkerID).empty().append(commandName,commandStatus);
    }
});

//enable or disable
$(document).on('click', '.tinkerCommand', (e) => {
    e.preventDefault();
    const commandID =$(e.currentTarget).data("tinkerID");
    TinkerManager.toggle(commandID);
    const command = TinkerManager.idToCommand(commandID);
    if (command.enabled) $("#enable"+commandID).addClass("tinkerCommandEnable").removeClass("tinkerCommandDisable");
    else $("#enable"+commandID).removeClass("tinkerCommandEnable").addClass("tinkerCommandDisable");
});

class idAmt {
    constructor(id,amt) {
        this.id = id;
        this.amt = amt;
    }
    createSave() {
        const save = {};
        save.id = this.id;
        save.amt = this.amt;
        return save;
    }
    loadSave(save) {
        return;
    }
}