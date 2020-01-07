"use strict";

// Settings Management
// Initial settings code for loading and saving is placed here, 
// place all individual settings code and management in the style.js file
var settings = {
  toastPosition: "top-left",
  dialogStatus: 0,
  battleLogLength: 999,
  db: 0,
  expandedMaterials: {
    D001: 1,
    D002: 1,
    D003: 1
  }
};

function saveSettings() {
  localStorage.setItem("settings", JSON.stringify(settings));
}

function loadSettings() {
  var obj = JSON.parse(localStorage.getItem("settings"));

  for (var setting in obj) {
    settings[setting] = obj[setting];
  }

  portSettings();
  localStorage.setItem("settings", JSON.stringify(settings));
}

function clearSettings() {
  localStorage.removeItem("settings");
  location.replace('/');
}

loadSettings(); // Port Settings - Remove old settings, update to new setting values, etc.

function portSettings() {
  delete settings.expandedLogistics;
  delete settings.toggleTurnOrderBars;
  if (settings.battleLogLength !== 999) settings.battleLogLength = 999;
}