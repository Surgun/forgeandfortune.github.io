const devtools = {
    godmode() {
        recipeList.idToItem("R13001").craftCount = 1;
        achievementStats.totalGoldEarned = 1;
        this.materials();
        this.addGold(10000000000000);
        this.allPerks();
        this.forceTown(); //second one builds?
        this.forceTown();
        this.dungeonUnlock();
    },
    tutorialSkip() {
        recipeList.idToItem("R13001").craftCount = 1;
        achievementStats.totalGoldEarned = 1;
        devtools.addGold(100000);
        Shop.buyPerk("AL1000");
        Shop.buyPerk("AL2000");

        Shop.buyPerk("AL2001");
        ResourceManager.addMaterial("M001",-ResourceManager.idToMaterial("M001").amt);
    },
    materials() {
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
    addItem(itemID, rarity) {
        const container = new itemContainer(itemID,rarity);
        Inventory.addToInventory(container,false);
    },
    gearHeroes(lvl=1,rarity=0,sharp=0) {
        const recipes = recipeList.recipes.filter(r => r.lvl === lvl);
        HeroManager.heroes.forEach(hero => {
            const slots = hero.gearSlots.map(g=>g.type);
            slots.forEach(slotType => {
                if (slotType === "Trinkets") return;
                const item = recipes.find(r => r.type === slotType);
                const container = new itemContainer(item.id,rarity);
                container.sharp = sharp;
                hero.equip(container);
            })
        })
    },
    forceTown() {
        this.tutorialSkip();
        TownManager.buildings.forEach(building => {
            recipeList.idToItem(building.recipeID).owned = true;
            console.log(building.getStatus());
            if (building.getStatus() === BuildingState.seen) building.setStatus(BuildingState.built);
            else if (building.getStatus() !== BuildingState.built) building.setStatus(BuildingState.seen);
        })
        refreshSideTown();
    },
    dungeonUnlock() {
        this.tutorialSkip();
        DungeonManager.dungeons.forEach(dungeon => {
            if (dungeon.type === "boss") dungeon.maxFloor = 1;
        });
        Shop.idToPerk("AL2001").purchase();
        Shop.idToPerk("AL2002").purchase();
        Shop.idToPerk("AL2004").purchase();
    },
    heroUnlock() {
        this.tutorialSkip();
        HeroManager.heroes.forEach(h => {
            h.owned = true
            h.playbooks.forEach(playbookID => {
                PlaybookManager.idToPlaybook(playbookID).unlocked = true;
            });
        });
        initializeHeroList();
    },
    allPerks() {
        this.tutorialSkip();
        this.addGold(1000000000000000);
        Shop.perks.forEach(p=>Shop.buyPerk(p.id));
    },
    timeWarp() {
        player.lastTime -= 600000;
    },
}