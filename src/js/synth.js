"use strict";

const synthToggle = Object.freeze({DESYNTH:0,RESYNTH:1});

const $synthSide = $("#synthSide");

const SynthManager = {
    slot : null,
    setting : synthToggle.DESYNTH,
    state : "empty",
    lvl : 1,
    createSave() {
        const save = {};
        if (this.slot !== null) save.slot = this.slot.createSave();
        save.state = this.state;
        save.lvl = this.lvl;
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
        if (save.setting !== undefined) this.setting = save.setting;
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
        initiateSynthBldg();
    },
    stageButton(id) {
        if (this.state === "staged" && this.setting === synthToggle.DESYNTH) this.desynth();
        if (this.state === "staged" && this.setting === synthToggle.RESYNTH) this.resynth(id);
        if (this.state === "complete") this.collectSynth();
    },
    desynth() {
        if (this.state !== "staged") return;
        let id = null;
        if (this.slot.rarity === 1) id = "M700";
        if (this.slot.rarity === 2) id = "M701";
        if (this.slot.rarity === 3) id = "M702";
        const amt = Math.max(1,Math.floor(this.slot.item.craftTime / 4000));
        ResourceManager.addMaterial(id,amt);
        Notifications.synthCollect(ResourceManager.idToMaterial(id).name,amt);
        this.slot.rarity -= 1;
        this.state = "complete";
        refreshSynthStage();
    },
    resynth(id) {
        if (this.state !== "staged") return;
        const amt = Math.max(1,Math.floor(this.slot.item.craftTime / 4000));
        if (!ResourceManager.available(id,amt)) {
            Notifications.insufficientResynthMats();
            return;
        }
        ResourceManager.addMaterial(id,-amt);
        this.slot.transform(this.resynthChange(id));
        refreshResynth();
    },
    collectSynth() {
        if (this.state !== "complete") return;
        if (Inventory.full()) {
            Notifications.synthCollectInvFull();
            return;
        }
        Inventory.addToInventory(this.slot);
        this.slot = null;
        this.state = "empty";
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
        const options = [];
        if (this.slot.powRatio === 3 || this.slot.hpRatio === 3) {
            options.push("M702");
        }
        else {
            options.push("M700");
            options.push("M701");
        }
        return options;
    },
    resynthChange(id) {
        const change = [0,0];
        if (this.slot === null) return change;
        if (id === "M700") {
            if (this.slot.hpRatio === 1) {
                change[0] = 1;
                change[1] = -1;
            }
            else {
                change[0] = -1;
                change[1] = 1;
            }
        }
        if (id === "M701") {
            if (this.slot.hpRatio === 2) {
                change[0] = 1;
                change[1] = -1;
            }
            else {
                change[0] = -1;
                change[1] = 1;
            }
        }
        if (id === "M702") {
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
    $("<div/>").addClass("synthSlot").attr({"id":"synthSlot"}).appendTo($synthSide);

    // Desynth Reward
    const desynthRewards = $("<div/>").addClass("desynthRewards").attr({"id":"desynthRewards"}).appendTo($synthSide);
        $("<div/>").addClass("synthRewardHeader").html("Material Extraction").appendTo(desynthRewards);
        const synthReward = $("<div/>").addClass("synthReward").appendTo(desynthRewards);
            $("<div/>").addClass("synthRewardCard").attr({"id":"synthRewardCard"}).appendTo(synthReward);
            $("<div/>").addClass("synthRewardAmt").attr({"id":"synthRewardAmt"}).appendTo(synthReward);
    
            // Synth Reward
    $("<div/>").addClass("resynthCost").attr({"id":"resynthCost"}).appendTo($synthSide);
}

function refreshSynthInventory() {
    $synthListContainer.empty();
    const d1 = $("<div/>").addClass('synthListCardsContainer').appendTo($synthListContainer);
    if (Inventory.higherRarity().length === 0) $("<div/>").addClass("emptyContentMessage").html(displayText('synthesizer_inventory_empty')).appendTo($synthListContainer)
    Inventory.higherRarity().forEach(container => {
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
    $(".synthSlotAction").addClass("tooltip").attr({"data-tooltip":"material_desc","data-tooltip-value":reward.id});
    refreshSynthStage();
}

function refreshResynth() {
    $("#desynthRewards").hide();
    if (SynthManager.setting === synthToggle.RESYNTH) {
        $(".synthPowerSetting").removeClass("synthPowerEnabled");
        $("#synthPowerResynthesis").addClass("synthPowerEnabled");
    }
    if (SynthManager.state === "empty") return $("#resynthCost").hide();
    $("#resynthCost").show().empty();
    const ids = SynthManager.resynthCosts();
    ids.forEach(id => {
        $("#resynthCost").append(createSynthOption(id));
    });
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
    $("#synthBar").attr("data-label",synthAmt);
    $("#synthFill").css('width', synthWidth);
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
    const id = $(e.currentTarget).data("mid");
    SynthManager.stageButton(id);
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

function createSynthOption(id) {
    const container = SynthManager.slot;
    if (!container) return;
    const amt = Math.max(1,Math.floor(SynthManager.slot.item.craftTime / 4000));
    const itemdiv = $("<div/>").addClass("synthItem").addClass("R"+container.rarity);
    $("<div/>").addClass("itemName").attr({"id": container.id, "r": container.rarity}).html(container.picName()).appendTo(itemdiv);
    $("<div/>").addClass("itemLevel tooltip").attr({"data-tooltip": "item_level"}).html(container.itemLevel()).appendTo(itemdiv);
    $("<div/>").addClass(`itemRarity RT${container.rarity} tooltip`).attr({"data-tooltip": `rarity_${rarities[container.rarity].toLowerCase()}`}).html(miscIcons.rarity).appendTo(itemdiv);
    const itemProps = $("<div/>").addClass("equipStats").appendTo(itemdiv);
    const synthStatProps = SynthManager.resynthChange(id);
    console.log(container.itemStat(0, synthStatProps[0], synthStatProps[1]));
    for (const [stat, val] of Object.entries(container.itemStat(0, synthStatProps[0], synthStatProps[1]))) {
        if (val === 0) continue;
            const ed = $("<div/>").addClass("gearStat tooltip").attr("data-tooltip", stat).appendTo(itemProps);
                $("<div/>").addClass(`${stat}_img`).html(miscIcons[stat]).appendTo(ed);
                $("<div/>").addClass(`${stat}_integer statValue`).html(val).appendTo(ed);
    };
    $("<div/>").addClass("synthSlotAction").data({"mid":id}).html(`Synth for ${amt} ${ResourceManager.materialIcon(id)}`).appendTo(itemdiv);
    return itemdiv;
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
    const synthBar = createSynthBar().addClass("synthBarHidden");
    const synthButton = $("<div/>").addClass("synthSlotAction actionButtonCard");
    itemdiv.append(itemName,itemLevel,itemRarity,itemProps,stageRemove,synthBar,synthButton);
    if (SynthManager.state === "staged" && SynthManager.setting === synthToggle.RESYNTH) {
        synthBar.addClass("synthBarHidden");
        synthButton.hide();
    }
    if (SynthManager.state === "staged" && SynthManager.setting === synthToggle.DESYNTH) {
        synthBar.addClass("synthBarHidden");
        synthButton.show().html("Desynthesize");
    }
    if (SynthManager.state === "complete") {
        synthBar.addClass("synthBarHidden");
        synthButton.html("Collect Item").show();
        stageRemove.hide();
    }
    return itemdiv;
};