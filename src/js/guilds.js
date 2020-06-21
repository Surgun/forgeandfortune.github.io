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
        return (DungeonManager.bossCount()+1)*4;
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
        return recipeList.filterByGuild(this.id).filter(r =>!r.owned && r.repReq < GuildManager.maxGuildLevel()).sort((a,b) => a.repReq-b.repReq);
    }
    workers() {
        return WorkerManager.filterByGuild(this.id).filter(w => w.owned);
    }
    orderComplete() {
        if (devtools.orderBypass) return true;
        return this.order.every(o=>o.complete());
    }
    generateNewOrder(orderNum,previous="ignore") {
        let possibleItems = recipeList.guildOrderItems(this.lvl);
        if (orderNum === 1) {
            let possibleGuildItems = possibleItems.filter(r => r.guildUnlock === this.id);
            if (possibleGuildItems.length > 1) possibleGuildItems = possibleGuildItems.filter(r=>r.id !== previous);
            const chosenGuildItem = possibleGuildItems[Math.floor(GuildSeedManager.fauxRand(this.id)*possibleGuildItems.length)];
            this.order1 = new guildOrderItem(this.id,chosenGuildItem.id,this.lvl);
            return;
        }
        if (possibleItems.length > 1) possibleItems = possibleItems.filter(r=>r.id !== previous);
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
        if (submitContainer.complete()) this.generateNewOrder(slot, submitContainer.id);
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
        this.amt = this.generateAmt(lvl);
        this.rep = this.generateRep(lvl,this.amt);
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
    generateAmt(lvl) {
        const max = miscLoadedValues["goMax"][lvl];
        const min = miscLoadedValues["goMin"][lvl];
        let startAmt = Math.floor(Math.random() * (max - min + 1)) + min;
        startAmt -= this.rarity*2;
        startAmt -= Math.floor(this.sharp/1.5);
        return Math.max(1,startAmt);
    }
    generateRep(lvl,amt) {
        return 1 + miscLoadedValues["goMax"][lvl] - amt;
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
        const d1 = $("<div/>").addClass("guildListButton").data("gid",g.id).html(`${g.icon} ${g.name}`);
        if (GuildManager.lastClicked === g.id) d1.addClass("selected");
        d1.appendTo($guildList);
        $(`#${g.id}Name`).html(`${g.name}`);
        $(`#${g.id}Desc`).html(g.description);
        if (!g.unlocked()) d1.hide();
    });
    $(".guildContainer").hide();
    $("#"+GuildManager.lastClicked).show();
    GuildManager.guilds.forEach(guild => {
        refreshguildprogress(guild);
        refreshguildOrder(guild);
        refreshSales(guild);
        refreshRecipeMastery(guild);
        refreshGuildWorkers(guild);
    });
};

function checkCraftableStatus() {
    // Check if item in guild order can be crafted
    const $orderCraft = $(".orderCraft");
    $orderCraft.removeClass("recipeCraftDisable");
    recipeList.recipes.forEach(recipe => {
        if (!recipe.canProduce || !recipe.owned || actionSlotManager.slots.length >= actionSlotManager.maxSlots) $("#"+recipe.id+".orderCraft").addClass("recipeCraftDisable");
    }) 
}

function refreshguildprogress(guild) {
    const id = guild.id;
    const $gp = $(`#${id}Progress`);
    $gp.empty();
    const guildLevel = $("<div/>").addClass("guildLevel").appendTo($gp);
        $("<div/>").addClass("guildLevelText").html("Level").appendTo(guildLevel);
        $("<div/>").addClass("guildLevelValue").html(guild.lvl).appendTo(guildLevel);
    $gp.append(createGuildBar(guild));
}

function generateProgressBar(options) {
    const {prefix, tooltip, text, textID, icon, width, fill} = options;
    const progressBarContainer = $("<div/>").addClass(`progressBarContainer ${prefix}BarContainer`);
    if (tooltip) progressBarContainer.addClass("tooltip").attr({"data-tooltip": tooltip});

    const progressBarText = $("<div/>").addClass("progressBarText");
    if (text) progressBarText.html(text).appendTo(progressBarContainer)
    if (textID) progressBarText.attr({"id": textID});

    const progressBarContent = $("<div/>").addClass("progressBarContent");
    if (icon) $("<div/>").addClass("progressBarIcon").html(icon).appendTo(progressBarContent);
    if (icon && text) progressBarText.addClass("containsIcon");

    const progressBar = $("<div/>").addClass("progressBar").appendTo(progressBarContent);
    const progressBarFill = $("<div/>").addClass("progressBarFill").css("width", width).appendTo(progressBar);
    if (fill) progressBarFill.attr({"id": fill});

    progressBarContainer.append(progressBarContent)
    return progressBarContainer;
}

function createGuildBar(guild) {
    const repBarText = `Reputation: ${guild.rep}/${guild.repLvl()}`;
    const repPercent = guild.rep/guild.repLvl();
    const repWidth = (repPercent*100).toFixed(1)+"%";
    const options = {
        prefix: "rep",
        tooltip: "rep",
        icon: miscIcons.guildRep,
        text: repBarText,
        width: repWidth
    }
    if (guild.maxLvlReached()) {
        options.prefix = "repMax"
        options.text = "Max Level!"
        options.width = "100%"
    }
    return generateProgressBar(options);
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
        $("<div/>").addClass("emptyContentMessage").html("You have reached the current maximum guild level.").appendTo($go);
        return;
    }
    const guildOrderCardsContainer =  $("<div/>").addClass("guildOrderCardsContainer").appendTo($go);
    guildOrderCardsContainer.append(createOrderCard(guild.order1,id,1));
    if (guild.lvl < 4) return;
    guildOrderCardsContainer.append(createOrderCard(guild.order2,id,2));
    if (guild.lvl < 8) return;
    guildOrderCardsContainer.append(createOrderCard(guild.order3,id,3));
};

function createOrderCard(item,id,index) {
    const d1 = $("<div/>").addClass(`orderCard R${item.rarity}`).data({"slot":index,"gid":id});
    if (item.complete()) d1.addClass('orderComplete');
    $("<div/>").addClass("orderIcon").html(ResourceManager.materialIcon(item.id)).appendTo(d1);
    $("<div/>").addClass("orderName itemName").html(item.displayName).appendTo(d1);
    $("<div/>").addClass("itemLevel").html(item.item.itemLevel()).appendTo(d1);
    $("<div/>").addClass(`itemRarity RT${item.rarity} tooltip`).attr({"data-tooltip": `rarity_${rarities[item.rarity].toLowerCase()}`}).html(miscIcons.rarity).appendTo(d1);
    $("<div/>").addClass("itemToSac tooltip").attr({"data-tooltip":"recipe_desc","data-tooltip-value":item.id}).appendTo(d1);
    const d2 = $("<div/>").addClass("orderMaterials").appendTo(d1);
    item.item.gcost.forEach(g => {
        $("<div/>").addClass("orderGuildWorker tooltip").attr({"data-tooltip":"guild_worker","data-tooltip-value":g}).html(GuildManager.idToGuild(g).icon).appendTo(d2);
    });
    $("<div/>").addClass("itemToSacReq").html(`${formatToUnits(item.left(),2)} Left`).appendTo(d1);

    const d3 = $("<div/>").addClass("guildItemSubmit").appendTo(d1);
    $("<div/>").addClass("guildItemSubmitHeading").html(`Rewards`).appendTo(d3);
        const d3a = $("<div/>").addClass("guildOrderRewards").appendTo(d3);
        const goldReward = $("<div/>").addClass("guildOrderReward tooltip").attr({"data-tooltip": "gold_value", "data-tooltip-value": item.goldValue()}).appendTo(d3a);
            $("<div/>").addClass("rewardIcon").html(miscIcons.gold).appendTo(goldReward);
            $("<div/>").addClass("rewardValue").html(item.goldValue()).appendTo(goldReward);
        const repReward = $("<div/>").addClass("guildOrderReward tooltip").attr("data-tooltip", "rep").appendTo(d3a);
            $("<div/>").addClass("rewardIcon").html(miscIcons.guildRep).appendTo(repReward);
            $("<div/>").addClass("rewardValue").html(item.rep).appendTo(repReward);
    const orderActions = $("<div/>").addClass("orderActions").appendTo(d1);
        $("<div/>").addClass("orderInv tooltip").attr("data-tooltip","in_inventory").data("uid",item.uniqueID()).html(`<i class="fas fa-cube"></i> ${Inventory.itemCountSpecific(item.uniqueID())}`).appendTo(orderActions);
        $("<div/>").attr("id",item.id).addClass("orderCraft").html(`<i class="fas fa-hammer"></i> Craft`).appendTo(orderActions);
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

function refreshAllProgress() {
    GuildManager.guilds.forEach(g => refreshguildprogress(g));
};

function refreshSales(guild) {
    const $gs = $(`#${guild.id}Sales`);
    $gs.empty();
    if (guild.recipeToBuy().length === 0) {
        $("<div/>").addClass("emptyContentMessage").html("There are no more recipes available to purchase.").appendTo($gs);
        return;
    }
    const guildSalesCardsContainer = $("<div/>").addClass("guildSalesCardsContainer").appendTo($gs);
    guild.recipeToBuy().forEach(recipe => {
        guildSalesCardsContainer.append(createRecipeBuyCard(recipe,guild.lvl));
    });
};

function createRecipeBuyCard(recipe,guildLvl) {
    const d1 = $("<div/>").addClass("recipeBuyCard");
    $("<div/>").addClass("itemTypeHeader").html(recipe.type).appendTo(d1);
    const guildRecipeBuyContent = $("<div/>").addClass("guildRecipeBuyContent").appendTo(d1);
        $("<div/>").addClass("itemName").html(recipe.itemPicName()).appendTo(guildRecipeBuyContent);
        $("<div/>").addClass("itemLevel").html(recipe.itemLevel()).appendTo(guildRecipeBuyContent);
    if (recipe.repReq > guildLvl) {
        $("<div/>").addClass("guildRecipeBuyReq").html(`Guild Level ${recipe.repReq} Required`).appendTo(guildRecipeBuyContent);
        return d1;
    }
    const d5 = $("<div/>").addClass("recipeBuyCardBuy").data("rid",recipe.id);
        $("<div/>").addClass("recipeBuyCardBuyText").html("Purchase").appendTo(d5);
        $("<div/>").addClass("recipeBuyCardBuyCost tooltip").attr({"data-tooltip": "gold_value", "data-tooltip-value": formatWithCommas(recipe.goldCost)}).html(`${miscIcons.gold} ${formatToUnits(recipe.goldCost,2)}`).appendTo(d5);
    return d1.append(d5);
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
    const d4 = $("<div/>").addClass("workerBuyCardBodyProduction tooltip").attr({"data-tooltip": "guild_worker", "data-tooltip-value": worker.production}).html(worker.productionText());
    const d5 = $('<div/>').addClass('workerBuyCardDesc tooltip').attr({"data-tooltip":"worker_desc","data-tooltip-value":worker.workerID}).html("<i class='fas fa-info-circle'></i>");
    return d1.append(d2,d3,d4,d5);
};

function refreshAllRecipeMastery() {
    GuildManager.guilds.forEach(g=>refreshRecipeMastery(g));
}

function refreshRecipeMastery(guild) {
    guild.repopulateUnmastered();
    const $guildMastery = $(`#${guild.id}Mastery`);
    $guildMastery.empty();
    if (guild.unmastered.length === 0) {
        $("<div/>").addClass("emptyContentMessage").html("There are no recipes available to master.").appendTo($guildMastery);
        return;
    }
    const guildMasteryCardContainer = $("<div/>").addClass("guildMasteryCardContainer").appendTo($guildMastery);
    guild.unmastered.forEach(rid => {
        const recipe = recipeList.idToItem(rid);
        guildMasteryCardContainer.append(createRecipeMasteryCard(recipe));
    });
}

function createRecipeMasteryCard(recipe) {
    const d1 = $("<div/>").addClass("recipeMasteryGuildCard");
        $("<div/>").addClass("itemName").html(recipe.itemPicName()).appendTo(d1);
        $("<div/>").addClass("itemLevel").html(recipe.itemLevel()).appendTo(d1);
    const masteryCost = recipe.masteryCost();
    const masteryButton = $("<div/>").addClass("recipeMasteryGuildButton actionButtonCardCost").attr({"id": "rcm"+recipe.id}).data("rid",recipe.id).appendTo(d1);
        $("<div/>").addClass("actionButtonCardText").html("Master Recipe").appendTo(masteryButton);
        $("<div/>").addClass("actionButtonCardValue tooltip").attr({"data-tooltip": "material_desc", "data-tooltip-value": masteryCost.id}).html(`${ResourceManager.materialIcon(masteryCost.id)} ${masteryCost.amt}`).appendTo(masteryButton);
    return d1;
}

function refreshRecipeMasteryAmt(recipe) {
    const masteryCost = recipe.masteryCost();
    const masteryButton = $(`#rcm${recipe.id}`);
    masteryButton.empty();
    $("<div/>").addClass("actionButtonCardText").html("Master Recipe").appendTo(masteryButton);
    $("<div/>").addClass("actionButtonCardValue tooltip").attr({"data-tooltip": "material_desc", "data-tooltip-value": masteryCost.id}).html(`${ResourceManager.materialIcon(masteryCost.id)} ${masteryCost.amt}`).appendTo(masteryButton);
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
    destroyTooltip();
    const itemData = $(e.currentTarget).data();
    GuildManager.idToGuild(itemData.gid).submitItem(itemData.slot);
    refreshOrderInvCount();
});

//buy a recipe from guild
$(document).on("click",".recipeBuyCardBuy", (e) => {
    e.preventDefault();
    destroyTooltip();
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