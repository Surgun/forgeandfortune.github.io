"use strict";

const player = {
    saveStart : Date.now(),
    lastTime : Date.now(),
    timeWarp : 1,
}

function afterLoad() {
    $("#versionNum").html(PatchManager.lastVersion());
    refreshPatchNotes();
    initializeRecipes();
    initializeMats();
    if (!loadGame()) {
        WorkerManager.gainWorker("WN201");
        recipeList.idToItem("R13001").owned = true;
        HeroManager.idToHero("H203").owned = true;
        achievementStats.startTime = Date.now();
        GuildManager.guilds.forEach(g=>{
            g.generateNewOrder(1);
            g.generateNewOrder(2);
            g.generateNewOrder(3);
        });
        DungeonManager.dungeonPaid.push("D001");
    }
    refreshMasteryBar()
    refreshInventory();
    refreshSideWorkers();
    initializeHeroList();
    refreshRecipeFilters();
    hardMatRefresh();
    refreshProgress();
    initializeSideBarDungeon();
    refreshSideTown();
    refreshCraftedCount();
    initializeGuilds();
    refreshInventoryPlaces();
    recipeList.canCraft();
    checkCraftableStatus();
    player.lastTime = Date.now();
    setInterval(mainLoop, 10);
    recipeList.recipeFilterType = "Light";
    recipeList.recipeFilterString = "";
    recipeFilterList();
    populateTinkerRange();
    initiateMonsterHall();
    refreshMonsterReward();
    refreshMonsterRewardLines();
    refreshCraftTimes();
    GuildManager.repopulateUnmastered();
    refreshAllRecipeMastery();
    townTabVisibility();
    loading_screen.finish();
}

/* Load Message Selection */
const loadMessages = [
    "Spreading misinformation.",
    "Rewriting all of the code.",
    "Delaying Version 0.4.",
    "Getting ducks in a row.",
    "Increasing functionality by 19%.",
    "Making bad puns.",
    "Learning Javascript.",
    "Translating Latin.",
    "Temporarily reviewing accounts.",
    "Recoloring sprites.",
    "Hyping Elites.",
    "Leaking outdated information.",
    "Rebooting idea machine.",
    "Sourcing locally grown lettuce.",
    "Finding cute animal gifs.",
    "Introducing game breaking bugs.",
    "Lowering self esteem.",
    "Redesigning game...again.",
    "Deleting important files.",
    "2 + 2 = 4 - 1 = 3"
];

function selectLoadMessage() {
    const randomNumber = Math.floor(Math.random()*loadMessages.length);
    return loadMessages[randomNumber];
}

const loading_screen = pleaseWait({
    logo: "images/site-logo.png",
    backgroundColor: 'var(--bg-primary)',
    loadingHtml: `
    <div class="loadingMessage">${selectLoadMessage()}</div>
    <div class="spinner"></div>
    `
});

loadMisc(); //the others are loaded in order
openTab("recipesTab");

function mainLoop() {
    let elapsedTime = (Date.now()-player.lastTime)*player.timeWarp;
    elapsedTime = Math.min(elapsedTime,28800000);
    achievementStats.setTimePlayed(elapsedTime);
    saveGame(Date.now()-player.lastTime);
    player.lastTime = Date.now();
    DungeonManager.addTime(elapsedTime);
    FusionManager.addTime(elapsedTime);
    DesynthManager.addTime(elapsedTime);
    actionSlotManager.addTime(elapsedTime);
    actionSlotVisualManager.updateSlots();
    PatchManager.patchTimer(elapsedTime);
    TinkerManager.addTime(elapsedTime);
    if (TownManager.purgeSlots) {
        actionSlotManager.removeBldgSlots();
        TownManager.purgeSlots = false;
    }
}

const $townTabLink = $("#townTabLink");

function townTabVisibility() {
    if (DungeonManager.killedFirstBoss()) $townTabLink.show();
    else $townTabLink.hide();
}