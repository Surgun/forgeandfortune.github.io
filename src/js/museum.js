"use strict";

const $museumBuilding = $("#museumBuilding");
const $museumRecipeTypes = $("#museumRecipeTypes");
const $museumRecipeContributions = $("#museumRecipeContributions");
const $museumInv = $("#museumInv");

const Museum = {
    checkSubmit(container) {
        const item = recipeList.idToItem(container.id);
        return item.museum[item.rarity][item.sharp];
    },
    possibleInventoryDonations() {
        return Inventory.inv.filter(i => this.checkSubmit(i));
    },
    percentCompleteByType(type) {
        const museumData = recipeList.filterByType(type).map(r => r.museum);
        return museumData.flat().filter(Boolean).length/44;
    },
    museumData(itemID) {
        return recipeList.idToItem(itemID).museum;
    },
}

function initiateMuseumBldg() {
    $museumBuilding.show();
    refreshMuseumTop();
    refreshMuseumInv();
}

function refreshMuseumTop() {
    $museumRecipeContributions.hide();
    $museumRecipeTypes.empty.show();
    ItemType.forEach(type => {
        const d = $("<div/>").addClass("museumTypeDiv").data("recipeType",type).appendTo($museumRecipeTypes);
        $("<div/>").addClass("museumTypeName").html(type).appendTo(d);
        $("<div/>").addClass("museumTypeComplete").html((44*100)+"%").appendTo(d);
    });
};

function showMuseumType(type) {
    $museumRecipeContributions.empty.show();
    $museumRecipeTypes.hide();
    recipeList.filterByType(type).forEach(recipe => {
        const d = $("<div/>").addClass("museumRecipeDiv").appendTo($museumRecipeContributions);
        $("<div/>").addClass("museumRecipeImage").html(recipe.img).appendTo(d);
        recipe.museum.forEach(rarity => {
            rarity.forEach((sharp,i) => {
                const d1 = $("<div/>").addClass("museumRecipe"+rarity).html(`+${i}`).appendTo(d);
                if (sharp) d1.addClass("museumRecipeEntryComplete");
            });
        });
    });
};

$(document).on("click",".museumTypeDiv",(e) => {
    e.preventDefault();
    const type = $(e.target).data("recipeType");
    showMuseumType(type);
});