"use strict";

const $smithWorkingArea = $("#smithWorkingArea");
const $smithInvSlots = $("#smithInvSlots");

const bloopSmith = {
    smithSlot : null,
    createSave() {
        const save = {};
        save.smithSlotTime = this.smithSlotTime;
        save.smithFinished = this.smithFinished;
        if (this.smithSlot !== null) save.smithSlot = this.smithSlot.createSave();
        else save.smithSlot = null;
        return save;
    },
    loadSave(save) {
        if (save.smithSlot !== null) {
            const container = new itemContainer(save.smithSlot.id,save.smithSlot.rarity);
            container.sharp = save.smithSlot.sharp;
            this.smithSlot = container;
        }
        else {
            this.smithSlot = null;
        }
        this.smithSlotTime = save.smithSlotTime;
        this.smithFinished = save.smithFinished;
    },
    addSmith(containerID) {
        const container = Inventory.containerToItem(containerID);
        this.smithSlot = container;
    },
    getSmithCost() {
        if (this.smithSlot === null) return;
        return Math.max(1,Math.floor(0.5*this.smithSlot.goldValue()*(this.smithSlot.sharp+1)));
    },
    getSmithChance() {
        if (this.smithSlot === null) return;
        return 10+this.smithSlot.sharp*5;
    },
    smith() {
        if (this.smithSlot === null) return;
        if (ResourceManager.materialAvailable("M001") < this.getSmithCost()) {
            Notifications.cantAffordSmith();
            return;
        }
        ResourceManager.deductMoney(this.getSmithCost());
        const failure = Math.floor(Math.random() * 100);
        if (failure < this.getSmithChance()) {
            Inventory.removeContainerFromInventory(this.smithSlot.containerID);
            this.smithSlot = null;
        }
        else {
            this.smithSlot.sharp += 1;
        }
        refreshInventoryPlaces()
        refreshSmithWorking();
    },
}

function initiateSmithBldg() {
    refreshSmithInventory();
    refreshSmithWorking();
}

function refreshSmithInventory() {
    $smithInvSlots.empty();
    const d1 = $("<div/>").addClass("smithInvHead").html("INVENTORY");
    $smithInvSlots.append(d1);
    if (Inventory.nonblank().length === 0) {
        const d2 = $("<div/>").addClass("smithInvBlank").html("No Items in Inventory");
        $smithInvSlots.append(d2);
        return;
    }
    Inventory.nonblank().filter(i=>i.sharp < 10).forEach(item => {
        $smithInvSlots.append(itemCardSmith(item));
    });
}

function refreshSmithWorking() {
    $smithWorkingArea.empty();
    if (bloopSmith.smithSlot === null) return;
    $smithWorkingArea.append(itemStageCardSmith());
}

function itemCardSmith(item) {
    const itemdiv = $("<div/>").addClass("smithItem").addClass("R"+item.rarity);
    const itemName = $("<div/>").addClass("smithItemName").html(item.picName());
    const itemProps = $("<div/>").addClass("smithProps").html(item.propDiv());
    const locationButton = $("<div/>").addClass("smithStage").attr("containerID",item.containerID).html("Smith");
    return itemdiv.append(itemName,itemProps,locationButton);
}

function itemStageCardSmith() {
    const item = bloopSmith.smithSlot;
    const itemdiv = $("<div/>").addClass("smithItem").addClass("R"+item.rarity);
    const itemName = $("<div/>").addClass("smithItemName").html(item.picName());
    const itemProps = $("<div/>").addClass("smithProps").html(item.statChange());
    const itemChance = $("<div/>").addClass("smithChance").html(`${bloopSmith.getSmithChance()}% Success`)
    const locationButton = $("<div/>").attr("id","smithAttempt").html(`Smith <span class="smith_cost">${miscIcons.gold} ${bloopSmith.getSmithCost()}</span>`);
    return itemdiv.append(itemName,itemProps, itemChance, locationButton); 
}

$(document).on("click",".smithStage",(e) => {
    e.preventDefault();
    const containerID = parseInt($(e.target).attr("containerID"));
    bloopSmith.addSmith(containerID);
    refreshSmithWorking();
});

$(document).on("click","#smithAttempt", (e) => {
    e.preventDefault();
    bloopSmith.smith();
    refreshSmithWorking();
});