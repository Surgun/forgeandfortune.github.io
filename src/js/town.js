"use strict";

const BuildingState = Object.freeze({hidden:-1,unseen:0,seen:1,built:2});

const $buildingList = $("#buildingList");
const $buildingHeader = $("#buildingHeader");
const $buildingRecipes = $("#buildingRecipes");

class Building {
    constructor(props) {
        Object.assign(this, props);
        this.status = BuildingState.hidden;
    }
    createSave() {
        const save = {};
        save.status = this.status;
        save.id = this.id;
        return save;
    }
    loadSave(save) {
        this.status = save.status;
    }
    getStatus() {
        return this.status;
    }
    unlocked() {
        return this.status > 0;
    }
    setStatus(status) {
        this.status = status;
    }
}

const TownManager = {
    lastBldg : null,
    lastType : null,
    buildings : [],
    purgeSlots : false,
    addBuilding(building) {
        this.buildings.push(building);
    },
    createSave() {
        const save = {};
        save.buildings = [];
        this.buildings.forEach(b=>{
            save.buildings.push(b.createSave());
        })
        return save;
    },
    loadSave(save) {
        if (save.buildings === undefined) return;
        save.buildings.forEach(bsave=> {
            const building = this.idToBuilding(bsave.id);
            building.loadSave(bsave);
        });
    },
    idToBuilding(id) {
        return this.buildings.find(b=>b.id === id);
    },
    typeToBuilding(type) {
        return this.buildings.find(b=>b.shorthand === type);
    },
    recipeIDToBuilding(recipeID) {
        return this.buildings.find(b=>b.recipeID === recipeID);
    },
    buildingStatus() {
        return this.buildings.map(b=>b.getStatus());
    },
    buildingRecipes() {
        return this.buildings.map(b=>b.recipeID);
    },
    unseenLeft() {
        return this.buildingStatus().includes(BuildingState.unseen);
    },
    buildingPerk(type) {
        const building = this.typeToBuilding(type);
        building.setStatus(BuildingState.unseen);
        recipeList.idToItem(building.recipeID).owned = true;
        refreshSideTown();
    },
    buildingsOwned() {
        return this.buildings.some(building => building.getStatus() !== BuildingState.hidden);
    },
    status(type) {
        const building = this.typeToBuilding(type);
        return building.getStatus();
    },
    setStatus(type,value) {
        const building = this.typeToBuilding(type);
        building.setStatus(value);
    },
    unlockBldg(recipeID) {
        const building = this.recipeIDToBuilding(recipeID);
        const type = building.shorthand;
        building.setStatus(BuildingState.built);
        this.lastBldg = type;
        this.purgeSlots = true;
        $(".buildingName").removeClass("selected");
        $(`#${building.shorthand}Bldg`).addClass("selected");
        refreshSideTown();
        showBldg(type);
    }
}

const $emptyTown = $("#emptyTown");
const $townTab = $("#townTab");
const $townTabLink = $("#townTabLink");

function refreshSideTown() {
    if (TownManager.unseenLeft()) $townTab.addClass("hasEvent");
    else $townTab.removeClass("hasEvent");
    if (!TownManager.buildingsOwned()) {
        $emptyTown.show();
        $buildingList.hide();
        $townTabLink.hide();
        return;
    }
    $townTabLink.show();
    $emptyTown.hide();
    $buildingList.show().empty();
    TownManager.buildings.forEach(building => {
        if (building.getStatus() >= 0) {
            const d = $("<div/>").addClass("buildingName").attr("id",`${building.shorthand}Bldg`).data("bldgType",building.shorthand).html(building.name).appendTo($buildingList);
            if (TownManager.lastBldg === building.shorthand) d.addClass("selected");
            if (building.getStatus() === BuildingState.unseen) d.addClass("hasEvent");
        }
    });
}

const $buildBuilding = $("#buildBuilding");

function showBldg(type) {
    const building = TownManager.typeToBuilding(type);
    $(".buildingTab").removeClass("bldgTabActive").hide();
    $(`#${type}Building`).addClass("bldgTabActive");
    $buildingHeader.empty();
    $buildBuilding.hide();
    const d = $("<div/>").addClass(`buildingInfo building${building.shorthand}`);
    const da = $("<div/>").addClass("buildingInfoBackground");
    const db = $("<div/>").addClass("buildingInfoImage").html("<img src='/assets/images/recipes/noitem.png'>")
    if (building.getStatus() === BuildingState.built) db.html(`<img src='/assets/images/townImages/${building.shorthand}Building/${building.shorthand}_building.png'>`);
    const dc = $("<div/>").addClass("buildingInfoName").html(`<h2>${building.name}</h2>`);
    const dd = $("<div/>").addClass("buildingInfoDesc").html(building.description);
    if (building.getStatus() !== BuildingState.built) d.addClass("buildInProgress");
    d.append(da,db,dc,dd);
    $buildingHeader.append(d);
    const upper = building.shorthand.replace(/^\w/, c => c.toUpperCase());
    const buildingText = `initiate${upper}Bldg`;
    if (building.getStatus() === BuildingState.built) window[buildingText]();
    else {
        $buildBuilding.show();
        buildScreen(building.shorthand);
    }
}

$(document).on('click', ".buildingName", (e) => {
    e.preventDefault();
    const type = $(e.currentTarget).data("bldgType");
    if (TownManager.lastBldg === type) return;
    TownManager.lastBldg = type;
    const building = TownManager.typeToBuilding(type);
    if (building.getStatus() === BuildingState.unseen) building.setStatus(BuildingState.seen);
    $(".buildingName").removeClass("selected");
    if (!TownManager.unseenLeft()) $("#townTab").removeClass("hasEvent");
    $(e.currentTarget).addClass("selected");
    $(e.currentTarget).removeClass("hasEvent");
    showBldg(type);
});


function buildScreen(type) {
    $buildingRecipes.empty();
    TownManager.lastType = type;
    recipeList.recipes.filter(r=>r.type===type).forEach(recipe => {
        const recipeCardInfo = $('<div/>').addClass('recipeCardInfo').append(recipeCardFront(recipe),recipeCardBack(recipe))
        const recipeCardContainer = $('<div/>').addClass('recipeCardContainer buildingCard').data("recipeID",recipe.id).attr("id","rr"+recipe.id).append(recipeCardInfo);
        $buildingRecipes.append(recipeCardContainer);
    });
    const d5 = $("<div/>").addClass("buildingInstr");
        $("<div/>").addClass("buildingInstrHead").html("Instruction").appendTo(d5);
        $("<div/>").addClass("buildingInstrDesc").html("Construct the building recipe to unlock this building permanently!").appendTo(d5);
    $buildingRecipes.append(d5);
}