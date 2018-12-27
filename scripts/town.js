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
    bankUnlock : false,
    bankCost : false,
    fuseSee : false,
    fuseUnlock : false,
    fuseCost : false,
    smithSee : false,
    smithUnlock : false,
    smithCost : false,
    fortuneSee : false,
    fortuneUnlock : false,
    fortuneCost : false,
    createSave() {
        const save = {};
        save.bankSee = this.bankSee;
        save.bankUnlock = this.bankUnlock;
        save.bankCost = this.bankCost;
        save.fuseSee = this.fuseSee;
        save.fuseUnlock = this.fuseUnlock;
        save.fuseCost = this.fuseCost;
        save.smithSee = this.smithSee;
        save.smithUnlock = this.smithUnlock;
        save.smithCost = this.smithCost;
        save.fortuneSee = this.fortuneSee;
        save.fortuneUnlock = this.fortuneUnlock;
        save.fortuneCost = this.fortuneCost;
        return save;
    },
    loadSave(save) {
        this.bankSee = save.bankSee;
        this.bankUnlock = save.bankUnlock;
        this.bankCost = save.bankCost;
        this.fuseSee = save.fuseSee;
        this.fuseUnlock = save.fuseUnlock;
        this.fuseCost = save.fuseCost;
        this.smithSee = save.smithSee;
        this.smithUnlock = save.smithUnlock;
        this.smithCost = save.smithCost;
        this.fortuneSee = save.fortuneSee;
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
    }
}

function refreshSideTown() {
    $buildingList.empty();
    const d1 = $("<div/>").addClass("buildingName").attr("id","bankBldg").html(`<i class="fas fa-university"></i> Bank`);
    $buildingList.append(d1);
    if (TownManager.bankUnlock) {
        const d2 = $("<div/>").addClass("buildingName").attr("id","fusionBldg").html(`<i class="fas fa-cauldron"></i> Cauldron`);
        $buildingList.append(d2);
    }
    if (TownManager.fuseUnlock) {
        const d3 = $("<div/>").addClass("buildingName").attr("id","smithBldg").html(`<i class="fas fa-hammer-war"></i> Forge`);
        $buildingList.append(d3);
    }
    if (TownManager.smithUnlock) {
        const d4 = $("<div/>").addClass("buildingName").attr("id","fortuneBldg").html(`<i class="fas fa-hat-wizard"></i> Fortune`);
        $buildingList.append(d4);
    }
}

function showFuseBldg() {
    $(".buildingTab").removeClass("bldgTabActive").hide();
    $fuseBuilding.addClass("bldgTabActive");
    $buildingHeader.empty();
    $buildBuilding.hide();
    const d = $("<div/>").addClass("buildingInfo buildingFusion");
        const da = $("<div/>").addClass("buildingInfoBackground");
        const db = $("<div/>").addClass("buildingInfoImage").html("<img src='images/townImages/fuseBuilding/fusion_building.png'>");
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
        const db = $("<div/>").addClass("buildingInfoImage").html("<img src='images/townImages/bankBuilding/bank_building.png'>");
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
        const db = $("<div/>").addClass("buildingInfoImage").html("<img src='images/townImages/smithBuilding/smith_building.png'>");
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
        const db = $("<div/>").addClass("buildingInfoImage").html("<img src='images/townImages/fortuneBuilding/fortune_building.png'>");
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
    $(".buildingName").removeClass("selected");
    $("#fusionBldg").addClass("selected");
    showFuseBldg();
});

$(document).on('click', '#bankBldg', (e) => {
    e.preventDefault();
    if (TownManager.lastBldg === "bank") return;
    TownManager.lastBldg = "bank";
    $(".buildingName").removeClass("selected");
    $("#bankBldg").addClass("selected");
    showBankBldg();
});

$(document).on('click', '#smithBldg', (e) => {
    e.preventDefault();
    if (TownManager.lastBldg === "smith") return;
    TownManager.lastBldg = "smith";
    $(".buildingName").removeClass("selected");
    $("#smithBldg").addClass("selected");
    showSmithBldg();
});

$(document).on('click', '#fortuneBldg', (e) => {
    e.preventDefault();
    if (TownManager.lastBldg === "fortune") return;
    TownManager.lastBldg = "fortune";
    $(".buildingName").removeClass("selected");
    $("#fortuneBldg").addClass("selected");
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
    const htd1 = $('<div/>').addClass('brecipeHeadName').html("NAME");
    const htd2 = $('<div/>').addClass('brecipeHeadLvl').html("LVL");
    const htd3 = $('<div/>').addClass('brecipeHeadRes').html("RESOURCES");
    const htd4 = $('<div/>').addClass('brecipeHeadCost').html("MATS");
    const htd5 = $('<div/>').addClass('brecipeHeadTime').html("TIME");
    const hrow = $('<div/>').addClass('brecipeHeader').append(htd1,htd2,htd3,htd4,htd5);
    table.append(hrow);
    let alternate = false;
    let lastRow = null;
    recipeList.recipes.filter(r=>r.type===type).forEach(recipe => {
        const td1 = $('<div/>').addClass('recipeName').attr("id",recipe.id).append(recipe.itemPicName());
        const td2 = $('<div/>').addClass('recipeLvl').html(recipe.lvl);
        const td3 = $('<div/>').addClass('recipeDescription tooltip').attr("data-tooltip",recipe.itemDescription()).html("<i class='fas fa-info-circle'></i>");
        const td4 = $('<div/>').addClass('reciperesdiv').html(recipe.visualizeRes());
        const td5 = $('<div/>').addClass('recipematdiv').html(recipe.visualizeMat());
        const td6 = $('<div/>').addClass('recipeTime').html(msToTime(recipe.craftTime));
        const row = $('<div/>').addClass('recipeRow').attr("id","rr"+recipe.id).append(td1,td2,td3,td4,td5,td6);
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
        const d5b = $("<div/>").addClass("buildingInstrDesc").html("Construct the bank to unlock permanently!");
    d5.append(d5a,d5b);
    $buildingRecipes.append(d5);
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
    actionSlotManager.removeBldgSlots();
    $(".buildingName").removeClass("selected");
    $("#bankBldg").addClass("selected");
    refreshSideTown();
    showBankBldg();
}

function unlockFuse() {
    TownManager.fuseCost = true;
    TownManager.fuseUnlock = true;
    TownManager.lastBldg = "fuse";
    actionSlotManager.removeBldgSlots();
    $(".buildingName").removeClass("selected");
    $("#fuseBldg").addClass("selected");
    refreshSideTown();
    showFuseBldg();
}

function unlockSmith() {
    TownManager.smithUnlock = true;
    TownManager.smithCost = true;
    TownManager.lastBldg = "smith";
    actionSlotManager.removeBldgSlots();
    $(".buildingName").removeClass("selected");
    $("#smithBldg").addClass("selected");
    refreshSideTown();
    showSmithBldg();
}

function unlockFortune() {
    TownManager.fortuneCost = true;
    TownManager.fortuneUnlock = true;
    TownManager.lastBldg = "fortune";
    actionSlotManager.removeBldgSlots();
    $(".buildingName").removeClass("selected");
    $("#fortuneBldg").addClass("selected");
    refreshSideTown();
    showFortuneBldg();
}