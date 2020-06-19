"use strict";

const synthToggle = Object.freeze({DESYNTH:0,RESYNTH:1});

const $synthSide = $("#synthSide");

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
        this.time = this.cookTime;
        refreshSynthStage();
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
const $synthListHeader = $("#synthListHeader");
const $synthListContainer = $("#synthListContainer");

function initiateSynthBldg() {
    $synthBuilding.show();
    generateSynthStageActions();
    generateSynthHeader();
    refreshSynthStage();
    refreshSynthInventory();
    refreshSynthButtons();
    if (SynthManager.setting === synthToggle.DESYNTH) refreshDesynth();
    if (SynthManager.setting === synthToggle.RESYNTH) refreshResynth();
}

function generateSynthHeader() {
    $synthListHeader.empty();
    const a = $("<div/>").addClass("contentHeader").appendTo($synthListHeader);
    const a1 = $("<div/>").addClass("contentHeading").appendTo(a);
        const a1a = $("<div/>").addClass("headingDetails").appendTo(a1);
        $("<div/>").addClass("headingTitle").html(displayText('header_synthesizer_desynth_title')).appendTo(a1a);
        $("<div/>").addClass("headingDescription").html(displayText('header_synthesizer_desynth_desc')).appendTo(a1a);
}

function generateSynthStageActions() {
    $synthSide.empty();
    const synthSettings =  $("<div/>").addClass("synthSettingsContainer").appendTo($synthSide);
    const synthSettingOptions = $("<div/>").addClass("synthSettingsOptions").appendTo(synthSettings);
        $("<div/>").addClass("synthRewardHeader").html(displayText('synthesizer_settings_title')).appendTo(synthSettingOptions);
        $("<div/>").addClass("synthPowerSetting actionButton actionButtonAnimDisabled").attr({"id":"synthPowerDesynthesis"}).html("Desynthesis").appendTo(synthSettingOptions);
        $("<div/>").addClass("synthPowerSetting synthPowerSettingLocked actionButton actionButtonAnimDisabled").attr({"id":"synthPowerResynthesis"}).html("<i class='fas fa-lock'></i>Synthesis").appendTo(synthSettingOptions);
    // Synth Slot
    const synthSlot = $("<div/>").addClass("synthSlot").attr({"id":"synthSlot"}).appendTo($synthSide);

    // Desynth Reward
    const desynthRewards = $("<div/>").addClass("desynthRewards").attr({"id":"desynthRewards"}).appendTo($synthSide);
        $("<div/>").addClass("synthRewardHeader").html("Material Extraction").appendTo(desynthRewards);
        const synthReward = $("<div/>").addClass("synthReward").appendTo(desynthRewards);
            $("<div/>").addClass("synthRewardCard").attr({"id":"synthRewardCard"}).appendTo(synthReward);
            $("<div/>").addClass("synthRewardAmt").attr({"id":"synthRewardAmt"}).appendTo(synthReward);
    // Synth Reward
    const resynthCost = $("<div/>").addClass("resynthCost").attr({"id":"resynthCost"}).appendTo($synthSide);
        const resynthBlock = $("<div/>").addClass("resynthBlock").appendTo(resynthCost);
            $("<div/>").addClass("synthRewardHeader").html("Material Infusion").appendTo(resynthBlock);
            $("<div/>").addClass("resynthMaterials").attr({"id":"resynthMaterials"}).appendTo(resynthBlock);
}

function refreshSynthInventory() {
    $synthListContainer.empty();
    const d1 = $("<div/>").addClass('synthListCardsContainer').appendTo($synthListContainer);
    if (SynthManager.possibleSynth().length === 0) $("<div/>").addClass("emptyContentMessage").html(displayText('synthesizer_inventory_empty')).appendTo($synthListContainer)
    SynthManager.possibleSynth().forEach(container => {
        createSynthCard(container,false).appendTo(d1);
    });
};

function refreshSynthStage() {
    $("#synthSlot").empty();
    if (SynthManager.slot === null) {
        const itemdiv = $("<div/>").addClass("synthItem synthSlotEmpty");
        const d = $("<div/>").addClass("synthSlotEmpty itemName").appendTo(itemdiv);
            $("<div/>").addClass("synthSlotEmptyIcon").html(miscIcons.emptySlot).appendTo(d);
            $("<div/>").addClass("synthSlotEmptyTitle").html("Empty Slot").appendTo(d);
        $("<div/>").addClass("itemLevel").appendTo(itemdiv);
        $("<div/>").addClass("itemRarity").appendTo(itemdiv);
        $("<div/>").addClass("gearStat").html("<span/>").appendTo(itemdiv);
        $("<div/>").addClass("synthSlotEmptyButton").appendTo(itemdiv);
        $("#synthSlot").append(itemdiv);
        return;
    }
    createSynthStageCard(SynthManager.slot).appendTo($("#synthSlot"));
}

function refreshDesynth() {
    $("#desynthRewards").show();
    $("#resynthCost").hide();
    if (SynthManager.setting === synthToggle.DESYNTH) {
        $(".synthPowerSetting").removeClass("synthPowerEnabled");
        $("#synthPowerDesynthesis").addClass("synthPowerEnabled");
    }
    $("#synthRewardCard").empty();
    $("#synthRewardAmt").empty();
    if (SynthManager.slot === null) {
        $("#desynthRewards").hide();
        return;
    }
    $("#desynthRewards").show();
    const mod = SynthManager.state === "complete";
    const reward = SynthManager.desynthRewards(mod);
    $("<div/>").addClass("synthMaterialIcon").html(ResourceManager.idToMaterial(reward.id).img).appendTo($("#synthRewardCard"));
    $("<div/>").addClass("synthMaterialAmt").html(reward.amt).appendTo($("#synthRewardAmt"));
    $(".synthReward").addClass("tooltip").attr({"data-tooltip":"material_desc","data-tooltip-value":reward.id});
    refreshSynthStage();
}

function refreshResynth() {
    $("#desynthRewards").hide();
    if (SynthManager.setting === synthToggle.RESYNTH) {
        $(".synthPowerSetting").removeClass("synthPowerEnabled");
        $("#synthPowerResynthesis").addClass("synthPowerEnabled");
    }
    if (SynthManager.state === "empty") return $("#resynthCost").hide();
    $("#resynthCost").show();
    const idAmts = SynthManager.resynthCosts();
    $("#resynthMaterials").empty();
    const mats = ["M700","M701","M702"];
    mats.forEach(mat => {
        if (idAmts[mat] === 0) return;
        const resynthMaterial = $("<div/>").addClass("resynthMaterial tooltip").attr({"data-tooltip":"material_desc","data-tooltip-value":mat}).data("matid",mat).appendTo($("#resynthMaterials"));
        $("<div/>").addClass("resynthMaterialIcon").html(ResourceManager.idToMaterial(mat).img).appendTo(resynthMaterial);
        $("<div/>").addClass("resynthMaterialAmt").html(idAmts[mat]).appendTo(resynthMaterial);
    });
    if (SynthManager.state === "resynthing") {
        $("#synthRemove").hide();
    }
    if (SynthManager.state === "complete") {
        $("#synthRemove").hide();
    }
    refreshSynthStage();
}

function refreshSynthButtons() {
    if (SynthManager.lvl >= 2) $("#synthPowerResynthesis").removeClass("synthPowerSettingLocked").html("Synthesis");
}

function createSynthBar() {
    const synthPercent = SynthManager.time/SynthManager.cookTime;
    const synthWidth = (synthPercent*100).toFixed(1)+"%";
    const synthAmt = msToTime(SynthManager.time);
    const d1 = $("<div/>").addClass("synthBarDiv").attr("id","synthBarDiv");
    const d1a = $("<div/>").addClass("synthBar").attr("data-label",synthAmt).attr("id","synthBar");
    const s1 = $("<span/>").addClass("synthBarFill").attr("id","synthFill").css('width', synthWidth);
    return d1.append(d1a,s1);
}

function refreshSynthBar() {
    const synthPercent = SynthManager.time/SynthManager.cookTime;
    const synthWidth = (synthPercent*100).toFixed(1)+"%";
    const synthAmt = msToTime(SynthManager.time);
    $("#synthBar").attr("data-label",synthAmt).css('width', synthWidth);
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
    refreshSynthStage();
})

//click synth start button
$(document).on('click', '.synthSlotAction', (e) => {
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
    const itemdiv = $("<div/>").addClass("synthItem").addClass("R"+container.rarity);
    const itemName = $("<div/>").addClass("itemName").attr({"id": container.id, "r": container.rarity}).html(container.picName());
    const itemRarity = $("<div/>").addClass(`itemRarity RT${container.rarity} tooltip`).attr({"data-tooltip": `rarity_${rarities[container.rarity].toLowerCase()}`}).html(miscIcons.rarity);
    const itemLevel = $("<div/>").addClass("itemLevel tooltip").attr({"data-tooltip": "item_level"}).html(container.itemLevel());
    const itemProps = $("<div/>").addClass("equipStats");
    for (const [stat, val] of Object.entries(container.itemStat(0))) {
        if (val === 0) continue;
        const ed = $("<div/>").addClass("gearStat tooltip").attr("data-tooltip", stat).appendTo(itemProps);
            $("<div/>").addClass(`${stat}_img`).html(miscIcons[stat]).appendTo(ed);
            $("<div/>").addClass(`${stat}_integer statValue`).html(val).appendTo(ed);
    };
    const synthActions = $("<div/>").addClass("synthActions");
        $("<div/>").addClass("synthButton actionButtonCard").data("containerID",container.containerID).html("Stage Item").appendTo(synthActions);
    return itemdiv.append(itemName,itemRarity,itemLevel,itemProps,synthActions);
}

function createSynthStageCard(container) {
    const itemdiv = $("<div/>").addClass("synthItem").addClass("R"+container.rarity);
    const itemName = $("<div/>").addClass("itemName").attr({"id": container.id, "r": container.rarity}).html(container.picName());
    const itemLevel = $("<div/>").addClass("itemLevel tooltip").attr({"data-tooltip": "item_level"}).html(container.itemLevel());
    const itemRarity = $("<div/>").addClass(`itemRarity RT${container.rarity} tooltip`).attr({"data-tooltip": `rarity_${rarities[container.rarity].toLowerCase()}`}).html(miscIcons.rarity);
    const itemProps = $("<div/>").addClass("equipStats");
    const stageRemove = $('<div/>').addClass("synthRemove").attr("id","synthRemove").html(`<i class="fas fa-times"></i>`);
    const synthStatProps = SynthManager.setting === synthToggle.RESYNTH ? SynthManager.resynthChange() : [0,0];
    for (const [stat, val] of Object.entries(container.itemStat(0, synthStatProps[0], synthStatProps[1]))) {
        if (val === 0) continue;
            const ed = $("<div/>").addClass("gearStat tooltip").attr("data-tooltip", stat).appendTo(itemProps);
                $("<div/>").addClass(`${stat}_img`).html(miscIcons[stat]).appendTo(ed);
                $("<div/>").addClass(`${stat}_integer statValue`).html(val).appendTo(ed);
    };
    const synthBar = createSynthBar();
    const synthButton = $("<div/>").addClass("synthSlotAction actionButtonCard");
    itemdiv.append(itemName,itemLevel,itemRarity,itemProps,stageRemove,synthBar,synthButton);
    if (SynthManager.state === "staged" && SynthManager.resynth !== null) {
        synthButton.html("Synthesize");
    }
    if (SynthManager.state === "staged" && SynthManager.resynth === null) {
        synthBar.hide();
        synthButton.html("Desynthesize");
    }
    if (SynthManager.state === "desynthing") {
        synthBar.show();
        synthButton.hide();
    }
    if (SynthManager.state === "complete") {
        synthBar.hide();
        synthButton.html("Collect Item").show();
        stageRemove.hide();
    }
    return itemdiv;
};