"use strict";

const $fortuneBuilding = $("#fortuneBuilding");

let fortuneSlotid = 0;

class fortuneSlot {
    constructor(container) {
        this.container = container;
        this.type = container.item.type;
        this.rarity = container.rarity;
        this.lvl = container.item.lvl;
        this.slotid = fortuneSlotid;
        this.state = "unlocked";
        if (container.rarity === 0) this.amt = 20;
        else if (container.rarity === 1) this.amt = 50;
        else if (container.rarity === 2) this.amt = 100;
        fortuneSlotid += 1;
    }
    createSave() {
        const save = {};
        save.container = this.container.createSave();
        save.type = this.type;
        save.rarity = this.rarity;
        save.lvl = this.lvl;
        save.amt = this.amt;
        save.state = this.state;
        return save;
    }
    loadSave(save) {
        this.type = save.type;
        this.rarity = save.rarity;
        this.lvl = save.lvl;
        const newContainer = new itemContainer(save.container.id,save.container.rarity);
        newContainer.loadSave(save.container);
        this.container = newContainer;
        this.state = save.state;
        this.amt = save.amt;
    }
    lockFortune() {
        this.state = "locked";
        this.rarity += 1;
    }
    locked() {
        return this.state === "locked";
    }
    picName() {
        return this.container.picName();
    }
    material() {
        return this.container.material();
    }
    itemLevel() {
        return this.container.itemLevel();
    }
}

const FortuneManager = {
    slots : [],
    lvl : 1,
    createSave() {
        const save = {};
        save.lvl = this.lvl;
        save.slots = [];
        this.slots.forEach(slot => {
            const saveSlot = slot.createSave();
            save.slots.push(saveSlot);
        });
        return save;
    },
    loadSave(save) {
        save.slots.forEach(slot => {
            const container = new itemContainer(slot.container.id,slot.container.rarity);
            container.loadSave(container);
            const saveSlot = new fortuneSlot(container);
            saveSlot.loadSave(slot);
            this.slots.push(saveSlot);
        });
        this.lvl = save.lvl;
    },
    stageItem(containerID) {
        if (this.slots.length >= this.maxSlot()) {
            Notifications.fortuneNoSlot();
            return;
        }
        const container = Inventory.containerToItem(containerID);
        if (container === undefined) return;
        const newfortuneSlot = new fortuneSlot(container);
        this.slots.push(newfortuneSlot);
        Inventory.removeContainerFromInventory(containerID);
        refreshFortuneSlots();
    },
    fortuneByID(fortuneID) {
        return this.slots.find(f=>f.slotid == fortuneID);
    },
    removeFortune(fortuneID) {
        if (Inventory.full()) {
            Notifications.fortuneInvFull();
            return;
        }
        const fortune = this.fortuneByID(fortuneID);
        Inventory.addToInventory(fortune.container);
        this.slots = this.slots.filter(f=>f.slotid !== fortuneID);
        refreshFortuneSlots();
    },
    removeLockedFortune(fortuneID) {
        this.slots = this.slots.filter(f=>f.slotid !== fortuneID);
        refreshFortuneSlots();
    },
    lockFortune(fortuneID) {
        const fortune = this.fortuneByID(fortuneID);
        fortune.lockFortune();
        refreshFortuneSlots();
    },
    emptySlotCount() {
        return this.maxSlot() - this.slots.length;
    },
    getMaterialCost(slot) {
        if (slot === null) return null;
        return {id:slot.material(),amt:20};
    },
    getProcModifier(line,tier) {
        const modifier = [1,1,1];
        const mods = this.slots.filter(s=>s.type === line && s.lvl === tier);
        mods.forEach(s => {
            modifier[s.rarity-1] = 2;
            s.amt -= 1;
        });
        if (this.slots.some(f=>f.amt <= 0)) this.purgeDone();
        refreshFortuneSlots();
        return modifier;
    },
    maxSlot() {
        return this.lvl;
    },
    purgeDone() {
        this.slots = this.slots.filter(f => f.amt > 0);
        refreshFortuneSlots();
    },
    addLevel() {
        this.lvl += 1;
        refreshFortuneSlots();
    }
}

const $fortuneStage = $("#fortuneStage");
const $fortuneGear = $("#fortuneGear");
const $fortuneHeading = $("#fortuneHeading");

function initiateFortuneBldg () {
    $fortuneBuilding.show();
    refreshFortuneSlots();
    generateFortuneHeader();
    refreshFortuneGear();
}

function generateFortuneHeader() {
    $fortuneHeading.empty();
    const fortuneOfferingsHeader = $("<div/>").addClass(`contentHeader`).appendTo($fortuneHeading);
    const headingDetails = $("<div/>").addClass("headingDetails").appendTo(fortuneOfferingsHeader);
        $("<div/>").addClass("headingTitle").html(displayText("header_fortune_possible_title")).appendTo(headingDetails);
        $("<div/>").addClass("headingDescription").html(displayText("header_fortune_possible_desc")).appendTo(headingDetails);
}

function refreshFortuneSlots() {
    $fortuneStage.empty();
    FortuneManager.slots.forEach(slot => {
        if (slot.locked()) $fortuneStage.append(createFortuneCardLocked(slot));
        else $fortuneStage.append(createFortuneCard(slot));
    });
    for (let i=0;i<FortuneManager.emptySlotCount();i++) {
        $fortuneStage.append(createFortuneBlank());
    }
}

function refreshFortuneGear() {
    $fortuneGear.empty();
    if (Inventory.nonEpic().length === 0) {
        $("<div/>").addClass("emptyContentMessage").html(displayText("fortune_possible_empty")).appendTo($fortuneGear);
        return;
    }
    const fortuneCardsContainer = $("<div/>").addClass("fortuneCardsContainer").appendTo($fortuneGear);
    Inventory.nonEpic().forEach(container => {
        fortuneCardsContainer.append(createFortuneInv(container));
    });
}

function createFortuneInv(item) {
    const itemdiv = $("<div/>").addClass("fortuneItem").addClass("R"+item.rarity);
    const itemName = $("<div/>").addClass("itemName").html(item.picName());
    const itemLevel = $("<div/>").addClass("itemLevel").html(item.itemLevel());
    const itemRarity = $("<div/>").addClass(`itemRarity RT${item.rarity} tooltip`).attr({"data-tooltip": `rarity_${rarities[item.rarity].toLowerCase()}`}).html(miscIcons.rarity);
    const fortuneButton = $("<div/>").addClass("actionButtonCard fortuneStage").attr("containerID",item.containerID).html(displayText('fortune_possible_assign_button'));
    return itemdiv.append(itemName,itemLevel,itemRarity,fortuneButton);
}

function createFortuneCard(slot) {
    const rarity = ["Common","Good","Great","Epic"];
    const itemdiv = $("<div/>").addClass("fortuneSlot").addClass("R"+slot.rarity);
        $("<div/>").addClass("itemName").html(slot.picName()).appendTo(itemdiv);
        $("<div/>").addClass("itemLevel").html(slot.itemLevel()).appendTo(itemdiv);
        $("<div/>").addClass(`itemRarity RT${slot.rarity} tooltip`).attr({"data-tooltip": `rarity_${rarities[slot.rarity].toLowerCase()}`}).html(miscIcons.rarity).appendTo(itemdiv);
    const rarityBonus = displayText('fortune_slot_rarity_chance').replace('{0}', '100%').replace('{1}', rarity[slot.rarity+1]);
    $("<div/>").addClass("fortuneItemDesc").html(rarityBonus).appendTo(itemdiv);
    const cost = FortuneManager.getMaterialCost(slot);
    const sacContainer = $("<div/>").addClass("actionButtonCardCost fortuneItemSac").data("fortuneID",slot.slotid).appendTo(itemdiv);
        $("<div/>").addClass("actionButtonCardText").html(displayText('fortune_slot_confirm_button')).appendTo(sacContainer);
        $("<div/>").addClass("actionButtonCardValue tooltip").attr({"data-tooltip":"material_desc","data-tooltip-value":cost.id}).html(`${ResourceManager.idToMaterial(cost.id).img} ${cost.amt}`).appendTo(sacContainer);
    $('<div/>').addClass("fortuneItemClose tooltip").attr({"data-tooltip": "offering_remove"}).data("fortuneID",slot.slotid).html(`<i class="fas fa-times"></i>`).appendTo(itemdiv);
    return itemdiv;
}

function createFortuneCardLocked(slot) {
    const rarity = ["Common","Good","Great","Epic"];
    const itemdiv = $("<div/>").addClass("fortuneSlot").addClass("R"+(slot.rarity));
        $("<div/>").addClass("itemName").html(slot.picName()).appendTo(itemdiv);
        $("<div/>").addClass("itemLevel").html(slot.itemLevel()).appendTo(itemdiv);
        $("<div/>").addClass(`itemRarity RT${slot.rarity} tooltip`).attr({"data-tooltip": `rarity_${rarities[slot.rarity].toLowerCase()}`}).html(miscIcons.rarity).appendTo(itemdiv);
    const rarityBonus = displayText('fortune_slot_rarity_chance').replace('{0}', '100%').replace('{1}', rarity[slot.rarity]);
    $("<div/>").addClass("fortuneItemDesc").html(rarityBonus).appendTo(itemdiv);
    $("<div/>").addClass("fortuneItemAmt").html(displayText('fortune_slot_crafts_remaining').replace('{0}',slot.amt)).appendTo(itemdiv);
    $('<div/>').addClass("fortuneItemSetClose tooltip").attr({"data-tooltip": "fortune_remove"}).data("fortuneID",slot.slotid).html(`<i class="fas fa-times"></i>`).appendTo(itemdiv);
    return itemdiv;
}

function createFortuneBlank() {
    const itemdiv = $("<div/>").addClass("fortuneSlot fortuneSlotEmpty");
        const itemName = $("<div/>").addClass("itemName").appendTo(itemdiv);
            $("<div/>").addClass("fortuneSlotNameIcon").html(miscIcons.emptySlot).appendTo(itemName)
            $("<div/>").addClass("fortuneSlotNameTitle").html(displayText("fortune_slot_empty")).appendTo(itemName)
        $("<div/>").addClass("itemLevel").appendTo(itemdiv);
        $("<div/>").addClass(`itemRarity`).appendTo(itemdiv);
    const actionButton = $("<div/>").addClass("actionButtonCardCost").appendTo(itemdiv);
        $("<div/>").addClass("actionButtonCardText").appendTo(actionButton);
        $("<div/>").addClass("actionButtonCardValue").appendTo(actionButton);
    return itemdiv;
}


$(document).on('click', '.fortuneStage', (e) => {
    e.preventDefault();
    const containerID = parseInt($(e.currentTarget).attr("containerID"));
    FortuneManager.stageItem(containerID);
    refreshFortuneSlots();
});

$(document).on('click', '.fortuneItemSac', (e) => {
    e.preventDefault();
    destroyTooltip();
    const fortuneID = parseInt($(e.currentTarget).data("fortuneID"));
    FortuneManager.lockFortune(fortuneID);
    refreshFortuneSlots();
})

$(document).on('click', '.fortuneItemClose', (e) => {
    e.preventDefault();
    const fortuneID = parseInt($(e.currentTarget).data("fortuneID"));
    FortuneManager.removeFortune(fortuneID);
    refreshFortuneSlots();
    destroyTooltip();
});

$(document).on('click', '.fortuneItemSetClose', (e) => {
    e.preventDefault();
    const fortuneID = parseInt($(e.currentTarget).data("fortuneID"));
    FortuneManager.removeLockedFortune(fortuneID);
    refreshFortuneSlots();
    destroyTooltip();
});