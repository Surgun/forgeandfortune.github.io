"use strict";

const GuildManager = {
    guilds : [],
    lastClicked : "G001",
    maxGuildLevel : 4,
    addGuild(guild) {
        this.guilds.push(guild);
    },
    createSave() {
        const save = {};
        save.maxGuildLevel = this.maxGuildLevel
        save.guilds = [];
        this.guilds.forEach(guild => {
            save.guilds.push(guild.createSave());
        });
        return save;
    },
    loadSave(save) {
        if (save.maxGuildLevel !== undefined) this.maxGuildLevel = save.maxGuildLevel;
        save.guilds.forEach(guildSave => {
            const guild = this.idToGuild(guildSave.id);
            guild.loadSave(guildSave);
        });
    },
    idToGuild(id) {
        return this.guilds.find(g=>g.id === id);
    },
    submitOrder(gid) {
        const guild = this.idToGuild(gid);
        guild.submitOrder();
    },
    setMaxLvl(lvl) {
        this.maxGuildLevel = Math.max(this.maxGuildLevel,lvl);
        refreshAllOrders();
        refreshAllSales();
    },
    maxLvl() {
        return Math.max(...this.guilds.map(g=>g.lvl));
    }
}

class Guild {
    constructor (props) {
        Object.assign(this, props);
        this.rep = 0;
        this.lvl = 0;
        this.order1 = null;
        this.order2 = null;
        this.order3 = null;
    }
    createSave() {
        const save = {};
        save.id = this.id;
        save.lvl = this.lvl;
        save.rep = this.rep;
        save.order1 = this.order1.createSave();
        save.order2 = this.order2.createSave();
        save.order3 = this.order3.createSave();
        return save;
    }
    loadSave(save) {
        this.rep = save.rep;
        this.lvl = save.lvl;
        console.log(save.order1.id,save.order1.gid,save.order1.lvl);
        this.order1 = new guildOrderItem(save.order1.gid,save.order1.id,save.order1.lvl);
        this.order1.loadSave(save.order1);
        this.order2 = new guildOrderItem(save.order2.gid,save.order2.id,save.order2.lvl);
        this.order2.loadSave(save.order2);
        this.order3 = new guildOrderItem(save.order3.gid,save.order3.id,save.order3.lvl);
        this.order3.loadSave(save.order3);
    }
    addRep(rep) {
        if (this.maxLvlReached()) return;
        this.rep += rep;
        if (this.rep >= this.repLvl()) {
            this.rep = 0;
            this.lvl += 1;
            refreshAllSales();
        }
        refreshguildprogress(this);
    }
    repLvl(givenlvl) {
        givenlvl = givenlvl || this.lvl;
        return miscLoadedValues["guildRepForLvls"][givenlvl];
    }
    recipeToBuy() {
        return recipeList.filterByGuild(this.id).filter(r =>!r.owned && r.repReq <= GuildManager.maxGuildLevel).sort((a,b) => a.repReq-b.repReq);
    }
    workers() {
        return WorkerManager.filterByGuild(this.id).filter(w => w.owned);
    }
    orderComplete() {
        if (devtools.orderBypass) return true;
        return this.order.every(o=>o.complete());
    }
    generateNewOrder(orderNum) {
        const possibleItems = recipeList.guildOrderItems(this.lvl);
        if (orderNum === 1) {
            const possibleGuildItems = possibleItems.filter(r => r.guildUnlock === this.id);
            const chosenGuildItem = possibleGuildItems[Math.floor(GuildSeedManager.fauxRand(this.id)*possibleGuildItems.length)];
            this.order1 = new guildOrderItem(this.id,chosenGuildItem.id,this.lvl);
            return;
        }
        const chosenItem = possibleItems[Math.floor(GuildSeedManager.fauxRand(this.id)*possibleItems.length)];
        if (orderNum === 2) this.order2 = new guildOrderItem(this.id,chosenItem.id,this.lvl);
        if (orderNum === 3) this.order3 = new guildOrderItem(this.id,chosenItem.id,this.lvl);
    }
    submitItem(slot) {
        let submitContainer = this.order1;
        if (slot === 2) submitContainer = this.order2;
        if (slot === 3) submitContainer = this.order3;
        const itemString = submitContainer.uniqueID();
        const itemMatch = Inventory.findCraftMatch(itemString);
        if (itemMatch === undefined) return Notifications.cantFindMatch();
        Inventory.removeContainerFromInventory(itemMatch.containerID);
        submitContainer.fufilled += 1;
        this.addRep(submitContainer.rep);
        achievementStats.gold(submitContainer.goldValue());
        ResourceManager.addMaterial("M001",submitContainer.goldValue());
        if (submitContainer.complete()) this.generateNewOrder(slot);
        refreshAllOrders();
    }
    goldValue() {
        const gold = this.order.map(o => o.goldValue());
        if (gold.length === 0) return 0;
        return gold.reduce((a,b) => a+b);
    }
    maxLvlReached() {
        return this.lvl + 1 >= GuildManager.maxGuildLevel;
    }
}

class guildOrderItem {
    constructor (gid,id,lvl) {
        this.gid = gid;
        this.id = id;
        this.item = recipeList.idToItem(id);
        console.log(id,this.item);
        this.lvl = lvl;
        this.rarity = this.generateRarity(lvl);
        this.sharp = this.generateSharp(lvl);
        this.amt = this.generateAmt();
        this.rep = 11-this.amt;
        this.fufilled = 0;
        this.displayName = this.generateName();
    }
    createSave() {
        const save = {};
        save.gid = this.gid;
        save.id = this.id;
        save.lvl = this.lvl;
        save.amt = this.amt;
        save.rarity = this.rarity;
        save.sharp = this.sharp;
        save.fufilled = this.fufilled;
        save.rep = this.rep;
        return save;
    }
    loadSave(save) {
        this.amt = save.amt;
        this.rarity = save.rarity;
        this.sharp = save.sharp;
        this.fufilled = save.fufilled;
        this.rep = save.rep;
        this.item = recipeList.idToItem(this.id);
        this.displayName = this.generateName();
    }
    goldValue() {
        const smithBonus = [...miscLoadedValues["smithChance"]].splice(0,this.sharp);
        const sharpAdd = smithBonus.length === 0 ? 0 : smithBonus.reduce((a,b)=>a+b);
        return Math.round(this.item.value*(2*(1+this.rarity)+sharpAdd));
    }
    complete() {
        return this.fufilled >= this.amt;
    }
    left() {
        return this.amt - this.fufilled;
    }
    generateAmt() {
        let startAmt = 10;
        startAmt -= this.rarity*2;
        startAmt -= Math.floor(this.sharp/1.5);
        return Math.max(1,startAmt);
    }
    generateRarity(lvl) {
        const epicChance = miscLoadedValues["goEpic"][lvl];
        const greatChance = miscLoadedValues["goGreat"][lvl]+epicChance;
        const goodChance = miscLoadedValues["goGood"][lvl]+greatChance;     
        const rarityRoll = Math.floor(GuildSeedManager.fauxRand(this.gid) * 100);
        if (epicChance > rarityRoll) return 3;
        if (greatChance > rarityRoll) return 2;
        if (goodChance > rarityRoll) return 1;
        return 0;
    }
    generateSharp(lvl) {
        const sharpChance = miscLoadedValues["goSharp"][lvl];
        const sharpMin = miscLoadedValues["goSharpMin"][lvl];
        const sharpMax = miscLoadedValues["goSharpMax"][lvl];
        if (sharpChance < Math.floor(GuildSeedManager.fauxRand(this.gid) * 100)) return 0;
        return bellCurveSeed(this.gid, sharpMin,sharpMax);
    }
    generateName() {
        if (this.sharp > 0) return `<span>+${this.sharp} ${this.item.name}</span>`
        return `${this.item.name}`
    }
    uniqueID() {
        return this.id+"_"+this.rarity+"_"+this.sharp;
    }
}

const $guildList = $("#guildList");

function initializeGuilds() {
    $guildList.empty();
    $("<div/>").addClass("guildListButton").data("gid","ActionLeague").attr("id","actionLeagueTab").html("The Action League").appendTo($guildList);
    GuildManager.guilds.forEach(g => {
        const d1 = $("<div/>").addClass("guildListButton").data("gid",g.id).html(g.name);
        if (GuildManager.lastClicked === g.id) d1.addClass("selected");
        d1.appendTo($guildList);
        $(`#${g.id}Name`).html(`<h2>${g.name}</h2>`);
        $(`#${g.id}Desc`).html(g.description);
        $(".guildContainer").hide();
        $("#"+GuildManager.lastClicked).show();
        refreshguildprogress(g);
        refreshguildOrder(g);
        refreshSales(g);
        refreshGuildWorkers(g);
    });
    refreshALperks();
    refreshALprogress();
};

function checkCraftableStatus() {
    // Check if item in guild order can be crafted
    const $orderCraft = $(".orderCraft");
    $orderCraft.removeClass("recipeCraftDisable");
    recipeList.recipes.forEach(recipe => {
        if (!recipe.canProduce || !recipe.owned) $("#"+recipe.id+".orderCraft").addClass("recipeCraftDisable");
    }) 
}

function refreshguildprogress(guild) {
    const id = guild.id;
    const $gp = $(`#${id}Progress`);
    $gp.empty();
    $("<div/>").addClass("guildLevel").html(`Level ${inWords(guild.lvl)}`).appendTo($gp);
    $gp.append(createGuildBar(guild));
}

function createGuildBar(guild) {
    if (guild.maxLvlReached()) {
        const d1a = $("<div/>").addClass("repBarDiv");
        const d2a = $("<div/>").addClass("repBar").attr("data-label",`Max Level Reached`);
        const s1a = $("<span/>").addClass("repBarFill").css('width',"100%");
        return d1a.append(d2a,s1a);
    }
    const repPercent = guild.rep/guild.repLvl();
    const repWidth = (repPercent*100).toFixed(1)+"%";
    const d1 = $("<div/>").addClass("repBarDiv");
    const d2 = $("<div/>").addClass("repBar").attr("data-label",`Reputation: ${guild.rep}/${guild.repLvl()}`);
    const s1 = $("<span/>").addClass("repBarFill").css('width', repWidth);
    return d1.append(d2,s1);
}

function refreshAllOrders() {
    GuildManager.guilds.forEach(g => refreshguildOrder(g));
    checkCraftableStatus();
}

function refreshguildOrder(guild) {
    const id = guild.id;
    const $go = $(`#${id}Order`);
    $go.empty();
    if (guild.maxLvlReached()) {
        $("<div/>").addClass("guildMaxLvl").html("Max Guild Level Reached - Defeat a Boss to unlock more levels").appendTo($go);
        return;
    }
    $go.append(createOrderCard(guild.order1,id,1));
    $go.append(createOrderCard(guild.order2,id,2));
    $go.append(createOrderCard(guild.order3,id,3));
};

function createOrderCard(item,id,index) {
    const d1 = $("<div/>").addClass(`orderCard R${item.rarity}`).data({"slot":index,"gid":id});
    if (item.complete()) d1.addClass('orderComplete');
    $("<div/>").addClass("orderIcon").html(ResourceManager.materialIcon(item.id)).appendTo(d1);
    $("<div/>").addClass("orderName").addClass(`orderName`).html(item.displayName).appendTo(d1);
    $("<div/>").addClass("itemToSac tooltip").attr("data-tooltip",ResourceManager.nameForWorkerSac(item.id)).appendTo(d1);
    const d2 = $("<div/>").addClass("orderMaterials").appendTo(d1);
    item.item.gcost.forEach(g => {
        $("<div/>").addClass("asResIcon").html(`<img src="images/resources/${g}.png" alt="${g}">`).appendTo(d2);
    });
    $("<div/>").addClass("itemToSacReq").html(`${formatToUnits(item.left(),2)} Left`).appendTo(d1);
    $("<div/>").addClass("orderInv tooltip").attr("data-tooltip","In Inventory").data("uid",item.uniqueID()).html(`<i class="fas fa-cube"></i> ${Inventory.itemCountSpecific(item.uniqueID())}`).appendTo(d1);
    $("<div/>").attr("id",item.id).addClass("orderCraft").html(`<i class="fas fa-hammer"></i> Craft`).appendTo(d1);
    const d3 = $("<div/>").addClass("guildItemSubmit").appendTo(d1);
    $("<div/>").addClass("guildItemSubmitHeading").html(`Submit one for:`).appendTo(d3);
        const d3a = $("<div/>").addClass("guildItemSubmitRewards").appendTo(d3);
        $("<div/>").addClass("guildItemSubmitItem RewardGold").html(`${miscIcons.gold} +${item.goldValue()}`).appendTo(d3a);
        $("<div/>").addClass("guildItemSubmitItem RewardRep").html(`+${item.rep} Reputation`).appendTo(d3a);
    return d1;
};

function refreshOrderInvCount() {
    $(".orderInv").each(function() {
        const uniqueID = $(this).data("uid");
        const invCount = Inventory.itemCountSpecific(uniqueID);
        $(this).removeClass("canContribute").html(`<i class="fas fa-cube"></i> ${invCount}`);
        if (invCount > 0) $(this).addClass("canContribute");
    });
}

function refreshAllSales() {
    GuildManager.guilds.forEach(g => refreshSales(g));
};

function refreshSales(guild) {
    const $gs = $(`#${guild.id}Sales`);
    $gs.empty();
    console.log(guild.recipeToBuy());
    guild.recipeToBuy().forEach(recipe => {
        $gs.append(createRecipeBuyCard(recipe,guild.lvl));
    });
};

function createRecipeBuyCard(recipe,guildLvl) {
    const d1 = $("<div/>").addClass("recipeBuyCard");
    const d2 = $("<div/>").addClass("recipeBuyCardHead").html(recipe.type);
    const d3 = $("<div/>").addClass("recipeBuyCardBody").html(recipe.itemPicName());
    const d3a = $("<div/>").addClass("recipeBuyCardTier recipeItemLevel").html(recipe.itemLevel());
    if (recipe.repReq > guildLvl) {
        const d4 = $("<div/>").addClass("recipeBuyCardBuyLater").html(`Reach Guild Level ${recipe.repReq} to Unlock`);
        return d1.append(d2,d3,d3a,d4);
    }
    const d5 = $("<div/>").addClass("recipeBuyCardBuy").data("rid",recipe.id);
        $("<div/>").addClass("recipeBuyCardBuyText").html("Purchase").appendTo(d5);
        $("<div/>").addClass("recipeBuyCardBuyCost").html(`${miscIcons.gold} ${formatToUnits(recipe.goldCost,2)}`).appendTo(d5);
    return d1.append(d2,d3,d3a,d5);
};

function refreshAllGuildWorkers() {
    GuildManager.guilds.forEach(g=>refreshGuildWorkers(g));
}

function refreshGuildWorkers(guild) {
    const $gw = $(`#${guild.id}Workers`);
    $gw.empty();
    guild.workers().forEach(worker => {
        $gw.append(createWorkerBuyCard(worker));
    })
}

function createWorkerBuyCard(worker) {
    const d1 = $("<div/>").addClass("workerBuyCard");
    const d2 = $("<div/>").addClass("workerBuyCardBodyImage").html(worker.pic);
    const d3 = $("<div/>").addClass("workerBuyCardBodyName").html(worker.name);
    const d4 = $("<div/>").addClass("workerBuyCardBodyProduction").html(worker.productionText());
    const d5 = $('<div/>').addClass('workerBuyCardDesc tooltip').attr("data-tooltip",worker.description).html("<i class='fas fa-info-circle'></i>");
    return d1.append(d2,d3,d4,d5);
};

//submit a guild order
$(document).on("click",".guildOrderSubmit",(e) => {
    e.preventDefault();
    const gid = $(e.currentTarget).data("gid");
    GuildManager.submitOrder(gid);
    refreshInventoryPlaces();
});

//click guild tab button
$(document).on("click",".guildListButton",(e) => {
    e.preventDefault();
    $(".guildListButton").removeClass("selected");
    $(e.currentTarget).addClass("selected");
    const gid = $(e.currentTarget).data("gid");
    GuildManager.lastClicked = gid;
    $(".guildContainer").hide();
    if (gid === "ActionLeague") $("#actionLeague").show();
    else $("#"+gid).show();
});


//submit an item to guild order
$(document).on("click",".orderCard",(e) => {
    e.preventDefault();
    const itemData = $(e.currentTarget).data();
    GuildManager.idToGuild(itemData.gid).submitItem(itemData.slot);
});

//buy a recipe from guild
$(document).on("click",".recipeBuyCardBuy", (e) => {
    e.preventDefault();
    const recipeId = $(e.currentTarget).data("rid");
    recipeList.buyRecipe(recipeId);
});

//Craft from Order Card
$(document).on('click', '.orderCraft', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const itemID = $(e.currentTarget).attr("id");
    actionSlotManager.addSlot(itemID);
});

//********************************
// ACTION LEAGUE STUFF
//********************************/

const ActionLeague = {
    notoriety : 0,
    purchased : [],
    perks : [],
    addPerk(reward) {
        this.perks.push(reward);
    },
    createSave() {
        const save = {};
        save.notoriety = this.notoriety;
        save.purchased = this.purchased;
        return save;
    },
    loadSave(save) {
        this.notoriety = save.notoriety;
        this.purchased = save.purchased;
    },
    idToPerk(id) {
        return this.perks.find(r=>r.id === id);
    },
    addNoto(amt) {
        this.notoriety += amt
        this.notoriety = Math.min(this.notoriety, this.maxNoto());
        refreshALprogress();
        refreshALbar();
        refreshALperks();
    },
    maxNoto() {
        return miscLoadedValues["notoCap"][DungeonManager.bossesBeat.length];
    },
    buyPerk(id) {
        const perk = this.idToPerk(id);
        if (ResourceManager.materialAvailable("M001") < perk.goldCost) {
            Notifications.alRewardCost();
            return;
        }
        ResourceManager.deductMoney(perk.goldCost);
        this.purchased.push(id);
        perk.activate();
        refreshALperks();
        refreshProgress();
    },
    nextUnlock() {
        const perks = this.perks.filter(p => p.notoReq > this.notoriety && !this.purchased.includes(p.id));
        const perkNoto = perks.map(p=>p.notoReq);
        const lowest = Math.min(...perkNoto);
        return this.perks.find(p => p.notoReq === lowest);
    },
    perkCount() {
        return this.purchased.length;
    },
    perkMaxCount() {
        return this.perks.length;
    }
}

class alRewards {
    constructor (props) {
        Object.assign(this, props);
        this.image = `<img src='images/perks/${this.id}.png'>`;
    }
    activate() {
        if (this.type === "hero") HeroManager.gainHero(this.subtype);
        if (this.type === "worker") WorkerManager.gainWorker(this.subtype);
        if (this.type === "boss") DungeonManager.unlockDungeon(this.subtype);
        if (this.type === "craft") actionSlotManager.upgradeSlot();
        if (this.type === "adventure") DungeonManager.partySize += 1;
        if (this.type === "cap") GuildManager.setMaxLvl(this.subtype);
        if (this.type === "desynth" && this.subtype === "open") TownManager.buildingPerk("desynth");
        if (this.type === "bank" && this.subtype === "open") TownManager.buildingPerk("bank");
        if (this.type === "bank" && this.subtype === "level") BankManager.addLevel();
        if (this.type === "cauldron" && this.subtype === "open") TownManager.buildingPerk("fusion");
        if (this.type === "cauldron" && this.subtype === "level") FusionManager.addLevel();
        if (this.type === "forge" && this.subtype === "open") TownManager.buildingPerk("forge");
        if (this.type === "forge" && this.subtype === "level") bloopSmith.addLevel();
        if (this.type === "fortune" && this.subtype === "open") TownManager.buildingPerk("fortune");
        if (this.type === "fortune" && this.subtype === "level") FortuneManager.addLevel();
        if (this.type === "tinker" && this.subtype === "open") TownManager.buildingPerk("tinker");
        if (this.type === "tinker" && this.subtype === "level") TinkerManager.addLevel();
        if (this.type === "monster" && this.subtype === "open") TownManager.buildingPerk("monster");
        if (this.type === "monster" && this.subtype === "level") MonsterHall.addLevel();
    }
}

const $algp = $("#ALProgress");
const $alp = $("#ALPerks");

function refreshALprogress() {
    $algp.empty();
    $algp.html(createALGuildBar());
}

function createALGuildBar() {
    const notoPercent = ActionLeague.notoriety/ActionLeague.maxNoto();
    const notoWidth = (notoPercent*100).toFixed(1)+"%";
    const d1 = $("<div/>").addClass("notoBarDiv");
    const d2 = $("<div/>").addClass("notoBar").attr("data-label",`Notoriety - ${ActionLeague.notoriety}/${ActionLeague.maxNoto()}`);
    const s1 = $("<span/>").addClass("notoBarFill").css('width',notoWidth);
    return d1.append(d2,s1);
}

function refreshALperks() {
    $alp.empty();
    const perks = ActionLeague.perks.filter(p=> p.notoReq <= ActionLeague.notoriety && !ActionLeague.purchased.includes(p.id));
    perks.forEach((perk,i) => {
        $alp.append(createALperk(perk,true));
    });
    const nextperk = ActionLeague.nextUnlock();
    if (nextperk === undefined) return;
    $alp.append(createALperk(nextperk,false));
}

const $notoBar = $("#notoBar");
const $notoBarFill = $("#notoBarFill");

function refreshALbar() {
    const notoPercent = ActionLeague.notoriety/ActionLeague.maxNoto();
    const notoWidth = (notoPercent*100).toFixed(1)+"%";
    $notoBar.attr("data-label",`${formatToUnits(ActionLeague.notoriety,2)}/${formatToUnits(ActionLeague.maxNoto(),2)}`);
    $notoBarFill.css('width', notoWidth);
}

function createALperk(perk,canbuy) {
    const d1 = $("<div/>").addClass("alPerk");
    const d2 = $("<div/>").addClass("alTitle").html(perk.title);
    const d3 = $("<div/>").addClass("alImage").html(perk.image);
    const d4 = $("<div/>").addClass("alDesc").html(perk.description);
    if (canbuy) {
        const d5 = $("<div/>").addClass("alPerkBuy").data("pid",perk.id);
            $("<div/>").addClass("alPerkBuyText").html("Unlock").appendTo(d5);
            $("<div/>").addClass("alPerkBuyCost").html(`${miscIcons.gold} ${formatToUnits(perk.goldCost,2)}`).appendTo(d5);
        return d1.append(d2,d3,d4,d5);
    }
    const d6 = $("<div/>").addClass("alPerkCantBuy").html(`Available at ${perk.notoReq} Notoriety`);
    return d1.append(d2,d3,d4,d6)
}

//buy a perk
$(document).on("click",".alPerkBuy", (e) => {
    e.preventDefault();
    const perkid = $(e.currentTarget).data("pid");
    ActionLeague.buyPerk(perkid);
});