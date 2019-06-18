"use strict";

class Worker {
    constructor(props) {
        Object.assign(this, props);
        this.pic = '<img src="images/workers/'+this.name+'.gif">';
        this.prodpic = '<img src="images/resources/'+this.production+'.png">';
        this.owned = false;
        this.status = "idle";
    }
    createSave() {
        const save = {};
        save.id = this.workerID;
        save.owned = this.owned;
        return save;
    }
    loadSave(save) {
        this.owned = save.owned;
    }
    productionText() {
        return `<span class="production_type">${ResourceManager.materialIcon(this.production)}</span><span class="production_text">Worker</span>`;
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
    gainWorker(workerID) {
        const worker = this.workerByID(workerID);
        worker.owned = true;
        refreshSideWorkers();
        refreshRecipeFilters();
        recipeCanCraft();
        refreshProgress();
        refreshAllGuildWorkers();
    },
    assignWorker(item) {
        item.gcost.forEach(res => {
            const freeworkers = this.workers.filter(worker=>worker.status === "idle");
            const chosenworker = freeworkers.filter(worker => worker.production === res && worker.owned)[0];
            chosenworker.status = item.id;
        });
    },
    reallocate() {
        //reassign workers as appropriate
        this.workers.forEach(worker => worker.status = "idle");
        const items = actionSlotManager.itemList();
        items.forEach(item => {
            this.assignWorker(item);
        })
    },
    couldCraft(item) {
        const canProduce = this.workers.filter(w=> w.owned).map(w=>w.production);
        const difference = item.gcost.filter(x => !canProduce.includes(x));
        return difference.length === 0;
    },
    canCurrentlyCraft(item) {
        const canProduce = this.workers.filter(w=> w.owned && w.status === "idle").map(w=>w.production);
        const difference = item.gcost.filter(x => !canProduce.includes(x));
        return difference.length === 0;
    },
    filterByGuild(guildID) {
        return this.workers.filter(r=>r.guildUnlock === guildID);
    },
}

const $workersUse = $("#workersUse");

function refreshSideWorkers() {
    $workersUse.empty();
    WorkerManager.reallocate();
    WorkerManager.workers.filter(w=>w.owned).forEach(worker => {
        const d = $("<div/>").addClass("workerSideBar").attr("id",worker.status);
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
        d.append(d2,d3);
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