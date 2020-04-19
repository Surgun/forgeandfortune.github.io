"use strict";

function loadMisc() {
    $.ajax({
        url: "json/misc.json",
    }).done((data) => {
        $.each(data, function(i,prop){
            $.each(prop, function (name,val) {
                miscLoadedValues[name] = val;
            })
        });
        loadPatchnotes();
    });
}

function loadPatchnotes() {
    $.ajax({
        url: "json/patchNotes.json",
    }).done((data) => {
        $.each(data, function(i,props){
            const patch = new PatchNote(props);
            PatchManager.addPatch(patch,true);
        });
        loadGlobalTexts();
    });
}

let globalTexts = null;

function loadGlobalTexts() {
    $.ajax({
        url: "json/texts.json",
    }).done((data) => {
            globalTexts = Object.values(data)
        });
        loadMaterials();
    });
}

function loadMaterials() {
    $.ajax({
        url: "json/materials.json",
    }).done((data) => {
        $.each(data, function(i,props){
            const material = new Material(props);
            ResourceManager.addNewMaterial(material);
        });
        loadRecipes();
    });
}

function loadRecipes() {
    $.ajax({
        url: "json/recipes.json",
    }).done((data) => {
        $.each(data, function(i,props){
            const item = new Item(props);
            recipeList.addItem(item);
        });
        loadWorkers();
        preloader.setMessage('Populating recipes...');
    });
};

function loadWorkers() {
    $.ajax({
        url: "json/workers.json",
    }).done((data) => {
        $.each(data, function(i,props){
            const worker = new Worker(props);
            WorkerManager.addWorker(worker);
        });
        loadSkills();
    });
}

function loadSkills() {
    $.ajax({
        url: "json/skills.json",
    }).done((data) => {
        $.each(data, function(i,props){
            const skill = new Skill(props);
            SkillManager.addSkill(skill);
        });
        loadPlaybooks();
    });
}

function loadPlaybooks() {
    $.ajax({
        url: "json/playbook.json",
    }).done((data) => {
        $.each(data, function(i,props){
            const playbook = new playBookTemplate(props);
            PlaybookManager.addPlaybookTemplate(playbook);
        });
        loadBuffs();
    });
}

function loadBuffs() {
    $.ajax({
        url: "json/buffs.json",
    }).done((data) => {
        $.each(data, function(i,props){
            const buff = new buffTemplate(props);
            BuffManager.addBuffTemplate(buff);
        });
        loadHeroes();
    });
}


function loadHeroes() {
    $.ajax({
        url: "json/heroes.json",
    }).done((data) => {
        $.each(data, function(i,props){
            const hero = new Hero(props);
            HeroManager.addHero(hero);
        });
        loadGuilds();
        preloader.setMessage('Gathering your heroes...');
    });
}

function loadGuilds() {
    $.ajax({
        url: "json/guilds.json",
    }).done((data) => {
        $.each(data, function(i,props){
            const guild = new Guild(props)
            GuildManager.addGuild(guild);
        });
        loadPerks();
    });
}

function loadPerks() {
    $.ajax({
        url: "json/perks.json",
    }).done((data) => {
        $.each(data, function(i,props){
            const perk = new Perk(props);
            Shop.addPerk(perk);
        });
        loadMobs();
    });
}

function loadMobs() {
    $.ajax({
        url: "json/mobs.json",
    }).done((data) => {
        $.each(data, function(i,props){
            const mob = new MobTemplate(props);
            MobManager.addMob(mob);
        });
        loadAreas();
    });
}

function loadAreas() {
    $.ajax({
        url: "json/areas.json",
    }).done((data) => {
        $.each(data, function(i,props){
            const area = new Area(props)
            AreaManager.addArea(area);
        });
        loadDungeons();
    });
}

function loadDungeons() {
    $.ajax({
        url: "json/dungeons.json",
    }).done((data) => {
        $.each(data, function(i,props){
            const event = new Dungeon(props)
            DungeonManager.addDungeon(event);
        });
        loadTinker();
        preloader.setMessage('Crawling the dungeons...');
    });
}

function loadTinker() {
    $.ajax({
        url: "json/tinker.json",
    }).done((data) => {
        $.each(data, function(i,props){
            const command = new tinkerCommand(props);
            TinkerManager.addCommand(command);
        });
        loadTown();
    });
}

function loadTown() {
    $.ajax({
        url: "json/town.json",
    }).done((data) => {
        $.each(data, function(i,props){
            const building = new Building(props);
            TownManager.addBuilding(building);
        });
        loadDialogs();
    });
}

function loadDialogs() {
    $.ajax({
        url: "json/dialogs.json",
    }).done((data) => {
        $.each(data, function(i,props){
            const dialog = new Dialog(props);
            DialogManager.addDialog(dialog);
        });
        loadTooltips();
    });
}

function loadTooltips() {
    $.ajax({
        url: "json/tooltips.json",
    }).done((data) => {
        $.each(data, function(i,props){
            const tooltip = new Tooltip(props);
            TooltipManager.addTooltip(tooltip);
        });
        loadMuseum();
        preloader.setMessage('Informing the uninformed...');
    });
}

function loadMuseum() {
    $.ajax({
        url: "json/museum.json",
    }).done((data) => {
        $.each(data, function(i,props){
            const reward = new MuseumReward(props);
            Museum.addReward(reward);
        });
        afterLoad();
        preloader.setMessage('Finalizing your progress...');
    });
}