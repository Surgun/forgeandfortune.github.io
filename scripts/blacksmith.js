"use strict";

const $smithInvSlots = $("#smithInvSlots");

const bloopSmith = {
    smithStage : null,
    smithSlot : null,
    smithState : "waiting",
    smithSuccess : false,
    smithTimer : 0,
    createSave() {
        const save = {};
        save.smithTimer = this.smithTimer;
        save.smithState = this.smithState;
        save.smithSuccess = this.smithSuccess;
        if (this.smithSlot !== null) save.smithSlot = this.smithSlot.createSave();
        else save.smithSlot = null;
        return save;
    },
    loadSave(save) {
        if (save.smithSlot !== null) {
            const container = new itemContainer(save.smithSlot.id,save.smithSlot.rarity);
            container.loadSave(save.smithSlot);
            this.smithSlot = container;
        }
        else {
            this.smithSlot = null;
        }
        if (save.smithSuccess !== undefined) this.smithSuccess = save.smithSuccess;
        this.smithTimer = save.smithTimer;
        this.smithState = save.smithState;
    },
    addSmith(containerID) {
        if (this.smithState !== "waiting") return;
        this.smithStage = Inventory.containerToItem(containerID);
    },
    getSmithCost(smithSlot) {
        if (smithSlot) {
            if (this.smithSlot === null) return;
            return Math.max(1,Math.floor(0.5*this.smithSlot.goldValue()*(this.smithSlot.sharp+1)));
        }
        if (this.smithStage === null) return;
        return Math.max(1,Math.floor(0.5*this.smithStage.goldValue()*(this.smithStage.sharp+1)));
    },
    getSmithChance(item) {
        if (item === null) return;
        return miscLoadedValues.smithChance[item.sharp];
    },
    smithStart() {
        if (this.smithState !== "waiting" || this.smithStage === null) return;
        if (ResourceManager.materialAvailable("M001") < this.getSmithCost()) {
            Notifications.cantAffordSmith();
            return;
        }
        if (ResourceManager.materialAvailable(this.getStageResourceCost()) < 3) {
            Notifications.cantAffordSmithRes();
            return;
        }
        ResourceManager.deductMoney(this.getSmithCost());
        ResourceManager.addMaterial(this.getStageResourceCost(),-3);
        this.smithSlot = this.smithStage;
        Inventory.removeContainerFromInventory(this.smithStage.containerID);
        this.smithState = "smithing";
        this.smithTimer = 5000;
    },
    smith() {
        if (this.smithSlot === null) return;
        const chance = this.getSmithChance(this.smithSlot);
        const roll = getRandomFromItem(this.smithSlot);
        if (roll < chance) {
            this.smithSlot.sharp += 1;
        }
        this.smithSuccess = roll < chance;
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
        if (Inventory.full()) {
            Notifications.cantCollectSmith();
            return;
        }
        Inventory.addItemContainerToInventory(this.smithSlot);
        this.smithSlot = null;
        this.smithState = "waiting";
    },
    getStageResourceCost() {
        if (this.smithStage === null) return;
        return this.smithStage.getSmithResourceCost();
    },
    resmith() {
        if (this.smithState !== "complete") return;
        this.smithState = "waiting";
        this.smithStage = this.smithSlot;
        this.smithSlot = null;
        this.smithStart();
    }
}

function initiateSmithBldg() {
    $smithBuilding.show();
    refreshSmithInventory();
    refreshSmithArea();
}

function refreshSmithInventory() {
    $smithInvSlots.empty();
    const d1 = $("<div/>").addClass("smithInvHead").html("Inventory");
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

function wipeSmithStage() {
    if (bloopSmith.smithStage === null) return;
    if (Inventory.hasContainer(bloopSmith.smithStage.containerID)) return;
    bloopSmith.smithStage = null;
    refreshSmithArea();
}

function refreshSmithArea() {
    if (bloopSmith.smithState === "waiting") {
        if (bloopSmith.smithStage === null) {
            $swItemStage.html("No Item Selected").removeClass("collectTextBox");
            $swItemResult.html("No Item Selected");
            $swMiddleText.html("Waiting for an Item to Smith").removeClass("smithFailed smithSucceed").show();
            resetSmithBar();
            $swSuccess.hide();
            $swConfirm.hide();
            $swCollect.hide();
        }
        else {
            $swItemStage.html(itemStageCardSmith(bloopSmith.smithStage,false));
            $swItemResult.html(itemStageCardSmith(bloopSmith.smithStage,true));
            $swMiddleText.hide();
            resetSmithBar();
            $swSuccess.html(`${bloopSmith.getSmithChance(bloopSmith.smithStage)}% Success`).show();
            const d1 = $("<div/>").addClass("smithCostContainer")
            const s1 = $("<div/>").addClass("smith_title").html(`Confirm Smith`)
            const s2 = $("<span/>").addClass("smith_cost smith_gold").html(`${miscIcons.gold} ${formatToUnits(bloopSmith.getSmithCost(),2)}`);
            const s3 = $("<span/>").addClass("smith_cost smith_material tooltip").attr("data-tooltip",ResourceManager.idToMaterial(bloopSmith.smithStage.item.smithCost).name).html(`${ResourceManager.materialIcon(bloopSmith.smithStage.item.smithCost)} 3`)
            d1.append(s1,s2,s3);
            $swConfirm.html(d1).show();
            $swCollect.hide();
        }
    }
    else if (bloopSmith.smithState === "smithing") {
        $swItemStage.html(itemStageCardSmith(bloopSmith.smithSlot,false));
        $swItemResult.html("In Progress").addClass("inProgressTextBox");
        $swMiddleText.html("Smithing...").show();
        $swSuccess.hide();
        $swConfirm.hide();
        $swCollect.hide();
    }
    else if (bloopSmith.smithState === "complete") {
        $swItemStage.empty();
            $("<div/>").addClass("collectTextBox").html("Collect Reward").appendTo($swItemStage);
            const d = $("<div/>").attr("id","collectResmith").html("Smith Again").appendTo($swItemStage);
            $("<span/>").addClass("smith_cost smith_gold").html(`${miscIcons.gold} ${formatToUnits(bloopSmith.getSmithCost(true),2)}`).appendTo(d);
            $("<span/>").addClass("smith_cost smith_material tooltip").attr("data-tooltip",ResourceManager.idToMaterial(bloopSmith.smithSlot.item.smithCost).name).html(`${ResourceManager.materialIcon(bloopSmith.smithSlot.item.smithCost)} 3`).appendTo(d)
        const d1 = $("<div/>").attr("id","swCollect").html("Collect");
        $swItemResult.html(itemStageCardSmith(bloopSmith.smithSlot,false).append(d1)).removeClass("inProgressTextBox");
        if (bloopSmith.smithSuccess) {
            $swMiddleText.html(`<i class="fas fa-check-square"></i> Smithing Complete`);
            $swMiddleText.addClass("smithSucceed");
        }
        else {
            $swMiddleText.html(`<i class="fas fa-times-square"></i> Smithing Failed`);
            $swMiddleText.addClass("smithFailed");
        }
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

function itemStageCardSmith(slot,upgrade) {
    if (slot === "failed") {
        const itemdiv = $("<div/>").addClass("smithItem");
        const itemName = $("<div/>").addClass("smithItemName").html("<img src='images/recipes/failedSmith.png'><div class='item-name smith-failed'>Failed</div>");
        return itemdiv.append(itemName);
    }
    const itemdiv = $("<div/>").addClass("smithItem").addClass("R"+slot.rarity);
    const itemName = $("<div/>").addClass("smithItemName");
    if (upgrade) itemName.html(slot.picNamePlus());
    else itemName.html(slot.picName());
    const itemProps = $("<div/>").addClass("smithProps").html(slot.statChange(upgrade));
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
});

$(document).on("click","#collectResmith", (e) => {
    e.preventDefault();
    bloopSmith.resmith();
    refreshSmithArea();
});