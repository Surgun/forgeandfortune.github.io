"use strict";

class Worker {
    constructor(props) {
        Object.assign(this, props);
        this.pic = '<img src="images/workers/'+this.workerID+'.gif">';
        this.prodpic = '<img src="images/resources/'+this.production+'.png">';
        this.owned = false;
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
    canProduceBucket : {},
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
        recipeList.canCraft();
        refreshProgress();
        refreshAllGuildWorkers();
    },
    canCurrentlyProduce() {

    },
    couldCraft(item) {
        const canProduce = this.workers.filter(w=> w.owned).map(w=>w.production);
        const canProduceBucket = groupArray(canProduce);
        const needBucket = groupArray(item.gcost);
        for (const [res, amt] of Object.entries(needBucket)) {
            if (canProduceBucket[res] === undefined || canProduceBucket[res] < amt) return false;
        }
        return true;
    },
    canCurrentlyCraft(item) {
        const needBucket = groupArray(item.gcost);
        for (const [res, amt] of Object.entries(needBucket)) {
            if (this.canProduceBucket[res] === undefined || this.canProduceBucket[res] < amt) return false;
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
        const usage = actionSlotManager.usage();
        if (usage[gid] === undefined) return this.ownedByGuild(gid);
        return this.ownedByGuild(gid) - usage[gid];
    },
    ownedByGuild(gid) {
        return this.workers.filter(w => w.production === gid && w.owned).length;
    },
    getCurrentProduceAvailable() {
        const gid = ["G001","G002","G003","G004"];
        const canProduceBucket = {};
        gid.forEach(g => {
            canProduceBucket[g] = this.freeByGuild(g);
        });
        return canProduceBucket;
    }
}

const $G001WorkerFree = $("#G001WorkerFree");
const $G002WorkerFree = $("#G002WorkerFree");
const $G003WorkerFree = $("#G003WorkerFree");
const $G004WorkerFree = $("#G004WorkerFree");
const $G001WorkersSide = $("#G001WorkersSide");
const $G002WorkersSide = $("#G002WorkersSide");
const $G003WorkersSide = $("#G003WorkersSide");
const $G004WorkersSide = $("#G004WorkersSide");

function refreshSideWorkers() {
    const g1free = WorkerManager.freeByGuild("G001");
    const g2free = WorkerManager.freeByGuild("G001");
    const g3free = WorkerManager.freeByGuild("G001");
    const g4free = WorkerManager.freeByGuild("G001");
    $G001WorkerFree.html(g1free);
    $G002WorkerFree.html(g2free);
    $G003WorkerFree.html(g3free);
    $G004WorkerFree.html(g4free);
    if (g1free > 0) $G001WorkersSide.removeClass("noWorkersAvailable");
    else $G001WorkersSide.addClass("noWorkersAvailable");
    if (g2free > 0) $G002WorkersSide.removeClass("noWorkersAvailable");
    else $G002WorkersSide.addClass("noWorkersAvailable");
    if (g3free > 0) $G003WorkersSide.removeClass("noWorkersAvailable");
    else $G003WorkersSide.addClass("noWorkersAvailable");
    if (g4free > 0) $G004WorkersSide.removeClass("noWorkersAvailable");
    else $G004WorkersSide.addClass("noWorkersAvailable");
    if (WorkerManager.ownedByGuild("G001") > 0) $G001WorkersSide.show();
    else $G001WorkersSide.hide();
    if (WorkerManager.ownedByGuild("G002") > 0) $G002WorkersSide.show();
    else $G002WorkersSide.hide();
    if (WorkerManager.ownedByGuild("G003") > 0) $G003WorkersSide.show();
    else $G003WorkersSide.hide();
    if (WorkerManager.ownedByGuild("G004") > 0) $G004WorkersSide.show();
    else $G004WorkersSide.hide();
};