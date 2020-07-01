"use strict";

const synthToggle = Object.freeze({DESYNTH:0,RESYNTH:1});

const $synthSide = $("#synthSide");

const SynthManager = {
    slot : null,
    setting : synthToggle.DESYNTH,
    lvl : 1,
    createSave() {
        const save = {};
        save.lvl = this.lvl;
        return save;
    },
    loadSave(save) {
        if (save.lvl !== undefined) this.lvl = save.lvl;
    },
    toggleStatus(status) {
        if (status === synthToggle.DESYNTH && this.setting !== synthToggle.DESYNTH) {
            this.setting = synthToggle.DESYNTH;
            refreshDesynth();
        }
        if (status === synthToggle.RESYNTH && this.setting !== synthToggle.RESYNTH && this.lvl > 1) {
            this.setting = synthToggle.RESYNTH;
            refreshResynth();
        }
        refreshSynthStage();
    },
    addSynth(containerID) {
        this.slot = Inventory.containerToItem(containerID);
        refreshSynthStage();
    },
    removeSynth() {
        this.slot = null;
        initiateSynthBldg();
    },
    stageButton(id) {
        if (this.slot !== null && this.setting === synthToggle.DESYNTH) this.desynth();
        if (this.slot !== null && this.setting === synthToggle.RESYNTH) this.resynth(id);
    },
    desynth() {
        if (this.slot === null) return;
        let id = null;
        if (this.slot.rarity === 1) id = "M700";
        if (this.slot.rarity === 2) id = "M701";
        if (this.slot.rarity === 3) id = "M702";
        ResourceManager.addMaterial(id,this.amt());
        Notifications.popToast("synth_collect",ResourceManager.idToMaterial(id).name,this.amt());
        this.slot.rarity -= 1;
        if (this.slot.rarity === 0) this.slot = null;
        refreshSynthStage();
        refreshSynthInventory();
    },
    resynth() {
        if (this.slot === null) return;
        const type = this.slot.item.resynth;
        if (!ResourceManager.available(type,this.resynthAmt())) {
            Notifications.popToast("insufficient_resynth_mats");
            return;
        }
        ResourceManager.addMaterial(type,-this.resynthAmt());
        this.slot.transform();
        refreshResynth();
        refreshSynthInventory();
    },
    desynthRewards(increase) {
        const mod = increase ? 1 : 0;
        if (this.slot === null) return null;
        const reward = {};
        if (this.slot.rarity + mod === 1) reward.id = "M700";
        if (this.slot.rarity + mod === 2) reward.id = "M701";
        if (this.slot.rarity + mod === 3) reward.id = "M702";
        reward.amt = this.amt();
        return reward;
    },
    amt() {
        if (this.slot === null) return 0;
        return Math.max(1,Math.floor(this.slot.item.craftTime / 4000));
    },
    resynthAmt() {
        if (this.slot === null) return 0;
        const type = this.slot.item.resynth;
        if (type === "M700") return 140;
        if (type === "M701") return 50;
        if (type === "M702") return 2;
    }
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
    SynthManager.slot = null;
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
        $("<div/>").addClass("synthPowerSetting actionButton actionButtonAnimDisabled").attr({"id":"synthPowerDesynthesis"}).html(displayText('synthesizer_desynth_setting')).appendTo(synthSettingOptions);
        $("<div/>").addClass("synthPowerSetting synthPowerSettingLocked actionButton actionButtonAnimDisabled").attr({"id":"synthPowerResynthesis"}).html(`<i class='fas fa-lock'></i>${displayText('synthesizer_synth_setting')}`).appendTo(synthSettingOptions);
    
    // Synth Slot
    $("<div/>").addClass("synthSlot").attr({"id":"synthSlot"}).appendTo($synthSide);

    //how it works
    const synthTutorial = $("<div/>").addClass("desynthRewards").appendTo($synthSide);
    $("<div/>").addClass("synthTutHeader").html(displayText("synthesizer_tutorial_head_title")).appendTo(synthTutorial);
    $("<div/>").addClass("synthTutDesc").attr("id","resynthTut").html(displayText("synthesizer_tutorial_resynth_desc")).appendTo(synthTutorial);
    $("<div/>").addClass("synthTutDesc").attr("id","desynthTut").html(displayText("synthesizer_tutorial_desynth_desc")).appendTo(synthTutorial);
}

function refreshSynthInventory() {
    $synthListContainer.empty();
    const d1 = $("<div/>").addClass('synthListCardsContainer').appendTo($synthListContainer);
    if (Inventory.higherRarity().length === 0) $("<div/>").addClass("emptyContentMessage").html(displayText('synthesizer_inventory_empty')).appendTo($synthListContainer)
    Inventory.higherRarity().forEach(container => {
        if (container.item.type === "Trinkets") return;
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
    $("#desynthTut").show();
    $("#resynthTut").hide();
    if (SynthManager.setting === synthToggle.DESYNTH) {
        $(".synthPowerSetting").removeClass("synthPowerEnabled");
        $("#synthPowerDesynthesis").addClass("synthPowerEnabled");
    }
    refreshSynthStage();
}

function refreshResynth() {
    $("#desynthTut").hide();
    $("#resynthTut").show();
    if (SynthManager.setting === synthToggle.RESYNTH) {
        $(".synthPowerSetting").removeClass("synthPowerEnabled");
        $("#synthPowerResynthesis").addClass("synthPowerEnabled");
    }
    refreshSynthStage();
}

function refreshSynthButtons() {
    if (SynthManager.lvl >= 2) $("#synthPowerResynthesis").removeClass("synthPowerSettingLocked").html(displayText('synthesizer_synth_setting'));
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

function createSynthCard(container) {
    const itemdiv = $("<div/>").addClass("synthItem").addClass("R"+container.rarity);
    const itemName = $("<div/>").addClass("itemName").attr({"id": container.id, "r": container.rarity}).html(container.picName());
    const itemRarity = $("<div/>").addClass(`itemRarity RT${container.rarity} tooltip`).attr({"data-tooltip": `rarity_${rarities[container.rarity].toLowerCase()}`}).html(miscIcons.rarity);
    const itemLevel = $("<div/>").addClass("itemLevel").html(container.itemLevel());
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
    const itemLevel = $("<div/>").addClass("itemLevel").html(container.itemLevel());
    const itemRarity = $("<div/>").addClass(`itemRarity RT${container.rarity} tooltip`).attr({"data-tooltip": `rarity_${rarities[container.rarity].toLowerCase()}`}).html(miscIcons.rarity);
    const itemProps = $("<div/>").addClass("equipStats");
    const stageRemove = $('<div/>').addClass("synthRemove").attr("id","synthRemove").html(`<i class="fas fa-times"></i>`);
    for (const [stat, val] of Object.entries(container.itemStat(false))) {
        if (val === 0) continue;
            const ed = $("<div/>").addClass("gearStat tooltip").attr("data-tooltip", stat).appendTo(itemProps);
                $("<div/>").addClass(`${stat}_img`).html(miscIcons[stat]).appendTo(ed);
                $("<div/>").addClass(`${stat}_integer statValue`).html(val).appendTo(ed);
    };
    const synthButton = $("<div/>").addClass("synthSlotAction");
    if (SynthManager.setting === synthToggle.RESYNTH) { 
        synthButton.addClass('actionButtonCardCost');
        $("<div/>").addClass('actionButtonCardText').html(displayText('synthesizer_synth_assign_button')).appendTo(synthButton);
        $("<div/>").addClass('actionButtonCardValue tooltip').attr({"data-tooltip":"material_desc","data-tooltip-value":container.item.resynth}).html(`${ResourceManager.materialIcon(container.item.resynth)} ${SynthManager.resynthAmt()}`).appendTo(synthButton);
    }
    if (SynthManager.setting === synthToggle.DESYNTH) synthButton.addClass('actionButtonCard').html(displayText('synthesizer_desynth_assign_button'));
    return itemdiv.append(itemName,itemLevel,itemRarity,itemProps,stageRemove,synthButton);
};