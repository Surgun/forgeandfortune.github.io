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
        this.command = TinkerManager.idToCommand(id);
        Object.assign(this,this.command);
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
            const steam = ResourceManager.getSteamMaterial();
            if (!steam) {
                this.state = "error";
                return;
            }
            TinkerManager.addSteam(steam);
        }
        else if (this.id === "T002") {
            console.log("fire");
            const item = Inventory.getCommon();
            console.log(item);
            if (!item) {
                this.state = "error";
                return;
            }
            ResourceManager.addMaterial(item.deconType(),item.deconAmt());
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
    status : "running",
    time : 0,
    maxTime : 5000,
    createSave() {
        const save = {};
        save.slotsMax = this.slotsMax;
        save.steam = this.steam;
        save.status = this.status;
        save.slots = [];
        this.slots.forEach(slot => {
            save.slots.push(slot.createSave());
        });
        return save;
    },
    loadSave(save) {
        this.slotsMax = save.slotsMax;
        this.steam = save.steam;
        this.status = save.status;
        save.slots.forEach(slotSave => {
            const newSlot = new tinkerSlot(slotSave.id);
            newSlot.loadSave(slotSave);
            this.slots.push(newSlot);
        });
    },
    addTime(ms) {
        if (this.slots.length === 0) {
            this.time = 0;
            this.status = "idle";
            refreshTinkerEnergy();
            return;
        }
        this.time += ms;
        this.status = "running";
        if (this.time < this.maxTime) {
            refreshTinkerEnergy();
            return;
        }
        while (this.time > this.maxTime) {
            if (this.notEnoughSteam()) {
                this.time = this.maxTime;
                this.status = "no steam";
                refreshTinkerEnergy();
                return;
            }
            this.slots.forEach(slot => slot.addCount());
            this.time -= this.maxTime;
            this.steam -= this.steamReq();
            refreshTinkerMats();
        }
        refreshTinkerEnergy();
        refreshTinkerSlotProgress();
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
    removeSlot(slotid) {
        this.slots = this.slots.filter(s=>s.slotid !== slotid);
    },
    addSteam(amt) {
        this.steam += amt;
        refreshTinkerMats();
    },
    steamReq() {
        const steamReq = this.slots.map(s=>s.getSteamCost());
        return steamReq.reduce((a,b) => a + b, 0)
    },
    idle() {
        return this.slots.length === 0;
    },
    notEnoughSteam() {
        return this.steamReq() > this.steam;
    }
}

function initiateTinkerBldg () {
    $tinkerBuilding.show();
    refreshTinkerMats();
    refreshTinkerCommands();
    initializeTinkerSlots();
    refreshTinkerEnergy();
}

function refreshTinkerMats() {
    const mats = ["M700","M701","M702","M800","M801","M802"];
    $tinkerMaterials.empty();
    mats.forEach(mat => {
        $("<div/>").addClass("tinkerMat").html(ResourceManager.sidebarMaterial(mat)).appendTo($tinkerMaterials);
    });
    $("<div/>").addClass("tinkerMat").html(`${dungeonIcons["Energy"]} ${TinkerManager.steam}`).appendTo($tinkerMaterials);
};

function refreshTinkerCommands() {
    $tinkerCommands.empty();
    TinkerManager.commands.forEach(command => {
        const d1 = $("<div/>").addClass("tinkerCommand").data("tinkerID",command.id).appendTo($tinkerCommands);
            $("<div/>").addClass("tinkerCommandName").html(command.name).appendTo(d1);
            $("<div/>").addClass("tinkerCommandDesc").html(command.desc).appendTo(d1);
            $("<div/>").addClass("tinkerCommandEnergy").html(`Requires ${command.steam} ${dungeonIcons.Energy}`).appendTo(d1);
    });
};

function initializeTinkerSlots() {
    $tinkerSlots.empty();
    TinkerManager.tinkerSlotCache = {};
    TinkerManager.slots.forEach(slot => {
        const d1 = $("<div/>").addClass("tinkerSlot").appendTo($tinkerSlots);
            $("<div/>").addClass("tinkerSlotName").html(slot.name).appendTo(d1);
            $("<div/>").addClass("tinkerProgress").html(createTinkerProgress(slot.slotid,slot.energy,slot.energyReq)).appendTo(d1);
            $('<div/>').addClass("tinkerSlotRemove").data("slotID",slot.slotid).html(`<i class="fas fa-times"></i>`).appendTo(d1);
    });
};

function refreshTinkerSlotProgress() {
    TinkerManager.slots.forEach(slot => {
        const percent = slot.energy/slot.energyReq;
        const width = (percent*100).toFixed(1)+"%";
        $("#tinkerBar"+slot.slotid).attr("data-label",width);
        $("#tinkerFill"+slot.slotid).css('width', width);
    })
};

function createTinkerProgress(slotid,current,max) {
    const percent = current/max;
    const width = (percent*100).toFixed(1)+"%";
    const d1 = $("<div/>").addClass("tinkerProgressDiv");
    const d1a = $("<div/>").addClass("tinkerBar").attr("id","tinkerBar"+slotid).attr("data-label",width);
    const s1 = $("<span/>").addClass("tinkerBarFill").attr("id","tinkerFill"+slotid).css('width', width);
    return d1.append(d1a,s1);
}

const $tinkerTicksBar = $("#tinkerTicksBar");
const $tinkerTicksBarFill = $("#tinkerTicksBarFill");

function refreshTinkerEnergy() {
    if (TinkerManager.status === "idle") {
        $tinkerTicksBar.attr("data-label","Idle").html("Idle");
        $tinkerTicksBarFill.css("width","0%");
        return;
    }
    if (TinkerManager.status === "no steam") {
        $tinkerTicksBar.attr("data-label","Need Steam").html("Need Steam");
        $tinkerTicksBarFill.css("width","100%");
        return;
    }
    const percent = TinkerManager.time/TinkerManager.maxTime;
    const width = (percent*100).toFixed(1)+"%";
    $tinkerTicksBar.attr("data-label",width).html(`${dungeonIcons.Energy} ${TinkerManager.steamReq()} / tick`);
    $tinkerTicksBarFill.css("width",width);
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
    Inventory.addToInventory(type,0,-1);
    return true;
}

$(document).on('click', '.tinkerCommand', (e) => {
    e.preventDefault();
    const commandID =$(e.currentTarget).data("tinkerID");
    TinkerManager.addSlot(commandID);
    initializeTinkerSlots();
    refreshTinkerEnergy();
});

$(document).on('click', '.tinkerSlotRemove', (e) => {
    e.preventDefault();
    const slotID = parseInt($(e.currentTarget).data("slotID"));
    TinkerManager.removeSlot(slotID);
    initializeTinkerSlots();
    refreshTinkerEnergy();
})