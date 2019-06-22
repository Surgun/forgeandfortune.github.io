"use strict";

const Resources = Object.freeze({ORE:"ore",WOOD:"wood",LEATHER:"leather",HERB:"herb",BONE:"bone",FABRIC:"fabric",STEEL:"steel",SILVER:"silver",PAPER:"paper",MANA:"mana"});

class Material{
    constructor (props) {
        Object.assign(this, props);
        this.amt = 0;
        this.img = `<img src='images/resources/${this.id}.png' alt='${this.name}'>`;
    }
    createSave() {
        const save = {};
        save.id = this.id;
        save.amt = this.amt;
        save.seen = this.seen;
        return save;
    }
    loadSave(save) {
        this.amt = save.amt;
        this.seen = save.seen;
    }
}

const $goldSidebar = $("#goldSidebar");
const $goldSidebarAmt = $("#goldSidebarAmt");

const ResourceManager = {
    materials : [],
    createSave() {
        const save = [];
        this.materials.forEach(m=> {
            save.push(m.createSave());
        });
        return save;
    },
    loadSave(save) {
        save.forEach(m=> {
            const mat = this.idToMaterial(m.id);
            mat.loadSave(m);
        });
    },
    addNewMaterial(material) {
        this.materials.push(material);
    },
    addMaterial(res,amt) {
        if (res.charAt(0) === "R") {
            for (let i=0;i<amt;i++) Inventory.addToInventory(res,0,-1);
            return;
        }
        const mat = this.materials.find(mat => mat.id === res);
        mat.amt += amt;
        mat.seen = true;
        if (mat.amt === 0) $("#"+mat.id).hide();
        else $("#"+mat.id).show();
        $("#amt"+mat.id).html(formatToUnits(mat.amt,2));
        if (mat.id !== "M001") return;
        $goldSidebarAmt.html(formatToUnits(mat.amt,2));
        $goldSidebar.addClass("tooltip").attr("data-tooltip",`${mat.amt} Gold`);
    },
    canAffordMaterial(item) {
        if (item.mcost === null) return true;
        for (const [material, amt] of Object.entries(item.mcost)) {
            if (amt > this.materialAvailable(material)) return false;
        }
        return true;
    },
    deductMoney(amt) {
        this.addMaterial("M001",-amt);
    },
    deductMaterial(item) {
        if (item.mcost === null) return;
        for (const [resource, amt] of Object.entries(item.mcost)) {
            if (resource.charAt(0) === "R") {
                Inventory.removePrecraft(resource, amt);
                continue;
            }
            this.addMaterial(resource,-amt);
        }
    },
    refundMaterial(item) {
        if (item.mcost === null) return;
        for (const [resource,amt] of Object.entries(item.mcost)) {
            this.addMaterial(resource,amt);
        }
    },
    materialIcon(type) {
        if (type[0] === "R") return recipeList.idToItem(type).itemPic();
        return `<img src="images/resources/${type}.png" alt="${type}">`
    },
    formatCost(res,amt) {
        return this.materialIcon(res)+"&nbsp;"+amt;
    },
    sidebarMaterial(resID) {
        const res = this.materials.find(resource => resource.id == resID)
        return `${this.materialIcon(resID)}&nbsp;&nbsp${res.amt}`
    },
    available(res,amt) {
        const item = recipeList.idToItem(res);
        if (item === undefined) {
            return this.idToMaterial(res).amt >= amt;
        }
        return Inventory.itemCount(res,0) >= amt;
    },
    materialAvailable(matID) {
        if (matID.charAt(0) === "R") {
            return Inventory.itemCount(matID,0);
        }
        return this.materials.find(mat => mat.id === matID).amt;
    },
    nameForWorkerSac(mat) {
        const item = recipeList.idToItem(mat);
        if (item === undefined) return this.idToMaterial(mat).name;
        return item.name;
    },
    idToMaterial(matID) {
        if (matID.charAt(0) === "R") return recipeList.idToItem(matID);
        return this.materials.find(m=>m.id === matID);
    },
    isAMaterial(matID) {
        return this.materials.some(m=>m.id === matID);
    },
    addDungeonDrops(drops) {
        drops.forEach(d => {
            this.addMaterial(d.id,d.amt);
        })
    },
    reOrderMats() {
        this.materials.sort((a,b) => a.tier - b.tier);
    },
    fortuneResource(lvl) {
        const resources = this.materials.filter(r=>r.fortuneLvl===lvl);
        const week = currentWeek();
        const good = resources[week%resources.length].id;
        const great = resources[(week+1)%resources.length].id;
        const epic = resources[(week+2)%resources.length].id;
        return [good,great,epic];
    },
    materialSeenDungeon(dungeonID) {
        //returns a list of materials you've seen
        const matids = MobManager.allMobDropsByDungeon(dungeonID);
        const materials = matids.map(m => this.idToMaterial(m));
        return materials.filter(m => m.seen);
    }
}

const $materials = $("#materials");

function initializeMats() {
    ResourceManager.reOrderMats();
    ResourceManager.materials.forEach(mat => {
        if (mat.id != "M001") {
            const d = $("<div/>").addClass("material tooltip").attr("data-tooltip", mat.name).attr("id",mat.id);
            const d1 = $("<div/>").addClass("materialName").html(mat.img);
            const d2 = $("<div/>").addClass("materialAmt").attr("id","amt"+mat.id).html(formatToUnits(mat.amt,2));
            d.append(d1,d2);
            d.hide();
            $materials.append(d);
        }
    })
}

function hardMatRefresh() {
    //used when we first load in
    ResourceManager.materials.forEach(mat=> {
        if (mat.amt === 0) $("#"+mat.id).hide();
        else $("#"+mat.id).show();
        $("#amt"+mat.id).html(formatToUnits(mat.amt,2));
        if (mat.id === "M001") {
            $goldSidebarAmt.html(formatToUnits(mat.amt,2));
            $goldSidebar.addClass("tooltip").attr("data-tooltip",`${mat.amt} Gold`);
        }
    })
}

$(document).on("click",".material",(e) => {
    e.preventDefault();
    tabClick(e, "recipesTab");
    const matID = $(e.currentTarget).attr("id");
    initializeRecipes(matID,"default");
});