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
    },
    nextUnlocks(type) {
        const notPurchased = this.perks.filter(p=>p.category === type && !p.purchased).sort((a,b) => a.order-b.order)
        return {canPurchase:notPurchased[0],nextUp:notPurchased[1]};
    },
    boughtPerks() {
        return this.perks.filter(p=>p.purchased);
    },
    alreadyPurchased(perkID) {
        const perk = this.idToPerk(perkID);
        return perk.alreadyPurchased();
    }
}

class Perk {
    constructor (props) {
        Object.assign(this, props);
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
        if (this.type === "craft") actionSlotManager.upgradeSlot();
        if (this.type === "adventure") DungeonManager.partySize += 1;
        if (this.type === "synth" && this.subtype === "open") TownManager.buildingPerk("synth");
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
        if (this.type === "museum" && this.subtype === "open") TownManager.buildingPerk("museum");
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
    alreadyPurchased() {
        return this.purchased;
    }
    availableForPurchase() {
        if (this.unlockReq === null) return true;
        return DungeonManager.beaten(this.unlockReq);
    }
}

const $marketsTab = $("#marketsTab");
const $purchasePerks = $("#purchasePerks");
const $boughtPerks = $("#boughtPerks");
const $purchasedPerks = $("#purchasedPerks");

const shopDivs = [
    "Crafting",
    "Dungeon",
    "Town",
]

function refreshShop() {
    $purchasePerks.empty();
    shopDivs.forEach(type => {
        const perks = Shop.nextUnlocks(type);
        $purchasePerks.append(createALperk(perks.canPurchase,type));
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

function createALperk(perk,name) {
    const perkCount =  Shop.perksByType(name).length - Shop.perksByType(name).filter(perk => perk.purchased).length;
    const d1 = $("<div/>").addClass("alPerk");
    $("<div/>").addClass("alTitle").html(perk.title).appendTo(d1);
    $("<div/>").addClass("alSection").html(`${name} Perk`).appendTo(d1);
    const perkImage = $("<div/>").addClass("alImage").html(perk.icon).appendTo(d1);
    if (perkCount > 1) $("<div/>").addClass("alPerkCount tooltip").attr({"data-tooltip": "perks_remaining"}).html(`+${perkCount - 1}`).appendTo(perkImage);
    $("<div/>").addClass("alDesc").html(perk.description).appendTo(d1);
    if (perk.purchased) {
        return d1.addClass("perkPurchased");
    }
    if (!perk.availableForPurchase()) {
        $("<div/>").addClass("alBossBeat").html("Beat next boss to unlock!").appendTo(d1);
        return d1;
    }
    const d5 = $("<div/>").addClass("alPerkBuy").data("pid",perk.id).appendTo(d1);
        if (!perk.canBuy()) d5.addClass("cannotAfford");
        else d5.removeClass("cannotAfford");
        $("<div/>").addClass("alPerkBuyText").html("Purchase").appendTo(d5);
        const d5a = $("<div/>").addClass("alPerkBuyCost").appendTo(d5);
            $("<div/>").addClass("buyCost tooltip").attr({"data-tooltip": "gold_value", "data-tooltip-value": formatWithCommas(perk.goldCost)}).html(`${miscIcons.gold} ${formatToUnits(perk.goldCost,2)}`).appendTo(d5a);
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