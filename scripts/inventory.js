$('#inventory').on("click",".inventorySell",(e) => {
    e.preventDefault();
    const id = $(e.target).attr("id");
    Inventory.sellInventory(id);
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
        return save;
    }
    loadSave(save) {
        this.sharp = save.sharp;
        if (save.seed !== undefined) this.seed = save.seed;
        if (save.scale !== undefined) this.scale = save.scale;
    }
    picName() {
        const prefix = `<span class="item-prefix-name">+${this.sharp} ${this.item.name}</span>`
        if (this.sharp > 0) return `${this.item.itemPic()}<div class="item-prefix-name">${prefix}</div>`;
        return this.item.itemPicName();
    }
    picNamePlus() {
        const prefix = `<span class="item-prefix">+${this.sharp + 1}</span>`
        return `${this.item.itemPic()}<div class="item-prefix-name">${prefix+this.item.itemName()}</div>`;
    }
    itemLevel() {
        if (this.scale > 0) return `<div class="level_text">${miscIcons.star}</div><div class="level_integer">${this.scale}</div>`;
        return `<div class="level_text">LVL</div><div class="level_integer">${this.lvl}</div>`;
    }
    pow() { return this.statCalc(this.item.pow,this.item.powScale); }
    hp() { return this.statCalc(this.item.hp,this.item.hpScale); }
    armor() { return this.statCalc(this.item.armor,this.item.armorScale); }
    resist() { return this.statCalc(this.item.resist,this.item.resistScale); }
    crit() { return this.statCalc(this.item.crit,this.item.critScale); }
    dodge() { return this.statCalc(this.item.dodge,this.item.dodgeScale); }
    spow() { return this.statCalc(this.item.spow,this.item.spowScale); }
    apen() { return this.statCalc(this.item.apen,this.item.apenScale); }
    mpen() { return this.statCalc(this.item.mpen,this.item.mpenScale); }
    powPlus() {
        return Math.floor(this.pow()*1.05);
    }
    hpPlus() {
        return Math.floor(this.hp()*1.05);
    }
    statCalc(flat,scale) {
        return Math.floor((flat * miscLoadedValues.rarityMod[this.rarity] + scale * this.scale) * (1+0.05*this.sharp));
    }
    propDiv() {
        const d = $("<div/>").addClass("invProp");
        if (this.pow() > 0) {
            const d1 = $("<div/>").addClass("invPropPow tooltip").attr("data-tooltip", "POW").html(miscIcons.pow + "&nbsp;" + this.pow())
            d.append(d1);
        }
        if (this.hp() > 0) {
            const d3 = $("<div/>").addClass("invPropHP tooltip").attr("data-tooltip", "HP").html(miscIcons.hp + "&nbsp;" + this.hp())
            d.append(d3);
        }
        return d;
    }
    statChange(upgrade) {
        const d = $("<div/>").addClass("invProp");
        if (this.pow() > 0) {
            const d2 = $("<div/>").addClass("invPropPow tooltip").attr("data-tooltip","POW")
            if (upgrade) d2.html(`${miscIcons.pow}&nbsp;${this.powPlus()}`);
            else d2.html(`${miscIcons.pow}&nbsp;${this.pow()}`);
            d.append(d2);
        }
        if (this.hp() > 0) {
            const d2 = $("<div/>").addClass("invPropPow tooltip").attr("data-tooltip","HP");
            if (upgrade) d2.html(`${miscIcons.hp}&nbsp;${this.hpPlus()}`);
            else d2.html(`${miscIcons.hp}&nbsp;${this.hp()}`);
            d.append(d2);
        }
        return d;
    }
    goldValueFormatted() {
        return ResourceManager.materialIcon("M001") + "&nbsp;" + formatToUnits(this.goldValue(),2);
    }
    goldValue() {
        return (this.item.value * (this.rarity+1));
    }
    getSmithResourceCost() {
        return this.item.smithCost;
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
    itemStat() {
        const stats = {};
        stats[heroStat.pow] = this.pow();
        stats[heroStat.hp] = this.hp();
        stats[heroStat.armor] = this.armor();
        stats[heroStat.resis] = this.resist();
        stats[heroStat.crit] = this.crit();
        stats[heroStat.dodge] = this.dodge();
        stats[heroStat.spow] = this.spow();
        stats[heroStat.apen] = this.apen();
        stats[heroStat.mpen] = this.mpen();
        return stats;
    }
}

function blankItemStat() {
    const stats = {};
    stats[heroStat.pow] = 0;
    stats[heroStat.hp] = 0;
    stats[heroStat.armor] = 0;
    stats[heroStat.resis] = 0;
    stats[heroStat.crit] = 0;
    stats[heroStat.dodge] = 0;
    stats[heroStat.spow] = 0;
    stats[heroStat.apen] = 0;
    stats[heroStat.mpen] = 0;
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
    addToInventory(id,rarity,autoSell) {
        if (this.full()) this.sellItem(id,rarity,0);
        else if (autoSell >= rarity) this.sellItem(id,rarity,0);
        else {
            const container = new itemContainer(id,rarity);
            this.findempty(container);
            const item = recipeList.idToItem(id);
            if (examineGearTypesCache.includes(item.type)) {
                examineHeroPossibleEquip(examineGearSlotCache,examineGearHeroIDCache);
            }
        }
    },
    addItemContainerToInventory(container) {
        if (this.full()) this.sellItem(id,rarity,0);
        else this.findempty(container);
    },
    findempty(item) {
        const i = this.inv.findIndex(r=>r===null);
        this.inv[i] = item;
        refreshInventoryPlaces()
    },
    craftToInventory(id) {
        if (id === "R99110") return unlockBank();
        if (id === "R99210") return unlockFuse();
        if (id === "R99310") return unlockSmith();
        if (id === "R99510") return unlockFortune();
        if (id === "R99410") return unlockDesynth();
        if (id === "R99610") return unlockTinker();
        const item = recipeList.idToItem(id)
        const name = item.name;
        const autoSell = item.autoSell;
        item.addCount();
        if (item.recipeType === "building") {
            this.addToInventory(id,0,-1);
            return;
        }
        const roll = Math.floor(Math.random() * 1000)
        const sellToggleChart = {
            "Common" : 0,
            "Good" : 1,
            "Great" : 2,
            "Epic" : 3,
        }
        const sellToggle = sellToggleChart[autoSell];
        const procRate = this.craftChance(item);
        if (roll < procRate.epic) {
            this.addToInventory(id,3,sellToggle);
            achievementStats.craftedItem("Epic");
            if (sellToggle < 3) Notifications.exceptionalCraft(name,"Epic","craftEpic");
        }
        else if (roll < (procRate.epic+procRate.great)) {
            this.addToInventory(id,2,sellToggle);
            achievementStats.craftedItem("Great");
            if (sellToggle < 2) Notifications.exceptionalCraft(name,"Great","craftGreat");
        }
        else if (roll < (procRate.epic+procRate.great+procRate.good)) {
            this.addToInventory(id,1,sellToggle);
            achievementStats.craftedItem("Good");
            if (sellToggle < 1) Notifications.exceptionalCraft(name,"Good","craftGood");
        }
        else {
            this.addToInventory(id,0,sellToggle);
            achievementStats.craftedItem("Common");
        }
        FortuneManager.spendFortune(item);
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
    removeFromInventory(uniqueID) {
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
    sellInventory(indx) {
        const item = this.inv[indx];
        this.inv[indx] = null;
        this.sellItem(item.id,item.rarity,item.sharp);
        refreshInventoryPlaces()
    },
    sellItem(id,rarity,sharp) {
        const gold = Math.round(recipeList.idToItem(id).value*(rarity+1)*(1+sharp*0.1));
        achievementStats.gold(gold);
        ResourceManager.addMaterial("M001",gold);
    },
    listbyType(types) {
        return this.nonblank().filter(r=>types.includes(r.type));
    },
    containerToItem(containerID) {
        return this.nonblank().find(r=>r.containerID===containerID)
    },
    haveItem(id,rarity) {
        return this.nonblank().filter(r=>r.id === id && r.rarity === rarity && r.sharp === 0).length > 0
    },
    full() {
        return this.nonblank().length >= this.inv.length;
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
            if (ic !== null && ic.rarity === 0) this.sellInventory(indx);
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
        return this.nonblank().filter(i => i.rarity < 3);
    },
    getCommon() {
        const item = this.nonblank().filter(item=>item.rarity === 0 && item.item.recipeType === "normal")[0];
        if (item === undefined) return {id:null,amt:0};
        this.removeContainerFromInventory(item.containerID);
        return {id:item.deconType(),amt:item.deconAmt()};
    }
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

$inventory = $("#inventory");
$sideInventory = $("#inventorySidebar");

function refreshInventory() {
    $inventory.empty();
    //build the sorted inventory
    Inventory.inv.forEach((item,i) => {
        const itemdiv = $("<div/>").addClass("inventoryItem");
        if (item === null) {
            itemdiv.html("Empty");
            $inventory.append(itemdiv);
            return;
        }
        itemdiv.addClass("R"+item.rarity)
        const itemName = $("<div/>").addClass("inventoryItemName").attr("id",item.id).attr("r",item.rarity).html(item.picName());
        const itemCost = $("<div/>").addClass("inventoryItemValue tooltip").attr("data-tooltip", `${item.goldValue()} Gold`).html(item.goldValueFormatted());
        const itemLevel = $("<div/>").addClass("inventoryItemLevel").html(item.itemLevel());
        if (item.goldValue() === 0) {
            itemCost.hide();
        }
        if (item.lvl === 0 && item.scale === 0) {
            itemLevel.hide();
        }
        const itemProps = $("<div/>").addClass("inventoryProps").html(item.propDiv());
        const actionBtns = $("<div/>").addClass("inventoryButtons");
        if (item.item.recipeType === "normal" || item.item.recipeType === "trinket") {
            $("<div/>").addClass('inventoryEquip').attr("id",i).html("Equip").appendTo(actionBtns);
        }
        if (item.goldValue() > 0) {
            $("<div/>").addClass('inventorySell').attr("id",i).html("Sell").appendTo(actionBtns);
        }
        else {
            $("<div/>").addClass('inventorySell').attr("id",i).html("Discard").appendTo(actionBtns);
        }
        itemdiv.append(itemName,itemLevel,itemCost,itemProps,actionBtns);
        $inventory.append(itemdiv);
    });
    $sideInventory.html(`<i class="fas fa-cube"></i> ${Inventory.inventoryCount()}/20`)
    if (Inventory.inventoryCount() === 20) $sideInventory.addClass("inventoryFullSide");
    else $sideInventory.removeClass("inventoryFullSide");
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
    const itemName = $("<div/>").addClass("equipItemName").attr("id",item.id).attr("r",equipContainerTarget.rarity).html(equipContainerTarget.picName());
    const itemLevel = $("<div/>").addClass("equipItemLevel").html(equipContainerTarget.itemLevel());
    const itemProps = $("<div/>").addClass("equipItemProps").html(equipContainerTarget.propDiv());
    itemdiv.append(itemName,itemLevel,itemProps);
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
                const d4a = $('<div/>').addClass('heroEquipBlockEquipStat').appendTo(d4);
                if (deltaStat > 0) d4a.addClass("hebPositive").html(`${miscIcons[stat]}${val} (+${deltaStat})`);
                else if (deltaStat < 0) d4a.addClass("hebNegative").html(`${miscIcons[stat]}${val} (${deltaStat})`);
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
    refreshDesynthInventory();
}
