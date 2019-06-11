Math.seededRandom = () => {
    Math.seed = (Math.seed * 9301 + 49297) % 233280;
    return Math.seed / 233280;
}

/*function randomNormal(a,b) {
    const adj = ((Math.random() + Math.random() + Math.random() + Math.random() + Math.random() + Math.random()) - 3) / 3
    const adjFull = (b*(1+adj)+a*(1-adj))/2
    return Math.round(adjFull);
}*/

function seedCreateSave() {
    return [wsSeed,hbSeed,wbSeed];
}

const DungeonSeedManager = {
    getFloorSeed(dungeonID,floor) {
        if (this[dungeonID] === undefined) this[dungeonID] = [DungeonManager.dungeonByID(dungeonID).seed];
        dungeonSeedList = this[dungeonID];
        while (dungeonSeedList.length < floor) {
            const num = dungeonSeedList[dungeonSeedList.length-1];
            dungeonSeedList.push((num * 9301 + 49297) % 233280)
        };
        return dungeonSeedList[floor-1] / 233280;
    }
}

const GuildSeedManager = {
    G001 : 1,
    G002 : 2,
    G003 : 3,
    G004 : 4,
    G005 : 5,
    createSave() {
        const save = {};
        save.G001 = this.G001;
        save.G002 = this.G002;
        save.G003 = this.G003;
        save.G004 = this.G004;
        save.G005 = this.G005;
        return save;
    },
    loadSave(save) {
        this.G001 = save.G001;
        this.G002 = save.G002;
        this.G003 = save.G003;
        this.G004 = save.G004;
        this.G005 = save.G005;
    },
    fauxRand(gid) {
        this[gid] = (this[gid] * 9301 + 49297) % 233280;
        return this[gid] / 233280;
    }
}

function getRandomFromItem(item) {
    item.seed = (item.seed * 9301 + 49297) % 233280;
    return Math.floor(item.seed/233280*100);
} 
