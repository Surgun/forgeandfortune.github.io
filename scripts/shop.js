"use strict";

const Shop = {
    purchased : [],
    perks : [],
    addPerk(reward) {
        this.perks.push(reward);
    },
    createSave() {
        const save = {};
        save.purchased = this.purchased;
        return save;
    },
    loadSave(save) {
        this.purchased = save.purchased;
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
        this.purchased.push(id);
        perk.activate();
        refreshShop();
        refreshProgress();
        refreshShopEvent();
    },
    currentUnlocks() {
        const perks = this.perks.filter(p => !this.purchased.includes(p.id));
        perks.sort((a,b) => a.unlockOrder - b.unlockOrder);
        return perks.slice(0,5);
    },
    perkCount() {
        return this.purchased.length;
    },
    perkMaxCount() {
        return this.perks.length;
    },
    canPurchaseSomething() {
        return this.currentUnlocks().some(p => p.canBuy());
    }
}

class Perk {
    constructor (props) {
        Object.assign(this, props);
        this.image = `<img src='images/perks/${this.id}.png'>`;
    }
    canBuy() {
        return ResourceManager.materialAvailable("M001") >= this.goldCost && ResourceManager.materialAvailable(this.mat) >= this.matAmt;
    }
    activate() {
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
}

const $shopPerks = $("#shopPerks");
const $marketsTab = $("#marketsTab");

function refreshShop() {
    $shopPerks.empty();
    Shop.currentUnlocks().forEach(perk => {
        $shopPerks.append(createALperk(perk));
    });
}

function createALperk(perk) {
    const d1 = $("<div/>").addClass("alPerk");
    $("<div/>").addClass("alTitle").html(perk.title).appendTo(d1);
    $("<div/>").addClass("alImage").html(perk.image).appendTo(d1);
    $("<div/>").addClass("alDesc").html(perk.description).appendTo(d1);
    const d5 = $("<div/>").addClass("alPerkBuy").data("pid",perk.id).appendTo(d1);
        if (!perk.canBuy()) d5.addClass("cannotAfford");
        else d5.removeClass("cannotAfford");
        $("<div/>").addClass("alPerkBuyText").html("Purchase").appendTo(d5);
        const d5a = $("<div/>").addClass("alPerkBuyCost").appendTo(d5);
            $("<div/>").addClass("buyCost tooltip").attr({"data-tooltip": "gold_value", "data-tooltip-value": formatWithCommas(perk.goldCost)}).html(`${miscIcons.gold} ${formatToUnits(perk.goldCost,2)}`).appendTo(d5a);
            $("<div/>").addClass("buyCost tooltip").attr({"data-tooltip": "material_desc", "data-tooltip-value": perk.mat}).html(`${ResourceManager.materialIcon(perk.mat)} ${perk.matAmt}`).appendTo(d5a);
    return d1;
}

function refreshShopEvent() {
    if (Shop.canPurchaseSomething()) $marketsTab.addClass("hasEvent");
    else $marketsTab.removeClass("hasEvent");
}

//buy a perk
$(document).on("click",".alPerkBuy", (e) => {
    e.preventDefault();
    destroyTooltip();
    const perkid = $(e.currentTarget).data("pid");
    Shop.buyPerk(perkid);
});