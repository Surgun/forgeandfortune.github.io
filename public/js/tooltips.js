"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Tooltip =
/*#__PURE__*/
function () {
  function Tooltip(props) {
    _classCallCheck(this, Tooltip);

    Object.assign(this, props);
  }

  _createClass(Tooltip, [{
    key: "tooltipValue",
    value: function tooltipValue(id, prop) {
      if (this.type === "value") return id;else if (this.type === "buff") return BuffManager.idToBuff(id)[prop];else if (this.type === "dungeon") return DungeonManager.dungeonByID(id)[prop];else if (this.type === "guild") return GuildManager.idToGuild(id)[prop];else if (this.type === "hero") return HeroManager.idToHero(id)[prop];else if (this.type === "material") return ResourceManager.idToMaterial(id)[prop];else if (this.type === "mob") return MobManager.idToMob(id)[prop];else if (this.type === "perk") return Shop.idToPerk(id)[prop];else if (this.type === "recipe") return recipeList.idToItem(id)[prop];else if (this.type === "skill") return SkillManager.idToSkill(id)[prop];else if (this.type === "worker") return WorkerManager.workerByID(id)[prop];
    }
  }, {
    key: "generateIcon",
    value: function generateIcon(id) {
      if (!this.icon) return null;
      return hashtagReplace(this, id, this.icon);
    }
  }, {
    key: "isFont",
    value: function isFont(id) {
      var iconText = this.generateIcon(id);
      return iconText ? iconText.substring(0, 2) === "<i" : false;
    }
  }]);

  return Tooltip;
}();

var TooltipManager = {
  tooltips: [],
  addTooltip: function addTooltip(tooltip) {
    this.tooltips.push(tooltip);
  },
  findTooltip: function findTooltip(id) {
    return this.tooltips.find(function (tooltip) {
      return tooltip.id === id;
    });
  }
};

function generateTooltip(e) {
  var tooltipsContainer = $("#tooltips");
  var tooltipID = $(e.currentTarget).attr("data-tooltip");
  var tooltipEV = $(e.currentTarget).attr("data-tooltip-value");
  var tooltip = TooltipManager.findTooltip(tooltipID);
  var props = e.currentTarget.getBoundingClientRect();
  var positionBottom = window.innerHeight - props.top + 10;
  if (props.top < 100) positionBottom = window.innerHeight - props.top - 100;
  var positionLeft = props.left + props.width / 2 - 175;
  if (positionLeft < 0) positionLeft = 5;

  while (positionLeft > window.innerWidth - 350) {
    positionLeft -= 5;
  }

  var defaultStyles = {
    position: "absolute",
    bottom: positionBottom,
    left: positionLeft
  };
  if (tooltip === undefined) return;
  var generatedTooltip = $("<div/>").addClass("tooltip-container").css(defaultStyles).appendTo(tooltipsContainer); // If icon is image, render image

  if (tooltip.icon && !tooltip.isFont(tooltipEV)) $("<div/>").addClass("tooltip-icon").css({
    backgroundImage: "url(".concat(tooltip.generateIcon(tooltipEV), ")")
  }).appendTo(generatedTooltip); // If icon is font, render font icon

  if (tooltip.icon && tooltip.isFont(tooltipEV)) $("<div/>").addClass("tooltip-icon").html(tooltip.generateIcon(tooltipEV)).appendTo(generatedTooltip);
  var tooltipDetails = $("<div/>").addClass("tooltip-details").appendTo(generatedTooltip);

  if (tooltip.title) {
    var titleText = tooltipEV ? hashtagReplace(tooltip, tooltipEV, tooltip.title) : tooltip.title;
    $("<div/>").addClass("tooltip-title").html(titleText).appendTo(tooltipDetails);
  }

  if (tooltip.description) {
    var descText = tooltipEV ? hashtagReplace(tooltip, tooltipEV, tooltip.description) : tooltip.description;
    $("<div/>").addClass("tooltip-description").html(descText).appendTo(tooltipDetails);
  }

  return generatedTooltip;
}

function destroyTooltip(e) {
  $(".tooltip-container").addClass("destroyingTooltip");
  setTimeout(function () {
    $(".tooltip-container.destroyingTooltip").remove();
  }, 200);
}

$(document).on("mouseenter", ".tooltip", function (e) {
  e.stopPropagation();
  destroyTooltip(); // Ensures removal of any "stuck" tooltips before generating new tooltip

  generateTooltip(e);
});
$(document).on("mouseleave", ".tooltip", function (e) {
  destroyTooltip(e);
});

function hashtagReplace(tooltip, id, html) {
  if (!html.includes("#")) return html;
  var start = html.indexOf("#");
  var end = html.indexOf("#", start + 1);
  var prop = html.substring(start + 1, end);
  return hashtagReplace(tooltip, id, html.substring(0, start) + tooltip.tooltipValue(id, prop) + html.substring(end + 1));
}