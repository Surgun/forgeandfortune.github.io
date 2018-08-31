"use strict";

const ItemType = Object.freeze({KNIFE:"Knives", MACE:"Maces", GLOVE:"Gloves", POTION:"Potions", AXE:"Axes", HAT:"Hats", WAND:"Wands", GAUNTLET:"Gauntlets", HELMET:"Helmets", SHOES:"Shoes", WARD:"Wards", SHIELD:"Shields", CLOAK:"Cloaks", ARMOR:"Armor", PENDANT:"Pendants"});
const Rarity = Object.freeze({COMMON:"common",UNCOMMON:"uncommon",RARE:"rare",LEGENDARY:"legendary"});

const $RecipeResults = $("#RecipeResults");

class Item{
    constructor (props) {
        Object.assign(this, props);
        this.owned = false;
    }
    canAfford() {
        return ResourceManager.canAffordResources(this.id);
    }
    itemPicName() {
        return "<img src='/images/recipes/"+this.type+"/"+this.id+".png'>"+"<div class='item-name'>"+this.name+"</div>";
    }
    itemPic() {
        return "<img src='/images/recipes/"+this.type+"/"+this.id+".png'>";
    }
    imageValue() {
        return ResourceManager.formatCost("M001",this.value);
    }
    visualizeCost() {
        const d = $("<div/>").addClass("itemCost")
        for (const [resource, amt] of Object.entries(this.rcost)) {
            const resourceNameForTooltips = resource.charAt(0).toUpperCase()+resource.slice(1);
            d.append($("<div/>").addClass("indvCost tooltip").attr("data-tooltip",resourceNameForTooltips).html(ResourceManager.formatCost(resource,amt)));
        }
        for (const [material, amt] of Object.entries(this.mcost)) {
            const mat = ResourceManager.idToMaterial(material)
            d.append($("<div/>").addClass("indvCost tooltip").attr("data-tooltip",mat.name).html(ResourceManager.formatCost(material,amt)));
        }
        return d;
    }
    getCost(resource) {
        if (resource in this.rcost) return this.rcost[resource];
        return 0;
    }
}

const recipeList = {
    recipes : [],
    addItem(item) {
        this.recipes.push(item);
    },
    listByType(type) {
        return this.recipes.filter(recipe => recipe.type === type);
    },
    listbyTypes(types) {
        return this.recipes.filter(recipe => types.includes(recipe.type));
    },
    idToItem(id) {
        return this.recipes.find(recipe => recipe.id === id);
    },
    buyable(type) {
        return this.recipes.filter(recipe => recipe.type === type && !recipe.owned && recipe.canAfford())
    },
    buyBP(id) {
        console.log(id);
        if (ResourceManager.idToMaterial("M002").amt === 0) return;
        ResourceManager.addMaterial("M002",-1);
        const item = this.idToItem(id);
        item.owned = true;
        populateRecipe(item.type);
    }
}

function populateRecipe(type) {
    type = type || ItemType.KNIFE;
    $(".recipeRow").hide();
    recipeList.listByType(type).filter(r => r.owned).forEach((recipe) => {
        $("#"+recipe.id).show();
    });
    refreshBlueprint(type);
}

function initializeRecipes() {
    $RecipeResults.empty();
    //cycle through everything in bp's and make the div for it
    const table = $('<div/>').addClass('recipeTable');
    const htd1 = $('<div/>').addClass('recipeHeadName').html("NAME");
    const htd2 = $('<div/>').addClass('recipeHeadCost').html("COST");
    const htd3 = $('<div/>').addClass('recipeHeadTime').html("TIME");
    const htd4 = $('<div/>').addClass('recipeHeadValue').html("VALUE");
    const hrow = $('<div/>').addClass('recipeHeader').append(htd1,htd2,htd3,htd4);
    table.append(hrow);
    recipeList.recipes.forEach((recipe) => {
        const td1 = $('<div/>').addClass('recipeName').attr("id",recipe.id).append(recipe.itemPicName());
        const td2 = $('<div/>').addClass('recipecostdiv').html(recipe.visualizeCost());
        const td3 = $('<div/>').addClass('recipeTime').html(msToTime(recipe.craftTime))
        const td4 = $('<div/>').addClass('recipeValue').html(recipe.imageValue());
        const row = $('<div/>').addClass('recipeRow').attr("id",recipe.id).append(td1,td2,td3,td4);
        table.append(row);
    });
    $RecipeResults.append(table);
}

const $blueprintUnlock = $("#BlueprintUnlock");

function refreshBlueprint(type) {
    $blueprintUnlock.empty();
    recipeList.buyable(type).forEach(recipe => {
        const d = $("<div/>").addClass('bpShop');
        const d1 = $("<div/>").addClass('bpShopName').html(recipe.itemPicName());
        const b1 = $("<div/>").addClass('bpShopButton').attr("id",recipe.id).html(`BUY - 1 <img src="images/resources/M002.png" id="${recipe.id}" alt="Blueprint">`);
        d.append(d1,b1);
        $blueprintUnlock.append(d);
    })
}

$(document).on('click', '.recipeName', (e) => {
    e.preventDefault();
    const type = $(e.target).attr("id");
    const item = recipeList.idToItem(type);
    actionSlotManager.addSlot(type);
});

$(document).on('click', '.recipeSelect', (e) => {
    e.preventDefault();
    const type = $(e.target).attr("id");
    populateRecipe(type);
})

$(document).on('click','.bpShopButton', (e) => {
    e.preventDefault();
    const id = $(e.target).attr('id');
    recipeList.buyBP(id);
});