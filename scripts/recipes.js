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
            refreshMasteryBar();
            refreshCraftedCount();
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
    recipeNewFilter : [],
    recipeCategory : "default",
    recipePop : "knives",
    createSave() {
        const save = [];
        this.recipes.forEach(r=> {
            save.push(r.createSave());
        });
        return save;
    },
    createFilterSave() {
        return this.recipeNewFilter;
    },
    loadSave(save) {
        save.forEach(i => {
            const rec = this.idToItem(i.id);
            rec.loadSave(i);
        });
    },
    loadRecipeFilterSave(save) {
        this.recipeNewFilter = save;
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

//the sort buttons at the top 
$(document).on("click",".recipeActionButton",(e) => {
    e.preventDefault();
    const toggleFilter = $(e.currentTarget).hasClass("filterActive");
    $recipeActionButton.removeClass("filterActive");
    $recipeActionButton.removeClass("toggleFilter");
    $(e.currentTarget).addClass("filterActive");
    if (toggleFilter) $(e.currentTarget).addClass("toggleFilter");
    const filter = $(e.currentTarget).attr("data-filter");
    sortRecipesByHeading(filter);
    recipeCanCraft();
});

function sortRecipesByHeading(heading) {
    if (recipeList.recipeCategory === heading) heading = heading+"Asc";
    recipeList.recipeCategory = heading;
    initializeRecipes(recipeList.recipePop, recipeList.recipeCategory, heading, queriedRecipes);
}

function refreshRecipeFilters() {
    //hide recipe buttons if we don't know know a recipe and also can't learn one...
    ItemType.forEach(type => {
        const recipeIcon = $("#rf"+type);
        if (recipeList.ownAtLeastOne(type)) recipeIcon.show();
        else recipeIcon.hide();
    });
}

function initializeRecipes(type,sortType,heading,query) {
    recipeList.recipePop = type;
    //filtering
    let rFilter = recipeList.recipes.filter(r => r.found() && WorkerManager.couldCraft(r));
    if (type === "Matless") {
        rFilter = rFilter.filter(r => r.mcost === null || r.isMastered());
        if (rFilter.length === 0) {
            Notifications.noItemFilter();
            return;
        }
    }
    else if (ResourceManager.isAMaterial(type)) {
        rFilter = rFilter.filter(r => r.mcost !== null && r.mcost.hasOwnProperty(type) && !r.isMastered());
        if (rFilter.length === 0) {
            Notifications.noItemFilter();
            return;
        }
    }
    else if (type === "search") {
        rFilter =  rFilter.filter(r => query.indexOf(r) > -1);
        if (rFilter.length === 0) {
            Notifications.noSearchFound();
            return;
        }
        $(".recipeSelect").removeClass("selected");
    }
    else rFilter = rFilter.filter(r => r.type === type);
    if (sortType === "default") rFilter.sort((a, b) => a.id.localeCompare(b.id))
    if (sortType === "defaultAsc") rFilter.sort((a, b) => b.id.localeCompare(a.id))
    if (sortType === "name") rFilter.sort((a, b) => a.name.localeCompare(b.name))
    if (sortType === "nameAsc") rFilter.sort((a, b) => b.name.localeCompare(a.name))
    if (sortType === "mastery") rFilter.sort((a,b) => Math.min(100,a.craftCount)-Math.min(100,b.craftCount));
    if (sortType === "masteryAsc") rFilter.sort((a,b) => Math.min(100,b.craftCount)-Math.min(100,a.craftCount));
    if (sortType === "lvl") rFilter.sort((a,b) => a.lvl - b.lvl);
    if (sortType === "lvlAsc") rFilter.sort((a,b) => b.lvl - a.lvl);
    if (sortType === "value") rFilter.sort((a,b) => a.value - b.value);
    if (sortType === "valueAsc") rFilter.sort((a,b) => b.value - a.value);
    if (sortType === "time") rFilter.sort((a,b) => a.craftTime - b.craftTime);
    if (sortType === "timeAsc") rFilter.sort((a,b) => b.craftTime - a.craftTime);
    //generate the lists
    $RecipeResults.empty();
    //cycle through everything in bp's and make the div for it
    const table = $('<div/>').addClass('recipeTable');
    const tableHeader = $('<div/>').addClass('recipeHeader');
    const htd1 = $('<div/>').addClass('recipeHeadName isSortableHead').html("NAME");
    const htd2 = $('<div/>').addClass('recipeHeadLvl isSortableHead').html("LVL");
    const htd3 = $('<div/>').addClass('recipeHeadRes').html("RESOURCES");
    const htd4 = $('<div/>').addClass('recipeHeadCost').html("MATS");
    const htd5 = $('<div/>').addClass('recipeHeadStats').html("STATS");
    const htd6 = $('<div/>').addClass('recipeHeadTime isSortableHead').html("TIME");
    const htd7 = $('<div/>').addClass('recipeHeadValue isSortableHead').html("VALUE");
    const htd8 = $('<div/>').addClass('recipeHeadCount isSortableHead').html("MASTERY");
    tableHeader.append(htd1,htd2,htd3,htd4,htd5,htd6,htd7,htd8);
    //add that stupid arrow class
    if (heading === "name") htd1.addClass("sortDesc");
    else if (heading === "nameAsc") htd1.addClass("sortAsc");
    else if (heading === "mastery") htd8.addClass("sortDesc");
    else if (heading === "masteryAsc") htd8.addClass("sortAsc");
    else if (heading === "lvl") htd2.addClass("sortDesc");
    else if (heading === "lvlAsc") htd2.addClass("sortAsc");
    else if (heading === "value") htd7.addClass("sortDesc");
    else if (heading === "valueAsc") htd7.addClass("sortAsc");
    else if (heading === "time") htd6.addClass("sortDesc");
    else if (heading === "timeAsc") htd6.addClass("sortAsc");
    //table.append(tableHeader);
    
    const tableContents = $('<div/>').addClass('recipeContents');
    //rows of table
    let alternate = false;
    let lastRow = null;

    rFilter.forEach((recipe) => {
        const td1 = $('<div/>').addClass('recipeName').append(recipe.itemPicName());
        const td1a = $('<div/>').addClass('recipeDescription').html("<i class='fas fa-info-circle'></i>");
        const td2 = $('<div/>').addClass('recipeItemLevel').html(recipe.itemLevel());
        const td3 = $('<div/>').addClass('recipecostdiv');
        const td3a = $('<div/>').addClass('reciperesdiv').html(recipe.visualizeResAndMat());
        td3.append(td3a);

        const td4 = $('<div/>').addClass('recipeTimeAndValue');
            const td4a = $('<div/>').addClass('recipeTimeContainer tooltip').attr("data-tooltip", "Craft Time")
                const td4a1 = $("<div/>").addClass("recipeTimeHeader recipeCardHeader").html(`<i class="fas fa-clock"></i>`);
                const td4a2 = $('<div/>').addClass('recipeTime').html(msToTime(recipe.craftTime));
            td4a.append(td4a1,td4a2);

            const td4b = $('<div/>').addClass('recipeAmountContainer tooltip').attr("data-tooltip", "In Inventory");
                const td4b1 = $("<div/>").addClass("recipeAmountHeader recipeCardHeader").html(`<i class="fas fa-cube"></i>`);
                const td4b2 = $('<div/>').addClass('recipeAmount').html(`${Inventory.itemCountAll(recipe.id)}`);
            td4b.append(td4b1,td4b2);

            const td4c = $('<div/>').addClass('recipeValueContainer tooltip').attr("data-tooltip", `${recipe.itemValue()} Gold`);
                const td4c1 = $("<div/>").addClass("recipeValueHeader recipeCardHeader").html(`<img src='images/resources/M001.png'>`);
                const td4c2 = $('<div/>').addClass('recipeValue').html(recipe.itemValueFormatted());
            td4c.append(td4c1,td4c2);
        td4.append(td4a,td4b,td4c);

        const td5 = $('<div/>').addClass('recipeCountAndCraft');
            const craftCount = Math.min(100,recipe.craftCount);
        const td5a = $('<div/>').addClass('recipeCount').attr("id","rc"+recipe.id);
            const masteryWidth = (craftCount).toFixed(1)+"%";
            const masteryBarDiv = $("<div/>").addClass("masteryBarDiv").attr("id","masteryBarDiv");
            const masteryBar = $("<div/>").addClass("masteryBar").attr("data-label",`${craftCount} / 100`).attr("id","masteryBar");
            const masteryBarFill = $("<div/>").addClass("masteryBarFill").attr("id","masteryFill").css('width', masteryWidth);
            masteryBarDiv.append(masteryBar,masteryBarFill);
        td5a.append(masteryBarDiv);
        const td5b = $('<div/>').addClass(`recipeCraft rr${recipe.id}`).attr("id",recipe.id).html(`<i class="fas fa-hammer"></i><span>Craft</span>`);
        td5.append(td5a,td5b);

        const td6 = $('<div/>').addClass('recipeClose').html(`<i class="fas fa-times"></i>`);
        const td7 = $('<div/>').addClass('recipeBackTabContainer');
            const td7a = $('<div/>').addClass('recipeBackTab backTab1 selected').html(`Details`);
            const td7b = $('<div/>').addClass('recipeBackTab backTab2').html(`Mastery`);
        td7.append(td7a,td7b);

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
        const recipeCardFront = $('<div/>').addClass('recipeCardFront').append(td1,td1a,td2,td3,td4,td5);
        const recipeCardBack = $('<div/>').addClass('recipeCardBack').append(td6,td7,td8,td9);
        const recipeCardContainer = $('<div/>').addClass('recipeCardContainer').append(recipeCardFront,recipeCardBack);
        const row = $('<div/>').addClass('recipeRow').attr("id","rr"+recipe.id).append(recipeCardContainer);

        lastRow = row;
        if (alternate) row.addClass("recipeRowHighlight");
        alternate = !alternate;
        tableContents.append(row);
    });
    table.append(tableContents);
    if (lastRow !== null) lastRow.addClass("recipeRowLast");
    $RecipeResults.append(table);
    refreshBlueprint(type);
    recipeCanCraft();
}

function refreshMasteryBar() {
    recipeList.recipes.forEach((recipe) => {
        const rr = $("#rc"+recipe.id)
        const masteryWidth = (recipe.craftCount).toFixed(1)+"%";
        const masteryBarDiv = $("<div/>").addClass("masteryBarDiv").attr("id","masteryBarDiv");
        const masteryBar = $("<div/>").addClass("masteryBar").attr("data-label",`${recipe.craftCount} / 100`).attr("id","masteryBar");
        const masteryBarFill = $("<div/>").addClass("masteryBarFill").attr("id","masteryFill").css('width', masteryWidth);
        masteryBarDiv.append(masteryBar,masteryBarFill);
        rr.html(masteryBarDiv);
    });
}

function refreshCraftedCount() {
    recipeList.recipes.forEach(recipe => {
        const rr = $("#rr"+recipe.id);
        rr.find(".recipeTotalCrafted").html(`${recipe.craftCount} <span>${recipe.name}</span> crafted.`);
    });
}

function refreshCardInvCount() {
    recipeList.recipes.forEach((recipe) => {
        const rr = $("#rr"+recipe.id+" .recipeAmount");
        const invCount = Inventory.itemCountAll(recipe.id);
        rr.html(invCount);
    });
}

function recipeCanCraft() {
    //loops through recipes, adds class if disabled
    $(".recipeCraft").removeClass("recipeCraftDisable");
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
    const type = $(e.target).attr("id").substring(2);
    recipeList.recipeNewFilter = recipeList.recipeNewFilter.filter(t => t !== type);
    refreshRecipeFilters();
    if (recipeList.recipeCategory !== "default") {
        recipeList.recipeCategory = "default";
        initializeRecipes("default");
    }
    initializeRecipes(type,"default");
})

$(document).on('click','.bpShopButton', (e) => {
    e.preventDefault();
    const id = $(e.currentTarget).attr('id');
    recipeList.buyBP(id);
    refreshRecipeFilters();
});

$(document).on('click','.recipeDescription', (e) => {
    e.preventDefault();
    $(".recipeCardContainer").removeClass("recipeCardFlipped");
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

function cleanString(string) {
    const newString = (string).toLowerCase().replace(/\s+/g, '');
    return newString;
}

let queriedRecipes = null;

function runSortSearch() {
    const searchTerm = cleanString(document.getElementById("recipeSortInput").value);
    if (searchTerm.length >= 2) {
        queriedRecipes = recipeList.recipes.filter(recipe => cleanString(recipe.name).indexOf(searchTerm) > -1);
        initializeRecipes("search","lvl","lvl",queriedRecipes);
    } else {
        Notifications.searchLengthInvalid();
    }
}

$(document).on('click','.recipeSortButton', (e) => {
    e.preventDefault();
    runSortSearch();
});

$(document).on('keydown','.recipeSortInput', (e) => {
    if (e.keyCode === 13) runSortSearch();
});

