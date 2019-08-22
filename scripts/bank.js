"use strict";

const $bankInvSlots = $("#bankInvSlots");
const $bankBankSlots = $("#bankBankSlots");

const BankManager = {
    slots : [],
    lvl : 1,
    createSave() {
        const save = {};
        save.lvl = this.lvl;
        save.slots = [];
        this.slots.forEach(slot => {
            save.slots.push(slot.createSave());
        });
        return save;
    },
    loadSave(save) {
        save.slots.forEach(item => {
            const container = new itemContainer(item.id,item.rarity);
            container.loadSave(item);
            this.slots.push(container);
        });
        if (save.lvl !== undefined) this.lvl = save.lvl;
    },
    maxSlots() {
        return this.lvl*5+10;
    },
    full() {
        return this.slots.length === this.maxSlots();
    },
    containerToItem(containerID) {
        return this.slots.find(s=>s.containerID === containerID)
    },
    addFromInventory(containerID) {
        if (this.full()) return;
        const container = Inventory.containerToItem(containerID);
        Inventory.removeContainerFromInventory(containerID);
        this.addContainer(container);
    },
    removeContainer(containerID) {
        this.slots = this.slots.filter(c=>c.containerID !== containerID);
        refreshBankBank();
    },
    sortBank() {
        this.slots.sort((a,b) => inventorySort(a,b));
        refreshBankBank()
    },
    addContainer(container) {
        this.slots.push(container);
        refreshBankBank();
    },
    removeFromBank(containerID) {
        if (Inventory.full()) return;
        const container = this.containerToItem(containerID);
        this.removeContainer(containerID);
        Inventory.addItemContainerToInventory(container);
    },
}

function initiateBankBldg() {
    $bankBuilding.show();
    refreshBankBank();
    refreshBankInventory();
}

function refreshBankInventory() {
    $bankInvSlots.empty();
    const d1 = $("<div/>").addClass("bankInvHeadContainer");
    const d2 = $("<div/>").addClass("bankInvHead").html(`Inventory (${Inventory.nonblank().length}/${Inventory.invMax})` );
    const d3 = $("<div/>").attr("id","sortInventoryBank").html("Sort Inventory");
    d1.append(d2,d3);
    $bankInvSlots.append(d1);
    Inventory.nonblank().forEach(item => {
        $bankInvSlots.append(itemCard(item,false));
    });
}

function refreshBankBank() {
    $bankBankSlots.empty();
    const d1 = $("<div/>").addClass("bankBankHeadContainer");
    const d2 = $("<div/>").addClass("bankBankHead").html(`Bank (${BankManager.slots.length}/${BankManager.maxSlots()})` );
    const d3 = $("<div/>").attr("id","sortBank").html("Sort Bank");
    d1.append(d2,d3);
    $bankBankSlots.append(d1);
    BankManager.slots.forEach(item => {
        $bankBankSlots.append(itemCard(item,true));
    });
}

function itemCard(item,inBank) {
    const itemdiv = $("<div/>").addClass("bankItem").addClass("R"+item.rarity);
    const itemName = $("<div/>").addClass("bankItemName").html(item.picName());
    const itemLevel = $("<div/>").addClass("bankItemLevel").html(item.itemLevel());
    if (item.item.recipeType === "building") itemLevel.hide();
    const itemProps = $("<div/>").addClass("bankProps");
    for (const [stat, val] of Object.entries(item.itemStat(false))) {
        if (val === 0) continue;
        $("<div/>").addClass("invPropStat tooltip").attr("data-tooltip",stat).html(`${miscIcons[stat]} ${val}`).appendTo(itemProps);
    }
    const locationButton = $("<div/>").attr("containerID",item.containerID);
    if (inBank) locationButton.addClass('bankTake').html("Take");
    else locationButton.addClass('bankStow').html("Stow");
    return itemdiv.append(itemName,itemLevel,itemProps,locationButton);
}

$(document).on("click",".bankTake",(e) => {
    e.preventDefault();
    const containerID = parseInt($(e.target).attr("containerID"));
    BankManager.removeFromBank(containerID);
});

$(document).on("click",".bankStow",(e) => {
    e.preventDefault();
    const containerID = parseInt($(e.target).attr("containerID"));
    BankManager.addFromInventory(containerID);
});

$(document).on("click","#sortBank",(e) => {
    e.preventDefault();
    BankManager.sortBank();
});

$(document).on("click","#sortInventoryBank",(e) => {
    e.preventDefault();
    Inventory.sortInventory();
});