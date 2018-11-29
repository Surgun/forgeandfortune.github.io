"use strict";

const $smithInvSlots = $("#smithInvSlots");

const bloopSmith = {
    smithSlot : null,
    smithState : "waiting",
    smithTimer : 0,
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
        if (this.smithState !== "waiting") return;
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
    smithStart() {
        if (this.smithState !== "waiting" || this.smithSlot === null) return;
        this.smithState = "smithing";
        this.smithTimer = 10000;
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
            if (this.smithSlot.sharp === 10) this.smithSlot = null;
        }
        refreshInventoryPlaces()
        refreshSmithWorking();
    },
    addTime(ms) {
        if (this.smithState !== "smithing") return;
        this.smithTimer = Math.max(0,this.smithTimer - ms);
        refreshSmithBar();
        if (this.smithTimer === 0) {
            this.smithState = "complete";
            refreshSmithArea();
        }
    }
}

function initiateSmithBldg() {
    refreshSmithInventory();
    refreshSmithWorking();
    refreshSmithMiddle();
    refreshSmithResult();
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

const $swItemStage = $("#swItemStage");
const $swMiddleText = $("#swMiddleText");
const $swConfirm = $("#swConfirm");
const $swSuccess = $("#swSuccess");
const $swBar = $("#swBar");
const $swFill = $("#swFill");
const $swItemResult = $("#swItemResult");
const $swAgain = $("#swAgain");

function refreshSmithArea() {
    if (bloopSmith.smithState === "waiting") {
        if (bloopSmith.smithSlot === null) {
            $swItemStage.html("No Item Selected");
            $swItemResult.html("No Item Selected").removeClass("notSmithedYet");
            $swMiddleText.html("Waiting for an Item to Smith").show();
            $swSuccess.hide();
            $swConfirm.hide();
            $swAgain.hide();
        }
        else {
            $swItemStage.html(itemStageCardSmith(false));
            $swItemResult.html(itemStageCardSmith(true)).addClass("notSmithedYet");
            $swMiddleText.hide();
            $swSuccess.html(`${bloopSmith.getSmithChance()}% Success`).show();
            $swConfirm.html(` Confirm Smith <span class="smith_cost">${miscIcons.gold} ${bloopSmith.getSmithCost()}</span>`).show();
            $swAgain.hide();
        }
    }
    else if (bloopSmith.smithState === "smithing") {
        $swItemStage.html("In Progress");
        $swItemResult.html("In Progress").removeClass("notSmithedYet");
        $swMiddleText.html("Smithing...").show();
        $swSuccess.hide();
        $swConfirm.hide();
        $swAgain.hide();
    }
    else {
        $swItemStage.html("Collect Reward");
        $swItemResult.html(itemStageCardSmith(false));
        $swMiddleText.html("Smithing Complete");
        $swSuccess.hide();
        $swConfirm.hide();
        $swAgain.show();
    }
}

function refreshSmithWorking() {
    $swItemStage.html(itemStageCardSmith());
    $swItemResult.html(itemResultCardSmith());
    $swSuccess.html(`${bloopSmith.getSmithChance()}% Success`).show();
    $swConfirm.html(` Confirm Smith <span class="smith_cost">${miscIcons.gold} ${bloopSmith.getSmithCost()}</span>`).show();
    if (bloopSmith.smithSlot === null) {
        $swSuccess.hide();
        $swConfirm.hide();
    }
    if (bloopSmith.smithTimer > 0) $smithInvSlots.hide();
    else $smithInvSlots.show();
}

function refreshSmithBar() {
    const smithPercent = 1-bloopSmith.smithTimer/10000;
    const smithWidth = (smithPercent*100).toFixed(1)+"%";
    const smithAmt = msToTime(bloopSmith.smithTimer-1000);
    $swBar.attr("data-label",smithAmt);
    $swFill.css('width',smithWidth);
}

function itemCardSmith(item) {
    const itemdiv = $("<div/>").addClass("smithItem").addClass("R"+item.rarity);
    const itemName = $("<div/>").addClass("smithItemName").html(item.picName());
    const itemProps = $("<div/>").addClass("smithProps").html(item.propDiv());
    const smithButton = $("<div/>").addClass("smithStage").attr("containerID",item.containerID).html("SMITH");
    return itemdiv.append(itemName,itemProps,smithButton);
}

function itemStageCardSmith(upgrade) {
    if (bloopSmith.smithSlot === null) return;
    const item = bloopSmith.smithSlot;
    const itemdiv = $("<div/>").addClass("smithItem").addClass("R"+item.rarity);
    const itemName = $("<div/>").addClass("smithItemName").html(item.picName());
    const itemProps = $("<div/>").addClass("smithProps").html(item.statChange());
    return itemdiv.append(itemName,itemProps); 
}

$(document).on("click",".smithStage",(e) => {
    e.preventDefault();
    const containerID = parseInt($(e.target).attr("containerID"));
    bloopSmith.addSmith(containerID);
    refreshSmithWorking();
});

$(document).on("click","#smithAttempt", (e) => {
    e.preventDefault();
    bloopSmith.smithStart();
    refreshSmithWorking();
});