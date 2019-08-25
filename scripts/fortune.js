"use strict";

let fortuneSlotid = 0;

class fortuneSlot {
    constructor(container) {
        this.container = container;
        this.type = container.item.type;
        this.rarity = container.rarity;
        this.lvl = container.item.lvl;
        this.slotid = fortuneSlotid;
        this.state = "unlocked";
        this.amt = 20;
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
        }
        const fortune = this.fortuneByID(fortuneID);
        console.log(fortune,fortuneID);
        Inventory.addItemContainerToInventory(fortune.container);
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
        const mods = this.slots.filter(s=>s.type === line && s.lvl === tier)
        console.log(mods);
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
    }
}

const $fortuneStage = $("#fortuneStage");
const $fortuneGear = $("#fortuneGear");

function initiateFortuneBldg () {
    $fortuneBuilding.show();
    refreshFortuneSlots();
    refreshFortuneGear();
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
    Inventory.nonEpic().forEach(container => {
        $fortuneGear.append(createFortuneInv(container));
    });
}

function createFortuneInv(item) {
    const itemdiv = $("<div/>").addClass("fortuneItem").addClass("R"+item.rarity);
    const itemName = $("<div/>").addClass("fortuneItemName").html(item.picName());
    const itemLevel = $("<div/>").addClass("fortuneItemLevel").html(item.itemLevel());
    const fortuneButton = $("<div/>").addClass("fortuneStage").attr("containerID",item.containerID).html("Offer");
    return itemdiv.append(itemName,itemLevel,fortuneButton);
}

function createFortuneCard(slot) {
    const rarity = ["Common","Good","Great","Epic"];
    const itemdiv = $("<div/>").addClass("fortuneSlot").addClass("R"+slot.rarity);
        $("<div/>").addClass("fortuneItemName").html(slot.picName()).appendTo(itemdiv);
        $("<div/>").addClass("fortuneItemLevel").html(slot.itemLevel()).appendTo(itemdiv);
    $("<div/>").addClass("fortuneItemDesc").html(`2x ${rarity[slot.rarity+1]} Chance`).appendTo(itemdiv);
    const cost = FortuneManager.getMaterialCost(slot);
    $("<div/>").addClass("fortuneItemSac").data("fortuneID",slot.slotid).html(`Sacrifice for ${ResourceManager.idToMaterial(cost.id).img} ${cost.amt}`).appendTo(itemdiv);
    $('<div/>').addClass("fortuneItemClose").data("fortuneID",slot.slotid).html(`<i class="fas fa-times"></i>`).appendTo(itemdiv);
    return itemdiv;
}

function createFortuneCardLocked(slot) {
    const rarity = ["Common","Good","Great","Epic"];
    const itemdiv = $("<div/>").addClass("fortuneSlot").addClass("R"+(slot.rarity));
        $("<div/>").addClass("fortuneItemName").html(slot.picName()).appendTo(itemdiv);
        $("<div/>").addClass("fortuneItemLevel").html(slot.itemLevel()).appendTo(itemdiv);
    $("<div/>").addClass("fortuneItemDesc").html(`2x ${rarity[slot.rarity]} Chance`).appendTo(itemdiv);
    $("<div/>").addClass("fortuneItemAmt").html(`${slot.amt} Crafts Left`).appendTo(itemdiv);
    return itemdiv;
}

function createFortuneBlank() {
    const itemdiv = $("<div/>").addClass("fortuneSlot");
        $("<div/>").addClass("fortuneSlotEmpty").html("Fortune Available").appendTo(itemdiv);
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
    const fortuneID = parseInt($(e.currentTarget).data("fortuneID"));
    FortuneManager.lockFortune(fortuneID);
    refreshFortuneSlots();
})

$(document).on('click', '.fortuneItemClose', (e) => {
    e.preventDefault();
    const fortuneID = parseInt($(e.currentTarget).data("fortuneID"));
    FortuneManager.removeFortune(fortuneID);
    refreshFortuneSlots();
});