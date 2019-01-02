"use strict";

const $buildingList = $("#buildingList");
const $buildingHeader = $("#buildingHeader");
const $fuseBuilding = $("#fuseBuilding");
const $bankBuilding = $("#bankBuilding");
const $smithBuilding = $("#smithBuilding");
const $fortuneBuilding = $("#fortuneBuilding");

const TownManager = {
    lastBldg : null,
    lastType : null,
    bankSee : false,
    bankOnce : false,
    bankUnlock : false,
    bankCost : false,
    fuseSee : false,
    fuseOnce : false,
    fuseUnlock : false,
    fuseCost : false,
    smithSee : false,
    smithOnce : false,
    smithUnlock : false,
    smithCost : false,
    fortuneSee : false,
    fortuneOnce : false,
    fortuneUnlock : false,
    fortuneCost : false,
    purgeSlots : false,
    createSave() {
        const save = {};
        save.bankSee = this.bankSee;
        save.bankOnce = this.bankOnce;
        save.bankUnlock = this.bankUnlock;
        save.bankCost = this.bankCost;
        save.fuseSee = this.fuseSee;
        save.fuseOnce = this.fuseOnce;
        save.fuseUnlock = this.fuseUnlock;
        save.fuseCost = this.fuseCost;
        save.smithSee = this.smithSee;
        save.smithOnce = this.smithOnce;
        save.smithUnlock = this.smithUnlock;
        save.smithCost = this.smithCost;
        save.fortuneSee = this.fortuneSee;
        save.fortuneOnce = this.fortuneOnce;
        save.fortuneUnlock = this.fortuneUnlock;
        save.fortuneCost = this.fortuneCost;
        return save;
    },
    loadSave(save) {
        this.bankSee = save.bankSee;
        this.bankOnce = save.bankOnce
        this.bankUnlock = save.bankUnlock;
        this.bankCost = save.bankCost;
        this.fuseSee = save.fuseSee;
        this.fuseOnce = save.fuseOnce;
        this.fuseUnlock = save.fuseUnlock;
        this.fuseCost = save.fuseCost;
        this.smithSee = save.smithSee;
        this.smithOnce = save.smithOnce;
        this.smithUnlock = save.smithUnlock;
        this.smithCost = save.smithCost;
        this.fortuneSee = save.fortuneSee;
        this.fortuneOnce = save.fortuneOnce;
        this.fortuneUnlock = save.fortuneUnlock;
        this.fortuneCost = save.fortuneCost;
    },
    paidCost(type) {
        if (type === "bank") return this.bankCost;
        if (type === "fuse") return this.fuseCost;
        if (type === "smith") return this.smithCost;
        if (type === "fortune") return this.fortuneCost;
    },
    setCost(type) {
        if (type === "bank") this.bankCost = true;
        if (type === "fuse") this.fuseCost = true;
        if (type === "smith") this.smithCost = true;
        if (type === "fortune") this.fortuneCost = true;
    },
    unseenLeft() {
        return this.bankOnce || this.fuseOnce || this.smithOnce || this.fortuneOnce;
    }
}

const $emptyTown = $("#emptyTown");

function refreshSideTown() {
    $buildingList.empty();
    if (TownManager.unseenLeft()) $("#townTab").addClass("hasEvent");
    else $("#townTab").removeClass("hasEvent");
    if (!TownManager.bankSee) return;
    $emptyTown.hide();
    const d1 = $("<div/>").addClass("buildingName").attr("id","bankBldg").html(`<i class="fas fa-university"></i> Bank`);
    if (TownManager.lastBldg === "bank") d1.addClass("selected");
    if (TownManager.bankOnce) d1.addClass("hasEvent");
    $buildingList.append(d1);
    if (!TownManager.bankUnlock || !TownManager.fuseSee) return;
    const d2 = $("<div/>").addClass("buildingName").attr("id","fusionBldg").html(`<i class="fas fa-cauldron"></i> Cauldron`);
    if (TownManager.lastBldg === "fuse") d2.addClass("selected");
    if (TownManager.fuseOnce) d2.addClass("hasEvent");
    $buildingList.append(d2);
    if (!TownManager.fuseUnlock || !TownManager.smithSee) return;
    const d3 = $("<div/>").addClass("buildingName").attr("id","smithBldg").html(`<i class="fas fa-hammer-war"></i> Forge`);
    if (TownManager.lastBldg === "smith") d3.addClass("selected");
    if (TownManager.smithOnce) d3.addClass("hasEvent");
    $buildingList.append(d3);
    if (!TownManager.smithUnlock || !TownManager.fortuneSee) return;
    const d4 = $("<div/>").addClass("buildingName").attr("id","fortuneBldg").html(`<i class="fas fa-hat-wizard"></i> Fortune`);
    if (TownManager.lastBldg === "fortune") d4.addClass("selected");
    if (TownManager.fortuneOnce) d4.addClass("hasEvent");
    $buildingList.append(d4);
}

function showFuseBldg() {
    $(".buildingTab").removeClass("bldgTabActive").hide();
    $fuseBuilding.addClass("bldgTabActive");
    $buildingHeader.empty();
    $buildBuilding.hide();
    const d = $("<div/>").addClass("buildingInfo buildingFusion");
        const da = $("<div/>").addClass("buildingInfoBackground");
        const db = $("<div/>").addClass("buildingInfoImage").html("<img src='images/recipes/noitem.png'>")
        if (TownManager.fuseUnlock) db.html("<img src='images/townImages/fuseBuilding/fusion_building.png'>");
        const dc = $("<div/>").addClass("buildingInfoName").html("<h2>Fusion Cauldron</h2>");
        const dd = $("<div/>").addClass("buildingInfoDesc").html("Fuse three of the same item into a rarity higher of the same item.");
        if (!TownManager.fuseUnlock) d.addClass("buildInProgress");
        d.append(da,db,dc,dd);
    $buildingHeader.append(d);
    if (TownManager.fuseUnlock) initiateFuseBldg();
    else {
        $buildBuilding.show();
        buildScreen("fuse");
    }
}

const $buildBuilding = $("#buildBuilding");

function showBankBldg() {
    $(".buildingTab").removeClass("bldgTabActive").hide();
    $bankBuilding.addClass("bldgTabActive");
    $buildingHeader.empty();
    $buildBuilding.hide();
    const d = $("<div/>").addClass("buildingInfo buildingBank");
        const da = $("<div/>").addClass("buildingInfoBackground");
        const db = $("<div/>").addClass("buildingInfoImage").html("<img src='images/recipes/noitem.png'>")
        if (TownManager.bankUnlock) db.html("<img src='images/townImages/bankBuilding/bank_building.png'>")
        const dc = $("<div/>").addClass("buildingInfoName").html("<h2>The Bank</h2>");
        const dd = $("<div/>").addClass("buildingInfoDesc").html("Store important items at the bank.");
        if (!TownManager.bankUnlock) d.addClass("buildInProgress");
        d.append(da,db,dc,dd);
    $buildingHeader.append(d);
    if (TownManager.bankUnlock) initiateBankBldg();
    else {
        $buildBuilding.show();
        buildScreen("bank");
    }
}

function showSmithBldg() {
    $(".buildingTab").removeClass("bldgTabActive").hide();
    $smithBuilding.addClass("bldgTabActive");
    $buildingHeader.empty();
    $buildBuilding.hide();
    const d = $("<div/>").addClass("buildingInfo buildingSmith");
        const da = $("<div/>").addClass("buildingInfoBackground");
        const db = $("<div/>").addClass("buildingInfoImage").html("<img src='images/recipes/noitem.png'>")
        if (TownManager.smithUnlock) db.html("<img src='images/townImages/smithBuilding/smith_building.png'>");
        const dc = $("<div/>").addClass("buildingInfoName").html("<h2>The Forge</h2>");
        const dd = $("<div/>").addClass("buildingInfoDesc").html("Upgrade your weapons at the forge.");
        if (!TownManager.smithUnlock) d.addClass("buildInProgress");
        d.append(da,db,dc,dd);
    $buildingHeader.append(d);
    if (TownManager.smithUnlock) initiateSmithBldg();    
    else {
        $buildBuilding.show();
        buildScreen("smith");
    }
}

function showFortuneBldg() {
    $(".buildingTab").removeClass("bldgTabActive").hide();
    $fortuneBuilding.addClass("bldgTabActive");
    $buildingHeader.empty();
    $buildBuilding.hide();
    const d = $("<div/>").addClass("buildingInfo buildingFortune");
        const da = $("<div/>").addClass("buildingInfoBackground");
        const db = $("<div/>").addClass("buildingInfoImage").html("<img src='images/recipes/noitem.png'>")
        if (TownManager.fortuneUnlock) db.html("<img src='images/townImages/fortuneBuilding/fortune_building.png'>");
        const dc = $("<div/>").addClass("buildingInfoName").html("<h2>Fortune Teller</h2>");
        const dd = $("<div/>").addClass("buildingInfoDesc").html("Find which crafts are lucky this week!");
        if (!TownManager.fortuneUnlock) d.addClass("buildInProgress");
        d.append(da,db,dc,dd);
    $buildingHeader.append(d);
    if (TownManager.fortuneUnlock) initiateFortuneBldg();
    else {
        $buildBuilding.show();
        buildScreen("fortune");
    }
}

$(document).on('click', "#fusionBldg", (e) => {
    e.preventDefault();
    if (TownManager.lastBldg === "fusion") return;
    TownManager.lastBldg = "fusion";
    TownManager.fuseOnce = false;
    $(".buildingName").removeClass("selected");
    if (!TownManager.unseenLeft()) $("#townTab").removeClass("hasEvent");
    $("#fusionBldg").addClass("selected");
    $("#fusionBldg").removeClass("hasEvent");
    showFuseBldg();
});

$(document).on('click', '#bankBldg', (e) => {
    e.preventDefault();
    if (TownManager.lastBldg === "bank") return;
    TownManager.lastBldg = "bank";
    TownManager.bankOnce = false;
    $(".buildingName").removeClass("selected");
    if (!TownManager.unseenLeft()) {
        $("#townTab").removeClass("hasEvent");
    }
    $("#bankBldg").addClass("selected");
    $("#bankBldg").removeClass("hasEvent");
    showBankBldg();
});

$(document).on('click', '#smithBldg', (e) => {
    e.preventDefault();
    if (TownManager.lastBldg === "smith") return;
    TownManager.lastBldg = "smith";
    TownManager.smithOnce = false;
    $(".buildingName").removeClass("selected");
    if (!TownManager.unseenLeft()) $("#townTab").removeClass("hasEvent");
    $("#smithBldg").addClass("selected");
    $("#smithBldg").removeClass("hasEvent");
    showSmithBldg();
});

$(document).on('click', '#fortuneBldg', (e) => {
    e.preventDefault();
    if (TownManager.lastBldg === "fortune") return;
    TownManager.lastBldg = "fortune";
    TownManager.fortuneOnce = false;
    $(".buildingName").removeClass("selected");
    if (!TownManager.unseenLeft()) $("#townTab").removeClass("hasEvent");
    $("#fortuneBldg").addClass("selected");
    $("#fortuneBldg").removeClass("hasEvent");
    showFortuneBldg();
});

const $buildingRecipes = $("#buildingRecipes");
const $buildingMats = $("#buildingMats");

function buildScreen(type) {
    $buildingRecipes.empty();
    $buildingMats.empty();
    TownManager.lastType = type;
    if (!TownManager.paidCost(type)) {
        const d1 = $("<div/>").addClass("buyBuildingBP").attr("type",type).html(`Buy Blueprint<span class="buybp_cost">${ResourceManager.materialIcon("M001")} ${formatToUnits(getBuildingCost(type),2)}</span>`)
        $buildingRecipes.append(d1);
        return;
    }
    else {
        buildBuildMats(type);
    }
    const d4 = $("<div/>").addClass("bRecipes");
    const table = $('<div/>').addClass('brecipeTable');
    let alternate = false;
    let lastRow = null;
    recipeList.recipes.filter(r=>r.type===type).forEach(recipe => {
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

            const td4c = $('<div/>').addClass('recipeValueContainer tooltip').attr("data-tooltip", `No Gold Value`);
                const td4c1 = $("<div/>").addClass("recipeValueHeader recipeCardHeader").html(`<img src='images/resources/M001.png'>`);
                const td4c2 = $('<div/>').addClass('recipeValue').html(`---`);
            td4c.append(td4c1,td4c2);
        td4.append(td4a,td4b,td4c);

        const td5 = $('<div/>').addClass('recipeCountAndCraft');
            const td5b = $('<div/>').addClass(`recipeCraft rr${recipe.id}`).attr("id",recipe.id).html(`<i class="fas fa-hammer"></i> Craft`);
        td5.append(td5b);

        const td6 = $('<div/>').addClass('recipeClose').html(`<i class="fas fa-times"></i>`);
        const td7 = $('<div/>').addClass('recipeBackTabContainer');
            const td7a = $('<div/>').addClass('recipeBackTab backTab1 selected').html(`Details`);
        td7.append(td7a);

        const td8 = $('<div/>').addClass('recipeTabContainer recipeTabDetails');
            const td8a = $('<div/>').addClass('recipeDetailsContainer');
                const td8a1 = $('<div/>').addClass('recipeBackDescription').html(recipe.itemDescription());
                const td8a3 = $('<div/>').addClass('recipeTotalCrafted').html(`${recipe.craftCount} <span>${recipe.name}</span> crafted.`);
            td8a.append(td8a1,td8a3);
        td8.append(td8a);

        const recipeCardFront = $('<div/>').addClass('recipeCardFront').append(td1,td1a,td2,td3,td4,td5);
        const recipeCardBack = $('<div/>').addClass('recipeCardBack').append(td6,td7,td8).hide();
        const row = $('<div/>').addClass('recipeRow').attr("id","rr"+recipe.id).append(recipeCardFront,recipeCardBack);

        lastRow = row;
        if (alternate) row.addClass("recipeRowHighlight");
        alternate = !alternate;
        table.append(row);
    });
    if (lastRow !== null) lastRow.addClass("recipeRowLast");
    d4.append(table);
    $buildingRecipes.append(d4);
    const d5 = $("<div/>").addClass("buildingInstr");
        const d5a = $("<div/>").addClass("buildingInstrHead").html("Instruction");
        const d5b = $("<div/>").addClass("buildingInstrDesc").html("Construct the final recipe to unlock this building permanently!");
    d5.append(d5a,d5b);
    $buildingRecipes.append(d5);
    recipeCanCraft();
}

$(document).on('click', ".buyBuildingBP", (e) => {
    e.preventDefault();
    const type = $(e.currentTarget).attr("type");
    buyBuildingBP(type);
});

function buyBuildingBP(type) {
    const cost = getBuildingCost(type);
    if (ResourceManager.materialAvailable("M001") < cost) {
        Notifications.cantAffordBlueprint();
        return;
    }
    ResourceManager.deductMoney(cost);
    TownManager.setCost(type);
    showBuilding(type);
}

function getBuildingCost(type) {
    if (type === "bank") return miscLoadedValues["buildingCost"][0];
    if (type === "fuse") return miscLoadedValues["buildingCost"][1];
    if (type === "smith") return miscLoadedValues["buildingCost"][2];
    if (type === "fortune") return miscLoadedValues["buildingCost"][3];
}

function showBuilding(type) {
    if (type === "bank") showBankBldg();
    if (type === "fuse") showFuseBldg();
    if (type === "smith") showSmithBldg();
    if (type === "fortune") showFortuneBldg();
}

function buildBuildMats() {
    $buildingMats.empty();
    if (!TownManager.paidCost(TownManager.lastType)) return;
    const d1 = $("<div/>").addClass("buildingMatTable");
    recipeList.recipes.filter(r=>r.type===TownManager.lastType).forEach(recipe => {
        const d2 = $("<div/>").addClass("buildingMatDiv tooltip").attr("data-tooltip",recipe.name);
        const d3 = $("<div/>").addClass('buildingMatImage').html(recipe.itemPic());
        const d4 = $("<div/>").addClass("buildingMatAmt").html(Inventory.itemCount(recipe.id,0));
        d2.append(d3,d4);
        d1.append(d2);
    });
    $buildingMats.append(d1);
}

function unlockBank() {
    TownManager.bankUnlock = true;
    TownManager.bankCost = true;
    TownManager.lastBldg = "bank";
    TownManager.purgeSlots = true;
    $(".buildingName").removeClass("selected");
    $("#bankBldg").addClass("selected");
    refreshSideTown();
    showBankBldg();
}

function unlockFuse() {
    TownManager.fuseCost = true;
    TownManager.fuseUnlock = true;
    TownManager.lastBldg = "fuse";
    TownManager.purgeSlots = true;
    $(".buildingName").removeClass("selected");
    $("#fuseBldg").addClass("selected");
    refreshSideTown();
    showFuseBldg();
}

function unlockSmith() {
    TownManager.smithUnlock = true;
    TownManager.smithCost = true;
    TownManager.lastBldg = "smith";
    TownManager.purgeSlots = true;
    $(".buildingName").removeClass("selected");
    $("#smithBldg").addClass("selected");
    refreshSideTown();
    showSmithBldg();
}

function unlockFortune() {
    TownManager.fortuneCost = true;
    TownManager.fortuneUnlock = true;
    TownManager.lastBldg = "fortune";
    TownManager.purgeSlots;
    $(".buildingName").removeClass("selected");
    $("#fortuneBldg").addClass("selected");
    refreshSideTown();
    showFortuneBldg();
}