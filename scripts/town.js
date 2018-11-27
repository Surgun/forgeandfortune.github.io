"use strict";

const $buildingList = $("#buildingList");
const $buildingHeader = $("#buildingHeader");
const $fuseBuilding = $("#fuseBuilding");
const $bankBuilding = $("#bankBuilding");
const $smithBuilding = $("#smithBuilding");

const TownManager = {
    lastBldg : null,
}

function refreshSideTown() {
    $buildingList.empty();
    const d1 = $("<div/>").addClass("buildingName").attr("id","bankBldg").html("Bank");
    const d2 = $("<div/>").addClass("buildingName").attr("id","fusionBldg").html("Fusion");
    const d3 = $("<div/>").addClass("buildingName").attr("id","smithBldg").html("Blacksmith");
    $buildingList.append(d1,d2,d3);
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
    $(".buildingTab").removClass("bldgTabActive").hide();
    $bankBuildinge.addClass("bldgTabActive").show();
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

$(document).on('click', "#fusionBldg", (e) => {
    e.preventDefault();
    if (TownManager.lastBldg === "fusion") return;
    TownManager.lastBldg = "fusion";
    showFuseBldg();
});

$(document).on('click', '#bankBldg', (e) => {
    e.preventDefault();
    if (TownManager.lastBldg === "bank") return;
    TownManager.lastBldg = "bank";
    showBankBldg();
});

$(document).on('click', '#smithBldg', (e) => {
    e.preventDefault();
    if (TownManager.lastBldg === "smith") return;
    TownManager.lastBldg = "smith";
    showSmithBldg();
});