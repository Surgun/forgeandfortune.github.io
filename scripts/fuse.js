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
    fuseComplete() {
        return this.fuseTime === this.getMaxFuse();
    }
}

const FusionManager = {
    slots : [],
    maxSlots : 3,
    fuseNum : 0,
    addFuse(id,rarity) {
        if (this.slots.length === this.maxSlots) return;
        if (!Inventory.hasThree(id,rarity-1)) return;
        const fuseDummy = {id:id,rarity:rarity};
        if (ResourceManager.materialAvailable("M001") < this.getFuseCost(fuseDummy)) {
            Notifications.cantAffordFuse();
            return;
        }
        ResourceManager.deductMoney(this.getFuseCost(fuseDummy));
        Inventory.removeFromInventory(id,rarity-1);
        Inventory.removeFromInventory(id,rarity-1);
        Inventory.removeFromInventory(id,rarity-1);
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
        this.slots.forEach(slot => {
            if (slot.fuseComplete()) {
                EventManager.addEventFuse({id:slot.id,rarity:slot.rarity});
            };
        });
        if (this.slots.some(s=>s.fuseComplete())) {
            this.slots = this.slots.filter(s => !s.fuseComplete());
            refreshFuseSlots();
        };
        refreshFuseBars();
    },
    getFuseCost(fuse) {
        const item = recipeList.idToItem(fuse.id);
        return 4*item.value*fuse.rarity;
    }
}

function initiateFuseBldg() {
    refreshFuseSlots();
    refreshPossibleFuse();
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

const $fuseSlots = $("#fuseSlots");
const $fuseList = $("#fuseList");

function refreshFuseSlots() {
    $fuseSlots.empty();
    FusionManager.slots.forEach(slot => {
        const d1 = $("<div/>").addClass("fuseSlot");
        const d2 = $("<div/>").addClass("fuseSlotName").html(slot.name);
        const d3 = createFuseBar(slot);
        d1.append(d2,d3);
        $fuseSlots.append(d1);
    });
    for (let i=0;i<FusionManager.maxSlots-FusionManager.slots.length;i++) {
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
    Inventory.getFusePossibilities().forEach(f => {
        const item = recipeList.idToItem(f.id);
        const d3 = $("<div/>").addClass("possibleFusegroup");
        const d4 = $("<div/>").addClass("possibleFusegroupHeader").addClass("possibleFuseRarity"+f.rarity).html(`${rarities[f.rarity]} Fuse`)
        const d5 = $("<div/>").addClass("possibleFuse").html(`${item.itemPicName()}`);
        const d6 = $("<div/>").addClass("fuseStart").attr("fuseID",f.id).attr("fuseRarity",f.rarity).html(`FUSE&nbsp;&nbsp;${ResourceManager.materialIcon("M001")}&nbsp;&nbsp;${formatToUnits(FusionManager.getFuseCost(f),2)}`);
        d3.append(d4,d5,d6);
        d2.append(d3);
    });
    $fuseList.append(d1,d2);
}
    
$(document).on('click', '.fuseStart', (e) => {
    e.preventDefault();
    const id = $(e.target).attr("fuseID");
    const rarity = parseInt($(e.target).attr("fuseRarity"));
    FusionManager.addFuse(id,rarity);
});