"use strict";

class buffTemplate {
    constructor (props) {
        Object.assign(this, props);
    }
}

class Buff {
    constructor (props,power) {
        Object.assign(this, props);
        this.turns = this.maxTurns;
        this.stacks = 1;
        this.power = power;
    }
    addCast() {
        if (this.onCast === "expire") {
            this.turns = this.maxTurns;
        }
        else if (this.onCast === "stack") {
            this.stacks = Math.min(this.stacks+1,this.maxStacks);
        }
    }
    createSave() {
        const save = {};
        save.turns = this.turns;
        save.stacks = this.stacks;
        save.power = this.power;
        save.id = this.id;
        return save;
    }
    loadSave(save) {
        this.turns = save.turns;
        this.stacks = save.stacks;
        this.power = save.power;
    }
    buffCache() {
        return {
            id : this.id,
            turns : this.turns,
            stacks : this.stacks,
            icon : this.icon,
        };
    }
    buffTick(uniqueid) {
        console.log("fire");
        if (this.onCast !== "expire") return;
        this.turns = Math.max(0,this.turns-1);
        if (this.turns === 0) BuffRefreshManager.removeBuff(this, uniqueid);
        else BuffRefreshManager.updateBuffCount(this, uniqueid);
    }
    expired() {
        return this.onCast === "expire" && this.turns === 0;
    }
}

const BuffManager = {
    buffDB : [],
    buffIDCount : 1,
    addBuffTemplate(buff) {
        this.buffDB.push(buff);
    },
    idToBuff(buffID) {
        return this.buffDB.find(b => b.id === buffID);
    },
    generateBuff(buffID,target,power) {
        const buffTemplate = this.idToBuff(buffID);
        if (target.hasBuff(buffID)) {
            const buff = target.getBuff(buffID);
            buff.addCast();
            BuffRefreshManager.updateBuffCount(buff,target);
            return;
        }
        const buff = new Buff(buffTemplate,power);
        buff.buffInstanceID = this.buffIDCount;
        this.buffIDCount += 1;
        target.addBuff(buff);
        BuffRefreshManager.addBuff(buff,target);
    },
    generateSaveBuff(buffID,power) {
        const buffTemplate = this.idToBuff(buffID);
        const buff = new Buff(buffTemplate,power);
        buff.buffInstanceID = this.buffIDCount;
        this.buffIDCount += 1;
        return buff;
    }
}

const BuffRefreshManager = {
    //this is responsible for tracking and updating buffs so we don't have to!
    hardRefreshBuff() {
        //populate the divs as they're supposed to be!
        const dungeon = DungeonManager.getCurrentDungeon();
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
        const count = (buff.onCast === "expire") ? buff.turns : buff.stacks;
        const d1 = $("<div/>").addClass("buffContainer").attr("id","bc"+uniqueid+buff.id);
            $("<div/>").addClass("buffContainerIcon").html(buff.icon).appendTo(d1);
            $("<div/>").addClass("buffContainerCount").attr("id","bcount"+uniqueid+buff.id).html(count).appendTo(d1);
        return d1;
    },
    addBuff(buff,combatant) {
        const buffList = $("#buffList"+combatant.uniqueid);
        buffList.append(this.makeBuffContainer(buff,combatant.uniqueid));
    },
    updateBuffCount(buff,combatant) {
        const count = (buff.onCast === "expire") ? buff.turns : buff.stacks;
        $("#bcount"+combatant.uniqueid+buff.id).html(count);
    },
    removeBuff(buff,combatant) {
        $("#bc"+combatant.uniqueid+buff.id).remove();
    }
}