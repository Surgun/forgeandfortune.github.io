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
    saveFile["v"] = "03"
    saveFile["as"] = actionSlotManager.createSave();
    saveFile["d"] = DungeonManager.createSave();
    saveFile["e"] = EventManager.createSave();
    saveFile["h"] = HeroManager.createSave();
    saveFile["i"] = Inventory.createSave();
    saveFile["r"] = recipeList.createSave();
    saveFile["rs"] = ResourceManager.createSave();
    saveFile["w"] = WorkerManager.createSave();
    saveFile["ac"] = achievementStats.createSave();
    saveFile["fb"] = FusionManager.createSave();
    saveFile["bb"] = BankManager.createSave();
    saveFile["bs"] = bloopSmith.createSave();
    saveFile["fo"] = FortuneManager.createSave();
    saveFile["tm"] = TownManager.createSave();
    saveFile["gsm"] = GuildSeedManager.createSave();
    saveFile["g"] = GuildManager.createSave();
    saveFile["al"] = ActionLeague.createSave();
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
    if (typeof loadGame["e"] !== "undefined") EventManager.loadSave(loadGame["e"]);
    if (typeof loadGame["h"] !== "undefined") HeroManager.loadSave(loadGame["h"]);
    if (typeof loadGame["i"] !== "undefined") Inventory.loadSave(loadGame["i"]);
    if (typeof loadGame["r"] !== "undefined") recipeList.loadSave(loadGame["r"]);
    if (typeof loadGame["rs"] !== "undefined") ResourceManager.loadSave(loadGame["rs"]);
    if (typeof loadGame["w"] !== "undefined") WorkerManager.loadSave(loadGame["w"]);
    if (typeof loadGame["ac"] !== "undefined") achievementStats.loadSave(loadGame["ac"]);
    if (typeof loadGame["fb"] !== "undefined") FusionManager.loadSave(loadGame["fb"]);
    if (typeof loadGame["bb"] !== "undefined") BankManager.loadSave(loadGame["bb"]);
    if (typeof loadGame["bs"] !== "undefined") bloopSmith.loadSave(loadGame["bs"]);
    if (typeof loadGame["fo"] !== "undefined") FortuneManager.loadSave(loadGame["fo"]);
    if (typeof loadGame["tm"] !== "undefined") TownManager.loadSave(loadGame["tm"]);
    if (typeof loadGame["gsm"] !== "undefined") GuildSeedManager.loadSave(loadGame["gsm"]);
    if (typeof loadGame["g"] !== "undefined") GuildManager.loadSave(loadGame["g"]);
    if (typeof loadGame["al"] !== "undefined") ActionLeague.loadSave(loadGame["al"]);
    return true;
}

function saveUpdate(loadGame) {
    if (loadGame.v === "0202") {
        loadGame.v = "03";
        //remove E008 because we killed it (it was auto craft sac)
        loadGame["e"].events = loadGame["e"].events.filter(e => e.id !== "E008");
        loadGame["e"].oldEvents = loadGame["e"].oldEvents.filter(e => e.id !== "E008");

        //deslot all dungeons too because the format changed
        //and reset all heroes
        delete loadGame["d"];
        loadGame["h"].forEach(hero => {
            hero.ap = 0;
            hero.hp = HeroManager.idToHero(hero.id).maxHP();
            hero.inDungeon = false;
        });

        //deslot crafts just in case they had building  mats crafting
        loadGame["as"].slots = [];

        //worker system and recipe unlock removed, replaced with guild system
        //because of time involved with guilds, set level based off current "clear" to make it easier on player
        loadGame["g"] = {};
        loadGame["g"].guilds = [];
        const locked = loadGame["r"].filter(r => r.owned).map(r => r.id);
        GuildManager.guilds.map(g => g.id).forEach(gid => {
            const repReq = recipeList.recipes.filter(r => r.guildUnlock === gid && locked.includes(r.id)).map(r=>r.repReq);
            const lowest = Math.max(...repReq);
            const guildSave  = {}
            guildSave.id = gid;
            guildSave.rep = 0;
            guildSave.lvl = lowest;
            loadGame["g"].guilds.push(guildSave)
        });        

        //update for fortune building changes
        if (loadGame["tm"].bankUnlock) loadGame["tm"].bankStatus = BuildingState.built;
        else if (loadGame["tm"].bankSee) loadGame["tm"].bankStatus = BuildingState.seen;
        else loadGame["tm"].bankStatus = BuildingState.hidden;

        if (loadGame["tm"].fuseUnlock) loadGame["tm"].fuseStatus = BuildingState.built;
        else if (loadGame["tm"].fuseSee) loadGame["tm"].fuseStatus = BuildingState.seen;
        else loadGame["tm"].fuseStatus = BuildingState.hidden;

        if (loadGame["tm"].smithUnlock) loadGame["tm"].smithStatus = BuildingState.built;
        else if (loadGame["tm"].smithSee) loadGame["tm"].smithStatus = BuildingState.seen;
        else loadGame["tm"].smithStatus = BuildingState.hidden;

        if (loadGame["tm"].fortuneUnlock) loadGame["tm"].fortuneStatus = BuildingState.built;
        else if (loadGame["tm"].fortuneSee) loadGame["tm"].fortuneStatus = BuildingState.seen;
        else loadGame["tm"].fortuneStatus = BuildingState.hidden;

        //setup action league import and unlock perks already owned
        loadGame["al"] = {};
        loadGame["al"].notoriety = 0;
        loadGame["al"].purchased = [];
        loadGame["al"].sanctuaryHeal = [0,0,0,0,0,0,0,0,0,0];
        if (loadGame["w"].find(w=>w.id === "W002").owned) loadGame["al"].purchased.push("AL1002");
        if (loadGame["w"].find(w=>w.id === "W003").owned) loadGame["al"].purchased.push("AL1003");
        if (loadGame["w"].find(w=>w.id === "W004").owned) loadGame["al"].purchased.push("AL1004");
        if (loadGame["w"].find(w=>w.id === "W005").owned) loadGame["al"].purchased.push("AL1005");
        if (loadGame["w"].find(w=>w.id === "W006").owned) loadGame["al"].purchased.push("AL1006");
        if (loadGame["w"].find(w=>w.id === "W007").owned) loadGame["al"].purchased.push("AL1007");
        if (loadGame["w"].find(w=>w.id === "W008").owned) loadGame["al"].purchased.push("AL1008");
        if (loadGame["w"].find(w=>w.id === "W009").owned) loadGame["al"].purchased.push("AL1009");
        if (loadGame["w"].find(w=>w.id === "W010").owned) loadGame["al"].purchased.push("AL1010");
        if (loadGame["w"].find(w=>w.id === "W101").owned) loadGame["al"].purchased.push("AL1011");
        if (loadGame["w"].find(w=>w.id === "W102").owned) loadGame["al"].purchased.push("AL1012");
        if (loadGame["w"].find(w=>w.id === "W103").owned) loadGame["al"].purchased.push("AL1013");
        if (loadGame["w"].find(w=>w.id === "W104").owned) loadGame["al"].purchased.push("AL1014");
        if (loadGame["w"].find(w=>w.id === "W105").owned) loadGame["al"].purchased.push("AL1015");
        if (loadGame["w"].find(w=>w.id === "W106").owned) loadGame["al"].purchased.push("AL1016");
        if (loadGame["w"].find(w=>w.id === "W107").owned) loadGame["al"].purchased.push("AL1017");
        if (loadGame["w"].find(w=>w.id === "W108").owned) loadGame["al"].purchased.push("AL1018");
        if (loadGame["w"].find(w=>w.id === "W109").owned) loadGame["al"].purchased.push("AL1019");
        if (loadGame["w"].find(w=>w.id === "W110").owned) loadGame["al"].purchased.push("AL1020");

        if (loadGame["h"].find(h=>h.id === "H001").owned) loadGame["al"].purchased.push("AL2001");
        if (loadGame["h"].find(h=>h.id === "H002").owned) loadGame["al"].purchased.push("AL2002");
        if (loadGame["h"].find(h=>h.id === "H003").owned) loadGame["al"].purchased.push("AL2003");
        if (loadGame["h"].find(h=>h.id === "H004").owned) loadGame["al"].purchased.push("AL2004");
        if (loadGame["h"].find(h=>h.id === "H101").owned) loadGame["al"].purchased.push("AL2101");
        if (loadGame["h"].find(h=>h.id === "H102").owned) loadGame["al"].purchased.push("AL2102");
        if (loadGame["h"].find(h=>h.id === "H103").owned) loadGame["al"].purchased.push("AL2103");
        if (loadGame["h"].find(h=>h.id === "H104").owned) loadGame["al"].purchased.push("AL2104");
        if (loadGame["h"].find(h=>h.id === "H201").owned) loadGame["al"].purchased.push("AL2201");
        if (loadGame["h"].find(h=>h.id === "H202").owned) loadGame["al"].purchased.push("AL2202");
        if (loadGame["h"].find(h=>h.id === "H204").owned) loadGame["al"].purchased.push("AL2204");

        if (loadGame["as"].maxSlots >= 2) loadGame["al"].purchased.push("AL4001");
        if (loadGame["as"].maxSlots >= 3) loadGame["al"].purchased.push("AL4002");
        if (loadGame["as"].maxSlots >= 4) loadGame["al"].purchased.push("AL4003");
        if (loadGame["as"].maxSlots >= 5) loadGame["al"].purchased.push("AL4004");

        if (loadGame["tm"].bankStatus !== BuildingState.hidden) loadGame["al"].purchased.push("AL4101");
        if (loadGame["tm"].fuseStatus !== BuildingState.hidden) loadGame["al"].purchased.push("AL4102");
        if (loadGame["tm"].smithStatus !== BuildingState.hidden) loadGame["al"].purchased.push("AL4103");
        if (loadGame["tm"].fortuneStatus !== BuildingState.hidden) loadGame["al"].purchased.push("AL4104");

        //now we have to take the highest perk you've bought, and make sure your notoriety matches it... or you have materials higher than the cap... ugh
        const notoReq = loadGame["al"].purchased.map(p => ActionLeague.idToPerk(p).notoReq);
        const maxNoto = Math.max(...notoReq);

        const materialTier = loadGame["rs"].map(r => ResourceManager.idToMaterial(r.id).notoAdd);
        const maxTier = Math.max(...materialTier);

            //we can't just set max notoriety, we have to fix the cap too which is killing the bosses...
            //i just do a bunch of if statements for each because it's easier than a weird for loop
        if (ActionLeague.maxNoto() < maxNoto || maxTier > 1) {
            loadGame["al"].purchased.push("AL3001");
            DungeonManager.bossesBeat.push("D010");
        }
        if (ActionLeague.maxNoto() < maxNoto || maxTier > 2) {
            loadGame["al"].purchased.push("AL3002");
            DungeonManager.bossesBeat.push("D011");
        }
        if (ActionLeague.maxNoto() < maxNoto || maxTier > 3) {
            loadGame["al"].purchased.push("AL3003");
            DungeonManager.bossesBeat.push("D012");
        }
        if (ActionLeague.maxNoto() < maxNoto || maxTier > 4) {
            loadGame["al"].purchased.push("AL3004");
            DungeonManager.bossesBeat.push("D013");
        }
        if (ActionLeague.maxNoto() < maxNoto || maxTier > 5) {
            loadGame["al"].purchased.push("AL3005");
            DungeonManager.bossesBeat.push("D014");
        }
        if (ActionLeague.maxNoto() < maxNoto || maxTier > 6) {
            loadGame["al"].purchased.push("AL3006");
            DungeonManager.bossesBeat.push("D015");
        }
        if (ActionLeague.maxNoto() < maxNoto || maxTier > 7) {
            loadGame["al"].purchased.push("AL3007");
            DungeonManager.bossesBeat.push("D016");
        }
        if (ActionLeague.maxNoto() < maxNoto || maxTier > 8) {
            loadGame["al"].purchased.push("AL3008");
            DungeonManager.bossesBeat.push("D017");
        }
        if (ActionLeague.maxNoto() < maxNoto || maxTier > 9) {
            loadGame["al"].purchased.push("AL3009");
            DungeonManager.bossesBeat.push("D018");
        }

        //add the missing notoriety based of boss kills (that's why we recalculate)
        const notoReq2 = loadGame["al"].purchased.map(p => ActionLeague.idToPerk(p).notoReq);
        const maxNoto2 = Math.max(...notoReq2);
        loadGame["al"].notoriety = maxNoto2;
    }
    return loadGame;
}



//UI Stuff
$("#deleteSaveButton").click((e) => {
    e.preventDefault();
    ClearSave();
});

$('#exportSave').click(() => {
    ExportSave();
});

$('#importSaveButton').click((e) => {
    e.preventDefault();
    ImportSaveButton();
});

$("#exportSaveCopy").click((e) => {
    e.preventDefault();
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val($("#exportSaveText").val()).select();
    document.execCommand("copy");
    $temp.remove();
})