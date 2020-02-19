"use strict";

const $museumBuilding = $("#museumBuilding");
const $museumRecipeTypes = $("#museumRecipeTypes");
const $museumRecipeContributions = $("#museumRecipeContributions");
const $museumRewards = $("#museumRewards");
const $museumInv = $("#museumInv");
const $museumTop = $(".museumTop");

const Museum = {
    craftTime : 0,
    goodChance : 0,
    greatChance : 0,
    epicChance : 0,
    rewards : [],
    addReward(reward) {
        this.rewards.push(reward);
    },
    idToReward(id) {
        return this.rewards.find(r=>r.id === id);
    },
    checkSubmit(container) {
        const item = recipeList.idToItem(container.id);
        return item.museum[container.rarity][container.sharp];
    },
    possibleInventoryDonations() {
        return Inventory.nonblank().filter(i => !this.checkSubmit(i));
    },
    completeByType(type) {
        const museumData = recipeList.filterByType(type).map(r => r.museum);
        return museumData.flat().flat().filter(Boolean).length;
    },
    museumData(itemID) {
        return recipeList.idToItem(itemID).museum;
    },
    donate(containerID) {
        if (!Inventory.hasContainer(containerID)) return;
        const container = Inventory.containerToItem(containerID);
        Inventory.removeContainerFromInventory(containerID);
        recipeList.idToItem(container.id).museum[container.rarity][container.sharp] = true;
    },
    earnedPoints() {
        return recipeList.recipes.map(r=>r.museum.flat()).flat().filter(Boolean).length;
    },
    remainingPoints() {
        return this.earnedPoints()-this.rewards.map(r=>r.spent()).reduce((a,b) => a+b);
    }
}

class MuseumReward {
    constructor(props) {
        Object.assign(this, props);
        this.lvl = 0;
    }
    createSave() {
        const save = {};
        save.lvl = this.lvl;
        return save;
    }
    loadSave(save) {
        this.lvl = save.lvl;
    }
    purchaseCost() {
        return this.cost[this.lvl];
    }
    spent() {
        return this.cost.slice(0,this.lvl+1).reduce((a,b)=>a+b);
    }
    purchase() {
        if (Museum.remainingPoints() < this.purchaseCost()) return;
        this.lvl += 1;
    }
}

function initiateMuseumBldg() {
    $museumBuilding.show();
    refreshMuseumTop();
    refreshMuseumInv();
}

function refreshMuseumTop() {
    $museumTop.hide();
    $museumRecipeTypes.empty().show();
    ItemType.forEach(type => {
        const d = $("<div/>").addClass("museumTypeDiv").data("recipeType",type).appendTo($museumRecipeTypes);
        $("<div/>").addClass("museumTypeName").html(type).appendTo(d);
        const percent = (Museum.percentCompleteByType(type)/44).toFixed(1)+"%";
        $("<div/>").addClass("museumTypeComplete").html(percent).appendTo(d);
    });
};

function showMuseumType(type) {
    $museumTop.hide();
    $museumRecipeContributions.empty().show();
    $("<div/>").addClass(`museumBackButton`).html(`<i class="fas fa-arrow-left"></i>`).appendTo($museumRecipeContributions);
    recipeList.filterByType(type).forEach(recipe => {
        const d = $("<div/>").addClass("museumRecipeDiv").appendTo($museumRecipeContributions);
        $("<div/>").addClass("museumRecipeImage").html(recipe.itemPic()).appendTo(d);
        const d1 = $("<div/>").addClass("museumRecipeContributions").appendTo(d);
        recipe.museum.forEach((rarity,j) => {
            rarity.forEach((sharp,i) => {
                const d2 = $("<div/>").addClass("museumRecipe"+j).html(`+${i}`).appendTo(d1);
                if (sharp) d2.addClass("museumRecipeEntryComplete");
            });
        });
    });
};

function showMuseumRewards() {
    $museumTop.hide();
    $museumRewards.empty().show();

}

function refreshMuseumInv() {
    $museumInv.empty();
    const donations = Museum.possibleInventoryDonations();
    if (donations.length === 0) {
        $("<div/>").addClass("museumNoItems").html("You don't have any items for new donations");
        return;
    }
    Museum.possibleInventoryDonations().forEach(container => {
        createMuseumCard(container).appendTo($museumInv);
    });
}


function createMuseumCard(container) {
    const d = $("<div/>").addClass("museumItem").addClass("R"+container.rarity);
    $("<div/>").addClass("museumItemName").html(container.picName()).appendTo(d);
    $("<div/>").addClass(`museumItemRarity museumRarity${container.rarity} tooltip`).attr({"data-tooltip": `rarity_${rarities[container.rarity].toLowerCase()}`}).html(miscIcons.rarity).appendTo(d);
    $("<div/>").addClass("museumtemLevel").html(container.itemLevel()).appendTo(d);
    const itemProps = $("<div/>").addClass("museumItemProps").appendTo(d);
    for (const [stat, val] of Object.entries(container.itemStat(false))) {
        if (val === 0) continue;
        $("<div/>").addClass("museumPropStat tooltip").attr("data-tooltip", stat).html(`${miscIcons[stat]} <span class="statValue">${val}</span>`).appendTo(itemProps);
    };
    const actionBtns = $("<div/>").addClass("museumButtons").appendTo(d);
    $("<div/>").addClass('museumDonate').data("containerid",container.containerID).html("Donate").appendTo(actionBtns);
    return d;
}

$(document).on("click",".museumTypeDiv",(e) => {
    e.preventDefault();
    const type = $(e.currentTarget).data("recipeType");
    showMuseumType(type);
});

$(document).on("click",".museumBackButton",(e) => {
    e.preventDefault();
    refreshMuseumTop();
})

$(document).on("click",".museumDonate",(e) => {
    const containerid = parseInt($(e.target).data("containerid"));
    Museum.donate(containerid);
    refreshMuseumTop();
    refreshMuseumInv();
});