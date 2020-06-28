"use strict";

let stopSave = false;


function ClearSave() {
    localStorage.removeItem("ffgs1");
    location.replace('/');
}

function ExportSave() {
    const saveFile = createSaveExport();
    $("#exportSaveText").val(saveFile);
    ga('send', 'event', 'Save', 'export', 'export');
}

function ImportSaveButton() {
    stopSave = true;
    const unpako = atob($('#importSaveText').val());
    const saveFile = JSON.parse(pako.ungzip(unpako,{ to: 'string' }));
    localStorage.setItem('ffgs1', saveFile);
    location.replace('/');
}

function forceSaveChange(string) {
    localStorage.setItem('ffgs1', string);
    location.replace('/');
}

let saveTime = 0;

function saveGame(ms) {
    saveTime += ms;
    if (saveTime < 5000) return;
    saveTime = 0;
    if (stopSave) return;
    localStorage.setItem('ffgs1', createSave());
    ga('send', 'event', 'Save', 'savegame', 'savegame');
}

function forceSave() {
    localStorage.setItem('ffgs1', createSave());
}

function createSave() {
    const saveFile = {}
    saveFile["ver"] = 0
    saveFile["as"] = actionSlotManager.createSave();
    saveFile["d"] = DungeonManager.createSave();
    saveFile["h"] = HeroManager.createSave();
    saveFile["i"] = Inventory.createSave();
    saveFile["r"] = recipeList.createSave();
    saveFile["rs"] = ResourceManager.createSave();
    saveFile["w"] = WorkerManager.createSave();
    saveFile["ac"] = achievementStats.createSave();
    saveFile["ds"] = SynthManager.createSave();
    saveFile["fb"] = FusionManager.createSave();
    saveFile["bb"] = BankManager.createSave();
    saveFile["bs"] = bloopSmith.createSave();
    saveFile["fo"] = FortuneManager.createSave();
    saveFile["tm"] = TownManager.createSave();
    saveFile["gsm"] = GuildSeedManager.createSave();
    saveFile["g"] = GuildManager.createSave();
    saveFile["sh"] = Shop.createSave();
    saveFile["t"] = TinkerManager.createSave();
    saveFile["m"] = Museum.createSave();
    saveFile["pb"] = PlaybookManager.createSave();
    saveFile["q"] = QuestManager.createSave();
    saveFile["saveTime"] = Date.now();
    return JSON.stringify(saveFile);
}

function createSaveExport() {
    const save = createSave();
    const pakoSave = pako.gzip(JSON.stringify(save),{ to: 'string' });
    return btoa(pakoSave);
}

function loadGame() {
    //populate itemCount with blueprints as a base
    let loadGame = JSON.parse(localStorage.getItem("ffgs1"));
    if (loadGame === null) return false;
    //aka there IS a file
    loadGame = saveUpdate(loadGame);
    if (typeof loadGame["as"] !== "undefined") actionSlotManager.loadSave(loadGame["as"]);
    if (typeof loadGame["d"] !== "undefined") DungeonManager.loadSave(loadGame["d"]);
    if (typeof loadGame["h"] !== "undefined") HeroManager.loadSave(loadGame["h"]);
    if (typeof loadGame["i"] !== "undefined") Inventory.loadSave(loadGame["i"]);
    if (typeof loadGame["r"] !== "undefined") recipeList.loadSave(loadGame["r"]);
    if (typeof loadGame["rs"] !== "undefined") ResourceManager.loadSave(loadGame["rs"]);
    if (typeof loadGame["w"] !== "undefined") WorkerManager.loadSave(loadGame["w"]);
    if (typeof loadGame["ac"] !== "undefined") achievementStats.loadSave(loadGame["ac"]);
    if (typeof loadGame["ds"] !== "undefined") SynthManager.loadSave(loadGame["ds"]);
    if (typeof loadGame["fb"] !== "undefined") FusionManager.loadSave(loadGame["fb"]);
    if (typeof loadGame["bb"] !== "undefined") BankManager.loadSave(loadGame["bb"]);
    if (typeof loadGame["bs"] !== "undefined") bloopSmith.loadSave(loadGame["bs"]);
    if (typeof loadGame["fo"] !== "undefined") FortuneManager.loadSave(loadGame["fo"]);
    if (typeof loadGame["tm"] !== "undefined") TownManager.loadSave(loadGame["tm"]);
    if (typeof loadGame["gsm"] !== "undefined") GuildSeedManager.loadSave(loadGame["gsm"]);
    if (typeof loadGame["g"] !== "undefined") GuildManager.loadSave(loadGame["g"]);
    if (typeof loadGame["sh"] !== "undefined") Shop.loadSave(loadGame["sh"]);
    if (typeof loadGame["t"] !== "undefined") TinkerManager.loadSave(loadGame["t"]);
    if (typeof loadGame["m"] !== "undefined") Museum.loadSave(loadGame["m"]);
    if (typeof loadGame["pb"] !== "undefined") PlaybookManager.loadSave(loadGame["pb"]);
    if (typeof loadGame['q'] !== "undefined") QuestManager.loadSave(loadGame["q"]);
    return true;
}

function saveUpdate(loadGame) {
    //pre v0.4 save update
    if (loadGame.v !== undefined) {
        loadGame["as"].slots = [];
        //keep dungeon progress
        const dungeonProgress = [];
        if (loadGame['d'].bossesBeat.includes("D010")) dungeonProgress.push({"id":"D401","maxFloor":1});
        if (loadGame['d'].bossesBeat.includes("D011")) dungeonProgress.push({"id":"D402","maxFloor":1});
        if (loadGame['d'].bossesBeat.includes("D012")) dungeonProgress.push({"id":"D403","maxFloor":1});
        if (loadGame['d'].bossesBeat.includes("D013")) dungeonProgress.push({"id":"D404","maxFloor":1});
        if (loadGame['d'].bossesBeat.includes("D014")) dungeonProgress.push({"id":"D405","maxFloor":1});
        if (loadGame['d'].bossesBeat.includes("D015")) dungeonProgress.push({"id":"D406","maxFloor":1});
        if (loadGame['d'].bossesBeat.includes("D016")) dungeonProgress.push({"id":"D407","maxFloor":1});
        if (loadGame['d'].bossesBeat.includes("D017")) dungeonProgress.push({"id":"D408","maxFloor":1});
        if (loadGame['d'].bossesBeat.includes("D018")) dungeonProgress.push({"id":"D409","maxFloor":1});
        if (loadGame['d'].bossesBeat.includes("D019")) dungeonProgress.push({"id":"D410","maxFloor":1});
        delete loadGame["d"];
        loadGame["d"] = {};
        loadGame["d"].dungeons = dungeonProgress;
        delete loadGame["ds"];
        delete loadGame["f"];
        //update hero.gear1 etc to hero.gearSlots...
        loadGame["h"].forEach(heroSave => {
            heroSave.gearSlots = [];
            if (heroSave.slot1 !== null) {
                const gearslot1 = {};
                gearslot1.lvl = 0;
                gearslot1.gear = heroSave.slot1;
                heroSave.gearSlots.push(gearslot1);
            }
            if (heroSave.slot2 !== null) {
                const gearslot2 = {};
                gearslot2.lvl = 0;
                gearslot2.gear = heroSave.slot2;
                heroSave.gearSlots.push(gearslot2);
            }
            if (heroSave.slot3 !== null) {
                const gearslot3 = {};
                gearslot3.lvl = 0;
                gearslot3.gear = heroSave.slot3;
                heroSave.gearSlots.push(gearslot3);
            }
            if (heroSave.slot4 !== null) {
                const gearslot4 = {};
                gearslot4.lvl = 0;
                gearslot4.gear = heroSave.slot4;
                heroSave.gearSlots.push(gearslot4);
            }
            if (heroSave.slot5 !== null) {
                const gearslot5 = {};
                gearslot5.lvl = 0;
                gearslot5.gear = heroSave.slot5;
                heroSave.gearSlots.push(gearslot5);
            }
            if (heroSave.slot6 !== null) {
                const gearslot6 = {};
                gearslot6.lvl = 0;
                gearslot6.gear = heroSave.slot6;
                heroSave.gearSlots.push(gearslot6);
            }
            if (heroSave.slot7 !== null) {
                const gearslot7 = {};
                gearslot7.lvl = 0;
                gearslot7.gear = heroSave.slot7;
                heroSave.gearSlots.push(gearslot7);
            }
        });

        //guild orders might be fucked
        //shop needs to auto-buy stuff that you unlocked
        delete loadGame["t"];
        GuildManager.guilds.forEach(g=>{
            g.generateNewOrder(1);
            g.generateNewOrder(2);
            g.generateNewOrder(3);
        });
        HeroManager.heroes.forEach(hero => {
            PlaybookManager.idToPlaybook(hero.startingPlaybook).unlocked = true;
        })

        //get all the perks
        loadGame['sh'] = {};
        loadGame['sh'].perks = [];
        //CRAFTING PERKS - guilds
        loadGame['sh'].perks.push({"id":"AL1000","purchased":true});
        loadGame['sh'].perks.push({"id":"AL1001","purchased":true});
        loadGame['sh'].perks.push({"id":"AL1002","purchased":true});
        loadGame['sh'].perks.push({"id":"AL1004","purchased":true});
        // -workers
        loadGame["w"].forEach(workerSave => {
            if (workerSave.id === "WN001" && workerSave.owned) loadGame['sh'].perks.push({"id":"AL1001","purchased":true});
            else if (workerSave.id === "WN002" && workerSave.owned) loadGame['sh'].perks.push({"id":"AL1010","purchased":true});
            else if (workerSave.id === "WN003" && workerSave.owned) loadGame['sh'].perks.push({"id":"AL1017","purchased":true});
            else if (workerSave.id === "WN004" && workerSave.owned) loadGame['sh'].perks.push({"id":"AL1023","purchased":true});
            else if (workerSave.id === "WN101" && workerSave.owned) loadGame['sh'].perks.push({"id":"AL1002","purchased":true});
            else if (workerSave.id === "WN102" && workerSave.owned) loadGame['sh'].perks.push({"id":"AL1011","purchased":true});
            else if (workerSave.id === "WN103" && workerSave.owned) loadGame['sh'].perks.push({"id":"AL1018","purchased":true});
            else if (workerSave.id === "WN104" && workerSave.owned) loadGame['sh'].perks.push({"id":"AL1024","purchased":true});
            else if (workerSave.id === "WN202" && workerSave.owned) loadGame['sh'].perks.push({"id":"AL1008","purchased":true});
            else if (workerSave.id === "WN203" && workerSave.owned) loadGame['sh'].perks.push({"id":"AL1016","purchased":true});
            else if (workerSave.id === "WN204" && workerSave.owned) loadGame['sh'].perks.push({"id":"AL1022","purchased":true});
            else if (workerSave.id === "WN301" && workerSave.owned) loadGame['sh'].perks.push({"id":"AL1004","purchased":true});
            else if (workerSave.id === "WN302" && workerSave.owned) loadGame['sh'].perks.push({"id":"AL1012","purchased":true});
            else if (workerSave.id === "WN303" && workerSave.owned) loadGame['sh'].perks.push({"id":"AL1019","purchased":true});
            else if (workerSave.id === "WN304" && workerSave.owned) loadGame['sh'].perks.push({"id":"AL1025","purchased":true});
        })
        // -crafting slots
        if (loadGame["as"].maxSlots >= 2) loadGame['sh'].perks.push({"id":"AL1003","purchased":true});
        if (loadGame["as"].maxSlots >= 3) loadGame['sh'].perks.push({"id":"AL1006","purchased":true});
        if (loadGame["as"].maxSlots >= 4) loadGame['sh'].perks.push({"id":"AL1009","purchased":true});
        if (loadGame["as"].maxSlots >= 5) loadGame['sh'].perks.push({"id":"AL1014","purchased":true});

        //COMBAT PERKS
        loadGame["h"].forEach(heroSave => {
                 if (heroSave.id === "H001" && heroSave.owned) loadGame['sh'].perks.push({"id":"AL2003","purchased":true});
            else if (heroSave.id === "H002" && heroSave.owned) loadGame['sh'].perks.push({"id":"AL2010","purchased":true});
            else if (heroSave.id === "H003" && heroSave.owned) loadGame['sh'].perks.push({"id":"AL2016","purchased":true});
            else if (heroSave.id === "H004" && heroSave.owned) loadGame['sh'].perks.push({"id":"AL2022","purchased":true});
            else if (heroSave.id === "H101" && heroSave.owned) loadGame['sh'].perks.push({"id":"AL2011","purchased":true});
            else if (heroSave.id === "H102" && heroSave.owned) loadGame['sh'].perks.push({"id":"AL2005","purchased":true});
            else if (heroSave.id === "H103" && heroSave.owned) loadGame['sh'].perks.push({"id":"AL2023","purchased":true});
            else if (heroSave.id === "H104" && heroSave.owned) loadGame['sh'].perks.push({"id":"AL2017","purchased":true});
            else if (heroSave.id === "H201" && heroSave.owned) loadGame['sh'].perks.push({"id":"AL2008","purchased":true});
            else if (heroSave.id === "H202" && heroSave.owned) loadGame['sh'].perks.push({"id":"AL2014","purchased":true});
            else if (heroSave.id === "H203" && heroSave.owned) loadGame['sh'].perks.push({"id":"AL2000","purchased":true});
            else if (heroSave.id === "H204" && heroSave.owned) loadGame['sh'].perks.push({"id":"AL2020","purchased":true});
        })
        loadGame['sh'].perks.push({"id":"AL2001","purchased":true});
        loadGame['sh'].perks.push({"id":"AL2002","purchased":true});
        loadGame['sh'].perks.push({"id":"AL2004","purchased":true});
        loadGame['sh'].perks.push({"id":"AL20051","purchased":true});

        //TOWN PERKS
        loadGame['sh'].perks.push({"id":"AL3000","purchased":true});
        loadGame['sh'].perks.push({"id":"AL3001","purchased":true});
        //get all the buildings
        loadGame["tm"].buildings.forEach(buildingSave => {
            if (buildingSave.id === "TB001" && buildingSave.status > 0) loadGame['sh'].perks.push({"id":"AL3002","purchased":true});
            if (buildingSave.id === "TB002" && buildingSave.status > 0) loadGame['sh'].perks.push({"id":"AL3004","purchased":true});
            if (buildingSave.id === "TB003" && buildingSave.status > 0) loadGame['sh'].perks.push({"id":"AL3003","purchased":true});
            if (buildingSave.id === "TB004" && buildingSave.status > 0) loadGame['sh'].perks.push({"id":"AL3005","purchased":true});
            if (buildingSave.id === "TB005" && buildingSave.status > 0) loadGame['sh'].perks.push({"id":"AL3011","purchased":true});
            if (buildingSave.id === "TB006" && buildingSave.status > 0) loadGame['sh'].perks.push({"id":"AL3013","purchased":true});
        });
        //building levels
        if (loadGame['fb'].lvl >= 2) loadGame['sh'].perks.push({"id":"AL3006","purchased":true});
        if (loadGame['fb'].lvl >= 3) loadGame['sh'].perks.push({"id":"AL3012","purchased":true});
        if (loadGame['bb'].lvl >= 2) loadGame['sh'].perks.push({"id":"AL3008","purchased":true});
        if (loadGame['bb'].lvl >= 3) loadGame['sh'].perks.push({"id":"AL3017","purchased":true});
        if (loadGame['bs'].lvl >= 2) loadGame['sh'].perks.push({"id":"AL3010","purchased":true});
        if (loadGame['bs'].lvl >= 3) loadGame['sh'].perks.push({"id":"AL3016","purchased":true});
        if (loadGame['fo'].lvl >= 2) loadGame['sh'].perks.push({"id":"AL3014","purchased":true});
        if (loadGame['fo'].lvl >= 3) loadGame['sh'].perks.push({"id":"AL3019","purchased":true});
    }


 
    return loadGame;
}

//UI Stuff
$(document).on('click', '#deleteSaveButton', (e) => {
    e.preventDefault();
    ClearSave();
});

$(document).on('click', '#declineSaveButton', (e) => {
    e.preventDefault();
    setDialogClose();
});

$(document).on('click', '#exportSave', () => {
    ExportSave();
});

$(document).on('click', '#importSaveButton', (e) => {
    e.preventDefault();
    ImportSaveButton();
});

$(document).on('click', '#exportSaveCopy', (e) => {
    e.preventDefault();
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val($("#exportSaveText").val()).select();
    document.execCommand("copy");
    $temp.remove();
    $("#exportStatus").html('Copied to Clipboard.');
    setTimeout(() => {$("#exportStatus").empty()}, 3500);
})

$(document).on('click', '#exportSaveLocal', (e) => {
    e.preventDefault();
    downloadSave();
});

function downloadSave() {
    const saveFile = createSaveExport();
    const b = new Blob([saveFile],{type:"text/plain;charset=utf-8"});
    saveAs(b, "ForgeAndFortuneSave.txt");
}

//used for diagnostics
function unPackSave(file) {
    const unpako = atob(file);
    const saveFile = JSON.parse(JSON.parse(pako.ungzip(unpako,{ to: 'string' })));
    return saveFile;
}