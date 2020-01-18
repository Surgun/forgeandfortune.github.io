"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Material =
/*#__PURE__*/
function () {
  function Material(props) {
    _classCallCheck(this, Material);

    Object.assign(this, props);
    this.amt = 0;
    this.img = "<img src='/assets/images/resources/".concat(this.id, ".png' alt='").concat(this.name, "'>");
  }

  _createClass(Material, [{
    key: "createSave",
    value: function createSave() {
      var save = {};
      save.id = this.id;
      save.amt = this.amt;
      save.seen = this.seen;
      return save;
    }
  }, {
    key: "loadSave",
    value: function loadSave(save) {
      this.amt = save.amt;
      this.seen = save.seen;
    }
  }]);

  return Material;
}();

var $goldSidebar = $("#goldSidebar");
var $goldSidebarAmt = $("#goldSidebarAmt");
var ResourceManager = {
  materials: [],
  createSave: function createSave() {
    var save = [];
    this.materials.forEach(function (m) {
      save.push(m.createSave());
    });
    return save;
  },
  loadSave: function loadSave(save) {
    var _this = this;

    save.forEach(function (m) {
      var mat = _this.idToMaterial(m.id);

      mat.loadSave(m);
    });
  },
  addNewMaterial: function addNewMaterial(material) {
    this.materials.push(material);
  },
  addMaterial: function addMaterial(res, amt, skipAnimation) {
    var mat = this.materials.find(function (mat) {
      return mat.id === res;
    });
    mat.amt += amt;
    if (mat.id !== "M001") mat.amt = Math.min(mat.amt, 1000);
    mat.seen = true;
    if (skipAnimation) return;
    refreshMaterial(res);
  },
  canAffordMaterial: function canAffordMaterial(item) {
    if (item.mcost === null) return true;

    for (var _i = 0, _Object$entries = Object.entries(item.mcost); _i < _Object$entries.length; _i++) {
      var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
          material = _Object$entries$_i[0],
          amt = _Object$entries$_i[1];

      if (amt > this.materialAvailable(material)) return false;
    }

    return true;
  },
  deductMoney: function deductMoney(amt) {
    this.addMaterial("M001", -amt);
  },
  deductMaterial: function deductMaterial(item, skipAnimation) {
    if (item.mcost === null) return;

    for (var _i2 = 0, _Object$entries2 = Object.entries(item.mcost); _i2 < _Object$entries2.length; _i2++) {
      var _Object$entries2$_i = _slicedToArray(_Object$entries2[_i2], 2),
          resource = _Object$entries2$_i[0],
          amt = _Object$entries2$_i[1];

      this.addMaterial(resource, -amt, skipAnimation);
    }
  },
  refundMaterial: function refundMaterial(item) {
    if (item.mcost === null) return;

    for (var _i3 = 0, _Object$entries3 = Object.entries(item.mcost); _i3 < _Object$entries3.length; _i3++) {
      var _Object$entries3$_i = _slicedToArray(_Object$entries3[_i3], 2),
          resource = _Object$entries3$_i[0],
          amt = _Object$entries3$_i[1];

      this.addMaterial(resource, amt);
    }
  },
  materialIcon: function materialIcon(type) {
    if (type[0] === "R") return recipeList.idToItem(type).itemPic();
    if (type[0] === "G") return GuildManager.idToGuild(type).icon;
    return "<img src=\"/assets/images/resources/".concat(type, ".png\" alt=\"").concat(type, "\">");
  },
  formatCost: function formatCost(res, amt) {
    return "<div class=\"matIcon\">".concat(this.materialIcon(res), "</div> <span class=\"matAmt\">").concat(amt, "</span>");
  },
  sidebarMaterial: function sidebarMaterial(resID) {
    var res = this.materials.find(function (resource) {
      return resource.id == resID;
    });
    return "".concat(this.materialIcon(resID), "&nbsp;&nbsp").concat(res.amt);
  },
  available: function available(res, amt) {
    var item = recipeList.idToItem(res);

    if (item === undefined) {
      return this.idToMaterial(res).amt >= amt;
    }

    return Inventory.itemCount(res, 0) >= amt;
  },
  materialAvailable: function materialAvailable(matID) {
    if (matID.charAt(0) === "R") {
      return Inventory.itemCount(matID, 0);
    }

    return this.materials.find(function (mat) {
      return mat.id === matID;
    }).amt;
  },
  materialsEmpty: function materialsEmpty() {
    return ResourceManager.materials.filter(function (mat) {
      return mat.id !== "M001";
    }).every(function (mat) {
      return mat.amt === 0;
    });
  },
  nameForWorkerSac: function nameForWorkerSac(mat) {
    var item = recipeList.idToItem(mat);
    if (item === undefined) return this.idToMaterial(mat).name;
    return item.name;
  },
  idToMaterial: function idToMaterial(matID) {
    return this.materials.find(function (m) {
      return m.id === matID;
    });
  },
  isAMaterial: function isAMaterial(matID) {
    return this.materials.some(function (m) {
      return m.id === matID;
    });
  },
  reOrderMats: function reOrderMats() {
    this.materials.sort(function (a, b) {
      return a.tier - b.tier;
    });
  },
  fortuneResource: function fortuneResource(lvl) {
    var resources = this.materials.filter(function (r) {
      return r.fortuneLvl === lvl;
    });
    var week = currentWeek();
    var good = resources[week % resources.length].id;
    var great = resources[(week + 1) % resources.length].id;
    var epic = resources[(week + 2) % resources.length].id;
    return [good, great, epic];
  },
  materialSeenDungeon: function materialSeenDungeon(dungeonID) {
    var _this2 = this;

    //returns a list of materials you've seen
    if (dungeonID === "D004") return [];
    var matids = MobManager.allMobDropsByDungeon(dungeonID);
    var materials = matids.map(function (m) {
      return _this2.idToMaterial(m);
    });
    return materials.filter(function (m) {
      return m.seen;
    });
  }
};
var $materials = $("#materials");

function initializeMats() {
  ResourceManager.reOrderMats();
  ResourceManager.materials.forEach(function (mat) {
    if (mat.id != "M001") {
      var d = $("<div/>").addClass("material tooltip").attr({
        "data-tooltip": "material_desc",
        "data-tooltip-value": mat.id
      }).attr("id", mat.id);
      var d1 = $("<div/>").addClass("materialName").html(mat.img);
      var d2 = $("<div/>").addClass("materialAmt").attr("id", "amt" + mat.id).html(formatToUnits(mat.amt, 2));
      d.append(d1, d2);
      d.hide();
      $materials.append(d);
    }
  });
}

var $noMaterialDiv = $("#noMaterialDiv");

function hardMatRefresh() {
  //used when we first load in
  if (ResourceManager.materialsEmpty()) $noMaterialDiv.show();else $noMaterialDiv.hide();
  ResourceManager.materials.forEach(function (mat) {
    if (mat.amt === 0) $("#" + mat.id).hide();else $("#" + mat.id).show();
    $("#amt" + mat.id).html(mat.amt);

    if (mat.id === "M001") {
      $goldSidebarAmt.html(formatToUnits(mat.amt, 2));
      $goldSidebar.addClass("tooltip").attr({
        "data-tooltip": "gold_value",
        "data-tooltip-value": formatWithCommas(mat.amt)
      });
    }
  });
}

function refreshMaterial(matID) {
  var mat = ResourceManager.idToMaterial(matID);
  if (ResourceManager.materialsEmpty()) $noMaterialDiv.show();else $noMaterialDiv.hide();
  if (mat.amt === 0) $("#" + matID).hide();else $("#" + matID).show();
  $("#amt" + matID).html(formatToUnits(mat.amt, 2));
  $("#dsbr" + matID).html(mat.amt);
  if (TinkerManager.tinkerMats().includes(matID)) refreshTinkerMats();
  DungeonManager.dungeonMatRefresh(mat.id);
  if (mat.id === "M002") refreshMonsterReward();
  if (mat.id !== "M001") return;
  $goldSidebarAmt.html(formatToUnits(mat.amt, 2));
  $goldSidebar.addClass("tooltip").attr({
    "data-tooltip": "gold_value",
    "data-tooltip-value": formatWithCommas(mat.amt)
  });
}

$(document).on("click", ".material", function (e) {
  e.preventDefault();
  tabClick(e, "recipesTab");
  var matID = $(e.currentTarget).attr("id");
  initializeRecipes(matID, "default");
});
//# sourceMappingURL=resource.js.map