"use strict";

const $smithBuilding = $("#smithBuilding");
const $smithInvSlots = $("#smithInvSlots");
const $smithOriginal = $("#smithOriginal");
const $smithImproved = $("#smithImproved");
const $smithMax = $("#smithMax");
const $smithConfirm = $("#smithConfirm");
const $smithCanImproveDiv = $("#smithCanImproveDiv");
const $smithCantImproveDiv = $("#smithCantImproveDiv");
const $smithNoSelectionDiv = $("#smithNoSelectionDiv");
const $smithHeroSlots= $("#smithHeroSlots");

const bloopSmith = {
    smithStage : null,
    lvl : 1,
    heroView : null,
    createSave() {
        const save = {};
        save.lvl = this.lvl;
        return save;
    },
    loadSave(save) {
        if (save.lvl !== undefined) this.lvl = save.lvl;
    },
    addSmith(containerID,location) {
        const item = (location === "inventory") ? Inventory.containerToItem(containerID) : HeroManager.getContainerID(containerID);
        if (item.sharp >= this.maxSharp()) return Notifications.cantSmithMax();
        this.smithStage = item;
        refreshSmithStage();
    },
    getSmithCost() {
        const item = bloopSmith.smithStage;
        const amt = [25,50,75,100,150,200,250,300,400,500];
        return {"gold":Math.floor(item.goldValue()*miscLoadedValues.smithChance[item.sharp]),"resType":item.material(),"resAmt":amt[item.sharp]};
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
    },
    addLevel() {
        this.lvl += 1;
        refreshSmithInventory();
        refreshSmithStage();
    }
}
console.log("yes")
function initiateForgeBldg() {
    $smithBuilding.show();
    bloopSmith.smithStage = null;
    bloopSmith.heroView = null;
    refreshSmithInventory();
    refreshSmithStage();
}

function refreshSmithInventory() {
    $smithInvSlots.empty();
    $smithHeroSlots.empty();
    const invItems = Inventory.nonblank().filter(i=>i.sharp < bloopSmith.maxSharp() && i.item.recipeType === "normal");
    if (invItems.length === 0) {
        $("<div/>").addClass("smithInvBlank").html("No Items in Inventory").appendTo($smithInvSlots);
    }
    else {
        invItems.forEach(item => {
            $smithInvSlots.append(itemCardSmith(item,"inventory",""));
        });
    }
    if (bloopSmith.heroView === null) {
        HeroManager.heroes.filter(hero=>hero.owned).forEach(hero => {
            const heroButton = $("<div/>").addClass("smithHeroButton").data("heroID",hero.id).html(`${hero.head}`).appendTo($smithHeroSlots);
                $("<div/>").addClass('smithHeroButtonName').html(`${hero.name}`).appendTo(heroButton);
        })
    }
    else {
        const smithBackButton = $("<div/>").addClass("smithActionsContainer").appendTo($smithHeroSlots)
            $("<div/>").addClass("smithHeroButton smithHeroBackButton").data("heroID",null).html(`<i class="fas fa-arrow-left"></i> Select a different Hero`).appendTo(smithBackButton);
        const hero = HeroManager.idToHero(bloopSmith.heroView);
        hero.getEquipSlots(true).forEach(gear => {
            if (gear.isTrinket()) return;
            $smithHeroSlots.append(itemCardSmith(gear,"gear",`Equipped to ${hero.name}`));
        })
    }
};

function refreshSmithStage() {
    if (bloopSmith.smithStage !== null && !Inventory.hasContainer(bloopSmith.smithStage.containerID) && !HeroManager.hasContainer(bloopSmith.smithStage.containerID)) {
        bloopSmith.smithStage = null;
    }
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
        $("<div/>").addClass("improveCost tooltip").attr({"data-tooltip": "gold_value", "data-tooltip-value": params.gold}).html(`${miscIcons.gold} ${formatToUnits(params.gold,2)}`).appendTo(improveCost);
        $("<div/>").addClass("improveCost tooltip").attr({"data-tooltip":"material_desc","data-tooltip-value": params.resType}).html(`${ResourceManager.idToMaterial(params.resType).img} ${params.resAmt}`).appendTo(improveCost);
    $smithConfirm.empty().append(improveText,improveCost);
}

function itemCardSmith(item,location,locationText) {
    const itemdiv = $("<div/>").addClass("smithItem").addClass("R"+item.rarity);
        $("<div/>").addClass("smithItemName itemName").html(item.picName()).appendTo(itemdiv);
        $("<div/>").addClass("smithItemLevel").html(item.itemLevel()).appendTo(itemdiv);
        $("<div/>").addClass("smithItemMaterial tooltip").attr({"data-tooltip":"material_desc","data-tooltip-value":item.material()}).html(ResourceManager.materialIcon(item.material())).appendTo(itemdiv);
        const itemProps = $("<div/>").addClass("smithProps").appendTo(itemdiv);
        for (const [stat, val] of Object.entries(item.itemStat(false))) {
            if (val === 0) continue;
            $("<div/>").addClass("invPropStat tooltip").attr("data-tooltip", stat).html(`${miscIcons[stat]} ${val}`).appendTo(itemProps);
        }
        if (locationText !== "") $("<div/>").addClass("smithItemLocation").html(locationText).appendTo(itemdiv);
        $("<div/>").addClass("smithStage").attr("containerID",item.containerID).data("location",location).html("Smith").appendTo(itemdiv);
    return itemdiv;
}

function itemStageCardSmith(slot,upgrade) {
    if (slot === null) return;
    const itemdiv = $("<div/>").addClass("smithItem").addClass("R"+slot.rarity);
    const itemName = $("<div/>").addClass("smithItemName itemName");
    if (upgrade) itemName.html(slot.picNamePlus());
    else itemName.html(slot.picName());
    const itemLevel = $("<div/>").addClass("smithItemLevel").html(slot.itemLevel());
    const itemMaterial = $("<div/>").addClass("smithItemMaterial tooltip").attr({"data-tooltip":"material_desc","data-tooltip-value":slot.material()}).html(ResourceManager.materialIcon(slot.material()));
    const itemProps = $("<div/>").addClass("smithProps");
    const d = $("<div/>").addClass("invProp").appendTo(itemProps);
    for (const [stat, val] of Object.entries(slot.itemStat(upgrade))) {
        if (val === 0) continue;
        $("<div/>").addClass("invPropStat tooltip").attr("data-tooltip", stat).html(`${miscIcons[stat]} ${val}`).appendTo(d);
    }
    return itemdiv.append(itemName,itemLevel,itemMaterial,itemProps);
}

$(document).on("click",".smithStage",(e) => {
    e.preventDefault();
    const containerID = parseInt($(e.target).attr("containerID"));
    const location = $(e.target).data("location");
    bloopSmith.addSmith(containerID,location);
    refreshSmithStage();
});

$(document).on("click","#smithConfirm",(e) => {
    e.preventDefault();
    destroyTooltip();
    bloopSmith.smith();
});

$(document).on("click",".smithHeroButton",(e) => {
    const heroID = $(e.currentTarget).data("heroID");
    bloopSmith.heroView = heroID;
    refreshSmithInventory();
});