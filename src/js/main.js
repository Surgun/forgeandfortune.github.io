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
    }
    refreshMasteryBar()
    refreshInventory();
    refreshSideWorkers();
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
    refreshCraftTimes();
    GuildManager.repopulateUnmastered();
    refreshAllRecipeMastery();
    preloader.contentLoaded();
}

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
    SynthManager.addTime(elapsedTime);
    actionSlotManager.addTime(elapsedTime);
    actionSlotVisualManager.updateSlots();
    PatchManager.patchTimer(elapsedTime);
    TinkerManager.addTime(elapsedTime);
    if (TownManager.purgeSlots) {
        actionSlotManager.removeBldgSlots();
        TownManager.purgeSlots = false;
    }
}