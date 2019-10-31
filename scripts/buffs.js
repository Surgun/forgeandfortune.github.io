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
        if (this.application === "expire") {
            this.turns = this.maxTurns;
        }
        else if (this.application === "stack") {
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
            refreshBuff()
            return;
        }
        const buff = new Buff(buffTemplate,power);
        buff.buffInstanceID = this.buffIDCount;
        this.buffIDCount += 1;
        target.addBuff(buff);
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
    dungeon : null,
    allies : [],
    enemies : [],
    refreshBuff() {
        if (DungeonManager.dungeonView === this.dungeon) {
            this.softRefreshBuff();
            return;
        }
        this.this.dungeon = DungeonManager.dungeonView;
        this.hardRefreshBuff();
    },
    hardRefreshBuff() {
        //rebuild the cache
        this.dungeon = DungeonManager.dungeonView;
        const dungeon = DungeonManager.getCurrentDungeon();
        dungeon.party.forEach(hero => {
            const heroDiv = {};
            heroDiv.id = hero.id;
            heroDiv.buffs = [];
            hero.buffs.forEach(buff => {
                heroDiv.buffs.push(buff.buffCache());
            });
            this.allies.push(heroDiv);
        });
        dungeon.mobs.forEach(mob => {
            const mobDiv = {};
            mobDiv.id = mob.id;
            mobDiv.buffs = [];
            mob.buffs.forEach(buff => {
                mobDiv.buffs.push(buff.buffCache());
            });
            this.enemies.push(mobDiv);
        });
        //populate the divs as they're supposed to be!
        this.allies.forEach(ally => {
            const $heroDiv = $("#buff"+ally.id);
            $heroDiv.empty();
            ally.buffs.forEach(buff => {
                const d1 = $("<div/>").addClass("buffContainer").attr("id","bc"+ally.id+buff.id).appendTo($heroDiv);
                    $("<div/>").addClass("buffContainerIcon").html(buff.icon).appendTo(d1);
                    const count = (buff.onCast === "expire") ? buff.turns : buff.stacks;
                    $("<div/>").addClass("buffContainerCount").attr("id","bcount"+ally.id+buff.id).html(count).appendTo(d1);
            });
        });
        this.enemies.forEach(enemy => {
            const $enemyDiv = $("#buffList"+enemy.id);
            $enemyDiv.empty();
            enemy.buffs.forEach(buff => {
                const d2 = $("<div/>").addClass("buffContainer").attr("id","bc"+enemy.id+buff.id).appendTo($enemyDiv);
                    $("<div/>").addClass("buffContainerIcon").html(buff.icon).appendTo(d1);
                    const count = (buff.onCast === "expire") ? buff.turns : buff.stacks;
                    $("<div/>").addClass("buffContainerCount").attr("id","bcount"+enemy.id+buff.id).html(count).appendTo(d1);
            })
        })
    },
    softRefreshBuff() {
        //cycle through cached buffs and if mismatch update, if missing remove
        //cycle through real buffs and if missing add it
        const dungeon = DungeonManager.getCurrentDungeon();
        //update existing buffs
        this.allies.forEach(ally => {
            const hero = dungeon.party.find(hero => hero.uniqueid === ally.uniqueid);
            if (hero !== undefined) this.updateBuffs(hero);
        });
        this.enemies.forEach(enemy => {
            const mob = dungeon.mobs.find(mob => mob.uniqueid === enemy.uniqueid);
            if (mob !== undefined) this.updateBuffs(mob);
        });
        //remove references that don't exist (we don't need to change DOM it would have done that for us)
        this.allies = this.allies.filter(ally => dungeon.party.map(h=>h.uniqueid).includes(ally.uniqueid));
        this.enemies = this.enemies.filter(enemy => dungeon.mobs.map(h=>h.uniqueid).includes(enemy.uniqueid));
        //add missing
        dungeon.party.forEach(hero => {
            const cacheHero = this.allies.find(hero => hero.uniqueid === hero.uniqueid);
            if (cacheHero === 
        });
    },
    updateBuffs(combatant) {
        const toRemove = [];
        combatant.buffs.forEach(buff => {
            const currentBuff = combatant.getBuff(buff.id);
            if (currentBuff === undefined) {
                //buff is gone, chuck it
                toRemove.push(buff.id);
                $("#bc"+combatant.uniqueid+buff.id).remove();
                return;
            }
            if (buff.turns !== currentBuff.turns || buff.stacks !== currentBuff.stacks) {
                //update the number
                const count = (currentBuff.onCast === "expire") ? buff.turns : buff.stacks;
                $("#bcount"+combatant.uniqueid+buff.id).html(count);
                buff.turns = currentBuff.turns;
                buff.stacks = currentBuff.stacks;
            }
        });
        combatant.buffs = combatant.buffs.filter(buff=>toRemove.includes(buff.id));
    }
}