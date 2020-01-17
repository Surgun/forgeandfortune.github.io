"use strict";

function loadMisc() {
  $.ajax({
    url: "json/misc.json"
  }).done(function (data) {
    $.each(data, function (i, prop) {
      $.each(prop, function (name, val) {
        miscLoadedValues[name] = val;
      });
    });
    loadPatchnotes();
  });
}

function loadPatchnotes() {
  $.ajax({
    url: "json/patchNotes.json"
  }).done(function (data) {
    $.each(data, function (i, props) {
      var patch = new PatchNote(props);
      PatchManager.addPatch(patch, true);
    });
    loadMaterials();
  });
}

function loadMaterials() {
  $.ajax({
    url: "json/materials.json"
  }).done(function (data) {
    $.each(data, function (i, props) {
      var material = new Material(props);
      ResourceManager.addNewMaterial(material);
    });
    loadRecipes();
  });
}

function loadRecipes() {
  $.ajax({
    url: "json/recipes.json"
  }).done(function (data) {
    $.each(data, function (i, props) {
      var item = new Item(props);
      recipeList.addItem(item);
    });
    loadWorkers();
  });
}

;

function loadWorkers() {
  $.ajax({
    url: "json/workers.json"
  }).done(function (data) {
    $.each(data, function (i, props) {
      var worker = new Worker(props);
      WorkerManager.addWorker(worker);
    });
    loadSkills();
  });
}

function loadSkills() {
  $.ajax({
    url: "json/skills.json"
  }).done(function (data) {
    $.each(data, function (i, props) {
      var skill = new Skill(props);
      SkillManager.addSkill(skill);
    });
    loadPlaybooks();
  });
}

function loadPlaybooks() {
  $.ajax({
    url: "json/playbook.json"
  }).done(function (data) {
    $.each(data, function (i, props) {
      var playbook = new playBookTemplate(props);
      PlaybookManager.addPlaybookTemplate(playbook);
    });
    loadBuffs();
  });
}

function loadBuffs() {
  $.ajax({
    url: "json/buffs.json"
  }).done(function (data) {
    $.each(data, function (i, props) {
      var buff = new buffTemplate(props);
      BuffManager.addBuffTemplate(buff);
    });
    loadHeroes();
  });
}

function loadHeroes() {
  $.ajax({
    url: "json/heroes.json"
  }).done(function (data) {
    $.each(data, function (i, props) {
      var hero = new Hero(props);
      HeroManager.addHero(hero);
    });
    loadGuilds();
  });
}

function loadGuilds() {
  $.ajax({
    url: "json/guilds.json"
  }).done(function (data) {
    $.each(data, function (i, props) {
      var guild = new Guild(props);
      GuildManager.addGuild(guild);
    });
    loadPerks();
  });
}

function loadPerks() {
  $.ajax({
    url: "json/perks.json"
  }).done(function (data) {
    $.each(data, function (i, props) {
      var perk = new Perk(props);
      Shop.addPerk(perk);
    });
    loadMobs();
  });
}

function loadMobs() {
  $.ajax({
    url: "json/mobs.json"
  }).done(function (data) {
    $.each(data, function (i, props) {
      var mob = new MobTemplate(props);
      MobManager.addMob(mob);
    });
    loadDungeons();
  });
}

function loadDungeons() {
  $.ajax({
    url: "json/dungeons.json"
  }).done(function (data) {
    $.each(data, function (i, props) {
      var event = new Dungeon(props);
      DungeonManager.addDungeon(event);
    });
    loadDungeonFloors();
  });
}

function loadDungeonFloors() {
  $.ajax({
    url: "json/dungeonFloors.json"
  }).done(function (data) {
    $.each(data, function (i, props) {
      var floor = new FloorTemplate(props);
      FloorManager.addFloor(floor);
    });
    loadTinker();
  });
}

function loadTinker() {
  $.ajax({
    url: "json/tinker.json"
  }).done(function (data) {
    $.each(data, function (i, props) {
      var command = new tinkerCommand(props);
      TinkerManager.addCommand(command);
    });
    loadTown();
  });
}

function loadTown() {
  $.ajax({
    url: "json/town.json"
  }).done(function (data) {
    $.each(data, function (i, props) {
      var building = new Building(props);
      TownManager.addBuilding(building);
    });
    loadDialogs();
  });

  function loadDialogs() {
    $.ajax({
      url: "json/dialogs.json"
    }).done(function (data) {
      $.each(data, function (i, props) {
        var dialog = new Dialog(props);
        DialogManager.addDialog(dialog);
      });
      loadTooltips();
    });
  }

  function loadTooltips() {
    $.ajax({
      url: "json/tooltips.json"
    }).done(function (data) {
      $.each(data, function (i, props) {
        var tooltip = new Tooltip(props);
        TooltipManager.addTooltip(tooltip);
      });
      afterLoad();
    });
  }
}
//# sourceMappingURL=jsonDataLoader.js.map