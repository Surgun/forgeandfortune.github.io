class Dialog {
  constructor(props) {
    Object.assign(this, props);
  }
}

const DialogManager = {
  dialogs: [],
  addDialog(dialog) {
    this.dialogs.push(dialog);
  },
  findDialog(id) {
    return this.dialogs.find((dialog) => id === dialog.id);
  }
}

// Run on initial load to reset status of dialog if user refreshed while dialog was open.
setDialogClose();

// Renders lower content of dialog (this usually contains some sort of action)
function renderDialogActions(id) {
  const dialogActions = $("<div/>").addClass('dialogActionsContainer');
  // Clear Save Dialog
  if (id === 'clear_save') {
    const clearSaveActions = $("<div/>").addClass('clearSaveActions').appendTo(dialogActions);
      $("<button/>").attr({id: "deleteSaveButton", tabindex: 2}).addClass('deleteSaveButton actionButton').html('Delete Game Data').appendTo(clearSaveActions);
      $("<button/>").attr({id: "declineSaveButton", tabindex: 3}).addClass('declineSaveButton actionButton').html('Keep Game Data').appendTo(clearSaveActions);
    return dialogActions;
  }
  // Export Save Dialog
  if (id === 'export_save') {
    $("<input/>").attr({id: "exportSaveText", type: "text", tabindex: 2}).addClass('exportSaveText').appendTo(dialogActions);
    const exportSaveActions = $("<div/>").addClass('exportSaveActions').appendTo(dialogActions);
      $("<button/>").attr({id: "exportSaveLocal", tabindex: 3}).addClass('exportSaveLocal actionButton').html('Download as File').appendTo(exportSaveActions);
      $("<button/>").attr({id: "exportSaveCopy", tabindex: 4}).addClass('exportSaveCopy actionButton').html('Copy to Clipboard').appendTo(exportSaveActions);
    return dialogActions;
  }
  // Import Save Dialog
  if (id === 'import_save') {
    $("<input/>").attr({id: "importSaveText", tabindex: 2, type: "text", placeholder: "Enter an export string..."}).addClass('importSaveText').appendTo(dialogActions);
    const importSaveActions = $("<div/>").addClass('importSaveActions').appendTo(dialogActions);
      $("<button/>").attr({id: "importSaveButton", tabindex: 3}).addClass('importSaveButton actionButton').html('Import Save').appendTo(importSaveActions);
    return dialogActions;
  }
  // Cloud Save (Playfab) Dialog
  if (id === 'playfab') {
    const accountContainer = $("<div/>").attr({id: "cloudSaveDialog"}).addClass('cloudSaveDialog').appendTo(dialogActions);
      $("<div/>").addClass("cloudSaveLogo").prependTo(dialogActions);
    // Login or Registration Form
    const accountForm = $("<form/>").attr({id: "pfLoginRegister", autocomplete: "on"}).addClass('pfAccountForm').appendTo(accountContainer);
    const accountEmail = $("<div/>").attr({id: "pfEmail"}).addClass('pfEmailContainer').appendTo(accountForm);
      $("<div/>").addClass('pfHeader').html('Email Address').appendTo(accountEmail);
      $("<input/>").attr({id: "email", tabindex: 2, type: "email", name: "email", autocomplete: "email", placeholder: "Enter your email address..."}).addClass('pfText').appendTo(accountEmail);
    const accountPassword = $("<div/>").attr({id: "pfPassword"}).addClass('pfPasswordContainer').appendTo(accountForm);
      $("<div/>").addClass('pfHeader').html('Password').appendTo(accountPassword);
      $("<input/>").attr({id: "password", tabindex: 3, type: "password", name: "password", autocomplete: "current-password", placeholder: "Enter your password..."}).addClass('pfText').appendTo(accountPassword);
    const accountActions = $("<div/>").attr({id: "pfButtons"}).addClass('pfButtonsContainer').appendTo(accountForm);
      $("<input/>").attr({id: "login", tabindex: 4, type: "submit", name: "login", value: "Log into Account"}).addClass("actionButton").appendTo(accountActions);
      $("<input/>").attr({id: "register", tabindex: 5, type: "button", name: "register", value: "Register an Account"}).addClass("actionButton").appendTo(accountActions);
      $("<input/>").attr({id: "reset", tabindex: 6, type: "button", name: "reset", value: "Reset Password"}).addClass("actionButton").appendTo(accountActions);
    const statusMessage = $("<div/>").attr({id: "pfStatusSection"}).addClass('pfStatusContainer').appendTo(accountForm);
      $("<div/>").attr({id: "pfStatus"}).addClass("pfStatus").appendTo(statusMessage);
    // Importing or exporting from Cloud
    const accountImportExport = $("<div/>").attr({id: "pfImportExport"}).addClass('pfImportExportContainer').appendTo(accountContainer).hide();
      $("<input/>").attr({id: "pfSave", tabindex: 0, type: "button", name: "Save to Cloud", value: "Save to Cloud"}).addClass("actionButton").appendTo(accountImportExport);
      $("<input/>").attr({id: "pfLoad", tabindex: 3, type: "button", name: "Load from Cloud", value: "Load from Cloud"}).addClass("actionButton").appendTo(accountImportExport);
      $("<div/>").attr({id: "pfStatusSave"}).addClass("pfStatusSave").appendTo(accountImportExport);
    // Confirmation screen for loading from Cloud
    const loadFromCloud = $("<div/>").attr({id: "loadSure"}).addClass("loadSure").appendTo(accountContainer).hide();
      $("<div/>").addClass("loadSureDescription").html("Are you sure you would like to load this cloud save data? This action is irreversible!").appendTo(loadFromCloud);
      const loadFromCloudActions = $("<div/>").attr({id: "pfLoadButtons"}).addClass("pfLoadButtons").appendTo(loadFromCloud);
        $("<input/>").attr({id: "pfloadYes", tabindex: 0, type: "button", name: "loadYes", value: "Yes"}).addClass("actionButton").appendTo(loadFromCloudActions);
        $("<input/>").attr({id: "pfloadNo", tabindex: 3, type: "button", name: "loadNo", value: "No"}).addClass("actionButton").appendTo(loadFromCloudActions);
    return dialogActions;
  }
  // Settings Dialog
  if (id === 'settings') {
    return dialogActions;
  }
  // Patch Notes Dialog
  if (id === 'patch_notes') {
    const patchListContainer = $("<div/>").attr({id: "patchList"}).addClass('patchListContainer').appendTo(dialogActions);
      $("<div/>").attr({id: "descPatch"}).addClass('descPatch').html("You are running the latest version of Forge & Fortune.").appendTo(patchListContainer)
    const patchListFooter = $("<div/>").attr({id: "patchListFooter"}).addClass('patchListFooter').appendTo(dialogActions);
      $("<div/>").attr({id: "updateRefresh"}).addClass('updateRefresh').html("Refresh to Update Game").appendTo(patchListFooter);
    return dialogActions;
  }
}

// Sets the dialog status to open and renders the dialog
function setDialogOpen(props) {
  // Dialog Parent Containers
  const dialogContainer = $("<div/>").attr({id: 'dialogContainer'}).addClass('dialogContainer').appendTo(document.body);
  const dialogBoxContainer = $("<div/>").addClass('dialogContent dialogOpening').appendTo(dialogContainer);
  if (props.id === 'patch_notes') $(dialogBoxContainer).addClass('isPatchDialog');
  // Dialog Upper Content
  const dialogClose = $("<div/>").attr({role: "button", tabindex: 1, 'aria-label': "Close Dialog"}).addClass('dialogClose').html('<i class="fas fa-times"></i>').appendTo(dialogBoxContainer);
  const dialogTitle = $("<div/>").addClass('dialogTitle').appendTo(dialogBoxContainer);
    $("<div/>").addClass('dialogTitleIcon').html(props.icon).appendTo(dialogTitle);
    $("<div/>").addClass('dialogTitleText').html(props.title).appendTo(dialogTitle);
  const dialogContentContainer = $("<div/>").addClass('dialogContentContainer').appendTo(dialogBoxContainer);
  if (props.description) $("<div/>").addClass('dialogDescription').html(props.description).appendTo(dialogContentContainer);
  const dialogActions = renderDialogActions(props.id);
  dialogActions.appendTo(dialogContentContainer);
  if (props.id === 'patch_notes') showPatchNotes();
  // Settings update
  settings.dialogStatus = 1;
  saveSettings();
}

// Sets the dialog to closed and removes dialog from DOM
function setDialogClose() {
  settings.dialogStatus = 0;
  saveSettings();
  $('#dialogContainer').addClass('dialogInactive');
  $('.dialogContent').removeClass('dialogOpening').addClass('dialogClosing');
}

$(document).on('transitionend ', '.dialogContent', (e) => {
  $('#dialogContainer').remove();
});

// Event Listeners / Triggers
$(document).on('click', '.isDialog', (e) => {
  const id = $(e.currentTarget).attr("data-dialog-id");
  if (settings.dialogStatus === 0) setDialogOpen(DialogManager.findDialog(id));
});

$(document).on('click ', '.dialogClose', (e) => {
  setDialogClose();
});

$(document).on('keyup', (e) => {
  if (e.keyCode === 27) setDialogClose();
});

$(document).on('click', '.dialogContainer', (e) => {
  if (e.target === e.currentTarget) setDialogClose();
});