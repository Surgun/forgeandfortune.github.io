"use strict";

class Worker {
    constructor(props) {
        Object.assign(this, props);
        this.pic = '<img src="images/workers/'+this.workerID+'.gif">';
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
            const freeworkers = this.workers.filter(worker=> worker.status === "idle");
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
        const canProduceBucket = canProduce.reduce((a, c) => (a[c] = (a[c] || 0) + 1, a), Object.create(null));
        const needBucket = item.gcost.reduce((a, c) => (a[c] = (a[c] || 0) + 1, a), Object.create(null));
        for (const [res, amt] of Object.entries(needBucket)) {
            if (canProduceBucket[res] < amt) return false;
        }
        return true;
    },
    canCurrentlyCraft(item) {
        const canProduce = this.workers.filter(w=> w.owned && w.status === "idle").map(w=>w.production);
        const canProduceBucket = canProduce.reduce((a, c) => (a[c] = (a[c] || 0) + 1, a), Object.create(null));
        const needBucket = item.gcost.reduce((a, c) => (a[c] = (a[c] || 0) + 1, a), Object.create(null));
        for (const [res, amt] of Object.entries(needBucket)) {
            if (canProduceBucket[res] < amt) return false;
        }
        return true;
    },
    filterByGuild(guildID) {
        return this.workers.filter(r=>r.guildUnlock === guildID);
    },
    getNextGuildLevel(id,lvl) {
        const guilds = this.filterByGuild(id);
        const left = guilds.filter(g => g.repReqForBuy() > lvl);
        return left.sort((a,b) => a.repReqForBuy() - b.repReqForBuy())[0];
    },
    freeByGuild(gid) {
        return this.workers.filter(w => w.production === gid && w.owned && w.status === "idle").length;
    },
    ownedByGuild(gid) {
        return this.workers.filter(w => w.production === gid && w.owned).length;
    }
}

const $workersUse = $("#workersUse");

const $G001WorkerFree = $("#G001WorkerFree");
const $G002WorkerFree = $("#G002WorkerFree");
const $G003WorkerFree = $("#G003WorkerFree");
const $G004WorkerFree = $("#G004WorkerFree");
const $G001Workers = $("#G001Workers");
const $G002Workers = $("#G002Workers");
const $G003Workers = $("#G003Workers");
const $G004Workers = $("#G004Workers");

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
    $G001WorkerFree.html(WorkerManager.freeByGuild("G001"));
    $G002WorkerFree.html(WorkerManager.freeByGuild("G002"));
    $G003WorkerFree.html(WorkerManager.freeByGuild("G003"));
    $G004WorkerFree.html(WorkerManager.freeByGuild("G004"));
    if (WorkerManager.ownedByGuild("G001")) $G001Workers.show();
    else $G001Workers.hide();
    if (WorkerManager.ownedByGuild("G002")) $G002Workers.show();
    else $G002Workers.hide();
    if (WorkerManager.ownedByGuild("G003")) $G003Workers.show();
    else $G003Workers.hide();
    if (WorkerManager.ownedByGuild("G004")) $G004Workers.show();
    else $G004Workers.hide();
};

$(document).on("click", ".workerSideBar", (e) => {
    //unslot an action slot for worker if assigned
    e.preventDefault();
    const craft = $(e.currentTarget).attr("id");
    if (craft === "idle") return;
    actionSlotManager.removeID(craft);
});
