"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var BuildingState = Object.freeze({
  hidden: -1,
  unseen: 0,
  seen: 1,
  built: 2
});
var $buildingList = $("#buildingList");
var $buildingHeader = $("#buildingHeader");
var $buildingRecipes = $("#buildingRecipes");

var Building =
/*#__PURE__*/
function () {
  function Building(props) {
    _classCallCheck(this, Building);

    Object.assign(this, props);
    this.status = BuildingState.hidden;
  }

  _createClass(Building, [{
    key: "createSave",
    value: function createSave() {
      var save = {};
      save.status = this.status;
      save.id = this.id;
      return save;
    }
  }, {
    key: "loadSave",
    value: function loadSave(save) {
      this.status = save.status;
    }
  }, {
    key: "getStatus",
    value: function getStatus() {
      return this.status;
    }
  }, {
    key: "unlocked",
    value: function unlocked() {
      return this.status > 0;
    }
  }, {
    key: "setStatus",
    value: function setStatus(status) {
      this.status = status;
    }
  }]);

  return Building;
}();

var TownManager = {
  lastBldg: null,
  lastType: null,
  buildings: [],
  purgeSlots: false,
  addBuilding: function addBuilding(building) {
    this.buildings.push(building);
  },
  createSave: function createSave() {
    var save = {};
    save.buildings = [];
    this.buildings.forEach(function (b) {
      save.buildings.push(b.createSave());
    });
    return save;
  },
  loadSave: function loadSave(save) {
    var _this = this;

    if (save.buildings === undefined) return;
    save.buildings.forEach(function (bsave) {
      var building = _this.idToBuilding(bsave.id);

      building.loadSave(bsave);
    });
  },
  idToBuilding: function idToBuilding(id) {
    return this.buildings.find(function (b) {
      return b.id === id;
    });
  },
  typeToBuilding: function typeToBuilding(type) {
    return this.buildings.find(function (b) {
      return b.shorthand === type;
    });
  },
  recipeIDToBuilding: function recipeIDToBuilding(recipeID) {
    return this.buildings.find(function (b) {
      return b.recipeID === recipeID;
    });
  },
  buildingStatus: function buildingStatus() {
    return this.buildings.map(function (b) {
      return b.getStatus();
    });
  },
  buildingRecipes: function buildingRecipes() {
    return this.buildings.map(function (b) {
      return b.recipeID;
    });
  },
  unseenLeft: function unseenLeft() {
    return this.buildingStatus().includes(BuildingState.unseen);
  },
  buildingPerk: function buildingPerk(type) {
    var building = this.typeToBuilding(type);
    building.setStatus(BuildingState.unseen);
    recipeList.idToItem(building.recipeID).owned = true;
    refreshSideTown();
  },
  buildingsOwned: function buildingsOwned() {
    return this.buildings.some(function (building) {
      return building.getStatus() !== BuildingState.hidden;
    });
  },
  status: function status(type) {
    var building = this.typeToBuilding(type);
    return building.getStatus();
  },
  setStatus: function setStatus(type, value) {
    var building = this.typeToBuilding(type);
    building.setStatus(value);
  },
  unlockBldg: function unlockBldg(recipeID) {
    var building = this.recipeIDToBuilding(recipeID);
    var type = building.shorthand;
    building.setStatus(BuildingState.built);
    this.lastBldg = type;
    this.purgeSlots = true;
    $(".buildingName").removeClass("selected");
    $("#".concat(building.shorthand, "Bldg")).addClass("selected");
    refreshSideTown();
    showBldg(type);
  }
};
var $emptyTown = $("#emptyTown");
var $townTab = $("#townTab");
var $townTabLink = $("#townTabLink");

function refreshSideTown() {
  if (TownManager.unseenLeft()) $townTab.addClass("hasEvent");else $townTab.removeClass("hasEvent");

  if (!TownManager.buildingsOwned()) {
    $emptyTown.show();
    $buildingList.hide();
    $townTabLink.hide();
    return;
  }

  $townTabLink.show();
  $emptyTown.hide();
  $buildingList.show().empty();
  TownManager.buildings.forEach(function (building) {
    if (building.getStatus() >= 0) {
      var d = $("<div/>").addClass("buildingName").attr("id", "".concat(building.shorthand, "Bldg")).data("bldgType", building.shorthand).html(building.name).appendTo($buildingList);
      if (TownManager.lastBldg === building.shorthand) d.addClass("selected");
      if (building.getStatus() === BuildingState.unseen) d.addClass("hasEvent");
    }
  });
}

var $buildBuilding = $("#buildBuilding");

function showBldg(type) {
  var building = TownManager.typeToBuilding(type);
  $(".buildingTab").removeClass("bldgTabActive").hide();
  $("#".concat(type, "Building")).addClass("bldgTabActive");
  $buildingHeader.empty();
  $buildBuilding.hide();
  var d = $("<div/>").addClass("buildingInfo building".concat(building.shorthand));
  var da = $("<div/>").addClass("buildingInfoBackground");
  var db = $("<div/>").addClass("buildingInfoImage").html("<img src='/assets/images/recipes/noitem.png'>");
  if (building.getStatus() === BuildingState.built) db.html("<img src='/assets/images/townImages/".concat(building.shorthand, "Building/").concat(building.shorthand, "_building.png'>"));
  var dc = $("<div/>").addClass("buildingInfoName").html("<h2>".concat(building.name, "</h2>"));
  var dd = $("<div/>").addClass("buildingInfoDesc").html(building.description);
  if (building.getStatus() !== BuildingState.built) d.addClass("buildInProgress");
  d.append(da, db, dc, dd);
  $buildingHeader.append(d);
  var upper = building.shorthand.replace(/^\w/, function (c) {
    return c.toUpperCase();
  });
  var buildingText = "initiate".concat(upper, "Bldg");
  if (building.getStatus() === BuildingState.built) window[buildingText]();else {
    $buildBuilding.show();
    buildScreen(building.shorthand);
  }
}

$(document).on('click', ".buildingName", function (e) {
  e.preventDefault();
  var type = $(e.currentTarget).data("bldgType");
  if (TownManager.lastBldg === type) return;
  TownManager.lastBldg = type;
  var building = TownManager.typeToBuilding(type);
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
  recipeList.recipes.filter(function (r) {
    return r.type === type;
  }).forEach(function (recipe) {
    var recipeCardInfo = $('<div/>').addClass('recipeCardInfo').append(recipeCardFront(recipe), recipeCardBack(recipe));
    var recipeCardContainer = $('<div/>').addClass('recipeCardContainer buildingCard').data("recipeID", recipe.id).attr("id", "rr" + recipe.id).append(recipeCardInfo);
    $buildingRecipes.append(recipeCardContainer);
  });
  var d5 = $("<div/>").addClass("buildingInstr");
  $("<div/>").addClass("buildingInstrHead").html("Instruction").appendTo(d5);
  $("<div/>").addClass("buildingInstrDesc").html("Construct the building recipe to unlock this building permanently!").appendTo(d5);
  $buildingRecipes.append(d5);
}
//# sourceMappingURL=town.js.map