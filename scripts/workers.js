"use strict";

class Worker {
    constructor(props) {
        Object.assign(this, props);
        this.lvl = 1;
        this.pic = '<img src="images/workers/'+this.name+'.gif">';
        this.prodpic = '<img src="images/resources/'+this.production+'.png">';
        this.donated = {};
        this.owned = false;
        this.assigned = false;
        this.status = "idle";
        this.maxlvl = 10;
    }
    createSave() {
        const save = {};
        save.id = this.workerID;
        save.lvl = this.lvl;
        save.donated = this.donated;
        save.owned = this.owned;
        return save;
    }
    loadSave(save) {
        this.lvl = save.lvl;
        this.donated = save.donated;
        this.owned = save.owned;
    }
    produces(resource) {
        if (!this.owned) return 0;
        if (resource in this.production) return this.production[resource] * this.lvl;
        return 0;
    }
    upgradeWorker() {
        if (ResourceManager.materialAvailable("M001") < this.numToDonate("M001")) {
            Notifications.workerGoldReq();
            return;
        }
        if (!this.canUpgrade()) return;
        ResourceManager.deductMoney(this.numToDonate("M001"));
        this.lvl += 1;
        this.clearDonation();
        refreshWorkers();
    }
    productionText() {
        return `<span class="production_type">${ResourceManager.materialIcon(this.production)}</span><span class="production_text">Worker</span>`;
    }
    goldCostLvl() {
        return this.goldCost[this.lvl];
    }
}

const WorkerManager = {
    workers : [],
    addWorker(worker) {
        this.workers.push(worker);
    },
    createSave() {
        const save = [];
        this.workers.forEach(w=> {
            save.push(w.createSave());
        });
        return save;
    },
    loadSave(save) {
        save.forEach(w=> {
            const worker = this.workerByID(w.id);
            worker.loadSave(w);
        });
    },
    workerByID(id) {
        return this.workers.find(worker => worker.workerID === id);
    },
    upgradeWorker(workerID) {
        const worker = this.workerByID(workerID);
        worker.upgradeWorker();
        refreshRecipeFilters();
        refreshSideWorkers();
        recipeCanCraft();
        refreshBlueprint();
        refreshProgress();
    },
    gainWorker(workerID) {
        const worker = this.workerByID(workerID);
        worker.owned = true;
        refreshSideWorkers();
        refreshRecipeFilters();
        recipeCanCraft();
        refreshProgress();
    },
    assignWorker(item) {
        const lvl = item.lvl;
        item.rcost.forEach(res => {
            const freeworkers = this.workers.filter(worker=>worker.status === "idle");
            const chosenworker = freeworkers.filter(worker => worker.production === res && worker.owned && worker.lvl >= lvl).sort((a,b) => a.lvl - b.lvl)[0];
            chosenworker.status = item.id;
        });
    },
    nextAvailable(res,lvl) {
        const freeworkers = this.workers.filter(worker => worker.status === "idle" && worker.owned && worker.production === res && worker.lvl >= lvl)
        if (freeworkers.length == 0) return false;
        return freeworkers.sort((a,b) => a.lvl-b.lvl)[0]
    },
    reallocate() {
        //reassign workers as appropriate
        this.workers.forEach(worker => worker.status = "idle");
        const items = actionSlotManager.itemList().sort((a,b) => b.lvl-a.lvl);
        items.forEach(item => {
            this.assignWorker(item);
        })
    },
    couldCraft(item) {
        const canProduce = this.workers.filter(w=> w.lvl >= item.lvl && w.owned).map(w=>w.production);
        const difference = item.rcost.filter(x => !canProduce.includes(x));
        return difference.length === 0;
    },
    canCurrentlyCraft(item) {
        const canProduce = this.workers.filter(w=> w.lvl >= item.lvl && w.owned && w.status === "idle").map(w=>w.production);
        const difference = item.rcost.filter(x => !canProduce.includes(x));
        return difference.length === 0;
    },
    lvlByType(production) {
        const workerLvls = this.workers.filter(w=> w.owned && w.production === production).map(w=>w.lvl);
        return Math.max(...workerLvls);
    },
    workerLevelCount() {
        return this.workers.filter(w=>w.owned).map(w=>w.lvl).reduce((a,b) => a+b,0);
    },
    workerMaxLevelCount() {
        return this.workers.length*10;
    },
    filterByGuild(guildID) {
        return this.workers.filter(r=>r.guildUnlock === guildID);
    },
    getNextGuildLevel(id,lvl) {
        const guilds = this.filterByGuild(id);
        const left = guilds.filter(g => g.repReqForBuy() > lvl);
        return left.sort((a,b) => a.repReqForBuy() - b.repReqForBuy())[0];
    },
}

const $workersUse = $("#workersUse");

function refreshSideWorkers() {
    $workersUse.empty();
    WorkerManager.reallocate();
    WorkerManager.workers.filter(w=>w.owned).forEach(worker => {
        const d = $("<div/>").addClass("workerSideBar").attr("id",worker.status);
        const d1 = $("<div/>").addClass("wsbLvl tooltip").attr("data-tooltip", "Worker Level").html(worker.lvl);
        const d2 = $("<div/>").addClass("wsbType").html(worker.prodpic+"&nbsp;"+worker.name);
        const d3 = $("<div/>").addClass("wsbCraft");
        if (worker.status === "idle") {
            d.addClass("wsbIdle");
            d3.html("Idle");
        }
        else {
            const item = recipeList.idToItem(worker.status);
            d.addClass("wsbActive");
            d3.html(item.itemPic()).addClass("tooltip").attr("data-tooltip","Cancel crafting " + item.name);
        }
        d.append(d1,d2,d3);
        $workersUse.append(d);
    });
};

$(document).on("click", ".workerSideBar", (e) => {
    //unslot an action slot for worker if assigned
    e.preventDefault();
    const craft = $(e.currentTarget).attr("id");
    if (craft === "idle") return;
    actionSlotManager.removeID(craft);
});