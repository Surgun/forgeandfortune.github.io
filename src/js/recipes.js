"use strict";

const ItemType = ["Armor", "Belts", "Cloaks", "Gauntlets", "Gloves", "Hats", "Helmets", "Knives", "Masks", "Pendants", 
                "Rings", "Shields", "Shoes", "Staves", "Swords", "Thrown", "Tomes", "Trinkets", "Vests"];

const $RecipeResults = $("#RecipeResults");

const MasteryFilter = Object.freeze({BOTH:0,MASTERED:1,UNMASTERED:2});

class Item{
    constructor (props) {
        Object.assign(this, props);
        this.craftCount = 0;
        this.mastered = false;
        this.autoSell = "None";
        this.owned = false;
        this.goldComma = this.itemValueCommas(this.value);
        this.museum = createArray(4,11);
    }
    createSave() {
        const save = {};
        save.id = this.id;
        save.craftCount = this.craftCount;
        save.autoSell = this.autoSell;
        save.owned = this.owned;
        save.mastered = this.mastered;
        save.museum = this.museum;
        return save;
    }
    loadSave(save) {
        this.craftCount = save.craftCount;
        this.autoSell = save.autoSell;
        this.owned = save.owned;
        if (save.mastered !== undefined) this.mastered = save.mastered;
        if (save.museum !== undefined) this.museum = save.museum;
    }
    itemDescription() {
        return this.description;
    }
    itemPicName() {
        return "<img src='/assets/images/recipes/"+this.type+"/"+this.id+".png'>"+"<div class='item-name'>"+this.name+"</div>";
    }
    itemName() {
        return "<div class='item-name'>"+this.name+"</div>";
    }
    itemPic() {
        return "<img src='/assets/images/recipes/"+this.type+"/"+this.id+".png'>";
    }
    itemLevel() {
        return `<div class="level_text">LVL</div><div class="level_integer">${this.lvl}</div>`;
    }
    itemValueCommas() {
        return formatWithCommas(this.value);
    }
    itemValueFormatted() {
        return formatToUnits(this.value,2);
    }
    itemValue() {
        return this.value;
    }
    visualizeResAndMat() {
        const d = $("<div/>").addClass("itemCost");
        this.gcost.forEach(resource => {
            const guild = GuildManager.idToGuild(resource);
            d.append($("<div/>").addClass("indvCost resCost tooltip").attr({"data-tooltip":"guild_worker","data-tooltip-value":guild.id}).html(guild.icon));
        })
        if (this.mcost === null) return d;
        for (const [material, amt] of Object.entries(this.mcost)) {
            const mat = ResourceManager.idToMaterial(material);
            const d1 = $("<div/>").addClass("indvCost matCost tooltip").attr("id","vr"+this.id).attr({"data-tooltip":"material_desc","data-tooltip-value":mat.id}).html(ResourceManager.formatCost(material,amt));
            d.append(d1);
        }
        return d;
    }
    recipeListStats() {
        const d = $("<div/>").addClass("recipeStatList");
        const pow = this.pow*this.pts;
        const hp = 9*this.hp*this.pts;
        if (pow > 0) $("<div/>").addClass("recipeStatListPow tooltip").attr("data-tooltip", "pow").html(`${miscIcons.pow}<span class="statValue">${pow}</span>`).appendTo(d);
        if (hp > 0) $("<div/>").addClass("recipeStatListHP tooltip").attr("data-tooltip", "hp").html(`${miscIcons.hp}<span class="statValue">${hp}</span>`).appendTo(d);
        return d;
    }
    count() {
        return Math.min(this.craftCount,100);
    }
    addCount(skipAnimation) {
        this.craftCount += 1;
        if (skipAnimation) return;
        refreshMasteryBar();
        refreshCraftedCount();
    }
    attemptMastery() {
        if (this.isMastered()) return;
        const masteryCost = this.masteryCost();
        if (ResourceManager.materialAvailable(masteryCost.id) < masteryCost.amt) {
            Notifications.popToast("recipe_master_need_more");
            return;
        }
        ResourceManager.addMaterial(masteryCost.id,-masteryCost.amt);
        this.mastered = true;
        Notifications.popToast("master_recipe",this.name);
        refreshCraftedCount();
        destroyTooltip(); // Removes stuck tooltip after mastering item on recipe card
        refreshProgress();
        GuildManager.repopulateUnmastered();
        refreshAllRecipeMastery();
    }
    isMastered() {
        if (this.recipeType === "building" || this.recipeType === "Trinket") return false;
        return this.mastered;
    }
    autoSellToggle() {
        if (this.autoSell === "None") this.autoSell = "Common";
        else if (this.autoSell === "Common") this.autoSell = "Good";
        else if (this.autoSell === "Good") this.autoSell = "Great";
        else if (this.autoSell === "Great") this.autoSell = "Epic";
        else this.autoSell = "None";
        return this.autoSell;
    }
    setCanCraft(canProduceBucket) {
        const needBucket = groupArray(this.gcost);
        this.canProduce = true;
        for (const [res, amt] of Object.entries(needBucket)) {
            if (canProduceBucket[res] === undefined || canProduceBucket[res] < amt) {
                this.canProduce = false;
            };
        }
    }
    material() {
        if (!this.mcost) return "M201";
        return Object.keys(this.mcost)[0]
    }
    reducedCraft() {
        return this.craftTime;
    }
    masteryCost() {
        const amt = Math.max(this.minMastery,this.maxMastery-this.reductionMastery*this.craftCount);
        const material = this.mcost ? Object.keys(this.mcost)[0] : "M201";
        return new idAmt(material,amt);
    }
}

const recipeList = {
    recipes : [],
    recipeFilterType : "default",
    recipeFilterString : "",
    recipeSortType : "default",
    masteryFilter : MasteryFilter.BOTH,
    addItem(item) {
        this.recipes.push(item);
    },
    createSave() {
        const save = [];
        this.recipes.forEach(r=> {
            save.push(r.createSave());
        });
        return save;
    },
    loadSave(save) {
        save.forEach(i => {
            const rec = this.idToItem(i.id);
            if (rec !== undefined) rec.loadSave(i);
        });
    },
    filteredRecipeList() {
        const cleanString = this.recipeFilterString.toLowerCase().replace(/\s+/g, '');
        if (this.recipeFilterType === "default") return this.recipes.filter(r => r.owned && r.name.toLowerCase().includes(cleanString));
        if (this.masteryFilter === MasteryFilter.BOTH) return this.recipes.filter(r => r.owned && r.type === this.recipeFilterType);
        if (this.masteryFilter === MasteryFilter.UNMASTERED) return this.recipes.filter(r => r.owned && !r.mastered && r.type === this.recipeFilterType);
        if (this.masteryFilter === MasteryFilter.MASTERED) return this.recipes.filter(r => r.owned && r.mastered && r.type === this.recipeFilterType);
    },
    buyRecipe(recipeID) {
        const recipe = this.idToItem(recipeID);
        if (ResourceManager.materialAvailable("M001") < recipe.goldCost) {
            Notifications.popToast("recipe_gold_req");
            return;
        }
        ResourceManager.deductMoney(recipe.goldCost);
        recipe.owned = true;
        Notifications.popToast("buy_recipe",recipe.name);
        refreshRecipeMastery(GuildManager.idToGuild(recipe.guildUnlock));
        refreshRecipeFilters();
        checkCraftableStatus();
        refreshAllSales();
    },
    unlockTrinketRecipe(recipeID) {
        const recipe = this.idToItem(recipeID);
        recipeList.recipes.filter(r=>r.name===recipe.name).forEach(r => {
            r.owned = false;
        })
        recipe.owned = true;
        recipeFilterList();
        refreshRecipeFilters();
        checkCraftableStatus();
        refreshAllSales();
    },
    idToItem(id) {
        return this.recipes.find(recipe => recipe.id === id);
    },
    ownAtLeastOne(type) {
        return this.recipes.some(r=>r.type === type && r.owned);
    },
    masteryCount() {
        return this.recipes.filter(r=>r.isMastered() && r.recipeType==="normal").length;
    },
    recipeCount() {
        return this.recipes.filter(r=>r.recipeType==="normal" && r.type !== "Trinkets").length;
    },
    maxTier() {
        const lvls = this.recipes.filter(r=>r.owned).map(r=>r.lvl);
        return Math.max(...lvls);
    },
    filterByGuild(guildID) {
        return this.recipes.filter(r=>r.guildUnlock === guildID);
    },
    filterByType(type) {
        return this.recipes.filter(r =>r.type === type);
    },
    guildOrderItems(lvl) {
        const items = [];
        ItemType.forEach(type => {
            const typeList = this.recipes.filter(r=>r.type === type);
            const guildWork = typeList.filter(r => r.repReq <= lvl);
            const guildWorkRepReq = guildWork.map(r => r.repReq);
            const chosenRepReq = Math.max(...guildWorkRepReq);
            const item = guildWork.find(r => r.repReq === chosenRepReq);
            if (item !== undefined) items.push(item);
        });
        return items;
    },
    canCraft() {
        const canProduce = WorkerManager.getCurrentProduceAvailable();
        this.recipes.forEach(recipe => {
            recipe.setCanCraft(canProduce);
        });
        recipeCanCraft();
    },
    attemptMastery(recipeID) {
        this.idToItem(recipeID).attemptMastery();
    },
    unmasteredByGuild(guild) {
        return this.recipes.filter(r=>r.guildUnlock === guild && !r.mastered && r.owned).map(r=>r.id);
    }
}

const $recipeActionButton = $(".recipeActionButton");

function refreshRecipeFilters() {
    //hide recipe buttons if we don't know know a recipe and also can't learn one...
    $recipeFilter.empty();
    ItemType.forEach(itemtype => {
        if (recipeList.ownAtLeastOne(itemtype)) {
            const recipeSelect = $("<div/>").addClass("recipeSelect").data("itemType",itemtype).appendTo($recipeFilter);
            $("<div/>").addClass("recipeSelectIcon").html(`<img src="/assets/images/recipeFilter/${itemtype}32.png" />`).appendTo(recipeSelect);
            $("<div/>").addClass("recipeSelectName").html(itemtype).appendTo(recipeSelect);
        }
    })
}

const $recipeContents = $("#recipeContents");
const $recipeFilter = $("#recipeFilter");

const sortOrder = {
    defaultAsc : [],
    recipeDivDict : {},
    recipeDivs : null,
}

function initializeRecipes() { //this is run once at the beginning to load ALL the recipes
    recipeList.recipes.filter(r=>r.recipeType === "normal").forEach(recipe => {
        const recipeCardInfo = $('<div/>').addClass('recipeCardInfo').append(recipeCardFront(recipe),recipeCardBack(recipe))
        const recipeCardContainer = $('<div/>').addClass('recipeCardContainer').data("recipeID",recipe.id).attr("id","rr"+recipe.id).append(recipeCardInfo).hide();
        $recipeContents.prepend(recipeCardContainer);
        sortOrder.recipeDivDict[recipe.id] = recipeCardContainer;
    });
    const tempList = recipeList.recipes.filter(r=>r.recipeType === "normal");
    sortOrder.defaultAsc = tempList.sort((a, b) => b.id.localeCompare(a.id)).map(r => r.id);
    sortOrder.recipeDivs = $(".recipeCardContainer");
}

function recipeFilterList(n) {
    // if "n" not provided, set to 0
    n = n || 0;
    //uses two recipeLists to cycle through all the items and display as appropriate
    if (n === 0) Object.values(sortOrder.recipeDivDict).forEach(div => div.hide());
    recipeList.filteredRecipeList().map(r=>r.id).slice(0,n+30).forEach(recipe => {
        sortOrder.recipeDivDict[recipe].show();
    })
};

function triggerRecipeLoad() {
    let loadCount = 0;
    recipeList.filteredRecipeList().map(r=>r.id).forEach((recipe, i) => {
        if (sortOrder.recipeDivDict[recipe].is(":visible")) loadCount = i ;
    })
    recipeFilterList(loadCount);
}

$("#recipes-list").scroll(function () {
    const condition1 = $("#RecipeResults").height() - $(this).height() + $("#tabs").height() + $("footer").height() - 10;
    const condition2 = $(this).scrollTop();
    if (condition1 <= condition2 + 400) triggerRecipeLoad();
})

function recipeCardFront(recipe) {
    const td1 = $('<div/>').addClass('recipeName').append(recipe.itemPicName());
    const td2 = $('<div/>').addClass('recipeDescription').html("<i class='fas fa-info-circle'></i>");
    const td3 = $('<div/>').addClass('itemLevel').html(recipe.itemLevel());
    if (recipe.recipeType !== "normal") td3.hide();
    const td4 = $('<div/>').addClass('recipecostdiv').attr("id",recipe.id+"rcd");
        if (recipe.isMastered()) td4.addClass("isMastered");
        const td4a = $('<div/>').addClass('reciperesdiv').html(recipe.visualizeResAndMat());
        if (recipe.isMastered()) td4a.addClass('isMastered');
    td4.append(td4a);

    const td5 = $('<div/>').addClass('recipeTimeAndValue');
        const td5a = $('<div/>').addClass('recipeTimeContainer tooltip').attr("data-tooltip", "crafting_time")
            const td5a1 = $("<div/>").addClass("recipeTimeHeader recipeCardHeader").html(`<i class="fas fa-clock"></i>`);
            const td5a2 = $('<div/>').addClass('recipeTime').attr("id",`rt${recipe.id}`).html(msToTime(recipe.reducedCraft()));
        td5a.append(td5a1,td5a2);

        const td5b = $('<div/>').addClass('recipeAmountContainer tooltip').attr("data-tooltip", "in_inventory");
            $("<div/>").addClass("recipeAmountHeader recipeCardHeader").html(`<i class="fas fa-cube"></i>`).appendTo(td5b);
            $('<div/>').addClass('recipeAmount').html(`${Inventory.itemCountAll(recipe.id)}`).appendTo(td5b);
        if (recipe.recipeType !== "normal") td5b.hide();

        const td5c = $('<div/>').addClass('recipeValueContainer tooltip').attr({"data-tooltip": "recipe_gold", "data-tooltip-value": recipe.id});
            $("<div/>").addClass("recipeValueHeader recipeCardHeader").html(`<img src='/assets/images/resources/M001.png'>`).appendTo(td5c);
            $('<div/>').addClass('recipeValue').html(recipe.itemValueFormatted()).appendTo(td5c);
        if (recipe.recipeType !== "normal") td5c.hide();
    td5.append(td5a,td5b,td5c);

    const td6 = $('<div/>').addClass('recipeCountAndCraft');
        const td6a = $('<div/>').addClass('recipeMasteredStatus').attr("id","rms"+recipe.id).html(displayText('recipes_card_mastery_recipe_unmastered'));
        if (recipe.isMastered()) td6a.addClass('isMastered').html(`<i class="fas fa-star-christmas"></i> ${displayText('recipes_card_mastery_recipe_mastered')}`);
        if (recipe.recipeType !== "normal" || recipe.type === "Trinkets") td6a.hide();
        const td6b = $('<div/>').addClass(`recipeCraft rr${recipe.id}`).attr("id",recipe.id).html(`<i class="fas fa-hammer"></i><span>Craft</span>`);
        recipe.recipeDiv = td6b;
    td6.append(td6a,td6b);
    return $('<div/>').addClass('recipeCardFront').append(td1,td2,td3,td4,td5,td6);
}

function refreshCraftTimes() {
    recipeList.recipes.forEach(recipe => {
        $(`#rt${recipe.id}`).html(msToTime(recipe.reducedCraft()));
    });
}

function recipeCardBack(recipe) {
    const td6 = $('<div/>').addClass('recipeClose').html(`<i class="fas fa-times"></i>`);
        
    const td7 = $('<div/>').addClass('recipeBackTabContainer');
        const td7a = $('<div/>').addClass('recipeBackTab backTab1 selected').html(displayText('recipes_card_tab_details'));
        const td7b = $('<div/>').addClass('recipeBackTab backTab2').html(displayText('recipes_card_tab_mastery'));
    td7.append(td7a);
    if (recipe.recipeType === 'normal' && recipe.type !== "Trinkets") td7.append(td7b);

    const td8 = $('<div/>').addClass('recipeTabContainer recipeTabDetails');
        const td8a = $('<div/>').addClass('recipeDetailsContainer');
            const td8a1 = $('<div/>').addClass('recipeBackDescription').html(recipe.itemDescription());
            const td8a2 = $('<div/>').addClass('recipeStats').html(recipe.recipeListStats());
            const craftedCount = displayText('recipes_card_tab_mastery').replace('{0}', recipe.craftCount);
            const td8a3 = $('<div/>').addClass('recipeCrafted').attr("id","rc"+recipe.id).html(craftedCount);
        td8a.append(td8a1,td8a2,td8a3);
    td8.append(td8a);

    const td9 = $('<div/>').addClass('recipeTabContainer recipeTabMastery');
        const td9a = $('<div/>').addClass('recipeMasteryContainer');
            const td9a1 = $('<div/>').addClass('recipeBackDescription').attr("id","rbd"+recipe.id).html(displayText('recipes_card_mastery_available_notice'));
            const masteryCost = recipe.masteryCost();
            const td9a2 = $('<div/>').addClass('recipeTotalCrafted actionButtonCardCost tooltip').attr({"id": "rcc"+recipe.id}).data("rid",recipe.id);
                $('<div/>').addClass("actionButtonCardText").html(displayText('recipes_card_mastery_master_button')).appendTo(td9a2);
                $('<div/>').addClass("actionButtonCardValue tooltip").attr({"data-tooltip":"material_desc","data-tooltip-value": masteryCost.id}).html(`${ResourceManager.idToMaterial(masteryCost.id).img} ${masteryCost.amt}`).appendTo(td9a2);
            if (recipe.isMastered()) {
                td9a1.addClass("isMastered").html(displayText('recipes_card_mastery_attained_notice'));
                td9a2.addClass("isMastered").html(`<i class="fas fa-star-christmas"></i> ${displayText('recipes_card_mastery_recipe_mastered')}`);
            }
            if (recipe.recipeType !== "normal" || recipe.type === "Trinkets") td9a2.hide();
        td9a.append(td9a1,td9a2);
    td9.append(td9a);

    return $('<div/>').addClass('recipeCardBack').append(td6,td7,td8,td9);
}

function recipeMasteryBar(craftCount) {
    craftCount = Math.min(100,craftCount);
    const masteryWidth = (craftCount).toFixed(1)+"%";
    const masteryBarDiv = $("<div/>").addClass("masteryBarDiv").attr("id","masteryBarDiv");
    const masteryBar = $("<div/>").addClass("masteryBar").attr("id","masteryBar");
    if (craftCount >= 100) {
        masteryBarDiv.addClass("isMastered");
        masteryBar.attr("data-label",`Mastered`);
    } else masteryBar.attr("data-label",`${craftCount} / 100`);
    const masteryBarFill = $("<div/>").addClass("masteryBarFill").attr("id","masteryFill").css('width', masteryWidth);
    return masteryBarDiv.append(masteryBar,masteryBarFill);
}

function refreshMasteryBar() {
    recipeList.recipes.forEach((recipe) => {
        const rr = $("#rc"+recipe.id)
        const craftedCount = displayText('recipes_card_details_crafted_count').replace('{0}', recipe.craftCount);
        rr.html(craftedCount);
    });
}

function refreshCraftedCount() {
    recipeList.recipes.forEach(recipe => {
        const rcc = $("#rcc"+recipe.id);
        const rbd = $("#rbd"+recipe.id);
        const rms = $("#rms"+recipe.id);
        const rcd = $("#"+recipe.id+"rcd");
        const material = (recipe.mcost) ? Object.keys(recipe.mcost)[0] : "M201";
        const masteryCost = recipe.masteryCost();
        rcc.empty();
        $('<div/>').addClass("actionButtonCardText").html(displayText('recipes_card_mastery_master_button')).appendTo(rcc);
        $('<div/>').addClass("actionButtonCardValue tooltip").attr({"data-tooltip":"material_desc","data-tooltip-value": masteryCost.id}).html(`${ResourceManager.idToMaterial(masteryCost.id).img} ${masteryCost.amt}`).appendTo(rcc);
        if (recipe.isMastered()) {
            rbd.addClass("isMastered").html(displayText('recipes_card_mastery_attained_notice'));
            rcc.addClass("isMastered").removeClass("tooltip").html(`<i class="fas fa-star-christmas"></i> ${displayText('recipes_card_mastery_recipe_mastered')}`);
            rms.addClass("isMastered").html(`<i class="fas fa-star-christmas"></i> ${displayText('recipes_card_mastery_recipe_mastered')}`);
            rcd.find(".matCost").attr({"data-tooltip":"material_desc_mastered","data-tooltip-value":material.id}).addClass("isMastered");
        }
    });
}
 
// Refresh and show current number of item in inventory on recipe card
function refreshCardInvCount() {
    recipeList.recipes.forEach((recipe) => {
        const rr = $("#rr"+recipe.id+" .recipeAmount");
        const invCount = Inventory.itemCountAll(recipe.id);
        rr.html(invCount);
    });
}

function recipeCanCraft() {
    //loops through recipes, adds class if disabled
    recipeList.recipes.forEach(recipe => {
        if (recipe.recipeType !== "normal") return;
        if (recipe.canProduce && actionSlotManager.slots.length < actionSlotManager.maxSlots) recipe.recipeDiv.removeClass("recipeCraftDisable");
        else recipe.recipeDiv.addClass("recipeCraftDisable");
    });
}

const $blueprintUnlock = $("#BlueprintUnlock");
let cacheBlueprintType = null;

$(document).on('click', '.recipeCraft', (e) => {
    //click on a recipe to slot it
    e.preventDefault();
    const itemID = $(e.currentTarget).attr("id");
    actionSlotManager.addSlot(itemID);
});

$(document).on('click','.recipeDescription', (e) => {
    e.preventDefault();
    $(".recipeCardInfo").removeClass("recipeCardFlipped");
    $(".recipeCardFront").removeClass("recipeCardDisabled");
    $(".recipeTabContainer").addClass("none");
    $(".recipeBackTab").removeClass("selected");
    $(".backTab1").addClass("selected");
    $(".recipeTabDetails").removeClass("none");
    $(e.currentTarget).parent().addClass("recipeCardDisabled");
    $(e.currentTarget).parent().parent().addClass("recipeCardFlipped");
});

$(document).on('click','.recipeTotalCrafted', (e) => {
    e.preventDefault();
    const recipeID = $(e.currentTarget).data("rid");
    recipeList.attemptMastery(recipeID);
})

$(document).on('click','.recipeClose', (e) => {
    e.preventDefault();
    $(e.currentTarget).parent().prev().removeClass("recipeCardDisabled");
    $(e.currentTarget).parent().parent().removeClass("recipeCardFlipped");
});

$(document).on('click','.recipeBackTab', (e) => {
    e.preventDefault();
    name = $(e.currentTarget).text();
    $(".recipeTabContainer").addClass("none");
    $(".recipeTab"+name).removeClass("none");
    $(".recipeBackTab").removeClass("selected");
    $(e.currentTarget).addClass("selected");
});


const $recipeSortInput = $("#recipeSortInput");

//clicking button runs search
$(document).on('click','.recipeSortButton', (e) => {
    e.preventDefault();
    const searchString = $recipeSortInput.val();
    if (searchString.length < 2) return Notifications.popToast("search_length_invalid");
    recipeList.recipeFilterString = searchString;
    recipeList.recipeFilterType = "default";
    recipeFilterList();
});

//enter key searches if you're in sort input
$(document).on('keydown','.recipeSortInput', (e) => {
    if (e.keyCode !== 13) return;
    e.preventDefault();
    const searchString = $recipeSortInput.val();
    if (searchString.length < 2) return Notifications.popToast("search_length_invalid");
    recipeList.recipeFilterString = searchString;
    recipeList.recipeFilterType = "default";
    recipeFilterList();
});

// Prevent hotkey input when search bar focused
$(document).on('focus','.recipeSortInput', (e) => {
    settings.dialogStatus = 1;
    saveSettings();
});

$(document).on('blur','.recipeSortInput', (e) => {
    settings.dialogStatus = 0;
    saveSettings();
});

//click on a category to filter by it
$(document).on('click','.recipeSelect', (e) => {
    e.preventDefault();
    if (recipeList.recipeFilterType === $(e.currentTarget).data("itemType")) return;
    recipeList.recipeFilterType = $(e.currentTarget).data("itemType");
    $(".recipeSelect").removeClass("selectedRecipeFilter");
    $(e.currentTarget).addClass("selectedRecipeFilter");
    recipeFilterList();
});

//change mastery sorting
$(document).on('click',".recipeMasterySort", (e) => {
    e.preventDefault();
    const currentType = $(e.currentTarget).html();
    if (currentType === "All Recipes") {
        $(e.currentTarget).html("Unmastered Only");
        recipeList.masteryFilter = MasteryFilter.UNMASTERED;
    }
    if (currentType === "Unmastered Only") {
        $(e.currentTarget).html("Mastered Only");
        recipeList.masteryFilter = MasteryFilter.MASTERED;
    }
    if (currentType === "Mastered Only") {
        $(e.currentTarget).html("All Recipes");
        recipeList.masteryFilter = MasteryFilter.BOTH;
    }
    recipeFilterList();
});