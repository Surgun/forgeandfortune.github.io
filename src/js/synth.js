"use strict";

const synthToggle = Object.freeze({DESYNTH:0,RESYNTH:1});

const $synthPowerResynthesis = $("#synthPowerResynthesis");

const SynthManager = {
    slot : null,
    resynth : null,
    setting : synthToggle.DESYNTH,
    state : "empty",
    time : 0,
    cookTime : 3000,
    lvl : 1,
    createSave() {
        const save = {};
        if (this.slot !== null) save.slot = this.slot.createSave();
        save.state = this.state;
        save.lvl = this.lvl;
        save.resynth = this.resynth;
        save.setting = this.setting;
        return save;
    },
    loadSave(save) {
        if (save.slot !== undefined) {
            const container = new itemContainer(save.slot.id,save.slot.rarity);
            container.loadSave(save.slot);
            this.slot = container;
        }
        if (save.state !== undefined) this.state = save.state;
        if (save.lvl !== undefined) this.lvl = save.lvl;
        if (save.resynth !== undefined) this.resynth = save.resynth;
        if (save.setting !== undefined) this.setting = save.setting;
    },
    possibleSynth() {
        return Inventory.higherRarity();
    },
    toggleStatus(status) {
        if (this.state !== "empty" && this.state !== "staged") return;
        if (status === synthToggle.DESYNTH && this.setting !== synthToggle.DESYNTH) {
            this.setting = synthToggle.DESYNTH;
            refreshDesynth();
        }
        if (status === synthToggle.RESYNTH && this.setting !== synthToggle.RESYNTH && this.lvl > 1) {
            this.setting = synthToggle.RESYNTH;
            refreshResynth();
        }
    },
    addSynth(containerID) {
        if (this.slot !== null || this.state !== "empty") return;
        const container = Inventory.containerToItem(containerID);
        Inventory.removeContainerFromInventory(containerID);
        this.slot = container;
        this.state = "staged";
        initiateSynthBldg();
    },
    removeSynth() {
        if (this.state !== "staged") return;
        if (Inventory.full()) {
            Notifications.synthCollectInvFull();
            return;
        }
        Inventory.addToInventory(this.slot);
        this.slot = null;
        this.state = "empty";
        this.resynth = null;
        this.clearResynthSlot();
        initiateSynthBldg();
    },
    stageButton() {
        if (this.state === "staged" && this.setting === synthToggle.DESYNTH) this.startDesynth();
        if (this.state === "staged" && this.setting === synthToggle.RESYNTH) this.startResynth();
        if (this.state === "complete") this.collectSynth();
    },
    startDesynth() {
        this.state = "desynthing";
        synthBarText("");
        this.time = this.cookTime;
    },
    startResynth() {
        if (this.state !== "staged" || this.resynth === null) return;
        const cost = this.resynthCosts();
        if (!ResourceManager.available("M700",cost.M700) || !ResourceManager.available("M701",cost.M701) || !ResourceManager.available("M702",cost.M702)) {
            Notifications.insufficientResynthMats();
            return;
        }
        ResourceManager.addMaterial("M700",-cost.M700,false);
        ResourceManager.addMaterial("M701",-cost.M701,false);
        ResourceManager.addMaterial("M702",-cost.M702,false);
        this.state = "resynthing";
        synthBarText("");
        $("#synthRemove").hide();
        this.time = this.cookTime;
    },
    addTime(ms) {
        if (this.state !== "desynthing" && this.state !== "resynthing") return;
        this.time -= ms;
        if (this.time > 0) return refreshSynthBar();
        this.time = 0;
        if (this.state === "desynthing") this.slot.rarity -= 1;
        if (this.state === "resynthing") this.slot.transform(this.resynthChange());
        this.state = "complete";
        this.resynth = null;
        synthBarText("Collect");
        refreshSynthStage();
        refreshResynth();
    },
    collectSynth() {
        if (this.state !== "complete") return;
        if (Inventory.full()) {
            Notifications.synthCollectInvFull();
            return;
        }
        if (this.setting === synthToggle.DESYNTH) {
            const reward = this.desynthRewards(true);
            ResourceManager.addMaterial(reward.id,reward.amt);
            Notifications.synthCollect(ResourceManager.idToMaterial(reward.id).name,reward.amt);
        }
        Inventory.addToInventory(this.slot);
        this.slot = null;
        this.state = "empty";
        this.resynth = null;
        initiateSynthBldg();
    },
    desynthRewards(increase) {
        const mod = increase ? 1 : 0;
        if (this.slot === null) return null;
        const reward = {};
        if (this.slot.rarity + mod === 1) reward.id = "M700";
        if (this.slot.rarity + mod === 2) reward.id = "M701";
        if (this.slot.rarity + mod === 3) reward.id = "M702";
        reward.amt = Math.max(1,Math.floor(this.slot.item.craftTime / 4000));
        return reward;
    },
    resynthCosts() {
        const resynthCost = {M700 : 0, M701 : 0, M702 : 0}
        if (this.slot === null) return resynthCost;
        const baseline = Math.max(1,Math.floor(this.slot.item.craftTime / 4000));
        if (this.slot.powRatio === 3 || this.slot.hpRatio === 3) {
            resynthCost.M702 = baseline;
        }
        else {
            resynthCost.M700 = baseline;
            resynthCost.M701 = baseline;
        }
        return resynthCost;
    },
    resynthChange() {
        const change = [0,0];
        if (this.slot === null || this.resynth === null) return change;
        if (this.resynth === "M700") {
            if (this.slot.hpRatio === 1) {
                change[0] = 1;
                change[1] = -1;
            }
            else {
                change[0] = -1;
                change[1] = 1;
            }
        }
        if (this.resynth === "M701") {
            if (this.slot.hpRatio === 2) {
                change[0] = 1;
                change[1] = -1;
            }
            else {
                change[0] = -1;
                change[1] = 1;
            }
        }
        if (this.resynth === "M702") {
            if (this.slot.hpRatio === 3) {
                change[0] = 1;
                change[1] = -1;
            }
            else {
                change[0] = -1;
                change[1] = 1;
            }
        }
        return change;
    },
    clearResynthSlot() {
        if (this.state !== "staged") return;
        this.resynth = null;
        refreshResynth();
    },
    fillResynthSlot(value) {
        if (this.state !== "staged") return;
        this.resynth = value;
        refreshResynth();
    },
}

const $synthBuilding = $("#synthBuilding");
const $synthSlot = $("#synthSlot");
const $synthList = $("#synthList");
const $synthRewardCard = $("#synthRewardCard");
const $synthRewardAmt = $("#synthRewardAmt")
const $synthReward = $("#synthReward");


function initiateSynthBldg() {
    $synthBuilding.show();
    refreshSynthStage();
    refreshSynthInventory();
    refreshSynthButtons();
    if (SynthManager.setting === synthToggle.DESYNTH) refreshDesynth();
    if (SynthManager.setting === synthToggle.RESYNTH) refreshResynth();
}

function refreshSynthInventory() {
    $synthList.empty();
        $("<div/>").addClass("possibleSynthHead synthHeading").html("Available Items to Synthesize").appendTo($synthList);
        const d1 = $("<div/>").addClass('possibleSynthHolder').appendTo($synthList);
    if (SynthManager.possibleSynth().length === 0) $("<div/>").addClass("synthBlank").html("No Items to Synthesize").appendTo(d1)
    SynthManager.possibleSynth().forEach(container => {
        createSynthCard(container,false).appendTo(d1);
    });
};

function refreshSynthStage() {
    $synthSlot.empty();
    if (SynthManager.slot === null) {
        $("<div/>").addClass("synthSlotName itemName slotEmpty").html("Empty").appendTo($synthSlot);
        return;
    }
    createSynthStageCard(SynthManager.slot).appendTo($synthSlot);
}

const $desynthRewards = $("#desynthRewards");
const $resynthCost = $("#resynthCost");

const $resynthMaterial = $("#resynthMaterial");
const $resynthMaterials = $("#resynthMaterials");

function refreshDesynth() {
    $desynthRewards.show();
    $resynthCost.hide();
    $(".synthPowerSetting").removeClass("synthPowerEnabled");
    $("#synthPowerDesynthesis").addClass("synthPowerEnabled");
    $synthRewardCard.empty();
    $synthRewardAmt.empty();
    if (SynthManager.slot === null) {
        $desynthRewards.hide();
        return;
    }
    $desynthRewards.show();
    const mod = SynthManager.state === "complete";
    const reward = SynthManager.desynthRewards(mod);
    $("<div/>").addClass("synthMaterialPic").html(ResourceManager.idToMaterial(reward.id).img).appendTo($synthRewardCard);
    $("<div/>").addClass("synthMaterialAmt").html(reward.amt).appendTo($synthRewardAmt);
    $synthReward.addClass("tooltip").attr({"data-tooltip":"material_desc","data-tooltip-value":reward.id});
    synthBarText("Desynthesize");
    refreshSynthStage();
}

function refreshResynth() {
    $desynthRewards.hide();
    $(".synthPowerSetting").removeClass("synthPowerEnabled");
    $("#synthPowerResynthesis").addClass("synthPowerEnabled");
    if (SynthManager.state === "empty") return $resynthCost.hide();
    $resynthCost.show();
    const idAmts = SynthManager.resynthCosts();
    $resynthMaterials.empty();
    const mats = ["M700","M701","M702"];
    mats.forEach(mat => {
        if (idAmts[mat] === 0) return;
        $("<div/>").addClass("resynthMaterial").data("matid",mat).html(`${ResourceManager.idToMaterial(mat).img} ${idAmts[mat]}`).appendTo($resynthMaterials);
    });
    if (SynthManager.state === "staged") {
        synthBarText("Start Resynthesis");
    }
    if (SynthManager.state === "resynthing") {
        $("#synthRemove").hide();
        synthBarText("Resynthing...");
    }
    if (SynthManager.state === "complete") {
        $("#synthRemove").hide();
        synthBarText("Collect");
    }
    refreshSynthStage();
}

function refreshSynthButtons() {
    if (SynthManager.lvl >= 2) $synthPowerResynthesis.html("Resynthesis");
}

function createSynthBar(text) {
    const synthPercent = SynthManager.time/SynthManager.cookTime;
    const synthWidth = (synthPercent*100).toFixed(1)+"%";
    const d1 = $("<div/>").addClass("synthBarDiv").attr("id","synthBarDiv");
    const d1a = $("<div/>").addClass("synthBar").attr("id","synthBar");
    const s1 = $("<span/>").addClass("synthBarFill").attr("id","synthFill").html(text).css('width', synthWidth);
    return d1.append(d1a,s1);
}

function refreshSynthBar(text) {
    const synthPercent = SynthManager.time/SynthManager.cookTime;
    const synthWidth = (synthPercent*100).toFixed(1)+"%";
    $("#synthFill").html(text).css('width', synthWidth);
}

function synthBarText(text) {
    $("#synthFill").html(text);
}
    
//click synth on item in inventory
$(document).on('click', '.synthButton', (e) => {
    e.preventDefault();
    const id = parseInt($(e.currentTarget).data("containerID"));
    SynthManager.addSynth(id);    
});

//click deynth close button
$(document).on('click', '#synthRemove', (e) => {
    e.preventDefault();
    SynthManager.removeSynth();
})

//click synth start button
$(document).on('click', '#synthBarDiv', (e) => {
    e.preventDefault();
    SynthManager.stageButton();
});

//change to Desynthesis
$(document).on('click', '#synthPowerDesynthesis', (e) => {
    e.preventDefault();
    SynthManager.toggleStatus(synthToggle.DESYNTH);
})

//change to Resynthesis
$(document).on('click', '#synthPowerResynthesis', (e) => {
    e.preventDefault();
    SynthManager.toggleStatus(synthToggle.RESYNTH);
})

//click on a material to add to resynth collection
$(document).on('click', '.resynthMaterial', (e) => {
    e.preventDefault();
    $(".resynthMaterial").removeClass("selected");
    $(e.currentTarget).addClass("selected");
    const type = $(e.currentTarget).data("matid");
    if (SynthManager.state === "staged") SynthManager.fillResynthSlot(type);
});

function createSynthCard(container) {
    const itemdiv = $("<div/>").addClass("inventoryItem").addClass("R"+container.rarity);
    const itemName = $("<div/>").addClass("inventoryItemName itemName").attr({"id": container.id, "r": container.rarity}).html(container.picName());
    const itemRarity = $("<div/>").addClass(`inventoryItemRarity RT${container.rarity} tooltip`).attr({"data-tooltip": `rarity_${rarities[container.rarity].toLowerCase()}`}).html(miscIcons.rarity);
    const itemLevel = $("<div/>").addClass("itemLevel tooltip").attr({"data-tooltip": "item_level"}).html(container.itemLevel());
    const itemProps = $("<div/>").addClass("inventoryProps");
    for (const [stat, val] of Object.entries(container.itemStat(0))) {
        if (val === 0) continue;
        $("<div/>").addClass("invPropStat tooltip").attr("data-tooltip", stat).html(`${miscIcons[stat]} <span class="statValue">${val}</span>`).appendTo(itemProps);
    };
    const synthButton = $("<div/>").addClass("synthButton").data("containerID",container.containerID).html("Stage Item");
    return itemdiv.append(itemName,itemRarity,itemLevel,itemProps,synthButton);
}

function createSynthStageCard(container) {
    const itemdiv = $("<div/>").addClass("inventoryItem").addClass("R"+container.rarity);
    const itemName = $("<div/>").addClass("inventoryItemName itemName").attr({"id": container.id, "r": container.rarity}).html(container.picName());
    const stageRemove = $('<div/>').attr("id","synthRemove").html(`<i class="fas fa-times"></i>`);
    const itemLevel = $("<div/>").addClass("itemLevel tooltip").attr({"data-tooltip": "item_level"}).html(container.itemLevel());
    const itemProps = $("<div/>").addClass("inventoryProps");
    const synthStatProps = SynthManager.setting === synthToggle.RESYNTH ? SynthManager.resynthChange() : [0,0];
    for (const [stat, val] of Object.entries(container.itemStat(0, synthStatProps[0], synthStatProps[1]))) {
        if (val === 0) continue;
        $("<div/>").addClass("invPropStat tooltip").attr("data-tooltip", stat).html(`${miscIcons[stat]} <span class="statValue">${val}</span>`).appendTo(itemProps);
    };
    itemdiv.append(itemName,stageRemove,itemLevel,itemProps)
    if (SynthManager.state === "staged" && SynthManager.resynth !== null) {
        createSynthBar("Resynthesize").appendTo(itemdiv);
    }
    if (SynthManager.state === "staged" && SynthManager.resynth === null) {
        createSynthBar("Select Material").appendTo(itemdiv);
    }
    if (SynthManager.state === "complete") {
        createSynthBar("Collect").appendTo(itemdiv);
        stageRemove.hide();
    }
    return itemdiv;
};