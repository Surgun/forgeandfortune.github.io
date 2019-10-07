"use strict";

const SkillManager = {
    skills : [],
    skillEffects : [],
    addSkill(skill) {
        this.skills.push(skill);
    },
    idToSkill(id) {
        return this.skills.find(skill => skill.id === id);
    },
}

const PlaybookManager = {
    playbookDB : [],
    addPlaybookTemplate(pb) {
        this.playbooks.push(pb);
    },
    idToPlaybook(id) {
        return this.playbooks.find(playbook => playbook.id === id);
    },
    generatePlayBook(playbookID) {
        const playbookTemplate = this.idToPlaybook(playbookID);
        return new Playbook(playbookTemplate);
    }
}

class playBookTemplate {
    constructor (props) {
        Object.assign(this, props);
        this.position = 0;
    }
}

class Skill {
    constructor (props) {
        Object.assign(this, props);
    }
    execute(attacker,allies,enemies) {
        const targets = this.targetEnemies ? getTarget(enemies, this.targetType) : getTarget(allies, this.targetType);
        const crit = this.canCrit ? rollStat(attacker.getCrit()) : false;
        const critDmg = crit ? attacker.critDmg : 1;
        const power = attacker.getPow() * this.powMod * critDmg;
        SkillManager.skillEffects[this.id](this,attacker,power,targets);
    }
}

class Playbook {
    constructor (pbTemplate) {
        Object.assign(this, pbTemplate);
        this.position = 0;
    }
    reset() {
        this.position = 0;
    }
}

SkillManager.skillEffects['S0001'] = function(skill,attacker,power,targets) {
    //Regular Attack
    const attack = new Attack(attacker, power, skill);
    targets.forEach(target => {
        target.takeDamage(attack);
    });
}