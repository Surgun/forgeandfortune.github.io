"use strict";

const $smithInvSlots = $("#smithInvSlots");

const bloopSmith = {
    smithSlot : null,
    smithState : "waiting",
    smithTimer : 0,
    createSave() {
        const save = {};
        save.smithTimer = this.smithTimer;
        save.smithState = this.smithState;
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
        this.smithTimer = save.smithTimer;
        this.smithState = save.smithState;
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
        if (ResourceManager.materialAvailable("M001") < this.getSmithCost()) {
            Notifications.cantAffordSmith();
            return;
        }
        ResourceManager.deductMoney(this.getSmithCost());
        Inventory.removeContainerFromInventory(this.smithSlot.containerID);
        this.smithState = "smithing";
        this.smithTimer = 5000;
        refreshInventoryPlaces();
    },
    smith() {
        if (this.smithSlot === null) return;
        const failure = Math.floor(Math.random() * 100);
        if (failure < this.getSmithChance()) {
            this.smithSlot = "failed";
        }
        else {
            this.smithSlot.sharp += 1;
        }
        this.smithState = "complete";
        refreshSmithArea();
    },
    addTime(ms) {
        if (this.smithState !== "smithing") return;
        this.smithTimer = Math.max(0,this.smithTimer - ms);
        refreshSmithBar();
        if (this.smithTimer === 0) this.smith();
    },
    collectSmith() {
        if (this.smithState !== "complete") return;
        if (this.smithSlot === "failed") {
            this.smithSlot = null;
            this.smithState = "waiting";
            return;
        }
        if (Inventory.full()) {
            Notifications.cantCollectSmith();
            return;
        }
        Inventory.addItemContainerToInventory(this.smithSlot);
        this.smithSlot = null;
        this.smithState = "waiting";
    }
}

function initiateSmithBldg() {
    $smithBuilding.show();
    refreshSmithInventory();
    refreshSmithArea();
}

function refreshSmithInventory() {
    $smithInvSlots.empty();
    const d1 = $("<div/>").addClass("smithInvHead").html("INVENTORY");
    $smithInvSlots.append(d1);
    if (Inventory.nonblank(true).length === 0) {
        const d2 = $("<div/>").addClass("smithInvBlank").html("No Items in Inventory");
        $smithInvSlots.append(d2);
        return;
    }
    Inventory.nonblank(true).filter(i=>i.sharp < 10).forEach(item => {
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
const $swCollect = $("#swCollect");

function refreshSmithArea() {
    if (bloopSmith.smithState === "waiting") {
        if (bloopSmith.smithSlot === null) {
            $swItemStage.html("No Item Selected").removeClass("collectTextBox");
            $swItemResult.html("No Item Selected")
            $swMiddleText.html("Waiting for an Item to Smith").show();
            resetSmithBar();
            $swSuccess.hide();
            $swConfirm.hide();
            $swCollect.hide();
        }
        else {
            $swItemStage.html(itemStageCardSmith(false));
            $swItemResult.html(itemStageCardSmith(true));
            $swMiddleText.hide();
            resetSmithBar();
            $swSuccess.html(`${100-bloopSmith.getSmithChance ()}% Success`).show();
            $swConfirm.html(`Confirm Smith<span class="smith_cost">${miscIcons.gold} ${formatToUnits(bloopSmith.getSmithCost(),2)}</span>`).show();
            $swCollect.hide();
        }
    }
    else if (bloopSmith.smithState === "smithing") {
        $swItemStage.html(itemStageCardSmith(false));
        $swItemResult.html("In Progress").addClass("inProgressTextBox");
        $swMiddleText.html("Smithing...").show();
        $swSuccess.hide();
        $swConfirm.hide();
        $swCollect.hide();
    }
    else if (bloopSmith.smithState === "complete") {
        $swItemStage.html("Collect Reward").addClass("collectTextBox");
        const d1 = $("<div/>").attr("id","swCollect").html("Collect");
        $swItemResult.html(itemStageCardSmith(false).append(d1)).removeClass("inProgressTextBox");
        $swMiddleText.html("Smithing Complete");
        resetSmithBar();
        $swSuccess.hide();
        $swConfirm.hide();
        $swCollect.show();
    }
}

function resetSmithBar() {
    $swBar.attr("data-label","");
    $swFill.css("width",0);
}

function refreshSmithBar() {
    const smithPercent = 1-bloopSmith.smithTimer/5000;
    const smithWidth = (smithPercent*100).toFixed(1)+"%";
    const smithAmt = msToTime(bloopSmith.smithTimer);
    $swBar.attr("data-label",smithAmt);
    $swFill.css('width',smithWidth);
}

function itemCardSmith(item) {
    const itemdiv = $("<div/>").addClass("smithItem").addClass("R"+item.rarity);
    const itemName = $("<div/>").addClass("smithItemName").html(item.picName());
    const itemLevel = $("<div/>").addClass("smithItemLevel").html(item.itemLevel());
    const itemProps = $("<div/>").addClass("smithProps").html(item.propDiv());
    const smithButton = $("<div/>").addClass("smithStage").attr("containerID",item.containerID).html("Smith");
    return itemdiv.append(itemName,itemProps,itemLevel,smithButton);
}

function itemStageCardSmith(upgrade) {
    if (bloopSmith.smithSlot === null) return;
    if (bloopSmith.smithSlot === "failed") {
        const itemdiv = $("<div/>").addClass("smithItem");
        const itemName = $("<div/>").addClass("smithItemName").html("<img src='images/recipes/failedSmith.png'><div class='item-name smith-failed'>Failed</div>");
        return itemdiv.append(itemName);
    }
    const item = bloopSmith.smithSlot;
    const itemdiv = $("<div/>").addClass("smithItem").addClass("R"+item.rarity);
    const itemName = $("<div/>").addClass("smithItemName");
    if (upgrade) itemName.html(item.picNamePlus());
    else itemName.html(item.picName());
    const itemProps = $("<div/>").addClass("smithProps").html(item.statChange(upgrade));
    return itemdiv.append(itemName,itemProps); 
}

$(document).on("click",".smithStage",(e) => {
    e.preventDefault();
    const containerID = parseInt($(e.target).attr("containerID"));
    bloopSmith.addSmith(containerID);
    refreshSmithArea();
});

$(document).on("click","#swConfirm", (e) => {
    e.preventDefault();
    bloopSmith.smithStart();
    refreshSmithArea();
});

$(document).on("click","#swCollect", (e) => {
    e.preventDefault();
    bloopSmith.collectSmith();
    refreshSmithArea();
})