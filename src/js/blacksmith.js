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
        if (item.sharp >= this.maxSharp()) return Notifications.popToast("cant_smith_max");
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
            Notifications.popToast("cant_afford_smith_gold");
            return;
        }
        if (ResourceManager.materialAvailable(params.resType) < params.resAmt) {
            Notifications.popToast("cant_afford_smith_material",ResourceManager.idToMaterial(params.resType).name, params.resAmt-ResourceManager.materialAvailable(params.resType));
            return;
        }
        ResourceManager.deductMoney(params.gold);
        ResourceManager.addMaterial(params.resType,-params.resAmt);
        this.smithStage.sharp += 1;
        Notifications.popToast("smith_success",this.smithStage.name);
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
    },
    removeSmith() {
        this.smithStage = null;
    }
}
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
    // Forge Inventory Header
    const forgeInvHeader = $("<div/>").addClass(`contentHeader`).appendTo($smithInvSlots);
    const forgeInvHeadingDetails = $("<div/>").addClass("headingDetails").appendTo(forgeInvHeader);
        $("<div/>").addClass("headingTitle").html(displayText("header_forge_inventory_title")).appendTo(forgeInvHeadingDetails);
        $("<div/>").addClass("headingDescription").html(displayText("header_forge_inventory_desc")).appendTo(forgeInvHeadingDetails);
    // Empty Inventory Message
    if (invItems.length === 0) {
        $("<div/>").addClass("emptyContentMessage").html(displayText('forge_inventory_empty')).appendTo($smithInvSlots);
    }
    // Forge Inventory Cards
    else {
        const smithCardsContainer = $("<div/>").addClass("smithCardsContainer").appendTo($smithInvSlots);
        invItems.forEach(item => {
            smithCardsContainer.append(itemCardSmith(item,"inventory"));
        });
    }
    // Forge Heroes Header
    const forgeHeroesHeader = $("<div/>").addClass(`contentHeader`).appendTo($smithHeroSlots);
    const forgeHeroesHeadingDetails = $("<div/>").addClass("headingDetails").appendTo(forgeHeroesHeader);
        $("<div/>").addClass("headingTitle").html(displayText("header_forge_heroes_title")).appendTo(forgeHeroesHeadingDetails);
        $("<div/>").addClass("headingDescription").html(displayText("header_forge_heroes_desc")).appendTo(forgeHeroesHeadingDetails);
    // Forge Heroes Cards
    const forgeHeroActions = $("<div/>").addClass("forgeHeroActions").appendTo($smithHeroSlots);
    const smithHeroesContainer = $("<div/>").addClass("smithHeroesContainer").appendTo($smithHeroSlots);
    if (bloopSmith.heroView === null) {
        HeroManager.heroes.filter(hero=>hero.owned).forEach(hero => {
            const heroButton = $("<div/>").addClass("smithHeroButton").data("heroID",hero.id).appendTo(smithHeroesContainer);
                $("<div/>").addClass('smithHeroButtonImage').html(`${hero.portrait}`).appendTo(heroButton);
                $("<div/>").addClass('smithHeroButtonName').html(`${hero.name}`).appendTo(heroButton);
        })
    }
    else {
        const hero = HeroManager.idToHero(bloopSmith.heroView);
        // Hero Selected Actions
        const smithBackButton = $("<div/>").addClass("actionButton smithHeroBackButton").html(`<i class="fas fa-arrow-left">`).appendTo(forgeHeroActions);
            $("<div/>").addClass("actionButtonTextRight").html(displayText('forge_heroes_back_button')).appendTo(smithBackButton);
        const smithHeroBrowsing = $("<div/>").addClass("smithHeroBrowsing").appendTo(forgeHeroActions);
            const heroBrowseCard = $("<div/>").addClass("heroBrowseCard").appendTo(smithHeroBrowsing);
                $("<div/>").addClass("heroBrowseImage").html(hero.portrait).appendTo(heroBrowseCard);
                $("<div/>").addClass("heroBrowseName").html(displayText('forge_heroes_browsing').replace('{0}', hero.name)).appendTo(heroBrowseCard);
        // Hero Selected Equipment
        if (hero.getEquipSlots(true).length === 0) { 
            $("<div/>").addClass("emptyContentMessage").html(displayText('forge_heroes_empty')).appendTo($smithHeroSlots);
        }
        hero.getEquipSlots(true).forEach(gear => {
            if (gear.isTrinket()) return;
            smithHeroesContainer.append(itemCardSmith(gear,"gear"));
        })
    }
};

function refreshSmithStage() {
    if (bloopSmith.smithStage !== null && !Inventory.hasContainer(bloopSmith.smithStage.containerID) && !HeroManager.hasContainer(bloopSmith.smithStage.containerID)) {
        bloopSmith.smithStage = null;
    }
    if (bloopSmith.smithStage === null) {
        $smithNoSelectionDiv.empty();
        const d = $("<div/>").addClass("smithSeparatorEmpty").html('<i class="fas fa-arrow-right"></i>');
        const d1 = $("<div/>").addClass("smithConfirmEmpty").appendTo(d);
                $("<div/>").addClass("actionButtonCardText").appendTo(d1);
                $("<div/>").addClass("actionButtonCardValue").appendTo(d1);
                $("<div/>").addClass("actionButtonCardValue").appendTo(d1);
        $smithNoSelectionDiv.append(itemCardSmith(null),d,itemCardSmith(null)).show();
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
    const improveText = $("<div/>").addClass("actionButtonCardText").html(displayText('forge_smith_confirm_button'));
    const improveCost = $("<div/>").addClass("improveCostContainer");
        $("<div/>").addClass("actionButtonCardValue tooltip").attr({"data-tooltip": "gold_value", "data-tooltip-value": params.gold}).html(`${miscIcons.gold} ${formatToUnits(params.gold,2)}`).appendTo(improveCost);
        $("<div/>").addClass("actionButtonCardValue tooltip").attr({"data-tooltip":"material_desc","data-tooltip-value": params.resType}).html(`${ResourceManager.idToMaterial(params.resType).img} ${params.resAmt}`).appendTo(improveCost);
    $smithConfirm.empty().append(improveText,improveCost);
}

function itemCardSmith(item,location) {
    if (!item) {
        const itemdiv = $("<div/>").addClass("smithItem emptySmithItem");
            const d = $("<div/>").addClass("emptySmithItem itemName").appendTo(itemdiv);
                $("<div/>").addClass("emptySmithItemIcon").html(miscIcons.emptySlot).appendTo(d);
                $("<div/>").addClass("emptySmithItemTitle").html(displayText('forge_smith_slot_empty')).appendTo(d);
            $("<div/>").addClass("itemLevel").appendTo(itemdiv);
            $("<div/>").addClass("itemRarity").appendTo(itemdiv);
            $("<div/>").addClass("gearStat").html("<span/>").appendTo(itemdiv);
        return itemdiv;
    }
    const itemdiv = $("<div/>").addClass("smithItem").addClass("R"+item.rarity);
        $("<div/>").addClass("itemName").html(item.picName()).appendTo(itemdiv);
        $("<div/>").addClass("itemLevel").html(item.itemLevel()).appendTo(itemdiv);
        $("<div/>").addClass(`itemRarity RT${item.rarity} tooltip`).attr({"data-tooltip": `rarity_${rarities[item.rarity].toLowerCase()}`}).html(miscIcons.rarity).appendTo(itemdiv);
        $("<div/>").addClass("smithItemMaterial tooltip").attr({"data-tooltip":"material_desc","data-tooltip-value":item.material()}).html(ResourceManager.materialIcon(item.material())).appendTo(itemdiv);
        const equipStats = $("<div/>").addClass("equipStats").appendTo(itemdiv);
        for (const [stat, val] of Object.entries(item.itemStat(false))) {
            if (val === 0) continue;
            const ed = $("<div/>").addClass('gearStat tooltip').attr({"data-tooltip": stat}).appendTo(equipStats);
                $("<div/>").addClass(`${stat}_img`).html(miscIcons[stat]).appendTo(ed);
                $("<div/>").addClass(`${stat}_integer statValue`).html(val).appendTo(ed);
        }
        const smithButtons = $("<div/>").addClass("smithButtons").appendTo(itemdiv);
            $("<div/>").addClass("actionButtonCard smithStage").attr("containerID",item.containerID).data("location",location).html(displayText("forge_inventory_assign_button")).appendTo(smithButtons);
    return itemdiv;
}

function itemStageCardSmith(slot,upgrade) {
    if (slot === null) return;
    const itemdiv = $("<div/>").addClass("smithItem").addClass("R"+slot.rarity);
    const itemName = $("<div/>").addClass("itemName");
    if (upgrade) itemName.html(slot.picNamePlus());
    else itemName.html(slot.picName());
    const itemLevel = $("<div/>").addClass("itemLevel").html(slot.itemLevel());
    const itemRarity = $("<div/>").addClass(`itemRarity RT${slot.rarity} tooltip`).attr({"data-tooltip": `rarity_${rarities[slot.rarity].toLowerCase()}`}).html(miscIcons.rarity);
    const itemMaterial = $("<div/>").addClass("smithItemMaterial tooltip").attr({"data-tooltip":"material_desc","data-tooltip-value":slot.material()}).html(ResourceManager.materialIcon(slot.material()));
    const smithClose = $("<div/>").addClass("smithClose tooltip").attr({'data-tooltip': 'forge_remove'}).html(`<i class="fas fa-times"></i>`);
    if (upgrade) smithClose.hide();
    const equipStats = $("<div/>").addClass("equipStats");
    for (const [stat, val] of Object.entries(slot.itemStat(upgrade))) {
        if (val === 0) continue;
        const ed = $("<div/>").addClass('gearStat tooltip').attr({"data-tooltip": stat}).appendTo(equipStats);
            $("<div/>").addClass(`${stat}_img`).html(miscIcons[stat]).appendTo(ed);
            $("<div/>").addClass(`${stat}_integer statValue`).html(val).appendTo(ed);
    }
    return itemdiv.append(itemName,itemLevel,itemRarity,itemMaterial,smithClose,equipStats);
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

$(document).on("click",".smithHeroBackButton",() => {
    bloopSmith.heroView = null;
    refreshSmithInventory();
});

$(document).on("click",".smithClose",(e) => {
    e.preventDefault();
    bloopSmith.removeSmith();
    refreshSmithStage();
    destroyTooltip();
});