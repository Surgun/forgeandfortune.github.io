"use strict";

PlayFab.settings.titleId = "D765";
var sessionID = null;
var saveFile = 0;
$(document).on("click", "#cloudSave", function (e) {
  //clicked on the "Cloud Save" button
  if (!sessionID) {
    $("#pfLoginRegister").show();
    $("#pfImportExport").hide();
    $("#loadSure").hide();
  } else {
    $("#pfLoginRegister").hide();
    $("#pfImportExport").show();
    $("#loadSure").hide();
    getSaveFromCloud();
  }
});
$(document).on("click", "#register", function (e) {
  e.preventDefault();
  registerAcct();
});
$(document).on("click", "#login", function (e) {
  e.preventDefault();
  loginAcct();
});
$(document).on("click", "#reset", function (e) {
  resetPassword();
});
$(document).on("click", "#pfSave", function (e) {
  e.preventDefault();
  saveToCloud();
});
$(document).on("click", "#pfLoad", function (e) {
  e.preventDefault();
  $("#loadSure").show();
  $("#pfImportExport").hide();
});
$(document).on("click", "#pfloadYes", function (e) {
  loadFromCloud();
});
$(document).on("click", "#pfloadNo", function (e) {
  $("#pfLoginRegister").show();
  $("#pfImportExport").hide();
  $("#loadSure").hide();
});

var validateCallback = function validateCallback(result, error) {
  if (error !== null) {
    $("#pfLoginRegister").show();
    $("#pfImportExport").hide();
  } else {
    $("#pfLoginRegister").hide();
    $("#pfImportExport").show();
  }
};

function resetPassword() {
  var resetRequest = {
    TitleId: PlayFab.settings.titleId,
    Email: $("#email").val()
  };
  PlayFabClientSDK.SendAccountRecoveryEmail(resetRequest, resetCallback);
}

var resetCallback = function resetCallback(result, error) {
  if (result !== null) {
    $("#pfStatus").html("Password reset email sent to your email address.");
    setTimeout(function () {
      setDialogClose();
    }, 1500);
  } else if (error !== null) {
    $("#pfStatus").html(PlayFab.GenerateErrorReport(error));
    setTimeout(function () {
      $("#pfStatus").empty();
    }, 3500);
  }
};

function registerAcct() {
  var registerRequest = {
    TitleId: PlayFab.settings.titleId,
    Email: $("#email").val(),
    Password: $("#password").val(),
    RequireBothUsernameAndEmail: false
  };
  PlayFabClientSDK.RegisterPlayFabUser(registerRequest, registerCallback);
}

var registerCallback = function registerCallback(result, error) {
  if (result !== null) {
    loginAcct();
  } else if (error !== null) {
    $("#pfStatus").html(PlayFab.GenerateErrorReport(error));
    setTimeout(function () {
      $("#pfStatus").empty();
    }, 3500);
  }
};

function loginAcct() {
  var loginRequest = {
    TitleId: PlayFab.settings.titleId,
    Email: $("#email").val(),
    Password: $("#password").val()
  };
  PlayFabClientSDK.LoginWithEmailAddress(loginRequest, LoginCallback);
}

var LoginCallback = function LoginCallback(result, error) {
  if (result !== null) {
    sessionID = result.data.SessionTicket;
    $("#pfLoginRegister").hide();
    $("#pfImportExport").show();
    getSaveFromCloud();
  } else if (error !== null) {
    $("#pfStatus").html(PlayFab.GenerateErrorReport(error));
    setTimeout(function () {
      $("#pfStatus").empty();
    }, 3500);
  }
};

function saveToCloud() {
  $("#pfStatusSave").html("Saving...");
  forceSave();
  var requestData = {
    TitleId: PlayFab.settings.titleId,
    Data: {
      "savestring": createSaveExport()
    }
  };
  PlayFab.ClientApi.UpdateUserData(requestData, saveCallback);
}

;

function saveCallback(result, error) {
  if (result !== null) {
    getSaveFromCloud();
  }

  if (error !== null) {
    $("#pfStatusSave").html(PlayFab.GenerateErrorReport(error));
  }
}

function loadFromCloud() {
  getSaveFromCloud();

  if (saveFile) {
    localStorage.setItem('ffgs1', JSON.stringify(saveFile));
    location.replace('/');
  }
}

function getSaveFromCloud() {
  var requestData = {
    Keys: ["savestring"]
  };
  PlayFab.ClientApi.GetUserData(requestData, loadCallback);
}

;

function loadCallback(result, error) {
  if (error !== null) {
    $("#pfStatusSave").html(PlayFab.GenerateErrorReport(error));
  }

  if (result) {
    if (result.data.Data !== null) {
      saveFile = JSON.parse(JSON.parse(pako.ungzip(atob(result.data.Data.savestring.Value), {
        to: 'string'
      })));
      var date = saveFile["saveTime"];
      var dateString = new Date(date).toString();
      $("#pfStatusSave").html("Last save:</br>" + dateString);
    } else {
      saveFile = null;
      $("#pfStatusSave").text("No save uploaded.");
    }
  }
}
//# sourceMappingURL=playfab.js.map