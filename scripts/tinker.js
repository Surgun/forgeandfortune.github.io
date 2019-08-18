"use strict";

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
        save.reward = this.reward;
        save.acted = this.acted;
        save.min = this.min;
        save.act = this.act;
        return save;
    }
    loadSave(save) {
        this.time = save.time;
        this.state = save.state;
        this.enabled = save.enabled;
        this.reward = save.reward;
        this.acted = save.acted;
        this.min = save.min;
    }
    addTime(ms) {
        if (!this.enabled) return;
        if (this.state === "idle" || this.state === "need material") this.attemptStart();
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
        if (this.id === "T001") {
            const deconstruct = Inventory.getCommon();
            if (!deconstruct.id) return this.state = "need material";
            this.reward = deconstruct;
            this.state = "running";
        }
        else {
            if (!ResourceManager.available(this.mcost1,this.mcost1amt)) return this.state = "need material"; 
            if (!ResourceManager.available(this.mcost2,this.mcost2amt)) return this.state = "need material";
            ResourceManager.addMaterial(this.mcost1,-this.mcost1amt);
            ResourceManager.addMaterial(this.mcost2,-this.mcost2amt);
            this.state = "running";
        }
    }
    act() {
        if (this.id === "T001") {
            ResourceManager.addMaterial(this.reward.id,this.reward.amt);
            this.reward = null;
            this.time = 0;
            this.state = "idle";
            this.increaseAct();
            return;
        }
        if (Inventory.full()) return;
        TinkerManager.newTrinket(this.creates,this.min);
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
}

const TinkerManager = {
    commands : [],
    lvl : 1,
    rngSeed : Math.random(),
    createSave() {
        const save = {};
        save.lvl = this.lvl;
        save.rngSeed = this.rngSeed;
        save.commands = [];
        this.commands.forEach(c => save.commands.push(c.createSave()));
        return save;
    },
    loadSave(save) {
        save.forEach(c => {
            const command = this.idToCommand(c.id);
            command.loadSave(c);
        });
        this.lvl = save.lvl;
        this.rngSeed = save.rngSeed;
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
    newTrinket(trinketID,min) {
        const item = new itemContainer(trinketID,0);
        item.scale = Math.floor(normalDistribution(min,this.max(),0.5));
        Inventory.addItemContainerToInventory(item);
    },
    toggle(commandID) {
        const command = this.idToCommand(commandID);
        command.toggle();
    },
    max() {
        return 50;
    },
}

function initiateTinkerBldg () {
    $tinkerBuilding.show();
    refreshTinkerMats();
    refreshTinkerCommands();
}

function refreshTinkerMats() {
    const mats = ["M700","M701","M702","M800","M801","M802"];
    $tinkerMaterials.empty();
    mats.forEach(mat => {
        $("<div/>").addClass("tinkerMat").html(ResourceManager.sidebarMaterial(mat)).appendTo($tinkerMaterials);
    });
};  

function refreshTinkerCommands() {
    $tinkerCommands.empty();
    TinkerManager.commands.forEach(command => {
        const d1 = $("<div/>").addClass("tinkerCommand").data("tinkerID",command.id).appendTo($tinkerCommands);
            const toggle = $("<div/>").addClass("toggleStatus");
                $("<div/>").addClass("toggleCue").appendTo(toggle);
            const enable = $("<div/>").addClass("tinkerCommandEnable").append(toggle).appendTo(d1);
            if (!command.enabled) enable.removeClass("tinkerCommandEnable").addClass("tinkerCommandDisable");
            $("<div/>").addClass("tinkerCommandName").html(command.name).appendTo(d1);
            $("<div/>").addClass("tinkerCommandDesc").html(command.description).appendTo(d1);
            $("<div/>").addClass("tinkerCommandStatus").html(command.status).appendTo(d1);
            if (command.id !== "T001") $("<div/>").addClass("tinkerCommandRange").html(`${miscIcons.star} ${command.min}-${TinkerManager.max()}`).appendTo(d1);
            createTinkerProgress(command).appendTo(d1);
    });
};

function refreshTinkerSlotProgress() {
    TinkerManager.commands.forEach(command => {
        const percent = command.time/command.maxTime;
        const width = (percent*100).toFixed(1)+"%";
        const datalabel = command.enabled ? msToTime(command.maxTime-command.time) : "";
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

//enable or disable
$(document).on('click', '.tinkerCommand', (e) => {
    e.preventDefault();
    const commandID =$(e.currentTarget).data("tinkerID");
    TinkerManager.toggle(commandID);
    refreshTinkerCommands();
});