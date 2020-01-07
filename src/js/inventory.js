$('#inventory').on("click",".inventorySell",(e) => {
    e.preventDefault();
    const id = $(e.target).attr("id");
    Inventory.sellInventoryIndex(id);
})

$(document).on("click","#sortInventory",(e) => {
    e.preventDefault();
    Inventory.sortInventory();
});

$(document).on("click","#sellAllCommons",(e) => {
    e.preventDefault();
    Inventory.sellCommons();
    Inventory.sortInventory();
});

$(document).on("click",".inventoryEquip",(e) => {
    e.preventDefault();
    const invID = $(e.target).attr("id");
    gearEquipFromInventory(invID);
})

$(document).on("click","#closeEquipItem",(e) => {
    e.preventDefault();
    $(".tabcontent").hide();
    $("#inventoryTab").show();
})

$(document).on("click",".heroEquipBlockEquipButton",(e) => {
    const heroID = $(e.target).attr("hid");
    const equippingTo = parseInt($(e.target).attr("sid"));
    HeroManager.equipItem(equipContainerTarget.containerID,heroID,equippingTo);
    if (HeroManager.heroView === heroID) examineHero(heroID);
    $(".tabcontent").hide();
    $("#inventoryTab").show();
})

let containerid = 0;

class itemContainer {
    constructor(id,rarity) {
        this.id = id;
        this.item = recipeList.idToItem(id);
        this.name = this.item.name;
        this.type = this.item.type;
        this.lvl = this.item.lvl;
        this.rarity = rarity;
        this.containerID = containerid;
        this.sharp = 0;
        this.seed = Math.floor(Math.random() * 1000000);
        this.scale = 0;
        this.powRatio = this.item.pow;
        this.hpRatio = this.item.hp;
        this.techRatio = this.item.tech;
        this.pts = this.item.pts;
        containerid += 1;
    }
    uniqueID() {
        const result = this.id+"_"+this.rarity+"_"+this.sharp;
        if (this.scale > 0) return result + "_" + this.scale;
        return result;
    }
    createSave() {
        const save = {};
        save.id = this.id;
        save.rarity = this.rarity;
        save.sharp = this.sharp;
        save.seed = this.seed;
        save.scale = this.scale;
        save.powRatio = this.powRatio;
        save.hpRatio = this.hpRatio;
        save.techRatio = this.techRatio;
        return save;
    }
    loadSave(save) {
        this.sharp = save.sharp;
        if (save.seed !== undefined) this.seed = save.seed;
        if (save.scale !== undefined) this.scale = save.scale;
        if (save.powRatio !== undefined) this.powRatio = save.powRatio;
        if (save.hpRatio !== undefined) this.hpRatio = save.hpRatio;
        if (save.techRatio !== undefined) this.techRatio = save.techRatio;
    }
    picName() {
        const sharp = this.sharp > 0 ? `+${this.sharp} ` : "";
        return `${this.item.itemPic()}<div class="item-prefix-name"><span class="item-prefix">${sharp}${this.prefix()}${this.item.name}</span></div>`;
    }
    picNamePlus() {
        const sharp = `<span class="item-prefix">+${this.sharp + 1} </span>`
        return `${this.item.itemPic()}<div class="item-prefix-name"><span class="item-prefix">${sharp}${this.prefix()}${this.item.name}</span></div>`;
    }
    itemLevel() {
        if (this.scale > 0) return `<div class="level_text">${miscIcons.star}</div><div class="level_integer">${this.scale}</div>`;
        return `<div class="level_text">LVL</div><div class="level_integer">${this.lvl}</div>`;
    }
    pow(sharpIncrease = 0, ratioMod = 0) {
        return this.statCalc(Math.max(0,this.powRatio + ratioMod) * this.pts , this.item.powScale , sharpIncrease);
    }
    hp(sharpIncrease = 0, ratioMod = 0) {
        return this.statCalc(Math.max(0,9*(this.hpRatio + ratioMod)) * this.pts , this.item.hpScale , sharpIncrease);
    }
    tech(sharpIncrease = 0, ratioMod = 0) {
        return this.statCalc(Math.max(0,this.techRatio + ratioMod) * this.pts, this.item.techScale , sharpIncrease);
    }
    statCalc(flat,scale,sharpIncrease) {
        const sharpAdd = sharpIncrease ? 1 : 0;
        return Math.floor((flat * miscLoadedValues.rarityMod[this.rarity] + Math.ceil(scale * this.scale)) * (1+0.05*(this.sharp+sharpAdd)));
    }
    goldValueFormatted() {
        return `${ResourceManager.materialIcon("M001")} <span class="goldValue">${formatToUnits(this.goldValue(),2)}</span>`;
    }
    goldValue() {
        return Math.round(this.item.value * (this.rarity+1) * (1+this.sharp*0.1));
    }
    material() {
        if (!this.item.mcost) return "M201";
        return Object.keys(this.item.mcost)[0]
    }
    deconType() {
        return this.item.deconType;
    }
    deconAmt() {
        return Math.floor(this.item.craftTime / 4000);
    }
    itemStat(sharpIncrease = 0, powRatio = 0, hpRatio = 0, techRatio = 0) {
        const stats = {};
        stats[heroStat.pow] = this.pow(sharpIncrease, powRatio);
        stats[heroStat.hp] = this.hp(sharpIncrease, hpRatio);
        stats[heroStat.tech] = this.tech(sharpIncrease, techRatio);
        return stats;
    }
    isTrinket() {
        return this.item.type === "Trinkets";
    }
    prefix() {
        if (this.powRatio === this.item.pow && this.hpRatio === this.item.hp && this.techRatio === this.item.tech) return "";
        return `${adjective[this.powRatio.toString() + this.hpRatio.toString() + this.techRatio.toString()]} `
    }
    transform(ratio) {
        this.powRatio = Math.max(0,this.powRatio + ratio[0]);
        this.hpRatio = Math.max(0,this.hpRatio + ratio[1]);
        this.techRatio = Math.max(0,this.techRatio + ratio[2]);
    }
    maxRatio() {
        return Math.max(this.powRatio,this.hpRatio,this.techRatio);
    }
}

const adjective = {
    "300" : "Powerful",
    "210" : "Sturdy",
    "201" : "Strong",
    "120" : "Mighty",
    "111" : "Balanced",
    "102" : "Potent",
    "012" : "Wonderous",
    "021" : "Unwieldy",
    "030" : "Bulky",
    "003" : "Mystical",
}

const rarities = {
    0: "Common",
    1: "Good",
    2: "Great",
    3: "Epic"
}

function blankItemStat() {
    const stats = {};
    stats[heroStat.pow] = 0;
    stats[heroStat.hp] = 0;
    stats[heroStat.tech] = 0;
    return stats;
}

const Inventory = {
    inv : createArray(20,null),
    invMax : 20,
    createSave() {
        const save = [];
        this.inv.forEach(i => {
            if (i === null) save.push(null);
            else save.push(i.createSave());
        });
        return save;
    },
    loadSave(save) {
        save.forEach((item,i) => {
            if (item === null) return;
            const container = new itemContainer(item.id,item.rarity);
            container.loadSave(item);
            this.inv[i] = container;
        });
    },
    addFuseToInventory(fuse) {
        if (this.full()) return;
        const container = new itemContainer(fuse.id,fuse.rarity);
        container.sharp = fuse.sharp;
        this.findempty(container);
        const item = recipeList.idToItem(container.id);
        if (examineGearTypesCache.includes(item.type)) {
            examineHeroPossibleEquip(examineGearSlotCache,examineGearHeroIDCache);
        }
    },
    addToInventory(container,skipAnimation) {
        if (this.full()) this.sellContainer(container);
        else {
            this.findempty(container,skipAnimation);
            if (examineGearTypesCache.includes(container.item.type)) {
                examineHeroPossibleEquip(examineGearSlotCache,examineGearHeroIDCache,skipAnimation);
            }
        }
    },
    findempty(item,skipAnimation) {
        const i = this.inv.findIndex(r=>r===null);
        this.inv[i] = item;
        if (skipAnimation) return;
        refreshInventoryPlaces();
    },
    craftToInventory(id,skipAnimation) {
        if (TownManager.buildingRecipes().includes(id)) return TownManager.unlockBldg(id);
        const item = recipeList.idToItem(id)
        item.addCount(skipAnimation);
        const roll = Math.floor(Math.random() * 1000);
        const sellToggleChart = {
            "None" : 0,
            "Common" : 1,
            "Good" : 2,
            "Great" : 3,
            "Epic" : 4,
        }
        const sellToggle = sellToggleChart[item.autoSell];
        const procRate = this.craftChance(item);
        if (roll < procRate.epic) {
            const epicItem = new itemContainer(id,3);
            if (sellToggle < 4) {
                this.addToInventory(epicItem,skipAnimation);
                Notifications.exceptionalCraft(item.name,"Epic","craftEpic");
            }
            else this.sellContainer(epicItem,skipAnimation);
            achievementStats.craftedItem("Epic");
        }
        else if (roll < (procRate.epic+procRate.great)) {
            const greatItem = new itemContainer(id,2);
            if (sellToggle < 3) {
                this.addToInventory(greatItem,skipAnimation);
                Notifications.exceptionalCraft(item.name,"Great","craftGreat");
            }
            else this.sellContainer(greatItem,skipAnimation);
            achievementStats.craftedItem("Great");
        }
        else if (roll < (procRate.epic+procRate.great+procRate.good)) {
            const goodItem = new itemContainer(id,1);
            if (sellToggle < 2) {
                this.addToInventory(goodItem,skipAnimation);
                Notifications.exceptionalCraft(item.name,"Good","craftGood");
            }
            else this.sellContainer(goodItem,skipAnimation);
            achievementStats.craftedItem("Good");
            
        }
        else {
            const commonItem = new itemContainer(id,0);
            if (sellToggle < 1) this.addToInventory(commonItem,skipAnimation);
            else this.sellContainer(commonItem,skipAnimation);
            achievementStats.craftedItem("Common");
        }
    },
    craftChance(item) {
        const masterMod = item.isMastered() ? 2 : 1;
        const fortuneMod = FortuneManager.getProcModifier(item.type, item.lvl);
        const mods = {};
        mods.good = miscLoadedValues.qualityCheck[1]*masterMod*fortuneMod[0];
        mods.great = miscLoadedValues.qualityCheck[2]*masterMod*fortuneMod[1];
        mods.epic = miscLoadedValues.qualityCheck[3]*masterMod*fortuneMod[2];
        return mods;
    },
    removeFromInventoryUID(uniqueID) {
        const container = this.nonblank().find(i=>i.uniqueID() === uniqueID);
        this.removeContainerFromInventory(container.containerID);
        refreshInventoryPlaces();
    },
    removeContainerFromInventory(containerID) {
        this.inv = this.inv.filter(c=>c === null || c.containerID !== containerID);
        this.inv.push(null);
        refreshInventoryPlaces()
    },
    hasContainer(containerID) {
        return this.nonblank().some(c => c.containerID === containerID);
    },
    sellInventoryIndex(indx) {
        const item = this.inv[indx];
        this.inv[indx] = null;
        this.sellContainer(item);
        refreshInventoryPlaces()
    },
    sellContainer(container,skipAnimation) {
        const tinkerAteIt = TinkerManager.feedCommon(container);
        if (tinkerAteIt) return;
        const gold = container.goldValue();
        achievementStats.gold(gold);
        ResourceManager.addMaterial("M001",gold,skipAnimation);
    },
    listbyType(types) {
        return this.nonblank().filter(r=>types.includes(r.type));
    },
    containerToItem(containerID) {
        return this.nonblank().find(r=>r.containerID===containerID)
    },
    full(modifier = 1) {
        return this.nonblank().length > this.inv.length - modifier;
    },
    inventoryCount() {
        return this.nonblank().length;
    },
    nonblank() {
        return this.inv.filter(r=>r !== null);
    },
    sortInventory() {
        this.inv = this.inv.filter(c=>c !== null);
        this.inv.sort((a,b) => inventorySort(a,b));
        while (this.inv.length < this.invMax) {
            this.inv.push(null);
        }
        refreshInventoryPlaces()
    },
    getMaxPowByTypes(types) {
        //given a list of types, return highest power
        const pows = this.inv.filter(i => i !== null && types.includes(i.type)).map(p => p.pow());
        if (pows.length === 0) return 0;
        return Math.max(...pows);
    },
    getMaxHPByTypes(types) {
        //given a list of types, return highest power
        const hps = this.inv.filter(i => i !== null && types.includes(i.type)).map(p => p.hp());
        if (hps.length === 0) return 0;
        return Math.max(...hps);
    },
    sellCommons() {
        this.inv.forEach((ic,indx) => {
            if (ic !== null && ic.rarity === 0 && ic.item.recipeType === "normal") this.sellInventoryIndex(indx);
        })
    },
    getFusePossibilities() {
        const fuses = this.nonblank().filter(container => container.item.recipeType === "normal").map(container=>container.uniqueID())
        const fuseSorted = fuses.reduce((fuseList, item) => {
            if (item in fuseList) fuseList[item]++;
            else fuseList[item] = 1;
            return fuseList;
        },{});
        const fuseFiltered = [];
        for (let [idR, num] of Object.entries(fuseSorted)) {
            if (num < 3) continue;
            const fuse = uniqueIDProperties(idR);
            fuse.rarity += 1;
            if (fuse.rarity > 3) continue;
            fuseFiltered.push(fuse);
        }
        return fuseFiltered;
    },
    hasThree(uniqueID) {
        const inv = this.nonblank().filter(i=> i.uniqueID() === uniqueID);
        return inv.length >= 3;
    },
    itemCount(id,rarity) {
        return this.nonblank().filter(r=>r.id === id && r.rarity === rarity).length;
    },
    itemCountAll(id) {
        return this.nonblank().filter(r=>r.id === id).length;
    },
    itemCountSpecific(uniqueID) {
        return this.nonblank().filter(i => i.uniqueID() === uniqueID).length;
    },
    findCraftMatch(uniqueID) {
        return this.nonblank().find(i => i.uniqueID() === uniqueID);
    },
    higherRarity() {
        return this.nonblank().filter(i => i.rarity > 0);
    },
    nonEpic() {
        return this.nonblank().filter(i => i.rarity < 3 && i.item.recipeType === "normal");
    },
}

function uniqueIDProperties(uniqueID) {
    const props = uniqueID.split("_");
    const item = {};
    item.uniqueID = uniqueID;
    item.id = props[0];
    const recipe = recipeList.idToItem(item.id);
    item.rarity = parseInt(props[1]);
    item.sharp = parseInt(props[2]);
    item.name = (item.sharp > 0) ? `${recipe.itemPic()} +${item.sharp} ${recipe.name}` : `${recipe.itemPic()} ${recipe.name}`;
    return item;
}

const $inventory = $("#inventory");
const $sideInventory = $("#inventorySidebar");
const $sideInventoryAmt = $("#invSidebarAmt");

function refreshInventory() {
    $inventory.empty();
    //build the sorted inventory
    Inventory.inv.forEach((item,i) => {
        const itemdiv = $("<div/>").addClass("inventoryItem");
        const itemName = $("<div/>").addClass("inventoryItemName");
        const itemRarity = $("<div/>").addClass(`inventoryItemRarity`);
        const itemLevel = $("<div/>").addClass("inventoryItemLevel");
        const itemCost = $("<div/>").addClass("inventoryItemValue")
        const itemProps = $("<div/>").addClass("inventoryProps");
        const actionBtns = $("<div/>").addClass("inventoryButtons");
        if (item === null) {
            // Empty Inventory Item Filler for Styling
            itemdiv.addClass("inventoryItemEmpty");
                $("<div/>").addClass("inventoryItemEmptyIcon").html(miscIcons.emptySlot).appendTo(itemName);
                $("<div/>").addClass("inventoryItemEmptyText").html(`Empty Slot`).appendTo(itemName);
                $("<div/>").addClass("invPropStat").html(`<span></span>`).appendTo(itemProps);
                $("<div/>").addClass("invPropStat").html(`<span></span>`).appendTo(itemProps);
                $("<div/>").addClass("invPropStat").html(`<span></span>`).appendTo(itemProps);
                $("<div/>").appendTo(actionBtns);
                $("<div/>").appendTo(actionBtns);
            itemdiv.append(itemName,itemRarity,itemLevel,itemProps,actionBtns);
            $inventory.append(itemdiv);
            return;
        }
        itemdiv.addClass("R"+item.rarity)
        itemName.addClass("itemName").attr({"id": item.id, "r": item.rarity}).html(item.picName());
        itemRarity.addClass(`RT${item.rarity} tooltip`).attr({"data-tooltip": `rarity_${rarities[item.rarity].toLowerCase()}`}).html(miscIcons.rarity);
        itemCost.addClass("tooltip").attr({"data-tooltip": "gold_value", "data-tooltip-value": formatWithCommas(item.goldValue())}).html(item.goldValueFormatted());
        itemLevel.addClass("tooltip").attr({"data-tooltip": "item_level"}).html(item.itemLevel());
        if (item.goldValue() === 0) {
            itemCost.hide();
        }
        if (item.lvl === 0 && item.scale === 0) {
            itemLevel.hide();
        }
        for (const [stat, val] of Object.entries(item.itemStat(false))) {
            if (val === 0) continue;
            $("<div/>").addClass("invPropStat tooltip").attr("data-tooltip", stat).html(`${miscIcons[stat]} <span class="statValue">${val}</span>`).appendTo(itemProps);
        };
        if (item.item.recipeType === "normal" || item.item.recipeType === "trinket") {
            $("<div/>").addClass('inventoryEquip').attr("id",i).html("Equip").appendTo(actionBtns);
        }
        if (item.item.recipeType === "trinket") {
            itemLevel.attr({"data-tooltip": "star_rating"});
            itemRarity.hide();
        }
        if (item.goldValue() > 0) {
            $("<div/>").addClass('inventorySell').attr("id",i).html("Sell").appendTo(actionBtns);
        }
        else {
            $("<div/>").addClass('inventorySell').attr("id",i).html("Discard").appendTo(actionBtns);
        }
        itemdiv.append(itemName,itemRarity,itemLevel,itemCost,itemProps,actionBtns);
        $inventory.append(itemdiv);
    });
    $sideInventoryAmt.html(`${Inventory.inventoryCount()}/20`)
    if (Inventory.inventoryCount() === 20) $sideInventory.addClass("inventoryFullSide");
    else $sideInventory.removeClass("inventoryFullSide");
}

function createInventoryCard(container,i) {
    const itemdiv = $("<div/>").addClass("inventoryItem").addClass("R"+container.rarity);
    const itemName = $("<div/>").addClass("inventoryItemName itemName").attr({"id": container.id, "r": container.rarity}).html(container.picName());
    const itemRarity = $("<div/>").addClass(`inventoryItemRarity RT${container.rarity} tooltip`).attr({"data-tooltip": `rarity_${rarities[container.rarity].toLowerCase()}`}).html(miscIcons.rarity);
    const itemCost = $("<div/>").addClass("inventoryItemValue tooltip").attr({"data-tooltip": "gold_value", "data-tooltip-value": formatWithCommas(container.goldValue())}).html(container.goldValueFormatted());
    const itemLevel = $("<div/>").addClass("inventoryItemLevel tooltip").attr({"data-tooltip": "item_level"}).html(container.itemLevel());
    if (container.goldValue() === 0) {
        itemCost.hide();
    }
    if (container.lvl === 0 && container.scale === 0) {
        itemLevel.hide();
    }
    const itemProps = $("<div/>").addClass("inventoryProps");
    for (const [stat, val] of Object.entries(container.itemStat(false))) {
        if (val === 0) continue;
        $("<div/>").addClass("invPropStat tooltip").attr("data-tooltip", stat).html(`${miscIcons[stat]} <span class="statValue">${val}</span>`).appendTo(itemProps);
    };
    const actionBtns = $("<div/>").addClass("inventoryButtons");
    if (container.item.recipeType === "normal" || container.item.recipeType === "trinket") {
        $("<div/>").addClass('inventoryEquip').attr("id",i).html("Equip").appendTo(actionBtns);
    }
    if (container.item.recipeType === "trinket") {
        itemLevel.attr({"data-tooltip": "star_rating"});
        itemRarity.hide();
    }
    if (container.goldValue() > 0) {
        $("<div/>").addClass('inventorySell').attr("id",i).html("Sell").appendTo(actionBtns);
    }
    else {
        $("<div/>").addClass('inventorySell').attr("id",i).html("Discard").appendTo(actionBtns);
    }
    itemdiv.append(itemName,itemRarity,itemLevel,itemCost,itemProps,actionBtns);
    return itemdiv;
}

let equipContainerTarget = null;
const $ietEquip = $("#ietEquip");
const $ietHero = $("#ietHero");

function gearEquipFromInventory(invID) {
    $ietEquip.empty();
    $ietHero.empty();
    equipContainerTarget = Inventory.inv[invID];
    const item = equipContainerTarget.item;
    const itemdiv = $("<div/>").addClass("equipItem");
    itemdiv.addClass("R"+equipContainerTarget.rarity)
    const itemName = $("<div/>").addClass("equipItemName itemName").attr("id",item.id).attr("r",equipContainerTarget.rarity).html(equipContainerTarget.picName());
    const itemRarity = $("<div/>").addClass(`inventoryItemRarity RT${equipContainerTarget.rarity} tooltip`).attr({"data-tooltip": `rarity_${rarities[equipContainerTarget.rarity].toLowerCase()}`}).html(miscIcons.rarity);
    const itemLevel = $("<div/>").addClass("equipItemLevel tooltip").attr({"data-tooltip": "item_level"}).html(equipContainerTarget.itemLevel());
    const itemProps = $("<div/>").addClass("equipItemProps");
    for (const [stat, val] of Object.entries(equipContainerTarget.itemStat(false))) {
        if (val === 0) continue;
        $("<div/>").addClass("invPropStat tooltip").attr("data-tooltip", stat).html(`${miscIcons[stat]} <span class="statValue">${val}</span>`).appendTo(itemProps);
    };
    if (equipContainerTarget.item.recipeType === "trinket") {
        itemLevel.attr({"data-tooltip": "star_rating"});
        itemRarity.hide();
    }
    itemdiv.append(itemName,itemRarity,itemLevel,itemProps);
    $ietEquip.html(itemdiv);
    const heroBlocks = HeroManager.slotsByItem(item);
    heroBlocks.forEach(hb=> {
        const hero = HeroManager.idToHero(hb.id);
        const d = $("<div/>").addClass("heroEquipBlock");
        const d1 = $("<div/>").addClass("heroEquipBlockPic").html(hero.head);
        const d2 = $("<div/>").addClass("heroEquipBlockName").html(hero.name);
        const d3 = $("<div/>").addClass("heroEquipBlockEquips");
        hb.canEquip.forEach((tf,i) => {
            if (!tf) return;
            const d4 = $("<div/>").addClass("heroEquipBlockEquip").appendTo(d3);
            const currentStats = hero.getSlot(i) ? hero.getSlot(i).itemStat() : blankItemStat();
            const newStats = equipContainerTarget.itemStat();
            let same = true;
            for (const [stat, val] of Object.entries(newStats)) {
                const deltaStat = val - currentStats[stat];
                if (deltaStat === 0 && val === 0) continue;
                same = false;
                const d4a = $('<div/>').addClass('heroEquipBlockEquipStat tooltip').attr("data-tooltip", stat).appendTo(d4);
                if (deltaStat > 0) d4a.addClass("hebPositive").html(`${miscIcons[stat]} <span class="statValue">${val} (+${deltaStat})</span>`);
                else if (deltaStat < 0) d4a.addClass("hebNegative").html(`${miscIcons[stat]} <span class="statValue">${val} (${deltaStat})</span>`);
                else d4a.html(`${miscIcons[stat]}${val}`);
            }
            if (same) $("<div/>").addClass("heroEquipBlockEquipStat").html("No Change").appendTo(d4);
            $("<div/>").addClass("heroEquipBlockEquipButton").attr("hid",hb.id).attr("sid",i).html("Equip").appendTo(d4);

        });
        d.append(d1,d2,d3);
        $ietHero.append(d);
    });
    $(".tabcontent").hide();
    $("#inventoryEquipTab").show();
}

function refreshInventoryPlaces() {
    refreshInventory();
    refreshCardInvCount();
    refreshOrderInvCount()
    refreshPossibleFuse();
    refreshBankInventory();
    refreshSmithInventory();
    refreshSmithStage();
    refreshSynthInventory();
    refreshFortuneGear();
    refreshTrinketInventory();
}
