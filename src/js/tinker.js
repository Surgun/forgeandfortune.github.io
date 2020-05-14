"use strict";

const $tinkerBuilding = $("#tinkerBuilding");
const $tinkerCommands = $("#tinkerCommands");
const $tinkerRecipes = $("#tinkerRecipes");

class tinkerCommand {
    constructor(props) {
        Object.assign(this, props);
        this.time = 0;
        this.progress = 0;
        this.progressMax = 1000;
        this.lvl = 0;
        this.enabled = false;
        this.paidGold = false;
    }
    createSave() {
        const save = {};
        save.id = this.id;
        save.time = this.time;
        save.progress = this.progress;
        save.lvl = this.lvl;
        save.enabled = this.enabled;
        save.paidGold = this.paygold;
        return save;
    }
    loadSave(save) {
        this.time = save.time;
        this.progress = save.progress;
        this.lvl = save.lvl;
        this.enabled = save.enabled;
        this.paidGold = save.paidGold;
    }
    addTime(ms) {
        if (!this.enabled) return;
        this.paidGold = this.attemptStart();
        if (!this.paidGold) {
            this.time = 0;
            this.enabled = false;
            refreshCommandToggle(this);
            Notifications.tinkerDisable();
            return;
        }
        this.time += ms;
        if (this.time >= this.getTime()) {
            this.time -= this.getTime();
            this.act();
        }
        refreshTinkerProgressBar(this);
    }
    attemptStart() {
        if (this.paidGold) return true;
        if (!ResourceManager.available("M001",this.paidGoldAmt())) return false;
        ResourceManager.addMaterial("M001",-this.paidGoldAmt());
        return true;
    }
    act() {
        this.paidGold = false;
        this.progress += 1;
        if (this.progress === 1000) {
            this.lvl += 1;
            this.progress = 0;
        }
        refreshTinkerLvLBar(this);
        refreshTrinketCompleteCost(this);
    }    
    toggle() {
        this.enabled = !this.enabled;
    }
    getTime() {
        return this.timeCost[this.lvl];
    }
    paidGoldAmt() {
        return this.goldCost[this.lvl];
    }
    completeCost() {
        return 10*(this.progressMax-this.progress)*this.paidGoldAmt();
    }
    completeResearch() {
        if (!ResourceManager.available("M001",this.completeCost())) return Notifications.tinkerResearch();
        ResourceManager.addMaterial("M001",-this.completeCost());
        const recipeID = this.recipeUnlock[this.lvl];
        recipeList.unlockTrinketRecipe(recipeID);
        this.lvl += 1;
        this.progress = 0;
        this.time = 0;
        $(".tinkerRecipes").show();
        refreshTinkerProgressBar(this);
        refreshTinkerLvLBar(this);
        refreshTrinketCompleteCost(this);
        refreshTrinketResearchCost(this);
    }
}

const TinkerManager = {
    commands : [],
    lvl : 0,
    createSave() {
        const save = {};
        save.lvl = this.lvl;
        save.commands = [];
        this.commands.forEach(c => save.commands.push(c.createSave()));
        return save;
    },
    loadSave(save) {
        save.commands.forEach(c => {
            const command = this.idToCommand(c.id);
            command.loadSave(c);
        });
        this.lvl = save.lvl;
    },
    addTime(ms) {
        this.commands.forEach(command => command.addTime(ms));
    },
    idToCommand(id) {
        return this.commands.find(a => a.id === id);
    },
    addCommand(action) {
        this.commands.push(action);
    },
    toggle(commandID) {
        const command = this.idToCommand(commandID);
        command.toggle();
    },
    completeResearch(commandID) {
        const command = this.idToCommand(commandID);
        command.completeResearch();
    }
}

function refreshTinkerCommands() {
    $tinkerCommands.empty();
    const d = $("<div/>").addClass("tinkerRecipes").html("Unlocked Trinket Recipes").data("recipeType","Trinkets").appendTo($tinkerCommands).hide();
    if (Math.max(...TinkerManager.commands.map(r=>r.lvl)) > 0) d.show();
    TinkerManager.commands.forEach(command => {
        createTinkerCommand(command).appendTo($tinkerCommands);
    })
}

function createTinkerCommand(command) {
    const d = $("<div/>").addClass("tinkerCommand");
    $("<div/>").addClass("tinkerCommandName").html(command.name).appendTo(d);
    createTinkerProgressBar(command).appendTo(d);
    createTinkerLvlBar(command).appendTo(d);
    const d1 = $("<div/>").addClass("tinkerCommandInline").data("cid",command.id).appendTo(d);
        if (command.enabled) $("<div/>").addClass("tinkerCommandToggle toggleEnable").attr("id","ct"+command.id).html(`${miscIcons.toggleOn} Enabled`).appendTo(d1);
        else $("<div/>").addClass("tinkerCommandToggle toggleDisable").attr("id","ct"+command.id).html(`${miscIcons.toggleOff} Disabled`).appendTo(d1);
        $("<div/>").addClass("tinkerCommandResearchCost").attr("id","tcrc"+command.id).html(`Research Cost: ${miscIcons.gold} ${command.paidGoldAmt()}`).appendTo(d1);
    $("<div/>").addClass("completeCommand").attr("id","tcc"+command.id).data("cid",command.id).html(`Complete for ${miscIcons.gold} ${command.completeCost()}`).appendTo(d);
    return d;
}

function refreshTrinketCompleteCost(command) {
    $("#tcc"+command.id).html(`Complete for ${miscIcons.gold} ${command.completeCost()}`);
}

function refreshTrinketResearchCost(command) {
    $("#tcrc"+command.id).html(`Research Cost: ${miscIcons.gold} ${command.paidGoldAmt()}`);
}

function createTinkerProgressBar(command) {
    const commandBarPercent = command.time/command.getTime();
    const commandBarText = msToTime(command.getTime()-command.time);
    const commandBarWidth = (commandBarPercent*100).toFixed(1)+"%";
    const options = {
        tooltip: "commandTime",
        icon: miscIcons.commandTime,
        text: commandBarText,
        textID: "cb"+command.id,
        width: commandBarWidth,
        fill: "cbf"+command.id,
    }
    return generateProgressBar(options);
}

function refreshTinkerProgressBar(command) {
    const commandBarPercent = command.time/command.getTime();
    const commandBarText = msToTime(command.getTime()-command.time);
    const commandBarWidth = (commandBarPercent*100).toFixed(1)+"%";
    $(`#cb${command.id}`).html(commandBarText);
    $(`#cbf${command.id}`).css('width', commandBarWidth);
}

function createTinkerLvlBar(command) {
    const commandBarPercent = command.progress/1000;
    const commandBarWidth = (commandBarPercent*100).toFixed(1)+"%";
    const commandBarText = `Level ${command.lvl} (${commandBarWidth})`;
    const options = {
        tooltip: "commandProgress",
        icon: miscIcons.commandProgress,
        text: commandBarText,
        textID: "cbp"+command.id,
        width: commandBarWidth,
        fill: "cbpf"+command.id,
    }
    return generateProgressBar(options);
}

function refreshTinkerLvLBar(command) {
    const commandBarPercent = command.progress/1000;
    const commandBarWidth = (commandBarPercent*100).toFixed(1)+"%";
    const commandBarText = `Level ${command.lvl} (${commandBarWidth})`;
    $(`#cbp${command.id}`).html(commandBarText);
    $(`#cbpf${command.id}`).css('width', commandBarWidth);
}

function initiateTinkerBldg () {
    $tinkerBuilding.show();
    refreshTinkerCommands();
}

//toggle command
$(document).on('click','.tinkerCommandInline', (e) => {
    e.preventDefault();
    const commandID = $(e.currentTarget).data("cid");
    TinkerManager.toggle(commandID);
    const command = TinkerManager.idToCommand(commandID);
    refreshCommandToggle(command);
});

//purchase advancement
$(document).on('click','.completeCommand', (e) => {
    e.preventDefault();
    const commandID = $(e.currentTarget).data("cid");
    TinkerManager.completeResearch(commandID);
});

$(document).on('click','.tinkerRecipes', (e) => {
    e.preventDefault();
    equipHeroRecipesButton(e);
})

function refreshCommandToggle(command) {
    if (command.enabled) $("#ct"+command.id).removeClass("toggleDisable").addClass("toggleEnable").html(`${miscIcons.toggleOn} Enabled`);
    else $("#ct"+command.id).removeClass("toggleEnable").addClass("toggleDisable").html(`${miscIcons.toggleOff} Disabled`);
}