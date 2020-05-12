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
    createSave() {
        const save = {};
        save.playbookDB = [];
        this.playbookDB.forEach(playbook => {
            save.playbookDB.push(playbook.createSave());
        });
        return save;
    },
    loadSave(save) {
        save.playbookDB.forEach(playbookSave => {
            const playbook = this.idToPlaybook(playbookSave.id);
            playbook.loadSave(playbookSave);
        })
    },
    generatePlayBook(playbookID) {
        const playbookTemplate = this.idToPlaybook(playbookID);
        return new Playbook(playbookTemplate);
    },
    generatePlayBookFromSkills(s1,s2,s3,s4) {
        const skills = {skill1:s1,skill2:s2,skill3:s3,skill4:s4};
        return new Playbook(skills);
    },
}

class playBookTemplate {
    constructor (props) {
        Object.assign(this, props);
        this.unlocked = false;
    }
    skillIDs() {
        return [this.skill1,this.skill2,this.skill3,this.skill4];
    }
    createSave() {
        const save = {};
        save.id = this.id;
        save.unlocked = this.unlocked;
        return save;
    }
    loadSave(save) {
        this.unlocked = save.unlocked;
    }
}

class Skill {
    constructor (props) {
        Object.assign(this, props);
        this.powerPercent = (props.powMod * 100).toString() + "%";
        this.techPercent = (props.techMod * 100).toString() + "%";
    }
    passiveCheck(type,target,attack) {
        SkillManager.skillEffects[this.id](type,target,attack,this);
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

SkillManager.skillEffects['S0000'] = function(combatParams) {
    //Regular Attack
    const targets = combatParams.getTarget(TargetType.FIRST,SideType.ENEMIES);
    targets.forEach(target => {
        target.takeAttack(combatParams)
    });
}

  //------------------//
 //    HERO SKILLS   //
//------------------//

SkillManager.skillEffects['S0010'] = function (combatParams) {
    //Reinforce - Beorn
    const targets = combatParams.getTarget(TargetType.SELF,SideType.ALLIES);
    targets.forEach(target => BuffManager.generateBuff('B0010',target,combatParams.attack.mod1));
}

SkillManager.skillEffects['S0011'] = function (combatParams) {
    //Skill 2 - Beorn
    const targets = combatParams.getTarget(TargetType.SELF,SideType.ALLIES);
    targets.forEach(target => BuffManager.generateBuff('B0011',target,combatParams.power));
}

SkillManager.skillEffects['S0012'] = function (combatParams) {
    //Stand Behind Me - Beorn
    const targets = combatParams.getTarget(TargetType.BEHIND,SideType.ALLIES);
    if (targets === null) return;
    targets.forEach(target => BuffManager.generateBuff('B0012',target,combatParams.power));
}

SkillManager.skillEffects['S0020'] = function (combatParams) {
    //Toughen - Cedric
    const targets = combatParams.getTarget(TargetType.SELF,SideType.ALLIES);
    targets.forEach(target => {
        if (target.getBuffStacks('B0020') === 5) return;
        BuffManager.generateBuff('B0020',target,combatParams.power)
        target.heal(combatParams.power);
        refreshHPBar(target);
    });
}

SkillManager.skillEffects['S0021'] = function (combatParams) {
    //Taunt - Cedric
    const targets = combatParams.getTarget(TargetType.SELF,SideType.ALLIES);
    targets.forEach(target => BuffManager.generateBuff('B0021',target));
}

SkillManager.skillEffects['S0022'] = function (combatParams) {
    //Attack 3 - Cedric
    const targets = combatParams.getTarget(TargetType.SELF,SideType.ALLIES);
    targets.forEach(target => {
        if (target.getBuffStacks('B0022') === 5) return;
        const power1 = combatParams.power*combatParams.attack.mod1;
        const power2 = combatParams.power*combatParams.attack.mod2;
        BuffManager.generateBuff('B0022',target,power1,power2);
        refreshHPBar(target);
    });
}

SkillManager.skillEffects['S0030'] = function (combatParams) {
    //Exert - Grim
    const targets = combatParams.getTarget(TargetType.SELF,SideType.ALLIES);
    targets.forEach(target => {
        target.takeDamagePercent(combatParams.attack.mod1);
        refreshHPBar(target);
    });
    const targets2 = combatParams.getTarget(TargetType.FIRST,SideType.ENEMIES);
    targets2.forEach(target => {
        target.takeAttack(combatParams);
    });
}

SkillManager.skillEffects['S0031'] = function (combatParams) {
    //Skill 2 - Grim
    const targets = combatParams.getTarget(TargetType.FIRST,SideType.ENEMIES);
    const thisunit = combatParams.getTarget(TargetType.SELF,SideType.ALLIES)[0];
    targets.forEach(target => {
        target.takeAttack(combatParams);
        if (target.isLifeTapped()) {
            const healAmt = Math.floor(combatParams.power * combatParams.attack.mod1);
            thisunit.heal(healAmt);
        }
    });
}

SkillManager.skillEffects['S0032'] = function (combatParams) {
    //Skill 3 - Grim
    const thisUnit = combatParams.getTarget(TargetType.SELF,SideType.ALLIES);
    thisUnit.forEach(target => {
        target.takeDamagePercent(combatParams.attack.mod1);
        refreshHPBar(target);
    });
    const targets = combatParams.getTarget(TargetType.CLEAVE,SideType.ENEMIES);
    targets.forEach(target => {
        target.takeAttack(combatParams);
    });
}

SkillManager.skillEffects['S0040'] = function (combatParams) {
    //Cleave - Lambug
    const targets = combatParams.getTarget(TargetType.CLEAVE,SideType.ENEMIES);
    targets.forEach(target => {
        target.takeAttack(combatParams);
    });
}

SkillManager.skillEffects['S0041'] = function (combatParams) {
    //Frontload - Lambug
    const targets = combatParams.getTarget(TargetType.FIRST,SideType.ENEMIES);
    const selfTarget = combatParams.getTarget(TargetType.SELF,SideType.ALLIES)[0];
    combatParams.power -=  0.5*selfTarget.getBuffStacks("B0041");
    targets.forEach(target => {
        target.takeAttack(combatParams);
    });
    BuffManager.generateBuff("B0041",selfTarget,0);
}

SkillManager.skillEffects['S0042'] = function (combatParams) {
    //Frontload - Lambug
    const targets = combatParams.getTarget(TargetType.FIRST,SideType.ENEMIES);
    const selfTarget = combatParams.getTarget(TargetType.SELF,SideType.ALLIES)[0];
    const buffPower = selfTarget.getPow()*combatParams.attack.mod1;
    BuffManager.generateBuff("B0042",selfTarget,buffPower);
    targets.forEach(target => {
        target.takeAttack(combatParams);
    });
}

SkillManager.skillEffects['S1010'] = function (combatParams) {
    //Meteor - Zoe
    const targets = combatParams.getTarget(TargetType.ALL,SideType.ENEMIES);
    targets.forEach(target => {
        target.takeAttack(combatParams);
        BuffManager.generateBuff("B1010",target,Math.floor(combatParams.power*combatParams.attack.mod1));
    });
};

SkillManager.skillEffects['S1011'] = function (combatParams) {
    //Meteor - Zoe
    const targets = combatParams.getTarget(TargetType.FIRST,SideType.ENEMIES);
    targets.forEach(target => {
        target.takeAttack(combatParams);
        BuffManager.generateBuff("B1010",target,Math.floor(combatParams.power*combatParams.attack.mod1));
    });
};

SkillManager.skillEffects['S1012'] = function (combatParams) {
    //Powder Keg - Zoe
    const targets = combatParams.getTarget(TargetType.FIRST,SideType.ENEMIES);
    targets.forEach(target => {
        if (target.getBuffStacks("B1012") === 2) {
            const dmg = target.getBuff("B1012").power;
            target.takeDamage(dmg);
            BuffManager.removeBuff("B1012",target);
            return;
        }
        BuffManager.generateBuff("B1012",target,Math.floor(combatParams.power));
    });
};

SkillManager.skillEffects['S1020'] = function (combatParams) {
    //Frost Strike - Neve
    const targets = combatParams.getTarget(TargetType.FIRST,SideType.ENEMIES);
    const originalPower = combatParams.power;
    targets.forEach(target => {
        if (target.isChilled()) {
            combatParams.power = Math.floor(combatParams.attack.mod1 * originalPower);
            target.takeAttack(combatParams);
        }
        else {
            target.takeAttack(combatParams);
            BuffManager.generateBuff("B1020",target,0);
        }
    });
};

SkillManager.skillEffects['S1021'] = function (combatParams) {
    //Blizzard - Neve
    const targets = combatParams.getTarget(TargetType.ALL,SideType.ENEMIES);
    targets.forEach(target => {
        target.takeAttack(combatParams);
        BuffManager.generateBuff("B1020",target,0);
    });
};

SkillManager.skillEffects['S1022'] = function (combatParams) {
    //Blizzard - Neve
    const targets = combatParams.getTarget(TargetType.SELF,SideType.ALLIES);
    targets.forEach(target => {
        target.takeAttack(combatParams);
        BuffManager.generateBuff("B1022",target,0);
    });
};

SkillManager.skillEffects['S1030'] = function (combatParams) {
    //Transfer Life - Titus
    const lifeDrain = combatParams.getTarget(TargetType.BEFORE,SideType.ALLIES);
    if (lifeDrain === null || lifeDrain[0].race === "undead") return;
    const targets = combatParams.getTarget(TargetType.FIRST,SideType.ENEMIES);
    lifeDrain.forEach(target => {
        target.takeAttack(combatParams);
    })
    targets.forEach(target => {
        BuffManager.generateBuff("B1030",target,combatParams.power);
    });
};

SkillManager.skillEffects['S1031'] = function (combatParams) {
    //Transfer Life 2 - Titus
    const lifeDrain = combatParams.getTarget(TargetType.AFTER,SideType.ALLIES);
    if (lifeDrain === null || lifeDrain[0].race === "undead") return;
    const targets = combatParams.getTarget(TargetType.FIRST,SideType.ENEMIES);
    lifeDrain.forEach(target => {
        target.takeAttack(combatParams);
    })
    targets.forEach(target => {
        BuffManager.generateBuff("B1030",target,combatParams.power);
    });
};


SkillManager.skillEffects['S1032'] = function (combatParams) {
    //Transfer Life 3 - Titus
    const lifeDrainAllies = combatParams.getTarget(TargetType.ALL,SideType.ALLIES);
    const lifeDrainEnemies = combatParams.getTarget(TargetType.ALL,SideType.ENEMIES);
    lifeDrainAllies.forEach(target => {
        if (target.race === "undead") return;
        BuffManager.generateBuff("B1030",target,combatParams.power);
    });
    lifeDrainEnemies.forEach(target => {
        BuffManager.generateBuff("B1030",target,combatParams.power);
    });
};

SkillManager.skillEffects['S1040'] = function (combatParams) {
    //Holy Prayer - Troy
    const targets = combatParams.getTarget(TargetType.MISSINGHP,SideType.ALLIES);
    targets.forEach(target => {
        target.heal(combatParams.power);
    });
};

SkillManager.skillEffects['S1041'] = function (combatParams) {
    //Holy Prayer 2 - Troy
    const targets = combatParams.getTarget(TargetType.ALL,SideType.ALLIES);
    targets.forEach(target => {
        target.heal(combatParams.power);
    });
};

SkillManager.skillEffects['S1042'] = function (combatParams) {
    //Holy Prayer 3 - Troy
    const targets = combatParams.getTarget(TargetType.FIRST,SideType.ALLIES);
    targets.forEach(target => {
        BuffManager.generateBuff("B1042",target,combatParams.power);
    });
};

SkillManager.skillEffects['S2010'] = function (combatParams) {
    //Inspiration - Alok
    const targets = combatParams.getTarget(TargetType.ALL,SideType.ALLIES);
    targets.forEach(target => {
        BuffManager.generateBuff("B2010",target,Math.floor(combatParams.power));
        const stacks = target.getBuffStacks("B2010");
        target.heal(combatParams.power*stacks);
        refreshHPBar(target);
    });
};

SkillManager.skillEffects['S2011'] = function (combatParams) {
    //Inspiration - Alok
    const targets = combatParams.getTarget(TargetType.ALL,SideType.ALLIES);
    targets.forEach(target => {
        BuffManager.generateBuff("B2011",target,Math.floor(combatParams.power));
    });
};
SkillManager.skillEffects['S2012'] = function (combatParams) {
    //Inspiration - Alok
    const targets = combatParams.getTarget(TargetType.ALL,SideType.ALLIES);
    targets.forEach(target => {
        BuffManager.generateBuff("B2012",target,Math.floor(combatParams.power));
    });
};

SkillManager.skillEffects['S2020'] = function (combatParams) {
    //Snipe - Grogmar
    const targets = combatParams.getTarget(TargetType.LOWESTHP,SideType.ENEMIES);
    targets.forEach(target => {
        const ogPow = combatParams.power;
        if (target.maxHP()*combatParams.attack.mod1 >= target.hp) {
            combatParams.power = combatParams.power*combatParams.attack.mod2;
        }
        target.takeAttack(combatParams);
        combatParams.power = ogPow;
    });
};

SkillManager.skillEffects['S2021'] = function (combatParams) {
    //Grog 2 - Grogmar
    const targets = combatParams.getTarget(TargetType.THIRD,SideType.ENEMIES);
    targets.forEach(target => {
        const ogPow = combatParams.power;
        if (target.hasBuff("B1010")) combatParams.power = combatParams.power*combatParams.attack.mod1;
        target.takeAttack(combatParams);
        combatParams.power = ogPow;
    });
};

SkillManager.skillEffects['S2022'] = function (combatParams) {
    //Snipe - Grogmar
    const targets = combatParams.getTarget(TargetType.FOURTH,SideType.ENEMIES);
    targets.forEach(target => {
        const ogPow = combatParams.power;
        if (target.maxHP() === target.hp) combatParams.power = combatParams.power*combatParams.attack.mod1;
        target.takeAttack(combatParams);
        combatParams.power = ogPow;
    });
};

SkillManager.skillEffects['S2030'] = function (combatParams) {
    //Double Tap - Revere
    const targets = combatParams.getTarget(TargetType.FIRST,SideType.ENEMIES);
    targets.forEach(target => {
        target.takeAttack(combatParams);
        target.takeAttack(combatParams);
    });
};

SkillManager.skillEffects['S2031'] = function (combatParams) {
    //Attack 2 - Revere
    const targets = combatParams.getTarget(TargetType.SECOND,SideType.ENEMIES);
    targets.forEach(target => {
        const ogPow = combatParams.power;
        if (target.isChilled()) combatParams.power *= combatParams.attack.mod1;
        target.takeAttack(combatParams);
        combatParams.power = ogPow;
    });
};

SkillManager.skillEffects['S2032'] = function (combatParams) {
    //Attack 3 - Revere
    const targets = combatParams.getTarget(TargetType.FIRST,SideType.ENEMIES);
    targets.forEach(target => {
        const ogPow = combatParams.power;
        if (combatParams.attacker.hp%10 === 7) combatParams.power *= combatParams.attack.mod1;
        target.takeAttack(combatParams);
        combatParams.power = ogPow;
    });
};

SkillManager.skillEffects['S2040'] = function (combatParams) {
    //Mark - Caeda
    const targets = combatParams.getTarget(TargetType.SECOND,SideType.ENEMIES);
    targets.forEach(target => {
        BuffManager.generateBuff("B2040",target,0);
        target.takeAttack(combatParams);
    });
};


SkillManager.skillEffects['S2041'] = function (combatParams) {
    //Mark - Caeda
    const targets = combatParams.getTarget(TargetType.THIRD,SideType.ENEMIES);
    targets.forEach(target => {
        BuffManager.generateBuff("B2040",target,0);
        target.takeAttack(combatParams);
    });
};



SkillManager.skillEffects['S2042'] = function (combatParams) {
    //Mark - Caeda
    const targets = combatParams.getTarget(TargetType.FOURTH,SideType.ENEMIES);
    targets.forEach(target => {
        BuffManager.generateBuff("B2040",target,0);
        target.takeAttack(combatParams);
    });
};


  //------------------//
 //     MOB SKILLS   //
//------------------//

SkillManager.skillEffects['SM100'] = function (combatParams) {
    //swift strike - Elf Adventurer
    const targets = combatParams.getTarget(TargetType.FIRST,SideType.ENEMIES);
    targets.forEach(target => target.takeAttack(combatParams));
    const secondaryTargets = combatParams.getTarget(TargetType.ALL,SideType.ALLIES);
    secondaryTargets.forEach(target => target.heal(combatParams.power));
}

SkillManager.skillEffects['SM101'] = function (combatParams) {
    //Green Ooze - Regenerate
    const targets = combatParams.getTarget(TargetType.SELF,SideType.ALLIES);
    targets.forEach(target => target.heal(combatParams.power));
}

SkillManager.skillEffects['SM102'] = function (combatParams) {
    //Monster A - Wilt
    const targets = combatParams.getTarget(TargetType.FIRST,SideType.ENEMIES);
    targets.forEach(target => {
        target.takeAttack(combatParams);
        BuffManager.generateBuff('BM102',target,combatParams.power);
    });
}

SkillManager.skillEffects['SM103'] = function (combatParams) {
    //Monster A - Attack A
    const targets = combatParams.getTarget(TargetType.FIRST,SideType.ENEMIES);
    const selfTarget = combatParams.getTarget(TargetType.SELF,SideType.ALLIES)[0];
    if (selfTarget.hp === selfTarget.maxHP()) combatParams.power = Math.floor(combatParams.power*1.5);
    targets.forEach(target => {
        target.takeAttack(combatParams);
    });
}

SkillManager.skillEffects['SM104'] = function (combatParams) {
    //Attack 5 - Mob 5
    const targets = combatParams.getTarget(TargetType.FIRST,SideType.ENEMIES);
    targets.forEach(target => {
        const ogPow = combatParams.power;
        if (target.buffCount() > 0) combatParams.power = Math.floor(combatParams.power * combatParams.attack.mod1);
        target.takeAttack(combatParams);
        combatParams.power = ogPow;
    });
};

SkillManager.skillEffects['SM105'] = function (combatParams) {
    //Attack 6 - Mob 6
    const targets = combatParams.getTarget(TargetType.SELF,SideType.ALLIES);
    targets.forEach(target => {
        const ogPow = combatParams.power;
        if (target.maxHP()*combatParams.attack.mod1 >= target.hp) {
            combatParams.power = Math.floor(combatParams.power*combatParams.attack.mod2);
        }
        target.heal(combatParams);
        combatParams.power = ogPow;
    });
};

SkillManager.skillEffects['SM106'] = function (combatParams) {
    //Attack 7 - Mob 7
    const targets = combatParams.getTarget(TargetType.ALL,SideType.ALLIES);
    targets.forEach(target => {
        if (target.debuffCount() > 0) target.heal(combatParams.power);
        target.removeDebuffs();
    });
}

SkillManager.skillEffects['SM107'] = function (combatParams) {
    //Attack 8 - Mob 8
    if (combatParams.attacker.hpLessThan(combatParams.attack.mod1)) combatParams.power = Math.floor(combatParams.power*combatParams.attack.mod2);
    const targets = combatParams.getTarget(TargetType.FIRST,SideType.ENEMIES);
    targets.forEach(target => {
        target.takeAttack(combatParams);
    });
};

SkillManager.skillEffects['SM108'] = function (combatParams) {
    //Attack 9 - Mob 9
    const targets = combatParams.getTarget(TargetType.ADJACENT,SideType.ALLIES);
    targets.forEach(target => {
        target.heal(combatParams);
    });
}

SkillManager.skillEffects['SM109'] = function (combatParams) {
    //Attack 9 - Mob 9
    const targets = combatParams.getTarget(TargetType.LAST,SideType.ENEMIES);
    targets.forEach(target => {
        const ogPow = combatParams.power;
        if (target.hpLessThan(combatParams.attack.mod1)) combatParams.power = Math.floor(combatParams.power*combatParams.attack.mod2);
        target.takeAttack(combatParams);
        combatParams.power = ogPow;
    });
}

SkillManager.skillEffects['SM200'] = function (combatParams) {
    //Translucent - Blinkie
    const targets = combatParams.getTarget(TargetType.SELF,SideType.ALLIES);
    targets.forEach(target => {
        BuffManager.generateBuff('BM200',target,combatParams.power);
    });
}

SkillManager.skillEffects['SM201'] = function (combatParams) {
    //Purge - Earth Shaman
    const targets = combatParams.getTarget(TargetType.ALL,SideType.ALLIES);
    const debuffCount = targets.reduce((a,b) => a + b.debuffCount(),0);
    const originalPower = combatParams.power;
    targets.forEach(target => {
        target.removeDebuffs();
    });
    if (debuffCount > 0) {
        const targets2 = combatParams.getTarget(TargetType.FIRST,SideType.ENEMIES);
        combatParams.power = Math.floor(originalPower * debuffCount);
        targets2.forEach(target => {
            target.takeAttack(combatParams);
        });
    }
}

SkillManager.skillEffects['SM202'] = function (combatParams) {
    //Monster B - OverPower
    const originalDmg = combatParams.power;
    const targets = combatParams.getTarget(TargetType.FIRST,SideType.ENEMIES);
    targets.forEach(target => {
        if (target.underHalfHP()) combatParams.power = Math.floor(originalDmg * 1.5);
        else combatParams.power = originalDmg;
        target.takeAttack(combatParams);
    });
}

SkillManager.skillEffects['SM203'] = function (combatParams) {
    //Monster B - Attack B
    const targets = combatParams.getTarget(TargetType.MISSINGHP,SideType.ALLIES);
    targets.forEach(target => {
        target.heal(combatParams.power);
    });
};

SkillManager.skillEffects['SM204'] = function (combatParams) {
    //Monster B - Attack B
    const targets = combatParams.getTarget(TargetType.ALL,SideType.ENEMIES);
    targets.forEach(target => {
        target.takeDamage(combatParams.power);
    });
};

SkillManager.skillEffects['SM205'] = function (combatParams) {
    //Translucent - Blinkie
    const targets = combatParams.getTarget(TargetType.SELF,SideType.ALLIES);
    targets.forEach(target => {
        BuffManager.generateBuff('BM205',target,combatParams.power);
    });
}

SkillManager.skillEffects['SM206'] = function (combatParams) {
    //Monster A - Attack A
    const targets = combatParams.getTarget(TargetType.ALL,SideType.ALLIES);
    const selfTarget = combatParams.getTarget(TargetType.SELF,SideType.ALLIES)[0];
    if (selfTarget.hp === selfTarget.maxHP()) combatParams.power = Math.floor(combatParams.power*combatParams.attack.mod1);
    targets.forEach(target => {
        target.heal(combatParams);
    });
}

SkillManager.skillEffects['SM207'] = function (combatParams) {
    //Monster A - Attack A
    const targets = combatParams.getTarget(TargetType.ALL,SideType.ENEMIES);
    targets.forEach(target => {
        if (target.hp === target.maxHP()) target.takeDamagePercent(combatParams.attack.mod1);
    });
}

SkillManager.skillEffects['SM208'] = function (combatParams) {
    //Translucent - Blinkie
    const targets = combatParams.getTarget(TargetType.ALL,SideType.ALLIES);
    targets.forEach(target => {
        BuffManager.generateBuff('BM208',target,combatParams.power);
    });
}


SkillManager.skillEffects['SM209'] = function (combatParams) {
    //Translucent - Blinkie
    const targets = combatParams.getTarget(TargetType.ALL,SideType.ENEMIES);
    targets.forEach(target => {
        const ogPow = combatParams.power;
        if (target.maxHP() === target.hp) combatParams.power = Math.floor(combatParams.power*combatParams.attack.mod1);
        target.takeAttack(combatParams);
        combatParams.power = ogPow;
    });
}



SkillManager.skillEffects['SM300'] = function (combatParams) {
    //Ray Gun - Dusty Alien
    const targets = combatParams.getTarget(TargetType.FIRST,SideType.ENEMIES);
    targets.forEach(target => {
        target.takeAttack(combatParams);
    });
}

SkillManager.skillEffects['SM301'] = function (combatParams) {
    //Crab Hammer - Crusty Crab
    const targets = combatParams.getTarget(TargetType.FIRST,SideType.ENEMIES);
    targets.forEach(target => {
        combatParams.power = Math.floor(target.maxHP() * 0.25);
        target.takeAttack(combatParams);
    });
}

SkillManager.skillEffects['SM302'] = function (combatParams) {
    //Monster C - Mega Attack
    const targets = combatParams.getTarget(TargetType.FIRST,SideType.ENEMIES);
    targets.forEach(target => {
        target.takeAttack(combatParams);
    });
}

SkillManager.skillEffects['SM303'] = function (combatParams) {
    //Monster C - Attack C
    const targets = combatParams.getTarget(TargetType.SELF,SideType.ALLIES);
    const allyCount = combatParams.getTarget(TargetType.ALL,SideType.ALLIES).length-1;
    combatParams.power = Math.floor(combatParams.power * (1+0.5*allyCount));
    targets.forEach(target => {
        target.heal(combatParams.power);
    });
};

  //------------------//
 //    BOSS SKILLS   //
//------------------//

SkillManager.skillEffects['SM901'] = function (combatParams) {
    //Tree Wallop - Loathing Oak
    const targets = combatParams.getTarget(TargetType.SECOND,SideType.ENEMIES);
    targets.forEach(target => {
        target.takeAttack(combatParams);
    });
}

SkillManager.skillEffects['SM902'] = function (combatParams) {
    //500 Needles - Cactus
    const target1 = combatParams.getTarget(TargetType.FIRST,SideType.ENEMIES);
    target1.forEach(target => {
        target.takeAttack(combatParams);
    });
    const target2 = combatParams.getTarget(TargetType.SECOND,SideType.ENEMIES);
    target2.forEach(target => {
        target.takeAttack(combatParams);
    });
}

SkillManager.skillEffects['SM903'] = function (combatParams) {
    //Same HP - Blue Thing
    const targets = combatParams.getTarget(TargetType.ALL,SideType.ENEMIES);
    const hps = targets.map(t=>t.hp).reduce((a,b)=>a+b,0);
    const equalizedHP = Math.floor(hps/targets.length);
    targets.forEach(target => {
        target.setHP(equalizedHP);
    });
}

SkillManager.skillEffects['SM904'] = function (combatParams) {
    //DRAIN - LICH
    const targets = combatParams.getTarget(TargetType.ALL,SideType.ENEMIES);
    targets.forEach(target => {
        combatParams.power = Math.ceil(target.maxHP()*0.02);
        target.takeAttack(combatParams);
    });
}

SkillManager.skillEffects['SM904A'] = function (combatParams) {
    //BONESPLOSION - DRY BONES
    const targets = combatParams.getTarget(TargetType.ALL,SideType.ENEMIES);
    targets.forEach(target => {
        target.takeAttack(combatParams);
    });
}

SkillManager.skillEffects['SM904B'] = function (combatParams) {
    //BONE GROWTH - DRY BONES
    const target = combatParams.getTarget(TargetType.SELF,SideType.ALLIES)[0];
    BuffManager.clearBuffs(target);
    target.healPercent(100);
    target.state = null;
    target.image = '<img src="/assets/images/enemies/B904A.gif">';
    $("#mobImage"+target.uniqueid).html(target.image);
    target.playbook = PlaybookManager.generatePlayBookFromSkills("S0000","S0000","S0000","SM904A");
    refreshSkillUnit(target);
}

SkillManager.skillEffects['SM904C'] = function (combatParams) {
    //lol it does nothing
}



SkillManager.skillEffects['SM905A'] = function (combatParams) {
    //PAINTBRUSH KNIGHT - CANVAS
    const targets = combatParams.getTarget(TargetType.ALL,SideType.ENEMIES);
    const thisMob = combatParams.getTarget(TargetType.SELF,SideType.ALLIES)[0];
    if (this.state === undefined || this.state === targets.length-1) this.state = 0;
    else this.state += 1;
    const target = targets[this.state];
    target.takeAttack(combatParams);
    if (target.type === "Might") {
        BuffManager.generateBuff('BM905A',thisMob,combatParams.power);
        thisMob.image = '<img src="/assets/images/enemies/B905A.gif">';
        $("#mobImage"+thisMob.uniqueid).html(thisMob.image);
    }
    else if (target.type === "Mind") {
        BuffManager.generateBuff('BM905B',thisMob,combatParams.power);
        thisMob.image = '<img src="/assets/images/enemies/B905B.gif">';
        $("#mobImage"+thisMob.uniqueid).html(thisMob.image);
    }
    else if (target.type === "Moxie") {
        BuffManager.generateBuff('BM905C',thisMob,combatParams.power);
        thisMob.image = '<img src="/assets/images/enemies/B905C.gif">';
        $("#mobImage"+thisMob.uniqueid).html(thisMob.image);
    }
}

SkillManager.skillEffects['SM905B'] = function (combatParams) {
    //PAINTBRUSH KNIGHT - MASTERPIECE
    const thisMob = combatParams.getTarget(TargetType.SELF,SideType.ALLIES)[0];
    thisMob.image = '<img src="/assets/images/enemies/B905.gif">';
    $("#mobImage"+thisMob.uniqueid).html(thisMob.image);
    if (thisMob.hasBuff("BM905A")) {
        BuffManager.removeBuff("BM905A",thisMob);
        BuffManager.generateBuff("BM905D",thisMob,combatParams.power);
    }
    else if (thisMob.hasBuff("BM905B")) {
        const stacks = thisMob.getBuffStacks("BM905E");
        BuffManager.removeBuff("BM905B",thisMob);
        const healAmt = Math.floor(combatParams.power*(1+stacks*0.1));
        thisMob.heal(healAmt);
        BuffManager.generateBuff("BM905E",thisMob,combatParams.power);
    }
    else if (thisMob.hasBuff("BM905C")) {
        BuffManager.removeBuff("BM905C",thisMob);
        const buffTarget = combatParams.getTarget(TargetType.FIRST,SideType.ENEMIES)[0];
        BuffManager.generateBuff("BM905F",buffTarget,combatParams.power);
    }
}



SkillManager.skillEffects['SM906'] = function (combatParams) {
    //Phoenix Fire - Phoenix
    const targets = combatParams.getTarget(TargetType.ALL,SideType.ENEMIES);
    targets.forEach(target => {
        target.takeAttack(combatParams);
        BuffManager.generateBuff('BM906',target,combatParams.power);
    });
}

SkillManager.skillEffects['SM906A'] = function (combatParams) {
    //lol it does nothing
}

SkillManager.skillEffects['SM906B'] = function (combatParams) {
    const target = combatParams.getTarget(TargetType.SELF,SideType.ALLIES)[0];
    target.state = null;
    target.image = '<img src="/assets/images/enemies/B906.gif">';
    $("#mobImage"+target.uniqueid).html(target.image);
    target.playbook = PlaybookManager.generatePlayBookFromSkills(target.skill1,target.skill2,target.skill3,target.skill4);
    refreshSkillUnit(target);
    BuffManager.removeBuff('BM906A',target)
    BuffManager.generateBuff('BM906B',target,0);
    target.healPercent(100);
}



  //--------------------//
 //   PASSIVE SKILLS   //
//--------------------//

SkillManager.skillEffects['SMP902'] = function (type,target,attack,skillParams) {
    //Spiky Self - Cactus
    if (type !== "initial") return;
    BuffManager.generateBuff("BM902",target,skillParams.powMod*target.pow);
}

SkillManager.skillEffects['SMP904A'] = function (type,target,attack,skillParams) {
    if (type !== "dead" || target.state !== null) return;
    //BONE DEATH - DRY BONES
    const lichDead = attack.enemies.find(m=>m.id==="B904").dead();
    if (lichDead) return;
    target.state = "bones";
    target.image = '<img src="/assets/images/enemies/B904B.gif">';
    target.hp = 1;
    BuffManager.clearBuffs(target);
    $("#mobImage"+target.uniqueid).html(target.image);
    target.playbook = PlaybookManager.generatePlayBookFromSkills("SM904C","SM904C","SM904C","SM904B");
    refreshSkillUnit(target);
    BuffManager.generateBuff('BM904A',target,0);
}

SkillManager.skillEffects['SMP906'] = function (type,target,attack,skillParams) {
    //Rising Phoenix - Phoenix
    if (type !== "onTurn") return;
    if (target.hp > target.maxHP()/4 || target.state !== null) return;
    target.state = "egg";
    target.image = '<img src="/assets/images/enemies/B906A.gif">';
    $("#mobImage"+target.uniqueid).html(target.image);
    target.playbook = PlaybookManager.generatePlayBookFromSkills("SM906A","SM906A","SM906A","SM906B");
    refreshSkillUnit(target);
    BuffManager.generateBuff('BM906A',target,0);
}
