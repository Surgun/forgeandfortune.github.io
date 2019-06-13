"use strict";

const BuildingState = Object.freeze({hidden:-1,unseen:0,seen:1,built:2});

const $buildingList = $("#buildingList");
const $buildingHeader = $("#buildingHeader");
const $fuseBuilding = $("#fuseBuilding");
const $bankBuilding = $("#bankBuilding");
const $smithBuilding = $("#smithBuilding");
const $fortuneBuilding = $("#fortuneBuilding");

const TownManager = {
    lastBldg : null,
    lastType : null,
    bankStatus : BuildingState.hidden,
    fuseStatus : BuildingState.hidden,
    smithStatus : BuildingState.hidden,
    fortuneStatus : BuildingState.hidden,
    purgeSlots : false,
    createSave() {
        const save = {};
        save.bankStatus = this.bankStatus;
        save.fuseStatus = this.fuseStatus;
        save.smithStatus = this.smithStatus;
        save.fortuneStatus = this.fortuneStatus;
        return save;
    },
    loadSave(save) {
        if (save.bankStatus !== undefined) this.bankStatus = save.bankStatus;
        if (save.fuseStatus !== undefined) this.fuseStatus = save.fuseStatus;
        if (save.smithStatus !== undefined) this.smithStatus = save.smithStatus;
        if (save.fortuneStatus !== undefined) this.fortuneStatus = save.fortuneStatus;
    },
    unseenLeft() {
        const bldgs = [this.bankStatus,this.fuseStatus,this.smithStatus,this.fortuneStatus]
        return bldgs.includes(BuildingState.unseen);
    },
    buildingPerk(type) {
        if (type === "bank") {
            this.bankStatus = BuildingState.unseen;
            recipeList.idToItem("R99110").owned = true;
        }
        if (type === "fuse") {
            this.fuseStatus = BuildingState.unseen;
            recipeList.idToItem("R99210").owned = true;
        }
        if (type === "smith") {
            this.smithStatus = BuildingState.unseen;
            recipeList.idToItem("R99310").owned = true;
        }
        if (type === "fortune") {
            this.fortuneStatus = BuildingState.unseen;
            recipeList.idToItem("R99510").owned = true;
        }
        refreshSideTown();
    }
}

const $emptyTown = $("#emptyTown");

function refreshSideTown() {
    $buildingList.empty().hide();
    //$buildBuilding.hide();
    if (TownManager.unseenLeft()) $("#townTab").addClass("hasEvent");
    else $("#townTab").removeClass("hasEvent");
    if (TownManager.bankStatus === BuildingState.hidden) return;
    $emptyTown.hide();
    const d1 = $("<div/>").addClass("buildingName").attr("id","bankBldg").html(`<div><i class="fas fa-university"></i> Bank</div>`);
    if (TownManager.lastBldg === "bank") d1.addClass("selected");
    if (TownManager.bankOnce) d1.addClass("hasEvent");
    $buildingList.show().append(d1);
    if (TownManager.fuseStatus === BuildingState.hidden) return;
    const d2 = $("<div/>").addClass("buildingName").attr("id","fusionBldg").html(`<div><i class="fas fa-cauldron"></i> Cauldron</div>`);
    if (TownManager.lastBldg === "fuse") d2.addClass("selected");
    if (TownManager.fuseOnce) d2.addClass("hasEvent");
    $buildingList.append(d2);
    if (TownManager.smithStatus === BuildingState.hidden) return;
    const d3 = $("<div/>").addClass("buildingName").attr("id","smithBldg").html(`<div><i class="fas fa-hammer-war"></i> Forge</div>`);
    if (TownManager.lastBldg === "smith") d3.addClass("selected");
    if (TownManager.smithOnce) d3.addClass("hasEvent");
    $buildingList.append(d3);
    if (TownManager.fortuneStatus === BuildingState.hidden) return;
    const d4 = $("<div/>").addClass("buildingName").attr("id","fortuneBldg").html(`<div><i class="fas fa-hat-wizard"></i> Fortune</div>`);
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
        if (TownManager.fuseStatus === BuildingState.built) db.html("<img src='images/townImages/fuseBuilding/fusion_building.png'>");
        const dc = $("<div/>").addClass("buildingInfoName").html("<h2>Fusion Cauldron</h2>");
        const dd = $("<div/>").addClass("buildingInfoDesc").html("Fuse three of the same item into a rarity higher of the same item.");
        if (!TownManager.fuseStatus === BuildingState.built) d.addClass("buildInProgress");
        d.append(da,db,dc,dd);
    $buildingHeader.append(d);
    if (TownManager.fuseStatus === BuildingState.built) initiateFuseBldg();
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
        if (TownManager.bankStatus === BuildingState.built) db.html("<img src='images/townImages/bankBuilding/bank_building.png'>")
        const dc = $("<div/>").addClass("buildingInfoName").html("<h2>The Bank</h2>");
        const dd = $("<div/>").addClass("buildingInfoDesc").html("Store important items at the bank.");
        if (!TownManager.bankStatus === BuildingState.built) d.addClass("buildInProgress");
        d.append(da,db,dc,dd);
    $buildingHeader.append(d);
    if (TownManager.bankStatus === BuildingState.built) initiateBankBldg();
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
        if (TownManager.smithStatus === BuildingState.built) db.html("<img src='images/townImages/smithBuilding/smith_building.png'>");
        const dc = $("<div/>").addClass("buildingInfoName").html("<h2>The Forge</h2>");
        const dd = $("<div/>").addClass("buildingInfoDesc").html("Upgrade your gear at the forge.");
        if (!TownManager.smithStatus === BuildingState.built) d.addClass("buildInProgress");
        d.append(da,db,dc,dd);
    $buildingHeader.append(d);
    if (TownManager.smithStatus === BuildingState.built) initiateSmithBldg();    
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
        if (TownManager.fortuneStatus === BuildingState.built) db.html("<img src='images/townImages/fortuneBuilding/fortune_building.png'>");
        const dc = $("<div/>").addClass("buildingInfoName").html("<h2>Fortune Teller</h2>");
        const dd = $("<div/>").addClass("buildingInfoDesc").html("Find which crafts are lucky this week!");
        if (TownManager.fortuneStatus === BuildingState.built) d.addClass("buildInProgress");
        d.append(da,db,dc,dd);
    $buildingHeader.append(d);
    if (TownManager.fortuneStatus === BuildingState.built) initiateFortuneBldg();
    else {
        $buildBuilding.show();
        buildScreen("fortune");
    }
}

$(document).on('click', "#fusionBldg", (e) => {
    e.preventDefault();
    if (TownManager.lastBldg === "fusion") return;
    TownManager.lastBldg = "fusion";
    if (TownManager.fuseStatus === BuildingState.unseen) TownManager.fuseStatus = BuildingState.seen;
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
    if (TownManager.bankStatus === BuildingState.unseen) TownManager.bankStatus = BuildingState.seen;
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
    if (TownManager.smithStatus === BuildingState.unseen) TownManager.smithStatus = BuildingState.seen;
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
    if (TownManager.fortuneStatus === BuildingState.unseen) TownManager.fortuneStatus = BuildingState.seen;
    $(".buildingName").removeClass("selected");
    if (!TownManager.unseenLeft()) $("#townTab").removeClass("hasEvent");
    $("#fortuneBldg").addClass("selected");
    $("#fortuneBldg").removeClass("hasEvent");
    showFortuneBldg();
});

const $buildingRecipes = $("#buildingRecipes");

function buildScreen(type) {
    $buildingRecipes.empty();
    TownManager.lastType = type;
    //const d4 = $("<div/>").addClass("bRecipes");
    //const table = $('<div/>').addClass('brecipeTable');
    recipeList.recipes.filter(r=>r.type===type).forEach(recipe => {
        const recipeCardInfo = $('<div/>').addClass('recipeCardInfo').append(recipeCardFront(recipe),recipeCardBack(recipe))
        //const row = $('<div/>').addClass('recipeCardContainerBuilding').attr("id","rr"+recipe.id).append(recipeCardInfo);
        //table.append(row);
        const recipeCardContainer = $('<div/>').addClass('recipeCardContainer buildingCard').data("recipeID",recipe.id).attr("id","rr"+recipe.id).append(recipeCardInfo);
        $buildingRecipes.append(recipeCardContainer);
    });
    //$buildingRecipes.append(row);

    const d5 = $("<div/>").addClass("buildingInstr");
        $("<div/>").addClass("buildingInstrHead").html("Instruction").appendTo(d5);
        const d5b = $("<div/>").addClass("buildingInstrDesc").html("Construct the building recipe to unlock this building permanently!").appendTo(d5);
    $buildingRecipes.append(d5);
    recipeCanCraft();
}

$(document).on('click', ".buyBuildingBP", (e) => {
    e.preventDefault();
    const type = $(e.currentTarget).attr("type");
    buyBuildingBP(type);
});

function unlockBank() {
    TownManager.bankStatus = BuildingState.built;
    TownManager.lastBldg = "bank";
    TownManager.purgeSlots = true;
    $(".buildingName").removeClass("selected");
    $("#bankBldg").addClass("selected");
    refreshSideTown();
    showBankBldg();
}

function unlockFuse() {
    TownManager.fuseStatus = BuildingState.built;
    TownManager.lastBldg = "fuse";
    TownManager.purgeSlots = true;
    $(".buildingName").removeClass("selected");
    $("#fuseBldg").addClass("selected");
    refreshSideTown();
    showFuseBldg();
}

function unlockSmith() {
    TownManager.smithStatus = BuildingState.built;
    TownManager.lastBldg = "smith";
    TownManager.purgeSlots = true;
    $(".buildingName").removeClass("selected");
    $("#smithBldg").addClass("selected");
    refreshSideTown();
    showSmithBldg();
}

function unlockFortune() {
    TownManager.fortuneStatus = BuildingState.built;
    TownManager.lastBldg = "fortune";
    TownManager.purgeSlots = true;
    $(".buildingName").removeClass("selected");
    $("#fortuneBldg").addClass("selected");
    refreshSideTown();
    showFortuneBldg();
}