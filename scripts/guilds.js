"use strict";

const GuildManager = {
    guilds : [],
    lastClicked : "G001",
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
        console.log(save);
        save.guilds.forEach(guildSave => {
            
            const guild = this.idToGuild(guildSave.id);
            guild.loadSave(guildSave);
        });
    },
    idToGuild(id) {
        return this.guilds.find(g=>g.id === id);
    },
}

class Guild {
    constructor (props) {
        Object.assign(this, props);
        this.rep = 0;
        this.lvl = 0;
        this.order = this.generateNewOrder();
    }
    createSave() {
        const save = {};
        save.id = this.id;
        save.rep = this.rep;
        save.order = [];
        this.order.forEach(o=>save.order.push(o.createSave()));
        return save;
    }
    loadSave(save) {
        this.rep = save.rep;
        save.order.forEach(o => {
            const container = new guildOrderItem(o.id, o.amt, o.rarity, o.sharp);
            container.loadSave(o);
            this.order.push(container);
        });
    }
    addRep() {
        this.order.forEach(o => {
            this.rep += o.repgain;
        });
        if (this.rep >= this.repLvl()) {
            this.rep -= this.repLvl();
            this.lvl += 1;
            refreshSales(this);
        }
        refreshguildprogress(this);
    }
    repLvl(givenlvl) {
        givenlvl = givenlvl || this.lvl;
        return miscLoadedValues["guildRepForLvls"][givenlvl];
    }
    recipeListID() {
        return recipeList.filterByGuild(this.id).map(r => r.id);
    }
    recipeToBuy() {
        return recipeList.filterByGuild(this.id).filter(r =>!r.owned && r.repReq <= this.lvl);
    }
    recipeNextLevel() {
        return recipeList.filterByGuild(this.id).filter(r => r.repReq === this.lvl + 1 );
    }
    recipeListOwnedID() {
        return this.recipeList().filter(r=>r.owned).map(r => r.id);
    }
    workers() {
        return WorkerManager.filterByGuild(this.id).filter(w => w.owned);
    }
    orderComplete() {
        return this.order.every(o=>o.complete());
    }
    generateNewOrder() {
        const order = [];
        const possibleItems = recipeList.recipes.filter(r => r.repReq === this.lvl);
        const possibleGuildItems = possibleItems.filter(r => r.guildUnlock === this.id);
        const chosenFirst = possibleGuildItems[Math.floor(Math.random()*possibleGuildItems.length)];
        const chosenSecond = possibleItems[Math.floor(Math.random()*possibleItems.length)];
        const chosenThird = possibleItems[Math.floor(Math.random()*possibleItems.length)];
        order.push(new guildOrderItem(chosenFirst.id,3,0,0));
        if (this.lvl === 0) return order;
        order.push(new guildOrderItem(chosenSecond.id,3,0,0));
        if (this.lvl === 1) return order;
        order.push(new guildOrderItem(chosenThird,3,0,0));
        return order;
    }
    getItem(slot) {
        return this.order[slot];
    }
    submitItem(slot) {
        const submitContainer = this.order[slot];
        const itemString = submitContainer.id+submitContainer.rarity+submitContainer.sharp;
        const itemMatch = Inventory.findCraftMatch(itemString);
        if (itemMatch === undefined) return Notifications.cantFindMatch();
        Inventory.removeContainerFromInventory(itemMatch.containerID);
        submitContainer.fufilled += 1;
        if (this.orderComplete()) {
            this.addRep();
            this.order = this.generateNewOrder();
        }
        refreshAllOrders();
    }
}

class guildOrderItem {
    constructor (id,amt,rarity,sharp) {
        this.id = id;
        this.item = recipeList.idToItem(id);
        this.amt = amt;
        this.rarity = rarity;
        this.sharp = sharp;
        this.fufilled = 0;
        this.repgain = 1;
    }
    createSave() {
        const save = {};
        save.id = this.id;
        save.amt = this.amt;
        save.rarity = this.rarity;
        save.sharp = this.sharp;
        save.fufilled = this.fufilled;
        return save;
    }
    loadSave(save) {
        this.fufilled = save.fufilled;
    }
    complete() {
        return this.fufilled >= this.amt;
    }
    left() {
        return this.amt - this.fufilled;
    }
}



const $guildList = $("#guildList");

function initializeGuilds() {
    $guildList.empty();
    $("<div/>").addClass("guildListButton").data("gid","ActionLeague").html("Action League").appendTo($guildList);
    GuildManager.guilds.forEach(g => {
        $("<div/>").addClass("guildListButton").data("gid",g.id).html(g.name).appendTo($guildList);
        $(`#${g.id}Name`).html(g.name);
        $(`#${g.id}Desc`).html(g.description);
        $(".guildContainer").hide();
        $("#"+GuildManager.lastClicked).show();
        refreshguildprogress(g);
        refreshguildOrder(g);
        refreshSales(g);
        refreshGuildWorkers(g);
    });
};

function refreshAllProgress() {
    GuildManager.guilds.forEach(g => refreshguildprogress(g));
}

function refreshguildprogress(guild) {
    const id = guild.id;
    const $gp = $(`#${id}Progress`);
    $gp.empty();
    $gp.append(createGuildBar(guild));
}



function createGuildBar(guild) {
    const repPercent = guild.rep/guild.repLvl();
    const repWidth = (repPercent*100).toFixed(1)+"%";
    const d1 = $("<div/>").addClass("repBarDiv");
    const d2 = $("<div/>").addClass("repBar").attr("data-label",`Level ${guild.lvl} (${guild.rep}/${guild.repLvl()})`);
    const s1 = $("<span/>").addClass("repBarFill").css('width', repWidth);
    return d1.append(d2,s1);
}

function refreshAllOrders() {
    GuildManager.guilds.forEach(g => refreshguildOrder(g));
}

function refreshguildOrder(guild) {
    const id = guild.id;
    const $go = $(`#${id}Order`);
    $go.empty();
    guild.order.forEach((item,i) => {
        $go.append(createOrderCard(item,id,i));
    });
};

function createOrderCard(item,id,index) {
    const d1 = $("<div/>").addClass("orderCard").data({"slot":index,"gid":id});
    const d2 = $("<div/>").addClass("orderIcon").html(ResourceManager.materialIcon(item.id));
    const d3 = $("<div/>").addClass("orderName").html(item.item.name);
    const d4 = $("<div/>").addClass("itemToSac tooltip").attr("data-tooltip",ResourceManager.nameForWorkerSac(item.id));
    const d5 = $("<div/>").addClass("itemToSacReq").html(`${formatToUnits(item.left(),2)} Needed`);
    if (item.complete()) d1.hide();
    return d1.append(d2,d3,d4,d5);
};

function refreshAllSales() {
    GuildManager.guilds.forEach(g => refreshSales(g));
};

function refreshSales(guild) {
    const $gs = $(`#${guild.id}Sales`);
    $gs.empty();
    guild.recipeToBuy().forEach(recipe => {
        $gs.append(createRecipeBuyCard(recipe,false));
    });
    guild.recipeNextLevel().forEach(recipe => {
        $gs.append(createRecipeBuyCard(recipe,true));
    })
};

function createRecipeBuyCard(recipe,buyLater) {
    const d1 = $("<div/>").addClass("recipeBuyCard");
    const d2 = $("<div/>").addClass("recipeBuyCardHead").html(recipe.type);
    const d3 = $("<div/>").addClass("recipeBuyCardBody").html(recipe.itemPicName());
    if (buyLater) {
        const d4 = $("<div/>").addClass("recipeBuyCardBuyLater").html("Reach next Guild Level to Unlock");
        return d1.append(d2,d3,d4);
    }
    const d5 = $("<div/>").addClass("recipeBuyCardBuy").data("rid",recipe.id);
        $("<div/>").addClass("recipeBuyCardBuyText").html("Purchase").appendTo(d5);
        $("<div/>").addClass("recipeBuyCardBuyCost").html(`${miscIcons.gold} ${formatToUnits(recipe.goldCost,2)}`).appendTo(d5);
    return d1.append(d2,d3,d5);
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
    const d2 = $("<div/>").addClass("workerBuyCardLevel").html(`<div class="level_text">LVL</div><div class="level_integer">${worker.lvl}</div>`);
    const d3 = $("<div/>").addClass("workerBuyCardBodyImage").html(worker.pic);
    const d4 = $("<div/>").addClass("workerBuyCardBodyName").html(worker.name);
    const d5 = $("<div/>").addClass("workerBuyCardBodyProduction").html(worker.productionText());
    const d6 = $("<div/>").addClass("workerBuyCardBuy").data("wid",worker.workerID);
        $("<div/>").addClass("recipeBuyCardBuyText").html("Upgrade").appendTo(d6);
        $("<div/>").addClass("recipeBuyCardBuyCost").html(`${miscIcons.gold} ${formatToUnits(worker.goldCostLvl(),2)}`).appendTo(d6);
    if (worker.maxlvl()) {
        const d7 = $("<div/>").addClass("workerBuyCardMax").html("Max Level!");
        return d1.append(d2,d3,d4,d5,d7);
    }
    return d1.append(d2,d3,d4,d5,d6);
};

//click guild tab button
$(document).on("click",".guildListButton",(e) => {
    e.preventDefault();
    $(".guildListButton").removeClass("selected");
    $(e.currentTarget).addClass("selected");
    const gid = $(e.currentTarget).data("gid");
    GuildManager.lastClicked = gid;
    $(".guildContainer").hide();
    console.log(gid);
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

//buy a worker from guild
$(document).on("click",".workerBuyCardBuy", (e) => {
    e.preventDefault();
    const workerId = $(e.currentTarget).data("wid");
    WorkerManager.upgradeWorker(workerId);
});

//********************************
// ACTION LEAGUE STUFF
//********************************/

const ActionLeague = {
    notoriety : 0,
    np : 0,
    lvl : 0,
    purchased : [],
    perks : [],
    addPerk(reward) {
        this.perks.push(reward);
    },
    createSave() {
        const save = {};
        save.notoriety = this.notoriety;
        save.np = this.np;
        save.lvl = this.lvl;
        save.purchased = this.purchased;
        return save;
    },
    loadSave(save) {
        this.notoriety = save.notoriety;
        this.np = save.np;
        this.lvl = save.lvl;
        this.purchased = save.purchased;
    },
    idToPerk(id) {
        return this.perk.find(r=>r.id === id);
    },
    addNoto(amt) {
        if (this.fame === this.maxfame()) return;
        this.notoriety += amt
        if (this.notoriety < this.fameLvl()) return;
        this.notoriety -= this.fameLvl();
        this.lvl += 1;
        this.np += 1;
    },
    maxfame() {
        return DungeonManager.bossesBeat.length*10;
    },
    fameLvl() {
        return miscLoadedValues["alFameReq"][this.lvl];
    },
    buyPerk(id) {
        const perk = this.idToPerk(id);
        if (this.np < perk.npCost) return Notifications.alRewardCost();
        this.np -= perk.npCost;
        this.purchased.push(id);
        perk.activate();
    },
}

class alRewards {
    constructor (props) {
        Object.assign(this, props);
    }
    activate() {
        if (this.type === "hero") HeroManager.gainHero(this.subtype);
        if (this.type === "worker") WorkerManager.gainWorker(this.subtype);
        if (this.type === "boss") DungeonManager.unlockDungeon(this.subtype);
        if (this.type === "craft") actionSlotManager.upgradeSlot();
        if (this.type === "bank") {
            TownManager.bankOnce = true;
            TownManager.bankSee = true;
        }
        if (this.type === "cauldron") {
            TownManager.fuseOnce = true;
            TownManager.fuseSee = true;
        }
        if (this.type === "forge") {
            TownManager.smithOnce = true;
            TownManager.smithSee = true;
        }
        if (this.type === "fortune") {
            TownManager.fortuneOnce = true;
            TownManager.fortuneSee = true;
        }
    }
}

const $algp = $("#ALProgress");
const $alp = $("#ALPerks");

function refreshALprogress() {
    $algp.empty();
    $algp.append(createALGuildBar());
}

function createALGuildBar() {
    const notoPercent = ActionLeague.notoriety/ActionLeague.fameLvl();
    const notoWidth = (notoPercent*100).toFixed(1)+"%";
    const d1 = $("<div/>").addClass("notoBarDiv");
    const d2 = $("<div/>").addClass("notoBar").attr("data-label",`Level ${ActionLeague.lvl} (${ActionLeague.notoriety}/${ActionLeague.fameLvl()})`);
    const s1 = $("<span/>").addClass("notoBarFill").css('width',notoWidth);
    return d1.append(d2,s1);
}

function refreshALperks() {
    $alp.empty();
    const perks = ActionLeague.perks.filter(p=>o.fame >= ActionLeague.lvl && !ActionLeague.purchased.includes(o.id));
    perks.forEach(perk => {
        $alp.append(createALPerk(perk));
    });
}

function createALperk(perk) {
    const d1 = $("<div/>").addClass("alPerk");
    const d2 = $("<div/>").addClass("alTitle").html(perk.title);
    const d3 = $("<div/>").addClass("alImage").html(perk.image);
    const d4 = $("<div/>").addClass("alDesc").html(perk.description);
    const d5 = $("<div/>").addClass("alPerkBuy").data("pid",perk.id);
        $("<div/>").addClass("alPerkBuyText").html("Unlock").appendTo(d5);
        $("<div/>").addClass("alPerkBuyCost").html(`${formatToUnits(perk.npCost,2)}`).appendTo(d6);
    return d1.append(d2,d3,d4,d5);
}

//buy a perk
$(document).on("click",".alPerkBuy", (e) => {
    e.preventDefault();
    const perkid = $(e.currentTarget).data("pid");
    ActionLeague.buyPerk(perkid);
});