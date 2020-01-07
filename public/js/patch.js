"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var PatchManager = {
  patchList: [],
  current: 0,
  time: 0,
  addPatch: function addPatch(patchNote, firstLoad) {
    this.patchList.push(patchNote);
    if (firstLoad) this.current = Math.max(this.current, patchNote.patchCount);
  },
  lastPatch: function lastPatch() {
    var patchCount = this.patchList.map(function (p) {
      return p.patchCount;
    });
    var highest = Math.max.apply(Math, _toConsumableArray(patchCount));
    return this.patchList.find(function (p) {
      return p.patchCount === highest;
    });
  },
  lastVersion: function lastVersion() {
    return this.lastPatch().version;
  },
  lastPatchCount: function lastPatchCount() {
    return this.lastPatch().patchCount;
  },
  updateNeeded: function updateNeeded() {
    return this.current < this.lastPatchCount();
  },
  patchTimer: function patchTimer(elapsed) {
    this.time += elapsed;

    if (this.time > 300000) {
      this.patchList = [];
      $.ajax({
        url: "json/patchNotes.json"
      }).done(function (data) {
        $.each(data, function (i, props) {
          var patch = new PatchNote(props);
          PatchManager.addPatch(patch, false);
        });
        refreshPatchNotes();
      });
      this.time = 0;
    }
  }
};

var PatchNote = function PatchNote(props) {
  _classCallCheck(this, PatchNote);

  Object.assign(this, props);
};

function refreshPatchNotes() {
  if (PatchManager.updateNeeded()) $("#versionNum").addClass("hasEvent");
}

function showPatchNotes() {
  $("#patchList").empty();
  PatchManager.patchList.forEach(function (patch) {
    var d = $("<div/>").addClass("patchNote");
    $("<div/>").addClass("patchNoteVersion").html(patch.version).appendTo(d);
    $("<div/>").addClass("patchNoteDate").html("Updated ".concat(patch.date)).appendTo(d);
    $("<div/>").addClass("patchNoteBody").html(patch.body).appendTo(d);
    $("#patchList").prepend(d);
  });
  if (PatchManager.updateNeeded()) $("#updateRefresh").show();else $("#updateRefresh").hide();
}

$(document).on("click", "#updateRefresh", function (e) {
  location.replace('/');
});