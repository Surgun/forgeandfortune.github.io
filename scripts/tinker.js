"use strict";

const $tinkerMaterials = $("#tinkerMaterials");
const $tinkerSlots = $("#tinkerSlots");
const $tinkerCommands = $("#tinkerCommands");

class tinkerCommand {
    constructor(props) {
        Object.assign(this, props);
    }
}

let slotid = 0;

class tinkerSlot {
    constructor(id) {
        const command = TinkerManager.idToCommand(id);
        Object.assign(this,command);
        this.energy = 0;
        this.state = "run";
        this.slotid = slotid;
        slotid += 1;
    }
    addCount() {
        this.energy += 1;
        while (this.energy > this.energyReq) {
            this.action();
            this.energy -= this.energyReq;
        }
    }
    getSteamCost() {
        if (this.state !== "run") return 0;
        return this.steam;
    }
    action() {
        if (this.id === "T001") {
            const material = ResourceManager.getSteamMaterial();
            if (!material) {
                this.state = "error";
                return;
            }
            TinkerManager.addSteam(material.steam);
        }
        else if (this.id === "T002") {
            const item = Inventory.getCommon();
            if (!item) {
                this.state = "error";
                return;
            }
            ResourceManager.addMaterial(item.deconType,item.deconAmt);
        }
        else if (this.id === "T003") {
            const success = createTrinket("R90001");
            if (!success) {
                this.state = "error";
                return;
            }
        }
        else if (this.id === "T004") {
            const success = createTrinket("R90002");
            if (!success) {
                this.state = "error";
                return;
            }
        }
        else if (this.id === "T005") {
            const success = createTrinket("R90003");
            if (!success) {
                this.state = "error";
                return;
            }
        }
        this.state = "run";
    }
}

const TinkerManager = {
    commands : [],
    slots : [], //it is an instance of the action
    slotsMax : 1,
    steam : 0,
    steamMax : 0,
    time : 0,
    maxTime : 1000,
    createSave() {
        const save = {};
        save.slotsMax = this.slotsMax;
        save.steam = this.steam;
        save.slots = [];
        this.slots.forEach(slot => {
            save.slots.push(slot.createSave());
        });
        return save;
    },
    loadSave(save) {
        this.slotsMax = save.slotsMax;
        this.steam = save.steam;
        save.slots.forEach(slot => {
            this.slots.push(slot.loadSave());
        });
    },
    addTime(ms) {
        if (this.slots.length === 0) {
            this.time = 0;
            return;
        }
        this.time += ms;
        if (this.time < maxTime) return;
        while (this.time > maxTime) {
            if (this.steam < this.steamReq()) {
                return this.time = 0;
            }
            this.slots.forEach(slot => slot.addCount());
            this.time -= maxTime;
            this.steam -= this.steamReq();
        }
        refreshTinkerEnergy();
    },
    idToCommand(id) {
        return this.commands.find(a => a.id === id);
    },
    addCommand(action) {
        this.commands.push(action);
    },
    addSlot(id) {
        if (this.slots.length >= this.slotsMax) return;
        this.slots.push(new tinkerSlot(id));
    },
    removeSlot(slotnum) {
        this.slots.splice(slotnum,1);
    },
    addSteam(amt) {
        this.steam += amt;
    },
    steamReq() {
        return this.slots.reduce((acc,val) => {return acc + val.getSteamCost()});
    }
}

function initiateTinkerBldg () {
    $tinkerBuilding.show();
    refreshTinkerMats();
    refreshTinkerCommands();
    refreshTinkerSlots();
}

function refreshTinkerMats() {
    const mats = ["M700","M701","M702","M800","M801","M802","M803"];
    $tinkerMaterials.empty();
    mats.forEach(mat => {
        $("<div/>").addClass("tinkerMat").html(ResourceManager.sidebarMaterial(mat)).appendTo($tinkerMaterials);
    });
};

function refreshTinkerCommands() {
    $tinkerCommands.empty();
    TinkerManager.commands.forEach(command => {
        const d1 = $("<div/>").addClass("tinkerCommand").data("tinkerID",command.id).appendTo($tinkerCommands);
            $("<div/>").addClass("tinkerCommandName").html(command.name).appendTo(d1);
            $("<div/>").addClass("tinkerCommandDesc").html(command.desc).appendTo(d1);
            $("<div/>").addClass("tinkerCommandEnergy").html(`Energy required: ${command.energyReq}`).appendTo(d1);
    });
};

function refreshTinkerSlots() {
    $tinkerSlots.empty();
    TinkerManager.slots.forEach(slot => {
        const d1 = $("<div/>").addClass("tinkerSlot").appendTo($tinkerSlots);
            $("<div/>").addClass("tinkerSlotName").html(slot.name).appendTo(d1);
            $("<div/>").addClass("tinkerProgress").html(createTinkerProgress(slot.energy,slot.energyReq)).appendTo(d1);
    });
};

function createTinkerProgress(current,max) {
    const percent = current/max;
    const width = (percent*100).toFixed(1)+"%";
    const d1 = $("<div/>").addClass("tinkerProgressDiv").html(dungeonIcons["Energy"]);
    const d1a = $("<div/>").addClass("tinkerBar").attr("data-label",current+"/"+max);
    const s1 = $("<span/>").addClass("tinkerBarFill").css('width', width);
    return d1.append(d1a,s1);
}

const $tinkerTickBar = $("#tinkerTickBar");

function refreshTinkerEnergy() {
    $tinkerTickBar.empty();
    const percent = TinkerManager.time/TinkerManager.maxTime;
    const width = (percent*100).toFixed(1)+"%";
    const d1 = $("<div/>").addClass("tinkerTicksDiv").html("Energizing").appendTo($tinkerTickBar);
        $("<div/>").addClass("tinkerTicksBar").attr("data-label",current+"/"+max).appendTo(d1);
        $("<span/>").addClass("tinkerTicksBarFill").css('width', width).appendTo(d1);
}


//makes a trinket
function createTrinket(type) {
    const item = recipeList.idToItem(type);
    const mcost = Object.keys(item.mcost);
    const type1 = mcost[0];
    const amt1 = item.mcost[mcost[0]];
    const type2 = mcost[1];
    const amt2 = item.mcost[mcost[1]];
    if (!ResourceManager.available(type1,amt1)) return false;
    if (!ResourceManager.available(type2,amt2)) return false;
    if (Inventory.full()) return false;
    ResourceManager.addMaterial(type1,-amt1);
    ResourceManager.addMaterial(type2,-amt2);
    Inventory.addToInventory(item,0,-1);
    return true;
}

$(document).on('click', '.tinkerCommand', (e) => {
    e.preventDefault();
    const commandID = parseInt($(e.currentTarget).data("tinkerID"));
    TinkerManager.addSlot(commandID);
    refreshTinkerSlots();
});