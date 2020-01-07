"use strict";

var devtools = {
  godmode: function godmode() {
    recipeList.recipes.filter(function (r) {
      return r.recipeType === "normal";
    }).forEach(function (recipe) {
      recipe.craftCount = 100;
      recipe.mastered = true;
      recipe.owned = true;
    });
    WorkerManager.workers.forEach(function (worker) {
      worker.owned = true;
    });
    HeroManager.heroes.forEach(function (hero) {
      hero.owned = true;
    });
    ResourceManager.materials.forEach(function (material) {
      ResourceManager.addMaterial(material.id, 9999999);
    });
    DungeonManager.bossesBeat = DungeonManager.dungeons.filter(function (d) {
      return d.type === "boss";
    }).map(function (d) {
      return d.id;
    });
    TownManager.bankStatus = BuildingState.built;
    TownManager.fuseStatus = BuildingState.built;
    TownManager.smithStatus = BuildingState.built;
    TownManager.fortuneStatus = BuildingState.built;
    TownManager.tinkerStatus = BuildingState.built;
    TownManager.synthStatus = BuildingState.built;
    TownManager.monsterStatus = BuildingState.built;
    forceSave();
    location.replace('/');
  },
  // This is for sir hamster, sets some things differently to test UI/UX
  designmode: function designmode() {
    this.godmode();
    recipeList.recipes.filter(function (r) {
      return r.recipeType === "normal";
    }).forEach(function (recipe) {
      recipe.craftCount = 99;
    });
    WorkerManager.workers[0].lvl = 9;
    HeroManager.heroes[0].owned = false;
    TownManager.fortuneUnlock = false;
    forceSave();
  },
  materials: function materials() {
    ResourceManager.materials.forEach(function (material) {
      ResourceManager.addMaterial(material.id, 10000);
    });
  },
  addGold: function addGold(amt) {
    ResourceManager.addMaterial("M001", amt);
  },
  speed: function speed(amt) {
    player.timeWarp = amt;
  },
  addItem: function addItem(itemID, rarity) {
    var container = new itemContainer(itemID, rarity);
    Inventory.addToInventory(container, false);
  },
  gearHeroes: function gearHeroes() {
    var lvl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
    var rarity = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var sharp = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    var recipes = recipeList.recipes.filter(function (r) {
      return r.lvl === lvl;
    });
    HeroManager.heroes.forEach(function (hero) {
      var slots = hero.getSlotTypes();
      slots.forEach(function (slotType, i) {
        if (slotType[0] === "Trinkets") return;
        var item = recipes.find(function (r) {
          return r.type === slotType[0];
        });
        var container = new itemContainer(item.id, rarity);
        container.sharp = sharp;
        hero.equip(container, i);
      });
    });
  },
  forceTown: function forceTown() {
    TownManager.buildings.forEach(function (building) {
      recipeList.idToItem(building.recipeID).owned = true;
      if (building.getStatus() === BuildingState.seen) building.setStatus(BuildingState.built);else if (building.getStatus() !== BuildingState.built) building.setStatus(BuildingState.seen);
    });

    if (!DungeonManager.bossesBeat.includes("B901")) {
      DungeonManager.bossesBeat.push("B901");
      refreshShop();
    }

    refreshSideTown();
  },
  dungeonUnlock: function dungeonUnlock() {
    DungeonManager.bossesBeat = [];
    DungeonManager.dungeonPaid.push("D010", "D011", "D012", "D013", "D014", "D015", "D016", "D017", "D018", "D019");
    refreshDungeonSelect();
  },
  heroUnlock: function heroUnlock() {
    HeroManager.heroes.forEach(function (h) {
      return h.owned = true;
    });
    initializeHeroList();
  },
  allPerks: function allPerks() {
    this.addGold(1000000000000000);
    Shop.perks.forEach(function (p) {
      return Shop.buyPerk(p.id);
    });
  },
  addTrinkets: function addTrinkets() {
    var trinkets = ["R90001", "R90002", "R90003"];
    trinkets.forEach(function (trinket) {
      var item = new itemContainer(trinket, 0);
      item.scale = 100;
      Inventory.addToInventory(item);
    });
  },
  testMonsterHall: function testMonsterHall() {
    MonsterHall.lvl = 2;
    MobManager.monsterDB.forEach(function (mob) {
      MonsterHall.addKill(mob.id);
    });
  },
  suffixTest: function suffixTest() {
    Inventory.inv.forEach(function (i) {
      if (i === null) return;
      i.rerollRatio();
    });
    refreshInventoryPlaces();
  },
  testRealm: function testRealm() {
    HeroManager.heroes.forEach(function (h) {
      return h.owned = true;
    });
    initializeHeroList();
    DungeonManager.unlockDungeon("D004");
    DungeonManager.partySize = 4;
    refreshDungeonSelect();
  },
  timeWarp: function timeWarp() {
    player.lastTime -= 600000;
  }
};