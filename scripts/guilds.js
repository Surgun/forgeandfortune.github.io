"use strict";

const GuildManager = {
    guilds : [],
    lastClicked : "G003",
    addGuild(guild) {
        this.guilds.push(guild);
    },
    createSave() {
        const save = {};
        save.guilds = [];
        this.guilds.forEach(guild => {
            save.guilds.push(guild.createSave());
        });
        return save;
    },
    loadSave(save) {
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
    maxGuildLevel() {
        return (DungeonManager.bossCount()+1)*4-1;
    },
    maxLvl() {
        return Math.max(...this.guilds.map(g=>g.lvl));
    },
    repopulateUnmastered() {
        this.guilds.forEach(g => g.repopulateUnmastered());
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
        this.unmastered = [];
    }
    createSave() {
        const save = {};
        save.id = this.id;
        save.lvl = this.lvl;
        save.rep = this.rep;
        save.order1 = this.order1.createSave();
        save.order2 = this.order2.createSave();
        save.order3 = this.order3.createSave();
        save.unmastered = this.unmastered;
        return save;
    }
    loadSave(save) {
        this.rep = save.rep;
        this.lvl = save.lvl;
        this.order1 = new guildOrderItem(save.order1.gid,save.order1.id,save.order1.lvl);
        this.order1.loadSave(save.order1);
        this.order2 = new guildOrderItem(save.order2.gid,save.order2.id,save.order2.lvl);
        this.order2.loadSave(save.order2);
        this.order3 = new guildOrderItem(save.order3.gid,save.order3.id,save.order3.lvl);
        this.order3.loadSave(save.order3);
        if (save.unmastered !== undefined) this.unmastered = save.unmastered;
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
        return recipeList.filterByGuild(this.id).filter(r =>!r.owned && r.repReq <= GuildManager.maxGuildLevel()).sort((a,b) => a.repReq-b.repReq);
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
        return this.lvl >= GuildManager.maxGuildLevel();
    }
    repopulateUnmastered() {
        this.unmastered = recipeList.unmasteredByGuild(this.id);
    }
    unlocked() {
        return this.workers().length > 0;
    }
}

class guildOrderItem {
    constructor (gid,id,lvl) {
        this.gid = gid;
        this.id = id;
        this.item = recipeList.idToItem(id);
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
    GuildManager.guilds.forEach(g => {
        const d1 = $("<div/>").addClass("guildListButton").data("gid",g.id).html(g.name);
        if (GuildManager.lastClicked === g.id) d1.addClass("selected");
        d1.appendTo($guildList);
        $(`#${g.id}Name`).html(`<h2>${g.name}</h2>`);
        $(`#${g.id}Desc`).html(g.description);
        if (!g.unlocked()) d1.hide();
    });
    $(".guildContainer").hide();
    $("#"+GuildManager.lastClicked).show();
    const guild = GuildManager.idToGuild(GuildManager.lastClicked);
    refreshguildprogress(guild);
    refreshguildOrder(guild);
    refreshSales(guild);
    refreshRecipeMastery(guild);
    refreshGuildWorkers(guild);
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
    if (guild.lvl < 4) return;
    $go.append(createOrderCard(guild.order2,id,2));
    if (guild.lvl < 8) return;
    $go.append(createOrderCard(guild.order3,id,3));
};

function createOrderCard(item,id,index) {
    const d1 = $("<div/>").addClass(`orderCard R${item.rarity}`).data({"slot":index,"gid":id});
    if (item.complete()) d1.addClass('orderComplete');
    $("<div/>").addClass("orderIcon").html(ResourceManager.materialIcon(item.id)).appendTo(d1);
    $("<div/>").addClass("orderName").addClass(`orderName`).html(item.displayName).appendTo(d1);
    $("<div/>").addClass("itemToSac tooltip").attr({"data-tooltip":"recipe_desc","data-tooltip-value":item.id}).appendTo(d1);
    const d2 = $("<div/>").addClass("orderMaterials").appendTo(d1);
    item.item.gcost.forEach(g => {
        $("<div/>").addClass("asResIcon").html(`<img src="images/resources/${g}.png" alt="${g}">`).appendTo(d2);
    });
    $("<div/>").addClass("itemToSacReq").html(`${formatToUnits(item.left(),2)} Left`).appendTo(d1);
    $("<div/>").addClass("orderInv tooltip").attr("data-tooltip","in_inventory").data("uid",item.uniqueID()).html(`<i class="fas fa-cube"></i> ${Inventory.itemCountSpecific(item.uniqueID())}`).appendTo(d1);
    $("<div/>").attr("id",item.id).addClass("orderCraft").html(`<i class="fas fa-hammer"></i> Craft`).appendTo(d1);
    const d3 = $("<div/>").addClass("guildItemSubmit").appendTo(d1);
    $("<div/>").addClass("guildItemSubmitHeading").html(`Submit one for:`).appendTo(d3);
        const d3a = $("<div/>").addClass("guildItemSubmitRewards").appendTo(d3);
        $("<div/>").addClass("guildItemSubmitItem RewardGold tooltip").attr({"data-tooltip": "gold_value", "data-tooltip-value": item.goldValue()}).html(`${miscIcons.gold} +${item.goldValue()}`).appendTo(d3a);
        $("<div/>").addClass("guildItemSubmitItem RewardRep tooltip").attr("data-tooltip", "rep").html(`+${item.rep} Reputation`).appendTo(d3a);
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
        $("<div/>").addClass("recipeBuyCardBuyCost tooltip").attr({"data-tooltip": "gold_value", "data-tooltip-value": formatWithCommas(recipe.goldCost)}).html(`${miscIcons.gold} ${formatToUnits(recipe.goldCost,2)}`).appendTo(d5);
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
    const d5 = $('<div/>').addClass('workerBuyCardDesc tooltip').attr({"data-tooltip":"worker_desc","data-tooltip-value":worker.workerID}).html("<i class='fas fa-info-circle'></i>");
    return d1.append(d2,d3,d4,d5);
};

function refreshAllRecipeMastery() {
    GuildManager.guilds.forEach(g=>refreshRecipeMastery(g));
}

function refreshRecipeMastery(guild) {
    const $guildBlock = $(`#${guild.id}Mastery`);
    $guildBlock.empty();
    if (guild.unmastered.length === 0) $guildBlock.html("No recipes to master currently.");
    guild.unmastered.forEach(rid => {
        const recipe = recipeList.idToItem(rid);
        $guildBlock.append(createRecipeMasteryCard(recipe));
    });
    
}

function createRecipeMasteryCard(recipe) {
    const d1 = $("<div/>").addClass("recipeMasteryGuildCard");
    $("<div/>").addClass("recipeMasteryGuildPicName").html(recipe.itemPicName()).appendTo(d1);
    const masteryCost = recipe.masteryCost();
    $("<div/>").addClass("recipeMasteryGuildButton tooltip").attr({"id": "rcm"+recipe.id, "data-tooltip": "material_desc", "data-tooltip-value": masteryCost.id}).data("rid",recipe.id).html(`Master for ${ResourceManager.materialIcon(masteryCost.id)} ${masteryCost.amt}`).appendTo(d1);
    return d1;
}

function refreshRecipeMasteryAmt(recipe) {
    console.log(recipe);
    const masteryCost = recipe.masteryCost();
    $(`#rcm${recipe.id}`).html(`Master for ${ResourceManager.materialIcon(masteryCost.id)} ${masteryCost.amt}`);
}

//attempt a mastery
$(document).on("click",".recipeMasteryGuildButton",(e) => {
    e.preventDefault();
    const rid = $(e.currentTarget).data("rid");
    recipeList.attemptMastery(rid);
});

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
    $("#"+gid).show();
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