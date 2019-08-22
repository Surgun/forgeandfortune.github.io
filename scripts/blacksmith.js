"use strict";

const $smithInvSlots = $("#smithInvSlots");
const $smithOriginal = $("#smithOriginal");
const $smithImproved = $("#smithImproved");
const $smithMax = $("#smithMax");
const $smithConfirm = $("#smithConfirm");
const $smithCanImproveDiv = $("#smithCanImproveDiv");
const $smithCantImproveDiv = $("#smithCantImproveDiv");
const $smithNoSelectionDiv = $("#smithNoSelectionDiv");

const bloopSmith = {
    smithStage : null,
    lvl : 1,
    createSave() {
        const save = {};
        save.lvl = this.lvl;
        return save;
    },
    loadSave(save) {
        if (save.lvl !== undefined) this.lvl = save.lvl;
    },
    addSmith(containerID) {
        const item = Inventory.containerToItem(containerID);
        if (item.sharp >= this.maxSharp()) return;
        this.smithStage = item;
        refreshSmithStage();
    },
    getSmithCost() {
        const item = bloopSmith.smithStage;
        return {"gold":Math.floor(item.goldValue()*miscLoadedValues.smithChance[item.sharp]),"resType":item.material(),"resAmt":(item.sharp+1)*100};
    },
    smith() {
        if (this.smithStage === null) return;
        const params = this.getSmithCost();
        if (ResourceManager.materialAvailable("M001") < params.gold) {
            Notifications.cantAffordSmithGold();
            return;
        }
        if (ResourceManager.materialAvailable(params.resType) < params.resAmt) {
            Notifications.cantAffordSmithMaterials(ResourceManager.idToMaterial(params.resType).name, params.resAmt-ResourceManager.materialAvailable(params.resType));
            return;
        }
        ResourceManager.deductMoney(params.gold);
        ResourceManager.addMaterial(params.resType,-params.resAmt);
        this.smithStage.sharp += 1;
        Notifications.smithSuccess(this.smithStage.name);
        refreshInventoryPlaces();
        refreshSmithStage();
    },
    maxSharp() {
        if (this.lvl === 1) return 3;
        if (this.lvl === 2) return 6;
        return 10;
    },
    canImprove() {
        return this.smithStage.sharp < this.maxSharp();
    }
}

function initiateSmithBldg() {
    $smithBuilding.show();
    bloopSmith.smithStage = null;
    refreshSmithInventory();
    refreshSmithStage();
}

function refreshSmithInventory() {
    $smithInvSlots.empty();
    const items = Inventory.nonblank().filter(i=>i.sharp < bloopSmith.maxSharp() && i.item.recipeType === "normal");
    if (items.length === 0) {
        $("<div/>").addClass("smithInvBlank").html("No Items in Inventory").appendTo($smithInvSlots);
        return;
    }
    items.forEach(item => {
        $smithInvSlots.append(itemCardSmith(item));
    });
}

function refreshSmithStage() {
    if (bloopSmith.smithStage === null) {
        $smithNoSelectionDiv.show();
        $smithCanImproveDiv.hide();
        $smithCantImproveDiv.hide();
        return;
    };
    if (!bloopSmith.canImprove()) {
        $smithCanImproveDiv.hide();
        $smithCantImproveDiv.show();
        $smithNoSelectionDiv.hide();
        $smithMax.html(itemStageCardSmith(bloopSmith.smithStage,false));
        return;
    }
    $smithCanImproveDiv.show();
    $smithCantImproveDiv.hide();
    $smithNoSelectionDiv.hide();
    $smithOriginal.html(itemStageCardSmith(bloopSmith.smithStage,false));
    $smithImproved.html(itemStageCardSmith(bloopSmith.smithStage,true));
    const params = bloopSmith.getSmithCost()
    const improveText = $("<div/>").addClass("improveText").html(`Improve for`);
    const improveCost = $("<div/>").addClass("improveCostContainer");
        $("<div/>").addClass("improveCost tooltip").attr("data-tooltip",`${params.gold} Gold`).html(`${miscIcons.gold} ${params.gold}`).appendTo(improveCost);
        $("<div/>").addClass("improveCost tooltip").attr("data-tooltip",`${ResourceManager.idToMaterial(params.resType).name}`).html(`${ResourceManager.idToMaterial(params.resType).img} ${params.resAmt}`).appendTo(improveCost);
    $smithConfirm.empty().append(improveText,improveCost);
}

function itemCardSmith(item) {
    const itemdiv = $("<div/>").addClass("smithItem").addClass("R"+item.rarity);
        $("<div/>").addClass("smithItemName").html(item.picName()).appendTo(itemdiv);
        $("<div/>").addClass("smithItemLevel").html(item.itemLevel()).appendTo(itemdiv);
        const itemProps = $("<div/>").addClass("smithProps").appendTo(itemdiv);
        for (const [stat, val] of Object.entries(item.itemStat(false))) {
            if (val === 0) continue;
            $("<div/>").addClass("invPropStat tooltip").attr("data-tooltip",stat).html(`${miscIcons[stat]} ${val}`).appendTo(itemProps);
        }
        $("<div/>").addClass("smithStage").attr("containerID",item.containerID).html("Smith").appendTo(itemdiv);
    return itemdiv;
}

function itemStageCardSmith(slot,upgrade) {
    if (slot === null) return;
    const itemdiv = $("<div/>").addClass("smithItem").addClass("R"+slot.rarity);
    const itemName = $("<div/>").addClass("smithItemName");
    if (upgrade) itemName.html(slot.picNamePlus());
    else itemName.html(slot.picName());
    const itemLevel = $("<div/>").addClass("smithItemLevel").html(slot.itemLevel());
    const itemProps = $("<div/>").addClass("smithProps");
    const d = $("<div/>").addClass("invProp").appendTo(itemProps);
    for (const [stat, val] of Object.entries(slot.itemStat(upgrade))) {
        if (val === 0) continue;
        $("<div/>").addClass("invPropStat tooltip").attr("data-tooltip",stat).html(`${miscIcons[stat]} ${val}`).appendTo(d);
    }
    return itemdiv.append(itemName,itemLevel,itemProps);
}

$(document).on("click",".smithStage",(e) => {
    e.preventDefault();
    const containerID = parseInt($(e.target).attr("containerID"));
    bloopSmith.addSmith(containerID);
    refreshSmithStage();
});

$(document).on("click","#smithConfirm",(e) => {
    e.preventDefault();
    bloopSmith.smith();
})