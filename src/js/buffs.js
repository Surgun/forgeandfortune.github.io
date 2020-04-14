"use strict";

class buffTemplate {
    constructor (props) {
        Object.assign(this, props);
    }
}

class Buff {
    constructor (buffTemplate,target,power) {
        Object.assign(this, buffTemplate);
        this.stacks = this.stackCast;
        this.target = target;
        this.power = power;
    }
    addCast() {
        if (this.onCast === "refresh") {
            this.stacks = this.stackCast;
        }
        else if (this.onCast === "stack") {
            this.stacks = Math.min(this.stacks+this.stackCast,this.maxStack);
        }
    }
    createSave() {
        const save = {};
        save.stacks = this.stacks;
        save.power = this.power;
        save.id = this.id;
        return save;
    }
    loadSave(save) {
        this.stacks = save.stacks;
    }
    buffTick(type,attack) {
        if (type === "onTurn") this.onTick();
        if (type === "onHit") this.onHit(attack);
        if (type === "onHitting") this.onHitting();
        if (type !== this.decrease) return;
        this.stacks -= 1;
        if (this.stacks <= 0) BuffRefreshManager.removeBuff(this, this.target);
        else BuffRefreshManager.updateBuffCount(this, this.target);
    }
    expired() {
        return this.stacks <= 0;
    }
    onTick() { return; }
    onHit() { return; }
    onHitting() { return; }
    getPow() { return 0; }
    getTech() { return 0; }
    isChilled() { return false; }
    isWilt() { return false; }
    getProtection() { return 0; }
    getVulnerability() { return 0; }
    maxHP() { return 0; }
}

const BuffManager = {
    buffDB : [],
    addBuffTemplate(buff) {
        this.buffDB.push(buff);
    },
    idToBuff(buffID) {
        return this.buffDB.find(b => b.id === buffID);
    },
    generateBuff(buffID,target,power=0) {
        if (target.hasBuff(buffID)) {
            const buff = target.getBuff(buffID);
            buff.addCast();
            BuffRefreshManager.updateBuffCount(buff,target);
            return;
        }
        const buffTemplate = this.idToBuff(buffID);
        const buff = new BuffLookup[buffID](buffTemplate,target,power);
        target.addBuff(buff);
        BuffRefreshManager.addBuff(buff,target);
    },
    removeBuff(buffID,target) {
        if (!target.hasBuff(buffID)) return;
        const buff = target.getBuff(buffID);
        target.removeBuff(buffID);
        BuffRefreshManager.removeBuff(buff,target);
    },
    generateSaveBuff(buffID,target,power) {
        const buffTemplate = this.idToBuff(buffID);
        const buff = new BuffLookup[buffID](buffTemplate,target,power);
        return buff;
    }
}

const BuffRefreshManager = {
    //this is responsible for tracking and updating buffs so we don't have to!
    hardRefreshBuff() {
        //populate the divs as they're supposed to be!
        const dungeon = DungeonManager.dungeonByID(DungeonManager.dungeonView);
        dungeon.party.heroes.forEach(ally => {
            const $heroDiv = $("#buffList"+ally.uniqueid);
            $heroDiv.empty();
            ally.buffs.forEach(buff => {
                this.makeBuffContainer(buff,ally.uniqueid).appendTo($heroDiv);
            });
        });
        dungeon.mobs.forEach(enemy => {
            const $enemyDiv = $("#buffList"+enemy.uniqueid);
            $enemyDiv.empty();
            enemy.buffs.forEach(buff => {
                this.makeBuffContainer(buff,enemy.uniqueid).appendTo($enemyDiv);
            });
        })
    },
    makeBuffContainer(buff,uniqueid) {
        const d1 = $("<div/>").addClass("buffContainer tooltip").attr("id","bc"+uniqueid+buff.id).attr({"data-tooltip": "buff_desc", "data-tooltip-value": buff.id});;
            $("<div/>").addClass("buffContainerIcon").html(buff.icon).appendTo(d1);
            $("<div/>").addClass("buffContainerCount").attr("id","bcount"+uniqueid+buff.id).html(buff.stacks).appendTo(d1);
        return d1;
    },
    addBuff(buff,combatant) {
        const buffList = $("#buffList"+combatant.uniqueid);
        buffList.append(this.makeBuffContainer(buff,combatant.uniqueid));
    },
    updateBuffCount(buff,combatant) {
        $("#bcount"+combatant.uniqueid+buff.id).html(buff.stacks);
    },
    removeBuff(buff,combatant) {
        $("#bc"+combatant.uniqueid+buff.id).remove();
    }
}

class B0010 extends Buff {
    constructor (buffTemplate,target,power) {
        super(buffTemplate,target,power);
    }
    getProtection() {
        return 0.5;
    }
}

class B0020 extends Buff {
    constructor (buffTemplate,target,power) {
        super(buffTemplate,target,power);
    }
    maxHP() {
        return this.power*this.stacks;
    }
}

class B1010 extends Buff {
    constructor (buffTemplate,target,power) {
        super(buffTemplate,target,power);
    }
    onHitting() {
        this.target.takeDamage(this.power);
    }
}

class B1020 extends Buff {
    constructor (buffTemplate,target,power) {
        super(buffTemplate,target,power);
    }
    isChilled() {
        return true;
    }
}

class B2010 extends Buff {
    constructor (buffTemplate,target,power) {
        super(buffTemplate,target,power);
    }
    getTech() {
        return this.power;
    }
}

class BM102 extends Buff {
    constructor (buffTemplate,target,power) {
        super(buffTemplate,target,power);
    }
    isWilt() {
        return true;
    }
}

class BM200 extends Buff {
    constructor (buffTemplate,target,power) {
        super(buffTemplate,target,power);
    }
    getProtection() {
        return 1;
    }
}

class BM902 extends Buff {
    constructor (buffTemplate,target,power) {
        super(buffTemplate,target,power);
    }
    onHitting() {
        this.target.takeDamage(this.power*this.stacks);
    }
}

class BM902A extends Buff {
    constructor (buffTemplate,target,power) {
        super(buffTemplate,target,power);
    }
    getProtection() {
        return 0.75;
    }
}

class BM902B extends Buff {
    constructor (buffTemplate,target,power) {
        super(buffTemplate,target,power);
    }
    maxHP() {
        return -Math.floor(this.target.hpmax/10)*this.stacks;
    }
}

class BM903A extends Buff {
    constructor (buffTemplate,target,power) {
        super(buffTemplate,target,power);
    }
    getVulnerability(attacker) {
        if (attacker.type === "Might") return 1;
        return 0;
    }
}

class BM903B extends Buff {
    constructor (buffTemplate,target,power) {
        super(buffTemplate,target,power);
    }
    getVulnerability(attacker) {
        if (attacker.type === "Mind") return 1;
        return 0;
    }
}

class BM903C extends Buff {
    constructor (buffTemplate,target,power) {
        super(buffTemplate,target,power);
    }
    getVulnerability(attacker) {
        if (attacker.type === "Moxie") return 1;
        return 0;
    }
}

class BM903D extends Buff {
    constructor (buffTemplate,target,power) {
        super(buffTemplate,target,power);
    }
    getProtection() {
        return this.stacks * 0.1
    }
}

class BM903E extends Buff {
    constructor (buffTemplate,target,power) {
        super(buffTemplate,target,power);
    }
}

class BM903F extends Buff {
    constructor (buffTemplate,target,power) {
        super(buffTemplate,target,power);
    }
    getVulnerability() {
        return this.stacks * 0.2;
    }
}

const BuffLookup = {
    B0010,
    B0020, 
    B1010,
    B1020,
    B2010,
    BM102,
    BM200,
    BM902,
    BM902A,
    BM902B,
    BM903A,
    BM903B,
    BM903C,
    BM903D,
    BM903E,
    BM903F,
}