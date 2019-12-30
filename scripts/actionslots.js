"use strict";

const slotState = Object.freeze({NEEDMATERIAL:0,CRAFTING:1});

$(document).on("click", ".ASCancel", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const slot = parseInt($(e.target).parent().data("slotNum"));
    actionSlotManager.removeSlot(slot);
});

$(document).on("click", ".ASBuySlotButton", (e) => {
    e.preventDefault();
    actionSlotManager.upgradeSlot();
})

$(document).on("click", ".ASauto", (e) => {
    e.preventDefault();
    const slot = parseInt($(e.currentTarget).data("slotNum"));
    const newRarity = actionSlotManager.toggleAuto(slot);
    actionSlotVisualManager.updateAutoSell(e,newRarity);
});

class actionSlot {
    constructor(itemid,slotNum) {
        this.itemid = itemid;
        this.item = recipeList.idToItem(itemid);
        this.craftTime = 0;
        this.status = slotState.NEEDMATERIAL;
        this.slotNum = slotNum;
    }
    createSave() {
        const save = {};
        save.itemid = this.itemid;
        save.craftTime = this.craftTime;
        save.status = this.status;
        save.slotNum = this.slotNum;
        return save;
    }
    loadSave(save) {
        this.craftTime = save.craftTime;
        this.status = save.status;
        this.slotNum = save.slotNum;
    }
    itemPicName() {
        return this.item.itemPicName();
    }
    addTime(t,skipAnimation) {
        if (this.status === slotState.NEEDMATERIAL) this.attemptStart(skipAnimation);
        if (this.status !== slotState.CRAFTING) {
            this.craftTime = 0;
            return;
        }
        this.craftTime += t;
        if (this.craftTime > this.maxCraft()) {
            this.craftTime -= this.maxCraft();
            Inventory.craftToInventory(this.itemid,skipAnimation);
            if (!skipAnimation) refreshRecipeMasteryAmt(this.item);
            this.status = slotState.NEEDMATERIAL;
            this.attemptStart(skipAnimation);
        }
        this.progress = (this.craftTime/this.maxCraft()).toFixed(3)*100+"%";
    }
    maxCraft() {
        return this.item.craftTime * MonsterHall.lineIncrease(this.item.type,0)
    }
    timeRemaining() {
        return this.maxCraft()-this.craftTime;
    }
    attemptStart(skipAnimation) {
        //attempts to consume requried material, if successful start crafting
        if (this.item.isMastered()) {
            this.status = slotState.CRAFTING;
            return;
        }
        if (!ResourceManager.canAffordMaterial(this.item)) return;
        ResourceManager.deductMaterial(this.item,skipAnimation);
        this.status = slotState.CRAFTING;
    }
    autoSellToggle() {
        return this.item.autoSellToggle();
    }
    autoSell() {
        return this.item.autoSell;
    }
    refundMaterial() {
        if (this.status !== slotState.CRAFTING || this.item.isMastered()) return;
        ResourceManager.refundMaterial(this.item);
    }
    isMastered() {
        return this.item.isMastered();
    }
    isBuildingMaterial() {
        const types = ["foundry","bank", "fuse", "smith", "fortune"];
        return types.includes(this.item.recipeType);
    }
    resList() {
        return this.item.gcost;
    }
}

const actionSlotManager = {
    maxSlots : 1,
    slots : [],
    minTime : 0,
    createSave() {
        const save = {};
        save.maxSlots = this.maxSlots;
        save.slots = [];
        this.slots.forEach(s => {
            save.slots.push(s.createSave());
        })
        save.minTime = this.minTime;
        return save;
    },
    loadSave(save) {
        this.maxSlots = save.maxSlots;
        save.slots.forEach(s => {
            const slot = new actionSlot(s.itemid)
            slot.loadSave(s);
            this.slots.push(slot);
        });
        this.minTime = save.minTime;
    },
    addSlot(itemid) {
        if (this.slots.length >= this.maxSlots) {
            Notifications.slotsFull();
            return;
        }
        const item = recipeList.idToItem(itemid);
        if (item.recipeType !== "normal" && this.isAlreadySlotted(itemid)) return;
        if (!item.owned) return Notifications.recipeNotOwned();
        if (!item.canProduce) {
            Notifications.craftWarning();
            return;
        }
        this.slots.push(new actionSlot(itemid,this.slots.length));
        this.adjustMinTime();
        refreshSideWorkers();
        recipeList.canCraft();
        checkCraftableStatus();
    },
    adjustMinTime() {
        if (this.slots.length === 0) {
            this.minTime = 0;
            return;
        }
        this.minTime = Math.min(...this.slots.map(s => s.maxCraft()));
    },
    removeSlot(slot) {
        this.slots[slot].refundMaterial();
        this.slots.splice(slot,1);
        this.adjustMinTime();
        refreshSideWorkers();
        recipeList.canCraft();
        checkCraftableStatus();
    },
    removeBldgSlots() {
        this.slots = this.slots.filter(s => s.item.recipeType === "normal");
        this.adjustMinTime();
        refreshSideWorkers();
        recipeList.canCraft();
        checkCraftableStatus();
    },
    isAlreadySlotted(id) {
        return this.slots.map(s=>s.itemid).includes(id)
    },
    addTime(t) {
        if (this.slots.length === 0) return;
        const skipAnimation = t >= this.minTime;
        if (!skipAnimation) {
            this.slots.forEach(slot => {
                slot.addTime(t,false);
            });
            return;
        }
        let timeRemaining = t;
        while (timeRemaining > 0) {
            const timeChunk = Math.min(timeRemaining,this.minTime);
            this.slots.forEach(slot => {
                slot.addTime(timeChunk,true);
            });
            timeRemaining -= timeChunk;
        }
        refreshInventoryAndMaterialPlaces();
    },
    upgradeSlot() {
        if (this.maxSlots === 5) return;
        this.maxSlots += 1;
    },
    autoSell(i) {
        if (this.slots.length <= i) return "";
        return this.slots[i].autoSell();
    },
    toggleAuto(i) {
        return this.slots[i].autoSellToggle();
    },
    guildUsage() {
        const mats = flattenArray(...[this.slots.map(s=>s.item.gcost)]);
        const group = groupArray(mats);
        return group
    },
    materialUsage() {
        const mats = flattenArray(...([this.slots.map(s=>s.item.material())]))
        const uniqueMats = [...new Set(mats)];
    },
    freeSlots() {
        return this.maxSlots - this.slots.length;
    }
}

const $actionSlots = $("#actionSlots");

class actionSlotVisualSlotTracking {
    constructor(id,status,slotNum) {
        this.id = id;
        this.status = status;
        this.slotNum = slotNum;
    }
    addReference() {
        this.timeRef = $(`#ASBar${this.slotNum}`);
        this.progressRef = $(`#ASBarFill${this.slotNum}`);
    }
}

function newActionSlot(slot) {
    const d = $("<div/>").addClass("ASBlock");
    $("<div/>").addClass("ASName").attr("id","asSlotName"+slot.slotNum).html(slot.itemPicName()).appendTo(d);
    const d2 = $("<div/>").addClass("ASCancel").data("slotNum",slot.slotNum).appendTo(d);
    $("<div/>").addClass("ASCancelText").data("slotNum",slot.slotNum).html(`${miscIcons.cancelSlot}`).appendTo(d2);
    const d3 = $("<div/>").addClass("ASProgressBar").attr("id","ASBar"+slot.slotNum).attr("data-label","").appendTo(d);
    const s3 = $("<span/>").addClass("ProgressBarFill").attr("id","ASBarFill"+slot.slotNum).appendTo(d3);
    if (slot.isMastered()) s3.addClass("ProgressBarFillMaster");
    const d4 = $("<div/>").addClass("ASauto tooltip").attr("data-tooltip", `autosell_${slot.autoSell().toLowerCase()}`).attr("id","asAuto"+slot.slotNum).data("slotNum",slot.slotNum).html(miscIcons.autoSell).appendTo(d);
    if (slot.autoSell() !== "None") d4.addClass("ASautoEnabled"+slot.autoSell());
    if (slot.isBuildingMaterial()) d4.hide();
    if (!slot.resList) return d;
    const d5 = $("<div/>").addClass("asRes").attr("id","asRes"+slot.slotNum).appendTo(d);
    slot.resList().forEach(g => {
        $("<div/>").addClass("asResIcon tooltip").attr({"data-tooltip":"guild_worker","data-tooltip-value":g}).html(GuildManager.idToGuild(g).icon).appendTo(d5);
    });
    return d;
}

function newEmptyActionSlot() {
    const d = $("<div/>").addClass("ASBlock");
    $("<div/>").addClass("ASName").html(`${miscIcons.emptySlot} Empty Slot`).appendTo(d);
    return d;
}

const actionSlotVisualManager = {
    slots : [],
    firstLoad : true,
    disableRefresh : false,
    updateSlots() {
        if (this.disableRefresh) return;
        //slots changed, just redraw everything
        if (this.slots.length !== actionSlotManager.slots.length || this.firstLoad) {
            this.firstLoad = false;
            this.slots = [];
            $actionSlots.empty();
            actionSlotManager.slots.forEach((slot,i) => {
                const newSlot = new actionSlotVisualSlotTracking(slot.itemid,slot.status,i);
                $actionSlots.append(newActionSlot(slot));
                this.slots.push(newSlot);
                newSlot.addReference();
            });
            for (let i=0;i<actionSlotManager.freeSlots();i++) {
                $actionSlots.append(newEmptyActionSlot());
            }
            return;
        }
        //otherwise let's just update what we have....
        actionSlotManager.slots.forEach((slot,i) => {
            const compareSlot = this.slots[i];
            if (slot.id !== compareSlot.id) {
                compareSlot.id = slot.id;
                //if the craft isn't the same pop the new one in
                $(`#asSlotName${slot.slotNum}`).html(slot.itemPicName());
                if (slot.isMastered()) $(`#ASBarFill${slot.slotNum}`).addClass("ProgressBarFillMaster");
                else $(`#ASBarFill${slot.slotNum}`).removeClass("ProgressBarFillMaster");
                $(`#asAuto${slot.slotNum}`).removeClass("ASautoEnabledCommon ASautoEnabledGood ASautoEnabledGreat ASautoEnabledEpic").addClass("ASautoEnabled"+slot.autoSell());
                if (!slot.resList) return;
                const d = $(`#asRes${slot.slotNum}`).empty();
                slot.resList().forEach(g => {
                    $("<div/>").addClass("asResIcon tooltip").attr({"data-tooltip":"guild_worker","data-tooltip-value":g}).html(GuildManager.idToGuild(g).icon).appendTo(d);
                });
            }
            if (compareSlot.status === slotState.NEEDMATERIAL && slot.status === slotState.CRAFTING) {
                //update for time format
                compareSlot.timeRef.removeClass("matsNeeded").attr("data-label",msToTime(slot.timeRemaining()));
            }
            else if (compareSlot.status === slotState.CRAFTING && slot.status === slotState.NEEDMATERIAL) {
                compareSlot.timeRef.addClass("matsNeeded").attr("data-label","Requires more material");
            }
            else if (compareSlot.status === slotState.CRAFTING) {
                compareSlot.progressRef.css('width', slot.progress);
                compareSlot.timeRef.attr("data-label",msToTime(slot.timeRemaining()));
            }
        });
    },
    updateAutoSell(e,newRarity) {
        $(e.currentTarget).removeClass("ASautoEnabledCommon ASautoEnabledGood ASautoEnabledGreat ASautoEnabledEpic").addClass("ASautoEnabled"+newRarity);
        $(e.currentTarget).attr("data-tooltip", `autosell_${newRarity.toLowerCase()}`);
        destroyTooltip();
        generateTooltip(e);
    }
}

function refreshInventoryAndMaterialPlaces() {
    refreshInventoryPlaces();
    //grab ALL the materials we might have consumed and just update where they might show up
    actionSlotManager.materialUsage().forEach(matID => {
        refreshMaterial(matID);
    });
}