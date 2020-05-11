"use strict";

class buffTemplate {
    constructor (props) {
        Object.assign(this, props);
    }
}

class Buff {
    constructor (buffTemplate,target,power,power2) {
        Object.assign(this, buffTemplate);
        this.stacks = this.stackCast;
        this.target = target;
        this.power = power;
        this.power2 = power2;
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
        save.power2 = this.power2;
        save.id = this.id;
        return save;
    }
    loadSave(save) {
        this.stacks = save.stacks;
    }
    buffTick(type,attack) {
        if (type === "onMyTurn") this.onTick();
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
    isLifeTapped() { return false; }
    getProtection() { return 0; }
    getVulnerability() { return 0; }
    maxHP() { return 0; }
    mark() { return false; }
    debuffImmune() { return false; }
    thorns() { return 0; }
    parry() { return 0; }
    beornTank() { return 0; }
}

const BuffManager = {
    buffDB : [],
    addBuffTemplate(buff) {
        this.buffDB.push(buff);
    },
    idToBuff(buffID) {
        return this.buffDB.find(b => b.id === buffID);
    },
    generateBuff(buffID,target,power=0,power2=0) {
        if (target.debuffImmune()) return;
        if (target.hasBuff(buffID)) {
            const buff = target.getBuff(buffID);
            buff.addCast();
            BuffRefreshManager.updateBuffCount(buff,target);
            return;
        }
        const buffTemplate = this.idToBuff(buffID);
        const buff = new BuffLookup[buffID](buffTemplate,target,power,power2);
        target.addBuff(buff);
        BuffRefreshManager.addBuff(buff,target);
    },
    removeBuff(buffID,target) {
        if (!target.hasBuff(buffID)) return;
        const buff = target.getBuff(buffID);
        target.removeBuff(buffID);
        BuffRefreshManager.removeBuff(buff,target);
    },
    clearBuffs(target) {
        target.buffs.forEach(buff => {
            this.removeBuff(buff.id,target);
        })
    },
    generateSaveBuff(buffID,target,power,power2=0) {
        const buffTemplate = this.idToBuff(buffID);
        const buff = new BuffLookup[buffID](buffTemplate,target,power,power2);
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
        return this.power;
    }
}

class B0011 extends Buff {
    constructor (buffTemplate,target,power) {
        super(buffTemplate,target,power);
    }
    parry() {
        return this.power;
    }
    getProtection() {
        return 1;
    }
}

class B0012 extends Buff {
    constructor (buffTemplate,target,power) {
        super(buffTemplate,target,power);
    }
    getProtection() {
        return this.power;
    }
    beornTank() {
        return 1-this.power;
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

class B0021 extends Buff {
    constructor (buffTemplate,target,power) {
        super(buffTemplate,target,power);
    }
    mark() {
        return true;
    }
}

class B0022 extends Buff {
    constructor (buffTemplate,target,power,power2) {
        super(buffTemplate,target,power);
        this.power2 = power2;
    }
    maxHP() {
        return -this.power*this.stacks;
    }
    pow() {
        return this.power2*this.stacks;
    }
}

class B0041 extends Buff {
    constructor (buffTemplate,target,power) {
        super(buffTemplate,target,power);
    }
}

class B0042 extends Buff {
    constructor (buffTemplate,target,power) {
        super(buffTemplate,target,power);
    }
    pow() {
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

class B1012 extends Buff {
    constructor (buffTemplate,target,power) {
        super(buffTemplate,target,power);
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

class B1022 extends Buff {
    constructor (buffTemplate,target,power) {
        super(buffTemplate,target,power);
    }
    getProtection() {
        return 1.0;
    }
}

class B1030 extends Buff {
    constructor (buffTemplate,target,power) {
        super(buffTemplate,target,power);
    }
    onTick() {
        this.target.takeDamage(this.power*this.stacks);
    }
    isLifeTapped() {
        return true;
    }
}

class B1042 extends Buff {
    constructor (buffTemplate,target,power) {
        super(buffTemplate,target,power);
    }
    onTick() {
        this.target.heal(this.power);
    }
}

class B2010 extends Buff {
    constructor (buffTemplate,target,power) {
        super(buffTemplate,target,power);
    }
    getHP() {
        return this.power*this.stacks;
    }
}

class B2011 extends Buff {
    constructor (buffTemplate,target,power) {
        super(buffTemplate,target,power);
    }
    getPow() {
        return this.power*this.stacks;
    }
}

class B2012 extends Buff {
    constructor (buffTemplate,target,power) {
        super(buffTemplate,target,power);
    }
    getTech() {
        return this.power*this.stacks;
    }
}

class B2040 extends Buff {
    constructor (buffTemplate,target,power) {
        super(buffTemplate,target,power);
    }
    mark() {
        return true;
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
    thorns() {
        return this.power;
    }
}

class BM904A extends Buff {
    constructor (buffTemplate,target,power) {
        super(buffTemplate,target,power);
    }
    getProtection() {
        return 1;
    }
    debuffImmune() {
        return true;
    }
}

class BM905A extends Buff {
    constructor (buffTemplate,target,power) {
        super(buffTemplate,target,power);
    }
    getVulnerability(attacker) {
        if (attacker.type === "Might") return 1;
        return 0;
    }
}

class BM905B extends Buff {
    constructor (buffTemplate,target,power) {
        super(buffTemplate,target,power);
    }
    getVulnerability(attacker) {
        if (attacker.type === "Mind") return 1;
        return 0;
    }
}

class BM905C extends Buff {
    constructor (buffTemplate,target,power) {
        super(buffTemplate,target,power);
    }
    getVulnerability(attacker) {
        if (attacker.type === "Moxie") return 1;
        return 0;
    }
}

class BM905D extends Buff {
    constructor (buffTemplate,target,power) {
        super(buffTemplate,target,power);
    }
    getProtection() {
        return this.stacks * 0.1
    }
}

class BM905E extends Buff {
    constructor (buffTemplate,target,power) {
        super(buffTemplate,target,power);
    }
}

class BM905F extends Buff {
    constructor (buffTemplate,target,power) {
        super(buffTemplate,target,power);
    }
    getVulnerability() {
        return this.stacks * 0.2;
    }
}

class BM906 extends Buff {
    constructor (buffTemplate,target,power) {
        super(buffTemplate,target,power);
    }
    onHitting() {
        this.target.takeDamage(this.power*this.stacks);
    }
}

class BM906A extends Buff {
    constructor (buffTemplate,target,power) {
        super(buffTemplate,target,power);
    }
    getProtection() {
        return 0.75;
    }
}

class BM906B extends Buff {
    constructor (buffTemplate,target,power) {
        super(buffTemplate,target,power);
    }
    maxHP() {
        return -Math.floor(this.target.hpmax/10)*this.stacks;
    }
}

const BuffLookup = {
    B0010,
    B0011,
    B0012,
    B0020,
    B0021,
    B0022,
    B0041,
    B0042,
    B1010,
    B1012,
    B1020,
    B1022,
    B1030,
    B1042,
    B2010,
    B2011,
    B2012,
    B2040,
    BM102,
    BM200,
    BM902,
    BM904A,
    BM905A,
    BM905B,
    BM905C,
    BM905D,
    BM905E,
    BM905F,
    BM906,
    BM906A,
    BM906B,
}