"use strict";

class fuse {
    constructor(id,rarity) {
        this.id = id;
        this.recipe = recipeList.idToItem(id);
        this.name = this.recipe.name;
        this.rarity = rarity;
        this.fuseTime = 0;
    }
    addTime(ms) {
        this.fuseTime += ms;
        this.fuseTime = Math.min(this.fuseTime,this.getMaxFuse());
    }
    getMaxFuse() {
        return this.recipe.craftTime*this.rarity;
    }
    fuseDone() {
        return this.fuseTime === this.getMaxFuse();
    }
    timeRemaining() {
        return this.getMaxFuse() - this.fuseTime;
    }
}

const FusionManager = {
    slots : [],
    maxSlots : 3,
    fuseNum : 0,
    addFuse(id,rarity) {
        if (this.slots.length === this.maxSlots) return;
        const newFuse = new fuse(id,rarity);
        newFuse.fuseID = this.fuseNum;
        this.fuseNum += 1;
        this.slots.push(newFuse);
        showFuseBldg();
    },
    addTime(ms) {
        this.slots.forEach(fuse => {
            fuse.addTime(ms);
        });
        refreshFuseBars();
    },
}

const $buildingList = $("#buildingList");
const $buildingContent = $("#buildingContent");

function refreshSideTown() {
    $buildingList.empty();
    const d1 = $("<div/>").addClass("buildingName").attr("id","bankBldg").html("Bank");
    const d2 = $("<div/>").addClass("buildingName").attr("id","fusionBldg").html("Fusion");
    const d3 = $("<div/>").addClass("buildingName").attr("id","smithBldg").html("Blacksmith");
    $buildingList.append(d1,d2,d3);
}

function showFuseBldg() {
    $buildingContent.empty();
    const d = $("<div/>").addClass("fuseDesc").html("Fuse 3x of the same item into a rarity higher");
    const d1 = $("<div/>").addClass("fuseHead").html("Fusion Slots:");
    const d2 = $("<div/>").addClass("fuseSlotHolder");
    FusionManager.slots.forEach(slot => {
        const d2a = $("<div/>").addClass("fuseSlot");
        const d2b = $("<div/>").addClass("fuseSlotName").html(slot.name);
        const d2c = createFuseBar(slot);
        d2a.append(d2b,d2c);
        d2.append(d2a);
    });
    for (let i=0;i<FusionManager.maxSlots-FusionManager.slots.length;i++) {
        const d2d = $("<div/>").addClass("fuseSlot");
        const d2e = $("<div/>").addClass("fuseSlotName").html("Empty");
        d2d.append(d2e);
        d2.append(d2d);
    }
    const d3 = $("<div/>").addClass("possibleFuse").html("Possible Fuses:");
    const d4 = $("<div/>").addClass('possibleFuseHolder');
    const rarities = ["Common","Good","Great","Epic"];
    Inventory.getFusePossibilities().forEach(f => {
        const d4a = $("<div/>").addClass("possibleFusegroup");
        const d4b = $("<div/>").addClass("possibleFuse").html(`${rarities[f.rarity]} ${f.name}`);
        const d4c = $("<div/>").addClass("fuseStart").attr("fuseID",f.id).attr("fuseRarity",f.rarity).html("FUSE");
        d4a.append(d4b,d4c);
        d4.append(d4a);
    });
    $buildingContent.append(d,d1,d2,d3,d4);
}

function createFuseBar(fuse) {
    const fusePercent = fuse.fuseTime/fuse.getMaxFuse();
    const fuseAmt = msToTime(fuse.getMaxFuse()-fuse.fuseTime);
    const fuseWidth = (fusePercent*100).toFixed(1)+"%";
    const d1 = $("<div/>").addClass("fuseBarDiv");
    const d1a = $("<div/>").addClass("fuseBar").attr("data-label",fuseAmt).attr("id","fuseBar"+fuse.fuseID);
    const s1 = $("<span/>").addClass("fuseBarFill").attr("id","fuseFill"+fuse.fuseID).css('width', fuseWidth);
    return d1.append(d1a,s1);
}

function refreshFuseBars() {
    FusionManager.slots.forEach(fuse => {
        const fusePercent = fuse.fuseTime/fuse.getMaxFuse();
        const fuseAmt = msToTime(fuse.getMaxFuse()-fuse.fuseTime);
        const fuseWidth = (fusePercent*100).toFixed(1)+"%";
        $("#fuseBar"+fuse.fuseID).attr("data-label",fuseAmt);
        $("#fuseFill"+fuse.fuseID).css('width', fuseWidth);
    });
}

$(document).on('click', "#fusionBldg", (e) => {
    e.preventDefault();
    showFuseBldg();
})

$(document).on('click', '.fuseStart', (e) => {
    e.preventDefault();
    const id = $(e.target).attr("fuseID");
    const rarity = $(e.target).attr("fuseRarity");
    FusionManager.addFuse(id,rarity);
})