"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Worker =
/*#__PURE__*/
function () {
  function Worker(props) {
    _classCallCheck(this, Worker);

    Object.assign(this, props);
    this.pic = '<img src="/assets/images/workers/' + this.workerID + '.gif">';
    this.prodpic = '<img src="/assets/images/resources/' + this.production + '.png">';
    this.owned = false;
  }

  _createClass(Worker, [{
    key: "createSave",
    value: function createSave() {
      var save = {};
      save.id = this.workerID;
      save.owned = this.owned;
      return save;
    }
  }, {
    key: "loadSave",
    value: function loadSave(save) {
      this.owned = save.owned;
    }
  }, {
    key: "productionText",
    value: function productionText() {
      return "<span class=\"production_type\">".concat(ResourceManager.materialIcon(this.production), "</span><span class=\"production_text\">Worker</span>");
    }
  }]);

  return Worker;
}();

var WorkerManager = {
  workers: [],
  canProduceBucket: {},
  addWorker: function addWorker(worker) {
    this.workers.push(worker);
  },
  createSave: function createSave() {
    var save = [];
    this.workers.forEach(function (w) {
      save.push(w.createSave());
    });
    return save;
  },
  loadSave: function loadSave(save) {
    var _this = this;

    save.forEach(function (w) {
      var worker = _this.workerByID(w.id);

      worker.loadSave(w);
    });
  },
  workerByID: function workerByID(id) {
    return this.workers.find(function (worker) {
      return worker.workerID === id;
    });
  },
  gainWorker: function gainWorker(workerID) {
    var worker = this.workerByID(workerID);
    worker.owned = true;
    refreshSideWorkers();
    refreshRecipeFilters();
    recipeList.canCraft();
    refreshProgress();
    refreshAllGuildWorkers();
  },
  canCurrentlyProduce: function canCurrentlyProduce() {},
  couldCraft: function couldCraft(item) {
    var canProduce = this.workers.filter(function (w) {
      return w.owned;
    }).map(function (w) {
      return w.production;
    });
    var canProduceBucket = groupArray(canProduce);
    var needBucket = groupArray(item.gcost);

    for (var _i = 0, _Object$entries = Object.entries(needBucket); _i < _Object$entries.length; _i++) {
      var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
          res = _Object$entries$_i[0],
          amt = _Object$entries$_i[1];

      if (canProduceBucket[res] === undefined || canProduceBucket[res] < amt) return false;
    }

    return true;
  },
  canCurrentlyCraft: function canCurrentlyCraft(item) {
    var needBucket = groupArray(item.gcost);

    for (var _i2 = 0, _Object$entries2 = Object.entries(needBucket); _i2 < _Object$entries2.length; _i2++) {
      var _Object$entries2$_i = _slicedToArray(_Object$entries2[_i2], 2),
          res = _Object$entries2$_i[0],
          amt = _Object$entries2$_i[1];

      if (this.canProduceBucket[res] === undefined || this.canProduceBucket[res] < amt) return false;
    }

    return true;
  },
  filterByGuild: function filterByGuild(guildID) {
    return this.workers.filter(function (r) {
      return r.guildUnlock === guildID;
    });
  },
  getNextGuildLevel: function getNextGuildLevel(id, lvl) {
    var guilds = this.filterByGuild(id);
    var left = guilds.filter(function (g) {
      return g.repReqForBuy() > lvl;
    });
    return left.sort(function (a, b) {
      return a.repReqForBuy() - b.repReqForBuy();
    })[0];
  },
  freeByGuild: function freeByGuild(gid) {
    var usage = actionSlotManager.guildUsage();
    if (usage[gid] === undefined) return this.ownedByGuild(gid);
    return this.ownedByGuild(gid) - usage[gid];
  },
  ownedByGuild: function ownedByGuild(gid) {
    return this.workers.filter(function (w) {
      return w.production === gid && w.owned;
    }).length;
  },
  getCurrentProduceAvailable: function getCurrentProduceAvailable() {
    var _this2 = this;

    var gid = ["G001", "G002", "G003", "G004"];
    var canProduceBucket = {};
    gid.forEach(function (g) {
      canProduceBucket[g] = _this2.freeByGuild(g);
    });
    return canProduceBucket;
  }
};
var $G001WorkerFree = $("#G001WorkerFree");
var $G002WorkerFree = $("#G002WorkerFree");
var $G003WorkerFree = $("#G003WorkerFree");
var $G004WorkerFree = $("#G004WorkerFree");
var $G001WorkersSide = $("#G001WorkersSide");
var $G002WorkersSide = $("#G002WorkersSide");
var $G003WorkersSide = $("#G003WorkersSide");
var $G004WorkersSide = $("#G004WorkersSide");

function refreshSideWorkers() {
  var g1free = WorkerManager.freeByGuild("G001");
  var g2free = WorkerManager.freeByGuild("G002");
  var g3free = WorkerManager.freeByGuild("G003");
  var g4free = WorkerManager.freeByGuild("G004");
  $G001WorkerFree.html(g1free);
  $G002WorkerFree.html(g2free);
  $G003WorkerFree.html(g3free);
  $G004WorkerFree.html(g4free);
  if (g1free > 0) $G001WorkersSide.removeClass("noWorkersAvailable");else $G001WorkersSide.addClass("noWorkersAvailable");
  if (g2free > 0) $G002WorkersSide.removeClass("noWorkersAvailable");else $G002WorkersSide.addClass("noWorkersAvailable");
  if (g3free > 0) $G003WorkersSide.removeClass("noWorkersAvailable");else $G003WorkersSide.addClass("noWorkersAvailable");
  if (g4free > 0) $G004WorkersSide.removeClass("noWorkersAvailable");else $G004WorkersSide.addClass("noWorkersAvailable");
  if (WorkerManager.ownedByGuild("G001") > 0) $G001WorkersSide.show();else $G001WorkersSide.hide();
  if (WorkerManager.ownedByGuild("G002") > 0) $G002WorkersSide.show();else $G002WorkersSide.hide();
  if (WorkerManager.ownedByGuild("G003") > 0) $G003WorkersSide.show();else $G003WorkersSide.hide();
  if (WorkerManager.ownedByGuild("G004") > 0) $G004WorkersSide.show();else $G004WorkersSide.hide();
}

;