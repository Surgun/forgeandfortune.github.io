"use strict";

const $bankInvSlots = $("#bankInvSlots");
const $bankBankSlots = $("#bankBankSlots");
const $bankBuilding = $("#bankBuilding");
const $bankNavigation = $("#bankNavigation");

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
    },
    removeFromBank(containerID) {
        if (Inventory.full()) return;
        const container = this.containerToItem(containerID);
        this.removeContainer(containerID);
        Inventory.addToInventory(container,true);
    },
    addLevel() {
        this.lvl += 1;
        refreshBankBank();
        refreshBankInventory();
    }
}

function initiateBankBldg() {
    $bankBuilding.show();
    $bankNavigation.empty();
    $("<div/>").addClass("bankTabNavigation").attr({id: "bankNavInventory"}).html(displayText("bank_nav_inventory")).appendTo($bankNavigation);
    $("<div/>").addClass("bankTabNavigation").attr({id: "bankNavStorage"}).html(displayText("bank_nav_storage")).appendTo($bankNavigation);
    $("#bankNavStorage").removeClass("selected");
    $("#bankNavInventory").addClass("selected");
    refreshBankInventory();
}

function refreshBankInventory() {
    $bankBankSlots.hide();
    $bankInvSlots.empty().show();
    // Bank Inventory Header
    const bankInventoryHeaderContainer = $("<div/>").addClass(`bankInventoryHeaderContainer`).appendTo($bankInvSlots);
    const bankInventoryHeader = $("<div/>").addClass(`bankInventoryHeader`).appendTo(bankInventoryHeaderContainer);
    const bankInventoryHeadingDetails = $("<div/>").addClass("headingDetails").appendTo(bankInventoryHeader);
        $("<div/>").addClass("headingTitle").html(`${displayText("header_bank_inventory_title")} (${Inventory.nonblank().length}/${Inventory.invMax})`).appendTo(bankInventoryHeadingDetails);
        $("<div/>").addClass("headingDescription").html(displayText("header_bank_inventory_desc")).appendTo(bankInventoryHeadingDetails);
    $("<div/>").addClass("actionButtonAnimDisabled actionButton").attr({id: "sortInventoryBank"}).html(displayText("bank_sort_inventory_button")).appendTo(bankInventoryHeaderContainer);
    // Bank Inventory Cards
    const bankInventoryCardsContainer = $("<div/>").addClass(`bankInventoryCardsContainer`).attr({id: "bankInventoryCardsContainer"}).appendTo($bankInvSlots);
    if (Inventory.nonblank().length === 0) $("<div/>").addClass(`bankInventoryEmpty`).html(displayText("bank_inventory_empty")).appendTo($bankInvSlots);
    Inventory.nonblank().forEach(item => {
        bankInventoryCardsContainer.append(itemCard(item,false));
    });
}

function refreshBankBank() {
    $bankInvSlots.hide();
    $bankBankSlots.empty().show();
    // Bank Storage Header
    const bankStorageHeaderContainer = $("<div/>").addClass(`bankStorageHeaderContainer`).appendTo($bankBankSlots);
    const bankStorageHeader = $("<div/>").addClass(`bankStorageHeader`).appendTo(bankStorageHeaderContainer);
    const bankStorageHeadingDetails = $("<div/>").addClass("headingDetails").appendTo(bankStorageHeader);
        $("<div/>").addClass("headingTitle").html(`${displayText("header_bank_storage_title")} (${BankManager.slots.length}/${BankManager.maxSlots()})`).appendTo(bankStorageHeadingDetails);
        $("<div/>").addClass("headingDescription").html(displayText("header_bank_storage_desc")).appendTo(bankStorageHeadingDetails);
    $("<div/>").addClass("actionButtonAnimDisabled actionButton").attr({id: "sortBank"}).html(displayText("bank_sort_bank_button")).appendTo(bankStorageHeaderContainer);
    // Bank Storage Cards
    const bankStorageCardsContainer = $("<div/>").addClass(`bankStorageCardsContainer`).attr({id: "bankStorageCardsContainer"}).appendTo($bankBankSlots);
    if (BankManager.slots.length === 0) $("<div/>").addClass(`bankStorageEmpty`).html(displayText("bank_storage_empty")).appendTo($bankBankSlots);
    BankManager.slots.forEach(item => {
        bankStorageCardsContainer.append(itemCard(item,true));
    });
}

function itemCard(item,inBank) {
    const itemdiv = $("<div/>").addClass("bankItem").addClass("R"+item.rarity);
    const itemName = $("<div/>").addClass("itemName").html(item.picName());
    const itemLevel = $("<div/>").addClass("itemLevel").html(item.itemLevel());
    const itemRarity = $("<div/>").addClass("itemRarity").addClass(`RT${item.rarity} tooltip`).attr({"data-tooltip": `rarity_${rarities[item.rarity].toLowerCase()}`}).html(miscIcons.rarity);
    if (item.item.recipeType === "building") itemLevel.hide();
    const equipStats = $("<div/>").addClass("equipStats");
    for (const [stat, val] of Object.entries(item.itemStat(false))) {
        if (val === 0) continue;
        const ed = $("<div/>").addClass('gearStat tooltip').attr({"data-tooltip": stat}).appendTo(equipStats);
            $("<div/>").addClass(`${stat}_img`).html(miscIcons[stat]).appendTo(ed);
            $("<div/>").addClass(`${stat}_integer statValue`).html(val).appendTo(ed);
    }
    const bankActionButtons = $("<div/>").addClass("bankActionsButtons");
        const locationButton = $("<div/>").attr("containerID",item.containerID).appendTo(bankActionButtons);
        if (inBank) locationButton.addClass('bankAction bankTake').html(displayText("bank_remove_item_button"));
        else locationButton.addClass('bankAction bankStow').html(displayText("bank_stow_item_button"));
    return itemdiv.append(itemName,itemLevel,itemRarity,equipStats,bankActionButtons);
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

$(document).on("click","#bankNavInventory",(e) => {
    e.preventDefault();
    $("#bankNavStorage").removeClass("selected");
    $("#bankNavInventory").addClass("selected");
    refreshBankInventory();
});

$(document).on("click","#bankNavStorage",(e) => {
    e.preventDefault();
    $("#bankNavInventory").removeClass("selected");
    $("#bankNavStorage").addClass("selected");
    refreshBankBank();
});
