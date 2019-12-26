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
    },
    generatePlayBookFromSkills(s1,s2,s3,s4) {
        const skills = {skill1:s1,skill2:s2,skill3:s3,skill4:s4};
        return new Playbook(skills);
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
        this.powerPercent = (props.powMod * 100).toString() + "%";
        this.techPercent = (props.techMod * 100).toString() + "%";
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

function battleText(combatParams,target) {
    let battleTextEdit = combatParams.attack.bText.replace("#ATTACKER#",combatParams.attacker.name);
    battleTextEdit = battleTextEdit.replace("#DEFENDER#",target.name);
    battleTextEdit = battleTextEdit.replace("#DAMAGE#",combatParams.power);
    BattleLog.addEntry(combatParams.dungeonid,combatParams.attack.icon,battleTextEdit);
} 

SkillManager.skillEffects['S0001'] = function(combatParams) {
    //Attack
    const targets = combatParams.getTarget();
    targets.forEach(target => {
        target.takeAttack(combatParams)
    });
}

SkillManager.skillEffects['S0002'] = function (combatParams) {
    //Double Tap
    const targets = combatParams.getTarget();
    targets.forEach(target => {
        target.takeAttack(combatParams);
        target.takeAttack(combatParams);
    });
}

SkillManager.skillEffects['S0003'] = function (combatParams) {
    //Reinforce
    const targets = combatParams.getTarget();
    targets.forEach(target => BuffManager.generateBuff('B0003',target,combatParams.power))
    
}

SkillManager.skillEffects['S0004'] = function (combatParams) {
    //Frost Attack
    const targets = combatParams.getTarget();
    const originalPower = combatParams.power;
    targets.forEach(target => {
        if (target.isChilled()) {
            combatParams.power = Math.floor(2.5 * originalPower);
            target.takeAttack(combatParams);
        }
        else {
            target.takeAttack(combatParams);
            BuffManager.generateBuff("B0004",target,0);
        }
    });
}

SkillManager.skillEffects['S0005'] = function (combatParams) {
    //sting
    for (let i=0;i<4;i++) {
        const targets = combatParams.getTarget();
        targets.forEach(target => target.takeAttack(combatParams));
    }
}

SkillManager.skillEffects['S0006'] = function (combatParams) {
    //swift strike
    const targets = combatParams.getTarget();
    targets.forEach(target => target.takeAttack(combatParams));
    const secondaryTargets = combatParams.getTarget("allAllies");
    secondaryTargets.forEach(target => target.heal(combatParams.power));
}

SkillManager.skillEffects['S0007'] = function (combatParams) {
    //Spore
    const targets = combatParams.getTarget();
    targets.forEach(target => {
        target.takeAttack(combatParams);
        BuffManager.generateBuff('B0007',target,combatParams.power);
    });
}

SkillManager.skillEffects['S0008'] = function (combatParams) {
    //healing aura
    const targets = combatParams.getTarget();
    targets.forEach(target => {
        BuffManager.generateBuff('B0008',target,combatParams.power);
    });
}

SkillManager.skillEffects['S0009'] = function (combatParams) {
    //Translucent
    const targets = combatParams.getTarget();
    targets.forEach(target => {
        BuffManager.generateBuff('B0009',target,combatParams.power);
    });
}

SkillManager.skillEffects['S0010'] = function (combatParams) {
    //Poison Touch
    const targets = combatParams.getTarget();
    targets.forEach(target => {
        target.takeAttack(combatParams);
        BuffManager.generateBuff('B0010',target,combatParams.power);
    });
}

SkillManager.skillEffects['S0011'] = function (combatParams) {
    const targets = combatParams.getTarget();
    targets.forEach(target => {
        BuffManager.generateBuff('B0011',target,power);
    })
    
}

SkillManager.skillEffects['S0012'] = function (skill,attacker,power,target,dungeonid) {
    BuffManager.generateBuff('B0012',target,power);
}

SkillManager.skillEffects['S0013'] = function (combatParams) {
    const targets = combatParams.getTarget();
    targets.forEach(target => {
        target.takeAttack(combatParams);
    });
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

SkillManager.skillEffects['S0017'] = function (combatParams) {
    //tree wallop
    const targets = combatParams.getTarget();
    targets.forEach(target => {
        target.takeAttack(combatParams);
    });
}