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
        containerid += 1;
    }
    createSave() {
        const save = {};
        save.id = this.id;
        save.rarity = this.rarity;
        save.sharp = this.sharp;
        save.seed = this.seed;
        return save;
    }
    loadSave(save) {
        console.log(save);
        this.sharp = save.sharp;
        if (save.seed !== undefined) this.seed = save.seed;
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
        return `<div class="level_text">LVL</div><div class="level_integer">${this.lvl}</div>`;
    }
    pow() {
        return Math.floor(this.item.pow * miscLoadedValues.rarityMod[this.rarity] * (1+0.05*this.sharp));
    }
    powPlus() {
        return Math.floor(this.item.pow * miscLoadedValues.rarityMod[this.rarity] * (1+0.05*(this.sharp+1)));
    }
    hp() {
        return Math.floor(this.item.hp * miscLoadedValues.rarityMod[this.rarity] * (1+0.05*this.sharp));
    }
    hpPlus() {
        return Math.floor(this.item.hp * miscLoadedValues.rarityMod[this.rarity] * (1+0.05*(this.sharp+1)));
    }
    act() {
        return this.item.act();
    }
    propDiv() {
        const d = $("<div/>").addClass("invProp");
        if (this.act() > 0) {
            let speed = "Fair";
            if (this.act() > 5000) speed = "Slow";
            else if (this.act() < 5000) speed = "Fast";
            const d1 = $("<div/>").addClass("invPropAct tooltip").attr("data-tooltip", "ACT").html(miscIcons.act + "&nbsp;" + speed)
            d.append(d1);
        }
        if (this.pow() > 0) {
            const d2 = $("<div/>").addClass("invPropPow tooltip").attr("data-tooltip", "POW").html(miscIcons.pow + "&nbsp;" + this.pow())
            d.append(d2);
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
    addToInventory(id,rarity,autoSell) {
        if (this.full()) this.sellItem(id,rarity);
        else if (autoSell >= rarity) this.sellItem(id,rarity);
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
        if (this.full()) this.sellItem(id,rarity);
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
        const item = recipeList.idToItem(id)
        const name = item.name;
        const autoSell = item.autoSell;
        item.addCount();
        if (item.recipeType === "building") {
            this.addToInventory(id,0,-1);
            return;
        }
        const roll = Math.floor(Math.random() * 1000)
        let sellToggle = -1
        if (autoSell === "Common") sellToggle = 0;
        if (autoSell === "Good") sellToggle = 1;
        if (autoSell === "Great") sellToggle = 2;
        if (autoSell === "Epic") sellToggle = 3;
        if (roll < this.craftChance(item,"Epic")) {
            this.addToInventory(id,3,sellToggle);
            achievementStats.craftedItem("Epic");
            if (sellToggle < 3) Notifications.exceptionalCraft(name,"Epic","craftEpic");
        }
        else if (roll < (this.craftChance(item,"Epic")+this.craftChance(item,"Great"))) {
            this.addToInventory(id,2,sellToggle);
            achievementStats.craftedItem("Great");
            if (sellToggle < 2) Notifications.exceptionalCraft(name,"Great","craftGreat");
        }
        else if (roll < (this.craftChance(item,"Epic")+this.craftChance(item,"Great")+this.craftChance(item,"Good"))) {
            this.addToInventory(id,1,sellToggle);
            achievementStats.craftedItem("Good");
            if (sellToggle < 1) Notifications.exceptionalCraft(name,"Good","craftGood");
        }
        else {
            this.addToInventory(id,0,sellToggle);
            achievementStats.craftedItem("Common");
        }
    },
    craftChance(item,quality) {
        const masterMod = item.isMastered() ? 2 : 1;
        const fortuneMod = FortuneManager.isLucky(item.type,quality) ? 2 : 1;
        if (quality === "Good") return miscLoadedValues.qualityCheck[1]*masterMod*fortuneMod;
        if (quality === "Great") return miscLoadedValues.qualityCheck[2]*masterMod*fortuneMod;
        if (quality === "Epic") return miscLoadedValues.qualityCheck[3]*masterMod*fortuneMod;
    },
    removeFromInventory(id,rarity) {
        //THIS WILL NOT REMOVE ENHANCED ITEMS
        for (let i=0;i<this.inv.length;i++) {
            const ic = this.inv[i]
            if (ic === null) continue;
            if (ic.id === id && ic.rarity === rarity && ic.sharp === 0) {
                this.inv[i] = null;
                refreshInventoryPlaces()
                return;
            }
        }
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
        this.sellItem(item.id,item.rarity);
        refreshInventoryPlaces()
    },
    sellItem(id,rarity) {
        const gold = recipeList.idToItem(id).value*(rarity+1);
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
        return this.nonblank().length === this.inv.length;
    },
    inventoryCount() {
        return this.nonblank().length;
    },
    nonblank(typeOverride) {
        if (typeOverride) return this.inv.filter(r=>r !== null && r.item.recipeType === "normal");
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
        const fuses = this.nonblank().filter(s=>s.sharp === 0 && s.item.recipeType === "normal").map(i=>{
            return i.id+i.rarity
        });
        const fuseSorted = fuses.reduce((fuseList, item) => {
            if (item in fuseList) fuseList[item]++;
            else fuseList[item] = 1;
            return fuseList;
        },{});
        const fuseFiltered = [];
        for (let [idR, num] of Object.entries(fuseSorted)) {
            if (num < 3) continue;
            const fuse = {};
            fuse.id = idR.slice(0, -1);
            fuse.name = recipeList.idToItem(fuse.id).name;
            fuse.rarity = parseInt(idR.slice(-1))+1;
            if (fuse.rarity > 3) continue;
            fuseFiltered.push(fuse);
        }
        return fuseFiltered;
    },
    hasThree(id,rarity) {
        const inv = this.nonblank().filter(i=> i.id === id && i.rarity === rarity);
        return inv.length >= 3;
    },
    itemCount(id,rarity) {
        return this.nonblank().filter(r=>r.id === id && r.rarity === rarity).length;
    },
    removePrecraft(id,amt) {
        if (this.itemCount(id,0) < amt) return;
        for (let i=0;i<amt;i++) this.removeFromInventory(id,0);
    },
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
        const itemCost = $("<div/>").addClass("inventoryItemValue").html(item.goldValueFormatted());
        const itemLevel = $("<div/>").addClass("inventoryItemLevel").html(item.itemLevel());
        if (item.goldValue() === 0) {
            itemCost.hide();
            itemLevel.hide();
        }
        const itemProps = $("<div/>").addClass("inventoryProps").html(item.propDiv());
        const actionBtns = $("<div/>").addClass("inventoryButtons");
        if (item.item.recipeType === "normal") {
            const equipButton = $("<div/>").addClass('inventoryEquip').attr("id",i).html("Equip");
            const sellButton = $("<div/>").addClass('inventorySell').attr("id",i).html("Sell");
            actionBtns.append(equipButton,sellButton);
        }
        else {
            const sellButton = $("<div/>").addClass('inventorySell').attr("id",i).html("Discard");
            actionBtns.append(sellButton);
        }
        itemdiv.append(itemName,itemLevel,itemCost,itemProps,actionBtns);
        $inventory.append(itemdiv);
    });
    $sideInventory.html(`${Inventory.inventoryCount()}/20`)
    if (Inventory.inventoryCount() === 20) $sideInventory.addClass("inventoryFullSide");
    else $sideInventory.removeClass("inventoryFullSide");
}

let equipContainerTarget = null;
const $ietEquip = $("#ietEquip");
const $ietHero = $("#ietHero");

function gearEquipFromInventory(invID) {
    $ietEquip.empty();
    $ietHero.empty();
    const slotName = ["Weapon","Head","Armament","Chest","Handheld","Accessory"]
    equipContainerTarget = Inventory.inv[invID];
    const item = equipContainerTarget.item;
    const itemdiv = $("<div/>").addClass("equipItem");
    itemdiv.addClass("R"+equipContainerTarget.rarity)
    const itemName = $("<div/>").addClass("equipItemName").attr("id",item.id).attr("r",equipContainerTarget.rarity).html(equipContainerTarget.picName());
    const itemProps = $("<div/>").addClass("equipItemProps").html(equipContainerTarget.propDiv());
    itemdiv.append(itemName,itemProps);
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
            const d4 = $("<div/>").addClass("heroEquipBlockEquip");
            const d4a = $("<div/>").addClass("heroEquipBlockEquipSlot").html(slotName[i]);
            const relPow = HeroManager.relativePow(hb.id,i,equipContainerTarget.pow());
            const relHP = HeroManager.relativeHP(hb.id,i,equipContainerTarget.hp());
            const slotSpeed = HeroManager.slotSpeed(hb.id,i);

            const d4aa = $("<div/>").addClass("heroEquipBlockEquipStat").html(miscIcons.act + "&nbsp;" + slotSpeed);
            if (slotSpeed === null) d4aa.hide();

            const d4b = $("<div/>").addClass("heroEquipBlockEquipStat")
            if (relPow > 0) d4b.addClass("hebPositive").html(miscIcons.pow + "&nbsp;+" + relPow);
            else if (relPow < 0) d4b.addClass("hebNegative").html(miscIcons.pow + "&nbsp;" + relPow);
            else d4b.hide();

            const d4c = $("<div/>").addClass("heroEquipBlockEquipStat").html(relHP);
            if (relHP > 0) d4c.addClass("hebPositive").html(miscIcons.hp + "&nbsp;+" + relHP);
            else if (relHP < 0) d4c.addClass("hebNegative").html(miscIcons.hp + "&nbsp;" + relHP);
            else d4c.hide();

            const d4d = $("<div/>").addClass("heroEquipBlockEquipStat").html("No Change");
            if (relPow !== 0 || relHP !== 0) d4d.hide();

            const d4e = $("<div/>").addClass("heroEquipBlockEquipButton").attr("hid",hb.id).attr("sid",i).html("Equip");
            d4.append(d4a,d4aa,d4b,d4c,d4d,d4e);
            d3.append(d4);
        });
        d.append(d1,d2,d3);
        $ietHero.append(d);
    });
    $(".tabcontent").hide();
    $("#inventoryEquipTab").show();
}

function refreshInventoryPlaces() {
    refreshInventory();
    refreshWorkerAmts();
    refreshPossibleFuse();
    refreshBankInventory();
    refreshSmithInventory();
    buildBuildMats();
    wipeSmithStage();
}