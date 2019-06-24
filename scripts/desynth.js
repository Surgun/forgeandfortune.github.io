"use strict";

const DesynthManager = {
    slot : null,
    state : "empty",
    time : 0,
    cookTime : 3000,
    createSave() {
        const save = {};
        if (save.slot === null) save.slot = undefined;
        else save.slot = this.slot.createSave();
        save.state = this.state;
    },
    loadSave(save) {
        if (save.slot !== undefined) {
            const container = new itemContainer(item.id,item.rarity);
            container.loadSave(item);
            this.slot = container;
        }
        if (this.state !== undefined) this.state = save.state;
    },
    possibleDesynth() {
        return Inventory.higherRarity();
    },
    addDesynth(containerID) {
        if (this.slot !== null || this.state !== "empty") return;
        const container = Inventory.containerToItem(containerID);
        Inventory.removeContainerFromInventory(containerID);
        this.slot = container;
        this.state = "staged";
        initiateDesynthBldg();
    },
    removeDesynth() {
        if (this.state !== "staged") return;
        Inventory.addItemContainerToInventory(this.slot);
        this.slot = null;
        this.state = "empty";
        initiateDesynthBldg();
    },
    startDesynth() {
        if (this.state !== "staged") return;
        this.state = "synthing";
        this.time = this.cookTime;
        refreshDesynthStage();
    },
    addTime(ms) {
        if (this.state !== "synthing") return;
        this.time -= ms;
        if (this.time > 0) return refreshDesynthBar();
        this.state = "complete";
        this.time = 0;
        this.slot.rarity -= 1;
        console.log('slot lower!')
        refreshDesynthStage();
    },
    collectDesynth() {
        if (this.state !== "complete") return;
        if (Inventory.full()) {
            Notifications.synthInvFull();
            return;
        }
        const reward = this.desynthRewards(true);
        ResourceManager.addMaterial(reward.id,reward.amt);
        Inventory.addItemContainerToInventory(this.slot);
        this.slot = null;
        this.state = "empty";
        initiateDesynthBldg();
    },
    desynthRewards(increase) {
        const mod = increase ? 1 : 0;
        if (this.slot === null) return null;
        const reward = {};
        if (this.slot.rarity + mod === 1) reward.id = "M700";
        if (this.slot.rarity + mod === 2) reward.id = "M701";
        if (this.slot.rarity + mod === 3) reward.id = "M702";
        reward.amt = Math.floor(this.slot.item.craftTime / 4000);
        return reward;
    }
}

const $desynthBuilding = $("#desynthBuilding");
const $desynthSlot = $("#desynthSlot");
const $desynthList = $("#desynthList");
const $desynthRewardCard = $("#desynthRewardCard");
const $desynthRewardAmt = $("#desynthRewardAmt")
const $desynthReward = $("#desynthReward");


function initiateDesynthBldg() {
    $desynthBuilding.show();
    refreshDesynthStage();
    refreshDesynthInventory();
}

function refreshDesynthInventory() {
    $desynthList.empty();
        $("<div/>").addClass("possibleDesynthHead desynthHeading").html("Possible Items to Magically Desynth").appendTo($desynthList);
        const d1 = $("<div/>").addClass('possibleDesynthHolder').appendTo($desynthList);
    if (DesynthManager.possibleDesynth().length === 0) $("<div/>").addClass("desynthBlank").html("No Items to Magically Desynth").appendTo(d1)
    DesynthManager.possibleDesynth().forEach(container => {
        const d3 = $("<div/>").addClass("desynthGroup").addClass("R"+container.rarity);
            $("<div/>").addClass("desynthName").html(`${container.picName()}`).appendTo(d3);
            $("<div/>").addClass("desynthLevel").html(`${container.itemLevel()}`).appendTo(d3);
            $("<div/>").addClass("desynthButton").attr("container",container.containerID).html("Desynth").appendTo(d3);
        d1.append(d3);
    });
};

function refreshDesynthStage() {
    $desynthSlot.empty();
    $desynthRewardCard.empty();
    $desynthRewardAmt.empty();
    $desynthReward.show();
    if (DesynthManager.slot === null) {
        const d1 = $("<div/>").addClass("desynthSlot");
        const d2 = $("<div/>").addClass("desynthSlotName slotEmpty").html("Empty");
        d1.append(d2);
        $desynthSlot.append(d2);
        $desynthReward.hide();
        return;
    }
    const d3 = $("<div/>").addClass("desynthSlot").addClass("R"+DesynthManager.slot.rarity);
    const d4 = $("<div/>").addClass("desynthSlotName").html(DesynthManager.slot.picName());
    const d4a = $('<div/>').attr("id","desynthRemove").html(`<i class="fas fa-times"></i>`).hide();
    const d4b = $('<div/>').addClass("desynthLevel").html(DesynthManager.slot.itemLevel());
    const d5 = createDesynthBar().hide();
    const d6 = $("<div/>").attr("id","desynthSlotCollect").html("Collect").hide();
    const d7 = $("<div/>").attr("id","desynthSlotStart").html("Start Desynth").hide();    
    if (DesynthManager.state === "synthing") d5.show();
    if (DesynthManager.state === "complete") d6.show();
    if (DesynthManager.state === "staged") {
        d4a.show();
        d7.show();
    }
    d3.append(d4,d4a,d4b,d5,d6,d7);
    $desynthSlot.append(d3);
    //materials
    const mod = DesynthManager.state === "complete";
    const reward = DesynthManager.desynthRewards(mod);
    $("<div/>").addClass("desynthMaterialPic").html(ResourceManager.idToMaterial(reward.id).img).appendTo($desynthRewardCard);
    $("<div/>").addClass("desynthMaterialAmt").html(reward.amt).appendTo($desynthRewardAmt);
    $desynthReward.addClass("tooltip").attr("data-tooltip",ResourceManager.idToMaterial(reward.id).name);
}

function createDesynthBar() {
    const desynthPercent = DesynthManager.time/DesynthManager.cookTime;
    const desynthWidth = (desynthPercent*100).toFixed(1)+"%";
    const d1 = $("<div/>").addClass("desynthBarDiv").attr("id","desynthBarDiv");
    const d1a = $("<div/>").addClass("desynthBar").attr("id","desynthBar");
    const s1 = $("<span/>").addClass("desynthBarFill").attr("id","desynthFill").css('width', desynthWidth);
    return d1.append(d1a,s1);
}

function refreshDesynthBar() {
    const desynthPercent = DesynthManager.time/DesynthManager.cookTime;
    const desynthWidth = (desynthPercent*100).toFixed(1)+"%";
    $("#desynthFill").css('width', desynthWidth);
}
    
//click desynth on item in inventory
$(document).on('click', '.desynthButton', (e) => {
    e.preventDefault();
    const id = parseInt($(e.currentTarget).attr("container"));
    DesynthManager.addDesynth(id);    
});

//click deynth close button
$(document).on('click', '#desynthRemove', (e) => {
    e.preventDefault();
    DesynthManager.removeDesynth();
})

//click desynth start button
$(document).on('click', '#desynthSlotStart', (e) => {
    e.preventDefault();
    DesynthManager.startDesynth();
});

//click to collect
$(document).on('click', '#desynthSlotCollect', (e) => {
    e.preventDefault();
    DesynthManager.collectDesynth();
});