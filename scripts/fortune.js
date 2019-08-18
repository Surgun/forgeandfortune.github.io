"use strict";

const $fortuneStatus = $("#fortuneStatus");
const $fortuneWeek = $("#fortuneWeek");
const $fortuneStart = $("#fortuneStart");

let fortuneSlotid = 0;

class fortuneSlot {
    constructor(line, rarity, tier, amt) {
        this.line = line;
        this.rarity = rarity;
        this.tier = tier;
        this.amt = amt;
        this.slotid = fortuneSlotid;
        fortuneSlotid += 1;
    }
    createSave() {
        const save = {};
        save.line = this.line;
        save.rarity = this.rarity;
        save.tier = this.tier;
        save.amt = this.amt;
        return save;
    }
    loadSave(save) {
        return;
    }
    subtractCraft() {
        this.amt -= 1;
    }
}

const FortuneManager = {
    stage : null,
    slots : [],
    maxSlot : 1,
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
            const saveSlot = new fortuneSlot(slot.itemid, slot.rarity, slot.tier, slot.amt);
            saveSlot.loadSave(slot);
            this.slots.push(saveSlot);
        });
        if (save.lvl !== undefined) this.lvl = save.lvl;
    },
    stageItem(containerID) {
        const container = Inventory.containerToItem(containerID);
        if (container === undefined) return;
        this.stage = container;
        refreshFortuneStage();
    },
    lockFortune() {
        if (this.slots.length >= this.maxSlot()) return;
        const recipe = this.stage.item;
        const newFortune = new fortuneSlot(recipe.type, this.stage.rarity+1,recipe.lvl,20);
        this.slots.push(newFortune);
        Inventory.removeContainerFromInventory(this.stage.containerID);
        this.stage = null;
        refreshFortuneSlots();
        refreshFortuneStage();
    },
    emptySlotCount() {
        return this.maxSlot() - this.slots.length;
    },
    getMaterialCost() {
        if (this.stage === null) return null;
        return {id:this.stage.material(),amt:20};
    },
    getProcModifier(line,tier) {
        const modifier = [1,1,1];
        const mods = this.slots.filter(s=>s.line === line && s.tier === tier)
        mods.forEach(s => {
            modifier[s.rarity-1] = 2;
        })
        return modifier;
    },
    spendFortune(item) {
        const containers = this.slots.filter(s=>s.line === item.type && s.tier === item.lvl);
        containers.forEach(s => s.subtractCraft());
        this.slots = this.slots.filter(s=>s.amt > 0);
        refreshFortuneSlots();
    },
    maxSlot() {
        return this.lvl;
    }
}

const $fortuneStage = $("#fortuneStage");
const $fortuneSlots = $("#fortuneSlots");
const $fortuneGear = $("#fortuneGear");

function initiateFortuneBldg () {
    $fortuneBuilding.show();
    refreshFortuneSlots();
    refreshFortuneStage();
    refreshFortuneGear();
}

function refreshFortuneSlots() {
    $fortuneSlots.empty();
    FortuneManager.slots.forEach(slot => {
        $fortuneSlots.append(createFortuneCard(slot));
    });
    for (let i=0;i<FortuneManager.emptySlotCount();i++) {
        const d1 = $("<div/>").addClass("fortuneSlot").html("Fortune Available");
        $fortuneSlots.append(d1);
    }
}

function refreshFortuneGear() {
    $fortuneGear.empty();
    Inventory.nonEpic().forEach(container => {
        $fortuneGear.append(createFortuneInv(container));
    });
}

function refreshFortuneStage() {
    refreshFortuneofferButton();
    const stage = FortuneManager.stage;
    $fortuneStage.empty();
    if (FortuneManager.stage === null) {
        const d1 = $("<div/>").addClass("fortuneStageEmpty").html("No item selected");
        $fortuneStage.append(d1);
        return;
    }
    const itemdiv = $("<div/>").addClass("fortuneStageItem").addClass("R"+stage.rarity);
    const itemName = $("<div/>").addClass("fortuneStageName").html(stage.picName());
    const rarity = ["common","good","great","epic"];
    const itemDesc = $("<div/>").addClass("fortuneStageDesc").html(`Increase ${rarity[stage.rarity+1]} craft chance of Lvl ${stage.lvl} ${stage.type}`);
    itemdiv.append(itemName,itemDesc);
    $fortuneStage.append(itemdiv);
}

function refreshFortuneofferButton() {
    if (FortuneManager.stage === null) {
        $fortuneStart.removeClass("fortuneOfferCanStart").html("Select an Item to Offer");
        return;
    }
    const mat = FortuneManager.getMaterialCost();
    const message = `Offer - ${ResourceManager.materialIcon(mat.id)} ${mat.amt}`
    $fortuneStart.addClass("fortuneOfferCanStart").html(message);
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
    const itemName = $("<div/>").addClass("fortuneSlotName").html(`Lvl ${slot.tier} ${slot.line}`);
    const itemRarity = $("<div/>").addClass("fortuneSlotRarity").html(`2x ${rarity[slot.rarity]} Craft Chance`)
    const itemAmt = $("<div/>").addClass("fortuneSlotAmt").html(`${slot.amt} Crafts Remaining`);
    return itemdiv.append(itemName,itemRarity,itemAmt);
}

$(document).on('click', '.fortuneStage', (e) => {
    e.preventDefault();
    const containerID = parseInt($(e.currentTarget).attr("containerID"));
    FortuneManager.stageItem(containerID);
});

$(document).on('click', '#fortuneStart', (e) => {
    e.preventDefault();
    FortuneManager.lockFortune();
})