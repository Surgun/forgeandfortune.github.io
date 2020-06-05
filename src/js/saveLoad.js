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
    saveFile["v"] = "0334"
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
    saveFile["al"] = Shop.createSave();
    saveFile["t"] = TinkerManager.createSave();
    saveFile["m"] = Museum.createSave();
    saveFile["pb"] = PlaybookManager.createSave();
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
    if (typeof loadGame["al"] !== "undefined") Shop.loadSave(loadGame["al"]);
    if (typeof loadGame["t"] !== "undefined") TinkerManager.loadSave(loadGame["t"]);
    if (typeof loadGame["m"] !== "undefined") Museum.loadSave(loadGame["m"]);
    if (typeof loadGame["pb"] !== "undefined") PlaybookManager.loadSave(loadGame["pb"]);
    return true;
}

function saveUpdate(loadGame) {
    if (loadGame.v === "0202") {
        loadGame.v = "03";
        //remove E008 because we killed it (it was auto craft sac)
        loadGame["e"].events = loadGame["e"].events.filter(e => e.id !== "E008");
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