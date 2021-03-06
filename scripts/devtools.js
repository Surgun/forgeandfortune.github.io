const devtools = {
    godmode : function() {
        recipeList.recipes.filter(r=>r.recipeType === "normal").forEach(recipe => {
            recipe.craftCount = 100;
            recipe.mastered = true;
            recipe.owned = true;
        })
        WorkerManager.workers.forEach(worker => {
            worker.owned = true;
        })
        HeroManager.heroes.forEach(hero => {
            hero.owned = true;
        })
        ResourceManager.materials.forEach(material => {
            ResourceManager.addMaterial(material.id,9999999);
        })
        DungeonManager.bossesBeat = DungeonManager.dungeons.filter(d=>d.type==="boss").map(d=>d.id);
        TownManager.bankStatus = BuildingState.built;
        TownManager.fuseStatus = BuildingState.built;
        TownManager.smithStatus = BuildingState.built;
        TownManager.fortuneStatus = BuildingState.built;
        TownManager.tinkerStatus = BuildingState.built;
        TownManager.desynthStatus = BuildingState.built;
        TownManager.monsterStatus = BuildingState.built;
        forceSave();
        location.replace('/');
    },
    // This is for sir hamster, sets some things differently to test UI/UX
    designmode() {
        this.godmode();
        recipeList.recipes.filter(r=>r.recipeType === "normal").forEach(recipe => {
            recipe.craftCount = 99;
        })
        WorkerManager.workers[0].lvl = 9;
        HeroManager.heroes[0].owned = false;
        TownManager.fortuneUnlock = false;
        forceSave();  
    },
    hyperSpeed() {
        DungeonManager.speed = 50;
    },
    materials : function() {
        ResourceManager.materials.forEach(material => {
            ResourceManager.addMaterial(material.id,10000);
        })
    },
    addGold(amt) {
        ResourceManager.addMaterial("M001",amt);
    },
    speed(amt) {
        player.timeWarp = amt;
    },
    workersTest() {
        WorkerManager.workers.forEach(worker => {
            worker.owned = true;

        })
        refreshWorkers();
    },
    heroTest() {
        Inventory.addToInventory("R0101",0);
        Inventory.addToInventory("R0201",0);
        Inventory.addToInventory("R0301",0);
    },
    addItem(itemID, rarity) {
        Inventory.addToInventory(itemID,rarity,-1)
    },
    gearHeroes(lvl=1,rarity=0,sharp=0) {
        const recipes = recipeList.recipes.filter(r => r.lvl === lvl);
        HeroManager.heroes.forEach(hero => {
            const slots = hero.getSlotTypes();
            slots.forEach((slotType,i) => {
                if (slotType[0] === "Trinkets") return;
                const item = recipes.find(r => r.type === slotType[0]);
                const container = new itemContainer(item.id,rarity);
                container.sharp = sharp;
                hero.equip(container,i);
            })
        })
    },
    forceTown() {
        TownManager.buildings.forEach(building => {
            recipeList.idToItem(building.recipeID).owned = true;
            if (building.getStatus() === BuildingState.seen) building.setStatus(BuildingState.built);
            else if (building.getStatus() !== BuildingState.built) building.setStatus(BuildingState.seen);
        })
        refreshSideTown();
    },
    dungeonUnlock() {
        DungeonManager.bossesBeat = [];
        DungeonManager.dungeonPaid.push("D010","D011","D012","D013","D014","D015","D016","D017","D018","D019");
        refreshDungeonSelect();
    },
    heroUnlock() {
        HeroManager.heroes.forEach(h=> h.owned = true);
        initializeHeroList();
    },
    allPerks() {
        this.addGold(1000000000000000);
        ActionLeague.perks.forEach(p=>ActionLeague.buyPerk(p.id));
    },
    addTrinkets() {
        const trinkets = ["R90001","R90002","R90003"]
        trinkets.forEach(trinket => {
            const item = new itemContainer(trinket,0);
            item.scale = 100;
            Inventory.addToInventory(item);
        })
    },
    testMonsterHall() {
        MonsterHall.lvl = 2;
        MobManager.monsterDB.forEach(mob => {
            MonsterHall.addKill(mob.id);
        });
    }
}