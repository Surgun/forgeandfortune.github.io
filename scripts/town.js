"use strict";

const $buildingList = $("#buildingList");
const $buildingHeader = $("#buildingHeader");
const $fuseBuilding = $("#fuseBuilding");
const $bankBuilding = $("#bankBuilding");
const $smithBuilding = $("#smithBuilding");
const $fortuneBuilding = $("#fortuneBuilding");

const TownManager = {
    lastBldg : null,
}

function refreshSideTown() {
    $buildingList.empty();
    const d1 = $("<div/>").addClass("buildingName").attr("id","bankBldg").html(`<i class="fas fa-university"></i> Bank`);
    const d2 = $("<div/>").addClass("buildingName").attr("id","fusionBldg").html(`<i class="fas fa-cauldron"></i> Fusion`);
    const d3 = $("<div/>").addClass("buildingName").attr("id","smithBldg").html(`<i class="fas fa-hammer-war"></i> Blacksmith`);
    const d4 = $("<div/>").addClass("buildingName").attr("id","fortuneBldg").html(`<i class="fas fa-hat-wizard"></i> Fortune`);
    $buildingList.append(d1,d2,d3,d4);
}

function showFuseBldg() {
    $(".buildingTab").removeClass("bldgTabActive").hide();
    $fuseBuilding.addClass("bldgTabActive").show();
    $buildingHeader.empty();
    const d = $("<div/>").addClass("buildingInfo buildingFusion");
        const da = $("<div/>").addClass("buildingInfoBackground");
        const db = $("<div/>").addClass("buildingInfoImage").html("<img src='images/townImages/fuseBuilding/fusion_building.png'>");
        const dc = $("<div/>").addClass("buildingInfoName").html("<h2>Fusion Building</h2>");
        const dd = $("<div/>").addClass("buildingInfoDesc").html("Fuse three of the same item into a rarity higher of the same item.");
        d.append(da,db,dc,dd);
    $buildingHeader.append(d);
    initiateFuseBldg();
}

function showBankBldg() {
    $(".buildingTab").removeClass("bldgTabActive").hide();
    $bankBuilding.addClass("bldgTabActive").show();
    $buildingHeader.empty();
    const d = $("<div/>").addClass("buildingInfo buildingBank");
        const da = $("<div/>").addClass("buildingInfoBackground");
        const db = $("<div/>").addClass("buildingInfoImage").html("<img src='images/townImages/bankBuilding/bank_building.png'>");
        const dc = $("<div/>").addClass("buildingInfoName").html("<h2>Bank Building</h2>");
        const dd = $("<div/>").addClass("buildingInfoDesc").html("Store important items at the bank.");
        d.append(da,db,dc,dd);
    $buildingHeader.append(d);
    initiateBankBldg();    
}

function showSmithBldg() {
    $(".buildingTab").removeClass("bldgTabActive").hide();
    $smithBuilding.addClass("bldgTabActive").show();
    $buildingHeader.empty();
    const d = $("<div/>").addClass("buildingInfo buildingSmith");
        const da = $("<div/>").addClass("buildingInfoBackground");
        const db = $("<div/>").addClass("buildingInfoImage").html("<img src='images/townImages/smithBuilding/smith_building.png'>");
        const dc = $("<div/>").addClass("buildingInfoName").html("<h2>Blacksmith Building</h2>");
        const dd = $("<div/>").addClass("buildingInfoDesc").html("Upgrade your weapons at the blacksmith.");
        d.append(da,db,dc,dd);
    $buildingHeader.append(d);
    initiateSmithBldg();    
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
    initiateFortuneBldg();   
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