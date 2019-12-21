"use strict";

const Shop = {
    purchased : [],
    perks : [],
    addPerk(reward) {
        this.perks.push(reward);
    },
    createSave() {
        const save = {};
        save.perks = [];
        this.perks.forEach(p => save.perks.push(p.createSave()));
        return save;
    },
    loadSave(save) {
        save.perks.forEach(perk => {
            this.idToPerk(perk.id).loadSave(perk);
        });
    },
    idToPerk(id) {
        return this.perks.find(r=>r.id === id);
    },
    buyPerk(id) {
        const perk = this.idToPerk(id);
        if (ResourceManager.materialAvailable("M001") < perk.goldCost) {
            Notifications.perkCost();
            return;
        }
        ResourceManager.deductMoney(perk.goldCost);
        perk.purchase();
        refreshShop();
        refreshProgress();
    },
    perkCount() {
        return this.purchased.length;
    },
    perkMaxCount() {
        return this.perks.length;
    },
    perksByType(type) {
        return this.perks.filter(p=>p.category === type).sort((a,b) => a.order-b.order);
    }
}

class Perk {
    constructor (props) {
        Object.assign(this, props);
        this.image = `<img src='images/perks/${this.id}.png'>`;
        this.purchased = false;
    }
    canBuy() {
        return ResourceManager.materialAvailable("M001") >= this.goldCost;
    }
    purchase() {
        this.purchased = true;
        if (this.type === "hero") HeroManager.gainHero(this.subtype);
        if (this.type === "worker") {
            WorkerManager.gainWorker(this.subtype);
            initializeGuilds();
        }
        if (this.type === "boss") DungeonManager.unlockDungeon(this.subtype);
        if (this.type === "craft") actionSlotManager.upgradeSlot();
        if (this.type === "adventure") DungeonManager.partySize += 1;
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
    createSave() {
        const save = {};
        save.id = this.id;
        save.purchased = this.purchased;
        return save;
    }
    loadSave(save) {
        this.purchased = save.purchased;
    }
}

const $shopPerks = $("#shopPerks");
const $marketsTab = $("#marketsTab");


const $craftPerks = $("#craftPerks");
const $adventurePerks = $("#adventurePerks");
const $townPerks = $("#townPerks");


function refreshShop() {
    $craftPerks.empty();
    $adventurePerks.empty();
    $townPerks.empty();
    let firstPerk = false;
    Shop.perksByType("Crafting").forEach(perk => {
        $craftPerks.append(createALperk(perk,firstPerk));
        if (!perk.purchased) firstPerk = true;
    });
    $craftPerks.append(showRemainingPerks("Crafting"));
    firstPerk = false;
    Shop.perksByType("Dungeon").forEach(perk => {
        $adventurePerks.append(createALperk(perk,firstPerk));
        if (!perk.purchased) firstPerk = true;
    });
    $adventurePerks.append(showRemainingPerks("Dungeon"));
    firstPerk = false;
    Shop.perksByType("Town").forEach(perk => {
        $townPerks.append(createALperk(perk,firstPerk));
        if (!perk.purchased) firstPerk = true;
    });
    $townPerks.append(showRemainingPerks("Town"));
}

function showRemainingPerks(type) {
    const perkCount =  Shop.perksByType(type).length - Shop.perksByType(type).filter(perk => perk.purchased).length;
    if (perkCount > 1) {
        const d1 = $("<div/>").addClass("alPerkRemaining");
            $("<div/>").addClass("alTitle").html(`Perks Remaining`).appendTo(d1);
            $("<div/>").addClass("alPerkCount").html(`+${perkCount - 1}`).appendTo(d1);
            $("<div/>").addClass("alDesc").html(`more perks for available for purchase`).appendTo(d1);
        return d1;
    }
    return;
}

function createALperk(perk,firstperk) {
    const d1 = $("<div/>").addClass("alPerk");
    if (firstperk) {
        // d1.addClass("perkLocked");
        // $("<div/>").addClass("alTitle").html("Perk Locked").appendTo(d1);
        // $("<div/>").addClass("alDesc").html("Purchase Previous Perk First!").appendTo(d1);
        // return d1;
        return;
    }
    $("<div/>").addClass("alTitle").html(perk.title).appendTo(d1);
    $("<div/>").addClass("alImage").html(perk.image).appendTo(d1);
    $("<div/>").addClass("alDesc").html(perk.description).appendTo(d1);
    if (perk.purchased) {
        return d1.addClass("perkPurchased");
    }
    const d5 = $("<div/>").addClass("alPerkBuy").data("pid",perk.id).appendTo(d1);
        if (!perk.canBuy()) d5.addClass("cannotAfford");
        else d5.removeClass("cannotAfford");
        $("<div/>").addClass("alPerkBuyText").html("Purchase").appendTo(d5);
        const d5a = $("<div/>").addClass("alPerkBuyCost").appendTo(d5);
            $("<div/>").addClass("buyCost tooltip").attr({"data-tooltip": "gold_value", "data-tooltip-value": formatWithCommas(perk.goldCost)}).html(`${miscIcons.gold} ${formatToUnits(perk.goldCost,2)}`).appendTo(d5a);
    return d1;
}

//buy a perk
$(document).on("click",".alPerkBuy", (e) => {
    e.preventDefault();
    destroyTooltip();
    const perkid = $(e.currentTarget).data("pid");
    Shop.buyPerk(perkid);
});