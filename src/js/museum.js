"use strict";

const $museumBuilding = $("#museumBuilding");
const $museumNavigation = $("#museumNavigation");
const $museumRecipeTypes = $("#museumRecipeTypes");
const $museumRecipeContributions = $("#museumRecipeContributions");
const $museumRewards = $("#museumRewards");
const $museumInv = $("#museumInv");
const $museumTop = $(".museumTop");

const Museum = {
    rewards : [],
    addReward(reward) {
        this.rewards.push(reward);
    },
    createSave() {
        const save = {};
        save.rewards = [];
        this.rewards.forEach(reward => {
            save.rewards.push(reward.createSave());
        });
        return save;
    },
    loadSave(save) {
        save.rewards.forEach(rewardSave => {
            const reward = this.idToReward(rewardSave.id);
            reward.loadSave(rewardSave);
        });
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
    },
    purchaseReward(rewardID) {
        const reward = this.idToReward(rewardID);
        if (this.remainingPoints() < reward.purchaseCost()) {
            Notifications.cantAffordMuseumReward();
            return;
        }
        reward.purchase();
    },
    crafTime() {
        const reward = this.idToReward("MU001").lvl;
        return 1-reward*0.02;
    },
    goodChance() {
        const reward = this.idToReward("MU002").lvl;
        return reward*5;
    },
    greatChance() {
        const reward = this.idToReward("MU003").lvl;
        return Math.floor(reward*2.5);
    },
    epicChance() {
        const reward = this.idToReward("MU004").lvl;
        return reward;
    }
}

class MuseumReward {
    constructor(props) {
        Object.assign(this, props);
        this.lvl = 0;
    }
    createSave() {
        const save = {};
        save.id = this.id;
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
        if (this.lvl === 0) return 0;
        return this.cost.slice(0,this.lvl).reduce((a,b)=>a+b);
    }
    purchase() {
        if (Museum.remainingPoints() < this.purchaseCost()) return;
        this.lvl += 1;
    }
    currentReward() {
        return this.rewardText[this.lvl];
    }
    nextReward() {
        return this.rewardText[this.lvl+1];
    }
    maxLvl() {
        return this.lvl === 20;
    }
}

function initiateMuseumBldg() {
    $museumBuilding.show();
    $museumNavigation.empty();
    $("<div/>").addClass("museumTabNavigation").attr({id: "museumNavCollection"}).html(displayText("museum_nav_collections")).appendTo($museumNavigation);
    $("<div/>").addClass("museumTabNavigation").attr({id: "museumNavReward"}).html(displayText("museum_nav_rewards")).appendTo($museumNavigation);
    $("#museumNavReward").removeClass("selected");
    $("#museumNavCollection").addClass("selected");
    refreshMuseumTop();
    refreshMuseumInv();
}

function refreshMuseumTop() {
    $museumTop.hide();
    $museumRecipeTypes.empty().show();
    const museumItemTypesHeader = $("<div/>").addClass(`museumItemTypesHeader`).appendTo($museumRecipeTypes);
        const headingDetails = $("<div/>").addClass("headingDetails").appendTo(museumItemTypesHeader);
            $("<div/>").addClass("headingTitle").html(displayText("header_museum_item_types_title")).appendTo(headingDetails);
            $("<div/>").addClass("headingDescription").html(displayText("header_museum_item_types_desc")).appendTo(headingDetails);
    const museumItemTypesContainer = $("<div/>").addClass(`museumItemTypesContainer`).appendTo($museumRecipeTypes);
    ItemType.sort().forEach(type => {
        const d = $("<div/>").addClass("museumTypeDiv").data("recipeType",type).appendTo(museumItemTypesContainer);
        $("<div/>").addClass("museumTypeName").html(displayText(`type_${type}`)).appendTo(d);
        const percent = (Museum.completeByType(type)/44*100).toFixed(1)+"%";
        $("<div/>").addClass("museumTypeComplete").html(percent).appendTo(d);
    });
};

function showMuseumType(type) {
    $museumTop.hide();
    $museumRecipeContributions.empty().show();

    const museumContributionsActions = $("<div/>").addClass("museumContributionsActions").appendTo($museumRecipeContributions);
    const backButton = $("<div/>").addClass(`museumBackButton actionButton`).html(`<i class="fas fa-arrow-left"></i>`).appendTo(museumContributionsActions);
        $("<div/>").addClass(`backButtonText`).html(displayText("museum_item_types_back_button")).appendTo(backButton);

    const museumContributionsList = $("<div/>").addClass("museumContributionsList").appendTo($museumRecipeContributions);
    recipeList.filterByType(type).forEach(recipe => {
        const d = $("<div/>").addClass("museumRecipeDiv").appendTo(museumContributionsList);
        $("<div/>").addClass("museumRecipeImage").html(recipe.itemPicName()).appendTo(d);
        const d1 = $("<div/>").addClass("museumRecipeCon").appendTo(d);
        recipe.museum.forEach((rarity,j) => {
            const d1a = $("<div/>").addClass("museumRecipeConItem").appendTo(d1);
            rarity.forEach((sharp,i) => {
                const d2 = $("<div/>").addClass(`museumRecipe R${j}`).appendTo(d1a);
                if (sharp) d2.addClass("museumRecipeEntryComplete").html(miscIcons.checkmark);
                else d2.html(`+${i}`);
            });
        });
    });
};

function showMuseumRewards() {
    $museumTop.hide();
    $museumRewards.empty().show();

    const museumRewardsHeader = $("<div/>").addClass(`museumItemTypesHeader`).appendTo($museumRewards);
    const headingDetails = $("<div/>").addClass("headingDetails").appendTo(museumRewardsHeader);
        $("<div/>").addClass("headingTitle").html(displayText("header_museum_reward_points_title")).appendTo(headingDetails);
        $("<div/>").addClass("headingDescription").html(displayText("header_museum_reward_points_desc")).appendTo(headingDetails);

    const d1 = $("<div/>").addClass("museumRewardPointContainer").appendTo($museumRewards);
        const pointsLeft = Museum.remainingPoints() !== 1 ? `museum_reward_points_balance_plural` : `museum_reward_points_balance`;
        $("<div/>").addClass("museumRewardPoint").html(displayText(pointsLeft).replace("{0}",Museum.remainingPoints())).appendTo(d1);

    const museumRewardCardsContainer = $("<div/>").addClass("museumRewardCardsContainer").appendTo($museumRewards);
    Museum.rewards.forEach(reward => {
        const d = $("<div/>").addClass("museumRewardDiv").appendTo(museumRewardCardsContainer);
        $("<div/>").addClass("museumRewardTitle").html(displayText(`museum_reward_${reward.name}_title`)).appendTo(d);
        $("<div/>").addClass("museumRewardLvl").html(displayText(`museum_reward_level`).replace('{0}',reward.lvl)).appendTo(d);
        $("<div/>").addClass("museumRewardHeading").html(displayText(`museum_reward_current`)).appendTo(d);
        $("<div/>").addClass("museumRewardText museumRewardCurrent").html(displayText(`museum_reward_${reward.name}_desc`).replace("{0}",reward.currentReward())).appendTo(d);
        if (!reward.maxLvl()) {
            $("<div/>").addClass("museumRewardHeading").html(displayText(`museum_reward_next`)).appendTo(d);
            $("<div/>").addClass("museumRewardText museumRewardNext").html(displayText(`museum_reward_${reward.name}_desc`).replace("{0}",reward.nextReward())).appendTo(d);
            const purchaseCost = reward.purchaseCost() !== 1 ? `museum_reward_purchase_plural` : `museum_reward_purchase`;
            $("<div/>").addClass("actionButtonCard museumRewardComplete").data("rid",reward.id).html(displayText(purchaseCost).replace('{0}',reward.purchaseCost())).appendTo(d);
        }
    });
}

function refreshMuseumInv() {
    $museumInv.empty();
    const donations = Museum.possibleInventoryDonations();
    const museumDonationsHeader = $("<div/>").addClass(`museumItemTypesHeader`).appendTo($museumInv);
    const headingDetails = $("<div/>").addClass("headingDetails").appendTo(museumDonationsHeader);
        $("<div/>").addClass("headingTitle").html(displayText("header_museum_donations_title")).appendTo(headingDetails);
        $("<div/>").addClass("headingDescription").html(displayText("header_museum_donations_desc")).appendTo(headingDetails);
    const museumDonationCardsContainer = $("<div/>").addClass(`museumDonationCardsContainer`).appendTo($museumInv);
    if (donations.length === 0) {
        $("<div/>").addClass("emptyContentMessage").html(displayText("museum_no_donations_message")).appendTo($museumInv);
        return;
    }
    Museum.possibleInventoryDonations().forEach(container => {
        createMuseumCard(container).appendTo(museumDonationCardsContainer);
    });
}

function createMuseumCard(container) {
    const d = $("<div/>").addClass("museumItem").addClass("R"+container.rarity);
    $("<div/>").addClass("itemName").html(container.picName()).appendTo(d);
    $("<div/>").addClass(`itemRarity RT${container.rarity} tooltip`).attr({"data-tooltip": `rarity_${rarities[container.rarity].toLowerCase()}`}).html(miscIcons.rarity).appendTo(d);
    $("<div/>").addClass("itemLevel").html(container.itemLevel()).appendTo(d);
    const itemProps = $("<div/>").addClass("equipStats").appendTo(d);
    for (const [stat, val] of Object.entries(container.itemStat(false))) {
        if (val === 0) continue;
        $("<div/>").addClass("gearStat tooltip").attr("data-tooltip", stat).html(`${miscIcons[stat]} <span class="statValue">${val}</span>`).appendTo(itemProps);
    };
    const actionBtns = $("<div/>").addClass("museumButtons").appendTo(d);
    $("<div/>").addClass('actionButtonCard museumDonate').data("containerid",container.containerID).html(displayText("museum_donations_donate_button")).appendTo(actionBtns);
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

$(document).on("click",".museumRewardComplete",(e) => {
    const rewardID = $(e.target).data("rid");
    Museum.purchaseReward(rewardID);
    showMuseumRewards();
});

$(document).on("click","#museumNavReward",(e) => {
    e.preventDefault();
    $("#museumNavCollection").removeClass("selected");
    $("#museumNavReward").addClass("selected");
    showMuseumRewards();
});

$(document).on("click","#museumNavCollection",(e) => {
    e.preventDefault();
    $("#museumNavReward").removeClass("selected");
    $("#museumNavCollection").addClass("selected");
    refreshMuseumTop();
});