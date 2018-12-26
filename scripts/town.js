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
    bankUnlock : false,
    bankCost : false,
    fuseUnlock : false,
    fuseCost : false,
    smithUnlock : false,
    smithCost : false,
    fortuneUnlock : false,
    fortuneCost : false,
    createSave() {
        const save = {};
        save.bankUnlock = this.bankUnlock;
        save.bankCost = this.bankCost;
        save.fuseUnlock = this.fuseUnlock;
        save.fuseCost = this.fuseCost;
        save.smithUnlock = this.smithUnlock;
        save.smithCost = this.smithCost;
        save.fortuneUnlock = this.fortuneUnlock;
        save.fortuneCost = this.fortuneCost;
        return save;
    },
    loadSave(save) {
        this.bankUnlock = save.bankUnlock;
        this.fuseUnlock = save.fuseUnlock;
        this.smithUnlock = save.smithUnlock;
        this.fortuneUnlock = save.fortuneUnlock;
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
    $fuseBuilding.addClass("bldgTabActive").show();
    $buildingHeader.empty();
    const d = $("<div/>").addClass("buildingInfo buildingFusion");
        const da = $("<div/>").addClass("buildingInfoBackground");
        const db = $("<div/>").addClass("buildingInfoImage").html("<img src='images/townImages/fuseBuilding/fusion_building.png'>");
        const dc = $("<div/>").addClass("buildingInfoName").html("<h2>Fusion Cauldron</h2>");
        const dd = $("<div/>").addClass("buildingInfoDesc").html("Fuse three of the same item into a rarity higher of the same item.");
        d.append(da,db,dc,dd);
    $buildingHeader.append(d);
    if (TownManager.fuseUnlock) initiateFuseBldg();
    else buildScreen("fuse");
}

function showBankBldg() {
    $(".buildingTab").removeClass("bldgTabActive").hide();
    $bankBuilding.addClass("bldgTabActive");
    $buildingHeader.empty();
    const d = $("<div/>").addClass("buildingInfo buildingBank");
        const da = $("<div/>").addClass("buildingInfoBackground");
        const db = $("<div/>").addClass("buildingInfoImage").html("<img src='images/townImages/bankBuilding/bank_building.png'>");
        const dc = $("<div/>").addClass("buildingInfoName").html("<h2>The Bank</h2>");
        const dd = $("<div/>").addClass("buildingInfoDesc").html("Store important items at the bank.");
        d.append(da,db,dc,dd);
    $buildingHeader.append(d);
    if (TownManager.bankUnlock) initiateBankBldg();
    else buildScreen("bank");
}

function showSmithBldg() {
    $(".buildingTab").removeClass("bldgTabActive").hide();
    $smithBuilding.addClass("bldgTabActive").show();
    $buildingHeader.empty();
    const d = $("<div/>").addClass("buildingInfo buildingSmith");
        const da = $("<div/>").addClass("buildingInfoBackground");
        const db = $("<div/>").addClass("buildingInfoImage").html("<img src='images/townImages/smithBuilding/smith_building.png'>");
        const dc = $("<div/>").addClass("buildingInfoName").html("<h2>The Forge</h2>");
        const dd = $("<div/>").addClass("buildingInfoDesc").html("Upgrade your weapons at the forge.");
        d.append(da,db,dc,dd);
    $buildingHeader.append(d);
    if (TownManager.smithUnlock) initiateSmithBldg();    
    else buildScreen("smith");
}

function showFortuneBldg() {
    $(".buildingTab").removeClass("bldgTabActive").hide();
    $fortuneBuilding.addClass("bldgTabActive").show();
    $buildingHeader.empty();
    const d = $("<div/>").addClass("buildingInfo buildingFortune");
        const da = $("<div/>").addClass("buildingInfoBackground");
        const db = $("<div/>").addClass("buildingInfoImage").html("<img src='images/townImages/fortuneBuilding/fortune_building.png'>");
        const dc = $("<div/>").addClass("buildingInfoName").html("<h2>Fortune Teller</h2>");
        const dd = $("<div/>").addClass("buildingInfoDesc").html("Find which crafts are lucky this week!");
        d.append(da,db,dc,dd);
    $buildingHeader.append(d);
    if (TownManager.fortuneUnlock) initiateFortuneBldg();
    else buildScreen("fortune");
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
    const d5 = $("<div/>").addClass("buildingInstr").html("Construct the bank to unlock permanently!");
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
        Notifications.workerGoldReq();
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
        const d2 = $("<div/>").addClass("buildingMatDiv");
        const d3 = $("<div/>").addClass("buildingMatName").html(recipe.name);
        const d4 = $("<div/>").addClass('buildingMatImage').html(recipe.itemPic());
        const d5 = $("<div/>").addClass("buildingMatAmt").html(Inventory.itemCount(recipe.id,0));
        d2.append(d3,d4,d5);
        d1.append(d2);
    });
    $buildingMats.append(d1);
}