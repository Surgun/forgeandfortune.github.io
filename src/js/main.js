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
        achievementStats.startTime = Date.now();
        GuildManager.guilds.forEach(g=>{
            g.generateNewOrder(1);
            g.generateNewOrder(2);
            g.generateNewOrder(3);
        });
        pregearHeroes();
        HeroManager.heroes.forEach(hero => {
            PlaybookManager.idToPlaybook(hero.startingPlaybook).unlocked = true;
        })
    }
    tabHide();
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
    recipeList.recipeFilterType = "Knives";
    recipeList.recipeFilterString = "";
    recipeFilterList();
    refreshCraftTimes();
    GuildManager.repopulateUnmastered();
    refreshAllRecipeMastery();
    refreshTutorial();
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
    actionSlotManager.addTime(elapsedTime);
    actionSlotVisualManager.updateSlots();
    PatchManager.patchTimer(elapsedTime);
    TinkerManager.addTime(elapsedTime);
    QuestManager.addTime(elapsedTime);
    if (TownManager.purgeSlots) {
        actionSlotManager.removeBldgSlots();
        TownManager.purgeSlots = false;
    }
    Tutorial.monitor();
}

function pregearHeroes() {
    const Alok = HeroManager.idToHero("H201");
    Alok.equip(new itemContainer("R13001",1));
    Alok.equip(new itemContainer("R2301",1));
    Alok.equip(new itemContainer("R3301",1));
    Alok.equip(new itemContainer("R4301",1));
    Alok.equip(new itemContainer("R5301",1));
    Alok.equip(new itemContainer("R6301",1));

    const Cedric = HeroManager.idToHero("H002");
    Cedric.equip(new itemContainer("R12001",1));
    Cedric.equip(new itemContainer("R2101",1));
    Cedric.equip(new itemContainer("R3101",1));
    Cedric.equip(new itemContainer("R4101",1));
    Cedric.equip(new itemContainer("R5101",1));
    Cedric.equip(new itemContainer("R6501",1));

    const Zoe = HeroManager.idToHero("H101");
    Zoe.equip(new itemContainer("R11001",1));
    Zoe.equip(new itemContainer("R2201",1));
    Zoe.equip(new itemContainer("R3201",1));
    Zoe.equip(new itemContainer("R4201",1));
    Zoe.equip(new itemContainer("R5501",1));
    Zoe.equip(new itemContainer("R6201",1));

    const Grogmar = HeroManager.idToHero("H202");
    Grogmar.equip(new itemContainer("R13002",1));
    Grogmar.equip(new itemContainer("R2302",1));
    Grogmar.equip(new itemContainer("R3302",1));
    Grogmar.equip(new itemContainer("R4302",1));
    Grogmar.equip(new itemContainer("R5302",1));
    Grogmar.equip(new itemContainer("R6302",1));

    const Grim = HeroManager.idToHero("H003");
    Grim.equip(new itemContainer("R12002",1));
    Grim.equip(new itemContainer("R2102",1));
    Grim.equip(new itemContainer("R3102",1));
    Grim.equip(new itemContainer("R4102",1));
    Grim.equip(new itemContainer("R5102",1));
    Grim.equip(new itemContainer("R6502",1));

    const Troy = HeroManager.idToHero("H104");
    Troy.equip(new itemContainer("R11002",1));
    Troy.equip(new itemContainer("R2202",1));
    Troy.equip(new itemContainer("R3202",1));
    Troy.equip(new itemContainer("R4202",1));
    Troy.equip(new itemContainer("R5502",1));
    Troy.equip(new itemContainer("R6202",1));

    const Caeda = HeroManager.idToHero("H204");
    Caeda.equip(new itemContainer("R13003",2));
    Caeda.equip(new itemContainer("R2303",2));
    Caeda.equip(new itemContainer("R3303",2));
    Caeda.equip(new itemContainer("R4303",2));
    Caeda.equip(new itemContainer("R5303",2));
    Caeda.equip(new itemContainer("R6303",2));

    const Lambug = HeroManager.idToHero("H004");
    Lambug.equip(new itemContainer("R12003",2));
    Lambug.equip(new itemContainer("R2103",2));
    Lambug.equip(new itemContainer("R3103",2));
    Lambug.equip(new itemContainer("R4103",2));
    Lambug.equip(new itemContainer("R5103",2));
    Lambug.equip(new itemContainer("R6503",2));

    const Titus = HeroManager.idToHero("H103");
    Titus.equip(new itemContainer("R11003",2));
    Titus.equip(new itemContainer("R2203",2));
    Titus.equip(new itemContainer("R3203",2));
    Titus.equip(new itemContainer("R4203",2));
    Titus.equip(new itemContainer("R5503",2));
    Titus.equip(new itemContainer("R6203",2));
}

