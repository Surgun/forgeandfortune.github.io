"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var ProgressBar =
/*#__PURE__*/
function () {
  function ProgressBar(id, currentRef, maxRef, text, icon, tooltip, classes) {
    _classCallCheck(this, ProgressBar);

    this.id = id;
    this.currentRef = currentRef;
    this.maxRef = maxRef;
    this.text = text;
    this.classes = classes;
    this.icon = icon;
    this.tooltip = tooltip;
    this.filldiv = null;
    this.container = this.constructBar();
  }

  _createClass(ProgressBar, [{
    key: "constructBar",
    value: function constructBar() {
      var width = (this.currentRef / this.maxRef * 100).toFixed(1) + "%";
      var progressBarContainer = $("<div/>").addClass("progressBarContainer");
      if (this.classes) progressBarContainer.addClass(this.classes);
      if (this.tooltip) progressBarContainer.addClass("tooltip").attr({
        "data-tooltip": tooltip
      });

      if (this.text) {
        this.textDiv = $("<div/>").addClass("progressBarText").attr("id", "pbtext" + this.id).html(text).appendTo(progressBarContainer);
        if (this.icon) textDiv.addClass("containsIcon");
      }

      var progressBarContent = $("<div/>").addClass("progressBarContent").appendTo(progressBarContainer);
      if (this.icon) $("<div/>").addClass("progressBarIcon").html(this.icon).appendTo(progressBarContent);
      var progressBar = $("<div/>").addClass("progressBar").appendTo(progressBarContent);
      this.filldiv = $("<div/>").addClass("progressBarFill").attr("id", "pbfill" + this.id).css("width", width).appendTo(progressBar);
      return progressBarContainer;
    }
  }, {
    key: "refreshContent",
    value: function refreshContent(value, max) {
      this.currentRef = value;
      this.maxRef = max;
      var width = (value / max * 100).toFixed(1) + "%";
      this.filldiv.css("width", width);
    }
  }, {
    key: "setText",
    value: function setText(text) {
      this.text = text;
      this.textDiv.html(text);
    }
  }]);

  return ProgressBar;
}();
//# sourceMappingURL=progressbars.js.map