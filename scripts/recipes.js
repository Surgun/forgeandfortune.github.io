"use strict";

const ItemType = ["Armor", "Axes", "Belts", "Bows", "Cloaks", "Darts", "Earrings", "Gauntlets", "Gloves", "Hats", "Helmets", "Instruments", "Knives", "Maces", "Masks", "Pendants", "Potions", "Rings", "Rods", "Shields", "Shoes", "Spears", "Staves", "Swords", "Thrown", "Tomes", "Vests", "Wands", "Wards", "Whips"];

const $RecipeResults = $("#RecipeResults");

class Item{
    constructor (props) {
        Object.assign(this, props);
        this.craftCount = 0;
        this.autoSell = "None";
    }
    createSave() {
        const save = {};
        save.id = this.id;
        save.craftCount = this.craftCount;
        save.autoSell = this.autoSell;
        return save;
    }
    loadSave(save) {
        this.craftCount = save.craftCount;
        this.autoSell = save.autoSell;
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
        this.rcost.forEach(resource => {
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
    getCost(resource) {
        if (resource in this.rcost) return this.rcost[resource];
        return 0;
    }
    recipeListStats() {
        const d = $("<div/>").addClass("recipeStatList");
        if (this.pow > 0) {
            const d1 = $("<div/>").addClass("recipeStatListPow tooltip").attr("data-tooltip", "POW").html(miscIcons.pow + this.pow);
            d.append(d1);
        }
        if (this.ap > 0) {
            const d2 = $("<div/>").addClass("recipeStatListAP tooltip").attr("data-tooltip", "AP").html(miscIcons.ap + this.ap);
            d.append(d2);
        }
        if (this.hp > 0) {
            const d3 = $("<div/>").addClass("recipeStatListHP tooltip").attr("data-tooltip", "HP").html(miscIcons.hp + this.hp);
            d.append(d3);
        }
        return d;
    }
    remainingReqs() {
        let s = ""
        this.rcost.forEach(r => {
            if (WorkerManager.lvlByType(r) >= this.lvl) return;
            const mat = r.charAt(0).toUpperCase() + r.slice(1);
            s += `<span class="bpReqWorker">LVL ${this.lvl} ${mat} Worker</span>`
        });
        return s.slice(0, -2);
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
    found() {
        const dungeonID = this.dungeonUnlock;
        if (dungeonID === null) return true;
        return DungeonManager.bossesBeat.includes(dungeonID);
    }
}

const recipeList = {
    recipes : [],
    recipeFilterType : "default",
    recipeFilterString : "",
    recipeSortType : "default",
    createSave() {
        const save = [];
        this.recipes.forEach(r=> {
            save.push(r.createSave());
        });
        return save;
    },
    filteredRecipeList() {
        console.log(this.recipeFilterType)
        const cleanString = this.recipeFilterString.toLowerCase().replace(/\s+/g, '');
        if (this.recipeFilterType === "default") return this.recipes.filter(r => r.found() && r.name.toLowerCase().includes(cleanString));
        if (this.recipeFilterType === "Matless") return this.recipes.filter(r => r.found() && (r.mcost === null || r.isMastered()));
        return this.recipes.filter(r => r.found() && r.type === this.recipeFilterType);
    },  
    setSortOrder(filter) {
        if (this.recipeSortType === filter) this.recipeSortType = this.recipeSortType+"Asc";
        else this.recipeSortType = filter;
        console.log(this.recipeSortType);
        recipeSort();
    },
    loadSave(save) {
        save.forEach(i => {
            const rec = this.idToItem(i.id);
            rec.loadSave(i);
        });
    },
    addItem(item) {
        this.recipes.push(item);
    },
    listByType(type) {
        return this.recipes.filter(recipe => recipe.type === type);
    },
    idToItem(id) {
        return this.recipes.find(recipe => recipe.id === id);
    },
    ownAtLeastOne(type) {
        return this.recipes.some(r=>r.type === type && r.found());
    },
    moreRecipes(type) {
        return this.recipes.some(r => !r.found() && type === r.type);
    },
    remainingReqs(type) {
        const item = this.getNextBuyable(type);
        if (item === undefined) return null;
        return item.remainingReqs();
    },
    recipeIDByTypeLvl(type,lvl) {
        return this.recipes.find(r => r.type === type && r.lvl === lvl).id;
    },
    masteryCount() {
        return this.recipes.filter(r=>r.isMastered()).length;
    },
    recipeCount() {
        return this.recipes.filter(r=>r.recipeType==="normal").length;
    },
    advancedWorkerUnlock() {
        return this.recipes.filter(r => r.found()).some(recipe => recipe.lvl >= 5);
    },
    maxTier() {
        const lvls = this.recipes.filter(r=>r.found()).map(r=>r.lvl);
        return Math.max(...lvls);
    },
    unlockedByDungeon(dungeonID) {
        return this.recipes.filter(r=>r.dungeonUnlock === dungeonID);
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
    const sortedList = sortOrder[recipeList.recipeSortType];
    $(".recipeCardContainer").sort((a,b) => {
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
            const td5b1 = $("<div/>").addClass("recipeAmountHeader recipeCardHeader").html(`<i class="fas fa-cube"></i>`);
            const td5b2 = $('<div/>').addClass('recipeAmount').html(`${Inventory.itemCountAll(recipe.id)}`);
        td5b.append(td5b1,td5b2);

        const td5c = $('<div/>').addClass('recipeValueContainer tooltip').attr("data-tooltip", `${recipe.itemValue()} Gold`);
            const td5c1 = $("<div/>").addClass("recipeValueHeader recipeCardHeader").html(`<img src='images/resources/M001.png'>`);
            const td5c2 = $('<div/>').addClass('recipeValue').html(recipe.itemValueFormatted());
        td5c.append(td5c1,td5c2);
    td5.append(td5a,td5b,td5c);

    const td6 = $('<div/>').addClass('recipeCountAndCraft');
        const td6a = $('<div/>').addClass('recipeCount').attr("id","rc"+recipe.id).html(recipeMasteryBar(recipe.craftCount));
        const td6b = $('<div/>').addClass(`recipeCraft rr${recipe.id}`).attr("id",recipe.id).html(`<i class="fas fa-hammer"></i><span>Craft</span>`);
    td6.append(td6a,td6b);
    return $('<div/>').addClass('recipeCardFront').append(td1,td2,td3,td4,td5,td6);
}

function recipeCardBack(recipe) {
    const td6 = $('<div/>').addClass('recipeClose').html(`<i class="fas fa-times"></i>`);
        
    const td7 = $('<div/>').addClass('recipeBackTabContainer');
        const td7a = $('<div/>').addClass('recipeBackTab backTab1 selected').html(`Details`);
        const td7b = $('<div/>').addClass('recipeBackTab backTab2').html(`Mastery`);
    td7.append(td7a);

    const td8 = $('<div/>').addClass('recipeTabContainer recipeTabDetails');
        const td8a = $('<div/>').addClass('recipeDetailsContainer');
            const td8a1 = $('<div/>').addClass('recipeBackDescription').html(recipe.itemDescription());
            const td8a2 = $('<div/>').addClass('recipeStats').html(recipe.recipeListStats());
            const td8a3 = $('<div/>').addClass('recipeTotalCrafted').html(`${recipe.craftCount} <span>${recipe.name}</span> crafted.`);
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
    const masteryBar = $("<div/>").addClass("masteryBar").attr("data-label",`${craftCount} / 100`).attr("id","masteryBar");
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

function refreshBlueprint(type) {
    type = type || cacheBlueprintType;
    cacheBlueprintType = type;
    $blueprintUnlock.empty();
    recipeList.listByType(type).filter(r => r.found() && r.remainingReqs().length > 0).forEach(recipe => {
        const d = $("<div/>").addClass('bpShop');
        const d1 = $("<div/>").addClass('recipeItemLevel').html(recipe.itemLevel());
        const d2 = $("<div/>").addClass('recipeName').html(recipe.itemPicName());
        const d3 = $("<div/>").addClass('bpReq');
        const d3a = $("<div/>").addClass('bpReqHeading').html("Prerequisite Workers Needed");
        const d3b = $("<div/>").addClass('bpReqNeeded').html(recipe.remainingReqs());
        d3.append(d3a,d3b);
        d.append(d1,d2,d3);
        $blueprintUnlock.append(d);
    });
    const $RecipeContents = $(".recipeContents");
    $RecipeContents.append($blueprintUnlock);
}

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