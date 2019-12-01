class Tooltip {
  constructor(props) {
    Object.assign(this, props)
  }
}

TooltipManager = {
  tooltips: [],
  addTooltip(tooltip) {
    this.tooltips.push(tooltip)
  },
  findTooltip(id) {
    return this.tooltips.find(tooltip => tooltip.id === id)
  }
}

function generateTooltip(e) {
  const tooltipsContainer = $("#tooltips");
  const tooltipID = $(e.currentTarget).attr("data-tooltip");
  const tooltipEV = $(e.currentTarget).attr("data-tooltip-value");
  const tooltip = TooltipManager.findTooltip(tooltipID);
  const props = e.currentTarget.getBoundingClientRect();

  let positionBottom = ( window.innerHeight - props.top ) + 10;
  let positionLeft = props.left - 150;
  if (positionLeft < 0) positionLeft = 5;
  if (positionLeft > window.innerWidth) positionLeft - 5;
  const defaultStyles = {
    position: "absolute",
    bottom: positionBottom,
    left: positionLeft
  }

  const generatedTooltip = $("<div/>").addClass("tooltip-container").css(defaultStyles).appendTo(tooltipsContainer);

  // If icon is image, render image
  if (tooltip.icon && !tooltip.isFont) $("<div/>").addClass("tooltip-icon").css({backgroundImage: `url(${tooltip.icon})`}).appendTo(generatedTooltip);
  // If icon is font, render font icon
  if (tooltip.icon && tooltip.isFont) $("<div/>").addClass("tooltip-icon").html(tooltip.icon).appendTo(generatedTooltip);

  const tooltipDetails = $("<div/>").addClass("tooltip-details").appendTo(generatedTooltip);
  if (tooltip.isDynamic) $("<div/>").addClass("tooltip-title").html(`${tooltipEV} ${tooltip.title}`).appendTo(tooltipDetails);
  else $("<div/>").addClass("tooltip-title").html(tooltip.title).appendTo(tooltipDetails);
  // If description is present, render description
  if (tooltip.description) $("<div/>").addClass("tooltip-description").html(tooltip.description).appendTo(tooltipDetails);
  
  return generatedTooltip;
}

function destroyTooltip(e) {
  $(".tooltip-container").addClass("destroyingTooltip");
  setTimeout(() => {
    $(".tooltip-container.destroyingTooltip").remove();
  }, 200)
}

$(document).on("mouseenter", ".tooltip", (e) => {
  e.stopPropagation();
  generateTooltip(e);
});

$(document).on("mouseleave", ".tooltip", (e) => {
  destroyTooltip(e);
});
