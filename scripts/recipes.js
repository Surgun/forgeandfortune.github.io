"use strict";

const ItemType = ["Heavy", "Light", "Arcane",
                    "Armor", "Belts", "Cloaks", 
                    "Gauntlets", "Gloves", "Hats", 
                    "Helmets", "Masks", "Pendants", 
                    "Rings", "Shields", "Shoes", 
                    "Thrown", "Tomes", "Vests"];

const $RecipeResults = $("#RecipeResults");

class Item{
    constructor (props) {
        Object.assign(this, props);
        this.craftCount = 0;
        this.autoSell = "None";
        this.owned = false;
    }
    createSave() {
        const save = {};
        save.id = this.id;
        save.craftCount = this.craftCount;
        save.autoSell = this.autoSell;
        save.owned = this.owned;
        return save;
    }
    loadSave(save) {
        this.craftCount = save.craftCount;
        this.autoSell = save.autoSell;
        this.owned = save.owned;
    }
    itemDescription() {
        return this.description;
    }
    itemPicName() {
        return "<img src='images/recipes/"+this.type+"/"+this.id+".png'>"+"<div class='item-name'>"+this.name+"</div>";
    }
    itemName() {
        return "<div class='item-name'>"+this.name+"</div>";
    }
    itemPic() {
        return "<img src='images/recipes/"+this.type+"/"+this.id+".png'>";
    }
    itemLevel() {
        return `<div class="level_text">LVL</div><div class="level_integer">${this.lvl}</div>`;
    }
    itemValueFormatted() {
        return formatToUnits(this.value,2);
    }
    itemValue() {
        return this.value;
    }
    visualizeResAndMat() {
        const d = $("<div/>").addClass("itemCost")
        this.gcost.forEach(resource => {
            const resourceNameForTooltips = resource.charAt(0).toUpperCase()+resource.slice(1);
            d.append($("<div/>").addClass("indvCost resCost tooltip").attr("data-tooltip",resourceNameForTooltips).html('<img src="images/resources/'+resource+'.png">'));
        })
        if (this.mcost === null) return d;
        for (const [material, amt] of Object.entries(this.mcost)) {
            const mat = ResourceManager.idToMaterial(material);
            const d1 = $("<div/>").addClass("indvCost matCost tooltip").attr("id","vr"+this.id).attr("data-tooltip",mat.name).html(ResourceManager.formatCost(material,amt));
            d.append(d1);
        }
        return d;
    }
    recipeListStats() {
        const d = $("<div/>").addClass("recipeStatList");
        if (this.pow > 0) {
            const d1 = $("<div/>").addClass("recipeStatListPow tooltip").attr("data-tooltip", "POW").html(miscIcons.pow + this.pow);
            d.append(d1);
        }
        if (this.hp > 0) {
            const d3 = $("<div/>").addClass("recipeStatListHP tooltip").attr("data-tooltip", "HP").html(miscIcons.hp + this.hp);
            d.append(d3);
        }
        return d;
    }
    count() {
        return Math.min(this.craftCount,100);
    }
    addCount() {
        this.craftCount += 1;
        if (this.craftCount === 100) {
            masteredItem = true;
            initializeActionSlots();
            refreshProgress();
        }
        refreshMasteryBar();
        refreshCraftedCount();
    }
    isMastered() {
        if (this.recipeType === "building") return false;
        return this.craftCount >= 100;
    }
    autoSellToggle() {
        if (this.autoSell === "None") this.autoSell = "Common";
        else if (this.autoSell === "Common") this.autoSell = "Good";
        else if (this.autoSell === "Good") this.autoSell = "Great";
        else if (this.autoSell === "Great") this.autoSell = "Epic";
        else this.autoSell = "None";
    }
}

const recipeList = {
    recipes : [],
    recipeFilterType : "default",
    recipeFilterString : "",
    recipeSortType : "default",
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
        if (this.recipeFilterType === "Matless") return this.recipes.filter(r => r.owned && (r.mcost === null || r.isMastered()));
        return this.recipes.filter(r => r.owned && r.type === this.recipeFilterType);
    },
    setSortOrder(filter) {
        if (this.recipeSortType === filter) this.recipeSortType = this.recipeSortType+"Asc";
        else this.recipeSortType = filter;
        recipeSort();
    },
    buyRecipe(recipeID) {
        const recipe = this.idToItem(recipeID);
        if (ResourceManager.materialAvailable("M001") < recipe.goldCost) {
            Notifications.recipeGoldReq();
            return;
        }
        ResourceManager.deductMoney(recipe.goldCost);
        recipe.owned = true;
        Notifications.buyRecipe(recipe.name);
        refreshRecipeFilters();
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
        return this.recipes.filter(r=>r.recipeType==="normal").length;
    },
    maxTier() {
        const lvls = this.recipes.filter(r=>r.owned).map(r=>r.lvl);
        return Math.max(...lvls);
    },
    filterByGuild(guildID) {
        return this.recipes.filter(r=>r.guildUnlock === guildID);
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
    }
}

const $recipeActionButton = $(".recipeActionButton");

//click the sort by name value etc at the top
$(document).on("click",".recipeActionButton",(e) => {
    e.preventDefault();
    const toggleFilterA = $(e.currentTarget).hasClass("filterActive") && !$(e.currentTarget).hasClass("toggleFilter");
    $recipeActionButton.removeClass("filterActive toggleFilter");
    $recipeActionButton.removeClass("toggleFilter");
    $(e.currentTarget).addClass("filterActive");
    if (toggleFilterA) $(e.currentTarget).addClass("toggleFilter");
    const filter = $(e.currentTarget).attr("data-filter");
    recipeList.setSortOrder(filter);
});

function refreshRecipeFilters() {
    //hide recipe buttons if we don't know know a recipe and also can't learn one...
    ItemType.forEach(type => {
        const recipeIcon = $("#rf"+type);
        if (recipeList.ownAtLeastOne(type)) recipeIcon.show();
        else recipeIcon.hide();
    });
}

const $recipeContents = $("#recipeContents");

const sortOrder = {
    default : [],
    defaultAsc : [],
    name : [],
    nameAsc : [],
    mastery : [],
    masteryAsc : [],
    lvl : [],
    lvlAsc : [],
    time : [],
    timeAsc : [],
    value : [],
    valueAsc : [],
    recipeDivDict : {},
    recipeDivs : null,
}

function initializeRecipes() { //this is run once at the beginning to load ALL the recipes
    recipeList.recipes.filter(r=>r.recipeType === "normal").forEach(recipe => {
        const recipeCardInfo = $('<div/>').addClass('recipeCardInfo').append(recipeCardFront(recipe),recipeCardBack(recipe))
        const recipeCardContainer = $('<div/>').addClass('recipeCardContainer').data("recipeID",recipe.id).attr("id","rr"+recipe.id).append(recipeCardInfo).hide();
        $recipeContents.append(recipeCardContainer);
        sortOrder.recipeDivDict[recipe.id] = recipeCardContainer;
    });
    const tempList = recipeList.recipes.filter(r=>r.recipeType === "normal");
    sortOrder.default = tempList.sort((a, b) => a.id.localeCompare(b.id)).map(r => r.id);
    sortOrder.defaultAsc = tempList.sort((a, b) => b.id.localeCompare(a.id)).map(r => r.id);
    sortOrder.name = tempList.sort((a, b) => a.name.localeCompare(b.name)).map(r => r.id);
    sortOrder.nameAsc = tempList.sort((a, b) => b.name.localeCompare(a.name)).map(r => r.id);
    sortOrder.mastery = tempList.sort((a,b) => Math.min(100,a.craftCount)-Math.min(100,b.craftCount)).map(r => r.id);
    sortOrder.masteryAsc = tempList.sort((a,b) => Math.min(100,b.craftCount)-Math.min(100,a.craftCount)).map(r => r.id);
    sortOrder.lvl = tempList.sort((a,b) => a.lvl - b.lvl).map(r => r.id);
    sortOrder.lvlAsc = tempList.sort((a,b) => b.lvl - a.lvl).map(r => r.id);
    sortOrder.time = tempList.sort((a,b) => a.craftTime - b.craftTime).map(r => r.id);
    sortOrder.timeAsc = tempList.sort((a,b) => b.craftTime - a.craftTime).map(r => r.id);
    sortOrder.value = tempList.sort((a,b) => a.value - b.value).map(r => r.id);
    sortOrder.valueAsc = tempList.sort((a,b) => b.value - a.value).map(r => r.id);
    sortOrder.recipeDivs = $(".recipeCardContainer");
    recipeCanCraft();
}

function recipeSort() {
    //assign a data-sort value to each div then re-order as appropriate
    if (recipeList.recipeSortType === "mastery") {
        const tempList = recipeList.recipes.filter(r=>r.recipeType === "normal");
        sortOrder.mastery = tempList.sort((a,b) => Math.min(100,a.craftCount)-Math.min(100,b.craftCount)).map(r => r.id);
    }
    if (recipeList.recipeSortType === "masteryAsc") {
        const tempList = recipeList.recipes.filter(r=>r.recipeType === "normal");
        sortOrder.masteryAsc = tempList.sort((a,b) => Math.min(100,b.craftCount)-Math.min(100,a.craftCount)).map(r => r.id);
    }
    const sortedList = sortOrder[recipeList.recipeSortType];
    sortOrder.recipeDivs.sort((a,b) => {
    //$(".recipeCardContainer").sort((a,b) => {
        const aval = sortedList.indexOf($(a).data("recipeID"));
        const bval = sortedList.indexOf($(b).data("recipeID"));
        return aval > bval ? 1 : -1;
    }).appendTo($recipeContents);
}

function recipeFilterList() {
    //uses two recipeLists to cycle through all the items and display as appropriate
    $(".recipeCardContainer").hide();
    recipeList.filteredRecipeList().map(r=>r.id).forEach(recipe => {
        sortOrder.recipeDivDict[recipe].show();
    })
};

function recipeCardFront(recipe) {
    const td1 = $('<div/>').addClass('recipeName').append(recipe.itemPicName());
    const td2 = $('<div/>').addClass('recipeDescription').html("<i class='fas fa-info-circle'></i>");
    const td3 = $('<div/>').addClass('recipeItemLevel').html(recipe.itemLevel());
    if (recipe.recipeType !== "normal") td3.hide();
    const td4 = $('<div/>').addClass('recipecostdiv').attr("id",recipe.id+"rcd");
        const td4a = $('<div/>').addClass('reciperesdiv').html(recipe.visualizeResAndMat());
        if (recipe.isMastered()) td4a.addClass('isMastered');
    td4.append(td4a);

    const td5 = $('<div/>').addClass('recipeTimeAndValue');
        const td5a = $('<div/>').addClass('recipeTimeContainer tooltip').attr("data-tooltip", "Craft Time")
            const td5a1 = $("<div/>").addClass("recipeTimeHeader recipeCardHeader").html(`<i class="fas fa-clock"></i>`);
            const td5a2 = $('<div/>').addClass('recipeTime').html(msToTime(recipe.craftTime));
        td5a.append(td5a1,td5a2);

        const td5b = $('<div/>').addClass('recipeAmountContainer tooltip').attr("data-tooltip", "In Inventory");
            $("<div/>").addClass("recipeAmountHeader recipeCardHeader").html(`<i class="fas fa-cube"></i>`).appendTo(td5b);
            $('<div/>').addClass('recipeAmount').html(`${Inventory.itemCountAll(recipe.id)}`).appendTo(td5b);
        if (recipe.recipeType !== "normal") td5b.hide();

        const td5c = $('<div/>').addClass('recipeValueContainer tooltip').attr("data-tooltip", `${recipe.itemValue()} Gold`);
            $("<div/>").addClass("recipeValueHeader recipeCardHeader").html(`<img src='images/resources/M001.png'>`).appendTo(td5c);
            $('<div/>').addClass('recipeValue').html(recipe.itemValueFormatted()).appendTo(td5c);
        if (recipe.recipeType !== "normal") td5c.hide();
    td5.append(td5a,td5b,td5c);

    const td6 = $('<div/>').addClass('recipeCountAndCraft');
        const td6a = $('<div/>').addClass('recipeCount').attr("id","rc"+recipe.id).html(recipeMasteryBar(recipe.craftCount));
        if (recipe.recipeType !== "normal") td6a.hide();
        const td6b = $('<div/>').addClass(`recipeCraft rr${recipe.id}`).attr("id",recipe.id).html(`<i class="fas fa-hammer"></i><span>Craft</span>`);
    td6.append(td6a,td6b);
    return $('<div/>').addClass('recipeCardFront').append(td1,td2,td3,td4,td5,td6);
}

function recipeCardBack(recipe) {
    const td6 = $('<div/>').addClass('recipeClose').html(`<i class="fas fa-times"></i>`);
        
    const td7 = $('<div/>').addClass('recipeBackTabContainer');
        const td7a = $('<div/>').addClass('recipeBackTab backTab1 selected').html(`Details`);
        //const td7b = $('<div/>').addClass('recipeBackTab backTab2').html(`Mastery`);
    td7.append(td7a);

    const td8 = $('<div/>').addClass('recipeTabContainer recipeTabDetails');
        const td8a = $('<div/>').addClass('recipeDetailsContainer');
            const td8a1 = $('<div/>').addClass('recipeBackDescription').html(recipe.itemDescription());
            const td8a2 = $('<div/>').addClass('recipeStats').html(recipe.recipeListStats());
            const td8a3 = $('<div/>').addClass('recipeTotalCrafted').html(`${recipe.craftCount} <span>${recipe.name}</span> crafted.`);
            if (recipe.recipeType !== "normal") td8a3.hide();
        td8a.append(td8a1,td8a2,td8a3);
    td8.append(td8a);

    const td9 = $('<div/>').addClass('recipeTabContainer recipeTabMastery');
        const td9a = $('<div/>').addClass('recipeMasteryContainer');
            const td9a1 = $("<div/>").addClass("masteryBlockContainer");
            /* This is psuedo code meant for simply displaying how mastery progression will look. A proper function will need to be created once mastery tiers have been designed and implemented */
                const td9a1a = $("<div/>").addClass("masteryBlock masteryObtained").html(`<i class="fas fa-check-circle"></i><div class="masteryDetail">Material Cost Removal</div><div class="masteryCountRequired"><i class="fas fa-hammer"></i> 100</div>`);
                const td9a1b = $("<div/>").addClass("masteryBlock").html(`<i class="fas fa-check-circle"></i><div class="masteryDetail">+25% Rarity Chance</div><div class="masteryCountRequired"><i class="fas fa-hammer"></i> 250</div>`);
                const td9a1c = $("<div/>").addClass("masteryBlock").html(`<i class="fas fa-check-circle"></i><div class="masteryDetail">-25% Craft Time Reduction</div><div class="masteryCountRequired"><i class="fas fa-hammer"></i> 999</div>`);
            td9a1.append(td9a1a,td9a1b,td9a1c);
            /* End */
        td9a.append(td9a1);
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
        rr.html(recipeMasteryBar(recipe.craftCount));
    });
}

function refreshCraftedCount() {
    recipeList.recipes.forEach(recipe => {
        const rr = $("#rr"+recipe.id);
        rr.find(".recipeTotalCrafted").html(`${recipe.craftCount} <span>${recipe.name}</span> crafted.`);
        if (recipe.craftCount >= 100) $("#"+recipe.id+"rcd").addClass("isMastered");
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
    const $recipeCraft = $(".recipeCraft");
    $recipeCraft.removeClass("recipeCraftDisable");
    recipeList.recipes.forEach(recipe => {
        if (!WorkerManager.canCurrentlyCraft(recipe)) $(".rr"+recipe.id).addClass("recipeCraftDisable");
    }) 
}

const $blueprintUnlock = $("#BlueprintUnlock");
let cacheBlueprintType = null;

$(document).on('click', '.recipeCraft', (e) => {
    //click on a recipe to slot it
    e.preventDefault();
    const itemID = $(e.currentTarget).attr("id");
    actionSlotManager.addSlot(itemID);
});

$(document).on('click', '.recipeSelect', (e) => {
    //click on a recipe filter
    e.preventDefault();
    $(".recipeCardInfo").removeClass("recipeCardFlipped");
    $(".recipeCardFront").removeClass("recipeCardDisabled");
    const type = $(e.target).attr("id").substring(2);
    recipeList.recipeFilterType = type;
    recipeList.recipeFilterString = "";
    recipeFilterList();
})

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
    if (searchString.length < 2) return Notifications.searchLengthInvalid();
    recipeList.recipeFilterString = searchString;
    recipeList.recipeFilterType = "default";
    recipeFilterList();
});

//enter key searches if you're in sort input
$(document).on('keydown','.recipeSortInput', (e) => {
    if (e.keyCode !== 13) return;
    e.preventDefault();
    const searchString = $recipeSortInput.val();
    if (searchString.length < 2) return Notifications.searchLengthInvalid();
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

const $RecipeLogistics = $("#RecipeLogistics");
const $recipeDropdownButton = $(".recipeDropdownButton");

$(document).on('click','.recipeDropdownButton', (e) => {
    e.preventDefault(); 
    const toggleFilter = $(e.currentTarget).hasClass("filterActive");
    const filter = $(e.currentTarget).attr("data-filter");
    $RecipeLogistics.show();
    if (filter === "workers") {
        $recipeDropdownButton.removeClass("filterActive")
        $(e.currentTarget).addClass("filterActive");
        $(".logisticContainer ").removeClass("expanded");
        $("#workersUse").addClass("expanded");
        settings.expandedLogistics.workers = 1;
    }
    if (filter === "materials") {
        $recipeDropdownButton.removeClass("filterActive")
        $(e.currentTarget).addClass("filterActive");
        $(".logisticContainer ").removeClass("expanded");
        $("#materials").addClass("expanded");
        settings.expandedLogistics.materials = 1;
    }
    if (toggleFilter) {
        $(e.currentTarget).removeClass("filterActive");
        $(".logisticContainer ").removeClass("expanded");
        $RecipeLogistics.hide();
        settings.expandedLogistics[filter] = 0;
    }
    saveSettings();
});

function checkLogisticsStatus() {
    $RecipeLogistics.hide();
    if (settings.expandedLogistics.workers === 1) {
        $RecipeLogistics.show();
        $(".recipeDropdownButton[data-filter=workers]").addClass("filterActive");
        $("#workersUse").addClass("expanded");
        settings.expandedLogistics.materials = 0;
    }
    if (settings.expandedLogistics.materials === 1) {
        $RecipeLogistics.show();
        $(".recipeDropdownButton[data-filter=materials]").addClass("filterActive");
        $("#materials").addClass("expanded");
        settings.expandedLogistics.workers = 0;
    }
}

checkLogisticsStatus();