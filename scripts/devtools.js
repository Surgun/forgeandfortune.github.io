const devtools = {
    godmode : function() {
        recipeList.recipes.filter(r=>r.recipeType === "normal").forEach(recipe => {
            recipe.craftCount = 100;
            recipe.owned = true;
        })
        WorkerManager.workers.forEach(worker => {
            worker.owned = true;
            worker.lvl = 10;
        })
        HeroManager.heroes.forEach(hero => {
            hero.owned = true;
        })
        ResourceManager.materials.forEach(material => {
            ResourceManager.addMaterial(material.id,9999999);
        })
        DungeonManager.bossesBeat = DungeonManager.dungeons.filter(d=>d.type==="boss").map(d=>d.id);
        TownManager.bankSee = true;
        TownManager.bankUnlock = true;
        TownManager.fuseSee = true;
        TownManager.fuseUnlock = true;
        TownManager.smithSee = true;
        TownManager.smithUnlock = true;
        TownManager.fortuneSee = true;
        TownManager.fortuneUnlock = true;
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
            worker.lvl = 9;
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
    gearHeroes(lvl,rarity,sharp) {
        const recipes = recipeList.recipes.filter(r => r.lvl === lvl);
        HeroManager.heroes.forEach(hero => {
            const slots = hero.getSlotTypes();
            slots.forEach((slotType,i) => {
                const item = recipes.find(r => r.type === slotType[0]);
                const container = new itemContainer(item.id,rarity);
                container.sharp = sharp;
                hero.equip(container,i);
            })
        })
    },
    bankBldg() {
        this.speed(1000);
        this.addGold(1000000000000000000000);
        WorkerManager.workers.forEach(worker => {
            worker.owned = true;
            worker.lvl = 10;
        });
        TownManager.bankOnce = true;
        TownManager.bankSee = true;
        refreshSideTown();
        for (let i=0;i<10;i++) Inventory.addToInventory("R99101",0,-1);
        for (let i=0;i<4;i++) Inventory.addToInventory("R99108",0,-1);
        Inventory.addToInventory("R99106",0,-1);
        Inventory.addToInventory("R99109",0,-1);
    },
    fuseBldg() {
        TownManager.fuseOnce = true;
        TownManager.fuseSee = true;
        refreshSideTown();
        for (let i=0;i<10;i++) Inventory.addToInventory("R99201",0,-1);
        for (let i=0;i<4;i++) Inventory.addToInventory("R99208",0,-1);
        Inventory.addToInventory("R99206",0,-1);
        Inventory.addToInventory("R99209",0,-1);
    },
    smithBldg() {
        TownManager.smithOnce = true;
        TownManager.smithSee = true;
        refreshSideTown();
        for (let i=0;i<10;i++) Inventory.addToInventory("R99301",0,-1);
        for (let i=0;i<4;i++) Inventory.addToInventory("R99308",0,-1);
        Inventory.addToInventory("R99306",0,-1);
        Inventory.addToInventory("R99309",0,-1);
    },
    fortuneBldg() {
        TownManager.fortuneOnce = true;
        TownManager.fortuneSee = true;
        refreshSideTown();
        for (let i=0;i<10;i++) Inventory.addToInventory("R99501",0,-1);
        for (let i=0;i<4;i++) Inventory.addToInventory("R99508",0,-1);
        Inventory.addToInventory("R99506",0,-1);
        Inventory.addToInventory("R99509",0,-1);
    },
    forceTown() {
        const types = ["bank","fuse","smith","fusion"];
        types.forEach(t => TownManager.buildingPerk(t));
        refreshSideTown();
    },
    dungeonUnlock() {
        DungeonManager.dungeonPaid.push("D010","D011","D012","D013","D014","D015","D016","D017","D018","D019");
        refreshDungeonSelect();
    },
    heroUnlock() {
        HeroManager.heroes.forEach(h=> h.owned = true);
    },
    skipSac : false,
}