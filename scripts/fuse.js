"use strict";

const $fuseBuilding = $("#fuseBuilding");

class fuse {
    constructor(uniqueID) {
        const props = uniqueIDProperties(uniqueID);
        Object.assign(this, props);
        this.recipe = recipeList.idToItem(this.id);
        this.fuseTime = 0;
        this.started = false;
    }
    createSave() {
        const save = {};
        save.fuseTime = this.fuseTime;
        save.started = this.started;
        save.uniqueID = this.uniqueID;
        return save;
    }
    loadSave(save) {
        if (save.fuseTime !== undefined) this.fuseTime = save.fuseTime;
        if (save.started !== undefined) this.started = save.started;
    }
    addTime(ms) {
        this.fuseTime = Math.min(this.fuseTime+ms,this.getMaxFuse());
    }
    getMaxFuse() {
        return this.recipe.craftTime*MonsterHall.lineIncrease(this.recipe.type,0)*this.rarity;
    }
    timeRemaining() {
        return this.getMaxFuse() - this.fuseTime;
    }
    fuseComplete() {
        if (this.notStarted()) return false;
        return this.fuseTime === this.getMaxFuse();
    }
    increaseRarity() {
        this.rarity += 1;
        this.uniqueID = this.id+"_"+this.rarity+"_"+this.sharp;
    }
    notStarted() {
        return !this.started;
    }
}

const FusionManager = {
    slots : [],
    lvl : 1,
    fuseNum : 0,
    createSave() {
        const save = {};
        save.lvl = this.lvl;
        save.slots = [];
        this.slots.forEach(slot => {
            save.slots.push(slot.createSave());
        });
        return save;
    },
    loadSave(save) {
        save.slots.forEach(s => {
            const slot = new fuse(s.uniqueID);
            slot.loadSave(s);
            slot.fuseID = this.fuseNum;
            this.fuseNum += 1;
            this.slots.push(slot);
        });
        if (save.lvl !== undefined) this.lvl = save.lvl;
    },
    addFuse(uniqueid) {
        if (!Inventory.hasThree(uniqueid)) return;
        if (this.slots.length === this.maxSlots()) {
            Notifications.noFuseSlots();
            return;
        }
        const fuseProps = uniqueIDProperties(uniqueid);
        if (ResourceManager.materialAvailable("M001") < this.getFuseCost(fuseProps)) {
            Notifications.cantAffordFuse();
            return;
        }
        ResourceManager.deductMoney(this.getFuseCost(fuseProps));
        Inventory.removeFromInventoryUID(uniqueid);
        Inventory.removeFromInventoryUID(uniqueid);
        Inventory.removeFromInventoryUID(uniqueid);
        const newFuse = new fuse(uniqueid);
        newFuse.fuseID = this.fuseNum;
        this.fuseNum += 1;
        this.slots.push(newFuse);
        refreshFuseSlots();
    },
    fuseByID(fuseID) {
        return this.slots.find(f => f.fuseID === fuseID);
    },
    startFuse(fuseid) {
        const fuse = this.fuseByID(fuseid);
        fuse.increaseRarity();    
        fuse.started = true;
        refreshFuseSlots();
    },
    cancelFuse(fuseid) {
        const fuse = this.fuseByID(fuseid);
        if (Inventory.full(3)) {
            Notifications.fuseInvFull();
            return;
        }
        ResourceManager.addMaterial("M001",this.getFuseCost(fuse));
        Inventory.addFuseToInventory(fuse);
        Inventory.addFuseToInventory(fuse);
        Inventory.addFuseToInventory(fuse);
        this.slots = this.slots.filter(f=>f.fuseID !== fuseid);
        refreshFuseSlots();
    },
    addTime(ms) {
        this.slots.forEach(fuse => {
            if (fuse.started) fuse.addTime(ms);
        });
        refreshFuseBars();
    },
    getFuseCost(fuse) {
        const item = recipeList.idToItem(fuse.id);
        return 4*item.value*fuse.rarity;
    },
    aFuseIsDone() {
        return this.slots.some(f=>f.fuseComplete());
    },
    collectFuse(fuseID) {
        const slot = this.slots.find(f=>f.fuseID === fuseID);
        if (slot === undefined || !slot.fuseComplete()) return;
        if (Inventory.full()) {
            Notifications.fuseInvFull();
            return;
        }
        Inventory.addFuseToInventory(slot);
        this.slots = this.slots.filter(f=>f.fuseID !== fuseID);
        refreshFuseSlots();
    },
    maxSlots() {
        return 1+this.lvl;
    },
    addLevel() {
        this.lvl += 1;
        refreshFuseSlots();
    },
    getMaxFuse(uniqueIDProperties) {
        //this takes a uniqueIDProperties return (which is only from the fusion creation screen) to give fuse time
        const recipe = recipeList.idToItem(uniqueIDProperties.id);
        return recipe.craftTime*MonsterHall.lineIncrease(recipe.type,0)*uniqueIDProperties.rarity;
    }
}

function initiateFusionBldg() {
    $fuseBuilding.show();
    refreshFuseSlots();
    refreshPossibleFuse();
}

function createFuseBar(fuse) {
    const fusePercent = fuse.fuseTime/fuse.getMaxFuse();
    const fuseAmt = msToTime(fuse.getMaxFuse()-fuse.fuseTime);
    const fuseWidth = (fusePercent*100).toFixed(1)+"%";
    const d1 = $("<div/>").addClass("fuseBarDiv").attr("id","fuseBarDiv"+fuse.fuseID);
    const d1a = $("<div/>").addClass("fuseBar").attr("data-label",fuseAmt).attr("id","fuseBar"+fuse.fuseID);
    const s1 = $("<span/>").addClass("fuseBarFill").attr("id","fuseFill"+fuse.fuseID).css('width', fuseWidth);
    return d1.append(d1a,s1);
}

function refreshFuseBars() {
    FusionManager.slots.forEach(fuse => {
        if (fuse.fuseComplete()) {
            $("#fuseBarDiv"+fuse.fuseID).hide();
            $("#fuseSlotCollect"+fuse.fuseID).show();
        }
        const fusePercent = fuse.fuseTime/fuse.getMaxFuse();
        const fuseAmt = msToTime(fuse.getMaxFuse()-fuse.fuseTime);
        const fuseWidth = (fusePercent*100).toFixed(1)+"%";
        $("#fuseBar"+fuse.fuseID).attr("data-label",fuseAmt);
        $("#fuseFill"+fuse.fuseID).css('width', fuseWidth);
    });
}

const $fuseSlots = $("#fuseSlots");
const $fuseList = $("#fuseList");

function refreshFuseSlots() {
    $fuseSlots.empty();
    FusionManager.slots.forEach(slot => {
        const d1 = $("<div/>").addClass("fuseSlot").addClass("R"+slot.rarity);
        const d2 = $("<div/>").addClass("fuseSlotName").html(slot.name);
        const d3 = createFuseBar(slot);
        const d4 = $("<div/>").addClass("fuseSlotCollect").attr("id","fuseSlotCollect"+slot.fuseID).attr("fuseid",slot.fuseID).html("Collect Fuse").hide();
        const d5 = $("<div/>").addClass("fuseSlotStart").attr("id","fuseSlotStart"+slot.fuseID).attr("fuseid",slot.fuseID).html("Start Fuse").hide();
        const d6 = $('<div/>').addClass("fuseClose").attr("fuseid",slot.fuseID).html(`<i class="fas fa-times"></i>`).hide();
        if (slot.fuseComplete()) {
            d3.hide();
            d4.show();
        }
        if (slot.notStarted()) {
            d3.hide();
            d5.show();
            d6.show();
        }
        d1.append(d2,d3,d4,d5,d6);
        $fuseSlots.append(d1);
    });
    for (let i=0;i<FusionManager.maxSlots()-FusionManager.slots.length;i++) {
        const d4 = $("<div/>").addClass("fuseSlot");
        const d5 = $("<div/>").addClass("fuseSlotName").html("Empty");
        d4.append(d5);
        $fuseSlots.append(d4);
    }
}

function refreshPossibleFuse() {
    $fuseList.empty();
    const d1 = $("<div/>").addClass("possibleFuseHead").html("Possible Fuses");
    const d2 = $("<div/>").addClass('possibleFuseHolder');
    const rarities = ["Common","Good","Great","Epic"];
    if(Inventory.getFusePossibilities().length === 0) d2.addClass("fuseInvBlank").html("No Items Available to Fuse");
    if(Inventory.getFusePossibilities().length > 0) {
        Inventory.getFusePossibilities().forEach(f => {
            const d3 = $("<div/>").addClass("possibleFusegroup");
            const d4 = $("<div/>").addClass("possibleFusegroupHeader").addClass("possibleFuseRarity"+f.rarity).html(`${rarities[f.rarity]} Fuse`)
            const d5 = $("<div/>").addClass("possibleFuse").html(f.name);
            const d6 = $("<div/>").addClass("fuseTime tooltip").attr("data-tooltip","fuse_time").html(`<i class="fas fa-clock"></i> ${msToTime(FusionManager.getMaxFuse(f))}`);
            const d7 = $("<div/>").addClass("fuseStart").attr("uniqueid",f.uniqueID);
                $("<div/>").addClass("fuseStartText").html("Fuse").appendTo(d7);
                $("<div/>").addClass("fuseStartCost tooltip").attr({"data-tooltip": "gold_value", "data-tooltip-value": formatWithCommas(FusionManager.getFuseCost(f))}).html(`${ResourceManager.materialIcon("M001")}${formatToUnits(FusionManager.getFuseCost(f),2)}`).appendTo(d7);
            d3.append(d4,d5,d6,d7);
            d2.append(d3);
        });
    }
    $fuseList.append(d1,d2);
}
    
$(document).on('click', '.fuseStart', (e) => {
    e.preventDefault();
    destroyTooltip();
    const uniqueid = $(e.currentTarget).attr("uniqueid");
    FusionManager.addFuse(uniqueid);
});

$(document).on('click', '.fuseClose', (e) => {
    e.preventDefault();
    const fuseid = parseInt($(e.currentTarget).attr("fuseid"));
    FusionManager.cancelFuse(fuseid);
})

$(document).on('click', '.fuseSlotStart', (e) => {
    e.preventDefault();
    const fuseid = parseInt($(e.currentTarget).attr("fuseid"));
    FusionManager.startFuse(fuseid);
});

$(document).on('click', '.fuseSlotCollect', (e) => {
    e.preventDefault();
    const id = parseInt($(e.currentTarget).attr("fuseid"));
    FusionManager.collectFuse(id);
});