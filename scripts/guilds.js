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
    }
}

class Guild {
    constructor (props) {
        Object.assign(this, props);
        this.rep = 0;
        this.lvl = 0;
        this.order = [];
    }
    createSave() {
        const save = {};
        save.id = this.id;
        save.lvl = this.lvl;
        save.rep = this.rep;
        save.order = [];
        this.order.forEach(o=>save.order.push(o.createSave()));
        return save;
    }
    loadSave(save) {
        this.rep = save.rep;
        this.lvl = save.lvl;
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
        this.order = [];
        const possibleItems = recipeList.guildOrderItems(this.lvl);
        const possibleGuildItems = possibleItems.filter(r => r.guildUnlock === this.id);
        const chosenFirst = possibleGuildItems[Math.floor(Math.random()*possibleGuildItems.length)];
        const chosenSecond = possibleItems[Math.floor(Math.random()*possibleItems.length)];
        const chosenThird = possibleItems[Math.floor(Math.random()*possibleItems.length)];
        this.order.push(new guildOrderItem(chosenFirst.id, this.lvl));
        if (this.lvl >= 1) this.order.push(new guildOrderItem(chosenSecond.id, this.lvl));
        if (this.lvl >= 2) this.order.push(new guildOrderItem(chosenThird.id, this.lvl));
        refreshguildOrder(this);
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
        refreshAllOrders();
    }
    submitOrder() {
        if (!this.orderComplete()) return Notifications.insufficientGuildOrderSubmit();
        this.addRep();
        achievementStats.gold(this.goldValue());
        ResourceManager.addMaterial("M001",this.goldValue());
        Notifications.submitOrder(this.goldValue());
        this.generateNewOrder();
        refreshAllOrders();
    }
    goldValue() {
        const gold = this.order.map(o => o.goldvalue);
        return gold.reduce((a,b) => a+b)*2;
    }
}

/*
        const gold = Math.round(recipeList.idToItem(id).value*(rarity+1)*(1=sharp*0.1));
        achievementStats.gold(gold);
        ResourceManager.addMaterial("M001",gold);
*/

class guildOrderItem {
    constructor (id,lvl) {
        this.id = id;
        this.item = recipeList.idToItem(id);
        this.lvl = lvl;
        this.rarity = this.generateRarity(lvl);
        this.sharp = this.generateSharp(lvl);
        this.amt = this.generateAmt(lvl);
        this.fufilled = 0;
        this.repgain = 1;
        this.displayName = this.generateName();
        this.goldvalue = Math.round(this.item.value*(1+this.rarity)*(1+this.sharp*0.1)*this.amt);
    }
    createSave() {
        const save = {};
        save.id = this.id;
        save.lvl = this.lvl;
        save.amt = this.amt;
        save.rarity = this.rarity;
        save.sharp = this.sharp;
        save.fufilled = this.fufilled;
        return save;
    }
    loadSave(save) {
        this.amt = save.amt;
        this.rarity = save.rarity;
        this.sharp = save.sharp;
        this.fufilled = save.fufilled;
    }
    complete() {
        return this.fufilled >= this.amt;
    }
    left() {
        return this.amt - this.fufilled;
    }
    generateAmt(lvl) {
        const min = miscLoadedValues["goMin"][lvl];
        const max = miscLoadedValues["goMax"][lvl];
        let startAmt = bellCurve(min,max);
        startAmt -= this.rarity
        if (this.sharp > 0) startAmt -= 1;
        return Math.max(1,startAmt);
    }
    generateRarity(lvl) {
        const epicChance = miscLoadedValues["goEpic"][lvl];
        const greatChance = miscLoadedValues["goGreat"][lvl]+epicChance;
        const goodChance = miscLoadedValues["goGood"][lvl]+greatChance;     
        const sharpRoll = Math.floor(Math.random() * 100);
        if (epicChance > sharpRoll) return 3;
        if (greatChance > sharpRoll) return 2;
        if (goodChance > sharpRoll) return 1;
        return 0;
    }
    generateSharp(lvl) {
        const sharpChance = miscLoadedValues["goSharp"][lvl];
        const sharpMin = miscLoadedValues["goSharpMin"][lvl];
        const sharpMax = miscLoadedValues["goSharpMax"][lvl];
        if (sharpChance < Math.floor(Math.random() * 100)) return 0;
        return bellCurve(sharpMin,sharpMax);
    }
    generateName() {
        if (this.sharp > 0) return `+${this.sharp} ${this.item.name}</span>`
        return `${this.item.name}`
    }
    uniqueID() {
        return this.id+this.rarity+this.sharp;
    }
}

const $guildList = $("#guildList");

function initializeGuilds() {
    $guildList.empty();
    $("<div/>").addClass("guildListButton").data("gid","ActionLeague").html("The Action League").appendTo($guildList);
    GuildManager.guilds.forEach(g => {
        const d1 = $("<div/>").addClass("guildListButton").data("gid",g.id).html(g.name);
        if (GuildManager.lastClicked === g.id) d1.addClass("selected");
        d1.appendTo($guildList);
        $(`#${g.id}Name`).html(g.name);
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
    const d1 = $("<div/>").addClass('guildOrderSubmit').data("gid", id);
        $("<div/>").addClass("guildOrderSubmitText").html("Submit").appendTo(d1);
        $("<div/>").addClass("guildOrderSubmitValue").html(`${miscIcons.gold} +${formatToUnits(guild.goldValue(),2)}`).appendTo(d1);
    if (!guild.orderComplete()) d1.addClass("guildOrderIncomplete");
    $go.append(d1);
};

function createOrderCard(item,id,index) {
    const d1 = $("<div/>").addClass(`orderCard R${item.rarity}`).data({"slot":index,"gid":id});
    if (item.complete()) d1.addClass('orderComplete');
    const d2 = $("<div/>").addClass("orderIcon").html(ResourceManager.materialIcon(item.id));
    const d3 = $("<div/>").addClass("orderName").addClass(`orderName`).html(item.displayName);
    const d4 = $("<div/>").addClass("itemToSac tooltip").attr("data-tooltip",ResourceManager.nameForWorkerSac(item.id));
    const d5 = $("<div/>").addClass("itemToSacReq").html(`${formatToUnits(item.left(),2)} Needed`);
    if (item.complete()) {
        d5.html(`<i class="fas fa-check-circle"></i> Completed`)
        return d1.append(d2,d3,d4,d5);
    }
    const d6 = $("<div/>").addClass("orderInv tooltip").attr("data-tooltip","In Inventory").data("uid",item.uniqueID()).html(`<i class="fas fa-cube"></i> ${Inventory.itemCountSpecific(item.uniqueID())}`);
    return d1.append(d2,d3,d4,d5,d6);
};

function refreshOrderInvCount() {
    $(".orderInv").each(function() {
        const uniqueID = $(this).data("uid");
        $(this).html(`<i class="fas fa-cube"></i> ${Inventory.itemCountSpecific(uniqueID)}`);
    });
}

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

//submit a guild order
$(document).on("click",".guildOrderSubmit",(e) => {
    e.preventDefault();
    const gid = $(e.currentTarget).data("gid");
    GuildManager.submitOrder(gid);
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
    },
    generateNoto(rewards) {
        //takes the rewards list and generates how many pts you should get
        const noto = rewards.map(r => {
            return r.amt*ResourceManager.idToMaterial(r.id).notoAdd;
        });
        return noto.reduce((a,b) => a+b , 0);
    },
    nextUnlock() {
        const perks = this.perks.filter(p => p.notoReq > this.notoriety);
        const perkNoto = perks.map(p=>p.notoReq);
        const lowest = Math.min(...perkNoto);
        return this.perks.find(p => p.notoReq === lowest);
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
        console.log(i);
        $alp.append(createALperk(perk,true));
    });
    const nextperk = ActionLeague.nextUnlock();
    if (nextperk === undefined) return;
    $alp.append(createALperk(nextperk,false));
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