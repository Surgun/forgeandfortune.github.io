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
    saveFile["v"] = "0310"
    saveFile["as"] = actionSlotManager.createSave();
    saveFile["d"] = DungeonManager.createSave();
    saveFile["e"] = EventManager.createSave();
    saveFile["h"] = HeroManager.createSave();
    saveFile["i"] = Inventory.createSave();
    saveFile["r"] = recipeList.createSave();
    saveFile["rs"] = ResourceManager.createSave();
    saveFile["w"] = WorkerManager.createSave();
    saveFile["ac"] = achievementStats.createSave();
    saveFile["ds"] = DesynthManager.createSave();
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
    if (typeof loadGame["ds"] !== "undefined") DesynthManager.loadSave(loadGame["ds"]);
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
    if (loadGame.v === "03") {
        loadGame.v = "0308";
        loadGame["g"].guilds.forEach(guild => {
            if (guild.rep >= 3) {
                guild.rep = 0;
                guild.lvl += 1;
                guild.order = undefined;
            }
        })
        refreshAllOrders();
        refreshAllSales();
        refreshAllProgress();
    }
    if (loadGame.v === "0308") {
        loadGame.v = "0310";
        //this is the recipes and what they got changed to
        const recipeExchange = {
            "R0101":"R12001",
            "R0102":"R12002",
            "R0103":"R12003",
            "R0104":"R12004",
            "R0105":"R12005",
            "R0106":"R12006",
            "R0107":"R12007",
            "R0108":"R12008",
            "R0109":"R12009",
            "R0110":"R12010",
            "R0201":"R12001",
            "R0202":"R12002",
            "R0203":"R12003",
            "R0204":"R12004",
            "R0205":"R12005",
            "R0206":"R12006",
            "R0207":"R12007",
            "R0208":"R12008",
            "R0209":"R12009",
            "R0210":"R12010",
            "R0301":"R12001",
            "R0302":"R12002",
            "R0303":"R12003",
            "R0304":"R12004",
            "R0305":"R12005",
            "R0306":"R12006",
            "R0307":"R12007",
            "R0308":"R12008",
            "R0309":"R12009",
            "R0310":"R12010",
            "R0401":"R11001",
            "R0402":"R11002",
            "R0403":"R11003",
            "R0404":"R11004",
            "R0405":"R11005",
            "R0406":"R11006",
            "R0407":"R11007",
            "R0408":"R11008",
            "R0409":"R11009",
            "R0410":"R11010",
            "R0501":"R11001",
            "R0502":"R11002",
            "R0503":"R11003",
            "R0504":"R11004",
            "R0505":"R11005",
            "R0506":"R11006",
            "R0507":"R11007",
            "R0508":"R11008",
            "R0509":"R11009",
            "R0510":"R11010",
            "R0601":"R11001",
            "R0602":"R11002",
            "R0603":"R11003",
            "R0604":"R11004",
            "R0605":"R11005",
            "R0606":"R11006",
            "R0607":"R11007",
            "R0608":"R11008",
            "R0609":"R11009",
            "R0610":"R11010",
            "R0701":"R13001",
            "R0702":"R13002",
            "R0703":"R13003",
            "R0704":"R13004",
            "R0705":"R13005",
            "R0706":"R13006",
            "R0707":"R13007",
            "R0708":"R13008",
            "R0709":"R13009",
            "R0710":"R13010",
            "R0801":"R13001",
            "R0802":"R13002",
            "R0803":"R13003",
            "R0804":"R13004",
            "R0805":"R13005",
            "R0806":"R13006",
            "R0807":"R13007",
            "R0808":"R13008",
            "R0809":"R13009",
            "R0810":"R13010",
            "R0901":"R13001",
            "R0902":"R13002",
            "R0903":"R13003",
            "R0904":"R13004",
            "R0905":"R13005",
            "R0906":"R13006",
            "R0907":"R13007",
            "R0908":"R13008",
            "R0909":"R13009",
            "R0910":"R13010",
            "R1001":"R12001",
            "R1002":"R12002",
            "R1003":"R12003",
            "R1004":"R12004",
            "R1005":"R12005",
            "R1006":"R12006",
            "R1007":"R12007",
            "R1008":"R12008",
            "R1009":"R12009",
            "R1010":"R12010",
            "R5201":"R5501",
            "R5202":"R5502",
            "R5203":"R5503",
            "R5204":"R5504",
            "R5205":"R5505",
            "R5206":"R5506",
            "R5207":"R5507",
            "R5208":"R5508",
            "R5209":"R5509",
            "R5210":"R5510",
            "R5601":"R5301",
            "R5602":"R5302",
            "R5603":"R5303",
            "R5604":"R5304",
            "R5605":"R5305",
            "R5606":"R5306",
            "R5607":"R5307",
            "R5608":"R5308",
            "R5609":"R5309",
            "R5610":"R5310",
            "R6101":"R6501",
            "R6102":"R6502",
            "R6103":"R6503",
            "R6104":"R6504",
            "R6105":"R6505",
            "R6106":"R6506",
            "R6107":"R6507",
            "R6108":"R6508",
            "R6109":"R6509",
            "R6110":"R6510",
            "R6401":"R6301",
            "R6402":"R6302",
            "R6403":"R6303",
            "R6404":"R6304",
            "R6405":"R6305",
            "R6406":"R6306",
            "R6407":"R6307",
            "R6408":"R6308",
            "R6409":"R6309",
            "R6410":"R6310",
            "R6601":"R6201",
            "R6602":"R6202",
            "R6603":"R6203",
            "R6604":"R6204",
            "R6605":"R6205",
            "R6606":"R6206",
            "R6607":"R6207",
            "R6608":"R6208",
            "R6609":"R6209",
            "R6610":"R6210",
        }            
        //cycle through recipes and "own" the equivalents (repeats are okay because of how recipe load works)
        loadGame["r"].forEach(recipe => {
            if (recipeExchange.hasOwnProperty(recipe.id)) recipe.id = recipeExchange[recipe.id];
        });
        //cycle through inventory and swap the item types to this list
        loadGame["i"].forEach(i => {
            if (i !== null && recipeExchange.hasOwnProperty(i.id)) i.id = recipeExchange[i.id];
        });
        //cycle through bank too
        loadGame["bb"].slots.forEach(i => {
            if (i !== null && recipeExchange.hasOwnProperty(i.id)) i.id = recipeExchange[i.id];
        });
        //cycle through heroes and their gear
        const heroTable = {
            "H001":["R51","R65"],
            "H002":["R51","R65"],
            "H003":["R51","R65"],
            "H004":["R51","R65"],
            "H101":["R55","R62"],
            "H102":["R55","R62"],
            "H103":["R55","R62"],
            "H104":["R55","R62"],
            "H201":["R53","R63"],
            "H202":["R53","R63"],
            "H203":["R53","R63"],
            "H204":["R53","R63"],
        }
        loadGame["h"].forEach(hero => {
            //slot 1 is weapon and we can just swap from recipe table
            if (hero.slot1 !== null && recipeExchange.hasOwnProperty(hero.slot1.id)) hero.slot1.id = recipeExchange[hero.slot1.id];
            //slot 5 and 6 is a PITA because a might hero might go from needing a potion to needing a belt. Fortunately we can
            //just swap the first two letters to get the "new" one and leave the tier part... 
            if (hero.slot5 !== null) hero.slot5.id = heroTable[hero.id][0] + hero.slot5.id.slice(-2);
            if (hero.slot6 !== null) hero.slot6.id = heroTable[hero.id][1] + hero.slot6.id.slice(-2);
        });
        //clear action slots too because worker allocation is different
        loadGame["as"].slots = [];
        //delete workers because why the fuck not?
        delete loadGame["w"];
        WorkerManager.gainWorker("WN201");

        //repopulate guild oredrs bc new items (and one less guild);
        const locked2 = loadGame["r"].filter(r => r.owned).map(r => r.id);
        GuildManager.guilds.map(g => g.id).forEach(gid => {
            const repReq = recipeList.recipes.filter(r => r.guildUnlock === gid && locked2.includes(r.id)).map(r=>r.repReq);
            const lowest = Math.max(...repReq);
            loadGame["g"].guilds.find(g=>g.id === gid).lvl = lowest;
        });
        delete loadGame["g"].guilds[0].order;
        delete loadGame["g"].guilds[1].order;
        delete loadGame["g"].guilds[2].order;
        delete loadGame["g"].guilds[3].order;
        loadGame["g"].guilds = loadGame["g"].guilds.filter(g=>g.id !== "G005");
        
        //convert fusion slots
        loadGame["fb"].slots.forEach(slot => {
            slot.uniqueID = slot.id+"_"+slot.rarity+"_0";
        });

        //buy max level perks you should own
        loadGame["g"].maxGuildLevel = 0;
        ActionLeague.perks.filter(p=>p.type === "cap").forEach(perk => {
            if (perk.notoReq <= loadGame["al"].notoriety) {
                loadGame["al"].purchased.push(perk.id);
                loadGame["g"].maxGuildLevel = Math.max(loadGame["g"].maxGuildLevel,perk.subtype);
            }
        });
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

$("#exportSaveLocal").click((e) => {
    e.preventDefault();
    const saveFile = createSaveExport();
    const b = new Blob([saveFile],{type:"text/plain;charset=utf-8"});
    saveAs(b, "ForgeAndFortuneSave.txt");
});