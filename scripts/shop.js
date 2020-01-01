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
        if (ResourceManager.materialAvailable("M001") < perk.goldCost || ResourceManager.materialAvailable(perk.mat) < perk.matAmt) {
            Notifications.perkCost();
            return;
        }
        ResourceManager.deductMoney(perk.goldCost);
        ResourceManager.addMaterial(perk.mat,-perk.matAmt)
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
    },
    nextUnlocks(type) {
        const notPurchased = this.perks.filter(p=>p.category === type && !p.purchased).sort((a,b) => a.order-b.order)
        return {canPurchase:notPurchased[0],nextUp:notPurchased[1]};
    },
    boughtPerks() {
        return this.perks.filter(p=>p.purchased);
    }
}

class Perk {
    constructor (props) {
        Object.assign(this, props);
        this.purchased = false;
    }
    canBuy() {
        return ResourceManager.materialAvailable("M001") >= this.goldCost && ResourceManager.materialAvailable(this.mat) >= this.matAmt;
    }
    purchase() {
        this.purchased = true;
        if (this.type === "hero") HeroManager.gainHero(this.subtype);
        if (this.type === "worker") {
            WorkerManager.gainWorker(this.subtype);
            initializeGuilds();
        }
        if (this.type === "dungeon") DungeonManager.unlockDungeon(this.subtype);
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

const $marketsTab = $("#marketsTab");
const $purchasePerks = $("#purchasePerks");
const $remainingPerks = $("#remainingPerks");
const $boughtPerks = $("#boughtPerks");
const $purchasedPerks = $("#purchasedPerks");

const shopDivs = [
    "Crafting",
    "Dungeon",
    "Town",
]

function refreshShop() {
    $purchasePerks.empty();
    $remainingPerks.empty();
    shopDivs.forEach(type => {
        const perks = Shop.nextUnlocks(type);
        $purchasePerks.append(createALperk(perks.canPurchase,type));
        $remainingPerks.append(showRemainingPerks(type));
    })
    const boughtPerks = Shop.boughtPerks();
    if (boughtPerks.length > 0) {
        $purchasedPerks.show();
        $boughtPerks.empty();
        boughtPerks.forEach(perk => {
            createPurchasedperk(perk).appendTo($boughtPerks);
        });
    }
    else $purchasedPerks.hide();
}

function showRemainingPerks(type) {
    const perkCount =  Shop.perksByType(type).length - Shop.perksByType(type).filter(perk => perk.purchased).length;
    if (perkCount <= 2) return;
    const d1 = $("<div/>").addClass("alPerkRemaining");
        $("<div/>").addClass("alTitle").html(`${type} Perks`).appendTo(d1);
        $("<div/>").addClass("alPerkCount").html(`+${perkCount - 2}`).appendTo(d1);
        $("<div/>").addClass("alDesc").html(`More perks available for purchase.`).appendTo(d1);
        $("<div/>").addClass("alBuyPrev").html(`Purchase previous perk to unlock more perks.`).appendTo(d1);
    return d1;
}

function createALperk(perk,name) {
    const d1 = $("<div/>").addClass("alPerk");
    $("<div/>").addClass("alTitle").html(perk.title).appendTo(d1);
    $("<div/>").addClass("alSection").html(`${name} Perk`).appendTo(d1);
    $("<div/>").addClass("alImage").html(perk.icon).appendTo(d1);
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
            $("<div/>").addClass("buyCost tooltip").addClass("shopMat"+perk.mat).data("perkID",perk.id).attr({"data-tooltip": "material_desc", "data-tooltip-value": perk.mat}).html(`${ResourceManager.materialIcon(perk.mat)} ${perk.matAmt}`).appendTo(d5a);
    return d1;
}

function createPurchasedperk(perk) {
    const d1 = $("<div/>").addClass("alPurchasedPerk tooltip").attr({"data-tooltip": "perk_desc", "data-tooltip-value": perk.id});
    $("<div/>").addClass("purchasedPerkTitle").html(perk.title).appendTo(d1);
    $("<div/>").addClass("alSection").html(`${perk.category} Perk`).appendTo(d1);
    $("<div/>").addClass("purchasedPerkImage").html(perk.icon).appendTo(d1);
    return d1;
}

//buy a perk
$(document).on("click",".alPerkBuy", (e) => {
    e.preventDefault();
    destroyTooltip();
    const perkid = $(e.currentTarget).data("pid");
    Shop.buyPerk(perkid);
});