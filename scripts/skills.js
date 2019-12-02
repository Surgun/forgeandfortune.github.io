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
        this.playbookDB.push(pb);
    },
    idToPlaybook(id) {
        return this.playbookDB.find(playbook => playbook.id === id);
    },
    generatePlayBook(playbookID) {
        const playbookTemplate = this.idToPlaybook(playbookID);
        return new Playbook(playbookTemplate);
    }
}

class playBookTemplate {
    constructor (props) {
        Object.assign(this, props);
    }
}

class Skill {
    constructor (props) {
        Object.assign(this, props);
    }
    execute(attacker,allies,enemies,dungeonid) {
        const target = this.targetEnemies ? getTarget(enemies, attacker, this.targetType) : getTarget(allies, attacker, this.targetType);
        const crit = this.canCrit ? rollStat(attacker.getCrit()) : false;
        const critDmg = crit ? attacker.critDmg : 1;
        const power = attacker.getPow() * this.powMod * critDmg;
        BattleLog.addEntry(dungeonid,this.icon,this.battleText(attacker.name,target.name,power))
        SkillManager.skillEffects[this.id](this,attacker,power,target,dungeonid);
    }
    battleText(attacker,defender,damage) {
        let battleTextEdit = this.bText.replace("#ATTACKER#",attacker);
        battleTextEdit = battleTextEdit.replace("#DEFENDER#",defender);
        return battleTextEdit.replace("#DAMAGE#",damage);
    } 
}

class Playbook {
    constructor (pbTemplate) {
        Object.assign(this, pbTemplate);
        this.skills = [
            SkillManager.idToSkill(this.skill1),
            SkillManager.idToSkill(this.skill2),
            SkillManager.idToSkill(this.skill3),
            SkillManager.idToSkill(this.skill4),
        ];
        this.position = 0;
    }
    reset() {
        this.position = 0;
    }
    nextSkill() {
        const skill = this.skills[this.position];
        this.position += 1;
        if (this.position >= 4) this.position = 0;
        return skill;
    }
    getSkillIcons() {
        return this.skills.map(s=>s.icon);
    }
    getSkillIDs() {
        return this.skills.map(s=>s.id);
    }
    skillCount() {
        return this.position;
    }
}

SkillManager.skillEffects['S0001'] = function(skill,attacker,power,target,dungeonid) {
    //Regular Attack
    const attack = new Attack(attacker, power, skill, dungeonid);
    target.takeAttack(attack);
}

SkillManager.skillEffects['S0002'] = function (skill,attacker,power,target,dungeonid) {
    //Power Attack
    const attack = new Attack(attacker, power, skill, dungeonid);
    target.takeAttack(attack);
    target.takeAttack(attack);
}

SkillManager.skillEffects['S0003'] = function (skill,attacker,power,target,dungeonid) {
    //Armor Buff
    BuffManager.generateBuff('B0003',target,power);
}

SkillManager.skillEffects['S0004'] = function (skill,attacker,power,target,dungeonid) {
    //Meteor
    const attack = new Attack(attacker, power, skill, dungeonid);
    target.forEach(t => t.takeAttack(attack));
}

SkillManager.skillEffects['S0005'] = function (skill,attacker,power,target,dungeonid) {
    const attack = new Attack(attacker, power, skill, dungeonid);
    target.takeAttack(attack);
    target.takeAttack(attack);
    target.takeAttack(attack);
    target.takeAttack(attack);
}

SkillManager.skillEffects['S0006'] = function (skill,attacker,power,target,dungeonid) {
    const attack = new Attack(attacker, power, skill, dungeonid);
    target.forEach(t => t.takeAttack(attack));
    attacker.heal(power);
}

SkillManager.skillEffects['S0007'] = function (skill,attacker,power,target,dungeonid) {
    BuffManager.generateBuff('B0007',target,power);
}

SkillManager.skillEffects['S0008'] = function (skill,attacker,power,target,dungeonid) {
    BuffManager.generateBuff('B0008',target,power);
}

SkillManager.skillEffects['S0009'] = function (skill,attacker,power,target,dungeonid) {
    BuffManager.generateBuff('B0009',target,power);
}

SkillManager.skillEffects['S0010'] = function (skill,attacker,power,target,dungeonid) {
    attacker.heal(power);
}

SkillManager.skillEffects['S0011'] = function (skill,attacker,power,target,dungeonid) {
    BuffManager.generateBuff('B0011',target,power);
}

SkillManager.skillEffects['S0012'] = function (skill,attacker,power,target,dungeonid) {
    BuffManager.generateBuff('B0012',target,power);
}

SkillManager.skillEffects['S0013'] = function (skill,attacker,power,target,dungeonid) {
    const attack = new Attack(attacker, power, skill, dungeonid);
    target.takeAttack(attack);
}

SkillManager.skillEffects['S0014'] = function (skill,attacker,power,target,dungeonid) {
    const attack = new Attack(attacker, power, skill, dungeonid);
    target.takeAttack(attack);
    attacker.takeDamage(power);
}

SkillManager.skillEffects['S0015'] = function (skill,attacker,power,target,dungeonid) {
    const attack = new Attack(attacker, power, skill, dungeonid);
    target.takeAttack(attack);
}

SkillManager.skillEffects['S0016'] = function (skill,attacker,power,target,dungeonid) {
    uffManager.generateBuff('B0016',target,power);
}