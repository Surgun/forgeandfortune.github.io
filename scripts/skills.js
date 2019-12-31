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
    passiveCheck(type,target) {
        console.log(this.id);
        SkillManager.skillEffects[this.id](type,target);
    }
}

class Playbook {
    constructor (pbTemplate) {
        Object.assign(this, pbTemplate);
        this.skills = [
            SkillManager.idToSkill(pbTemplate.skill1),
            SkillManager.idToSkill(pbTemplate.skill2),
            SkillManager.idToSkill(pbTemplate.skill3),
            SkillManager.idToSkill(pbTemplate.skill4),
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


SkillManager.skillEffects['S0000'] = function(combatParams) {
    //Regular Attack
    const targets = combatParams.getTarget(TargetType.FIRST);
    targets.forEach(target => {
        target.takeAttack(combatParams)
    });
}

  //------------------//
 //    HERO SKILLS   //
//------------------//

SkillManager.skillEffects['S0010'] = function (combatParams) {
    //Reinforce - Beorn
    const targets = combatParams.getTarget(TargetType.SELF);
    targets.forEach(target => BuffManager.generateBuff('B0010',target));
}

SkillManager.skillEffects['S0020'] = function (combatParams) {
    //Toughen - Cedric
    const targets = combatParams.getTarget(TargetType.SELF);
    targets.forEach(target => {
        if (target.getBuffStacks('B0020') === 5) return;
        console.log(target.getBuffStacks('B0020'))
        BuffManager.generateBuff('B0020',target,combatParams.power)
        target.heal(combatParams.power);
        refreshHPBar(target);
    });
    
}

SkillManager.skillEffects['S1010'] = function (combatParams) {
    //Frost Strike - Neve
    const targets = combatParams.getTarget(TargetType.FIRST);
    const originalPower = combatParams.power;
    targets.forEach(target => {
        if (target.isChilled()) {
            combatParams.power = Math.floor(2.5 * originalPower);
            target.takeAttack(combatParams);
        }
        else {
            target.takeAttack(combatParams);
            BuffManager.generateBuff("B1010",target,0);
        }
    });
};

SkillManager.skillEffects['S1020'] = function (combatParams) {
    //Meteor - Zoe
    const targets = combatParams.getTarget(TargetType.ALLENEMIES);
    targets.forEach(target => {
        target.takeAttack(combatParams);
        BuffManager.generateBuff("B1020",target,Math.floor(combatParams.power/10));
    });
};

SkillManager.skillEffects['S2010'] = function (combatParams) {
    //Inspiration - Alok
    const targets = combatParams.getTarget(TargetType.ALLALLIES);
    targets.forEach(target => {
        BuffManager.generateBuff("B2010",target,Math.floor(combatParams.power));
    });
};

SkillManager.skillEffects['S2030'] = function (combatParams) {
    //Double Tap - Revere
    const targets = combatParams.getTarget(TargetType.FIRST);
    targets.forEach(target => {
        target.takeAttack(combatParams);
        target.takeAttack(combatParams);
    });
};

  //------------------//
 //     MOB SKILLS   //
//------------------//

SkillManager.skillEffects['SM100'] = function (combatParams) {
    //swift strike - Elf Adventurer
    const targets = combatParams.getTarget(TargetType.FIRST);
    targets.forEach(target => target.takeAttack(combatParams));
    const secondaryTargets = combatParams.getTarget(TargetType.ALLALLIES);
    secondaryTargets.forEach(target => target.heal(combatParams.power));
}

SkillManager.skillEffects['SM101'] = function (combatParams) {
    //Green Ooze - Regenerate
    const targets = combatParams.getTarget(TargetType.SELF);
    targets.forEach(target => target.heal(combatParams.power));
}

SkillManager.skillEffects['SM200'] = function (combatParams) {
    //Translucent - Blinkie
    const targets = combatParams.getTarget(TargetType.SELF);
    targets.forEach(target => {
        BuffManager.generateBuff('BM200',target,combatParams.power);
    });
}

SkillManager.skillEffects['SM201'] = function (combatParams) {
    //Purge - Earth Shaman
    const targets = combatParams.getTarget(TargetType.ALLALLIES);
    const debuffCount = targets.reduce((a,b) => a + b.debuffCount(),0);
    const originalPower = combatParams.power;
    targets.forEach(target => {
        target.removeDebuffs();
    });
    if (debuffCount > 0) {
        const targets2 = combatParams.getTarget(TargetType.FIRST);
        combatParams.power = originalPower * debuffCount;
        targets2.forEach(target => {
            target.takeAttack(combatParams);
        });
    }
}

SkillManager.skillEffects['SM300'] = function (combatParams) {
    //Ray Gun - Dusty Alien
    const targets = combatParams.getTarget(TargetType.FIRST);
    targets.forEach(target => {
        target.takeAttack(combatParams);
    });
}

SkillManager.skillEffects['SM301'] = function (combatParams) {
    //Crab Hammer - Crusty Crab
    const targets = combatParams.getTarget(TargetType.FIRST);
    targets.forEach(target => {
        combatParams.power = Math.floor(target.maxHP() * 0.25);
        target.takeAttack(combatParams);
    });
}

  //------------------//
 //    BOSS SKILLS   //
//------------------//

SkillManager.skillEffects['SM901'] = function (combatParams) {
    //Tree Wallop - Loathing Oak
    const targets = combatParams.getTarget(TargetType.SECOND);
    targets.forEach(target => {
        target.takeAttack(combatParams);
    });
}

SkillManager.skillEffects['SM902'] = function (combatParams) {
    //Phoenix Fire - Phoenix
    const targets = combatParams.getTarget(TargetType.FIRST);
    targets.forEach(target => {
        target.takeAttack(combatParams);
        BuffManager.generateBuff('BM902',target,combatParams.power);
    });
}

SkillManager.skillEffects['SM902A'] = function (combatParams) {
    //lol it does nothing
}

SkillManager.skillEffects['SM902B'] = function (combatParams) {
    const target = combatParams.getTarget(TargetType.SELF)[0];
    target.state = null;
    target.image = '<img src="images/enemies/B902.gif">';
    $("#mobImage"+target.uniqueid).html(target.image);
    target.playbook = PlaybookManager.generatePlayBookFromSkills(target.skill1,target.skill2,target.skill3,target.skill4);
    refreshSkillUnit(target);
    BuffManager.removeBuff('BM902A',target)
    BuffManager.generateBuff('BM902B',target,0);
    target.healPercent(100);
}

  //--------------------//
 //   PASSIVE SKILLS   //
//--------------------//

SkillManager.skillEffects['SMP902'] = function (type,target) {
    //Rising Phoenix - Phoenix
    if (type !== "onTurn") return;
    if (target.hp > target.maxHP()/4 || target.state !== null) return;
    target.state = "egg";
    target.image = '<img src="images/enemies/B902A.gif">';
    $("#mobImage"+target.uniqueid).html(target.image);
    target.playbook = PlaybookManager.generatePlayBookFromSkills("SM902A","SM902A","SM902A","SM902B");
    refreshSkillUnit(target);
    BuffManager.generateBuff('BM902A',target,0);
}